"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Table2,
  Presentation,
  Workflow,
  FileDown,
  Mail,
  MessageSquare,
  Settings,
  User,
  HelpCircle,
  LayoutDashboard,
  Sparkles,
  Keyboard,
  Plus,
  Moon,
  Video,
  CalendarDays,
  StickyNote,
  CheckSquare,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string[];
  href?: string;
  action?: () => void;
}

function buildItems(callbacks: {
  toggleAI: () => void;
  toggleDarkMode: () => void;
  showShortcuts: () => void;
  newDocument: () => void;
  newSpreadsheet: () => void;
  newPresentation: () => void;
}): CommandItem[] {
  return [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      category: "Navigation",
      href: "/",
      shortcut: ["G", "D"],
    },
    {
      id: "nav-document",
      label: "Document",
      icon: FileText,
      category: "Navigation",
      href: "/document",
    },
    {
      id: "nav-spreadsheet",
      label: "Spreadsheet",
      icon: Table2,
      category: "Navigation",
      href: "/spreadsheet",
    },
    {
      id: "nav-presentation",
      label: "Presentation",
      icon: Presentation,
      category: "Navigation",
      href: "/presentation",
    },
    {
      id: "nav-graphics",
      label: "Graphics",
      icon: Workflow,
      category: "Navigation",
      href: "/graphics",
    },
    {
      id: "nav-pdf",
      label: "PDF Tools",
      icon: FileDown,
      category: "Navigation",
      href: "/pdf",
    },
    {
      id: "nav-email",
      label: "Email",
      icon: Mail,
      category: "Navigation",
      href: "/email",
    },
    {
      id: "nav-chat",
      label: "Chat",
      icon: MessageSquare,
      category: "Navigation",
      href: "/chat",
    },
    {
      id: "nav-meetings",
      label: "Meetings",
      icon: Video,
      category: "Navigation",
      href: "/meetings",
    },
    {
      id: "nav-calendar",
      label: "Calendar",
      icon: CalendarDays,
      category: "Navigation",
      href: "/calendar",
    },
    {
      id: "nav-notes",
      label: "Notes",
      icon: StickyNote,
      category: "Navigation",
      href: "/notes",
    },
    {
      id: "nav-tasks",
      label: "Tasks",
      icon: CheckSquare,
      category: "Navigation",
      href: "/tasks",
    },
    {
      id: "nav-settings",
      label: "Settings",
      icon: Settings,
      category: "Navigation",
      href: "/settings",
      shortcut: ["G", "S"],
    },
    {
      id: "nav-profile",
      label: "Profile",
      icon: User,
      category: "Navigation",
      href: "/profile",
    },
    {
      id: "nav-help",
      label: "Help",
      icon: HelpCircle,
      category: "Navigation",
      href: "/help",
      shortcut: ["?"],
    },
    // Actions
    {
      id: "action-new-doc",
      label: "New Document",
      icon: Plus,
      category: "Actions",
      shortcut: ["Ctrl", "N"],
      action: callbacks.newDocument,
    },
    {
      id: "action-new-sheet",
      label: "New Spreadsheet",
      icon: Plus,
      category: "Actions",
      action: callbacks.newSpreadsheet,
    },
    {
      id: "action-new-pres",
      label: "New Presentation",
      icon: Plus,
      category: "Actions",
      action: callbacks.newPresentation,
    },
    {
      id: "action-ai",
      label: "Toggle AI Assistant",
      icon: Sparkles,
      category: "Actions",
      shortcut: ["Ctrl", "/"],
      action: callbacks.toggleAI,
    },
    {
      id: "action-darkmode",
      label: "Toggle Dark Mode",
      icon: Moon,
      category: "Actions",
      action: callbacks.toggleDarkMode,
    },
    {
      id: "action-shortcuts",
      label: "Keyboard Shortcuts",
      icon: Keyboard,
      category: "Actions",
      shortcut: ["?"],
      action: callbacks.showShortcuts,
    },
  ];
}

