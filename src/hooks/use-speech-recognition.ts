'use client';

import { useState, useEffect, useRef } from 'react';

// For browsers that don't support SpeechRecognition natively yet.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type UseSpeechRecognitionProps = {
  onTranscriptChange: (transcript: string) => void;
  lang: string;
};

export const useSpeechRecognition = ({
  onTranscriptChange,
  lang,
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang; // Use the passed language

      // This is the correct way to handle results to avoid duplication.
      let finalTranscript = '';
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onTranscriptChange(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onstart = () => {
        finalTranscript = ''; // Reset final transcript on new start
      };

      recognitionRef.current = recognition;

      // Clean up previous recognition instance
      return () => {
        recognition.stop();
      };
    } else {
      setIsAvailable(false);
    }
  }, [onTranscriptChange, lang]);

  const toggleListening = () => {
    if (recognitionRef.current) {
        if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          onTranscriptChange('');
          recognitionRef.current.start();
          setIsListening(true);
        }
    }
  };

  // Stop listening when component unmounts for safety
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, isAvailable, toggleListening };
};
