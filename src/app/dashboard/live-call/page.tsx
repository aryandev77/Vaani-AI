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
          This is a premium feature. Translate voice and video calls in real-time
          with cultural context.
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
            <Button size="lg" variant="outline" onClick={onUpgrade} className="w-full">
                Simulate Subscription
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const mockTranscript = [
    { speaker: 'other', text: 'Hola, ¿cómo estás?', translation: 'Hello, how are you?' },
    { speaker: 'me', text: "I'm doing well, thank you! How about you?", translation: '¡Estoy bien, gracias! ¿Y usted?' },
    { speaker: 'other', text: 'Muy bien. Quería preguntarte sobre el proyecto.', translation: 'Very good. I wanted to ask you about the project.' },
    { speaker: 'me', text: 'Of course, what do you need to know?', translation: 'Por supuesto, ¿qué necesitas saber?' },
    { speaker: 'other', text: '¿Cuál es la fecha límite para la primera fase?', translation: 'What is the deadline for the first phase?' },
];

const LiveCallInterface = () => {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [transcript, setTranscript] = useState<(typeof mockTranscript)>([]);
    const [callTime, setCallTime] = useState(0);

    useEffect(() => {
        // Mock transcript appearing over time
        let index = 0;
        const interval = setInterval(() => {
            if (index < mockTranscript.length) {
                setTranscript(prev => [...prev, mockTranscript[index]]);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 3000);

        // Call timer
        const timer = setInterval(() => {
            setCallTime(t => t + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };
    
        if (!isCameraOff) {
            getCameraPermission();
        } else if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
      }, [isCameraOff, toast]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    const remoteUser = getPlaceholderImage('remote-user-avatar');


  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative col-span-1 flex flex-col gap-4 lg:col-span-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-lg">
                {remoteUser && <Image src={remoteUser.imageUrl} layout="fill" objectFit="cover" alt="Remote user" className="opacity-50" />}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-32 w-32 border-4 border-background/50">
                        {remoteUser && <AvatarImage src={remoteUser.imageUrl} />}
                        <AvatarFallback className="text-4xl"><User /></AvatarFallback>
                    </Avatar>
                </div>
                 <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                    <p className="font-bold">Ana García</p>
                    <p className="text-xs">{formatTime(callTime)}</p>
                </div>
            </div>
            
            <div className="absolute right-4 top-4 h-24 w-40 overflow-hidden rounded-md border-2 border-primary shadow-md md:h-32 md:w-56">
                {isCameraOff || !hasCameraPermission ? (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                        <VideoOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                ) : (
                    <video ref={videoRef} className="h-full w-full -scale-x-100 object-cover" autoPlay muted />
                )}
            </div>

            <div className="flex items-center justify-center gap-4 rounded-lg bg-card p-2">
                <Button variant={isMuted ? "destructive" : "outline"} size="icon" className="h-14 w-14 rounded-full" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                 <Button variant={isCameraOff ? "destructive" : "outline"} size="icon" className="h-14 w-14 rounded-full" onClick={() => setIsCameraOff(!isCameraOff)}>
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
                <CardTitle>Live Transcript</CardTitle>
                <CardDescription>English / Spanish</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                 <div className="space-y-6">
                    {transcript.map((item, index) => (
                        <div key={index} className={cn("flex flex-col", item.speaker === 'me' ? 'items-end' : 'items-start')}>
                            <div className={cn("max-w-xs rounded-lg p-3 text-sm", item.speaker === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="font-bold">{item.translation}</p>
                                <p className="opacity-80">{item.text}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{item.speaker === 'me' ? "You" : "Ana García"}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    </div>
  )
}

export default function LiveCallPage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  return (
    <div className="flex h-full items-center justify-center">
      {isSubscribed ? <LiveCallInterface /> : <UpgradeView onUpgrade={() => setIsSubscribed(true)} />}
    </div>
  );
}
