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
  MicOff,
  PhoneOff,
  User,
  Settings2,
  LoaderCircle,
  MessageCircle,
  Lightbulb,
  Heart,
  Expand,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

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
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  english: 'en-US',
  // Add more mappings as needed
};

const participants = [
  { name: 'Johna B.', id: 'participant-1' },
  { name: 'Ethan C.', id: 'participant-2' },
  { name: 'Andy T.', id: 'participant-3' },
  { name: 'Jordan K.', id: 'participant-4' },
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

  const { isListening, isAvailable, toggleListening } = useSpeechRecognition({
    onTranscriptChange: setUserTranscript,
    lang: langCodeMapping[userLanguage] || 'en-US',
  });

  // Main conversation logic
  useEffect(() => {
    const processUserTurn = async () => {
      if (userTranscript) {
        const userTurn: TranscriptItem = {
          id: Date.now(),
          speaker: 'me',
          text: userTranscript,
          translation: 'Translating...',
        };
        setConversation(prev => [...prev, userTurn]);
        const currentTranscript = userTranscript;
        setUserTranscript('');

        const { translatedText: englishTranslation } =
          await realTimeTranslationWithContext({
            text: currentTranscript,
            sourceLanguage: userLanguage,
            targetLanguage: 'english',
          });

        setConversation(prev =>
          prev.map(t =>
            t.id === userTurn.id ? { ...t, translation: englishTranslation } : t
          )
        );

        const userHistoryItem: ChatHistoryItem = {
          role: 'user',
          content: [{ text: englishTranslation }],
        };
        const historyForThisTurn = [...chatHistory, userHistoryItem];

        const { response: botEnglishResponse } = await chatWithBot({
          query: englishTranslation,
          history: historyForThisTurn,
        });

        const botHistoryItem: ChatHistoryItem = {
          role: 'model',
          content: [{ text: botEnglishResponse }],
        };
        setChatHistory([...historyForThisTurn, botHistoryItem]);

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
      }
    };

    if (!isListening && userTranscript) {
      processUserTurn();
    }
  }, [isListening, userTranscript, userLanguage, chatHistory]);

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
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left Column: Video Feeds and Controls */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        {/* Main Video Feed */}
        <div className="relative flex-1 overflow-hidden rounded-lg bg-card">
          {remoteUser && (
            <Image
              src={remoteUser.imageUrl}
              layout="fill"
              objectFit="cover"
              alt="Remote user"
              data-ai-hint={remoteUser.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-bold">Ana (AI Persona)</p>
          </div>
          {/* My Video Feed */}
          <div className="absolute right-4 top-4 h-24 w-40 overflow-hidden rounded-md border-2 border-primary shadow-lg md:h-32 md:w-56">
            <video
              ref={videoRef}
              className="h-full w-full -scale-x-100 transform bg-secondary object-cover"
              autoPlay
              muted
              playsInline
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                <VideoOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-black/50 p-3 backdrop-blur-md">
            <Button
              variant={isListening ? 'destructive' : 'secondary'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleListening}
              disabled={!isAvailable}
            >
              {isListening ? <MicOff /> : <Mic />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsCameraOff(!isCameraOff)}
            >
              {isCameraOff ? <VideoOff /> : <Video />}
            </Button>
            <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full">
              <PhoneOff />
            </Button>
          </div>
        </div>

        {/* Other Participants */}
        <div className="space-y-2">
            <h3 className="font-semibold">Other Participants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {participants.map(p => {
                    const img = getPlaceholderImage(p.id);
                    return (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg bg-card p-2">
                        <Avatar>
                            {img && <AvatarImage src={img.imageUrl} />}
                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    )
                })}
            </div>
        </div>
      </div>

      {/* Right Column: Chat Room */}
      <Card className="flex h-full flex-col lg:col-span-1">
        <CardHeader>
          <CardTitle>Chat Room</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6">
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
                    'max-w-xs rounded-lg p-3 text-sm',
                    item.speaker === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p className="font-bold">{item.text}</p>
                  {item.translation && (
                    <p className="italic opacity-80">{item.translation}</p>
                  )}
                </div>
                {item.insight && (
                    <div className="max-w-xs rounded-lg border border-yellow-400/20 bg-yellow-900/20 p-3 text-xs">
                        <p className="flex items-center gap-2 font-semibold text-yellow-300"><Lightbulb className="h-4 w-4" /> Cultural Insight</p>
                        <p className="mt-1 text-yellow-100/90">{item.insight}</p>
                    </div>
                )}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </ScrollArea>
        <CardFooter className="pt-4">
          <div className="relative w-full">
            <Input placeholder="Type a message..." className="pr-10" />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <MessageCircle />
            </Button>
          </div>
        </CardFooter>
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
