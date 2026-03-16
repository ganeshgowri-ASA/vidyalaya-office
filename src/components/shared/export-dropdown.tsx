"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download, FileText, FileSpreadsheet, Image, FileType2, FileCode,
  FileJson, Printer, ChevronDown, Loader2,
} from "lucide-react";
import type { DocumentType, ExportFormat } from "@/lib/export-manager";
import { SUPPORTED_EXPORTS } from "@/lib/export-manager";

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  docx: <FileText size={14} />,
  pdf: <FileType2 size={14} />,
  html: <FileCode size={14} />,
  markdown: <FileCode size={14} />,
  txt: <FileText size={14} />,
  xlsx: <FileSpreadsheet size={14} />,
  csv: <FileText size={14} />,
  json: <FileJson size={14} />,
  pptx: <FileText size={14} />,
  png: <Image size={14} />,
  images: <Image size={14} />,
  "text-extract": <FileText size={14} />,
};

interface ExportDropdownProps {
  documentType: DocumentType;
  onExport: (format: ExportFormat) => void;
  onPrint?: () => void;
  onPrintPreview?: () => void;
  isExporting?: boolean;
  exportProgress?: { percent: number; message: string };
}

export function ExportDropdown({
  documentType,
  onExport,
  onPrint,
  onPrintPreview,
  isExporting,
  exportProgress,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const formats = SUPPORTED_EXPORTS[documentType] || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isExporting}
        className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        {isExporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        {isExporting ? "Exporting..." : "Export"}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border shadow-lg py-1"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Export formats */}
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Export As
          </div>
          {formats.map((fmt) => (
            <button
              key={fmt.format}
              onClick={() => {
                onExport(fmt.format);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              {FORMAT_ICONS[fmt.format] || <Download size={14} />}
              {fmt.label}
            </button>
          ))}

          {/* Print options */}
          {(onPrint || onPrintPreview) && (
            <>
              <hr className="my-1" style={{ borderColor: "var(--border)" }} />
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Print
              </div>
              {onPrintPreview && (
                <button
                  onClick={() => { onPrintPreview(); setOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <FileText size={14} />
                  Print Preview
                </button>
              )}
              {onPrint && (
                <button
                  onClick={() => { onPrint(); setOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <Printer size={14} />
                  Print (Ctrl+P)
                </button>
              )}
            </>
          )}

          {/* Progress indicator */}
          {isExporting && exportProgress && (
            <>
              <hr className="my-1" style={{ borderColor: "var(--border)" }} />
              <div className="px-4 py-2">
                <div className="text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>
                  {exportProgress.message}
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${exportProgress.percent}%`,
                      backgroundColor: "var(--primary)",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
