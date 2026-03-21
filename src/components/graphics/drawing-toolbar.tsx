'use client';
import React, { useState } from 'react';
import {
  MousePointer, RectangleHorizontal, Scissors, Pencil, Pen, PenTool,
  Eraser, Minus, ArrowRight, Spline, Pentagon, Type, Pipette,
  Hand, ZoomIn, Bold, Italic, Grid, Magnet, Undo2, Redo2,
  Download, Settings,
} from 'lucide-react';
import type { DrawTool, BlendMode, FillType } from './drawing-types';
import { FONT_FAMILIES, WORDART_STYLES, CANVAS_PRESETS } from './drawing-types';

interface DrawingToolbarProps {
  activeTool: DrawTool;
  setActiveTool: (t: DrawTool) => void;
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
  fillType: FillType;
  setFillType: (t: FillType) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  textBold: boolean;
  setTextBold: (b: boolean) => void;
  textItalic: boolean;
  setTextItalic: (i: boolean) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
  canvasWidth: number;
  canvasHeight: number;
  setCanvasSize: (w: number, h: number) => void;
  canvasBg: string;
  setCanvasBg: (bg: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (format: 'png' | 'svg' | 'pdf', dpi: number) => void;
  canUndo: boolean;
  canRedo: boolean;
}

type ToolGroup = { label: string; tools: { id: DrawTool; icon: React.ReactNode; tip: string }[] };

const TOOL_GROUPS: ToolGroup[] = [
  {
    label: 'Select',
    tools: [
      { id: 'select', icon: <MousePointer size={16} />, tip: 'Select (V)' },
      { id: 'marquee', icon: <RectangleHorizontal size={16} />, tip: 'Marquee Select (M)' },
      { id: 'lasso', icon: <Scissors size={16} />, tip: 'Lasso Select (L)' },
    ],
  },
  {
    label: 'Draw',
    tools: [
      { id: 'pencil', icon: <Pencil size={16} />, tip: 'Pencil (P)' },
      { id: 'brush', icon: <Pen size={16} />, tip: 'Brush (B)' },
      { id: 'pen', icon: <PenTool size={16} />, tip: 'Pen/Bezier (N)' },
      { id: 'eraser', icon: <Eraser size={16} />, tip: 'Eraser (E)' },
    ],
  },
  {
    label: 'Shape',
    tools: [
      { id: 'line', icon: <Minus size={16} />, tip: 'Line (L)' },
      { id: 'arrow', icon: <ArrowRight size={16} />, tip: 'Arrow' },
      { id: 'bezier', icon: <Spline size={16} />, tip: 'Bezier Curve' },
      { id: 'polygon', icon: <Pentagon size={16} />, tip: 'Polygon' },
    ],
  },
  {
    label: 'Text',
    tools: [
      { id: 'text', icon: <Type size={16} />, tip: 'Text (T)' },
      { id: 'text-path', icon: <Type size={16} />, tip: 'Text on Path' },
    ],
  },
  {
    label: 'Other',
    tools: [
      { id: 'eyedropper', icon: <Pipette size={16} />, tip: 'Eyedropper (I)' },
      { id: 'hand', icon: <Hand size={16} />, tip: 'Pan (H)' },
      { id: 'zoom', icon: <ZoomIn size={16} />, tip: 'Zoom (Z)' },
    ],
  },
];

export default function DrawingToolbar({
  activeTool, setActiveTool,
  strokeColor, setStrokeColor,
  fillColor, setFillColor,
  strokeWidth, setStrokeWidth,
  brushSize, setBrushSize,
  brushOpacity, setBrushOpacity,
  brushHardness, setBrushHardness,
  eraserSize, setEraserSize,
  eraserMode, setEraserMode,
  fillType, setFillType,
  fontSize, setFontSize,
  fontFamily, setFontFamily,
  textBold, setTextBold,
  textItalic, setTextItalic,
  showGrid, setShowGrid,
  snapToGrid, setSnapToGrid,
  canvasWidth, canvasHeight, setCanvasSize,
  canvasBg, setCanvasBg,
  onUndo, onRedo, onExport,
  canUndo, canRedo,
}: DrawingToolbarProps) {
  const [showExport, setShowExport] = useState(false);
  const [exportDpi, setExportDpi] = useState(96);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [customW, setCustomW] = useState(canvasWidth);
  const [customH, setCustomH] = useState(canvasHeight);

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active
      ? 'bg-blue-600 text-white'
      : 'text-gray-300 hover:bg-white/10 hover:text-white'}`;

  const sectionLabel = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1';

  return (
    <div
      className="flex flex-col gap-3 p-2 overflow-y-auto"
      style={{ width: 52, background: 'var(--sidebar, #1e293b)', borderRight: '1px solid var(--border, #334155)', minHeight: '100%' }}
    >
      {/* Undo / Redo */}
      <div className="flex flex-col gap-1">
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded transition-colors ${canUndo ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}>
          <Undo2 size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)"
          className={`p-1.5 rounded transition-colors ${canRedo ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}>
          <Redo2 size={16} />
        </button>
      </div>

