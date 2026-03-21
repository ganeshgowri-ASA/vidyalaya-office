'use client';
import React, { useState } from 'react';
import { useGraphicsStore, DIAGRAM_THEMES, DiagramTheme } from '@/store/graphics-store';
import { Palette, Check, Sparkles } from 'lucide-react';

export default function ThemePicker() {
  const { activeThemeId, setActiveTheme, applyThemeToShapes, shapes } = useGraphicsStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const activeTheme = DIAGRAM_THEMES.find(t => t.id === activeThemeId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-[#334155] text-[#e2e8f0] transition-colors"
        title="Theme"
      >
        <Palette size={13} />
        <span className="hidden xl:inline">{activeTheme?.name || 'Theme'}</span>
        {/* Theme color dots */}
        <div className="flex gap-0.5">
          {activeTheme?.preview.slice(0, 3).map((c, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </button>

      {showDropdown && (
        <div
          className="absolute top-full right-0 z-50 w-64 rounded-xl border border-[#334155] bg-[#1e293b] shadow-2xl mt-1 py-2 max-h-[420px] overflow-y-auto"
          onMouseLeave={() => setShowDropdown(false)}
        >
          <p className="text-[10px] font-semibold uppercase text-[#94a3b8] px-3 mb-1">Professional Themes</p>
          <div className="space-y-0.5">
            {DIAGRAM_THEMES.map(theme => (
              <ThemeRow
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeThemeId}
                hasShapes={shapes.length > 0}
                onSelect={() => {
                  setActiveTheme(theme.id);
                  setShowDropdown(false);
                }}
                onApply={() => {
                  applyThemeToShapes(theme.id);
                  setShowDropdown(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeRow({ theme, isActive, hasShapes, onSelect, onApply }: {
  theme: DiagramTheme;
  isActive: boolean;
  hasShapes: boolean;
  onSelect: () => void;
  onApply: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-[#334155] text-[#e2e8f0]'
      }`}
      onClick={onSelect}
    >
      {/* Color preview */}
      <div className="flex gap-0.5 flex-shrink-0">
        {theme.preview.map((c, i) => (
          <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs truncate">{theme.name}</span>
          {isActive && <Check size={12} className="text-blue-400 flex-shrink-0" />}
        </div>
      </div>
      {/* Apply to shapes button */}
      {hasShapes && (
        <button
          onClick={e => { e.stopPropagation(); onApply(); }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 flex-shrink-0"
          title="Apply theme colors to all shapes"
        >
          <Sparkles size={9} /> Apply
        </button>
      )}
    </div>
  );
}
