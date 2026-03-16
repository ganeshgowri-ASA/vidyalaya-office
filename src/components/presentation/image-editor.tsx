'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  Image,
  Upload,
  Link,
  Crop,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  Check,
  Move,
  ZoomIn,
  ZoomOut,
  Grid,
} from 'lucide-react';
import {
  usePresentationStore,
  type ImageFilters,
  type ImageCrop,
} from '@/store/presentation-store';

/* ─── Filter presets ────────────────────────────────────────────── */

interface FilterPreset {
  name: string;
  filters: ImageFilters;
}

const FILTER_PRESETS: FilterPreset[] = [
  { name: 'Original', filters: {} },
  { name: 'Grayscale', filters: { grayscale: 100 } },
  { name: 'Sepia', filters: { sepia: 100 } },
  { name: 'High Contrast', filters: { contrast: 150, brightness: 110 } },
  { name: 'Blur', filters: { blur: 3 } },
  { name: 'Warm', filters: { sepia: 30, saturate: 130, hueRotate: -10 } },
  { name: 'Cool', filters: { saturate: 90, hueRotate: 180, brightness: 105 } },
  { name: 'Dramatic', filters: { contrast: 140, brightness: 90, saturate: 140, grayscale: 10 } },
  // Canva-like filter presets
  { name: 'Vivid', filters: { saturate: 160, contrast: 115, brightness: 105 } },
  { name: 'Muted', filters: { saturate: 60, contrast: 90, brightness: 105 } },
  { name: 'Vintage', filters: { sepia: 50, contrast: 85, brightness: 95, saturate: 80 } },
  { name: 'Noir', filters: { grayscale: 100, contrast: 130, brightness: 95 } },
  { name: 'Cinematic', filters: { contrast: 120, brightness: 90, saturate: 130, hueRotate: 5 } },
  { name: 'Faded', filters: { contrast: 80, brightness: 115, saturate: 70 } },
  { name: 'Bright Pop', filters: { brightness: 120, saturate: 140, contrast: 110 } },
  { name: 'Duotone', filters: { grayscale: 80, sepia: 40, hueRotate: 30, saturate: 150 } },
  { name: 'Soft Glow', filters: { brightness: 115, contrast: 85, blur: 0.5 } },
  { name: 'Dark Mood', filters: { brightness: 75, contrast: 140, saturate: 120 } },
  { name: 'Retro', filters: { sepia: 60, saturate: 80, contrast: 95, hueRotate: -15 } },
  { name: 'Crisp', filters: { contrast: 130, brightness: 100, saturate: 110 } },
];

/* ─── Sample gallery images (placeholder) ───────────────────────── */

const GALLERY_IMAGES = [
  { src: 'https://placehold.co/400x300/e2e8f0/64748b?text=Landscape', label: 'Landscape' },
  { src: 'https://placehold.co/400x300/fce4ec/e91e63?text=Nature', label: 'Nature' },
  { src: 'https://placehold.co/400x300/e8eaf6/3f51b5?text=Business', label: 'Business' },
  { src: 'https://placehold.co/400x300/e0f2f1/009688?text=Technology', label: 'Technology' },
  { src: 'https://placehold.co/400x300/fff3e0/ff9800?text=Abstract', label: 'Abstract' },
  { src: 'https://placehold.co/400x300/f3e5f5/9c27b0?text=People', label: 'People' },
];

/* ─── Filter slider definitions ─────────────────────────────────── */

interface FilterControl {
  key: keyof ImageFilters;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

const FILTER_CONTROLS: FilterControl[] = [
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1, defaultValue: 100, unit: '%' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1, defaultValue: 100, unit: '%' },
  { key: 'saturate', label: 'Saturation', min: 0, max: 200, step: 1, defaultValue: 100, unit: '%' },
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.1, defaultValue: 0, unit: 'px' },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, defaultValue: 0, unit: '%' },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1, defaultValue: 0, unit: '%' },
  { key: 'hueRotate', label: 'Hue Rotate', min: -180, max: 180, step: 1, defaultValue: 0, unit: '°' },
];

/* ─── Helpers ────────────────────────────────────────────────────── */

