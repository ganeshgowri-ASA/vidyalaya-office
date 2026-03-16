'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Palette,
  Type,
  Image,
  Sparkles,
  Save,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  RotateCcw,
  Plus,
  Eye,
  Paintbrush,
  Layers,
  Circle,
  Square,
  Sun,
  Moon,
  Leaf,
  Zap,
  Star,
  Briefcase,
} from 'lucide-react';
import {
  usePresentationStore,
  PRESENTATION_THEMES,
  type PresentationTheme,
} from '@/store/presentation-store';

// ── Font Pairs ────────────────────────────────────────────────────────────────

const FONT_PAIRS: { heading: string; body: string; label: string }[] = [
  { heading: 'Arial', body: 'Arial', label: 'Arial / Arial' },
  { heading: 'Georgia', body: 'Verdana', label: 'Georgia / Verdana' },
  { heading: 'Trebuchet MS', body: 'Arial', label: 'Trebuchet / Arial' },
  { heading: 'Helvetica', body: 'Georgia', label: 'Helvetica / Georgia' },
  { heading: 'Courier New', body: 'Arial', label: 'Courier / Arial' },
  { heading: 'Impact', body: 'Verdana', label: 'Impact / Verdana' },
  { heading: 'Palatino Linotype', body: 'Book Antiqua', label: 'Palatino / Book Antiqua' },
  { heading: 'Tahoma', body: 'Geneva', label: 'Tahoma / Geneva' },
  { heading: 'Lucida Sans', body: 'Lucida Grande', label: 'Lucida Sans / Grande' },
  { heading: 'Times New Roman', body: 'Georgia', label: 'Times / Georgia' },
  { heading: 'Garamond', body: 'Helvetica', label: 'Garamond / Helvetica' },
  { heading: 'Century Gothic', body: 'Arial', label: 'Century Gothic / Arial' },
];

// ── Background Styles ─────────────────────────────────────────────────────────

const BACKGROUND_STYLES: { type: 'solid' | 'gradient' | 'pattern'; label: string; value: string; preview: string }[] = [
  { type: 'solid', label: 'White', value: '#ffffff', preview: '#ffffff' },
  { type: 'solid', label: 'Off White', value: '#f8f9fa', preview: '#f8f9fa' },
  { type: 'solid', label: 'Dark Blue', value: '#1a1a2e', preview: '#1a1a2e' },
  { type: 'solid', label: 'Deep Navy', value: '#16213e', preview: '#16213e' },
  { type: 'solid', label: 'Charcoal', value: '#2d2d2d', preview: '#2d2d2d' },
  { type: 'solid', label: 'Slate', value: '#334155', preview: '#334155' },
  { type: 'gradient', label: 'Blue Sky', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { type: 'gradient', label: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', preview: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { type: 'gradient', label: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', preview: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { type: 'gradient', label: 'Forest', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', preview: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { type: 'gradient', label: 'Rose', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', preview: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { type: 'gradient', label: 'Lavender', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', preview: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { type: 'pattern', label: 'Dots', value: 'radial-gradient(circle, #00000010 1px, transparent 1px)', preview: '#f0f0f0' },
  { type: 'pattern', label: 'Grid', value: 'linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)', preview: '#f5f5f5' },
  { type: 'pattern', label: 'Diagonal', value: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #00000008 10px, #00000008 11px)', preview: '#f0f0f0' },
];

// ── Effect Presets ────────────────────────────────────────────────────────────

const EFFECT_PRESETS: { name: string; shadow?: string; borderRadius?: string; opacity?: number }[] = [
  { name: 'None', shadow: 'none', borderRadius: '0px' },
  { name: 'Soft Shadow', shadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: '4px' },
  { name: 'Elevated', shadow: '0 4px 16px rgba(0,0,0,0.16)', borderRadius: '8px' },
  { name: 'Bold Shadow', shadow: '0 8px 24px rgba(0,0,0,0.24)', borderRadius: '4px' },
  { name: 'Rounded', shadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '16px' },
  { name: 'Pill', shadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: '24px' },
  { name: 'Sharp', shadow: '4px 4px 0 rgba(0,0,0,0.2)', borderRadius: '0px' },
  { name: 'Glow', shadow: '0 0 20px rgba(59,130,246,0.3)', borderRadius: '8px' },
  { name: 'Inset', shadow: 'inset 0 2px 6px rgba(0,0,0,0.1)', borderRadius: '8px' },
  { name: 'Frosted', shadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px', opacity: 0.95 },
];

// ── Theme Categories ──────────────────────────────────────────────────────────

const THEME_CATEGORIES = [
  { id: 'all', label: 'All Themes', icon: Palette },
  { id: 'Professional', label: 'Professional', icon: Briefcase },
  { id: 'Creative', label: 'Creative', icon: Sparkles },
  { id: 'Dark', label: 'Dark', icon: Moon },
  { id: 'Minimal', label: 'Minimal', icon: Square },
  { id: 'Nature', label: 'Nature', icon: Leaf },
  { id: 'Vibrant', label: 'Vibrant', icon: Zap },
  { id: 'Elegant', label: 'Elegant', icon: Star },
  { id: 'Warm', label: 'Warm', icon: Sun },
];

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  icon: Icon,
  expanded,
  onToggle,
}: {
  label: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-80 transition-opacity"
      style={{ color: 'var(--foreground)' }}
    >
      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
}

// ── Color Input ───────────────────────────────────────────────────────────────

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className="w-6 h-6 rounded border cursor-pointer"
          style={{ backgroundColor: value, borderColor: 'var(--border)' }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] truncate block" style={{ color: 'var(--foreground)' }}>
          {label}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value);
        }}
        className="w-[68px] text-[10px] px-1.5 py-0.5 rounded border font-mono"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--card)',
          color: 'var(--foreground)',
        }}
      />
    </div>
  );
}

