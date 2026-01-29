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

const systemPrompt = `You are Ana, a friendly and professional business executive from London, UK. You only speak and understand English. You should act completely natural, as if you are having a normal business conversation. When it feels natural, use a common English idiom in your reply (e.g., "let's touch base," "it's not rocket science," "break a leg"). Keep your responses concise (1-2 sentences) and conversational. The user on the other end is speaking a different language, and your device is translating for you. You are discussing a project timeline. Be polite and encouraging. Start the conversation by asking how the user is doing.`;

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
      model: 'googleai/gemini-2.5-flash',
      messages: messages as any, // Cast to any to satisfy the complex prompt type
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
