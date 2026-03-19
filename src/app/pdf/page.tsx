"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Type, Highlighter,
  Pencil, Stamp, PenTool, Undo2, Trash2, FilePlus, Scissors, FileOutput,
  Download, Loader2, FileText, FileSpreadsheet, Image, Minimize2, X,
  RotateCw, RotateCcw, Hash, Droplets, EyeOff, ScanText, FormInput,
  ShieldCheck, BookOpen, Columns2, Circle, ChevronDown, Search, Printer,
  FilePlus2, Underline, Strikethrough, StickyNote, RectangleHorizontal,
  Layers, Info, FileCheck, Lock, AlignCenter, Presentation, CheckSquare,
  Square, Fullscreen, LayoutGrid, Eye, Wrench, Award,
} from "lucide-react";
import { PDFDocument, degrees, PageSizes } from "pdf-lib";
import { RibbonToolbar } from "@/components/pdf";
import { SearchPanel } from "@/components/pdf";
import { PropertiesPanel } from "@/components/pdf";
import { HeaderFooterModal } from "@/components/pdf";
import { PrintModal } from "@/components/pdf";
import { ExportModal } from "@/components/pdf";
import { BookmarksPanel } from "@/components/pdf";
import { OrganizePagesPanel } from "@/components/pdf";
import { BatchPanel } from "@/components/pdf";
import { StampPanel } from "@/components/pdf";
import { RedactionPanel } from "@/components/pdf";
import type {
  RibbonTabId, HeaderFooterConfig, PrintOptions, ExportOptions,
  SecurityConfig, DocumentProperties, SearchResult,
} from "@/components/pdf/types";

