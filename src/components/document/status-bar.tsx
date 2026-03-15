"use client";

import React, { useState } from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES } from "./constants";
import { Globe, ChevronDown, ZoomIn, ZoomOut, Minus, Plus } from "lucide-react";

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
    currentFont, currentFontSize, zoom, setZoom, lastSaved,
    language, setLanguage,
  } = useDocumentStore();

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const pageEstimate = Math.max(1, Math.ceil(wordCount / 300));

  return (
    <div
      className="no-print flex items-center justify-between border-t px-4 py-1 text-[11px] flex-shrink-0"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      {/* Left side - Document stats */}
      <div className="flex items-center gap-3">
        <span>
          Page {pageEstimate} of {pageEstimate}
        </span>
        <span className="h-3 w-px" style={{ backgroundColor: "var(--border)" }} />
        <span>Words: {wordCount.toLocaleString()}</span>
        <span className="h-3 w-px" style={{ backgroundColor: "var(--border)" }} />
        <span>Characters: {charCount.toLocaleString()}</span>
        <span className="h-3 w-px" style={{ backgroundColor: "var(--border)" }} />
        <span>Lines: {lineCount.toLocaleString()}</span>
        <span className="h-3 w-px" style={{ backgroundColor: "var(--border)" }} />
        {/* Language selector */}
        <div className="relative">
          <button
            className="flex items-center gap-1 hover:underline cursor-pointer"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            <Globe size={11} />
            <span>{language}</span>
            <ChevronDown size={9} />
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
      </div>

      {/* Right side - Zoom slider */}
      <div className="flex items-center gap-2">
        {lastSaved && <span className="text-[10px]">Saved: {lastSaved}</span>}
        <span className="h-3 w-px" style={{ backgroundColor: "var(--border)" }} />
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            className="p-0.5 rounded hover:bg-[var(--muted)] cursor-pointer"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            title="Zoom Out"
          >
            <Minus size={12} />
          </button>
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-24 h-1 cursor-pointer"
            style={{ accentColor: "var(--primary)" }}
            title={`Zoom: ${zoom}%`}
          />
          <button
            className="p-0.5 rounded hover:bg-[var(--muted)] cursor-pointer"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            title="Zoom In"
          >
            <Plus size={12} />
          </button>
          <span className="w-10 text-center text-[10px]">{zoom}%</span>
        </div>
      </div>
    </div>
  );
}
