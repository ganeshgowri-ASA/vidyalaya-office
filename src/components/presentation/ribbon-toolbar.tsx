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
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'split', label: 'Split' },
  { value: 'push', label: 'Push' },
  { value: 'cover', label: 'Cover' },
  { value: 'dissolve', label: 'Dissolve' },
];

const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 96];
const FONT_FAMILIES = ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Trebuchet MS', 'Impact', 'Comic Sans MS'];
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
    slides, activeSlideIndex, selectedElementId,
    updateSlideBackground, addElement, updateElement, removeElement,
    setPresenterMode, setShowTemplateModal, setShowAIPanel, showAIPanel,
    updateSlideTransition, showAnimationsPanel, setShowAnimationsPanel,
    setShowSmartArtModal, showGrid, setShowGrid, showRuler, setShowRuler,
    showGuides, setShowGuides, snapToGrid, setSnapToGrid,
    applyTheme, currentTheme, updateSlideTransitionTiming,
    activeRibbonTab, setActiveRibbonTab, setShowSlideSorter, showSlideSorter,
    undo, redo, undoStack, redoStack, pushUndo,
    copyElement, pasteElement, clipboardElement,
    addSlide, duplicateSlide,
    bringForward, sendBackward,
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
    addElement(activeSlideIndex, {
      type: 'shape', x: 300, y: 200, width: 120, height: 120,
      content: shape,
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: shape === 'circle' ? '50%' : shape === 'callout' ? '8px' : '0',
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
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '0',
      },
    });
    setShowAdvShapes(false);
  };

  const handleAddIcon = (icon: IconDefinition) => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'shape', x: 350, y: 200, width: 80, height: 80,
      content: `icon:${icon.id}`,
      style: {
        backgroundColor: 'transparent',
        color: '#3b82f6',
      },
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

  // Render the correct ribbon content based on active tab
  const renderTabContent = () => {
    switch (activeRibbonTab) {
      case 'home':
        return (
          <div className="flex items-end gap-0.5">
            {/* Clipboard group */}
            <RibbonGroup label="Clipboard">
              <RibbonButton icon={<Clipboard size={16} />} label="Paste" onClick={pasteElement} disabled={!clipboardElement} small />
              <div className="flex flex-col gap-0.5">
                <RibbonButton icon={<Scissors size={14} />} onClick={() => { if (selectedElementId) { copyElement(); handleDeleteElement(); } }} title="Cut" small />
                <RibbonButton icon={<Copy size={14} />} onClick={copyElement} title="Copy" small disabled={!selectedElementId} />
              </div>
            </RibbonGroup>
            <RibbonDivider />

            {/* Slides group */}
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

            {/* Font group */}
            <RibbonGroup label="Font">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  {/* Font family dropdown */}
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
                  {/* Font size dropdown */}
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
                    style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.fontWeight === 'bold' ? 1 : 0.5 }} title="Bold (Ctrl+B)">
                    <Bold size={14} />
                  </button>
                  <button onClick={toggleItalic} className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.fontStyle === 'italic' ? 1 : 0.5 }} title="Italic (Ctrl+I)">
                    <Italic size={14} />
                  </button>
                  <button onClick={toggleUnderline} className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--topbar-foreground)', opacity: selectedElement?.style.textDecoration === 'underline' ? 1 : 0.5 }} title="Underline (Ctrl+U)">
                    <Underline size={14} />
                  </button>
                  {/* Text color */}
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

            {/* Paragraph group */}
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

            {/* Arrange group */}
            <RibbonGroup label="Arrange">
              <div className="flex flex-col gap-0.5">
                <RibbonButton icon={<ArrowUp size={14} />} onClick={() => { if (selectedElementId) bringForward(activeSlideIndex, selectedElementId); }} title="Bring Forward" small disabled={!selectedElementId} />
                <RibbonButton icon={<ArrowDown size={14} />} onClick={() => { if (selectedElementId) sendBackward(activeSlideIndex, selectedElementId); }} title="Send Backward" small disabled={!selectedElementId} />
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
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Images">
              <RibbonButton icon={<Image size={18} />} label="Picture" onClick={() => fileInputRef.current?.click()} />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Shapes">
              <RibbonButton icon={<Square size={16} />} onClick={() => handleAddShape('rect')} title="Rectangle" small />
              <RibbonButton icon={<Circle size={16} />} onClick={() => handleAddShape('circle')} title="Circle" small />
              <RibbonButton icon={<Triangle size={16} />} onClick={() => handleAddShape('triangle')} title="Triangle" small />
              <RibbonButton icon={<ArrowRight size={16} />} onClick={() => handleAddShape('arrow')} title="Arrow" small />
              <RibbonButton icon={<Star size={16} />} onClick={() => handleAddShape('star')} title="Star" small />
              <RibbonButton icon={<Diamond size={16} />} onClick={() => handleAddShape('diamond')} title="Diamond" small />
              <RibbonButton icon={<Hexagon size={16} />} onClick={() => handleAddShape('hexagon')} title="Hexagon" small />
              <div className="relative">
                <RibbonButton icon={<Shapes size={14} />} onClick={() => setShowAdvShapes(!showAdvShapes)} title="All Shapes" small />
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
                      </div>
                    )}
                  </div>
                </RibbonGroup>
              </>
            )}

            {/* Image formatting when image is selected */}
            {selectedElement && selectedElement.type === 'image' && (
              <>
                <RibbonDivider />
                <RibbonGroup label="Image Effects">
                  {(['none', 'shadow', 'rounded', 'oval', 'reflection', 'glow'] as const).map((effect) => (
                    <button key={effect} onClick={() => {
                      pushUndo();
                      const styles: Record<string, string | boolean | number | undefined> = {};
                      switch (effect) {
                        case 'shadow': styles.shadow = true; break;
                        case 'rounded': styles.borderRadius = '12px'; break;
                        case 'oval': styles.borderRadius = '50%'; break;
                        case 'glow': styles.shadow = true; styles.borderColor = '#3b82f6'; styles.borderWidth = 3; break;
                        case 'reflection': styles.opacity = 0.9; break;
                        default: styles.shadow = false; styles.borderRadius = '0'; styles.borderColor = undefined; styles.borderWidth = 0; styles.opacity = 1;
                      }
                      updateElement(activeSlideIndex, selectedElement.id, { style: styles });
                    }}
                      className="px-1.5 py-1 rounded text-[9px] border"
                      style={{ borderColor: 'var(--border)', color: 'var(--topbar-foreground)' }}>
                      {effect === 'none' ? 'Reset' : effect.charAt(0).toUpperCase() + effect.slice(1)}
                    </button>
                  ))}
                </RibbonGroup>
                <RibbonDivider />
                <RibbonGroup label="Image Size">
                  <RibbonButton icon={<Maximize size={14} />} label="Resize" onClick={() => {
                    if (!selectedElement) return;
                    const val = prompt('Enter width:', String(selectedElement.width));
                    if (val) {
                      pushUndo();
                      const newW = parseInt(val);
                      const ratio = selectedElement.height / selectedElement.width;
                      updateElement(activeSlideIndex, selectedElement.id, { width: newW, height: Math.round(newW * ratio) });
                    }
                  }} small />
                  <RibbonButton icon={<RotateCcw size={14} />} label="Rotate" onClick={() => {
                    if (!selectedElement) return;
                    pushUndo();
                    updateElement(activeSlideIndex, selectedElement.id, { rotation: (selectedElement.rotation || 0) + 90 });
                  }} small />
                </RibbonGroup>
              </>
            )}
          </div>
        );

      case 'transitions':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Transition">
              <div className="flex items-center gap-1">
                {TRANSITION_TYPES.map((t) => (
                  <button key={t.value} onClick={() => { pushUndo(); updateSlideTransition(activeSlideIndex, t.value); }}
                    className="px-2 py-1.5 rounded text-[10px] border transition-all hover:scale-105"
                    style={{
                      borderColor: (slide?.transition || 'none') === t.value ? 'var(--primary)' : 'var(--border)',
                      background: (slide?.transition || 'none') === t.value ? 'var(--primary)' : 'var(--card)',
                      color: (slide?.transition || 'none') === t.value ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Timing">
              <div className="flex flex-col gap-1 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] opacity-60 w-20">Auto-advance</label>
                  <button onClick={() => updateSlideTransitionTiming(activeSlideIndex, { autoAdvance: !(timing?.autoAdvance ?? false) })}
                    className="w-8 h-4 rounded-full transition-colors relative"
                    style={{ background: timing?.autoAdvance ? 'var(--primary)' : 'var(--muted)' }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                      style={{ left: timing?.autoAdvance ? 16 : 2 }} />
                  </button>
                  {timing?.autoAdvance && (
                    <span className="text-[10px] opacity-60">{timing.autoAdvanceSeconds ?? 5}s</span>
                  )}
                </div>
                {timing?.autoAdvance && (
                  <input type="range" min={1} max={30} step={1} value={timing.autoAdvanceSeconds ?? 5}
                    onChange={(e) => updateSlideTransitionTiming(activeSlideIndex, { autoAdvanceSeconds: parseInt(e.target.value) })}
                    className="w-full h-1 rounded appearance-none cursor-pointer" style={{ accentColor: 'var(--primary)' }} />
                )}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] opacity-60 w-20">On click</label>
                  <button onClick={() => updateSlideTransitionTiming(activeSlideIndex, { onClickAdvance: !(timing?.onClickAdvance ?? true) })}
                    className="w-8 h-4 rounded-full transition-colors relative"
                    style={{ background: (timing?.onClickAdvance ?? true) ? 'var(--primary)' : 'var(--muted)' }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                      style={{ left: (timing?.onClickAdvance ?? true) ? 16 : 2 }} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] opacity-60 w-20">Loop</label>
                  <button onClick={() => updateSlideTransitionTiming(activeSlideIndex, { loop: !(timing?.loop ?? false) })}
                    className="w-8 h-4 rounded-full transition-colors relative"
                    style={{ background: timing?.loop ? 'var(--primary)' : 'var(--muted)' }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                      style={{ left: timing?.loop ? 16 : 2 }} />
                  </button>
                </div>
              </div>
            </RibbonGroup>
          </div>
        );

      case 'animations':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Animation">
              <RibbonButton icon={<Sparkles size={18} />} label="Animations Panel"
                onClick={() => setShowAnimationsPanel(!showAnimationsPanel)}
                active={showAnimationsPanel} />
            </RibbonGroup>
            <RibbonDivider />
            <RibbonGroup label="Quick Animations">
              {selectedElement ? (
                <div className="flex items-center gap-1">
                  {(['fadeIn', 'flyIn', 'zoom', 'bounce', 'spin', 'wipe'] as const).map((t) => (
                    <button key={t} onClick={() => {
                      pushUndo();
                      store.updateElementAnimation(activeSlideIndex, selectedElement.id, {
                        type: t, duration: 0.5, delay: 0,
                      });
                    }}
                      className="px-2 py-1.5 rounded text-[10px] border"
                      style={{
                        borderColor: selectedElement.animation?.type === t ? 'var(--primary)' : 'var(--border)',
                        background: selectedElement.animation?.type === t ? 'var(--primary)' : 'var(--card)',
                        color: selectedElement.animation?.type === t ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                      }}>
                      {t.charAt(0).toUpperCase() + t.slice(1).replace(/([A-Z])/g, ' $1')}
                    </button>
                  ))}
                  {selectedElement.animation && (
                    <button onClick={() => { pushUndo(); store.updateElementAnimation(activeSlideIndex, selectedElement.id, undefined); }}
                      className="px-2 py-1.5 rounded text-[10px] border"
                      style={{ borderColor: 'var(--border)', color: '#ef4444', background: 'var(--card)' }}>
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[10px] opacity-50 px-2">Select an element to animate</span>
              )}
            </RibbonGroup>
          </div>
        );

      case 'slideshow':
        return (
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Start Slide Show">
              <RibbonButton icon={<Play size={18} />} label="From Beginning" onClick={() => { store.setActiveSlide(0); setPresenterMode(true); }} />
              <RibbonButton icon={<Monitor size={18} />} label="From Current" onClick={() => setPresenterMode(true)} />
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
          <div className="flex items-end gap-0.5">
            <RibbonGroup label="Presentation Views">
              <RibbonButton icon={<Rows3 size={16} />} label="Normal" active={!showSlideSorter} onClick={() => setShowSlideSorter(false)} />
              <RibbonButton icon={<Grid size={16} />} label="Sorter" active={showSlideSorter} onClick={() => setShowSlideSorter(!showSlideSorter)} />
            </RibbonGroup>
            <RibbonDivider />

            <RibbonGroup label="Show">
              <RibbonButton icon={<Ruler size={14} />} label="Ruler" onClick={() => setShowRuler(!showRuler)} active={showRuler} small />
              <RibbonButton icon={<BoxSelect size={14} />} label="Grid" onClick={() => setShowGrid(!showGrid)} active={showGrid} small />
              <RibbonButton icon={<Columns3 size={14} />} label="Guides" onClick={() => setShowGuides(!showGuides)} active={showGuides} small />
              <RibbonButton icon={<Maximize size={14} />} label="Snap" onClick={() => setSnapToGrid(!snapToGrid)} active={snapToGrid} small />
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="no-print flex flex-col border-b" style={{ borderColor: 'var(--border)', background: 'var(--topbar)', color: 'var(--topbar-foreground)' }}>
      {/* Quick Access Toolbar + Tab Strip */}
      <div className="flex items-center px-2 py-0.5 gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {/* Quick access buttons */}
        <button onClick={undo} disabled={undoStack.length === 0}
          className="p-1 rounded hover:opacity-80" style={{ color: 'var(--topbar-foreground)', opacity: undoStack.length === 0 ? 0.3 : 1 }} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </button>
        <button onClick={redo} disabled={redoStack.length === 0}
          className="p-1 rounded hover:opacity-80" style={{ color: 'var(--topbar-foreground)', opacity: redoStack.length === 0 ? 0.3 : 1 }} title="Redo (Ctrl+Y)">
          <Redo2 size={14} />
        </button>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />

        {/* Ribbon tabs */}
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

        {/* Right side quick actions */}
        <div className="relative">
          <button onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:opacity-80"
            style={{ color: 'var(--topbar-foreground)' }} title="Export">
            <Download size={14} />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 rounded shadow-xl z-50 border py-1"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 160 }}>
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

      {/* Ribbon content area */}
      <div className="px-2 py-1 min-h-[68px] overflow-x-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
