"use client";

import React, { useState } from "react";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_CATEGORIES = [
  {
    name: "General",
    shortcuts: [
      { keys: "Ctrl+S", description: "Save document" },
      { keys: "Ctrl+P", description: "Print document" },
      { keys: "Ctrl+Z", description: "Undo" },
      { keys: "Ctrl+Y", description: "Redo" },
      { keys: "Ctrl+A", description: "Select all" },
      { keys: "Ctrl+F", description: "Find" },
      { keys: "Ctrl+H", description: "Find & Replace" },
      { keys: "F7", description: "Spell check" },
      { keys: "Ctrl+Shift+?", description: "Keyboard shortcuts" },
    ],
  },
  {
    name: "Formatting",
    shortcuts: [
      { keys: "Ctrl+B", description: "Bold" },
      { keys: "Ctrl+I", description: "Italic" },
      { keys: "Ctrl+U", description: "Underline" },
      { keys: "Ctrl+Shift+X", description: "Strikethrough" },
      { keys: "Ctrl+=", description: "Subscript" },
      { keys: "Ctrl+Shift+=", description: "Superscript" },
      { keys: "Ctrl+Shift+>", description: "Increase font size" },
      { keys: "Ctrl+Shift+<", description: "Decrease font size" },
    ],
  },
  {
    name: "Paragraph",
    shortcuts: [
      { keys: "Ctrl+E", description: "Center align" },
      { keys: "Ctrl+L", description: "Left align" },
      { keys: "Ctrl+R", description: "Right align" },
      { keys: "Ctrl+J", description: "Justify" },
      { keys: "Ctrl+1", description: "Single spacing" },
      { keys: "Ctrl+2", description: "Double spacing" },
      { keys: "Ctrl+M", description: "Increase indent" },
      { keys: "Ctrl+Shift+M", description: "Decrease indent" },
    ],
  },
  {
    name: "Clipboard",
    shortcuts: [
      { keys: "Ctrl+C", description: "Copy" },
      { keys: "Ctrl+X", description: "Cut" },
      { keys: "Ctrl+V", description: "Paste" },
      { keys: "Ctrl+Shift+V", description: "Paste plain text" },
    ],
  },
  {
    name: "Navigation",
    shortcuts: [
      { keys: "Home", description: "Start of line" },
      { keys: "End", description: "End of line" },
      { keys: "Ctrl+Home", description: "Start of document" },
      { keys: "Ctrl+End", description: "End of document" },
      { keys: "Page Up", description: "Page up" },
      { keys: "Page Down", description: "Page down" },
      { keys: "Ctrl+↑", description: "Previous paragraph" },
      { keys: "Ctrl+↓", description: "Next paragraph" },
    ],
  },
  {
    name: "Insert",
    shortcuts: [
      { keys: "Enter", description: "New paragraph" },
      { keys: "Shift+Enter", description: "Line break" },
      { keys: "Ctrl+Enter", description: "Page break" },
      { keys: "Tab", description: "Indent / Tab" },
      { keys: "Shift+Tab", description: "Outdent" },
    ],
  },
];

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[600px] max-h-[80vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Keyboard size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="flex">
          {/* Category sidebar */}
          <div className="w-40 border-r overflow-y-auto" style={{ borderColor: "var(--border)" }}>
            {SHORTCUT_CATEGORIES.map((cat, i) => (
              <button key={cat.name} onClick={() => setActiveCategory(i)}
                className={`w-full text-left text-xs px-4 py-2.5 ${
                  activeCategory === i ? "bg-[var(--muted)] font-medium" : "hover:bg-[var(--muted)]"
                }`}
                style={{ color: activeCategory === i ? "var(--primary)" : "var(--foreground)" }}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Shortcuts list */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[55vh]">
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--foreground)" }}>
              {SHORTCUT_CATEGORIES[activeCategory].name}
            </h3>
            <div className="space-y-1">
              {SHORTCUT_CATEGORIES[activeCategory].shortcuts.map((sc) => (
                <div key={sc.keys} className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: "var(--border)" }}>
                  <span className="text-xs" style={{ color: "var(--foreground)" }}>{sc.description}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.split("+").map((key, i, arr) => (
                      <React.Fragment key={key}>
                        <kbd className="px-2 py-0.5 rounded text-[10px] font-mono border"
                          style={{
                            backgroundColor: "var(--muted)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}>
                          {key}
                        </kbd>
                        {i < arr.length - 1 && (
                          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            Press Ctrl+Shift+/ to toggle this dialog
          </span>
        </div>
      </div>
    </div>
  );
}