function buildCssFilter(filters: ImageFilters): string {
  const parts: string[] = [];
  if (filters.brightness != null && filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast != null && filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate != null && filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.blur != null && filters.blur !== 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale != null && filters.grayscale !== 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia != null && filters.sepia !== 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.hueRotate != null && filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  return parts.length ? parts.join(' ') : 'none';
}

function defaultFilters(): ImageFilters {
  return {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
  };
}

/* ─── Tabs ───────────────────────────────────────────────────────── */

type Tab = 'insert' | 'crop' | 'filters' | 'presets';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'insert', label: 'Insert', icon: <Image size={13} /> },
  { id: 'crop', label: 'Crop', icon: <Crop size={13} /> },
  { id: 'filters', label: 'Filters', icon: <SlidersHorizontal size={13} /> },
  { id: 'presets', label: 'Presets', icon: <Sparkles size={13} /> },
];

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export default function ImageEditor() {
  const {
    showImageEditor,
    setShowImageEditor,
    slides,
    activeSlideIndex,
    selectedElementId,
    updateImageFilters,
    updateImageCrop,
    updateElement,
    addElement,
    pushUndo,
  } = usePresentationStore();

  const [activeTab, setActiveTab] = useState<Tab>('insert');
  const [imageUrl, setImageUrl] = useState('');
  const [filters, setFilters] = useState<ImageFilters>(defaultFilters());
  const [crop, setCrop] = useState<ImageCrop>({ x: 0, y: 0, width: 100, height: 100 });
  const [resizeWidth, setResizeWidth] = useState(400);
  const [resizeHeight, setResizeHeight] = useState(300);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(400 / 300);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingCrop = useRef(false);
  const cropDragStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find((el) => el.id === selectedElementId);
  const isImageSelected = selectedElement?.type === 'image';
  const previewSrc = isImageSelected ? selectedElement.content : '';

  /* Sync local state when selected element changes */
  useEffect(() => {
    if (isImageSelected && selectedElement) {
      setFilters({
        ...defaultFilters(),
        ...selectedElement.imageFilters,
      });
      if (selectedElement.imageCrop) {
        setCrop(selectedElement.imageCrop);
      }
      setResizeWidth(selectedElement.width);
      setResizeHeight(selectedElement.height);
      setAspectRatio(selectedElement.width / selectedElement.height);
    }
  }, [isImageSelected, selectedElement?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Insert handlers ──────────────────────────────────────────── */

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) return;

        pushUndo();
        addElement(activeSlideIndex, {
          type: 'image',
          x: 100,
          y: 100,
          width: 400,
          height: 300,
          content: dataUrl,
          style: {},
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [activeSlideIndex, addElement, pushUndo],
  );

  const handleInsertFromUrl = useCallback(() => {
    const url = imageUrl.trim();
    if (!url) return;

    pushUndo();
    addElement(activeSlideIndex, {
      type: 'image',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      content: url,
      style: {},
    });
    setImageUrl('');
  }, [imageUrl, activeSlideIndex, addElement, pushUndo]);

  const handleInsertGalleryImage = useCallback(
    (src: string) => {
      pushUndo();
      addElement(activeSlideIndex, {
        type: 'image',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        content: src,
        style: {},
      });
    },
    [activeSlideIndex, addElement, pushUndo],
  );

  /* ─── Filter handlers ──────────────────────────────────────────── */

  const handleFilterChange = useCallback(
    (key: keyof ImageFilters, value: number) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters());
  }, []);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    setFilters({ ...defaultFilters(), ...preset.filters });
  }, []);

  /* ─── Crop drag handlers ───────────────────────────────────────── */

  const handleCropMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingCrop.current = true;
      cropDragStart.current = {
        x: e.clientX,
        y: e.clientY,
        cropX: crop.x,
        cropY: crop.y,
      };
    },
    [crop.x, crop.y],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCrop.current || !cropContainerRef.current) return;

      const rect = cropContainerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - cropDragStart.current.x) / rect.width) * 100;
      const dy = ((e.clientY - cropDragStart.current.y) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100 - crop.width, cropDragStart.current.cropX + dx));
      const newY = Math.max(0, Math.min(100 - crop.height, cropDragStart.current.cropY + dy));

      setCrop((prev) => ({ ...prev, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 }));
    };

    const handleMouseUp = () => {
      isDraggingCrop.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [crop.width, crop.height]);

  /* ─── Resize handlers ──────────────────────────────────────────── */

  const handleResizeWidth = useCallback(
    (w: number) => {
      setResizeWidth(w);
      if (lockAspectRatio) {
        setResizeHeight(Math.round(w / aspectRatio));
      }
    },
    [lockAspectRatio, aspectRatio],
  );

  const handleResizeHeight = useCallback(
    (h: number) => {
      setResizeHeight(h);
      if (lockAspectRatio) {
        setResizeWidth(Math.round(h * aspectRatio));
      }
    },
    [lockAspectRatio, aspectRatio],
  );

  /* ─── Apply to element ─────────────────────────────────────────── */

  const handleApply = useCallback(() => {
    if (!isImageSelected || !selectedElementId) return;

    pushUndo();
    updateImageFilters(activeSlideIndex, selectedElementId, filters);
    updateImageCrop(activeSlideIndex, selectedElementId, crop);
    updateElement(activeSlideIndex, selectedElementId, {
      width: resizeWidth,
      height: resizeHeight,
    });
  }, [
    isImageSelected,
    selectedElementId,
    activeSlideIndex,
    filters,
    crop,
    resizeWidth,
    resizeHeight,
    pushUndo,
    updateImageFilters,
    updateImageCrop,
    updateElement,
  ]);

  /* ─── Guard ────────────────────────────────────────────────────── */

  if (!showImageEditor) return null;

  /* ─── Render ───────────────────────────────────────────────────── */

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 300,
        minWidth: 300,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--foreground)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          <Image size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Image Editor</span>
        </div>
        <button
          onClick={() => setShowImageEditor(false)}
          className="rounded p-1 transition-colors hover:opacity-70"
          aria-label="Close image editor"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div
        className="flex border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors"
            style={{
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--foreground)',
              opacity: activeTab === tab.id ? 1 : 0.6,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Body (scrollable) ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* ═══ Preview ══════════════════════════════════════════ */}
        {isImageSelected && previewSrc && activeTab !== 'insert' && (
          <div className="px-3 pt-3">
            <div
              className="relative overflow-hidden rounded-md border"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
            >
              <img
                src={previewSrc}
                alt="Preview"
                className="w-full h-auto object-contain"
                style={{
                  filter: buildCssFilter(filters),
                  maxHeight: 160,
                }}
              />
            </div>
          </div>
        )}

        {/* ═══ Insert Tab ═══════════════════════════════════════ */}
        {activeTab === 'insert' && (
          <div className="p-3 space-y-4">
            {/* File upload */}
            <section>
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1.5 block">
                Upload Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-3 text-xs font-medium transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--border)' }}
              >
                <Upload size={14} />
                Choose Image File
              </button>
            </section>

            {/* URL input */}
            <section>
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1.5 block">
                Image URL
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Link size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInsertFromUrl()}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-md border py-1.5 pl-7 pr-2 text-xs outline-none focus:ring-1"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
                <button
                  onClick={handleInsertFromUrl}
                  disabled={!imageUrl.trim()}
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                  }}
                >
                  Insert
                </button>
              </div>
            </section>

            {/* Gallery */}
            <section>
              <label className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1.5 block">
                <Grid size={12} className="inline mr-1 -mt-0.5" />
                Image Gallery
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {GALLERY_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    onClick={() => handleInsertGalleryImage(img.src)}
                    className="group relative overflow-hidden rounded-md border transition-all hover:ring-2"
                    style={{
                      borderColor: 'var(--border)',
                      '--tw-ring-color': 'var(--primary)',
                    } as React.CSSProperties}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-16 object-cover"
                      loading="lazy"
                    />
                    <span
                      className="absolute bottom-0 inset-x-0 text-[10px] font-medium py-0.5 text-center"
                      style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                    >
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ═══ Crop Tab ═════════════════════════════════════════ */}
        {activeTab === 'crop' && (
          <div className="p-3 space-y-4">
            {!isImageSelected ? (
              <p className="text-xs opacity-60 text-center py-6">
                Select an image element to use the crop tool.
              </p>
            ) : (
              <>
                {/* Crop area */}
                <section>
                  <label className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1.5 block">
                    Crop Area
                  </label>
                  <div
                    ref={cropContainerRef}
                    className="relative overflow-hidden rounded-md border"
                    style={{
                      borderColor: 'var(--border)',
                      background: '#000',
                      height: 180,
                    }}
                  >
                    {/* Full image (dimmed) */}
                    <img
                      src={previewSrc}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain opacity-30"
                    />

                    {/* Crop overlay (draggable) */}
                    <div
                      onMouseDown={handleCropMouseDown}
                      className="absolute border-2 cursor-move"
                      style={{
                        left: `${crop.x}%`,
                        top: `${crop.y}%`,
                        width: `${crop.width}%`,
                        height: `${crop.height}%`,
                        borderColor: 'var(--primary)',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                        zIndex: 2,
                      }}
                    >
                      {/* Corner handles */}
                      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                        <div
                          key={pos}
                          className="absolute w-2.5 h-2.5 rounded-sm"
                          style={{
                            background: 'var(--primary)',
                            top: pos.includes('top') ? -4 : undefined,
                            bottom: pos.includes('bottom') ? -4 : undefined,
                            left: pos.includes('left') ? -4 : undefined,
                            right: pos.includes('right') ? -4 : undefined,
                          }}
                        />
                      ))}
                      <Move size={14} className="absolute inset-0 m-auto opacity-60" style={{ color: '#fff' }} />
                    </div>
                  </div>
                </section>

                {/* Crop inputs */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'X (%)', value: crop.x, key: 'x' as const },
                    { label: 'Y (%)', value: crop.y, key: 'y' as const },
                    { label: 'W (%)', value: crop.width, key: 'width' as const },
                    { label: 'H (%)', value: crop.height, key: 'height' as const },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] opacity-60 block mb-0.5">{field.label}</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={Math.round(field.value)}
                        onChange={(e) =>
                          setCrop((prev) => ({
                            ...prev,
                            [field.key]: Math.max(0, Math.min(100, Number(e.target.value))),
                          }))
                        }
                        className="w-full rounded border px-2 py-1 text-xs outline-none focus:ring-1"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--card)',
                          color: 'var(--foreground)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Resize controls */}
                <section>
                  <label className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1.5 block">
                    Resize
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] opacity-60 block mb-0.5">Width (px)</label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleResizeWidth(Math.max(50, resizeWidth - 10))}
                          className="rounded border p-0.5 transition-colors hover:opacity-70"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <ZoomOut size={12} />
                        </button>
                        <input
                          type="number"
                          min={50}
                          max={1920}
                          value={resizeWidth}
                          onChange={(e) => handleResizeWidth(Number(e.target.value))}
                          className="w-full rounded border px-2 py-1 text-xs outline-none focus:ring-1"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        />
                        <button
                          onClick={() => handleResizeWidth(Math.min(1920, resizeWidth + 10))}
                          className="rounded border p-0.5 transition-colors hover:opacity-70"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <ZoomIn size={12} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] opacity-60 block mb-0.5">Height (px)</label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleResizeHeight(Math.max(50, resizeHeight - 10))}
                          className="rounded border p-0.5 transition-colors hover:opacity-70"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <ZoomOut size={12} />
                        </button>
                        <input
                          type="number"
                          min={50}
                          max={1080}
                          value={resizeHeight}
                          onChange={(e) => handleResizeHeight(Number(e.target.value))}
                          className="w-full rounded border px-2 py-1 text-xs outline-none focus:ring-1"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        />
                        <button
                          onClick={() => handleResizeHeight(Math.min(1080, resizeHeight + 10))}
                          className="rounded border p-0.5 transition-colors hover:opacity-70"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <ZoomIn size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspectRatio}
                      onChange={(e) => setLockAspectRatio(e.target.checked)}
                      className="rounded"
                    />
                    Lock aspect ratio
                  </label>
                </section>
              </>
            )}
          </div>
        )}

        {/* ═══ Filters Tab ══════════════════════════════════════ */}
        {activeTab === 'filters' && (
          <div className="p-3 space-y-3">
            {!isImageSelected ? (
              <p className="text-xs opacity-60 text-center py-6">
                Select an image element to adjust filters.
              </p>
            ) : (
              <>
                {FILTER_CONTROLS.map((ctrl) => (
                  <div key={ctrl.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium">{ctrl.label}</label>
                      <span className="text-[10px] tabular-nums opacity-60">
                        {filters[ctrl.key] ?? ctrl.defaultValue}
                        {ctrl.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={filters[ctrl.key] ?? ctrl.defaultValue}
                      onChange={(e) => handleFilterChange(ctrl.key, Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        accentColor: 'var(--primary)',
                        background: 'var(--border)',
                      }}
                    />
                  </div>
                ))}

                <button
                  onClick={handleResetFilters}
                  className="flex items-center justify-center gap-1.5 w-full rounded-md border py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <RotateCcw size={12} />
                  Reset Filters
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══ Presets Tab ══════════════════════════════════════ */}
        {activeTab === 'presets' && (
          <div className="p-3 space-y-3">
            {!isImageSelected ? (
              <p className="text-xs opacity-60 text-center py-6">
                Select an image element to apply presets.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {FILTER_PRESETS.map((preset) => {
                  const presetFilter = buildCssFilter({ ...defaultFilters(), ...preset.filters });
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset)}
                      className="group relative overflow-hidden rounded-md border transition-all hover:ring-2"
                      style={{
                        borderColor: 'var(--border)',
                        '--tw-ring-color': 'var(--primary)',
                      } as React.CSSProperties}
                    >
                      <img
                        src={previewSrc}
                        alt={preset.name}
                        className="w-full h-14 object-cover"
                        style={{ filter: presetFilter }}
                      />
                      <span
                        className="absolute bottom-0 inset-x-0 text-[10px] font-medium py-0.5 text-center"
                        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                      >
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer actions ──────────────────────────────────────── */}
      {isImageSelected && activeTab !== 'insert' && (
        <div
          className="shrink-0 flex gap-2 px-3 py-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={handleResetFilters}
            className="flex-1 flex items-center justify-center gap-1 rounded-md border py-1.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border)' }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: '#fff',
            }}
          >
            <Check size={12} />
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
