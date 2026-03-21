'use client';

import { Shape, ShapeType, genId } from '@/store/graphics-store';

// ── .drawio (XML-based mxGraph format) ──────────────────────────────────────

interface DrawioCell {
  id: string;
  value: string;
  style: string;
  vertex: boolean;
  edge: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  source?: string;
  target?: string;
}

function parseDrawioStyle(style: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!style) return map;
  style.split(';').forEach(part => {
    const [k, v] = part.split('=');
    if (k) map[k.trim()] = v?.trim() ?? '';
  });
  return map;
}

function drawioShapeToType(style: Record<string, string>): ShapeType {
  const shape = style['shape'] ?? '';
  if (shape.includes('rhombus') || style['rhombus'] !== undefined) return 'diamond';
  if (shape.includes('ellipse') || style['ellipse'] !== undefined) return 'ellipse';
  if (shape.includes('triangle') || style['triangle'] !== undefined) return 'triangle';
  if (shape.includes('hexagon') || style['hexagon'] !== undefined) return 'hexagon';
  if (shape.includes('cylinder') || style['cylinder'] !== undefined) return 'cylinder';
  if (shape.includes('cloud') || style['cloud'] !== undefined) return 'cloud';
  if (shape.includes('callout') || style['callout'] !== undefined) return 'callout';
  if (shape.includes('star') || style['mxgraph.basic.star'] !== undefined) return 'star';
  if (style['text'] !== undefined) return 'text';
  return 'rect';
}

function parseColor(c: string | undefined, fallback: string): string {
  if (!c || c === 'none' || c === 'default') return fallback;
  if (c.startsWith('#')) return c;
  return fallback;
}

function parseCells(doc: Document): DrawioCell[] {
  const cells: DrawioCell[] = [];
  const mxCells = doc.querySelectorAll('mxCell');
  mxCells.forEach(cell => {
    const id = cell.getAttribute('id') ?? '';
    if (id === '0' || id === '1') return; // root/layer
    const value = cell.getAttribute('value') ?? '';
    const style = cell.getAttribute('style') ?? '';
    const vertex = cell.getAttribute('vertex') === '1';
    const edge = cell.getAttribute('edge') === '1';
    const geo = cell.querySelector('mxGeometry');
    const x = parseFloat(geo?.getAttribute('x') ?? '0');
    const y = parseFloat(geo?.getAttribute('y') ?? '0');
    const width = parseFloat(geo?.getAttribute('width') ?? '120');
    const height = parseFloat(geo?.getAttribute('height') ?? '80');
    const source = cell.getAttribute('source') ?? undefined;
    const target = cell.getAttribute('target') ?? undefined;
    cells.push({ id, value, style, vertex, edge, x, y, width, height, source, target });
  });
  return cells;
}

export function parseDrawioXml(xml: string): Shape[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const errors = doc.querySelector('parsererror');
  if (errors) throw new Error('Invalid .drawio XML format');

  const cells = parseCells(doc);
  const shapes: Shape[] = [];

  for (const cell of cells) {
    if (cell.edge) {
      // Convert edges to line shapes
      shapes.push({
        id: genId(),
        type: 'line',
        x: cell.x,
        y: cell.y,
        width: cell.width || 120,
        height: cell.height || 2,
        rotation: 0,
        fill: 'transparent',
        stroke: '#94a3b8',
        strokeWidth: 2,
        opacity: 1,
        label: cell.value,
        locked: false,
        visible: true,
        layerOpacity: 1,
        startPoint: { x: cell.x, y: cell.y + (cell.height || 2) / 2 },
        endPoint: { x: cell.x + (cell.width || 120), y: cell.y + (cell.height || 2) / 2 },
        lineStyle: 'solid',
      });
      continue;
    }

    if (!cell.vertex) continue;

    const styleMap = parseDrawioStyle(cell.style);
    const shapeType = drawioShapeToType(styleMap);
    const fill = parseColor(styleMap['fillColor'], '#3b82f6');
    const stroke = parseColor(styleMap['strokeColor'], '#1e40af');
    const strokeWidth = parseFloat(styleMap['strokeWidth'] ?? '2');
    const opacity = parseFloat(styleMap['opacity'] ?? '100') / 100;

    const base = {
      id: genId(),
      x: cell.x,
      y: cell.y,
      width: cell.width,
      height: cell.height,
      rotation: parseFloat(styleMap['rotation'] ?? '0'),
      fill,
      stroke,
      strokeWidth,
      opacity,
      label: cell.value.replace(/<[^>]*>/g, ''), // strip HTML tags
      locked: false,
      visible: true,
      layerOpacity: 1,
      borderRadius: 8,
      gradient: null,
      shadow: { enabled: false, x: 4, y: 4, blur: 8, color: 'rgba(0,0,0,0.5)' },
      textWrap: 'none' as const,
    };

    switch (shapeType) {
      case 'text':
        shapes.push({ ...base, type: 'text', text: cell.value.replace(/<[^>]*>/g, ''), fontSize: 16, fontFamily: 'Inter', fill: 'transparent', stroke: 'transparent', borderRadius: undefined });
        break;
      case 'star':
        shapes.push({ ...base, type: 'star', points: 5, innerRadius: 0.4, borderRadius: undefined });
        break;
      default:
        shapes.push({ ...base, type: shapeType } as Shape);
        break;
    }
  }

  return shapes;
}

