'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import DrawingToolbar, { ToolOptionsBar } from './drawing-toolbar';
import DrawingLayers from './drawing-layers';
import DrawingHistory from './drawing-history';
import { useDrawingStore } from '@/store/drawing-store';
import type { DrawTool, Point, BezierPoint } from './drawing-types';
import { WORDART_STYLES } from './drawing-types';

// ─── helpers ────────────────────────────────────────────────────────────────

function getPos(e: React.MouseEvent, canvas: HTMLCanvasElement, zoom: number, pan: { x: number; y: number }): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - pan.x) / zoom,
    y: (e.clientY - rect.top - pan.y) / zoom,
  };
}

function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  size: number,
  opacity: number,
  hardness: number,
  color: string,
) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(dist / (size * 0.2)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = from.x + (to.x - from.x) * t;
    const cy = from.y + (to.y - from.y) * t;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    grad.addColorStop(0, color + Math.round(opacity * 255).toString(16).padStart(2, '0'));
    grad.addColorStop(hardness, color + Math.round(opacity * 200).toString(16).padStart(2, '0'));
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function makeThumbnail(src: HTMLCanvasElement): string {
  const thumb = document.createElement('canvas');
  const scale = Math.min(120 / src.width, 80 / src.height);
  thumb.width = Math.round(src.width * scale);
  thumb.height = Math.round(src.height * scale);
  const ctx = thumb.getContext('2d')!;
  ctx.drawImage(src, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL('image/png');
}

function applyGradientFill(
  ctx: CanvasRenderingContext2D,
  stops: { offset: number; color: string }[],
  type: 'linear-gradient' | 'radial-gradient',
  angle: number,
  x: number, y: number, w: number, h: number,
) {
  let grad: CanvasGradient;
  if (type === 'linear-gradient') {
    const rad = (angle * Math.PI) / 180;
    grad = ctx.createLinearGradient(
      x + w / 2 - (Math.cos(rad) * w) / 2,
      y + h / 2 - (Math.sin(rad) * h) / 2,
      x + w / 2 + (Math.cos(rad) * w) / 2,
      y + h / 2 + (Math.sin(rad) * h) / 2,
    );
  } else {
    grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) / 2);
  }
  stops.forEach(({ offset, color }) => grad.addColorStop(offset, color));
  return grad;
}

// ─── main component ──────────────────────────────────────────────────────────

