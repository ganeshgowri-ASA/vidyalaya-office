import { create } from "zustand";

export type CitationStyle = "APA" | "MLA" | "Chicago" | "IEEE" | "Harvard";

export interface Citation {
  id: string;
  type: "journal" | "book" | "conference" | "website" | "thesis" | "other";
  title: string;
  authors: string;
  year: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  edition?: string;
  accessed?: string;
}

export type PageSize = "a4" | "letter" | "legal" | "a5" | "b5";
export type MarginPreset = "normal" | "narrow" | "moderate" | "wide" | "mirrored";
export type LineSpacing = "1" | "1.15" | "1.5" | "2" | "2.5" | "3";
export type TabKey = "home" | "insert" | "design" | "layout" | "references" | "review" | "view" | "developer" | "table-design" | "image-format" | "smartart-design";
export type ViewMode = "print" | "read" | "web" | "outline" | "draft";
export type Orientation = "portrait" | "landscape";

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
  activeTab: TabKey;
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

  // Track changes & collaboration
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

  // New state for enhanced editor
  orientation: Orientation;
  viewMode: ViewMode;
  showRuler: boolean;
  showGridlines: boolean;
  showNavigationPane: boolean;
  indentLeft: number;
  indentRight: number;
  spacingBefore: number;
  spacingAfter: number;
  currentTheme: string;
  pageColor: string;

  // Contextual selection state
  selectedTable: boolean;
  selectedImage: boolean;
  selectedSmartArt: boolean;
  showSmartArtModal: boolean;
  // Equation editor
  showEquationEditor: boolean;
  equationCount: number;

  // Citation manager
  showCitationManager: boolean;
  citations: Citation[];
  citationStyle: CitationStyle;

  setFileName: (name: string) => void;
  setActiveTab: (tab: TabKey) => void;
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

  // Existing actions
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

  // New actions
  setOrientation: (o: Orientation) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleRuler: () => void;
  toggleGridlines: () => void;
  toggleNavigationPane: () => void;
  setIndentLeft: (v: number) => void;
  setIndentRight: (v: number) => void;
  setSpacingBefore: (v: number) => void;
  setSpacingAfter: (v: number) => void;
  setCurrentTheme: (theme: string) => void;
  setPageColor: (color: string) => void;

  // Contextual selection actions
  setSelectedTable: (v: boolean) => void;
  setSelectedImage: (v: boolean) => void;
  setSelectedSmartArt: (v: boolean) => void;
  setShowSmartArtModal: (v: boolean) => void;
  // Equation editor
  toggleEquationEditor: () => void;
  setShowEquationEditor: (show: boolean) => void;
  incrementEquationCount: () => void;

  // Citation manager
  toggleCitationManager: () => void;
  setShowCitationManager: (show: boolean) => void;
  addCitation: (citation: Citation) => void;
  removeCitation: (id: string) => void;
  updateCitation: (id: string, citation: Partial<Citation>) => void;
  setCitationStyle: (style: CitationStyle) => void;
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
  currentFont: "Calibri",
  currentFontSize: "11",
  lastSaved: null,

  // Existing defaults
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

  // New defaults
  orientation: "portrait",
  viewMode: "print",
  showRuler: true,
  showGridlines: false,
  showNavigationPane: false,
  indentLeft: 0,
  indentRight: 0,
  spacingBefore: 0,
  spacingAfter: 8,
  currentTheme: "Office",
  pageColor: "#ffffff",

  // Contextual selection defaults
  selectedTable: false,
  selectedImage: false,
  selectedSmartArt: false,
  showSmartArtModal: false,
  // Equation editor
  showEquationEditor: false,
  equationCount: 0,

  // Citation manager
  showCitationManager: false,
  citations: [],
  citationStyle: "APA",

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

  // Existing actions
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

  // New actions
  setOrientation: (o) => set({ orientation: o }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleRuler: () => set((s) => ({ showRuler: !s.showRuler })),
  toggleGridlines: () => set((s) => ({ showGridlines: !s.showGridlines })),
  toggleNavigationPane: () => set((s) => ({ showNavigationPane: !s.showNavigationPane })),
  setIndentLeft: (v) => set({ indentLeft: v }),
  setIndentRight: (v) => set({ indentRight: v }),
  setSpacingBefore: (v) => set({ spacingBefore: v }),
  setSpacingAfter: (v) => set({ spacingAfter: v }),
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setPageColor: (color) => set({ pageColor: color }),

  // Contextual selection actions
  setSelectedTable: (v) => set({ selectedTable: v, activeTab: v ? "table-design" : "home" }),
  setSelectedImage: (v) => set({ selectedImage: v, activeTab: v ? "image-format" : "home" }),
  setSelectedSmartArt: (v) => set({ selectedSmartArt: v, activeTab: v ? "smartart-design" : "home" }),
  setShowSmartArtModal: (v) => set({ showSmartArtModal: v }),
  // Equation editor
  toggleEquationEditor: () => set((s) => ({ showEquationEditor: !s.showEquationEditor })),
  setShowEquationEditor: (show) => set({ showEquationEditor: show }),
  incrementEquationCount: () => set((s) => ({ equationCount: s.equationCount + 1 })),

  // Citation manager
  toggleCitationManager: () => set((s) => ({ showCitationManager: !s.showCitationManager })),
  setShowCitationManager: (show) => set({ showCitationManager: show }),
  addCitation: (citation) => set((s) => ({ citations: [...s.citations, citation] })),
  removeCitation: (id) => set((s) => ({ citations: s.citations.filter((c) => c.id !== id) })),
  updateCitation: (id, updates) => set((s) => ({
    citations: s.citations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  })),
  setCitationStyle: (style) => set({ citationStyle: style }),
}));
