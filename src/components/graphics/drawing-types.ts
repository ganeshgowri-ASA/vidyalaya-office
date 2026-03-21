// Shared types and constants for the Drawing Canvas module

export type DrawTool =
  | 'select' | 'marquee' | 'lasso'
  | 'pencil' | 'pen' | 'brush' | 'eraser'
  | 'line' | 'arrow' | 'bezier' | 'polygon'
  | 'text' | 'text-path'
  | 'eyedropper'
  | 'hand' | 'zoom';

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'pattern';

export interface Point { x: number; y: number; }

export interface GradientStop { offset: number; color: string; }

export interface DrawLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  canvas?: HTMLCanvasElement;
}

export interface BezierPoint {
  x: number; y: number;
  cp1x: number; cp1y: number;
  cp2x: number; cp2y: number;
}

export interface HistoryEntry {
  thumbnail: string; // small data URL
  label: string;
}

export interface TextEffect {
  style: 'normal' | 'shadow' | 'outline' | 'glow' | 'gradient' | '3d';
  shadowColor: string;
  shadowBlur: number;
  outlineColor: string;
  outlineWidth: number;
}

export const CANVAS_PRESETS = [
  { label: 'HD 720p', w: 1280, h: 720 },
  { label: 'Full HD 1080p', w: 1920, h: 1080 },
  { label: '4K', w: 3840, h: 2160 },
  { label: 'Square 1:1', w: 1080, h: 1080 },
  { label: 'A4 Portrait', w: 794, h: 1123 },
  { label: 'A4 Landscape', w: 1123, h: 794 },
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'Twitter Banner', w: 1500, h: 500 },
  { label: 'Presentation 16:9', w: 1920, h: 1080 },
];

export const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay',
  'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion',
];

export const FONT_FAMILIES = [
  'Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'Courier New', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
];

export const PATTERN_FILLS = [
  { label: 'Dots', id: 'dots' },
  { label: 'Lines', id: 'lines' },
  { label: 'Crosshatch', id: 'crosshatch' },
  { label: 'Zigzag', id: 'zigzag' },
  { label: 'Checkerboard', id: 'checkerboard' },
];

export const WORDART_STYLES = [
  { label: 'Shadow', style: 'shadow' as const },
  { label: 'Outline', style: 'outline' as const },
  { label: 'Glow', style: 'glow' as const },
  { label: 'Gradient', style: 'gradient' as const },
  { label: '3D', style: '3d' as const },
];

export function makePatternCanvas(patternId: string, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 20; c.height = 20;
  const ctx = c.getContext('2d')!;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  switch (patternId) {
    case 'dots':
      ctx.beginPath(); ctx.arc(5, 5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(15, 15, 2, 0, Math.PI * 2); ctx.fill();
      break;
    case 'lines':
      for (let i = 0; i < 20; i += 5) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(20, i); ctx.stroke(); }
      break;
    case 'crosshatch':
      for (let i = 0; i < 20; i += 5) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(20, i); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 20); ctx.stroke();
      }
      break;
    case 'zigzag':
      ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(5, 0); ctx.lineTo(10, 10); ctx.lineTo(15, 0); ctx.lineTo(20, 10); ctx.stroke();
      break;
    case 'checkerboard':
      ctx.fillRect(0, 0, 10, 10); ctx.fillRect(10, 10, 10, 10);
      break;
  }
  return c;
}
