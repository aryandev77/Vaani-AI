'use server';
/**
 * @fileOverview Extracts text from an image using a vision model.
 *
 * - imageToText - A function that takes an image data URI and returns the extracted text.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageToTextInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The text extracted from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export async function imageToText(
  input: ImageToTextInput
): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async ({ imageDataUri }) => {
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {
          text: 'You are an expert at optical character recognition (OCR). Extract all text from the following image. Only return the text content, without any additional comments or explanations.',
        },
        { media: { url: imageDataUri } },
      ],
    });

    return {
      text: result.text,
    };
  }
);
