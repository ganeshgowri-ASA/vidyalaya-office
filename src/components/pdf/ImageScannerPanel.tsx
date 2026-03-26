'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Trash2, ChevronUp, ChevronDown, GripVertical,
  Sun, Contrast, Palette, Maximize2, FileDown, Image,
  RotateCw, ZoomIn, X, Check, Eye,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScanPage {
  id: string;
  file: File;
  originalUrl: string;
  enhancedUrl: string | null;
  thumbnail: string;
  filter: 'none' | 'auto-enhance' | 'grayscale' | 'bw';
  perspectivePoints: [Point, Point, Point, Point] | null;
  rotation: number;
}

interface Point {
  x: number;
  y: number;
}

type PageSize = 'a4' | 'letter' | 'legal' | 'auto';

const PAGE_SIZES: { id: PageSize; label: string; width: number; height: number }[] = [
  { id: 'auto', label: 'Auto-fit', width: 0, height: 0 },
  { id: 'a4', label: 'A4', width: 595.28, height: 841.89 },
  { id: 'letter', label: 'Letter', width: 612, height: 792 },
  { id: 'legal', label: 'Legal', width: 612, height: 1008 },
];

let scanPageCounter = 0;

// ─── Image Processing Utilities ─────────────────────────────────────────────

function applyCanvasFilter(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  filter: ScanPage['filter']
): void {
  if (filter === 'none') return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (filter === 'auto-enhance') {
    // Increase contrast by 40%, slight brightness boost
    const contrastFactor = 1.4;
    const brightnessBias = 10;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastFactor) + 128 + brightnessBias));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrastFactor) + 128 + brightnessBias));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrastFactor) + 128 + brightnessBias));
    }
    ctx.putImageData(imageData, 0, 0);

    // Simple sharpen via convolution (3x3 kernel)
    const sharpened = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const src = new Uint8ClampedArray(data);
    const w = canvas.width;
    const kernel = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0];
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let val = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              val += src[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          sharpened.data[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(sharpened, 0, 0);
  } else if (filter === 'grayscale') {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
  } else if (filter === 'bw') {
    // Adaptive threshold-like black & white
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const bw = gray > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = bw;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

function applyPerspectiveTransform(
  srcCanvas: HTMLCanvasElement,
  points: [Point, Point, Point, Point],
  destWidth: number,
  destHeight: number
): HTMLCanvasElement {
  const destCanvas = document.createElement('canvas');
  destCanvas.width = destWidth;
  destCanvas.height = destHeight;
  const destCtx = destCanvas.getContext('2d')!;

  const srcCtx = srcCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const destData = destCtx.createImageData(destWidth, destHeight);

  // Bilinear interpolation from quadrilateral to rectangle
  const [tl, tr, br, bl] = points;

  for (let dy = 0; dy < destHeight; dy++) {
    for (let dx = 0; dx < destWidth; dx++) {
      const u = dx / destWidth;
      const v = dy / destHeight;

      // Bilinear mapping from (u,v) in [0,1]x[0,1] to source coordinates
      const sx =
        (1 - u) * (1 - v) * tl.x +
        u * (1 - v) * tr.x +
        u * v * br.x +
        (1 - u) * v * bl.x;
      const sy =
        (1 - u) * (1 - v) * tl.y +
        u * (1 - v) * tr.y +
        u * v * br.y +
        (1 - u) * v * bl.y;

      const ix = Math.round(sx);
      const iy = Math.round(sy);

      if (ix >= 0 && ix < srcCanvas.width && iy >= 0 && iy < srcCanvas.height) {
        const srcIdx = (iy * srcCanvas.width + ix) * 4;
        const destIdx = (dy * destWidth + dx) * 4;
        destData.data[destIdx] = srcData.data[srcIdx];
        destData.data[destIdx + 1] = srcData.data[srcIdx + 1];
        destData.data[destIdx + 2] = srcData.data[srcIdx + 2];
        destData.data[destIdx + 3] = srcData.data[srcIdx + 3];
      }
    }
  }

  destCtx.putImageData(destData, 0, 0);
  return destCanvas;
}

async function processImage(page: ScanPage): Promise<Blob> {
  const img = await createImageBitmap(page.file);
  let canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  // Apply perspective correction if points are set
  if (page.perspectivePoints) {
    const pts = page.perspectivePoints;
    // Scale points from display to actual image coordinates
    canvas = applyPerspectiveTransform(canvas, pts, img.width, img.height);
    ctx = canvas.getContext('2d')!;
  }

  // Apply rotation
  if (page.rotation !== 0) {
    const rotCanvas = document.createElement('canvas');
    const rad = (page.rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    rotCanvas.width = Math.round(canvas.width * cos + canvas.height * sin);
    rotCanvas.height = Math.round(canvas.width * sin + canvas.height * cos);
    const rotCtx = rotCanvas.getContext('2d')!;
    rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rotCtx.rotate(rad);
    rotCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    canvas = rotCanvas;
    ctx = rotCtx;
  }

  // Apply filter
  ctx = canvas.getContext('2d')!;
  applyCanvasFilter(canvas, ctx, page.filter);

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png')
  );
}

async function generateThumbnail(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const maxDim = 160;
  const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

// ─── Perspective Correction Modal ───────────────────────────────────────────

function PerspectiveCorrectionModal({
  page,
  onApply,
  onCancel,
}: {
  page: ScanPage;
  onApply: (points: [Point, Point, Point, Point]) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>(
    page.perspectivePoints || []
  );
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new window.Image();
    img.onload = () => {
      const maxW = 500;
      const maxH = 500;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      setDisplayScale(scale);
      setImgSize({ w: img.width, h: img.height });
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Initialize corners if no points
      if (points.length === 0) {
        const margin = 20;
        setPoints([
          { x: margin, y: margin },
          { x: img.width - margin, y: margin },
          { x: img.width - margin, y: img.height - margin },
          { x: margin, y: img.height - margin },
        ]);
      }
    };
    img.src = page.originalUrl;
  }, [page.originalUrl]);

  // Redraw overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d')!;
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (points.length > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const scaledPts = points.map((p) => ({ x: p.x * displayScale, y: p.y * displayScale }));
        ctx.moveTo(scaledPts[0].x, scaledPts[0].y);
        for (let i = 1; i < scaledPts.length; i++) {
          ctx.lineTo(scaledPts[i].x, scaledPts[i].y);
        }
        if (scaledPts.length === 4) ctx.closePath();
        ctx.stroke();

        // Draw corner handles
        for (const pt of scaledPts) {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    };
    img.src = page.originalUrl;
  }, [points, imgSize, displayScale, page.originalUrl]);

  const [dragging, setDragging] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Find closest point
    for (let i = 0; i < points.length; i++) {
      const px = points[i].x * displayScale;
      const py = points[i].y * displayScale;
      if (Math.hypot(cx - px, cy - py) < 16) {
        setDragging(i);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setPoints((prev) =>
      prev.map((p, i) =>
        i === dragging
          ? {
              x: Math.max(0, Math.min(imgSize.w, cx / displayScale)),
              y: Math.max(0, Math.min(imgSize.h, cy / displayScale)),
            }
          : p
      )
    );
  };

  const handlePointerUp = () => setDragging(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-4 max-w-[560px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Perspective Correction</h3>
          <button onClick={onCancel} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X size={16} />
          </button>
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)] mb-2">
          Drag the 4 corners to match the document edges, then click Apply.
        </p>
        <canvas
          ref={canvasRef}
          className="border border-[var(--border)] rounded cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs hover:opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (points.length === 4) {
                onApply(points as [Point, Point, Point, Point]);
              }
            }}
            disabled={points.length !== 4}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-40"
          >
            <Check size={12} className="inline mr-1" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ──────────────────────────────────────────────────────────

function PreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:opacity-80 z-10"
        >
          <X size={14} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded border border-[var(--border)]" />
      </div>
    </div>
  );
}

// ─── Main ImageScannerPanel Component ───────────────────────────────────────

export default function ImageScannerPanel() {
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [perspectivePage, setPerspectivePage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const newPages: ScanPage[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const thumb = await generateThumbnail(file);
      newPages.push({
        id: `sp_${++scanPageCounter}`,
        file,
        originalUrl: url,
        enhancedUrl: null,
        thumbnail: thumb,
        filter: 'none',
        perspectivePoints: null,
        rotation: 0,
      });
    }
    setPages((prev) => [...prev, ...newPages]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const removePage = (id: string) => {
    setPages((prev) => {
      const page = prev.find((p) => p.id === id);
      if (page) {
        URL.revokeObjectURL(page.originalUrl);
        if (page.enhancedUrl) URL.revokeObjectURL(page.enhancedUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const movePage = (fromIdx: number, direction: 'up' | 'down') => {
    setPages((prev) => {
      const arr = [...prev];
      const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= arr.length) return prev;
      [arr[fromIdx], arr[toIdx]] = [arr[toIdx], arr[fromIdx]];
      return arr;
    });
  };

  const setFilter = (id: string, filter: ScanPage['filter']) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, filter, enhancedUrl: null } : p)));
  };

  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360, enhancedUrl: null } : p))
    );
  };

  const applyPerspective = (id: string, points: [Point, Point, Point, Point]) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, perspectivePoints: points, enhancedUrl: null } : p))
    );
    setPerspectivePage(null);
  };

  // Drag-and-drop reordering
  const handleDragStart = (idx: number) => setDragFromIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragFromIdx !== null && dragFromIdx !== idx) {
      setPages((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(dragFromIdx, 1);
        arr.splice(idx, 0, moved);
        return arr;
      });
    }
    setDragFromIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    setDragFromIdx(null);
    setDragOverIdx(null);
  };

  // ─── Merge All to Single PDF ──────────────────────────────────────────────

  const mergeAllToPdf = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const pdf = await PDFDocument.create();
      const pageSizeConfig = PAGE_SIZES.find((ps) => ps.id === pageSize)!;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const processedBlob = await processImage(page);
        const processedBuffer = await processedBlob.arrayBuffer();

        // Embed image
        let image;
        try {
          image = await pdf.embedPng(processedBuffer);
        } catch {
          // Try as JPEG fallback
          const jpgBlob = await new Promise<Blob>((resolve) => {
            const img2 = new window.Image();
            img2.onload = () => {
              const c = document.createElement('canvas');
              c.width = img2.width;
              c.height = img2.height;
              c.getContext('2d')!.drawImage(img2, 0, 0);
              c.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
            };
            img2.src = URL.createObjectURL(processedBlob);
          });
          image = await pdf.embedJpg(await jpgBlob.arrayBuffer());
        }

        let pageW: number;
        let pageH: number;

        if (pageSize === 'auto') {
          pageW = image.width;
          pageH = image.height;
        } else {
          pageW = pageSizeConfig.width;
          pageH = pageSizeConfig.height;
        }

        const pdfPage = pdf.addPage([pageW, pageH]);

        // Scale image to fit within page
        const scaleX = pageW / image.width;
        const scaleY = pageH / image.height;
        const scale = Math.min(scaleX, scaleY);
        const drawW = image.width * scale;
        const drawH = image.height * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;

        pdfPage.drawImage(image, { x, y, width: drawW, height: drawH });
        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scanned-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('[ImageScanner] Merge failed:', err);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // ─── Convert Individual to PDF ────────────────────────────────────────────

  const convertSingleToPdf = async (page: ScanPage) => {
    const processedBlob = await processImage(page);
    const processedBuffer = await processedBlob.arrayBuffer();
    const pdf = await PDFDocument.create();
    const image = await pdf.embedPng(processedBuffer);
    const pageSizeConfig = PAGE_SIZES.find((ps) => ps.id === pageSize)!;

    let pageW: number;
    let pageH: number;
    if (pageSize === 'auto') {
      pageW = image.width;
      pageH = image.height;
    } else {
      pageW = pageSizeConfig.width;
      pageH = pageSizeConfig.height;
    }

    const pdfPage = pdf.addPage([pageW, pageH]);
    const scaleX = pageW / image.width;
    const scaleY = pageH / image.height;
    const scale = Math.min(scaleX, scaleY);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    pdfPage.drawImage(image, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = page.file.name.replace(/\.[^.]+$/, '') + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const applyFilterAll = (filter: ScanPage['filter']) => {
    setPages((prev) => prev.map((p) => ({ ...p, filter, enhancedUrl: null })));
  };

  const perspectivePageData = perspectivePage ? pages.find((p) => p.id === perspectivePage) : null;

  return (
    <div className="flex flex-col h-full bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Image size={14} />
          Image Scanner
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          CamScanner-like batch image to PDF
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={24} className="mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-xs font-medium">Click to add images</p>
          <p className="text-[10px] text-[var(--muted-foreground)]">PNG, JPG, BMP, WebP</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Global Controls */}
        {pages.length > 0 && (
          <>
            {/* Page Size */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                Page Size
              </p>
              <div className="flex gap-1">
                {PAGE_SIZES.map((ps) => (
                  <button
                    key={ps.id}
                    onClick={() => setPageSize(ps.id)}
                    className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                      pageSize === ps.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Enhance */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                Apply to All Pages
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => applyFilterAll('auto-enhance')}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-[var(--card)] hover:bg-[var(--border)] text-[10px]"
                >
                  <Sun size={11} /> Auto-Enhance
                </button>
                <button
                  onClick={() => applyFilterAll('grayscale')}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-[var(--card)] hover:bg-[var(--border)] text-[10px]"
                >
                  <Palette size={11} /> Grayscale
                </button>
                <button
                  onClick={() => applyFilterAll('bw')}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-[var(--card)] hover:bg-[var(--border)] text-[10px]"
                >
                  <Contrast size={11} /> Black & White
                </button>
                <button
                  onClick={() => applyFilterAll('none')}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-[var(--card)] hover:bg-[var(--border)] text-[10px]"
                >
                  <X size={11} /> Reset All
                </button>
              </div>
            </div>

            {/* Pages List */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                Pages ({pages.length})
              </p>
              <div className="space-y-1.5">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex gap-2 p-2 rounded border transition-colors ${
                      dragOverIdx === idx
                        ? 'border-blue-500 bg-blue-600/10'
                        : 'border-[var(--border)] bg-[var(--card)]'
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-[var(--muted-foreground)]">
                      <GripVertical size={14} />
                    </div>

                    {/* Thumbnail */}
                    <div
                      className="w-12 h-14 rounded overflow-hidden flex-shrink-0 border border-[var(--border)] bg-white cursor-pointer relative"
                      onClick={() => setPreviewUrl(page.originalUrl)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.thumbnail}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors">
                        <Eye size={10} className="text-white opacity-0 hover:opacity-100" />
                      </div>
                    </div>

                    {/* Info + Controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-blue-400">Page {idx + 1}</p>
                        <button
                          onClick={() => removePage(page.id)}
                          className="text-[var(--muted-foreground)] hover:text-red-400"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <p className="text-[9px] text-[var(--muted-foreground)] truncate">
                        {page.file.name}
                      </p>

                      {/* Per-page controls */}
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        <button
                          onClick={() => movePage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 rounded hover:bg-[var(--border)] disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          onClick={() => movePage(idx, 'down')}
                          disabled={idx === pages.length - 1}
                          className="p-0.5 rounded hover:bg-[var(--border)] disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown size={11} />
                        </button>
                        <button
                          onClick={() => rotatePage(page.id)}
                          className="p-0.5 rounded hover:bg-[var(--border)]"
                          title="Rotate 90°"
                        >
                          <RotateCw size={11} />
                        </button>
                        <button
                          onClick={() => setPerspectivePage(page.id)}
                          className="p-0.5 rounded hover:bg-[var(--border)]"
                          title="Perspective correction"
                        >
                          <Maximize2 size={11} />
                        </button>

                        {/* Filter buttons */}
                        <div className="flex gap-0.5 ml-1 border-l border-[var(--border)] pl-1">
                          {(['none', 'auto-enhance', 'grayscale', 'bw'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setFilter(page.id, f)}
                              className={`px-1 py-0 rounded text-[8px] ${
                                page.filter === f
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              {f === 'none' ? 'Off' : f === 'auto-enhance' ? 'Enh' : f === 'grayscale' ? 'Gray' : 'B&W'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span>Converting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-1.5">
              <button
                onClick={mergeAllToPdf}
                disabled={pages.length === 0 || isProcessing}
                className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <FileDown size={13} />
                {isProcessing ? 'Processing...' : `Merge All to Single PDF (${pages.length} pages)`}
              </button>
              {pages.length === 1 && (
                <button
                  onClick={() => convertSingleToPdf(pages[0])}
                  disabled={isProcessing}
                  className="w-full py-1.5 rounded bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--border)] text-xs flex items-center justify-center gap-1.5"
                >
                  <FileDown size={12} />
                  Convert to PDF
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Perspective Correction Modal */}
      {perspectivePageData && (
        <PerspectiveCorrectionModal
          page={perspectivePageData}
          onApply={(points) => applyPerspective(perspectivePageData.id, points)}
          onCancel={() => setPerspectivePage(null)}
        />
      )}

      {/* Preview Modal */}
      {previewUrl && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}
