'use client';

import React, { useState, useCallback } from 'react';
import { X, FileText, Image, File, Download } from 'lucide-react';
import { usePresentationStore, type Slide, type SlideElement } from '@/store/presentation-store';

type ExportFormat = 'pdf' | 'png' | 'pptx-json' | 'json';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'pdf',
    label: 'Export as PDF',
    description: 'Uses the browser print dialog with the existing print-view layout',
    icon: <FileText size={20} />,
  },
  {
    format: 'png',
    label: 'Export as Images (PNG)',
    description: 'Downloads each slide as an individual PNG image (960×540)',
    icon: <Image size={20} />,
  },
  {
    format: 'pptx-json',
    label: 'Export as PPTX (JSON)',
    description: 'Serializes slides to a JSON structure and downloads as .pptx.json',
    icon: <File size={20} />,
  },
  {
    format: 'json',
    label: 'Export Slide Data',
    description: 'Downloads raw JSON of all slide data for backup or import',
    icon: <Download size={20} />,
  },
];

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderSlideToCanvas(
  slide: Slide,
  canvas: HTMLCanvasElement,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Fill background
  const bg = slide.background || '#ffffff';
  if (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient')) {
    // For CSS gradients, approximate with the first color or use white
    const colorMatch = bg.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/);
    ctx.fillStyle = colorMatch ? colorMatch[0] : '#ffffff';
  } else {
    ctx.fillStyle = bg;
  }
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render text elements
  for (const el of slide.elements) {
    if (el.type === 'text' && el.content) {
      const fontSize = el.style.fontSize || 16;
      const fontWeight = el.style.fontWeight || 'normal';
      const fontFamily = el.style.fontFamily || 'sans-serif';
      const color = el.style.color || '#000000';
      const textAlign = (el.style.textAlign as CanvasTextAlign) || 'left';

      ctx.save();
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'top';

      // Strip basic HTML tags for plain text rendering
      const plainText = el.content.replace(/<[^>]*>/g, '');

      // Word-wrap text within element bounds
      const lines = wrapText(ctx, plainText, el.width);
      const lineHeight = (el.style.lineHeight || 1.4) * fontSize;

      let textX = el.x;
      if (textAlign === 'center') textX = el.x + el.width / 2;
      else if (textAlign === 'right') textX = el.x + el.width;

      for (let i = 0; i < lines.length; i++) {
        const yPos = el.y + i * lineHeight;
        if (yPos > el.y + el.height) break;
        ctx.fillText(lines[i], textX, yPos);
      }
      ctx.restore();
    } else if (el.type === 'shape') {
      ctx.save();
      ctx.fillStyle = el.style.backgroundColor || el.style.color || '#4f46e5';
      ctx.globalAlpha = el.style.opacity ?? 1;
      const r = parseInt(el.style.borderRadius || '0', 10);
      if (r > 0) {
        roundRect(ctx, el.x, el.y, el.width, el.height, r);
        ctx.fill();
      } else {
        ctx.fillRect(el.x, el.y, el.width, el.height);
      }
      ctx.restore();
    }
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function ExportPanel() {
  const { slides, showExportPanel, setShowExportPanel } = usePresentationStore();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);

  const close = useCallback(() => {
    setShowExportPanel(false);
    setExporting(false);
    setProgress(0);
    setActiveFormat(null);
  }, [setShowExportPanel]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setActiveFormat(format);
      setExporting(true);
      setProgress(0);

      try {
        switch (format) {
          case 'pdf': {
            setProgress(100);
            window.print();
            break;
          }

          case 'png': {
            const canvas = document.createElement('canvas');
            for (let i = 0; i < slides.length; i++) {
              renderSlideToCanvas(slides[i], canvas);
              setProgress(Math.round(((i + 1) / slides.length) * 100));

              await new Promise<void>((resolve) => {
                canvas.toBlob((blob) => {
                  if (blob) {
                    const filename = `slide-${String(i + 1).padStart(2, '0')}.png`;
                    triggerDownload(blob, filename);
                  }
                  resolve();
                }, 'image/png');
              });

              // Small delay between downloads so the browser doesn't block them
              if (i < slides.length - 1) {
                await new Promise((r) => setTimeout(r, 300));
              }
            }
            break;
          }

          case 'pptx-json': {
            setProgress(50);
            const pptxData = {
              format: 'pptx-json',
              version: '1.0',
              createdAt: new Date().toISOString(),
              slideCount: slides.length,
              slides: slides.map((slide, idx) => ({
                index: idx,
                id: slide.id,
                layout: slide.layout,
                background: slide.background,
                transition: slide.transition || 'none',
                transitionDuration: slide.transitionDuration || 500,
                notes: slide.notes,
                hidden: slide.hidden || false,
                elements: slide.elements.map((el) => ({
                  id: el.id,
                  type: el.type,
                  x: el.x,
                  y: el.y,
                  width: el.width,
                  height: el.height,
                  content: el.content,
                  rotation: el.rotation || 0,
                  style: el.style,
                  tableData: el.tableData,
                  chartData: el.chartData,
                  textEffect: el.textEffect,
                  mediaData: el.mediaData,
                  animation: el.animation,
                })),
              })),
            };
            const json = JSON.stringify(pptxData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            triggerDownload(blob, 'presentation.pptx.json');
            setProgress(100);
            break;
          }

          case 'json': {
            setProgress(50);
            const data = JSON.stringify(slides, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            triggerDownload(blob, 'slide-data.json');
            setProgress(100);
            break;
          }
        }
      } catch (err) {
        console.error('Export failed:', err);
      } finally {
        // Keep the progress visible briefly before resetting
        setTimeout(() => {
          setExporting(false);
          setProgress(0);
          setActiveFormat(null);
        }, 1200);
      }
    },
    [slides],
  );

  if (!showExportPanel) return null;

  const textElementCount = slides.reduce(
    (sum, s) => sum + s.elements.filter((e) => e.type === 'text').length,
    0,
  );
  const imageElementCount = slides.reduce(
    (sum, s) => sum + s.elements.filter((e) => e.type === 'image' || e.type === 'media').length,
    0,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg rounded-xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg, #1e1e2e)',
          borderColor: 'var(--color-border, #333)',
          color: 'var(--color-text, #e0e0e0)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--color-border, #333)' }}>
          <div className="flex items-center gap-2">
            <Download size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold">Export Presentation</h2>
          </div>
          <button
            onClick={close}
            className="rounded p-1 transition-colors hover:bg-white/10"
            aria-label="Close export panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide info */}
        <div className="border-b px-5 py-3 text-sm" style={{ borderColor: 'var(--color-border, #333)' }}>
          <div className="flex items-center gap-4 opacity-80">
            <span>{slides.length} slide{slides.length !== 1 ? 's' : ''}</span>
            <span className="text-xs">•</span>
            <span>{textElementCount} text element{textElementCount !== 1 ? 's' : ''}</span>
            <span className="text-xs">•</span>
            <span>{imageElementCount} media element{imageElementCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Progress bar */}
        {exporting && (
          <div className="px-5 pt-3">
            <div className="flex items-center justify-between text-xs mb-1 opacity-70">
              <span>
                Exporting{activeFormat ? ` (${EXPORT_OPTIONS.find((o) => o.format === activeFormat)?.label})` : ''}...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export options */}
        <div className="space-y-2 px-5 py-4">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={exporting}
              className="flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--color-border, #333)' }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                {option.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs opacity-60 truncate">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 text-xs opacity-50 text-center" style={{ borderColor: 'var(--color-border, #333)' }}>
          PNG exports render text and shapes only. For full fidelity, use PDF export.
        </div>
      </div>
    </div>
  );
}
