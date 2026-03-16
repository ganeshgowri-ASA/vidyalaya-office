"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize, Maximize2,
  RotateCw, RotateCcw, BookOpen, Upload, GripVertical, X, Trash2,
  FilePlus, Download, Printer, Search, Info, FileCheck, Fullscreen,
  Minimize2, LayoutGrid, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PdfjsLib = typeof import("pdfjs-dist");
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

interface Bookmark {
  id: string;
  title: string;
  page: number;
  level: number;
}

interface PdfViewerProps {
  onPdfLoaded?: (doc: PDFDocumentProxy, bytes: ArrayBuffer, name: string) => void;
  onShowSearch?: () => void;
  onShowProperties?: () => void;
  onShowPrint?: () => void;
  onShowExport?: () => void;
  externalPdfDoc?: PDFDocumentProxy | null;
  externalPdfBytes?: ArrayBuffer | null;
  externalPdfName?: string;
  externalAnnotations?: Annotation[];
  editMode?: string;
  overlayHandlers?: {
    onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  };
  overlayCanvasRef?: React.RefObject<HTMLCanvasElement>;
  mainCanvasRef?: React.RefObject<HTMLCanvasElement>;
  renderAnnotationsOnPage?: (pageNum: number) => void;
}

interface Annotation {
  id: string;
  type: string;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  stamp?: string;
  signatureDataUrl?: string;
  shapeType?: string;
  noteColor?: string;
  noteOpen?: boolean;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 13, transition: "background-color 0.15s",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px",
  fontSize: 13, outline: "none",
};

// ─── PDF.js loader ────────────────────────────────────────────────────────────

let _pdfjsLib: PdfjsLib | null = null;

