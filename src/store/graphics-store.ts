'use client';
import { create } from 'zustand';

export interface Point { x: number; y: number; }
export interface GradientStop { offset: number; color: string; }
export interface ShadowDef { enabled: boolean; x: number; y: number; blur: number; color: string; }
export type TextWrap = 'none' | 'square' | 'tight' | 'through' | 'top-bottom' | 'behind' | 'in-front';

export interface ShapeBase {
  id: string; x: number; y: number; width: number; height: number;
  rotation: number; fill: string; stroke: string; strokeWidth: number;
  opacity: number; label: string; locked: boolean; visible: boolean;
  layerOpacity: number; borderRadius?: number;
  gradient?: { type: 'linear' | 'radial'; stops: GradientStop[]; angle: number } | null;
  shadow?: ShadowDef;
  textWrap?: TextWrap;
  groupId?: string;
}

export interface RectShape extends ShapeBase { type: 'rect'; }
export interface EllipseShape extends ShapeBase { type: 'ellipse'; }
export interface DiamondShape extends ShapeBase { type: 'diamond'; }
export interface TriangleShape extends ShapeBase { type: 'triangle'; }
export interface StarShape extends ShapeBase { type: 'star'; points: number; innerRadius: number; }
export interface ArrowShape extends ShapeBase { type: 'arrow'; startPoint: Point; endPoint: Point; }
export interface TextShape extends ShapeBase { type: 'text'; text: string; fontSize: number; fontFamily: string; }
export interface LineShape extends ShapeBase { type: 'line'; startPoint: Point; endPoint: Point; lineStyle: 'solid' | 'dashed' | 'dotted'; }
export interface HexagonShape extends ShapeBase { type: 'hexagon'; }
export interface CloudShape extends ShapeBase { type: 'cloud'; }
export interface CylinderShape extends ShapeBase { type: 'cylinder'; }
export interface CalloutShape extends ShapeBase { type: 'callout'; }
export interface BlockArrowShape extends ShapeBase { type: 'blockArrow'; direction: 'right' | 'left' | 'up' | 'down'; }
export interface BracketShape extends ShapeBase { type: 'bracket'; side: 'left' | 'right' | 'both'; }
export interface BannerShape extends ShapeBase { type: 'banner'; }
export interface RibbonShape extends ShapeBase { type: 'ribbon'; }

export type Shape =
  | RectShape | EllipseShape | DiamondShape | TriangleShape | StarShape
  | ArrowShape | TextShape | LineShape | HexagonShape | CloudShape
  | CylinderShape | CalloutShape | BlockArrowShape | BracketShape
  | BannerShape | RibbonShape;

export type ShapeType = Shape['type'];

export type Tool = 'select' | ShapeType | 'pen' | 'hand';

export interface Guide { id: string; orientation: 'horizontal' | 'vertical'; position: number; }
export interface SmartGuide { orientation: 'horizontal' | 'vertical'; position: number; }

// --- Multi-Page Support ---
export type PageSize = 'custom' | 'A4' | 'A3' | 'Letter' | 'Legal' | 'HD-1080p' | '4K' | 'Instagram' | 'Slide-16:9';

export const PAGE_SIZE_PRESETS: Record<Exclude<PageSize, 'custom'>, { w: number; h: number; label: string }> = {
  'A4': { w: 794, h: 1123, label: 'A4 (794×1123)' },
  'A3': { w: 1123, h: 1587, label: 'A3 (1123×1587)' },
  'Letter': { w: 816, h: 1056, label: 'Letter (816×1056)' },
  'Legal': { w: 816, h: 1344, label: 'Legal (816×1344)' },
  'HD-1080p': { w: 1920, h: 1080, label: 'HD 1080p (1920×1080)' },
  '4K': { w: 3840, h: 2160, label: '4K (3840×2160)' },
  'Instagram': { w: 1080, h: 1080, label: 'Instagram (1080×1080)' },
  'Slide-16:9': { w: 1920, h: 1080, label: 'Slide 16:9 (1920×1080)' },
};

export type PageBackground = {
  type: 'solid' | 'gradient' | 'dots' | 'lines' | 'graph';
  color: string;
  secondaryColor?: string;
};

export interface DiagramPage {
  id: string;
  name: string;
  shapes: Shape[];
  width: number;
  height: number;
  sizePreset: PageSize;
  background: PageBackground;
  guides: Guide[];
  history: Shape[][];
  historyIndex: number;
}

