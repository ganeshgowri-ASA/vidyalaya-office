'use client';

/**
 * PictureFormatting – shared picture-formatting panel.
 *
 * Usage:
 *   <PictureFormattingPanel editorId="doc-editor" />
 *
 * Also exports:
 *   <InsertImageButton editorId="doc-editor" />  – toolbar button + dialog
 *   <PictureFormattingToolbar editorId="doc-editor" />  – compact toolbar strip
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Image as ImageIcon, Crop, Sun, Contrast, Palette, Droplets,
  RotateCcw, FlipHorizontal, FlipVertical, Minimize,
  Square, Layers, Type, Lock, Unlock, Eye, Sparkles,
  Grid3X3, ChevronDown, ChevronUp, X, Upload, ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePictureStore, DEFAULT_FORMATTING, type ImageFormatting } from '@/store/picture-store';
import {
  buildFilterString, buildTransformString, buildBoxShadow, buildBorderString,
  applyFormattingToImg, getEditorImage, readFormattingFromImg,
  compressImageElement, removeBackgroundBasic, insertImageIntoEditor, makeSvgPlaceholder,
} from './picture-formatting-utils';
import {
  CROP_SHAPES, ASPECT_RATIOS, TEXT_WRAP_OPTIONS, PRESET_BORDERS, PRESET_SHADOWS, PRESET_GLOWS,
} from './picture-formatting-constants';
import { InsertImageDialog } from './picture-insert-dialog';
import { ImageGallery } from './picture-image-gallery';

// ─── Shared tiny UI helpers ───────────────────────────────────────

function PanelSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:opacity-80"
        style={{ color: 'var(--foreground)' }}
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5" style={{ color: 'var(--muted-foreground)' }}>
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-blue-500"
      />
    </div>
  );
}

function ColorRow({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span style={{ color: 'var(--foreground)' }}>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-7 h-6 rounded cursor-pointer border-0" />
    </div>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 text-[11px] w-full text-left"
      style={{ color: 'var(--foreground)' }}
    >
      <div
        className={cn('w-7 h-4 rounded-full transition-colors flex items-center px-0.5', value ? 'bg-blue-500' : 'bg-gray-600')}
      >
        <div className={cn('w-3 h-3 bg-white rounded-full transition-transform', value ? 'translate-x-3' : 'translate-x-0')} />
      </div>
      {label}
    </button>
  );
}

// ─── Main panel ──────────────────────────────────────────────────

export interface PictureFormattingPanelProps {
  /** ID of the contenteditable element to target (document/research editors) */
  editorId?: string;
  /** Called whenever formatting changes — for canvas-based editors (presentation) */
  onFormattingChange?: (formatting: ImageFormatting) => void;
  /** Called when an image is inserted — for canvas-based editors */
  onInsertImage?: (src: string, altText?: string) => void;
  /** If true, show in a floating side panel layout */
  floating?: boolean;
  onClose?: () => void;
}

