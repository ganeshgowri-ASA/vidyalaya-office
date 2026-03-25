"use client";

import { create } from "zustand";

// ─── Types ──────────────────────────────────────────────────────────────────

export type FileFormat =
  | "pdf" | "docx" | "xlsx" | "pptx" | "png" | "jpg"
  | "html" | "txt" | "csv" | "svg" | "gif" | "bmp"
  | "webp" | "rtf" | "odt" | "ods" | "odp" | "epub";

export type ConversionStatus = "queued" | "uploading" | "processing" | "converting" | "done" | "error";

export type PdfOperation =
  | "merge" | "split" | "compress" | "rotate"
  | "watermark" | "encrypt" | "decrypt";

export interface ConversionCard {
  id: string;
  label: string;
  from: FileFormat;
  to: FileFormat;
  icon: string;
  category: string;
}

export interface ConversionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  format: FileFormat;
  status: ConversionStatus;
  progress: number;
  targetFormat: FileFormat | null;
  result?: { name: string; size: number; url: string };
  error?: string;
  addedAt: number;
  rawFile?: File;
}

export interface RecentConversion {
  id: string;
  fileName: string;
  fromFormat: FileFormat;
  toFormat: FileFormat;
  fileSize: number;
  resultSize: number;
  date: string;
  status: "completed" | "failed";
  downloadUrl: string;
}

export interface PdfOperationState {
  operation: PdfOperation | null;
  files: ConversionFile[];
  options: Record<string, unknown>;
  status: ConversionStatus | null;
  progress: number;
}

// ─── Conversion definitions ─────────────────────────────────────────────────

export const conversionCards: ConversionCard[] = [
  // PDF conversions
  { id: "pdf-docx", label: "PDF to Word", from: "pdf", to: "docx", icon: "FileText", category: "PDF" },
  { id: "pdf-xlsx", label: "PDF to Excel", from: "pdf", to: "xlsx", icon: "Table2", category: "PDF" },
  { id: "pdf-pptx", label: "PDF to PPT", from: "pdf", to: "pptx", icon: "Presentation", category: "PDF" },
  { id: "pdf-png", label: "PDF to PNG", from: "pdf", to: "png", icon: "Image", category: "PDF" },
  { id: "pdf-jpg", label: "PDF to JPG", from: "pdf", to: "jpg", icon: "Image", category: "PDF" },
  { id: "pdf-html", label: "PDF to HTML", from: "pdf", to: "html", icon: "Globe", category: "PDF" },
  { id: "pdf-txt", label: "PDF to TXT", from: "pdf", to: "txt", icon: "FileText", category: "PDF" },
  // Word conversions
  { id: "docx-pdf", label: "Word to PDF", from: "docx", to: "pdf", icon: "FileDown", category: "Word" },
  { id: "docx-html", label: "Word to HTML", from: "docx", to: "html", icon: "Globe", category: "Word" },
  { id: "docx-txt", label: "Word to TXT", from: "docx", to: "txt", icon: "FileText", category: "Word" },
  // Excel conversions
  { id: "xlsx-pdf", label: "Excel to PDF", from: "xlsx", to: "pdf", icon: "FileDown", category: "Excel" },
  { id: "xlsx-csv", label: "Excel to CSV", from: "xlsx", to: "csv", icon: "FileText", category: "Excel" },
  { id: "xlsx-html", label: "Excel to HTML", from: "xlsx", to: "html", icon: "Globe", category: "Excel" },
  // PPT conversions
  { id: "pptx-pdf", label: "PPT to PDF", from: "pptx", to: "pdf", icon: "FileDown", category: "PPT" },
  { id: "pptx-png", label: "PPT to Image", from: "pptx", to: "png", icon: "Image", category: "PPT" },
  // Image conversions (OCR)
  { id: "png-pdf", label: "Image to PDF", from: "png", to: "pdf", icon: "FileDown", category: "Image" },
  { id: "png-docx", label: "Image to Word (OCR)", from: "png", to: "docx", icon: "ScanText", category: "Image" },
  { id: "png-xlsx", label: "Image to Excel (OCR)", from: "png", to: "xlsx", icon: "ScanText", category: "Image" },
  // CSV conversions
  { id: "csv-xlsx", label: "CSV to Excel", from: "csv", to: "xlsx", icon: "Table2", category: "CSV" },
  { id: "csv-pdf", label: "CSV to PDF", from: "csv", to: "pdf", icon: "FileDown", category: "CSV" },
  // HTML conversions
  { id: "html-pdf", label: "HTML to PDF", from: "html", to: "pdf", icon: "FileDown", category: "HTML" },
  { id: "html-docx", label: "HTML to Word", from: "html", to: "docx", icon: "FileText", category: "HTML" },
];

