'use client';

import { Shape } from '@/store/graphics-store';

// ── Types ───────────────────────────────────────────────────────────────────

export type ExportFormat = 'svg' | 'png' | 'pdf' | 'json' | 'drawio';

export interface ExportOptions {
  format: ExportFormat;
  dpi: number; // 72, 150, 300, 600
  quality: number; // 0-1, for PNG
  background: string; // background color
  transparent: boolean;
  includeGrid: boolean;
  padding: number; // px padding around content
  fileName: string;
  pageWidth: number;
  pageHeight: number;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  dpi: 150,
  quality: 0.92,
  background: '#0f172a',
  transparent: false,
  includeGrid: false,
  padding: 40,
  fileName: 'diagram',
  pageWidth: 1920,
  pageHeight: 1080,
};

export const DPI_PRESETS = [
  { label: 'Screen (72 DPI)', value: 72 },
  { label: 'Medium (150 DPI)', value: 150 },
  { label: 'Print (300 DPI)', value: 300 },
  { label: 'High-Res (600 DPI)', value: 600 },
];

// ── SVG Export ──────────────────────────────────────────────────────────────

function getSvgElement(): SVGSVGElement | null {
  return document.querySelector('svg.graphics-export') as SVGSVGElement | null;
}

function cloneSvgForExport(opts: ExportOptions): SVGSVGElement | null {
  const original = getSvgElement();
  if (!original) return null;

  const clone = original.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(opts.pageWidth));
  clone.setAttribute('height', String(opts.pageHeight));
  clone.setAttribute('viewBox', `0 0 ${opts.pageWidth} ${opts.pageHeight}`);

  // Remove grid if not wanted
  if (!opts.includeGrid) {
    const gridEls = clone.querySelectorAll('[data-grid]');
    gridEls.forEach(el => el.remove());
  }

  // Remove selection handles and UI elements
  const uiEls = clone.querySelectorAll('[data-ui], [data-selection], [data-handle]');
  uiEls.forEach(el => el.remove());

  return clone;
}

export function exportSvg(opts: ExportOptions): void {
  const svg = cloneSvgForExport(opts);
  if (!svg) {
    // Fallback: grab any SVG on the page
    const fallback = document.querySelector('svg') as SVGSVGElement | null;
    if (!fallback) return;
    const data = new XMLSerializer().serializeToString(fallback);
    downloadBlob(new Blob([data], { type: 'image/svg+xml' }), `${opts.fileName}.svg`);
    return;
  }

  const data = new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([data], { type: 'image/svg+xml' }), `${opts.fileName}.svg`);
}

// ── PNG Export with custom DPI ──────────────────────────────────────────────

export function exportPng(opts: ExportOptions): Promise<void> {
  return new Promise((resolve) => {
    const svgEl = document.querySelector('svg.graphics-export') as SVGSVGElement
      ?? document.querySelector('svg') as SVGSVGElement;
    if (!svgEl) { resolve(); return; }

    const scale = opts.dpi / 72; // scale factor relative to screen DPI
    const w = opts.pageWidth * scale;
    const h = opts.pageHeight * scale;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Background
    if (!opts.transparent) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, w, h);
    }

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);

      // Embed DPI metadata via pHYs chunk is not possible with toDataURL,
      // but we set the canvas size to match the target DPI
      canvas.toBlob(
        (blob) => {
          if (blob) downloadBlob(blob, `${opts.fileName}.png`);
          resolve();
        },
        'image/png',
        opts.quality
      );
    };
    img.onerror = () => resolve();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });
}

// ── PDF Export using pdf-lib ────────────────────────────────────────────────

