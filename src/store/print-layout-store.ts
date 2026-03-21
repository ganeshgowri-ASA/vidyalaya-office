import { create } from "zustand";

export type PaperSize = "letter" | "a4" | "legal" | "a3" | "a5" | "b5" | "tabloid";
export type Orientation = "portrait" | "landscape";
export type MarginPreset = "normal" | "narrow" | "moderate" | "wide" | "custom";
export type PageNumberPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type PageNumberFormat = "numeric" | "roman" | "alpha";
export type ScaleMode = "actual" | "fit-width" | "fit-page" | "custom";

export interface PageMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface HeaderFooterField {
  left: string;
  center: string;
  right: string;
}

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  margins: PageMargins;
  marginPreset: MarginPreset;
  scaleMode: ScaleMode;
  scalePercent: number;
  fitToWidth: number;
  fitToHeight: number;
  showPageBreaks: boolean;
  colorMode: "color" | "grayscale" | "blackwhite";
  quality: "draft" | "normal" | "high";
  duplex: "none" | "long-edge" | "short-edge";
  // Page numbers
  pageNumberEnabled: boolean;
  pageNumberPosition: PageNumberPosition;
  pageNumberFormat: PageNumberFormat;
  startPageNumber: number;
  // Headers & footers
  headerEnabled: boolean;
  footerEnabled: boolean;
  header: HeaderFooterField;
  footer: HeaderFooterField;
  differentFirstPage: boolean;
  firstPageHeader: HeaderFooterField;
  firstPageFooter: HeaderFooterField;
  // Print range
  printRange: "all" | "selection" | "pages";
  pageRangeStart: number;
  pageRangeEnd: number;
  // Spreadsheet-specific
  printArea: string | null;
  repeatRows: string | null;
  repeatColumns: string | null;
  printGridlines: boolean;
  printHeadings: boolean;
}

interface PrintLayoutState {
  // Print preview
  showPrintLayoutPreview: boolean;
  previewZoom: number;
  currentPreviewPage: number;
  totalPages: number;
  // Page setup dialog
  showPageSetupDialog: boolean;
  activeSetupTab: "page" | "margins" | "header-footer" | "sheet";
  // Print area dialog (spreadsheet)
  showPrintAreaDialog: boolean;
  // Export to PDF dialog
  showExportPdfDialog: boolean;
  // The actual settings
  settings: PrintSettings;

  // Actions
  setShowPrintLayoutPreview: (show: boolean) => void;
  setPreviewZoom: (zoom: number) => void;
  setCurrentPreviewPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setShowPageSetupDialog: (show: boolean) => void;
  setActiveSetupTab: (tab: "page" | "margins" | "header-footer" | "sheet") => void;
  setShowPrintAreaDialog: (show: boolean) => void;
  setShowExportPdfDialog: (show: boolean) => void;
  updateSettings: (partial: Partial<PrintSettings>) => void;
  setMargins: (margins: PageMargins) => void;
  setMarginPreset: (preset: MarginPreset) => void;
  setHeader: (header: HeaderFooterField) => void;
  setFooter: (footer: HeaderFooterField) => void;
  setPrintArea: (area: string | null) => void;
  resetSettings: () => void;
}

const PAPER_DIMENSIONS: Record<PaperSize, { w: number; h: number; label: string }> = {
  letter: { w: 816, h: 1056, label: "Letter (8.5\" x 11\")" },
  a4: { w: 794, h: 1123, label: "A4 (210 x 297 mm)" },
  legal: { w: 816, h: 1344, label: "Legal (8.5\" x 14\")" },
  a3: { w: 1123, h: 1587, label: "A3 (297 x 420 mm)" },
  a5: { w: 559, h: 794, label: "A5 (148 x 210 mm)" },
  b5: { w: 665, h: 945, label: "B5 (176 x 250 mm)" },
  tabloid: { w: 1056, h: 1632, label: "Tabloid (11\" x 17\")" },
};

export { PAPER_DIMENSIONS };

const MARGIN_PRESETS: Record<Exclude<MarginPreset, "custom">, PageMargins> = {
  normal: { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 },
  narrow: { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 },
  moderate: { top: 25.4, bottom: 25.4, left: 19.05, right: 19.05 },
  wide: { top: 25.4, bottom: 25.4, left: 50.8, right: 50.8 },
};

export { MARGIN_PRESETS };

const DEFAULT_HEADER: HeaderFooterField = { left: "", center: "", right: "" };
const DEFAULT_FOOTER: HeaderFooterField = { left: "", center: "Page {page} of {pages}", right: "" };

const DEFAULT_SETTINGS: PrintSettings = {
  paperSize: "a4",
  orientation: "portrait",
  margins: { ...MARGIN_PRESETS.normal },
  marginPreset: "normal",
  scaleMode: "actual",
  scalePercent: 100,
  fitToWidth: 1,
  fitToHeight: 1,
  showPageBreaks: true,
  colorMode: "color",
  quality: "normal",
  duplex: "none",
  pageNumberEnabled: true,
  pageNumberPosition: "bottom-center",
  pageNumberFormat: "numeric",
  startPageNumber: 1,
  headerEnabled: false,
  footerEnabled: true,
  header: { ...DEFAULT_HEADER },
  footer: { ...DEFAULT_FOOTER },
  differentFirstPage: false,
  firstPageHeader: { ...DEFAULT_HEADER },
  firstPageFooter: { ...DEFAULT_HEADER },
  printRange: "all",
  pageRangeStart: 1,
  pageRangeEnd: 1,
  printArea: null,
  repeatRows: null,
  repeatColumns: null,
  printGridlines: false,
  printHeadings: false,
};

export const usePrintLayoutStore = create<PrintLayoutState>((set) => ({
  showPrintLayoutPreview: false,
  previewZoom: 75,
  currentPreviewPage: 1,
  totalPages: 1,
  showPageSetupDialog: false,
  activeSetupTab: "page",
  showPrintAreaDialog: false,
  showExportPdfDialog: false,
  settings: { ...DEFAULT_SETTINGS },

  setShowPrintLayoutPreview: (show) => set({ showPrintLayoutPreview: show }),
  setPreviewZoom: (zoom) => set({ previewZoom: Math.max(25, Math.min(200, zoom)) }),
  setCurrentPreviewPage: (page) => set({ currentPreviewPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setShowPageSetupDialog: (show) => set({ showPageSetupDialog: show }),
  setActiveSetupTab: (tab) => set({ activeSetupTab: tab }),
  setShowPrintAreaDialog: (show) => set({ showPrintAreaDialog: show }),
  setShowExportPdfDialog: (show) => set({ showExportPdfDialog: show }),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  setMargins: (margins) =>
    set((state) => ({ settings: { ...state.settings, margins, marginPreset: "custom" } })),
  setMarginPreset: (preset) =>
    set((state) => {
      if (preset === "custom") return { settings: { ...state.settings, marginPreset: "custom" } };
      return { settings: { ...state.settings, marginPreset: preset, margins: { ...MARGIN_PRESETS[preset] } } };
    }),
  setHeader: (header) =>
    set((state) => ({ settings: { ...state.settings, header } })),
  setFooter: (footer) =>
    set((state) => ({ settings: { ...state.settings, footer } })),
  setPrintArea: (area) =>
    set((state) => ({ settings: { ...state.settings, printArea: area } })),
  resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } }),
}));
