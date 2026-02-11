
import { withGenkit } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';

// Import all the flows so they are registered with Genkit
import '@/ai/flows/summarize-cultural-insights';
import '@/ai/flows/detect-and-preserve-emotion';
import '@/ai/flows/real-time-translation-with-context';
import '@/ai/flows/text-to-speech';
import '@/ai/flows/chatbot';
import '@/ai/flows/scripture-tutor';
import '@/ai/flows/image-to-text';
import '@/ai/flows/cultural-faux-pas-alert';

export const POST = withGenkit({
  ai,
});
