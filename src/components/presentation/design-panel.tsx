'use client';

import React, { useState } from 'react';
import { X, Sparkles, Wand2, Palette, Image, Grid, ChevronDown, Droplets } from 'lucide-react';
import {
  usePresentationStore,
  DESIGN_SUGGESTIONS,
  PRESENTATION_THEMES,
  GRADIENT_PRESETS,
  SOLID_COLORS,
  type SlideLayout,
} from '@/store/presentation-store';

const LAYOUT_OPTIONS: { layout: SlideLayout; label: string; icon: string }[] = [
  { layout: 'title', label: 'Title', icon: '▣' },
  { layout: 'content', label: 'Content', icon: '▤' },
  { layout: 'two-column', label: 'Two Column', icon: '▥' },
  { layout: 'section-header', label: 'Section', icon: '▧' },
  { layout: 'comparison', label: 'Compare', icon: '⊞' },
  { layout: 'blank', label: 'Blank', icon: '☐' },
];

/* ─── Extended Gradient Backgrounds (Canva-like) ─── */
const EXTENDED_GRADIENTS = [
  ...GRADIENT_PRESETS,
  'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
  'linear-gradient(135deg, #c31432 0%, #240b36 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
  'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
  'linear-gradient(to right, #00b4db, #0083b0)',
  'linear-gradient(to right, #f857a6, #ff5858)',
  'radial-gradient(circle at center, #667eea 0%, #764ba2 100%)',
  'radial-gradient(circle at center, #f093fb 0%, #f5576c 100%)',
  'radial-gradient(circle at top left, #a18cd1 0%, #fbc2eb 100%)',
  'radial-gradient(circle at bottom right, #43e97b 0%, #38f9d7 100%)',
  'conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)',
  'conic-gradient(from 90deg, #667eea, #764ba2, #f093fb, #667eea)',
];

