"use client";

import React, { useState, useCallback } from "react";
import { X, Search, Replace, ChevronDown, ChevronUp } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function FindReplaceDialog() {
  const { showFindReplace, setShowFindReplace } = useDocumentStore();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [findInSelection, setFindInSelection] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const clearHighlights = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const existing = editor.querySelectorAll("mark.find-highlight");
    existing.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });
  }, []);

  const handleFind = useCallback(() => {
    if (!findText) return;
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    clearHighlights();

    if (!findText.trim()) {
      setMatchCount(0);
      return;
    }

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    let count = 0;
    let pattern: RegExp;

    try {
      if (useRegex) {
        pattern = new RegExp(findText, matchCase ? "g" : "gi");
      } else {
        let escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (wholeWord) {
          escaped = `\\b${escaped}\\b`;
        }
        pattern = new RegExp(escaped, matchCase ? "g" : "gi");
      }
    } catch {
      setMatchCount(0);
      return;
    }

    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      let match: RegExpExecArray | null;
      const matches: { start: number; end: number }[] = [];

      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length });
        if (!pattern.global) break;
      }

      // Process matches in reverse to avoid index shifting
      for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        try {
          const range = document.createRange();
          range.setStart(textNode, m.start);
          range.setEnd(textNode, m.end);
          const mark = document.createElement("mark");
          mark.className = "find-highlight";
          mark.style.backgroundColor = count === currentMatch ? "#FF8C00" : "#FFFF00";
          mark.style.color = "#000";
          mark.dataset.matchIndex = String(count);
          range.surroundContents(mark);
          count++;
        } catch {
          // surroundContents can fail on cross-boundary selections
        }
      }
    }
    setMatchCount(count);
    if (count > 0 && currentMatch >= count) {
      setCurrentMatch(0);
    }

    // Scroll to current match
    scrollToMatch(currentMatch);
  }, [findText, matchCase, wholeWord, useRegex, currentMatch, clearHighlights]);

  const scrollToMatch = (index: number) => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const marks = editor.querySelectorAll("mark.find-highlight");
    marks.forEach((m, i) => {
      (m as HTMLElement).style.backgroundColor = i === index ? "#FF8C00" : "#FFFF00";
    });
    if (marks[index]) {
      marks[index].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleNext = useCallback(() => {
    if (matchCount === null || matchCount === 0) {
      handleFind();
      return;
    }
    const next = (currentMatch + 1) % matchCount;
    setCurrentMatch(next);
    scrollToMatch(next);
  }, [currentMatch, matchCount, handleFind]);

  const handlePrev = useCallback(() => {
    if (matchCount === null || matchCount === 0) return;
    const prev = (currentMatch - 1 + matchCount) % matchCount;
    setCurrentMatch(prev);
    scrollToMatch(prev);
  }, [currentMatch, matchCount]);

  const handleReplace = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const marks = editor.querySelectorAll("mark.find-highlight");
    if (marks[currentMatch]) {
      marks[currentMatch].replaceWith(document.createTextNode(replaceText));
      handleFind();
    }
  }, [replaceText, currentMatch, handleFind]);

  const handleReplaceAll = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const highlights = editor.querySelectorAll("mark.find-highlight");
    highlights.forEach((el) => {
      el.replaceWith(document.createTextNode(replaceText));
    });
    setMatchCount(0);
    setCurrentMatch(0);
  }, [replaceText]);

  if (!showFindReplace) return null;

  return (
    <div
      className="absolute top-2 right-2 z-40 rounded-lg border shadow-lg p-4 w-[360px]"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Find & Replace</h3>
        <button
          onClick={() => {
            clearHighlights();
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) handlePrev();
                  else handleNext();
                }
              }}
              placeholder={useRegex ? "Regex pattern..." : "Find..."}
              className="w-full rounded border py-1.5 pl-7 pr-2 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="flex gap-0.5">
            <button onClick={handlePrev} className="rounded border p-1 hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)" }} title="Previous (Shift+Enter)">
              <ChevronUp size={14} style={{ color: "var(--foreground)" }} />
            </button>
            <button onClick={handleNext} className="rounded border p-1 hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)" }} title="Next (Enter)">
              <ChevronDown size={14} style={{ color: "var(--foreground)" }} />
            </button>
          </div>
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
          <button onClick={handleReplace}
            className="rounded border px-2 py-1 text-[10px] hover:bg-[var(--muted)] whitespace-nowrap"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Replace
          </button>
        </div>

        {/* Options toggle */}
        <button onClick={() => setShowOptions(!showOptions)}
          className="text-[10px] flex items-center gap-1"
          style={{ color: "var(--primary)" }}>
          {showOptions ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          Search Options
        </button>

        {showOptions && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)}
                className="w-3 h-3" />
              Match Case
            </label>
            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)}
                className="w-3 h-3" />
              Whole Word
            </label>
            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)}
                className="w-3 h-3" />
              Regular Expression
            </label>
            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={findInSelection} onChange={(e) => setFindInSelection(e.target.checked)}
                className="w-3 h-3" />
              Find in Selection
            </label>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {matchCount !== null && (
            <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {matchCount === 0 ? "No matches" : `${currentMatch + 1} of ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
            </span>
          )}
          <button onClick={handleReplaceAll}
            className="rounded border px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
