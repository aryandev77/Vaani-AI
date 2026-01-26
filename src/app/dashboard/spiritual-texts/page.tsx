'use client';

import { useActionState } from 'react';
import { BookMarked, LoaderCircle } from 'lucide-react';
import { handleReligiousText } from '@/lib/actions';
import type { ReligiousTextAnalysisState } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const languages = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'greek', label: 'Greek' },
];

export default function SpiritualTextsPage() {
  const initialState: ReligiousTextAnalysisState = {
    translationAndExplanation: '',
    error: '',
  };
  const [state, dispatch] = useActionState(handleReligiousText, initialState);

  return (
    <div className="flex flex-col gap-8">
      <form action={dispatch}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Text Analysis</CardTitle>
                <CardDescription>
                  Enter a passage from a religious text to receive a translation
                  and detailed explanation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="text-input">Text/Passage</Label>
                  <Textarea
                    id="text-input"
                    name="text"
                    placeholder="Paste the passage you want to understand..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="religious-context">
                    Religion / Text Name
                  </Label>
                  <Input
                    id="religious-context"
                    name="religiousContext"
                    placeholder="e.g., Hinduism, Bhagavad Gita, Christianity, Bible"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source-language">Original Language</Label>
                    <Select name="sourceLanguage" defaultValue="sanskrit">
                      <SelectTrigger id="source-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target-language">
                      Translate & Explain In
                    </Label>
                    <Select name="targetLanguage" defaultValue="english">
                      <SelectTrigger id="target-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-6 flex justify-start">
              <SubmitButton
                size="lg"
                pendingContent={
                  <>
                    <LoaderCircle className="animate-spin" /> Analyzing...
                  </>
                }
              >
                Analyze Text <BookMarked />
              </SubmitButton>
            </div>
          </div>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Translation & Commentary</CardTitle>
              <CardDescription>
                AI-generated translation and explanation of the passage.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full min-h-[350px] overflow-auto rounded-md border bg-secondary p-4">
                {state.error && (
                  <Alert variant="destructive">
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}
                {state.translationAndExplanation ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: state.translationAndExplanation,
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    Your analysis will appear here...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
