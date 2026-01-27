'use server';
/**
 * @fileOverview A real-time translation AI agent that takes into account cultural context.
 *
 * - realTimeTranslationWithContext - A function that handles the real-time translation process with cultural context.
 * - RealTimeTranslationWithContextInput - The input type for the realTimeTranslationWithContext function.
 * - RealTimeTranslationWithContextOutput - The return type for the realTimeTranslationWithContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeTranslationWithContextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  sourceLanguage: z.string().describe('The language of the text to translate.'),
  targetLanguage: z.string().describe('The language to translate the text into.'),
  culturalContext: z.string().optional().describe('The cultural context of the conversation.'),
  formality: z.enum(['Casual', 'Formal']).optional().describe('The desired formality of the translation.'),
});
export type RealTimeTranslationWithContextInput = z.infer<typeof RealTimeTranslationWithContextInputSchema>;

const RealTimeTranslationWithContextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text, taking into account cultural context.'),
  culturalInsights: z.string().optional().describe('Cultural insights related to the translation.'),
});
export type RealTimeTranslationWithContextOutput = z.infer<typeof RealTimeTranslationWithContextOutputSchema>;

export async function realTimeTranslationWithContext(
  input: RealTimeTranslationWithContextInput
): Promise<RealTimeTranslationWithContextOutput> {
  return realTimeTranslationWithContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeTranslationWithContextPrompt',
  input: {schema: RealTimeTranslationWithContextInputSchema},
  output: {schema: RealTimeTranslationWithContextOutputSchema},
  prompt: `You are an expert translator specializing in real-time translation. Your goal is to provide accurate and culturally appropriate translations.

You will translate the given text from the source language to the target language.

{{#if formality}}
The user has requested a '{{formality}}' tone. Adjust your translation to match this level of formality.
{{/if}}
{{#if culturalContext}}
Also consider the following cultural context provided by the user: {{{culturalContext}}}
{{/if}}

Source Language: {{{sourceLanguage}}}
Target Language: {{{targetLanguage}}}
Text to Translate: {{{text}}}

Translation:`,
});

const realTimeTranslationWithContextFlow = ai.defineFlow(
  {
    name: 'realTimeTranslationWithContextFlow',
    inputSchema: RealTimeTranslationWithContextInputSchema,
    outputSchema: RealTimeTranslationWithContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
