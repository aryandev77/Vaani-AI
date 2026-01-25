export type TranslationState = {
  translatedText: string;
  culturalInsights?: string;
  audioData?: string;
};

export type InsightState = {
  culturalSummary: string;
};

export type EmotionState = {
  translatedText: string;
};

export type Conversation = {
    id: number;
    sourceText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    date: string;
}
