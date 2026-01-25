'use server';

/**
 * @fileOverview Detects the emotion and tone from the input text and preserves it in the translated text.
 *
 * - detectAndPreserveEmotion - A function that handles the emotion detection and preservation process.
 * - DetectAndPreserveEmotionInput - The input type for the detectAndPreserveEmotion function.
 * - DetectAndPreserveEmotionOutput - The return type for the detectAndPreserveEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAndPreserveEmotionInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});
export type DetectAndPreserveEmotionInput = z.infer<typeof DetectAndPreserveEmotionInputSchema>;

const DetectAndPreserveEmotionOutputSchema = z.object({
  translatedText: z.string().describe('The translated text with preserved emotion and tone.'),
});
export type DetectAndPreserveEmotionOutput = z.infer<typeof DetectAndPreserveEmotionOutputSchema>;

export async function detectAndPreserveEmotion(
  input: DetectAndPreserveEmotionInput
): Promise<DetectAndPreserveEmotionOutput> {
  return detectAndPreserveEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAndPreserveEmotionPrompt',
  input: {schema: DetectAndPreserveEmotionInputSchema},
  output: {schema: DetectAndPreserveEmotionOutputSchema},
  prompt: `You are an AI expert in detecting and preserving emotions in text translations.

  Analyze the input text for its underlying emotion and tone. Translate the text into the target language while ensuring that the translated text conveys the same emotion and tone as the original text.

  Input Text: {{{text}}}
  Target Language: {{{targetLanguage}}}

  Translated Text:`, // The output schema description for translatedText should guide the model.
});

const detectAndPreserveEmotionFlow = ai.defineFlow(
  {
    name: 'detectAndPreserveEmotionFlow',
    inputSchema: DetectAndPreserveEmotionInputSchema,
    outputSchema: DetectAndPreserveEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
