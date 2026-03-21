'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGraphicsStore, createShape, genId, Shape, ShapeBase, SmartGuide, Point, ArrowShape, LineShape, StarShape, TextShape, BlockArrowShape, BracketShape } from '@/store/graphics-store';

const snap = (v: number, grid: number, enabled: boolean) => enabled ? Math.round(v / grid) * grid : v;

export default function GraphicsCanvas() {
  const { shapes, selectedId, selectedIds, tool, zoom, pan, showGrid, showGuides, guides,
    showRulers, gridSize, snapToGrid: snapEnabled, smartGuidesEnabled, aspectRatioLocked,
    setShapes, setSelectedId, setSelectedIds, setPan, setZoom, setGuides, pushHistory } = useGraphicsStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const resizeRef = useRef<{ mx: number; my: number; shape: Shape } | null>(null);
  const [activeSmartGuides, setActiveSmartGuides] = useState<SmartGuide[]>([]);
  const [draggingGuide, setDraggingGuide] = useState<string | null>(null);
  const [penPath, setPenPath] = useState<Point[] | null>(null);
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedShape = shapes.find(s => s.id === selectedId);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => Math.max(0.25, Math.min(4, z + (e.deltaY > 0 ? -0.05 : 0.05))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoom]);

  const updateShapeLocal = useCallback((id: string, u: Partial<ShapeBase>) => {
    const ns = shapes.map(s => s.id === id ? { ...s, ...u } as Shape : s);
    pushHistory(ns);
  }, [shapes, pushHistory]);

  const deleteShape = useCallback((id: string) => {
    const ns = shapes.filter(s => s.id !== id);
    pushHistory(ns);
    if (selectedId === id) { setSelectedId(null); setSelectedIds([]); }
  }, [shapes, selectedId, pushHistory, setSelectedId, setSelectedIds]);

  const duplicateShape = useCallback((id: string) => {
    const s = shapes.find(sh => sh.id === id);
    if (!s) return;
    const d = { ...s, id: genId(), x: s.x + 20, y: s.y + 20 };
    pushHistory([...shapes, d as Shape]);
    setSelectedId(d.id); setSelectedIds([d.id]);
  }, [shapes, pushHistory, setSelectedId, setSelectedIds]);

  const bringToFront = useCallback((id: string) => pushHistory([...shapes.filter(s => s.id !== id), shapes.find(s => s.id === id)!]), [shapes, pushHistory]);
  const sendToBack = useCallback((id: string) => pushHistory([shapes.find(s => s.id === id)!, ...shapes.filter(s => s.id !== id)]), [shapes, pushHistory]);

  const renderShape = (shape: Shape) => {
    const isSel = shape.id === selectedId || selectedIds.includes(shape.id);
    const gid = `grad_${shape.id}`, fid = `flt_${shape.id}`;
    const fill = shape.gradient ? `url(#${gid})` : shape.fill;
    const { x, y, width: w, height: h } = shape;
    const sw = shape.strokeWidth, st = shape.stroke;
    const tf = shape.rotation ? `rotate(${shape.rotation} ${x + w / 2} ${y + h / 2})` : undefined;
    const filterAttr = shape.shadow?.enabled ? { filter: `url(#${fid})` } : {};
    const gProps = { key: shape.id, transform: tf, style: { cursor: shape.locked ? 'not-allowed' as const : 'move' as const, opacity: shape.opacity * shape.layerOpacity }, onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, shape.id), onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, id: shape.id }); setSelectedId(shape.id); setSelectedIds([shape.id]); } };
    const selR = isSel ? <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} fill="none" stroke="#60a5fa" strokeWidth={2} strokeDasharray="6 3" rx={4} pointerEvents="none" /> : null;
    const lbl = shape.label ? <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12} pointerEvents="none">{shape.label}</text> : null;
    const defs = (shape.gradient || shape.shadow?.enabled) ? (
      <defs>
        {shape.gradient && shape.gradient.type === 'linear' && <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${shape.gradient.angle})`}>{shape.gradient.stops.map((s, i) => <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} />)}</linearGradient>}
        {shape.gradient && shape.gradient.type === 'radial' && <radialGradient id={gid} cx="50%" cy="50%" r="50%">{shape.gradient.stops.map((s, i) => <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} />)}</radialGradient>}
        {shape.shadow?.enabled && <filter id={fid}><feDropShadow dx={shape.shadow.x} dy={shape.shadow.y} stdDeviation={shape.shadow.blur} floodColor={shape.shadow.color} /></filter>}
      </defs>
    ) : null;

    switch (shape.type) {
      case 'rect': return <g {...gProps}>{defs}{selR}<rect x={x} y={y} width={w} height={h} fill={fill} stroke={st} strokeWidth={sw} rx={shape.borderRadius ?? 8} {...filterAttr} />{lbl}</g>;
      case 'ellipse': return <g {...gProps}>{defs}{selR}<ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>;
      case 'diamond': return <g {...gProps}>{defs}{selR}<polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>;
      case 'triangle': return <g {...gProps}>{selR}<polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} fill={fill} stroke={st} strokeWidth={sw} />{lbl}</g>;
      case 'hexagon': { const cx2 = x + w / 2, cy2 = y + h / 2, r = Math.min(w, h) / 2; const pts = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i - Math.PI / 2; return `${cx2 + r * Math.cos(a)},${cy2 + r * Math.sin(a)}`; }).join(' '); return <g {...gProps}>{defs}{selR}<polygon points={pts} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>; }
      case 'star': { const cx2 = x + w / 2, cy2 = y + h / 2, or = Math.min(w, h) / 2, ir = or * (shape as StarShape).innerRadius; const pts = Array.from({ length: (shape as StarShape).points * 2 }, (_, i) => { const r2 = i % 2 === 0 ? or : ir; const a = Math.PI * i / (shape as StarShape).points - Math.PI / 2; return `${cx2 + r2 * Math.cos(a)},${cy2 + r2 * Math.sin(a)}`; }).join(' '); return <g {...gProps}>{defs}{selR}<polygon points={pts} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>; }
      case 'cloud': return <g {...gProps}>{defs}{selR}<ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} /><ellipse cx={x + w * 0.3} cy={y + h * 0.3} rx={w * 0.25} ry={h * 0.25} fill={fill} stroke={st} strokeWidth={sw} /><ellipse cx={x + w * 0.7} cy={y + h * 0.3} rx={w * 0.25} ry={h * 0.25} fill={fill} stroke={st} strokeWidth={sw} />{lbl}</g>;
      case 'cylinder': return <g {...gProps}>{defs}{selR}<rect x={x} y={y + 10} width={w} height={h - 20} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} /><ellipse cx={x + w / 2} cy={y + 10} rx={w / 2} ry={10} fill={fill} stroke={st} strokeWidth={sw} /><ellipse cx={x + w / 2} cy={y + h - 10} rx={w / 2} ry={10} fill={fill} stroke={st} strokeWidth={sw} />{lbl}</g>;
      case 'text': return <g {...gProps}>{selR}<text x={x} y={y + h / 2} fill="#e2e8f0" fontSize={(shape as TextShape).fontSize} fontFamily={(shape as TextShape).fontFamily}>{(shape as TextShape).text}</text></g>;
      case 'arrow': return <g {...gProps}>{selR}<defs><marker id={`ah_${shape.id}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill={st} /></marker></defs><line x1={(shape as ArrowShape).startPoint.x} y1={(shape as ArrowShape).startPoint.y} x2={(shape as ArrowShape).endPoint.x} y2={(shape as ArrowShape).endPoint.y} stroke={st} strokeWidth={sw} markerEnd={`url(#ah_${shape.id})`} /></g>;
      case 'line': return <g {...gProps}>{selR}<line x1={(shape as LineShape).startPoint.x} y1={(shape as LineShape).startPoint.y} x2={(shape as LineShape).endPoint.x} y2={(shape as LineShape).endPoint.y} stroke={st} strokeWidth={sw} strokeDasharray={(shape as LineShape).lineStyle === 'dashed' ? '8 4' : (shape as LineShape).lineStyle === 'dotted' ? '2 4' : undefined} /></g>;
      case 'callout': { const br = shape.borderRadius ?? 8; const tx1 = x + w * 0.15, tx2 = x + w * 0.28, ty = y + h, tipX = x + w * 0.08, tipY = y + h + 22; const d = `M ${x + br} ${y} H ${x + w - br} Q ${x + w} ${y} ${x + w} ${y + br} V ${y + h - br} Q ${x + w} ${y + h} ${x + w - br} ${y + h} H ${tx2} L ${tipX} ${tipY} L ${tx1} ${ty} H ${x + br} Q ${x} ${y + h} ${x} ${y + h - br} V ${y + br} Q ${x} ${y} ${x + br} ${y} Z`; return <g {...gProps}>{defs}{selR}<path d={d} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>; }
      case 'blockArrow': { const dir = (shape as BlockArrowShape).direction ?? 'right'; const sh = h * 0.38, ah = w * 0.38; let pts = ''; if (dir === 'right') pts = `${x},${y + h / 2 - sh / 2} ${x + w - ah},${y + h / 2 - sh / 2} ${x + w - ah},${y} ${x + w},${y + h / 2} ${x + w - ah},${y + h} ${x + w - ah},${y + h / 2 + sh / 2} ${x},${y + h / 2 + sh / 2}`; else if (dir === 'left') pts = `${x + w},${y + h / 2 - sh / 2} ${x + ah},${y + h / 2 - sh / 2} ${x + ah},${y} ${x},${y + h / 2} ${x + ah},${y + h} ${x + ah},${y + h / 2 + sh / 2} ${x + w},${y + h / 2 + sh / 2}`; else if (dir === 'down') { const sw2 = w * 0.38, aH = h * 0.38; pts = `${x + w / 2 - sw2 / 2},${y} ${x + w / 2 + sw2 / 2},${y} ${x + w / 2 + sw2 / 2},${y + h - aH} ${x + w},${y + h - aH} ${x + w / 2},${y + h} ${x},${y + h - aH} ${x + w / 2 - sw2 / 2},${y + h - aH}`; } else { const sw2 = w * 0.38, aH = h * 0.38; pts = `${x + w / 2 - sw2 / 2},${y + h} ${x + w / 2 + sw2 / 2},${y + h} ${x + w / 2 + sw2 / 2},${y + aH} ${x + w},${y + aH} ${x + w / 2},${y} ${x},${y + aH} ${x + w / 2 - sw2 / 2},${y + aH}`; } return <g {...gProps}>{defs}{selR}<polygon points={pts} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>; }
      case 'bracket': { const side = (shape as BracketShape).side ?? 'both'; const bw = Math.min(18, w * 0.25); const paths: string[] = []; if (side === 'left' || side === 'both') paths.push(`M ${x + bw} ${y} L ${x} ${y} L ${x} ${y + h} L ${x + bw} ${y + h}`); if (side === 'right' || side === 'both') paths.push(`M ${x + w - bw} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x + w - bw} ${y + h}`); return <g {...gProps}>{selR}{paths.map((d, i) => <path key={i} d={d} fill="none" stroke={st} strokeWidth={sw} strokeLinecap="round" />)}{lbl}</g>; }
      case 'banner': { const wv = Math.min(12, h * 0.18); const d = `M ${x} ${y + wv} Q ${x + w / 4} ${y} ${x + w / 2} ${y + wv} Q ${x + 3 * w / 4} ${y + 2 * wv} ${x + w} ${y + wv} L ${x + w} ${y + h - wv} Q ${x + 3 * w / 4} ${y + h} ${x + w / 2} ${y + h - wv} Q ${x + w / 4} ${y + h - 2 * wv} ${x} ${y + h - wv} Z`; return <g {...gProps}>{defs}{selR}<path d={d} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} />{lbl}</g>; }
      case 'ribbon': { const fold = Math.min(14, w * 0.12); const d = `M ${x + fold} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + h / 2} L ${x + w - fold} ${y + h} L ${x + fold} ${y + h} L ${x} ${y + h / 2} Z`; const dL = `M ${x} ${y + h / 2} L ${x + fold} ${y} L ${x + fold} ${y + h} Z`; const dR = `M ${x + w} ${y + h / 2} L ${x + w - fold} ${y} L ${x + w - fold} ${y + h} Z`; return <g {...gProps}>{defs}{selR}<path d={d} fill={fill} stroke={st} strokeWidth={sw} {...filterAttr} /><path d={dL} fill={fill} stroke={st} strokeWidth={sw} opacity={0.65} /><path d={dR} fill={fill} stroke={st} strokeWidth={sw} opacity={0.65} />{lbl}</g>; }
      default: return null;
    }
  };

  const renderResizeHandles = (shape: Shape) => {
    const { x, y, width: w, height: h } = shape;
    const hs = 8 / zoom, hh = hs / 2;
    const handles = [
      { id: 'tl', cx: x, cy: y, cur: 'nw-resize' }, { id: 'tc', cx: x + w / 2, cy: y, cur: 'n-resize' },
      { id: 'tr', cx: x + w, cy: y, cur: 'ne-resize' }, { id: 'ml', cx: x, cy: y + h / 2, cur: 'w-resize' },
      { id: 'mr', cx: x + w, cy: y + h / 2, cur: 'e-resize' }, { id: 'bl', cx: x, cy: y + h, cur: 'sw-resize' },
      { id: 'bc', cx: x + w / 2, cy: y + h, cur: 's-resize' }, { id: 'br', cx: x + w, cy: y + h, cur: 'se-resize' },
    ];
    const tf = shape.rotation ? `rotate(${shape.rotation} ${x + w / 2} ${y + h / 2})` : undefined;
    return (
      <g transform={tf} pointerEvents="all">
        {handles.map(hdl => <rect key={hdl.id} x={hdl.cx - hh} y={hdl.cy - hh} width={hs} height={hs} fill="white" stroke="#3b82f6" strokeWidth={1 / zoom} rx={1} style={{ cursor: hdl.cur }} onMouseDown={e => { e.stopPropagation(); resizeRef.current = { mx: e.clientX, my: e.clientY, shape: { ...shape } }; setResizeHandle(hdl.id); }} />)}
        <line x1={x + w / 2} y1={y - 20 / zoom} x2={x + w / 2} y2={y} stroke="#60a5fa" strokeWidth={1 / zoom} pointerEvents="none" />
        <circle cx={x + w / 2} cy={y - 20 / zoom} r={5 / zoom} fill="white" stroke="#3b82f6" strokeWidth={1 / zoom} style={{ cursor: 'grab' }} onMouseDown={e => { e.stopPropagation(); resizeRef.current = { mx: e.clientX, my: e.clientY, shape: { ...shape } }; setResizeHandle('rot'); }} />
      </g>
    );
  };

  const handleShapeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const s = shapes.find(sh => sh.id === id);
    if (s?.locked) return;
    if (e.shiftKey) { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); }
    else { setSelectedId(id); setSelectedIds([id]); }
    setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Resize
    if (resizeHandle && resizeRef.current && selectedId) {
      const init = resizeRef.current;
      const dx = (e.clientX - init.mx) / zoom, dy = (e.clientY - init.my) / zoom;
      const s = init.shape, ar = s.width / s.height;
      let u: Partial<ShapeBase> = {};
      if (resizeHandle === 'br') { const nw = Math.max(10, s.width + dx); u = { width: nw, height: aspectRatioLocked ? nw / ar : Math.max(10, s.height + dy) }; }
      else if (resizeHandle === 'bl') { const nw = Math.max(10, s.width - dx); u = { x: s.x + s.width - nw, width: nw, height: aspectRatioLocked ? nw / ar : Math.max(10, s.height + dy) }; }
      else if (resizeHandle === 'tr') { const nw = Math.max(10, s.width + dx); const nh = aspectRatioLocked ? nw / ar : Math.max(10, s.height - dy); u = { y: s.y + s.height - nh, width: nw, height: nh }; }
      else if (resizeHandle === 'tl') { const nw = Math.max(10, s.width - dx); const nh = aspectRatioLocked ? nw / ar : Math.max(10, s.height - dy); u = { x: s.x + s.width - nw, y: s.y + s.height - nh, width: nw, height: nh }; }
      else if (resizeHandle === 'mr') { u = { width: Math.max(10, s.width + dx) }; }
      else if (resizeHandle === 'ml') { const nw = Math.max(10, s.width - dx); u = { x: s.x + s.width - nw, width: nw }; }
      else if (resizeHandle === 'bc') { u = { height: Math.max(10, s.height + dy) }; }
      else if (resizeHandle === 'tc') { const nh = Math.max(10, s.height - dy); u = { y: s.y + s.height - nh, height: nh }; }
      else if (resizeHandle === 'rot') { const svg = svgRef.current; if (svg) { const r = svg.getBoundingClientRect(); const mx = (e.clientX - r.left - pan.x) / zoom, my = (e.clientY - r.top - pan.y) / zoom; const angle = Math.atan2(my - (s.y + s.height / 2), mx - (s.x + s.width / 2)) * 180 / Math.PI + 90; u = { rotation: (Math.round(angle) + 360) % 360 }; } }
      setShapes(shapes.map(sh => sh.id === s.id ? { ...sh, ...u } as Shape : sh));
      return;
    }
    // Guide drag
    if (draggingGuide) { const svg = svgRef.current; if (!svg) return; const r = svg.getBoundingClientRect(); const g = guides.find(g => g.id === draggingGuide); if (!g) return; const pos = g.orientation === 'horizontal' ? (e.clientY - r.top - pan.y) / zoom : (e.clientX - r.left - pan.x) / zoom; setGuides(prev => prev.map(g2 => g2.id === draggingGuide ? { ...g2, position: pos } : g2)); return; }
    // Pan with hand tool
    if (tool === 'hand' && isDragging) { setPan({ x: pan.x + e.clientX - dragStart.x, y: pan.y + e.clientY - dragStart.y }); setDragStart({ x: e.clientX, y: e.clientY }); return; }
    // Shape drag
    if (!isDragging || !selectedId) return;
    const dx2 = (e.clientX - dragStart.x) / zoom, dy2 = (e.clientY - dragStart.y) / zoom;
    setDragStart({ x: e.clientX, y: e.clientY });
    const ids = selectedIds.length > 1 ? selectedIds : [selectedId];
    const ns = shapes.map(s => ids.includes(s.id) && !s.locked ? { ...s, x: snap(s.x + dx2, gridSize, snapEnabled), y: snap(s.y + dy2, gridSize, snapEnabled) } as Shape : s);
    setShapes(ns);
    // Smart guides
    if (smartGuidesEnabled) {
      const dragged = ns.find(s => s.id === selectedId);
      if (dragged) { const sgs: SmartGuide[] = []; const thr = 8 / zoom; shapes.forEach(o => { if (o.id === selectedId) return; [dragged.y, dragged.y + dragged.height / 2, dragged.y + dragged.height].forEach(dy3 => [o.y, o.y + o.height / 2, o.y + o.height].forEach(oy => { if (Math.abs(dy3 - oy) < thr) sgs.push({ orientation: 'horizontal', position: oy }); })); [dragged.x, dragged.x + dragged.width / 2, dragged.x + dragged.width].forEach(dx3 => [o.x, o.x + o.width / 2, o.x + o.width].forEach(ox => { if (Math.abs(dx3 - ox) < thr) sgs.push({ orientation: 'vertical', position: ox }); })); }); setActiveSmartGuides(sgs); }
    }
  };

  const handleMouseUp = () => {
    if (resizeHandle) { pushHistory(shapes); setResizeHandle(null); resizeRef.current = null; }
    if (isDragging && selectedId) pushHistory(shapes);
    setIsDragging(false); setDraggingGuide(null); setActiveSmartGuides([]);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setContextMenu(null);
    if (tool === 'pen') { const svg = svgRef.current; if (!svg) return; const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left - pan.x) / zoom, y = (e.clientY - r.top - pan.y) / zoom; setIsDrawingPen(true); setPenPath([{ x, y }]); return; }
    if (tool === 'hand') { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); return; }
    if (tool === 'select') { setSelectedId(null); setSelectedIds([]); return; }
    const svg = svgRef.current; if (!svg) return;
    const r = svg.getBoundingClientRect();
    const cx = snap((-pan.x + (r.width / 2)) / zoom, gridSize, snapEnabled);
    const cy = snap((-pan.y + (r.height / 2)) / zoom, gridSize, snapEnabled);
    const s = createShape(tool as Shape['type'], cx, cy);
    pushHistory([...shapes, s]); setSelectedId(s.id); setSelectedIds([s.id]);
  };

  const handleMouseMovePen = (e: React.MouseEvent) => {
    if (!isDrawingPen || !penPath) return;
    const svg = svgRef.current; if (!svg) return;
    const r = svg.getBoundingClientRect();
    setPenPath(prev => prev ? [...prev, { x: (e.clientX - r.left - pan.x) / zoom, y: (e.clientY - r.top - pan.y) / zoom }] : null);
  };

  const handleMouseUpPen = () => {
    if (!isDrawingPen || !penPath || penPath.length < 2) { setIsDrawingPen(false); setPenPath(null); return; }
    const xs = penPath.map(p => p.x), ys = penPath.map(p => p.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const s = { id: genId(), type: 'line' as const, x: minX, y: minY, width: Math.max(10, Math.max(...xs) - minX), height: Math.max(10, Math.max(...ys) - minY), rotation: 0, fill: 'transparent', stroke: '#e2e8f0', strokeWidth: 2, opacity: 1, label: 'Freehand', locked: false, visible: true, layerOpacity: 1, gradient: null, startPoint: penPath[0], endPoint: penPath[penPath.length - 1], lineStyle: 'solid' as const };
    pushHistory([...shapes, s]); setSelectedId(s.id); setSelectedIds([s.id]); setIsDrawingPen(false); setPenPath(null);
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[#0f172a]">
      {showRulers && <div className="absolute top-0 left-6 right-0 h-6 bg-[#1e293b] border-b border-[#334155] z-10 pointer-events-none overflow-hidden"><svg width="100%" height="24">{Array.from({ length: 50 }, (_, i) => <g key={i} transform={`translate(${i * 40 * zoom + pan.x % (40 * zoom)},0)`}><line x1={0} y1={16} x2={0} y2={24} stroke="#334155" strokeWidth={1} /><text x={4} y={12} fill="#64748b" fontSize={8}>{Math.round(i * 40 - pan.x / zoom)}</text></g>)}</svg></div>}
      {showRulers && <div className="absolute top-6 left-0 bottom-0 w-6 bg-[#1e293b] border-r border-[#334155] z-10 pointer-events-none overflow-hidden"><svg width="24" height="100%">{Array.from({ length: 30 }, (_, i) => <g key={i} transform={`translate(0,${i * 40 * zoom + pan.y % (40 * zoom)})`}><line x1={16} y1={0} x2={24} y2={0} stroke="#334155" strokeWidth={1} /><text x={2} y={10} fill="#64748b" fontSize={8} transform="rotate(-90 8 10)">{Math.round(i * 40 - pan.y / zoom)}</text></g>)}</svg></div>}
      {showRulers && <div className="absolute top-0 left-0 w-6 h-6 bg-[#1e293b] border-r border-b border-[#334155] z-20" />}
      <svg ref={svgRef} className="w-full h-full" style={{ paddingTop: showRulers ? 24 : 0, paddingLeft: showRulers ? 24 : 0, cursor: tool === 'pen' ? 'crosshair' : tool === 'hand' ? 'grab' : undefined }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={e => { handleMouseMove(e); handleMouseMovePen(e); }}
        onMouseUp={() => { handleMouseUp(); handleMouseUpPen(); }}>
        <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#94a3b8" /></marker></defs>
        {showGrid && <><pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse"><path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#1e293b" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#grid)" /></>}
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {shapes.filter(s => s.visible).map(s => renderShape(s))}
          {isDrawingPen && penPath && penPath.length > 1 && <polyline points={penPath.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" />}
          {showGuides && guides.map(g => g.orientation === 'horizontal' ? <line key={g.id} x1={-9999} y1={g.position} x2={9999} y2={g.position} stroke="#f59e0b" strokeWidth={1} strokeDasharray="6 3" opacity={0.7} style={{ cursor: 'ns-resize' }} onMouseDown={e => { e.stopPropagation(); setDraggingGuide(g.id); }} /> : <line key={g.id} x1={g.position} y1={-9999} x2={g.position} y2={9999} stroke="#f59e0b" strokeWidth={1} strokeDasharray="6 3" opacity={0.7} style={{ cursor: 'ew-resize' }} onMouseDown={e => { e.stopPropagation(); setDraggingGuide(g.id); }} />)}
          {activeSmartGuides.map((g, i) => g.orientation === 'horizontal' ? <line key={i} x1={-9999} y1={g.position} x2={9999} y2={g.position} stroke="#ef4444" strokeWidth={1 / zoom} strokeDasharray={`${4 / zoom} ${2 / zoom}`} opacity={0.9} pointerEvents="none" /> : <line key={i} x1={g.position} y1={-9999} x2={g.position} y2={9999} stroke="#ef4444" strokeWidth={1 / zoom} strokeDasharray={`${4 / zoom} ${2 / zoom}`} opacity={0.9} pointerEvents="none" />)}
          {selectedShape && !selectedShape.locked && renderResizeHandles(selectedShape)}
        </g>
      </svg>
      {contextMenu && (
        <div className="fixed z-50 w-44 rounded-lg border py-1 shadow-xl" style={{ top: contextMenu.y, left: contextMenu.x, backgroundColor: '#1e293b', borderColor: '#334155' }} onMouseLeave={() => setContextMenu(null)}>
          {[{ l: 'Duplicate', a: () => { duplicateShape(contextMenu.id); setContextMenu(null); } }, { l: 'Bring to Front', a: () => { bringToFront(contextMenu.id); setContextMenu(null); } }, { l: 'Send to Back', a: () => { sendToBack(contextMenu.id); setContextMenu(null); } }, { l: 'Delete', a: () => { deleteShape(contextMenu.id); setContextMenu(null); }, danger: true }].map(item => <button key={item.l} onClick={item.a} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#334155] ${item.danger ? 'text-red-400' : ''}`}>{item.l}</button>)}
        </div>
      )}
      <div className="absolute bottom-2 left-8 flex items-center gap-3 text-[10px] text-[#94a3b8] bg-[#1e293b]/90 rounded px-2 py-1">
        <span>Objects: {shapes.length}</span><span>Zoom: {Math.round(zoom * 100)}%</span><span>Tool: {tool}</span>
        {selectedShape && <span>Selected: {selectedShape.label || selectedShape.type}</span>}
        {selectedIds.length > 1 && <span>Multi: {selectedIds.length}</span>}
      </div>
    </div>
  );
}