export default function DrawingCanvas() {
  const store = useDrawingStore();

  // Canvas refs: one per layer (we composite them at render time)
  const layerCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // temp drawing overlay
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing interaction state (local)
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<Point | null>(null);
  const penPointsRef = useRef<BezierPoint[]>([]);
  const lassoPointsRef = useRef<Point[]>([]);
  const marqueeStartRef = useRef<Point | null>(null);
  const polygonPointsRef = useRef<Point[]>([]);
  const bezierPointsRef = useRef<BezierPoint[]>([]);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');
  const [textInputCanvasPos, setTextInputCanvasPos] = useState<Point>({ x: 0, y: 0 });
  const [wordArtStyle, setWordArtStyle] = useState<'normal' | 'shadow' | 'outline' | 'glow' | 'gradient' | '3d'>('normal');
  const [showWordArt, setShowWordArt] = useState(false);

  const [historyThumbs, setHistoryThumbs] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // ── ensure layer canvases exist ──────────────────────────────────────────
  const ensureLayerCanvas = useCallback((layerId: string, w: number, h: number): HTMLCanvasElement => {
    let c = layerCanvasRefs.current.get(layerId);
    if (!c) {
      c = document.createElement('canvas');
      c.width = w; c.height = h;
      layerCanvasRefs.current.set(layerId, c);
    } else if (c.width !== w || c.height !== h) {
      const tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h;
      tmp.getContext('2d')!.drawImage(c, 0, 0);
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(tmp, 0, 0);
    }
    return c;
  }, []);

  // ── composite all layers onto display canvas ─────────────────────────────
  const composite = useCallback(() => {
    const disp = displayCanvasRef.current;
    if (!disp) return;
    const ctx = disp.getContext('2d')!;
    ctx.clearRect(0, 0, disp.width, disp.height);

    // Background
    const bg = store.canvasBg;
    if (bg === 'transparent') {
      // checkerboard
      const sz = 10;
      for (let x = 0; x < disp.width; x += sz) {
        for (let y = 0; y < disp.height; y += sz) {
          ctx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#ccc' : '#fff';
          ctx.fillRect(x, y, sz, sz);
        }
      }
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, disp.width, disp.height);
    }

    // Layers bottom-to-top
    store.layers.forEach((layer) => {
      if (!layer.visible) return;
      const lc = layerCanvasRefs.current.get(layer.id);
      if (!lc) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
      ctx.drawImage(lc, 0, 0);
      ctx.restore();
    });
  }, [store.layers, store.canvasBg]);

  // ── get active layer ctx ─────────────────────────────────────────────────
  const getActiveCtx = useCallback((): CanvasRenderingContext2D | null => {
    const layer = store.layers.find((l) => l.id === store.activeLayerId);
    if (!layer || layer.locked) return null;
    const c = ensureLayerCanvas(layer.id, store.canvasWidth, store.canvasHeight);
    return c.getContext('2d');
  }, [store.layers, store.activeLayerId, store.canvasWidth, store.canvasHeight, ensureLayerCanvas]);

  // ── save history snapshot ────────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const disp = displayCanvasRef.current;
    if (!disp) return;
    const thumb = makeThumbnail(disp);
    const full = disp.toDataURL('image/png');
    store.pushHistory(full);
    setHistoryThumbs((prev) => {
      const sliced = prev.slice(0, store.historyIndex + 1);
      return [...sliced, thumb].slice(-50);
    });
  }, [store]);

  // ── restore from history ─────────────────────────────────────────────────
  const restoreSnapshot = useCallback((dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const layer = store.layers.find((l) => l.id === store.activeLayerId);
      if (!layer) return;
      const c = ensureLayerCanvas(layer.id, store.canvasWidth, store.canvasHeight);
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      composite();
    };
    img.src = dataUrl;
  }, [store.layers, store.activeLayerId, store.canvasWidth, store.canvasHeight, ensureLayerCanvas, composite]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const map: Record<string, DrawTool> = {
      v: 'select', m: 'marquee', l: 'lasso', p: 'pencil',
      b: 'brush', n: 'pen', e: 'eraser', t: 'text',
      i: 'eyedropper', h: 'hand', z: 'zoom',
    };
    const handler = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return;
      const t = map[ev.key.toLowerCase()];
      if (t) { store.setActiveTool(t); return; }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { ev.preventDefault(); store.undo(); }
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'y' || (ev.shiftKey && ev.key === 'z'))) { ev.preventDefault(); store.redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  // ── sync history index → restore snapshot ────────────────────────────────
  const prevHistoryIndex = useRef(store.historyIndex);
  useEffect(() => {
    if (store.historyIndex !== prevHistoryIndex.current) {
      prevHistoryIndex.current = store.historyIndex;
      const snap = store.history[store.historyIndex];
      if (snap) restoreSnapshot(snap);
    }
  }, [store.historyIndex, store.history, restoreSnapshot]);

  // ── canvas resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const disp = displayCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (disp) { disp.width = store.canvasWidth; disp.height = store.canvasHeight; }
    if (overlay) { overlay.width = store.canvasWidth; overlay.height = store.canvasHeight; }
    store.layers.forEach((l) => ensureLayerCanvas(l.id, store.canvasWidth, store.canvasHeight));
    composite();
  }, [store.canvasWidth, store.canvasHeight, store.layers, ensureLayerCanvas, composite]);

  // ── draw grid on overlay when active ─────────────────────────────────────
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!store.showGrid) return;
    const gs = 20;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < overlay.width; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, overlay.height); ctx.stroke(); }
    for (let y = 0; y < overlay.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(overlay.width, y); ctx.stroke(); }
  }, [store.showGrid, store.canvasWidth, store.canvasHeight]);

  // ── MOUSE EVENTS ──────────────────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas, store.zoom, store.pan);

    if (store.activeTool === 'hand') {
      isDrawingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (store.activeTool === 'eyedropper') {
      const ctx = getActiveCtx();
      if (!ctx) return;
      const px = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      const hex = '#' + [px[0], px[1], px[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (e.shiftKey) store.setFillColor(hex); else store.setStrokeColor(hex);
      return;
    }

    if (store.activeTool === 'text' || store.activeTool === 'text-path') {
      const rect = canvas.getBoundingClientRect();
      setTextInputPos({ x: e.clientX - rect.left + 8, y: e.clientY - rect.top + 8 });
      setTextInputCanvasPos(pos);
      setTextInputValue('');
      setShowTextInput(true);
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    if (store.activeTool === 'pen') {
      const pts = penPointsRef.current;
      if (e.detail === 2) {
        // Double-click: close path
        if (pts.length > 1) {
          const ctx = getActiveCtx(); if (!ctx) return;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          pts.forEach((p, i) => {
            if (i === 0) return;
            ctx.bezierCurveTo(pts[i - 1].cp2x, pts[i - 1].cp2y, p.cp1x, p.cp1y, p.x, p.y);
          });
          ctx.closePath();
          ctx.strokeStyle = store.strokeColor;
          ctx.lineWidth = store.strokeWidth;
          ctx.stroke();
          ctx.fillStyle = store.fillColor;
          ctx.fill();
          penPointsRef.current = [];
          composite(); saveSnapshot();
        }
      } else {
        penPointsRef.current.push({ x: pos.x, y: pos.y, cp1x: pos.x - 30, cp1y: pos.y, cp2x: pos.x + 30, cp2y: pos.y });
      }
      return;
    }

    if (store.activeTool === 'polygon') {
      const pts = polygonPointsRef.current;
      if (e.detail === 2 && pts.length > 2) {
        const ctx = getActiveCtx(); if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = store.fillColor;
        ctx.fill();
        ctx.strokeStyle = store.strokeColor;
        ctx.lineWidth = store.strokeWidth;
        ctx.stroke();
        polygonPointsRef.current = [];
        composite(); saveSnapshot();
      } else {
        polygonPointsRef.current.push(pos);
      }
      return;
    }

    isDrawingRef.current = true;
    lastPosRef.current = pos;

    if (store.activeTool === 'lasso') {
      lassoPointsRef.current = [pos];
    }
    if (store.activeTool === 'marquee') {
      marqueeStartRef.current = pos;
    }

    const ctx = getActiveCtx();
    if (!ctx) return;

    if (store.activeTool === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = store.strokeColor;
      ctx.lineWidth = store.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [store, getActiveCtx, composite, saveSnapshot]);


  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas, store.zoom, store.pan);

    // Pan
    if (store.activeTool === 'hand' && isDrawingRef.current && lastPosRef.current) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      store.setPan({ x: store.pan.x + dx, y: store.pan.y + dy });
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!isDrawingRef.current) return;
    const ctx = getActiveCtx();

    switch (store.activeTool) {
      case 'pencil': {
        if (!ctx) return;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        composite();
        break;
      }
      case 'brush': {
        if (!ctx || !lastPosRef.current) return;
        drawBrushStroke(ctx, lastPosRef.current, pos, store.brushSize, store.brushOpacity, store.brushHardness, store.strokeColor);
        composite();
        break;
      }
      case 'eraser': {
        if (!ctx || !lastPosRef.current) return;
        if (store.eraserMode === 'pixel') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, store.eraserSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        composite();
        break;
      }
      case 'lasso': {
        lassoPointsRef.current.push(pos);
        // Draw lasso preview on overlay
        const ov = overlayCanvasRef.current?.getContext('2d');
        if (!ov) break;
        ov.clearRect(0, 0, store.canvasWidth, store.canvasHeight);
        if (store.showGrid) {
          const gs = 20;
          ov.strokeStyle = 'rgba(255,255,255,0.1)'; ov.lineWidth = 0.5;
          for (let x = 0; x < store.canvasWidth; x += gs) { ov.beginPath(); ov.moveTo(x, 0); ov.lineTo(x, store.canvasHeight); ov.stroke(); }
          for (let y = 0; y < store.canvasHeight; y += gs) { ov.beginPath(); ov.moveTo(0, y); ov.lineTo(store.canvasWidth, y); ov.stroke(); }
        }
        const pts = lassoPointsRef.current;
        ov.beginPath(); ov.moveTo(pts[0].x, pts[0].y);
        pts.forEach((p) => ov.lineTo(p.x, p.y));
        ov.strokeStyle = '#3b82f6'; ov.lineWidth = 1.5 / store.zoom; ov.setLineDash([4, 4]); ov.stroke(); ov.setLineDash([]);
        break;
      }
      case 'marquee': {
        if (!marqueeStartRef.current) break;
        const ov = overlayCanvasRef.current?.getContext('2d');
        if (!ov) break;
        ov.clearRect(0, 0, store.canvasWidth, store.canvasHeight);
        const { x: sx, y: sy } = marqueeStartRef.current;
        ov.strokeStyle = '#3b82f6'; ov.lineWidth = 1.5 / store.zoom; ov.setLineDash([4, 4]);
        ov.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
        ov.setLineDash([]);
        ov.fillStyle = 'rgba(59,130,246,0.1)';
        ov.fillRect(sx, sy, pos.x - sx, pos.y - sy);
        break;
      }
      case 'line':
      case 'arrow': {
        if (!ctx || !lastPosRef.current) return;
        const snap = store.snapToGrid ? snapPoint(pos) : pos;
        const ov = overlayCanvasRef.current?.getContext('2d');
        if (!ov) break;
        ov.clearRect(0, 0, store.canvasWidth, store.canvasHeight);
        ov.beginPath(); ov.moveTo(lastPosRef.current.x, lastPosRef.current.y); ov.lineTo(snap.x, snap.y);
        ov.strokeStyle = store.strokeColor; ov.lineWidth = store.strokeWidth; ov.stroke();
        if (store.activeTool === 'arrow') drawArrowHead(ov, lastPosRef.current, snap, store.strokeColor, store.strokeWidth);
        break;
      }
    }
    lastPosRef.current = pos;
  }, [store, getActiveCtx, composite]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas, store.zoom, store.pan);
    const ctx = getActiveCtx();
    const ov = overlayCanvasRef.current?.getContext('2d');

    switch (store.activeTool) {
      case 'pencil':
        if (ctx) { ctx.stroke(); ctx.closePath(); composite(); saveSnapshot(); }
        break;
      case 'brush':
      case 'eraser':
        composite(); saveSnapshot();
        break;
      case 'lasso': {
        // Clear overlay
        if (ov) ov.clearRect(0, 0, store.canvasWidth, store.canvasHeight);
        lassoPointsRef.current = [];
        break;
      }
      case 'marquee': {
        if (ov) ov.clearRect(0, 0, store.canvasWidth, store.canvasHeight);
        marqueeStartRef.current = null;
        break;
      }
      case 'line':
      case 'arrow': {
        if (!ctx || !lastPosRef.current) break;
        const start = lastPosRef.current;
        const snap = store.snapToGrid ? snapPoint(pos) : pos;
        if (ov) ov.clearRect(0, 0, store.canvasWidth, store.canvasHeight);
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(snap.x, snap.y);
        ctx.strokeStyle = store.strokeColor; ctx.lineWidth = store.strokeWidth; ctx.stroke();
        if (store.activeTool === 'arrow') drawArrowHead(ctx, start, snap, store.strokeColor, store.strokeWidth);
        composite(); saveSnapshot();
        break;
      }
    }
    lastPosRef.current = null;
  }, [store, getActiveCtx, composite, saveSnapshot]);

  // ── Wheel: zoom ───────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    store.setZoom(store.zoom * factor);
  }, [store]);

  // ── Text commit ───────────────────────────────────────────────────────────
  const commitText = useCallback(() => {
    const ctx = getActiveCtx();
    if (!ctx || !textInputValue.trim()) { setShowTextInput(false); return; }
    const pos = textInputCanvasPos;

    ctx.save();
    const fontStr = `${store.textItalic ? 'italic ' : ''}${store.textBold ? 'bold ' : ''}${store.fontSize}px ${store.fontFamily}`;
    ctx.font = fontStr;
    ctx.fillStyle = store.strokeColor;
    ctx.textBaseline = 'top';

    switch (wordArtStyle) {
      case 'shadow':
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
        ctx.fillText(textInputValue, pos.x, pos.y);
        break;
      case 'outline':
        ctx.strokeStyle = store.fillColor; ctx.lineWidth = 3;
        ctx.strokeText(textInputValue, pos.x, pos.y);
        ctx.fillText(textInputValue, pos.x, pos.y);
        break;
      case 'glow':
        ctx.shadowColor = store.strokeColor; ctx.shadowBlur = 20;
        ctx.fillText(textInputValue, pos.x, pos.y); ctx.fillText(textInputValue, pos.x, pos.y);
        break;
      case 'gradient': {
        const m = ctx.measureText(textInputValue);
        const grad = ctx.createLinearGradient(pos.x, pos.y, pos.x + m.width, pos.y + store.fontSize);
        grad.addColorStop(0, store.strokeColor); grad.addColorStop(1, store.fillColor);
        ctx.fillStyle = grad;
        ctx.fillText(textInputValue, pos.x, pos.y);
        break;
      }
      case '3d':
        for (let i = 5; i > 0; i--) {
          ctx.fillStyle = `rgba(0,0,0,${0.1 * i})`;
          ctx.fillText(textInputValue, pos.x + i, pos.y + i);
        }
        ctx.fillStyle = store.strokeColor;
        ctx.fillText(textInputValue, pos.x, pos.y);
        break;
      default:
        ctx.fillText(textInputValue, pos.x, pos.y);
    }
    ctx.restore();
    composite(); saveSnapshot();
    setShowTextInput(false);
  }, [getActiveCtx, textInputValue, textInputCanvasPos, store, wordArtStyle, composite, saveSnapshot]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback((format: 'png' | 'svg' | 'pdf', dpi: number) => {
    composite();
    const disp = displayCanvasRef.current;
    if (!disp) return;
    const scale = dpi / 96;

    if (format === 'png') {
      const out = document.createElement('canvas');
      out.width = disp.width * scale; out.height = disp.height * scale;
      const ctx = out.getContext('2d')!;
      ctx.scale(scale, scale); ctx.drawImage(disp, 0, 0);
      const a = document.createElement('a');
      a.href = out.toDataURL('image/png'); a.download = `drawing_${dpi}dpi.png`; a.click();
    } else if (format === 'svg') {
      const dataUrl = disp.toDataURL('image/png');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${disp.width}" height="${disp.height}">
  <image href="${dataUrl}" width="${disp.width}" height="${disp.height}"/>
</svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'drawing.svg'; a.click();
    } else if (format === 'pdf') {
      const dataUrl = disp.toDataURL('image/png');
      const win = window.open('', '_blank')!;
      win.document.write(`<html><body style="margin:0"><img src="${dataUrl}" style="width:100%"/></body></html>`);
      win.document.close(); win.focus(); win.print();
    }
  }, [composite]);

  // ── Snap helper (hoisted function declaration) ────────────────────────────
  function snapPoint(p: Point): Point {
    if (!store.snapToGrid) return p;
    const gs = 20;
    return { x: Math.round(p.x / gs) * gs, y: Math.round(p.y / gs) * gs };
  }

  // ── Arrow helper ──────────────────────────────────────────────────────────
  function drawArrowHead(ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, width: number) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const size = Math.max(10, width * 4);
    ctx.save();
    ctx.translate(to.x, to.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // ── canvas style transforms ───────────────────────────────────────────────
  const canvasTransform = `translate(${store.pan.x}px, ${store.pan.y}px) scale(${store.zoom})`;

  return (
    <div className="flex flex-col" style={{ height: '100%', background: 'var(--background, #0f172a)' }}>
      {/* Top options bar */}
      <ToolOptionsBar
        activeTool={store.activeTool}
        strokeWidth={store.strokeWidth} setStrokeWidth={store.setStrokeWidth}
        brushSize={store.brushSize} setBrushSize={store.setBrushSize}
        brushOpacity={store.brushOpacity} setBrushOpacity={store.setBrushOpacity}
        brushHardness={store.brushHardness} setBrushHardness={store.setBrushHardness}
        eraserSize={store.eraserSize} setEraserSize={store.setEraserSize}
        eraserMode={store.eraserMode} setEraserMode={store.setEraserMode}
        fillType={store.fillType} setFillType={store.setFillType}
        fontSize={store.fontSize} setFontSize={store.setFontSize}
        fontFamily={store.fontFamily} setFontFamily={store.setFontFamily}
        textBold={store.textBold} setTextBold={store.setTextBold}
        textItalic={store.textItalic} setTextItalic={store.setTextItalic}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="relative flex-none">
          <DrawingToolbar
            activeTool={store.activeTool} setActiveTool={store.setActiveTool}
            strokeColor={store.strokeColor} setStrokeColor={store.setStrokeColor}
            fillColor={store.fillColor} setFillColor={store.setFillColor}
            strokeWidth={store.strokeWidth} setStrokeWidth={store.setStrokeWidth}
            brushSize={store.brushSize} setBrushSize={store.setBrushSize}
            brushOpacity={store.brushOpacity} setBrushOpacity={store.setBrushOpacity}
            brushHardness={store.brushHardness} setBrushHardness={store.setBrushHardness}
            eraserSize={store.eraserSize} setEraserSize={store.setEraserSize}
            eraserMode={store.eraserMode} setEraserMode={store.setEraserMode}
            fillType={store.fillType} setFillType={store.setFillType}
            fontSize={store.fontSize} setFontSize={store.setFontSize}
            fontFamily={store.fontFamily} setFontFamily={store.setFontFamily}
            textBold={store.textBold} setTextBold={store.setTextBold}
            textItalic={store.textItalic} setTextItalic={store.setTextItalic}
            showGrid={store.showGrid} setShowGrid={store.setShowGrid}
            snapToGrid={store.snapToGrid} setSnapToGrid={store.setSnapToGrid}
            canvasWidth={store.canvasWidth} canvasHeight={store.canvasHeight} setCanvasSize={store.setCanvasSize}
            canvasBg={store.canvasBg} setCanvasBg={store.setCanvasBg}
            onUndo={store.undo} onRedo={store.redo}
            onExport={handleExport}
            canUndo={store.historyIndex > 0}
            canRedo={store.historyIndex < store.history.length - 1}
          />
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          style={{ cursor: getCursor(store.activeTool), background: '#111827' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
          <div
            style={{ position: 'absolute', transformOrigin: '0 0', transform: canvasTransform }}
          >
            {/* Display (composited) canvas */}
            <canvas
              ref={displayCanvasRef}
              width={store.canvasWidth}
              height={store.canvasHeight}
              style={{ display: 'block', boxShadow: '0 4px 32px rgba(0,0,0,0.7)' }}
            />
            {/* Overlay canvas (grid, selection preview) */}
            <canvas
              ref={overlayCanvasRef}
              width={store.canvasWidth}
              height={store.canvasHeight}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            />
          </div>

          {/* Floating text input */}
          {showTextInput && (
            <div
              style={{ position: 'absolute', left: textInputPos.x, top: textInputPos.y, zIndex: 50, background: '#1e293b', border: '1px solid #334155' }}
              className="flex flex-col gap-2 p-2 rounded shadow-xl"
            >
              <input
                ref={textInputRef}
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setShowTextInput(false); }}
                placeholder="Type text…"
                className="bg-gray-900 text-white rounded px-2 py-1 text-sm outline-none border border-blue-500"
                style={{ fontFamily: store.fontFamily, fontSize: store.fontSize * store.zoom, fontWeight: store.textBold ? 'bold' : 'normal', fontStyle: store.textItalic ? 'italic' : 'normal', minWidth: 120 }}
              />
              {/* WordArt style picker */}
              <div className="flex gap-1 flex-wrap">
                {WORDART_STYLES.map((ws) => (
                  <button key={ws.style} onClick={() => setWordArtStyle(ws.style)}
                    className={`px-1.5 py-0.5 rounded text-xs ${wordArtStyle === ws.style ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {ws.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={commitText} className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded px-3 py-1">Place</button>
                <button onClick={() => setShowTextInput(false)} className="bg-gray-700 text-gray-300 text-xs rounded px-3 py-1">Cancel</button>
              </div>
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/50 rounded px-2 py-1 pointer-events-none">
            {Math.round(store.zoom * 100)}%
          </div>
        </div>

        {/* Layers panel */}
        <DrawingLayers
          layers={store.layers}
          activeLayerId={store.activeLayerId}
          onSelectLayer={store.setActiveLayerId}
          onAddLayer={store.addLayer}
          onDeleteLayer={store.deleteLayer}
          onUpdateLayer={store.updateLayer}
          onReorderLayer={store.reorderLayers}
        />

        {/* History panel */}
        {showHistory && (
          <DrawingHistory
            thumbnails={historyThumbs}
            currentIndex={store.historyIndex}
            onJump={(i) => {
              const snap = store.history[i];
              if (snap) { useDrawingStore.setState({ historyIndex: i }); restoreSnapshot(snap); }
            }}
          />
        )}
      </div>
    </div>
  );
}

function getCursor(tool: DrawTool): string {
  switch (tool) {
    case 'hand': return 'grab';
    case 'eyedropper': return 'crosshair';
    case 'eraser': return 'cell';
    case 'zoom': return 'zoom-in';
    case 'text':
    case 'text-path': return 'text';
    case 'select': return 'default';
    case 'marquee':
    case 'lasso': return 'crosshair';
    default: return 'crosshair';
  }
}
