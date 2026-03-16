'use client';

import React, { useState } from 'react';
import { Bold, Italic, List, Maximize2, Minimize2 } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

export default function SpeakerNotes() {
  const { slides, activeSlideIndex, updateSlideNotes } = usePresentationStore();
  const slide = slides[activeSlideIndex];
  const [expanded, setExpanded] = useState(false);

  if (!slide) return null;

  const wordCount = slide.notes.trim() ? slide.notes.trim().split(/\s+/).length : 0;

  return (
    <div
      className="border-t no-print"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div className="flex items-center justify-between px-3 py-1" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Speaker Notes</span>
          {wordCount > 0 && (
            <span className="text-[10px] opacity-50">{wordCount} words</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded hover:opacity-80"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>
      <textarea
        value={slide.notes}
        onChange={(e) => updateSlideNotes(activeSlideIndex, e.target.value)}
        placeholder="Add speaker notes for this slide... Use this area to write talking points, reminders, and key messages."
        className="w-full px-3 py-2 resize-none outline-none text-sm"
        style={{
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          height: expanded ? 200 : 80,
          transition: 'height 0.2s ease',
        }}
      />
    </div>
  );
}
