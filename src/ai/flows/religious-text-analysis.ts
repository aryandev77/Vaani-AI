'use server';
/**
 * @fileOverview Analyzes and explains religious texts.
 *
 * - analyzeReligiousText - Translates and provides commentary on a religious text.
 * - AnalyzeReligiousTextInput - The input type for the function.
 * - AnalyzeReligiousTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeReligiousTextInputSchema = z.object({
  text: z.string().describe('The passage from the religious text to analyze.'),
  sourceLanguage: z.string().describe('The original language of the text.'),
  targetLanguage: z
    .string()
    .describe('The language for the translation and explanation.'),
  religiousContext: z
    .string()
    .describe(
      'The specific religion or text (e.g., Hinduism, Bhagavad Gita, Christianity, Bible).'
    ),
});
export type AnalyzeReligiousTextInput = z.infer<
  typeof AnalyzeReligiousTextInputSchema
>;

const AnalyzeReligiousTextOutputSchema = z.object({
  translation: z.string().describe('A faithful translation of the passage.'),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of the passage, including historical context, philosophical meaning, and interpretation of key terms. This should be presented as a scholarly but accessible commentary.'
    ),
});
export type AnalyzeReligiousTextOutput = z.infer<
  typeof AnalyzeReligiousTextOutputSchema
>;

export async function analyzeReligiousText(
  input: AnalyzeReligiousTextInput
): Promise<AnalyzeReligiousTextOutput> {
  return religiousTextAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'religiousTextAnalysisPrompt',
  input: {schema: AnalyzeReligiousTextInputSchema},
  output: {schema: AnalyzeReligiousTextOutputSchema},
  prompt: `You are a world-class expert in theology, comparative religion, and linguistics. Your task is to analyze a passage from a religious text.

Context:
- Religion/Text: {{{religiousContext}}}
- Source Language: {{{sourceLanguage}}}
- Target Language for explanation: {{{targetLanguage}}}
- Passage to analyze:
{{{text}}}

Your task is to:
1.  Provide a faithful and accurate translation of the passage into the target language.
2.  Provide a detailed, scholarly, yet accessible explanation of the passage. This explanation should cover:
    - The literal meaning of the words and phrases.
    - The deeper philosophical and spiritual meaning.
    - The historical and cultural context in which it was written.
    - Explanations of any key terms, characters, or concepts mentioned.
    - How this passage relates to the broader themes of the text.

Present the output clearly, with the translation first, followed by the detailed explanation. Use markdown for formatting to improve readability.
`,
});

const religiousTextAnalysisFlow = ai.defineFlow(
  {
    name: 'religiousTextAnalysisFlow',
    inputSchema: AnalyzeReligiousTextInputSchema,
    outputSchema: AnalyzeReligiousTextOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
