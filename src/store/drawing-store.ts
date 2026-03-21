'use client';
import { create } from 'zustand';
import type { DrawTool, BlendMode, GradientStop, FillType } from '@/components/graphics/drawing-types';
export type { DrawTool, BlendMode, GradientStop, FillType };

export interface DrawLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  imageData?: string; // base64 data URL
}


export interface DrawingState {
  // Tool
  activeTool: DrawTool;
  setActiveTool: (t: DrawTool) => void;

  // Brush settings
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  fillColor: string;
  setFillColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  brushOpacity: number;
  setBrushOpacity: (o: number) => void;
  brushHardness: number;
  setBrushHardness: (h: number) => void;
  eraserSize: number;
  setEraserSize: (s: number) => void;
  eraserMode: 'pixel' | 'object';
  setEraserMode: (m: 'pixel' | 'object') => void;

  // Fill settings
  fillType: FillType;
  setFillType: (t: FillType) => void;
  gradientStops: GradientStop[];
  setGradientStops: (stops: GradientStop[]) => void;
  gradientAngle: number;
  setGradientAngle: (a: number) => void;

  // Layers
  layers: DrawLayer[];
  activeLayerId: string;
  setLayers: (layers: DrawLayer[]) => void;
  setActiveLayerId: (id: string) => void;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  updateLayer: (id: string, patch: Partial<DrawLayer>) => void;
  reorderLayers: (fromIdx: number, toIdx: number) => void;

  // Canvas settings
  canvasWidth: number;
  canvasHeight: number;
  setCanvasSize: (w: number, h: number) => void;
  canvasBg: string; // 'white' | 'transparent' | hex
  setCanvasBg: (bg: string) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;

  // History (undo/redo) — stores flattened merged image per step
  history: string[];
  historyIndex: number;
  pushHistory: (dataUrl: string) => void;
  undo: () => void;
  redo: () => void;

  // Text tool
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  textBold: boolean;
  setTextBold: (b: boolean) => void;
  textItalic: boolean;
  setTextItalic: (i: boolean) => void;

  // Grid/snap
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
}

let layerCounter = 1;
const mkLayer = (name?: string): DrawLayer => ({
  id: `layer_${layerCounter++}_${Date.now()}`,
  name: name ?? `Layer ${layerCounter - 1}`,
  visible: true,
  locked: false,
  opacity: 1,
  blendMode: 'normal',
});

const initialLayer = mkLayer('Background');

export const useDrawingStore = create<DrawingState>((set, get) => ({
  activeTool: 'pencil',
  setActiveTool: (t) => set({ activeTool: t }),

  strokeColor: '#000000',
  setStrokeColor: (c) => set({ strokeColor: c }),
  fillColor: '#3b82f6',
  setFillColor: (c) => set({ fillColor: c }),
  strokeWidth: 2,
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  brushSize: 10,
  setBrushSize: (s) => set({ brushSize: s }),
  brushOpacity: 1,
  setBrushOpacity: (o) => set({ brushOpacity: o }),
  brushHardness: 0.8,
  setBrushHardness: (h) => set({ brushHardness: h }),
  eraserSize: 20,
  setEraserSize: (s) => set({ eraserSize: s }),
  eraserMode: 'pixel',
  setEraserMode: (m) => set({ eraserMode: m }),

  fillType: 'solid',
  setFillType: (t) => set({ fillType: t }),
  gradientStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#8b5cf6' }],
  setGradientStops: (stops) => set({ gradientStops: stops }),
  gradientAngle: 45,
  setGradientAngle: (a) => set({ gradientAngle: a }),

  layers: [initialLayer],
  activeLayerId: initialLayer.id,
  setLayers: (layers) => set({ layers }),
  setActiveLayerId: (id) => set({ activeLayerId: id }),
  addLayer: () => {
    const layer = mkLayer();
    set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id }));
  },
  deleteLayer: (id) => {
    const { layers, activeLayerId } = get();
    if (layers.length <= 1) return;
    const filtered = layers.filter((l) => l.id !== id);
    const newActive = activeLayerId === id ? filtered[filtered.length - 1].id : activeLayerId;
    set({ layers: filtered, activeLayerId: newActive });
  },
  updateLayer: (id, patch) => {
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },
  reorderLayers: (fromIdx, toIdx) => {
    const { layers } = get();
    const arr = [...layers];
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    set({ layers: arr });
  },

  canvasWidth: 1280,
  canvasHeight: 720,
  setCanvasSize: (w, h) => set({ canvasWidth: w, canvasHeight: h }),
  canvasBg: 'white',
  setCanvasBg: (bg) => set({ canvasBg: bg }),
  zoom: 1,
  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(10, z)) }),
  pan: { x: 0, y: 0 },
  setPan: (p) => set({ pan: p }),

  history: [],
  historyIndex: -1,
  pushHistory: (dataUrl) => {
    const { history, historyIndex } = get();
    const sliced = history.slice(0, historyIndex + 1);
    const next = [...sliced, dataUrl].slice(-50); // max 50 steps
    set({ history: next, historyIndex: next.length - 1 });
  },
  undo: () => {
    const { historyIndex } = get();
    if (historyIndex > 0) set({ historyIndex: historyIndex - 1 });
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) set({ historyIndex: historyIndex + 1 });
  },

  fontSize: 18,
  setFontSize: (s) => set({ fontSize: s }),
  fontFamily: 'Inter',
  setFontFamily: (f) => set({ fontFamily: f }),
  textBold: false,
  setTextBold: (b) => set({ textBold: b }),
  textItalic: false,
  setTextItalic: (i) => set({ textItalic: i }),

  showGrid: false,
  setShowGrid: (v) => set({ showGrid: v }),
  snapToGrid: false,
  setSnapToGrid: (v) => set({ snapToGrid: v }),
}));
