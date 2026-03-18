'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

interface Shortcut {
  key: string;
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { key: 'Ctrl + Z', description: 'Undo' },
      { key: 'Ctrl + Y', description: 'Redo' },
      { key: 'Ctrl + C', description: 'Copy selected element' },
      { key: 'Ctrl + V', description: 'Paste element' },
      { key: 'Delete / Backspace', description: 'Delete selected element' },
      { key: '?', description: 'Show keyboard shortcuts' },
    ],
  },
  {
    title: 'Slideshow',
    shortcuts: [
      { key: 'F5', description: 'Start slideshow from beginning' },
      { key: 'Shift + F5', description: 'Start from current slide' },
      { key: 'Escape', description: 'Exit slideshow' },
      { key: '→ / Space / N', description: 'Next slide' },
      { key: '← / Backspace / P', description: 'Previous slide' },
      { key: 'Home', description: 'Go to first slide' },
      { key: 'End', description: 'Go to last slide' },
      { key: 'B', description: 'Black screen' },
      { key: 'W', description: 'White screen' },
    ],
  },
  {
    title: 'Presenter Tools',
    shortcuts: [
      { key: 'L', description: 'Toggle laser pointer' },
      { key: 'P', description: 'Toggle pen tool' },
      { key: 'H', description: 'Toggle highlighter' },
      { key: 'C', description: 'Clear annotations' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { key: 'Ctrl + A', description: 'Select all elements' },
      { key: 'Ctrl + G', description: 'Group elements' },
      { key: 'Ctrl + Shift + G', description: 'Ungroup elements' },
      { key: 'Ctrl + [', description: 'Send backward' },
      { key: 'Ctrl + ]', description: 'Bring forward' },
      { key: 'Ctrl + Shift + [', description: 'Send to back' },
      { key: 'Ctrl + Shift + ]', description: 'Bring to front' },
      { key: 'Arrow Keys', description: 'Nudge selected element' },
      { key: 'Shift + Arrow', description: 'Nudge element (large step)' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { key: 'Ctrl + +', description: 'Zoom in' },
      { key: 'Ctrl + -', description: 'Zoom out' },
      { key: 'Ctrl + 0', description: 'Reset zoom to 100%' },
      { key: 'Ctrl + Shift + G', description: 'Toggle grid' },
      { key: 'Ctrl + Shift + R', description: 'Toggle rulers' },
    ],
  },
  {
    title: 'Insert',
    shortcuts: [
      { key: 'Ctrl + Shift + T', description: 'Insert text box' },
      { key: 'Ctrl + Shift + I', description: 'Insert image' },
    ],
  },
  {
    title: 'Slides',
    shortcuts: [
      { key: 'Ctrl + M', description: 'Add new slide' },
      { key: 'Ctrl + D', description: 'Duplicate slide' },
      { key: 'Ctrl + Shift + Delete', description: 'Delete slide' },
    ],
  },
];

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-mono font-medium shadow-sm"
      style={{
        background: 'var(--muted)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
        boxShadow: '0 1px 0 var(--border)',
      }}
    >
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsModal() {
  const { showKeyboardShortcuts, setShowKeyboardShortcuts } = usePresentationStore();

  if (!showKeyboardShortcuts) return null;

  // Split into two columns
  const half = Math.ceil(SHORTCUT_GROUPS.length / 2);
  const leftGroups = SHORTCUT_GROUPS.slice(0, half);
  const rightGroups = SHORTCUT_GROUPS.slice(half);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60" onClick={() => setShowKeyboardShortcuts(false)}>
      <div
        className="rounded-xl shadow-2xl border w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <Keyboard size={18} style={{ color: 'var(--primary)' }} />
            <span className="font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>Keyboard Shortcuts</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Press ? to toggle
            </span>
          </div>
          <button onClick={() => setShowKeyboardShortcuts(false)} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-6">
            {[leftGroups, rightGroups].map((groups, colIdx) => (
              <div key={colIdx} className="space-y-5">
                {groups.map(group => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
                      {group.title}
                    </h3>
                    <div className="space-y-1.5">
                      {group.shortcuts.map(shortcut => (
                        <div key={shortcut.key} className="flex items-center justify-between gap-3">
                          <span className="text-sm" style={{ color: 'var(--card-foreground)' }}>
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {shortcut.key.split(' + ').map((part, i, arr) => (
                              <React.Fragment key={i}>
                                <KeyBadge>{part}</KeyBadge>
                                {i < arr.length - 1 && (
                                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Click outside or press Escape to close
          </span>
          <button
            onClick={() => setShowKeyboardShortcuts(false)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
