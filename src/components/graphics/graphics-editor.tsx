'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

// Types
interface Point { x: number; y: number; }
interface ShapeBase {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  label: string;
  locked: boolean;
  visible: boolean;
}
interface RectShape extends ShapeBase { type: 'rect'; borderRadius: number; }
interface EllipseShape extends ShapeBase { type: 'ellipse'; }
interface DiamondShape extends ShapeBase { type: 'diamond'; }
interface TriangleShape extends ShapeBase { type: 'triangle'; }
interface StarShape extends ShapeBase { type: 'star'; points: number; innerRadius: number; }
interface ArrowShape extends ShapeBase { type: 'arrow'; startPoint: Point; endPoint: Point; }
interface TextShape extends ShapeBase { type: 'text'; text: string; fontSize: number; fontFamily: string; }
interface LineShape extends ShapeBase { type: 'line'; startPoint: Point; endPoint: Point; lineStyle: 'solid' | 'dashed' | 'dotted'; }

type Shape = RectShape | EllipseShape | DiamondShape | TriangleShape | StarShape | ArrowShape | TextShape | LineShape;
type Tool = 'select' | 'rect' | 'ellipse' | 'diamond' | 'triangle' | 'star' | 'arrow' | 'text' | 'line' | 'pen' | 'hand';

const COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1'];
const TEMPLATES = [
  { name: 'Flowchart', shapes: ['rect','diamond','ellipse','arrow'] },
  { name: 'Org Chart', shapes: ['rect','arrow'] },
  { name: 'Mind Map', shapes: ['ellipse','line'] },
  { name: 'Network Diagram', shapes: ['ellipse','line','rect'] },
  { name: 'UML Class', shapes: ['rect','arrow','line'] },
  { name: 'BPMN Process', shapes: ['rect','diamond','ellipse','arrow'] },
  { name: 'Wireframe', shapes: ['rect','text','line'] },
  { name: 'ER Diagram', shapes: ['rect','diamond','line'] },
];

let idCounter = 0;
const genId = () => `shape_${++idCounter}_${Date.now()}`;

const createShape = (type: Shape['type'], x: number, y: number): Shape => {
  const base: ShapeBase = {
    id: genId(), x, y, width: 120, height: 80, rotation: 0,
    fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, opacity: 1,
    label: '', locked: false, visible: true,
  };
  switch (type) {
    case 'rect': return { ...base, type: 'rect', borderRadius: 8 };
    case 'ellipse': return { ...base, type: 'ellipse' };
    case 'diamond': return { ...base, type: 'diamond' };
    case 'triangle': return { ...base, type: 'triangle' };
    case 'star': return { ...base, type: 'star', points: 5, innerRadius: 0.4 };
    case 'arrow': return { ...base, type: 'arrow', startPoint: { x, y: y+40 }, endPoint: { x: x+120, y: y+40 } };
    case 'text': return { ...base, type: 'text', text: 'Text', fontSize: 16, fontFamily: 'Inter', fill: 'transparent', stroke: 'transparent' };
    case 'line': return { ...base, type: 'line', startPoint: { x, y: y+40 }, endPoint: { x: x+120, y: y+40 }, lineStyle: 'solid' };
    default: return { ...base, type: 'rect', borderRadius: 8 };
  }
};

