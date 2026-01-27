'use client';

import { useState, useEffect, useRef, useActionState } from 'react';
import {
  Mic,
  Voicemail,
  Play,
  LoaderCircle,
  Save,
  Trash2,
  ListMusic,
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import { handlePlayMemoAudio } from '@/lib/actions';
import type { VoiceMemo, PlayAudioState } from '@/lib/definitions';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { cn } from '@/lib/utils';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'hindi', label: 'Hindi' },
];

export default function VoiceMemoPage() {
  const user = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [transcript, setTranscript] = useState('');
  const [sourceLang, setSourceLang] = useState('english');
  const [targetLang, setTargetLang] = useState('spanish');
  const [memoTitle, setMemoTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { isListening, isAvailable, toggleListening } =
    useSpeechRecognition(setTranscript);

  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [isLoadingMemos, setIsLoadingMemos] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playState, playAction] = useActionState(handlePlayMemoAudio, {
    memoId: undefined,
    audioData: undefined,
    error: undefined,
  });
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !firestore) {
      setIsLoadingMemos(false);
      return;
    }
    const memosQuery = query(
      collection(firestore, 'users', user.uid, 'voice-memos'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(memosQuery, snapshot => {
      setMemos(
        snapshot.docs.map(
          doc => ({ id: doc.id, ...doc.data() } as VoiceMemo)
        )
      );
      setIsLoadingMemos(false);
    },
    (error) => {
        console.error("Error fetching voice memos: ", error);
        toast({
            variant: "destructive",
            title: "Error loading memos",
            description: "Could not fetch your saved voice memos."
        })
        setIsLoadingMemos(false);
    });
    return () => unsubscribe();
  }, [user, firestore, toast]);

  useEffect(() => {
    if (playState.audioData && audioRef.current) {
      audioRef.current.src = playState.audioData;
      audioRef.current.play();
      setPlayingMemoId(playState.memoId || null);
      audioRef.current.onended = () => setPlayingMemoId(null);
    }
    if (playState.error) {
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: playState.error,
      });
      setPlayingMemoId(null);
    }
  }, [playState, toast]);

  const handleSave = async () => {
    if (!user || !firestore || !transcript.trim()) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'You must record something to save a memo.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const translationResult = await realTimeTranslationWithContext({
        text: transcript,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });

      if (!translationResult.translatedText) {
        throw new Error('Translation failed.');
      }

      const memosCol = collection(firestore, 'users', user.uid, 'voice-memos');
      await addDoc(memosCol, {
        originalText: transcript,
        translatedText: translationResult.translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        title: memoTitle,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Memo Saved!',
        description: 'Your voice memo has been added to your phrasebook.',
      });
      setTranscript('');
      setMemoTitle('');
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your voice memo. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (memoId: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'voice-memos', memoId));
      toast({ title: 'Memo Deleted' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not delete memo.' });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Record Voice Memo</CardTitle>
            <CardDescription>
              Record your voice, and we'll transcribe and translate it for your
              phrasebook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Button
                size="lg"
                className={cn(
                  'w-full h-24 text-lg',
                  isListening && 'animate-pulse bg-destructive'
                )}
                onClick={toggleListening}
                disabled={!isAvailable}
              >
                <Mic className="mr-4 h-8 w-8" />
                {isListening ? 'Listening...' : 'Start Recording'}
              </Button>
              {!isAvailable && (
                <p className="text-center text-sm text-destructive">
                  Speech recognition is not available on this browser.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transcript">Live Transcript</Label>
              <Textarea
                id="transcript"
                placeholder={isListening ? '...' : 'Transcript will appear here...'}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                readOnly={isListening}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceLang">From</Label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger id="sourceLang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLang">To</Label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger id="targetLang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memoTitle">Title (Optional)</Label>
              <Input
                id="memoTitle"
                placeholder="e.g., 'Asking for directions'"
                value={memoTitle}
                onChange={e => setMemoTitle(e.target.value)}
              />
            </div>
          </CardContent>
          <CardContent>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving || !transcript}
            >
              {isSaving ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <Save className="mr-2" /> Save to Phrasebook
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>My Phrasebook</CardTitle>
            <CardDescription>
              Your personal collection of translated voice memos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingMemos ? (
                 Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-20 w-full" /></CardHeader></Card>
                 ))
              ) : memos.length === 0 ? (
                <Alert>
                  <ListMusic className="h-4 w-4" />
                  <AlertTitle>Your Phrasebook is Empty</AlertTitle>
                  <AlertDescription>
                    Use the recorder to save your first voice memo.
                  </AlertDescription>
                </Alert>
              ) : (
                memos.map(memo => (
                  <Card key={memo.id} className="flex items-center justify-between p-4">
                    <div className="flex-1 space-y-1 pr-4">
                      {memo.title && <p className="font-bold">{memo.title}</p>}
                       <p className="text-sm text-muted-foreground italic">"{memo.originalText}"</p>
                      <p className="text-sm font-medium">"{memo.translatedText}"</p>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span>{memo.sourceLang.slice(0,2).toUpperCase()} → {memo.targetLang.slice(0,2).toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(memo.createdAt.toDate(), {addSuffix: true})}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={playAction}>
                         <input type="hidden" name="memoId" value={memo.id} />
                        <input type="hidden" name="textToPlay" value={memo.translatedText} />
                        <SubmitButton variant="outline" size="icon" pendingContent={<LoaderCircle className="animate-spin" />}>
                          <Play />
                        </SubmitButton>
                      </form>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(memo.id)}>
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
