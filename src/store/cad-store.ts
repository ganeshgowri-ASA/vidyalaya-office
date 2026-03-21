'use client';
import { create } from 'zustand';

/* ── CAD Layer System ── */
export interface CADLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  order: number;
}

/* ── Dimension / Measurement Types ── */
export type DimensionType = 'linear' | 'angular' | 'radius' | 'diameter' | 'area';

export interface Dimension {
  id: string;
  type: DimensionType;
  /** IDs of shapes this dimension references */
  shapeIds: string[];
  /** Start point in canvas coords */
  start: { x: number; y: number };
  /** End point in canvas coords */
  end: { x: number; y: number };
  /** Offset distance for the dimension line from the measured edge */
  offset: number;
  /** Computed value (px, degrees, etc.) */
  value: number;
  /** Display unit */
  unit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  /** Display precision (decimal places) */
  precision: number;
  /** User override label (empty = auto) */
  label: string;
  color: string;
  fontSize: number;
  layerId: string;
  visible: boolean;
}

/* ── Measurement Tool State ── */
export type MeasureTool = 'none' | 'linear' | 'angular' | 'radius' | 'area' | 'ruler';

export interface RulerMeasurement {
  start: { x: number; y: number };
  end: { x: number; y: number };
  distance: number;
}

/* ── Export Formats ── */
export type ExportFormat = 'svg' | 'png' | 'pdf' | 'dxf';

export interface ExportSettings {
  format: ExportFormat;
  scale: number;
  dpi: number;
  includeGrid: boolean;
  includeDimensions: boolean;
  layerIds: string[]; // which layers to export
  paperSize: 'A4' | 'A3' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
}

/* ── Visual History ── */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  /** Thumbnail data URL (small) */
  thumbnail: string;
}

/* ── Professional Color ── */
export interface SavedColor {
  hex: string;
  name: string;
}

export interface CADState {
  /* Layers */
  layers: CADLayer[];
  activeLayerId: string;
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<CADLayer>) => void;
  reorderLayer: (id: string, direction: 'up' | 'down') => void;
  setActiveLayerId: (id: string) => void;

  /* Dimensions */
  dimensions: Dimension[];
  addDimension: (dim: Dimension) => void;
  removeDimension: (id: string) => void;
  updateDimension: (id: string, updates: Partial<Dimension>) => void;
  dimensionUnit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  dimensionPrecision: number;
  setDimensionUnit: (u: Dimension['unit']) => void;
  setDimensionPrecision: (p: number) => void;
  showDimensions: boolean;
  setShowDimensions: (v: boolean) => void;

  /* Measurement tool */
  measureTool: MeasureTool;
  setMeasureTool: (t: MeasureTool) => void;
  rulerMeasurement: RulerMeasurement | null;
  setRulerMeasurement: (m: RulerMeasurement | null) => void;

  /* Export */
  exportSettings: ExportSettings;
  setExportSettings: (s: Partial<ExportSettings>) => void;
  showExportPanel: boolean;
  setShowExportPanel: (v: boolean) => void;

  /* Visual History */
  visualHistory: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  showHistoryTimeline: boolean;
  setShowHistoryTimeline: (v: boolean) => void;

  /* Color Picker */
  recentColors: string[];
  savedColors: SavedColor[];
  addRecentColor: (hex: string) => void;
  addSavedColor: (color: SavedColor) => void;
  removeSavedColor: (hex: string) => void;
  showColorPicker: boolean;
  setShowColorPicker: (v: boolean) => void;

  /* PDF-to-CAD */
  showPdfImport: boolean;
  setShowPdfImport: (v: boolean) => void;
  pdfImportScale: number;
  setPdfImportScale: (s: number) => void;
}

let _layerCounter = 0;
const genLayerId = () => `layer_${++_layerCounter}_${Date.now()}`;

const DEFAULT_LAYERS: CADLayer[] = [
  { id: 'layer_default', name: 'Default', visible: true, locked: false, color: '#3b82f6', opacity: 1, order: 0 },
  { id: 'layer_dimensions', name: 'Dimensions', visible: true, locked: false, color: '#f59e0b', opacity: 1, order: 1 },
  { id: 'layer_annotations', name: 'Annotations', visible: true, locked: false, color: '#22c55e', opacity: 1, order: 2 },
];

