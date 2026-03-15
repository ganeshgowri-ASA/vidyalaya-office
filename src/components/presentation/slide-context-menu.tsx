'use client';

import React, { useEffect, useRef } from 'react';
import {
  Copy,
  Trash2,
  EyeOff,
  Eye,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { usePresentationStore, type SlideLayout } from '@/store/presentation-store';

interface SlideContextMenuProps {
  slideIndex: number;
  x: number;
  y: number;
  onClose: () => void;
}

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

export default function SlideContextMenu({ slideIndex, x, y, onClose }: SlideContextMenuProps) {
  const {
    slides,
    addSlide,
    duplicateSlide,
    deleteSlide,
    toggleSlideHidden,
  } = usePresentationStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const [showLayoutSub, setShowLayoutSub] = React.useState(false);

  const slide = slides[slideIndex];
  const isHidden = slide?.hidden ?? false;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 9999,
    background: 'var(--card)',
    borderColor: 'var(--border)',
    color: 'var(--card-foreground)',
    minWidth: 180,
  };

  return (
    <div
      ref={menuRef}
      className="rounded shadow-xl border py-1"
      style={menuStyle}
    >
      {/* New slide */}
      <div className="relative">
        <button
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity text-left"
          style={{ color: 'var(--card-foreground)' }}
          onMouseEnter={() => setShowLayoutSub(true)}
          onMouseLeave={() => setShowLayoutSub(false)}
          onClick={() => {
            addSlide('content', slideIndex);
            onClose();
          }}
        >
          <Plus size={14} />
          New Slide
          <LayoutGrid size={12} className="ml-auto opacity-50" />
        </button>
        {showLayoutSub && (
          <div
            className="absolute left-full top-0 rounded shadow-xl border py-1"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
              minWidth: 180,
            }}
            onMouseEnter={() => setShowLayoutSub(true)}
            onMouseLeave={() => setShowLayoutSub(false)}
          >
            <div
              className="px-3 py-1 text-xs font-medium opacity-50"
              style={{ color: 'var(--card-foreground)' }}
            >
              Choose Layout
            </div>
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  addSlide(opt.value, slideIndex);
                  onClose();
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

      {/* Duplicate */}
      <button
        onClick={() => {
          duplicateSlide(slideIndex);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity text-left"
        style={{ color: 'var(--card-foreground)' }}
      >
        <Copy size={14} />
        Duplicate Slide
      </button>

      {/* Hide/Show */}
      <button
        onClick={() => {
          toggleSlideHidden(slideIndex);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity text-left"
        style={{ color: 'var(--card-foreground)' }}
      >
        {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
        {isHidden ? 'Show Slide' : 'Hide Slide'}
      </button>

      <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

      {/* Delete */}
      <button
        onClick={() => {
          deleteSlide(slideIndex);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity text-left"
        style={{ color: '#ef4444' }}
        disabled={slides.length <= 1}
      >
        <Trash2 size={14} />
        Delete Slide
      </button>
    </div>
  );
}
