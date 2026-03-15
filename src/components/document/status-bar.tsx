"use client";

import React, { useState } from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES } from "./constants";
import { Globe, ChevronDown } from "lucide-react";

const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "French",
  "Spanish",
  "German",
];

export function StatusBar() {
  const {
    wordCount, charCount, lineCount, pageSize,
    currentFont, currentFontSize, zoom, lastSaved,
    language, setLanguage,
  } = useDocumentStore();

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const pageEstimate = Math.max(1, Math.ceil(wordCount / 300));
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className="no-print flex items-center justify-between border-t px-4 py-1.5 text-[11px] flex-shrink-0"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      <div className="flex items-center gap-4">
        <span>
          Page {pageEstimate} of {pageEstimate}
        </span>
        <span>Words: {wordCount.toLocaleString()}</span>
        <span>Characters: {charCount.toLocaleString()}</span>
        <span>Lines: {lineCount.toLocaleString()}</span>
        <span>{PAGE_SIZES[pageSize].label}</span>
        <span>~{readingTime} min read</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="flex items-center gap-1 hover:underline cursor-pointer"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            <Globe size={12} />
            <span>{language}</span>
            <ChevronDown size={10} />
          </button>
          {showLangDropdown && (
            <div
              className="absolute bottom-full right-0 mb-1 z-50 w-40 rounded-lg border shadow-lg py-1 max-h-48 overflow-y-auto"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangDropdown(false);
                  }}
                  className="flex w-full items-center px-3 py-1.5 text-[11px] hover:bg-[var(--muted)]"
                  style={{
                    color: language === lang ? "var(--primary)" : "var(--foreground)",
                    fontWeight: language === lang ? 600 : 400,
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
        <span>
          {currentFont} {currentFontSize}pt
        </span>
        <span>Zoom: {zoom}%</span>
        {lastSaved && <span>Saved: {lastSaved}</span>}
      </div>
    </div>
  );
}
