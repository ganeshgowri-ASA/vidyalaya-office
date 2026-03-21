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

let _idCounter = 0;
export const genId = () => `shape_${++_idCounter}_${Date.now()}`;

const DEFAULT_SHADOW: ShadowDef = { enabled: false, x: 4, y: 4, blur: 8, color: 'rgba(0,0,0,0.5)' };

export const createShape = (type: ShapeType, x: number, y: number): Shape => {
  const base: ShapeBase = {
    id: genId(), x, y, width: 120, height: 80,
    rotation: 0, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2,
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
}

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

  setShapes: (shapes) => set({ shapes }),
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
  setGuides: (guides) => set((s) => ({ guides: typeof guides === 'function' ? guides(s.guides) : guides })),
  setCanvasWidth: (w) => set({ canvasWidth: w }),
  setCanvasHeight: (h) => set({ canvasHeight: h }),
  setClipboard: (clipboard) => set({ clipboard }),
  setAspectRatioLocked: (v) => set({ aspectRatioLocked: v }),

  pushHistory: (shapes) => set((s) => {
    const h = s.history.slice(0, s.historyIndex + 1);
    h.push(shapes);
    return { history: h, historyIndex: h.length - 1, shapes };
  }),

  undo: () => set((s) => {
    if (s.historyIndex <= 0) return s;
    const idx = s.historyIndex - 1;
    return { historyIndex: idx, shapes: s.history[idx] };
  }),

  redo: () => set((s) => {
    if (s.historyIndex >= s.history.length - 1) return s;
    const idx = s.historyIndex + 1;
    return { historyIndex: idx, shapes: s.history[idx] };
  }),
}));
