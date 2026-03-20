"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  X,
  ChevronDown,
  ChevronUp,
  List,
  BarChart3,
  Clock,
  BookOpen,
  AlignLeft,
  CheckSquare,
  PieChart,
  PenLine,
  FileText,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  action?: () => void;
}

const MODULE_SUGGESTIONS: Record<string, Suggestion[]> = {
  document: [
    { id: "doc-toc", text: "Add a table of contents", icon: <List size={13} /> },
    { id: "doc-citations", text: "Check citations and references", icon: <BookOpen size={13} /> },
    { id: "doc-summary", text: "Generate an executive summary", icon: <AlignLeft size={13} /> },
    { id: "doc-readability", text: "Improve readability score", icon: <PenLine size={13} /> },
    { id: "doc-headings", text: "Add section headings for clarity", icon: <FileText size={13} /> },
  ],
  spreadsheet: [
    { id: "sheet-pivot", text: "Try a pivot table for this data", icon: <PieChart size={13} /> },
    { id: "sheet-chart", text: "Add a chart to visualize trends", icon: <BarChart3 size={13} /> },
    { id: "sheet-validation", text: "Add data validation rules", icon: <CheckSquare size={13} /> },
    { id: "sheet-formula", text: "Use VLOOKUP to join tables", icon: <Sparkles size={13} /> },
  ],
  presentation: [
    { id: "pres-notes", text: "Add speaker notes to slides", icon: <PenLine size={13} /> },
    { id: "pres-agenda", text: "Add an agenda slide at start", icon: <AlignLeft size={13} /> },
    { id: "pres-summary", text: "Add a conclusion slide", icon: <FileText size={13} /> },
    { id: "pres-visuals", text: "Replace bullet points with visuals", icon: <BarChart3 size={13} /> },
  ],
  email: [
    { id: "email-schedule", text: "Schedule send for optimal time", icon: <Clock size={13} /> },
    { id: "email-signature", text: "Add your signature", icon: <PenLine size={13} /> },
    { id: "email-cc", text: "Consider adding stakeholders to CC", icon: <Sparkles size={13} /> },
    { id: "email-subject", text: "Improve the subject line for higher open rate", icon: <AlignLeft size={13} /> },
  ],
  tasks: [
    { id: "task-deadline", text: "Set a deadline for this task", icon: <Clock size={13} /> },
    { id: "task-subtask", text: "Break task into subtasks", icon: <CheckSquare size={13} /> },
    { id: "task-priority", text: "Assign priority levels", icon: <Sparkles size={13} /> },
    { id: "task-assignee", text: "Assign to a team member", icon: <PenLine size={13} /> },
  ],
  research: [
    { id: "research-wordcount", text: "Check word count and reading time", icon: <FileText size={13} /> },
    { id: "research-plagiarism", text: "Run a plagiarism check", icon: <BookOpen size={13} /> },
    { id: "research-citations", text: "Format citations (APA/MLA)", icon: <AlignLeft size={13} /> },
    { id: "research-abstract", text: "Generate an abstract", icon: <Sparkles size={13} /> },
  ],
  pdf: [
    { id: "pdf-compress", text: "Compress PDF to reduce file size", icon: <FileText size={13} /> },
    { id: "pdf-extract", text: "Extract text for editing", icon: <AlignLeft size={13} /> },
    { id: "pdf-sign", text: "Add a digital signature field", icon: <PenLine size={13} /> },
  ],
  chat: [
    { id: "chat-summary", text: "Summarize this conversation", icon: <AlignLeft size={13} /> },
    { id: "chat-action", text: "Extract action items", icon: <CheckSquare size={13} /> },
    { id: "chat-agenda", text: "Create a meeting agenda", icon: <List size={13} /> },
  ],
  general: [
    { id: "gen-start", text: "Create a new document to get started", icon: <FileText size={13} /> },
    { id: "gen-template", text: "Browse template gallery", icon: <Sparkles size={13} /> },
    { id: "gen-collab", text: "Invite a collaborator", icon: <PenLine size={13} /> },
  ],
};

const DISMISSED_KEY = "vidyalaya_dismissed_suggestions";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: string) {
  try {
    const existing = getDismissed();
    if (!existing.includes(id)) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...existing, id]));
    }
  } catch {}
}

function getModuleFromPath(pathname: string): string {
  if (pathname.startsWith("/document")) return "document";
  if (pathname.startsWith("/spreadsheet")) return "spreadsheet";
  if (pathname.startsWith("/presentation")) return "presentation";
  if (pathname.startsWith("/pdf")) return "pdf";
  if (pathname.startsWith("/graphics")) return "graphics";
  if (pathname.startsWith("/email")) return "email";
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/tasks")) return "tasks";
  if (pathname.startsWith("/research")) return "research";
  return "general";
}

export function SmartSuggestions() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  const module = getModuleFromPath(pathname);
  const allSuggestions = MODULE_SUGGESTIONS[module] || MODULE_SUGGESTIONS.general;

  useEffect(() => {
    const d = getDismissed();
    setDismissed(d);
    // Show panel after a small delay
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Reset collapsed when module changes
  useEffect(() => {
    setCollapsed(false);
  }, [module]);

  const activeSuggestions = allSuggestions
    .filter((s) => !dismissed.includes(s.id))
    .slice(0, 3);

  const handleDismiss = useCallback(
    (id: string) => {
      addDismissed(id);
      setDismissed((prev) => [...prev, id]);
    },
    []
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.action) {
        suggestion.action();
      } else {
        // Dispatch to AI panel
        window.dispatchEvent(
          new CustomEvent("vidyalaya:ai-prompt", {
            detail: { prompt: `Help me: ${suggestion.text.toLowerCase()}` },
          })
        );
      }
      handleDismiss(suggestion.id);
    },
    [handleDismiss]
  );

  if (!visible || activeSuggestions.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-[997] w-72 rounded-2xl border shadow-xl overflow-hidden transition-all duration-300"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-[var(--muted)]"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={14} style={{ color: "#f59e0b" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            Smart Suggestions
          </span>
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ backgroundColor: "#f59e0b", color: "white" }}
          >
            {activeSuggestions.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronUp size={13} style={{ color: "var(--muted-foreground)" }} />
        ) : (
          <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
        )}
      </button>

      {/* Suggestions list */}
      {!collapsed && (
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          {activeSuggestions.map((suggestion, idx) => (
            <div
              key={suggestion.id}
              className={cn(
                "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--muted)]",
                idx < activeSuggestions.length - 1 && "border-b"
              )}
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="mt-0.5 shrink-0"
                style={{ color: "#f59e0b" }}
              >
                {suggestion.icon}
              </span>
              <button
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex-1 text-left text-xs leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                {suggestion.text}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(suggestion.id);
                }}
                className="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--muted)]"
                title="Don't show again"
              >
                <X size={11} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
