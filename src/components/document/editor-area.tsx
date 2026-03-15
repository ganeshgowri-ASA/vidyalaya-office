"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES, MARGIN_PRESETS } from "./constants";
import { Calendar, Hash, Type } from "lucide-react";

const AUTOSAVE_KEY = "vidyalaya-doc-content";
const AUTOSAVE_INTERVAL = 15000;

function HeaderFooterEditor({
  value,
  onChange,
  placeholder,
  position,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  position: "header" | "footer";
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const insertPageNumber = () => {
    onChange(value ? value + " | Page #" : "Page #");
  };

  const insertDate = () => {
    const today = new Date().toLocaleDateString();
    onChange(value ? value + " | " + today : today);
  };

  if (!editing) {
    return (
      <div
        className="group cursor-pointer flex items-center justify-center"
        style={{
          height: 32,
          borderBottom: position === "header" ? "1px dashed #ccc" : "none",
          borderTop: position === "footer" ? "1px dashed #ccc" : "none",
        }}
        onClick={() => setEditing(true)}
      >
        {value ? (
          <span style={{ fontSize: 10, color: "#888" }}>{value}</span>
        ) : (
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ fontSize: 10, color: "#aaa" }}
          >
            Click to add {position}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2"
      style={{
        height: 36,
        borderBottom: position === "header" ? "1px dashed #999" : "none",
        borderTop: position === "footer" ? "1px dashed #999" : "none",
        backgroundColor: "#fafafa",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") setEditing(false);
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[10px] outline-none"
        style={{ color: "#333" }}
      />
      <button
        className="p-0.5 rounded hover:bg-gray-200"
        title="Insert page number"
        onMouseDown={(e) => {
          e.preventDefault();
          insertPageNumber();
        }}
      >
        <Hash size={10} style={{ color: "#666" }} />
      </button>
      <button
        className="p-0.5 rounded hover:bg-gray-200"
        title="Insert date"
        onMouseDown={(e) => {
          e.preventDefault();
          insertDate();
        }}
      >
        <Calendar size={10} style={{ color: "#666" }} />
      </button>
      <button
        className="p-0.5 rounded hover:bg-gray-200"
        title="Insert custom text"
        onMouseDown={(e) => {
          e.preventDefault();
          const text = prompt("Enter custom text:");
          if (text) onChange(value ? value + " | " + text : text);
        }}
      >
        <Type size={10} style={{ color: "#666" }} />
      </button>
    </div>
  );
}

export function EditorArea() {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    zoom, pageSize, margins, lineSpacing, columns,
    currentFont, currentFontSize,
    updateCounts, setLastSaved,
    showHeaderFooter, headerText, footerText,
    setHeaderText, setFooterText,
    showWatermark, watermarkText,
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
    const lines = trimmed === "" ? 0 : trimmed.split(/\n/).length;
    updateCounts(words, chars, lines);
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
        className="mx-auto shadow-lg print-full-width relative"
        style={{
          width: ps.width,
          minHeight: ps.height,
          backgroundColor: "#ffffff",
          color: "#000000",
          paddingTop: showHeaderFooter ? "0.5in" : mg.top,
          paddingRight: mg.right,
          paddingBottom: showHeaderFooter ? "0.5in" : mg.bottom,
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
        {/* Watermark */}
        {showWatermark && watermarkText && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ zIndex: 0 }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "rgba(200, 200, 200, 0.3)",
                transform: "rotate(-45deg)",
                whiteSpace: "nowrap",
                letterSpacing: 8,
                userSelect: "none",
              }}
            >
              {watermarkText}
            </span>
          </div>
        )}

        {/* Header */}
        {showHeaderFooter && (
          <div style={{ marginLeft: `-${mg.left}`, marginRight: `-${mg.right}`, paddingLeft: mg.left, paddingRight: mg.right, marginBottom: 8 }}>
            <HeaderFooterEditor
              value={headerText}
              onChange={setHeaderText}
              placeholder="Type header text..."
              position="header"
            />
          </div>
        )}

        <div
          ref={editorRef}
          id="doc-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="outline-none min-h-[800px] relative"
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            zIndex: 1,
          }}
          spellCheck
        />

        {/* Footer */}
        {showHeaderFooter && (
          <div style={{ marginLeft: `-${mg.left}`, marginRight: `-${mg.right}`, paddingLeft: mg.left, paddingRight: mg.right, marginTop: 8 }}>
            <HeaderFooterEditor
              value={footerText}
              onChange={setFooterText}
              placeholder="Type footer text..."
              position="footer"
            />
          </div>
        )}
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
