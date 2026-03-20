'use client';

import React, { useState } from 'react';
import { X, Plus, Palette, Type, Edit3, Layout, Move, Image, Hash, Calendar, FileText, Columns, SquareDashedBottom, Heading1, PanelTop } from 'lucide-react';
import {
  usePresentationStore,
  DEFAULT_SLIDE_MASTERS,
  type SlideMaster,
  type SlideLayout,
  type PlaceholderPosition,
} from '@/store/presentation-store';
import { generateId } from '@/lib/utils';

const FONT_OPTIONS = [
  'Arial', 'Times New Roman', 'Georgia', 'Verdana',
  'Courier New', 'Trebuchet MS', 'Helvetica', 'Impact',
  'Garamond', 'Palatino', 'Tahoma', 'Lucida Sans',
];

const PLACEHOLDER_TYPES: Array<{ type: PlaceholderPosition['type']; label: string; icon: React.ReactNode; defaultPos: Omit<PlaceholderPosition, 'id' | 'type'> }> = [
  { type: 'title', label: 'Title', icon: <Type size={14} />, defaultPos: { x: 60, y: 30, width: 840, height: 70 } },
  { type: 'subtitle', label: 'Subtitle', icon: <Type size={12} />, defaultPos: { x: 160, y: 110, width: 640, height: 50 } },
  { type: 'body', label: 'Body Text', icon: <FileText size={14} />, defaultPos: { x: 60, y: 120, width: 840, height: 360 } },
  { type: 'image', label: 'Image', icon: <Image size={14} />, defaultPos: { x: 60, y: 120, width: 400, height: 360 } },
  { type: 'footer', label: 'Footer', icon: <Layout size={14} />, defaultPos: { x: 60, y: 510, width: 840, height: 25 } },
  { type: 'date', label: 'Date', icon: <Calendar size={14} />, defaultPos: { x: 60, y: 510, width: 200, height: 25 } },
  { type: 'slideNumber', label: 'Slide #', icon: <Hash size={14} />, defaultPos: { x: 880, y: 510, width: 60, height: 25 } },
  { type: 'logo', label: 'Logo', icon: <Image size={14} />, defaultPos: { x: 860, y: 10, width: 80, height: 40 } },
];

// ── Layout Templates ──────────────────────────────────────────────────────────

interface LayoutTemplate {
  layout: SlideLayout;
  label: string;
  description: string;
  icon: React.ReactNode;
  regions: Array<{ x: number; y: number; w: number; h: number; label: string }>;
}

const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    layout: 'title',
    label: 'Title Slide',
    description: 'Centered title and subtitle',
    icon: <Heading1 size={16} />,
    regions: [
      { x: 8, y: 30, w: 84, h: 15, label: 'Title' },
      { x: 17, y: 52, w: 66, h: 10, label: 'Subtitle' },
    ],
  },
  {
    layout: 'content',
    label: 'Title + Content',
    description: 'Title bar with full content area',
    icon: <PanelTop size={16} />,
    regions: [
      { x: 6, y: 5, w: 88, h: 12, label: 'Title' },
      { x: 6, y: 20, w: 88, h: 72, label: 'Content' },
    ],
  },
  {
    layout: 'two-column',
    label: 'Two Content',
    description: 'Title with two side-by-side columns',
    icon: <Columns size={16} />,
    regions: [
      { x: 6, y: 5, w: 88, h: 12, label: 'Title' },
      { x: 6, y: 20, w: 42, h: 72, label: 'Left' },
      { x: 52, y: 20, w: 42, h: 72, label: 'Right' },
    ],
  },
  {
    layout: 'blank',
    label: 'Blank',
    description: 'Empty slide with no placeholders',
    icon: <SquareDashedBottom size={16} />,
    regions: [],
  },
  {
    layout: 'section-header',
    label: 'Section Header',
    description: 'Large title for section breaks',
    icon: <Type size={16} />,
    regions: [
      { x: 8, y: 37, w: 84, h: 15, label: 'Section Title' },
      { x: 8, y: 54, w: 84, h: 10, label: 'Description' },
    ],
  },
  {
    layout: 'title-only',
    label: 'Title Only',
    description: 'Just a title bar, rest is open',
    icon: <Layout size={16} />,
    regions: [
      { x: 6, y: 5, w: 88, h: 12, label: 'Title' },
    ],
  },
  {
    layout: 'comparison',
    label: 'Comparison',
    description: 'Compare two options side by side',
    icon: <Columns size={16} />,
    regions: [
      { x: 6, y: 5, w: 88, h: 12, label: 'Title' },
      { x: 6, y: 20, w: 42, h: 10, label: 'Option A' },
      { x: 6, y: 32, w: 42, h: 60, label: 'Details A' },
      { x: 52, y: 20, w: 42, h: 10, label: 'Option B' },
      { x: 52, y: 32, w: 42, h: 60, label: 'Details B' },
    ],
  },
  {
    layout: 'picture-caption',
    label: 'Picture + Caption',
    description: 'Image area with caption text below',
    icon: <Image size={16} />,
    regions: [
      { x: 6, y: 5, w: 88, h: 68, label: 'Image' },
      { x: 6, y: 75, w: 88, h: 10, label: 'Caption' },
      { x: 6, y: 86, w: 88, h: 8, label: 'Description' },
    ],
  },
];

