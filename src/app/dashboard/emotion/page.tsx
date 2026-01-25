'use client';

import { useActionState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';

import { handleEmotion } from '@/lib/actions';
import type { EmotionState } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubmitButton } from '@/components/submit-button';

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

export default function EmotionPage() {
  const initialState: EmotionState = { translatedText: '' };
  const [state, dispatch] = useActionState(handleEmotion, initialState);

  return (
    <div className="flex flex-col gap-8">
      <form action={dispatch}>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
              <CardDescription>
                Enter text and select a target language. The AI will preserve the emotion.
              </-cardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="text-input">Your Text</Label>
                <Textarea
                  id="text-input"
                  name="text"
                  placeholder="That's absolutely fantastic news!"
                  className="min-h-[150px]"
                  required
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="target-language">Target Language</Label>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Emotion-Preserved Translation</CardTitle>
              <CardDescription>
                The translated text, carrying the same emotional weight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={state.translatedText || ''}
                placeholder="Emotion-aware translation will appear here..."
                className="min-h-[150px] bg-secondary"
              />
            </CardContent>
          </Card>
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
            Translate with Emotion <ArrowRight />
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
