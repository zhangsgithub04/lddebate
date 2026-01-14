'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => Promise<void>;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

  // Load and select best quality voice
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoice) {
        // Priority order for natural-sounding English voices
        const voicePreferences = [
          // Premium/Natural voices
          (v: SpeechSynthesisVoice) => v.name.includes('Premium') && v.lang.startsWith('en'),
          (v: SpeechSynthesisVoice) => v.name.includes('Natural') && v.lang.startsWith('en'),
          (v: SpeechSynthesisVoice) => v.name.includes('Enhanced') && v.lang.startsWith('en'),
          // Google voices (high quality)
          (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en-US'),
          (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
          // Microsoft voices
          (v: SpeechSynthesisVoice) => (v.name.includes('Microsoft') || v.name.includes('Zira') || v.name.includes('David')) && v.lang.startsWith('en'),
          // Apple voices (Samantha, Alex)
          (v: SpeechSynthesisVoice) => (v.name.includes('Samantha') || v.name.includes('Alex')) && v.lang.startsWith('en'),
          // Any local English voice
          (v: SpeechSynthesisVoice) => v.localService && v.lang.startsWith('en-US'),
          (v: SpeechSynthesisVoice) => v.localService && v.lang.startsWith('en'),
          // Any English voice
          (v: SpeechSynthesisVoice) => v.lang.startsWith('en-US'),
          (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
        ];

        for (const preference of voicePreferences) {
          const voice = availableVoices.find(preference);
          if (voice) {
            setSelectedVoice(voice);
            break;
          }
        }
      }
    };

    loadVoices();
    
    // Some browsers need this event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, selectedVoice]);

  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported || !window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Add natural pauses for better flow
      const processedText = text
        .replace(/\. /g, '... ')      // Longer pause after sentences
        .replace(/\n\n/g, '... ')     // Pause for paragraphs
        .replace(/: /g, ': ')         // Slight pause after colons
        .replace(/; /g, '; ')         // Pause for semicolons
        .replace(/\? /g, '? ')        // Natural question pause
        .replace(/! /g, '! ');        // Exclamation pause

      const utterance = new SpeechSynthesisUtterance(processedText);
      utteranceRef.current = utterance;

      // Use selected voice or fall back to default
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Optimize for more natural speech
      utterance.rate = 0.95;  // Slightly slower than default for clarity
      utterance.pitch = 1.0;   // Natural pitch
      utterance.volume = 0.9;  // Slightly softer for natural feel

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        // Don't treat cancellation as an error - it's intentional
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [isSupported, selectedVoice]);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    // Load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
  };
}
