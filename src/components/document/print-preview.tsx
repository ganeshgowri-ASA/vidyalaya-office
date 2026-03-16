"use client";

import React, { useEffect, useState } from "react";
import { X, Printer, ZoomIn, ZoomOut, Minus, Plus, Columns2, FileText } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { getEditorContent } from "./editor-area";
import { PAGE_SIZES, MARGIN_PRESETS } from "./constants";

export function PrintPreview() {
  const { showPrintPreview, setShowPrintPreview, pageSize, margins, currentFont, currentFontSize, lineSpacing, orientation } = useDocumentStore();
  const [content, setContent] = useState("");
  const [previewZoom, setPreviewZoom] = useState(70);
  const [multiPage, setMultiPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ps = PAGE_SIZES[pageSize];
  const mg = MARGIN_PRESETS[margins];

  // Swap dimensions for landscape
  const pageWidth = orientation === "landscape" ? ps.height : ps.width;
  const pageHeight = orientation === "landscape" ? ps.width : ps.height;

  useEffect(() => {
    if (showPrintPreview) {
      setContent(getEditorContent());
    }
  }, [showPrintPreview]);

  if (!showPrintPreview) return null;

  const handlePrint = () => {
    window.print();
  };

  // Estimate pages based on content length
  const estimatedPages = Math.max(1, Math.ceil(content.length / 3000));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 no-print"
        style={{ backgroundColor: "var(--card)" }}>
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Print Preview</h2>

          {/* Page info */}
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Page {currentPage} of {estimatedPages}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setPreviewZoom(Math.max(25, previewZoom - 10))}
              className="p-0.5 rounded hover:bg-[var(--muted)]">
              <Minus size={12} style={{ color: "var(--foreground)" }} />
            </button>
            <input type="range" min={25} max={200} step={5} value={previewZoom}
              onChange={(e) => setPreviewZoom(parseInt(e.target.value))}
              className="w-24 h-1" style={{ accentColor: "var(--primary)" }} />
            <button onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
              className="p-0.5 rounded hover:bg-[var(--muted)]">
              <Plus size={12} style={{ color: "var(--foreground)" }} />
            </button>
            <span className="text-[10px] w-10 text-center" style={{ color: "var(--foreground)" }}>{previewZoom}%</span>
          </div>

          {/* View buttons */}
          <div className="flex gap-1">
            <button onClick={() => setMultiPage(false)}
              className={`p-1.5 rounded border ${!multiPage ? "bg-[var(--muted)]" : ""}`}
              style={{ borderColor: "var(--border)" }} title="Single page">
              <FileText size={14} style={{ color: "var(--foreground)" }} />
            </button>
            <button onClick={() => setMultiPage(true)}
              className={`p-1.5 rounded border ${multiPage ? "bg-[var(--muted)]" : ""}`}
              style={{ borderColor: "var(--border)" }} title="Multi-page view">
              <Columns2 size={14} style={{ color: "var(--foreground)" }} />
            </button>
          </div>

          {/* Zoom presets */}
          <div className="flex gap-1">
            {[50, 75, 100].map((z) => (
              <button key={z} onClick={() => setPreviewZoom(z)}
                className={`px-2 py-1 rounded border text-[10px] ${previewZoom === z ? "bg-[var(--muted)]" : ""}`}
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                {z}%
              </button>
            ))}
            <button onClick={() => setPreviewZoom(70)}
              className="px-2 py-1 rounded border text-[10px]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Fit Page
            </button>
            <button onClick={() => setPreviewZoom(100)}
              className="px-2 py-1 rounded border text-[10px]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Fit Width
            </button>
          </div>

          <button onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Printer size={14} />
            Print
          </button>
          <button onClick={() => setShowPrintPreview(false)}
            className="rounded p-1 hover:bg-[var(--muted)]">
            <X size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto flex justify-center py-8" style={{ backgroundColor: "#525659" }}>
        <div className={multiPage ? "flex flex-wrap gap-6 justify-center items-start px-8" : "flex flex-col items-center gap-6"}>
          {Array.from({ length: multiPage ? estimatedPages : 1 }, (_, pageIndex) => (
            <div key={pageIndex}
              className="shadow-2xl print-full-width flex-shrink-0"
              style={{
                width: pageWidth,
                minHeight: pageHeight,
                backgroundColor: "#ffffff",
                color: "#000000",
                paddingTop: mg.top,
                paddingRight: mg.right,
                paddingBottom: mg.bottom,
                paddingLeft: mg.left,
                fontFamily: currentFont,
                fontSize: currentFontSize + "pt",
                lineHeight: lineSpacing,
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: "top center",
                marginBottom: multiPage ? `${-parseInt(pageHeight) * (1 - previewZoom / 100)}px` : undefined,
              }}>
              {/* Page number header */}
              <div className="text-center text-[9px] mb-4" style={{ color: "#999" }}>
                Page {pageIndex + 1}
              </div>
              {pageIndex === 0 ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <span className="text-sm" style={{ color: "#999" }}>Page {pageIndex + 1} content</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