// --- Professional Themes ---
export interface DiagramTheme {
  id: string;
  name: string;
  colors: { primary: string; secondary: string; accent: string; text: string; stroke: string; background: string };
  preview: string[];
}

export const DIAGRAM_THEMES: DiagramTheme[] = [
  { id: 'default', name: 'Default Blue', colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa', text: '#ffffff', stroke: '#1e40af', background: '#0f172a' }, preview: ['#3b82f6', '#1e40af', '#60a5fa', '#93c5fd'] },
  { id: 'ocean', name: 'Ocean Breeze', colors: { primary: '#0891b2', secondary: '#155e75', accent: '#22d3ee', text: '#ffffff', stroke: '#164e63', background: '#0c1524' }, preview: ['#0891b2', '#155e75', '#22d3ee', '#67e8f9'] },
  { id: 'forest', name: 'Forest Green', colors: { primary: '#16a34a', secondary: '#166534', accent: '#4ade80', text: '#ffffff', stroke: '#14532d', background: '#0a1a0f' }, preview: ['#16a34a', '#166534', '#4ade80', '#86efac'] },
  { id: 'sunset', name: 'Sunset Glow', colors: { primary: '#ea580c', secondary: '#9a3412', accent: '#fb923c', text: '#ffffff', stroke: '#7c2d12', background: '#1a0f0a' }, preview: ['#ea580c', '#9a3412', '#fb923c', '#fdba74'] },
  { id: 'royal', name: 'Royal Purple', colors: { primary: '#7c3aed', secondary: '#5b21b6', accent: '#a78bfa', text: '#ffffff', stroke: '#4c1d95', background: '#0f0a1a' }, preview: ['#7c3aed', '#5b21b6', '#a78bfa', '#c4b5fd'] },
  { id: 'rose', name: 'Rose Garden', colors: { primary: '#e11d48', secondary: '#9f1239', accent: '#fb7185', text: '#ffffff', stroke: '#881337', background: '#1a0a10' }, preview: ['#e11d48', '#9f1239', '#fb7185', '#fda4af'] },
  { id: 'slate', name: 'Slate Modern', colors: { primary: '#475569', secondary: '#334155', accent: '#94a3b8', text: '#f1f5f9', stroke: '#1e293b', background: '#0f172a' }, preview: ['#475569', '#334155', '#94a3b8', '#cbd5e1'] },
  { id: 'amber', name: 'Amber Warm', colors: { primary: '#d97706', secondary: '#92400e', accent: '#fbbf24', text: '#ffffff', stroke: '#78350f', background: '#1a150a' }, preview: ['#d97706', '#92400e', '#fbbf24', '#fde68a'] },
  { id: 'teal', name: 'Teal Mint', colors: { primary: '#0d9488', secondary: '#115e59', accent: '#2dd4bf', text: '#ffffff', stroke: '#134e4a', background: '#0a1a18' }, preview: ['#0d9488', '#115e59', '#2dd4bf', '#99f6e4'] },
  { id: 'indigo', name: 'Indigo Night', colors: { primary: '#4f46e5', secondary: '#3730a3', accent: '#818cf8', text: '#ffffff', stroke: '#312e81', background: '#0a0a1a' }, preview: ['#4f46e5', '#3730a3', '#818cf8', '#a5b4fc'] },
  { id: 'coral', name: 'Coral Reef', colors: { primary: '#f43f5e', secondary: '#be123c', accent: '#fda4af', text: '#ffffff', stroke: '#9f1239', background: '#1a0a0e' }, preview: ['#f43f5e', '#be123c', '#fda4af', '#ffe4e6'] },
  { id: 'mono', name: 'Monochrome', colors: { primary: '#a1a1aa', secondary: '#71717a', accent: '#d4d4d8', text: '#fafafa', stroke: '#52525b', background: '#09090b' }, preview: ['#a1a1aa', '#71717a', '#d4d4d8', '#e4e4e7'] },
];

let _idCounter = 0;
export const genId = () => `shape_${++_idCounter}_${Date.now()}`;

let _pageIdCounter = 0;
export const genPageId = () => `page_${++_pageIdCounter}_${Date.now()}`;

export const createDefaultPage = (name: string = 'Page 1'): DiagramPage => ({
  id: genPageId(),
  name,
  shapes: [],
  width: 1920,
  height: 1080,
  sizePreset: 'HD-1080p',
  background: { type: 'solid', color: '#0f172a' },
  guides: [
    { id: 'g1', orientation: 'horizontal', position: 200 },
    { id: 'g2', orientation: 'vertical', position: 300 },
  ],
  history: [[]],
  historyIndex: 0,
});

const DEFAULT_SHADOW: ShadowDef = { enabled: false, x: 4, y: 4, blur: 8, color: 'rgba(0,0,0,0.5)' };

export const createShape = (type: ShapeType, x: number, y: number, themeId?: string): Shape => {
  const theme = themeId ? DIAGRAM_THEMES.find(t => t.id === themeId) : undefined;
  const fillColor = theme ? theme.colors.primary : '#3b82f6';
  const strokeColor = theme ? theme.colors.stroke : '#1e40af';
  const base: ShapeBase = {
    id: genId(), x, y, width: 120, height: 80,
    rotation: 0, fill: fillColor, stroke: strokeColor, strokeWidth: 2,
    opacity: 1, label: '', locked: false, visible: true, layerOpacity: 1,
    gradient: null, borderRadius: 8,
    shadow: { ...DEFAULT_SHADOW },
    textWrap: 'none',
  };
  switch (type) {
    case 'rect': return { ...base, type: 'rect' };
    case 'ellipse': return { ...base, type: 'ellipse', borderRadius: undefined };
    case 'diamond': return { ...base, type: 'diamond', borderRadius: undefined };
    case 'triangle': return { ...base, type: 'triangle', borderRadius: undefined };
    case 'hexagon': return { ...base, type: 'hexagon', borderRadius: undefined };
    case 'cloud': return { ...base, type: 'cloud', borderRadius: undefined };
    case 'cylinder': return { ...base, type: 'cylinder', borderRadius: undefined };
    case 'star': return { ...base, type: 'star', points: 5, innerRadius: 0.4, borderRadius: undefined };
    case 'arrow': return { ...base, type: 'arrow', startPoint: { x, y: y + 40 }, endPoint: { x: x + 120, y: y + 40 } };
    case 'text': return { ...base, type: 'text', text: 'Text', fontSize: 16, fontFamily: 'Inter', fill: 'transparent', stroke: 'transparent', borderRadius: undefined };
    case 'line': return { ...base, type: 'line', startPoint: { x, y: y + 40 }, endPoint: { x: x + 120, y: y + 40 }, lineStyle: 'solid' };
    case 'callout': return { ...base, type: 'callout', height: 100 };
    case 'blockArrow': return { ...base, type: 'blockArrow', direction: 'right', borderRadius: undefined };
    case 'bracket': return { ...base, type: 'bracket', side: 'both', fill: 'transparent', borderRadius: undefined };
    case 'banner': return { ...base, type: 'banner', height: 60, borderRadius: undefined };
    case 'ribbon': return { ...base, type: 'ribbon', height: 50, borderRadius: undefined };
    default: return { ...base, type: 'rect' };
  }
};

interface GraphicsState {
  shapes: Shape[];
  selectedId: string | null;
  selectedIds: string[];
  tool: Tool;
  zoom: number;
  pan: Point;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  smartGuidesEnabled: boolean;
  gridSize: number;
  history: Shape[][];
  historyIndex: number;
  showLayers: boolean;
  showProperties: boolean;
  showAI: boolean;
  guides: Guide[];
  canvasWidth: number;
  canvasHeight: number;
  clipboard: Shape[];
  aspectRatioLocked: boolean;

  // Multi-page
  pages: DiagramPage[];
  activePageId: string;

  // Themes
  activeThemeId: string;

  setShapes: (shapes: Shape[]) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setTool: (tool: Tool) => void;
  setZoom: (zoom: number | ((z: number) => number)) => void;
  setPan: (pan: Point) => void;
  setShowGrid: (v: boolean) => void;
  setShowRulers: (v: boolean) => void;
  setShowGuides: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setSmartGuidesEnabled: (v: boolean) => void;
  setShowLayers: (v: boolean) => void;
  setShowProperties: (v: boolean) => void;
  setShowAI: (v: boolean) => void;
  setGuides: (guides: Guide[] | ((g: Guide[]) => Guide[])) => void;
  setCanvasWidth: (w: number) => void;
  setCanvasHeight: (h: number) => void;
  setClipboard: (shapes: Shape[]) => void;
  setAspectRatioLocked: (v: boolean) => void;
  pushHistory: (shapes: Shape[]) => void;
  undo: () => void;
  redo: () => void;

  // Multi-page actions
  addPage: (name?: string) => void;
  deletePage: (pageId: string) => void;
  switchPage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  duplicatePage: (pageId: string) => void;
  setPageBackground: (pageId: string, bg: PageBackground) => void;
  setPageSize: (pageId: string, preset: PageSize, w?: number, h?: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;

  // Theme actions
  setActiveTheme: (themeId: string) => void;
  applyThemeToShapes: (themeId: string) => void;
}

const _initialPage = createDefaultPage('Page 1');

export const useGraphicsStore = create<GraphicsState>((set, get) => ({
  shapes: [],
  selectedId: null,
  selectedIds: [],
  tool: 'select',
  zoom: 1,
  pan: { x: 0, y: 0 },
  showGrid: true,
  showRulers: true,
  showGuides: true,
  snapToGrid: true,
  smartGuidesEnabled: true,
  gridSize: 20,
  history: [[]],
  historyIndex: 0,
  showLayers: true,
  showProperties: true,
  showAI: false,
  guides: [
    { id: 'g1', orientation: 'horizontal', position: 200 },
    { id: 'g2', orientation: 'vertical', position: 300 },
  ],
  canvasWidth: 1920,
  canvasHeight: 1080,
  clipboard: [],
  aspectRatioLocked: false,

  // Multi-page
  pages: [_initialPage],
  activePageId: _initialPage.id,

  // Themes
  activeThemeId: 'default',

  setShapes: (shapes) => set((s) => {
    const pages = s.pages.map(p => p.id === s.activePageId ? { ...p, shapes } : p);
    return { shapes, pages };
  }),
  setSelectedId: (id) => set({ selectedId: id }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set((s) => ({ zoom: typeof zoom === 'function' ? zoom(s.zoom) : zoom })),
  setPan: (pan) => set({ pan }),
  setShowGrid: (v) => set({ showGrid: v }),
  setShowRulers: (v) => set({ showRulers: v }),
  setShowGuides: (v) => set({ showGuides: v }),
  setSnapToGrid: (v) => set({ snapToGrid: v }),
  setSmartGuidesEnabled: (v) => set({ smartGuidesEnabled: v }),
  setShowLayers: (v) => set({ showLayers: v }),
  setShowProperties: (v) => set({ showProperties: v }),
  setShowAI: (v) => set({ showAI: v }),
  setGuides: (guides) => set((s) => {
    const resolved = typeof guides === 'function' ? guides(s.guides) : guides;
    const pages = s.pages.map(p => p.id === s.activePageId ? { ...p, guides: resolved } : p);
    return { guides: resolved, pages };
  }),
  setCanvasWidth: (w) => set((s) => {
    const pages = s.pages.map(p => p.id === s.activePageId ? { ...p, width: w } : p);
    return { canvasWidth: w, pages };
  }),
  setCanvasHeight: (h) => set((s) => {
    const pages = s.pages.map(p => p.id === s.activePageId ? { ...p, height: h } : p);
    return { canvasHeight: h, pages };
  }),
  setClipboard: (clipboard) => set({ clipboard }),
  setAspectRatioLocked: (v) => set({ aspectRatioLocked: v }),

  pushHistory: (shapes) => set((s) => {
    const h = s.history.slice(0, s.historyIndex + 1);
    h.push(shapes);
    const pages = s.pages.map(p => p.id === s.activePageId
      ? { ...p, shapes, history: h, historyIndex: h.length - 1 }
      : p
    );
    return { history: h, historyIndex: h.length - 1, shapes, pages };
  }),

  undo: () => set((s) => {
    if (s.historyIndex <= 0) return s;
    const idx = s.historyIndex - 1;
    const newShapes = s.history[idx];
    const pages = s.pages.map(p => p.id === s.activePageId
      ? { ...p, shapes: newShapes, historyIndex: idx }
      : p
    );
    return { historyIndex: idx, shapes: newShapes, pages };
  }),

  redo: () => set((s) => {
    if (s.historyIndex >= s.history.length - 1) return s;
    const idx = s.historyIndex + 1;
    const newShapes = s.history[idx];
    const pages = s.pages.map(p => p.id === s.activePageId
      ? { ...p, shapes: newShapes, historyIndex: idx }
      : p
    );
    return { historyIndex: idx, shapes: newShapes, pages };
  }),

  // --- Multi-page actions ---
  addPage: (name) => set((s) => {
    const pageNum = s.pages.length + 1;
    const newPage = createDefaultPage(name || `Page ${pageNum}`);
    return {
      pages: [...s.pages, newPage],
      activePageId: newPage.id,
      shapes: newPage.shapes,
      guides: newPage.guides,
      canvasWidth: newPage.width,
      canvasHeight: newPage.height,
      history: newPage.history,
      historyIndex: newPage.historyIndex,
      selectedId: null,
      selectedIds: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
    };
  }),

  deletePage: (pageId) => set((s) => {
    if (s.pages.length <= 1) return s;
    const filtered = s.pages.filter(p => p.id !== pageId);
    const nextPage = pageId === s.activePageId ? filtered[0] : filtered.find(p => p.id === s.activePageId) || filtered[0];
    if (pageId !== s.activePageId) return { pages: filtered };
    return {
      pages: filtered,
      activePageId: nextPage.id,
      shapes: nextPage.shapes,
      guides: nextPage.guides,
      canvasWidth: nextPage.width,
      canvasHeight: nextPage.height,
      history: nextPage.history,
      historyIndex: nextPage.historyIndex,
      selectedId: null,
      selectedIds: [],
    };
  }),

  switchPage: (pageId) => set((s) => {
    if (pageId === s.activePageId) return s;
    const page = s.pages.find(p => p.id === pageId);
    if (!page) return s;
    // Save current page state
    const pages = s.pages.map(p => p.id === s.activePageId
      ? { ...p, shapes: s.shapes, guides: s.guides, width: s.canvasWidth, height: s.canvasHeight, history: s.history, historyIndex: s.historyIndex }
      : p
    );
    return {
      pages,
      activePageId: pageId,
      shapes: page.shapes,
      guides: page.guides,
      canvasWidth: page.width,
      canvasHeight: page.height,
      history: page.history,
      historyIndex: page.historyIndex,
      selectedId: null,
      selectedIds: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
    };
  }),

  renamePage: (pageId, name) => set((s) => ({
    pages: s.pages.map(p => p.id === pageId ? { ...p, name } : p),
  })),

  duplicatePage: (pageId) => set((s) => {
    const source = s.pages.find(p => p.id === pageId);
    if (!source) return s;
    const newPage: DiagramPage = {
      ...source,
      id: genPageId(),
      name: `${source.name} (Copy)`,
      shapes: source.shapes.map(sh => ({ ...sh, id: genId() } as Shape)),
      history: [source.shapes.map(sh => ({ ...sh, id: genId() } as Shape))],
      historyIndex: 0,
    };
    const idx = s.pages.findIndex(p => p.id === pageId);
    const pages = [...s.pages];
    pages.splice(idx + 1, 0, newPage);
    return {
      pages,
      activePageId: newPage.id,
      shapes: newPage.shapes,
      guides: newPage.guides,
      canvasWidth: newPage.width,
      canvasHeight: newPage.height,
      history: newPage.history,
      historyIndex: newPage.historyIndex,
      selectedId: null,
      selectedIds: [],
    };
  }),

  setPageBackground: (pageId, bg) => set((s) => ({
    pages: s.pages.map(p => p.id === pageId ? { ...p, background: bg } : p),
  })),

  setPageSize: (pageId, preset, w, h) => set((s) => {
    const size = preset !== 'custom' ? PAGE_SIZE_PRESETS[preset] : null;
    const newW = size ? size.w : (w ?? s.canvasWidth);
    const newH = size ? size.h : (h ?? s.canvasHeight);
    const pages = s.pages.map(p => p.id === pageId ? { ...p, sizePreset: preset, width: newW, height: newH } : p);
    const isActive = pageId === s.activePageId;
    return {
      pages,
      ...(isActive ? { canvasWidth: newW, canvasHeight: newH } : {}),
    };
  }),

  reorderPages: (fromIndex, toIndex) => set((s) => {
    const pages = [...s.pages];
    const [moved] = pages.splice(fromIndex, 1);
    pages.splice(toIndex, 0, moved);
    return { pages };
  }),

  // --- Theme actions ---
  setActiveTheme: (themeId) => set({ activeThemeId: themeId }),

  applyThemeToShapes: (themeId) => set((s) => {
    const theme = DIAGRAM_THEMES.find(t => t.id === themeId);
    if (!theme) return s;
    const { primary, secondary, accent, stroke } = theme.colors;
    const palette = [primary, secondary, accent];
    const newShapes = s.shapes.map((sh, i) => ({
      ...sh,
      fill: palette[i % palette.length],
      stroke,
    } as Shape));
    const h = s.history.slice(0, s.historyIndex + 1);
    h.push(newShapes);
    const pages = s.pages.map(p => p.id === s.activePageId
      ? { ...p, shapes: newShapes, history: h, historyIndex: h.length - 1 }
      : p
    );
    return {
      shapes: newShapes,
      activeThemeId: themeId,
      history: h,
      historyIndex: h.length - 1,
      pages,
    };
  }),
}));
