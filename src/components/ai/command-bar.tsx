"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  FileText,
  Table2,
  Presentation,
  FileImage,
  Workflow,
  Mail,
  MessageSquare,
  Sparkles,
  Languages,
  Wand2,
  ListOrdered,
  AlignLeft,
  BookOpen,
  Clock,
  ArrowRight,
  Command,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

function getModuleIcon(module: string) {
  switch (module) {
    case "document": return <FileText size={15} />;
    case "spreadsheet": return <Table2 size={15} />;
    case "presentation": return <Presentation size={15} />;
    case "pdf": return <FileImage size={15} />;
    case "graphics": return <Workflow size={15} />;
    case "email": return <Mail size={15} />;
    case "chat": return <MessageSquare size={15} />;
    default: return <Sparkles size={15} />;
  }
}

function getCurrentModule(pathname: string): string {
  if (pathname.startsWith("/document")) return "document";
  if (pathname.startsWith("/spreadsheet")) return "spreadsheet";
  if (pathname.startsWith("/presentation")) return "presentation";
  if (pathname.startsWith("/pdf")) return "pdf";
  if (pathname.startsWith("/graphics")) return "graphics";
  if (pathname.startsWith("/email")) return "email";
  if (pathname.startsWith("/chat")) return "chat";
  return "general";
}

const RECENT_KEY = "vidyalaya_recent_commands";

