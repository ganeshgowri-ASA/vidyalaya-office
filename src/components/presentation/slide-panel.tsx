'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, EyeOff } from 'lucide-react';
import { usePresentationStore, type SlideLayout } from '@/store/presentation-store';
import SlideContextMenu from './slide-context-menu';

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

interface ContextMenuState {
  slideIndex: number;
  x: number;
  y: number;
}

export default function SlidePanel() {
  const {
    slides,
    activeSlideIndex,
    setActiveSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlide,
  } = usePresentationStore();

  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({
      slideIndex: index,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      className="flex flex-col h-full border-r"
      style={{
        width: 200,
        minWidth: 200,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Add slide button */}
      <div className="p-2 border-b relative" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          <Plus size={16} />
          Add Slide
        </button>
        {showLayoutMenu && (
          <div
            className="absolute left-2 right-2 mt-1 rounded shadow-lg z-50 border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  addSlide(opt.value, activeSlideIndex);
                  setShowLayoutMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--card-foreground)' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slide thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => setActiveSlide(index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
            className="cursor-pointer rounded overflow-hidden border-2 transition-all"
            style={{
              borderColor: index === activeSlideIndex ? 'var(--primary)' : 'var(--border)',
              aspectRatio: '16/9',
              opacity: slide.hidden ? 0.5 : 1,
            }}
          >
            {/* Mini slide preview */}
            <div
              className="w-full h-full relative"
              style={{
                background: slide.background,
              }}
            >
              {/* Hidden indicator */}
              {slide.hidden && (
                <div className="absolute top-0.5 left-1">
                  <EyeOff size={10} className="text-white/70" />
                </div>
              )}
              {/* Slide number */}
              <div
                className="absolute bottom-0.5 right-1 text-white font-bold drop-shadow"
                style={{ fontSize: 10 }}
              >
                {index + 1}
              </div>
              {/* Mini text preview */}
              {slide.elements.slice(0, 2).map((el) => (
                <div
                  key={el.id}
                  className="absolute overflow-hidden"
                  style={{
                    left: `${(el.x / 960) * 100}%`,
                    top: `${(el.y / 540) * 100}%`,
                    width: `${(el.width / 960) * 100}%`,
                    height: `${(el.height / 540) * 100}%`,
                    fontSize: 4,
                    color: el.style.color || '#fff',
                    fontWeight: el.style.fontWeight || 'normal',
                  }}
                >
                  {el.type === 'text' ? el.content : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slide actions */}
      <div
        className="p-2 border-t flex items-center justify-center gap-1"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => duplicateSlide(activeSlideIndex)}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          title="Duplicate slide"
          style={{ color: 'var(--sidebar-foreground)' }}
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => deleteSlide(activeSlideIndex)}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          title="Delete slide"
          style={{ color: 'var(--sidebar-foreground)' }}
          disabled={slides.length <= 1}
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={() => moveSlide(activeSlideIndex, activeSlideIndex - 1)}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          title="Move up"
          style={{ color: 'var(--sidebar-foreground)' }}
          disabled={activeSlideIndex === 0}
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => moveSlide(activeSlideIndex, activeSlideIndex + 1)}
          className="p-1.5 rounded hover:opacity-80 transition-opacity"
          title="Move down"
          style={{ color: 'var(--sidebar-foreground)' }}
          disabled={activeSlideIndex === slides.length - 1}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <SlideContextMenu
          slideIndex={contextMenu.slideIndex}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
