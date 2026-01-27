'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Languages,
  Smile,
  Phone,
  Swords,
  Voicemail,
  MessageSquare,
} from 'lucide-react';

export default function TutorialPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Tutorial & Guide</CardTitle>
        <CardDescription>
          Find answers to common questions and learn how to get the most out of
          Vaani AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Using the AI Language Tutor</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                The AI Tutor on the main dashboard is your personal language
                expert.
              </p>
              <ul>
                <li>
                  <strong>Ask Anything:</strong> Ask for translations, explain
                  idioms, or get cultural context. You can even ask general
                  knowledge questions.
                </li>
                <li>
                  <strong>Phrase of the Day:</strong> Click the quote icon in
                  the header to see a new idiom every day, complete with its
                  story and emotional translations.
                </li>
                <li>
                  <strong>Image-to-Text:</strong> Click the camera icon in the
                  chat input to upload an image or use your camera to extract
                  text, then ask the tutor about it.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-primary" />
                <span>Real-Time Translation Tool</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                The "Translate" page is your go-to for powerful text
                translations.
              </p>
              <ul>
                <li>
                  <strong>Formality Slider:</strong> Use the slider to switch
                  between 'Casual' and 'Formal' tones for your translation. This
                  is great for talking to a boss versus a friend.
                </li>
                <li>
                  <strong>Cultural Faux-Pas Alert:</strong> As you type, the AI
                  will proactively warn you if a phrase might be considered
                  offensive in some cultures and will suggest a better
                  alternative.
                </li>
                <li>
                  <strong>Audio Output:</strong> After translating, use the play
                  button to hear the translated text spoken aloud with a
                  natural-sounding voice.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Voicemail className="h-5 w-5 text-primary" />
                <span>Voice Memo & Phrasebook</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Create your own personal library of useful translated phrases.</p>
              <ul>
                <li>
                  <strong>Record:</strong> Use the microphone to record yourself
                  speaking a phrase. The app will transcribe it for you.
                </li>
                <li>
                  <strong>Translate & Save:</strong> The transcribed text is
                  translated, and both versions are saved to your personal
                  "Phrasebook".
                </li>
                <li>
                  <strong>Playback:</strong> Access your Phrasebook at any time
                  to listen to the audio of your saved translations. Perfect for
                  practice!
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>Live Call Translation (Premium)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                This premium feature lets you translate conversations in
                real-time during voice and video calls within the app.
              </p>
              <ul>
                <li>
                  <strong>Initiate a Call:</strong> Navigate to the "Live Call"
                  page to start a simulated call.
                </li>
                <li>
                  <strong>Live Transcript:</strong> See the conversation and its
                  translation appear in real-time in the transcript panel on the
                  side.
                </li>
                <li>
                  <strong>Seamless Communication:</strong> This allows you to
                  have a natural conversation with anyone, no matter what
                  language they speak.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Smile className="h-5 w-5 text-primary" />
                <span>Emotion & Tone Tool</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                This tool ensures your message's feeling isn't lost in
                translation.
              </p>
              <ul>
                <li>
                  <strong>Enter Emotional Text:</strong> Write a sentence with
                  clear emotion (e.g., excitement, disappointment).
                </li>
                <li>
                  <strong>Detect Emotion:</strong> The AI will analyze the text,
                  identify the primary emotion, and display it as a badge.
                </li>
                <li>
                  <strong>Preserve Tone:</strong> The final translation is
                  crafted to carry the same emotional weight as the original
                  text.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Swords className="h-5 w-5 text-primary" />
                <span>Language Games</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Make learning vocabulary fun and engaging with interactive
                games.
              </p>
              <ul>
                <li>
                  <strong>Choose Your Game:</strong> Select from "Match the
                  Columns" or "Translate the Word".
                </li>
                <li>
                  <strong>Set Languages:</strong> Pick the language pair you want
                  to practice with.
                </li>
                <li>
                  <strong>Level Up:</strong> Progress through levels and track
                  your score to master new words.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