export const useCADStore = create<CADState>((set, get) => ({
  /* Layers */
  layers: DEFAULT_LAYERS,
  activeLayerId: 'layer_default',

  addLayer: (name) => set(s => {
    const id = genLayerId();
    const order = s.layers.length;
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    return {
      layers: [...s.layers, {
        id, name: name || `Layer ${order + 1}`,
        visible: true, locked: false,
        color: colors[order % colors.length],
        opacity: 1, order,
      }],
      activeLayerId: id,
    };
  }),

  removeLayer: (id) => set(s => {
    if (s.layers.length <= 1) return s;
    const nl = s.layers.filter(l => l.id !== id);
    return {
      layers: nl,
      activeLayerId: s.activeLayerId === id ? nl[0].id : s.activeLayerId,
    };
  }),

  updateLayer: (id, updates) => set(s => ({
    layers: s.layers.map(l => l.id === id ? { ...l, ...updates } : l),
  })),

  reorderLayer: (id, direction) => set(s => {
    const idx = s.layers.findIndex(l => l.id === id);
    if (idx < 0) return s;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= s.layers.length) return s;
    const nl = [...s.layers];
    [nl[idx], nl[newIdx]] = [nl[newIdx], nl[idx]];
    return { layers: nl.map((l, i) => ({ ...l, order: i })) };
  }),

  setActiveLayerId: (id) => set({ activeLayerId: id }),

  /* Dimensions */
  dimensions: [],
  addDimension: (dim) => set(s => ({ dimensions: [...s.dimensions, dim] })),
  removeDimension: (id) => set(s => ({ dimensions: s.dimensions.filter(d => d.id !== id) })),
  updateDimension: (id, updates) => set(s => ({
    dimensions: s.dimensions.map(d => d.id === id ? { ...d, ...updates } : d),
  })),
  dimensionUnit: 'px',
  dimensionPrecision: 1,
  setDimensionUnit: (u) => set({ dimensionUnit: u }),
  setDimensionPrecision: (p) => set({ dimensionPrecision: p }),
  showDimensions: true,
  setShowDimensions: (v) => set({ showDimensions: v }),

  /* Measurement tool */
  measureTool: 'none',
  setMeasureTool: (t) => set({ measureTool: t }),
  rulerMeasurement: null,
  setRulerMeasurement: (m) => set({ rulerMeasurement: m }),

  /* Export */
  exportSettings: {
    format: 'svg',
    scale: 1,
    dpi: 300,
    includeGrid: false,
    includeDimensions: true,
    layerIds: DEFAULT_LAYERS.map(l => l.id),
    paperSize: 'A4',
    orientation: 'landscape',
  },
  setExportSettings: (s) => set(prev => ({
    exportSettings: { ...prev.exportSettings, ...s },
  })),
  showExportPanel: false,
  setShowExportPanel: (v) => set({ showExportPanel: v }),

  /* Visual History */
  visualHistory: [],
  addHistoryEntry: (entry) => set(s => ({
    visualHistory: [...s.visualHistory.slice(-49), entry],
  })),
  clearHistory: () => set({ visualHistory: [] }),
  showHistoryTimeline: false,
  setShowHistoryTimeline: (v) => set({ showHistoryTimeline: v }),

  /* Color Picker */
  recentColors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
  savedColors: [
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#22c55e', name: 'Green' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#8b5cf6', name: 'Violet' },
  ],
  addRecentColor: (hex) => set(s => ({
    recentColors: [hex, ...s.recentColors.filter(c => c !== hex)].slice(0, 20),
  })),
  addSavedColor: (color) => set(s => ({
    savedColors: [...s.savedColors.filter(c => c.hex !== color.hex), color],
  })),
  removeSavedColor: (hex) => set(s => ({
    savedColors: s.savedColors.filter(c => c.hex !== hex),
  })),
  showColorPicker: false,
  setShowColorPicker: (v) => set({ showColorPicker: v }),

  /* PDF-to-CAD */
  showPdfImport: false,
  setShowPdfImport: (v) => set({ showPdfImport: v }),
  pdfImportScale: 1,
  setPdfImportScale: (s) => set({ pdfImportScale: s }),
}));
