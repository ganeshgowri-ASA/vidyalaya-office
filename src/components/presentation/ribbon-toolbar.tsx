'use client';

import React, { useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Type, Image, Square, Circle,
  Palette, Play, LayoutTemplate, ChevronDown, ArrowRight,
  Star, Diamond, Grid, Paintbrush, Paintbrush2, Layers,
  Sparkles, Lightbulb, Timer, Download, FileText, File,
  BoxSelect, RotateCcw, Settings2, MessageSquare,
  Printer, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, Copy, Clipboard, Scissors, Table,
  BarChart3, Plus, Minus, Maximize, Monitor,
  Ruler, Eye, EyeOff, ArrowUp, ArrowDown,
  Rows3, PanelTop, SlidersHorizontal, Columns3,
  PenTool, Triangle, Hexagon, Smile, Shapes,
  Video, Music, Wand2, AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter, Group, Ungroup,
  ArrowLeft, ArrowUpRight, Heart, Cloud,
  Pen, Highlighter, MousePointer, ChevronsUp, ChevronsDown,
  Volume2, Clock, Zap, SkipForward, Repeat, Shuffle,
  MoveRight, MoveLeft, MoveUp, MoveDown, RotateCw,
  ZoomIn, ZoomOut, FlipHorizontal, FlipVertical,
  Waves, Hexagon as HexagonIcon, Crosshair, Wind,
  Paintbrush as BrushIcon, Eraser, Move, Navigation,
  Radio, Tv, Users, Globe, Mic, Camera, Video as VideoIcon,
  PlayCircle, StopCircle, SkipBack, FastForward,
  ChevronRight, ChevronLeft, ChevronUp, ListOrdered,
  MousePointerClick, Hourglass, LayoutList, Rewind,
  Keyboard,
} from 'lucide-react';
import {
  ShapePicker, IconPicker,
  type ShapeDefinition, type IconDefinition,
} from '@/components/shared/shapes-icons-library';
import { CHART_CATEGORIES } from '@/components/shared/chart-types';
import {
  usePresentationStore,
  GRADIENT_PRESETS,
  SOLID_COLORS,
  PRESENTATION_THEMES,
  SHAPE_TOOL_DEFINITIONS,
  type SlideLayout,
  type RibbonTab,
  type SlideTransitionType,
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

const RIBBON_TABS: { id: RibbonTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'insert', label: 'Insert' },
  { id: 'design', label: 'Design' },
  { id: 'transitions', label: 'Transitions' },
  { id: 'animations', label: 'Animations' },
  { id: 'slideshow', label: 'Slide Show' },
  { id: 'review', label: 'Review' },
  { id: 'view', label: 'View' },
];

const TRANSITION_TYPES: { value: SlideTransitionType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'push', label: 'Push' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'split', label: 'Split' },
  { value: 'reveal', label: 'Reveal' },
  { value: 'cut', label: 'Cut' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'morph', label: 'Morph' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'cover', label: 'Cover' },
  { value: 'uncover', label: 'Uncover' },
  { value: 'slide', label: 'Slide' },
  { value: 'random', label: 'Random' },
];

const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 96];
const FONT_FAMILIES = ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Trebuchet MS', 'Helvetica', 'Impact', 'Comic Sans MS'];
const SHAPE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#ffffff', '#000000', '#6b7280', '#1e293b'];

function RibbonDivider() {
  return <div className="w-px h-12 mx-1.5 self-center" style={{ background: 'var(--border)' }} />;
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-0.5 px-1 py-0.5 min-h-[52px]">
        {children}
      </div>
      <span className="text-[9px] opacity-50 -mt-0.5 pb-0.5">{label}</span>
    </div>
  );
}

