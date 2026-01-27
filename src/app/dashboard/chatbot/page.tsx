'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  LoaderCircle,
  Volume2,
  Play,
  ThumbsUp,
  ThumbsDown,
  Camera,
  Upload,
  Video,
  X,
  FileImage,
  Mic,
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { handleTranslation, extractTextFromImage } from '@/lib/actions';
import type { TranslationState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/submit-button';
import { Waveform } from '@/components/waveform';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
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

const lipSyncAvatar = getPlaceholderImage('lip-sync-avatar');

export default function RealTimeTranslationPage() {
  const initialState: TranslationState = {
    translatedText: '',
    culturalInsights: '',
    audioData: '',
  };
  const [state, dispatch] = useActionState(handleTranslation, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [translationDocId, setTranslationDocId] = useState<string | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [correctedText, setCorrectedText] = useState('');
  const [sourceText, setSourceText] = useState('');

  const {
    isListening,
    isAvailable: isSpeechRecognitionAvailable,
    toggleListening,
  } = useSpeechRecognition(setSourceText);

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

  const user = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const lastProcessedId = useRef<string | null>(null);

  useEffect(() => {
    if (state.audioData && audioRef.current) {
      audioRef.current.src = state.audioData;
    }

    const currentId = `${state.sourceText}-${state.translatedText}-${state.audioData}`;

    if (
      user &&
      firestore &&
      state.translatedText &&
      !state.translatedText.startsWith('Error:') &&
      state.sourceText &&
      currentId !== lastProcessedId.current
    ) {
      lastProcessedId.current = currentId;
      const translationsCol = collection(
        firestore,
        'users',
        user.uid,
        'translations'
      );

      addDoc(translationsCol, {
        sourceText: state.sourceText,
        translatedText: state.translatedText,
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
        date: serverTimestamp(),
        culturalContext: state.culturalContext || '',
        culturalInsights: state.culturalInsights || '',
      })
        .then(docRef => {
          setTranslationDocId(docRef.id);
        })
        .catch(error => {
          console.error('Error saving translation history:', error);
          toast({
            variant: 'destructive',
            title: 'Could not save to history',
            description: error.message,
          });
        });
    }
  }, [state, user, firestore, toast]);

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
        setSourceText(result.text);
        toast({
          title: 'Text Extracted!',
          description:
            'The text from the image has been placed in the text box.',
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

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleHelpfulClick = () => {
    toast({
      title: 'Feedback received!',
      description: 'Thank you for helping us improve.',
    });
  };

  const handleNotHelpfulClick = () => {
    setIsFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!user || !firestore || !translationDocId || !correctedText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Feedback',
        description: 'Please provide your improved translation.',
      });
      return;
    }

    const feedbackCol = collection(firestore, 'feedback');
    try {
      await addDoc(feedbackCol, {
        userId: user.uid,
        originalTranslationId: translationDocId,
        sourceText: state.sourceText,
        originalTranslatedText: state.translatedText,
        userCorrectedText: correctedText,
        timestamp: serverTimestamp(),
      });

      toast({
        title: 'Feedback submitted!',
        description: 'Thank you for helping our AI learn.',
      });
      setIsFeedbackDialogOpen(false);
      setCorrectedText('');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'Could not submit your feedback.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form action={dispatch}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="source-language">From</Label>
                <Select name="sourceLanguage" defaultValue="english">
                  <SelectTrigger id="source-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target-language">To</Label>
                <Select name="targetLanguage" defaultValue="spanish">
                  <SelectTrigger id="target-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text">Your Text</Label>
                <div className="flex items-center">
                  {isSpeechRecognitionAvailable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={toggleListening}
                      className={cn(
                        isListening && 'text-destructive animate-pulse'
                      )}
                    >
                      <Mic className="h-5 w-5" />
                      <span className="sr-only">
                        {isListening ? 'Stop listening' : 'Use microphone'}
                      </span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={openCamera}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="sr-only">Open camera</span>
                  </Button>
                </div>
              </div>
              <Textarea
                id="text"
                name="text"
                placeholder={
                  isListening
                    ? 'Listening...'
                    : 'Enter text to translate or use the camera...'
                }
                className="min-h-[150px]"
                required
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cultural-context">
                  Cultural Context (Optional)
                </Label>
                <Input
                  id="cultural-context"
                  name="culturalContext"
                  placeholder="e.g., 'A formal business meeting'"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="formality">Formality</Label>
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-sm text-muted-foreground">Casual</span>
                  <Slider
                    id="formality"
                    name="formality"
                    defaultValue={[2]}
                    min={1}
                    max={3}
                    step={1}
                  />
                  <span className="text-sm text-muted-foreground">Formal</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Translation</CardTitle>
                <CardDescription>
                  The translated text with cultural context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  readOnly
                  value={state.translatedText || ''}
                  placeholder="Translation will appear here..."
                  className="min-h-[150px] bg-secondary"
                />
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                {state.culturalInsights && (
                  <div className="w-full rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                      Cultural Insight
                    </p>
                    <p className="text-muted-foreground">
                      {state.culturalInsights}
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <SubmitButton
            size="lg"
            pendingContent={
              <>
                <LoaderCircle className="animate-spin" /> Translating...
              </>
            }
          >
            Translate <ArrowRight />
          </SubmitButton>
        </div>
      </form>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Voice & Lip Sync</CardTitle>
          <CardDescription>
            Visual representation of translated audio and lip movement.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center md:flex-row">
          {lipSyncAvatar && (
            <Image
              src={lipSyncAvatar.imageUrl}
              alt={lipSyncAvatar.description}
              data-ai-hint={lipSyncAvatar.imageHint}
              width={150}
              height={150}
              className="aspect-square rounded-full object-cover shadow-lg"
            />
          )}
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Waveform />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handlePlayAudio}
              disabled={!state.audioData}
            >
              {state.audioData ? (
                <Play className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
              <span className="sr-only">Play Translated Audio</span>
            </Button>
            <audio ref={audioRef} className="hidden" />
          </div>
        </CardContent>
      </Card>

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
                  Please allow camera access in your browser settings to use this feature. You can still upload an image from your gallery.
                </AlertDescription>
              </Alert>
            )}
            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-secondary">
              {capturedImage ? (
                <Image src={capturedImage} alt="Captured" layout="fill" objectFit="contain" />
              ) : cameraStream ? (
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Video className="h-12 w-12" />
                  <p>Camera feed will appear here</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={() => { setCapturedImage(null); openCamera(); }}>Retake</Button>
                <Button onClick={handleExtract} disabled={isExtracting}>
                  {isExtracting ? <LoaderCircle className="animate-spin" /> : 'Extract Text'}
                </Button>
              </>
            ) : cameraStream ? (
              <>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
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
      
      {state.translatedText && !state.translatedText.startsWith('Error:') && (
        <>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">
                Was this translation helpful?
              </CardTitle>
              <CardDescription>
                Your feedback is valuable in training our AI to be more
                accurate.
              </CardDescription>
            </CardHeader>
            <CardFooter className="gap-4">
              <Button onClick={handleHelpfulClick}>
                <ThumbsUp className="mr-2 h-4 w-4" /> Yes
              </Button>
              <Button variant="outline" onClick={handleNotHelpfulClick}>
                <ThumbsDown className="mr-2 h-4 w-4" /> No
              </Button>
            </CardFooter>
          </Card>

          <Dialog
            open={isFeedbackDialogOpen}
            onOpenChange={setIsFeedbackDialogOpen}
          >
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Teach our AI</DialogTitle>
                <DialogDescription>
                  Provide a better translation to help us improve. Your
                  corrections help train the model for everyone.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="source-text-feedback">Original Text</Label>
                  <p
                    id="source-text-feedback"
                    className="rounded-md border bg-muted p-3 text-sm text-muted-foreground"
                  >
                    {state.sourceText}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ai-translation-feedback">
                    AI Translation
                  </Label>
                  <p
                    id="ai-translation-feedback"
                    className="rounded-md border bg-muted p-3 text-sm text-muted-foreground"
                  >
                    {state.translatedText}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="corrected-translation">
                    Your improved translation
                  </Label>
                  <Textarea
                    id="corrected-translation"
                    value={correctedText}
                    onChange={e => setCorrectedText(e.target.value)}
                    placeholder="Enter the correct translation here..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitFeedback} type="submit">
                  Submit and Teach AI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

    