"use client";

import React, { useRef, useState } from "react";
import { X, Printer, ZoomIn, ZoomOut, ChevronDown, Settings } from "lucide-react";

type Orientation = "portrait" | "landscape";
type PaperSize = "letter" | "a4" | "legal" | "a3";

interface PageSetup {
  orientation: Orientation;
  paperSize: PaperSize;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerText: string;
  footerText: string;
}

interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  htmlContent: string;
  title: string;
}

const PAPER_SIZES: Record<PaperSize, { label: string; w: number; h: number }> = {
  letter: { label: "Letter (8.5\" × 11\")", w: 816, h: 1056 },
  a4: { label: "A4 (210mm × 297mm)", w: 794, h: 1123 },
  legal: { label: "Legal (8.5\" × 14\")", w: 816, h: 1344 },
  a3: { label: "A3 (297mm × 420mm)", w: 1123, h: 1587 },
};

export function PrintPreviewModal({ open, onClose, htmlContent, title }: PrintPreviewModalProps) {
  const [zoom, setZoom] = useState(80);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [pageSetup, setPageSetup] = useState<PageSetup>({
    orientation: "portrait",
    paperSize: "letter",
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    headerText: "",
    footerText: "",
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!open) return null;

  const paperDims = PAPER_SIZES[pageSetup.paperSize];
  const pageW = pageSetup.orientation === "portrait" ? paperDims.w : paperDims.h;
  const pageH = pageSetup.orientation === "portrait" ? paperDims.h : paperDims.w;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const marginPx = (mm: number) => Math.round((mm / 25.4) * 96);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: ${marginPx(pageSetup.marginTop)}px ${marginPx(pageSetup.marginRight)}px ${marginPx(pageSetup.marginBottom)}px ${marginPx(pageSetup.marginLeft)}px;
    line-height: 1.6;
    color: #333;
  }
  h1 { font-size: 28px; } h2 { font-size: 22px; } h3 { font-size: 18px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  img { max-width: 100%; }
  .print-header {
    position: fixed; top: 8px; left: 0; right: 0; text-align: center;
    font-size: 11px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 4px;
  }
  .print-footer {
    position: fixed; bottom: 8px; left: 0; right: 0; text-align: center;
    font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 4px;
  }
  @media print {
    @page {
      size: ${pageSetup.paperSize} ${pageSetup.orientation};
      margin: ${pageSetup.marginTop}mm ${pageSetup.marginRight}mm ${pageSetup.marginBottom}mm ${pageSetup.marginLeft}mm;
    }
    .print-header, .print-footer { position: fixed; }
  }
</style>
</head>
<body>
${pageSetup.headerText ? `<div class="print-header">${pageSetup.headerText}</div>` : ""}
${htmlContent}
${pageSetup.footerText ? `<div class="print-footer">${pageSetup.footerText}</div>` : ""}
</body>
</html>`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b gap-3"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--foreground)" }}>
          Print Preview — {title}
        </h3>

        <div className="flex items-center gap-2 flex-1 justify-center">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom(Math.max(40, zoom - 10))}
            className="p-1.5 rounded hover:bg-[var(--muted)]"
            title="Zoom Out"
          >
            <ZoomOut size={16} style={{ color: "var(--foreground)" }} />
          </button>
          <span className="text-xs w-12 text-center" style={{ color: "var(--muted-foreground)" }}>
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1.5 rounded hover:bg-[var(--muted)]"
            title="Zoom In"
          >
            <ZoomIn size={16} style={{ color: "var(--foreground)" }} />
          </button>

          <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--border)" }} />

          {/* Page setup toggle */}
          <button
            onClick={() => setShowPageSetup(!showPageSetup)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs"
            style={{
              backgroundColor: showPageSetup ? "var(--accent)" : "transparent",
              color: showPageSetup ? "var(--accent-foreground)" : "var(--foreground)",
            }}
          >
            <Settings size={14} />
            Page Setup
            <ChevronDown size={12} />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Printer size={14} />
            Print
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--foreground)" }} />
          </button>
        </div>
      </div>

      {/* Page Setup Panel */}
      {showPageSetup && (
        <div
          className="border-b px-4 py-3 flex flex-wrap gap-4 items-end"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Orientation */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Orientation
            </label>
            <div className="flex gap-1">
              {(["portrait", "landscape"] as Orientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setPageSetup((p) => ({ ...p, orientation: o }))}
                  className="px-2.5 py-1 rounded text-xs capitalize"
                  style={{
                    backgroundColor: pageSetup.orientation === o ? "var(--primary)" : "var(--background)",
                    color: pageSetup.orientation === o ? "var(--primary-foreground)" : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Size */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Paper Size
            </label>
            <select
              value={pageSetup.paperSize}
              onChange={(e) => setPageSetup((p) => ({ ...p, paperSize: e.target.value as PaperSize }))}
              className="rounded border px-2 py-1 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {Object.entries(PAPER_SIZES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Margins */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Margins (mm)
            </label>
            <div className="flex items-center gap-1.5">
              {(["marginTop", "marginBottom", "marginLeft", "marginRight"] as const).map((key) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pageSetup[key]}
                    onChange={(e) => setPageSetup((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-12 rounded border px-1 py-0.5 text-xs text-center outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {key.replace("margin", "").charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Header
            </label>
            <input
              type="text"
              placeholder="Header text..."
              value={pageSetup.headerText}
              onChange={(e) => setPageSetup((p) => ({ ...p, headerText: e.target.value }))}
              className="rounded border px-2 py-1 text-xs outline-none w-36"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Footer
            </label>
            <input
              type="text"
              placeholder="Footer text..."
              value={pageSetup.footerText}
              onChange={(e) => setPageSetup((p) => ({ ...p, footerText: e.target.value }))}
              className="rounded border px-2 py-1 text-xs outline-none w-36"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex justify-center p-8" style={{ backgroundColor: "#525659" }}>
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={fullHtml}
            className="bg-white shadow-2xl"
            style={{
              width: pageW,
              height: pageH,
              border: "none",
              borderRadius: 4,
            }}
            title="Print Preview"
          />
        </div>
      </div>
    </div>
  );
}