export function CommandPalette() {
  const router = useRouter();
  const { showCommandPalette, setShowCommandPalette, setShowKeyboardShortcuts } =
    useAppStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setShowCommandPalette(false);
    setQuery("");
    setSelectedIndex(0);
  }, [setShowCommandPalette]);

  const items = buildItems({
    toggleAI: () => {
      window.dispatchEvent(new CustomEvent("vidyalaya:toggle-ai"));
      close();
    },
    toggleDarkMode: () => {
      window.dispatchEvent(new CustomEvent("vidyalaya:toggle-dark-mode"));
      close();
    },
    showShortcuts: () => {
      setShowKeyboardShortcuts(true);
      close();
    },
    newDocument: () => {
      router.push("/document");
      close();
    },
    newSpreadsheet: () => {
      router.push("/spreadsheet");
      close();
    },
    newPresentation: () => {
      router.push("/presentation");
      close();
    },
  });

  const filtered = query.trim()
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Group filtered items by category, preserving order
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCommandPalette, setShowCommandPalette]);

  // Focus input when palette opens
  useEffect(() => {
    if (showCommandPalette) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [showCommandPalette]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Keyboard navigation (Escape / Arrow / Enter)
  useEffect(() => {
    if (!showCommandPalette) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item) activateItem(item);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCommandPalette, selectedIndex, filtered]);

  // Reset selection whenever query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function activateItem(item: CommandItem) {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
      close();
    }
  }

  if (!showCommandPalette) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Panel */}
      <div
        className={cn(
          "w-full max-w-lg rounded-xl shadow-2xl overflow-hidden",
          "border animate-in fade-in slide-in-from-top-4 duration-200"
        )}
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Search
            className="shrink-0"
            size={18}
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages and actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50"
            style={{ color: "var(--foreground)" }}
          />
          <kbd
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono shrink-0"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <Command size={10} />
            <span>K</span>
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p
              className="text-center text-sm py-8"
              style={{ color: "var(--muted-foreground)" }}
            >
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => {
              const categoryStartIndex = filtered.indexOf(categoryItems[0]);

              return (
                <div key={category}>
                  {/* Category label */}
                  <p
                    className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {category}
                  </p>

                  {categoryItems.map((item, localIdx) => {
                    const absoluteIndex = categoryStartIndex + localIdx;
                    const isSelected = absoluteIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        data-selected={isSelected ? "true" : "false"}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-100"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--primary)"
                            : "transparent",
                          color: isSelected
                            ? "#ffffff"
                            : "var(--card-foreground)",
                        }}
                        onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                        onClick={() => activateItem(item)}
                      >
                        {/* Icon badge */}
                        <span
                          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md"
                          style={{
                            backgroundColor: isSelected
                              ? "rgba(255,255,255,0.15)"
                              : "var(--background)",
                            color: isSelected ? "#ffffff" : "var(--primary)",
                          }}
                        >
                          <Icon size={15} />
                        </span>

                        {/* Label */}
                        <span className="flex-1 truncate">{item.label}</span>

                        {/* Keyboard shortcut badges */}
                        {item.shortcut && item.shortcut.length > 0 && (
                          <span className="flex items-center gap-1 shrink-0">
                            {item.shortcut.map((key, ki) => (
                              <kbd
                                key={ki}
                                className="px-1.5 py-0.5 rounded text-xs font-mono"
                                style={{
                                  backgroundColor: isSelected
                                    ? "rgba(255,255,255,0.2)"
                                    : "var(--background)",
                                  color: isSelected
                                    ? "#ffffff"
                                    : "var(--muted-foreground)",
                                  border: `1px solid ${
                                    isSelected
                                      ? "rgba(255,255,255,0.3)"
                                      : "var(--border)"
                                  }`,
                                }}
                              >
                                {key}
                              </kbd>
                            ))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t text-xs"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd
                className="px-1 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                ↑
              </kbd>
              <kbd
                className="px-1 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd
                className="px-1 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                ↵
              </kbd>
              <span>Open</span>
            </span>
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className="px-1 py-0.5 rounded font-mono"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              Esc
            </kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
