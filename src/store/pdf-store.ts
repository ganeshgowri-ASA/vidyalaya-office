import { create } from "zustand";

import type {
  RibbonTabId,
  Annotation,
  FormField,
  Bookmark,
  WatermarkConfig,
  CertificateInfo,
  MergeFile,
  HeaderFooterConfig,
  SearchResult,
  DocumentProperties,
  PrintOptions,
  ExportOptions,
  SecurityConfig,
  ConvertDirection,
  CompressQuality,
  SignatureMode,
  MeasurementAnnotation,
  CreatorElement,
  SavedSignature,
} from "@/components/pdf/types";

// ─── Local types ─────────────────────────────────────────────────────────────

type TabId = "view" | "edit" | "merge" | "split" | "convert" | "compress" | "forms" | "compare" | "create";
type EditMode =
  | "none" | "text" | "highlight" | "underline" | "strikethrough"
  | "draw" | "stamp" | "signature" | "redaction" | "sticky-note"
  | "shape" | "image" | "measure";

// ─── Store interface ─────────────────────────────────────────────────────────

interface PdfStore {
  // Tab state
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  ribbonTab: RibbonTabId;
  setRibbonTab: (tab: RibbonTabId) => void;

  // Viewer state
  pdfName: string;
  setPdfName: (name: string) => void;
  totalPages: number;
  setTotalPages: (n: number) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  zoom: number;
  setZoom: (z: number) => void;
  fitMode: "none" | "width" | "page";
  setFitMode: (m: "none" | "width" | "page") => void;
  thumbnails: string[];
  setThumbnails: (t: string[]) => void;
  showThumbnails: boolean;
  setShowThumbnails: (s: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  multiPageView: boolean;
  setMultiPageView: (m: boolean) => void;
  continuousScroll: boolean;
  setContinuousScroll: (c: boolean) => void;

  // Edit state
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  annotations: Annotation[];
  setAnnotations: (a: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void;
  addAnnotation: (a: Annotation) => void;
  removeAnnotation: (id: string) => void;
  undoAnnotation: () => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  drawColor: string;
  setDrawColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  selectedStamp: string;
  setSelectedStamp: (s: string) => void;
  activeShape: "rectangle" | "circle" | "line" | "arrow" | "polygon" | "star";
  setActiveShape: (s: "rectangle" | "circle" | "line" | "arrow" | "polygon" | "star") => void;
  stickyNoteColor: string;
  setStickyNoteColor: (c: string) => void;
  fillColor: string;
  setFillColor: (c: string) => void;
  fillOpacity: number;
  setFillOpacity: (o: number) => void;

  // Image annotation
  imageToAdd: string | null;
  setImageToAdd: (img: string | null) => void;

  // Measurement
  measureUnit: "px" | "in" | "cm" | "mm";
  setMeasureUnit: (u: "px" | "in" | "cm" | "mm") => void;
  measurements: MeasurementAnnotation[];
  addMeasurement: (m: MeasurementAnnotation) => void;
  clearMeasurements: () => void;

  // Signature state
  signatureMode: SignatureMode;
  setSignatureMode: (m: SignatureMode) => void;
  typedSignatureText: string;
  setTypedSignatureText: (t: string) => void;
  typedSignatureFont: string;
  setTypedSignatureFont: (f: string) => void;
  uploadedSignatureDataUrl: string | null;
  setUploadedSignatureDataUrl: (url: string | null) => void;

  // Saved signatures
  savedSignatures: SavedSignature[];
  addSavedSignature: (sig: SavedSignature) => void;
  removeSavedSignature: (id: string) => void;
  setSavedSignatures: (sigs: SavedSignature[]) => void;

  // Merge state
  mergeFiles: MergeFile[];
  setMergeFiles: (f: MergeFile[] | ((prev: MergeFile[]) => MergeFile[])) => void;
  merging: boolean;
  setMerging: (m: boolean) => void;

  // Split state
  splitPages: number;
  setSplitPages: (n: number) => void;
  splitRange: string;
  setSplitRange: (r: string) => void;
  splitSelected: Set<number>;
  setSplitSelected: (s: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  splitting: boolean;
  setSplitting: (s: boolean) => void;
  splitMode: "range" | "every-n" | "extract";
  setSplitMode: (m: "range" | "every-n" | "extract") => void;
  splitEveryN: number;
  setSplitEveryN: (n: number) => void;

  // Convert state
  convertDirection: ConvertDirection;
  setConvertDirection: (d: ConvertDirection) => void;
  convertFile: File | null;
  setConvertFile: (f: File | null) => void;
  convertProgress: number;
  setConvertProgress: (p: number) => void;
  converting: boolean;
  setConverting: (c: boolean) => void;
  convertImageFormat: "png" | "jpg";
  setConvertImageFormat: (f: "png" | "jpg") => void;

  // Compress state
  compressFile: File | null;
  setCompressFile: (f: File | null) => void;
  compressQuality: CompressQuality;
  setCompressQuality: (q: CompressQuality) => void;
  compressing: boolean;
  setCompressing: (c: boolean) => void;
  compressProgress: number;
  setCompressProgress: (p: number) => void;
  originalSize: number;
  setOriginalSize: (s: number) => void;
  compressedSize: number | null;
  setCompressedSize: (s: number | null) => void;

  // Page management state
  pageRotations: Record<number, number>;
  setPageRotations: (r: Record<number, number> | ((prev: Record<number, number>) => Record<number, number>)) => void;
  pageOrder: number[];
  setPageOrder: (o: number[] | ((prev: number[]) => number[])) => void;
  pageNumbersAdded: boolean;
  setPageNumbersAdded: (a: boolean) => void;

  // Watermark state
  showWatermarkModal: boolean;
  setShowWatermarkModal: (s: boolean) => void;
  watermarkConfig: WatermarkConfig;
  setWatermarkConfig: (c: WatermarkConfig | ((prev: WatermarkConfig) => WatermarkConfig)) => void;
  watermarkApplied: boolean;
  setWatermarkApplied: (a: boolean) => void;
  watermarkPosition: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile";
  setWatermarkPosition: (p: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile") => void;

  // OCR state
  ocrProcessing: boolean;
  setOcrProcessing: (p: boolean) => void;
  ocrComplete: boolean;
  setOcrComplete: (c: boolean) => void;
  ocrLanguage: string;
  setOcrLanguage: (l: string) => void;

  // Form state
  formFields: FormField[];
  setFormFields: (f: FormField[] | ((prev: FormField[]) => FormField[])) => void;
  activeFormFieldType: FormField["type"] | null;
  setActiveFormFieldType: (t: FormField["type"] | null) => void;
  showFormBuilder: boolean;
  setShowFormBuilder: (s: boolean) => void;
  formFieldValues: Record<string, string>;
  setFormFieldValue: (id: string, value: string) => void;

  // Certificate / digital signature
  showCertModal: boolean;
  setShowCertModal: (s: boolean) => void;
  certificateInfo: CertificateInfo;
  setCertificateInfo: (c: CertificateInfo | ((prev: CertificateInfo) => CertificateInfo)) => void;
  certSignatureApplied: boolean;
  setCertSignatureApplied: (a: boolean) => void;

  // Bookmarks
  showBookmarks: boolean;
  setShowBookmarks: (s: boolean) => void;
  bookmarks: Bookmark[];
  setBookmarks: (b: Bookmark[] | ((prev: Bookmark[]) => Bookmark[])) => void;

  // Compare
  showCompare: boolean;
  setShowCompare: (s: boolean) => void;
  compareName: string;
  setCompareName: (n: string) => void;
  comparePage: number;
  setComparePage: (p: number) => void;
  compareTotalPages: number;
  setCompareTotalPages: (n: number) => void;
  compareHighlightDiffs: boolean;
  setCompareHighlightDiffs: (h: boolean) => void;
  compareSyncScroll: boolean;
  setCompareSyncScroll: (s: boolean) => void;

  // Search
  showSearch: boolean;
  setShowSearch: (s: boolean) => void;
  searchResults: SearchResult[];
  setSearchResults: (r: SearchResult[]) => void;
  currentSearchResult: number;
  setCurrentSearchResult: (i: number) => void;

  // Properties
  showProperties: boolean;
  setShowProperties: (s: boolean) => void;
  documentProperties: DocumentProperties;
  setDocumentProperties: (p: DocumentProperties) => void;

  // Header/Footer
  showHeaderFooter: boolean;
  setShowHeaderFooter: (s: boolean) => void;
  headerFooterConfig: HeaderFooterConfig;
  setHeaderFooterConfig: (c: HeaderFooterConfig | ((prev: HeaderFooterConfig) => HeaderFooterConfig)) => void;
  headerFooterApplied: boolean;
  setHeaderFooterApplied: (a: boolean) => void;

  // Print
  showPrint: boolean;
  setShowPrint: (s: boolean) => void;
  printOptions: PrintOptions;
  setPrintOptions: (o: PrintOptions) => void;

  // Export
  showExport: boolean;
  setShowExport: (s: boolean) => void;
  exportOptions: ExportOptions;
  setExportOptions: (o: ExportOptions) => void;

  // Security
  showSecurity: boolean;
  setShowSecurity: (s: boolean) => void;
  securityConfig: SecurityConfig;
  setSecurityConfig: (c: SecurityConfig | ((prev: SecurityConfig) => SecurityConfig)) => void;
  securityApplied: boolean;
  setSecurityApplied: (a: boolean) => void;

  // Create blank
  showCreateBlank: boolean;
  setShowCreateBlank: (s: boolean) => void;

  // Flatten
  flattenApplied: boolean;
  setFlattenApplied: (a: boolean) => void;

  // Redaction
  redactionsApplied: boolean;
  setRedactionsApplied: (a: boolean) => void;

  // PDF Creation (from scratch)
  creatorElements: CreatorElement[];
  setCreatorElements: (e: CreatorElement[] | ((prev: CreatorElement[]) => CreatorElement[])) => void;
  addCreatorElement: (e: CreatorElement) => void;
  removeCreatorElement: (id: string) => void;
  selectedCreatorElement: string | null;
  setSelectedCreatorElement: (id: string | null) => void;

  // Reset
  resetViewerState: () => void;
}

// ─── Default values ──────────────────────────────────────────────────────────

const defaultWatermarkConfig: WatermarkConfig = {
  type: "text",
  text: "WATERMARK",
  fontSize: 48,
  opacity: 0.3,
  rotation: -45,
  color: "#888888",
};

const defaultHeaderFooterConfig: HeaderFooterConfig = {
  headerLeft: "",
  headerCenter: "",
  headerRight: "",
  footerLeft: "",
  footerCenter: "Page {page}",
  footerRight: "",
  fontSize: 10,
  startPage: 1,
  includePageNumbers: true,
  pageNumberFormat: "1",
};

const defaultPrintOptions: PrintOptions = {
  pages: "all",
  range: "",
  copies: 1,
  orientation: "portrait",
  scale: "fit",
  includeAnnotations: true,
};

const defaultExportOptions: ExportOptions = {
  format: "standard",
  quality: "printer",
  includeBookmarks: true,
  includeAnnotations: true,
  flatten: false,
};

const defaultSecurityConfig: SecurityConfig = {
  hasPassword: false,
  openPassword: "",
  permissionPassword: "",
  allowPrinting: true,
  allowCopying: true,
  allowEditing: true,
  allowAnnotations: true,
  encryptionLevel: "256-aes",
};

const defaultCertificateInfo: CertificateInfo = {
  name: "",
  email: "",
  organization: "",
  reason: "",
  date: "",
};

const defaultDocumentProperties: DocumentProperties = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
  creationDate: "",
  modDate: "",
  pageCount: 0,
  fileSize: 0,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePdfStore = create<PdfStore>((set) => ({
  // Tab state
  activeTab: "view",
  setActiveTab: (tab) => set({ activeTab: tab }),
  ribbonTab: "home",
  setRibbonTab: (tab) => set({ ribbonTab: tab }),

  // Viewer state
  pdfName: "",
  setPdfName: (name) => set({ pdfName: name }),
  totalPages: 0,
  setTotalPages: (n) => set({ totalPages: n }),
  currentPage: 1,
  setCurrentPage: (p) => set({ currentPage: p }),
  zoom: 100,
  setZoom: (z) => set({ zoom: z }),
  fitMode: "none",
  setFitMode: (m) => set({ fitMode: m }),
  thumbnails: [],
  setThumbnails: (t) => set({ thumbnails: t }),
  showThumbnails: true,
  setShowThumbnails: (s) => set({ showThumbnails: s }),
  isFullscreen: false,
  setIsFullscreen: (f) => set({ isFullscreen: f }),
  multiPageView: false,
  setMultiPageView: (m) => set({ multiPageView: m }),
  continuousScroll: false,
  setContinuousScroll: (c) => set({ continuousScroll: c }),

  // Edit state
  editMode: "none",
  setEditMode: (m) => set({ editMode: m }),
  annotations: [],
  setAnnotations: (a) => {
    if (typeof a === "function") {
      set((state) => ({ annotations: a(state.annotations) }));
    } else {
      set({ annotations: a });
    }
  },
  addAnnotation: (a) => set((state) => ({ annotations: [...state.annotations, a] })),
  removeAnnotation: (id) => set((state) => ({ annotations: state.annotations.filter((ann) => ann.id !== id) })),
  undoAnnotation: () => set((state) => ({ annotations: state.annotations.slice(0, -1) })),
  fontSize: 16,
  setFontSize: (s) => set({ fontSize: s }),
  fontFamily: "sans-serif",
  setFontFamily: (f) => set({ fontFamily: f }),
  drawColor: "#ff0000",
  setDrawColor: (c) => set({ drawColor: c }),
  strokeWidth: 2,
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  selectedStamp: "Approved",
  setSelectedStamp: (s) => set({ selectedStamp: s }),
  activeShape: "rectangle",
  setActiveShape: (s) => set({ activeShape: s }),
  stickyNoteColor: "#fff9c4",
  setStickyNoteColor: (c) => set({ stickyNoteColor: c }),
  fillColor: "transparent",
  setFillColor: (c) => set({ fillColor: c }),
  fillOpacity: 0.3,
  setFillOpacity: (o) => set({ fillOpacity: o }),

  // Image annotation
  imageToAdd: null,
  setImageToAdd: (img) => set({ imageToAdd: img }),

  // Measurement
  measureUnit: "px",
  setMeasureUnit: (u) => set({ measureUnit: u }),
  measurements: [],
  addMeasurement: (m) => set((state) => ({ measurements: [...state.measurements, m] })),
  clearMeasurements: () => set({ measurements: [] }),

  // Signature state
  signatureMode: "draw",
  setSignatureMode: (m) => set({ signatureMode: m }),
  typedSignatureText: "",
  setTypedSignatureText: (t) => set({ typedSignatureText: t }),
  typedSignatureFont: "Dancing Script, cursive",
  setTypedSignatureFont: (f) => set({ typedSignatureFont: f }),
  uploadedSignatureDataUrl: null,
  setUploadedSignatureDataUrl: (url) => set({ uploadedSignatureDataUrl: url }),

  // Saved signatures
  savedSignatures: [],
  addSavedSignature: (sig) => set((state) => ({ savedSignatures: [...state.savedSignatures, sig] })),
  removeSavedSignature: (id) => set((state) => ({ savedSignatures: state.savedSignatures.filter((s) => s.id !== id) })),
  setSavedSignatures: (sigs) => set({ savedSignatures: sigs }),

  // Merge state
  mergeFiles: [],
  setMergeFiles: (f) => {
    if (typeof f === "function") {
      set((state) => ({ mergeFiles: f(state.mergeFiles) }));
    } else {
      set({ mergeFiles: f });
    }
  },
  merging: false,
  setMerging: (m) => set({ merging: m }),

  // Split state
  splitPages: 0,
  setSplitPages: (n) => set({ splitPages: n }),
  splitRange: "",
  setSplitRange: (r) => set({ splitRange: r }),
  splitSelected: new Set<number>(),
  setSplitSelected: (s) => {
    if (typeof s === "function") {
      set((state) => ({ splitSelected: s(state.splitSelected) }));
    } else {
      set({ splitSelected: s });
    }
  },
  splitting: false,
  setSplitting: (s) => set({ splitting: s }),
  splitMode: "range",
  setSplitMode: (m) => set({ splitMode: m }),
  splitEveryN: 1,
  setSplitEveryN: (n) => set({ splitEveryN: n }),

  // Convert state
  convertDirection: "pdf-to-word",
  setConvertDirection: (d) => set({ convertDirection: d }),
  convertFile: null,
  setConvertFile: (f) => set({ convertFile: f }),
  convertProgress: 0,
  setConvertProgress: (p) => set({ convertProgress: p }),
  converting: false,
  setConverting: (c) => set({ converting: c }),
  convertImageFormat: "png",
  setConvertImageFormat: (f) => set({ convertImageFormat: f }),

  // Compress state
  compressFile: null,
  setCompressFile: (f) => set({ compressFile: f }),
  compressQuality: "medium",
  setCompressQuality: (q) => set({ compressQuality: q }),
  compressing: false,
  setCompressing: (c) => set({ compressing: c }),
  compressProgress: 0,
  setCompressProgress: (p) => set({ compressProgress: p }),
  originalSize: 0,
  setOriginalSize: (s) => set({ originalSize: s }),
  compressedSize: null,
  setCompressedSize: (s) => set({ compressedSize: s }),

  // Page management state
  pageRotations: {},
  setPageRotations: (r) => {
    if (typeof r === "function") {
      set((state) => ({ pageRotations: r(state.pageRotations) }));
    } else {
      set({ pageRotations: r });
    }
  },
  pageOrder: [],
  setPageOrder: (o) => {
    if (typeof o === "function") {
      set((state) => ({ pageOrder: o(state.pageOrder) }));
    } else {
      set({ pageOrder: o });
    }
  },
  pageNumbersAdded: false,
  setPageNumbersAdded: (a) => set({ pageNumbersAdded: a }),

  // Watermark state
  showWatermarkModal: false,
  setShowWatermarkModal: (s) => set({ showWatermarkModal: s }),
  watermarkConfig: { ...defaultWatermarkConfig },
  setWatermarkConfig: (c) => {
    if (typeof c === "function") {
      set((state) => ({ watermarkConfig: c(state.watermarkConfig) }));
    } else {
      set({ watermarkConfig: c });
    }
  },
  watermarkApplied: false,
  setWatermarkApplied: (a) => set({ watermarkApplied: a }),
  watermarkPosition: "center",
  setWatermarkPosition: (p) => set({ watermarkPosition: p }),

  // OCR state
  ocrProcessing: false,
  setOcrProcessing: (p) => set({ ocrProcessing: p }),
  ocrComplete: false,
  setOcrComplete: (c) => set({ ocrComplete: c }),
  ocrLanguage: "eng",
  setOcrLanguage: (l) => set({ ocrLanguage: l }),

  // Form state
  formFields: [],
  setFormFields: (f) => {
    if (typeof f === "function") {
      set((state) => ({ formFields: f(state.formFields) }));
    } else {
      set({ formFields: f });
    }
  },
  activeFormFieldType: null,
  setActiveFormFieldType: (t) => set({ activeFormFieldType: t }),
  showFormBuilder: false,
  setShowFormBuilder: (s) => set({ showFormBuilder: s }),
  formFieldValues: {},
  setFormFieldValue: (id, value) =>
    set((state) => ({ formFieldValues: { ...state.formFieldValues, [id]: value } })),

  // Certificate / digital signature
  showCertModal: false,
  setShowCertModal: (s) => set({ showCertModal: s }),
  certificateInfo: { ...defaultCertificateInfo },
  setCertificateInfo: (c) => {
    if (typeof c === "function") {
      set((state) => ({ certificateInfo: c(state.certificateInfo) }));
    } else {
      set({ certificateInfo: c });
    }
  },
  certSignatureApplied: false,
  setCertSignatureApplied: (a) => set({ certSignatureApplied: a }),

  // Bookmarks
  showBookmarks: false,
  setShowBookmarks: (s) => set({ showBookmarks: s }),
  bookmarks: [],
  setBookmarks: (b) => {
    if (typeof b === "function") {
      set((state) => ({ bookmarks: b(state.bookmarks) }));
    } else {
      set({ bookmarks: b });
    }
  },

  // Compare
  showCompare: false,
  setShowCompare: (s) => set({ showCompare: s }),
  compareName: "",
  setCompareName: (n) => set({ compareName: n }),
  comparePage: 1,
  setComparePage: (p) => set({ comparePage: p }),
  compareTotalPages: 0,
  setCompareTotalPages: (n) => set({ compareTotalPages: n }),
  compareHighlightDiffs: true,
  setCompareHighlightDiffs: (h) => set({ compareHighlightDiffs: h }),
  compareSyncScroll: true,
  setCompareSyncScroll: (s) => set({ compareSyncScroll: s }),

  // Search
  showSearch: false,
  setShowSearch: (s) => set({ showSearch: s }),
  searchResults: [],
  setSearchResults: (r) => set({ searchResults: r }),
  currentSearchResult: 0,
  setCurrentSearchResult: (i) => set({ currentSearchResult: i }),

  // Properties
  showProperties: false,
  setShowProperties: (s) => set({ showProperties: s }),
  documentProperties: { ...defaultDocumentProperties },
  setDocumentProperties: (p) => set({ documentProperties: p }),

  // Header/Footer
  showHeaderFooter: false,
  setShowHeaderFooter: (s) => set({ showHeaderFooter: s }),
  headerFooterConfig: { ...defaultHeaderFooterConfig },
  setHeaderFooterConfig: (c) => {
    if (typeof c === "function") {
      set((state) => ({ headerFooterConfig: c(state.headerFooterConfig) }));
    } else {
      set({ headerFooterConfig: c });
    }
  },
  headerFooterApplied: false,
  setHeaderFooterApplied: (a) => set({ headerFooterApplied: a }),

  // Print
  showPrint: false,
  setShowPrint: (s) => set({ showPrint: s }),
  printOptions: { ...defaultPrintOptions },
  setPrintOptions: (o) => set({ printOptions: o }),

  // Export
  showExport: false,
  setShowExport: (s) => set({ showExport: s }),
  exportOptions: { ...defaultExportOptions },
  setExportOptions: (o) => set({ exportOptions: o }),

  // Security
  showSecurity: false,
  setShowSecurity: (s) => set({ showSecurity: s }),
  securityConfig: { ...defaultSecurityConfig },
  setSecurityConfig: (c) => {
    if (typeof c === "function") {
      set((state) => ({ securityConfig: c(state.securityConfig) }));
    } else {
      set({ securityConfig: c });
    }
  },
  securityApplied: false,
  setSecurityApplied: (a) => set({ securityApplied: a }),

  // Create blank
  showCreateBlank: false,
  setShowCreateBlank: (s) => set({ showCreateBlank: s }),

  // Flatten
  flattenApplied: false,
  setFlattenApplied: (a) => set({ flattenApplied: a }),

  // Redaction
  redactionsApplied: false,
  setRedactionsApplied: (a) => set({ redactionsApplied: a }),

  // PDF Creation (from scratch)
  creatorElements: [],
  setCreatorElements: (e) => {
    if (typeof e === "function") {
      set((state) => ({ creatorElements: e(state.creatorElements) }));
    } else {
      set({ creatorElements: e });
    }
  },
  addCreatorElement: (e) => set((state) => ({ creatorElements: [...state.creatorElements, e] })),
  removeCreatorElement: (id) =>
    set((state) => ({ creatorElements: state.creatorElements.filter((el) => el.id !== id) })),
  selectedCreatorElement: null,
  setSelectedCreatorElement: (id) => set({ selectedCreatorElement: id }),

  // Reset
  resetViewerState: () =>
    set({
      pdfName: "",
      totalPages: 0,
      currentPage: 1,
      zoom: 100,
      fitMode: "none",
      thumbnails: [],
      showThumbnails: true,
      isFullscreen: false,
      multiPageView: false,
      continuousScroll: false,
      editMode: "none",
      annotations: [],
      fontSize: 16,
      fontFamily: "sans-serif",
      drawColor: "#ff0000",
      strokeWidth: 2,
      selectedStamp: "Approved",
      activeShape: "rectangle",
      stickyNoteColor: "#fff9c4",
      fillColor: "transparent",
      fillOpacity: 0.3,
      imageToAdd: null,
      measureUnit: "px",
      measurements: [],
      signatureMode: "draw",
      typedSignatureText: "",
      typedSignatureFont: "Dancing Script, cursive",
      uploadedSignatureDataUrl: null,
      savedSignatures: [],
      mergeFiles: [],
      merging: false,
      splitPages: 0,
      splitRange: "",
      splitSelected: new Set<number>(),
      splitting: false,
      splitMode: "range",
      splitEveryN: 1,
      convertFile: null,
      convertProgress: 0,
      converting: false,
      convertImageFormat: "png",
      compressFile: null,
      compressing: false,
      compressProgress: 0,
      originalSize: 0,
      compressedSize: null,
      pageRotations: {},
      pageOrder: [],
      pageNumbersAdded: false,
      showWatermarkModal: false,
      watermarkConfig: { ...defaultWatermarkConfig },
      watermarkApplied: false,
      watermarkPosition: "center",
      ocrProcessing: false,
      ocrComplete: false,
      ocrLanguage: "eng",
      formFields: [],
      activeFormFieldType: null,
      showFormBuilder: false,
      formFieldValues: {},
      showCertModal: false,
      certificateInfo: { ...defaultCertificateInfo },
      certSignatureApplied: false,
      showBookmarks: false,
      bookmarks: [],
      showCompare: false,
      compareName: "",
      comparePage: 1,
      compareTotalPages: 0,
      compareHighlightDiffs: true,
      compareSyncScroll: true,
      showSearch: false,
      searchResults: [],
      currentSearchResult: 0,
      showProperties: false,
      documentProperties: { ...defaultDocumentProperties },
      showHeaderFooter: false,
      headerFooterConfig: { ...defaultHeaderFooterConfig },
      headerFooterApplied: false,
      showPrint: false,
      printOptions: { ...defaultPrintOptions },
      showExport: false,
      exportOptions: { ...defaultExportOptions },
      showSecurity: false,
      securityConfig: { ...defaultSecurityConfig },
      securityApplied: false,
      showCreateBlank: false,
      flattenApplied: false,
      redactionsApplied: false,
      creatorElements: [],
      selectedCreatorElement: null,
    }),
}));
