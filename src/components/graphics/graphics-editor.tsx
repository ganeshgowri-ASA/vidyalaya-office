'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
interface Point { x: number; y: number; }
interface ShapeBase { id: string; x: number; y: number; width: number; height: number; rotation: number; fill: string; stroke: string; strokeWidth: number; opacity: number; label: string; locked: boolean; visible: boolean; }
interface RectShape extends ShapeBase { type: 'rect'; borderRadius: number; }
interface EllipseShape extends ShapeBase { type: 'ellipse'; }
interface DiamondShape extends ShapeBase { type: 'diamond'; }
interface TriangleShape extends ShapeBase { type: 'triangle'; }
interface StarShape extends ShapeBase { type: 'star'; points: number; innerRadius: number; }
interface ArrowShape extends ShapeBase { type: 'arrow'; startPoint: Point; endPoint: Point; }
interface TextShape extends ShapeBase { type: 'text'; text: string; fontSize: number; fontFamily: string; }
interface LineShape extends ShapeBase { type: 'line'; startPoint: Point; endPoint: Point; lineStyle: 'solid'|'dashed'|'dotted'; }
interface HexagonShape extends ShapeBase { type: 'hexagon'; }
interface CloudShape extends ShapeBase { type: 'cloud'; }
interface CylinderShape extends ShapeBase { type: 'cylinder'; }
type Shape = RectShape|EllipseShape|DiamondShape|TriangleShape|StarShape|ArrowShape|TextShape|LineShape|HexagonShape|CloudShape|CylinderShape;
type Tool = 'select'|'rect'|'ellipse'|'diamond'|'triangle'|'star'|'arrow'|'text'|'line'|'pen'|'hand'|'hexagon'|'cloud'|'cylinder';
const COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1','#ffffff','#000000','#64748b'];
const TEMPLATE_CATEGORIES = [
  { name: 'Diagrams', icon: '⚡', collapsed: false, templates: [
    { name: 'Flowchart', icon: '➡', desc: 'Process flow diagram' },
    { name: 'Mind Map', icon: '🧠', desc: 'Brainstorming & ideas' },
    { name: 'Org Chart', icon: '🏢', desc: 'Organization hierarchy' },
    { name: 'ER Diagram', icon: '🗃', desc: 'Entity relationship' },
    { name: 'UML Class', icon: '📁', desc: 'Class diagrams' },
    { name: 'Sequence Diagram', icon: '↔', desc: 'Interaction sequence' },
    { name: 'BPMN Process', icon: '⚙', desc: 'Business process model' },
    { name: 'Network Diagram', icon: '🌐', desc: 'Network topology' },
    { name: 'Data Flow', icon: '🔄', desc: 'Data flow diagram' },
    { name: 'State Machine', icon: '⚡', desc: 'State transitions' },
  ]},
  { name: 'Infographics', icon: '📈', collapsed: false, templates: [
    { name: 'Timeline', icon: '⏰', desc: 'Timeline infographic' },
    { name: 'Statistics', icon: '📈', desc: 'Stats & numbers' },
    { name: 'Comparison', icon: '⚖', desc: 'Compare items side by side' },
    { name: 'Process Steps', icon: '👣', desc: 'Step by step guide' },
    { name: 'Pie Chart', icon: '🥧', desc: 'Pie chart layout' },
    { name: 'Bar Chart', icon: '📊', desc: 'Bar chart layout' },
    { name: 'Pyramid', icon: '🔺', desc: 'Hierarchy pyramid' },
    { name: 'Cycle Diagram', icon: '🔄', desc: 'Circular process' },
    { name: 'Venn Diagram', icon: '⭕', desc: 'Overlapping sets' },
    { name: 'SWOT Analysis', icon: '📋', desc: 'Strengths weaknesses' },
  ]},
  { name: 'Marketing', icon: '📢', collapsed: true, templates: [
    { name: 'Social Media Post', icon: '📱', desc: 'Instagram/Facebook post' },
    { name: 'Banner Ad', icon: '🏷', desc: 'Web banner design' },
    { name: 'Poster', icon: '📌', desc: 'Event/product poster' },
    { name: 'Brochure', icon: '📄', desc: 'Tri-fold brochure' },
    { name: 'Business Card', icon: '💼', desc: 'Professional card' },
    { name: 'Logo Design', icon: '⭐', desc: 'Brand logo canvas' },
    { name: 'Flyer', icon: '📨', desc: 'Promotional flyer' },
    { name: 'Certificate', icon: '🏆', desc: 'Award certificate' },
  ]},
  { name: 'Education', icon: '🎓', collapsed: true, templates: [
    { name: 'Lesson Plan', icon: '📚', desc: 'Class lesson layout' },
    { name: 'Flashcard', icon: '🎴', desc: 'Study flashcard' },
    { name: 'Quiz Layout', icon: '❓', desc: 'Quiz/test template' },
    { name: 'Schedule', icon: '📅', desc: 'Class schedule' },
    { name: 'Report Card', icon: '📋', desc: 'Student report' },
    { name: 'Worksheet', icon: '✏', desc: 'Activity worksheet' },
  ]},
  { name: 'Wireframes', icon: '🖥', collapsed: true, templates: [
    { name: 'Mobile App', icon: '📱', desc: 'Mobile wireframe' },
    { name: 'Web Page', icon: '🌐', desc: 'Website wireframe' },
    { name: 'Dashboard', icon: '📊', desc: 'Analytics dashboard' },
    { name: 'Landing Page', icon: '📄', desc: 'Marketing landing' },
    { name: 'Form Layout', icon: '📝', desc: 'Input form design' },
  ]},
];
let idCounter = 0;
const genId = () => `shape_${++idCounter}_${Date.now()}`;
const createShape = (type: Shape['type'], x: number, y: number): Shape => {
  const base: ShapeBase = { id: genId(), x, y, width: 120, height: 80, rotation: 0, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, opacity: 1, label: '', locked: false, visible: true };
  switch (type) {
    case 'rect': return { ...base, type: 'rect', borderRadius: 8 };
    case 'ellipse': return { ...base, type: 'ellipse' };
    case 'diamond': return { ...base, type: 'diamond' };
    case 'triangle': return { ...base, type: 'triangle' };
    case 'hexagon': return { ...base, type: 'hexagon' };
    case 'cloud': return { ...base, type: 'cloud' };
    case 'cylinder': return { ...base, type: 'cylinder' };
    case 'star': return { ...base, type: 'star', points: 5, innerRadius: 0.4 };
    case 'arrow': return { ...base, type: 'arrow', startPoint: { x, y: y+40 }, endPoint: { x: x+120, y: y+40 } };
    case 'text': return { ...base, type: 'text', text: 'Text', fontSize: 16, fontFamily: 'Inter', fill: 'transparent', stroke: 'transparent' };
    case 'line': return { ...base, type: 'line', startPoint: { x, y: y+40 }, endPoint: { x: x+120, y: y+40 }, lineStyle: 'solid' };
    default: return { ...base, type: 'rect', borderRadius: 8 };
  }
};
export default function GraphicsEditor() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(20);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showLayers, setShowLayers] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions] = useState(['Create a flowchart for user login','Design an org chart for a startup','Make an infographic about climate change','Create a mind map for project planning','Design a social media post template','Build a wireframe for a mobile app']);
  const [collapsedCats, setCollapsedCats] = useState<Record<string,boolean>>({});
  const [activeTemplateTab, setActiveTemplateTab] = useState('Diagrams');
  const svgRef = useRef<SVGSVGElement>(null);
  const selectedShape = shapes.find(s => s.id === selectedId);
  const pushHistory = useCallback((ns: Shape[]) => { const h = history.slice(0, historyIndex+1); h.push(ns); setHistory(h); setHistoryIndex(h.length-1); }, [history, historyIndex]);
  const undo = useCallback(() => { if (historyIndex > 0) { setHistoryIndex(historyIndex-1); setShapes(history[historyIndex-1]); } }, [historyIndex, history]);
  const redo = useCallback(() => { if (historyIndex < history.length-1) { setHistoryIndex(historyIndex+1); setShapes(history[historyIndex+1]); } }, [historyIndex, history]);
  const addShape = useCallback((type: Shape['type']) => { const cx = (-pan.x+400)/zoom; const cy = (-pan.y+300)/zoom; const s = createShape(type, cx, cy); const ns = [...shapes, s]; setShapes(ns); pushHistory(ns); setSelectedId(s.id); setTool('select'); }, [shapes, pan, zoom, pushHistory]);
  const updateShape = useCallback((id: string, u: Partial<ShapeBase>) => { const ns = shapes.map(s => s.id === id ? { ...s, ...u } as Shape : s); setShapes(ns); pushHistory(ns); }, [shapes, pushHistory]);
  const deleteShape = useCallback((id: string) => { const ns = shapes.filter(s => s.id !== id); setShapes(ns); pushHistory(ns); if (selectedId === id) setSelectedId(null); }, [shapes, selectedId, pushHistory]);
  const duplicateShape = useCallback((id: string) => { const s = shapes.find(s => s.id === id); if (!s) return; const d = { ...s, id: genId(), x: s.x+20, y: s.y+20 }; const ns = [...shapes, d as Shape]; setShapes(ns); pushHistory(ns); setSelectedId(d.id); }, [shapes, pushHistory]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) deleteShape(selectedId);
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 'd' && selectedId) { e.preventDefault(); duplicateShape(selectedId); }
      if (e.key === 'Escape') { setSelectedId(null); setTool('select'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedId, deleteShape, undo, redo, duplicateShape]);
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'select') { setSelectedId(null); return; }
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    if (tool !== 'hand' && tool !== 'pen') addShape(tool as Shape['type']);
  };
  const handleShapeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); const s = shapes.find(s => s.id === id); if (s?.locked) return;
    setSelectedId(id); setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;
    const dx = (e.clientX - dragStart.x) / zoom; const dy = (e.clientY - dragStart.y) / zoom;
    setDragStart({ x: e.clientX, y: e.clientY });
    updateShape(selectedId, { x: (selectedShape?.x||0)+dx, y: (selectedShape?.y||0)+dy });
  };
  const handleMouseUp = () => setIsDragging(false);
  const renderShape = (shape: Shape) => {
    const isSel = shape.id === selectedId;
    const cp = { key: shape.id, onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, shape.id), style: { cursor: shape.locked ? 'not-allowed' : 'move', opacity: shape.opacity } };
    const sel = isSel ? <rect x={shape.x-3} y={shape.y-3} width={shape.width+6} height={shape.height+6} fill="none" stroke="#60a5fa" strokeWidth={2} strokeDasharray="6 3" rx={4}/> : null;
    switch (shape.type) {
      case 'rect': return <g {...cp}>{sel}<rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} rx={shape.borderRadius}/>{shape.label && <text x={shape.x+shape.width/2} y={shape.y+shape.height/2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12}>{shape.label}</text>}</g>;
      case 'ellipse': return <g {...cp}>{sel}<ellipse cx={shape.x+shape.width/2} cy={shape.y+shape.height/2} rx={shape.width/2} ry={shape.height/2} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/>{shape.label && <text x={shape.x+shape.width/2} y={shape.y+shape.height/2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12}>{shape.label}</text>}</g>;
      case 'diamond': return <g {...cp}>{sel}<polygon points={`${shape.x+shape.width/2},${shape.y} ${shape.x+shape.width},${shape.y+shape.height/2} ${shape.x+shape.width/2},${shape.y+shape.height} ${shape.x},${shape.y+shape.height/2}`} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>;
      case 'triangle': return <g {...cp}>{sel}<polygon points={`${shape.x+shape.width/2},${shape.y} ${shape.x+shape.width},${shape.y+shape.height} ${shape.x},${shape.y+shape.height}`} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>;
      case 'text': return <g {...cp}>{sel}<text x={shape.x} y={shape.y+shape.height/2} fill="#e2e8f0" fontSize={(shape as TextShape).fontSize} fontFamily={(shape as TextShape).fontFamily}>{(shape as TextShape).text}</text></g>;
      case 'arrow': return <g {...cp}>{sel}<line x1={(shape as ArrowShape).startPoint.x} y1={(shape as ArrowShape).startPoint.y} x2={(shape as ArrowShape).endPoint.x} y2={(shape as ArrowShape).endPoint.y} stroke={shape.stroke} strokeWidth={shape.strokeWidth} markerEnd="url(#arrowhead)"/></g>;
      case 'line': return <g {...cp}>{sel}<line x1={(shape as LineShape).startPoint.x} y1={(shape as LineShape).startPoint.y} x2={(shape as LineShape).endPoint.x} y2={(shape as LineShape).endPoint.y} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>;
      case 'hexagon': { const cx=shape.x+shape.width/2,cy=shape.y+shape.height/2,r=Math.min(shape.width,shape.height)/2; const pts=Array.from({length:6},(_,i)=>{const a=Math.PI/3*i-Math.PI/2;return`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`}).join(' '); return <g {...cp}>{sel}<polygon points={pts} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>; }
      case 'star': { const cx=shape.x+shape.width/2,cy=shape.y+shape.height/2,or=Math.min(shape.width,shape.height)/2,ir=or*(shape as StarShape).innerRadius; const pts=Array.from({length:(shape as StarShape).points*2},(_,i)=>{const r=i%2===0?or:ir;const a=Math.PI*i/(shape as StarShape).points-Math.PI/2;return`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`}).join(' '); return <g {...cp}>{sel}<polygon points={pts} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>; }
      case 'cloud': return <g {...cp}>{sel}<ellipse cx={shape.x+shape.width/2} cy={shape.y+shape.height/2} rx={shape.width/2} ry={shape.height/2} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/><ellipse cx={shape.x+shape.width*0.3} cy={shape.y+shape.height*0.3} rx={shape.width*0.25} ry={shape.height*0.25} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/><ellipse cx={shape.x+shape.width*0.7} cy={shape.y+shape.height*0.3} rx={shape.width*0.25} ry={shape.height*0.25} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>;
      case 'cylinder': return <g {...cp}>{sel}<rect x={shape.x} y={shape.y+10} width={shape.width} height={shape.height-20} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/><ellipse cx={shape.x+shape.width/2} cy={shape.y+10} rx={shape.width/2} ry={10} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/><ellipse cx={shape.x+shape.width/2} cy={shape.y+shape.height-10} rx={shape.width/2} ry={10} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth}/></g>;
      default: return null;
    }
  };
  const tools: { id: Tool; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: '\u25B3' }, { id: 'rect', label: 'Rectangle', icon: '\u25A1' },
    { id: 'ellipse', label: 'Ellipse', icon: '\u25CB' }, { id: 'diamond', label: 'Diamond', icon: '\u25C7' },
    { id: 'triangle', label: 'Triangle', icon: '\u25B3' }, { id: 'hexagon', label: 'Hexagon', icon: '\u2B21' },
    { id: 'star', label: 'Star', icon: '\u2606' }, { id: 'cloud', label: 'Cloud', icon: '\u2601' },
    { id: 'cylinder', label: 'Cylinder', icon: '\u2B24' }, { id: 'arrow', label: 'Arrow', icon: '\u2192' },
    { id: 'line', label: 'Line', icon: '\u2014' }, { id: 'text', label: 'Text', icon: 'T' },
    { id: 'hand', label: 'Pan', icon: '\u270B' },
  ];
  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary,#0f172a)] text-[var(--text-primary,#e2e8f0)]">
      {/* Top Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)]">
        {tools.map(t => (<button key={t.id} onClick={() => setTool(t.id)} title={t.label} className={`px-2 py-1.5 rounded text-sm transition-colors ${tool === t.id ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>{t.icon}</button>))}
        <div className="w-px h-6 bg-[var(--border-color,#334155)] mx-1"/>
        <button onClick={undo} className="px-2 py-1.5 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">↩</button>
        <button onClick={redo} className="px-2 py-1.5 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">↪</button>
        <div className="w-px h-6 bg-[var(--border-color,#334155)] mx-1"/>
        <button onClick={() => setShowGrid(!showGrid)} className={`px-2 py-1.5 rounded text-sm ${showGrid ? 'bg-blue-600/30 text-blue-400' : ''}`}>Grid</button>
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={`px-2 py-1.5 rounded text-sm ${snapToGrid ? 'bg-blue-600/30 text-blue-400' : ''}`}>Snap</button>
        <div className="flex-1"/>
        <button onClick={() => setZoom(z => Math.max(0.25, z-0.1))} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">-</button>
        <span className="text-xs w-12 text-center">{Math.round(zoom*100)}%</span>
        <button onClick={() => setZoom(z => Math.min(4, z+0.1))} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-sm">+</button>
        <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">Fit</button>
        <div className="w-px h-6 bg-[var(--border-color,#334155)] mx-1"/>
        <button onClick={() => setShowLayers(!showLayers)} className={`px-2 py-1.5 rounded text-sm ${showLayers ? 'bg-blue-600/30 text-blue-400' : ''}`}>Layers</button>
        <button onClick={() => setShowProperties(!showProperties)} className={`px-2 py-1.5 rounded text-sm ${showProperties ? 'bg-blue-600/30 text-blue-400' : ''}`}>Props</button>
        <button onClick={() => setShowAI(!showAI)} className={`px-2 py-1.5 rounded text-sm ${showAI ? 'bg-purple-600/30 text-purple-400' : ''}`}>🤖 AI</button>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Templates & Layers */}
        {showLayers && (<div className="w-64 border-r border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)] mb-2">Templates</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {TEMPLATE_CATEGORIES.map(cat => (<button key={cat.name} onClick={() => setActiveTemplateTab(cat.name)} className={`px-2 py-1 rounded text-[10px] ${activeTemplateTab === cat.name ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>{cat.icon} {cat.name}</button>))}
            </div>
            {TEMPLATE_CATEGORIES.filter(c => c.name === activeTemplateTab).map(cat => (
              <div key={cat.name} className="space-y-1">
                {cat.templates.map(t => (<button key={t.name} onClick={() => addShape('rect')} className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs hover:bg-[var(--bg-hover,#334155)] transition-colors"><span className="text-base">{t.icon}</span><div className="text-left"><div className="font-medium">{t.name}</div><div className="text-[var(--text-secondary,#94a3b8)] text-[10px]">{t.desc}</div></div></button>))}
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border-color,#334155)] p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)] mb-2">Layers ({shapes.length})</h3>
            {shapes.map((s, i) => (<div key={s.id} onClick={() => setSelectedId(s.id)} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${s.id === selectedId ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-[var(--bg-hover,#334155)]'}`}><span>{s.type === 'rect' ? '\u25A1' : s.type === 'ellipse' ? '\u25CB' : s.type === 'text' ? 'T' : '\u25C7'}</span><span className="flex-1 truncate">{s.label || `${s.type} ${i+1}`}</span>{s.locked && <span>🔒</span>}<button onClick={(e) => { e.stopPropagation(); deleteShape(s.id); }} className="text-red-400 hover:text-red-300 text-[10px]">✕</button></div>))}
            {shapes.length === 0 && <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] text-center py-4">Click canvas to add shapes</p>}
          </div>
        </div>)}
        {/* SVG Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[var(--bg-primary,#0f172a)]">
          <svg ref={svgRef} className="w-full h-full" onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={(e) => { e.preventDefault(); setZoom(z => Math.max(0.25, Math.min(4, z + (e.deltaY > 0 ? -0.05 : 0.05)))); }}>
            <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/></marker></defs>
            {showGrid && <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse"><path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#1e293b" strokeWidth="0.5"/></pattern>}
            {showGrid && <rect width="100%" height="100%" fill="url(#grid)"/>}
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>{shapes.filter(s => s.visible).map(renderShape)}</g>
          </svg>
          <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] text-[var(--text-secondary,#94a3b8)] bg-[var(--bg-secondary,#1e293b)]/80 rounded px-2 py-1">
            <span>Objects: {shapes.length}</span><span>Zoom: {Math.round(zoom*100)}%</span><span>Tool: {tool}</span>
            {selectedShape && <span>Selected: {selectedShape.label || selectedShape.type}</span>}
          </div>
        </div>
        {/* Right Panel - Properties */}
        {showProperties && selectedShape && (<div className="w-56 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] overflow-y-auto p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)] mb-3">Properties</h3>
          <div className="space-y-3">
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Label</label><input value={selectedShape.label} onChange={e => updateShape(selectedShape.id, { label: e.target.value })} className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs"/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">X</label><input type="number" value={Math.round(selectedShape.x)} onChange={e => updateShape(selectedShape.id, { x: +e.target.value })} className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs"/></div>
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Y</label><input type="number" value={Math.round(selectedShape.y)} onChange={e => updateShape(selectedShape.id, { y: +e.target.value })} className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs"/></div>
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">W</label><input type="number" value={Math.round(selectedShape.width)} onChange={e => updateShape(selectedShape.id, { width: +e.target.value })} className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs"/></div>
              <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">H</label><input type="number" value={Math.round(selectedShape.height)} onChange={e => updateShape(selectedShape.id, { height: +e.target.value })} className="w-full px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs"/></div>
            </div>
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Fill</label><div className="flex gap-1 flex-wrap">{COLORS.map(c => <button key={c} onClick={() => updateShape(selectedShape.id, { fill: c })} className={`w-5 h-5 rounded border-2 ${selectedShape.fill === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }}/>)}</div></div>
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Stroke</label><div className="flex gap-1 flex-wrap">{COLORS.map(c => <button key={c} onClick={() => updateShape(selectedShape.id, { stroke: c })} className={`w-5 h-5 rounded border-2 ${selectedShape.stroke === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }}/>)}</div></div>
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Opacity</label><input type="range" min={0} max={1} step={0.1} value={selectedShape.opacity} onChange={e => updateShape(selectedShape.id, { opacity: +e.target.value })} className="w-full"/></div>
            <div><label className="block text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Stroke Width</label><input type="range" min={0} max={10} step={1} value={selectedShape.strokeWidth} onChange={e => updateShape(selectedShape.id, { strokeWidth: +e.target.value })} className="w-full"/></div>
            <div className="flex gap-2"><button onClick={() => duplicateShape(selectedShape.id)} className="flex-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs text-white">Duplicate</button><button onClick={() => updateShape(selectedShape.id, { locked: !selectedShape.locked })} className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-xs">{selectedShape.locked ? 'Unlock' : 'Lock'}</button></div>
            <button onClick={() => deleteShape(selectedShape.id)} className="w-full px-2 py-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs">Delete</button>
          </div>
        </div>)}
        {/* AI Assistant Panel */}
        {showAI && (<div className="w-72 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-[var(--border-color,#334155)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">🤖 AI Design Assistant</h3>
          </div>
          <div className="flex-1 p-3 space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Quick suggestions:</p>
              {aiSuggestions.map((s, i) => (<button key={i} onClick={() => setAiPrompt(s)} className="w-full text-left px-2 py-1.5 rounded text-[11px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] transition-colors">{s}</button>))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">AI Actions:</p>
              <button onClick={() => { const types: Shape['type'][] = ['rect','ellipse','diamond','arrow','text']; types.forEach((t,i) => { setTimeout(() => addShape(t), i*100); }); }} className="w-full px-2 py-1.5 rounded text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400">✨ Auto-generate flowchart</button>
              <button onClick={() => { ['rect','rect','rect','arrow','arrow'].forEach((t,i) => { setTimeout(() => addShape(t as Shape['type']), i*100); }); }} className="w-full px-2 py-1.5 rounded text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400">🏢 Auto-generate org chart</button>
              <button onClick={() => { ['ellipse','line','line','line','ellipse','ellipse','ellipse'].forEach((t,i) => { setTimeout(() => addShape(t as Shape['type']), i*100); }); }} className="w-full px-2 py-1.5 rounded text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400">🧠 Auto-generate mind map</button>
              <button onClick={() => { shapes.forEach(s => updateShape(s.id, { fill: COLORS[Math.floor(Math.random()*COLORS.length)] })); }} className="w-full px-2 py-1.5 rounded text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400">🎨 Randomize colors</button>
              <button onClick={() => { shapes.forEach((s,i) => updateShape(s.id, { x: 100+(i%4)*150, y: 100+Math.floor(i/4)*120 })); }} className="w-full px-2 py-1.5 rounded text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400">📏 Auto-layout shapes</button>
            </div>
          </div>
          <div className="p-3 border-t border-[var(--border-color,#334155)]">
            <div className="flex gap-2"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe what to create..." className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" onKeyDown={e => { if (e.key === 'Enter') { addShape('rect'); setAiPrompt(''); } }}/><button onClick={() => { addShape('rect'); setAiPrompt(''); }} className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-xs text-white">Go</button></div>
          </div>
        </div>)}
      </div>
    </div>
  );
}