function getRecentCommands(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentCommand(id: string) {
  try {
    const recent = getRecentCommands();
    const updated = [id, ...recent.filter((r) => r !== id)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const currentModule = getCurrentModule(pathname);

  const navigate = useCallback(
    (href: string, id: string) => {
      saveRecentCommand(id);
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  const runAI = useCallback(
    (prompt: string, id: string) => {
      saveRecentCommand(id);
      onClose();
      // Dispatch a custom event that AI panel can listen to
      window.dispatchEvent(
        new CustomEvent("vidyalaya:ai-prompt", { detail: { prompt } })
      );
    },
    [onClose]
  );

  const allCommands = React.useMemo<CommandItem[]>(
    () => [
      // Navigation
      { id: "nav-document", label: "Open Document Editor", icon: <FileText size={15} />, category: "Navigate", action: () => navigate("/document", "nav-document"), keywords: ["word", "doc", "write"] },
      { id: "nav-spreadsheet", label: "Open Spreadsheet", icon: <Table2 size={15} />, category: "Navigate", action: () => navigate("/spreadsheet", "nav-spreadsheet"), keywords: ["excel", "sheet", "data"] },
      { id: "nav-presentation", label: "Open Presentation", icon: <Presentation size={15} />, category: "Navigate", action: () => navigate("/presentation", "nav-presentation"), keywords: ["slides", "powerpoint"] },
      { id: "nav-pdf", label: "Open PDF Tools", icon: <FileImage size={15} />, category: "Navigate", action: () => navigate("/pdf", "nav-pdf"), keywords: ["pdf", "scan"] },
      { id: "nav-graphics", label: "Open Graphics Editor", icon: <Workflow size={15} />, category: "Navigate", action: () => navigate("/graphics", "nav-graphics"), keywords: ["diagram", "flowchart", "draw"] },
      { id: "nav-email", label: "Open Email", icon: <Mail size={15} />, category: "Navigate", action: () => navigate("/email", "nav-email"), keywords: ["mail", "inbox", "compose"] },
      { id: "nav-chat", label: "Open Chat", icon: <MessageSquare size={15} />, category: "Navigate", action: () => navigate("/chat", "nav-chat"), keywords: ["message", "dm", "channel"] },

      // AI Actions
      { id: "ai-summarize", label: "AI: Summarize content", icon: <AlignLeft size={15} />, category: "AI Action", action: () => runAI("Summarize the current content concisely with key points.", "ai-summarize"), keywords: ["summary", "tldr"] },
      { id: "ai-improve", label: "AI: Improve writing", icon: <Wand2 size={15} />, category: "AI Action", action: () => runAI("Review and improve the writing quality, clarity, and tone of the current content.", "ai-improve"), keywords: ["edit", "rewrite", "enhance"] },
      { id: "ai-translate", label: "AI: Translate text", icon: <Languages size={15} />, category: "AI Action", action: () => runAI("Translate the current text. What language would you like to translate to?", "ai-translate"), keywords: ["language", "translate"] },
      { id: "ai-outline", label: "AI: Generate outline", icon: <ListOrdered size={15} />, category: "AI Action", action: () => runAI("Create a structured outline based on the current content or topic.", "ai-outline"), keywords: ["structure", "plan", "outline"] },
      { id: "ai-explain", label: "AI: Explain concept", icon: <BookOpen size={15} />, category: "AI Action", action: () => runAI("Explain this concept in simple, clear terms: ", "ai-explain"), keywords: ["explain", "help", "understand"] },
      { id: "ai-generate", label: "AI: Generate content", icon: <Sparkles size={15} />, category: "AI Action", action: () => runAI("Generate creative content for: ", "ai-generate"), keywords: ["create", "write", "generate"] },
      { id: "ai-rephrase", label: "AI: Rephrase selection", icon: <Wand2 size={15} />, category: "AI Action", action: () => runAI("Rephrase the selected text in a clearer, more engaging way.", "ai-rephrase"), keywords: ["rewrite", "rephrase", "paraphrase"] },
    ],
    [navigate, runAI]
  );

  const contextCommands = React.useMemo<CommandItem[]>(() => {
    const map: Record<string, CommandItem[]> = {
      document: [
        { id: "ctx-grammar", label: "Fix Grammar", icon: <Wand2 size={15} />, category: "Current Editor", action: () => runAI("Perform a thorough grammar, spelling, and style check.", "ctx-grammar") },
        { id: "ctx-formal", label: "Make Formal", icon: <Sparkles size={15} />, category: "Current Editor", action: () => runAI("Rewrite this in a professional, formal business tone.", "ctx-formal") },
      ],
      spreadsheet: [
        { id: "ctx-formula", label: "Write Formula", icon: <Sparkles size={15} />, category: "Current Editor", action: () => runAI("Help me write a spreadsheet formula for: ", "ctx-formula") },
        { id: "ctx-analyze", label: "Analyze Data", icon: <Sparkles size={15} />, category: "Current Editor", action: () => runAI("Analyze this spreadsheet data and provide key insights.", "ctx-analyze") },
      ],
      email: [
        { id: "ctx-reply", label: "Draft Reply", icon: <Mail size={15} />, category: "Current Editor", action: () => runAI("Draft a professional reply to this email.", "ctx-reply") },
        { id: "ctx-subject", label: "Generate Subject Line", icon: <Sparkles size={15} />, category: "Current Editor", action: () => runAI("Generate compelling email subject lines for this email.", "ctx-subject") },
      ],
      chat: [
        { id: "ctx-summarize-chat", label: "Summarize Conversation", icon: <AlignLeft size={15} />, category: "Current Editor", action: () => runAI("Summarize this conversation thread with key points and action items.", "ctx-summarize-chat") },
      ],
    };
    return map[currentModule] || [];
  }, [currentModule, runAI]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    const all = [...contextCommands, ...allCommands];
    if (!q) return all;
    return all.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.keywords || []).some((k) => k.includes(q))
    );
  }, [query, allCommands, contextCommands]);

  const recentIds = React.useMemo(() => {
    if (typeof window === "undefined") return [];
    return getRecentCommands();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const recentCommands = React.useMemo(() => {
    if (query) return [];
    return recentIds
      .map((id) => allCommands.find((c) => c.id === id))
      .filter(Boolean) as CommandItem[];
  }, [recentIds, query, allCommands]);

  const displayItems = query ? filtered : [...recentCommands, ...filtered.filter((f) => !recentIds.includes(f.id))];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, displayItems.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (displayItems[selectedIndex]) {
          displayItems[selectedIndex].action();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, displayItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group display items by category
  const grouped = displayItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const cat = recentIds.includes(item.id) && !query ? "Recent" : item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder = ["Recent", "Current Editor", "AI Action", "Navigate"];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Search size={18} style={{ color: "var(--muted-foreground)" }} className="shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, navigate, or ask AI..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", backgroundColor: "var(--muted)" }}
            >
              <Command size={9} />K
            </kbd>
            <button onClick={onClose} className="rounded p-0.5 hover:bg-[var(--muted)]">
              <X size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>

        {/* Context badge */}
        <div className="px-4 py-1.5 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
          {getModuleIcon(currentModule)}
          <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Context: <span className="capitalize font-medium" style={{ color: "var(--foreground)" }}>{currentModule}</span>
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto py-2">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search size={28} style={{ color: "var(--muted-foreground)", opacity: 0.3 }} />
              <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>No commands found</p>
            </div>
          ) : (
            categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat} className="mb-1">
                  <div className="px-4 py-1 flex items-center gap-2">
                    {cat === "Recent" && <Clock size={11} style={{ color: "var(--muted-foreground)" }} />}
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {cat}
                    </span>
                  </div>
                  {items.map((item) => {
                    const idx = displayItems.indexOf(item);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.action()}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isSelected && "bg-[var(--accent)]"
                        )}
                      >
                        <span style={{ color: isSelected ? "var(--primary)" : "var(--muted-foreground)" }}>
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{item.label}</p>
                          {item.description && (
                            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{item.description}</p>
                          )}
                        </div>
                        {isSelected && <ArrowRight size={14} style={{ color: "var(--primary)" }} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center gap-4" style={{ borderColor: "var(--border)" }}>
          {[["↑↓", "Navigate"], ["↵", "Select"], ["Esc", "Close"]].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd
                className="rounded px-1.5 py-0.5 text-[10px] border"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", backgroundColor: "var(--muted)" }}
              >
                {key}
              </kbd>
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useCommandBar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
