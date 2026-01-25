import type { Conversation } from './definitions';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    sourceText: 'Hello, how are you?',
    translatedText: 'Hola, ¿cómo estás?',
    sourceLang: 'EN',
    targetLang: 'ES',
    date: '2024-05-20',
  },
  {
    id: 2,
    sourceText: 'This is a great tool!',
    translatedText: '¡Esta es una gran herramienta!',
    sourceLang: 'EN',
    targetLang: 'ES',
    date: '2024-05-20',
  },
  {
    id: 3,
    sourceText: "Where is the library?",
    translatedText: "Où se trouve la bibliothèque ?",
    sourceLang: 'EN',
    targetLang: 'FR',
    date: '2024-05-19',
  },
  {
    id: 4,
    sourceText: "I'd like to book a table for two.",
    translatedText: "Ich möchte einen Tisch für zwei Personen reservieren.",
    sourceLang: 'EN',
    targetLang: 'DE',
    date: '2024-05-19',
  },
    {
    id: 5,
    sourceText: "Thank you very much.",
    translatedText: "ありがとうございます。",
    sourceLang: 'EN',
    targetLang: 'JP',
    date: '2024-05-18',
  },
];
