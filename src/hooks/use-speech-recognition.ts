'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { TranscriptSegment, Speaker } from '@/types/transcription';

// Extend Window for SpeechRecognition
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface UseSpeechRecognitionOptions {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
  onSegment?: (segment: TranscriptSegment) => void;
  onInterim?: (text: string) => void;
  onSpeakerDetected?: (speaker: Speaker) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  interimText: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

// Simple speaker detection based on audio energy / silence gaps
const SPEAKER_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn {
  const {
    language,
    continuous = true,
    interimResults = true,
    onSegment,
    onInterim,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTimeRef = useRef<number>(0);
  const speakerIndexRef = useRef(0);
  const lastSpeechTimeRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setError(null);

    const recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    sessionStartRef.current = Date.now();

    recognition.onstart = () => {
      setIsListening(true);
      startTimeRef.current = Date.now();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          const confidence = result[0].confidence;

          // Simple speaker diarization: detect speaker change on silence > 2s
          const now = Date.now();
          if (now - lastSpeechTimeRef.current > 2000) {
            speakerIndexRef.current = (speakerIndexRef.current + 1) % SPEAKER_COLORS.length;
          }
          lastSpeechTimeRef.current = now;

          const speakerIdx = speakerIndexRef.current;
          const timestamp = startTimeRef.current - sessionStartRef.current;

          const segment: TranscriptSegment = {
            id: `seg-${generateId()}`,
            speakerId: `spk-${speakerIdx + 1}`,
            speakerName: `Speaker ${speakerIdx + 1}`,
            text: finalTranscript.trim(),
            timestamp: Math.max(0, timestamp),
            endTimestamp: Math.max(0, now - sessionStartRef.current),
            confidence: confidence || 0.9,
            language,
            isEdited: false,
          };

          if (segment.text && onSegment) {
            onSegment(segment);
          }

          startTimeRef.current = now;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimText(interim);
      if (interim && onInterim) {
        onInterim(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return; // ignore no-speech
      if (event.error === 'aborted') return;
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current === recognition && isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError('Failed to start speech recognition. It may already be active.');
    }
  }, [language, continuous, interimResults, onSegment, onInterim, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition.stop();
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    interimText,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
