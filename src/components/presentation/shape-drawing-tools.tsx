'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Square,
  Circle,
  Triangle,
  Diamond,
  Pentagon,
  Hexagon,
  Star,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  MessageSquare,
  MessageCircle,
  Cloud,
  Minus,
  Spline,
  GitCommitHorizontal,
  Paintbrush,
  Palette,
  Layers,
  SunDim,
  Box,
  Eye,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Heart,
  Plus,
  Cross,
} from 'lucide-react';
import {
  usePresentationStore,
  SHAPE_TOOL_DEFINITIONS,
} from '@/store/presentation-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const SHAPE_CATEGORIES = [
  { id: 'basic', label: 'Basic Shapes' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'callouts', label: 'Callouts' },
  { id: 'lines', label: 'Lines' },
] as const;

const SOLID_FILL_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#64748b',
  '#fca5a5', '#fdba74', '#fde047', '#86efac', '#93c5fd', '#c4b5fd',
  '#f9a8d4', '#5eead4', '#a5b4fc', '#cbd5e1', '#1e293b', '#374151',
];

const GRADIENT_FILL_PRESETS = [
  { id: 'grad-blue', label: 'Ocean', value: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
  { id: 'grad-fire', label: 'Fire', value: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' },
  { id: 'grad-sunset', label: 'Sunset', value: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' },
  { id: 'grad-forest', label: 'Forest', value: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)' },
  { id: 'grad-purple', label: 'Purple Haze', value: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
  { id: 'grad-steel', label: 'Steel', value: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' },
  { id: 'grad-gold', label: 'Gold', value: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
  { id: 'grad-rose', label: 'Rose', value: 'linear-gradient(135deg, #fb7185 0%, #e879f9 100%)' },
];

const BORDER_STYLES: { id: string; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
];

const EFFECT_3D_PRESETS = [
  { id: 'none', label: 'None', rotateX: 0, rotateY: 0, perspective: 0 },
  { id: 'subtle', label: 'Subtle', rotateX: 5, rotateY: 5, perspective: 800 },
  { id: 'moderate', label: 'Moderate', rotateX: 15, rotateY: 15, perspective: 600 },
  { id: 'strong', label: 'Strong', rotateX: 25, rotateY: 25, perspective: 400 },
];

const SHADOW_COLORS = [
  '#000000', '#374151', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b',
];

// ── Shape icon helper ─────────────────────────────────────────────────────────

function getShapeIcon(shapeId: string, size = 20) {
  const props = { size, strokeWidth: 1.5 };
  switch (shapeId) {
    case 'rect': return <Square {...props} />;
    case 'rounded-rect': return <Square {...props} className="rounded" />;
    case 'circle': return <Circle {...props} />;
    case 'triangle': return <Triangle {...props} />;
    case 'diamond': return <Diamond {...props} />;
    case 'pentagon': return <Pentagon {...props} />;
    case 'hexagon': return <Hexagon {...props} />;
    case 'star': return <Star {...props} />;
    case 'heart': return <Heart {...props} />;
    case 'cross': return <Cross {...props} />;
    case 'cloud': return <Cloud {...props} />;
    case 'arrow': return <ArrowRight {...props} />;
    case 'arrow-left': return <ArrowLeft {...props} />;
    case 'arrow-up': return <ArrowUp {...props} />;
    case 'arrow-down': return <ArrowDown {...props} />;
    case 'arrow-double': return <ArrowLeftRight {...props} />;
    case 'callout': return <MessageSquare {...props} />;
    case 'callout-round': return <MessageCircle {...props} />;
    case 'line': return <Minus {...props} />;
    case 'curve': return <Spline {...props} />;
    case 'connector': return <GitCommitHorizontal {...props} />;
    default: return <Square {...props} />;
  }
}

// ── Collapsible section ───────────────────────────────────────────────────────

function Section({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-80"
        style={{ color: 'var(--foreground)' }}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {icon}
        <span>{title}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ShapeDrawingTools() {
  const {
    showShapeDrawingTools,
    setShowShapeDrawingTools,
    slides,
    activeSlideIndex,
    selectedElementId,
    addElement,
    updateElement,
    pushUndo,
  } = usePresentationStore();

  // Local formatting state
  const [fillMode, setFillMode] = useState<'solid' | 'gradient' | 'transparent'>('solid');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [fillGradient, setFillGradient] = useState(GRADIENT_FILL_PRESETS[0].value);
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(8);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(4);
  const [effect3D, setEffect3D] = useState('none');
  const [opacity, setOpacity] = useState(100);

  // Collapsed categories
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Selected shape element from current slide
  const slide = slides[activeSlideIndex];
  const selectedElement = useMemo(
    () => slide?.elements.find((el) => el.id === selectedElementId),
    [slide, selectedElementId],
  );
  const isShapeSelected = selectedElement?.type === 'shape';

  // Group shape definitions by category
  const shapesByCategory = useMemo(() => {
    const map = new Map<string, typeof SHAPE_TOOL_DEFINITIONS>();
    for (const shape of SHAPE_TOOL_DEFINITIONS) {
      const list = map.get(shape.category) ?? [];
      list.push(shape);
      map.set(shape.category, list);
    }
    return map;
  }, []);

  // Toggle category collapse
  const toggleCategory = useCallback((catId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  // Insert a shape at the center of the slide
  const handleInsertShape = useCallback(
    (shapeId: string) => {
      pushUndo();

      const bgColor =
        fillMode === 'transparent'
          ? 'transparent'
          : fillMode === 'gradient'
            ? undefined
            : fillColor;

      const gradientValue = fillMode === 'gradient' ? fillGradient : undefined;

      addElement(activeSlideIndex, {
        type: 'shape',
        content: shapeId,
        x: 350,
        y: 220,
        width: 200,
        height: 160,
        style: {
          backgroundColor: bgColor,
          fillGradient: gradientValue,
          borderColor,
          borderWidth,
          borderStyle,
          opacity: opacity / 100,
          shadow: shadowEnabled,
          shadowColor: shadowEnabled ? shadowColor : undefined,
          shadowBlur: shadowEnabled ? shadowBlur : undefined,
          shadowOffsetX: shadowEnabled ? shadowOffsetX : undefined,
          shadowOffsetY: shadowEnabled ? shadowOffsetY : undefined,
          rotateX: EFFECT_3D_PRESETS.find((p) => p.id === effect3D)?.rotateX ?? 0,
          rotateY: EFFECT_3D_PRESETS.find((p) => p.id === effect3D)?.rotateY ?? 0,
          effect3D,
        },
      });
    },
    [
      activeSlideIndex,
      addElement,
      pushUndo,
      fillMode,
      fillColor,
      fillGradient,
      borderColor,
      borderWidth,
      borderStyle,
      shadowEnabled,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      effect3D,
      opacity,
    ],
  );

  // Apply formatting to selected shape
  const applyToSelected = useCallback(
    (updates: Record<string, unknown>) => {
      if (!isShapeSelected || !selectedElement) return;
      pushUndo();
      updateElement(activeSlideIndex, selectedElement.id, {
        style: { ...selectedElement.style, ...updates },
      });
    },
    [activeSlideIndex, isShapeSelected, selectedElement, pushUndo, updateElement],
  );

  if (!showShapeDrawingTools) return null;

  return (
    <div
      className="fixed right-0 top-0 z-50 flex h-full flex-col overflow-hidden shadow-xl"
      style={{
        width: 300,
        backgroundColor: 'var(--card)',
        borderLeft: '1px solid var(--border)',
        color: 'var(--foreground)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--sidebar)',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Shape &amp; Drawing Tools</span>
        </div>
        <button
          type="button"
          onClick={() => setShowShapeDrawingTools(false)}
          className="rounded p-1 transition-colors hover:opacity-70"
          style={{ color: 'var(--foreground)' }}
          aria-label="Close shape drawing tools"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Shape Gallery ───────────────────────────────────────────── */}
        <Section title="Shape Gallery" icon={<Layers size={14} />} defaultOpen>
          <div className="space-y-3">
            {SHAPE_CATEGORIES.map((cat) => {
              const shapes = shapesByCategory.get(cat.id) ?? [];
              if (shapes.length === 0) return null;
              const isCollapsed = collapsedCategories.has(cat.id);
              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider opacity-60 hover:opacity-100"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    {cat.label}
                  </button>
                  {!isCollapsed && (
                    <div className="grid grid-cols-5 gap-1">
                      {shapes.map((shape) => (
                        <button
                          key={shape.id}
                          type="button"
                          title={shape.label}
                          onClick={() => handleInsertShape(shape.id)}
                          className="flex aspect-square items-center justify-center rounded-md border transition-all hover:scale-105 hover:shadow-sm"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        >
                          {getShapeIcon(shape.id, 18)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Fill Color ──────────────────────────────────────────────── */}
        <Section title="Fill Color" icon={<Paintbrush size={14} />} defaultOpen>
          {/* Fill mode tabs */}
          <div
            className="mb-3 flex rounded-md border text-xs"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['solid', 'gradient', 'transparent'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setFillMode(mode);
                  if (isShapeSelected) {
                    if (mode === 'transparent') {
                      applyToSelected({ backgroundColor: 'transparent', fillGradient: undefined });
                    } else if (mode === 'solid') {
                      applyToSelected({ backgroundColor: fillColor, fillGradient: undefined });
                    } else {
                      applyToSelected({ backgroundColor: undefined, fillGradient: fillGradient });
                    }
                  }
                }}
                className="flex-1 px-2 py-1.5 text-center capitalize transition-colors"
                style={{
                  backgroundColor: fillMode === mode ? 'var(--primary)' : 'transparent',
                  color: fillMode === mode ? '#ffffff' : 'var(--foreground)',
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Solid colors */}
          {fillMode === 'solid' && (
            <div className="grid grid-cols-8 gap-1">
              {SOLID_FILL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => {
                    setFillColor(color);
                    if (isShapeSelected) {
                      applyToSelected({ backgroundColor: color, fillGradient: undefined });
                    }
                  }}
                  className="aspect-square rounded-sm border transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: fillColor === color ? 'var(--primary)' : 'var(--border)',
                    borderWidth: fillColor === color ? 2 : 1,
                  }}
                />
              ))}
              <div className="col-span-8 mt-2 flex items-center gap-2">
                <label className="text-xs opacity-70">Custom:</label>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => {
                    setFillColor(e.target.value);
                    if (isShapeSelected) {
                      applyToSelected({ backgroundColor: e.target.value, fillGradient: undefined });
                    }
                  }}
                  className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono opacity-60">{fillColor}</span>
              </div>
            </div>
          )}

          {/* Gradient fills */}
          {fillMode === 'gradient' && (
            <div className="grid grid-cols-4 gap-1.5">
              {GRADIENT_FILL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => {
                    setFillGradient(preset.value);
                    if (isShapeSelected) {
                      applyToSelected({ fillGradient: preset.value, backgroundColor: undefined });
                    }
                  }}
                  className="aspect-square rounded-md border-2 transition-transform hover:scale-105"
                  style={{
                    background: preset.value,
                    borderColor: fillGradient === preset.value ? 'var(--primary)' : 'transparent',
                  }}
                />
              ))}
            </div>
          )}

          {/* Transparent info */}
          {fillMode === 'transparent' && (
            <div className="rounded-md p-3 text-center text-xs opacity-60" style={{ backgroundColor: 'var(--sidebar)' }}>
              Shape will have no fill (transparent background).
            </div>
          )}
        </Section>

        {/* ── Border / Outline ────────────────────────────────────────── */}
        <Section title="Border / Outline" icon={<Square size={14} />} defaultOpen={false}>
          <div className="space-y-3">
            {/* Border color */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-xs">Color</label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => {
                  setBorderColor(e.target.value);
                  if (isShapeSelected) applyToSelected({ borderColor: e.target.value });
                }}
                className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
              />
              <span className="text-[11px] font-mono opacity-60">{borderColor}</span>
            </div>

            {/* Border width */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-xs">Width</label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={borderWidth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBorderWidth(val);
                  if (isShapeSelected) applyToSelected({ borderWidth: val });
                }}
                className="flex-1"
              />
              <span className="w-8 text-right text-xs font-mono">{borderWidth}px</span>
            </div>

            {/* Border style */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-xs">Style</label>
              <div
                className="flex flex-1 rounded-md border text-xs"
                style={{ borderColor: 'var(--border)' }}
              >
                {BORDER_STYLES.map((bs) => (
                  <button
                    key={bs.id}
                    type="button"
                    onClick={() => {
                      setBorderStyle(bs.id);
                      if (isShapeSelected) applyToSelected({ borderStyle: bs.id });
                    }}
                    className="flex-1 px-2 py-1 text-center capitalize transition-colors"
                    style={{
                      backgroundColor: borderStyle === bs.id ? 'var(--primary)' : 'transparent',
                      color: borderStyle === bs.id ? '#ffffff' : 'var(--foreground)',
                    }}
                  >
                    {bs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Shadow ──────────────────────────────────────────────────── */}
        <Section title="Shadow" icon={<SunDim size={14} />} defaultOpen={false}>
          <div className="space-y-3">
            {/* Enable toggle */}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={shadowEnabled}
                onChange={(e) => {
                  const on = e.target.checked;
                  setShadowEnabled(on);
                  if (isShapeSelected) {
                    applyToSelected({
                      shadow: on,
                      shadowColor: on ? shadowColor : undefined,
                      shadowBlur: on ? shadowBlur : undefined,
                      shadowOffsetX: on ? shadowOffsetX : undefined,
                      shadowOffsetY: on ? shadowOffsetY : undefined,
                    });
                  }
                }}
                className="rounded"
              />
              Enable shadow
            </label>

            {shadowEnabled && (
              <>
                {/* Shadow color */}
                <div>
                  <label className="mb-1 block text-xs opacity-70">Color</label>
                  <div className="flex items-center gap-1">
                    {SHADOW_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setShadowColor(c);
                          if (isShapeSelected) applyToSelected({ shadowColor: c });
                        }}
                        className="h-5 w-5 rounded-sm border transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          borderColor: shadowColor === c ? 'var(--primary)' : 'var(--border)',
                          borderWidth: shadowColor === c ? 2 : 1,
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => {
                        setShadowColor(e.target.value);
                        if (isShapeSelected) applyToSelected({ shadowColor: e.target.value });
                      }}
                      className="ml-1 h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Blur */}
                <div className="flex items-center gap-2">
                  <label className="w-14 text-xs">Blur</label>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    step={1}
                    value={shadowBlur}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setShadowBlur(val);
                      if (isShapeSelected) applyToSelected({ shadowBlur: val });
                    }}
                    className="flex-1"
                  />
                  <span className="w-8 text-right text-xs font-mono">{shadowBlur}</span>
                </div>

                {/* Offset X */}
                <div className="flex items-center gap-2">
                  <label className="w-14 text-xs">Offset X</label>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={shadowOffsetX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setShadowOffsetX(val);
                      if (isShapeSelected) applyToSelected({ shadowOffsetX: val });
                    }}
                    className="flex-1"
                  />
                  <span className="w-8 text-right text-xs font-mono">{shadowOffsetX}</span>
                </div>

                {/* Offset Y */}
                <div className="flex items-center gap-2">
                  <label className="w-14 text-xs">Offset Y</label>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={shadowOffsetY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setShadowOffsetY(val);
                      if (isShapeSelected) applyToSelected({ shadowOffsetY: val });
                    }}
                    className="flex-1"
                  />
                  <span className="w-8 text-right text-xs font-mono">{shadowOffsetY}</span>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* ── 3D Effect Presets ────────────────────────────────────────── */}
        <Section title="3D Effect" icon={<Box size={14} />} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {EFFECT_3D_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setEffect3D(preset.id);
                  if (isShapeSelected) {
                    applyToSelected({
                      effect3D: preset.id,
                      rotateX: preset.rotateX,
                      rotateY: preset.rotateY,
                    });
                  }
                }}
                className="rounded-md border px-3 py-2 text-xs font-medium transition-all hover:shadow-sm"
                style={{
                  borderColor: effect3D === preset.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: effect3D === preset.id ? 'var(--primary)' : 'var(--card)',
                  color: effect3D === preset.id ? '#ffffff' : 'var(--foreground)',
                }}
              >
                <div
                  className="mx-auto mb-1.5 h-8 w-8 rounded-sm"
                  style={{
                    backgroundColor: 'var(--primary)',
                    opacity: 0.5,
                    transform:
                      preset.id === 'none'
                        ? 'none'
                        : `perspective(${preset.perspective}px) rotateX(${preset.rotateX}deg) rotateY(${preset.rotateY}deg)`,
                  }}
                />
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Opacity ─────────────────────────────────────────────────── */}
        <Section title="Opacity" icon={<Eye size={14} />} defaultOpen={false}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={opacity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setOpacity(val);
                if (isShapeSelected) applyToSelected({ opacity: val / 100 });
              }}
              className="flex-1"
            />
            <span className="w-10 text-right text-xs font-mono">{opacity}%</span>
          </div>
        </Section>

        {/* ── Selected Shape Formatting ────────────────────────────────── */}
        {isShapeSelected && selectedElement && (
          <Section title="Selected Shape" icon={<Palette size={14} />} defaultOpen>
            <div className="space-y-2">
              <div className="rounded-md p-2 text-xs" style={{ backgroundColor: 'var(--sidebar)' }}>
                <div className="flex items-center gap-2">
                  {getShapeIcon(selectedElement.content, 16)}
                  <span className="font-medium">
                    {SHAPE_TOOL_DEFINITIONS.find((s) => s.id === selectedElement.content)?.label ??
                      selectedElement.content}
                  </span>
                </div>
              </div>

              {/* Quick fill override */}
              <div>
                <label className="mb-1 block text-[11px] font-medium opacity-70">Quick Fill</label>
                <div className="flex flex-wrap gap-1">
                  {SOLID_FILL_COLORS.slice(0, 12).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => applyToSelected({ backgroundColor: c, fillGradient: undefined })}
                      className="h-5 w-5 rounded-sm border transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor:
                          selectedElement.style.backgroundColor === c ? 'var(--primary)' : 'var(--border)',
                        borderWidth: selectedElement.style.backgroundColor === c ? 2 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick border toggle */}
              <div className="flex items-center gap-2">
                <label className="text-xs">Border:</label>
                <input
                  type="color"
                  value={selectedElement.style.borderColor ?? '#000000'}
                  onChange={(e) => applyToSelected({ borderColor: e.target.value })}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={selectedElement.style.borderWidth ?? 0}
                  onChange={(e) => applyToSelected({ borderWidth: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-8 text-right text-[11px] font-mono">
                  {selectedElement.style.borderWidth ?? 0}px
                </span>
              </div>

              {/* Opacity */}
              <div className="flex items-center gap-2">
                <label className="text-xs">Opacity:</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round((selectedElement.style.opacity ?? 1) * 100)}
                  onChange={(e) => applyToSelected({ opacity: Number(e.target.value) / 100 })}
                  className="flex-1"
                />
                <span className="w-10 text-right text-[11px] font-mono">
                  {Math.round((selectedElement.style.opacity ?? 1) * 100)}%
                </span>
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 text-[11px]"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--sidebar)',
          color: 'var(--foreground)',
          opacity: 0.6,
        }}
      >
        <span>Click a shape to insert</span>
        {isShapeSelected && <span className="font-medium opacity-100">Editing shape</span>}
      </div>
    </div>
  );
}
