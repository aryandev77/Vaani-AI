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
  prompt: `You are an expert translator specializing in real-time translation, taking into account cultural context.\n\nYou will translate the given text from the source language to the target language, considering the provided cultural context to ensure accurate and culturally appropriate translation.\n\nSource Language: {{{sourceLanguage}}}\nTarget Language: {{{targetLanguage}}}\nText to Translate: {{{text}}}\nCultural Context: {{{culturalContext}}}\n\nTranslation:`,
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
