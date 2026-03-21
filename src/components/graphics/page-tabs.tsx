'use client';
import React, { useState } from 'react';
import { useGraphicsStore, DiagramPage, PageBackground, PageSize, PAGE_SIZE_PRESETS } from '@/store/graphics-store';
import { Plus, X, ChevronDown } from 'lucide-react';

const BG_PRESETS: { label: string; bg: PageBackground }[] = [
  { label: 'Dark', bg: { type: 'solid', color: '#0f172a' } },
  { label: 'Slate', bg: { type: 'solid', color: '#1e293b' } },
  { label: 'Charcoal', bg: { type: 'solid', color: '#18181b' } },
  { label: 'Navy', bg: { type: 'solid', color: '#0c1524' } },
  { label: 'White', bg: { type: 'solid', color: '#ffffff' } },
  { label: 'Warm Gray', bg: { type: 'solid', color: '#292524' } },
  { label: 'Blue Grad', bg: { type: 'gradient', color: '#0f172a', secondaryColor: '#1e3a5f' } },
  { label: 'Purple Grad', bg: { type: 'gradient', color: '#0f0a1a', secondaryColor: '#2d1b69' } },
  { label: 'Dots', bg: { type: 'dots', color: '#0f172a', secondaryColor: '#334155' } },
  { label: 'Lines', bg: { type: 'lines', color: '#0f172a', secondaryColor: '#334155' } },
  { label: 'Graph', bg: { type: 'graph', color: '#0f172a', secondaryColor: '#1e293b' } },
];

export default function PageTabs() {
  const { pages, activePageId, addPage, deletePage, switchPage, renamePage, duplicatePage, setPageBackground, setPageSize } = useGraphicsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(false);

  const activePage = pages.find(p => p.id === activePageId);

  const startRename = (page: DiagramPage) => {
    setEditingId(page.id);
    setEditName(page.name);
    setMenuId(null);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      renamePage(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-[#1e293b] border-t border-[#334155] min-h-[36px]">
      {/* Page tabs */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
        {pages.map((page, idx) => (
          <div
            key={page.id}
            className={`group flex items-center gap-1 px-3 py-1 rounded-t text-xs cursor-pointer transition-colors relative ${
              page.id === activePageId
                ? 'bg-[#0f172a] text-blue-400 border-t-2 border-blue-500'
                : 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]'
            }`}
            onClick={() => switchPage(page.id)}
            onDoubleClick={() => startRename(page)}
          >
            <span className="text-[9px] text-[#64748b] mr-0.5">{idx + 1}</span>
            {editingId === page.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                className="bg-transparent border-b border-blue-500 text-xs w-20 outline-none"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="truncate max-w-[80px]">{page.name}</span>
            )}
            {/* Context menu trigger */}
            <button
              onClick={e => { e.stopPropagation(); setMenuId(menuId === page.id ? null : page.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-white"
            >
              <ChevronDown size={10} />
            </button>
            {/* Context menu */}
            {menuId === page.id && (
              <div className="absolute top-full left-0 z-50 w-36 rounded border border-[#334155] bg-[#1e293b] shadow-xl py-1 mt-0.5"
                onMouseLeave={() => setMenuId(null)}>
                <button onClick={e => { e.stopPropagation(); startRename(page); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#334155]">Rename</button>
                <button onClick={e => { e.stopPropagation(); duplicatePage(page.id); setMenuId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#334155]">Duplicate</button>
                <button onClick={e => { e.stopPropagation(); setShowPageSettings(true); setMenuId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#334155]">Page Settings</button>
                {pages.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); deletePage(page.id); setMenuId(null); }} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#334155]">Delete</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add page button */}
      <button
        onClick={() => addPage()}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#94a3b8] hover:bg-[#334155] hover:text-white transition-colors"
        title="Add page"
      >
        <Plus size={12} /> Add Page
      </button>

      {/* Page count */}
      <span className="text-[10px] text-[#64748b] ml-2">{pages.length} page{pages.length > 1 ? 's' : ''}</span>

      {/* Page Settings Modal */}
      {showPageSettings && activePage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowPageSettings(false)}>
          <div className="w-80 rounded-xl bg-[#1e293b] border border-[#334155] p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e2e8f0]">Page Settings — {activePage.name}</h3>
              <button onClick={() => setShowPageSettings(false)} className="text-[#94a3b8] hover:text-white"><X size={14} /></button>
            </div>

            {/* Page Size */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Page Size</p>
              <div className="grid grid-cols-2 gap-1">
                {(Object.entries(PAGE_SIZE_PRESETS) as [string, { w: number; h: number; label: string }][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPageSize(activePage.id, key as PageSize)}
                    className={`py-1.5 px-2 rounded text-[10px] transition-colors ${
                      activePage.sizePreset === key ? 'bg-blue-600 text-white' : 'bg-[#0f172a] hover:bg-[#334155] text-[#e2e8f0]'
                    }`}
                  >
                    {val.label.split(' (')[0]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Width</label>
                  <input
                    type="number"
                    value={activePage.width}
                    onChange={e => setPageSize(activePage.id, 'custom', +e.target.value, activePage.height)}
                    className="w-full px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Height</label>
                  <input
                    type="number"
                    value={activePage.height}
                    onChange={e => setPageSize(activePage.id, 'custom', activePage.width, +e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0]"
                  />
                </div>
              </div>
            </div>

            {/* Page Background */}
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Background</p>
              <div className="grid grid-cols-4 gap-1.5">
                {BG_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setPageBackground(activePage.id, preset.bg)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors ${
                      activePage.background.type === preset.bg.type && activePage.background.color === preset.bg.color
                        ? 'ring-2 ring-blue-500'
                        : 'hover:bg-[#334155]'
                    }`}
                  >
                    <div
                      className="w-8 h-6 rounded border border-[#334155]"
                      style={{
                        background: preset.bg.type === 'gradient'
                          ? `linear-gradient(135deg, ${preset.bg.color}, ${preset.bg.secondaryColor})`
                          : preset.bg.color,
                        ...(preset.bg.type === 'dots' ? {
                          backgroundImage: `radial-gradient(circle, ${preset.bg.secondaryColor} 1px, transparent 1px)`,
                          backgroundSize: '8px 8px',
                        } : {}),
                        ...(preset.bg.type === 'lines' ? {
                          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 5px, ${preset.bg.secondaryColor} 5px, ${preset.bg.secondaryColor} 6px)`,
                        } : {}),
                        ...(preset.bg.type === 'graph' ? {
                          backgroundImage: `linear-gradient(${preset.bg.secondaryColor} 1px, transparent 1px), linear-gradient(90deg, ${preset.bg.secondaryColor} 1px, transparent 1px)`,
                          backgroundSize: '8px 8px',
                        } : {}),
                      }}
                    />
                    <span className="text-[8px] text-[#94a3b8]">{preset.label}</span>
                  </button>
                ))}
              </div>
              {/* Custom color */}
              <div className="flex items-center gap-2 mt-2">
                <label className="text-[10px] text-[#94a3b8]">Custom:</label>
                <input
                  type="color"
                  value={activePage.background.color}
                  onChange={e => setPageBackground(activePage.id, { ...activePage.background, color: e.target.value })}
                  className="w-6 h-6 rounded border border-[#334155] cursor-pointer bg-transparent"
                />
                <span className="text-[10px] text-[#64748b]">{activePage.background.color}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
