'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  LoaderCircle,
  Lightbulb,
  Video,
  VideoOff,
  PhoneOff,
} from 'lucide-react';
import Image from 'next/image';

import { useUser } from '@/firebase';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/hooks/use-toast';
import { chatWithBot } from '@/ai/flows/chatbot';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { ChatHistoryItem } from '@/lib/definitions';
import { getPlaceholderImage } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import {
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FullScreenLoader } from '@/components/full-screen-loader';

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

export default function LiveCallPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [userLanguage, setUserLanguage] = useState('hindi');
  const [conversation, setConversation] = useState<TranscriptItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const finalTranscriptRef = useRef('');

  const handleFinalTranscript = (transcript: string) => {
    if (transcript.trim()) {
      finalTranscriptRef.current = transcript;
    }
  };

  const { isListening, isAvailable, startListening, stopListening, transcript } =
    useSpeechRecognition({
      lang: langCodeMapping[userLanguage] || 'en-US',
      onFinal: handleFinalTranscript,
    });
  
  const user = useUser();

  // Main conversation logic
  useEffect(() => {
    const processUserTurn = async () => {
      const userSpeech = finalTranscriptRef.current;
      if (userSpeech && !isProcessing) { 
        finalTranscriptRef.current = ''; 
        setIsProcessing(true);
        
        const userTurn: TranscriptItem = {
          id: Date.now(),
          speaker: 'me',
          text: userSpeech,
          translation: 'Translating...',
        };
        setConversation(prev => [...prev, userTurn]);

        try {
          const { translatedText: englishTranslation } =
            await realTimeTranslationWithContext({
              text: userSpeech,
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
          setConversation(prev => prev.filter(t => t.id !== userTurn.id));
        } finally {
          setIsProcessing(false);
        }
      }
    };

    if (!isListening && finalTranscriptRef.current) {
      processUserTurn();
    }
  }, [isListening, chatHistory, toast, userLanguage, isProcessing]);

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

  if (!user) return <FullScreenLoader />;

  return (
    <div className="flex h-full flex-col bg-black text-white lg:flex-row">
      {/* Main Content: Video Call */}
      <div className="relative flex flex-1 items-center justify-center bg-black">
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

        <div className="absolute left-4 top-4 text-white">
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
            onClick={isListening ? stopListening : startListening}
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

      {/* Sidebar: Chat Room */}
      <div className="flex h-1/2 flex-col border-t border-white/10 bg-[#121212] lg:h-full lg:w-full lg:max-w-sm">
        <CardHeader>
          <CardTitle>Chat Room</CardTitle>
          <div className="flex items-center gap-4 pt-2">
            <Label htmlFor="userLanguage" className="text-white/80">
              Your Language
            </Label>
            <Select value={userLanguage} onValueChange={setUserLanguage}>
              <SelectTrigger
                id="userLanguage"
                className="w-40 bg-black/30 text-white"
              >
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
                    'max-w-[90%] rounded-lg p-3 text-sm shadow-md',
                    item.speaker === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-white'
                  )}
                >
                  <p className="font-bold">{item.text}</p>
                  {item.translation && (
                    <p className="italic opacity-80">{item.translation}</p>
                  )}
                </div>
                {item.insight && (
                  <div className="max-w-[90%] rounded-lg border border-yellow-400/20 bg-yellow-900/20 p-3 text-xs shadow-md">
                    <p className="flex items-center gap-2 font-semibold text-yellow-300">
                      <Lightbulb className="h-4 w-4" /> Cultural Insight
                    </p>
                    <p className="mt-1 text-yellow-100/90">{item.insight}</p>
                  </div>
                )}
              </div>
            ))}
            {isListening && (
               <div className={cn('flex flex-col items-end gap-2')}>
                  <div className="text-right text-sm italic text-muted-foreground p-3">
                      {transcript || "Listening..."}
                  </div>
               </div>
            )}
            {isProcessing && !isListening && (
              <div className={cn('flex flex-col items-start gap-2')}>
                <div
                  className={cn('max-w-xs rounded-lg bg-secondary p-3 text-sm')}
                >
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </ScrollArea>
         <CardFooter className="border-t border-white/10 p-2">
          <p className="text-center text-xs text-muted-foreground">
            This is an AI-powered demo. The person on the call is not real.
          </p>
        </CardFooter>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
