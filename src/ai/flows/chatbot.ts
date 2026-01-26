'use server';
/**
 * @fileOverview A conversational AI agent for language learning.
 *
 * - chatWithBot - A function that handles the conversation with the chatbot.
 * - ChatWithBotInput - The input type for the chatWithBot function.
 * - ChatWithBotOutput - The return type for the chatWithBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ChatHistoryItem } from '@/lib/definitions';

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({ text: z.string() })),
});

const ChatWithBotInputSchema = z.object({
  query: z.string().describe("The user's question or message to the chatbot."),
  history: z
    .array(ChatHistoryItemSchema)
    .optional()
    .describe('The conversation history.'),
});
export type ChatWithBotInput = z.infer<typeof ChatWithBotInputSchema>;

const ChatWithBotOutputSchema = z.object({
  response: z.string().describe("The chatbot's response."),
});
export type ChatWithBotOutput = z.infer<typeof ChatWithBotOutputSchema>;

export async function chatWithBot(
  input: ChatWithBotInput
): Promise<ChatWithBotOutput> {
  return chatBotFlow(input);
}

const systemPrompt = `You are Vaani, a friendly and expert AI language tutor. Your role is to help users understand translations, idioms, cultural nuances, and any other language-related questions they have.

- Be encouraging and supportive.
- Provide clear and concise explanations.
- If you don't know an answer, say so honestly.
- Keep your responses focused on language and culture.
- Use markdown for formatting when it improves readability (e.g., lists, bolding).`;

const chatBotFlow = ai.defineFlow(
  {
    name: 'chatBotFlow',
    inputSchema: ChatWithBotInputSchema,
    outputSchema: ChatWithBotOutputSchema,
  },
  async ({ query, history }) => {
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
      prompt: messages as any, // Cast to any to satisfy the complex prompt type
    });

    return {
      response: response.text,
    };
  }
);
