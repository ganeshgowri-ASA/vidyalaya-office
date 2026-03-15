"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Maximize2,
  Type,
  Highlighter,
  Pencil,
  Stamp,
  PenTool,
  Undo2,
  ArrowUp,
  ArrowDown,
  Trash2,
  FilePlus,
  Scissors,
  FileOutput,
  Download,
  CheckSquare,
  Square,
  Loader2,
  FileText,
  FileSpreadsheet,
  Image,
  Minimize2,
  X,
  RotateCw,
  GripVertical,
  Hash,
  Droplets,
  EyeOff,
  ScanText,
  FormInput,
  ShieldCheck,
  BookOpen,
  Columns2,
  RotateCcw,
  List,
  Circle,
  ChevronDown,
  Award,
  Move,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "view" | "edit" | "merge" | "split" | "convert" | "compress" | "forms" | "compare";

interface Annotation {
  id: string;
  type: "text" | "highlight" | "drawing" | "stamp" | "signature" | "redaction";
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
}

interface FormField {
  id: string;
  type: "text-input" | "checkbox" | "radio" | "dropdown";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  options?: string[];
  required?: boolean;
}

interface Bookmark {
  id: string;
  title: string;
  page: number;
  level: number;
}

interface WatermarkConfig {
  type: "text" | "image";
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  imageDataUrl?: string;
}

interface CertificateInfo {
  name: string;
  email: string;
  organization: string;
  reason: string;
  date: string;
}

interface MergeFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