export const pdfOperations: { id: PdfOperation; label: string; description: string; icon: string }[] = [
  { id: "merge", label: "Merge PDFs", description: "Combine multiple PDFs into one", icon: "FilePlus" },
  { id: "split", label: "Split PDF", description: "Split a PDF into separate pages", icon: "Scissors" },
  { id: "compress", label: "Compress PDF", description: "Reduce PDF file size", icon: "Minimize2" },
  { id: "rotate", label: "Rotate Pages", description: "Rotate pages in a PDF", icon: "RotateCw" },
  { id: "watermark", label: "Add Watermark", description: "Add text or image watermark", icon: "Droplets" },
  { id: "encrypt", label: "Encrypt PDF", description: "Password-protect a PDF", icon: "Lock" },
  { id: "decrypt", label: "Decrypt PDF", description: "Remove password from a PDF", icon: "Unlock" },
];

// ─── Mock recent conversions ────────────────────────────────────────────────

const mockRecentConversions: RecentConversion[] = [
  { id: "r1", fileName: "Q4_Report.pdf", fromFormat: "pdf", toFormat: "docx", fileSize: 2457600, resultSize: 1843200, date: "2026-03-25T10:30:00Z", status: "completed", downloadUrl: "#" },
  { id: "r2", fileName: "Invoice_March.xlsx", fromFormat: "xlsx", toFormat: "pdf", fileSize: 524288, resultSize: 307200, date: "2026-03-25T09:15:00Z", status: "completed", downloadUrl: "#" },
  { id: "r3", fileName: "Presentation_Final.pptx", fromFormat: "pptx", toFormat: "pdf", fileSize: 8388608, resultSize: 5242880, date: "2026-03-24T16:45:00Z", status: "completed", downloadUrl: "#" },
  { id: "r4", fileName: "Screenshot_Design.png", fromFormat: "png", toFormat: "pdf", fileSize: 1048576, resultSize: 819200, date: "2026-03-24T14:20:00Z", status: "completed", downloadUrl: "#" },
  { id: "r5", fileName: "Contacts_Export.csv", fromFormat: "csv", toFormat: "xlsx", fileSize: 102400, resultSize: 204800, date: "2026-03-24T11:00:00Z", status: "completed", downloadUrl: "#" },
  { id: "r6", fileName: "Brochure_Draft.pdf", fromFormat: "pdf", toFormat: "png", fileSize: 3145728, resultSize: 4194304, date: "2026-03-23T17:30:00Z", status: "completed", downloadUrl: "#" },
  { id: "r7", fileName: "Contract_Signed.pdf", fromFormat: "pdf", toFormat: "docx", fileSize: 1572864, resultSize: 1048576, date: "2026-03-23T15:10:00Z", status: "failed", downloadUrl: "#" },
  { id: "r8", fileName: "BlogPost.html", fromFormat: "html", toFormat: "pdf", fileSize: 81920, resultSize: 204800, date: "2026-03-23T12:00:00Z", status: "completed", downloadUrl: "#" },
  { id: "r9", fileName: "OrgChart_Template.docx", fromFormat: "docx", toFormat: "pdf", fileSize: 409600, resultSize: 307200, date: "2026-03-22T09:45:00Z", status: "completed", downloadUrl: "#" },
  { id: "r10", fileName: "Financial_Data.xlsx", fromFormat: "xlsx", toFormat: "csv", fileSize: 716800, resultSize: 204800, date: "2026-03-22T08:30:00Z", status: "completed", downloadUrl: "#" },
];

// ─── OCR Types ──────────────────────────────────────────────────────────────

export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
}

export interface OcrState {
  file: File | null;
  imageUrl: string | null;
  processing: boolean;
  progress: number;
  result: OcrResult | null;
  error: string | null;
  language: string;
}

// ─── Store ──────────────────────────────────────────────────────────────────