// ── Layout Preview Thumbnail ──────────────────────────────────────────────────

function LayoutThumbnail({ template, isActive, onClick }: { template: LayoutTemplate; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all hover:opacity-90"
      style={{
        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
        background: isActive ? 'var(--primary)/10' : 'transparent',
      }}
    >
      <div
        className="w-full rounded border relative overflow-hidden"
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
          borderColor: 'var(--border)',
        }}
      >
        {template.regions.map((r, i) => (
          <div
            key={i}
            className="absolute border border-dashed border-white/30 rounded-sm flex items-center justify-center"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: `${r.w}%`,
              height: `${r.h}%`,
            }}
          >
            <span className="text-white/40 text-[6px] leading-none truncate px-0.5">{r.label}</span>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-medium leading-tight text-center" style={{ color: 'var(--foreground)' }}>
        {template.label}
      </span>
    </button>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0" style={{ color: 'var(--foreground)' }}>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border cursor-pointer" style={{ borderColor: 'var(--border)' }} />
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{value}</span>
    </label>
  );
}

function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0" style={{ color: 'var(--foreground)' }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded border px-2 py-1 text-sm"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
        {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
    </label>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SlideMasterPanel() {
  const {
    showSlideMaster, setShowSlideMaster,
    slideMasters, activeSlideIndex, slides,
    addSlideMaster, updateSlideMaster, applySlideMaster,
    updateSlideMasterPlaceholders, pushUndo, applySlideLayout,
  } = usePresentationStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<SlideMaster>>({});
  const [activeTab, setActiveTab] = useState<'layouts' | 'masters' | 'placeholders'>('layouts');
  const [editPlaceholders, setEditPlaceholders] = useState<PlaceholderPosition[]>([]);

  if (!showSlideMaster) return null;

  const editingMaster = editingId ? slideMasters.find((m) => m.id === editingId) : null;
  const currentSlide = slides[activeSlideIndex];
  const currentLayout = currentSlide?.layout || 'content';

  const startEditing = (master: SlideMaster) => {
    setEditingId(master.id);
    setEditDraft({
      name: master.name, background: master.background,
      titleColor: master.titleColor, textColor: master.textColor,
      accentColor: master.accentColor, fontFamily: master.fontFamily,
      headingFont: master.headingFont,
    });
    setEditPlaceholders(master.placeholders || []);
    setActiveTab('masters');
  };

  const saveEditing = () => {
    if (editingId && editDraft) {
      updateSlideMaster(editingId, editDraft);
      updateSlideMasterPlaceholders(editingId, editPlaceholders);
    }
    setEditingId(null);
    setEditDraft({});
    setEditPlaceholders([]);
    setActiveTab('layouts');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft({});
    setEditPlaceholders([]);
    setActiveTab('layouts');
  };

  const handleAddMaster = () => {
    const newMaster: Omit<SlideMaster, 'id'> = {
      name: 'New Master',
      background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
      titleColor: '#ffffff', textColor: '#cbd5e1', accentColor: '#3b82f6',
      fontFamily: 'Arial', headingFont: 'Arial',
      placeholders: [
        { id: generateId(), type: 'title', x: 60, y: 30, width: 840, height: 70 },
        { id: generateId(), type: 'body', x: 60, y: 120, width: 840, height: 360 },
      ],
    };
    addSlideMaster(newMaster);
  };

  const handleApply = (masterId: string) => {
    pushUndo();
    applySlideMaster(activeSlideIndex, masterId);
  };

  const handleApplyToAll = (masterId: string) => {
    pushUndo();
    slides.forEach((_, idx) => applySlideMaster(idx, masterId));
  };

  const handleApplyLayout = (layout: SlideLayout) => {
    pushUndo();
    applySlideLayout(activeSlideIndex, layout);
  };

  const addPlaceholder = (type: PlaceholderPosition['type']) => {
    const def = PLACEHOLDER_TYPES.find(p => p.type === type);
    if (!def) return;
    setEditPlaceholders(prev => [...prev, { id: generateId(), type, ...def.defaultPos }]);
  };

  const removePlaceholder = (id: string) => {
    setEditPlaceholders(prev => prev.filter(p => p.id !== id));
  };

  const getBgColorValue = (bg: string): string => {
    if (bg.startsWith('#')) return bg;
    const match = bg.match(/#[0-9a-fA-F]{6}/);
    return match ? match[0] : '#334155';
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/50">
      <div className="rounded-lg shadow-2xl border w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Palette size={18} style={{ color: 'var(--foreground)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>Slide Master & Layouts</h2>
          </div>
          <button onClick={() => setShowSlideMaster(false)} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Top-level tabs */}
        {!editingId && (
          <div className="flex gap-1 px-4 pt-3 pb-1">
            <button onClick={() => setActiveTab('layouts')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                background: activeTab === 'layouts' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'layouts' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}>
              Layout Templates
            </button>
            <button onClick={() => setActiveTab('masters')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                background: activeTab === 'masters' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'masters' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}>
              Slide Masters
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ── Layout Templates Tab ── */}
          {activeTab === 'layouts' && !editingId && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Apply a layout to Slide {activeSlideIndex + 1}. This replaces the slide&apos;s elements with the chosen layout template.
              </p>
              <div className="grid grid-cols-4 gap-3">
                {LAYOUT_TEMPLATES.map((tpl) => (
                  <LayoutThumbnail
                    key={tpl.layout}
                    template={tpl}
                    isActive={currentLayout === tpl.layout}
                    onClick={() => handleApplyLayout(tpl.layout)}
                  />
                ))}
              </div>

              {/* Current slide info */}
              <div className="mt-4 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                      Current: <strong>{LAYOUT_TEMPLATES.find(t => t.layout === currentLayout)?.label || currentLayout}</strong>
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>
                      (Slide {activeSlideIndex + 1} of {slides.length})
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {currentSlide?.elements.length || 0} elements
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Masters Tab (list view) ── */}
          {activeTab === 'masters' && !editingId && (
            <>
              {slideMasters.map((master) => (
                <div key={master.id} className="border rounded-lg p-3 hover:opacity-95 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded border shrink-0 relative overflow-hidden"
                      style={{ background: master.background, borderColor: 'var(--border)' }}>
                      {master.placeholders?.slice(0, 3).map(ph => (
                        <div key={ph.id} className="absolute border border-dashed border-white/20"
                          style={{ left: `${(ph.x / 960) * 100}%`, top: `${(ph.y / 540) * 100}%`, width: `${(ph.width / 960) * 100}%`, height: `${(ph.height / 540) * 100}%` }} />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--card-foreground)' }}>{master.name}</h3>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full border" title="Title" style={{ background: master.titleColor, borderColor: 'var(--border)' }} />
                          <div className="w-3 h-3 rounded-full border" title="Text" style={{ background: master.textColor, borderColor: 'var(--border)' }} />
                          <div className="w-3 h-3 rounded-full border" title="Accent" style={{ background: master.accentColor, borderColor: 'var(--border)' }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Type size={12} style={{ color: 'var(--muted-foreground)' }} />
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {master.headingFont} / {master.fontFamily}
                          {master.placeholders ? ` · ${master.placeholders.length} placeholders` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEditing(master)}
                        className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }} title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleApply(master.id)}
                        className="px-2.5 py-1 rounded text-xs font-medium hover:opacity-90"
                        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                        Apply
                      </button>
                      <button onClick={() => handleApplyToAll(master.id)}
                        className="px-2 py-1 rounded text-xs border hover:opacity-80"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                        All
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddMaster}
                className="w-full border border-dashed rounded-lg p-3 flex items-center justify-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                <Plus size={16} /> Add New Master
              </button>
            </>
          )}

          {/* ── Editing a Master ── */}
          {editingMaster && editingId && (
            <div className="space-y-4">
              {/* Edit tabs */}
              <div className="flex gap-1 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setActiveTab('masters')}
                  className="px-3 py-1 rounded text-sm"
                  style={{ background: activeTab === 'masters' ? 'var(--primary)' : 'transparent', color: activeTab === 'masters' ? 'var(--primary-foreground)' : 'var(--foreground)' }}>
                  Style & Colors
                </button>
                <button onClick={() => setActiveTab('placeholders')}
                  className="px-3 py-1 rounded text-sm"
                  style={{ background: activeTab === 'placeholders' ? 'var(--primary)' : 'transparent', color: activeTab === 'placeholders' ? 'var(--primary-foreground)' : 'var(--foreground)' }}>
                  Placeholders
                </button>
              </div>

              {activeTab === 'masters' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 size={16} style={{ color: 'var(--foreground)' }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Editing: {editingMaster.name}</span>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="w-24 shrink-0" style={{ color: 'var(--foreground)' }}>Name</span>
                    <input type="text" value={editDraft.name ?? editingMaster.name}
                      onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="w-24 shrink-0" style={{ color: 'var(--foreground)' }}>Background</span>
                    <input type="color" value={getBgColorValue(editDraft.background ?? editingMaster.background)}
                      onChange={(e) => setEditDraft((d) => ({ ...d, background: `linear-gradient(135deg, ${e.target.value} 0%, ${e.target.value}cc 100%)` }))}
                      className="w-8 h-8 rounded border cursor-pointer" style={{ borderColor: 'var(--border)' }} />
                    <div className="w-20 h-8 rounded border" style={{ background: editDraft.background ?? editingMaster.background, borderColor: 'var(--border)' }} />
                  </label>
                  <ColorField label="Title Color" value={editDraft.titleColor ?? editingMaster.titleColor} onChange={(v) => setEditDraft((d) => ({ ...d, titleColor: v }))} />
                  <ColorField label="Text Color" value={editDraft.textColor ?? editingMaster.textColor} onChange={(v) => setEditDraft((d) => ({ ...d, textColor: v }))} />
                  <ColorField label="Accent Color" value={editDraft.accentColor ?? editingMaster.accentColor} onChange={(v) => setEditDraft((d) => ({ ...d, accentColor: v }))} />
                  <FontSelect label="Body Font" value={editDraft.fontFamily ?? editingMaster.fontFamily} onChange={(v) => setEditDraft((d) => ({ ...d, fontFamily: v }))} />
                  <FontSelect label="Heading Font" value={editDraft.headingFont ?? editingMaster.headingFont} onChange={(v) => setEditDraft((d) => ({ ...d, headingFont: v }))} />
                  {/* Preview */}
                  <div>
                    <span className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Preview</span>
                    <div className="rounded-lg border p-4 relative" style={{ background: editDraft.background ?? editingMaster.background, borderColor: 'var(--border)', minHeight: 140, aspectRatio: '16/9' }}>
                      {editPlaceholders.map(ph => (
                        <div key={ph.id} className="absolute border border-dashed border-white/30 rounded flex items-center justify-center"
                          style={{ left: `${(ph.x / 960) * 100}%`, top: `${(ph.y / 540) * 100}%`, width: `${(ph.width / 960) * 100}%`, height: `${(ph.height / 540) * 100}%` }}>
                          <span className="text-white/30 text-[8px]">{ph.type}</span>
                        </div>
                      ))}
                      <div style={{ color: editDraft.titleColor ?? editingMaster.titleColor, fontFamily: editDraft.headingFont ?? editingMaster.headingFont, fontSize: 18, fontWeight: 'bold' }}>
                        Heading Text
                      </div>
                      <div className="mt-2" style={{ color: editDraft.textColor ?? editingMaster.textColor, fontFamily: editDraft.fontFamily ?? editingMaster.fontFamily, fontSize: 12 }}>
                        Body text preview with selected font and color.
                      </div>
                      <div className="mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold"
                        style={{ background: editDraft.accentColor ?? editingMaster.accentColor, color: '#ffffff' }}>
                        Accent
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Placeholders tab */
                <div className="space-y-3">
                  <div className="text-xs font-medium opacity-70 mb-2">Add Placeholders</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PLACEHOLDER_TYPES.map(pt => (
                      <button key={pt.type} onClick={() => addPlaceholder(pt.type)}
                        className="flex flex-col items-center gap-1 p-2 rounded border text-xs hover:opacity-80"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                        {pt.icon}
                        {pt.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-medium opacity-70 mt-3">Active Placeholders</div>
                  {editPlaceholders.length === 0 ? (
                    <p className="text-xs opacity-40 text-center py-2">No placeholders added yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {editPlaceholders.map(ph => (
                        <div key={ph.id} className="flex items-center gap-2 p-2 rounded border text-xs"
                          style={{ borderColor: 'var(--border)' }}>
                          <Move size={12} className="opacity-40" />
                          <span className="font-medium capitalize flex-1">{ph.type}</span>
                          <span className="opacity-40">({ph.x}, {ph.y}) {ph.width}×{ph.height}</span>
                          <button onClick={() => removePlaceholder(ph.id)} className="text-red-400 hover:text-red-300">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Placeholder preview */}
                  <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--border)', aspectRatio: '16/9', background: editDraft.background ?? editingMaster.background }}>
                    <div className="relative w-full h-full">
                      {editPlaceholders.map(ph => (
                        <div key={ph.id} className="absolute border-2 border-dashed rounded flex items-center justify-center"
                          style={{
                            left: `${(ph.x / 960) * 100}%`, top: `${(ph.y / 540) * 100}%`,
                            width: `${(ph.width / 960) * 100}%`, height: `${(ph.height / 540) * 100}%`,
                            borderColor: ph.type === 'title' ? '#3b82f6' : ph.type === 'body' ? '#22c55e' : ph.type === 'image' ? '#f59e0b' : '#a855f7',
                          }}>
                          <span className="text-white/50 text-[9px] font-medium">{ph.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={cancelEditing}
                  className="px-3 py-1.5 rounded border text-sm hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Cancel</button>
                <button onClick={saveEditing}
                  className="px-3 py-1.5 rounded text-sm font-medium hover:opacity-90"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Save Changes</button>
              </div>
            </div>
          )}
        </div>

        {!editingId && (
          <div className="px-4 py-2 border-t text-xs shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            {activeTab === 'layouts'
              ? <>Click a layout to apply it to the current slide. This will replace existing content.</>
              : <>Click <strong>Apply</strong> to set a master on the current slide, <strong>All</strong> for all slides, or <strong>Edit</strong> to customize.</>
            }
          </div>
        )}
      </div>
    </div>
  );
}
