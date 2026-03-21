'use client';
import React, { useState, useCallback } from 'react';
import { useCADStore, SavedColor } from '@/store/cad-store';

const PROFESSIONAL_PALETTES = {
  'CAD Standard': [
    '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#7f00ff', '#ff00ff',
    '#800000', '#804000', '#808000', '#008000', '#008080', '#000080', '#400080', '#800080',
    '#c00000', '#c06000', '#c0c000', '#00c000', '#00c0c0', '#0000c0', '#6000c0', '#c000c0',
  ],
  'Material': [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
    '#795548', '#9e9e9e', '#607d8b', '#263238', '#eceff1', '#fafafa', '#212121', '#000000',
  ],
  'Pastel': [
    '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2',
    '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc',
    '#d7ccc8', '#cfd8dc', '#f5f5f5', '#eeeeee', '#bdbdbd', '#757575', '#424242', '#212121',
  ],
  'Grayscale': [
    '#ffffff', '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96',
    '#495057', '#343a40', '#212529', '#000000',
  ],
};

interface CADColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function CADColorPicker({ value, onChange, label }: CADColorPickerProps) {
  const {
    recentColors, savedColors, addRecentColor, addSavedColor, removeSavedColor,
  } = useCADStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activePalette, setActivePalette] = useState<keyof typeof PROFESSIONAL_PALETTES>('CAD Standard');
  const [customHex, setCustomHex] = useState(value);
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(50);
  const [saveName, setSaveName] = useState('');

  const selectColor = useCallback((hex: string) => {
    onChange(hex);
    addRecentColor(hex);
    setCustomHex(hex);
  }, [onChange, addRecentColor]);

  const hslColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const hslToHex = (h: number, s: number, l: number): string => {
    const sN = s / 100;
    const lN = l / 100;
    const a = sN * Math.min(lN, 1 - lN);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const applyHSL = () => {
    const hex = hslToHex(hue, saturation, lightness);
    selectColor(hex);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div className="flex items-center gap-2">
        {label && <label className="text-[10px] text-[#94a3b8]">{label}</label>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0f172a] border border-[#334155] hover:border-[#475569] transition-colors"
        >
          <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: value }} />
          <span className="text-[10px] text-[#e2e8f0] font-mono">{value}</span>
          <span className="text-[8px] text-[#94a3b8]">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 rounded-lg bg-[#1e293b] border border-[#334155] shadow-2xl z-50 overflow-hidden">
          {/* Palette tabs */}
          <div className="flex flex-wrap gap-0.5 px-2 pt-2 pb-1">
            {(Object.keys(PROFESSIONAL_PALETTES) as (keyof typeof PROFESSIONAL_PALETTES)[]).map(name => (
              <button
                key={name}
                onClick={() => setActivePalette(name)}
                className={`px-1.5 py-0.5 rounded text-[9px] ${
                  activePalette === name ? 'bg-blue-600 text-white' : 'bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Color grid */}
          <div className="px-2 pb-2">
            <div className="flex flex-wrap gap-0.5">
              {PROFESSIONAL_PALETTES[activePalette].map(c => (
                <button
                  key={c}
                  onClick={() => selectColor(c)}
                  className={`w-5 h-5 rounded-sm border transition-transform hover:scale-125 ${
                    value === c ? 'border-white ring-1 ring-blue-400 scale-110' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* HSL sliders */}
          <div className="px-2 pb-2 border-t border-[#334155] pt-2 space-y-1">
            <p className="text-[9px] text-[#94a3b8] font-semibold uppercase">HSL Mixer</p>
            <div className="flex items-center gap-2">
              <label className="text-[9px] text-[#94a3b8] w-4">H</label>
              <input type="range" min={0} max={360} value={hue} onChange={e => setHue(+e.target.value)} className="flex-1" />
              <span className="text-[9px] text-[#94a3b8] w-7">{hue}°</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] text-[#94a3b8] w-4">S</label>
              <input type="range" min={0} max={100} value={saturation} onChange={e => setSaturation(+e.target.value)} className="flex-1" />
              <span className="text-[9px] text-[#94a3b8] w-7">{saturation}%</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] text-[#94a3b8] w-4">L</label>
              <input type="range" min={0} max={100} value={lightness} onChange={e => setLightness(+e.target.value)} className="flex-1" />
              <span className="text-[9px] text-[#94a3b8] w-7">{lightness}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 rounded border border-white/20" style={{ backgroundColor: hslColor }} />
              <span className="text-[9px] text-[#94a3b8] font-mono">{hslToHex(hue, saturation, lightness)}</span>
              <button onClick={applyHSL} className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[9px]">Apply</button>
            </div>
          </div>

          {/* Custom hex input */}
          <div className="px-2 pb-2 border-t border-[#334155] pt-2">
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={customHex.startsWith('#') ? customHex : '#3b82f6'}
                onChange={e => { setCustomHex(e.target.value); selectColor(e.target.value); }}
                className="w-6 h-6 rounded cursor-pointer flex-shrink-0"
              />
              <input
                value={customHex}
                onChange={e => setCustomHex(e.target.value)}
                onBlur={() => { if (/^#[0-9a-fA-F]{6}$/.test(customHex)) selectColor(customHex); }}
                onKeyDown={e => { if (e.key === 'Enter' && /^#[0-9a-fA-F]{6}$/.test(customHex)) selectColor(customHex); }}
                className="flex-1 px-2 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[10px] text-[#e2e8f0] font-mono"
                placeholder="#000000"
              />
              <button
                onClick={() => { if (customHex) selectColor(customHex); }}
                className="px-2 py-0.5 rounded bg-[#0f172a] hover:bg-[#334155] text-[10px] text-[#94a3b8]"
              >Set</button>
            </div>
          </div>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="px-2 pb-2 border-t border-[#334155] pt-2">
              <p className="text-[9px] text-[#94a3b8] font-semibold uppercase mb-1">Recent</p>
              <div className="flex flex-wrap gap-0.5">
                {recentColors.slice(0, 12).map((c, i) => (
                  <button key={`${c}-${i}`} onClick={() => selectColor(c)} className="w-5 h-5 rounded-sm border border-white/10 hover:scale-125 transition-transform" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          )}

          {/* Saved colors */}
          <div className="px-2 pb-2 border-t border-[#334155] pt-2">
            <p className="text-[9px] text-[#94a3b8] font-semibold uppercase mb-1">Saved</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {savedColors.map(c => (
                <div key={c.hex} className="group relative">
                  <button onClick={() => selectColor(c.hex)} className="w-5 h-5 rounded-sm border border-white/10 hover:scale-125 transition-transform" style={{ backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} />
                  <button onClick={() => removeSavedColor(c.hex)} className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-[7px] leading-none hidden group-hover:flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Name..."
                className="flex-1 px-1.5 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[9px] text-[#e2e8f0]"
              />
              <button
                onClick={() => { addSavedColor({ hex: value, name: saveName || value }); setSaveName(''); }}
                className="px-2 py-0.5 rounded bg-green-600/20 text-green-400 text-[9px] hover:bg-green-600/30"
              >Save</button>
            </div>
          </div>

          {/* Close */}
          <div className="px-2 py-1.5 border-t border-[#334155] flex justify-end">
            <button onClick={() => setIsOpen(false)} className="px-3 py-0.5 rounded bg-[#0f172a] hover:bg-[#334155] text-[10px] text-[#94a3b8]">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
