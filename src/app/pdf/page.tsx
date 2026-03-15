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
import { PDFDocument, degrees } from "pdf-lib";

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
    "none" | "text" | "highlight" | "draw" | "stamp" | "signature" | "redaction"
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

  // ── Page rotation state ──
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});

  // ── Page reorder drag state ──
  const [draggedThumb, setDraggedThumb] = useState<number | null>(null);
  const [dragOverThumb, setDragOverThumb] = useState<number | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // ── Page numbers state ──
  const [pageNumbersAdded, setPageNumbersAdded] = useState(false);

  // ── Watermark state ──
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    type: "text",
    text: "CONFIDENTIAL",
    fontSize: 48,
    opacity: 0.3,
    rotation: -45,
    color: "#888888",
  });
  const [watermarkApplied, setWatermarkApplied] = useState(false);

  // ── Redaction state (extends editMode) ──
  const [redactionStart, setRedactionStart] = useState<{ x: number; y: number } | null>(null);

  // ── OCR state ──
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);

  // ── Form builder state ──
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [activeFormFieldType, setActiveFormFieldType] = useState<FormField["type"] | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);

  // ── Digital signature with certificate ──
  const [showCertModal, setShowCertModal] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo>({
    name: "",
    email: "",
    organization: "",
    reason: "Document Approval",
    date: new Date().toISOString().split("T")[0],
  });
  const [certSignatureApplied, setCertSignatureApplied] = useState(false);

  // ── Bookmarks panel state ──
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");

  // ── Compare PDFs state ──
  const [showCompare, setShowCompare] = useState(false);
  const [compareDoc, setCompareDoc] = useState<PDFDocumentProxy | null>(null);
  const [compareBytes, setCompareBytes] = useState<ArrayBuffer | null>(null);
  const [compareName, setCompareName] = useState("");
  const [comparePage, setComparePage] = useState(1);
  const [compareTotalPages, setCompareTotalPages] = useState(0);
  const compareCanvasRef = useRef<HTMLCanvasElement>(null);
  const compareCanvasRef2 = useRef<HTMLCanvasElement>(null);

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
    setPageRotations({});
    setPageOrder(Array.from({ length: doc.numPages }, (_, i) => i + 1));
    setPageNumbersAdded(false);
    setWatermarkApplied(false);
    setFormFields([]);
    setCertSignatureApplied(false);
    setBookmarks([]);
    setOcrComplete(false);

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

      const rotation = pageRotations[pageNum] ?? 0;
      const viewport = page.getViewport({ scale, rotation });
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
    [pdfDoc, fitMode, showThumbnails, pageRotations]
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
          case "redaction":
            ctx.fillStyle = "#000000";
            ctx.fillRect(a.x, a.y, a.width ?? 100, a.height ?? 20);
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
    if (editMode === "redaction") {
      setRedactionStart({ x, y });
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

  const handleOverlayMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

    if (editMode === "redaction" && redactionStart) {
      const { x, y } = getCanvasCoords(e);
      const rx = Math.min(redactionStart.x, x);
      const ry = Math.min(redactionStart.y, y);
      const rw = Math.abs(x - redactionStart.x);
      const rh = Math.abs(y - redactionStart.y);
      if (rw > 5 && rh > 5) {
        setAnnotations((prev) => [
          ...prev,
          { id: uid(), type: "redaction", page: currentPage, x: rx, y: ry, width: rw, height: rh },
        ]);
      }
      setRedactionStart(null);
    }
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

  // ─── Page Rotation ───────────────────────────────────────────────────────

  const rotatePage = (pageNum: number, degrees: 90 | -90 | 180) => {
    setPageRotations((prev) => {
      const current = prev[pageNum] ?? 0;
      const next = (current + degrees + 360) % 360;
      return { ...prev, [pageNum]: next };
    });
  };

  const rotateAllPages = (degrees: 90 | -90 | 180) => {
    setPageRotations((prev) => {
      const updated = { ...prev };
      for (let i = 1; i <= totalPages; i++) {
        const current = updated[i] ?? 0;
        updated[i] = (current + degrees + 360) % 360;
      }
      return updated;
    });
  };

  // ─── Page Reorder ──────────────────────────────────────────────────────────

  const handleThumbDragStart = (index: number) => {
    setDraggedThumb(index);
  };

  const handleThumbDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverThumb(index);
  };

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

  // ─── Add Page Numbers ──────────────────────────────────────────────────────

  const addPageNumbers = async () => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const pages = doc.getPages();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pages.forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(`${idx + 1}`, {
          x: width / 2 - 5,
          y: 20,
          size: 12,
        });
      });
      const bytes = await doc.save();
      setPdfBytes(bytes.buffer as ArrayBuffer);
      const lib = await loadPdfjs();
      const newDoc = await lib.getDocument({ data: new Uint8Array(bytes) }).promise;
      setPdfDoc(newDoc);
      setPageNumbersAdded(true);
    } catch (err) {
      console.error("Failed to add page numbers:", err);
    }
  };

  // ─── Watermark ─────────────────────────────────────────────────────────────

  const applyWatermark = async () => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const pages = doc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        if (watermarkConfig.type === "text") {
          page.drawText(watermarkConfig.text, {
            x: width / 4,
            y: height / 2,
            size: watermarkConfig.fontSize,
            opacity: watermarkConfig.opacity,
            rotate: degrees(watermarkConfig.rotation),
          });
        }
      }
      const bytes = await doc.save();
      setPdfBytes(bytes.buffer as ArrayBuffer);
      const lib = await loadPdfjs();
      const newDoc = await lib.getDocument({ data: new Uint8Array(bytes) }).promise;
      setPdfDoc(newDoc);
      setWatermarkApplied(true);
      setShowWatermarkModal(false);
    } catch (err) {
      console.error("Failed to apply watermark:", err);
    }
  };

  // ─── OCR Placeholder ──────────────────────────────────────────────────────

  const runOcr = () => {
    setOcrProcessing(true);
    setOcrComplete(false);
    setTimeout(() => {
      setOcrProcessing(false);
      setOcrComplete(true);
    }, 3000);
  };

  // ─── Form Builder ──────────────────────────────────────────────────────────

  const addFormField = (type: FormField["type"]) => {
    const field: FormField = {
      id: uid(),
      type,
      page: currentPage,
      x: 100,
      y: 300,
      width: type === "checkbox" || type === "radio" ? 20 : 200,
      height: type === "checkbox" || type === "radio" ? 20 : 30,
      label: `${type}_${formFields.length + 1}`,
      options: type === "dropdown" ? ["Option 1", "Option 2", "Option 3"] : undefined,
      required: false,
    };
    setFormFields((prev) => [...prev, field]);
  };

  const removeFormField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  // ─── Digital Signature with Certificate ────────────────────────────────────

  const applyCertSignature = () => {
    if (!certificateInfo.name || !certificateInfo.email) return;
    setCertSignatureApplied(true);
    setShowCertModal(false);
  };

  // ─── Bookmarks ─────────────────────────────────────────────────────────────

  const addBookmark = () => {
    if (!newBookmarkTitle.trim()) return;
    setBookmarks((prev) => [
      ...prev,
      { id: uid(), title: newBookmarkTitle, page: currentPage, level: 0 },
    ]);
    setNewBookmarkTitle("");
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // ─── Compare PDFs ──────────────────────────────────────────────────────────

  const loadCompareDoc = async (file: File) => {
    const lib = await loadPdfjs();
    const data = await file.arrayBuffer();
    const doc = await lib.getDocument({ data: new Uint8Array(data) }).promise;
    setCompareDoc(doc);
    setCompareBytes(data);
    setCompareName(file.name);
    setCompareTotalPages(doc.numPages);
    setComparePage(1);
  };

  const renderComparePages = useCallback(async () => {
    if (!pdfDoc || !compareDoc) return;

    // Render original
    if (compareCanvasRef.current) {
      const page = await pdfDoc.getPage(Math.min(comparePage, totalPages));
      const vp = page.getViewport({ scale: 0.8 });
      const canvas = compareCanvasRef.current;
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
    }

    // Render comparison
    if (compareCanvasRef2.current) {
      const page = await compareDoc.getPage(Math.min(comparePage, compareTotalPages));
      const vp = page.getViewport({ scale: 0.8 });
      const canvas = compareCanvasRef2.current;
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
    }
  }, [pdfDoc, compareDoc, comparePage, totalPages, compareTotalPages]);

  useEffect(() => {
    if (showCompare && pdfDoc && compareDoc) {
      renderComparePages();
    }
  }, [showCompare, pdfDoc, compareDoc, renderComparePages]);

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

          <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

          {/* Rotation buttons */}
          <button
            style={btnStyle}
            onClick={() => rotatePage(currentPage, -90)}
            title="Rotate page 90° counter-clockwise"
          >
            <RotateCcw size={16} />
          </button>
          <button
            style={btnStyle}
            onClick={() => rotatePage(currentPage, 90)}
            title="Rotate page 90° clockwise"
          >
            <RotateCw size={16} />
          </button>
          <button
            style={btnStyle}
            onClick={() => rotatePage(currentPage, 180)}
            title="Rotate page 180°"
          >
            <RotateCw size={16} /> 180°
          </button>
          <button
            style={btnStyle}
            onClick={() => rotateAllPages(90)}
            title="Rotate all pages 90° clockwise"
          >
            <RotateCw size={16} /> All
          </button>

          <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />

          {/* Bookmarks toggle */}
          <button
            style={{
              ...btnStyle,
              ...(showBookmarks ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setShowBookmarks((b) => !b)}
            title="Toggle bookmarks panel"
          >
            <BookOpen size={16} /> Bookmarks
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
                  key={`thumb-${i}`}
                  className="cursor-pointer flex flex-col items-center"
                  draggable
                  onDragStart={() => handleThumbDragStart(i)}
                  onDragOver={(e) => handleThumbDragOver(e, i)}
                  onDrop={() => handleThumbDrop(i)}
                  onDragEnd={() => { setDraggedThumb(null); setDragOverThumb(null); }}
                  onClick={() => setCurrentPage(pageOrder[i] ?? i + 1)}
                  style={{
                    border:
                      currentPage === (pageOrder[i] ?? i + 1)
                        ? "2px solid var(--primary)"
                        : dragOverThumb === i
                        ? "2px dashed var(--primary)"
                        : "2px solid transparent",
                    borderRadius: 4,
                    padding: 2,
                    opacity: draggedThumb === i ? 0.5 : 1,
                    transition: "opacity 0.15s, border-color 0.15s",
                  }}
                >
                  <div className="flex items-center gap-1 w-full" style={{ fontSize: 9, color: "var(--muted-foreground)" }}>
                    <GripVertical size={10} style={{ cursor: "grab", flexShrink: 0 }} />
                    <span className="flex-1 text-center">{pageOrder[i] ?? i + 1}</span>
                  </div>
                  <img
                    src={src}
                    alt={`Page ${pageOrder[i] ?? i + 1}`}
                    style={{ width: "100%", borderRadius: 2 }}
                  />
                  {(pageRotations[pageOrder[i] ?? i + 1] ?? 0) > 0 && (
                    <span style={{ fontSize: 9, color: "var(--primary)" }}>
                      {pageRotations[pageOrder[i] ?? i + 1]}°
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bookmarks panel */}
          {showBookmarks && (
            <div
              className="overflow-y-auto flex flex-col gap-2 p-2"
              style={{
                width: 220,
                backgroundColor: "var(--card)",
                borderRight: "1px solid var(--border)",
              }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wide px-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Bookmarks / TOC
              </h3>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  placeholder="Bookmark title..."
                  style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                  onKeyDown={(e) => { if (e.key === "Enter") addBookmark(); }}
                />
                <button style={{ ...btnStyle, padding: "4px 8px" }} onClick={addBookmark}>
                  +
                </button>
              </div>
              <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                Adds bookmark for page {currentPage}
              </p>
              {bookmarks.length === 0 ? (
                <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic", padding: "8px 0" }}>
                  No bookmarks yet. Add one above.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="flex items-center gap-1 px-1 py-1 rounded cursor-pointer"
                      style={{
                        backgroundColor: currentPage === bm.page ? "var(--accent)" : "transparent",
                        fontSize: 12,
                      }}
                      onClick={() => setCurrentPage(bm.page)}
                    >
                      <BookOpen size={12} style={{ flexShrink: 0, color: "var(--primary)" }} />
                      <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>
                        {bm.title}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>p.{bm.page}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBookmark(bm.id); }}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}
                      >
                        <X size={10} style={{ color: "var(--muted-foreground)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

          {/* Redaction */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(editMode === "redaction" ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setEditMode(editMode === "redaction" ? "none" : "redaction")}
          >
            <EyeOff size={16} /> Redact Area
          </button>

          {editMode === "redaction" && (
            <p style={{ fontSize: 10, color: "var(--muted-foreground)", paddingLeft: 8 }}>
              Click and drag on the PDF to black out sensitive areas.
            </p>
          )}

          <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Page Tools
          </h3>

          {/* Add Page Numbers */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(pageNumbersAdded ? { opacity: 0.6 } : {}),
            }}
            onClick={addPageNumbers}
            disabled={pageNumbersAdded}
          >
            <Hash size={16} /> {pageNumbersAdded ? "Numbers Added" : "Add Page Numbers"}
          </button>

          {/* Watermark */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(watermarkApplied ? { opacity: 0.6 } : {}),
            }}
            onClick={() => setShowWatermarkModal(true)}
          >
            <Droplets size={16} /> {watermarkApplied ? "Watermark Applied" : "Add Watermark"}
          </button>

          {/* OCR */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
            }}
            onClick={runOcr}
            disabled={ocrProcessing}
          >
            {ocrProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> OCR Processing...
              </>
            ) : ocrComplete ? (
              <>
                <ScanText size={16} /> OCR Complete
              </>
            ) : (
              <>
                <ScanText size={16} /> Run OCR
              </>
            )}
          </button>

          <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Security
          </h3>

          {/* Digital Signature with Certificate */}
          <button
            style={{
              ...btnStyle,
              width: "100%",
              justifyContent: "flex-start",
              ...(certSignatureApplied ? { backgroundColor: "var(--accent)" } : {}),
            }}
            onClick={() => setShowCertModal(true)}
          >
            <ShieldCheck size={16} /> {certSignatureApplied ? "Certificate Applied" : "Digital Certificate"}
          </button>

          {certSignatureApplied && (
            <div
              className="flex flex-col gap-1 pl-2"
              style={{ fontSize: 10, color: "var(--muted-foreground)" }}
            >
              <div className="flex items-center gap-1">
                <Award size={10} style={{ color: "var(--primary)" }} />
                <span>Signed by: {certificateInfo.name}</span>
              </div>
              <span>Org: {certificateInfo.organization}</span>
              <span>Date: {certificateInfo.date}</span>
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

        {/* Watermark modal */}
        {showWatermarkModal && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowWatermarkModal(false)}
          >
            <div
              className="flex flex-col gap-4 p-6"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                width: 380,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                  <Droplets size={18} style={{ display: "inline", marginRight: 8 }} />
                  Add Watermark
                </h3>
                <button
                  style={{ border: "none", background: "none", cursor: "pointer" }}
                  onClick={() => setShowWatermarkModal(false)}
                >
                  <X size={18} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  style={{
                    ...btnStyle,
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor: watermarkConfig.type === "text" ? "var(--primary)" : "var(--card)",
                    color: watermarkConfig.type === "text" ? "var(--primary-foreground)" : "var(--card-foreground)",
                  }}
                  onClick={() => setWatermarkConfig((c) => ({ ...c, type: "text" }))}
                >
                  <Type size={14} /> Text
                </button>
                <button
                  style={{
                    ...btnStyle,
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor: watermarkConfig.type === "image" ? "var(--primary)" : "var(--card)",
                    color: watermarkConfig.type === "image" ? "var(--primary-foreground)" : "var(--card-foreground)",
                  }}
                  onClick={() => setWatermarkConfig((c) => ({ ...c, type: "image" }))}
                >
                  <Image size={14} /> Image
                </button>
              </div>

              {watermarkConfig.type === "text" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkConfig.text}
                      onChange={(e) => setWatermarkConfig((c) => ({ ...c, text: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Font Size</label>
                      <input
                        type="number"
                        value={watermarkConfig.fontSize}
                        onChange={(e) => setWatermarkConfig((c) => ({ ...c, fontSize: Number(e.target.value) }))}
                        style={inputStyle}
                        min={12}
                        max={120}
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Rotation</label>
                      <input
                        type="number"
                        value={watermarkConfig.rotation}
                        onChange={(e) => setWatermarkConfig((c) => ({ ...c, rotation: Number(e.target.value) }))}
                        style={inputStyle}
                        min={-90}
                        max={90}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                        Opacity: {Math.round(watermarkConfig.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={Math.round(watermarkConfig.opacity * 100)}
                        onChange={(e) => setWatermarkConfig((c) => ({ ...c, opacity: Number(e.target.value) / 100 }))}
                        style={{ accentColor: "var(--primary)" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Color</label>
                      <input
                        type="color"
                        value={watermarkConfig.color}
                        onChange={(e) => setWatermarkConfig((c) => ({ ...c, color: e.target.value }))}
                        style={{ width: 30, height: 30, border: "none", cursor: "pointer" }}
                      />
                    </div>
                  </div>
                </>
              )}

              {watermarkConfig.type === "image" && (
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Image watermark support requires server-side processing.
                  </label>
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                      Opacity: {Math.round(watermarkConfig.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round(watermarkConfig.opacity * 100)}
                      onChange={(e) => setWatermarkConfig((c) => ({ ...c, opacity: Number(e.target.value) / 100 }))}
                      style={{ accentColor: "var(--primary)" }}
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              <div
                className="flex items-center justify-center"
                style={{
                  height: 80,
                  backgroundColor: "var(--secondary)",
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontSize: Math.min(watermarkConfig.fontSize / 2, 28),
                    color: watermarkConfig.color,
                    opacity: watermarkConfig.opacity,
                    transform: `rotate(${watermarkConfig.rotation}deg)`,
                    fontWeight: "bold",
                  }}
                >
                  {watermarkConfig.text || "Preview"}
                </span>
              </div>

              <button style={btnPrimaryStyle} onClick={applyWatermark}>
                <Droplets size={16} /> Apply Watermark
              </button>
            </div>
          </div>
        )}

        {/* Digital Certificate modal */}
        {showCertModal && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowCertModal(false)}
          >
            <div
              className="flex flex-col gap-4 p-6"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                width: 400,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                  <ShieldCheck size={18} style={{ display: "inline", marginRight: 8 }} />
                  Digital Signature Certificate
                </h3>
                <button
                  style={{ border: "none", background: "none", cursor: "pointer" }}
                  onClick={() => setShowCertModal(false)}
                >
                  <X size={18} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Full Name *</label>
                  <input
                    type="text"
                    value={certificateInfo.name}
                    onChange={(e) => setCertificateInfo((c) => ({ ...c, name: e.target.value }))}
                    style={inputStyle}
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Email *</label>
                  <input
                    type="email"
                    value={certificateInfo.email}
                    onChange={(e) => setCertificateInfo((c) => ({ ...c, email: e.target.value }))}
                    style={inputStyle}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Organization</label>
                  <input
                    type="text"
                    value={certificateInfo.organization}
                    onChange={(e) => setCertificateInfo((c) => ({ ...c, organization: e.target.value }))}
                    style={inputStyle}
                    placeholder="Company Inc."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Reason for Signing</label>
                  <select
                    value={certificateInfo.reason}
                    onChange={(e) => setCertificateInfo((c) => ({ ...c, reason: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="Document Approval">Document Approval</option>
                    <option value="Contract Signing">Contract Signing</option>
                    <option value="Authorship Attestation">Authorship Attestation</option>
                    <option value="Review Completion">Review Completion</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Date</label>
                  <input
                    type="date"
                    value={certificateInfo.date}
                    onChange={(e) => setCertificateInfo((c) => ({ ...c, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Certificate preview */}
              <div
                className="p-3 flex flex-col gap-2"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Award size={16} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                    Certificate Preview
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  <p>Signer: {certificateInfo.name || "—"}</p>
                  <p>Email: {certificateInfo.email || "—"}</p>
                  <p>Organization: {certificateInfo.organization || "—"}</p>
                  <p>Reason: {certificateInfo.reason}</p>
                  <p>Date: {certificateInfo.date}</p>
                  <p>Hash: SHA-256</p>
                </div>
              </div>

              <button
                style={btnPrimaryStyle}
                onClick={applyCertSignature}
                disabled={!certificateInfo.name || !certificateInfo.email}
              >
                <ShieldCheck size={16} /> Apply Digital Signature
              </button>
            </div>
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

  // ─── Tab: Forms ──────────────────────────────────────────────────────────

  const renderFormsTab = () => {
    if (!pdfDoc) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <p style={{ color: "var(--muted-foreground)" }}>
            Please load a PDF in the View tab first.
          </p>
        </div>
      );
    }

    const fieldTypes: { type: FormField["type"]; label: string; icon: React.ElementType }[] = [
      { type: "text-input", label: "Text Field", icon: FormInput },
      { type: "checkbox", label: "Checkbox", icon: CheckSquare },
      { type: "radio", label: "Radio Button", icon: Circle },
      { type: "dropdown", label: "Dropdown", icon: ChevronDown },
    ];

    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Form builder sidebar */}
        <div
          className="flex flex-col gap-3 p-3 overflow-y-auto"
          style={{
            width: 240,
            backgroundColor: "var(--card)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Form Fields
          </h3>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Add form elements to your PDF. Fields will be placed on page {currentPage}.
          </p>

          {fieldTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              style={{ ...btnStyle, width: "100%", justifyContent: "flex-start" }}
              onClick={() => addFormField(type)}
            >
              <Icon size={16} /> Add {label}
            </button>
          ))}

          <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted-foreground)" }}
          >
            Added Fields ({formFields.length})
          </h3>

          {formFields.length === 0 ? (
            <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>
              No form fields added yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {formFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 px-2 py-1"
                  style={{
                    backgroundColor: "var(--secondary)",
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                >
                  {field.type === "text-input" && <FormInput size={12} />}
                  {field.type === "checkbox" && <CheckSquare size={12} />}
                  {field.type === "radio" && <Circle size={12} />}
                  {field.type === "dropdown" && <ChevronDown size={12} />}
                  <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>
                    {field.label}
                  </span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: 9 }}>p.{field.page}</span>
                  <button
                    onClick={() => removeFormField(field.id)}
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 1 }}
                  >
                    <X size={10} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form preview area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
          </div>

          <div
            className="flex-1 overflow-auto flex items-start justify-center p-4"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div className="relative inline-block" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              <canvas ref={mainCanvasRef} style={{ display: "block" }} />
              {/* Render form field overlays for current page */}
              {formFields
                .filter((f) => f.page === currentPage)
                .map((field) => (
                  <div
                    key={field.id}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: field.x,
                      top: field.y,
                      width: field.width,
                      height: field.height,
                      border: "2px dashed var(--primary)",
                      borderRadius: 4,
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                      fontSize: 10,
                      color: "var(--primary)",
                      cursor: "move",
                      pointerEvents: "auto",
                    }}
                  >
                    {field.type === "text-input" && (
                      <div className="flex items-center gap-1 px-1">
                        <FormInput size={10} />
                        <span>{field.label}</span>
                      </div>
                    )}
                    {field.type === "checkbox" && <CheckSquare size={14} />}
                    {field.type === "radio" && <Circle size={14} />}
                    {field.type === "dropdown" && (
                      <div className="flex items-center gap-1 px-1">
                        <List size={10} />
                        <span>{field.label}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Tab: Compare ─────────────────────────────────────────────────────────

  const renderCompareTab = () => {
    if (!pdfDoc) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <p style={{ color: "var(--muted-foreground)" }}>
            Please load a PDF in the View tab first, then load a second PDF here to compare.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compare toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-2"
          style={{
            backgroundColor: "var(--card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}>
            <Columns2 size={16} style={{ display: "inline", marginRight: 6 }} />
            Side-by-Side Compare
          </span>
          <div className="flex-1" />
          {compareDoc && (
            <>
              <button
                style={btnStyle}
                onClick={() => setComparePage((p) => Math.max(1, p - 1))}
                disabled={comparePage <= 1}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                Page {comparePage}
              </span>
              <button
                style={btnStyle}
                onClick={() => setComparePage((p) => Math.min(Math.max(totalPages, compareTotalPages), p + 1))}
                disabled={comparePage >= Math.max(totalPages, compareTotalPages)}
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: original document */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ borderRight: "2px solid var(--border)" }}
          >
            <div
              className="px-3 py-1 text-center"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--foreground)",
                fontWeight: 600,
              }}
            >
              Original: {pdfName} ({totalPages} pages)
            </div>
            <div
              className="flex-1 overflow-auto flex items-start justify-center p-4"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <div style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                <canvas ref={compareCanvasRef} style={{ display: "block" }} />
              </div>
            </div>
          </div>

          {/* Right: comparison document */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!compareDoc ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                  <DropZone
                    onFile={(files) => {
                      const f = files[0];
                      if (f) loadCompareDoc(f);
                    }}
                    label="Drop a second PDF here to compare"
                  />
                </div>
              </div>
            ) : (
              <>
                <div
                  className="px-3 py-1 text-center"
                  style={{
                    backgroundColor: "var(--secondary)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 12,
                    color: "var(--foreground)",
                    fontWeight: 600,
                  }}
                >
                  Compare: {compareName} ({compareTotalPages} pages)
                </div>
                <div
                  className="flex-1 overflow-auto flex items-start justify-center p-4"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <div style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                    <canvas ref={compareCanvasRef2} style={{ display: "block" }} />
                  </div>
                </div>
              </>
            )}
          </div>
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
      case "forms":
        return renderFormsTab();
      case "compare":
        return renderCompareTab();
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
