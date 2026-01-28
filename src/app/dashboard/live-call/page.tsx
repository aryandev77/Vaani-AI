'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PhoneCall,
  Sparkles,
  Video,
  VideoOff,
  Mic,
  PhoneOff,
  User,
  Settings2,
  LoaderCircle,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const UpgradeView = ({ onUpgrade }: { onUpgrade: () => void }) => {
  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <PhoneCall className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="mt-4 text-2xl font-headline">
          Unlock Live Call Translation
        </CardTitle>
        <CardDescription>
          This is a premium feature. Translate voice and video calls in
          real-time with cultural context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-2 pl-5 text-left text-sm text-muted-foreground">
          <li>Translate conversations during voice calls instantly.</li>
          <li>
            Get real-time translation for video calls, with correct accent and
            tone.
          </li>
          <li>
            Receive contextual insights to understand cultural nuances as you
            talk.
          </li>
          <li>Communicate seamlessly with anyone, anywhere, in any language.</li>
        </ul>
        <div className="flex flex-col gap-2">
          <Button size="lg" asChild className="mt-4 w-full">
            <Link href="/dashboard/billing">
              <Sparkles className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onUpgrade}
            className="w-full"
          >
            Simulate Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Demo Logic ---
type TranscriptItem = {
  id: number;
  speaker: 'me' | 'other';
  englishText: string;
  foreignText: string;
  language: string;
};

const botResponses = [
  "I'm doing great, thanks for asking. So, about that project, have you made any progress on the design mockups?",
  "That sounds promising. What's the new timeline looking like for the first phase?",
  "Okay, that works. Let's aim to have the final review by the end of next week then. Does that sound good to you?",
  'Perfect. I\'ll check back in a couple of days. Keep up the great work!',
  'You too. Goodbye!',
];
let botResponseIndex = 0;

const demoLanguages = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
];
// --- End Demo Logic ---

