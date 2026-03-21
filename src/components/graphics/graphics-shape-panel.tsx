'use client';
import React, { useState } from 'react';
import { useGraphicsStore, createShape, genId, Shape, ShapeBase, ShapeType, SwimlanePoolShape, ContainerShape, SwimlaneLane, LANE_COLORS } from '@/store/graphics-store';

const SHAPE_CATEGORIES = [
  { name: 'Basic', shapes: [{ type: 'rect', icon: '▭', label: 'Rectangle' }, { type: 'ellipse', icon: '○', label: 'Ellipse' }, { type: 'diamond', icon: '◇', label: 'Diamond' }, { type: 'triangle', icon: '△', label: 'Triangle' }, { type: 'hexagon', icon: '⬡', label: 'Hexagon' }, { type: 'star', icon: '☆', label: 'Star' }, { type: 'cloud', icon: '☁', label: 'Cloud' }, { type: 'cylinder', icon: '⌀', label: 'Cylinder' }] },
  { name: 'Callouts', shapes: [{ type: 'callout', icon: '💬', label: 'Callout' }] },
  { name: 'Arrows', shapes: [{ type: 'arrow', icon: '→', label: 'Arrow' }, { type: 'blockArrow', icon: '⇒', label: 'Block Arrow' }, { type: 'line', icon: '—', label: 'Line' }] },
  { name: 'Brackets', shapes: [{ type: 'bracket', icon: '[ ]', label: 'Bracket' }] },
  { name: 'Banners', shapes: [{ type: 'banner', icon: '〜', label: 'Banner' }, { type: 'ribbon', icon: '⬡', label: 'Ribbon' }] },
  { name: 'Text', shapes: [{ type: 'text', icon: 'T', label: 'Text Box' }] },
  { name: 'Swimlanes', shapes: [{ type: 'swimlanePool', icon: '⊞', label: 'H Pool' }, { type: 'container', icon: '▣', label: 'Container' }] },
] as { name: string; shapes: { type: ShapeType; icon: string; label: string }[] }[];

const PALETTES = {
  Default: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#ffffff', '#000000', '#64748b'],
  Pastel: ['#93c5fd', '#fca5a5', '#86efac', '#fde68a', '#c4b5fd', '#f9a8d4', '#67e8f9', '#fdba74', '#5eead4', '#a5b4fc', '#f1f5f9', '#1e293b', '#94a3b8'],
  Neon: ['#00f5ff', '#ff0080', '#00ff41', '#ffff00', '#bf00ff', '#ff6600', '#00ffcc', '#ff3300', '#cc00ff', '#0066ff', '#ffffff', '#000000', '#333333'],
};

