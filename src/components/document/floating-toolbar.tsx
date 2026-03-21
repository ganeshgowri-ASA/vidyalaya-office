"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, Highlighter, Type, Link, Sparkles, ChevronDown,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
}

const HIGHLIGHT_COLORS = [
  "#FFFF00", "#00FF00", "#00FFFF", "#FF00FF", "#FF6600",
  "#FF0000", "#0000FF", "#808080",
];

export function FloatingToolbar() {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toggleAI = useDocumentStore((s) => s.toggleAI);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setPosition(null);
      setShowHighlightPicker(false);
      setShowHeadingMenu(false);
      return;
    }

    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const anchorNode = sel.anchorNode;
    if (!anchorNode || !editor.contains(anchorNode)) {
      setPosition(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0) {
      setPosition(null);
      return;
    }

    const toolbarWidth = 520;
    const toolbarHeight = 40;
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    let top = rect.top - toolbarHeight - 8;

    if (left < 8) left = 8;
    if (left + toolbarWidth > window.innerWidth - 8) left = window.innerWidth - toolbarWidth - 8;
    if (top < 8) top = rect.bottom + 8;

    setPosition({ top, left });
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      requestAnimationFrame(updatePosition);
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [updatePosition]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false);
        setShowHeadingMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!position) return null;

  const btn = "p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center";

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[200] flex items-center gap-0.5 rounded-lg border px-1.5 py-1 shadow-2xl backdrop-blur-md"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: "rgba(30, 30, 40, 0.95)",
        borderColor: "rgba(255,255,255,0.15)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button className={btn} onClick={() => execCmd("bold")} title="Bold">
        <Bold size={14} color="#e0e0e0" />
      </button>
      <button className={btn} onClick={() => execCmd("italic")} title="Italic">
        <Italic size={14} color="#e0e0e0" />
      </button>
      <button className={btn} onClick={() => execCmd("underline")} title="Underline">
        <Underline size={14} color="#e0e0e0" />
      </button>
      <button className={btn} onClick={() => execCmd("strikeThrough")} title="Strikethrough">
        <Strikethrough size={14} color="#e0e0e0" />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

      <div className="relative">
        <button
          className={`${btn} gap-0.5`}
          onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowHighlightPicker(false); }}
          title="Headings"
        >
          <Heading1 size={14} color="#e0e0e0" />
          <ChevronDown size={10} color="#e0e0e0" />
        </button>
        {showHeadingMenu && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg border p-1 shadow-xl min-w-[120px]"
            style={{ backgroundColor: "rgba(30, 30, 40, 0.98)", borderColor: "rgba(255,255,255,0.15)" }}
          >
            {[
              { label: "Heading 1", tag: "h1", icon: <Heading1 size={13} /> },
              { label: "Heading 2", tag: "h2", icon: <Heading2 size={13} /> },
              { label: "Heading 3", tag: "h3", icon: <Heading3 size={13} /> },
              { label: "Paragraph", tag: "p", icon: <Type size={13} /> },
              { label: "Quote", tag: "blockquote", icon: <Quote size={13} /> },
            ].map((h) => (
              <button
                key={h.tag}
                className="flex items-center gap-2 w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/10"
                style={{ color: "#e0e0e0" }}
                onClick={() => { execCmd("formatBlock", h.tag); setShowHeadingMenu(false); }}
              >
                {h.icon} {h.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

      <button className={btn} onClick={() => execCmd("insertUnorderedList")} title="Bullet List">
        <List size={14} color="#e0e0e0" />
      </button>
      <button className={btn} onClick={() => execCmd("insertOrderedList")} title="Numbered List">
        <ListOrdered size={14} color="#e0e0e0" />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

      <button className={btn} onClick={() => execCmd("justifyLeft")} title="Align Left">
        <AlignLeft size={14} color="#e0e0e0" />
      </button>
      <button className={btn} onClick={() => execCmd("justifyCenter")} title="Center">
        <AlignCenter size={14} color="#e0e0e0" />
      </button>
      <button className={btn} onClick={() => execCmd("justifyRight")} title="Align Right">
        <AlignRight size={14} color="#e0e0e0" />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

      <button
        className={btn}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "color";
          input.value = "#ff0000";
          input.onchange = () => execCmd("foreColor", input.value);
          input.click();
        }}
        title="Text Color"
      >
        <span className="flex flex-col items-center">
          <Type size={13} color="#e0e0e0" />
          <span className="h-0.5 w-3" style={{ backgroundColor: "#ff6b6b", marginTop: -1 }} />
        </span>
      </button>

      <div className="relative">
        <button
          className={btn}
          onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowHeadingMenu(false); }}
          title="Highlight"
        >
          <Highlighter size={14} color="#e0e0e0" />
        </button>
        {showHighlightPicker && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg border p-2 shadow-xl"
            style={{ backgroundColor: "rgba(30, 30, 40, 0.98)", borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-5 h-5 rounded-sm border border-white/20 hover:scale-125 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={() => { execCmd("hiliteColor", c); setShowHighlightPicker(false); }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        className={btn}
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) execCmd("createLink", url);
        }}
        title="Insert Link"
      >
        <Link size={14} color="#e0e0e0" />
      </button>

      <div className="w-px h-5 mx-0.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

      <button
        className={`${btn} gap-1 px-2`}
        onClick={() => toggleAI()}
        title="Ask AI"
      >
        <Sparkles size={14} color="#a78bfa" />
        <span className="text-[10px]" style={{ color: "#a78bfa" }}>Ask AI</span>
      </button>
    </div>
  );
}
