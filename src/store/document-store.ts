import { create } from "zustand";

export type PageSize = "a4" | "letter" | "legal";
export type MarginPreset = "normal" | "narrow" | "moderate" | "wide";
export type LineSpacing = "1" | "1.15" | "1.5" | "2";

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  resolved: boolean;
  replies: { id: string; author: string; text: string; timestamp: string }[];
}

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

  // New state fields
  trackChanges: boolean;
  showComments: boolean;
  showStylesPanel: boolean;
  watermarkText: string;
  showWatermark: boolean;
  language: string;
  headerText: string;
  footerText: string;
  showHeaderFooter: boolean;
  comments: Comment[];
  lineCount: number;

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
  updateCounts: (words: number, chars: number, lines: number) => void;
  setCurrentFont: (font: string) => void;
  setCurrentFontSize: (size: string) => void;
  setLastSaved: (time: string) => void;

  // New actions
  toggleTrackChanges: () => void;
  toggleComments: () => void;
  toggleStylesPanel: () => void;
  setWatermarkText: (text: string) => void;
  toggleWatermark: () => void;
  setLanguage: (lang: string) => void;
  setHeaderText: (text: string) => void;
  setFooterText: (text: string) => void;
  toggleHeaderFooter: () => void;
  addComment: (comment: Comment) => void;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
  addReply: (commentId: string, reply: { id: string; author: string; text: string; timestamp: string }) => void;
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

  // New defaults
  trackChanges: false,
  showComments: false,
  showStylesPanel: false,
  watermarkText: "DRAFT",
  showWatermark: false,
  language: "English",
  headerText: "",
  footerText: "",
  showHeaderFooter: false,
  comments: [],
  lineCount: 0,

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
  updateCounts: (words, chars, lines) => set({ wordCount: words, charCount: chars, lineCount: lines }),
  setCurrentFont: (font) => set({ currentFont: font }),
  setCurrentFontSize: (size) => set({ currentFontSize: size }),
  setLastSaved: (time) => set({ lastSaved: time }),

  // New actions
  toggleTrackChanges: () => set((s) => ({ trackChanges: !s.trackChanges })),
  toggleComments: () => set((s) => ({ showComments: !s.showComments })),
  toggleStylesPanel: () => set((s) => ({ showStylesPanel: !s.showStylesPanel })),
  setWatermarkText: (text) => set({ watermarkText: text }),
  toggleWatermark: () => set((s) => ({ showWatermark: !s.showWatermark })),
  setLanguage: (lang) => set({ language: lang }),
  setHeaderText: (text) => set({ headerText: text }),
  setFooterText: (text) => set({ footerText: text }),
  toggleHeaderFooter: () => set((s) => ({ showHeaderFooter: !s.showHeaderFooter })),
  addComment: (comment) => set((s) => ({ comments: [...s.comments, comment] })),
  resolveComment: (id) =>
    set((s) => ({
      comments: s.comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
    })),
  deleteComment: (id) =>
    set((s) => ({
      comments: s.comments.filter((c) => c.id !== id),
    })),
  addReply: (commentId, reply) =>
    set((s) => ({
      comments: s.comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      ),
    })),
}));
