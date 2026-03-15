'use client';

import React from 'react';
import { EyeOff, X } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

export default function SlideSorter() {
  const {
    slides, activeSlideIndex, showSlideSorter,
    setActiveSlide, setShowSlideSorter, moveSlide, pushUndo,
  } = usePresentationStore();

  if (!showSlideSorter) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== targetIndex) {
      pushUndo();
      moveSlide(fromIndex, targetIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div
      className="fixed inset-0 z-[999] overflow-auto p-8"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Slide Sorter</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-60">{slides.length} slides</span>
          <button
            onClick={() => setShowSlideSorter(false)}
            className="p-1.5 rounded hover:opacity-80"
            style={{ color: 'var(--foreground)' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {slides.map((s, index) => (
          <div
            key={s.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => { setActiveSlide(index); setShowSlideSorter(false); }}
            className="cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 relative group"
            style={{
              borderColor: index === activeSlideIndex ? 'var(--primary)' : 'var(--border)',
              aspectRatio: '16/9',
              opacity: s.hidden ? 0.5 : 1,
            }}
          >
            <div className="w-full h-full relative" style={{ background: s.background }}>
              {s.hidden && (
                <div className="absolute top-1 left-1">
                  <EyeOff size={14} className="text-white/60" />
                </div>
              )}
              {/* Mini element previews */}
              {s.elements.slice(0, 3).map((el) => (
                <div key={el.id} className="absolute overflow-hidden"
                  style={{
                    left: `${(el.x / 960) * 100}%`, top: `${(el.y / 540) * 100}%`,
                    width: `${(el.width / 960) * 100}%`, height: `${(el.height / 540) * 100}%`,
                    fontSize: 5, color: el.style.color || '#fff', fontWeight: el.style.fontWeight || 'normal',
                  }}>
                  {el.type === 'text' ? el.content : ''}
                </div>
              ))}
              <div className="absolute bottom-1 right-2 text-white font-bold text-xs drop-shadow">
                {index + 1}
              </div>
              {/* Transition indicator */}
              {s.transition && s.transition !== 'none' && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded px-1 py-0.5" style={{ fontSize: 7 }}>
                  {s.transition}
                </div>
              )}
            </div>
            {/* Layout label */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ fontSize: 9, padding: '1px 0' }}>
              {s.layout}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs opacity-40 mt-4 text-center">
        Drag and drop to reorder slides. Click a slide to edit it.
      </p>
    </div>
  );
}
