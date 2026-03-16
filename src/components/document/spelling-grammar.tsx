"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, SpellCheck, Check, Plus, Trash2, RefreshCw, Settings2, BookOpen } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

// Common misspellings with suggestions
const COMMON_MISSPELLINGS: Record<string, string[]> = {
  "teh": ["the"], "adn": ["and"], "wiht": ["with"], "taht": ["that"],
  "hte": ["the"], "waht": ["what"], "thier": ["their", "there"],
  "recieve": ["receive"], "occured": ["occurred"], "seperate": ["separate"],
  "definately": ["definitely"], "accomodate": ["accommodate"],
  "occurance": ["occurrence"], "independant": ["independent"],
  "neccessary": ["necessary"], "untill": ["until"], "wich": ["which"],
  "becuase": ["because"], "beleive": ["believe"], "foriegn": ["foreign"],
  "goverment": ["government"], "happend": ["happened"], "immediatly": ["immediately"],
  "knowlege": ["knowledge"], "liason": ["liaison"], "manuever": ["maneuver"],
  "noticable": ["noticeable"], "parliment": ["parliament"], "persue": ["pursue"],
  "posession": ["possession"], "publically": ["publicly"], "questionaire": ["questionnaire"],
  "refered": ["referred"], "supercede": ["supersede"], "tommorow": ["tomorrow"],
  "truely": ["truly"], "wierd": ["weird"],
};