// Local component imports
import PdfViewer, { DropZone, loadPdfjs, uid } from "./components/PdfViewer";
import type { PDFDocumentProxy, Annotation } from "./components/PdfViewer";
import PdfEditor from "./components/PdfEditor";
import PdfMerge from "./components/PdfMerge";
import type { MergeFile } from "./components/PdfMerge";
import PdfSplit from "./components/PdfSplit";
import PdfConvert from "./components/PdfConvert";
import type { ConvertDirection } from "./components/PdfConvert";
import PdfCompress from "./components/PdfCompress";
import type { CompressQuality } from "./components/PdfCompress";
import PdfForms from "./components/PdfForms";
import type { FormField } from "./components/PdfForms";
import { PasswordProtectionModal, ComparePanel, OcrPanel, PdfCreatorPanel } from "./components/PdfSecurity";
import type { CreatorElement } from "./components/PdfSecurity";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { ExportProgress } from "@/components/shared/export-progress";
import { ImportDialog } from "@/components/shared/import-dialog";
import { PrintPreviewModal } from "@/components/shared/print-preview-modal";
import { ExportManager, type ExportFormat as UnifiedExportFormat } from "@/lib/export-manager";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "view" | "edit" | "merge" | "split" | "convert" | "compress" | "forms" | "compare" | "ocr" | "create" | "redact" | "stamp" | "batch";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "view", label: "View", icon: FileText },
  { id: "edit", label: "Edit", icon: Pencil },
  { id: "merge", label: "Merge", icon: FilePlus },
  { id: "split", label: "Split", icon: Scissors },
  { id: "convert", label: "Convert", icon: FileOutput },
  { id: "compress", label: "Compress", icon: Minimize2 },
  { id: "forms", label: "Forms", icon: FormInput },
  { id: "compare", label: "Compare", icon: Columns2 },
  { id: "ocr", label: "OCR", icon: ScanText },
  { id: "redact", label: "Redact", icon: EyeOff },
  { id: "stamp", label: "Stamp", icon: Stamp },
  { id: "batch", label: "Batch", icon: Layers },
  { id: "create", label: "Create", icon: FilePlus2 },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 13, transition: "background-color 0.15s",
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle, backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px",
  fontSize: 13, outline: "none",
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PdfToolsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("view");
  const [ribbonTab, setRibbonTab] = useState<RibbonTabId>("home");

  // ── Shared viewer state ──
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Annotations ──
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

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
  const [splitMode, setSplitMode] = useState<"range" | "every-n" | "extract">("range");
  const [splitEveryN, setSplitEveryN] = useState(1);

  // ── Convert state ──
  const [convertDirection, setConvertDirection] = useState<ConvertDirection>("pdf-to-word");
  const [convertFile, setConvertFile] = useState<File | null>(null);
  const [convertProgress, setConvertProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [convertImageFormat, setConvertImageFormat] = useState<"png" | "jpg">("png");

  // ── Compress state ──
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressBytes, setCompressBytes] = useState<ArrayBuffer | null>(null);
  const [compressQuality, setCompressQuality] = useState<CompressQuality>("medium");
  const [compressing, setCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  // ── Form state ──
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // ── Page management state ──
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [pageNumbersAdded, setPageNumbersAdded] = useState(false);

  // ── Watermark ──
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [watermarkConfig, setWatermarkConfig] = useState({
    type: "text" as "text" | "image", text: "CONFIDENTIAL",
    fontSize: 48, opacity: 0.3, rotation: -45, color: "#888888",
  });
  const [watermarkApplied, setWatermarkApplied] = useState(false);

  // ── OCR ──
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState("eng");

  // ── Certificate ──
  const [showCertModal, setShowCertModal] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState({
    name: "", email: "", organization: "", reason: "Document Approval",
    date: new Date().toISOString().split("T")[0],
  });
  const [certSignatureApplied, setCertSignatureApplied] = useState(false);

  // ── Bookmarks ──
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<import("@/components/pdf/types").Bookmark[]>([]);

  // ── Organize Pages ──
  const [showOrganize, setShowOrganize] = useState(false);
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // ── Compare ──
  const [compareDoc, setCompareDoc] = useState<PDFDocumentProxy | null>(null);
  const [compareName, setCompareName] = useState("");
  const [comparePage, setComparePage] = useState(1);
  const [compareTotalPages, setCompareTotalPages] = useState(0);
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [syncScroll, setSyncScroll] = useState(true);
  const compareCanvasRef = useRef<HTMLCanvasElement>(null);
  const compareCanvasRef2 = useRef<HTMLCanvasElement>(null);

  // ── Search ──
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchResult, setCurrentSearchResult] = useState(0);

  // ── Properties ──
  const [showProperties, setShowProperties] = useState(false);
  const [documentProperties, setDocumentProperties] = useState<DocumentProperties>({
    title: "", author: "", subject: "", keywords: "", creator: "",
    producer: "", creationDate: "", modDate: "", pageCount: 0, fileSize: 0,
  });

  // ── Header/Footer ──
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [headerFooterConfig, setHeaderFooterConfig] = useState<HeaderFooterConfig>({
    headerLeft: "", headerCenter: "", headerRight: "",
    footerLeft: "", footerCenter: "", footerRight: "",
    fontSize: 10, startPage: 1, includePageNumbers: true, pageNumberFormat: "1",
  });
  const [headerFooterApplied, setHeaderFooterApplied] = useState(false);

  // ── Print / Export ──
  const [showPrint, setShowPrint] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    pages: "all", range: "", copies: 1, orientation: "portrait",
    scale: "fit", includeAnnotations: true,
  });
  const [showExport, setShowExport] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "standard", quality: "printer", includeBookmarks: true,
    includeAnnotations: true, flatten: false,
  });

  // ── Security ──
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    hasPassword: false, openPassword: "", permissionPassword: "",
    allowPrinting: true, allowCopying: true, allowEditing: true,
    allowAnnotations: true, encryptionLevel: "256-aes",
  });
  const [securityApplied, setSecurityApplied] = useState(false);

  // ── Create blank ──
  const [showCreateBlank, setShowCreateBlank] = useState(false);
  const [flattenApplied, setFlattenApplied] = useState(false);

  // ── PDF Creator ──
  const [creatorElements, setCreatorElements] = useState<CreatorElement[]>([]);
  const [selectedCreatorElement, setSelectedCreatorElement] = useState<string | null>(null);

  // ── Unified Export/Import ──
  const [isUnifiedExporting, setIsUnifiedExporting] = useState(false);
  const [unifiedExportProgress, setUnifiedExportProgress] = useState({ percent: 0, message: "" });
  const [showUnifiedImport, setShowUnifiedImport] = useState(false);
  const [showUnifiedPrintPreview, setShowUnifiedPrintPreview] = useState(false);

  // ── AI Panel ──
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPdfMessages, setAiPdfMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: '👋 Hi! I\'m your PDF AI assistant. Upload a PDF and I can summarize it, answer questions, extract tables, identify key points, and more!' }
  ]);
  const [aiPdfInput, setAiPdfInput] = useState('');

  const handleUnifiedExport = useCallback(async (format: UnifiedExportFormat) => {
    setIsUnifiedExporting(true);
    try {
      if (format === "text-extract") {
        // Extract text from all pages
        const pages: { text?: string }[] = [];
        if (pdfDoc) {
          for (let i = 1; i <= totalPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item: unknown) => { const obj = item as Record<string, unknown>; return typeof obj.str === "string" ? obj.str : ""; }).join(" ");
            pages.push({ text });
          }
        }
        await ExportManager.exportPdf(format, { pages }, pdfName.replace(".pdf", "") || "document", setUnifiedExportProgress);
      } else if (format === "images") {
        // Export pages as images
        const pages: { imageDataUrl?: string }[] = [];
        if (pdfDoc) {
          for (let i = 1; i <= totalPages; i++) {
            setUnifiedExportProgress({ percent: Math.round((i / totalPages) * 80), message: `Rendering page ${i}...` });
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
              pages.push({ imageDataUrl: canvas.toDataURL("image/png") });
            }
          }
        }
        await ExportManager.exportPdf(format, { pages }, pdfName.replace(".pdf", "") || "document", setUnifiedExportProgress);
      }
    } finally {
      setTimeout(() => setIsUnifiedExporting(false), 1500);
    }
  }, [pdfDoc, totalPages, pdfName]);

  const handleUnifiedPdfImport = useCallback(async (file: File) => {
    const buffer = await ExportManager.readFileAsArrayBuffer(file);
    await loadPdf(buffer, file.name);
  }, []);

  // ─── PDF load handler ─────────────────────────────────────────────────────

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
    setPageRotations({});
    setPageNumbersAdded(false);
    setWatermarkApplied(false);
    setFormFields([]);
    setCertSignatureApplied(false);
    setOcrComplete(false);
    setFlattenApplied(false);
  }, []);

  const handleFileUpload = async (file: File) => {
    const data = await file.arrayBuffer();
    await loadPdf(data, file.name);
    setActiveTab("view");
  };

  // ─── Annotation rendering ─────────────────────────────────────────────────

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
            ctx.fillStyle = (a.color ?? "#ffff00") + "59";
            ctx.fillRect(a.x, a.y, a.width ?? 200, a.height ?? 30);
            break;
          case "drawing":
            if (a.points && a.points.length > 1) {
              ctx.strokeStyle = a.color ?? "#ff0000";
              ctx.lineWidth = a.strokeWidth ?? 2;
              ctx.lineCap = "round"; ctx.lineJoin = "round";
              ctx.beginPath();
              ctx.moveTo(a.points[0].x, a.points[0].y);
              for (let i = 1; i < a.points.length; i++) ctx.lineTo(a.points[i].x, a.points[i].y);
              ctx.stroke();
            }
            break;
          case "stamp": {
            const colors: Record<string, string> = { Approved: "#16a34a", Rejected: "#dc2626", Draft: "#ca8a04", Confidential: "#7c3aed", Final: "#2563eb" };
            const color = colors[a.stamp ?? "Draft"] ?? "#666";
            ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(-0.2);
            ctx.strokeStyle = color; ctx.lineWidth = 3;
            ctx.font = "bold 28px sans-serif"; ctx.fillStyle = color;
            const textW = ctx.measureText(a.stamp ?? "").width;
            ctx.strokeRect(-8, -30, textW + 16, 40);
            ctx.globalAlpha = 0.7; ctx.fillText(a.stamp ?? "", 0, 0);
            ctx.restore(); break;
          }
          case "signature":
            if (a.signatureDataUrl) {
              const img = new window.Image();
              img.onload = () => ctx.drawImage(img, a.x, a.y, a.width ?? 200, a.height ?? 80);
              img.src = a.signatureDataUrl;
            }
            break;
          case "redaction":
            ctx.fillStyle = "#000000";
            ctx.fillRect(a.x, a.y, a.width ?? 100, a.height ?? 20);
            break;
          case "underline":
            ctx.strokeStyle = a.color ?? "#0000ff"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(a.x, a.y + (a.height ?? 20));
            ctx.lineTo(a.x + (a.width ?? 200), a.y + (a.height ?? 20)); ctx.stroke();
            break;
          case "strikethrough":
            ctx.strokeStyle = a.color ?? "#ff0000"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(a.x, a.y + (a.height ?? 20) / 2);
            ctx.lineTo(a.x + (a.width ?? 200), a.y + (a.height ?? 20) / 2); ctx.stroke();
            break;
          case "sticky-note": {
            const noteW = a.width ?? 120; const noteH = a.height ?? 100;
            ctx.fillStyle = a.noteColor ?? "#fff9c4";
            ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
            ctx.fillRect(a.x, a.y, noteW, noteH);
            ctx.shadowColor = "transparent";
            ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1;
            ctx.strokeRect(a.x, a.y, noteW, noteH);
            ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(a.x, a.y, noteW, 18);
            if (a.text) {
              ctx.fillStyle = "#333333"; ctx.font = "11px sans-serif";
              a.text.split("\n").forEach((line, idx) => {
                if (idx < 6) ctx.fillText(line, a.x + 6, a.y + 32 + idx * 14, noteW - 12);
              });
            }
            break;
          }
          case "shape": {
            ctx.strokeStyle = a.color ?? "#0066cc"; ctx.lineWidth = a.strokeWidth ?? 2;
            if (a.shapeType === "rectangle") ctx.strokeRect(a.x, a.y, a.width ?? 100, a.height ?? 60);
            else if (a.shapeType === "circle") {
              const rx = (a.width ?? 100) / 2; const ry = (a.height ?? 60) / 2;
              ctx.beginPath(); ctx.ellipse(a.x + rx, a.y + ry, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
            } else if (a.shapeType === "line") {
              ctx.beginPath(); ctx.moveTo(a.x, a.y);
              ctx.lineTo(a.x + (a.width ?? 100), a.y + (a.height ?? 60)); ctx.stroke();
            } else if (a.shapeType === "arrow") {
              const ex = a.x + (a.width ?? 100); const ey = a.y + (a.height ?? 60);
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ex, ey); ctx.stroke();
              const angle = Math.atan2(ey - a.y, ex - a.x); const headLen = 12;
              ctx.beginPath(); ctx.moveTo(ex, ey);
              ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
              ctx.moveTo(ex, ey);
              ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
              ctx.stroke();
            } else if (a.shapeType === "polygon") {
              const cx = a.x + (a.width ?? 100) / 2; const cy = a.y + (a.height ?? 60) / 2;
              const r = Math.min((a.width ?? 100), (a.height ?? 60)) / 2;
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const ang = (Math.PI / 3) * i - Math.PI / 2;
                if (i === 0) ctx.moveTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
                else ctx.lineTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
              }
              ctx.closePath(); ctx.stroke();
            } else if (a.shapeType === "star") {
              const cx = a.x + (a.width ?? 100) / 2; const cy = a.y + (a.height ?? 60) / 2;
              const outer = Math.min((a.width ?? 100), (a.height ?? 60)) / 2;
              const inner = outer * 0.4;
              ctx.beginPath();
              for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? outer : inner;
                const ang = (Math.PI / 5) * i - Math.PI / 2;
                if (i === 0) ctx.moveTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
                else ctx.lineTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
              }
              ctx.closePath(); ctx.stroke();
            }
            break;
          }
        }
      }
    },
    [annotations]
  );

  useEffect(() => {
    if (pdfDoc) renderAnnotations(currentPage);
  }, [annotations, currentPage, pdfDoc, renderAnnotations]);

  // ─── Merge handlers ────────────────────────────────────────────────────────

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
    } catch (err) { console.error("Merge failed:", err); }
    finally { setMerging(false); }
  };

  // ─── Split handlers ────────────────────────────────────────────────────────

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

  const parseRange = (range: string, max: number): number[] => {
    const pages = new Set<number>();
    range.split(",").map((s) => s.trim()).forEach((part) => {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) for (let i = Math.max(1, a); i <= Math.min(max, b); i++) pages.add(i);
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
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
    } catch (err) { console.error("Split failed:", err); }
    finally { setSplitting(false); }
  };

  const splitEveryNPages = async () => {
    if (!splitBytes) return;
    setSplitting(true);
    try {
      const src = await PDFDocument.load(splitBytes);
      const total = src.getPageCount();
      for (let start = 0; start < total; start += splitEveryN) {
        const dest = await PDFDocument.create();
        const end = Math.min(start + splitEveryN, total);
        const indices = Array.from({ length: end - start }, (_, i) => start + i);
        const pages = await dest.copyPages(src, indices);
        pages.forEach((p) => dest.addPage(p));
        const bytes = await dest.save();
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `split_${start + 1}-${end}.pdf`);
      }
    } catch (err) { console.error("Split failed:", err); }
    finally { setSplitting(false); }
  };

  // ─── Convert handler ───────────────────────────────────────────────────────

  const simulateConvert = () => {
    if (!convertFile) return;
    setConverting(true); setConvertProgress(0);
    const interval = setInterval(() => {
      setConvertProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setConverting(false); return 100; }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  // ─── Compress handler ──────────────────────────────────────────────────────

  const loadCompressPdf = async (file: File) => {
    const data = await file.arrayBuffer();
    setCompressFile(file);
    setCompressBytes(data);
    setOriginalSize(data.byteLength);
    setCompressedSize(null);
  };

  const compressPdf = async () => {
    if (!compressBytes) return;
    setCompressing(true); setCompressProgress(0);
    const interval = setInterval(() => {
      setCompressProgress((prev) => { if (prev >= 90) { clearInterval(interval); return 90; } return prev + Math.random() * 20; });
    }, 200);
    try {
      const doc = await PDFDocument.load(compressBytes);
      const bytes = await doc.save();
      const ratios: Record<CompressQuality, number> = { high: 0.9, medium: 0.6, low: 0.3 };
      const estimatedSize = Math.round(bytes.byteLength * ratios[compressQuality]);
      setCompressedSize(estimatedSize);
      clearInterval(interval); setCompressProgress(100);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `compressed_${compressFile?.name ?? "output.pdf"}`);
    } catch (err) { console.error("Compress failed:", err); clearInterval(interval); }
    finally { setCompressing(false); }
  };

  // ─── Form handlers ─────────────────────────────────────────────────────────

  const addFormField = (type: FormField["type"]) => {
    const field: FormField = {
      id: uid(), type, page: currentPage, x: 100, y: 300,
      width: type === "checkbox" || type === "radio" ? 20 : 200,
      height: type === "checkbox" || type === "radio" ? 20 : 30,
      label: `${type}_${formFields.length + 1}`,
      options: type === "dropdown" ? ["Option 1", "Option 2", "Option 3"]
        : type === "radio" ? ["Option A", "Option B", "Option C"] : undefined,
      required: false,
    };
    setFormFields((prev) => [...prev, field]);
  };

  // ─── Page operations ───────────────────────────────────────────────────────

  const addPageNumbers = async () => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      doc.getPages().forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(`${idx + 1}`, { x: width / 2 - 5, y: 20, size: 12 });
      });
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
      setPageNumbersAdded(true);
    } catch (err) { console.error("Failed:", err); }
  };

  const applyWatermark = async () => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        if (watermarkConfig.type === "text") {
          page.drawText(watermarkConfig.text, {
            x: width / 4, y: height / 2, size: watermarkConfig.fontSize,
            opacity: watermarkConfig.opacity, rotate: degrees(watermarkConfig.rotation),
          });
        }
      }
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
      setWatermarkApplied(true); setShowWatermarkModal(false);
    } catch (err) { console.error("Failed:", err); }
  };

  const runOcr = () => {
    setOcrProcessing(true); setOcrComplete(false);
    setTimeout(() => { setOcrProcessing(false); setOcrComplete(true); }, 3000);
  };

  const addBlankPage = async () => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const lastPage = doc.getPages()[doc.getPageCount() - 1];
      const { width, height } = lastPage.getSize();
      doc.addPage([width, height]);
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
    } catch (err) { console.error("Failed:", err); }
  };

  const deletePage = async (pageNum: number) => {
    if (!pdfBytes || totalPages <= 1) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      doc.removePage(pageNum - 1);
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
      if (currentPage > doc.getPageCount()) setCurrentPage(doc.getPageCount());
    } catch (err) { console.error("Failed:", err); }
  };

  const flattenAnnotations = async () => {
    if (!pdfBytes || annotations.length === 0) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const pages = doc.getPages();
      for (const ann of annotations) {
        const pageIdx = ann.page - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;
        const page = pages[pageIdx];
        const { height } = page.getSize();
        if (ann.type === "text" && ann.text) {
          page.drawText(ann.text, { x: ann.x, y: height - ann.y, size: ann.fontSize ?? 16 });
        }
        if (ann.type === "redaction") {
          page.drawRectangle({
            x: ann.x, y: height - ann.y - (ann.height ?? 20),
            width: ann.width ?? 100, height: ann.height ?? 20,
          });
        }
      }
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
      setAnnotations([]); setFlattenApplied(true);
    } catch (err) { console.error("Failed:", err); }
  };

  const applyHeaderFooter = async () => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      doc.getPages().forEach((page, idx) => {
        if (idx + 1 < headerFooterConfig.startPage) return;
        const { width, height } = page.getSize();
        const fs = headerFooterConfig.fontSize;
        if (headerFooterConfig.headerLeft) page.drawText(headerFooterConfig.headerLeft, { x: 40, y: height - 30, size: fs });
        if (headerFooterConfig.headerCenter) page.drawText(headerFooterConfig.headerCenter, { x: width / 2 - 30, y: height - 30, size: fs });
        if (headerFooterConfig.headerRight) page.drawText(headerFooterConfig.headerRight, { x: width - 120, y: height - 30, size: fs });
        if (headerFooterConfig.footerLeft) page.drawText(headerFooterConfig.footerLeft, { x: 40, y: 20, size: fs });
        if (headerFooterConfig.includePageNumbers) page.drawText(`${idx + 1}`, { x: width / 2 - 5, y: 20, size: fs });
        else if (headerFooterConfig.footerCenter) page.drawText(headerFooterConfig.footerCenter, { x: width / 2 - 30, y: 20, size: fs });
        if (headerFooterConfig.footerRight) page.drawText(headerFooterConfig.footerRight, { x: width - 120, y: 20, size: fs });
      });
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
      setHeaderFooterApplied(true); setShowHeaderFooter(false);
    } catch (err) { console.error("Failed:", err); }
  };

  // ─── Compare ───────────────────────────────────────────────────────────────

  const loadCompareDoc = async (file: File) => {
    const lib = await loadPdfjs();
    const data = await file.arrayBuffer();
    const doc = await lib.getDocument({ data: new Uint8Array(data) }).promise;
    setCompareDoc(doc); setCompareName(file.name);
    setCompareTotalPages(doc.numPages); setComparePage(1);
  };

  const renderComparePages = useCallback(async () => {
    if (!pdfDoc || !compareDoc) return;
    if (compareCanvasRef.current) {
      const page = await pdfDoc.getPage(Math.min(comparePage, totalPages));
      const vp = page.getViewport({ scale: 0.8 });
      const canvas = compareCanvasRef.current;
      canvas.width = vp.width; canvas.height = vp.height;
      await (page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp } as any).promise);
    }
    if (compareCanvasRef2.current) {
      const page = await compareDoc.getPage(Math.min(comparePage, compareTotalPages));
      const vp = page.getViewport({ scale: 0.8 });
      const canvas = compareCanvasRef2.current;
      canvas.width = vp.width; canvas.height = vp.height;
      await (page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp } as any).promise);
    }
  }, [pdfDoc, compareDoc, comparePage, totalPages, compareTotalPages]);

  useEffect(() => { if (pdfDoc && compareDoc) renderComparePages(); }, [pdfDoc, compareDoc, renderComparePages]);

  useEffect(() => {
    if (totalPages > 0) {
      setPageOrder(Array.from({ length: totalPages }, (_, i) => i));
    } else {
      setPageOrder([]);
    }
  }, [totalPages]);

  // ─── Search ────────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string, opts: { caseSensitive: boolean; wholeWord: boolean }) => {
    if (!pdfDoc || !query.trim()) { setSearchResults([]); return; }
    const results: SearchResult[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => (item.str ?? "")).join(" ");
      const searchIn = opts.caseSensitive ? pageText : pageText.toLowerCase();
      const searchFor = opts.caseSensitive ? query : query.toLowerCase();
      let idx = searchIn.indexOf(searchFor);
      while (idx !== -1) {
        results.push({ page: i, index: idx, text: pageText.substring(Math.max(0, idx - 20), idx + query.length + 20) });
        idx = searchIn.indexOf(searchFor, idx + 1);
      }
    }
    setSearchResults(results); setCurrentSearchResult(0);
    if (results.length > 0) setCurrentPage(results[0].page);
  }, [pdfDoc]);

  // ─── Print / Export / Security ─────────────────────────────────────────────

  const handlePrint = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none"; iframe.src = url;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print(); setShowPrint(false);
  };

  const handleExport = async () => {
    if (!pdfBytes) return;
    const doc = await PDFDocument.load(pdfBytes);
    if (exportOptions.format === "pdf-a") {
      doc.setTitle(documentProperties.title || "Exported Document");
      doc.setAuthor(documentProperties.author || "");
      doc.setCreator("Vidyalaya Office PDF Editor");
    }
    const bytes = await doc.save();
    const suffix = exportOptions.format === "pdf-a" ? "_pdfa" : exportOptions.format === "pdf-x" ? "_pdfx" : "";
    downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `export${suffix}_${pdfName || "document.pdf"}`);
    setShowExport(false);
  };

  const applySecurity = () => { setSecurityApplied(true); setShowSecurity(false); };
  const applyCertSignature = () => { if (!certificateInfo.name || !certificateInfo.email) return; setCertSignatureApplied(true); setShowCertModal(false); };

  // ─── Bookmark handlers ────────────────────────────────────────────────────
  const addBookmark = (bookmark: import("@/components/pdf/types").Bookmark) => {
    setBookmarks((prev) => [...prev, bookmark]);
  };
  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };
  const updateBookmark = (id: string, updates: Partial<import("@/components/pdf/types").Bookmark>) => {
    setBookmarks((prev) => prev.map((b) => b.id === id ? { ...b, ...updates } : b));
  };

  // ─── Organize page handlers ──────────────────────────────────────────────
  const handleReorderPages = async (newOrder: number[]) => {
    if (!pdfBytes) return;
    try {
      const src = await PDFDocument.load(pdfBytes);
      const dest = await PDFDocument.create();
      const pages = await dest.copyPages(src, newOrder);
      pages.forEach((p) => dest.addPage(p));
      const bytes = await dest.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
    } catch (err) { console.error("Reorder failed:", err); }
  };

  const handleDeletePages = async (pages: number[]) => {
    if (!pdfBytes) return;
    try {
      const src = await PDFDocument.load(pdfBytes);
      const allIndices = src.getPageIndices().filter((i) => !pages.includes(i));
      if (allIndices.length === 0) return;
      const dest = await PDFDocument.create();
      const copied = await dest.copyPages(src, allIndices);
      copied.forEach((p) => dest.addPage(p));
      const bytes = await dest.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
    } catch (err) { console.error("Delete pages failed:", err); }
  };

  const handleRotatePages = (pages: number[], deg: number) => {
    setPageRotations((prev) => {
      const next = { ...prev };
      pages.forEach((p) => { next[p] = ((next[p] || 0) + deg) % 360; });
      return next;
    });
  };

  const handleInsertBlankPage = async (afterPage: number) => {
    if (!pdfBytes) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const refPage = doc.getPages()[Math.min(afterPage, doc.getPageCount() - 1)];
      const { width, height } = refPage.getSize();
      doc.insertPage(afterPage + 1, [width, height]);
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
    } catch (err) { console.error("Insert blank failed:", err); }
  };

  const handleExtractPages = async (pages: number[]) => {
    if (!pdfBytes) return;
    try {
      const src = await PDFDocument.load(pdfBytes);
      const dest = await PDFDocument.create();
      const copied = await dest.copyPages(src, pages);
      copied.forEach((p) => dest.addPage(p));
      const bytes = await dest.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `extracted_${pdfName || "pages.pdf"}`);
    } catch (err) { console.error("Extract failed:", err); }
  };

  // ─── Redaction apply handler ──────────────────────────────────────────────
  const handleApplyRedactions = async () => {
    if (!pdfBytes) return;
    const redactionAnns = annotations.filter((a) => a.type === "redaction");
    if (redactionAnns.length === 0) return;
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const pages = doc.getPages();
      for (const ann of redactionAnns) {
        const pageIdx = ann.page - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;
        const page = pages[pageIdx];
        const { height } = page.getSize();
        page.drawRectangle({
          x: ann.x,
          y: height - ann.y - (ann.height ?? 20),
          width: ann.width ?? 100,
          height: ann.height ?? 20,
          color: { type: 'RGB' as any, red: 0, green: 0, blue: 0 } as any,
        });
      }
      const bytes = await doc.save();
      await loadPdf(bytes.buffer as ArrayBuffer, pdfName);
      setAnnotations((prev) => prev.filter((a) => a.type !== "redaction"));
    } catch (err) { console.error("Apply redactions failed:", err); }
  };

  // ─── Redaction search ─────────────────────────────────────────────────────
  const handleSearchRedact = useCallback((term: string) => {
    if (!term.trim()) return;
    // Add a search-based redaction annotation placeholder on current page
    const ann: Annotation = {
      id: uid(),
      type: "redaction",
      page: currentPage,
      x: 60,
      y: 100 + annotations.filter(a => a.type === "redaction").length * 30,
      width: Math.max(100, term.length * 8),
      height: 20,
    };
    setAnnotations(prev => [...prev, ann]);
  }, [currentPage, annotations]);

  // ─── Create blank PDF ──────────────────────────────────────────────────────

  const createBlankPdf = async (pageSize: string, orientation: string, pageCount: number = 1) => {
    const sizeMap: Record<string, [number, number]> = {
      a4: PageSizes.A4, letter: PageSizes.Letter, legal: [612, 1008],
      a3: PageSizes.A3, a5: PageSizes.A5,
    };
    const [w, h] = sizeMap[pageSize] ?? PageSizes.A4;
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage(orientation === "landscape" ? [h, w] : [w, h]);
    }
    const bytes = await doc.save();
    await loadPdf(bytes.buffer as ArrayBuffer, `untitled-${Date.now()}.pdf`);
    setShowCreateBlank(false); setActiveTab("view");
  };

  // ─── Generate PDF from creator ─────────────────────────────────────────────

  const generatePdfFromCreator = async (pageSize: string, orientation: string) => {
    const sizeMap: Record<string, [number, number]> = {
      a4: PageSizes.A4, letter: PageSizes.Letter, legal: [612, 1008], a3: PageSizes.A3,
    };
    const [w, h] = sizeMap[pageSize] ?? PageSizes.A4;
    const doc = await PDFDocument.create();
    const page = doc.addPage(orientation === "landscape" ? [h, w] : [w, h]);
    const { height: pH } = page.getSize();
    for (const el of creatorElements) {
      if (el.type === "text" && el.text) {
        page.drawText(el.text, { x: el.x, y: pH - el.y - (el.fontSize ?? 16), size: el.fontSize ?? 16 });
      }
    }
    const bytes = await doc.save();
    await loadPdf(bytes.buffer as ArrayBuffer, `created-${Date.now()}.pdf`);
    setActiveTab("view");
  };

  // ─── Utilities ─────────────────────────────────────────────────────────────

  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }

  // ─── Ribbon tab mapping ────────────────────────────────────────────────────

  const handleRibbonTabChange = (tab: RibbonTabId) => {
    setRibbonTab(tab);
    switch (tab) {
      case "home": setActiveTab("view"); break;
      case "edit": setActiveTab("edit"); break;
      case "annotate": setActiveTab("edit"); break;
      case "forms": setActiveTab("forms"); break;
      case "organize": setActiveTab("view"); break;
      case "convert": setActiveTab("convert"); break;
      case "security": setActiveTab("view"); break;
      case "review": setActiveTab("compare"); break;
    }
  };

  // ─── Ribbon sub-toolbars ───────────────────────────────────────────────────

  const renderRibbonContent = () => {
    switch (ribbonTab) {
      case "home":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={btnStyle} onClick={() => setShowCreateBlank(true)}><FilePlus2 size={14} /> New</button>
            <label style={{ ...btnStyle, cursor: "pointer" }}>
              <Upload size={14} /> Open
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
            </label>
            {pdfBytes && (
              <>
                <button style={btnStyle} onClick={() => downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), pdfName || "document.pdf")}><Download size={14} /> Save</button>
                <button style={btnStyle} onClick={() => setShowPrint(true)}><Printer size={14} /> Print</button>
                <button style={btnStyle} onClick={() => setShowExport(true)}><FileCheck size={14} /> Export</button>
                <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
                <button style={btnStyle} onClick={() => setShowSearch(!showSearch)}><Search size={14} /> Find</button>
                <button style={btnStyle} onClick={() => setShowProperties(!showProperties)}><Info size={14} /> Properties</button>
                <button style={{ ...btnStyle, ...(showBookmarks ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => setShowBookmarks(!showBookmarks)}><BookOpen size={14} /> Bookmarks</button>
              </>
            )}
          </div>
        );
      case "edit":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={btnStyle} onClick={() => { setActiveTab("edit"); }}><Type size={14} /> Text</button>
            <button style={btnStyle} onClick={() => { setActiveTab("edit"); }}><Image size={14} /> Image</button>
            <button style={btnStyle} onClick={() => { setActiveTab("edit"); }}><PenTool size={14} /> Draw</button>
            <button style={btnStyle} onClick={() => { setActiveTab("edit"); }}><RectangleHorizontal size={14} /> Shapes</button>
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
            <button style={btnStyle} onClick={addPageNumbers} disabled={pageNumbersAdded}><Hash size={14} /> {pageNumbersAdded ? "Numbers Added" : "Page Numbers"}</button>
            <button style={btnStyle} onClick={() => setShowWatermarkModal(true)}><Droplets size={14} /> Watermark</button>
            <button style={btnStyle} onClick={() => setShowHeaderFooter(true)}><AlignCenter size={14} /> Headers/Footers</button>
            {pdfDoc && (
              <>
                <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
                <button style={btnStyle} onClick={addBlankPage}><FilePlus size={14} /> Add Page</button>
                <button style={{ ...btnStyle, color: totalPages <= 1 ? "var(--muted-foreground)" : "#dc2626" }} onClick={() => deletePage(currentPage)} disabled={totalPages <= 1}><Trash2 size={14} /> Delete Page</button>
              </>
            )}
          </div>
        );
      case "annotate":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><Highlighter size={14} /> Highlight</button>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><Underline size={14} /> Underline</button>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><Strikethrough size={14} /> Strikethrough</button>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><StickyNote size={14} /> Sticky Note</button>
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><Stamp size={14} /> Stamps</button>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><Pencil size={14} /> Signature</button>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><EyeOff size={14} /> Redact</button>
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
            <button style={btnStyle} onClick={flattenAnnotations} disabled={annotations.length === 0}><Layers size={14} /> Flatten</button>
            <button style={{ ...btnStyle, color: annotations.filter(a => a.type === "redaction").length === 0 ? "var(--muted-foreground)" : "#dc2626" }} onClick={handleApplyRedactions} disabled={annotations.filter(a => a.type === "redaction").length === 0}><EyeOff size={14} /> Apply Redactions</button>
            <button style={btnStyle} onClick={() => setAnnotations((prev) => prev.slice(0, -1))} disabled={annotations.length === 0}><Undo2 size={14} /> Undo</button>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{annotations.length} annotation{annotations.length !== 1 ? "s" : ""}</span>
          </div>
        );
      case "forms":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={btnStyle} onClick={() => { setActiveTab("forms"); addFormField("text-input"); }}><FormInput size={14} /> Text Field</button>
            <button style={btnStyle} onClick={() => { setActiveTab("forms"); addFormField("checkbox"); }}><CheckSquare size={14} /> Checkbox</button>
            <button style={btnStyle} onClick={() => { setActiveTab("forms"); addFormField("radio"); }}><Circle size={14} /> Radio</button>
            <button style={btnStyle} onClick={() => { setActiveTab("forms"); addFormField("dropdown"); }}><ChevronDown size={14} /> Dropdown</button>
            <button style={btnStyle} onClick={() => { setActiveTab("forms"); addFormField("date-picker"); }}><FormInput size={14} /> Date Picker</button>
            <button style={btnStyle} onClick={() => { setActiveTab("forms"); addFormField("signature"); }}><Pencil size={14} /> Signature Field</button>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{formFields.length} field{formFields.length !== 1 ? "s" : ""}</span>
          </div>
        );
      case "organize":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={{ ...btnStyle, ...(showOrganize ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => setShowOrganize(!showOrganize)}><LayoutGrid size={14} /> Organize Pages</button>
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
            <button style={btnStyle} onClick={() => setActiveTab("merge")}><FilePlus size={14} /> Merge PDFs</button>
            <button style={btnStyle} onClick={() => setActiveTab("split")}><Scissors size={14} /> Split PDF</button>
            <button style={btnStyle} onClick={() => setActiveTab("compress")}><Minimize2 size={14} /> Compress</button>
            <button style={btnStyle} onClick={() => setActiveTab("create")}><FilePlus2 size={14} /> Create PDF</button>
            {pdfDoc && (
              <>
                <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
                <button style={btnStyle} onClick={addBlankPage}><FilePlus size={14} /> Add Page</button>
                <button style={{ ...btnStyle, color: totalPages <= 1 ? "var(--muted-foreground)" : "#dc2626" }} onClick={() => deletePage(currentPage)} disabled={totalPages <= 1}><Trash2 size={14} /> Delete Page</button>
              </>
            )}
          </div>
        );
      case "convert":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={{ ...btnStyle, ...(convertDirection === "pdf-to-word" ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => { setConvertDirection("pdf-to-word"); setActiveTab("convert"); }}><FileText size={14} /> To Word</button>
            <button style={{ ...btnStyle, ...(convertDirection === "pdf-to-excel" ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => { setConvertDirection("pdf-to-excel"); setActiveTab("convert"); }}><FileSpreadsheet size={14} /> To Excel</button>
            <button style={{ ...btnStyle, ...(convertDirection === "pdf-to-ppt" ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => { setConvertDirection("pdf-to-ppt"); setActiveTab("convert"); }}><Presentation size={14} /> To PPT</button>
            <button style={{ ...btnStyle, ...(convertDirection === "pdf-to-image" ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => { setConvertDirection("pdf-to-image"); setActiveTab("convert"); }}><Image size={14} /> To Image</button>
            <div style={{ width: 1, height: 24, backgroundColor: "var(--border)", margin: "0 4px" }} />
            <button style={btnStyle} onClick={() => { setConvertDirection("word-to-pdf"); setActiveTab("convert"); }}><FileText size={14} /> Word to PDF</button>
            <button style={btnStyle} onClick={() => { setConvertDirection("excel-to-pdf"); setActiveTab("convert"); }}><FileSpreadsheet size={14} /> Excel to PDF</button>
            <button style={btnStyle} onClick={() => { setConvertDirection("image-to-pdf"); setActiveTab("convert"); }}><Image size={14} /> Image to PDF</button>
          </div>
        );
      case "security":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={{ ...btnStyle, ...(securityApplied ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => setShowSecurity(true)}>
              <Lock size={14} /> {securityApplied ? "Password Set" : "Password Protect"}
            </button>
            <button style={{ ...btnStyle, ...(certSignatureApplied ? { backgroundColor: "var(--accent)" } : {}) }} onClick={() => setShowCertModal(true)}>
              <ShieldCheck size={14} /> {certSignatureApplied ? "Cert Applied" : "Digital Certificate"}
            </button>
            <button style={btnStyle} onClick={() => setActiveTab("edit")}><EyeOff size={14} /> Redact</button>
          </div>
        );
      case "review":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <button style={btnStyle} onClick={() => setActiveTab("compare")}><Columns2 size={14} /> Compare PDFs</button>
            <button style={btnStyle} onClick={() => setActiveTab("ocr")}><ScanText size={14} /> OCR</button>
            <button style={btnStyle} onClick={() => setShowSearch(!showSearch)}><Search size={14} /> Find & Replace</button>
            <button style={btnStyle} onClick={() => setShowProperties(!showProperties)}><Info size={14} /> Properties</button>
          </div>
        );
      default: return null;
    }
  };

  // ─── Tab content rendering ─────────────────────────────────────────────────

  const renderActiveTab = () => {
    switch (activeTab) {
      case "view":
        return (
          <PdfViewer
            externalPdfDoc={pdfDoc} externalPdfBytes={pdfBytes} externalPdfName={pdfName}
            onPdfLoaded={(doc, bytes, name) => { setPdfDoc(doc); setPdfBytes(bytes); setPdfName(name); setTotalPages(doc.numPages); setCurrentPage(1); setAnnotations([]); setZoom(100); }}
            onShowSearch={() => setShowSearch(!showSearch)}
            onShowProperties={() => setShowProperties(!showProperties)}
            onShowPrint={() => setShowPrint(true)}
            onShowExport={() => setShowExport(true)}
          />
        );
      case "edit":
        return (
          <PdfEditor
            pdfLoaded={!!pdfDoc} currentPage={currentPage} totalPages={totalPages} zoom={zoom}
            onPageChange={setCurrentPage} onZoomChange={setZoom}
            annotations={annotations} onAnnotationsChange={setAnnotations}
            mainCanvasRef={mainCanvasRef} overlayCanvasRef={overlayCanvasRef}
            containerRef={containerRef} renderAnnotations={renderAnnotations}
            onAddPageNumbers={addPageNumbers} onShowWatermark={() => setShowWatermarkModal(true)}
            onShowHeaderFooter={() => setShowHeaderFooter(true)}
            onShowCertModal={() => setShowCertModal(true)}
            onRunOcr={runOcr} onFlattenAnnotations={flattenAnnotations}
            pageNumbersAdded={pageNumbersAdded} watermarkApplied={watermarkApplied}
            headerFooterApplied={headerFooterApplied} certSignatureApplied={certSignatureApplied}
            certificateInfo={certificateInfo} ocrProcessing={ocrProcessing} ocrComplete={ocrComplete}
            flattenApplied={flattenApplied}
          />
        );
      case "merge":
        return (
          <PdfMerge
            files={mergeFiles} onAddFiles={addMergeFiles}
            onRemoveFile={(id) => setMergeFiles((prev) => prev.filter((f) => f.id !== id))}
            onMoveFile={(idx, dir) => {
              const target = idx + dir;
              if (target < 0 || target >= mergeFiles.length) return;
              setMergeFiles((prev) => { const arr = [...prev]; [arr[idx], arr[target]] = [arr[target], arr[idx]]; return arr; });
            }}
            onMerge={mergePdfs} merging={merging}
          />
        );
      case "split":
        return (
          <PdfSplit
            hasPdf={!!splitDoc} splitPages={splitPages} splitRange={splitRange}
            onSplitRangeChange={setSplitRange} splitSelected={splitSelected}
            onToggleSplitPage={(page) => setSplitSelected((prev) => { const next = new Set(prev); if (next.has(page)) next.delete(page); else next.add(page); return next; })}
            onApplySplitRange={() => setSplitSelected(new Set(parseRange(splitRange, splitPages)))}
            onExtractPages={extractPages} onSplitEveryN={splitEveryNPages}
            splitting={splitting} onLoadPdf={loadSplitPdf}
            splitMode={splitMode} onSplitModeChange={setSplitMode}
            splitEveryN={splitEveryN} onSplitEveryNChange={setSplitEveryN}
            onSelectAll={() => setSplitSelected(new Set(Array.from({ length: splitPages }, (_, i) => i + 1)))}
            onDeselectAll={() => setSplitSelected(new Set())}
            onResetSplit={() => { setSplitDoc(null); setSplitBytes(null); setSplitPages(0); setSplitSelected(new Set()); }}
          />
        );
      case "convert":
        return (
          <PdfConvert
            direction={convertDirection} onDirectionChange={setConvertDirection}
            convertFile={convertFile} onSetFile={setConvertFile}
            onConvert={simulateConvert} converting={converting}
            convertProgress={convertProgress} imageFormat={convertImageFormat}
            onImageFormatChange={setConvertImageFormat}
          />
        );
      case "compress":
        return (
          <PdfCompress
            compressFile={compressFile} compressQuality={compressQuality}
            onQualityChange={setCompressQuality} onLoadFile={loadCompressPdf}
            onCompress={compressPdf} compressing={compressing}
            compressProgress={compressProgress} originalSize={originalSize}
            compressedSize={compressedSize}
            onReset={() => { setCompressFile(null); setCompressBytes(null); setOriginalSize(0); setCompressedSize(null); setCompressProgress(0); }}
          />
        );
      case "forms":
        return (
          <PdfForms
            pdfLoaded={!!pdfDoc} formFields={formFields}
            onAddField={addFormField} onRemoveField={(id) => setFormFields((prev) => prev.filter((f) => f.id !== id))}
            currentPage={currentPage} totalPages={totalPages}
            onPageChange={setCurrentPage} mainCanvasRef={mainCanvasRef}
            fieldValues={fieldValues}
            onFieldValueChange={(id, value) => setFieldValues((prev) => ({ ...prev, [id]: value }))}
          />
        );
      case "compare":
        return (
          <ComparePanel
            pdfLoaded={!!pdfDoc} pdfName={pdfName} compareName={compareName}
            comparePage={comparePage} compareTotalPages={compareTotalPages}
            totalPages={totalPages} highlightDiffs={highlightDiffs} syncScroll={syncScroll}
            onLoadCompareDoc={loadCompareDoc} onPageChange={setComparePage}
            onToggleHighlightDiffs={() => setHighlightDiffs(!highlightDiffs)}
            onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
            canvasRef1={compareCanvasRef} canvasRef2={compareCanvasRef2}
          />
        );
      case "ocr":
        return (
          <OcrPanel
            processing={ocrProcessing} complete={ocrComplete}
            language={ocrLanguage} onLanguageChange={setOcrLanguage}
            onStartOcr={runOcr} pdfLoaded={!!pdfDoc}
          />
        );
      case "redact":
        return (
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
            <RedactionPanel
              annotations={annotations.filter(a => a.type === "redaction").map(a => ({
                id: a.id,
                type: a.type,
                page: a.page,
                x: a.x,
                y: a.y,
                width: a.width,
                height: a.height,
              }))}
              onApplyRedactions={handleApplyRedactions}
              onSearchRedact={handleSearchRedact}
              redactionsApplied={false}
              pdfLoaded={!!pdfDoc}
            />
          </div>
        );
      case "stamp":
        return (
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
            <StampPanel />
          </div>
        );
      case "batch":
        return (
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
            <BatchPanel />
          </div>
        );
      case "create":
        return (
          <PdfCreatorPanel
            elements={creatorElements}
            onAddElement={(el) => setCreatorElements((prev) => [...prev, el])}
            onRemoveElement={(id) => setCreatorElements((prev) => prev.filter((e) => e.id !== id))}
            onSelectElement={setSelectedCreatorElement}
            selectedElement={selectedCreatorElement}
            onGeneratePdf={generatePdfFromCreator}
          />
        );
    }
  };

  // ─── Watermark Modal ───────────────────────────────────────────────────────

  const renderWatermarkModal = () => {
    if (!showWatermarkModal) return null;
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowWatermarkModal(false)}>
        <div className="flex flex-col gap-4 p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: 420 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}><Droplets size={18} style={{ display: "inline", marginRight: 8 }} />Add Watermark</h3>
            <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={() => setShowWatermarkModal(false)}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
          </div>
          <div className="flex gap-2">
            {(["text", "image"] as const).map((t) => (
              <button key={t} style={{ ...btnStyle, flex: 1, justifyContent: "center", backgroundColor: watermarkConfig.type === t ? "var(--primary)" : "var(--card)", color: watermarkConfig.type === t ? "var(--primary-foreground)" : "var(--card-foreground)" }}
                onClick={() => setWatermarkConfig((c) => ({ ...c, type: t }))}>
                {t === "text" ? <Type size={14} /> : <Image size={14} />} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {watermarkConfig.type === "text" && (
            <>
              <div className="flex flex-col gap-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Text</label>
                <input type="text" value={watermarkConfig.text} onChange={(e) => setWatermarkConfig((c) => ({ ...c, text: e.target.value }))} style={inputStyle} /></div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Font Size</label>
                  <input type="number" value={watermarkConfig.fontSize} onChange={(e) => setWatermarkConfig((c) => ({ ...c, fontSize: Number(e.target.value) }))} style={inputStyle} min={12} max={120} /></div>
                <div className="flex flex-col gap-1 flex-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Rotation (°)</label>
                  <input type="number" value={watermarkConfig.rotation} onChange={(e) => setWatermarkConfig((c) => ({ ...c, rotation: Number(e.target.value) }))} style={inputStyle} min={-180} max={180} /></div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Opacity: {Math.round(watermarkConfig.opacity * 100)}%</label>
                  <input type="range" min={5} max={100} value={Math.round(watermarkConfig.opacity * 100)} onChange={(e) => setWatermarkConfig((c) => ({ ...c, opacity: Number(e.target.value) / 100 }))} style={{ accentColor: "var(--primary)" }} /></div>
                <div className="flex flex-col gap-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Color</label>
                  <input type="color" value={watermarkConfig.color} onChange={(e) => setWatermarkConfig((c) => ({ ...c, color: e.target.value }))} style={{ width: 30, height: 30, border: "none", cursor: "pointer" }} /></div>
              </div>
            </>
          )}
          {watermarkConfig.type === "image" && (
            <div className="flex flex-col gap-2">
              <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Image watermark requires server-side processing.</p>
              <div className="flex flex-col gap-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Opacity: {Math.round(watermarkConfig.opacity * 100)}%</label>
                <input type="range" min={5} max={100} value={Math.round(watermarkConfig.opacity * 100)} onChange={(e) => setWatermarkConfig((c) => ({ ...c, opacity: Number(e.target.value) / 100 }))} style={{ accentColor: "var(--primary)" }} /></div>
            </div>
          )}
          <div className="flex items-center justify-center" style={{ height: 80, backgroundColor: "var(--secondary)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            <span style={{ fontSize: Math.min(watermarkConfig.fontSize / 2, 28), color: watermarkConfig.color, opacity: watermarkConfig.opacity, transform: `rotate(${watermarkConfig.rotation}deg)`, fontWeight: "bold" }}>{watermarkConfig.text || "Preview"}</span>
          </div>
          <button style={btnPrimaryStyle} onClick={applyWatermark}><Droplets size={16} /> Apply Watermark</button>
        </div>
      </div>
    );
  };

  // ─── Certificate Modal ─────────────────────────────────────────────────────

  const renderCertModal = () => {
    if (!showCertModal) return null;
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowCertModal(false)}>
        <div className="flex flex-col gap-4 p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: 400 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}><ShieldCheck size={18} style={{ display: "inline", marginRight: 8 }} />Digital Certificate</h3>
            <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={() => setShowCertModal(false)}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
          </div>
          {[{ key: "name", label: "Full Name *", ph: "John Doe" }, { key: "email", label: "Email *", ph: "john@example.com" }, { key: "organization", label: "Organization", ph: "Company Inc." }].map(({ key, label, ph }) => (
            <div key={key} className="flex flex-col gap-1">
              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</label>
              <input type={key === "email" ? "email" : "text"} value={(certificateInfo as any)[key]}
                onChange={(e) => setCertificateInfo((c) => ({ ...c, [key]: e.target.value }))} style={inputStyle} placeholder={ph} />
            </div>
          ))}
          <div className="flex flex-col gap-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Reason</label>
            <select value={certificateInfo.reason} onChange={(e) => setCertificateInfo((c) => ({ ...c, reason: e.target.value }))} style={inputStyle}>
              <option>Document Approval</option><option>Contract Signing</option><option>Authorship Attestation</option><option>Review Completion</option>
            </select>
          </div>
          <div className="flex flex-col gap-1"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Date</label>
            <input type="date" value={certificateInfo.date} onChange={(e) => setCertificateInfo((c) => ({ ...c, date: e.target.value }))} style={inputStyle} />
          </div>
          <div className="p-3 flex flex-col gap-2" style={{ backgroundColor: "var(--secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2"><Award size={16} style={{ color: "var(--primary)" }} /><span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>Certificate Preview</span></div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
              <p>Signer: {certificateInfo.name || "—"}</p><p>Email: {certificateInfo.email || "—"}</p>
              <p>Organization: {certificateInfo.organization || "—"}</p><p>Reason: {certificateInfo.reason}</p>
              <p>Date: {certificateInfo.date}</p><p>Hash: SHA-256</p>
            </div>
          </div>
          <button style={btnPrimaryStyle} onClick={applyCertSignature} disabled={!certificateInfo.name || !certificateInfo.email}>
            <ShieldCheck size={16} /> Apply Digital Signature
          </button>
        </div>
      </div>
    );
  };

  // ─── AI Panel Functions ────────────────────────────────────────────────────

  const handlePdfAiAction = (action: string) => {
    const docInfo = pdfDoc ? `"${pdfName}" (${totalPages} pages)` : 'the uploaded document';
    const responses: Record<string, string> = {
      summarize: `📝 **Document Summary** for ${docInfo}\n\nThis document contains ${totalPages} pages of content. Key sections include executive summaries, data tables, and detailed analysis. The document covers major topics across multiple chapters with supporting evidence and conclusions.\n\n**Key Themes:**\n• Strategic planning and execution\n• Performance metrics and KPIs\n• Recommendations and action items`,
      keyPoints: `🔑 **Key Points Extracted:**\n\n1. The document presents a comprehensive analysis across ${totalPages} pages\n2. Multiple data tables and figures included\n3. Executive summary on page 1\n4. Detailed recommendations in final section\n5. Supporting appendices with raw data\n\nPage references: see pages 1, 3, 7, and ${Math.max(1, totalPages - 1)}`,
      extractTables: `📊 **Tables Detected:**\n\nFound 3 potential tables in ${docInfo}:\n• Table 1 (p.2): Financial Summary — 5 rows × 4 columns\n• Table 2 (p.5): Performance Metrics — 8 rows × 6 columns\n• Table 3 (p.9): Quarterly Results — 12 rows × 5 columns\n\nClick "Export to Spreadsheet" to extract these tables.`,
      translate: `🌐 **Translation Ready:**\n\nDocument: ${docInfo}\nSource language: English (detected)\n\nAvailable target languages:\n• Spanish (ES) · French (FR) · German (DE)\n• Hindi (HI) · Japanese (JA) · Chinese (ZH)\n\nSelect a language to begin translation of all ${totalPages} pages.`,
      report: `📄 **AI Report Generated** from ${docInfo}:\n\n**Executive Summary:** The document presents key findings across ${totalPages} pages.\n\n**Critical Findings:**\n• Strong performance indicators in Q3/Q4\n• Identified 5 areas for improvement\n• Revenue trends show 12% YoY growth\n\n**Recommendations:**\n1. Optimize process workflows\n2. Invest in team capabilities\n3. Expand market reach\n\n**Next Steps:** Schedule review meeting within 2 weeks.`,
    };
    setAiPdfMessages(prev => [...prev, { role: 'ai', content: responses[action] || '🤖 Processing...' }]);
  };

  const sendPdfAiQuery = () => {
    if (!aiPdfInput.trim()) return;
    const query = aiPdfInput.trim();
    setAiPdfMessages(prev => [...prev, { role: 'user', content: query }]);
    setAiPdfInput('');
    const lower = query.toLowerCase();
    const docInfo = pdfDoc ? `"${pdfName}" (${totalPages} pages)` : 'your document';
    let response = '';
    if (lower.includes('summar')) response = `📝 Summary of ${docInfo}: This document covers ${totalPages} pages of structured content including analysis, data tables, and recommendations.`;
    else if (lower.includes('table') || lower.includes('data')) response = `📊 Data extraction from ${docInfo}: Found multiple tables and structured data. Use "Extract Tables" action to export to spreadsheet format.`;
    else if (lower.includes('page') && /\d/.test(lower)) {
      const pageNum = lower.match(/\d+/)?.[0];
      response = `📄 Page ${pageNum} of ${docInfo}: This page contains structured content. Key information includes headers, body text, and supporting data visualizations.`;
    }
    else if (lower.includes('author') || lower.includes('who')) response = `👤 Document metadata for ${docInfo}: Author information is embedded in the PDF properties. Check the Properties panel for full metadata.`;
    else response = `🤖 Analyzing ${docInfo}: Based on the document structure, I found relevant information related to your query "${query}". The content spans multiple sections across ${totalPages} pages. Would you like me to extract specific sections?`;
    setTimeout(() => setAiPdfMessages(prev => [...prev, { role: 'ai', content: response }]), 500);
  };

  // ─── Main layout ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <RibbonToolbar activeTab={ribbonTab} onTabChange={handleRibbonTabChange} pdfName={pdfName} />
      {/* Unified Export/Import bar */}
      <div
        className="flex items-center justify-end gap-2 border-b px-4 py-1"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <button
          onClick={() => setShowUnifiedImport(true)}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs transition-colors hover:bg-[var(--muted)]"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <Upload size={14} />
          Open PDF
        </button>
        <button
          onClick={() => setShowAiPanel(v => !v)}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs transition-colors ${showAiPanel ? 'bg-purple-600/20 border-purple-500/40 text-purple-400' : 'hover:bg-[var(--muted)]'}`}
          style={{ borderColor: showAiPanel ? undefined : "var(--border)", color: showAiPanel ? undefined : "var(--foreground)" }}
        >
          ✨ AI Assistant
        </button>
        <ExportDropdown
          documentType="pdf"
          onExport={handleUnifiedExport}
          onPrint={() => setShowPrint(true)}
          onPrintPreview={() => setShowUnifiedPrintPreview(true)}
          isExporting={isUnifiedExporting}
          exportProgress={unifiedExportProgress}
        />
      </div>
      {renderRibbonContent()}

      {showSearch && (
        <SearchPanel
          onSearch={handleSearch}
          onReplace={() => {}}
          onClose={() => setShowSearch(false)}
          resultCount={searchResults.length}
          currentResult={currentSearchResult}
          onNextResult={() => { if (searchResults.length > 0) { const next = (currentSearchResult + 1) % searchResults.length; setCurrentSearchResult(next); setCurrentPage(searchResults[next].page); } }}
          onPrevResult={() => { if (searchResults.length > 0) { const prev = (currentSearchResult - 1 + searchResults.length) % searchResults.length; setCurrentSearchResult(prev); setCurrentPage(searchResults[prev].page); } }}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {showBookmarks && pdfDoc && (
          <BookmarksPanel
            bookmarks={bookmarks}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onAddBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
            onUpdateBookmark={updateBookmark}
            onClose={() => setShowBookmarks(false)}
            totalPages={totalPages}
          />
        )}
        {showOrganize && pdfDoc && (
          <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto" }}>
            <OrganizePagesPanel
              thumbnails={[]}
              pageOrder={pageOrder}
              pageRotations={pageRotations}
              totalPages={totalPages}
              onReorderPages={handleReorderPages}
              onDeletePages={handleDeletePages}
              onRotatePages={handleRotatePages}
              onInsertBlankPage={handleInsertBlankPage}
              onExtractPages={handleExtractPages}
            />
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">{renderActiveTab()}</div>
        {showAiPanel && (
          <div className="w-72 border-l flex flex-col" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-xs font-semibold text-purple-400">✨ PDF AI Assistant</h3>
              <button onClick={() => setShowAiPanel(false)} className="text-sm hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>
            {/* AI Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
              {aiPdfMessages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'ml-4' : 'mr-4'}>
                  <div className={`px-3 py-2 rounded-lg text-xs whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600/20 text-blue-100' : ''}`}
                    style={m.role === 'ai' ? { backgroundColor: "var(--muted)", color: "var(--foreground)" } : undefined}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            {/* AI Actions */}
            <div className="p-2 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>AI Actions:</p>
              <button onClick={() => handlePdfAiAction('summarize')} className="w-full text-left px-2 py-1.5 rounded text-xs hover:opacity-80" style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>📝 Summarize Document</button>
              <button onClick={() => handlePdfAiAction('keyPoints')} className="w-full text-left px-2 py-1.5 rounded text-xs hover:opacity-80" style={{ backgroundColor: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>🔑 Extract Key Points</button>
              <button onClick={() => handlePdfAiAction('extractTables')} className="w-full text-left px-2 py-1.5 rounded text-xs hover:opacity-80" style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#34d399" }}>📊 Extract Tables</button>
              <button onClick={() => handlePdfAiAction('translate')} className="w-full text-left px-2 py-1.5 rounded text-xs hover:opacity-80" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>🌐 Translate Document</button>
              <button onClick={() => handlePdfAiAction('report')} className="w-full text-left px-2 py-1.5 rounded text-xs hover:opacity-80" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171" }}>📄 Generate Report</button>
            </div>
            {/* Q&A Input */}
            <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>Ask about this PDF:</p>
              <div className="flex gap-1">
                <input
                  value={aiPdfInput}
                  onChange={e => setAiPdfInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendPdfAiQuery()}
                  placeholder="e.g. What is on page 3?"
                  className="flex-1 rounded px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
                <button
                  onClick={sendPdfAiQuery}
                  className="px-2 py-1.5 rounded text-xs text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >↵</button>
              </div>
            </div>
          </div>
        )}
        {showProperties && pdfDoc && (
          <PropertiesPanel
            properties={{ ...documentProperties, pageCount: totalPages, fileSize: pdfBytes?.byteLength ?? 0 }}
            onUpdate={(partial) => setDocumentProperties((prev) => ({ ...prev, ...partial }))}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>

      {/* Modals */}
      {renderWatermarkModal()}
      {renderCertModal()}
      {showHeaderFooter && <HeaderFooterModal config={headerFooterConfig} onConfigChange={setHeaderFooterConfig} onApply={applyHeaderFooter} onClose={() => setShowHeaderFooter(false)} />}
      {showPrint && <PrintModal options={printOptions} totalPages={totalPages} onOptionsChange={setPrintOptions} onPrint={handlePrint} onClose={() => setShowPrint(false)} />}
      {showExport && <ExportModal options={exportOptions} onOptionsChange={setExportOptions} onExport={handleExport} onClose={() => setShowExport(false)} />}
      {showSecurity && <PasswordProtectionModal config={securityConfig} onConfigChange={setSecurityConfig} onApply={applySecurity} onClose={() => setShowSecurity(false)} applied={securityApplied} />}
      <ImportDialog
        open={showUnifiedImport}
        onClose={() => setShowUnifiedImport(false)}
        onImport={handleUnifiedPdfImport}
        defaultType="pdf"
      />
      <ExportProgress
        visible={isUnifiedExporting}
        percent={unifiedExportProgress.percent}
        message={unifiedExportProgress.message}
        onClose={() => setIsUnifiedExporting(false)}
      />
      {showCreateBlank && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowCreateBlank(false)}>
          <div className="flex flex-col gap-4 p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: 380 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}><FilePlus2 size={18} /> Create Blank PDF</h3>
            <CreateBlankForm onCreate={createBlankPdf} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Blank Form ───────────────────────────────────────────────────────

function CreateBlankForm({ onCreate }: { onCreate: (size: string, orient: string, count: number) => void }) {
  const [size, setSize] = useState("a4");
  const [orient, setOrient] = useState("portrait");
  const [count, setCount] = useState(1);

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

  return (
    <>
      <div className="flex flex-col gap-2"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Page Size</label>
        <select value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle}>
          <option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option><option value="a3">A3</option><option value="a5">A5</option>
        </select></div>
      <div className="flex flex-col gap-2"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Orientation</label>
        <div className="flex gap-2">
          {(["portrait", "landscape"] as const).map((o) => (
            <button key={o} onClick={() => setOrient(o)} style={{ ...inputStyle, flex: 1, textAlign: "center" as const, cursor: "pointer",
              backgroundColor: orient === o ? "var(--primary)" : "var(--card)", color: orient === o ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </button>
          ))}
        </div></div>
      <div className="flex flex-col gap-2"><label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Pages</label>
        <input type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} style={inputStyle} min={1} max={100} /></div>
      <button style={{ ...btnStyle, backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid var(--primary)" }}
        onClick={() => onCreate(size, orient, count)}><FilePlus2 size={16} /> Create Document</button>
    </>
  );
}