const LiveCallInterface = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callTime, setCallTime] = useState(0);

  // New states for interactive demo
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [userLanguage, setUserLanguage] = useState('hindi');
  const [userTranscript, setUserTranscript] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition hook
  const { isListening, isAvailable, toggleListening } =
    useSpeechRecognition(setUserTranscript);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Handle user speech processing
  useEffect(() => {
    const processTurn = async () => {
      if (userTranscript) {
         // 1. Translate user's speech to English
        const { translatedText: englishTranslation } =
          await realTimeTranslationWithContext({
            text: userTranscript,
            sourceLanguage: userLanguage,
            targetLanguage: 'english',
          });

        // 2. Add user's turn to transcript
        const userTurn: TranscriptItem = {
          id: Date.now(),
          speaker: 'me',
          englishText: englishTranslation || '...',
          foreignText: userTranscript,
          language: userLanguage,
        };
        setTranscript(prev => [...prev, userTurn]);
        setUserTranscript(''); // Clear after processing

        // 3. Trigger bot's turn
        setIsBotThinking(true);
        setTimeout(async () => {
             // 3a. Get next pre-canned English response
            const botEnglishResponse = botResponses[botResponseIndex % botResponses.length];
            botResponseIndex++;

            // 3b. Translate bot's English response to user's language
            const { translatedText: botForeignResponse } =
            await realTimeTranslationWithContext({
                text: botEnglishResponse,
                sourceLanguage: 'english',
                targetLanguage: userLanguage,
            });
            
             // 3c. Add bot's turn to transcript
            const botTurn: TranscriptItem = {
                id: Date.now() + 1,
                speaker: 'other',
                englishText: botEnglishResponse,
                foreignText: botForeignResponse || '...',
                language: userLanguage,
            };
            setTranscript(prev => [...prev, botTurn]);
            setIsBotThinking(false);

            // 3d. Get TTS for bot's foreign language response and play it
            if (botForeignResponse) {
                const { audioData } = await textToSpeech(botForeignResponse);
                if (audioData && audioRef.current) {
                audioRef.current.src = audioData;
                audioRef.current.play();
                }
            }
        }, 1000 + Math.random() * 1000);
      }
    };
    
    if (!isListening) {
        processTurn();
    }
  }, [isListening, userTranscript, userLanguage]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isBotThinking]);

  // Camera permission logic
  useEffect(() => {
    const getCameraPermission = async () => {
      if (isCameraOff) {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOff, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const remoteUser = getPlaceholderImage('remote-user-avatar');

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="relative col-span-1 flex flex-col gap-4 lg:col-span-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-lg">
          {remoteUser && (
            <Image
              src={remoteUser.imageUrl}
              layout="fill"
              objectFit="cover"
              alt="Remote user"
              className="opacity-50"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="h-32 w-32 border-4 border-background/50">
              {remoteUser && <AvatarImage src={remoteUser.imageUrl} />}
              <AvatarFallback className="text-4xl">
                <User />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
            <p className="font-bold">Ana García</p>
            <p className="text-xs">{formatTime(callTime)}</p>
          </div>
        </div>

        <div className="absolute right-4 top-4 h-24 w-40 overflow-hidden rounded-md border-2 border-primary shadow-md md:h-32 md:w-56">
          <video
            ref={videoRef}
            className="h-full w-full -scale-x-100 transform bg-secondary object-cover"
            autoPlay
            muted
            playsInline
          />

          {isCameraOff && (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-secondary">
              <VideoOff className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

            {hasCameraPermission === null && !isCameraOff && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-secondary/80">
                <Video className="h-8 w-8 animate-pulse text-muted-foreground" />
                </div>
            )}

          {hasCameraPermission === false && !isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/90 p-2 text-center">
              <Alert
                variant="destructive"
                className="border-0 bg-transparent text-destructive-foreground"
              >
                <AlertTitle className="text-sm font-bold">
                  Camera Denied
                </AlertTitle>
              </Alert>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 rounded-lg bg-card p-2">
          <Button
            variant={isListening ? 'destructive' : 'default'}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={toggleListening}
            disabled={!isAvailable}
          >
            <Mic />
          </Button>
          <Button
            variant={isCameraOff ? 'destructive' : 'outline'}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => setIsCameraOff(!isCameraOff)}
          >
            {isCameraOff ? <VideoOff /> : <Video />}
          </Button>
          <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full">
            <PhoneOff />
          </Button>
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
            <Settings2 />
          </Button>
        </div>
      </div>
      <Card className="col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Live Translation Demo</CardTitle>
          <div className="pt-2">
            <Label htmlFor="user-language">Your Language</Label>
            <Select value={userLanguage} onValueChange={setUserLanguage} disabled={isListening}>
              <SelectTrigger id="user-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demoLanguages.map(l => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {transcript.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex flex-col',
                  item.speaker === 'me' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs rounded-lg p-3 text-sm',
                    item.speaker === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="font-bold">{item.foreignText}</p>
                  <p className="italic opacity-80">{item.englishText}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.speaker === 'me' ? 'You' : 'Ana García'}
                </p>
              </div>
            ))}
            {isBotThinking && (
                 <div className="flex flex-col items-start">
                    <div className="max-w-xs rounded-lg bg-muted p-3 text-sm">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Ana García</p>
                </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default function LiveCallPage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin');
      if (adminStatus === 'true') {
        setIsFounder(true);
      }
      const subscriptionStatus = localStorage.getItem('isSubscribed');
      if (subscriptionStatus === 'true') {
        setIsSubscribed(true);
      }
    }
  }, []);

  const handleUpgradeSimulation = () => {
    setIsSubscribed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSubscribed', 'true');
    }
    toast({
      title: 'Subscription Simulated!',
      description: 'You can now access the Live Call feature.',
    });
  };

  return (
    <div className="flex h-full items-center justify-center">
      {isSubscribed || isFounder ? (
        <LiveCallInterface />
      ) : (
        <UpgradeView onUpgrade={handleUpgradeSimulation} />
      )}
    </div>
  );
}