async function loadPdfjs(): Promise<PdfjsLib> {
  if (_pdfjsLib) return _pdfjsLib;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
  _pdfjsLib = lib;
  return lib;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfViewer({
  onPdfLoaded,
  onShowSearch,
  onShowProperties,
  onShowPrint,
  onShowExport,
  externalPdfDoc,
  externalPdfBytes,
  externalPdfName,
  externalAnnotations,
  editMode,
  overlayHandlers,
  overlayCanvasRef: externalOverlayRef,
  mainCanvasRef: externalMainCanvasRef,
  renderAnnotationsOnPage,
}: PdfViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"none" | "width" | "page">("none");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [multiPageView, setMultiPageView] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // Bookmarks
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");

  // Drag
  const [draggedThumb, setDraggedThumb] = useState<number | null>(null);
  const [dragOverThumb, setDragOverThumb] = useState<number | null>(null);

  const internalMainCanvasRef = useRef<HTMLCanvasElement>(null);
  const internalOverlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const mainCanvasRef = externalMainCanvasRef ?? internalMainCanvasRef;
  const overlayCanvasRef = externalOverlayRef ?? internalOverlayRef;

  // Use external or internal state
  const doc = externalPdfDoc ?? pdfDoc;
  const bytes = externalPdfBytes ?? pdfBytes;
  const name = externalPdfName ?? pdfName;

  // ─── Load PDF ─────────────────────────────────────────────────────────────

  const loadPdf = useCallback(async (data: ArrayBuffer, fileName: string) => {
    const lib = await loadPdfjs();
    const pDoc = await lib.getDocument({ data: new Uint8Array(data) }).promise;
    setPdfDoc(pDoc);
    setPdfBytes(data);
    setPdfName(fileName);
    setTotalPages(pDoc.numPages);
    setCurrentPage(1);
    setZoom(100);
    setFitMode("none");
    setPageRotations({});
    setPageOrder(Array.from({ length: pDoc.numPages }, (_, i) => i + 1));

    const thumbs: string[] = [];
    for (let i = 1; i <= pDoc.numPages; i++) {
      const page = await pDoc.getPage(i);
      const vp = page.getViewport({ scale: 0.2 });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      await (page.render({ canvasContext: ctx, viewport: vp } as any).promise);
      thumbs.push(canvas.toDataURL());
    }
    setThumbnails(thumbs);

    onPdfLoaded?.(pDoc, data, fileName);
  }, [onPdfLoaded]);

  // ─── Render Page ──────────────────────────────────────────────────────────

  const renderPage = useCallback(
    async (pageNum: number, zoomLevel: number) => {
      if (!doc || !mainCanvasRef.current) return;
      const page = await doc.getPage(pageNum);
      let scale = zoomLevel / 100;

      if (fitMode === "width" && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - (showThumbnails ? 160 : 0) - 40;
        const baseVp = page.getViewport({ scale: 1 });
        scale = containerWidth / baseVp.width;
        setZoom(Math.round(scale * 100));
      } else if (fitMode === "page" && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - (showThumbnails ? 160 : 0) - 40;
        const containerHeight = containerRef.current.clientHeight - 60;
        const baseVp = page.getViewport({ scale: 1 });
        scale = Math.min(containerWidth / baseVp.width, containerHeight / baseVp.height);
        setZoom(Math.round(scale * 100));
      }

      const rotation = pageRotations[pageNum] ?? 0;
      const viewport = page.getViewport({ scale, rotation });
      const canvas = mainCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await (page.render({ canvasContext: ctx, viewport } as any).promise);

      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = viewport.width;
        overlayCanvasRef.current.height = viewport.height;
        renderAnnotationsOnPage?.(pageNum);
      }
    },
    [doc, fitMode, showThumbnails, pageRotations, mainCanvasRef, overlayCanvasRef, renderAnnotationsOnPage]
  );

  useEffect(() => {
    if (doc && currentPage >= 1 && currentPage <= (doc.numPages ?? totalPages)) {
      renderPage(currentPage, zoom);
    }
  }, [doc, currentPage, zoom, renderPage, totalPages]);

  // ─── Rotation ─────────────────────────────────────────────────────────────

  const rotatePage = (pageNum: number, deg: 90 | -90 | 180) => {
    setPageRotations((prev) => {
      const current = prev[pageNum] ?? 0;
      return { ...prev, [pageNum]: (current + deg + 360) % 360 };
    });
  };

  const rotateAllPages = (deg: 90 | -90 | 180) => {
    setPageRotations((prev) => {
      const updated = { ...prev };
      for (let i = 1; i <= totalPages; i++) {
        updated[i] = ((updated[i] ?? 0) + deg + 360) % 360;
      }
      return updated;
    });
  };

  // ─── Drag & Drop Thumbnails ───────────────────────────────────────────────

  const handleThumbDrop = (targetIndex: number) => {
    if (draggedThumb === null || draggedThumb === targetIndex) {
      setDraggedThumb(null);
      setDragOverThumb(null);
      return;
    }
    setPageOrder((prev) => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(draggedThumb, 1);
      newOrder.splice(targetIndex, 0, moved);
      return newOrder;
    });
    setThumbnails((prev) => {
      const newThumbs = [...prev];
      const [moved] = newThumbs.splice(draggedThumb, 1);
      newThumbs.splice(targetIndex, 0, moved);
      return newThumbs;
    });
    setDraggedThumb(null);
    setDragOverThumb(null);
  };

  // ─── Fullscreen ───────────────────────────────────────────────────────────

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ─── Bookmarks ────────────────────────────────────────────────────────────

  const addBookmark = () => {
    if (!newBookmarkTitle.trim()) return;
    setBookmarks((prev) => [...prev, { id: uid(), title: newBookmarkTitle, page: currentPage, level: 0 }]);
    setNewBookmarkTitle("");
  };

  // ─── Download ─────────────────────────────────────────────────────────────

  const downloadPdf = () => {
    if (!bytes) return;
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name || "document.pdf"; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Upload handler ───────────────────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    const data = await file.arrayBuffer();
    await loadPdf(data, file.name);
  };

  // ─── Zoom presets ─────────────────────────────────────────────────────────

  const zoomPresets = [50, 75, 100, 125, 150, 200];

  // ─── No PDF loaded ────────────────────────────────────────────────────────

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <DropZone onFile={(files) => { if (files[0]) handleFileUpload(files[0]); }} />
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden" ref={fullscreenRef}>
      {/* Viewer Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-wrap"
        style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        {/* Zoom controls */}
        <button style={btnStyle} onClick={() => { setZoom((z) => Math.max(25, z - 10)); setFitMode("none"); }} title="Zoom out">
          <ZoomOut size={16} />
        </button>
        <input type="range" min={25} max={400} value={zoom}
          onChange={(e) => { setZoom(Number(e.target.value)); setFitMode("none"); }}
          style={{ width: 100, accentColor: "var(--primary)" }}
        />
        <button style={btnStyle} onClick={() => { setZoom((z) => Math.min(400, z + 10)); setFitMode("none"); }} title="Zoom in">
          <ZoomIn size={16} />
        </button>

        {/* Zoom dropdown */}
        <div className="relative">
          <button style={{ ...btnStyle, minWidth: 70 }} onClick={() => setShowZoomMenu(!showZoomMenu)}>
            {zoom}% <ChevronDown size={12} />
          </button>
          {showZoomMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 py-1" style={{
              backgroundColor: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 130,
            }}>
              {zoomPresets.map((z) => (
                <button key={z} className="block w-full text-left px-3 py-1.5 text-sm"
                  style={{ color: "var(--foreground)", border: "none", background: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  onClick={() => { setZoom(z); setFitMode("none"); setShowZoomMenu(false); }}
                >{z}%</button>
              ))}
              <div style={{ height: 1, backgroundColor: "var(--border)", margin: "2px 0" }} />
              <button className="block w-full text-left px-3 py-1.5 text-sm"
                style={{ color: "var(--foreground)", border: "none", background: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                onClick={() => { setFitMode("width"); setShowZoomMenu(false); }}
              >Fit Width</button>
              <button className="block w-full text-left px-3 py-1.5 text-sm"
                style={{ color: "var(--foreground)", border: "none", background: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                onClick={() => { setFitMode("page"); setShowZoomMenu(false); }}
              >Fit Page</button>
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

        {/* Page navigation */}
        <button style={btnStyle} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
          <ChevronLeft size={16} />
        </button>
        <input type="number" value={currentPage} min={1} max={totalPages}
          onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= totalPages) setCurrentPage(v); }}
          style={{ ...inputStyle, width: 50, textAlign: "center" }}
        />
        <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>/ {totalPages}</span>
        <button style={btnStyle} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
          <ChevronRight size={16} />
        </button>

        <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

        {/* Fit modes */}
        <button style={{ ...btnStyle, ...(fitMode === "width" ? { backgroundColor: "var(--accent)" } : {}) }}
          onClick={() => setFitMode(fitMode === "width" ? "none" : "width")} title="Fit to width">
          <Maximize size={16} />
        </button>
        <button style={{ ...btnStyle, ...(fitMode === "page" ? { backgroundColor: "var(--accent)" } : {}) }}
          onClick={() => setFitMode(fitMode === "page" ? "none" : "page")} title="Fit to page">
          <Maximize2 size={16} />
        </button>

        <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

        {/* Rotation */}
        <button style={btnStyle} onClick={() => rotatePage(currentPage, -90)} title="Rotate CCW">
          <RotateCcw size={16} />
        </button>
        <button style={btnStyle} onClick={() => rotatePage(currentPage, 90)} title="Rotate CW">
          <RotateCw size={16} />
        </button>
        <button style={btnStyle} onClick={() => rotateAllPages(90)} title="Rotate all CW">
          <RotateCw size={16} /> All
        </button>

        <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

        {/* View toggles */}
        <button style={btnStyle} onClick={() => setShowThumbnails((t) => !t)} title="Toggle thumbnails">
          {showThumbnails ? "Hide Thumbs" : "Show Thumbs"}
        </button>
        <button style={{ ...btnStyle, ...(showBookmarks ? { backgroundColor: "var(--accent)" } : {}) }}
          onClick={() => setShowBookmarks((b) => !b)} title="Toggle bookmarks">
          <BookOpen size={16} /> Bookmarks
        </button>
        <button style={btnStyle} onClick={toggleFullscreen} title="Fullscreen">
          {isFullscreen ? <Minimize2 size={16} /> : <Fullscreen size={16} />}
        </button>
        <button style={{ ...btnStyle, ...(multiPageView ? { backgroundColor: "var(--accent)" } : {}) }}
          onClick={() => setMultiPageView((m) => !m)} title="Multi-page view">
          <LayoutGrid size={16} />
        </button>

        <div className="flex-1" />

        {/* Actions */}
        {onShowSearch && <button style={btnStyle} onClick={onShowSearch} title="Search"><Search size={16} /></button>}
        {onShowPrint && <button style={btnStyle} onClick={onShowPrint} title="Print"><Printer size={16} /></button>}
        <button style={btnStyle} onClick={downloadPdf} title="Download"><Download size={16} /></button>
        {onShowProperties && <button style={btnStyle} onClick={onShowProperties} title="Properties"><Info size={16} /></button>}
        {onShowExport && <button style={btnStyle} onClick={onShowExport} title="Export"><FileCheck size={16} /></button>}
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {/* Thumbnails sidebar */}
        {showThumbnails && (
          <div className="overflow-y-auto flex flex-col gap-2 p-2"
            style={{ width: 160, backgroundColor: "var(--secondary)", borderRight: "1px solid var(--border)" }}>
            {thumbnails.map((src, i) => (
              <div key={`thumb-${i}`} className="cursor-pointer flex flex-col items-center group"
                draggable
                onDragStart={() => setDraggedThumb(i)}
                onDragOver={(e) => { e.preventDefault(); setDragOverThumb(i); }}
                onDrop={() => handleThumbDrop(i)}
                onDragEnd={() => { setDraggedThumb(null); setDragOverThumb(null); }}
                onClick={() => setCurrentPage(pageOrder[i] ?? i + 1)}
                style={{
                  border: currentPage === (pageOrder[i] ?? i + 1) ? "2px solid var(--primary)"
                    : dragOverThumb === i ? "2px dashed var(--primary)" : "2px solid transparent",
                  borderRadius: 4, padding: 2,
                  opacity: draggedThumb === i ? 0.5 : 1,
                  transition: "opacity 0.15s, border-color 0.15s",
                  position: "relative",
                }}>
                <div className="flex items-center gap-1 w-full" style={{ fontSize: 9, color: "var(--muted-foreground)" }}>
                  <GripVertical size={10} style={{ cursor: "grab", flexShrink: 0 }} />
                  <span className="flex-1 text-center">{pageOrder[i] ?? i + 1}</span>
                </div>
                <img src={src} alt={`Page ${pageOrder[i] ?? i + 1}`} style={{ width: "100%", borderRadius: 2 }} />
                {(pageRotations[pageOrder[i] ?? i + 1] ?? 0) > 0 && (
                  <span style={{ fontSize: 9, color: "var(--primary)" }}>{pageRotations[pageOrder[i] ?? i + 1]}°</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bookmarks panel */}
        {showBookmarks && (
          <div className="overflow-y-auto flex flex-col gap-2 p-2"
            style={{ width: 220, backgroundColor: "var(--card)", borderRight: "1px solid var(--border)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: "var(--muted-foreground)" }}>
              Bookmarks / TOC
            </h3>
            <div className="flex gap-1">
              <input type="text" value={newBookmarkTitle} onChange={(e) => setNewBookmarkTitle(e.target.value)}
                placeholder="Bookmark title..." style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                onKeyDown={(e) => { if (e.key === "Enter") addBookmark(); }}
              />
              <button style={{ ...btnStyle, padding: "4px 8px" }} onClick={addBookmark}>+</button>
            </div>
            <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Adds bookmark for page {currentPage}</p>
            {bookmarks.length === 0 ? (
              <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic", padding: "8px 0" }}>
                No bookmarks yet.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {bookmarks.map((bm) => (
                  <div key={bm.id} className="flex items-center gap-1 px-1 py-1 rounded cursor-pointer"
                    style={{ backgroundColor: currentPage === bm.page ? "var(--accent)" : "transparent", fontSize: 12 }}
                    onClick={() => setCurrentPage(bm.page)}>
                    <BookOpen size={12} style={{ flexShrink: 0, color: "var(--primary)" }} />
                    <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>{bm.title}</span>
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>p.{bm.page}</span>
                    <button onClick={(e) => { e.stopPropagation(); setBookmarks((prev) => prev.filter((b) => b.id !== bm.id)); }}
                      style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
                      <X size={10} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main canvas area */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-4"
          style={{ backgroundColor: "var(--muted)" }}>
          <div className="relative inline-block" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <canvas ref={mainCanvasRef} style={{ display: "block" }} />
            {overlayHandlers && (
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0"
                style={{ cursor: editMode && editMode !== "none" ? "crosshair" : "default" }}
                onMouseDown={overlayHandlers.onMouseDown}
                onMouseMove={overlayHandlers.onMouseMove}
                onMouseUp={overlayHandlers.onMouseUp}
                onMouseLeave={overlayHandlers.onMouseUp}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DropZone Component ──────────────────────────────────────────────────────

function DropZone({ onFile, multiple, label, accept }: {
  onFile: (files: FileList) => void;
  multiple?: boolean;
  label?: string;
  accept?: string;
}) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files.length) onFile(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 cursor-pointer"
      style={{
        border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`,
        borderRadius: 12, padding: 40,
        backgroundColor: hover ? "var(--accent)" : "var(--card)",
        transition: "all 0.2s",
      }}
    >
      <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
      <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
        {label ?? "Drag & drop a PDF here, or click to browse"}
      </p>
      <input ref={inputRef} type="file" accept={accept ?? ".pdf"} multiple={multiple}
        className="hidden" onChange={(e) => { if (e.target.files?.length) onFile(e.target.files); }} />
    </div>
  );
}

export { DropZone, loadPdfjs, uid };
export type { PDFDocumentProxy, Annotation, Bookmark };
