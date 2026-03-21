'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useGraphicsStore, createShape, genId, Shape, ShapeBase, DIAGRAM_THEMES } from '@/store/graphics-store';
import GraphicsCanvas from './graphics-canvas';
import { ShapeLibraryPanel, PropertiesPanel } from './graphics-shape-panel';
import PageTabs from './page-tabs';
import ThemePicker from './theme-picker';

const TOOLS = [
  { id: 'select', icon: '▷', label: 'Select' }, { id: 'rect', icon: '▭', label: 'Rect' }, { id: 'ellipse', icon: '○', label: 'Ellipse' },
  { id: 'diamond', icon: '◇', label: 'Diamond' }, { id: 'triangle', icon: '△', label: 'Triangle' }, { id: 'hexagon', icon: '⬡', label: 'Hexagon' },
  { id: 'star', icon: '☆', label: 'Star' }, { id: 'cloud', icon: '☁', label: 'Cloud' }, { id: 'cylinder', icon: '⌀', label: 'Cylinder' },
  { id: 'callout', icon: '💬', label: 'Callout' }, { id: 'blockArrow', icon: '⇒', label: 'Arrow' }, { id: 'bracket', icon: '[ ]', label: 'Bracket' },
  { id: 'banner', icon: '〜', label: 'Banner' }, { id: 'ribbon', icon: '⬡', label: 'Ribbon' },
  { id: 'arrow', icon: '→', label: 'Connector' }, { id: 'line', icon: '—', label: 'Line' }, { id: 'text', icon: 'T', label: 'Text' },
  { id: 'pen', icon: '✒', label: 'Pen' }, { id: 'hand', icon: '✋', label: 'Pan' },
];