export function SpellingGrammarPanel() {
  const {
    showSpellingPanel, setShowSpellingPanel,
    spellCheckEnabled, setSpellCheckEnabled,
    autoCorrectEnabled, setAutoCorrectEnabled,
    customDictionary, addToCustomDictionary, removeFromCustomDictionary,
    spellingErrors, setSpellingErrors,
  } = useDocumentStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [scanning, setScanning] = useState(false);

  const runSpellCheck = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    setScanning(true);

    // Clear existing highlights
    const existingMarks = editor.querySelectorAll("mark.spell-error");
    existingMarks.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });

    const text = editor.innerText || "";
    const words = text.split(/\s+/).filter(Boolean);
    const errors: typeof spellingErrors = [];
    let position = 0;

    words.forEach((word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z']/g, "");
      if (cleanWord.length < 2) { position++; return; }
      if (customDictionary.includes(cleanWord)) { position++; return; }

      const suggestions = COMMON_MISSPELLINGS[cleanWord];
      if (suggestions) {
        errors.push({ word: cleanWord, suggestions, position, ignored: false });
      }
      position++;
    });

    setSpellingErrors(errors);

    // Highlight errors in the editor
    if (errors.length > 0) {
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      const textNodes: Text[] = [];
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      for (const textNode of textNodes) {
        const nodeText = textNode.textContent || "";
        for (const error of errors) {
          const regex = new RegExp(`\\b${error.word}\\b`, "gi");
          if (regex.test(nodeText) && !error.ignored) {
            try {
              const match = nodeText.match(regex);
              if (match) {
                const idx = nodeText.toLowerCase().indexOf(error.word);
                if (idx >= 0) {
                  const range = document.createRange();
                  range.setStart(textNode, idx);
                  range.setEnd(textNode, idx + error.word.length);
                  const mark = document.createElement("mark");
                  mark.className = "spell-error";
                  mark.style.cssText = "background:none;border-bottom:2px wavy #EF4444;text-decoration:none;";
                  mark.dataset.word = error.word;
                  try { range.surroundContents(mark); } catch { /* cross-boundary */ }
                  break; // Only highlight first occurrence per text node
                }
              }
            } catch { /* ignore */ }
          }
        }
      }
    }

    setScanning(false);
  }, [customDictionary, setSpellingErrors]);

  const replaceWord = (errorWord: string, replacement: string) => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    const marks = editor.querySelectorAll(`mark.spell-error[data-word="${errorWord}"]`);
    marks.forEach((mark) => {
      mark.replaceWith(document.createTextNode(replacement));
    });

    setSpellingErrors(spellingErrors.filter((e) => e.word !== errorWord));
  };

  const ignoreWord = (word: string) => {
    const editor = document.getElementById("doc-editor");
    if (editor) {
      const marks = editor.querySelectorAll(`mark.spell-error[data-word="${word}"]`);
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
          parent.normalize();
        }
      });
    }
    setSpellingErrors(spellingErrors.map((e) => e.word === word ? { ...e, ignored: true } : e));
  };

  const addToDictionary = (word: string) => {
    addToCustomDictionary(word);
    ignoreWord(word);
  };

  useEffect(() => {
    if (showSpellingPanel && spellCheckEnabled) {
      runSpellCheck();
    }
  }, [showSpellingPanel, spellCheckEnabled, runSpellCheck]);

  if (!showSpellingPanel) return null;

  const activeErrors = spellingErrors.filter((e) => !e.ignored);

  return (
    <div
      className="w-72 border-l overflow-y-auto flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--foreground)" }}>
          <SpellCheck size={13} /> Spelling & Grammar
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 rounded hover:bg-[var(--muted)]" title="Settings">
            <Settings2 size={12} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={() => setShowSpellingPanel(false)} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={13} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <label className="flex items-center gap-2 text-[11px] cursor-pointer" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={spellCheckEnabled} onChange={(e) => setSpellCheckEnabled(e.target.checked)} className="w-3 h-3" />
            Enable spell check
          </label>
          <label className="flex items-center gap-2 text-[11px] cursor-pointer" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={autoCorrectEnabled} onChange={(e) => setAutoCorrectEnabled(e.target.checked)} className="w-3 h-3" />
            Auto-correct common errors
          </label>
          <button onClick={() => setShowDictionary(!showDictionary)}
            className="text-[10px] flex items-center gap-1"
            style={{ color: "var(--primary)" }}>
            <BookOpen size={10} /> Custom Dictionary ({customDictionary.length})
          </button>
        </div>
      )}

      {/* Custom Dictionary */}
      {showDictionary && (
        <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-1">
            <input type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)}
              placeholder="Add word..." className="flex-1 rounded border px-2 py-1 text-[10px]"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              onKeyDown={(e) => { if (e.key === "Enter" && newWord.trim()) { addToCustomDictionary(newWord.trim().toLowerCase()); setNewWord(""); } }}
            />
            <button onClick={() => { if (newWord.trim()) { addToCustomDictionary(newWord.trim().toLowerCase()); setNewWord(""); } }}
              className="rounded border p-1 hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)" }}>
              <Plus size={10} style={{ color: "var(--foreground)" }} />
            </button>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {customDictionary.map((word) => (
              <div key={word} className="flex items-center justify-between text-[10px] px-1 py-0.5 rounded hover:bg-[var(--muted)]">
                <span style={{ color: "var(--foreground)" }}>{word}</span>
                <button onClick={() => removeFromCustomDictionary(word)} className="p-0.5 hover:text-red-500">
                  <Trash2 size={9} />
                </button>
              </div>
            ))}
            {customDictionary.length === 0 && (
              <p className="text-[9px] text-center py-1" style={{ color: "var(--muted-foreground)" }}>No custom words added</p>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex gap-1 px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <button onClick={runSpellCheck}
          className="flex-1 flex items-center justify-center gap-1 rounded px-2 py-1.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: "var(--primary)" }}>
          <RefreshCw size={10} className={scanning ? "animate-spin" : ""} /> Check Spelling
        </button>
      </div>

      {/* Errors list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeErrors.length === 0 ? (
          <div className="text-center py-6">
            <Check size={24} className="mx-auto mb-2" style={{ color: "#22C55E" }} />
            <p className="text-[11px] font-medium" style={{ color: "var(--foreground)" }}>No spelling errors found</p>
            <p className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
              {spellingErrors.filter((e) => e.ignored).length > 0
                ? `${spellingErrors.filter((e) => e.ignored).length} ignored`
                : "Document looks good!"}
            </p>
          </div>
        ) : (
          activeErrors.map((error, i) => (
            <div key={`${error.word}-${i}`} className="rounded border p-2.5"
              style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium" style={{ color: "#EF4444" }}>
                  &ldquo;{error.word}&rdquo;
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                  Misspelling
                </span>
              </div>
              <div className="space-y-1 mb-2">
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Suggestions:</span>
                <div className="flex flex-wrap gap-1">
                  {error.suggestions.map((s) => (
                    <button key={s} onClick={() => replaceWord(error.word, s)}
                      className="px-2 py-0.5 rounded border text-[10px] hover:bg-[var(--muted)]"
                      style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => ignoreWord(error.word)}
                  className="flex-1 rounded border px-2 py-1 text-[9px] hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  Ignore
                </button>
                <button onClick={() => addToDictionary(error.word)}
                  className="flex-1 rounded border px-2 py-1 text-[9px] hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  Add to Dictionary
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        {activeErrors.length} error{activeErrors.length !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