interface ConverterStore {
  // View state
  activeTab: "convert" | "pdf-tools" | "batch" | "recent" | "ocr";
  setActiveTab: (tab: "convert" | "pdf-tools" | "batch" | "recent" | "ocr") => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Conversion
  selectedConversion: ConversionCard | null;
  setSelectedConversion: (c: ConversionCard | null) => void;
  files: ConversionFile[];
  addFiles: (files: ConversionFile[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFileStatus: (id: string, status: ConversionStatus, progress: number) => void;
  updateFileResult: (id: string, result: ConversionFile["result"]) => void;
  startConversion: () => void;

  // Batch
  batchFiles: ConversionFile[];
  batchTargetFormat: FileFormat | null;
  setBatchTargetFormat: (f: FileFormat | null) => void;
  addBatchFiles: (files: ConversionFile[]) => void;
  removeBatchFile: (id: string) => void;
  clearBatchFiles: () => void;
  startBatchConversion: () => void;

  // PDF Operations
  pdfOperation: PdfOperationState;
  setPdfOperation: (op: PdfOperation | null) => void;
  addPdfFiles: (files: ConversionFile[]) => void;
  removePdfFile: (id: string) => void;
  clearPdfFiles: () => void;
  setPdfOptions: (opts: Record<string, unknown>) => void;
  startPdfOperation: () => void;

  // Recent
  recentConversions: RecentConversion[];
  clearRecentConversions: () => void;

  // OCR
  ocr: OcrState;
  setOcrFile: (file: File | null) => void;
  setOcrLanguage: (lang: string) => void;
  setOcrProcessing: (processing: boolean, progress?: number) => void;
  setOcrResult: (result: OcrResult | null) => void;
  setOcrError: (error: string | null) => void;
  resetOcr: () => void;
}

let idCounter = 0;
const genId = () => `conv_${Date.now()}_${++idCounter}`;

export const useConverterStore = create<ConverterStore>((set, get) => ({
  activeTab: "convert",
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedCategory: "All",
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  selectedConversion: null,
  setSelectedConversion: (c) => set({ selectedConversion: c, files: [] }),
  files: [],
  addFiles: (newFiles) => set((s) => ({ files: [...s.files, ...newFiles] })),
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  clearFiles: () => set({ files: [] }),
  updateFileStatus: (id, status, progress) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, status, progress } : f)),
    })),
  updateFileResult: (id, result) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, result, status: "done" as const, progress: 100 } : f)),
    })),
  startConversion: () => {
    // Conversion is now handled by the component using real conversion functions
    // This is kept for interface compatibility
  },

  batchFiles: [],
  batchTargetFormat: null,
  setBatchTargetFormat: (f) => set({ batchTargetFormat: f }),
  addBatchFiles: (newFiles) => set((s) => ({ batchFiles: [...s.batchFiles, ...newFiles] })),
  removeBatchFile: (id) => set((s) => ({ batchFiles: s.batchFiles.filter((f) => f.id !== id) })),
  clearBatchFiles: () => set({ batchFiles: [] }),
  startBatchConversion: () => {
    // Batch conversion is now handled by the component using real conversion functions
    // This is kept for interface compatibility
  },

  pdfOperation: { operation: null, files: [], options: {}, status: null, progress: 0 },
  setPdfOperation: (op) =>
    set({ pdfOperation: { operation: op, files: [], options: {}, status: null, progress: 0 } }),
  addPdfFiles: (newFiles) =>
    set((s) => ({
      pdfOperation: { ...s.pdfOperation, files: [...s.pdfOperation.files, ...newFiles] },
    })),
  removePdfFile: (id) =>
    set((s) => ({
      pdfOperation: {
        ...s.pdfOperation,
        files: s.pdfOperation.files.filter((f) => f.id !== id),
      },
    })),
  clearPdfFiles: () =>
    set((s) => ({ pdfOperation: { ...s.pdfOperation, files: [], status: null, progress: 0 } })),
  setPdfOptions: (opts) =>
    set((s) => ({ pdfOperation: { ...s.pdfOperation, options: { ...s.pdfOperation.options, ...opts } } })),
  startPdfOperation: () => {
    // PDF operations are now handled by the component using real pdf-lib functions
    // This is kept for interface compatibility
  },

  recentConversions: mockRecentConversions,
  clearRecentConversions: () => set({ recentConversions: [] }),

  // OCR
  ocr: { file: null, imageUrl: null, processing: false, progress: 0, result: null, error: null, language: "eng" },
  setOcrFile: (file) => {
    const prev = get().ocr;
    if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl);
    set({
      ocr: {
        ...prev,
        file,
        imageUrl: file ? URL.createObjectURL(file) : null,
        result: null,
        error: null,
        processing: false,
        progress: 0,
      },
    });
  },
  setOcrLanguage: (lang) => set((s) => ({ ocr: { ...s.ocr, language: lang } })),
  setOcrProcessing: (processing, progress) =>
    set((s) => ({ ocr: { ...s.ocr, processing, progress: progress ?? s.ocr.progress } })),
  setOcrResult: (result) => set((s) => ({ ocr: { ...s.ocr, result, processing: false, progress: 100 } })),
  setOcrError: (error) => set((s) => ({ ocr: { ...s.ocr, error, processing: false } })),
  resetOcr: () => {
    const prev = get().ocr;
    if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl);
    set({
      ocr: { file: null, imageUrl: null, processing: false, progress: 0, result: null, error: null, language: "eng" },
    });
  },
}));
