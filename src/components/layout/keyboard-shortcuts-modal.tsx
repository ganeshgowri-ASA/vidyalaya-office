"use client";

import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { useAppStore } from "@/store/app-store";

const shortcutGroups = [
  {
    title: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "S"], description: "Save current document" },
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Y"], description: "Redo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo (alternate)" },
      { keys: ["Ctrl", "P"], description: "Print / Print preview" },
      { keys: ["Ctrl", "F"], description: "Find in document" },
      { keys: ["Ctrl", "H"], description: "Find and replace" },
      { keys: ["Esc"], description: "Close modal / cancel" },
    ],
  },
  {
    title: "Document Editor",
    shortcuts: [
      { keys: ["Ctrl", "B"], description: "Bold" },
      { keys: ["Ctrl", "I"], description: "Italic" },
      { keys: ["Ctrl", "U"], description: "Underline" },
      { keys: ["Ctrl", "Shift", "L"], description: "Bulleted list" },
      { keys: ["Ctrl", "E"], description: "Center align" },
      { keys: ["Ctrl", "L"], description: "Left align" },
      { keys: ["Ctrl", "R"], description: "Right align" },
      { keys: ["Ctrl", "J"], description: "Justify" },
      { keys: ["Ctrl", "K"], description: "Insert link" },
      { keys: ["Ctrl", "A"], description: "Select all" },
      { keys: ["Ctrl", "X"], description: "Cut" },
      { keys: ["Ctrl", "C"], description: "Copy" },
      { keys: ["Ctrl", "V"], description: "Paste" },
    ],
  },
  {
    title: "Spreadsheet",
    shortcuts: [
      { keys: ["Tab"], description: "Move to next cell" },
      { keys: ["Shift", "Tab"], description: "Move to previous cell" },
      { keys: ["Enter"], description: "Confirm cell & move down" },
      { keys: ["Ctrl", ";"], description: "Insert current date" },
      { keys: ["Ctrl", "Shift", ";"], description: "Insert current time" },
      { keys: ["Ctrl", "C"], description: "Copy cell" },
      { keys: ["Ctrl", "V"], description: "Paste cell" },
      { keys: ["Ctrl", "X"], description: "Cut cell" },
      { keys: ["Delete"], description: "Clear cell contents" },
      { keys: ["F2"], description: "Edit active cell" },
      { keys: ["Ctrl", "Home"], description: "Go to first cell (A1)" },
      { keys: ["Ctrl", "End"], description: "Go to last used cell" },
    ],
  },
  {
    title: "Presentation",
    shortcuts: [
      { keys: ["Ctrl", "M"], description: "New slide" },
      { keys: ["Ctrl", "D"], description: "Duplicate slide" },
      { keys: ["F5"], description: "Start presentation" },
      { keys: ["Esc"], description: "Exit presentation mode" },
      { keys: ["\u2190", "\u2192"], description: "Navigate slides" },
      { keys: ["Ctrl", "A"], description: "Select all elements" },
      { keys: ["Delete"], description: "Delete selected element" },
      { keys: ["Ctrl", "G"], description: "Group elements" },
    ],
  },
  {
    title: "Email",
    shortcuts: [
      { keys: ["C"], description: "Compose new email" },
      { keys: ["R"], description: "Reply to email" },
      { keys: ["Shift", "R"], description: "Reply all" },
      { keys: ["F"], description: "Forward email" },
      { keys: ["E"], description: "Archive email" },
      { keys: ["#"], description: "Delete email" },
      { keys: ["S"], description: "Star / unstar email" },
      { keys: ["U"], description: "Mark as unread" },
      { keys: ["Enter"], description: "Open selected email" },
      { keys: ["Esc"], description: "Close compose" },
    ],
  },
  {
    title: "File Manager",
    shortcuts: [
      { keys: ["F2"], description: "Rename selected file" },
      { keys: ["Delete"], description: "Delete selected file" },
      { keys: ["Ctrl", "C"], description: "Copy file" },
      { keys: ["Ctrl", "V"], description: "Paste file" },
      { keys: ["Ctrl", "A"], description: "Select all files" },
      { keys: ["Enter"], description: "Open file / navigate folder" },
      { keys: ["Backspace"], description: "Go up one folder" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "1"], description: "Go to Dashboard" },
      { keys: ["Ctrl", "2"], description: "Go to Documents" },
      { keys: ["Ctrl", "3"], description: "Go to Spreadsheets" },
      { keys: ["Ctrl", "4"], description: "Go to Presentations" },
      { keys: ["Ctrl", "/"], description: "Focus search bar" },
      { keys: ["Ctrl", "."], description: "Toggle AI assistant" },
    ],
  },
];

export function KeyboardShortcutsModal() {
  const { showKeyboardShortcuts, setShowKeyboardShortcuts } = useAppStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      if (e.key === "Escape" && showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showKeyboardShortcuts, setShowKeyboardShortcuts]);

  if (!showKeyboardShortcuts) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowKeyboardShortcuts(false)}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between border-b px-6 py-4"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <Keyboard size={20} style={{ color: "var(--primary)" }} />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShowKeyboardShortcuts(false)}
            className="rounded-md p-1.5 transition-colors hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ backgroundColor: "var(--background)" }}
                  >
                    <span>{shortcut.description}</span>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {shortcut.keys.map((key, kIdx) => (
                        <span key={kIdx}>
                          <kbd
                            className="inline-block min-w-[24px] rounded border px-1.5 py-0.5 text-center text-xs font-mono font-medium"
                            style={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              color: "var(--foreground)",
                            }}
                          >
                            {key}
                          </kbd>
                          {kIdx < shortcut.keys.length - 1 && (
                            <span
                              className="mx-0.5 text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 border-t px-6 py-3 text-center text-xs"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          Press{" "}
          <kbd
            className="rounded border px-1 py-0.5 text-xs font-mono"
            style={{ borderColor: "var(--border)" }}
          >
            ?
          </kbd>{" "}
          to toggle &bull; Press{" "}
          <kbd
            className="rounded border px-1 py-0.5 text-xs font-mono"
            style={{ borderColor: "var(--border)" }}
          >
            Esc
          </kbd>{" "}
          to close
        </div>
      </div>
    </div>
  );
}
