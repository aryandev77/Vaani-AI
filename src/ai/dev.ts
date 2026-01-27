'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-cultural-insights.ts';
import '@/ai/flows/detect-and-preserve-emotion.ts';
import '@/ai/flows/real-time-translation-with-context.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/chatbot.ts';
import '@/ai/flows/scripture-tutor.ts';
import '@/ai/flows/image-to-text.ts';
