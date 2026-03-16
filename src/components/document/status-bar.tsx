"use client";

import React, { useState } from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES } from "./constants";
import { Globe, ChevronDown, Minus, Plus, FileText, Maximize2, Monitor } from "lucide-react";

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam",
  "Bengali", "Marathi", "Gujarati", "Punjabi", "French", "Spanish", "German",
];

export function StatusBar() {
  const {
    wordCount, charCount, lineCount, paragraphCount, pageSize,
    currentFont, currentFontSize, zoom, setZoom, lastSaved,
    language, setLanguage, autoSaveEnabled,
  } = useDocumentStore();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showZoomPresets, setShowZoomPresets] = useState(false);

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
        <span>Paragraphs: {paragraphCount}</span>
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
                  onClick={() => { setLanguage(lang); setShowLangDropdown(false); }}
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

      {/* Right side - Zoom slider & save status */}
      <div className="flex items-center gap-2">
        {/* Auto-save indicator */}
        {autoSaveEnabled && lastSaved && (
          <span className="text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Saved: {lastSaved}
          </span>
        )}
        {autoSaveEnabled && !lastSaved && (
          <span className="text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Unsaved
          </span>
        )}
        <span className="h-3 w-px" style={{ backgroundColor: "var(--border)" }} />

        {/* Zoom preset buttons */}
        <button onClick={() => setZoom(80)} className="p-0.5 rounded hover:bg-[var(--muted)]" title="Fit Page">
          <FileText size={11} />
        </button>
        <button onClick={() => setZoom(100)} className="p-0.5 rounded hover:bg-[var(--muted)]" title="Fit Width">
          <Maximize2 size={11} />
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            className="p-0.5 rounded hover:bg-[var(--muted)] cursor-pointer"
            onClick={() => setZoom(Math.max(10, zoom - 10))}
            title="Zoom Out"
          >
            <Minus size={12} />
          </button>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-24 h-1 cursor-pointer"
            style={{ accentColor: "var(--primary)" }}
            title={`Zoom: ${zoom}%`}
          />
          <button
            className="p-0.5 rounded hover:bg-[var(--muted)] cursor-pointer"
            onClick={() => setZoom(Math.min(500, zoom + 10))}
            title="Zoom In"
          >
            <Plus size={12} />
          </button>
          <div className="relative">
            <button onClick={() => setShowZoomPresets(!showZoomPresets)}
              className="w-12 text-center text-[10px] hover:underline cursor-pointer">
              {zoom}%
            </button>
            {showZoomPresets && (
              <div className="absolute bottom-full right-0 mb-1 z-50 rounded-lg border shadow-lg py-1 w-24"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {[10, 25, 50, 75, 100, 150, 200, 300, 400, 500].map((z) => (
                  <button key={z} onClick={() => { setZoom(z); setShowZoomPresets(false); }}
                    className="w-full text-left px-3 py-1 text-[10px] hover:bg-[var(--muted)]"
                    style={{
                      color: zoom === z ? "var(--primary)" : "var(--foreground)",
                      fontWeight: zoom === z ? 600 : 400,
                    }}>
                    {z}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
