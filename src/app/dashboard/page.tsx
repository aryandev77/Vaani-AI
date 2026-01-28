
'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import {
  SendHorizonal,
  User,
  LoaderCircle,
  Camera,
  Upload,
  Video,
  Mic,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

import { handleChat, extractTextFromImage } from '@/lib/actions';
import type { ChatState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { LogoIcon } from '@/components/logo-icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

const SuggestionCard = ({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <Card
    className="cursor-pointer transition-all hover:bg-muted/50"
    onClick={onClick}
  >
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription className="text-sm">{description}</CardDescription>
    </CardHeader>
  </Card>
);

export default function DashboardPage() {
  const user = useUser();
  const userAvatar = getPlaceholderImage('user-avatar');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [queryText, setQueryText] = useState('');
  const { toast } = useToast();

  const { isListening, isAvailable, toggleListening } =
    useSpeechRecognition(setQueryText);

  // Camera Dialog states
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialState: ChatState = {
    history: [
      {
        role: 'model',
        content: [
          {
            text: "Hello! I'm Vaani. Click the quote icon above to see the 'Phrase of the Day', or ask me anything you'd like!",
          },
        ],
      },
    ],
  };
  const [state, dispatch, isPending] = useActionState(handleChat, initialState);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.history, isPending]);

  const handleSuggestionClick = (suggestion: string) => {
    setQueryText(suggestion);
  };

  const openCamera = async () => {
    setIsCameraDialogOpen(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    } else {
      setHasCameraPermission(false);
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCapturedImage(null);
    setIsCameraDialogOpen(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!capturedImage) return;
    setIsExtracting(true);
    try {
      const result = await extractTextFromImage(capturedImage);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Extraction Failed',
          description: result.error,
        });
      } else {
        setQueryText(result.text);
        toast({
          title: 'Text Extracted!',
          description: 'The text has been placed in the chat box.',
        });
        closeCamera();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-4">
          {state.history.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-transparent p-1">
                    <LogoIcon />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xl rounded-lg p-3 text-sm shadow-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.role === 'model' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm dark:prose-invert"
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                      ),
                    }}
                  >
                    {message.content[0].text}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {message.content[0].text}
                  </p>
                )}
              </div>
              {message.role === 'user' && user && (
                <Avatar className="h-9 w-9">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt="User Avatar" />
                  ) : (
                    userAvatar && (
                      <AvatarImage
                        src={userAvatar.imageUrl}
                        alt="User Avatar"
                        data-ai-hint={userAvatar.imageHint}
                      />
                    )
                  )}
                  <AvatarFallback>
                    {user.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {state.history.length === 1 && !isPending && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SuggestionCard
                  title="Explain an idiom"
                  description="e.g., 'Bite the bullet'"
                  onClick={() =>
                    handleSuggestionClick("Explain the idiom 'Bite the bullet'")
                  }
                />
                <SuggestionCard
                  title="Translate with context"
                  description="e.g., 'How are you?' to French"
                  onClick={() =>
                    handleSuggestionClick(
                      "Translate 'How are you?' to French and explain when to use 'tu' vs 'vous'"
                    )
                  }
                />
                <SuggestionCard
                  title="Write an email"
                  description="e.g., Professional email in German"
                  onClick={() =>
                    handleSuggestionClick(
                      'Write a professional email in German asking for a project status update.'
                    )
                  }
                />
                <SuggestionCard
                  title="Ask about culture"
                  description="e.g., Cultural norms in Japan"
                  onClick={() =>
                    handleSuggestionClick(
                      'What are some important cultural norms to be aware of when visiting Japan for business?'
                    )
                  }
                />
              </div>
            </div>
          )}
          {isPending && (
            <div className="flex items-start justify-start gap-4">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-transparent p-1">
                  <LogoIcon />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-xl rounded-lg bg-muted p-3 text-sm shadow-sm">
                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t">
        <div className="mx-auto max-w-3xl p-4">
          {!isAvailable && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Speech Recognition Not Available</AlertTitle>
              <AlertDescription>
                Your browser does not support speech recognition. Please try
                using Google Chrome.
              </AlertDescription>
            </Alert>
          )}
          <form
            ref={formRef}
            action={formData => {
              const query = formData.get('query') as string;
              if (query?.trim()) {
                dispatch(formData);
                setQueryText('');
              }
            }}
            className="flex items-center gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={openCamera}
              disabled={isPending}
              className="shrink-0"
            >
              <Camera className="h-5 w-5" />
              <span className="sr-only">Use camera</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleListening}
              disabled={isPending || !isAvailable}
              className={cn(
                'shrink-0',
                isListening && 'text-destructive animate-pulse'
              )}
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">Use microphone</span>
            </Button>
            <Input
              name="query"
              placeholder={
                isListening
                  ? 'Listening...'
                  : 'Ask about the phrase of the day, or anything else...'
              }
              autoComplete="off"
              disabled={isPending}
              className="flex-1"
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !queryText}
            >
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
      <Dialog open={isCameraDialogOpen} onOpenChange={closeCamera}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Extract Text from Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!capturedImage && hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to use this
                  feature. You can still upload an image from your gallery.
                </AlertDescription>
              </Alert>
            )}
            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-secondary">
              {capturedImage ? (
                <Image
                  src={capturedImage}
                  alt="Captured"
                  layout="fill"
                  objectFit="contain"
                />
              ) : cameraStream ? (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Video className="h-12 w-12" />
                  <p>Camera feed will appear here</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {capturedImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedImage(null);
                    openCamera();
                  }}
                >
                  Retake
                </Button>
                <Button onClick={handleExtract} disabled={isExtracting}>
                  {isExtracting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Extract Text'
                  )}
                </Button>
              </>
            ) : cameraStream ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <Button onClick={handleCapture}>Capture</Button>
              </>
            ) : (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload an Image
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    