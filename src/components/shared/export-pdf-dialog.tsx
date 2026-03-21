"use client";

import React, { useState } from "react";
import { X, FileDown, Check, Loader2 } from "lucide-react";
import { usePrintLayoutStore, PAPER_DIMENSIONS } from "@/store/print-layout-store";
import type { PaperSize, Orientation } from "@/store/print-layout-store";

interface ExportPdfDialogProps {
  open: boolean;
  onClose: () => void;
  htmlContent: string;
  title: string;
  documentType: "document" | "spreadsheet";
}

export function ExportPdfDialog({ open, onClose, htmlContent, title, documentType }: ExportPdfDialogProps) {
  const { settings } = usePrintLayoutStore();

  const [fileName, setFileName] = useState(title.replace(/\.[^/.]+$/, "") || "document");
  const [includeHeaders, setIncludeHeaders] = useState(settings.headerEnabled);
  const [includeFooters, setIncludeFooters] = useState(settings.footerEnabled);
  const [localPaper, setLocalPaper] = useState<PaperSize>(settings.paperSize);
  const [localOrientation, setLocalOrientation] = useState<Orientation>(settings.orientation);
  const [localColor, setLocalColor] = useState(settings.colorMode);
  const [pageRange, setPageRange] = useState<"all" | "pages">(settings.printRange === "pages" ? "pages" : "all");
  const [rangeStart, setRangeStart] = useState(settings.pageRangeStart);
  const [rangeEnd, setRangeEnd] = useState(settings.pageRangeEnd);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  if (!open) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportDone(false);

    try {
      // Build the print-ready HTML with settings applied
      const marginPx = (mm: number) => Math.round((mm / 25.4) * 96);
      const paperDims = PAPER_DIMENSIONS[localPaper];
      const pageW = localOrientation === "portrait" ? paperDims.w : paperDims.h;

      const resolveField = (text: string, page: number, total: number) => {
        const now = new Date();
        return text
          .replace(/\{page\}/g, String(page))
          .replace(/\{pages\}/g, String(total))
          .replace(/\{date\}/g, now.toLocaleDateString())
          .replace(/\{time\}/g, now.toLocaleTimeString())
          .replace(/\{title\}/g, title)
          .replace(/\{author\}/g, "Author")
          .replace(/\{filename\}/g, fileName);
      };

      const headerHtml = includeHeaders && settings.headerEnabled
        ? `<div style="display:flex;justify-content:space-between;font-size:10px;color:#888;border-bottom:1px solid #eee;padding:4px 0;margin-bottom:8px;">
            <span>${resolveField(settings.header.left, 1, 1)}</span>
            <span>${resolveField(settings.header.center, 1, 1)}</span>
            <span>${resolveField(settings.header.right, 1, 1)}</span>
          </div>` : "";

      const footerHtml = includeFooters && settings.footerEnabled
        ? `<div style="display:flex;justify-content:space-between;font-size:10px;color:#888;border-top:1px solid #eee;padding:4px 0;margin-top:8px;">
            <span>${resolveField(settings.footer.left, 1, 1)}</span>
            <span>${resolveField(settings.footer.center, 1, 1)}</span>
            <span>${resolveField(settings.footer.right, 1, 1)}</span>
          </div>` : "";

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${fileName}</title>
<style>
  @page {
    size: ${localPaper} ${localOrientation};
    margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
  }
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
    max-width: ${pageW}px;
    ${localColor === "grayscale" ? "filter: grayscale(100%);" : ""}
    ${localColor === "blackwhite" ? "filter: grayscale(100%) contrast(200%);" : ""}
  }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  img { max-width: 100%; }
  h1 { font-size: 24px; } h2 { font-size: 20px; } h3 { font-size: 16px; }
</style>
</head>
<body>
${headerHtml}
${htmlContent}
${footerHtml}
</body>
</html>`;

      // Use browser print-to-PDF via an iframe
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.left = "-9999px";
      printFrame.style.top = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(fullHtml);
        frameDoc.close();

        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch {
          // Fallback: download as HTML with .pdf hint
          const blob = new Blob([fullHtml], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName}.html`;
          a.click();
          URL.revokeObjectURL(url);
        }

        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }

      setExportDone(true);
      setTimeout(() => { setExportDone(false); onClose(); }, 1200);
    } catch {
      // silent catch
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[460px] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <FileDown size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Export to PDF</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* File name */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>File Name</label>
            <div className="flex items-center gap-1">
              <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="flex-1 rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>.pdf</span>
            </div>
          </div>

          {/* Paper & Orientation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Paper Size</label>
              <select value={localPaper} onChange={(e) => setLocalPaper(e.target.value as PaperSize)} className="w-full rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                {Object.entries(PAPER_DIMENSIONS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Orientation</label>
              <select value={localOrientation} onChange={(e) => setLocalOrientation(e.target.value as Orientation)} className="w-full rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          {/* Color mode */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Color</label>
            <select value={localColor} onChange={(e) => setLocalColor(e.target.value as typeof localColor)} className="w-full rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
              <option value="color">Color</option>
              <option value="grayscale">Grayscale</option>
              <option value="blackwhite">Black & White</option>
            </select>
          </div>

          {/* Page range */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Page Range</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                <input type="radio" name="pdfrange" checked={pageRange === "all"} onChange={() => setPageRange("all")} style={{ accentColor: "var(--primary)" }} />
                All pages
              </label>
              <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                <input type="radio" name="pdfrange" checked={pageRange === "pages"} onChange={() => setPageRange("pages")} style={{ accentColor: "var(--primary)" }} />
                Pages:
                <input type="number" min={1} value={rangeStart} onChange={(e) => setRangeStart(Number(e.target.value))} className="w-14 rounded border px-1.5 py-0.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                to
                <input type="number" min={1} value={rangeEnd} onChange={(e) => setRangeEnd(Number(e.target.value))} className="w-14 rounded border px-1.5 py-0.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </label>
            </div>
          </div>

          {/* Include headers/footers */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={includeHeaders} onChange={(e) => setIncludeHeaders(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
              Include header
            </label>
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={includeFooters} onChange={(e) => setIncludeFooters(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
              Include footer
            </label>
          </div>

          {/* Settings summary */}
          <div className="rounded-md border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Print Settings Applied</p>
            <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              Margins: {settings.margins.top}mm / {settings.margins.right}mm / {settings.margins.bottom}mm / {settings.margins.left}mm |
              Scale: {settings.scaleMode === "actual" ? "100%" : settings.scaleMode === "custom" ? `${settings.scalePercent}%` : "Fit to page"}
              {documentType === "spreadsheet" && settings.printArea && <> | Print Area: {settings.printArea}</>}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="px-4 py-1.5 rounded-md border text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Cancel
          </button>
          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium disabled:opacity-50" style={{ backgroundColor: exportDone ? "#22c55e" : "var(--primary)", color: "var(--primary-foreground)" }}>
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : exportDone ? <Check size={13} /> : <FileDown size={13} />}
            {isExporting ? "Exporting..." : exportDone ? "Done!" : "Export PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
