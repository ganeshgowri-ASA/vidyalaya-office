"use client";

import React, { useEffect, useRef } from "react";
import {
  Scissors, Copy, ClipboardPaste, Bold, Italic, Underline,
  Link, AlignLeft, AlignCenter, AlignRight, Type, Trash2,
} from "lucide-react";

interface DocumentContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function DocumentContextMenu({ x, y, onClose }: DocumentContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    onClose();
  };

  const menuItems: {
    label: string;
    icon: React.ElementType;
    action: () => void;
    shortcut?: string;
    dividerBefore?: boolean;
    danger?: boolean;
  }[] = [
    { label: "Cut", icon: Scissors, action: () => exec("cut"), shortcut: "Ctrl+X" },
    { label: "Copy", icon: Copy, action: () => exec("copy"), shortcut: "Ctrl+C" },
    {
      label: "Paste",
      icon: ClipboardPaste,
      action: () => {
        navigator.clipboard.readText().then((text) => {
          document.execCommand("insertText", false, text);
        }).catch(() => exec("paste"));
        onClose();
      },
      shortcut: "Ctrl+V",
    },
    {
      label: "Delete",
      icon: Trash2,
      action: () => exec("delete"),
      dividerBefore: true,
      danger: true,
    },
    {
      label: "Bold",
      icon: Bold,
      action: () => exec("bold"),
      shortcut: "Ctrl+B",
      dividerBefore: true,
    },
    { label: "Italic", icon: Italic, action: () => exec("italic"), shortcut: "Ctrl+I" },
    { label: "Underline", icon: Underline, action: () => exec("underline"), shortcut: "Ctrl+U" },
    {
      label: "Insert Link",
      icon: Link,
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) exec("createLink", url);
        else onClose();
      },
      dividerBefore: true,
      shortcut: "Ctrl+K",
    },
    {
      label: "Align Left",
      icon: AlignLeft,
      action: () => exec("justifyLeft"),
      dividerBefore: true,
      shortcut: "Ctrl+L",
    },
    {
      label: "Align Center",
      icon: AlignCenter,
      action: () => exec("justifyCenter"),
      shortcut: "Ctrl+E",
    },
    {
      label: "Align Right",
      icon: AlignRight,
      action: () => exec("justifyRight"),
      shortcut: "Ctrl+R",
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[200] rounded-lg border py-1 shadow-xl"
      style={{
        left: adjustedX,
        top: adjustedY,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        minWidth: 180,
      }}
    >
      {menuItems.map((item, i) => (
        <React.Fragment key={i}>
          {item.dividerBefore && (
            <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
          )}
          <button
            onClick={item.action}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-[var(--accent)]"
            style={{ color: item.danger ? "#dc2626" : "var(--foreground)" }}
          >
            <item.icon size={13} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                {item.shortcut}
              </span>
            )}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
