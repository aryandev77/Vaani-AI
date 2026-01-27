'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  realTimeTranslationWithContext,
} from '@/ai/flows/real-time-translation-with-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Play } from 'lucide-react';
import { Logo } from '@/components/logo';
import { FullScreenLoader } from '@/components/full-screen-loader';

const languages = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'hindi', label: 'Hindi' },
];

function ShareTargetComponent() {
  const searchParams = useSearchParams();
  const sharedText = searchParams.get('text') || '';

  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('english');
  const [translation, setTranslation] = useState<{
    translatedText?: string;
    culturalInsights?: string;
  } | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function getTranslation() {
      if (!sharedText) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setTranslation(null);
      setAudioData(null);
      try {
        const result = await realTimeTranslationWithContext({
          text: sharedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        });
        setTranslation(result);

        if (result.translatedText) {
          const ttsResult = await textToSpeech(result.translatedText);
          setAudioData(ttsResult.audioData);
        }
      } catch (e) {
        console.error(e);
        setTranslation({ translatedText: 'Error: Could not translate.' });
      } finally {
        setIsLoading(false);
      }
    }
    getTranslation();
  }, [sharedText, sourceLang, targetLang]);

  useEffect(() => {
    if (audioData && audioRef.current) {
        audioRef.current.src = audioData;
    }
  }, [audioData]);

  const handlePlay = () => {
    if (audioRef.current && audioRef.current.src) {
        setIsPlaying(true);
        audioRef.current.play().catch(() => setIsPlaying(false));
        audioRef.current.onended = () => setIsPlaying(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Translate with Vaani
            <Logo className="scale-75" />
          </CardTitle>
          <CardDescription>
            Shared from another application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Original Text</Label>
            <p className="max-h-24 overflow-y-auto rounded-md border bg-muted p-3 text-sm text-muted-foreground">
              {sharedText || 'No text was shared.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source-language">From</Label>
              <Select
                name="sourceLanguage"
                value={sourceLang}
                onValueChange={setSourceLang}
              >
                <SelectTrigger id="source-language">
                  <SelectValue />
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
              <Select
                name="targetLanguage"
                value={targetLang}
                onValueChange={setTargetLang}
              >
                <SelectTrigger id="target-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages
                    .filter(l => l.value !== 'auto')
                    .map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Translation</Label>
            {isLoading ? (
              <div className="flex min-h-[100px] items-center justify-center rounded-md border bg-secondary">
                <LoaderCircle className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Textarea
                  readOnly
                  value={translation?.translatedText || ''}
                  placeholder="Translation will appear here..."
                  className="min-h-[100px]"
                />
                {translation?.culturalInsights && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900/50 dark:bg-yellow-900/20">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                      Cultural Insight
                    </p>
                    <p className="text-muted-foreground">
                      {translation.culturalInsights}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
            <Button onClick={handlePlay} disabled={!audioData || isLoading || isPlaying} variant="outline" size="icon">
                {isPlaying ? <LoaderCircle className="animate-spin" /> : <Play />}
            </Button>
            <audio ref={audioRef} className="hidden" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ShareTargetPage() {
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <ShareTargetComponent />
        </Suspense>
    )
}
