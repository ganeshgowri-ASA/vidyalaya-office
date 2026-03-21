'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { DrawLayer, BlendMode } from './drawing-types';
import { BLEND_MODES } from './drawing-types';

interface DrawingLayersProps {
  layers: DrawLayer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<DrawLayer>) => void;
  onReorderLayer: (from: number, to: number) => void;
}

export default function DrawingLayers({
  layers, activeLayerId,
  onSelectLayer, onAddLayer, onDeleteLayer, onUpdateLayer, onReorderLayer,
}: DrawingLayersProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  return (
    <div
      className="flex flex-col text-xs"
      style={{ background: 'var(--sidebar, #1e293b)', borderLeft: '1px solid var(--border, #334155)', width: 200, minHeight: '100%' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="font-semibold text-white text-xs">Layers</span>
        <button onClick={onAddLayer} title="Add Layer"
          className="text-gray-400 hover:text-white transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Layer list — reversed so top layer appears at top */}
      <div className="flex-1 overflow-y-auto">
        {[...layers].reverse().map((layer, revIdx) => {
          const idx = layers.length - 1 - revIdx;
          const isActive = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null && dragIdx !== idx) {
                  onReorderLayer(dragIdx, idx);
                }
                setDragIdx(null);
              }}
              onClick={() => onSelectLayer(layer.id)}
              className={`flex flex-col gap-1 px-2 py-2 cursor-pointer border-b border-white/5 transition-colors
                ${isActive ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-1">
                {/* Visibility */}
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }}
                  className="text-gray-400 hover:text-white"
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                {/* Lock */}
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }}
                  className="text-gray-400 hover:text-white"
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                {/* Name */}
                <input
                  className="flex-1 bg-transparent text-white text-xs truncate outline-none hover:bg-white/10 rounded px-1"
                  value={layer.name}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateLayer(layer.id, { name: e.target.value })}
                />
                {/* Delete */}
                {layers.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                    className="text-gray-500 hover:text-red-400"
                    title="Delete layer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              {/* Opacity row */}
              <div className="flex items-center gap-1 pl-6">
                <span className="text-gray-500 w-10">Opacity</span>
                <input type="range" min={0} max={1} step={0.01} value={layer.opacity}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateLayer(layer.id, { opacity: +e.target.value })}
                  className="flex-1 accent-blue-500" />
                <span className="text-gray-400 w-8 text-right">{Math.round(layer.opacity * 100)}%</span>
              </div>
              {/* Blend mode */}
              <div className="flex items-center gap-1 pl-6">
                <span className="text-gray-500 w-10">Blend</span>
                <select
                  value={layer.blendMode}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateLayer(layer.id, { blendMode: e.target.value as BlendMode })}
                  className="flex-1 bg-gray-800 text-white rounded px-1 py-0.5 text-xs"
                >
                  {BLEND_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reorder arrows */}
      {layers.length > 1 && (
        <div className="flex justify-center gap-2 px-3 py-2 border-t border-white/10">
          <button
            onClick={() => {
              const idx = layers.findIndex((l) => l.id === activeLayerId);
              if (idx < layers.length - 1) onReorderLayer(idx, idx + 1);
            }}
            title="Move layer up"
            className="text-gray-400 hover:text-white"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => {
              const idx = layers.findIndex((l) => l.id === activeLayerId);
              if (idx > 0) onReorderLayer(idx, idx - 1);
            }}
            title="Move layer down"
            className="text-gray-400 hover:text-white"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