// ── Mini Slide Preview ────────────────────────────────────────────────────────

function MiniSlidePreview({
  theme,
  width = 240,
  height = 135,
}: {
  theme: PresentationTheme;
  width?: number;
  height?: number;
}) {
  const headingFont = theme.headingFont || theme.fontFamily || 'Arial';
  const bodyFont = theme.fontFamily || 'Arial';
  const shadow = theme.effectPreset?.shadow || 'none';
  const radius = theme.effectPreset?.borderRadius || '0px';

  return (
    <div
      className="relative overflow-hidden border"
      style={{
        width,
        height,
        background: theme.background,
        borderColor: 'var(--border)',
        borderRadius: 6,
      }}
    >
      {/* Title */}
      <div
        className="absolute font-bold truncate"
        style={{
          top: height * 0.18,
          left: width * 0.08,
          right: width * 0.08,
          fontSize: Math.max(10, width * 0.058),
          fontFamily: headingFont,
          color: theme.titleColor,
          textShadow: shadow !== 'none' ? '0 1px 2px rgba(0,0,0,0.2)' : undefined,
        }}
      >
        Presentation Title
      </div>

      {/* Subtitle */}
      <div
        className="absolute truncate"
        style={{
          top: height * 0.38,
          left: width * 0.08,
          right: width * 0.08,
          fontSize: Math.max(7, width * 0.035),
          fontFamily: bodyFont,
          color: theme.textColor,
        }}
      >
        Subtitle goes here
      </div>

      {/* Accent bar */}
      <div
        className="absolute"
        style={{
          top: height * 0.54,
          left: width * 0.08,
          width: width * 0.25,
          height: 2,
          backgroundColor: theme.accentColor || theme.titleColor,
          borderRadius: radius,
        }}
      />

      {/* Content block */}
      <div
        className="absolute"
        style={{
          top: height * 0.62,
          left: width * 0.08,
          right: width * 0.08,
          bottom: height * 0.12,
          borderRadius: radius,
          boxShadow: shadow !== 'none' ? shadow : undefined,
          background: theme.colorScheme?.surface
            ? theme.colorScheme.surface + '30'
            : 'rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="px-2 pt-1.5"
          style={{
            fontSize: Math.max(5, width * 0.025),
            fontFamily: bodyFont,
            color: theme.textColor,
            lineHeight: 1.6,
          }}
        >
          <div
            className="rounded-sm mb-0.5"
            style={{
              height: 3,
              width: '80%',
              backgroundColor: theme.textColor + '40',
            }}
          />
          <div
            className="rounded-sm mb-0.5"
            style={{
              height: 3,
              width: '65%',
              backgroundColor: theme.textColor + '30',
            }}
          />
          <div
            className="rounded-sm"
            style={{
              height: 3,
              width: '45%',
              backgroundColor: theme.textColor + '20',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Theme Card ────────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  onApply,
}: {
  theme: PresentationTheme;
  isActive: boolean;
  onApply: () => void;
}) {
  return (
    <button
      onClick={onApply}
      className="group relative w-full rounded-lg border overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-md"
      style={{
        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
        borderWidth: isActive ? 2 : 1,
        background: 'var(--card)',
      }}
    >
      {/* Preview */}
      <div
        className="w-full aspect-[16/9] relative"
        style={{ background: theme.background }}
      >
        {/* Mini content */}
        <div className="absolute inset-0 p-2 flex flex-col justify-center">
          <div
            className="font-bold truncate"
            style={{
              fontSize: 9,
              fontFamily: theme.headingFont || theme.fontFamily || 'Arial',
              color: theme.titleColor,
            }}
          >
            {theme.name}
          </div>
          <div
            className="truncate mt-0.5"
            style={{
              fontSize: 6,
              fontFamily: theme.fontFamily || 'Arial',
              color: theme.textColor,
            }}
          >
            Theme preview text
          </div>
          <div
            className="mt-1"
            style={{
              height: 2,
              width: '40%',
              backgroundColor: theme.accentColor || theme.titleColor,
              borderRadius: 1,
            }}
          />
        </div>

        {/* Active check */}
        {isActive && (
          <div
            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Check size={10} color="#fff" strokeWidth={3} />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <span className="text-white text-[10px] font-medium px-2 py-0.5 rounded bg-black/40">
            Apply
          </span>
        </div>
      </div>

      {/* Name */}
      <div
        className="px-2 py-1.5 text-[11px] font-medium truncate"
        style={{ color: 'var(--foreground)' }}
      >
        {theme.name}
        {theme.category && (
          <span className="ml-1 text-[9px] opacity-50">{theme.category}</span>
        )}
      </div>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ThemeDesigner() {
  const {
    showThemeDesigner,
    setShowThemeDesigner,
    currentTheme,
    setCurrentTheme,
    applyTheme,
    addCustomTheme,
    customThemes,
    pushUndo,
  } = usePresentationStore();

  // ---- Section toggles ----
  const [showColorScheme, setShowColorScheme] = useState(true);
  const [showFontPairs, setShowFontPairs] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showThemeGallery, setShowThemeGallery] = useState(true);
  const [showCustomSection, setShowCustomSection] = useState(false);

  // ---- Filter / Search ----
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ---- Custom theme editor state ----
  const [customName, setCustomName] = useState('My Theme');
  const [customPrimary, setCustomPrimary] = useState('#2563eb');
  const [customSecondary, setCustomSecondary] = useState('#1e3a5f');
  const [customAccent, setCustomAccent] = useState('#3b82f6');
  const [customBackground, setCustomBackground] = useState('#1e293b');
  const [customText, setCustomText] = useState('#ffffff');
  const [customTitleColor, setCustomTitleColor] = useState('#ffffff');
  const [customTextColor, setCustomTextColor] = useState('#e0e7ff');
  const [customFontPairIdx, setCustomFontPairIdx] = useState(0);
  const [customBgIdx, setCustomBgIdx] = useState(0);
  const [customEffectIdx, setCustomEffectIdx] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

  // ---- Filtered themes ----
  const allThemes = useMemo(() => [...PRESENTATION_THEMES, ...customThemes], [customThemes]);

  const filteredThemes = useMemo(() => {
    let themes = allThemes;
    if (activeCategory !== 'all') {
      themes = themes.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      themes = themes.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }
    return themes;
  }, [allThemes, activeCategory, searchQuery]);

  // ---- Build custom theme preview ----
  const customThemePreview = useMemo((): PresentationTheme => {
    const fontPair = FONT_PAIRS[customFontPairIdx] || FONT_PAIRS[0];
    const bgStyle = BACKGROUND_STYLES[customBgIdx] || BACKGROUND_STYLES[0];
    const effect = EFFECT_PRESETS[customEffectIdx] || EFFECT_PRESETS[0];
    return {
      name: customName || 'Untitled Theme',
      background:
        bgStyle.type === 'solid'
          ? `linear-gradient(135deg, ${bgStyle.value} 0%, ${bgStyle.value} 100%)`
          : bgStyle.value,
      titleColor: customTitleColor,
      textColor: customTextColor,
      accentColor: customAccent,
      fontFamily: fontPair.body,
      headingFont: fontPair.heading,
      category: 'Custom',
      colorScheme: {
        primary: customPrimary,
        secondary: customSecondary,
        accent: customAccent,
        background: customBackground,
        surface: customSecondary,
        text: customText,
        textSecondary: customTextColor,
      },
      fontPair: { heading: fontPair.heading, body: fontPair.body },
      backgroundStyle: { type: bgStyle.type, value: bgStyle.value },
      effectPreset: {
        name: effect.name,
        shadow: effect.shadow,
        borderRadius: effect.borderRadius,
        opacity: effect.opacity,
      },
    };
  }, [
    customName,
    customPrimary,
    customSecondary,
    customAccent,
    customBackground,
    customText,
    customTitleColor,
    customTextColor,
    customFontPairIdx,
    customBgIdx,
    customEffectIdx,
  ]);

  // ---- Handlers ----
  const handleApplyTheme = useCallback(
    (theme: PresentationTheme) => {
      pushUndo();
      applyTheme(theme);
      setCurrentTheme(theme.name);
    },
    [pushUndo, applyTheme, setCurrentTheme]
  );

  const handleSaveCustomTheme = useCallback(() => {
    addCustomTheme(customThemePreview);
  }, [addCustomTheme, customThemePreview]);

  const handleApplyCustomPreview = useCallback(() => {
    pushUndo();
    applyTheme(customThemePreview);
    setCurrentTheme(customThemePreview.name);
  }, [pushUndo, applyTheme, setCurrentTheme, customThemePreview]);

  const handleResetCustom = useCallback(() => {
    setCustomName('My Theme');
    setCustomPrimary('#2563eb');
    setCustomSecondary('#1e3a5f');
    setCustomAccent('#3b82f6');
    setCustomBackground('#1e293b');
    setCustomText('#ffffff');
    setCustomTitleColor('#ffffff');
    setCustomTextColor('#e0e7ff');
    setCustomFontPairIdx(0);
    setCustomBgIdx(0);
    setCustomEffectIdx(0);
  }, []);

  if (!showThemeDesigner) return null;

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 320,
        minWidth: 320,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Paintbrush size={15} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Theme Designer</span>
        </div>
        <button
          onClick={() => setShowThemeDesigner(false)}
          className="p-1 rounded hover:opacity-70 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Scrollable Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ── Live Preview ──────────────────────────────────────────────── */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-[11px] font-medium mb-2 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            <Eye size={12} />
            {showPreview ? 'Hide' : 'Show'} Live Preview
          </button>
          {showPreview && (
            <div className="flex justify-center">
              <MiniSlidePreview theme={customThemePreview} width={280} height={158} />
            </div>
          )}
        </div>

        {/* ── Color Scheme Section ──────────────────────────────────────── */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionHeader
            label="Color Scheme"
            icon={Palette}
            expanded={showColorScheme}
            onToggle={() => setShowColorScheme(!showColorScheme)}
          />
          {showColorScheme && (
            <div className="px-3 pb-3 space-y-2">
              <ColorInput label="Primary" value={customPrimary} onChange={setCustomPrimary} />
              <ColorInput label="Secondary" value={customSecondary} onChange={setCustomSecondary} />
              <ColorInput label="Accent" value={customAccent} onChange={setCustomAccent} />
              <ColorInput label="Background" value={customBackground} onChange={setCustomBackground} />
              <ColorInput label="Text" value={customText} onChange={setCustomText} />
              <ColorInput label="Title Color" value={customTitleColor} onChange={setCustomTitleColor} />
              <ColorInput label="Body Text" value={customTextColor} onChange={setCustomTextColor} />
            </div>
          )}
        </div>

        {/* ── Font Pairs Section ────────────────────────────────────────── */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionHeader
            label="Font Pairs"
            icon={Type}
            expanded={showFontPairs}
            onToggle={() => setShowFontPairs(!showFontPairs)}
          />
          {showFontPairs && (
            <div className="px-3 pb-3 space-y-1">
              {FONT_PAIRS.map((pair, idx) => (
                <button
                  key={pair.label}
                  onClick={() => setCustomFontPairIdx(idx)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all hover:opacity-80"
                  style={{
                    background:
                      customFontPairIdx === idx
                        ? 'var(--primary)'
                        : 'transparent',
                    color:
                      customFontPairIdx === idx
                        ? '#ffffff'
                        : 'var(--foreground)',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[11px] font-bold truncate"
                      style={{ fontFamily: pair.heading }}
                    >
                      {pair.heading}
                    </div>
                    <div
                      className="text-[9px] truncate opacity-70"
                      style={{ fontFamily: pair.body }}
                    >
                      Body: {pair.body}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="text-[13px] font-bold"
                      style={{ fontFamily: pair.heading }}
                    >
                      Aa
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Background Style Section ─────────────────────────────────── */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionHeader
            label="Background Style"
            icon={Image}
            expanded={showBackgrounds}
            onToggle={() => setShowBackgrounds(!showBackgrounds)}
          />
          {showBackgrounds && (
            <div className="px-3 pb-3">
              {/* Type filter tabs */}
              <div className="flex gap-1 mb-2">
                {(['solid', 'gradient', 'pattern'] as const).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {BACKGROUND_STYLES.map((bg, idx) => (
                  <button
                    key={bg.label}
                    onClick={() => setCustomBgIdx(idx)}
                    className="relative aspect-[4/3] rounded border overflow-hidden transition-all hover:scale-105"
                    style={{
                      background: bg.preview,
                      borderColor:
                        customBgIdx === idx
                          ? 'var(--primary)'
                          : 'var(--border)',
                      borderWidth: customBgIdx === idx ? 2 : 1,
                    }}
                    title={bg.label}
                  >
                    {bg.type === 'pattern' && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: bg.value,
                          backgroundSize: '12px 12px',
                        }}
                      />
                    )}
                    {customBgIdx === idx && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                    <span
                      className="absolute bottom-0 left-0 right-0 text-center text-[7px] py-0.5"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                      }}
                    >
                      {bg.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Effect Presets Section ────────────────────────────────────── */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionHeader
            label="Effect Presets"
            icon={Layers}
            expanded={showEffects}
            onToggle={() => setShowEffects(!showEffects)}
          />
          {showEffects && (
            <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
              {EFFECT_PRESETS.map((effect, idx) => (
                <button
                  key={effect.name}
                  onClick={() => setCustomEffectIdx(idx)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded border transition-all hover:opacity-80"
                  style={{
                    borderColor:
                      customEffectIdx === idx
                        ? 'var(--primary)'
                        : 'var(--border)',
                    borderWidth: customEffectIdx === idx ? 2 : 1,
                    background: 'var(--card)',
                  }}
                >
                  {/* Effect demo box */}
                  <div
                    className="w-10 h-6"
                    style={{
                      background: 'var(--primary)',
                      boxShadow: effect.shadow || 'none',
                      borderRadius: effect.borderRadius || '0px',
                      opacity: effect.opacity ?? 1,
                    }}
                  />
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {effect.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Custom Theme Actions ─────────────────────────────────────── */}
        <div
          className="border-t px-3 py-2.5 space-y-1.5"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Theme name"
              className="flex-1 text-xs px-2 py-1 rounded border"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleApplyCustomPreview}
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium px-2 py-1.5 rounded transition-all hover:opacity-90"
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
              }}
            >
              <Eye size={11} />
              Apply
            </button>
            <button
              onClick={handleSaveCustomTheme}
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium px-2 py-1.5 rounded border transition-all hover:opacity-90"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                background: 'transparent',
              }}
            >
              <Save size={11} />
              Save
            </button>
            <button
              onClick={handleResetCustom}
              className="flex items-center justify-center px-2 py-1.5 rounded border transition-all hover:opacity-70"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              title="Reset custom theme"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>

        {/* ── Theme Gallery ─────────────────────────────────────────────── */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionHeader
            label="Theme Gallery"
            icon={Sparkles}
            expanded={showThemeGallery}
            onToggle={() => setShowThemeGallery(!showThemeGallery)}
          />
          {showThemeGallery && (
            <div className="px-3 pb-3">
              {/* Search */}
              <div className="relative mb-2">
                <Search
                  size={12}
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50"
                  style={{ color: 'var(--foreground)' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search themes..."
                  className="w-full text-[11px] pl-6 pr-2 py-1.5 rounded border"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                {THEME_CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-all"
                      style={{
                        background: isActive ? 'var(--primary)' : 'var(--card)',
                        color: isActive ? '#ffffff' : 'var(--foreground)',
                        border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                      }}
                    >
                      <CatIcon size={9} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Theme cards grid */}
              <div className="grid grid-cols-2 gap-2">
                {filteredThemes.map((theme) => (
                  <ThemeCard
                    key={theme.name}
                    theme={theme}
                    isActive={currentTheme === theme.name}
                    onApply={() => handleApplyTheme(theme)}
                  />
                ))}
              </div>

              {filteredThemes.length === 0 && (
                <div
                  className="text-center py-6 text-xs opacity-50"
                  style={{ color: 'var(--foreground)' }}
                >
                  No themes found
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Custom Themes Section ─────────────────────────────────────── */}
        {customThemes.length > 0 && (
          <div
            className="border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <SectionHeader
              label={`Custom Themes (${customThemes.length})`}
              icon={Plus}
              expanded={showCustomSection}
              onToggle={() => setShowCustomSection(!showCustomSection)}
            />
            {showCustomSection && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                {customThemes.map((theme) => (
                  <ThemeCard
                    key={theme.name}
                    theme={theme}
                    isActive={currentTheme === theme.name}
                    onApply={() => handleApplyTheme(theme)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
