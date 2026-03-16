"use client";

import React, { useRef } from "react";
import { X, Printer, ZoomIn, ZoomOut } from "lucide-react";

interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  htmlContent: string;
  title: string;
}

export function PrintPreviewModal({ open, onClose, htmlContent, title }: PrintPreviewModalProps) {
  const [zoom, setZoom] = React.useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!open) return null;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
  h1 { font-size: 28px; } h2 { font-size: 22px; } h3 { font-size: 18px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  img { max-width: 100%; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>${htmlContent}</body>
</html>`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Print Preview - {title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
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
          <div className="w-px h-5 mx-2" style={{ backgroundColor: "var(--border)" }} />
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--muted)]"
          >
            <X size={16} style={{ color: "var(--foreground)" }} />
          </button>
        </div>
      </div>

      {/* Preview */}
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
              width: 816,
              height: 1056,
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
