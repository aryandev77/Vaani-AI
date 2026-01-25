'use client';

import { useActionState } from 'react';
import { BookOpen, LoaderCircle } from 'lucide-react';

import { handleInsight } from '@/lib/actions';
import type { InsightState } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';

export default function LearningPage() {
  const initialState: InsightState = { culturalSummary: '' };
  const [state, dispatch] = useActionState(handleInsight, initialState);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">Learning Mode</h1>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <form action={dispatch} className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Conversation</CardTitle>
              <CardDescription>
                Paste a conversation to get cultural insights and explanations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full gap-2">
                <Label htmlFor="conversation-text">Conversation Text</Label>
                <Textarea
                  id="conversation-text"
                  name="conversationText"
                  placeholder="Enter or paste conversation here..."
                  className="min-h-[250px]"
                  required
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-start">
            <SubmitButton
              size="lg"
              pendingContent={
                <>
                  <LoaderCircle className="animate-spin" /> Analyzing...
                </>
              }
            >
              Get Insights <BookOpen />
            </SubmitButton>
          </div>
        </form>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Cultural Summary</CardTitle>
            <CardDescription>
              AI-powered insights to help you understand cultural nuances.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full min-h-[250px] rounded-md border bg-secondary p-4">
              {state.culturalSummary ? (
                <p className="whitespace-pre-wrap">{state.culturalSummary}</p>
              ) : (
                <p className="text-muted-foreground">
                  Your cultural summary will appear here...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