function RibbonButton({ icon, label, onClick, active, title, small, disabled }: {
  icon: React.ReactNode; label?: string; onClick?: () => void; active?: boolean; title?: string; small?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center rounded px-1.5 py-1 text-[10px] hover:opacity-80 transition-opacity ${small ? 'min-w-[28px]' : 'min-w-[40px]'}`}
      style={{
        color: active ? 'var(--primary)' : 'var(--topbar-foreground)',
        background: active ? 'var(--accent)' : 'transparent',
        opacity: disabled ? 0.4 : 1,
      }}
      title={title || label}
    >
      {icon}
      {label && <span className="mt-0.5 leading-none whitespace-nowrap">{label}</span>}
    </button>
  );
}

export default function RibbonToolbar({ onPageSetup }: { onPageSetup?: () => void } = {}) {
  const store = usePresentationStore();
  const {
    slides, activeSlideIndex, selectedElementId, selectedElementIds,
    updateSlideBackground, addElement, updateElement, removeElement,
    setPresenterMode, setShowTemplateModal, setShowAIPanel, showAIPanel,
    updateSlideTransition, showAnimationsPanel, setShowAnimationsPanel,
    setShowSmartArtModal, showGrid, setShowGrid, showRuler, setShowRuler,
    showGuides, setShowGuides, snapToGrid, setSnapToGrid, snapToObjects, setSnapToObjects,
    applyTheme, currentTheme, updateSlideTransitionTiming,
    activeRibbonTab, setActiveRibbonTab, setShowSlideSorter, showSlideSorter,
    undo, redo, undoStack, redoStack, pushUndo,
    copyElement, pasteElement, clipboardElement,
    addSlide, duplicateSlide,
    bringForward, sendBackward, bringToFront, sendToBack,
    groupElements, ungroupElements, alignElements, distributeElements,
    setShowSlideMaster, setShowDesignPanel, showDesignPanel,
    setShowMediaPanel, setShowTextEffectsPanel, setShowExportPanel,
    applyTransitionToAll, updateSlideTransitionDuration,
    setPresenterViewMode,
    setShowThemeDesigner, showThemeDesigner,
    setShowShapeDrawingTools, showShapeDrawingTools,
    setShowImageEditor, showImageEditor,
    setShowTransitionPanel, showTransitionPanel,
    setShowAnimationTimeline, showAnimationTimeline,
    setShowRecordNarration, setShowSlideZoom, setShowKeyboardShortcuts,
    slideNarrations,
  } = store;

  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showShapeColor, setShowShapeColor] = useState(false);
  const [showMoreShapes, setShowMoreShapes] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showTransitionTiming, setShowTransitionTiming] = useState(false);
  const [showAdvShapes, setShowAdvShapes] = useState(false);
  const [showAdvIcons, setShowAdvIcons] = useState(false);
  const [showAdvCharts, setShowAdvCharts] = useState(false);
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find((el) => el.id === selectedElementId);
  const timing = slide?.transitionTiming;

  const handleAddText = () => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'text', x: 100, y: 200, width: 400, height: 60,
      content: 'New text box', style: { fontSize: 24, color: '#ffffff' },
    });
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    pushUndo();
    const reader = new FileReader();
    reader.onload = () => {
      addElement(activeSlideIndex, {
        type: 'image', x: 200, y: 100, width: 300, height: 200,
        content: reader.result as string, style: {},
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddShape = (shape: string) => {
    pushUndo();
    const shapeProps: Record<string, Partial<{ borderRadius: string; width: number; height: number }>> = {
      circle: { borderRadius: '50%' },
      'rounded-rect': { borderRadius: '12px' },
      callout: { borderRadius: '8px' },
      'callout-round': { borderRadius: '50%' },
      line: { height: 3 },
      curve: { height: 3 },
    };
    const props = shapeProps[shape] || {};
    addElement(activeSlideIndex, {
      type: 'shape', x: 300, y: 200,
      width: props.width || 120, height: props.height || 120,
      content: shape,
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: props.borderRadius || '0',
      },
    });
  };

  const handleAddTable = () => {
    pushUndo();
    const cells = Array.from({ length: 4 }, () => Array.from({ length: 3 }, () => ''));
    cells[0] = ['Header 1', 'Header 2', 'Header 3'];
    addElement(activeSlideIndex, {
      type: 'table', x: 100, y: 120, width: 500, height: 200,
      content: 'table',
      tableData: { rows: 4, cols: 3, cells, headerRow: true },
      style: { fontSize: 14, color: '#000000' },
    });
  };

  const handleAddAdvancedShape = (shape: ShapeDefinition) => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'shape', x: 250, y: 150, width: 150, height: 150,
      content: shape.id,
      style: { backgroundColor: '#3b82f6', borderRadius: '0' },
    });
    setShowAdvShapes(false);
  };

  const handleAddIcon = (icon: IconDefinition) => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'shape', x: 350, y: 200, width: 80, height: 80,
      content: `icon:${icon.id}`,
      style: { backgroundColor: 'transparent', color: '#3b82f6' },
    });
    setShowAdvIcons(false);
  };

  const handleAddAdvancedChart = (chartType: string, chartLabel: string) => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'chart', x: 150, y: 100, width: 400, height: 300,
      content: 'chart',
      chartData: {
        chartType: chartType as 'bar' | 'line' | 'pie' | 'doughnut',
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          { label: 'Series 1', data: [30, 50, 40, 60], color: '#3b82f6' },
          { label: 'Series 2', data: [20, 35, 45, 50], color: '#ef4444' },
        ],
      },
      style: { backgroundColor: 'rgba(255,255,255,0.1)' },
    });
    setShowAdvCharts(false);
  };

  const handleAddChart = (chartType: 'bar' | 'line' | 'pie' | 'doughnut') => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'chart', x: 150, y: 100, width: 400, height: 300,
      content: 'chart',
      chartData: {
        chartType,
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          { label: 'Series 1', data: [30, 50, 40, 60], color: '#3b82f6' },
          { label: 'Series 2', data: [20, 35, 45, 50], color: '#ef4444' },
        ],
      },
      style: { backgroundColor: 'rgba(255,255,255,0.1)' },
    });
  };

  const toggleBold = () => {
    if (!selectedElement) return;
    pushUndo();
    updateElement(activeSlideIndex, selectedElement.id, {
      style: { fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' },
    });
  };

  const toggleItalic = () => {
    if (!selectedElement) return;
    pushUndo();
    updateElement(activeSlideIndex, selectedElement.id, {
      style: { fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' },
    });
  };

  const toggleUnderline = () => {
    if (!selectedElement) return;
    pushUndo();
    updateElement(activeSlideIndex, selectedElement.id, {
      style: { textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline' },
    });
  };

  const handleExportPDF = () => { window.print(); };
  const handleExportPPTX = () => {
    const data = JSON.stringify({ slides }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'presentation.pptx.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteElement = () => {
    if (!selectedElementId) return;
    pushUndo();
    removeElement(activeSlideIndex, selectedElementId);
  };

  const renderTabContent = () => {
    switch (activeRibbonTab) {
      case 'home':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Clipboard">
              <RibbonButton icon={<Clipboard size={16} />} label="Paste" onClick={pasteElement} disabled={!clipboardElement} small />
              <div className="flex flex-col gap-0.5">
                <RibbonButton icon={<Scissors size={14} />} onClick={() => { if (selectedElementId) { copyElement(); handleDeleteElement(); } }} title="Cut" small />
                <RibbonButton icon={<Copy size={14} />} onClick={copyElement} title="Copy" small disabled={!selectedElementId} />
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Slides">
              <div className="relative">
                <RibbonButton icon={<Plus size={16} />} label="New Slide" onClick={() => setShowLayoutMenu(!showLayoutMenu)} />
                {showLayoutMenu && (
                  <div className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 180 }}>
                    {LAYOUT_OPTIONS.map((opt) => (
                      <button key={opt.value}
                        onClick={() => { pushUndo(); addSlide(opt.value, activeSlideIndex); setShowLayoutMenu(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80"
                        style={{ color: 'var(--card-foreground)' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RibbonButton icon={<Copy size={14} />} label="Duplicate" onClick={() => { pushUndo(); duplicateSlide(activeSlideIndex); }} small />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Font">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <div className="relative">
                    <button onClick={() => setShowFontFamily(!showFontFamily)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border"
                      style={{ borderColor: 'var(--border)', color: 'var(--topbar-foreground)', minWidth: 80 }}>
                      <span className="truncate">{selectedElement?.style.fontFamily || 'Arial'}</span>
                      <ChevronDown size={10} />
                    </button>
                    {showFontFamily && (
                      <div className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1 max-h-48 overflow-y-auto"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 150 }}>
                        {FONT_FAMILIES.map((f) => (
                          <button key={f} onClick={() => {
                            if (selectedElement) { pushUndo(); updateElement(activeSlideIndex, selectedElement.id, { style: { fontFamily: f } }); }
                            setShowFontFamily(false);
                          }}
                            className="w-full text-left px-3 py-1 text-sm hover:opacity-80"
                            style={{ color: 'var(--card-foreground)', fontFamily: f }}>
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowFontSize(!showFontSize)}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border"
                      style={{ borderColor: 'var(--border)', color: 'var(--topbar-foreground)', minWidth: 40 }}>
                      <span>{selectedElement?.style.fontSize || '--'}</span>
                      <ChevronDown size={10} />
                    </button>
                    {showFontSize && (
                      <div className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1 max-h-48 overflow-y-auto"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 60 }}>
                        {FONT_SIZES.map((size) => (
                          <button key={size} onClick={() => {
                            if (selectedElement) { pushUndo(); updateElement(activeSlideIndex, selectedElement.id, { style: { fontSize: size } }); }
                            setShowFontSize(false);
                          }}
                            className="w-full text-left px-2 py-0.5 text-xs hover:opacity-80"
                            style={{ color: 'var(--card-foreground)' }}>
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={toggleBold} className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.fontWeight === 'bold' ? 1 : 0.5 }} title="Bold">
                    <Bold size={14} />
                  </button>
                  <button onClick={toggleItalic} className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.fontStyle === 'italic' ? 1 : 0.5 }} title="Italic">
                    <Italic size={14} />
                  </button>
                  <button onClick={toggleUnderline} className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.textDecoration === 'underline' ? 1 : 0.5 }} title="Underline">
                    <Underline size={14} />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowTextColor(!showTextColor)} className="p-1 rounded hover:opacity-80" title="Font Color">
                      <div className="w-3.5 h-3.5 rounded border" style={{ background: selectedElement?.style.color || '#fff', borderColor: 'var(--border)' }} />
                    </button>
                    {showTextColor && (
                      <div className="absolute left-0 top-full mt-1 p-2 rounded shadow-xl z-50 border"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="grid grid-cols-5 gap-1.5">
                          {TEXT_COLORS.map((c) => (
                            <button key={c} onClick={() => {
                              if (selectedElement) { pushUndo(); updateElement(activeSlideIndex, selectedElement.id, { style: { color: c } }); }
                              setShowTextColor(false);
                            }}
                              className="w-5 h-5 rounded border" style={{ background: c, borderColor: 'var(--border)' }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Paragraph">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  {([
                    { align: 'left', Icon: AlignLeft },
                    { align: 'center', Icon: AlignCenter },
                    { align: 'right', Icon: AlignRight },
                    { align: 'justify', Icon: AlignJustify },
                  ] as const).map(({ align, Icon }) => (
                    <button key={align} onClick={() => {
                      if (selectedElement) { pushUndo(); updateElement(activeSlideIndex, selectedElement.id, { style: { textAlign: align } }); }
                    }}
                      className="p-1 rounded hover:opacity-80"
                      style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.textAlign === align ? 1 : 0.5 }}
                      title={`Align ${align}`}>
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Arrange group with alignment tools */}
            <RibbonGroup label="Arrange">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <RibbonButton icon={<ChevronsUp size={14} />} onClick={() => { if (selectedElementId) bringToFront(activeSlideIndex, selectedElementId); }} title="Bring to Front" small disabled={!selectedElementId} />
                  <RibbonButton icon={<ArrowUp size={14} />} onClick={() => { if (selectedElementId) bringForward(activeSlideIndex, selectedElementId); }} title="Bring Forward" small disabled={!selectedElementId} />
                </div>
                <div className="flex items-center gap-0.5">
                  <RibbonButton icon={<ChevronsDown size={14} />} onClick={() => { if (selectedElementId) sendToBack(activeSlideIndex, selectedElementId); }} title="Send to Back" small disabled={!selectedElementId} />
                  <RibbonButton icon={<ArrowDown size={14} />} onClick={() => { if (selectedElementId) sendBackward(activeSlideIndex, selectedElementId); }} title="Send Backward" small disabled={!selectedElementId} />
                </div>
              </div>
              <div className="relative">
                <RibbonButton icon={<AlignHorizontalDistributeCenter size={14} />} label="Align" onClick={() => setShowAlignMenu(!showAlignMenu)} small />
                {showAlignMenu && (
                  <div className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 160 }}>
                    {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as const).map(a => (
                      <button key={a} onClick={() => {
                        if (selectedElementIds.length >= 2) alignElements(activeSlideIndex, selectedElementIds, a);
                        setShowAlignMenu(false);
                      }}
                        className="w-full text-left px-3 py-1 text-xs hover:opacity-80"
                        style={{ color: 'var(--card-foreground)' }}>
                        Align {a.charAt(0).toUpperCase() + a.slice(1)}
                      </button>
                    ))}
                    <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                    <button onClick={() => {
                      if (selectedElementIds.length >= 3) distributeElements(activeSlideIndex, selectedElementIds, 'horizontal');
                      setShowAlignMenu(false);
                    }}
                      className="w-full text-left px-3 py-1 text-xs hover:opacity-80"
                      style={{ color: 'var(--card-foreground)' }}>
                      Distribute Horizontally
                    </button>
                    <button onClick={() => {
                      if (selectedElementIds.length >= 3) distributeElements(activeSlideIndex, selectedElementIds, 'vertical');
                      setShowAlignMenu(false);
                    }}
                      className="w-full text-left px-3 py-1 text-xs hover:opacity-80"
                      style={{ color: 'var(--card-foreground)' }}>
                      Distribute Vertically
                    </button>
                    <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                    <button onClick={() => {
                      if (selectedElementIds.length >= 2) groupElements(activeSlideIndex, selectedElementIds);
                      setShowAlignMenu(false);
                    }}
                      className="w-full text-left px-3 py-1 text-xs hover:opacity-80"
                      style={{ color: 'var(--card-foreground)' }}>
                      Group
                    </button>
                    <button onClick={() => {
                      const el = slide?.elements.find(e => e.id === selectedElementId);
                      if (el?.groupId) ungroupElements(activeSlideIndex, el.groupId);
                      setShowAlignMenu(false);
                    }}
                      className="w-full text-left px-3 py-1 text-xs hover:opacity-80"
                      style={{ color: 'var(--card-foreground)' }}>
                      Ungroup
                    </button>
                  </div>
                )}
              </div>
            </RibbonGroup>
          </div>
        );

      case 'insert':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Slides">
              <div className="relative">
                <RibbonButton icon={<Plus size={16} />} label="New Slide" onClick={() => setShowLayoutMenu(!showLayoutMenu)} />
                {showLayoutMenu && (
                  <div className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 180 }}>
                    {LAYOUT_OPTIONS.map((opt) => (
                      <button key={opt.value}
                        onClick={() => { pushUndo(); addSlide(opt.value, activeSlideIndex); setShowLayoutMenu(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:opacity-80"
                        style={{ color: 'var(--card-foreground)' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Text">
              <RibbonButton icon={<Type size={18} />} label="Text Box" onClick={handleAddText} />
              <RibbonButton icon={<Sparkles size={16} />} label="WordArt" onClick={() => setShowTextEffectsPanel(true)} small />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Media">
              <RibbonButton icon={<Image size={18} />} label="Picture" onClick={() => fileInputRef.current?.click()} />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
              <RibbonButton icon={<Paintbrush2 size={16} />} label="Image Edit" onClick={() => setShowImageEditor(!showImageEditor)} active={showImageEditor} small />
              <RibbonButton icon={<Video size={16} />} label="Video" onClick={() => setShowMediaPanel(true)} small />
              <RibbonButton icon={<Music size={16} />} label="Audio" onClick={() => setShowMediaPanel(true)} small />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Shapes">
              <RibbonButton icon={<Square size={16} />} onClick={() => handleAddShape('rect')} title="Rectangle" small />
              <RibbonButton icon={<Circle size={16} />} onClick={() => handleAddShape('circle')} title="Circle" small />
              <RibbonButton icon={<Triangle size={16} />} onClick={() => handleAddShape('triangle')} title="Triangle" small />
              <RibbonButton icon={<ArrowRight size={16} />} onClick={() => handleAddShape('arrow')} title="Arrow Right" small />
              <RibbonButton icon={<Star size={16} />} onClick={() => handleAddShape('star')} title="Star" small />
              <RibbonButton icon={<Hexagon size={16} />} onClick={() => handleAddShape('hexagon')} title="Hexagon" small />
              <RibbonButton icon={<Heart size={16} />} onClick={() => handleAddShape('heart')} title="Heart" small />
              <RibbonButton icon={<PenTool size={16} />} onClick={() => setShowShapeDrawingTools(!showShapeDrawingTools)} title="Shape Tools" active={showShapeDrawingTools} small />
              <div className="relative">
                <RibbonButton icon={<Shapes size={14} />} onClick={() => setShowAllShapes(!showAllShapes)} title="All Shapes" small />
                {showAllShapes && (
                  <div className="absolute left-0 top-full mt-1 rounded shadow-xl z-50 border p-2"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 240 }}>
                    <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--card-foreground)' }}>All Shapes</div>
                    <div className="grid grid-cols-4 gap-1 max-h-60 overflow-y-auto">
                      {SHAPE_TOOL_DEFINITIONS.map(s => (
                        <button key={s.id}
                          onClick={() => { handleAddShape(s.id); setShowAllShapes(false); }}
                          className="text-[9px] px-1.5 py-1 rounded hover:opacity-80 border"
                          style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                          title={s.label}>
                          {s.label.substring(0, 8)}
                        </button>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--border)' }}>
                      <button onClick={() => { setShowAllShapes(false); setShowAdvShapes(true); }}
                        className="text-[10px] hover:opacity-80" style={{ color: 'var(--primary)' }}>
                        Advanced Shapes Library...
                      </button>
                    </div>
                  </div>
                )}
                {showAdvShapes && (
                  <div className="absolute left-0 top-full mt-1 z-50">
                    <ShapePicker onSelectShape={handleAddAdvancedShape} onClose={() => setShowAdvShapes(false)} />
                  </div>
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Icons">
              <div className="relative">
                <RibbonButton icon={<Smile size={18} />} label="Icons" onClick={() => setShowAdvIcons(!showAdvIcons)} />
                {showAdvIcons && (
                  <div className="absolute left-0 top-full mt-1 z-50">
                    <IconPicker onSelectIcon={handleAddIcon} onClose={() => setShowAdvIcons(false)} />
                  </div>
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Tables">
              <RibbonButton icon={<Table size={18} />} label="Table" onClick={handleAddTable} />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Charts">
              <RibbonButton icon={<BarChart3 size={16} />} label="Bar" onClick={() => handleAddChart('bar')} small />
              <RibbonButton icon={<SlidersHorizontal size={16} />} label="Line" onClick={() => handleAddChart('line')} small />
              <RibbonButton icon={<PanelTop size={16} />} label="Pie" onClick={() => handleAddChart('pie')} small />
              <div className="relative">
                <RibbonButton icon={<ChevronDown size={14} />} onClick={() => setShowAdvCharts(!showAdvCharts)} title="More Charts" small />
                {showAdvCharts && (
                  <div className="absolute right-0 top-full mt-1 rounded shadow-xl z-50 border p-2 max-h-80 overflow-y-auto"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 260 }}>
                    <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--card-foreground)' }}>Advanced Charts</div>
                    {Object.entries(CHART_CATEGORIES).map(([key, category]) => (
                      <div key={key}>
                        <div className="text-[9px] font-semibold mt-1.5 mb-0.5 opacity-60">{category.label}</div>
                        <div className="grid grid-cols-2 gap-0.5">
                          {category.types.map(ct => (
                            <button key={ct.type}
                              onClick={() => handleAddAdvancedChart(ct.type, ct.label)}
                              className="text-left text-[10px] px-2 py-1 rounded hover:opacity-80"
                              style={{ color: 'var(--card-foreground)' }}>
                              {ct.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Illustrations">
              <RibbonButton icon={<Lightbulb size={18} />} label="SmartArt" onClick={() => setShowSmartArtModal(true)} />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Zoom">
              <RibbonButton
                icon={<ZoomIn size={18} />}
                label="Slide Zoom"
                onClick={() => setShowSlideZoom(true)}
                title="Insert a slide zoom for interactive navigation"
              />
            </RibbonGroup>
          </div>
        );

      case 'design':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Themes">
              <div className="flex items-center gap-1">
                {PRESENTATION_THEMES.map((theme) => (
                  <button key={theme.name} onClick={() => { pushUndo(); applyTheme(theme); }}
                    className="rounded overflow-hidden border transition-all hover:scale-110"
                    style={{
                      borderColor: currentTheme === theme.name ? 'var(--primary)' : 'var(--border)',
                      borderWidth: currentTheme === theme.name ? 2 : 1,
                      width: 40, height: 28,
                    }}
                    title={theme.name}>
                    <div className="w-full h-full flex items-center justify-center" style={{ background: theme.background }}>
                      <span style={{ color: theme.titleColor, fontSize: 7, fontWeight: 'bold' }}>Aa</span>
                    </div>
                  </button>
                ))}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Background">
              <div className="relative">
                <RibbonButton icon={<Palette size={18} />} label="Background" onClick={() => setShowBgPicker(!showBgPicker)} />
                {showBgPicker && (
                  <div className="absolute left-0 top-full mt-1 p-3 rounded shadow-xl z-50 border"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 220 }}>
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Gradients</div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {GRADIENT_PRESETS.map((g, i) => (
                        <button key={i} onClick={() => { pushUndo(); updateSlideBackground(activeSlideIndex, g); setShowBgPicker(false); }}
                          className="w-10 h-10 rounded border" style={{ background: g, borderColor: 'var(--border)' }} />
                      ))}
                    </div>
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Solid Colors</div>
                    <div className="grid grid-cols-4 gap-2">
                      {SOLID_COLORS.map((c, i) => (
                        <button key={i} onClick={() => { pushUndo(); updateSlideBackground(activeSlideIndex, c); setShowBgPicker(false); }}
                          className="w-10 h-10 rounded border" style={{ background: c, borderColor: 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Master">
              <RibbonButton icon={<Layers size={16} />} label="Slide Master" onClick={() => setShowSlideMaster(true)} />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Design">
              <RibbonButton icon={<Wand2 size={16} />} label="Suggestions" onClick={() => setShowDesignPanel(!showDesignPanel)} active={showDesignPanel} />
              <RibbonButton icon={<Paintbrush size={16} />} label="Theme Editor" onClick={() => setShowThemeDesigner(!showThemeDesigner)} active={showThemeDesigner} />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Customize">
              <RibbonButton icon={<LayoutTemplate size={16} />} label="Templates" onClick={() => setShowTemplateModal(true)} />
              {onPageSetup && (
                <RibbonButton icon={<Settings2 size={16} />} label="Page Setup" onClick={onPageSetup} />
              )}
            </RibbonGroup>

            {/* Shape formatting when shape is selected */}
            {selectedElement && (selectedElement.type === 'shape' || selectedElement.type === 'text') && (
              <>
                <RibbonDivider />
                <RibbonGroup label="Format">
                  <div className="relative">
                    <RibbonButton icon={<Paintbrush size={16} />} label="Fill" onClick={() => setShowShapeColor(!showShapeColor)} />
                    {showShapeColor && (
                      <div className="absolute left-0 top-full mt-1 p-2 rounded shadow-xl z-50 border"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="grid grid-cols-6 gap-1.5">
                          {SHAPE_COLORS.map((c) => (
                            <button key={c} onClick={() => {
                              pushUndo();
                              updateElement(activeSlideIndex, selectedElement.id, { style: { backgroundColor: c } });
                              setShowShapeColor(false);
                            }}
                              className="w-6 h-6 rounded border" style={{ background: c, borderColor: 'var(--border)' }} />
                          ))}
                        </div>
                        <div className="mt-2 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                          <div className="text-[9px] mb-1 opacity-60">Effects</div>
                          <div className="flex gap-1">
                            <button onClick={() => {
                              pushUndo();
                              updateElement(activeSlideIndex, selectedElement.id, { style: { shadow: !selectedElement.style.shadow } });
                            }}
                              className="px-2 py-0.5 rounded text-[9px] border"
                              style={{ borderColor: selectedElement.style.shadow ? 'var(--primary)' : 'var(--border)', color: 'var(--card-foreground)' }}>
                              Shadow
                            </button>
                            <button onClick={() => {
                              pushUndo();
                              updateElement(activeSlideIndex, selectedElement.id, { style: { reflection: !selectedElement.style.reflection } });
                            }}
                              className="px-2 py-0.5 rounded text-[9px] border"
                              style={{ borderColor: selectedElement.style.reflection ? 'var(--primary)' : 'var(--border)', color: 'var(--card-foreground)' }}>
                              Reflect
                            </button>
                            <button onClick={() => {
                              pushUndo();
                              updateElement(activeSlideIndex, selectedElement.id, { style: { glow: !selectedElement.style.glow, glowColor: '#3b82f6' } });
                            }}
                              className="px-2 py-0.5 rounded text-[9px] border"
                              style={{ borderColor: selectedElement.style.glow ? 'var(--primary)' : 'var(--border)', color: 'var(--card-foreground)' }}>
                              Glow
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </RibbonGroup>
              </>
            )}
          </div>
        );

      case 'transitions':
        return (
          <div className="flex items-end gap-0.5 overflow-x-auto">
            {/* Preview group */}
            <RibbonGroup label="Preview">
              <RibbonButton
                icon={<Play size={18} />}
                label="Preview"
                onClick={() => { setPresenterMode(true); }}
                title="Preview transition on current slide"
              />
            </RibbonGroup>
            <RibbonDivider />

            {/* Transition to This Slide group */}
            <RibbonGroup label="Transition to This Slide">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5 flex-wrap max-w-[420px]">
                  {[
                    { value: 'none' as SlideTransitionType, label: 'None', icon: '⬜' },
                    { value: 'cut' as SlideTransitionType, label: 'Cut', icon: '✂' },
                    { value: 'fade' as SlideTransitionType, label: 'Fade', icon: '🌫' },
                    { value: 'push' as SlideTransitionType, label: 'Push', icon: '▶' },
                    { value: 'wipe' as SlideTransitionType, label: 'Wipe', icon: '⬛' },
                    { value: 'split' as SlideTransitionType, label: 'Split', icon: '↔' },
                    { value: 'reveal' as SlideTransitionType, label: 'Reveal', icon: '👁' },
                    { value: 'dissolve' as SlideTransitionType, label: 'Dissolve', icon: '✦' },
                    { value: 'cover' as SlideTransitionType, label: 'Cover', icon: '▩' },
                    { value: 'uncover' as SlideTransitionType, label: 'Uncover', icon: '▨' },
                    { value: 'zoom' as SlideTransitionType, label: 'Zoom', icon: '🔍' },
                    { value: 'morph' as SlideTransitionType, label: 'Morph', icon: '🔄' },
                    { value: 'random' as SlideTransitionType, label: 'Random', icon: '🎲' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { pushUndo(); updateSlideTransition(activeSlideIndex, t.value); }}
                      className="flex flex-col items-center justify-center rounded border transition-all hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: (slide?.transition || 'none') === t.value ? 'var(--primary)' : 'var(--border)',
                        background: (slide?.transition || 'none') === t.value ? 'var(--accent)' : 'var(--card)',
                        color: (slide?.transition || 'none') === t.value ? 'var(--primary)' : 'var(--card-foreground)',
                        width: 44, height: 36, fontSize: 9,
                      }}
                      title={t.label}
                    >
                      <span style={{ fontSize: 14, lineHeight: 1 }}>{t.icon}</span>
                      <span style={{ fontSize: 8, marginTop: 1 }}>{t.label}</span>
                    </button>
                  ))}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setShowTransitionPanel(!showTransitionPanel)}
                      className="flex flex-col items-center justify-center rounded border hover:opacity-80"
                      style={{ borderColor: 'var(--border)', background: showTransitionPanel ? 'var(--accent)' : 'var(--card)', width: 44, height: 36 }}
                      title="More transitions"
                    >
                      <ChevronDown size={12} style={{ color: 'var(--card-foreground)' }} />
                      <span style={{ fontSize: 8, color: 'var(--card-foreground)' }}>More</span>
                    </button>
                  </div>
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Effect Options group */}
            <RibbonGroup label="Effect Options">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-12">Direction</span>
                  <select
                    className="text-[10px] px-1 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Transition direction:', e.target.value)}
                    defaultValue="from-left"
                  >
                    <option value="from-left">From Left</option>
                    <option value="from-right">From Right</option>
                    <option value="from-top">From Top</option>
                    <option value="from-bottom">From Bottom</option>
                    <option value="from-top-left">From Top-Left</option>
                    <option value="from-top-right">From Top-Right</option>
                    <option value="from-bottom-left">From Bottom-Left</option>
                    <option value="from-bottom-right">From Bottom-Right</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-12">Variant</span>
                  <select
                    className="text-[10px] px-1 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Transition variant:', e.target.value)}
                    defaultValue="smooth"
                  >
                    <option value="smooth">Smooth</option>
                    <option value="glitter">Glitter</option>
                    <option value="honeycomb">Honeycomb</option>
                    <option value="checkerboard">Checkerboard</option>
                    <option value="stripes">Stripes</option>
                    <option value="diamonds">Diamonds</option>
                  </select>
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Timing group */}
            <RibbonGroup label="Timing">
              <div className="flex flex-col gap-1 min-w-[200px]">
                <div className="flex items-center gap-1">
                  <Volume2 size={10} style={{ opacity: 0.6 }} />
                  <select
                    className="text-[10px] px-1 py-0.5 rounded border flex-1"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Transition sound:', e.target.value)}
                    defaultValue="no-sound"
                  >
                    <option value="no-sound">No Sound</option>
                    <option value="applause">Applause</option>
                    <option value="chime">Chime</option>
                    <option value="camera">Camera</option>
                    <option value="cash-register">Cash Register</option>
                    <option value="click">Click</option>
                    <option value="drum-roll">Drum Roll</option>
                    <option value="explosion">Explosion</option>
                    <option value="laser">Laser</option>
                    <option value="type">Typewriter</option>
                    <option value="wind">Wind</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} style={{ opacity: 0.6 }} />
                  <span className="text-[9px] opacity-60">Duration</span>
                  <button
                    onClick={() => updateSlideTransitionDuration(activeSlideIndex, Math.max(0.5, (slide?.transitionDuration ?? 0.6) - 0.25))}
                    className="w-4 h-4 rounded border flex items-center justify-center hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                  >
                    <Minus size={8} />
                  </button>
                  <span className="text-[10px] w-8 text-center" style={{ color: 'var(--card-foreground)' }}>
                    {(slide?.transitionDuration ?? 0.6).toFixed(2)}s
                  </span>
                  <button
                    onClick={() => updateSlideTransitionDuration(activeSlideIndex, Math.min(5, (slide?.transitionDuration ?? 0.6) + 0.25))}
                    className="w-4 h-4 rounded border flex items-center justify-center hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                  >
                    <Plus size={8} />
                  </button>
                </div>
                <button
                  onClick={() => applyTransitionToAll(slide?.transition || 'none', slide?.transitionDuration)}
                  className="text-[10px] px-2 py-0.5 rounded border hover:opacity-80 text-left"
                  style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)', background: 'var(--card)' }}
                >
                  Apply To All
                </button>
                <div className="flex flex-col gap-0.5">
                  <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-2.5 h-2.5"
                      checked={timing?.onClickAdvance ?? true}
                      onChange={(e) => updateSlideTransitionTiming(activeSlideIndex, { onClickAdvance: e.target.checked })}
                    />
                    <span style={{ color: 'var(--card-foreground)' }}>On Mouse Click</span>
                  </label>
                  <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-2.5 h-2.5"
                      checked={timing?.autoAdvance ?? false}
                      onChange={(e) => updateSlideTransitionTiming(activeSlideIndex, { autoAdvance: e.target.checked })}
                    />
                    <span style={{ color: 'var(--card-foreground)' }}>After</span>
                    <input
                      type="text"
                      className="w-10 px-0.5 rounded border text-[9px] text-center"
                      style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)' }}
                      value={`${timing?.autoAdvanceSeconds ?? 5}s`}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) updateSlideTransitionTiming(activeSlideIndex, { autoAdvanceSeconds: val });
                      }}
                      disabled={!(timing?.autoAdvance ?? false)}
                    />
                  </label>
                </div>
              </div>
            </RibbonGroup>
          </div>
        );

      case 'animations':
        return (
          <div className="flex items-end gap-0.5 overflow-x-auto">
            {/* Preview group */}
            <RibbonGroup label="Preview">
              <RibbonButton
                icon={<Play size={18} />}
                label="Preview"
                onClick={() => setShowAnimationsPanel(true)}
                title="Preview animations on current slide"
              />
              <RibbonButton
                icon={<Paintbrush size={14} />}
                label="Anim. Painter"
                onClick={() => alert('Animation Painter: Click another element to copy animation')}
                small
                title="Copy animation from one element and apply to another"
              />
            </RibbonGroup>
            <RibbonDivider />

            {/* Animation group - grid of effects */}
            <RibbonGroup label="Animation">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5 flex-wrap max-w-[380px]">
                  {/* Entrance animations */}
                  {[
                    { type: 'fadeIn' as const, label: 'Fade', category: 'entrance' as const, icon: '◌' },
                    { type: 'flyIn' as const, label: 'Fly In', category: 'entrance' as const, icon: '→' },
                    { type: 'zoom' as const, label: 'Zoom', category: 'entrance' as const, icon: '⊕' },
                    { type: 'bounce' as const, label: 'Bounce', category: 'entrance' as const, icon: '⤸' },
                    { type: 'spin' as const, label: 'Swivel', category: 'entrance' as const, icon: '↻' },
                    { type: 'pulse' as const, label: 'Pulse', category: 'emphasis' as const, icon: '◉' },
                    { type: 'fadeOut' as const, label: 'Fade Out', category: 'exit' as const, icon: '◎' },
                  ].map((anim) => (
                    <button
                      key={anim.type}
                      onClick={() => {
                        if (!selectedElement) return;
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          type: anim.type, category: anim.category, duration: 0.5, delay: 0, trigger: 'onClick', order: 1,
                        });
                      }}
                      disabled={!selectedElement}
                      className="flex flex-col items-center justify-center rounded border transition-all hover:scale-105"
                      style={{
                        borderColor: selectedElement?.animation?.type === anim.type ? 'var(--primary)' : 'var(--border)',
                        background: selectedElement?.animation?.type === anim.type ? 'var(--accent)' : 'var(--card)',
                        color: selectedElement?.animation?.type === anim.type ? 'var(--primary)' : 'var(--card-foreground)',
                        width: 44, height: 36, opacity: selectedElement ? 1 : 0.5,
                        borderWidth: selectedElement?.animation?.type === anim.type ? 2 : 1,
                      }}
                      title={`${anim.category.charAt(0).toUpperCase() + anim.category.slice(1)}: ${anim.label}`}
                    >
                      <span style={{ fontSize: 13, lineHeight: 1 }}>{anim.icon}</span>
                      <span style={{ fontSize: 8, marginTop: 1 }}>{anim.label}</span>
                    </button>
                  ))}
                  {/* More animations dropdown */}
                  <div className="relative">
                    <button
                      className="flex flex-col items-center justify-center rounded border hover:opacity-80"
                      style={{ borderColor: 'var(--border)', background: 'var(--card)', width: 44, height: 36 }}
                      onClick={() => setShowAnimationsPanel(!showAnimationsPanel)}
                      title="More animations"
                    >
                      <ChevronDown size={12} style={{ color: 'var(--card-foreground)' }} />
                      <span style={{ fontSize: 8, color: 'var(--card-foreground)' }}>More</span>
                    </button>
                  </div>
                  {/* Remove animation */}
                  {selectedElement?.animation && (
                    <button
                      onClick={() => { pushUndo(); store.updateElementAnimation(activeSlideIndex, selectedElement.id, undefined); }}
                      className="flex flex-col items-center justify-center rounded border hover:opacity-80"
                      style={{ borderColor: '#ef4444', background: 'var(--card)', color: '#ef4444', width: 44, height: 36, fontSize: 8 }}
                      title="Remove animation"
                    >
                      <Eraser size={12} />
                      <span style={{ fontSize: 8, marginTop: 1 }}>Remove</span>
                    </button>
                  )}
                </div>
                {!selectedElement && (
                  <span className="text-[9px] opacity-50 px-1">Select an element to animate</span>
                )}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Effect Options group */}
            <RibbonGroup label="Effect Options">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-14">Direction</span>
                  <select
                    className="text-[10px] px-1 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Animation direction:', e.target.value)}
                    defaultValue="from-bottom"
                    disabled={!selectedElement}
                  >
                    <option value="from-bottom">From Bottom</option>
                    <option value="from-top">From Top</option>
                    <option value="from-left">From Left</option>
                    <option value="from-right">From Right</option>
                    <option value="from-top-left">From Top-Left</option>
                    <option value="from-top-right">From Top-Right</option>
                    <option value="from-bottom-left">From Bottom-Left</option>
                    <option value="from-bottom-right">From Bottom-Right</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-14">Sequence</span>
                  <select
                    className="text-[10px] px-1 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Animation sequence:', e.target.value)}
                    defaultValue="together"
                    disabled={!selectedElement}
                  >
                    <option value="together">As One Object</option>
                    <option value="one-by-one">By 1st Level Paragraph</option>
                    <option value="all-at-once">All at Once</option>
                  </select>
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Advanced Animation group */}
            <RibbonGroup label="Advanced Animation">
              <div className="flex flex-col gap-0.5">
                <RibbonButton
                  icon={<Plus size={14} />}
                  label="Add Animation"
                  onClick={() => setShowAnimationsPanel(true)}
                  small
                  disabled={!selectedElement}
                  title="Add another animation effect to this element"
                />
                <RibbonButton
                  icon={<ListOrdered size={14} />}
                  label="Anim. Pane"
                  onClick={() => setShowAnimationTimeline(!showAnimationTimeline)}
                  active={showAnimationTimeline}
                  small
                  title="Open Animation Pane"
                />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] opacity-60">Trigger</span>
                  <select
                    className="text-[9px] px-1 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => {
                      if (selectedElement?.animation) {
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          ...selectedElement.animation,
                          trigger: e.target.value as 'onClick' | 'withPrevious' | 'afterPrevious',
                        });
                      }
                    }}
                    value={selectedElement?.animation?.trigger || 'onClick'}
                    disabled={!selectedElement?.animation}
                  >
                    <option value="onClick">On Click</option>
                    <option value="withPrevious">With Previous</option>
                    <option value="afterPrevious">After Previous</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 ml-1">
                <RibbonButton
                  icon={<ArrowUp size={12} />}
                  label="Move Earlier"
                  onClick={() => console.log('Move animation earlier')}
                  small
                  disabled={!selectedElement?.animation}
                  title="Move animation earlier in sequence"
                />
                <RibbonButton
                  icon={<ArrowDown size={12} />}
                  label="Move Later"
                  onClick={() => console.log('Move animation later')}
                  small
                  disabled={!selectedElement?.animation}
                  title="Move animation later in sequence"
                />
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Timing group */}
            <RibbonGroup label="Timing">
              <div className="flex flex-col gap-1 min-w-[150px]">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-10">Start</span>
                  <select
                    className="text-[9px] px-1 py-0.5 rounded border flex-1"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => {
                      if (selectedElement?.animation) {
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          ...selectedElement.animation,
                          trigger: e.target.value as 'onClick' | 'withPrevious' | 'afterPrevious',
                        });
                      }
                    }}
                    value={selectedElement?.animation?.trigger || 'onClick'}
                    disabled={!selectedElement?.animation}
                  >
                    <option value="onClick">On Click</option>
                    <option value="withPrevious">With Previous</option>
                    <option value="afterPrevious">After Previous</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-10">Duration</span>
                  <button
                    onClick={() => {
                      if (selectedElement?.animation) {
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          ...selectedElement.animation,
                          duration: Math.max(0.1, (selectedElement.animation.duration ?? 0.5) - 0.25),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border flex items-center justify-center hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                    disabled={!selectedElement?.animation}
                  >
                    <Minus size={8} />
                  </button>
                  <span className="text-[9px] w-8 text-center" style={{ color: 'var(--card-foreground)' }}>
                    {(selectedElement?.animation?.duration ?? 0.5).toFixed(2)}s
                  </span>
                  <button
                    onClick={() => {
                      if (selectedElement?.animation) {
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          ...selectedElement.animation,
                          duration: Math.min(10, (selectedElement.animation.duration ?? 0.5) + 0.25),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border flex items-center justify-center hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                    disabled={!selectedElement?.animation}
                  >
                    <Plus size={8} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-60 w-10">Delay</span>
                  <button
                    onClick={() => {
                      if (selectedElement?.animation) {
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          ...selectedElement.animation,
                          delay: Math.max(0, (selectedElement.animation.delay ?? 0) - 0.25),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border flex items-center justify-center hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                    disabled={!selectedElement?.animation}
                  >
                    <Minus size={8} />
                  </button>
                  <span className="text-[9px] w-8 text-center" style={{ color: 'var(--card-foreground)' }}>
                    {(selectedElement?.animation?.delay ?? 0).toFixed(2)}s
                  </span>
                  <button
                    onClick={() => {
                      if (selectedElement?.animation) {
                        pushUndo();
                        store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                          ...selectedElement.animation,
                          delay: Math.min(10, (selectedElement.animation.delay ?? 0) + 0.25),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border flex items-center justify-center hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
                    disabled={!selectedElement?.animation}
                  >
                    <Plus size={8} />
                  </button>
                </div>
              </div>
            </RibbonGroup>
          </div>
        );

      case 'slideshow':
        return (
          <div className="flex items-end gap-0.5 overflow-x-auto">
            {/* Start Slide Show group */}
            <RibbonGroup label="Start Slide Show">
              <div className="flex items-center gap-0.5">
                {/* Large "From Beginning" button */}
                <button
                  onClick={() => { store.setActiveSlide(0); setPresenterMode(true); }}
                  className="flex flex-col items-center justify-center rounded px-2 py-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--topbar-foreground)', minWidth: 52, minHeight: 52 }}
                  title="Start from the very beginning (F5)"
                >
                  <PlayCircle size={22} />
                  <span className="text-[9px] mt-0.5 text-center leading-tight whitespace-nowrap">From<br />Beginning</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <RibbonButton
                    icon={<SkipForward size={14} />}
                    label="From Current"
                    onClick={() => setPresenterMode(true)}
                    small
                    title="Start from current slide (Shift+F5)"
                  />
                  <div className="relative">
                    <button
                      className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] hover:opacity-80"
                      style={{ color: 'var(--topbar-foreground)' }}
                      onClick={() => alert('Custom Slide Show: Create a custom presentation with a subset of slides')}
                      title="Custom Slide Show"
                    >
                      <LayoutList size={12} />
                      <span>Custom Show</span>
                      <ChevronDown size={9} />
                    </button>
                  </div>
                  <RibbonButton
                    icon={<Globe size={12} />}
                    label="Present Online"
                    onClick={() => alert('Present Online: Share your presentation via a web link')}
                    small
                    title="Present this slide show online"
                  />
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Set Up group */}
            <RibbonGroup label="Set Up">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <RibbonButton
                    icon={<Settings2 size={14} />}
                    label="Set Up Show"
                    onClick={() => alert('Set Up Slide Show: Configure slide show settings, loop, narration, etc.')}
                    small
                    title="Set up the slide show options"
                  />
                  <RibbonButton
                    icon={<EyeOff size={14} />}
                    label="Hide Slide"
                    onClick={() => console.log('Hide slide', activeSlideIndex)}
                    small
                    title="Hide this slide from the slide show"
                  />
                </div>
                <div className="flex items-center gap-0.5">
                  <RibbonButton
                    icon={<Timer size={14} />}
                    label="Rehearse"
                    onClick={() => alert('Rehearse Timings: Run through your presentation and record timing for each slide')}
                    small
                    title="Rehearse slide show timings"
                  />
                  <div className="relative flex items-center">
                    <RibbonButton
                      icon={<Camera size={14} />}
                      label="Record"
                      onClick={() => setShowRecordNarration(true)}
                      small
                      title="Record narration for slides"
                    />
                    <button
                      onClick={() => setShowRecordNarration(true)}
                      className="p-0.5 rounded hover:opacity-80"
                      style={{ color: 'var(--topbar-foreground)' }}
                      title="Record narration"
                    >
                      <ChevronDown size={9} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-2.5 h-2.5"
                      defaultChecked={true}
                      onChange={(e) => console.log('Play narrations:', e.target.checked)}
                    />
                    <span style={{ color: 'var(--card-foreground)' }}>Play Narrations</span>
                  </label>
                  <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-2.5 h-2.5"
                      defaultChecked={false}
                      onChange={(e) => console.log('Use timings:', e.target.checked)}
                    />
                    <span style={{ color: 'var(--card-foreground)' }}>Use Timings</span>
                  </label>
                  <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-2.5 h-2.5"
                      defaultChecked={true}
                      onChange={(e) => console.log('Show media controls:', e.target.checked)}
                    />
                    <span style={{ color: 'var(--card-foreground)' }}>Show Media Controls</span>
                  </label>
                </div>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Monitors group */}
            <RibbonGroup label="Monitors">
              <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="flex items-center gap-1">
                  <Monitor size={10} style={{ opacity: 0.6 }} />
                  <select
                    className="text-[9px] px-1 py-0.5 rounded border flex-1"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Monitor:', e.target.value)}
                    defaultValue="automatic"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="primary">Primary Monitor</option>
                    <option value="secondary">Secondary Monitor</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Tv size={10} style={{ opacity: 0.6 }} />
                  <select
                    className="text-[9px] px-1 py-0.5 rounded border flex-1"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 9 }}
                    onChange={(e) => console.log('Resolution:', e.target.value)}
                    defaultValue="auto"
                  >
                    <option value="auto">Use Current Resolution</option>
                    <option value="1024x768">1024×768</option>
                    <option value="1280x720">1280×720 (720p)</option>
                    <option value="1920x1080">1920×1080 (1080p)</option>
                  </select>
                </div>
                <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-2.5 h-2.5"
                    defaultChecked={false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPresenterViewMode(true);
                      }
                    }}
                  />
                  <span style={{ color: 'var(--card-foreground)' }}>Use Presenter View</span>
                </label>
                <RibbonButton
                  icon={<Rows3 size={12} />}
                  label="Presenter View"
                  onClick={() => { setPresenterViewMode(true); store.setActiveSlide(0); setPresenterMode(true); }}
                  small
                  title="Open Presenter View with speaker notes and slide preview"
                />
              </div>
            </RibbonGroup>
          </div>
        );

      case 'review':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="AI Assistant">
              <RibbonButton icon={<MessageSquare size={18} />} label="AI Panel" onClick={() => setShowAIPanel(!showAIPanel)} active={showAIPanel} />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Proofing">
              <RibbonButton icon={<Eye size={18} />} label="Preview" onClick={() => setPresenterMode(true)} />
            </RibbonGroup>
          </div>
        );

      case 'view':
        return (
          <div className="flex items-end gap-0.5 overflow-x-auto">
            <RibbonGroup label="Presentation Views">
              <RibbonButton icon={<Rows3 size={16} />} label="Normal" active={!showSlideSorter} onClick={() => setShowSlideSorter(false)} />
              <RibbonButton icon={<Grid size={16} />} label="Sorter" active={showSlideSorter} onClick={() => setShowSlideSorter(!showSlideSorter)} />
              <RibbonButton icon={<Layers size={16} />} label="Slide Master" onClick={() => setShowSlideMaster(true)} small title="Open Slide Master editor" />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Show">
              <RibbonButton icon={<Ruler size={14} />} label="Ruler" onClick={() => setShowRuler(!showRuler)} active={showRuler} small />
              <RibbonButton icon={<BoxSelect size={14} />} label="Grid" onClick={() => setShowGrid(!showGrid)} active={showGrid} small />
              <RibbonButton icon={<Columns3 size={14} />} label="Guides" onClick={() => setShowGuides(!showGuides)} active={showGuides} small />
              <RibbonButton icon={<Maximize size={14} />} label="Snap Grid" onClick={() => setSnapToGrid(!snapToGrid)} active={snapToGrid} small />
              <RibbonButton icon={<BoxSelect size={14} />} label="Snap Obj" onClick={() => setSnapToObjects(!snapToObjects)} active={snapToObjects} small />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Zoom">
              <div className="flex items-center gap-1">
                <button onClick={() => store.setCanvasZoom(Math.max(25, store.canvasZoom - 10))}
                  className="p-1 rounded hover:opacity-80" style={{ color: 'var(--topbar-foreground)' }}>
                  <Minus size={14} />
                </button>
                <span className="text-[10px] w-8 text-center" style={{ color: 'var(--topbar-foreground)' }}>{store.canvasZoom}%</span>
                <button onClick={() => store.setCanvasZoom(Math.min(200, store.canvasZoom + 10))}
                  className="p-1 rounded hover:opacity-80" style={{ color: 'var(--topbar-foreground)' }}>
                  <Plus size={14} />
                </button>
                <button onClick={() => store.setCanvasZoom(100)}
                  className="text-[10px] px-1.5 py-0.5 rounded border hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--topbar-foreground)' }}>
                  100%
                </button>
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Help">
              <RibbonButton
                icon={<Keyboard size={16} />}
                label="Shortcuts"
                onClick={() => setShowKeyboardShortcuts(true)}
                title="Show keyboard shortcuts (?)"
                small
              />
            </RibbonGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="no-print flex flex-col border-b" style={{ borderColor: 'var(--border)', background: 'var(--topbar)', color: 'var(--topbar-foreground)' }}>
      <div className="flex items-center px-2 py-0.5 gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={undo} disabled={undoStack.length === 0}
          className="p-1 rounded hover:opacity-80" style={{ color: 'var(--topbar-foreground)', opacity: undoStack.length === 0 ? 0.3 : 1 }} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </button>
        <button onClick={redo} disabled={redoStack.length === 0}
          className="p-1 rounded hover:opacity-80" style={{ color: 'var(--topbar-foreground)', opacity: redoStack.length === 0 ? 0.3 : 1 }} title="Redo (Ctrl+Y)">
          <Redo2 size={14} />
        </button>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />

        <div className="flex items-center gap-0.5">
          {RIBBON_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveRibbonTab(tab.id)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all"
              style={{
                color: activeRibbonTab === tab.id ? 'var(--primary)' : 'var(--topbar-foreground)',
                borderBottom: activeRibbonTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                opacity: activeRibbonTab === tab.id ? 1 : 0.7,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <button onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:opacity-80"
            style={{ color: 'var(--topbar-foreground)' }} title="Export">
            <Download size={14} />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 180 }}>
              <button onClick={() => { handleExportPDF(); setShowExportMenu(false); }}
                className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:opacity-80"
                style={{ color: 'var(--card-foreground)' }}>
                <FileText size={14} /> Export to PDF
              </button>
              <button onClick={() => { handleExportPPTX(); setShowExportMenu(false); }}
                className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:opacity-80"
                style={{ color: 'var(--card-foreground)' }}>
                <File size={14} /> Export to PPTX
              </button>
              <button onClick={() => { setShowExportPanel(true); setShowExportMenu(false); }}
                className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:opacity-80"
                style={{ color: 'var(--card-foreground)' }}>
                <Image size={14} /> Export as Images
              </button>
            </div>
          )}
        </div>

        <button onClick={() => window.print()} className="p-1 rounded hover:opacity-80"
          style={{ color: 'var(--topbar-foreground)' }} title="Print">
          <Printer size={14} />
        </button>

        <button onClick={() => setPresenterMode(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium hover:opacity-80 ml-1"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} title="Present (F5)">
          <Play size={14} />
          <span className="hidden sm:inline">Present</span>
        </button>
      </div>

      <div className="px-2 py-1 min-h-[68px] overflow-x-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
