'use client';
import React, { useState } from 'react';
import { useCADStore, CADLayer } from '@/store/cad-store';

export default function CADLayerManager() {
  const {
    layers, activeLayerId, addLayer, removeLayer, updateLayer, reorderLayer, setActiveLayerId,
  } = useCADStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (layer: CADLayer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      updateLayer(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const inp = 'w-full px-2 py-1 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0]';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#334155]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
          Layers ({layers.length})
        </span>
        <button
          onClick={() => addLayer()}
          className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px]"
        >
          + Add
        </button>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {[...layers].sort((a, b) => a.order - b.order).map(layer => (
          <div
            key={layer.id}
            onClick={() => setActiveLayerId(layer.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
              layer.id === activeLayerId
                ? 'bg-blue-600/25 border border-blue-500/40'
                : 'hover:bg-[#334155] border border-transparent'
            }`}
          >
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/20"
              style={{ backgroundColor: layer.color }}
            />

            {/* Visibility */}
            <button
              onClick={e => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
              className={`text-[10px] flex-shrink-0 w-5 text-center ${layer.visible ? 'text-blue-400' : 'text-[#475569]'}`}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? '👁' : '—'}
            </button>

            {/* Lock */}
            <button
              onClick={e => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
              className={`text-[10px] flex-shrink-0 w-5 text-center ${layer.locked ? 'text-amber-400' : 'text-[#475569]'}`}
              title={layer.locked ? 'Unlock' : 'Lock'}
            >
              {layer.locked ? '🔒' : '🔓'}
            </button>

            {/* Name */}
            {editingId === layer.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                autoFocus
                className={`${inp} flex-1 py-0.5`}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="flex-1 truncate"
                onDoubleClick={e => { e.stopPropagation(); startRename(layer); }}
                title="Double-click to rename"
              >
                {layer.name}
              </span>
            )}

            {/* Opacity */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={layer.opacity}
              onChange={e => { e.stopPropagation(); updateLayer(layer.id, { opacity: +e.target.value }); }}
              onClick={e => e.stopPropagation()}
              className="w-12 flex-shrink-0"
              title={`Opacity: ${Math.round(layer.opacity * 100)}%`}
            />

            {/* Reorder */}
            <div className="flex flex-col flex-shrink-0">
              <button
                onClick={e => { e.stopPropagation(); reorderLayer(layer.id, 'up'); }}
                className="text-[8px] leading-none text-[#94a3b8] hover:text-white"
              >▲</button>
              <button
                onClick={e => { e.stopPropagation(); reorderLayer(layer.id, 'down'); }}
                className="text-[8px] leading-none text-[#94a3b8] hover:text-white"
              >▼</button>
            </div>

            {/* Color picker */}
            <input
              type="color"
              value={layer.color}
              onChange={e => { e.stopPropagation(); updateLayer(layer.id, { color: e.target.value }); }}
              onClick={e => e.stopPropagation()}
              className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
              title="Layer color"
            />

            {/* Delete */}
            {layers.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
                className="text-red-400 hover:text-red-300 text-[10px] flex-shrink-0"
                title="Delete layer"
              >✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Active layer info */}
      <div className="px-3 py-2 border-t border-[#334155] text-[10px] text-[#94a3b8]">
        Active: {layers.find(l => l.id === activeLayerId)?.name ?? '—'}
      </div>
    </div>
  );
}
