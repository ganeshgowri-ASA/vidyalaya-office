"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlignJustify,
  Upload,
  FileDown,
} from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  onFileLoad?: (numPages: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PDFViewer({ file, onFileLoad, currentPage, onPageChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(100);
  const [fitMode, setFitMode] = useState<"width" | "page" | "none">("width");
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileUrl = useRef<string | null>(null);

  // Create object URL from file
  const [fileUrlState, setFileUrlState] = useState<string | null>(null);
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrlState(url);
      fileUrl.current = url;
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrlState(null);
    }
  }, [file]);

  // Track container width for fit-to-width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width - 48);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onFileLoad?.(numPages);
    // Reset to first page
    onPageChange(1);
  }

  function handleZoom(delta: number) {
    setFitMode("none");
    setZoom((z) => Math.min(200, Math.max(50, z + delta)));
  }

  function handleFitWidth() {
    setFitMode("width");
  }

  function handleFitPage() {
    setFitMode("page");
  }

  // Compute page width
  const pageWidth =
    fitMode === "width"
      ? containerWidth
      : fitMode === "page"
      ? undefined
      : (containerWidth * zoom) / 100;

  const pageScale = fitMode === "page" ? zoom / 100 : undefined;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b px-3 py-2"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        {/* Page navigation */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="rounded p-1 transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: "var(--foreground)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm" style={{ color: "var(--foreground)" }}>
          <input
            type="number"
            value={currentPage}
            min={1}
            max={numPages || 1}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 1 && v <= numPages) onPageChange(v);
            }}
            className="w-10 rounded border text-center text-sm outline-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          {" / "}
          {numPages || "—"}
        </span>
        <button
          onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
          className="rounded p-1 transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: "var(--foreground)" }}
        >
          <ChevronRight size={16} />
        </button>

        <div className="mx-2 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

        {/* Zoom controls */}
        <button
          onClick={() => handleZoom(-10)}
          className="rounded p-1 transition-opacity hover:opacity-70"
          title="Zoom out"
          style={{ color: "var(--foreground)" }}
        >
          <ZoomOut size={16} />
        </button>
        <span className="w-12 text-center text-sm" style={{ color: "var(--foreground)" }}>
          {fitMode === "width" ? "Width" : fitMode === "page" ? "Page" : `${zoom}%`}
        </span>
        <button
          onClick={() => handleZoom(10)}
          className="rounded p-1 transition-opacity hover:opacity-70"
          title="Zoom in"
          style={{ color: "var(--foreground)" }}
        >
          <ZoomIn size={16} />
        </button>

        <div className="mx-2 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

        {/* Fit modes */}
        <button
          onClick={handleFitWidth}
          className={`rounded p-1 transition-opacity hover:opacity-70 ${fitMode === "width" ? "opacity-100" : "opacity-50"}`}
          title="Fit to width"
          style={{ color: "var(--foreground)" }}
        >
          <AlignJustify size={16} />
        </button>
        <button
          onClick={handleFitPage}
          className={`rounded p-1 transition-opacity hover:opacity-70 ${fitMode === "page" ? "opacity-100" : "opacity-50"}`}
          title="Fit to page"
          style={{ color: "var(--foreground)" }}
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ backgroundColor: "var(--background)" }}
      >
        {!fileUrlState ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <FileDown size={48} style={{ color: "var(--primary)", opacity: 0.4 }} />
            <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              Upload a PDF to view
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <Document
              file={fileUrlState}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div
                  className="flex h-64 w-full items-center justify-center"
                  style={{ color: "var(--foreground)" }}
                >
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
                    style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                  />
                </div>
              }
              error={
                <div
                  className="flex h-64 items-center justify-center rounded-lg border p-8 text-sm"
                  style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                >
                  Failed to load PDF. Please try a different file.
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                scale={pageScale}
                renderTextLayer
                renderAnnotationLayer
                className="shadow-lg"
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

// Thumbnail sidebar component
interface ThumbnailSidebarProps {
  file: File | null;
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ThumbnailSidebar({ file, numPages, currentPage, onPageChange }: ThumbnailSidebarProps) {
  const [fileUrlState, setFileUrlState] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrlState(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrlState(null);
    }
  }, [file]);

  if (!fileUrlState || numPages === 0) {
    return (
      <div
        className="flex h-full items-center justify-center p-4"
        style={{ color: "var(--foreground)", opacity: 0.4 }}
      >
        <p className="text-xs text-center">Thumbnails will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-auto p-2">
      <Document file={fileUrlState} loading={null}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className="group relative flex flex-col items-center gap-1 rounded-lg p-1 transition-all"
            style={{
              backgroundColor:
                currentPage === pageNum ? "var(--accent)" : "transparent",
            }}
          >
            <div
              className="overflow-hidden rounded border transition-all"
              style={{
                borderColor:
                  currentPage === pageNum ? "var(--primary)" : "var(--border)",
                borderWidth: currentPage === pageNum ? 2 : 1,
              }}
            >
              <Page
                pageNumber={pageNum}
                width={100}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
            <span
              className="text-xs"
              style={{
                color: currentPage === pageNum ? "var(--primary)" : "var(--foreground)",
                opacity: currentPage === pageNum ? 1 : 0.6,
              }}
            >
              {pageNum}
            </span>
          </button>
        ))}
      </Document>
    </div>
  );
}
