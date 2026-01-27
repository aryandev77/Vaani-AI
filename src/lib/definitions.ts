export type TranslationState = {
  translatedText: string;
  culturalInsights?: string;
  audioData?: string;
  sourceText?: string;
  sourceLang?: string;
  targetLang?: string;
  culturalContext?: string;
  formality?: 'Casual' | 'Formal';
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
};

export type ChatHistoryItem = {
  role: 'user' | 'model';
  content: { text: string }[];
};

export type ChatState = {
  history: ChatHistoryItem[];
  error?: string;
};

export type ScriptureChatState = {
  history: ChatHistoryItem[];
  error?: string;
};
