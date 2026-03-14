import { create } from "zustand";

export type PageSize = "a4" | "letter" | "legal";
export type MarginPreset = "normal" | "narrow" | "moderate" | "wide";
export type LineSpacing = "1" | "1.15" | "1.5" | "2";

interface DocumentState {
  fileName: string;
  activeTab: "home" | "insert" | "layout" | "view";
  showAI: boolean;
  showTemplates: boolean;
  showFindReplace: boolean;
  showPrintPreview: boolean;
  zoom: number;
  pageSize: PageSize;
  margins: MarginPreset;
  lineSpacing: LineSpacing;
  columns: number;
  wordCount: number;
  charCount: number;
  currentFont: string;
  currentFontSize: string;
  lastSaved: string | null;

  setFileName: (name: string) => void;
  setActiveTab: (tab: DocumentState["activeTab"]) => void;
  toggleAI: () => void;
  setShowTemplates: (show: boolean) => void;
  setShowFindReplace: (show: boolean) => void;
  setShowPrintPreview: (show: boolean) => void;
  setZoom: (zoom: number) => void;
  setPageSize: (size: PageSize) => void;
  setMargins: (margins: MarginPreset) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setColumns: (cols: number) => void;
  updateCounts: (words: number, chars: number) => void;
  setCurrentFont: (font: string) => void;
  setCurrentFontSize: (size: string) => void;
  setLastSaved: (time: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  fileName: "Untitled Document",
  activeTab: "home",
  showAI: false,
  showTemplates: false,
  showFindReplace: false,
  showPrintPreview: false,
  zoom: 100,
  pageSize: "a4",
  margins: "normal",
  lineSpacing: "1.15",
  columns: 1,
  wordCount: 0,
  charCount: 0,
  currentFont: "Arial",
  currentFontSize: "11",
  lastSaved: null,

  setFileName: (name) => set({ fileName: name }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleAI: () => set((s) => ({ showAI: !s.showAI })),
  setShowTemplates: (show) => set({ showTemplates: show }),
  setShowFindReplace: (show) => set({ showFindReplace: show }),
  setShowPrintPreview: (show) => set({ showPrintPreview: show }),
  setZoom: (zoom) => set({ zoom }),
  setPageSize: (pageSize) => set({ pageSize }),
  setMargins: (margins) => set({ margins }),
  setLineSpacing: (lineSpacing) => set({ lineSpacing }),
  setColumns: (cols) => set({ columns: cols }),
  updateCounts: (words, chars) => set({ wordCount: words, charCount: chars }),
  setCurrentFont: (font) => set({ currentFont: font }),
  setCurrentFontSize: (size) => set({ currentFontSize: size }),
  setLastSaved: (time) => set({ lastSaved: time }),
}));
