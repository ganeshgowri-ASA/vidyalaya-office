'use client';

import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Type,
  Image,
  Square,
  Circle,
  Palette,
  Play,
  LayoutTemplate,
  MessageSquare,
  Printer,
  ChevronDown,
  ArrowRight,
  Star,
  Diamond,
  Grid,
  Paintbrush,
  Paintbrush2,
  Layers,
  Sparkles,
  Lightbulb,
  Timer,
  Download,
  FileText,
  File,
  BoxSelect,
  RotateCcw,
  EyeOff,
} from 'lucide-react';
import {
  usePresentationStore,
  GRADIENT_PRESETS,
  SOLID_COLORS,
  PRESENTATION_THEMES,
  type SlideLayout,
} from '@/store/presentation-store';

const LAYOUT_OPTIONS: { label: string; value: SlideLayout }[] = [
  { label: 'Title Slide', value: 'title' },
  { label: 'Title & Content', value: 'content' },
  { label: 'Section Header', value: 'section-header' },
  { label: 'Two Content', value: 'two-column' },
  { label: 'Comparison', value: 'comparison' },
  { label: 'Blank', value: 'blank' },
  { label: 'Title Only', value: 'title-only' },
  { label: 'Picture with Caption', value: 'picture-caption' },
];

export default function Toolbar() {
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    updateSlideBackground,
    addElement,
    updateElement,
    setPresenterMode,
    setShowTemplateModal,
    setShowAIPanel,
    showAIPanel,
    updateSlideTransition,
    showAnimationsPanel,
    setShowAnimationsPanel,
    setShowSmartArtModal,
    showGrid,
    setShowGrid,
    applyTheme,
    currentTheme,
    updateSlideTransitionTiming,
  } = usePresentationStore();

  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showMoreShapes, setShowMoreShapes] = useState(false);
  const [showTransitions, setShowTransitions] = useState(false);
  const [showSorterView, setShowSorterView] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showShapeFormat, setShowShapeFormat] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showTransitionTiming, setShowTransitionTiming] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find((el) => el.id === selectedElementId);

  const handleAddText = () => {
    addElement(activeSlideIndex, {
      type: 'text',
      x: 100,
      y: 200,
      width: 400,
      height: 60,
      content: 'New text box',
      style: { fontSize: 24, color: '#ffffff' },
    });
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addElement(activeSlideIndex, {
        type: 'image',
        x: 200,
        y: 100,
        width: 300,
        height: 200,
        content: reader.result as string,
        style: {},
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddShape = (shape: 'rect' | 'circle' | 'arrow' | 'star' | 'diamond' | 'callout') => {
    addElement(activeSlideIndex, {
      type: 'shape',
      x: 300,
      y: 200,
      width: 120,
      height: 120,
      content: shape,
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: shape === 'circle' ? '50%' : shape === 'callout' ? '8px' : '0',
      },
    });
  };

  const toggleBold = () => {
    if (!selectedElement) return;
    updateElement(activeSlideIndex, selectedElement.id, {
      style: {
        fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold',
      },
    });
  };

  const toggleItalic = () => {
    if (!selectedElement) return;
    updateElement(activeSlideIndex, selectedElement.id, {
      style: {
        fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic',
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const handleExportPPTX = () => {
    // Generate a JSON representation for download
    const data = JSON.stringify({ slides }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.pptx.json';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
  const FONT_SIZES = [14, 18, 20, 24, 28, 32, 36, 44, 56, 72];
  const SHAPE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#ffffff', '#000000', '#6b7280', '#1e293b'];

  const timing = slide?.transitionTiming;

  return (
    <div
      className="flex items-center gap-1 px-3 py-2 border-b flex-wrap no-print"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--topbar)',
        color: 'var(--topbar-foreground)',
      }}
    >
      {/* Themes dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Slide themes"
        >
          <Paintbrush2 size={16} />
          <span className="hidden sm:inline">{currentTheme || 'Themes'}</span>
          <ChevronDown size={12} />
        </button>
        {showThemes && (
          <div
            className="absolute left-0 top-full mt-1 p-3 rounded shadow-xl z-50 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 260 }}
          >
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
              Professional Themes
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESENTATION_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    applyTheme(theme);
                    setShowThemes(false);
                  }}
                  className="rounded border overflow-hidden text-left transition-all hover:scale-105"
                  style={{
                    borderColor: currentTheme === theme.name ? 'var(--primary)' : 'var(--border)',
                    borderWidth: currentTheme === theme.name ? 2 : 1,
                  }}
                >
                  <div
                    className="h-14 flex items-center justify-center p-2"
                    style={{ background: theme.background }}
                  >
                    <div>
                      <div style={{ color: theme.titleColor, fontSize: 9, fontWeight: 'bold' }}>
                        Title
                      </div>
                      <div style={{ color: theme.textColor, fontSize: 7 }}>
                        Body text
                      </div>
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 text-xs truncate"
                    style={{ color: 'var(--card-foreground)', background: 'var(--card)' }}
                  >
                    {theme.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background picker */}
      <div className="relative">
        <button
          onClick={() => setShowBgPicker(!showBgPicker)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Slide background"
        >
          <Palette size={16} />
          <span className="hidden sm:inline">Background</span>
        </button>
        {showBgPicker && (
          <div
            className="absolute left-0 top-full mt-1 p-3 rounded shadow-xl z-50 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 220 }}
          >
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
              Gradients
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {GRADIENT_PRESETS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => {
                    updateSlideBackground(activeSlideIndex, g);
                    setShowBgPicker(false);
                  }}
                  className="w-10 h-10 rounded border"
                  style={{ background: g, borderColor: 'var(--border)' }}
                />
              ))}
            </div>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
              Solid Colors
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SOLID_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    updateSlideBackground(activeSlideIndex, c);
                    setShowBgPicker(false);
                  }}
                  className="w-10 h-10 rounded border"
                  style={{ background: c, borderColor: 'var(--border)' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

      {/* Slide layouts dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Insert slide with layout"
        >
          <Layers size={16} />
          <span className="hidden sm:inline">Layout</span>
          <ChevronDown size={12} />
        </button>
        {showLayoutMenu && (
          <div
            className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 180 }}
          >
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  usePresentationStore.getState().addSlide(opt.value, activeSlideIndex);
                  setShowLayoutMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--card-foreground)' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

      {/* Add text */}
      <button
        onClick={handleAddText}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Add text box"
      >
        <Type size={16} />
        <span className="hidden sm:inline">Text</span>
      </button>

      {/* Add image */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Add image"
      >
        <Image size={16} />
        <span className="hidden sm:inline">Image</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddImage}
      />

      {/* Shapes */}
      <button
        onClick={() => handleAddShape('rect')}
        className="p-1.5 rounded hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Add rectangle"
      >
        <Square size={16} />
      </button>
      <button
        onClick={() => handleAddShape('circle')}
        className="p-1.5 rounded hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Add circle"
      >
        <Circle size={16} />
      </button>

      {/* More Shapes dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowMoreShapes(!showMoreShapes)}
          className="flex items-center gap-0.5 p-1.5 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="More shapes"
        >
          <ChevronDown size={14} />
        </button>
        {showMoreShapes && (
          <div
            className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 160 }}
          >
            <button
              onClick={() => { handleAddShape('arrow'); setShowMoreShapes(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80 flex items-center gap-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              <ArrowRight size={14} /> Arrow Right
            </button>
            <button
              onClick={() => { handleAddShape('star'); setShowMoreShapes(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80 flex items-center gap-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              <Star size={14} /> Star
            </button>
            <button
              onClick={() => { handleAddShape('callout'); setShowMoreShapes(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80 flex items-center gap-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              <MessageSquare size={14} /> Callout
            </button>
            <button
              onClick={() => { handleAddShape('diamond'); setShowMoreShapes(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80 flex items-center gap-2"
              style={{ color: 'var(--card-foreground)' }}
            >
              <Diamond size={14} /> Diamond
            </button>
          </div>
        )}
      </div>

      {/* SmartArt */}
      <button
        onClick={() => setShowSmartArtModal(true)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Insert SmartArt"
      >
        <Lightbulb size={16} />
        <span className="hidden lg:inline">SmartArt</span>
      </button>

      <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

      {/* Shape formatting panel */}
      {selectedElement && selectedElement.type === 'shape' && (
        <div className="relative">
          <button
            onClick={() => setShowShapeFormat(!showShapeFormat)}
            className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
            style={{ color: 'var(--topbar-foreground)' }}
            title="Shape formatting"
          >
            <Paintbrush size={16} />
            <span className="hidden sm:inline">Format Shape</span>
            <ChevronDown size={12} />
          </button>
          {showShapeFormat && (
            <div
              className="absolute left-0 top-full mt-1 p-3 rounded shadow-xl z-50 border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 240 }}
            >
              {/* Fill color */}
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
                Fill Color
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {SHAPE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      updateElement(activeSlideIndex, selectedElement.id, {
                        style: { backgroundColor: c },
                      });
                    }}
                    className="w-7 h-7 rounded border"
                    style={{
                      background: c,
                      borderColor: selectedElement.style.backgroundColor === c ? 'var(--primary)' : 'var(--border)',
                      borderWidth: selectedElement.style.backgroundColor === c ? 2 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Border color */}
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
                Border Color
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {SHAPE_COLORS.map((c) => (
                  <button
                    key={`border-${c}`}
                    onClick={() => {
                      updateElement(activeSlideIndex, selectedElement.id, {
                        style: { borderColor: c },
                      });
                    }}
                    className="w-7 h-7 rounded border"
                    style={{
                      background: c,
                      borderColor: selectedElement.style.borderColor === c ? 'var(--primary)' : 'var(--border)',
                      borderWidth: selectedElement.style.borderColor === c ? 2 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Border width */}
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
                Border Width: {selectedElement.style.borderWidth ?? 0}px
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={selectedElement.style.borderWidth ?? 0}
                onChange={(e) => {
                  updateElement(activeSlideIndex, selectedElement.id, {
                    style: { borderWidth: parseInt(e.target.value) },
                  });
                }}
                className="w-full h-1.5 rounded appearance-none cursor-pointer mb-3"
                style={{ accentColor: 'var(--primary)' }}
              />

              {/* Shadow toggle */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: 'var(--card-foreground)' }}>
                  Shadow
                </span>
                <button
                  onClick={() => {
                    updateElement(activeSlideIndex, selectedElement.id, {
                      style: { shadow: !selectedElement.style.shadow },
                    });
                  }}
                  className="w-10 h-5 rounded-full transition-colors relative"
                  style={{
                    background: selectedElement.style.shadow ? 'var(--primary)' : 'var(--muted)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{
                      left: selectedElement.style.shadow ? 20 : 2,
                    }}
                  />
                </button>
              </div>

              {/* 3D Rotation */}
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
                3D Rotation
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60 w-16">Rotate X:</span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={1}
                    value={selectedElement.style.rotateX ?? 0}
                    onChange={(e) => {
                      updateElement(activeSlideIndex, selectedElement.id, {
                        style: { rotateX: parseInt(e.target.value) },
                      });
                    }}
                    className="flex-1 h-1.5 rounded appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-xs opacity-60 w-8">{selectedElement.style.rotateX ?? 0}&deg;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60 w-16">Rotate Y:</span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={1}
                    value={selectedElement.style.rotateY ?? 0}
                    onChange={(e) => {
                      updateElement(activeSlideIndex, selectedElement.id, {
                        style: { rotateY: parseInt(e.target.value) },
                      });
                    }}
                    className="flex-1 h-1.5 rounded appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-xs opacity-60 w-8">{selectedElement.style.rotateY ?? 0}&deg;</span>
                </div>
                {(selectedElement.style.rotateX || selectedElement.style.rotateY) ? (
                  <button
                    onClick={() => {
                      updateElement(activeSlideIndex, selectedElement.id, {
                        style: { rotateX: 0, rotateY: 0 },
                      });
                    }}
                    className="flex items-center gap-1 text-xs hover:opacity-80"
                    style={{ color: 'var(--primary)' }}
                  >
                    <RotateCcw size={12} /> Reset rotation
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transition selector */}
      <div className="relative">
        <button
          onClick={() => setShowTransitions(!showTransitions)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Slide transition"
        >
          <Play size={14} />
          <span className="hidden sm:inline">{slide?.transition && slide.transition !== 'none' ? slide.transition.charAt(0).toUpperCase() + slide.transition.slice(1) : 'Transition'}</span>
        </button>
        {showTransitions && (
          <div
            className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 120 }}
          >
            {(['none', 'fade', 'slide', 'zoom'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  updateSlideTransition(activeSlideIndex, t);
                  setShowTransitions(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80"
                style={{
                  color: 'var(--card-foreground)',
                  fontWeight: slide?.transition === t || (!slide?.transition && t === 'none') ? 'bold' : 'normal',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transition timing */}
      <div className="relative">
        <button
          onClick={() => setShowTransitionTiming(!showTransitionTiming)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Transition timing"
        >
          <Timer size={14} />
          <span className="hidden lg:inline">Timing</span>
        </button>
        {showTransitionTiming && (
          <div
            className="absolute left-0 top-full mt-1 p-3 rounded shadow-xl z-50 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 220 }}
          >
            <div className="text-xs font-medium mb-3" style={{ color: 'var(--card-foreground)' }}>
              Transition Timing
            </div>

            {/* Auto-advance */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--card-foreground)' }}>
                Auto-advance
              </span>
              <button
                onClick={() => {
                  updateSlideTransitionTiming(activeSlideIndex, {
                    autoAdvance: !(timing?.autoAdvance ?? false),
                  });
                }}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{
                  background: timing?.autoAdvance ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ left: timing?.autoAdvance ? 20 : 2 }}
                />
              </button>
            </div>

            {timing?.autoAdvance && (
              <div className="mb-3">
                <span className="text-xs opacity-60" style={{ color: 'var(--card-foreground)' }}>
                  After {timing.autoAdvanceSeconds ?? 5} seconds
                </span>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={timing.autoAdvanceSeconds ?? 5}
                  onChange={(e) => {
                    updateSlideTransitionTiming(activeSlideIndex, {
                      autoAdvanceSeconds: parseInt(e.target.value),
                    });
                  }}
                  className="w-full h-1.5 rounded appearance-none cursor-pointer mt-1"
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>
            )}

            {/* On click */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--card-foreground)' }}>
                On click advance
              </span>
              <button
                onClick={() => {
                  updateSlideTransitionTiming(activeSlideIndex, {
                    onClickAdvance: !(timing?.onClickAdvance ?? true),
                  });
                }}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{
                  background: (timing?.onClickAdvance ?? true) ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ left: (timing?.onClickAdvance ?? true) ? 20 : 2 }}
                />
              </button>
            </div>

            {/* Loop */}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--card-foreground)' }}>
                Loop slideshow
              </span>
              <button
                onClick={() => {
                  updateSlideTransitionTiming(activeSlideIndex, {
                    loop: !(timing?.loop ?? false),
                  });
                }}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{
                  background: timing?.loop ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ left: timing?.loop ? 20 : 2 }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Animations toggle */}
      <button
        onClick={() => setShowAnimationsPanel(!showAnimationsPanel)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: showAnimationsPanel ? 'var(--primary)' : 'var(--topbar-foreground)' }}
        title="Animations panel"
      >
        <Sparkles size={16} />
        <span className="hidden lg:inline">Animations</span>
      </button>

      {/* Slide Sorter View */}
      <button
        onClick={() => setShowSorterView(!showSorterView)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: showSorterView ? 'var(--primary)' : 'var(--topbar-foreground)' }}
        title="Slide sorter view"
      >
        <Grid size={16} />
        <span className="hidden sm:inline">Sorter</span>
      </button>

      {/* Grid/Guides toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: showGrid ? 'var(--primary)' : 'var(--topbar-foreground)' }}
        title="Show grid/guides"
      >
        <BoxSelect size={16} />
        <span className="hidden lg:inline">Grid</span>
      </button>

      <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

      {/* Font size */}
      <div className="relative">
        <button
          onClick={() => setShowFontSize(!showFontSize)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Font size"
        >
          <span style={{ fontSize: 14, fontWeight: 'bold' }}>A</span>
          <span className="hidden sm:inline">
            {selectedElement?.style.fontSize || '--'}
          </span>
        </button>
        {showFontSize && (
          <div
            className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 80 }}
          >
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => {
                  if (selectedElement) {
                    updateElement(activeSlideIndex, selectedElement.id, {
                      style: { fontSize: size },
                    });
                  }
                  setShowFontSize(false);
                }}
                className="w-full text-left px-3 py-1 text-sm hover:opacity-80"
                style={{ color: 'var(--card-foreground)' }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bold */}
      <button
        onClick={toggleBold}
        className="p-1.5 rounded hover:opacity-80 transition-opacity"
        style={{
          color: 'var(--topbar-foreground)',
          opacity: selectedElement?.style.fontWeight === 'bold' ? 1 : 0.6,
        }}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      {/* Italic */}
      <button
        onClick={toggleItalic}
        className="p-1.5 rounded hover:opacity-80 transition-opacity"
        style={{
          color: 'var(--topbar-foreground)',
          opacity: selectedElement?.style.fontStyle === 'italic' ? 1 : 0.6,
        }}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      {/* Text color */}
      <div className="relative">
        <button
          onClick={() => setShowTextColor(!showTextColor)}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Text color"
        >
          <div className="w-4 h-4 rounded border" style={{ background: selectedElement?.style.color || '#fff', borderColor: 'var(--border)' }} />
        </button>
        {showTextColor && (
          <div
            className="absolute left-0 top-full mt-1 p-2 rounded shadow-xl z-50 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    if (selectedElement) {
                      updateElement(activeSlideIndex, selectedElement.id, {
                        style: { color: c },
                      });
                    }
                    setShowTextColor(false);
                  }}
                  className="w-6 h-6 rounded border"
                  style={{ background: c, borderColor: 'var(--border)' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Right side actions */}
      <button
        onClick={() => setShowTemplateModal(true)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Templates"
      >
        <LayoutTemplate size={16} />
        <span className="hidden md:inline">Templates</span>
      </button>

      <button
        onClick={() => setShowAIPanel(!showAIPanel)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{
          color: showAIPanel ? 'var(--primary)' : 'var(--topbar-foreground)',
        }}
        title="AI Assistant"
      >
        <MessageSquare size={16} />
        <span className="hidden md:inline">AI</span>
      </button>

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--topbar-foreground)' }}
          title="Export"
        >
          <Download size={16} />
          <span className="hidden md:inline">Export</span>
          <ChevronDown size={12} />
        </button>
        {showExportMenu && (
          <div
            className="absolute right-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 160 }}
          >
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:opacity-80"
              style={{ color: 'var(--card-foreground)' }}
            >
              <FileText size={14} /> Export to PDF
            </button>
            <button
              onClick={handleExportPPTX}
              className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:opacity-80"
              style={{ color: 'var(--card-foreground)' }}
            >
              <File size={14} /> Export to PPTX
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handlePrint}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ color: 'var(--topbar-foreground)' }}
        title="Print slides"
      >
        <Printer size={16} />
      </button>

      <button
        onClick={() => setPresenterMode(true)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        title="Present (F5)"
      >
        <Play size={16} />
        <span className="hidden sm:inline">Present</span>
      </button>

      {/* Slide Sorter View overlay */}
      {showSorterView && (
        <div
          className="fixed inset-0 z-[999] overflow-auto p-8"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Slide Sorter</h2>
            <button
              onClick={() => setShowSorterView(false)}
              className="px-3 py-1.5 rounded text-sm font-medium"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {slides.map((s, index) => (
              <div
                key={s.id}
                onClick={() => {
                  usePresentationStore.getState().setActiveSlide(index);
                  setShowSorterView(false);
                }}
                className="cursor-pointer rounded overflow-hidden border-2 transition-all hover:scale-105"
                style={{
                  borderColor: index === activeSlideIndex ? 'var(--primary)' : 'var(--border)',
                  aspectRatio: '16/9',
                  opacity: s.hidden ? 0.5 : 1,
                }}
              >
                <div
                  className="w-full h-full relative"
                  style={{ background: s.background }}
                >
                  {s.hidden && (
                    <div className="absolute top-1 left-1">
                      <EyeOff size={12} className="text-white/60" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-2 text-white font-bold text-xs drop-shadow">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