/* ─── Pattern Fills (CSS-based) ─── */
const PATTERN_FILLS = [
  { name: 'Dots', css: 'radial-gradient(circle, #ffffff33 1px, transparent 1px)', size: '20px 20px', bg: '#1a1a2e' },
  { name: 'Grid', css: 'linear-gradient(#ffffff15 1px, transparent 1px), linear-gradient(90deg, #ffffff15 1px, transparent 1px)', size: '30px 30px', bg: '#0f0c29' },
  { name: 'Diagonal', css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff10 10px, #ffffff10 11px)', size: 'auto', bg: '#1e3a5f' },
  { name: 'Zigzag', css: 'linear-gradient(135deg, #ffffff15 25%, transparent 25%) -10px 0, linear-gradient(225deg, #ffffff15 25%, transparent 25%) -10px 0, linear-gradient(315deg, #ffffff15 25%, transparent 25%), linear-gradient(45deg, #ffffff15 25%, transparent 25%)', size: '20px 20px', bg: '#16213e' },
  { name: 'Stripes', css: 'repeating-linear-gradient(0deg, transparent, transparent 14px, #ffffff12 14px, #ffffff12 15px)', size: 'auto', bg: '#2d1b2e' },
  { name: 'Chevron', css: 'linear-gradient(135deg, #ffffff10 25%, transparent 25%) 0 0, linear-gradient(225deg, #ffffff10 25%, transparent 25%) 0 0, linear-gradient(315deg, #ffffff10 25%, transparent 25%), linear-gradient(45deg, #ffffff10 25%, transparent 25%)', size: '24px 24px', bg: '#14532d' },
  { name: 'Circles', css: 'radial-gradient(circle at 50% 50%, transparent 45%, #ffffff08 45%, #ffffff08 55%, transparent 55%)', size: '30px 30px', bg: '#0d1b2e' },
  { name: 'Triangles', css: 'linear-gradient(60deg, transparent 62.5%, #ffffff08 62.5%, #ffffff08 68.75%, transparent 68.75%), linear-gradient(120deg, transparent 62.5%, #ffffff08 62.5%, #ffffff08 68.75%, transparent 68.75%)', size: '30px 52px', bg: '#1a0a2e' },
  { name: 'Honeycomb', css: 'radial-gradient(circle farthest-side at 0% 50%, transparent 23.5%, #ffffff10 24%, #ffffff10 31%, transparent 31.2%), radial-gradient(circle farthest-side at 100% 50%, transparent 23.5%, #ffffff10 24%, #ffffff10 31%, transparent 31.2%)', size: '40px 24px', bg: '#0c4a6e' },
  { name: 'Crosshatch', css: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #ffffff08 5px, #ffffff08 6px), repeating-linear-gradient(-45deg, transparent, transparent 5px, #ffffff08 5px, #ffffff08 6px)', size: 'auto', bg: '#18181b' },
  { name: 'Waves', css: 'repeating-radial-gradient(circle at 0 0, transparent 0, #ffffff05 8px), repeating-linear-gradient(#ffffff08, #ffffff03)', size: 'auto', bg: '#3c1518' },
  { name: 'Confetti', css: 'radial-gradient(circle, #ff6b6b22 2px, transparent 2px) 0 0, radial-gradient(circle, #feca5722 2px, transparent 2px) 15px 15px, radial-gradient(circle, #48dbfb22 2px, transparent 2px) 30px 5px', size: '45px 30px', bg: '#0f0f23' },
];

/* ─── Stock Photo Placeholder Categories ─── */
const STOCK_PHOTO_CATEGORIES = [
  { name: 'Business', color: '#3b82f6', count: 1200 },
  { name: 'Nature', color: '#22c55e', count: 3400 },
  { name: 'Technology', color: '#8b5cf6', count: 890 },
  { name: 'People', color: '#f59e0b', count: 2100 },
  { name: 'Abstract', color: '#ec4899', count: 1500 },
  { name: 'Architecture', color: '#06b6d4', count: 750 },
  { name: 'Food', color: '#ef4444', count: 980 },
  { name: 'Travel', color: '#14b8a6', count: 1800 },
];

export default function DesignPanel() {
  const {
    slides,
    activeSlideIndex,
    showDesignPanel,
    setShowDesignPanel,
    applyTheme,
    setCurrentTheme,
    updateSlideBackground,
    setShowTemplateModal,
    addSlide,
    deleteSlide,
    pushUndo,
  } = usePresentationStore();

  const [expandedSections, setExpandedSections] = useState({
    suggestions: true,
    themes: true,
    gradients: false,
    patterns: false,
    stockPhotos: false,
    layouts: true,
  });

  const [activeTab, setActiveTab] = useState<'design' | 'backgrounds' | 'elements'>('design');

  if (!showDesignPanel) return null;

  const currentSlide = slides[activeSlideIndex];

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplySuggestion = (suggestion: (typeof DESIGN_SUGGESTIONS)[number]) => {
    pushUndo();
    applyTheme(suggestion.theme);
    setCurrentTheme(suggestion.theme.name);
  };

  const handleApplyTheme = (theme: (typeof PRESENTATION_THEMES)[number]) => {
    pushUndo();
    applyTheme(theme);
    setCurrentTheme(theme.name);
  };

  const handleApplyLayout = (layout: SlideLayout) => {
    if (!currentSlide) return;
    pushUndo();
    const bg = currentSlide.background;
    deleteSlide(activeSlideIndex);
    addSlide(layout, activeSlideIndex > 0 ? activeSlideIndex - 1 : undefined);
    updateSlideBackground(activeSlideIndex, bg);
  };

  const handleApplyPattern = (pattern: typeof PATTERN_FILLS[number]) => {
    if (!currentSlide) return;
    pushUndo();
    // Encode pattern as a CSS background value
    const bgValue = `${pattern.css}, ${pattern.bg}`;
    updateSlideBackground(activeSlideIndex, bgValue);
  };

  const SectionToggle = ({ title, icon, sectionKey }: { title: string; icon: React.ReactNode; sectionKey: keyof typeof expandedSections }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center gap-1.5 w-full text-xs font-semibold py-1.5 opacity-80 hover:opacity-100 transition-opacity"
    >
      {icon}
      {title}
      <ChevronDown
        size={12}
        className="ml-auto transition-transform"
        style={{ transform: expandedSections[sectionKey] ? 'rotate(180deg)' : 'rotate(0deg)' }}
      />
    </button>
  );

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 300,
        minWidth: 300,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Design</span>
        </div>
        <button
          onClick={() => setShowDesignPanel(false)}
          className="p-1 rounded hover:opacity-80"
          style={{ color: 'var(--sidebar-foreground)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['design', 'backgrounds', 'elements'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 text-[11px] font-medium transition-all"
            style={{
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--foreground)',
              opacity: activeTab === tab ? 1 : 0.6,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'design' && (
          <>
            {/* Design Suggestions */}
            <section>
              <SectionToggle title="Design Suggestions" icon={<Wand2 size={12} />} sectionKey="suggestions" />
              {expandedSections.suggestions && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {DESIGN_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="group flex flex-col items-center gap-1.5 rounded-md border p-2 transition-all hover:scale-[1.03]"
                      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                    >
                      <div className="w-full rounded" style={{ height: 48, background: suggestion.preview }} />
                      <span className="text-[10px] font-medium truncate w-full text-center" style={{ color: 'var(--card-foreground)' }}>
                        {suggestion.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Quick Themes */}
            <section>
              <SectionToggle title="Quick Themes" icon={<Palette size={12} />} sectionKey="themes" />
              {expandedSections.themes && (
                <>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {PRESENTATION_THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => handleApplyTheme(theme)}
                        title={theme.name}
                        className="rounded-full border transition-all hover:scale-110 hover:ring-2"
                        style={{ width: 28, height: 28, background: theme.background, borderColor: 'var(--border)' }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SOLID_COLORS.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => { if (!currentSlide) return; pushUndo(); updateSlideBackground(activeSlideIndex, color); }}
                        title={color}
                        className="rounded border transition-all hover:scale-110 hover:ring-2"
                        style={{ width: 28, height: 28, background: color, borderColor: 'var(--border)' }}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* One-Click Layouts */}
            <section>
              <SectionToggle title="One-Click Layouts" icon={<Wand2 size={12} />} sectionKey="layouts" />
              {expandedSections.layouts && (
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.layout}
                      onClick={() => handleApplyLayout(opt.layout)}
                      className="flex flex-col items-center gap-1 rounded border px-2 py-2 transition-all hover:opacity-90"
                      style={{
                        borderColor: currentSlide?.layout === opt.layout ? 'var(--primary)' : 'var(--border)',
                        background: currentSlide?.layout === opt.layout ? 'var(--accent)' : 'var(--card)',
                        color: 'var(--card-foreground)',
                      }}
                    >
                      <span className="text-base leading-none">{opt.icon}</span>
                      <span className="text-[10px] truncate w-full text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Template Gallery */}
            <section>
              <button
                onClick={() => { setShowTemplateModal(true); setShowDesignPanel(false); }}
                className="w-full flex items-center justify-center gap-2 rounded border px-3 py-2 text-xs font-medium transition-all hover:opacity-90"
                style={{ borderColor: 'var(--primary)', background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Sparkles size={14} />
                Open Template Gallery
              </button>
            </section>
          </>
        )}

        {activeTab === 'backgrounds' && (
          <>
            {/* Gradient Backgrounds */}
            <section>
              <SectionToggle title="Gradient Backgrounds" icon={<Droplets size={12} />} sectionKey="gradients" />
              {expandedSections.gradients && (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {EXTENDED_GRADIENTS.map((gradient, i) => (
                    <button
                      key={i}
                      onClick={() => { if (!currentSlide) return; pushUndo(); updateSlideBackground(activeSlideIndex, gradient); }}
                      className="rounded-md border transition-all hover:scale-105 hover:ring-2"
                      style={{ height: 44, background: gradient, borderColor: 'var(--border)' }}
                      title={`Gradient ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Pattern Fills */}
            <section>
              <SectionToggle title="Pattern Fills" icon={<Grid size={12} />} sectionKey="patterns" />
              {expandedSections.patterns && (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {PATTERN_FILLS.map((pattern, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyPattern(pattern)}
                      className="rounded-md border transition-all hover:scale-105 hover:ring-2 flex flex-col items-center overflow-hidden"
                      style={{ borderColor: 'var(--border)' }}
                      title={pattern.name}
                    >
                      <div
                        className="w-full"
                        style={{
                          height: 36,
                          backgroundColor: pattern.bg,
                          backgroundImage: pattern.css,
                          backgroundSize: pattern.size,
                        }}
                      />
                      <span className="text-[9px] opacity-60 py-0.5">{pattern.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Solid Colors */}
            <section>
              <div className="text-xs font-semibold opacity-80 mb-1.5">Solid Colors</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529', '#000000',
                  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
                  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#b91c1c', '#c2410c', '#a16207', '#4d7c0f', '#15803d',
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => { if (!currentSlide) return; pushUndo(); updateSlideBackground(activeSlideIndex, color); }}
                    className="rounded border transition-all hover:scale-110 hover:ring-2"
                    style={{ width: 24, height: 24, background: color, borderColor: 'var(--border)' }}
                    title={color}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'elements' && (
          <>
            {/* Stock Photo Integration Placeholder */}
            <section>
              <SectionToggle title="Stock Photos" icon={<Image size={12} />} sectionKey="stockPhotos" />
              {expandedSections.stockPhotos && (
                <div className="mt-1">
                  <div
                    className="rounded border px-3 py-2 mb-2"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                  >
                    <input
                      type="text"
                      placeholder="Search stock photos..."
                      className="w-full text-xs bg-transparent outline-none"
                      style={{ color: 'var(--card-foreground)' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {STOCK_PHOTO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        className="rounded-md border overflow-hidden transition-all hover:scale-[1.03]"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div
                          className="w-full flex items-center justify-center"
                          style={{ height: 48, background: `${cat.color}22` }}
                        >
                          <Image size={16} style={{ color: cat.color }} />
                        </div>
                        <div className="px-2 py-1" style={{ background: 'var(--card)' }}>
                          <div className="text-[10px] font-medium" style={{ color: 'var(--card-foreground)' }}>{cat.name}</div>
                          <div className="text-[9px] opacity-50">{cat.count.toLocaleString()} photos</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] opacity-40 text-center mt-2">
                    Connect your Unsplash or Pexels API key in Settings to enable stock photo search.
                  </p>
                </div>
              )}
            </section>

            {/* Quick Element Insertion Info */}
            <section>
              <div className="text-xs font-semibold opacity-80 mb-2">Quick Elements</div>
              <div className="space-y-1">
                {[
                  { label: 'Text Effects', desc: 'WordArt, shadows, glow, 3D rotation', panel: 'Text Effects panel' },
                  { label: 'Image Filters', desc: 'Grayscale, sepia, contrast, blur presets', panel: 'Image Editor panel' },
                  { label: 'Shapes Library', desc: '80+ shapes: basic, flowchart, arrows, stars', panel: 'Shape Drawing Tools' },
                  { label: 'Icons Library', desc: '150+ icons across 10 categories', panel: 'Insert > Icons' },
                  { label: 'SmartArt & Diagrams', desc: '25+ diagram types with editable nodes', panel: 'Insert > SmartArt' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded border px-2.5 py-2 transition-all"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                  >
                    <div className="text-[11px] font-medium" style={{ color: 'var(--card-foreground)' }}>{item.label}</div>
                    <div className="text-[9px] opacity-50">{item.desc}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: 'var(--primary)' }}>Open from: {item.panel}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
