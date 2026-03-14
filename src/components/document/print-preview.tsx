"use client";

import React, { useEffect, useState } from "react";
import { X, Printer } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { getEditorContent } from "./editor-area";
import { PAGE_SIZES, MARGIN_PRESETS } from "./constants";

export function PrintPreview() {
  const { showPrintPreview, setShowPrintPreview, pageSize, margins, currentFont, currentFontSize, lineSpacing } = useDocumentStore();
  const [content, setContent] = useState("");

  const ps = PAGE_SIZES[pageSize];
  const mg = MARGIN_PRESETS[margins];

  useEffect(() => {
    if (showPrintPreview) {
      setContent(getEditorContent());
    }
  }, [showPrintPreview]);

  if (!showPrintPreview) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 no-print"
        style={{ backgroundColor: "var(--card)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Print Preview</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={() => setShowPrintPreview(false)}
            className="rounded p-1 hover:bg-[var(--muted)]"
          >
            <X size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto flex justify-center py-8">
        <div
          className="shadow-2xl print-full-width"
          style={{
            width: ps.width,
            minHeight: ps.height,
            backgroundColor: "#ffffff",
            color: "#000000",
            paddingTop: mg.top,
            paddingRight: mg.right,
            paddingBottom: mg.bottom,
            paddingLeft: mg.left,
            fontFamily: currentFont,
            fontSize: currentFontSize + "pt",
            lineHeight: lineSpacing,
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
