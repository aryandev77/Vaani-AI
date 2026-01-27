'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import {
  SendHorizonal,
  User,
  LoaderCircle,
  Lightbulb,
  Languages,
  Mail,
  Globe,
  Camera,
  Upload,
  Video,
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
import { Card } from '@/components/ui/card';
import { LogoIcon } from '@/components/logo-icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// New component for example prompts
const ExamplePromptCard = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <Card className="h-full text-left transition-colors group-hover:bg-muted">
    <div className="flex flex-row items-center gap-4 p-4">
      {icon}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  </Card>
);

export default function DashboardPage() {
  const user = useUser();
  const userAvatar = getPlaceholderImage('user-avatar');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [queryText, setQueryText] = useState('');
  const { toast } = useToast();

  // Camera Dialog states
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(
    null
  );
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
            text: "Hello! I'm Vaani, your personal language tutor. How can I help you today?",
          },
        ],
      },
    ],
  };
  const [state, dispatch, isPending] = useActionState(handleChat, initialState);

  useEffect(() => {
    if (state.history.length > 1 || isPending) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.history, isPending]);

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
      <div className="flex-1 overflow-y-auto">
        {state.history.length <= 1 && !isPending ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 p-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <rect
                  width="28"
                  height="28"
                  rx="6"
                  fill="url(#logoGradient)"
                />
                <path
                  d="M 6 9 L 10 17 Q 14 21 18 17 L 22 9"
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <h1 className="text-2xl font-semibold">
                How can I help you today?
              </h1>
            </div>
            <div className="w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid">
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="Explain the idiom 'break a leg'"
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Lightbulb className="h-6 w-6 text-primary" />}
                    title="Explain an idiom"
                    subtitle="'Break a leg'"
                  />
                </button>
              </form>
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="How do I say 'Where is the nearest train station?' in Japanese?"
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Languages className="h-6 w-6 text-primary" />}
                    title="Translate a phrase"
                    subtitle="'Where is the nearest train station?' in Japanese"
                  />
                </button>
              </form>
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="Help me write a formal email to a professor asking for an extension on an assignment."
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Mail className="h-6 w-6 text-primary" />}
                    title="Help me write an email"
                    subtitle="To a professor, asking for an extension"
                  />
                </button>
              </form>
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="What's the cultural difference between a 'siesta' in Spain and a regular nap?"
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Globe className="h-6 w-6 text-primary" />}
                    title="Explain cultural context"
                    subtitle="The difference between 'siesta' in Spain and a 'nap'"
                  />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="mx-auto max-w-3xl space-y-6">
              {state.history.slice(1).map((message, index) => (
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
        )}
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-3xl p-4">
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
            <Input
              name="query"
              placeholder="Ask about languages, idioms, or translations..."
              autoComplete="off"
              disabled={isPending}
              className="flex-1"
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={isPending || !queryText}>
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
