"use client";

import React, { useState, useCallback } from "react";
import { X, Search, Replace } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function FindReplaceDialog() {
  const { showFindReplace, setShowFindReplace } = useDocumentStore();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const handleFind = useCallback(() => {
    if (!findText) return;
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    // Clear existing highlights
    const existing = editor.querySelectorAll("mark.find-highlight");
    existing.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });

    if (!findText.trim()) {
      setMatchCount(0);
      return;
    }

    // Highlight matches using TreeWalker
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    let count = 0;
    const searchLower = findText.toLowerCase();
    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      const idx = text.toLowerCase().indexOf(searchLower);
      if (idx >= 0) {
        const range = document.createRange();
        range.setStart(textNode, idx);
        range.setEnd(textNode, idx + findText.length);
        const mark = document.createElement("mark");
        mark.className = "find-highlight";
        mark.style.backgroundColor = "#FFFF00";
        mark.style.color = "#000";
        range.surroundContents(mark);
        count++;
      }
    }
    setMatchCount(count);
  }, [findText]);

  const handleReplace = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const highlighted = editor.querySelector("mark.find-highlight");
    if (highlighted) {
      highlighted.replaceWith(document.createTextNode(replaceText));
      handleFind();
    }
  }, [replaceText, handleFind]);

  const handleReplaceAll = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const highlights = editor.querySelectorAll("mark.find-highlight");
    highlights.forEach((el) => {
      el.replaceWith(document.createTextNode(replaceText));
    });
    setMatchCount(0);
  }, [replaceText]);

  if (!showFindReplace) return null;

  return (
    <div
      className="absolute top-2 right-2 z-40 rounded-lg border shadow-lg p-4 w-[320px]"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Find & Replace</h3>
        <button
          onClick={() => {
            // Clear highlights on close
            const editor = document.getElementById("doc-editor");
            if (editor) {
              const marks = editor.querySelectorAll("mark.find-highlight");
              marks.forEach((el) => {
                const parent = el.parentNode;
                if (parent) {
                  parent.replaceChild(document.createTextNode(el.textContent || ""), el);
                  parent.normalize();
                }
              });
            }
            setShowFindReplace(false);
          }}
          className="rounded p-0.5 hover:bg-[var(--muted)]"
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2 top-2" style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFind()}
              placeholder="Find..."
              className="w-full rounded border py-1.5 pl-7 pr-2 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <button
            onClick={handleFind}
            className="rounded border px-3 py-1 text-xs hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Find
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Replace size={14} className="absolute left-2 top-2" style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="w-full rounded border py-1.5 pl-7 pr-2 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <button
            onClick={handleReplace}
            className="rounded border px-2 py-1 text-[11px] hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Replace
          </button>
        </div>

        <div className="flex items-center justify-between">
          {matchCount !== null && (
            <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {matchCount} match{matchCount !== 1 ? "es" : ""} found
            </span>
          )}
          <button
            onClick={handleReplaceAll}
            className="rounded border px-2 py-1 text-[11px] hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
