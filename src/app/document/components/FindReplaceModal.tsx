"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Replace, ChevronUp, ChevronDown } from "lucide-react";

interface FindReplaceModalProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

export default function FindReplaceModal({ editorRef, onClose }: FindReplaceModalProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [status, setStatus] = useState("");
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (findText) {
      countMatches();
    } else {
      setMatchCount(0);
      setStatus("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findText, matchCase, wholeWord]);

  const countMatches = () => {
    const editor = editorRef.current;
    if (!editor || !findText) return;
    const text = editor.innerText || "";
    const flags = matchCase ? "g" : "gi";
    const pattern = wholeWord ? `\\b${escapeRegex(findText)}\\b` : escapeRegex(findText);
    try {
      const matches = text.match(new RegExp(pattern, flags));
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  };

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const findNext = (direction: "forward" | "backward" = "forward") => {
    if (!findText) return;
    // window.find is not in TS types but works in major browsers
    const windowWithFind = window as Window & { find?: (text: string, caseSensitive: boolean, backwards: boolean, wrapAround: boolean, wholeWord: boolean) => boolean };
    const found = windowWithFind.find
      ? windowWithFind.find(findText, matchCase, direction === "backward", true, wholeWord)
      : false;
    if (!found) {
      setStatus("No matches found");
    } else {
      setStatus("");
    }
  };

  const replaceOne = () => {
    const editor = editorRef.current;
    if (!editor || !findText) return;
    editor.focus();
    const sel = window.getSelection();
    if (sel && sel.toString().toLowerCase() === findText.toLowerCase()) {
      document.execCommand("insertText", false, replaceText);
      setStatus("Replaced 1 occurrence");
    } else {
      findNext();
    }
    countMatches();
  };

  const replaceAll = () => {
    const editor = editorRef.current;
    if (!editor || !findText) return;
    const flags = matchCase ? "g" : "gi";
    const pattern = wholeWord ? `\\b${escapeRegex(findText)}\\b` : escapeRegex(findText);
    try {
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        nodes.push(node as Text);
      }
      let count = 0;
      const regex = new RegExp(pattern, flags);
      for (const textNode of nodes) {
        const original = textNode.textContent || "";
        const replaced = original.replace(regex, () => {
          count++;
          return replaceText;
        });
        if (replaced !== original) {
          textNode.textContent = replaced;
        }
      }
      setStatus(count > 0 ? `Replaced ${count} occurrence${count !== 1 ? "s" : ""}` : "No matches found");
      setMatchCount(0);
    } catch {
      setStatus("Error during replace");
    }
  };

  return (
    <div
      className="no-print fixed right-6 top-24 z-50 w-80 rounded-lg border shadow-xl"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--card-foreground)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold">Find &amp; Replace</h3>
        <button
          onClick={onClose}
          className="rounded p-1 hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Find */}
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            Find
          </label>
          <div className="flex gap-1">
            <input
              ref={findInputRef}
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && findNext()}
              placeholder="Search text..."
              className="flex-1 rounded border px-2 py-1.5 text-sm outline-none focus:ring-1"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={() => findNext("backward")}
              className="rounded border px-2 py-1.5 text-xs hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              title="Find Previous"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => findNext("forward")}
              className="rounded border px-2 py-1.5 text-xs hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              title="Find Next"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          {findText && (
            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              {matchCount > 0 ? `${matchCount} match${matchCount !== 1 ? "es" : ""}` : "No matches"}
            </p>
          )}
        </div>

        {/* Replace */}
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            Replace with
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace text..."
            className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Options */}
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded"
            />
            <span style={{ color: "var(--foreground)" }}>Match case</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
              className="rounded"
            />
            <span style={{ color: "var(--foreground)" }}>Whole word</span>
          </label>
        </div>

        {/* Status */}
        {status && (
          <p className="text-xs" style={{ color: "var(--primary)" }}>
            {status}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => findNext()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            <Search size={12} />
            Find
          </button>
          <button
            onClick={replaceOne}
            className="flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            <Replace size={12} />
            Replace
          </button>
          <button
            onClick={replaceAll}
            className="flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            All
          </button>
        </div>
      </div>
    </div>
  );
}