export function PictureFormattingPanel({
  editorId,
  onFormattingChange,
  onInsertImage,
  floating = false,
  onClose,
}: PictureFormattingPanelProps) {
  const { formatting, updateFormatting, resetFormatting, showInsertDialog, setShowInsertDialog, showGallery, setShowGallery } = usePictureStore();

  // Sync formatting → DOM image (for contenteditable editors)
  const applyToEditor = useCallback((patch: Partial<ImageFormatting>) => {
    const next = { ...formatting, ...patch };
    updateFormatting(patch);
    onFormattingChange?.(next);
    if (editorId) {
      const img = getEditorImage(editorId);
      if (img) applyFormattingToImg(img, next);
    }
  }, [formatting, updateFormatting, onFormattingChange, editorId]);

  // Load formatting from currently selected image when panel opens
  useEffect(() => {
    if (!editorId) return;
    const img = getEditorImage(editorId);
    if (img) {
      const read = readFormattingFromImg(img);
      updateFormatting(read);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorId]);

  const handleInsert = (src: string, alt?: string) => {
    if (onInsertImage) {
      onInsertImage(src, alt);
    } else if (editorId) {
      insertImageIntoEditor(editorId, src, alt);
    }
    setShowInsertDialog(false);
  };

  const handleCompressImage = async () => {
    if (!editorId) return;
    const img = getEditorImage(editorId);
    if (!img) return;
    try {
      const compressed = await compressImageElement(img);
      const original = img.src.length;
      img.src = compressed;
      const saved = Math.round((1 - compressed.length / original) * 100);
      alert(`Image compressed. Size reduced by ~${saved}%.`);
    } catch {
      alert('Could not compress this image (cross-origin restriction).');
    }
  };

  const handleRemoveBg = async () => {
    if (!editorId) return;
    const img = getEditorImage(editorId);
    if (!img) return;
    try {
      const result = await removeBackgroundBasic(img);
      img.src = result;
    } catch {
      alert('Background removal unavailable for this image source.');
    }
  };

  const handleReset = () => {
    resetFormatting();
    if (editorId) {
      const img = getEditorImage(editorId);
      if (img) applyFormattingToImg(img, DEFAULT_FORMATTING);
    }
    onFormattingChange?.(DEFAULT_FORMATTING);
  };

  const handleCropToShape = (clip: string) => {
    applyToEditor({ clipPath: clip });
  };

  const handleAspectRatio = (w: number, h: number) => {
    if (!editorId || w === 0) {
      applyToEditor({ aspectRatioLocked: false });
      return;
    }
    const img = getEditorImage(editorId);
    if (!img) return;
    const cw = img.offsetWidth || 300;
    const ch = Math.round(cw * h / w);
    img.style.width = `${cw}px`;
    img.style.height = `${ch}px`;
    img.style.objectFit = 'cover';
    applyToEditor({ width: cw, height: ch, aspectRatioLocked: true });
  };

  const handleRotate = (delta: number) => {
    const newRot = ((formatting.rotation + delta) % 360 + 360) % 360;
    applyToEditor({ rotation: newRot });
  };

  const wrap = (content: React.ReactNode) =>
    floating ? (
      <div
        className="flex flex-col"
        style={{ width: 240, backgroundColor: 'var(--card)', color: 'var(--foreground)', height: '100%', overflowY: 'auto' }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b font-semibold text-xs"
          style={{ borderColor: 'var(--border)' }}
        >
          <span>Picture Format</span>
          {onClose && (
            <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>
          )}
        </div>
        {content}
      </div>
    ) : (
      <div style={{ color: 'var(--foreground)' }}>{content}</div>
    );

  const body = (
    <>
      {/* Insert */}
      <PanelSection title="Insert Image">
        <button
          onClick={() => setShowInsertDialog(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <Upload size={13} /> Insert from file / URL / stock…
        </button>
        <button
          onClick={() => setShowGallery(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <Grid3X3 size={13} /> Open Gallery
        </button>
      </PanelSection>

      {/* Adjustments */}
      <PanelSection title="Adjustments">
        <Slider label="Brightness" value={formatting.brightness} min={20} max={200} unit="%" onChange={(v) => applyToEditor({ brightness: v })} />
        <Slider label="Contrast" value={formatting.contrast} min={20} max={200} unit="%" onChange={(v) => applyToEditor({ contrast: v })} />
        <Slider label="Saturation" value={formatting.saturation} min={0} max={200} unit="%" onChange={(v) => applyToEditor({ saturation: v })} />
        <Slider label="Blur" value={formatting.blur} min={0} max={20} step={0.5} unit="px" onChange={(v) => applyToEditor({ blur: v })} />
        <Slider label="Opacity" value={formatting.opacity} min={10} max={100} unit="%" onChange={(v) => applyToEditor({ opacity: v })} />
        <div className="flex gap-1 pt-1">
          {['grayscale', 'sepia', 'invert'].map((fx) => (
            <button
              key={fx}
              onClick={() => {
                if (!editorId) return;
                const img = getEditorImage(editorId);
                if (img) img.style.filter = `${fx}(100%)`;
              }}
              className="flex-1 text-[10px] px-1 py-1 rounded border hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              {fx.charAt(0).toUpperCase() + fx.slice(1)}
            </button>
          ))}
        </div>
      </PanelSection>

      {/* Size & Transform */}
      <PanelSection title="Size & Transform">
        <Slider
          label="Rotation"
          value={formatting.rotation}
          min={0} max={359} unit="°"
          onChange={(v) => applyToEditor({ rotation: v })}
        />
        <div className="flex gap-1">
          <button
            onClick={() => handleRotate(-90)}
            className="flex-1 text-[10px] flex items-center justify-center gap-1 px-2 py-1.5 rounded border hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <RotateCcw size={11} /> -90°
          </button>
          <button
            onClick={() => handleRotate(90)}
            className="flex-1 text-[10px] flex items-center justify-center gap-1 px-2 py-1.5 rounded border hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <RotateCcw size={11} className="scale-x-[-1]" /> +90°
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => applyToEditor({ flipH: !formatting.flipH })}
            className={cn('flex-1 text-[10px] flex items-center justify-center gap-1 px-2 py-1.5 rounded border hover:opacity-80', formatting.flipH && 'bg-blue-600 text-white border-blue-600')}
            style={!formatting.flipH ? { borderColor: 'var(--border)', color: 'var(--foreground)' } : {}}
          >
            <FlipHorizontal size={11} /> Flip H
          </button>
          <button
            onClick={() => applyToEditor({ flipV: !formatting.flipV })}
            className={cn('flex-1 text-[10px] flex items-center justify-center gap-1 px-2 py-1.5 rounded border hover:opacity-80', formatting.flipV && 'bg-blue-600 text-white border-blue-600')}
            style={!formatting.flipV ? { borderColor: 'var(--border)', color: 'var(--foreground)' } : {}}
          >
            <FlipVertical size={11} /> Flip V
          </button>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <Toggle
            label="Lock aspect ratio"
            value={formatting.aspectRatioLocked}
            onChange={(v) => applyToEditor({ aspectRatioLocked: v })}
          />
        </div>
        <div className="text-[10px] font-medium pt-1" style={{ color: 'var(--muted-foreground)' }}>
          Aspect Ratio Presets
        </div>
        <div className="grid grid-cols-2 gap-1">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r.name}
              onClick={() => handleAspectRatio(r.w, r.h)}
              className="text-[10px] px-2 py-1 rounded border hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </PanelSection>

      {/* Crop to Shape */}
      <PanelSection title="Crop to Shape" defaultOpen={false}>
        <div className="grid grid-cols-4 gap-1">
          {CROP_SHAPES.map((s) => (
            <button
              key={s.name}
              title={s.name}
              onClick={() => handleCropToShape(s.clip)}
              className="w-full aspect-square rounded border flex items-center justify-center hover:opacity-80"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="w-6 h-6 bg-blue-500" style={{ clipPath: s.clip }} />
            </button>
          ))}
        </div>
        <button
          onClick={() => handleCropToShape('')}
          className="w-full text-[10px] px-2 py-1 rounded border hover:opacity-80 mt-1"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          Remove Shape Crop
        </button>
      </PanelSection>

      {/* Border */}
      <PanelSection title="Border" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {PRESET_BORDERS.map((b) => (
            <button
              key={b.name}
              onClick={() => applyToEditor({ borderWidth: b.width, borderColor: b.color, borderStyle: b.style, borderRadius: b.radius })}
              className="text-[10px] px-2 py-1 rounded border hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              {b.name}
            </button>
          ))}
        </div>
        <Slider label="Width" value={formatting.borderWidth} min={0} max={16} unit="px" onChange={(v) => applyToEditor({ borderWidth: v })} />
        <Slider label="Radius" value={formatting.borderRadius} min={0} max={50} unit="px" onChange={(v) => applyToEditor({ borderRadius: v })} />
        <ColorRow label="Color" value={formatting.borderColor} onChange={(v) => applyToEditor({ borderColor: v })} />
        <div className="flex gap-1">
          {(['solid', 'dashed', 'dotted', 'double'] as const).map((s) => (
            <button
              key={s}
              onClick={() => applyToEditor({ borderStyle: s })}
              className={cn('flex-1 text-[10px] px-1 py-1 rounded border hover:opacity-80', formatting.borderStyle === s && 'bg-blue-600 text-white')}
              style={formatting.borderStyle !== s ? { borderColor: 'var(--border)', color: 'var(--foreground)' } : {}}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </PanelSection>

      {/* Shadow */}
      <PanelSection title="Shadow" defaultOpen={false}>
        <Toggle label="Enable shadow" value={formatting.shadowEnabled} onChange={(v) => applyToEditor({ shadowEnabled: v })} />
        {formatting.shadowEnabled && (
          <>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {PRESET_SHADOWS.filter((s) => s.enabled).map((s) => (
                <button
                  key={s.name}
                  onClick={() => applyToEditor({ shadowEnabled: s.enabled, shadowOffsetX: s.x, shadowOffsetY: s.y, shadowBlur: s.blur, shadowSpread: s.spread, shadowColor: s.color })}
                  className="text-[10px] px-1 py-1 rounded border hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <Slider label="Offset X" value={formatting.shadowOffsetX} min={-30} max={30} unit="px" onChange={(v) => applyToEditor({ shadowOffsetX: v })} />
            <Slider label="Offset Y" value={formatting.shadowOffsetY} min={-30} max={30} unit="px" onChange={(v) => applyToEditor({ shadowOffsetY: v })} />
            <Slider label="Blur" value={formatting.shadowBlur} min={0} max={40} unit="px" onChange={(v) => applyToEditor({ shadowBlur: v })} />
            <Slider label="Spread" value={formatting.shadowSpread} min={-10} max={20} unit="px" onChange={(v) => applyToEditor({ shadowSpread: v })} />
            <ColorRow label="Color" value={formatting.shadowColor.startsWith('rgba') ? '#000000' : formatting.shadowColor} onChange={(v) => applyToEditor({ shadowColor: v })} />
          </>
        )}
      </PanelSection>

      {/* Glow */}
      <PanelSection title="Glow" defaultOpen={false}>
        <Toggle label="Enable glow" value={formatting.glowEnabled} onChange={(v) => applyToEditor({ glowEnabled: v })} />
        {formatting.glowEnabled && (
          <>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {PRESET_GLOWS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => applyToEditor({ glowEnabled: true, glowColor: g.color, glowBlur: g.blur })}
                  className="text-[10px] px-1 py-1 rounded border hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: g.color + '33' }}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <ColorRow label="Glow color" value={formatting.glowColor} onChange={(v) => applyToEditor({ glowColor: v })} />
            <Slider label="Blur radius" value={formatting.glowBlur} min={4} max={40} unit="px" onChange={(v) => applyToEditor({ glowBlur: v })} />
          </>
        )}
      </PanelSection>

      {/* Reflection */}
      <PanelSection title="Reflection" defaultOpen={false}>
        <Toggle label="Enable reflection" value={formatting.reflectionEnabled} onChange={(v) => applyToEditor({ reflectionEnabled: v })} />
        {formatting.reflectionEnabled && (
          <Slider label="Opacity" value={Math.round(formatting.reflectionOpacity * 100)} min={5} max={50} unit="%" onChange={(v) => applyToEditor({ reflectionOpacity: v / 100 })} />
        )}
      </PanelSection>

      {/* Text Wrap (document context) */}
      <PanelSection title="Text Wrapping" defaultOpen={false}>
        <div className="space-y-1">
          {TEXT_WRAP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyToEditor({ textWrap: opt.value })}
              className={cn(
                'w-full text-left text-[11px] px-2 py-1.5 rounded border hover:opacity-80',
                formatting.textWrap === opt.value && 'bg-blue-600 text-white border-blue-600'
              )}
              style={formatting.textWrap !== opt.value ? { borderColor: 'var(--border)', color: 'var(--foreground)' } : {}}
            >
              <span className="font-medium">{opt.name}</span>
              <span className="block text-[9px] opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </PanelSection>

      {/* Accessibility */}
      <PanelSection title="Accessibility" defaultOpen={false}>
        <div>
          <label className="block text-[10px] mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Alt text</label>
          <textarea
            value={formatting.altText}
            onChange={(e) => updateFormatting({ altText: e.target.value })}
            onBlur={() => {
              if (editorId) {
                const img = getEditorImage(editorId);
                if (img) img.alt = formatting.altText;
              }
            }}
            className="w-full text-[11px] border rounded p-1.5 resize-none"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            placeholder="Describe this image for screen readers…"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-[10px] mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Caption</label>
          <input
            type="text"
            value={formatting.caption}
            onChange={(e) => updateFormatting({ caption: e.target.value })}
            className="w-full text-[11px] border rounded p-1.5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            placeholder="Figure caption…"
          />
        </div>
      </PanelSection>

      {/* Optimization */}
      <PanelSection title="Optimize" defaultOpen={false}>
        <button
          onClick={handleCompressImage}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded border hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <Minimize size={13} /> Compress Image (~60% quality)
        </button>
        <button
          onClick={handleRemoveBg}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded border hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <Sparkles size={13} /> Remove Background (AI stub)
        </button>
        <p className="text-[9px] opacity-50" style={{ color: 'var(--muted-foreground)' }}>
          Background removal is a basic color-key preview. Connect an AI API for production use.
        </p>
      </PanelSection>

      {/* Reset */}
      <div className="p-3">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded border hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <RotateCcw size={12} /> Reset All Formatting
        </button>
      </div>
    </>
  );

  return (
    <>
      {wrap(body)}
      {showInsertDialog && (
        <InsertImageDialog onClose={() => setShowInsertDialog(false)} onInsert={handleInsert} />
      )}
      {showGallery && (
        <ImageGallery
          onClose={() => setShowGallery(false)}
          onSelectImage={(src) => handleInsert(src)}
        />
      )}
    </>
  );
}

// ─── Compact toolbar strip ───────────────────────────────────────

export interface PictureFormattingToolbarProps {
  editorId?: string;
  onInsertImage?: (src: string, altText?: string) => void;
  onFormattingChange?: (f: ImageFormatting) => void;
  /** Show full panel toggle button */
  showPanelToggle?: boolean;
  onTogglePanel?: () => void;
}

export function PictureFormattingToolbar({
  editorId,
  onInsertImage,
  onFormattingChange,
  showPanelToggle = false,
  onTogglePanel,
}: PictureFormattingToolbarProps) {
  const { setShowInsertDialog, formatting, updateFormatting, setShowGallery } = usePictureStore();

  const applyToEditor = useCallback((patch: Partial<ImageFormatting>) => {
    const next = { ...formatting, ...patch };
    updateFormatting(patch);
    onFormattingChange?.(next);
    if (editorId) {
      const img = getEditorImage(editorId);
      if (img) applyFormattingToImg(img, next);
    }
  }, [formatting, updateFormatting, onFormattingChange, editorId]);

  const Btn = ({ icon, title, onClick, active }: {
    icon: React.ReactNode; title: string; onClick: () => void; active?: boolean;
  }) => (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors min-w-[36px]',
        active ? 'bg-blue-600 text-white' : 'hover:opacity-80'
      )}
      style={!active ? { color: 'var(--foreground)' } : {}}
    >
      {icon}
    </button>
  );

  const Sep = () => (
    <div className="w-px h-8 mx-0.5 self-center" style={{ backgroundColor: 'var(--border)' }} />
  );

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      <Btn icon={<ImageIcon size={14} />} title="Insert Image" onClick={() => setShowInsertDialog(true)} />
      <Btn icon={<Grid3X3 size={14} />} title="Image Gallery" onClick={() => setShowGallery(true)} />
      <Sep />
      <Btn icon={<Sun size={14} />} title="Brightness +" onClick={() => applyToEditor({ brightness: Math.min(200, formatting.brightness + 10) })} />
      <Btn icon={<Contrast size={14} />} title="Contrast +" onClick={() => applyToEditor({ contrast: Math.min(200, formatting.contrast + 10) })} />
      <Btn icon={<Palette size={14} />} title="Saturation +" onClick={() => applyToEditor({ saturation: Math.min(200, formatting.saturation + 10) })} />
      <Sep />
      <Btn icon={<RotateCcw size={14} />} title="Rotate -90°" onClick={() => {
        const newRot = ((formatting.rotation - 90) % 360 + 360) % 360;
        applyToEditor({ rotation: newRot });
      }} />
      <Btn icon={<FlipHorizontal size={14} />} title="Flip Horizontal" active={formatting.flipH} onClick={() => applyToEditor({ flipH: !formatting.flipH })} />
      <Btn icon={<FlipVertical size={14} />} title="Flip Vertical" active={formatting.flipV} onClick={() => applyToEditor({ flipV: !formatting.flipV })} />
      <Sep />
      <Btn icon={<Square size={14} />} title="Toggle Border" onClick={() => applyToEditor({ borderWidth: formatting.borderWidth > 0 ? 0 : 2, borderStyle: 'solid' })} />
      <Btn icon={<Droplets size={14} />} title="Toggle Shadow" active={formatting.shadowEnabled} onClick={() => applyToEditor({ shadowEnabled: !formatting.shadowEnabled })} />
      <Btn icon={<Eye size={14} />} title="Toggle Reflection" active={formatting.reflectionEnabled} onClick={() => applyToEditor({ reflectionEnabled: !formatting.reflectionEnabled })} />
      <Sep />
      <Btn icon={<Minimize size={14} />} title="Compress" onClick={async () => {
        if (!editorId) return;
        const img = getEditorImage(editorId);
        if (!img) return;
        try { const c = await compressImageElement(img); img.src = c; } catch { /* noop */ }
      }} />
      <Btn icon={<RotateCcw size={14} />} title="Reset Formatting" onClick={() => {
        updateFormatting({ ...DEFAULT_FORMATTING });
        if (editorId) {
          const img = getEditorImage(editorId);
          if (img) applyFormattingToImg(img, DEFAULT_FORMATTING);
        }
      }} />
      {showPanelToggle && (
        <>
          <Sep />
          <Btn icon={<ZoomIn size={14} />} title="Open Format Panel" onClick={() => onTogglePanel?.()} />
        </>
      )}
    </div>
  );
}

// ─── Insert button (just the button + dialog, no panel) ──────────

export function InsertImageButton({
  editorId,
  onInsertImage,
  label = 'Image',
}: {
  editorId?: string;
  onInsertImage?: (src: string, alt?: string) => void;
  label?: string;
}) {
  const { showInsertDialog, setShowInsertDialog } = usePictureStore();

  const handleInsert = (src: string, alt?: string) => {
    if (onInsertImage) {
      onInsertImage(src, alt);
    } else if (editorId) {
      insertImageIntoEditor(editorId, src, alt);
    }
    setShowInsertDialog(false);
  };

  return (
    <>
      <button
        onClick={() => setShowInsertDialog(true)}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] hover:opacity-80 transition-opacity min-w-[40px]"
        style={{ color: 'var(--foreground)' }}
        title="Insert Image"
      >
        <ImageIcon size={16} />
        <span>{label}</span>
      </button>
      {showInsertDialog && (
        <InsertImageDialog
          onClose={() => setShowInsertDialog(false)}
          onInsert={handleInsert}
        />
      )}
    </>
  );
}
