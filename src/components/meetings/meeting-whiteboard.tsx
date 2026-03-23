'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Pencil, Square, Circle, Type, Minus, ArrowRight,
  Eraser, Undo2, Redo2, ZoomIn, ZoomOut, Download,
  MousePointer2, StickyNote, Trash2, Palette, Move,
} from 'lucide-react';

// ==================== TYPES ====================
type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'eraser' | 'pan';

interface Point {
  x: number;
  y: number;
}

interface WhiteboardElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky';
  points?: Point[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  text?: string;
  stickyColor?: string;
}

interface WhiteboardState {
  elements: WhiteboardElement[];
  undoStack: WhiteboardElement[][];
  redoStack: WhiteboardElement[][];
}

// ==================== COLORS ====================
const PEN_COLORS = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ec4899'];
const LINE_WIDTHS = [2, 4, 6, 8];
const STICKY_COLORS_WB = ['#fef08a', '#fbcfe8', '#bfdbfe', '#bbf7d0', '#fed7aa', '#ddd6fe'];

// ==================== COMPONENT ====================
interface MeetingWhiteboardProps {
  meetingId: string;
}

export default function MeetingWhiteboard({ meetingId }: MeetingWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);

  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [undoStack, setUndoStack] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  const genId = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // ---- Save/Load per meeting ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`whiteboard_${meetingId}`);
      if (saved) {
        const parsed: WhiteboardState = JSON.parse(saved);
        setElements(parsed.elements || []);
      }
    } catch { /* ignore */ }
  }, [meetingId]);

  useEffect(() => {
    try {
      localStorage.setItem(`whiteboard_${meetingId}`, JSON.stringify({ elements, undoStack: [], redoStack: [] }));
    } catch { /* ignore */ }
  }, [elements, meetingId]);

  // ---- Canvas drawing ----
  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    const startX = -pan.x / zoom;
    const startY = -pan.y / zoom;
    const endX = startX + canvas.width / zoom;
    const endY = startY + canvas.height / zoom;
    for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw elements
    const allEls = currentElement ? [...elements, currentElement] : elements;
    for (const el of allEls) {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (el.type) {
        case 'path':
          if (el.points && el.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            for (let i = 1; i < el.points.length; i++) {
              ctx.lineTo(el.points[i].x, el.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case 'rectangle':
          ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
          break;
        case 'circle': {
          const rx = (el.width || 0) / 2;
          const ry = (el.height || 0) / 2;
          ctx.beginPath();
          ctx.ellipse(el.x + rx, el.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'line':
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(el.x + (el.width || 0), el.y + (el.height || 0));
          ctx.stroke();
          break;
        case 'arrow': {
          const ex = el.x + (el.width || 0);
          const ey = el.y + (el.height || 0);
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          // Arrowhead
          const angle = Math.atan2(ey - el.y, ex - el.x);
          const headLen = 12;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
          break;
        }
        case 'text':
          ctx.font = `${Math.max(14, el.strokeWidth * 4)}px sans-serif`;
          ctx.fillText(el.text || '', el.x, el.y);
          break;
        case 'sticky': {
          const sw = el.width || 140;
          const sh = el.height || 100;
          ctx.fillStyle = el.stickyColor || '#fef08a';
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillRect(el.x, el.y, sw, sh);
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = '#1a1a1a';
          ctx.font = '12px sans-serif';
          const lines = (el.text || 'Note').split('\n');
          lines.forEach((line, i) => {
            ctx.fillText(line, el.x + 8, el.y + 20 + i * 16, sw - 16);
          });
          break;
        }
      }
    }

    ctx.restore();
  }, [elements, currentElement, zoom, pan]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  useEffect(() => {
    const handleResize = () => drawAll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawAll]);

  // ---- Coordinate helpers ----
  const getCanvasPoint = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  // ---- Push to undo ----
  const pushUndo = () => {
    setUndoStack((prev) => [...prev.slice(-30), [...elements]]);
    setRedoStack([]);
  };

  // ---- Mouse handlers ----
  const handleMouseDown = (e: React.MouseEvent) => {
    const pt = getCanvasPoint(e);

    if (tool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (tool === 'eraser') {
      // Find and remove element near click
      const threshold = 15;
      const hitIdx = elements.findIndex((el) => {
        if (el.type === 'path' && el.points) {
          return el.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < threshold);
        }
        const cx = el.x + (el.width || 0) / 2;
        const cy = el.y + (el.height || 0) / 2;
        return Math.hypot(cx - pt.x, cy - pt.y) < Math.max(threshold, ((el.width || 0) + (el.height || 0)) / 4);
      });
      if (hitIdx >= 0) {
        pushUndo();
        setElements((prev) => prev.filter((_, i) => i !== hitIdx));
      }
      return;
    }

    if (tool === 'text') {
      pushUndo();
      const newEl: WhiteboardElement = {
        id: genId(), type: 'text', x: pt.x, y: pt.y,
        color, strokeWidth, text: '',
      };
      setElements((prev) => [...prev, newEl]);
      setEditingTextId(newEl.id);
      setTextInput('');
      return;
    }

    if (tool === 'sticky') {
      pushUndo();
      const stickyIdx = Math.floor(Math.random() * STICKY_COLORS_WB.length);
      const newEl: WhiteboardElement = {
        id: genId(), type: 'sticky', x: pt.x, y: pt.y,
        width: 140, height: 100, color, strokeWidth,
        text: 'Note', stickyColor: STICKY_COLORS_WB[stickyIdx],
      };
      setElements((prev) => [...prev, newEl]);
      setEditingTextId(newEl.id);
      setTextInput('Note');
      return;
    }

    setIsDrawing(true);
    setStartPoint(pt);

    if (tool === 'pen') {
      setCurrentElement({
        id: genId(), type: 'path', x: pt.x, y: pt.y,
        points: [pt], color, strokeWidth,
      });
    } else {
      const typeMap: Record<string, WhiteboardElement['type']> = {
        rectangle: 'rectangle', circle: 'circle', line: 'line', arrow: 'arrow',
      };
      setCurrentElement({
        id: genId(), type: typeMap[tool] || 'rectangle',
        x: pt.x, y: pt.y, width: 0, height: 0, color, strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (!isDrawing || !currentElement || !startPoint) return;
    const pt = getCanvasPoint(e);

    if (tool === 'pen') {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), pt],
      });
    } else {
      setCurrentElement({
        ...currentElement,
        width: pt.x - startPoint.x,
        height: pt.y - startPoint.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentElement) {
      pushUndo();
      setElements((prev) => [...prev, currentElement]);
      setCurrentElement(null);
    }
    setIsDrawing(false);
    setStartPoint(null);
  };

  // ---- Undo/Redo ----
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((rs) => [...rs, [...elements]]);
    setUndoStack((us) => us.slice(0, -1));
    setElements(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((us) => [...us, [...elements]]);
    setRedoStack((rs) => rs.slice(0, -1));
    setElements(next);
  };

  // ---- Zoom ----
  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.2));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, z - 0.2));

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.002)));
    }
  };

  // ---- Export ----
  const handleExport = (format: 'png' | 'pdf') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Redraw at full res without grid for clean export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * 2;
    exportCanvas.height = canvas.height * 2;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.scale(2, 2);
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    for (const el of elements) {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (el.type) {
        case 'path':
          if (el.points && el.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            for (let i = 1; i < el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y);
            ctx.stroke();
          }
          break;
        case 'rectangle':
          ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
          break;
        case 'circle': {
          const rx = (el.width || 0) / 2;
          const ry = (el.height || 0) / 2;
          ctx.beginPath();
          ctx.ellipse(el.x + rx, el.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'line':
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(el.x + (el.width || 0), el.y + (el.height || 0));
          ctx.stroke();
          break;
        case 'arrow': {
          const ex = el.x + (el.width || 0);
          const ey = el.y + (el.height || 0);
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          const angle = Math.atan2(ey - el.y, ex - el.x);
          const headLen = 12;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
          break;
        }
        case 'text':
          ctx.font = `${Math.max(14, el.strokeWidth * 4)}px sans-serif`;
          ctx.fillText(el.text || '', el.x, el.y);
          break;
        case 'sticky': {
          const sw = el.width || 140;
          const sh = el.height || 100;
          ctx.fillStyle = el.stickyColor || '#fef08a';
          ctx.fillRect(el.x, el.y, sw, sh);
          ctx.fillStyle = '#1a1a1a';
          ctx.font = '12px sans-serif';
          (el.text || 'Note').split('\n').forEach((line, i) => {
            ctx.fillText(line, el.x + 8, el.y + 20 + i * 16, sw - 16);
          });
          break;
        }
      }
    }

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `whiteboard-${meetingId}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } else {
      // Simple PDF: embed as image in a printable page
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><head><title>Whiteboard Export</title></head><body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh"><img src="${exportCanvas.toDataURL('image/png')}" style="max-width:100%;height:auto" /></body></html>`);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    }
  };

  // ---- Text editing finish ----
  const finishTextEdit = () => {
    if (editingTextId) {
      setElements((prev) =>
        prev.map((el) => (el.id === editingTextId ? { ...el, text: textInput || (el.type === 'sticky' ? 'Note' : 'Text') } : el))
      );
      setEditingTextId(null);
    }
  };

  // ---- Clear all ----
  const handleClear = () => {
    if (elements.length === 0) return;
    pushUndo();
    setElements([]);
  };

  // ---- Tool config ----
  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={15} />, label: 'Select' },
    { id: 'pen', icon: <Pencil size={15} />, label: 'Pen' },
    { id: 'rectangle', icon: <Square size={15} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={15} />, label: 'Circle' },
    { id: 'line', icon: <Minus size={15} />, label: 'Line' },
    { id: 'arrow', icon: <ArrowRight size={15} />, label: 'Arrow' },
    { id: 'text', icon: <Type size={15} />, label: 'Text' },
    { id: 'sticky', icon: <StickyNote size={15} />, label: 'Sticky Note' },
    { id: 'eraser', icon: <Eraser size={15} />, label: 'Eraser' },
    { id: 'pan', icon: <Move size={15} />, label: 'Pan' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0f172a] rounded-lg overflow-hidden border border-[var(--border-color,#334155)]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#1e293b] border-b border-[var(--border-color,#334155)] flex-wrap">
        {/* Tools */}
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`p-1.5 rounded transition-colors ${
              tool === t.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#334155]'
            }`}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowWidthPicker(false); }}
            className="p-1.5 rounded hover:bg-[#334155] transition-colors flex items-center gap-1"
            title="Color"
          >
            <Palette size={15} className="text-gray-400" />
            <div className="w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: color }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-9 left-0 z-50 p-2 rounded-lg bg-[#1e293b] border border-gray-600 shadow-xl flex gap-1.5">
              {PEN_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setShowColorPicker(false); }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? 'scale-110 border-white' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stroke width */}
        <div className="relative">
          <button
            onClick={() => { setShowWidthPicker(!showWidthPicker); setShowColorPicker(false); }}
            className="p-1.5 rounded hover:bg-[#334155] transition-colors text-gray-400 text-[10px] font-bold"
            title="Line Width"
          >
            {strokeWidth}px
          </button>
          {showWidthPicker && (
            <div className="absolute top-9 left-0 z-50 p-2 rounded-lg bg-[#1e293b] border border-gray-600 shadow-xl flex gap-1.5">
              {LINE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => { setStrokeWidth(w); setShowWidthPicker(false); }}
                  className={`w-8 h-8 rounded flex items-center justify-center text-[10px] transition-colors ${
                    strokeWidth === w ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#334155]'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo2 size={15} />
        </button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Zoom */}
        <button onClick={handleZoomOut} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#334155] transition-colors" title="Zoom Out">
          <ZoomOut size={15} />
        </button>
        <span className="text-[10px] text-gray-400 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#334155] transition-colors" title="Zoom In">
          <ZoomIn size={15} />
        </button>

        <div className="flex-1" />

        {/* Export & Clear */}
        <button
          onClick={() => handleExport('png')}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-gray-300 hover:bg-[#334155] transition-colors"
          title="Export PNG"
        >
          <Download size={13} /> PNG
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-gray-300 hover:bg-[#334155] transition-colors"
          title="Export PDF"
        >
          <Download size={13} /> PDF
        </button>
        <button
          onClick={handleClear}
          className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
          title="Clear All"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative"
        style={{ cursor: tool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : tool === 'eraser' ? 'crosshair' : 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Text editing overlay */}
        {editingTextId && (() => {
          const el = elements.find((e) => e.id === editingTextId);
          if (!el) return null;
          const canvas = canvasRef.current;
          if (!canvas) return null;
          const rect = canvas.getBoundingClientRect();
          const screenX = el.x * zoom + pan.x;
          const screenY = el.y * zoom + pan.y;
          return (
            <div
              style={{ position: 'absolute', left: screenX, top: screenY - (el.type === 'text' ? 20 : 0) }}
            >
              {el.type === 'sticky' ? (
                <textarea
                  autoFocus
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onBlur={finishTextEdit}
                  onKeyDown={(e) => { if (e.key === 'Escape') finishTextEdit(); }}
                  className="bg-transparent text-[#1a1a1a] text-xs outline-none resize-none p-2"
                  style={{ width: (el.width || 140) * zoom, height: (el.height || 100) * zoom, backgroundColor: el.stickyColor || '#fef08a' }}
                />
              ) : (
                <input
                  autoFocus
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onBlur={finishTextEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') finishTextEdit(); }}
                  className="bg-transparent outline-none text-sm"
                  style={{ color, minWidth: 100 }}
                  placeholder="Type text..."
                />
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
