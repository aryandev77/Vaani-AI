'use server';

/**
 * @fileOverview Summarizes cultural insights from a conversation.
 *
 * - summarizeCulturalInsights - A function that takes conversation text and returns a summary of cultural insights.
 * - SummarizeCulturalInsightsInput - The input type for the summarizeCulturalInsights function.
 * - SummarizeCulturalInsightsOutput - The return type for the summarizeCulturalInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCulturalInsightsInputSchema = z.object({
  conversationText: z
    .string()
    .describe('The complete text of the conversation to analyze.'),
});

export type SummarizeCulturalInsightsInput = z.infer<
  typeof SummarizeCulturalInsightsInputSchema
>;

const SummarizeCulturalInsightsOutputSchema = z.object({
  culturalSummary: z
    .string()
    .describe(
      'A summary of the cultural insights gleaned from the conversation.'
    ),
});

export type SummarizeCulturalInsightsOutput = z.infer<
  typeof SummarizeCulturalInsightsOutputSchema
>;

export async function summarizeCulturalInsights(
  input: SummarizeCulturalInsightsInput
): Promise<SummarizeCulturalInsightsOutput> {
  return summarizeCulturalInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCulturalInsightsPrompt',
  input: {schema: SummarizeCulturalInsightsInputSchema},
  output: {schema: SummarizeCulturalInsightsOutputSchema},
  prompt: `You are an AI assistant designed to provide cultural insights from conversations.
  Analyze the following conversation text and provide a summary of the cultural nuances,
  idioms, or understandings that are present. Focus on providing explanations and context
  that would help someone unfamiliar with the culture to understand the conversation better.
  \nConversation Text: {{{conversationText}}}`,
});

const summarizeCulturalInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeCulturalInsightsFlow',
    inputSchema: SummarizeCulturalInsightsInputSchema,
    outputSchema: SummarizeCulturalInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
