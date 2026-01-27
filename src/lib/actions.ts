
'use server';

import type {
  TranslationState,
  InsightState,
  EmotionState,
  ChatState,
  ChatHistoryItem,
  ScriptureChatState,
} from './definitions';
import { realTimeTranslationWithContext } from '@/ai/flows/real-time-translation-with-context';
import { summarizeCulturalInsights } from '@/ai/flows/summarize-cultural-insights';
import { detectAndPreserveEmotion } from '@/ai/flows/detect-and-preserve-emotion';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { chatWithBot } from '@/ai/flows/chatbot';
import { scriptureTutor } from '@/ai/flows/scripture-tutor';
import { imageToText } from '@/ai/flows/image-to-text';

export async function handleTranslation(
  prevState: TranslationState,
  formData: FormData
): Promise<TranslationState> {
  const text = formData.get('text') as string;
  const sourceLanguage = formData.get('sourceLanguage') as string;
  const targetLanguage = formData.get('targetLanguage') as string;
  const culturalContext = formData.get('culturalContext') as string | undefined;
  const formalityValue = formData.get('formality') as string;

  let formality: 'Casual' | 'Formal' | undefined;
  if (formalityValue === '1') formality = 'Casual';
  if (formalityValue === '3') formality = 'Formal';

  try {
    const translationResult = await realTimeTranslationWithContext({
      text,
      sourceLanguage,
      targetLanguage,
      culturalContext,
      formality,
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
      formality: formality,
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

  if (!text || !targetLanguage) {
    return {
      translatedText: 'Error: Missing text or target language.',
    };
  }

  try {
    const result = await detectAndPreserveEmotion({ text, targetLanguage });
    return {
      translatedText: result.translatedText,
    };
  } catch (error) {
    console.error(error);
    return {
      translatedText: 'Error: Could not perform emotion-aware translation.',
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

export async function handleScriptureChat(
  prevState: ScriptureChatState,
  formData: FormData
): Promise<ScriptureChatState> {
  const query = formData.get('query') as string;
  const scriptureContext = formData.get('scriptureContext') as string;

  if (!query?.trim()) {
    return prevState;
  }

  const userMessage: ChatHistoryItem = {
    role: 'user',
    content: [{ text: query }],
  };

  const currentHistory = [...prevState.history, userMessage];

  try {
    const result = await scriptureTutor({
      query,
      history: prevState.history,
      scriptureContext,
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
    const errorMessage =
      'Error: I had a problem responding. Please try again.';
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

export async function extractTextFromImage(
  imageDataUri: string
): Promise<{ text: string; error?: string }> {
  if (!imageDataUri) {
    return { text: '', error: 'No image provided.' };
  }

  try {
    const result = await imageToText({ imageDataUri });
    return { text: result.text };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return {
      text: '',
      error:
        'Failed to extract text from the image. The image might be unclear or contain no text. Please try again.',
    };
  }
}