      <div className="border-t border-white/10" />

      {/* Tool groups */}
      {TOOL_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          {group.tools.map((t) => (
            <button
              key={t.id}
              title={t.tip}
              onClick={() => setActiveTool(t.id)}
              className={btn(activeTool === t.id)}
            >
              {t.icon}
            </button>
          ))}
          <div className="border-t border-white/10 mt-1" />
        </div>
      ))}

      {/* Colors */}
      <div className="flex flex-col gap-1">
        <div title="Stroke Color" className="relative">
          <div
            className="w-7 h-7 rounded border-2 border-white/30 cursor-pointer mx-auto"
            style={{ background: strokeColor }}
          />
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            title="Stroke Color"
          />
        </div>
        <div title="Fill Color" className="relative">
          <div
            className="w-7 h-7 rounded border-2 border-white/10 cursor-pointer mx-auto"
            style={{ background: fillType === 'solid' ? fillColor : 'linear-gradient(45deg, #3b82f6, #8b5cf6)' }}
          />
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            title="Fill Color"
          />
        </div>
      </div>

      <div className="border-t border-white/10" />

      {/* Grid & Snap */}
      <div className="flex flex-col gap-1">
        <button title={`Grid ${showGrid ? 'ON' : 'OFF'}`} onClick={() => setShowGrid(!showGrid)}
          className={btn(showGrid)}>
          <Grid size={16} />
        </button>
        <button title={`Snap ${snapToGrid ? 'ON' : 'OFF'}`} onClick={() => setSnapToGrid(!snapToGrid)}
          className={btn(snapToGrid)}>
          <Magnet size={16} />
        </button>
      </div>

      <div className="border-t border-white/10" />

      {/* Canvas Settings */}
      <div className="flex flex-col gap-1">
        <button title="Canvas Settings" onClick={() => setShowCanvasSettings(!showCanvasSettings)}
          className={btn(showCanvasSettings)}>
          <Settings size={16} />
        </button>
        <button title="Export" onClick={() => setShowExport(!showExport)}
          className={btn(showExport)}>
          <Download size={16} />
        </button>
      </div>

      {/* Canvas Settings popup (absolute) */}
      {showCanvasSettings && (
        <div
          className="absolute left-14 top-40 z-50 p-3 rounded-lg shadow-xl flex flex-col gap-2 text-sm"
          style={{ background: '#1e293b', border: '1px solid #334155', width: 220 }}
        >
          <p className="font-semibold text-white text-xs mb-1">Canvas Settings</p>
          <label className="text-gray-400 text-xs">Presets</label>
          <select
            className="bg-gray-800 text-white rounded px-2 py-1 text-xs"
            onChange={(e) => {
              const p = CANVAS_PRESETS[+e.target.value];
              if (p) { setCustomW(p.w); setCustomH(p.h); setCanvasSize(p.w, p.h); }
            }}
          >
            <option value="">Choose preset…</option>
            {CANVAS_PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.label} ({p.w}×{p.h})</option>
            ))}
          </select>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-gray-400 text-xs">Width</label>
              <input type="number" value={customW} min={100} max={10000}
                onChange={(e) => setCustomW(+e.target.value)}
                className="bg-gray-800 text-white rounded px-2 py-1 text-xs w-full" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-gray-400 text-xs">Height</label>
              <input type="number" value={customH} min={100} max={10000}
                onChange={(e) => setCustomH(+e.target.value)}
                className="bg-gray-800 text-white rounded px-2 py-1 text-xs w-full" />
            </div>
          </div>
          <label className="text-gray-400 text-xs">Background</label>
          <div className="flex gap-2 items-center">
            {['white', 'transparent', '#0f172a', '#1e293b'].map((bg) => (
              <button key={bg} onClick={() => setCanvasBg(bg)}
                className={`w-6 h-6 rounded border-2 ${canvasBg === bg ? 'border-blue-400' : 'border-white/20'}`}
                style={{ background: bg === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px' : bg }}
                title={bg}
              />
            ))}
            <input type="color" value={canvasBg.startsWith('#') ? canvasBg : '#ffffff'}
              onChange={(e) => setCanvasBg(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-white/20" title="Custom color" />
          </div>
          <button
            onClick={() => { setCanvasSize(customW, customH); setShowCanvasSettings(false); }}
            className="mt-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded px-3 py-1"
          >Apply</button>
        </div>
      )}

      {/* Export popup */}
      {showExport && (
        <div
          className="absolute left-14 bottom-4 z-50 p-3 rounded-lg shadow-xl flex flex-col gap-2 text-sm"
          style={{ background: '#1e293b', border: '1px solid #334155', width: 200 }}
        >
          <p className="font-semibold text-white text-xs mb-1">Export Drawing</p>
          <label className="text-gray-400 text-xs">DPI</label>
          <input type="number" value={exportDpi} min={72} max={600} step={72}
            onChange={(e) => setExportDpi(+e.target.value)}
            className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
          {(['png', 'svg', 'pdf'] as const).map((fmt) => (
            <button key={fmt} onClick={() => { onExport(fmt, exportDpi); setShowExport(false); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded px-3 py-1 uppercase font-semibold">
              Export as {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Horizontal options bar (shown below main toolbar) ---------- */
interface ToolOptionsBarProps {
  activeTool: DrawTool;
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
  fillType: FillType;
  setFillType: (t: FillType) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  textBold: boolean;
  setTextBold: (b: boolean) => void;
  textItalic: boolean;
  setTextItalic: (i: boolean) => void;
}

export function ToolOptionsBar({
  activeTool,
  strokeWidth, setStrokeWidth,
  brushSize, setBrushSize,
  brushOpacity, setBrushOpacity,
  brushHardness, setBrushHardness,
  eraserSize, setEraserSize,
  eraserMode, setEraserMode,
  fillType, setFillType,
  fontSize, setFontSize,
  fontFamily, setFontFamily,
  textBold, setTextBold,
  textItalic, setTextItalic,
}: ToolOptionsBarProps) {
  const labelCls = 'text-gray-400 text-xs whitespace-nowrap';
  const inputCls = 'bg-gray-800 text-white rounded px-2 py-0.5 text-xs w-16';

  return (
    <div
      className="flex items-center gap-4 px-3 py-1.5 text-xs overflow-x-auto"
      style={{ background: '#1a2535', borderBottom: '1px solid #334155', minHeight: 36 }}
    >
      {/* Pencil options */}
      {activeTool === 'pencil' && <>
        <span className={labelCls}>Size</span>
        <input type="range" min={1} max={50} value={strokeWidth}
          onChange={(e) => setStrokeWidth(+e.target.value)} className="w-24 accent-blue-500" />
        <span className="text-white">{strokeWidth}px</span>
      </>}

      {/* Brush options */}
      {activeTool === 'brush' && <>
        <span className={labelCls}>Size</span>
        <input type="range" min={1} max={100} value={brushSize}
          onChange={(e) => setBrushSize(+e.target.value)} className="w-20 accent-blue-500" />
        <span className="text-white">{brushSize}px</span>
        <div className="w-px h-4 bg-white/20" />
        <span className={labelCls}>Opacity</span>
        <input type="range" min={0} max={1} step={0.05} value={brushOpacity}
          onChange={(e) => setBrushOpacity(+e.target.value)} className="w-20 accent-blue-500" />
        <span className="text-white">{Math.round(brushOpacity * 100)}%</span>
        <div className="w-px h-4 bg-white/20" />
        <span className={labelCls}>Hardness</span>
        <input type="range" min={0} max={1} step={0.05} value={brushHardness}
          onChange={(e) => setBrushHardness(+e.target.value)} className="w-20 accent-blue-500" />
        <span className="text-white">{Math.round(brushHardness * 100)}%</span>
      </>}

      {/* Eraser options */}
      {activeTool === 'eraser' && <>
        <span className={labelCls}>Mode</span>
        {(['pixel', 'object'] as const).map((m) => (
          <button key={m} onClick={() => setEraserMode(m)}
            className={`px-2 py-0.5 rounded text-xs capitalize ${eraserMode === m ? 'bg-blue-600 text-white' : 'text-gray-300 bg-gray-800'}`}>
            {m}
          </button>
        ))}
        <div className="w-px h-4 bg-white/20" />
        <span className={labelCls}>Size</span>
        <input type="range" min={2} max={120} value={eraserSize}
          onChange={(e) => setEraserSize(+e.target.value)} className="w-24 accent-blue-500" />
        <span className="text-white">{eraserSize}px</span>
      </>}

      {/* Line / Arrow options */}
      {(activeTool === 'line' || activeTool === 'arrow') && <>
        <span className={labelCls}>Width</span>
        <input type="range" min={1} max={30} value={strokeWidth}
          onChange={(e) => setStrokeWidth(+e.target.value)} className="w-24 accent-blue-500" />
        <span className="text-white">{strokeWidth}px</span>
      </>}

      {/* Fill type for shapes */}
      {(activeTool === 'bezier' || activeTool === 'polygon') && <>
        <span className={labelCls}>Fill</span>
        {(['solid', 'linear-gradient', 'radial-gradient', 'pattern'] as FillType[]).map((f) => (
          <button key={f} onClick={() => setFillType(f)}
            className={`px-2 py-0.5 rounded text-xs ${fillType === f ? 'bg-blue-600 text-white' : 'text-gray-300 bg-gray-800'}`}>
            {f === 'solid' ? 'Solid' : f === 'linear-gradient' ? 'Linear' : f === 'radial-gradient' ? 'Radial' : 'Pattern'}
          </button>
        ))}
        <div className="w-px h-4 bg-white/20" />
        <span className={labelCls}>Stroke</span>
        <input type="range" min={0} max={20} value={strokeWidth}
          onChange={(e) => setStrokeWidth(+e.target.value)} className="w-20 accent-blue-500" />
        <span className="text-white">{strokeWidth}px</span>
      </>}

      {/* Text options */}
      {(activeTool === 'text' || activeTool === 'text-path') && <>
        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
          className="bg-gray-800 text-white rounded px-2 py-0.5 text-xs">
          {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <input type="number" value={fontSize} min={8} max={200}
          onChange={(e) => setFontSize(+e.target.value)}
          className={inputCls} />
        <button onClick={() => setTextBold(!textBold)}
          className={`px-2 py-0.5 rounded text-xs font-bold ${textBold ? 'bg-blue-600 text-white' : 'text-gray-300 bg-gray-800'}`}>
          <Bold size={12} />
        </button>
        <button onClick={() => setTextItalic(!textItalic)}
          className={`px-2 py-0.5 rounded text-xs italic ${textItalic ? 'bg-blue-600 text-white' : 'text-gray-300 bg-gray-800'}`}>
          <Italic size={12} />
        </button>
        {activeTool === 'text-path' && (
          <span className="text-yellow-400 text-xs">Click on a curve to place text along path</span>
        )}
      </>}

      {activeTool === 'pen' && (
        <span className="text-gray-400 text-xs">Click to add points • Double-click to close • Backspace removes last point</span>
      )}
      {activeTool === 'lasso' && (
        <span className="text-gray-400 text-xs">Draw freehand selection • Release to close</span>
      )}
      {activeTool === 'marquee' && (
        <span className="text-gray-400 text-xs">Drag to select rectangular region</span>
      )}
      {activeTool === 'eyedropper' && (
        <span className="text-gray-400 text-xs">Click to pick stroke color • Shift+click for fill color</span>
      )}
    </div>
  );
}
