'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// For browsers that don't support SpeechRecognition natively yet.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type UseSpeechRecognitionProps = {
  lang: string;
};

export const useSpeechRecognition = ({
  lang,
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening even after a pause
      recognition.interimResults = true; // Get results as they are being processed
      recognition.lang = lang;

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
        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        // When recognition ends, the final part of the transcript is the complete sentence.
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;

      return () => {
        recognition.stop();
      };
    } else {
      setIsAvailable(false);
    }
  }, [lang]);

  const toggleListening = useCallback(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        setTranscript(''); // Clear previous transcript before starting new recognition
        recognitionRef.current.start();
      }
      setIsListening(prev => !prev);
    }
  }, [isListening]);

  return { isListening, isAvailable, toggleListening, transcript };
};