type PdfjsLib = typeof import("pdfjs-dist");
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "view", label: "View", icon: FileText },
  { id: "edit", label: "Edit", icon: Pencil },
  { id: "merge", label: "Merge", icon: FilePlus },
  { id: "split", label: "Split", icon: Scissors },
  { id: "convert", label: "Convert", icon: FileOutput },
  { id: "compress", label: "Compress", icon: Minimize2 },
  { id: "forms", label: "Forms", icon: FormInput },
  { id: "compare", label: "Compare", icon: Columns2 },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PdfToolsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("view");

  // ── Shared viewer state ──
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"none" | "width" | "page">("none");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Edit state ──
  const [editMode, setEditMode] = useState<
    "none" | "text" | "highlight" | "draw" | "stamp" | "signature"
  >("none");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [drawColor, setDrawColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedStamp, setSelectedStamp] = useState("Approved");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPlacement, setTextPlacement] = useState<{ x: number; y: number } | null>(null);

  // ── Merge state ──
  const [mergeFiles, setMergeFiles] = useState<MergeFile[]>([]);
  const [merging, setMerging] = useState(false);

  // ── Split state ──
  const [splitDoc, setSplitDoc] = useState<PDFDocumentProxy | null>(null);
  const [splitBytes, setSplitBytes] = useState<ArrayBuffer | null>(null);
  const [splitPages, setSplitPages] = useState(0);
  const [splitRange, setSplitRange] = useState("");
  const [splitSelected, setSplitSelected] = useState<Set<number>>(new Set());
  const [splitting, setSplitting] = useState(false);

  // ── Convert state ──
  const [convertFormat, setConvertFormat] = useState<"word" | "excel" | "image">("word");
  const [convertFile, setConvertFile] = useState<File | null>(null);
  const [convertProgress, setConvertProgress] = useState(0);
  const [converting, setConverting] = useState(false);

  // ── Compress state ──
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressBytes, setCompressBytes] = useState<ArrayBuffer | null>(null);
  const [compressQuality, setCompressQuality] = useState(50);
  const [compressing, setCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  // ─── Load & Render PDF ────────────────────────────────────────────────────

  const loadPdf = useCallback(async (data: ArrayBuffer, name: string) => {
    const lib = await loadPdfjs();
    const doc = await lib.getDocument({ data: new Uint8Array(data) }).promise;
    setPdfDoc(doc);
    setPdfBytes(data);
    setPdfName(name);
    setTotalPages(doc.numPages);
    setCurrentPage(1);
    setAnnotations([]);
    setZoom(100);
    setFitMode("none");

    // Generate thumbnails
    const thumbs: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale: 0.2 });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
      thumbs.push(canvas.toDataURL());
    }
    setThumbnails(thumbs);
  }, []);

  const renderPage = useCallback(
    async (pageNum: number, zoomLevel: number) => {
      if (!pdfDoc || !mainCanvasRef.current) return;
      const page = await pdfDoc.getPage(pageNum);

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

      const viewport = page.getViewport({ scale });
      const canvas = mainCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport } as any).promise;

      // Resize overlay
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = viewport.width;
        overlayCanvasRef.current.height = viewport.height;
        renderAnnotations(pageNum);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pdfDoc, fitMode, showThumbnails]
  );

  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= totalPages) {
      renderPage(currentPage, zoom);
    }
  }, [pdfDoc, currentPage, zoom, renderPage, totalPages]);

  // ─── Annotations Rendering ───────────────────────────────────────────────

  const renderAnnotations = useCallback(
    (pageNum: number) => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pageAnnotations = annotations.filter((a) => a.page === pageNum);
      for (const a of pageAnnotations) {
        switch (a.type) {
          case "text":
            ctx.font = `${a.fontSize ?? 16}px sans-serif`;
            ctx.fillStyle = a.color ?? "#000000";
            ctx.fillText(a.text ?? "", a.x, a.y);
            break;
          case "highlight":
            ctx.fillStyle = "rgba(255, 255, 0, 0.35)";
            ctx.fillRect(a.x, a.y, a.width ?? 200, a.height ?? 30);
            break;
          case "drawing":
            if (a.points && a.points.length > 1) {
              ctx.strokeStyle = a.color ?? "#ff0000";
              ctx.lineWidth = a.strokeWidth ?? 2;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.beginPath();
              ctx.moveTo(a.points[0].x, a.points[0].y);
              for (let i = 1; i < a.points.length; i++) {
                ctx.lineTo(a.points[i].x, a.points[i].y);
              }
              ctx.stroke();
            }
            break;
          case "stamp": {
            const stampColors: Record<string, string> = {
              Approved: "#16a34a",
              Rejected: "#dc2626",
              Draft: "#ca8a04",
              Confidential: "#7c3aed",
            };
            const color = stampColors[a.stamp ?? "Draft"] ?? "#666";
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(-0.2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.font = "bold 28px sans-serif";
            ctx.fillStyle = color;
            const textW = ctx.measureText(a.stamp ?? "").width;
            ctx.strokeRect(-8, -30, textW + 16, 40);
            ctx.globalAlpha = 0.7;
            ctx.fillText(a.stamp ?? "", 0, 0);
            ctx.restore();
            break;
          }
          case "signature":
            if (a.signatureDataUrl) {
              const img = new window.Image();
              img.onload = () => {
                ctx.drawImage(img, a.x, a.y, a.width ?? 200, a.height ?? 80);
              };
              img.src = a.signatureDataUrl;
            }
            break;
        }
      }
    },
    [annotations]
  );

  useEffect(() => {
    if (pdfDoc) renderAnnotations(currentPage);
  }, [annotations, currentPage, pdfDoc, renderAnnotations]);

  // ─── Overlay event handlers ───────────────────────────────────────────────

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (editMode === "text") {
      setTextPlacement({ x, y });
      return;
    }
    if (editMode === "highlight") {
      setAnnotations((prev) => [
        ...prev,
        { id: uid(), type: "highlight", page: currentPage, x, y, width: 200, height: 30 },
      ]);
      return;
    }
    if (editMode === "draw") {
      setIsDrawing(true);
      setCurrentDrawPoints([{ x, y }]);
      return;
    }
    if (editMode === "stamp") {
      setAnnotations((prev) => [
        ...prev,
        { id: uid(), type: "stamp", page: currentPage, x, y, stamp: selectedStamp },
      ]);
      return;
    }
    if (editMode === "signature") {
      const sigCanvas = signatureCanvasRef.current;
      if (sigCanvas) {
        const dataUrl = sigCanvas.toDataURL();
        setAnnotations((prev) => [
          ...prev,
          {
            id: uid(),
            type: "signature",
            page: currentPage,
            x,
            y,
            width: 200,
            height: 80,
            signatureDataUrl: dataUrl,
          },
        ]);
      }
    }
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentDrawPoints((prev) => [...prev, { x, y }]);

    // Draw live stroke
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (ctx && currentDrawPoints.length > 0) {
      const last = currentDrawPoints[currentDrawPoints.length - 1];
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleOverlayMouseUp = () => {
    if (isDrawing && currentDrawPoints.length > 1) {
      setAnnotations((prev) => [
        ...prev,
        {
          id: uid(),
          type: "drawing",
          page: currentPage,
          x: 0,
          y: 0,
          points: currentDrawPoints,
          color: drawColor,
          strokeWidth,
        },
      ]);
    }
    setIsDrawing(false);
    setCurrentDrawPoints([]);
  };

  const confirmTextAnnotation = () => {
    if (textPlacement && textInput.trim()) {
      setAnnotations((prev) => [
        ...prev,
        {
          id: uid(),
          type: "text",
          page: currentPage,
          x: textPlacement.x,
          y: textPlacement.y,
          text: textInput,
          fontSize,
          color: drawColor,
        },
      ]);
    }
    setTextPlacement(null);
    setTextInput("");
  };

  const undoAnnotation = () => setAnnotations((prev) => prev.slice(0, -1));

  // ─── Signature pad ───────────────────────────────────────────────────────

  const sigDrawingRef = useRef(false);

  const initSignaturePad = useCallback((canvas: HTMLCanvasElement | null) => {
    signatureCanvasRef.current = canvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    canvas.onmousedown = (e) => {
      sigDrawingRef.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    canvas.onmousemove = (e) => {
      if (!sigDrawingRef.current) return;
      const p = getPos(e);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    canvas.onmouseup = () => {
      sigDrawingRef.current = false;
    };
    canvas.onmouseleave = () => {
      sigDrawingRef.current = false;
    };
  }, []);

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // ─── File handlers ────────────────────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    const data = await file.arrayBuffer();
    await loadPdf(data, file.name);
    setActiveTab("view");
  };

  // ─── Merge handlers ──────────────────────────────────────────────────────

  const addMergeFiles = async (files: FileList) => {
    const lib = await loadPdfjs();
    const newFiles: MergeFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf") continue;
      const data = await file.arrayBuffer();
      const doc = await lib.getDocument({ data: new Uint8Array(data) }).promise;
      newFiles.push({ id: uid(), name: file.name, data, pageCount: doc.numPages });
    }
    setMergeFiles((prev) => [...prev, ...newFiles]);
  };

  const moveMergeFile = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= mergeFiles.length) return;
    setMergeFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const removeMergeFile = (id: string) => {
    setMergeFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const mergePdfs = async () => {
    if (mergeFiles.length < 2) return;
    setMerging(true);
    try {
      const merged = await PDFDocument.create();
      for (const mf of mergeFiles) {
        const src = await PDFDocument.load(mf.data);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
    } catch (err) {
      console.error("Merge failed:", err);
    } finally {
      setMerging(false);
    }
  };

  // ─── Split handlers ──────────────────────────────────────────────────────

  const loadSplitPdf = async (file: File) => {
    const lib = await loadPdfjs();
    const data = await file.arrayBuffer();
    const doc = await lib.getDocument({ data: new Uint8Array(data) }).promise;
    setSplitDoc(doc);
    setSplitBytes(data);
    setSplitPages(doc.numPages);
    setSplitSelected(new Set());
    setSplitRange("");
  };

  const toggleSplitPage = (page: number) => {
    setSplitSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const parseRange = (range: string, max: number): number[] => {
    const pages = new Set<number>();
    const parts = range.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.max(1, a); i <= Math.min(max, b); i++) pages.add(i);
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const applySplitRange = () => {
    const pages = parseRange(splitRange, splitPages);
    setSplitSelected(new Set(pages));
  };

  const extractPages = async () => {
    if (!splitBytes || splitSelected.size === 0) return;
    setSplitting(true);
    try {
      const src = await PDFDocument.load(splitBytes);
      const dest = await PDFDocument.create();
      const indices = Array.from(splitSelected).sort((a, b) => a - b).map((p) => p - 1);
      const pages = await dest.copyPages(src, indices);
      pages.forEach((p) => dest.addPage(p));
      const bytes = await dest.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "extracted.pdf");
    } catch (err) {
      console.error("Split failed:", err);
    } finally {
      setSplitting(false);
    }
  };

  // ─── Convert handlers ────────────────────────────────────────────────────

  const simulateConvert = () => {
    if (!convertFile) return;
    setConverting(true);
    setConvertProgress(0);
    const interval = setInterval(() => {
      setConvertProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setConverting(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  // ─── Compress handlers ───────────────────────────────────────────────────

  const loadCompressPdf = async (file: File) => {
    const data = await file.arrayBuffer();
    setCompressFile(file);
    setCompressBytes(data);
    setOriginalSize(data.byteLength);
    setCompressedSize(null);
  };

  const compressPdf = async () => {
    if (!compressBytes) return;
    setCompressing(true);
    setCompressProgress(0);

    const interval = setInterval(() => {
      setCompressProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const doc = await PDFDocument.load(compressBytes);
      const bytes = await doc.save();
      const factor = compressQuality / 100;
      const estimatedSize = Math.round(bytes.byteLength * (0.5 + factor * 0.5));
      setCompressedSize(estimatedSize);
      clearInterval(interval);
      setCompressProgress(100);

      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `compressed_${compressFile?.name ?? "output.pdf"}`
      );
    } catch (err) {
      console.error("Compress failed:", err);
      clearInterval(interval);
    } finally {
      setCompressing(false);
    }
  };

  // ─── Utilities ────────────────────────────────────────────────────────────

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  // ─── Shared styles ───────────────────────────────────────────────────────

  const btnStyle: React.CSSProperties = {
    backgroundColor: "var(--card)",
    color: "var(--card-foreground)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    transition: "background-color 0.15s",
  };

  const btnPrimaryStyle: React.CSSProperties = {
    ...btnStyle,
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "1px solid var(--primary)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--card)",
    color: "var(--card-foreground)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 13,
    outline: "none",
  };

  // ─── Drop zone ────────────────────────────────────────────────────────────

  const DropZone = ({
    onFile,
    multiple,
    label,
  }: {
    onFile: (files: FileList) => void;
    multiple?: boolean;
    label?: string;
  }) => {
    const [hover, setHover] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          if (e.dataTransfer.files.length) onFile(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 cursor-pointer"
        style={{
          border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 12,
          padding: 40,
          backgroundColor: hover ? "var(--accent)" : "var(--card)",
          transition: "all 0.2s",
        }}
      >
        <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
        <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
          {label ?? "Drag & drop a PDF here, or click to browse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onFile(e.target.files);
          }}
        />
      </div>
    );
  };

  // ─── Tab: View ────────────────────────────────────────────────────────────

  const renderViewTab = () => {
    if (!pdfDoc) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <DropZone
              onFile={(files) => {
                const f = files[0];
                if (f) handleFileUpload(f);
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
        {/* Toolbar */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-wrap"
          style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            style={btnStyle}
            onClick={() => {
              setZoom((z) => Math.max(50, z - 10));
              setFitMode("none");
            }}
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min={50}
            max={200}
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value));
              setFitMode("none");
            }}
            style={{ width: 100, accentColor: "var(--primary)" }}
          />
          <button
            style={btnStyle}
            onClick={() => {
              setZoom((z) => Math.min(200, z + 10));
              setFitMode("none");
            }}
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <span style={{ color: "var(--muted-foreground)", fontSize: 12, minWidth: 40 }}>
            {zoom}%
          </span>

          <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

          <button
            style={btnStyle}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="number"
            value={currentPage}
            min={1}
            max={totalPages}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 1 && v <= totalPages) setCurrentPage(v);
            }}
            style={{ ...inputStyle, width: 50, textAlign: "center" }}
          />
          <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>/ {totalPages}</span>
          <button
            style={btnStyle}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight size={16} />
          </button>

          <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

          <button
            style={{
              ...btnStyle,
              ...(fitMode === "width" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setFitMode(fitMode === "width" ? "none" : "width")}
            title="Fit to width"
          >
            <Maximize size={16} />
          </button>
          <button
            style={{
              ...btnStyle,
              ...(fitMode === "page" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setFitMode(fitMode === "page" ? "none" : "page")}
            title="Fit to page"
          >
            <Maximize2 size={16} />
          </button>
          <button
            style={btnStyle}
            onClick={() => setShowThumbnails((t) => !t)}
            title="Toggle thumbnails"
          >
            {showThumbnails ? "Hide Thumbs" : "Show Thumbs"}
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnails sidebar */}
          {showThumbnails && (
            <div
              className="overflow-y-auto flex flex-col gap-2 p-2"
              style={{
                width: 140,
                backgroundColor: "var(--secondary)",
                borderRight: "1px solid var(--border)",
              }}
            >
              {thumbnails.map((src, i) => (
                <div
                  key={i}
                  className="cursor-pointer flex flex-col items-center"
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    border:
                      currentPage === i + 1
                        ? "2px solid var(--primary)"
                        : "2px solid transparent",
                    borderRadius: 4,
                    padding: 2,
                  }}
                >
                  <img
                    src={src}
                    alt={`Page ${i + 1}`}
                    style={{ width: "100%", borderRadius: 2 }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--muted-foreground)",
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Main canvas */}
          <div
            className="flex-1 overflow-auto flex items-start justify-center p-4"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div
              className="relative inline-block"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <canvas ref={mainCanvasRef} style={{ display: "block" }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Tab: Edit ────────────────────────────────────────────────────────────

  const renderEditTab = () => {
    if (!pdfDoc) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <p style={{ color: "var(--muted-foreground)" }}>
            Please load a PDF in the View tab first.
          </p>
        </div>
      );
    }

    const stamps = ["Approved", "Rejected", "Draft", "Confidential"];

    return (
      <div className="flex-1 flex overflow-hidden relative">
        {/* Edit sidebar */}
        <div
          className="flex flex-col gap-3 p-3 overflow-y-auto"
          style={{
            width: 220,
            backgroundColor: "var(--card)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Tools
          </h3>

          {/* Text */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(editMode === "text" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setEditMode(editMode === "text" ? "none" : "text")}
          >
            <Type size={16} /> Add Text
          </button>

          {editMode === "text" && (
            <div className="flex flex-col gap-2 pl-2">
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Font Size</label>
              <input
                type="number"
                value={fontSize}
                min={8}
                max={72}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ ...inputStyle, width: "100%" }}
              />
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Text Color</label>
              <input
                type="color"
                value={drawColor}
                onChange={(e) => setDrawColor(e.target.value)}
                style={{ width: 30, height: 30, border: "none", cursor: "pointer" }}
              />
            </div>
          )}

          {/* Highlight */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(editMode === "highlight" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setEditMode(editMode === "highlight" ? "none" : "highlight")}
          >
            <Highlighter size={16} /> Highlight
          </button>

          {/* Drawing */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(editMode === "draw" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setEditMode(editMode === "draw" ? "none" : "draw")}
          >
            <PenTool size={16} /> Freehand Draw
          </button>

          {editMode === "draw" && (
            <div className="flex flex-col gap-2 pl-2">
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => setDrawColor(e.target.value)}
                  style={{ width: 30, height: 30, border: "none", cursor: "pointer" }}
                />
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{drawColor}</span>
              </div>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Stroke Width</label>
              <input
                type="range"
                min={1}
                max={10}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                style={{ accentColor: "var(--primary)" }}
              />
            </div>
          )}

          {/* Stamps */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(editMode === "stamp" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setEditMode(editMode === "stamp" ? "none" : "stamp")}
          >
            <Stamp size={16} /> Stamps
          </button>

          {editMode === "stamp" && (
            <div className="flex flex-wrap gap-1 pl-2">
              {stamps.map((s) => {
                const colors: Record<string, string> = {
                  Approved: "#16a34a",
                  Rejected: "#dc2626",
                  Draft: "#ca8a04",
                  Confidential: "#7c3aed",
                };
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStamp(s)}
                    style={{
                      ...btnStyle,
                      fontSize: 11,
                      padding: "3px 8px",
                      color: selectedStamp === s ? "#fff" : colors[s],
                      backgroundColor: selectedStamp === s ? colors[s] : "var(--card)",
                      borderColor: colors[s],
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}

          {/* Signature */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(editMode === "signature" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setEditMode(editMode === "signature" ? "none" : "signature")}
          >
            <Pencil size={16} /> Signature
          </button>

          {editMode === "signature" && (
            <div className="flex flex-col gap-2 pl-2">
              <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                Draw your signature below, then click on the PDF to place it.
              </label>
              <canvas
                ref={initSignaturePad}
                width={190}
                height={80}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  backgroundColor: "#fff",
                  cursor: "crosshair",
                }}
              />
              <button style={{ ...btnStyle, fontSize: 11 }} onClick={clearSignature}>
                Clear Signature
              </button>
            </div>
          )}

          <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

          {/* Undo */}
          <button
            style={btnStyle}
            onClick={undoAnnotation}
            disabled={annotations.length === 0}
          >
            <Undo2 size={16} /> Undo Last
          </button>

          <p style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4 }}>
            {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* PDF view area with overlay */}
        <div className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
          {/* Mini toolbar */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: "var(--card)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <button
              style={btnStyle}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
              Page {currentPage} / {totalPages}
            </span>
            <button
              style={btnStyle}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={14} />
            </button>
            <div className="flex-1" />
            <button
              style={btnStyle}
              onClick={() => {
                setZoom((z) => Math.max(50, z - 10));
                setFitMode("none");
              }}
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{zoom}%</span>
            <button
              style={btnStyle}
              onClick={() => {
                setZoom((z) => Math.min(200, z + 10));
                setFitMode("none");
              }}
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div
            className="flex-1 overflow-auto flex items-start justify-center p-4"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div
              className="relative inline-block"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <canvas ref={mainCanvasRef} style={{ display: "block" }} />
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0"
                style={{ cursor: editMode !== "none" ? "crosshair" : "default" }}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                onMouseLeave={handleOverlayMouseUp}
              />
            </div>
          </div>
        </div>

        {/* Text placement popup */}
        {textPlacement && (
          <div
            className="absolute z-50 flex items-center gap-2 p-2"
            style={{
              top: textPlacement.y + 100,
              left: textPlacement.x + 240,
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              autoFocus
              style={{ ...inputStyle, width: 200 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmTextAnnotation();
                if (e.key === "Escape") {
                  setTextPlacement(null);
                  setTextInput("");
                }
              }}
            />
            <button style={btnPrimaryStyle} onClick={confirmTextAnnotation}>
              Add
            </button>
            <button
              style={btnStyle}
              onClick={() => {
                setTextPlacement(null);
                setTextInput("");
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Tab: Merge ───────────────────────────────────────────────────────────

  const renderMergeTab = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Merge PDFs
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Upload multiple PDF files, reorder them, then merge into a single document.
        </p>

        <DropZone
          onFile={(files) => addMergeFiles(files)}
          multiple
          label="Drop PDF files here or click to select (multiple allowed)"
        />

        {mergeFiles.length > 0 && (
          <div className="space-y-2">
            {mergeFiles.map((mf, idx) => (
              <div
                key={mf.id}
                className="flex items-center gap-3 px-3 py-2"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <FileText
                  size={18}
                  style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>
                    {mf.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {mf.pageCount} page{mf.pageCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  style={btnStyle}
                  onClick={() => moveMergeFile(idx, -1)}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  style={btnStyle}
                  onClick={() => moveMergeFile(idx, 1)}
                  disabled={idx === mergeFiles.length - 1}
                  title="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  style={{ ...btnStyle, color: "#dc2626" }}
                  onClick={() => removeMergeFile(mf.id)}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {mergeFiles.length >= 2 && (
          <button style={btnPrimaryStyle} onClick={mergePdfs} disabled={merging}>
            {merging ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Merging...
              </>
            ) : (
              <>
                <Download size={16} /> Merge All & Download
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  // ─── Tab: Split ───────────────────────────────────────────────────────────

  const renderSplitTab = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Split / Extract Pages
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Load a PDF, select pages, and extract them into a new file.
        </p>

        {!splitDoc ? (
          <DropZone
            onFile={(files) => {
              const f = files[0];
              if (f) loadSplitPdf(f);
            }}
          />
        ) : (
          <>
            <div
              className="p-3 flex items-center gap-3"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              <FileText size={20} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--foreground)", fontSize: 14 }}>
                {splitPages} pages loaded
              </span>
              <button
                style={{ ...btnStyle, marginLeft: "auto" }}
                onClick={() => {
                  setSplitDoc(null);
                  setSplitBytes(null);
                  setSplitPages(0);
                  setSplitSelected(new Set());
                }}
              >
                Load Different PDF
              </button>
            </div>

            {/* Range input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                placeholder="e.g., 1-3, 5, 7-10"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button style={btnStyle} onClick={applySplitRange}>
                Apply Range
              </button>
            </div>

            {/* Page checkboxes */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: splitPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => toggleSplitPage(p)}
                  className="flex items-center gap-1"
                  style={{
                    ...btnStyle,
                    backgroundColor: splitSelected.has(p)
                      ? "var(--primary)"
                      : "var(--card)",
                    color: splitSelected.has(p)
                      ? "var(--primary-foreground)"
                      : "var(--card-foreground)",
                    minWidth: 48,
                    justifyContent: "center",
                  }}
                >
                  {splitSelected.has(p) ? (
                    <CheckSquare size={14} />
                  ) : (
                    <Square size={14} />
                  )}
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                style={btnPrimaryStyle}
                onClick={extractPages}
                disabled={splitSelected.size === 0 || splitting}
              >
                {splitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Extracting...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Extract {splitSelected.size} Page
                    {splitSelected.size !== 1 ? "s" : ""}
                  </>
                )}
              </button>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {splitSelected.size} of {splitPages} selected
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ─── Tab: Convert ─────────────────────────────────────────────────────────

  const renderConvertTab = () => {
    const formats: {
      id: "word" | "excel" | "image";
      label: string;
      icon: React.ElementType;
    }[] = [
      { id: "word", label: "PDF to Word", icon: FileText },
      { id: "excel", label: "PDF to Excel", icon: FileSpreadsheet },
      { id: "image", label: "PDF to Image", icon: Image },
    ];

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Convert PDF
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
            Convert your PDF to other formats. Conversion happens server-side.
          </p>

          {/* Format selection */}
          <div className="flex gap-2">
            {formats.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  style={{
                    ...btnStyle,
                    flex: 1,
                    justifyContent: "center",
                    padding: "12px 8px",
                    flexDirection: "column" as const,
                    gap: 8,
                    backgroundColor:
                      convertFormat === f.id ? "var(--primary)" : "var(--card)",
                    color:
                      convertFormat === f.id
                        ? "var(--primary-foreground)"
                        : "var(--card-foreground)",
                  }}
                  onClick={() => setConvertFormat(f.id)}
                >
                  <Icon size={24} />
                  <span style={{ fontSize: 12 }}>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Upload */}
          {!convertFile ? (
            <DropZone
              onFile={(files) => {
                const f = files[0];
                if (f) setConvertFile(f);
              }}
            />
          ) : (
            <div className="space-y-4">
              <div
                className="p-3 flex items-center gap-3"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <FileText size={20} style={{ color: "var(--primary)" }} />
                <span
                  className="flex-1 text-sm truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {convertFile.name}
                </span>
                <button
                  style={btnStyle}
                  onClick={() => {
                    setConvertFile(null);
                    setConvertProgress(0);
                    setConverting(false);
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {converting && (
                <div className="space-y-2">
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      backgroundColor: "var(--secondary)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(convertProgress, 100)}%`,
                        height: "100%",
                        backgroundColor: "var(--primary)",
                        borderRadius: 4,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Converting... {Math.min(Math.round(convertProgress), 100)}%
                  </p>
                </div>
              )}

              {!converting && convertProgress >= 100 && (
                <div
                  className="p-3 text-center"
                  style={{
                    backgroundColor: "var(--accent)",
                    borderRadius: 8,
                    color: "var(--accent-foreground)",
                    fontSize: 13,
                  }}
                >
                  Conversion complete! (Simulated - server-side processing required)
                </div>
              )}

              {!converting && convertProgress < 100 && (
                <button style={btnPrimaryStyle} onClick={simulateConvert}>
                  <FileOutput size={16} /> Start Conversion
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Tab: Compress ────────────────────────────────────────────────────────

  const renderCompressTab = () => {
    const qualityLabel =
      compressQuality < 33 ? "Low" : compressQuality < 66 ? "Medium" : "High";

    const estimatedSize = originalSize
      ? Math.round(originalSize * (0.3 + (compressQuality / 100) * 0.6))
      : 0;

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Compress PDF
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
            Reduce the file size of your PDF. Lower quality results in smaller files.
          </p>

          {!compressFile ? (
            <DropZone
              onFile={(files) => {
                const f = files[0];
                if (f) loadCompressPdf(f);
              }}
            />
          ) : (
            <div className="space-y-5">
              <div
                className="p-3 flex items-center gap-3"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <FileText size={20} style={{ color: "var(--primary)" }} />
                <div className="flex-1">
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {compressFile.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    Original: {formatBytes(originalSize)}
                  </p>
                </div>
                <button
                  style={btnStyle}
                  onClick={() => {
                    setCompressFile(null);
                    setCompressBytes(null);
                    setOriginalSize(0);
                    setCompressedSize(null);
                    setCompressProgress(0);
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Quality slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label style={{ fontSize: 13, color: "var(--foreground)" }}>
                    Quality: <strong>{qualityLabel}</strong>
                  </label>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Est. output: {formatBytes(estimatedSize)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={compressQuality}
                  onChange={(e) => setCompressQuality(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--primary)" }}
                />
                <div
                  className="flex justify-between"
                  style={{ fontSize: 10, color: "var(--muted-foreground)" }}
                >
                  <span>Smaller file</span>
                  <span>Higher quality</span>
                </div>
              </div>

              {/* Progress */}
              {compressing && (
                <div className="space-y-2">
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      backgroundColor: "var(--secondary)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(compressProgress, 100)}%`,
                        height: "100%",
                        backgroundColor: "var(--primary)",
                        borderRadius: 4,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Compressing... {Math.min(Math.round(compressProgress), 100)}%
                  </p>
                </div>
              )}

              {compressedSize !== null && !compressing && (
                <div
                  className="p-3 text-center"
                  style={{
                    backgroundColor: "var(--accent)",
                    borderRadius: 8,
                    color: "var(--accent-foreground)",
                    fontSize: 13,
                  }}
                >
                  Compressed! Original: {formatBytes(originalSize)} → Estimated:{" "}
                  {formatBytes(compressedSize)}
                </div>
              )}

              {!compressing && (
                <button style={btnPrimaryStyle} onClick={compressPdf}>
                  <Download size={16} /> Compress & Download
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Render active tab ────────────────────────────────────────────────────

  const renderActiveTab = () => {
    switch (activeTab) {
      case "view":
        return renderViewTab();
      case "edit":
        return renderEditTab();
      case "merge":
        return renderMergeTab();
      case "split":
        return renderSplitTab();
      case "convert":
        return renderConvertTab();
      case "compress":
        return renderCompressTab();
    }
  };

  // ─── Main layout ──────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          PDF Tools
        </h1>
        {pdfName && (
          <span
            className="text-sm truncate"
            style={{ color: "var(--muted-foreground)", maxWidth: 300 }}
          >
            — {pdfName}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 px-4 py-2 overflow-x-auto"
        style={{
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? "var(--primary)" : "transparent",
                color: isActive
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "var(--muted)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">{renderActiveTab()}</div>
    </div>
  );
}
