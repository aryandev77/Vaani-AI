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
import { motion, AnimatePresence } from 'framer-motion';

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
import { chatWithBot } from '@/ai/flows/chatbot';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { ChatHistoryItem } from '@/lib/definitions';

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
  originalText: string;
  translatedText: string;
};

// Language mapping for speech recognition
const langCodeMapping: { [key: string]: string } = {
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  english: 'en-US',
  // Add more mappings as needed
};

const LiveCallInterface = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // --- Demo State ---
  // Defaulting to Hindi for the demo as requested. This could be fetched from user profile.
  const [userLanguage, setUserLanguage] = useState('hindi');
  const [userTranscript, setUserTranscript] = useState('');
  const [conversation, setConversation] = useState<TranscriptItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  // --- End Demo State ---

  const { isListening, isAvailable, toggleListening } = useSpeechRecognition({
    onTranscriptChange: setUserTranscript,
    lang: langCodeMapping[userLanguage] || 'en-US',
  });

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => setCallTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Main conversation logic
  useEffect(() => {
    const processUserTurn = async () => {
      if (userTranscript) {
        // 1. Add user's transcribed speech to the conversation display
        const userTurn: TranscriptItem = {
          id: Date.now(),
          speaker: 'me',
          originalText: userTranscript,
          translatedText: 'Translating...',
        };
        setConversation(prev => [...prev, userTurn]);
        const currentTranscript = userTranscript; // Capture transcript before clearing
        setUserTranscript(''); // Clear the raw transcript

        // 2. Translate user's speech to English for the bot
        const { translatedText: englishTranslation } =
          await realTimeTranslationWithContext({
            text: currentTranscript,
            sourceLanguage: userLanguage,
            targetLanguage: 'english',
          });

        // Update the user's turn in the UI with the English translation
        setConversation(prev =>
          prev.map(t =>
            t.id === userTurn.id ? { ...t, translatedText: englishTranslation } : t
          )
        );

        // 3. Add to chat history for context, creating a new history for this turn
        const userHistoryItem: ChatHistoryItem = {
          role: 'user',
          content: [{ text: englishTranslation }],
        };
        const historyForThisTurn = [...chatHistory, userHistoryItem];

        // 4. Trigger bot's response
        setIsBotThinking(true);
        const { response: botEnglishResponse } = await chatWithBot({
          query: englishTranslation,
          history: historyForThisTurn, // Use the up-to-date history
        });

        // 5. Update the full chat history with both the user's and bot's turn
        const botHistoryItem: ChatHistoryItem = {
          role: 'model',
          content: [{ text: botEnglishResponse }],
        };
        setChatHistory([...historyForThisTurn, botHistoryItem]);

        // 6. Translate bot's English response back to the user's language
        const { translatedText: botForeignResponse } =
          await realTimeTranslationWithContext({
            text: botEnglishResponse,
            sourceLanguage: 'english',
            targetLanguage: userLanguage,
          });

        // 7. Add bot's turn to conversation display
        const botTurn: TranscriptItem = {
          id: Date.now() + 1,
          speaker: 'other',
          originalText: botForeignResponse || '...',
          translatedText: botEnglishResponse,
        };
        setConversation(prev => [...prev, botTurn]);
        setIsBotThinking(false);

        // 8. Generate and play audio for the bot's translated response
        if (botForeignResponse) {
          const { audioData } = await textToSpeech(botForeignResponse);
          if (audioData && audioRef.current) {
            audioRef.current.src = audioData;
            audioRef.current.play();
          }
        }
      }
    };

    // Trigger processing when the user stops speaking
    if (!isListening && userTranscript) {
      processUserTurn();
    }
  }, [isListening, userTranscript, userLanguage, chatHistory]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isBotThinking]);

  // Camera permission logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (isCameraOff) {
        if (videoRef.current?.srcObject) {
          const currentStream = videoRef.current.srcObject as MediaStream;
          currentStream.getTracks().forEach(track => track.stop());
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
            'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOff, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const remoteUser = getPlaceholderImage('remote-user-avatar');

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative w-full flex-1 overflow-hidden rounded-lg bg-black shadow-lg">
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
          <Avatar className="h-40 w-40 border-4 border-background/50">
            {remoteUser && <AvatarImage src={remoteUser.imageUrl} />}
            <AvatarFallback className="text-6xl"><User /></AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
          <p className="font-bold">Ana García</p>
          <p className="text-xs">{formatTime(callTime)}</p>
        </div>
        <div className="absolute right-4 top-4 h-24 w-40 overflow-hidden rounded-md border-2 border-primary shadow-md md:h-32 md:w-56">
          <video ref={videoRef} className="h-full w-full -scale-x-100 transform bg-secondary object-cover" autoPlay muted playsInline />
          {isCameraOff && <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-secondary"><VideoOff className="h-8 w-8 text-muted-foreground" /></div>}
          {hasCameraPermission === null && !isCameraOff && <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-secondary/80"><Video className="h-8 w-8 animate-pulse text-muted-foreground" /></div>}
          {hasCameraPermission === false && !isCameraOff && <div className="absolute inset-0 flex items-center justify-center bg-destructive/90 p-2 text-center"><Alert variant="destructive" className="border-0 bg-transparent text-destructive-foreground"><AlertTitle className="text-sm font-bold">Camera Denied</AlertTitle></Alert></div>}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 rounded-lg bg-card p-2">
        <Button variant={isListening ? 'destructive' : 'default'} size="icon" className="h-14 w-14 rounded-full" onClick={toggleListening} disabled={!isAvailable}><Mic /></Button>
        <Button variant={isCameraOff ? 'destructive' : 'outline'} size="icon" className="h-14 w-14 rounded-full" onClick={() => setIsCameraOff(!isCameraOff)}>{isCameraOff ? <VideoOff /> : <Video />}</Button>
        <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full"><PhoneOff /></Button>
        <Button variant="outline" size="icon" className="h-14 w-14 rounded-full"><Settings2 /></Button>
      </div>

      <Card className="flex h-[250px] flex-col">
        <CardHeader className="flex-shrink-0"><CardTitle>Live Transcript</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {conversation.map(item => (
              <div key={item.id} className={cn('flex flex-col', item.speaker === 'me' ? 'items-end' : 'items-start')}>
                <div className={cn('max-w-md rounded-lg p-3 text-sm', item.speaker === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p className="font-bold">{item.originalText}</p>
                  <p className="italic opacity-80">{item.translatedText}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.speaker === 'me' ? 'You' : 'Ana García'}</p>
              </div>
            ))}
            {isBotThinking && (
              <div className="flex flex-col items-start">
                <div className="max-w-xs rounded-lg bg-muted p-3 text-sm"><LoaderCircle className="h-5 w-5 animate-spin" /></div>
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
