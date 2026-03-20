"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "mr-IN", label: "Marathi" },
  { code: "bn-IN", label: "Bengali" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "es-ES", label: "Spanish" },
  { code: "ja-JP", label: "Japanese" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ar-SA", label: "Arabic" },
];

// Voice commands
const VOICE_COMMANDS: Record<string, string> = {
  "new document": "/document",
  "open document": "/document",
  "open spreadsheet": "/spreadsheet",
  "open presentation": "/presentation",
  "open email": "/email",
  "open chat": "/chat",
  "open graphics": "/graphics",
  "open pdf": "/pdf",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [pulseLevel, setPulseLevel] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const startPulse = useCallback(() => {
    pulseIntervalRef.current = setInterval(() => {
      setPulseLevel(Math.random() * 100);
    }, 100);
  }, []);

  const stopPulse = useCallback(() => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    setPulseLevel(0);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopPulse();
    setIsRecording(false);
    setInterimTranscript("");
  }, [stopPulse]);

  const startRecording = useCallback(() => {
    if (!isSupported) return;

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = selectedLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript("");
      setInterimTranscript("");
      setShowPanel(true);
      startPulse();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = () => {
      stopRecording();
    };

    recognition.onend = () => {
      setIsRecording(false);
      stopPulse();
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, selectedLang, startPulse, stopRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleAccept = useCallback(() => {
    const text = (transcript + interimTranscript).trim();
    if (!text) return;

    // Check for voice commands
    const lower = text.toLowerCase();
    for (const [cmd, route] of Object.entries(VOICE_COMMANDS)) {
      if (lower.includes(cmd)) {
        window.location.href = route;
        setShowPanel(false);
        setTranscript("");
        return;
      }
    }

    if (lower.startsWith("search for")) {
      const searchTerm = text.slice("search for".length).trim();
      window.dispatchEvent(
        new CustomEvent("vidyalaya:ai-prompt", {
          detail: { prompt: `Search and find information about: ${searchTerm}` },
        })
      );
    } else {
      // Dispatch insert-text event for active editors
      window.dispatchEvent(
        new CustomEvent("vidyalaya:voice-insert", { detail: { text } })
      );
    }

    setTranscript("");
    setShowPanel(false);
    stopRecording();
  }, [transcript, interimTranscript, stopRecording]);

  const handleDiscard = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setShowPanel(false);
    stopRecording();
  }, [stopRecording]);

  if (!isSupported) return null;

  const displayText = transcript + interimTranscript;
  const langLabel =
    LANGUAGES.find((l) => l.code === selectedLang)?.label || "English";

  return (
    <>
      {/* Transcript preview panel */}
      {showPanel && (
        <div
          className="fixed bottom-28 right-6 z-[998] w-80 rounded-2xl border shadow-2xl overflow-hidden"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                isRecording ? "bg-red-500" : "bg-[var(--muted)]"
              )}
            >
              <Mic size={12} className="text-white" />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {isRecording ? "Listening..." : "Voice Input"}
            </span>
          </div>

          {/* Waveform / pulse viz */}
          {isRecording && (
            <div className="flex items-center justify-center gap-0.5 px-4 py-2">
              {Array.from({ length: 20 }).map((_, i) => {
                const h = isRecording
                  ? 4 + Math.sin((i + pulseLevel / 10) * 0.8) * 12 + Math.random() * 8
                  : 4;
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full transition-all duration-100"
                    style={{
                      height: `${h}px`,
                      backgroundColor: i % 3 === 0 ? "#a855f7" : "#7c3aed",
                      opacity: 0.7 + (i % 2) * 0.3,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Transcript */}
          <div className="px-4 py-3 min-h-[60px] max-h-40 overflow-y-auto">
            {displayText ? (
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {transcript}
                <span style={{ color: "var(--muted-foreground)" }}>{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Start speaking...
              </p>
            )}
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-2.5 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <X size={12} /> Discard
            </button>
            <button
              onClick={handleAccept}
              disabled={!displayText}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: displayText ? "var(--primary)" : "var(--muted)",
                color: displayText ? "var(--primary-foreground)" : "var(--muted-foreground)",
                cursor: displayText ? "pointer" : "default",
              }}
            >
              <Check size={12} /> Insert
            </button>
          </div>
        </div>
      )}

      {/* Floating mic button */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2">
        {/* Language selector */}
        <div ref={langMenuRef} className="relative">
          <button
            onClick={() => setShowLangMenu((p) => !p)}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] shadow-md transition-colors hover:bg-[var(--muted)]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <Globe size={10} />
            {langLabel.split(" ")[0]}
            <ChevronDown size={9} />
          </button>

          {showLangMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border shadow-xl py-1 max-h-56 overflow-y-auto"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[var(--muted)] transition-colors"
                  style={{
                    color: "var(--foreground)",
                    backgroundColor:
                      lang.code === selectedLang ? "var(--accent)" : undefined,
                  }}
                >
                  {lang.label}
                  {lang.code === selectedLang && (
                    <Check size={11} style={{ color: "var(--primary)" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main mic button */}
        <button
          onClick={toggleRecording}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-200",
            isRecording
              ? "scale-110"
              : "hover:scale-105 active:scale-95"
          )}
          style={{
            background: isRecording
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #a855f7, #7c3aed)",
          }}
          title={isRecording ? "Stop recording" : "Start voice input"}
        >
          {/* Pulse ring when recording */}
          {isRecording && (
            <>
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: "#ef4444" }}
              />
              <span
                className="absolute inset-[-6px] rounded-full animate-pulse opacity-20"
                style={{ backgroundColor: "#ef4444" }}
              />
            </>
          )}

          {isRecording ? (
            <MicOff size={22} className="text-white" />
          ) : (
            <Mic size={22} className="text-white" />
          )}
        </button>
      </div>
    </>
  );
}
