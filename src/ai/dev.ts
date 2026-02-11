'use server';

import { headers } from 'next/headers';
import type {
  TranslationState,
  InsightState,
  EmotionState,
  ChatState,
  ChatHistoryItem,
  ScriptureChatState,
  PlayAudioState,
} from './definitions';

async function callFlow<T>(flowName: string, input: any): Promise<T> {
  const headersList = headers();
  // In a server component, we can get the host from the headers.
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const url = `${baseUrl}/api/genkit/${flowName}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error calling flow ${flowName}: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error(`API call to ${flowName} failed.`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Exception calling flow ${flowName}:`, error);
    throw error;
  }
}

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

  const translationInput = {
    text,
    sourceLanguage,
    targetLanguage,
    culturalContext,
    formality,
  };

  try {
    const translationResult = await callFlow<any>(
      'realTimeTranslationWithContextFlow',
      translationInput
    );

    let audioData = '';
    if (translationResult.translatedText) {
      const ttsResult = await callFlow<any>(
        'textToSpeechFlow',
        translationResult.translatedText
      );
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
    const result = await callFlow<any>('summarizeCulturalInsightsFlow', {
      conversationText,
    });
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
      ...prevState,
      translatedText: 'Error: Missing text or target language.',
    };
  }

  try {
    const result = await callFlow<any>('detectAndPreserveEmotionFlow', {
      text,
      targetLanguage,
    });
    return {
      translatedText: result.translatedText,
      detectedEmotion: result.detectedEmotion,
    };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
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
    const result = await callFlow<any>('chatBotFlow', {
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
    const result = await callFlow<any>('scriptureTutorFlow', {
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
    const result = await callFlow<any>('imageToTextFlow', { imageDataUri });
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

export async function checkCulturalFauxPas(
  text: string
): Promise<{ message?: string; suggestion?: string } | null> {
  if (!text || text.trim().length < 15) {
    return null;
  }

  try {
    const result = await callFlow<any>('culturalFauxPasAlertFlow', { text });
    if (result.isFauxPas) {
      return { message: result.message, suggestion: result.suggestion };
    }
    return null;
  } catch (error) {
    console.error('Faux-pas check failed:', error);
    // Silently fail for the user on this passive check
    return null;
  }
}

export async function handlePlayMemoAudio(
  prevState: PlayAudioState,
  formData: FormData
): Promise<PlayAudioState> {
  const text = formData.get('textToPlay') as string;
  const memoId = formData.get('memoId') as string;

  if (!text) {
    return { error: 'No text provided.', memoId };
  }

  try {
    const ttsResult = await callFlow<any>('textToSpeechFlow', text);
    return { audioData: ttsResult.audioData, memoId };
  } catch (error) {
    console.error('TTS Error in action', error);
    return { error: 'Could not generate audio.', memoId };
  }
}