export default function GraphicsEditor() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showLayers, setShowLayers] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedShape = shapes.find(s => s.id === selectedId);

  const pushHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const addShape = useCallback((type: Shape['type']) => {
    const cx = (-pan.x + 400) / zoom;
    const cy = (-pan.y + 300) / zoom;
    const shape = createShape(type, cx, cy);
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    pushHistory(newShapes);
    setSelectedId(shape.id);
    setTool('select');
  }, [shapes, pan, zoom, pushHistory]);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    const newShapes = shapes.map(s => s.id === id ? { ...s, ...updates } as Shape : s);
    setShapes(newShapes);
    pushHistory(newShapes);
  }, [shapes, pushHistory]);

  const deleteShape = useCallback((id: string) => {
    const newShapes = shapes.filter(s => s.id !== id);
    setShapes(newShapes);
    pushHistory(newShapes);
    if (selectedId === id) setSelectedId(null);
  }, [shapes, selectedId, pushHistory]);

  const duplicateShape = useCallback((id: string) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    const dup = { ...shape, id: genId(), x: shape.x + 20, y: shape.y + 20 };
    const newShapes = [...shapes, dup as Shape];
    setShapes(newShapes);
    pushHistory(newShapes);
    setSelectedId(dup.id);
  }, [shapes, pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) deleteShape(selectedId);
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 'd' && selectedId) { e.preventDefault(); duplicateShape(selectedId); }
      if (e.key === 'Escape') { setSelectedId(null); setTool('select'); }
      if (e.key === 'v') setTool('select');
      if (e.key === 'r') setTool('rect');
      if (e.key === 'o') setTool('ellipse');
      if (e.key === 't') setTool('text');
      if (e.key === 'l') setTool('line');
      if (e.key === 'a') setTool('arrow');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, deleteShape, undo, redo, duplicateShape]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool === 'select') { setSelectedId(null); return; }
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
    if (tool !== 'hand' && tool !== 'pen') addShape(tool as Shape['type']);
  };

  const handleShapeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const shape = shapes.find(s => s.id === id);
    if (shape?.locked) return;
    setSelectedId(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    setDragStart({ x: e.clientX, y: e.clientY });
    updateShape(selectedId, { x: (selectedShape?.x || 0) + dx, y: (selectedShape?.y || 0) + dy });
  };

  const handleMouseUp = () => setIsDragging(false);

  const renderShape = (shape: Shape) => {
    const isSelected = shape.id === selectedId;
    const commonProps = {
      key: shape.id,
      onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, shape.id),
      style: { cursor: shape.locked ? 'not-allowed' : 'move', opacity: shape.opacity },
    };
    const sel = isSelected ? <rect x={shape.x-4} y={shape.y-4} width={shape.width+8} height={shape.height+8} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" rx={4} /> : null;
    switch (shape.type) {
      case 'rect':
        return <g {...commonProps}>{sel}<rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} rx={shape.borderRadius} />{shape.label && <text x={shape.x+shape.width/2} y={shape.y+shape.height/2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12}>{shape.label}</text>}</g>;
      case 'ellipse':
        return <g {...commonProps}>{sel}<ellipse cx={shape.x+shape.width/2} cy={shape.y+shape.height/2} rx={shape.width/2} ry={shape.height/2} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />{shape.label && <text x={shape.x+shape.width/2} y={shape.y+shape.height/2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12}>{shape.label}</text>}</g>;
      case 'diamond':
        const dx = shape.x, dy = shape.y, dw = shape.width, dh = shape.height;
        return <g {...commonProps}>{sel}<polygon points={`${dx+dw/2},${dy} ${dx+dw},${dy+dh/2} ${dx+dw/2},${dy+dh} ${dx},${dy+dh/2}`} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />{shape.label && <text x={dx+dw/2} y={dy+dh/2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12}>{shape.label}</text>}</g>;
      case 'triangle':
        const tx = shape.x, ty = shape.y, tw = shape.width, th = shape.height;
        return <g {...commonProps}>{sel}<polygon points={`${tx+tw/2},${ty} ${tx+tw},${ty+th} ${tx},${ty+th}`} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />{shape.label && <text x={tx+tw/2} y={ty+th*0.6} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12}>{shape.label}</text>}</g>;
      case 'text':
        return <g {...commonProps}>{sel}<text x={shape.x} y={shape.y+shape.height/2} fontSize={shape.fontSize} fontFamily={shape.fontFamily} fill="var(--text-primary, #e2e8f0)" dominantBaseline="middle">{shape.text}</text></g>;
      case 'arrow':
        return <g {...commonProps}>{sel}<line x1={shape.startPoint.x} y1={shape.startPoint.y} x2={shape.endPoint.x} y2={shape.endPoint.y} stroke={shape.stroke} strokeWidth={shape.strokeWidth} markerEnd="url(#arrowhead)" /></g>;
      case 'line':
        return <g {...commonProps}>{sel}<line x1={shape.startPoint.x} y1={shape.startPoint.y} x2={shape.endPoint.x} y2={shape.endPoint.y} stroke={shape.stroke} strokeWidth={shape.strokeWidth} strokeDasharray={shape.lineStyle === 'dashed' ? '8 4' : shape.lineStyle === 'dotted' ? '2 2' : 'none'} /></g>;
      case 'star':
        const sx = shape.x + shape.width/2, sy = shape.y + shape.height/2;
        const outerR = Math.min(shape.width, shape.height) / 2;
        const innerR = outerR * shape.innerRadius;
        const pts = Array.from({length: shape.points * 2}, (_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI * i) / shape.points - Math.PI / 2;
          return `${sx + r * Math.cos(angle)},${sy + r * Math.sin(angle)}`;
        }).join(' ');
        return <g {...commonProps}>{sel}<polygon points={pts} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} /></g>;
      default: return null;
    }
  };

  const tools: { id: Tool; label: string; icon: string }[] = [
    { id: 'select', label: 'Select (V)', icon: '\u25B3' },
    { id: 'rect', label: 'Rectangle (R)', icon: '\u25A1' },
    { id: 'ellipse', label: 'Ellipse (O)', icon: '\u25CB' },
    { id: 'diamond', label: 'Diamond', icon: '\u25C7' },
    { id: 'triangle', label: 'Triangle', icon: '\u25B3' },
    { id: 'star', label: 'Star', icon: '\u2606' },
    { id: 'arrow', label: 'Arrow (A)', icon: '\u2192' },
    { id: 'line', label: 'Line (L)', icon: '\u2014' },
    { id: 'text', label: 'Text (T)', icon: 'T' },
    { id: 'hand', label: 'Pan', icon: '\u270B' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary,#0f172a)] text-[var(--text-primary,#e2e8f0)]">
      {/* Top Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-secondary,#1e293b)] border-b border-[var(--border-color,#334155)]">
        <div className="flex items-center gap-1 mr-4">
          {tools.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
              className={`px-2 py-1.5 rounded text-sm transition-colors ${tool === t.id ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
              {t.icon}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-[var(--border-color,#334155)]" />
        <button onClick={undo} title="Undo (Ctrl+Z)" className="px-2 py-1.5 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">\u21A9</button>
        <button onClick={redo} title="Redo (Ctrl+Y)" className="px-2 py-1.5 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">\u21AA</button>
        <div className="h-6 w-px bg-[var(--border-color,#334155)]" />
        <button onClick={() => setShowGrid(!showGrid)} className={`px-2 py-1.5 rounded text-sm ${showGrid ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>Grid</button>
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={`px-2 py-1.5 rounded text-sm ${snapToGrid ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>Snap</button>
        <div className="h-6 w-px bg-[var(--border-color,#334155)]" />
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">-</button>
        <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">+</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">Fit</button>
        <div className="flex-1" />
        <button onClick={() => setShowLayers(!showLayers)} className={`px-2 py-1.5 rounded text-sm ${showLayers ? 'bg-blue-600/30 text-blue-400' : ''}`}>Layers</button>
        <button onClick={() => setShowProperties(!showProperties)} className={`px-2 py-1.5 rounded text-sm ${showProperties ? 'bg-blue-600/30 text-blue-400' : ''}`}>Props</button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Templates & Layers */}
        {showLayers && (
          <div className="w-56 bg-[var(--bg-secondary,#1e293b)] border-r border-[var(--border-color,#334155)] flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-[var(--border-color,#334155)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)] mb-2">Templates</h3>
              <div className="grid grid-cols-2 gap-1">
                {TEMPLATES.map(tmpl => (
                  <button key={tmpl.name} className="px-2 py-1.5 text-[10px] rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-blue-600/20 text-left truncate transition-colors" title={tmpl.name}>
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)] mb-2">Shapes ({shapes.length})</h3>
              <div className="space-y-1">
                {shapes.map((s, i) => (
                  <div key={s.id} onClick={() => setSelectedId(s.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${s.id === selectedId ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: s.fill }} />
                    <span className="flex-1 truncate">{s.label || `${s.type} ${i+1}`}</span>
                    {s.locked && <span className="text-[10px]">\uD83D\uDD12</span>}
                    <button onClick={(e) => { e.stopPropagation(); deleteShape(s.id); }} className="text-red-400 hover:text-red-300 text-[10px]">\u2715</button>
                  </div>
                ))}
                {shapes.length === 0 && <p className="text-xs text-[var(--text-secondary,#94a3b8)] italic">Click canvas to add shapes</p>}
              </div>
            </div>
          </div>
        )}

        {/* SVG Canvas */}
        <div className="flex-1 overflow-hidden relative bg-[var(--bg-tertiary,#0f172a)]">
          <svg ref={svgRef} className="w-full h-full" onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
            onWheel={(e) => { e.preventDefault(); setZoom(z => Math.max(0.25, Math.min(4, z + (e.deltaY > 0 ? -0.05 : 0.05)))); }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-primary,#e2e8f0)" />
              </marker>
              {showGrid && <pattern id="grid" width={gridSize * zoom} height={gridSize * zoom} patternUnits="userSpaceOnUse">
                <path d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`} fill="none" stroke="var(--border-color,#334155)" strokeWidth="0.5" opacity={0.3} />
              </pattern>}
            </defs>
            {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {shapes.filter(s => s.visible).map(renderShape)}
            </g>
          </svg>
          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-4 px-3 py-1 bg-[var(--bg-secondary,#1e293b)]/90 border-t border-[var(--border-color,#334155)] text-[10px] text-[var(--text-secondary,#94a3b8)]">
            <span>Objects: {shapes.length}</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>Tool: {tool}</span>
            {selectedShape && <span>Selected: {selectedShape.label || selectedShape.type}</span>}
          </div>
        </div>

        {/* Right Panel - Properties */}
        {showProperties && selectedShape && (
          <div className="w-60 bg-[var(--bg-secondary,#1e293b)] border-l border-[var(--border-color,#334155)] overflow-y-auto p-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">Properties</h3>
            <div className="space-y-2">
              <label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">Label</label>
              <input value={selectedShape.label} onChange={e => updateShape(selectedShape.id, { label: e.target.value })}
                className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">X</label>
                <input type="number" value={Math.round(selectedShape.x)} onChange={e => updateShape(selectedShape.id, { x: +e.target.value })}
                  className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" /></div>
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">Y</label>
                <input type="number" value={Math.round(selectedShape.y)} onChange={e => updateShape(selectedShape.id, { y: +e.target.value })}
                  className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" /></div>
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">W</label>
                <input type="number" value={Math.round(selectedShape.width)} onChange={e => updateShape(selectedShape.id, { width: +e.target.value })}
                  className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" /></div>
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">H</label>
                <input type="number" value={Math.round(selectedShape.height)} onChange={e => updateShape(selectedShape.id, { height: +e.target.value })}
                  className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" /></div>
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Fill</label>
              <div className="flex gap-1 flex-wrap">
                {COLORS.map(c => <button key={c} onClick={() => updateShape(selectedShape.id, { fill: c })} className={`w-5 h-5 rounded border-2 ${selectedShape.fill === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Stroke</label>
              <div className="flex gap-1 flex-wrap">
                {COLORS.map(c => <button key={c} onClick={() => updateShape(selectedShape.id, { stroke: c })} className={`w-5 h-5 rounded border-2 ${selectedShape.stroke === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">Opacity</label>
              <input type="range" min={0} max={1} step={0.1} value={selectedShape.opacity} onChange={e => updateShape(selectedShape.id, { opacity: +e.target.value })} className="w-full" /></div>
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)]">Stroke Width</label>
              <input type="range" min={0} max={10} step={1} value={selectedShape.strokeWidth} onChange={e => updateShape(selectedShape.id, { strokeWidth: +e.target.value })} className="w-full" /></div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => duplicateShape(selectedShape.id)} className="flex-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs text-white">Duplicate</button>
              <button onClick={() => updateShape(selectedShape.id, { locked: !selectedShape.locked })} className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-xs">{selectedShape.locked ? 'Unlock' : 'Lock'}</button>
            </div>
            <button onClick={() => deleteShape(selectedShape.id)} className="w-full px-2 py-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}