export function ShapeLibraryPanel() {
  const { shapes, pan, zoom, setShapes: _setShapes, pushHistory, setSelectedId, setSelectedIds } = useGraphicsStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const addShape = (type: ShapeType) => {
    const cx = (-pan.x + 400) / zoom, cy = (-pan.y + 300) / zoom;
    const s = createShape(type, cx, cy);
    pushHistory([...shapes, s]);
    setSelectedId(s.id); setSelectedIds([s.id]);
  };

  return (
    <div className="w-56 border-r border-[#334155] bg-[#1e293b] overflow-y-auto flex-shrink-0">
      <div className="p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] px-1 mb-2">Shapes</p>
        {SHAPE_CATEGORIES.map(cat => (
          <div key={cat.name} className="mb-1">
            <button onClick={() => setCollapsed(c => ({ ...c, [cat.name]: !c[cat.name] }))} className="w-full flex items-center justify-between px-1 py-1 text-[10px] font-semibold text-[#94a3b8] hover:text-white">
              <span>{cat.name}</span><span>{collapsed[cat.name] ? '▶' : '▼'}</span>
            </button>
            {!collapsed[cat.name] && (
              <div className="grid grid-cols-4 gap-1 px-1 pb-1">
                {cat.shapes.map(sh => (
                  <button key={sh.type} title={sh.label} onClick={() => addShape(sh.type)} className="flex flex-col items-center justify-center h-10 rounded bg-[#0f172a] hover:bg-[#334155] text-xs transition-colors border border-transparent hover:border-[#475569]">
                    <span className="text-base leading-none">{sh.icon}</span>
                    <span className="text-[8px] text-[#94a3b8] mt-0.5 truncate w-full text-center">{sh.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PropertiesPanel() {
  const { shapes, selectedId, selectedIds, aspectRatioLocked, setAspectRatioLocked, pushHistory } = useGraphicsStore();
  const selectedShape = shapes.find(s => s.id === selectedId);
  const [activePalette, setActivePalette] = useState<keyof typeof PALETTES>('Default');
  const [showGradient, setShowGradient] = useState(false);
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [gradAngle, setGradAngle] = useState(45);
  const [gradStops, setGradStops] = useState([{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#8b5cf6' }]);

  if (!selectedShape) return null;

  const update = (u: Partial<ShapeBase>) => {
    const ns = shapes.map(s => s.id === selectedShape.id ? { ...s, ...u } as Shape : s);
    pushHistory(ns);
  };

  const updateW = (nw: number) => {
    const w = Math.max(10, nw);
    const h = aspectRatioLocked ? Math.max(10, w * selectedShape.height / selectedShape.width) : selectedShape.height;
    update({ width: w, height: h });
  };

  const updateH = (nh: number) => {
    const h = Math.max(10, nh);
    const w = aspectRatioLocked ? Math.max(10, h * selectedShape.width / selectedShape.height) : selectedShape.width;
    update({ width: w, height: h });
  };

  const alignShapes = (mode: string) => {
    const ids = selectedIds.length > 1 ? selectedIds : [selectedId!];
    if (ids.length < 2) return;
    const sel = shapes.filter(s => ids.includes(s.id));
    const upd: Record<string, Partial<ShapeBase>> = {};
    if (mode === 'left') { const minX = Math.min(...sel.map(s => s.x)); sel.forEach(s => upd[s.id] = { x: minX }); }
    else if (mode === 'centerH') { const cx = sel.reduce((a, s) => a + s.x + s.width / 2, 0) / sel.length; sel.forEach(s => upd[s.id] = { x: cx - s.width / 2 }); }
    else if (mode === 'right') { const maxX = Math.max(...sel.map(s => s.x + s.width)); sel.forEach(s => upd[s.id] = { x: maxX - s.width }); }
    else if (mode === 'top') { const minY = Math.min(...sel.map(s => s.y)); sel.forEach(s => upd[s.id] = { y: minY }); }
    else if (mode === 'centerV') { const cy = sel.reduce((a, s) => a + s.y + s.height / 2, 0) / sel.length; sel.forEach(s => upd[s.id] = { y: cy - s.height / 2 }); }
    else if (mode === 'bottom') { const maxY = Math.max(...sel.map(s => s.y + s.height)); sel.forEach(s => upd[s.id] = { y: maxY - s.height }); }
    else if (mode === 'distH') { const sorted = [...sel].sort((a, b) => a.x - b.x); const span = Math.max(...sorted.map(s => s.x + s.width)) - Math.min(...sorted.map(s => s.x)); const totalW = sorted.reduce((a, s) => a + s.width, 0); const gap = (span - totalW) / (sorted.length - 1); let cx2 = sorted[0].x; sorted.forEach(s => { upd[s.id] = { x: cx2 }; cx2 += s.width + gap; }); }
    else if (mode === 'distV') { const sorted = [...sel].sort((a, b) => a.y - b.y); const span = Math.max(...sorted.map(s => s.y + s.height)) - Math.min(...sorted.map(s => s.y)); const totalH = sorted.reduce((a, s) => a + s.height, 0); const gap = (span - totalH) / (sorted.length - 1); let cy2 = sorted[0].y; sorted.forEach(s => { upd[s.id] = { y: cy2 }; cy2 += s.height + gap; }); }
    const ns = shapes.map(s => upd[s.id] ? { ...s, ...upd[s.id] } as Shape : s);
    pushHistory(ns);
  };

  const deleteSelected = () => { pushHistory(shapes.filter(s => s.id !== selectedShape.id)); };
  const duplicateSelected = () => { const d = { ...selectedShape, id: genId(), x: selectedShape.x + 20, y: selectedShape.y + 20 }; pushHistory([...shapes, d as Shape]); };
  const bringToFront = () => pushHistory([...shapes.filter(s => s.id !== selectedId), selectedShape]);
  const sendToBack = () => pushHistory([selectedShape, ...shapes.filter(s => s.id !== selectedId)]);
  const bringForward = () => { const i = shapes.findIndex(s => s.id === selectedId); if (i < shapes.length - 1) { const ns = [...shapes]; [ns[i], ns[i + 1]] = [ns[i + 1], ns[i]]; pushHistory(ns); } };
  const sendBackward = () => { const i = shapes.findIndex(s => s.id === selectedId); if (i > 0) { const ns = [...shapes]; [ns[i], ns[i - 1]] = [ns[i - 1], ns[i]]; pushHistory(ns); } };
  const applyGradient = () => { update({ gradient: { type: gradType, stops: gradStops, angle: gradAngle } }); setShowGradient(false); };

  const colors = PALETTES[activePalette];
  const sh = selectedShape.shadow ?? { enabled: false, x: 4, y: 4, blur: 8, color: 'rgba(0,0,0,0.5)' };
  const inp = 'w-full px-2 py-1 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0]';
  const lbl = 'block text-[10px] text-[#94a3b8] mb-1';

  return (
    <div className="w-60 border-l border-[#334155] bg-[#1e293b] overflow-y-auto flex-shrink-0 p-3 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Properties</p>

      {/* Label */}
      <div><label className={lbl}>Label</label><input value={selectedShape.label} onChange={e => update({ label: e.target.value })} className={inp} /></div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div><label className={lbl}>X</label><input type="number" value={Math.round(selectedShape.x)} onChange={e => update({ x: +e.target.value })} className={inp} /></div>
        <div><label className={lbl}>Y</label><input type="number" value={Math.round(selectedShape.y)} onChange={e => update({ y: +e.target.value })} className={inp} /></div>
      </div>

      {/* Size with aspect ratio lock */}
      <div>
        <div className="flex items-center justify-between mb-1"><label className={lbl + ' mb-0'}>Size</label><button onClick={() => setAspectRatioLocked(!aspectRatioLocked)} title={aspectRatioLocked ? 'Unlock ratio' : 'Lock ratio'} className={`text-[10px] px-1.5 py-0.5 rounded ${aspectRatioLocked ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8]'}`}>{aspectRatioLocked ? '🔒' : '🔓'} Ratio</button></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={lbl}>W</label><input type="number" value={Math.round(selectedShape.width)} onChange={e => updateW(+e.target.value)} className={inp} /></div>
          <div><label className={lbl}>H</label><input type="number" value={Math.round(selectedShape.height)} onChange={e => updateH(+e.target.value)} className={inp} /></div>
        </div>
      </div>

      {/* Text Wrap */}
      <div><label className={lbl}>Text Wrap</label>
        <select value={selectedShape.textWrap ?? 'none'} onChange={e => update({ textWrap: e.target.value as any })} className={inp}>
          {['none', 'square', 'tight', 'through', 'top-bottom', 'behind', 'in-front'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Border radius */}
      {selectedShape.borderRadius !== undefined && <div><label className={lbl}>Corner Radius: {selectedShape.borderRadius ?? 0}px</label><input type="range" min={0} max={60} value={selectedShape.borderRadius ?? 0} onChange={e => update({ borderRadius: +e.target.value })} className="w-full" /></div>}

      {/* Palette + Fill */}
      <div>
        <div className="flex gap-1 mb-1 flex-wrap">
          {(Object.keys(PALETTES) as (keyof typeof PALETTES)[]).map(p => <button key={p} onClick={() => setActivePalette(p)} className={`px-1.5 py-0.5 rounded text-[9px] ${activePalette === p ? 'bg-blue-600 text-white' : 'bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8]'}`}>{p}</button>)}
        </div>
        <label className={lbl}>Fill</label>
        <div className="flex gap-1 flex-wrap">{colors.map(c => <button key={c} onClick={() => update({ fill: c, gradient: null })} className={`w-5 h-5 rounded border-2 ${selectedShape.fill === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={selectedShape.fill.startsWith('#') ? selectedShape.fill : '#3b82f6'} onChange={e => update({ fill: e.target.value, gradient: null })} className="w-6 h-6 rounded cursor-pointer" />
          <button onClick={() => setShowGradient(!showGradient)} className={`px-2 py-0.5 rounded text-[10px] ${showGradient ? 'bg-purple-600 text-white' : 'bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8]'}`}>Gradient</button>
          {selectedShape.gradient && <button onClick={() => update({ gradient: null })} className="text-[10px] text-red-400">✕</button>}
        </div>
        {showGradient && <div className="mt-2 p-2 rounded bg-[#0f172a] border border-[#334155] space-y-2">
          <div className="flex gap-1">{(['linear', 'radial'] as const).map(t => <button key={t} onClick={() => setGradType(t)} className={`flex-1 py-0.5 rounded text-[10px] capitalize ${gradType === t ? 'bg-purple-600 text-white' : 'bg-[#1e293b]'}`}>{t}</button>)}</div>
          {gradType === 'linear' && <div><label className={lbl}>Angle: {gradAngle}°</label><input type="range" min={0} max={360} value={gradAngle} onChange={e => setGradAngle(+e.target.value)} className="w-full" /></div>}
          {gradStops.map((gs, i) => <div key={i} className="flex items-center gap-1.5"><input type="color" value={gs.color} onChange={e => { const s = [...gradStops]; s[i] = { ...s[i], color: e.target.value }; setGradStops(s); }} className="w-6 h-6 rounded" /><input type="range" min={0} max={1} step={0.01} value={gs.offset} onChange={e => { const s = [...gradStops]; s[i] = { ...s[i], offset: +e.target.value }; setGradStops(s); }} className="flex-1" /><span className="text-[10px] text-[#94a3b8] w-7">{Math.round(gs.offset * 100)}%</span>{gradStops.length > 2 && <button onClick={() => setGradStops(prev => prev.filter((_, j) => j !== i))} className="text-red-400 text-[10px]">✕</button>}</div>)}
          <div className="flex gap-1"><button onClick={() => setGradStops(prev => [...prev, { offset: 0.5, color: '#22c55e' }])} className="flex-1 py-0.5 rounded bg-[#1e293b] text-[10px]">+ Stop</button><button onClick={applyGradient} className="flex-1 py-0.5 rounded bg-purple-600 text-white text-[10px]">Apply</button></div>
        </div>}
      </div>

      {/* Stroke */}
      <div><label className={lbl}>Stroke</label><div className="flex gap-1 flex-wrap mb-1">{colors.map(c => <button key={c} onClick={() => update({ stroke: c })} className={`w-5 h-5 rounded border-2 ${selectedShape.stroke === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
        <input type="color" value={selectedShape.stroke.startsWith('#') ? selectedShape.stroke : '#1e40af'} onChange={e => update({ stroke: e.target.value })} className="w-6 h-6 rounded cursor-pointer" /></div>

      {/* Stroke Width / Opacity / Rotation */}
      <div><label className={lbl}>Stroke: {selectedShape.strokeWidth}px</label><input type="range" min={0} max={10} value={selectedShape.strokeWidth} onChange={e => update({ strokeWidth: +e.target.value })} className="w-full" /></div>
      <div><label className={lbl}>Opacity: {Math.round(selectedShape.opacity * 100)}%</label><input type="range" min={0} max={1} step={0.05} value={selectedShape.opacity} onChange={e => update({ opacity: +e.target.value })} className="w-full" /></div>
      <div><label className={lbl}>Rotation: {selectedShape.rotation}°</label><input type="range" min={0} max={360} value={selectedShape.rotation} onChange={e => update({ rotation: +e.target.value })} className="w-full" /></div>

      {/* Shadow */}
      <div>
        <div className="flex items-center justify-between mb-1"><label className={lbl + ' mb-0'}>Shadow</label><button onClick={() => update({ shadow: { ...sh, enabled: !sh.enabled } })} className={`text-[10px] px-2 py-0.5 rounded ${sh.enabled ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8]'}`}>{sh.enabled ? 'On' : 'Off'}</button></div>
        {sh.enabled && <div className="space-y-1 pl-1">
          <div className="grid grid-cols-3 gap-1"><div><label className={lbl}>X</label><input type="number" value={sh.x} onChange={e => update({ shadow: { ...sh, x: +e.target.value } })} className={inp} /></div><div><label className={lbl}>Y</label><input type="number" value={sh.y} onChange={e => update({ shadow: { ...sh, y: +e.target.value } })} className={inp} /></div><div><label className={lbl}>Blur</label><input type="number" value={sh.blur} onChange={e => update({ shadow: { ...sh, blur: +e.target.value } })} className={inp} /></div></div>
          <div><label className={lbl}>Color</label><input type="color" value="#000000" onChange={e => update({ shadow: { ...sh, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer" /></div>
        </div>}
      </div>

      {/* Align (multi-select) */}
      {selectedIds.length > 1 && <div>
        <label className={lbl}>Align</label>
        <div className="grid grid-cols-4 gap-1">
          {[['left', '⬅', 'Left'], ['centerH', '↔', 'Center H'], ['right', '➡', 'Right'], ['top', '⬆', 'Top'], ['centerV', '↕', 'Center V'], ['bottom', '⬇', 'Bottom'], ['distH', '⦿', 'Distribute H'], ['distV', '⦾', 'Distribute V']].map(([mode, icon, title]) => <button key={mode} onClick={() => alignShapes(mode)} title={title} className="py-1 rounded bg-[#0f172a] hover:bg-[#334155] text-xs">{icon}</button>)}
        </div>
      </div>}

      {/* Z-order */}
      <div><label className={lbl}>Layer Order</label>
        <div className="grid grid-cols-2 gap-1">
          {[['⬆ Front', bringToFront], ['⬇ Back', sendToBack], ['↑ Forward', bringForward], ['↓ Backward', sendBackward]].map(([label, fn]) => <button key={label as string} onClick={fn as () => void} className="py-1 rounded bg-[#0f172a] hover:bg-[#334155] text-[10px]">{label as string}</button>)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={duplicateSelected} className="flex-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs text-white">Duplicate</button>
        <button onClick={() => { const ns = shapes.map(s => s.id === selectedShape.id ? { ...s, locked: !s.locked } as Shape : s); pushHistory(ns); }} className="flex-1 px-2 py-1.5 rounded bg-[#0f172a] hover:bg-[#334155] text-xs">{selectedShape.locked ? '🔒 Unlock' : '🔓 Lock'}</button>
      </div>
      <button onClick={deleteSelected} className="w-full px-2 py-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs">Delete</button>

      {/* Swimlane Pool Properties */}
      {selectedShape.type === 'swimlanePool' && (() => {
        const pool = selectedShape as SwimlanePoolShape;
        const updatePool = (u: Partial<SwimlanePoolShape>) => {
          const ns = shapes.map(s => s.id === pool.id ? { ...s, ...u } as Shape : s);
          pushHistory(ns);
        };
        const updateLane = (laneId: string, u: Partial<SwimlaneLane>) => {
          const newLanes = pool.lanes.map(l => l.id === laneId ? { ...l, ...u } : l);
          updatePool({ lanes: newLanes });
        };
        const addLane = () => {
          const colorIdx = pool.lanes.length % LANE_COLORS.length;
          const newLane: SwimlaneLane = { id: genId(), label: `Lane ${pool.lanes.length + 1}`, size: 150, color: LANE_COLORS[colorIdx] };
          const newLanes = [...pool.lanes, newLane];
          const totalSize = newLanes.reduce((a, l) => a + l.size, 0);
          if (pool.orientation === 'horizontal') updatePool({ lanes: newLanes, height: totalSize });
          else updatePool({ lanes: newLanes, width: totalSize + pool.headerSize });
        };
        const removeLane = (laneId: string) => {
          if (pool.lanes.length <= 1) return;
          const newLanes = pool.lanes.filter(l => l.id !== laneId);
          const totalSize = newLanes.reduce((a, l) => a + l.size, 0);
          if (pool.orientation === 'horizontal') updatePool({ lanes: newLanes, height: totalSize });
          else updatePool({ lanes: newLanes, width: totalSize + pool.headerSize });
        };
        const moveLane = (idx: number, dir: number) => {
          const ni = idx + dir;
          if (ni < 0 || ni >= pool.lanes.length) return;
          const newLanes = [...pool.lanes];
          [newLanes[idx], newLanes[ni]] = [newLanes[ni], newLanes[idx]];
          updatePool({ lanes: newLanes });
        };
        const toggleOrientation = () => {
          const totalLaneSize = pool.lanes.reduce((a, l) => a + l.size, 0);
          if (pool.orientation === 'horizontal') {
            updatePool({ orientation: 'vertical', width: totalLaneSize + pool.headerSize, height: 400 });
          } else {
            updatePool({ orientation: 'horizontal', width: 800, height: totalLaneSize });
          }
        };
        return (
          <div className="space-y-2 border-t border-[#334155] pt-2">
            <p className="text-[10px] font-semibold uppercase text-[#94a3b8]">Swimlane Pool</p>
            <div className="flex gap-1">
              <button onClick={toggleOrientation} className={`flex-1 py-1 rounded text-[10px] ${pool.orientation === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8]'}`}>Horizontal</button>
              <button onClick={toggleOrientation} className={`flex-1 py-1 rounded text-[10px] ${pool.orientation === 'vertical' ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8]'}`}>Vertical</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={lbl}>Header</label><input type="number" value={pool.headerSize} onChange={e => updatePool({ headerSize: Math.max(20, +e.target.value) })} className={inp} /></div>
              <div><label className={lbl}>Lane Hdr</label><input type="number" value={pool.laneHeaderSize} onChange={e => updatePool({ laneHeaderSize: Math.max(15, +e.target.value) })} className={inp} /></div>
            </div>
            <div className="flex items-center justify-between">
              <label className={lbl + ' mb-0'}>Lanes ({pool.lanes.length})</label>
              <button onClick={addLane} className="px-2 py-0.5 rounded bg-green-600/20 text-green-400 text-[10px] hover:bg-green-600/30">+ Add</button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {pool.lanes.map((lane, idx) => (
                <div key={lane.id} className="flex items-center gap-1 p-1 rounded bg-[#0f172a]">
                  <input type="color" value={lane.color} onChange={e => updateLane(lane.id, { color: e.target.value })} className="w-4 h-4 rounded cursor-pointer flex-shrink-0" />
                  <input value={lane.label} onChange={e => updateLane(lane.id, { label: e.target.value })} className="flex-1 px-1 py-0.5 rounded bg-transparent border border-[#334155] text-[10px] text-[#e2e8f0] min-w-0" />
                  <input type="number" value={lane.size} onChange={e => updateLane(lane.id, { size: Math.max(60, +e.target.value) })} className="w-12 px-1 py-0.5 rounded bg-transparent border border-[#334155] text-[10px] text-[#e2e8f0]" />
                  <button onClick={() => moveLane(idx, -1)} className="text-[10px] text-[#94a3b8] hover:text-white" title="Move up">↑</button>
                  <button onClick={() => moveLane(idx, 1)} className="text-[10px] text-[#94a3b8] hover:text-white" title="Move down">↓</button>
                  {pool.lanes.length > 1 && <button onClick={() => removeLane(lane.id)} className="text-[10px] text-red-400">✕</button>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Container Properties */}
      {selectedShape.type === 'container' && (() => {
        const cont = selectedShape as ContainerShape;
        const updateCont = (u: Partial<ContainerShape>) => {
          const ns = shapes.map(s => s.id === cont.id ? { ...s, ...u } as Shape : s);
          pushHistory(ns);
        };
        return (
          <div className="space-y-2 border-t border-[#334155] pt-2">
            <p className="text-[10px] font-semibold uppercase text-[#94a3b8]">Container</p>
            <div><label className={lbl}>Title</label><input value={cont.containerLabel} onChange={e => updateCont({ containerLabel: e.target.value })} className={inp} /></div>
            <div className="flex items-center gap-2">
              <div className="flex-1"><label className={lbl}>Header H</label><input type="number" value={cont.headerHeight} onChange={e => updateCont({ headerHeight: Math.max(20, +e.target.value) })} className={inp} /></div>
              <div className="flex-1"><label className={lbl}>Color</label><input type="color" value={cont.containerColor} onChange={e => updateCont({ containerColor: e.target.value })} className="w-full h-7 rounded cursor-pointer" /></div>
            </div>
            <button onClick={() => updateCont({ collapsed: !cont.collapsed })} className={`w-full py-1 rounded text-[10px] ${cont.collapsed ? 'bg-yellow-600/20 text-yellow-400' : 'bg-[#0f172a] text-[#94a3b8]'}`}>{cont.collapsed ? 'Expand' : 'Collapse'}</button>
          </div>
        );
      })()}
    </div>
  );
}
