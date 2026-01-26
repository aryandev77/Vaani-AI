'use server';

import type {
  TranslationState,
  InsightState,
  EmotionState,
  ChatState,
  ChatHistoryItem,
  ReligiousTextAnalysisState,
} from './definitions';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { summarizeCulturalInsights } from '@/ai/flows/summarize-cultural-insights';
import { detectAndPreserveEmotion } from '@/ai/flows/detect-and-preserve-emotion';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { chatWithBot } from '@/ai/flows/chatbot';
import { analyzeReligiousText } from '@/ai/flows/religious-text-analysis';

export async function handleTranslation(
  prevState: TranslationState,
  formData: FormData
): Promise<TranslationState> {
  const text = formData.get('text') as string;
  const sourceLanguage = formData.get('sourceLanguage') as string;
  const targetLanguage = formData.get('targetLanguage') as string;
  const culturalContext = formData.get('culturalContext') as string | undefined;

  try {
    const translationResult = await realTimeTranslationWithContext({
      text,
      sourceLanguage,
      targetLanguage,
      culturalContext,
    });

    let audioData = '';
    if (translationResult.translatedText) {
      const ttsResult = await textToSpeech(translationResult.translatedText);
      audioData = ttsResult.audioData;
    }

    return {
      translatedText: translationResult.translatedText,
      culturalInsights: translationResult.culturalInsights,
      audioData: audioData,
      sourceText: text,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage,
      culturalContext: culturalContext,
    };
  } catch (error) {
    console.error(error);
    return {
      translatedText: 'Error: Could not translate text.',
      culturalInsights: '',
      audioData: '',
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

export async function handleChat(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const query = formData.get('query') as string;

  if (!query?.trim()) {
    return {
      ...prevState,
    };
  }

  const userMessage: ChatHistoryItem = {
    role: 'user',
    content: [{ text: query }],
  };

  const currentHistory = [...prevState.history, userMessage];

  try {
    const result = await chatWithBot({
      query,
      history: prevState.history, // send previous history for context
    });

    const modelMessage: ChatHistoryItem = {
      role: 'model',
      content: [{ text: result.response }],
    };

    return {
      history: [...currentHistory, modelMessage],
    };
  } catch (error) {
    console.error(error);
    const errorMessage = 'Error: I had a problem responding. Please try again.';
    const modelMessage: ChatHistoryItem = {
      role: 'model',
      content: [{ text: errorMessage }],
    };
    return {
      history: [...currentHistory, modelMessage],
      error: errorMessage,
    };
  }
}

export async function handleReligiousText(
  prevState: ReligiousTextAnalysisState,
  formData: FormData
): Promise<ReligiousTextAnalysisState> {
  const text = formData.get('text') as string;
  const sourceLanguage = formData.get('sourceLanguage') as string;
  const targetLanguage = formData.get('targetLanguage') as string;
  const religiousContext = formData.get('religiousContext') as string;

  try {
    const result = await analyzeReligiousText({
      text,
      sourceLanguage,
      targetLanguage,
      religiousContext,
    });

    const combinedOutput = `## Translation\n\n${result.translation}\n\n<hr class="my-4">\n\n## Explanation\n\n${result.explanation}`;

    return {
      translationAndExplanation: combinedOutput,
    };
  } catch (error) {
    console.error(error);
    return {
      error: 'Error: Could not analyze the text.',
    };
  }
}
