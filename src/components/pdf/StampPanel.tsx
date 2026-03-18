'use client';

import React, { useState } from 'react';

const PRESET_STAMPS = [
  { id: 'approved', label: 'APPROVED', color: '#16a34a', bg: '#dcfce7', border: '#16a34a' },
  { id: 'confidential', label: 'CONFIDENTIAL', color: '#dc2626', bg: '#fee2e2', border: '#dc2626' },
  { id: 'draft', label: 'DRAFT', color: '#2563eb', bg: '#dbeafe', border: '#2563eb' },
  { id: 'rejected', label: 'REJECTED', color: '#dc2626', bg: '#fef2f2', border: '#dc2626' },
  { id: 'under-review', label: 'UNDER REVIEW', color: '#d97706', bg: '#fef3c7', border: '#d97706' },
  { id: 'final', label: 'FINAL', color: '#7c3aed', bg: '#ede9fe', border: '#7c3aed' },
  { id: 'for-internal', label: 'FOR INTERNAL USE', color: '#0891b2', bg: '#cffafe', border: '#0891b2' },
  { id: 'not-for-dist', label: 'NOT FOR DISTRIBUTION', color: '#be185d', bg: '#fce7f3', border: '#be185d' },
  { id: 'copy', label: 'COPY', color: '#6b7280', bg: '#f3f4f6', border: '#6b7280' },
  { id: 'void', label: 'VOID', color: '#ef4444', bg: '#fef2f2', border: '#ef4444' },
  { id: 'sample', label: 'SAMPLE', color: '#8b5cf6', bg: '#f5f3ff', border: '#8b5cf6' },
  { id: 'paid', label: 'PAID', color: '#059669', bg: '#ecfdf5', border: '#059669' },
];

interface PlacedStamp {
  id: string;
  stampId: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  x: number;
  y: number;
  page: number;
  rotation: number;
  opacity: number;
  size: number;
}

let stampCounter = 0;

export default function StampPanel() {
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [placedStamps, setPlacedStamps] = useState<PlacedStamp[]>([]);
  const [stampOpacity, setStampOpacity] = useState(0.8);
  const [stampRotation, setStampRotation] = useState(-30);
  const [stampSize, setStampSize] = useState(120);
  const [customText, setCustomText] = useState('');
  const [customColor, setCustomColor] = useState('#dc2626');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  const addStamp = (stamp: typeof PRESET_STAMPS[0]) => {
    const placed: PlacedStamp = {
      id: `stamp_${++stampCounter}`,
      stampId: stamp.id,
      label: stamp.label,
      color: stamp.color,
      bg: stamp.bg,
      border: stamp.border,
      x: Math.random() * 300 + 100,
      y: Math.random() * 200 + 100,
      page: 1,
      rotation: stampRotation,
      opacity: stampOpacity,
      size: stampSize,
    };
    setPlacedStamps(prev => [...prev, placed]);
    setSelectedStamp(placed.id);
  };

  const addCustomStamp = () => {
    if (!customText.trim()) return;
    const placed: PlacedStamp = {
      id: `stamp_${++stampCounter}`,
      stampId: 'custom',
      label: customText.toUpperCase(),
      color: customColor,
      bg: customColor + '20',
      border: customColor,
      x: Math.random() * 300 + 100,
      y: Math.random() * 200 + 100,
      page: 1,
      rotation: stampRotation,
      opacity: stampOpacity,
      size: stampSize,
    };
    setPlacedStamps(prev => [...prev, placed]);
    setSelectedStamp(placed.id);
  };

  const removeStamp = (id: string) => {
    setPlacedStamps(prev => prev.filter(s => s.id !== id));
    if (selectedStamp === id) setSelectedStamp(null);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="p-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Stamp Tool</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Add stamps to your document</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(['preset', 'custom'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-400' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            {tab === 'preset' ? 'Preset Stamps' : 'Custom Stamp'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Stamp Settings */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Settings</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--muted-foreground)] block mb-1">Opacity</label>
              <input type="range" min={0.1} max={1} step={0.1} value={stampOpacity} onChange={e => setStampOpacity(+e.target.value)} className="w-full" />
              <span className="text-[10px] text-[var(--muted-foreground)]">{Math.round(stampOpacity * 100)}%</span>
            </div>
            <div>
              <label className="text-[10px] text-[var(--muted-foreground)] block mb-1">Rotation</label>
              <input type="range" min={-90} max={90} step={5} value={stampRotation} onChange={e => setStampRotation(+e.target.value)} className="w-full" />
              <span className="text-[10px] text-[var(--muted-foreground)]">{stampRotation}°</span>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-[var(--muted-foreground)] block mb-1">Size</label>
              <input type="range" min={60} max={200} step={10} value={stampSize} onChange={e => setStampSize(+e.target.value)} className="w-full" />
              <span className="text-[10px] text-[var(--muted-foreground)]">{stampSize}px</span>
            </div>
          </div>
        </div>

        {activeTab === 'preset' ? (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Click to Add Stamp</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_STAMPS.map(stamp => (
                <button
                  key={stamp.id}
                  onClick={() => addStamp(stamp)}
                  className="p-2 rounded border-2 text-center transition-all hover:scale-105 active:scale-95"
                  style={{ borderColor: stamp.border, backgroundColor: stamp.bg + '33' }}
                >
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: stamp.color }}>{stamp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Custom Stamp</p>
            <div>
              <label className="text-[10px] text-[var(--muted-foreground)] block mb-1">Stamp Text</label>
              <input
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g. FOR REVIEW"
                className="w-full px-2 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--muted-foreground)] block mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <span className="text-xs text-[var(--muted-foreground)]">{customColor}</span>
              </div>
            </div>
            {customText && (
              <div className="p-3 rounded border-2 text-center" style={{ borderColor: customColor, backgroundColor: customColor + '20' }}>
                <span className="text-sm font-bold tracking-widest" style={{ color: customColor }}>{customText.toUpperCase()}</span>
              </div>
            )}
            <button
              onClick={addCustomStamp}
              disabled={!customText.trim()}
              className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium"
            >
              Add Custom Stamp
            </button>
          </div>
        )}

        {/* Placed Stamps */}
        {placedStamps.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Placed Stamps ({placedStamps.length})</p>
            <div className="space-y-1">
              {placedStamps.map(stamp => (
                <div
                  key={stamp.id}
                  onClick={() => setSelectedStamp(stamp.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${selectedStamp === stamp.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-[var(--card)]'}`}
                >
                  <span className="text-[10px] font-bold flex-1 truncate" style={{ color: stamp.color }}>{stamp.label}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">P{stamp.page}</span>
                  <button
                    onClick={e => { e.stopPropagation(); removeStamp(stamp.id); }}
                    className="text-red-400 hover:text-red-300 text-[10px] px-1"
                  >✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPlacedStamps([])}
              className="w-full py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs"
            >
              Clear All Stamps
            </button>
          </div>
        )}

        {/* Apply Button */}
        <button
          disabled={placedStamps.length === 0}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium"
        >
          Apply Stamps to PDF ({placedStamps.length})
        </button>
      </div>
    </div>
  );
}
