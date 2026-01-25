'use server';

import type {
  TranslationState,
  InsightState,
  EmotionState,
} from './definitions';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { summarizeCulturalInsights } from '@/ai/flows/summarize-cultural-insights';
import { detectAndPreserveEmotion } from '@/ai/flows/detect-and-preserve-emotion';

export async function handleTranslation(
  prevState: TranslationState,
  formData: FormData
): Promise<TranslationState> {
  const text = formData.get('text') as string;
  const sourceLanguage = formData.get('sourceLanguage') as string;
  const targetLanguage = formData.get('targetLanguage') as string;
  const culturalContext = formData.get('culturalContext') as string | undefined;

  try {
    const result = await realTimeTranslationWithContext({
      text,
      sourceLanguage,
      targetLanguage,
      culturalContext,
    });
    return {
      translatedText: result.translatedText,
      culturalInsights: result.culturalInsights,
    };
  } catch (error) {
    console.error(error);
    return {
      translatedText: 'Error: Could not translate text.',
      culturalInsights: '',
    };
  }
}

export async function handleInsight(
  prevState: InsightState,
  formData: FormData
): Promise<InsightState> {
  const conversationText = formData.get('conversationText') as string;

  try {
    const result = await summarizeCulturalInsights({ conversationText });
    return {
      culturalSummary: result.culturalSummary,
    };
  } catch (error) {
    console.error(error);
    return {
      culturalSummary: 'Error: Could not analyze conversation.',
    };
  }
}

export async function handleEmotion(
  prevState: EmotionState,
  formData: FormData
): Promise<EmotionState> {
  const text = formData.get('text') as string;
  const targetLanguage = formData.get('targetLanguage') as string;

  try {
    const result = await detectAndPreserveEmotion({ text, targetLanguage });
    return {
      translatedText: result.translatedText,
    };
  } catch (error) {
    console.error(error);
    return {
      translatedText: 'Error: Could not translate text.',
    };
  }
}