export async function exportPdf(opts: ExportOptions): Promise<void> {
  // Dynamically import pdf-lib (already in package.json)
  const { PDFDocument, rgb } = await import('pdf-lib');

  const svgEl = document.querySelector('svg.graphics-export') as SVGSVGElement
    ?? document.querySelector('svg') as SVGSVGElement;
  if (!svgEl) return;

  const scale = opts.dpi / 72;
  const w = opts.pageWidth * scale;
  const h = opts.pageHeight * scale;

  // Render SVG to canvas to get PNG data
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!opts.transparent) {
        ctx.fillStyle = opts.background;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });

  const pngData = await new Promise<Uint8Array>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (blob) {
        const buf = await blob.arrayBuffer();
        resolve(new Uint8Array(buf));
      } else {
        resolve(new Uint8Array());
      }
    }, 'image/png');
  });

  if (pngData.length === 0) return;

  const pdfDoc = await PDFDocument.create();
  // PDF points = pixels at 72 DPI
  const pageWidth = opts.pageWidth;
  const pageHeight = opts.pageHeight;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Background
  if (!opts.transparent) {
    const hex = opts.background.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(r, g, b) });
  }

  const pngImage = await pdfDoc.embedPng(pngData);
  page.drawImage(pngImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });

  const pdfBytes = await pdfDoc.save();
  downloadBlob(new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${opts.fileName}.pdf`);
}

// ── JSON Export ─────────────────────────────────────────────────────────────

export function exportJson(shapes: Shape[], opts: ExportOptions): void {
  const data = JSON.stringify({
    version: '1.0',
    format: 'vidyalaya-graphics',
    exportedAt: new Date().toISOString(),
    canvas: { width: opts.pageWidth, height: opts.pageHeight },
    shapes,
  }, null, 2);
  downloadBlob(new Blob([data], { type: 'application/json' }), `${opts.fileName}.json`);
}

// ── .drawio Export ──────────────────────────────────────────────────────────

function shapeToDrawioStyle(shape: Shape): string {
  const parts: string[] = [];

  switch (shape.type) {
    case 'ellipse': parts.push('ellipse'); break;
    case 'diamond': parts.push('rhombus'); break;
    case 'triangle': parts.push('triangle'); break;
    case 'hexagon': parts.push('shape=hexagon'); break;
    case 'cloud': parts.push('shape=cloud'); break;
    case 'cylinder': parts.push('shape=cylinder3'); break;
    case 'star': parts.push('shape=mxgraph.basic.star'); break;
    case 'text': parts.push('text'); break;
    default: parts.push('rounded=1'); break;
  }

  parts.push(`fillColor=${shape.fill}`);
  parts.push(`strokeColor=${shape.stroke}`);
  parts.push(`strokeWidth=${shape.strokeWidth}`);
  parts.push(`opacity=${Math.round(shape.opacity * 100)}`);
  if (shape.rotation) parts.push(`rotation=${shape.rotation}`);

  return parts.join(';') + ';';
}

export function exportDrawio(shapes: Shape[], opts: ExportOptions): void {
  let cellId = 2;
  const cells = shapes.map(s => {
    const id = cellId++;
    const isEdge = s.type === 'line' || s.type === 'arrow';
    const style = shapeToDrawioStyle(s);
    const label = s.label || ('text' in s ? (s as { text?: string }).text ?? '' : '');

    if (isEdge) {
      return `      <mxCell id="${id}" value="${escapeXml(label)}" style="${style}" edge="1" parent="1">
        <mxGeometry relative="1" as="geometry">
          <mxPoint x="${s.x}" y="${s.y}" as="sourcePoint"/>
          <mxPoint x="${s.x + s.width}" y="${s.y + s.height}" as="targetPoint"/>
        </mxGeometry>
      </mxCell>`;
    }

    return `      <mxCell id="${id}" value="${escapeXml(label)}" style="${style}" vertex="1" parent="1">
        <mxGeometry x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" as="geometry"/>
      </mxCell>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <diagram name="Page-1">
    <mxGraphModel dx="${opts.pageWidth}" dy="${opts.pageHeight}" grid="1" gridSize="10" guides="1">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  downloadBlob(new Blob([xml], { type: 'application/xml' }), `${opts.fileName}.drawio`);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Batch Export (all formats at once) ──────────────────────────────────────

export async function batchExport(
  shapes: Shape[],
  opts: ExportOptions,
  formats: ExportFormat[]
): Promise<void> {
  for (const format of formats) {
    const batchOpts = { ...opts, format, fileName: `${opts.fileName}_${format}` };
    switch (format) {
      case 'svg': exportSvg(batchOpts); break;
      case 'png': await exportPng(batchOpts); break;
      case 'pdf': await exportPdf(batchOpts); break;
      case 'json': exportJson(shapes, batchOpts); break;
      case 'drawio': exportDrawio(shapes, batchOpts); break;
    }
  }
}

// ── Utility ─────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
