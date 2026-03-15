"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES, MARGIN_PRESETS } from "./constants";

const AUTOSAVE_KEY = "vidyalaya-doc-content";
const AUTOSAVE_INTERVAL = 15000;

export function EditorArea() {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    zoom, pageSize, margins, lineSpacing, columns,
    currentFont, currentFontSize,
    updateCounts, setLastSaved,
  } = useDocumentStore();

  const ps = PAGE_SIZES[pageSize];
  const mg = MARGIN_PRESETS[margins];

  // Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        localStorage.setItem(AUTOSAVE_KEY, content);
        setLastSaved(new Date().toLocaleTimeString());
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [setLastSaved]);

  // Load saved content
  useEffect(() => {
    if (editorRef.current) {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        editorRef.current.innerHTML = saved;
        countWords();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countWords = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const chars = trimmed.length;
    updateCounts(words, chars);
  }, [updateCounts]);

  const handleInput = useCallback(() => {
    countWords();
  }, [countWords]);

  return (
    <div
      className="flex-1 overflow-auto print-full-width"
      style={{ backgroundColor: "#e8e8e8" }}
      id="doc-editor-wrapper"
    >
      {/* Ruler */}
      <div
        id="doc-ruler"
        className="sticky top-0 z-10 flex items-end justify-center"
        style={{ backgroundColor: "#e8e8e8", height: 24 }}
      >
        <div
          className="flex items-end"
          style={{ width: ps.width, transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          {Array.from({ length: 22 }, (_, i) => (
            <div key={i} className="flex items-end" style={{ width: "1cm" }}>
              <div style={{ width: 1, height: i % 2 === 0 ? 10 : 6, backgroundColor: "#999" }} />
              {i % 2 === 0 && (
                <span style={{ fontSize: 8, color: "#666", marginLeft: 1, lineHeight: 1 }}>{i / 2}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="py-4" />
      <div
        className="mx-auto shadow-lg print-full-width"
        style={{
          width: ps.width,
          minHeight: ps.height,
          backgroundColor: "#ffffff",
          color: "#000000",
          paddingTop: mg.top,
          paddingRight: mg.right,
          paddingBottom: mg.bottom,
          paddingLeft: mg.left,
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
          fontFamily: currentFont,
          fontSize: currentFontSize + "pt",
          lineHeight: lineSpacing,
          columnCount: columns,
          columnGap: "2em",
        }}
      >
        <div
          ref={editorRef}
          id="doc-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="outline-none min-h-[800px]"
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
          spellCheck
        />
      </div>
    </div>
  );
}

export function getEditorContent(): string {
  const editor = document.getElementById("doc-editor");
  return editor?.innerHTML || "";
}

export function setEditorContent(html: string) {
  const editor = document.getElementById("doc-editor");
  if (editor) {
    editor.innerHTML = html;
    localStorage.setItem(AUTOSAVE_KEY, html);
  }
}

export function getEditorText(): string {
  const editor = document.getElementById("doc-editor");
  return editor?.innerText || "";
}
