"use client";

import React from "react";
import { X } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

interface StyleCard {
  name: string;
  tag: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color: string;
  marginBottom: string;
}

const STYLES: StyleCard[] = [
  {
    name: "Normal",
    tag: "p",
    fontSize: "11pt",
    fontWeight: "normal",
    lineHeight: "1.15",
    color: "#000",
    marginBottom: "0",
  },
  {
    name: "Title",
    tag: "h1",
    fontSize: "26pt",
    fontWeight: "bold",
    lineHeight: "1.2",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  {
    name: "Subtitle",
    tag: "h2",
    fontSize: "15pt",
    fontWeight: "normal",
    lineHeight: "1.3",
    color: "#666",
    marginBottom: "4px",
  },
  {
    name: "Heading 1",
    tag: "h1",
    fontSize: "20pt",
    fontWeight: "bold",
    lineHeight: "1.2",
    color: "#1565C0",
    marginBottom: "4px",
  },
  {
    name: "Heading 2",
    tag: "h2",
    fontSize: "16pt",
    fontWeight: "bold",
    lineHeight: "1.25",
    color: "#1565C0",
    marginBottom: "3px",
  },
  {
    name: "Heading 3",
    tag: "h3",
    fontSize: "14pt",
    fontWeight: "bold",
    lineHeight: "1.3",
    color: "#1a1a1a",
    marginBottom: "2px",
  },
  {
    name: "Heading 4",
    tag: "h4",
    fontSize: "12pt",
    fontWeight: "bold",
    lineHeight: "1.35",
    color: "#1a1a1a",
    marginBottom: "2px",
  },
  {
    name: "Heading 5",
    tag: "h5",
    fontSize: "11pt",
    fontWeight: "bold",
    lineHeight: "1.4",
    color: "#444",
    marginBottom: "2px",
  },
  {
    name: "Heading 6",
    tag: "h6",
    fontSize: "10pt",
    fontWeight: "bold",
    lineHeight: "1.4",
    color: "#666",
    marginBottom: "2px",
  },
];

function applyStyle(style: StyleCard) {
  const editor = document.getElementById("doc-editor");
  if (!editor) return;
  editor.focus();
  document.execCommand("formatBlock", false, style.tag);

  // Apply additional styling via fontSize command workaround
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const block = sel.anchorNode?.parentElement?.closest(
      "h1,h2,h3,h4,h5,h6,p"
    );
    if (block) {
      (block as HTMLElement).style.fontSize = style.fontSize;
      (block as HTMLElement).style.fontWeight = style.fontWeight;
      (block as HTMLElement).style.lineHeight = style.lineHeight;
      (block as HTMLElement).style.color = style.color;
    }
  }
}

export function StylesPanel() {
  const { showStylesPanel, toggleStylesPanel } = useDocumentStore();

  if (!showStylesPanel) return null;

  return (
    <div
      className="no-print absolute right-4 top-4 z-40 rounded-lg border shadow-xl"
      style={{
        width: 220,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Styles
        </span>
        <button
          onClick={toggleStylesPanel}
          className="rounded p-0.5 hover:bg-[var(--muted)]"
          title="Close Styles Panel"
        >
          <X size={14} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Style cards */}
      <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
        {STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => applyStyle(style)}
            className="w-full rounded border px-3 py-2 text-left transition-colors hover:bg-[var(--muted)] cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            title={`Apply ${style.name} style`}
          >
            <span
              style={{
                fontSize: Math.min(parseFloat(style.fontSize), 16) + "pt",
                fontWeight: style.fontWeight,
                color: style.color,
                lineHeight: 1.3,
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {style.name}
            </span>
            <span
              className="text-[9px] mt-0.5 block"
              style={{ color: "var(--muted-foreground)" }}
            >
              {style.tag.toUpperCase()} &middot; {style.fontSize}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
