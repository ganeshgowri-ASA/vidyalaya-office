"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wand2,
  CheckCircle,
  XCircle,
  Loader2,
  AlignLeft,
  Briefcase,
  Coffee,
  Minimize2,
  Maximize2,
  Languages,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const WRITING_ACTIONS: WritingAction[] = [
  { id: "grammar", label: "Fix Grammar", icon: <CheckCircle size={13} />, prompt: "Fix all grammar, spelling, and punctuation errors in this text:" },
  { id: "clarity", label: "Improve Clarity", icon: <Wand2 size={13} />, prompt: "Improve the clarity and readability of this text:" },
  { id: "formal", label: "Make Formal", icon: <Briefcase size={13} />, prompt: "Rewrite this text in a professional, formal business tone:" },
  { id: "casual", label: "Make Casual", icon: <Coffee size={13} />, prompt: "Rewrite this text in a friendly, casual conversational tone:" },
  { id: "shorten", label: "Shorten", icon: <Minimize2 size={13} />, prompt: "Shorten this text while preserving all key information:" },
  { id: "expand", label: "Expand", icon: <Maximize2 size={13} />, prompt: "Expand this text with more detail and examples:" },
  { id: "translate", label: "Translate", icon: <Languages size={13} />, prompt: "Translate this text to English (or specify target language):" },
  { id: "rephrase", label: "Rephrase", icon: <Sparkles size={13} />, prompt: "Rephrase this text in a fresh, engaging way:" },
];

interface SelectionPosition {
  x: number;
  y: number;
  text: string;
}

interface DiffResult {
  original: string;
  corrected: string;
  actionLabel: string;
}

export function WritingAssistant() {
  const [position, setPosition] = useState<SelectionPosition | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    // Slight delay to let selection stabilize
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length < 3) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
        text: selectedText,
      });
      setDiffResult(null);
    }, 100);
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // If clicking inside toolbar or diff panel, don't close
      if (
        toolbarRef.current?.contains(e.target as Node) ||
        diffRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setPosition(null);
      setDiffResult(null);
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  const runAction = useCallback(
    async (action: WritingAction) => {
      if (!position?.text || isLoading) return;

      setIsLoading(true);
      setActiveAction(action.id);

      try {
        // Try to use the AI API endpoint
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "claude",
            messages: [
              {
                role: "user",
                content: `${action.prompt}\n\n"${position.text}"\n\nReturn ONLY the improved text without any explanation or quotes.`,
              },
            ],
            system:
              "You are a writing assistant. When given text and an instruction, return ONLY the modified text. No explanations, no quotes, no extra formatting.",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setDiffResult({
            original: position.text,
            corrected: data.reply || position.text,
            actionLabel: action.label,
          });
        } else {
          // Fallback: show a mock improvement
          setDiffResult({
            original: position.text,
            corrected: `[${action.label} applied] ${position.text}`,
            actionLabel: action.label,
          });
        }
      } catch {
        setDiffResult({
          original: position.text,
          corrected: position.text,
          actionLabel: action.label,
        });
      } finally {
        setIsLoading(false);
        setActiveAction(null);
      }
    },
    [position, isLoading]
  );

  const handleAccept = useCallback(() => {
    if (!diffResult) return;
    // Replace selected text
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(diffResult.corrected));
    } else {
      // Dispatch event for editors to handle
      window.dispatchEvent(
        new CustomEvent("vidyalaya:writing-replace", {
          detail: { original: diffResult.original, corrected: diffResult.corrected },
        })
      );
    }
    setDiffResult(null);
    setPosition(null);
  }, [diffResult]);

  const handleReject = useCallback(() => {
    setDiffResult(null);
  }, []);

  if (!position) return null;

  // Position toolbar above the selection
  const toolbarStyle: React.CSSProperties = {
    position: "fixed",
    left: `${Math.min(position.x, window.innerWidth - 380)}px`,
    top: `${position.y - 50}px`,
    transform: "translateX(-50%)",
    zIndex: 9990,
  };

  return (
    <>
      {/* Floating toolbar */}
      {!diffResult && (
        <div
          ref={toolbarRef}
          className="flex items-center gap-0.5 rounded-xl border shadow-2xl px-1.5 py-1"
          style={{
            ...toolbarStyle,
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {WRITING_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => runAction(action)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                "hover:bg-[var(--accent)]",
                activeAction === action.id && "bg-[var(--accent)]"
              )}
              style={{ color: "var(--foreground)" }}
              title={action.label}
            >
              {isLoading && activeAction === action.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                action.icon
              )}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Diff preview panel */}
      {diffResult && (
        <div
          ref={diffRef}
          className="rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            position: "fixed",
            left: `${Math.min(position.x, window.innerWidth - 420)}px`,
            top: `${position.y - 180}px`,
            transform: "translateX(-50%)",
            zIndex: 9990,
            width: "400px",
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Wand2 size={14} style={{ color: "var(--primary)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                {diffResult.actionLabel} — Preview
              </span>
            </div>
            <button onClick={handleReject} className="rounded p-0.5 hover:bg-[var(--muted)]">
              <X size={13} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>

          {/* Diff content */}
          <div className="px-4 py-3 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Original
              </p>
              <p
                className="text-xs leading-relaxed rounded-lg px-3 py-2 line-through opacity-60"
                style={{
                  color: "var(--foreground)",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  borderLeft: "2px solid #ef4444",
                }}
              >
                {diffResult.original}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Improved
              </p>
              <p
                className="text-xs leading-relaxed rounded-lg px-3 py-2"
                style={{
                  color: "var(--foreground)",
                  backgroundColor: "rgba(34,197,94,0.08)",
                  borderLeft: "2px solid #22c55e",
                }}
              >
                {diffResult.corrected}
              </p>
            </div>
          </div>

          {/* Accept / Reject */}
          <div
            className="flex items-center justify-end gap-2 px-4 py-2.5 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={handleReject}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <XCircle size={12} /> Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <CheckCircle size={12} /> Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
