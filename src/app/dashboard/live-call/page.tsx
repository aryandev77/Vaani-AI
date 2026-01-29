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
  LoaderCircle,
  Lightbulb,
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { chatWithBot } from '@/ai/flows/chatbot';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { ChatHistoryItem } from '@/lib/definitions';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';

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

type TranscriptItem = {
  id: number;
  speaker: 'me' | 'other';
  text: string;
  translation?: string;
  insight?: string;
};

// Language mapping for speech recognition
const langCodeMapping: { [key: string]: string } = {
  english: 'en-US',
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  marathi: 'mr-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  urdu: 'ur-IN',
  punjabi: 'pa-IN',
  bhojpuri: 'bho-IN',
  malayalam: 'ml-IN',
};

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'bhojpuri', label: 'Bhojpuri' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'punjabi', label: 'Punjabi' },
];

const LiveCallInterface = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const [userLanguage, setUserLanguage] = useState('hindi');
  const [userTranscript, setUserTranscript] = useState('');
  const [conversation, setConversation] = useState<TranscriptItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { isListening, isAvailable, toggleListening, transcript } =
    useSpeechRecognition({ lang: langCodeMapping[userLanguage] || 'en-US' });

  // Main conversation logic
  useEffect(() => {
    const processUserTurn = async () => {
      if (transcript) {
        setIsProcessing(true);
        const currentTranscript = transcript;

        const userTurn: TranscriptItem = {
          id: Date.now(),
          speaker: 'me',
          text: currentTranscript,
          translation: 'Translating...',
        };
        setConversation(prev => [...prev, userTurn]);

        try {
          const { translatedText: englishTranslation } =
            await realTimeTranslationWithContext({
              text: currentTranscript,
              sourceLanguage: userLanguage,
              targetLanguage: 'english',
            });

          const finalEnglishTranslation =
            englishTranslation || '[Translation Error]';

          setConversation(prev =>
            prev.map(t =>
              t.id === userTurn.id
                ? { ...t, translation: finalEnglishTranslation }
                : t
            )
          );

          const userHistoryItem: ChatHistoryItem = {
            role: 'user',
            content: [{ text: finalEnglishTranslation }],
          };

          const historyForBot = [...chatHistory, userHistoryItem];

          const { response: botEnglishResponse } = await chatWithBot({
            query: finalEnglishTranslation,
            history: historyForBot,
          });

          const botHistoryItem: ChatHistoryItem = {
            role: 'model',
            content: [{ text: botEnglishResponse }],
          };

          setChatHistory(prev => [...prev, userHistoryItem, botHistoryItem]);

          const {
            translatedText: botForeignResponse,
            culturalInsights,
          } = await realTimeTranslationWithContext({
            text: botEnglishResponse,
            sourceLanguage: 'english',
            targetLanguage: userLanguage,
          });

          const botTurn: TranscriptItem = {
            id: Date.now() + 1,
            speaker: 'other',
            text: botForeignResponse || '...',
            translation: botEnglishResponse,
            insight: culturalInsights,
          };
          setConversation(prev => [...prev, botTurn]);

          if (botForeignResponse) {
            const { audioData } = await textToSpeech(botForeignResponse);
            if (audioData && audioRef.current) {
              audioRef.current.src = audioData;
              audioRef.current.play();
            }
          }
        } catch (error) {
          console.error('Conversation processing error:', error);
          toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: 'Could not process the conversation turn.',
          });
          // Remove the user turn that failed
          setConversation(prev => prev.filter(t => t.id !== userTurn.id));
        } finally {
          setIsProcessing(false);
          setUserTranscript('');
        }
      }
    };

    if (!isListening && transcript) {
      processUserTurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Camera permission logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (isCameraOff) {
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
            'Please enable camera permissions in your browser settings.',
        });
      }
    };
    getCameraPermission();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isCameraOff, toast]);

  const remoteUser = getPlaceholderImage('remote-user-avatar');

  return (
    <div className="flex h-full flex-col">
      {/* Video Call Section */}
      <div className="relative flex-1 bg-black">
        {remoteUser && (
          <Image
            src={remoteUser.imageUrl}
            layout="fill"
            objectFit="cover"
            alt="Remote user"
            data-ai-hint={remoteUser.imageHint}
            className="opacity-70"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute left-4 top-4">
            <Label htmlFor="userLanguage" className="text-white/80">Your Language</Label>
            <Select value={userLanguage} onValueChange={setUserLanguage}>
              <SelectTrigger id="userLanguage" className="w-40 text-white bg-black/30 border-white/30">
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
        
        <div className="absolute bottom-16 left-4 text-white">
          <p className="font-bold">Ana (AI Friend)</p>
          <p className="text-xs">London, UK</p>
        </div>

        <div className="absolute right-4 top-4 h-32 w-24 overflow-hidden rounded-md border-2 border-primary/50 bg-secondary shadow-lg md:h-40 md:w-32">
          <video
            ref={videoRef}
            className="h-full w-full -scale-x-100 transform object-cover"
            autoPlay
            muted
            playsInline
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <VideoOff className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-1 left-2 text-xs font-medium text-white">
            You
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-black/50 p-3 backdrop-blur-md">
          <Button
            variant={isListening ? 'destructive' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleListening}
            disabled={!isAvailable || isProcessing}
          >
            {isListening || isProcessing ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Mic />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsCameraOff(!isCameraOff)}
          >
            {isCameraOff ? <VideoOff /> : <Video />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
          >
            <PhoneOff />
          </Button>
        </div>
      </div>
      
      {/* Transcript/Context Section */}
      <Card className="flex h-1/2 max-h-[50vh] flex-col rounded-t-2xl border-t-4 border-primary bg-card/80 backdrop-blur-xl lg:h-2/5 lg:max-h-[40vh]">
        <CardHeader className="py-3">
          <CardTitle>Live Transcript & Context</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 pb-4">
            {conversation.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex flex-col gap-2',
                  item.speaker === 'me' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-md rounded-lg p-3 text-sm shadow-md',
                    item.speaker === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p className="font-bold">{item.text}</p>
                  {item.translation && (
                    <p className="italic opacity-80">{item.translation}</p>
                  )}
                  {item.translation === 'Translating...' && (
                    <LoaderCircle className="mt-1 h-4 w-4 animate-spin" />
                  )}
                </div>
                {item.insight && (
                  <div className="max-w-md rounded-lg border border-yellow-400/20 bg-yellow-900/20 p-3 text-xs shadow-md">
                    <p className="flex items-center gap-2 font-semibold text-yellow-300">
                      <Lightbulb className="h-4 w-4" /> Cultural Insight
                    </p>
                    <p className="mt-1 text-yellow-100/90">{item.insight}</p>
                  </div>
                )}
              </div>
            ))}
             {isProcessing && !isListening && (
                <div className={cn('flex flex-col items-start gap-2')}>
                  <div className={cn('max-w-xs rounded-lg bg-secondary p-3 text-sm')}>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            <div ref={transcriptEndRef} />
          </div>
        </ScrollArea>
        <CardContent className="border-t p-2">
           <p className="text-center text-xs text-muted-foreground">This is an AI-powered demo. The person on the call is not real.</p>
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
  const user = useUser();

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

  if (!user) {
    return <div className="h-full" />;
  }

  return (
    <div className="h-full">
      {isSubscribed || isFounder ? (
        <LiveCallInterface />
      ) : (
        <div className="flex h-full items-center justify-center">
          <UpgradeView onUpgrade={handleUpgradeSimulation} />
        </div>
      )}
    </div>
  );
}
