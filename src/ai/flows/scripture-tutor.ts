'use server';
/**
 * @fileOverview A conversational AI agent for analyzing religious texts.
 *
 * - scriptureTutor - A function that handles the conversation with the scripture tutor.
 * - ScriptureTutorInput - The input type for the scriptureTutor function.
 * - ScriptureTutorOutput - The return type for the scriptureTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ChatHistoryItem } from '@/lib/definitions';

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({ text: z.string() })),
});

const ScriptureTutorInputSchema = z.object({
  query: z.string().describe("The user's question or message to the chatbot."),
  history: z
    .array(ChatHistoryItemSchema)
    .optional()
    .describe('The conversation history.'),
  scriptureContext: z
    .string()
    .describe('The full text of the scripture the user is reading.'),
});
export type ScriptureTutorInput = z.infer<typeof ScriptureTutorInputSchema>;

const ScriptureTutorOutputSchema = z.object({
  response: z.string().describe("The chatbot's response."),
});
export type ScriptureTutorOutput = z.infer<typeof ScriptureTutorOutputSchema>;

export async function scriptureTutor(
  input: ScriptureTutorInput
): Promise<ScriptureTutorOutput> {
  return scriptureTutorFlow(input);
}

const scriptureTutorFlow = ai.defineFlow(
  {
    name: 'scriptureTutorFlow',
    inputSchema: ScriptureTutorInputSchema,
    outputSchema: ScriptureTutorOutputSchema,
  },
  async ({ query, history, scriptureContext }) => {
    const systemPrompt = `You are a world-class expert in theology, comparative religion, and linguistics. You are assisting a user who is reading a religious text. Your task is to answer their questions about the text, providing translation, commentary, historical context, and philosophical meaning.

The user is currently reading the following text:
---
${scriptureContext}
---

Be helpful, scholarly, and accessible. Use markdown for formatting to improve readability.`;

    const messages: (
      | ChatHistoryItem
      | { role: 'system'; content: { text: string }[] }
    )[] = [
      {
        role: 'system',
        content: [{ text: systemPrompt }],
      },
    ];

    if (history) {
      messages.push(...history);
    }
    messages.push({
      role: 'user',
      content: [{ text: query }],
    });

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      messages: messages as any,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      },
    });

    return {
      response: response.text,
    };
  }
);
