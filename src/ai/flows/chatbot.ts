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

const systemPrompt = `You are Vaani, a friendly and helpful AI assistant. Your primary role is to help users with their questions, which may include topics like translations, idioms, and cultural nuances, but you can also answer general questions on a wide variety of subjects, including mathematics.

- **Language Flexibility:** You are multilingual and can understand and respond in mixed languages, including Hinglish (a mix of Hindi and English). Feel free to respond in the language the user is most comfortable with.
- **For math and logic questions:** Approach them step-by-step. If a question is abstract or nonsensical (like 'the LCM of a root and the square of Pi'), explain why it's not a standard mathematical problem and try to provide a helpful, educational answer about the concepts involved. Do not attempt to calculate an answer for an impossible question.
- **General Tone:** Be encouraging and supportive. Provide clear and concise explanations. If you don't know an answer, say so honestly.
- **Formatting:** Use markdown for formatting when it improves readability (e.g., lists for steps, **bolding** for key terms, \`code\` for mathematical expressions).`;

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
