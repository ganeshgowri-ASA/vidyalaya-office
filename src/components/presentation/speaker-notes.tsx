'use client';

import React from 'react';
import { usePresentationStore } from '@/store/presentation-store';

export default function SpeakerNotes() {
  const { slides, activeSlideIndex, updateSlideNotes } = usePresentationStore();
  const slide = slides[activeSlideIndex];

  if (!slide) return null;

  return (
    <div
      className="border-t no-print"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div className="px-3 py-1 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
        Speaker Notes
      </div>
      <textarea
        value={slide.notes}
        onChange={(e) => updateSlideNotes(activeSlideIndex, e.target.value)}
        placeholder="Add speaker notes for this slide..."
        className="w-full px-3 py-2 resize-none outline-none text-sm"
        style={{
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          height: 80,
        }}
      />
    </div>
  );
}
