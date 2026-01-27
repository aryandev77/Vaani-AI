'use server';
/**
 * @fileOverview A real-time cultural faux-pas detection AI agent.
 *
 * - checkForFauxPas - A function that analyzes text for potential cultural missteps.
 * - FauxPasAlertInput - The input type for the checkForFauxPas function.
 * - FauxPasAlertOutput - The return type for the checkForFauxPas function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FauxPasAlertInputSchema = z.object({
  text: z.string().describe('The text to analyze for cultural faux-pas.'),
});
export type FauxPasAlertInput = z.infer<typeof FauxPasAlertInputSchema>;

const FauxPasAlertOutputSchema = z.object({
  isFauxPas: z
    .boolean()
    .describe('Whether a potential faux-pas was detected.'),
  message: z
    .string()
    .optional()
    .describe('The warning message to show the user.'),
  suggestion: z
    .string()
    .optional()
    .describe('A suggested alternative phrasing.'),
});
export type FauxPasAlertOutput = z.infer<typeof FauxPasAlertOutputSchema>;

export async function checkForFauxPas(
  input: FauxPasAlertInput
): Promise<FauxPasAlertOutput> {
  return culturalFauxPasAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'culturalFauxPasPrompt',
  input: { schema: FauxPasAlertInputSchema },
  output: { schema: FauxPasAlertOutputSchema },
  prompt: `You are an AI expert in cross-cultural communication. Your task is to analyze user input in real-time and proactively warn them if their text might be a cultural faux-pas or be perceived as offensive in some cultures.

  Analyze the following text: "{{{text}}}"

  - If the text is likely to be misinterpreted or cause offense in common cultural contexts (e.g., commenting on weight, being overly direct, using potentially misunderstood slang), set 'isFauxPas' to true.
  - Provide a brief, non-judgmental 'message' explaining the potential issue (e.g., "This phrase can be sensitive in many cultures.").
  - Offer a safer 'suggestion' (e.g., "Consider using 'You look great!'").
  - If the text is harmless and unlikely to cause offense, set 'isFauxPas' to false and leave 'message' and 'suggestion' empty.
  - Be very sensitive and only flag clear cases. For example, "I am fat" is a self-description and not a faux-pas. "You look fat" is a potential faux-pas. Only return a faux-pas if you are highly confident.
  `,
});

const culturalFauxPasAlertFlow = ai.defineFlow(
  {
    name: 'culturalFauxPasAlertFlow',
    inputSchema: FauxPasAlertInputSchema,
    outputSchema: FauxPasAlertOutputSchema,
  },
  async (input) => {
    // Basic check to avoid running on very short or empty strings
    if (!input.text || input.text.trim().length < 10) {
      return { isFauxPas: false };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