export default function GraphicsEditor() {
  const { shapes, selectedId, selectedIds, tool, zoom, showGrid, showRulers, showGuides, snapToGrid, smartGuidesEnabled, showLayers, showProperties, showAI, canvasWidth, canvasHeight, shapes: _s,
    setTool, setZoom, setPan, setShowGrid, setShowRulers, setShowGuides, setSnapToGrid, setSmartGuidesEnabled, setShowLayers, setShowProperties, setShowAI, setCanvasWidth, setCanvasHeight,
    setGuides, pushHistory, undo, redo, clipboard, setClipboard } = useGraphicsStore();

  const [showCanvasResize, setShowCanvasResize] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'layers' | 'templates'>('layers');
  const [localW, setLocalW] = useState(canvasWidth);
  const [localH, setLocalH] = useState(canvasHeight);

  const selectedShape = shapes.find(s => s.id === selectedId);

  // Copy / Paste
  const copySelected = useCallback(() => {
    const ids = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
    setClipboard(shapes.filter(s => ids.includes(s.id)));
  }, [shapes, selectedIds, selectedId, setClipboard]);

  const pasteClipboard = useCallback(() => {
    if (clipboard.length === 0) return;
    const ns = clipboard.map(s => ({ ...s, id: genId(), x: s.x + 20, y: s.y + 20 })) as Shape[];
    pushHistory([...shapes, ...ns]);
  }, [clipboard, shapes, pushHistory]);

  // Group / Ungroup
  const groupSelected = useCallback(() => {
    const ids = selectedIds.length > 1 ? selectedIds : (selectedId ? [selectedId] : []);
    if (ids.length < 2) return;
    const gid = genId();
    pushHistory(shapes.map(s => ids.includes(s.id) ? { ...s, groupId: gid } as Shape : s));
  }, [shapes, selectedIds, selectedId, pushHistory]);

  const ungroupSelected = useCallback(() => {
    const s = shapes.find(sh => sh.id === selectedId);
    if (!s?.groupId) return;
    const gid = s.groupId;
    pushHistory(shapes.map(sh => sh.groupId === gid ? { ...sh, groupId: undefined } as Shape : sh));
  }, [shapes, selectedId, pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' && selectedId) { pushHistory(shapes.filter(s => s.id !== selectedId)); }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 'c') { e.preventDefault(); copySelected(); }
      if (e.ctrlKey && e.key === 'v') { e.preventDefault(); pasteClipboard(); }
      if (e.ctrlKey && e.key === 'd' && selectedId) { e.preventDefault(); const s = shapes.find(sh => sh.id === selectedId); if (s) pushHistory([...shapes, { ...s, id: genId(), x: s.x + 20, y: s.y + 20 } as Shape]); }
      if (e.ctrlKey && e.key === 'g') { e.preventDefault(); groupSelected(); }
      if (e.key === 'Escape') { useGraphicsStore.getState().setSelectedId(null); useGraphicsStore.getState().setSelectedIds([]); setTool('select'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, shapes, pushHistory, undo, redo, copySelected, pasteClipboard, groupSelected, setTool]);

  // Export
  const exportSVG = () => {
    const el = document.querySelector('svg.graphics-export') as SVGSVGElement;
    if (!el) return;
    const blob = new Blob([new XMLSerializer().serializeToString(el)], { type: 'image/svg+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'diagram.svg'; a.click();
  };

  const exportPNG = () => {
    const el = document.querySelector('svg') as SVGSVGElement;
    if (!el) return;
    const data = new XMLSerializer().serializeToString(el);
    const canvas = document.createElement('canvas'); canvas.width = canvasWidth; canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); const a = document.createElement('a'); a.href = canvas.toDataURL(); a.download = 'diagram.png'; a.click(); };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  };

  const btn = (active: boolean) => `px-2 py-1.5 rounded text-xs transition-colors ${active ? 'bg-blue-600 text-white' : 'hover:bg-[#334155] text-[#e2e8f0]'}`;

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-[#e2e8f0]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[#334155] bg-[#1e293b] flex-wrap min-h-[40px]">
        {TOOLS.map(t => <button key={t.id} onClick={() => setTool(t.id as any)} title={t.label} className={btn(tool === t.id)}>{t.icon}</button>)}
        <div className="w-px h-5 bg-[#334155] mx-1" />
        <button onClick={undo} title="Undo Ctrl+Z" className="px-2 py-1.5 rounded hover:bg-[#334155] text-sm">↩</button>
        <button onClick={redo} title="Redo Ctrl+Y" className="px-2 py-1.5 rounded hover:bg-[#334155] text-sm">↪</button>
        <button onClick={copySelected} title="Copy Ctrl+C" className="px-2 py-1 rounded hover:bg-[#334155] text-xs">⎘</button>
        <button onClick={pasteClipboard} title="Paste Ctrl+V" className="px-2 py-1 rounded hover:bg-[#334155] text-xs">📋</button>
        <div className="w-px h-5 bg-[#334155] mx-1" />
        {selectedIds.length > 1 && <button onClick={groupSelected} className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-xs hover:bg-blue-600/30">Group</button>}
        {selectedShape?.groupId && <button onClick={ungroupSelected} className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-xs hover:bg-blue-600/30">Ungroup</button>}
        <div className="w-px h-5 bg-[#334155] mx-1" />
        <button onClick={() => setShowGrid(!showGrid)} className={btn(showGrid)}>Grid</button>
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={btn(snapToGrid)}>Snap</button>
        <button onClick={() => setShowRulers(!showRulers)} className={btn(showRulers)}>Rulers</button>
        <button onClick={() => setShowGuides(!showGuides)} className={btn(showGuides)}>Guides</button>
        <button onClick={() => setSmartGuidesEnabled(!smartGuidesEnabled)} className={btn(smartGuidesEnabled)}>SmartGuides</button>
        {showGuides && <>
          <button onClick={() => setGuides(g => [...g, { id: `g_${Date.now()}`, orientation: 'horizontal', position: 200 }])} className="px-1.5 py-1 rounded hover:bg-[#334155] text-[10px]">+H</button>
          <button onClick={() => setGuides(g => [...g, { id: `g_${Date.now()}`, orientation: 'vertical', position: 300 }])} className="px-1.5 py-1 rounded hover:bg-[#334155] text-[10px]">+V</button>
        </>}
        <div className="flex-1" />
        <ThemePicker />
        <div className="w-px h-5 bg-[#334155] mx-1" />
        <button onClick={() => { setLocalW(canvasWidth); setLocalH(canvasHeight); setShowCanvasResize(true); }} className="px-2 py-1 rounded hover:bg-[#334155] text-xs">⛶ Canvas</button>
        <button onClick={exportSVG} className="px-2 py-1 rounded bg-green-600/20 text-green-400 text-xs hover:bg-green-600/30">SVG ⬇</button>
        <button onClick={exportPNG} className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-xs hover:bg-blue-600/30">PNG ⬇</button>
        <div className="w-px h-5 bg-[#334155] mx-1" />
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="px-2 py-1 rounded hover:bg-[#334155]">−</button>
        <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="px-2 py-1 rounded hover:bg-[#334155]">+</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 rounded hover:bg-[#334155] text-xs">Fit</button>
        <div className="w-px h-5 bg-[#334155] mx-1" />
        <button onClick={() => setShowLayers(!showLayers)} className={btn(showLayers)}>Layers</button>
        <button onClick={() => setShowProperties(!showProperties)} className={btn(showProperties)}>Props</button>
        <button onClick={() => setShowAI(!showAI)} className={btn(showAI)}>🤖 AI</button>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Shape library + Layers */}
        {showLayers && (
          <div className="flex flex-col w-56 border-r border-[#334155] bg-[#1e293b] overflow-hidden">
            <div className="flex border-b border-[#334155]">
              {(['layers', 'templates'] as const).map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 text-[10px] uppercase font-semibold ${activeTab === tab ? 'bg-[#0f172a] text-blue-400' : 'text-[#94a3b8] hover:bg-[#0f172a]'}`}>{tab}</button>)}
            </div>
            {activeTab === 'templates' ? (
              <ShapeLibraryPanel />
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Layers ({shapes.length})</p>
                <div className="space-y-1">
                  {[...shapes].reverse().map((s, i) => (
                    <div key={s.id} onClick={() => { useGraphicsStore.getState().setSelectedId(s.id); useGraphicsStore.getState().setSelectedIds([s.id]); }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs cursor-pointer ${s.id === selectedId ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-[#334155]'}`}>
                      <button onClick={e => { e.stopPropagation(); const ns = shapes.map(sh => sh.id === s.id ? { ...sh, visible: !sh.visible } as Shape : sh); pushHistory(ns); }} className="text-[10px]">{s.visible ? '👁' : '🚫'}</button>
                      <button onClick={e => { e.stopPropagation(); const ns = shapes.map(sh => sh.id === s.id ? { ...sh, locked: !sh.locked } as Shape : sh); pushHistory(ns); }} className="text-[10px]">{s.locked ? '🔒' : '🔓'}</button>
                      <span className="flex-1 truncate">{s.label || `${s.type} ${shapes.length - i}`}</span>
                      {s.groupId && <span className="text-[8px] px-1 rounded bg-blue-600/20 text-blue-400">G</span>}
                      <button onClick={e => { e.stopPropagation(); pushHistory(shapes.filter(sh => sh.id !== s.id)); }} className="text-red-400 text-[10px]">✕</button>
                    </div>
                  ))}
                  {shapes.length === 0 && <p className="text-[10px] text-[#94a3b8] text-center py-4">Click canvas to add shapes</p>}
                </div>
              </div>
            )}
          </div>
        )}

        <GraphicsCanvas />

        {showProperties && <PropertiesPanel />}

        {/* AI Panel */}
        {showAI && (
          <div className="w-60 border-l border-[#334155] bg-[#1e293b] flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-[#334155]"><p className="text-xs font-semibold text-purple-400">🤖 AI Assistant</p></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {['Create flowchart for user login', 'Design org chart for startup', 'Mind map for project planning', 'Wireframe for mobile app'].map(s => <button key={s} onClick={() => setAiPrompt(s)} className="w-full text-left px-2 py-1.5 rounded text-[11px] bg-[#0f172a] hover:bg-[#334155]">{s}</button>)}
              <button onClick={() => { const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']; pushHistory(shapes.map(s => ({ ...s, fill: colors[Math.floor(Math.random() * colors.length)] } as Shape))); }} className="w-full px-2 py-1.5 rounded text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30">🎨 Randomize colors</button>
              <button onClick={() => pushHistory(shapes.map((s, i) => ({ ...s, x: 80 + (i % 4) * 160, y: 80 + Math.floor(i / 4) * 130 } as Shape)))} className="w-full px-2 py-1.5 rounded text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30">📏 Auto-layout</button>
            </div>
            <div className="p-3 border-t border-[#334155] flex gap-2">
              <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe what to create..." className="flex-1 px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs" />
              <button className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-xs text-white">Go</button>
            </div>
          </div>
        )}
      </div>

      {/* Page Tabs */}
      <PageTabs />

      {/* Canvas Resize Modal */}
      {showCanvasResize && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-72 rounded-xl bg-[#1e293b] border border-[#334155] p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">Canvas Size</h3><button onClick={() => setShowCanvasResize(false)} className="text-[#94a3b8] hover:text-white">✕</button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] text-[#94a3b8] block mb-1">Width</label><input type="number" value={localW} onChange={e => setLocalW(+e.target.value)} className="w-full px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs" /></div>
                <div><label className="text-[10px] text-[#94a3b8] block mb-1">Height</label><input type="number" value={localH} onChange={e => setLocalH(+e.target.value)} className="w-full px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[['A4', 794, 1123], ['Letter', 816, 1056], ['HD 1080p', 1920, 1080], ['4K', 3840, 2160], ['Instagram', 1080, 1080], ['Slide 16:9', 1920, 1080]].map(([n, w, h]) => <button key={n as string} onClick={() => { setLocalW(w as number); setLocalH(h as number); }} className="py-1 rounded bg-[#0f172a] hover:bg-[#334155] text-[10px]">{n}</button>)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCanvasResize(false)} className="flex-1 py-1.5 rounded bg-[#0f172a] text-xs">Cancel</button>
                <button onClick={() => { setCanvasWidth(localW); setCanvasHeight(localH); setShowCanvasResize(false); }} className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
