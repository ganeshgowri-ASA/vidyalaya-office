'use client';

import React from 'react';
import { X, Sparkles, Wand2, Palette } from 'lucide-react';
import {
  usePresentationStore,
  DESIGN_SUGGESTIONS,
  PRESENTATION_THEMES,
  GRADIENT_PRESETS,
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

  if (!showDesignPanel) return null;

  const currentSlide = slides[activeSlideIndex];

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

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 280,
        minWidth: 280,
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

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Design Suggestions */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Wand2 size={12} className="opacity-70" />
            <span className="text-xs font-medium opacity-80">Design Suggestions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DESIGN_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleApplySuggestion(suggestion)}
                className="group flex flex-col items-center gap-1.5 rounded-md border p-2 transition-all hover:scale-[1.03]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card)',
                }}
              >
                <div
                  className="w-full rounded"
                  style={{
                    height: 48,
                    background: suggestion.preview,
                  }}
                />
                <span
                  className="text-[10px] font-medium truncate w-full text-center"
                  style={{ color: 'var(--card-foreground)' }}
                >
                  {suggestion.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Themes */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Palette size={12} className="opacity-70" />
            <span className="text-xs font-medium opacity-80">Quick Themes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESENTATION_THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleApplyTheme(theme)}
                title={theme.name}
                className="rounded-full border transition-all hover:scale-110 hover:ring-2"
                style={{
                  width: 28,
                  height: 28,
                  background: theme.background,
                  borderColor: 'var(--border)',
                  outlineColor: 'var(--primary)',
                }}
              />
            ))}
          </div>
          {/* Gradient presets row */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {GRADIENT_PRESETS.map((gradient, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!currentSlide) return;
                  pushUndo();
                  updateSlideBackground(activeSlideIndex, gradient);
                }}
                title={`Gradient ${i + 1}`}
                className="rounded border transition-all hover:scale-110 hover:ring-2"
                style={{
                  width: 28,
                  height: 28,
                  background: gradient,
                  borderColor: 'var(--border)',
                  outlineColor: 'var(--primary)',
                }}
              />
            ))}
          </div>
        </section>

        {/* One-Click Layouts */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Wand2 size={12} className="opacity-70" />
            <span className="text-xs font-medium opacity-80">One-Click Layouts</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.layout}
                onClick={() => handleApplyLayout(opt.layout)}
                className="flex flex-col items-center gap-1 rounded border px-2 py-2 transition-all hover:opacity-90"
                style={{
                  borderColor:
                    currentSlide?.layout === opt.layout ? 'var(--primary)' : 'var(--border)',
                  background:
                    currentSlide?.layout === opt.layout ? 'var(--accent)' : 'var(--card)',
                  color: 'var(--card-foreground)',
                }}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                <span className="text-[10px] truncate w-full text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Template Gallery */}
        <section>
          <button
            onClick={() => {
              setShowTemplateModal(true);
              setShowDesignPanel(false);
            }}
            className="w-full flex items-center justify-center gap-2 rounded border px-3 py-2 text-xs font-medium transition-all hover:opacity-90"
            style={{
              borderColor: 'var(--primary)',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            <Sparkles size={14} />
            Open Template Gallery
          </button>
        </section>
      </div>
    </div>
  );
}
