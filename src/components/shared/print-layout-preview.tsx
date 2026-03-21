"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Settings, FileDown, Columns2, FileText, Minus, Plus,
} from "lucide-react";
import { usePrintLayoutStore, PAPER_DIMENSIONS } from "@/store/print-layout-store";

interface PrintLayoutPreviewProps {
  htmlContent: string;
  title: string;
  documentType: "document" | "spreadsheet";
  onExportPdf?: () => void;
  onPageSetup?: () => void;
}

function resolveAutoField(text: string, pageNum: number, totalPages: number, title: string): string {
  const now = new Date();
  return text
    .replace(/\{page\}/g, String(pageNum))
    .replace(/\{pages\}/g, String(totalPages))
    .replace(/\{date\}/g, now.toLocaleDateString())
    .replace(/\{time\}/g, now.toLocaleTimeString())
    .replace(/\{title\}/g, title)
    .replace(/\{author\}/g, "Author")
    .replace(/\{filename\}/g, title);
}

export function PrintLayoutPreview({ htmlContent, title, documentType, onExportPdf, onPageSetup }: PrintLayoutPreviewProps) {
  const {
    showPrintLayoutPreview, setShowPrintLayoutPreview,
    previewZoom, setPreviewZoom,
    currentPreviewPage, setCurrentPreviewPage,
    settings,
  } = usePrintLayoutStore();

  const [multiPage, setMultiPage] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const paper = PAPER_DIMENSIONS[settings.paperSize];
  const pageW = settings.orientation === "portrait" ? paper.w : paper.h;
  const pageH = settings.orientation === "portrait" ? paper.h : paper.w;
  const marginPx = useCallback((mm: number) => Math.round((mm / 25.4) * 96), []);

  // Split content into pages based on available height
  useEffect(() => {
    if (!showPrintLayoutPreview || !htmlContent) return;

    const usableHeight = pageH - marginPx(settings.margins.top) - marginPx(settings.margins.bottom) - 50; // 50px for header/footer
    // Estimate: ~18px per line, content length approach
    const charsPerPage = Math.max(500, Math.floor((usableHeight / 18) * 80));
    const rawPages: string[] = [];

    if (htmlContent.length <= charsPerPage) {
      rawPages.push(htmlContent);
    } else {
      let remaining = htmlContent;
      while (remaining.length > 0) {
        // Try to break at a paragraph or tag boundary
        let breakPoint = charsPerPage;
        if (remaining.length > charsPerPage) {
          // Look for a closing tag near the break point
          const searchArea = remaining.substring(Math.max(0, charsPerPage - 200), charsPerPage + 200);
          const tagMatch = searchArea.lastIndexOf("</p>");
          if (tagMatch > 0) {
            breakPoint = Math.max(0, charsPerPage - 200) + tagMatch + 4;
          } else {
            const brMatch = searchArea.lastIndexOf("<br");
            if (brMatch > 0) breakPoint = Math.max(0, charsPerPage - 200) + brMatch;
          }
        } else {
          breakPoint = remaining.length;
        }
        rawPages.push(remaining.substring(0, breakPoint));
        remaining = remaining.substring(breakPoint);
      }
    }
    setPages(rawPages);
    setCurrentPreviewPage(1);
  }, [showPrintLayoutPreview, htmlContent, pageH, marginPx, settings.margins.top, settings.margins.bottom, setCurrentPreviewPage]);

  if (!showPrintLayoutPreview) return null;

  const totalPages = pages.length || 1;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const headerHtml = settings.headerEnabled
      ? `<div class="page-header"><span class="hl">${resolveAutoField(settings.header.left, 0, totalPages, title)}</span><span class="hc">${resolveAutoField(settings.header.center, 0, totalPages, title)}</span><span class="hr">${resolveAutoField(settings.header.right, 0, totalPages, title)}</span></div>`
      : "";
    const footerHtml = settings.footerEnabled
      ? `<div class="page-footer"><span class="fl">${resolveAutoField(settings.footer.left, 0, totalPages, title)}</span><span class="fc">${resolveAutoField(settings.footer.center, 0, totalPages, title)}</span><span class="fr">${resolveAutoField(settings.footer.right, 0, totalPages, title)}</span></div>`
      : "";

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        @page { size: ${settings.paperSize} ${settings.orientation}; margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm; }
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
        .page-header, .page-footer { position: fixed; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 10px; color: #888; padding: 0 4px; }
        .page-header { top: 0; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .page-footer { bottom: 0; border-top: 1px solid #eee; padding-top: 4px; }
        table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 6px; } img { max-width: 100%; }
        ${settings.colorMode === "grayscale" ? "body { filter: grayscale(100%); }" : ""}
        ${settings.colorMode === "blackwhite" ? "body { filter: grayscale(100%) contrast(200%); }" : ""}
      </style></head><body>${headerHtml}${htmlContent}${footerHtml}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const renderHeaderFooter = (section: "header" | "footer", pageNum: number) => {
    const enabled = section === "header" ? settings.headerEnabled : settings.footerEnabled;
    if (!enabled) return null;

    let fields = section === "header" ? settings.header : settings.footer;
    if (settings.differentFirstPage && pageNum === 1) {
      fields = section === "header" ? settings.firstPageHeader : settings.firstPageFooter;
    }

    return (
      <div className="flex justify-between items-center px-2" style={{ fontSize: 9, color: "#888", borderBottom: section === "header" ? "1px solid #eee" : "none", borderTop: section === "footer" ? "1px solid #eee" : "none", padding: "3px 4px", minHeight: 18 }}>
        <span>{resolveAutoField(fields.left, pageNum, totalPages, title)}</span>
        <span>{resolveAutoField(fields.center, pageNum, totalPages, title)}</span>
        <span>{resolveAutoField(fields.right, pageNum, totalPages, title)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Print Layout Preview
          </h3>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Page {currentPreviewPage} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPreviewPage(Math.max(1, currentPreviewPage - 1))} disabled={currentPreviewPage <= 1} className="p-1 rounded hover:bg-[var(--muted)] disabled:opacity-30">
              <ChevronLeft size={14} style={{ color: "var(--foreground)" }} />
            </button>
            <button onClick={() => setCurrentPreviewPage(Math.min(totalPages, currentPreviewPage + 1))} disabled={currentPreviewPage >= totalPages} className="p-1 rounded hover:bg-[var(--muted)] disabled:opacity-30">
              <ChevronRight size={14} style={{ color: "var(--foreground)" }} />
            </button>
          </div>

          <div className="w-px h-5" style={{ backgroundColor: "var(--border)" }} />

          {/* Zoom */}
          <div className="flex items-center gap-1 border rounded-md px-1.5 py-0.5" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setPreviewZoom(previewZoom - 10)} className="p-0.5 rounded hover:bg-[var(--muted)]">
              <Minus size={12} style={{ color: "var(--foreground)" }} />
            </button>
            <input type="range" min={25} max={200} step={5} value={previewZoom} onChange={(e) => setPreviewZoom(parseInt(e.target.value))} className="w-20 h-1" style={{ accentColor: "var(--primary)" }} />
            <button onClick={() => setPreviewZoom(previewZoom + 10)} className="p-0.5 rounded hover:bg-[var(--muted)]">
              <Plus size={12} style={{ color: "var(--foreground)" }} />
            </button>
            <span className="text-[10px] w-9 text-center" style={{ color: "var(--foreground)" }}>{previewZoom}%</span>
          </div>

          {/* View toggle */}
          <div className="flex gap-0.5">
            <button onClick={() => setMultiPage(false)} className={`p-1 rounded border ${!multiPage ? "bg-[var(--muted)]" : ""}`} style={{ borderColor: "var(--border)" }} title="Single page">
              <FileText size={13} style={{ color: "var(--foreground)" }} />
            </button>
            <button onClick={() => setMultiPage(true)} className={`p-1 rounded border ${multiPage ? "bg-[var(--muted)]" : ""}`} style={{ borderColor: "var(--border)" }} title="Multi-page">
              <Columns2 size={13} style={{ color: "var(--foreground)" }} />
            </button>
          </div>

          <div className="w-px h-5" style={{ backgroundColor: "var(--border)" }} />

          {/* Page setup button */}
          {onPageSetup && (
            <button onClick={onPageSetup} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-[var(--muted)]" style={{ color: "var(--foreground)" }}>
              <Settings size={13} /> Page Setup
            </button>
          )}

          {/* Export PDF */}
          {onExportPdf && (
            <button onClick={onExportPdf} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-[var(--muted)]" style={{ color: "var(--foreground)" }}>
              <FileDown size={13} /> Export PDF
            </button>
          )}

          {/* Print */}
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Printer size={14} /> Print
          </button>

          <button onClick={() => setShowPrintLayoutPreview(false)} className="p-1.5 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Page area */}
      <div className="flex-1 overflow-auto flex justify-center py-6" style={{ backgroundColor: "#525659" }}>
        <div ref={contentRef} className={multiPage ? "flex flex-wrap gap-6 justify-center items-start px-6" : "flex flex-col items-center gap-6"}>
          {(multiPage ? pages : [pages[currentPreviewPage - 1] || ""]).map((pageContent, idx) => {
            const pageNum = multiPage ? idx + 1 : currentPreviewPage;
            return (
              <div key={idx} className="shadow-2xl flex-shrink-0 flex flex-col" style={{
                width: pageW,
                minHeight: pageH,
                backgroundColor: "#ffffff",
                color: "#000000",
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: "top center",
                marginBottom: multiPage ? `${-pageH * (1 - previewZoom / 100)}px` : undefined,
              }}>
                {/* Header */}
                <div style={{ paddingLeft: marginPx(settings.margins.left), paddingRight: marginPx(settings.margins.right), paddingTop: marginPx(Math.min(settings.margins.top, 10)) }}>
                  {renderHeaderFooter("header", pageNum)}
                </div>

                {/* Content */}
                <div className="flex-1" style={{
                  paddingTop: marginPx(settings.margins.top) - (settings.headerEnabled ? 18 : 0),
                  paddingBottom: marginPx(settings.margins.bottom) - (settings.footerEnabled ? 18 : 0),
                  paddingLeft: marginPx(settings.margins.left),
                  paddingRight: marginPx(settings.margins.right),
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11pt",
                  lineHeight: 1.6,
                  overflow: "hidden",
                  filter: settings.colorMode === "grayscale" ? "grayscale(100%)" : settings.colorMode === "blackwhite" ? "grayscale(100%) contrast(200%)" : "none",
                }}>
                  <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                </div>

                {/* Page break indicator */}
                {settings.showPageBreaks && idx < (multiPage ? pages.length - 1 : 0) && (
                  <div style={{ borderTop: "2px dashed #3b82f6", marginLeft: marginPx(settings.margins.left), marginRight: marginPx(settings.margins.right), position: "relative" }}>
                    <span style={{ position: "absolute", top: -10, right: 0, fontSize: 9, color: "#3b82f6", backgroundColor: "#fff", padding: "0 4px" }}>Page Break</span>
                  </div>
                )}

                {/* Footer */}
                <div style={{ paddingLeft: marginPx(settings.margins.left), paddingRight: marginPx(settings.margins.right), paddingBottom: marginPx(Math.min(settings.margins.bottom, 10)) }}>
                  {renderHeaderFooter("footer", pageNum)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