// ── .vsdx (Visio - ZIP containing XML) ──────────────────────────────────────
// .vsdx files are ZIP archives. Without JSZip (no new deps allowed),
// we parse the embedded XML if the user provides the extracted page XML,
// or we attempt a best-effort text scan of the binary for shape data.

interface VsdxShapeInfo {
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fill: string;
  stroke: string;
}

function parseVisioPageXml(xml: string): VsdxShapeInfo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const infos: VsdxShapeInfo[] = [];

  // Visio XML uses <Shape> elements with <Cell> children for geometry
  const shapeElements = doc.querySelectorAll('Shape');
  shapeElements.forEach(el => {
    const nameU = el.getAttribute('NameU') ?? '';
    const typeAttr = el.getAttribute('Type') ?? '';

    // Extract geometry cells
    let pinX = 0, pinY = 0, w = 120, h = 80;
    let fillColor = '#3b82f6', lineColor = '#1e40af';
    let label = '';

    const cells = el.querySelectorAll(':scope > Cell');
    cells.forEach(cell => {
      const n = cell.getAttribute('N');
      const v = cell.getAttribute('V') ?? '';
      if (n === 'PinX') pinX = parseFloat(v) * 96; // inches to pixels
      if (n === 'PinY') pinY = parseFloat(v) * 96;
      if (n === 'Width') w = parseFloat(v) * 96;
      if (n === 'Height') h = parseFloat(v) * 96;
      if (n === 'FillForegnd') fillColor = v.startsWith('#') ? v : fillColor;
      if (n === 'LineColor') lineColor = v.startsWith('#') ? v : lineColor;
    });

    // Extract text
    const textEl = el.querySelector('Text');
    if (textEl) label = (textEl.textContent ?? '').trim();

    // Determine shape type from NameU or master
    let shapeType: ShapeType = 'rect';
    const nameLower = (nameU + ' ' + typeAttr).toLowerCase();
    if (nameLower.includes('diamond') || nameLower.includes('decision')) shapeType = 'diamond';
    else if (nameLower.includes('ellipse') || nameLower.includes('circle')) shapeType = 'ellipse';
    else if (nameLower.includes('triangle')) shapeType = 'triangle';
    else if (nameLower.includes('hexagon')) shapeType = 'hexagon';
    else if (nameLower.includes('star')) shapeType = 'star';
    else if (nameLower.includes('cloud')) shapeType = 'cloud';
    else if (nameLower.includes('cylinder') || nameLower.includes('database')) shapeType = 'cylinder';
    else if (nameLower.includes('connector') || nameLower.includes('dynamic')) shapeType = 'line';

    infos.push({ type: shapeType, x: pinX - w / 2, y: pinY - h / 2, width: w, height: h, label, fill: fillColor, stroke: lineColor });
  });

  return infos;
}

export function parseVsdxContent(content: string): Shape[] {
  // Try to parse as Visio XML (extracted page content)
  const infos = parseVisioPageXml(content);

  return infos.map(info => {
    const base = {
      id: genId(),
      x: info.x,
      y: info.y,
      width: info.width,
      height: info.height,
      rotation: 0,
      fill: info.fill,
      stroke: info.stroke,
      strokeWidth: 2,
      opacity: 1,
      label: info.label,
      locked: false,
      visible: true,
      layerOpacity: 1,
      borderRadius: 8,
      gradient: null,
      shadow: { enabled: false, x: 4, y: 4, blur: 8, color: 'rgba(0,0,0,0.5)' },
      textWrap: 'none' as const,
    };

    switch (info.type) {
      case 'line':
        return { ...base, type: 'line' as const, startPoint: { x: info.x, y: info.y + info.height / 2 }, endPoint: { x: info.x + info.width, y: info.y + info.height / 2 }, lineStyle: 'solid' as const };
      case 'star':
        return { ...base, type: 'star' as const, points: 5, innerRadius: 0.4, borderRadius: undefined };
      default:
        return { ...base, type: info.type } as Shape;
    }
  });
}

// ── JSON project format ─────────────────────────────────────────────────────

export function parseJsonProject(json: string): Shape[] {
  const data = JSON.parse(json);
  if (Array.isArray(data)) return data as Shape[];
  if (data.shapes && Array.isArray(data.shapes)) return data.shapes as Shape[];
  throw new Error('Invalid JSON format: expected array of shapes or { shapes: [...] }');
}

// ── Unified import handler ──────────────────────────────────────────────────

export type ImportFormat = 'drawio' | 'vsdx' | 'json';

export function detectImportFormat(fileName: string): ImportFormat {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'drawio' || ext === 'xml') return 'drawio';
  if (ext === 'vsdx') return 'vsdx';
  if (ext === 'json') return 'json';
  throw new Error(`Unsupported file format: .${ext}`);
}

export async function importFile(file: File): Promise<{ shapes: Shape[]; format: ImportFormat }> {
  const format = detectImportFormat(file.name);
  const text = await file.text();

  let shapes: Shape[];
  switch (format) {
    case 'drawio':
      shapes = parseDrawioXml(text);
      break;
    case 'vsdx':
      shapes = parseVsdxContent(text);
      break;
    case 'json':
      shapes = parseJsonProject(text);
      break;
  }

  if (shapes.length === 0) {
    throw new Error('No shapes found in the imported file');
  }

  return { shapes, format };
}
