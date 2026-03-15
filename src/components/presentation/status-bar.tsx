'use client';

import React from 'react';
import { Minus, Plus, Rows3, Grid, Monitor } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

export default function StatusBar() {
  const {
    slides, activeSlideIndex, canvasZoom, setCanvasZoom,
    setPresenterMode, showSlideSorter, setShowSlideSorter,
    selectedElementId, currentTheme,
  } = usePresentationStore();

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find(e => e.id === selectedElementId);

  return (
    <div
      className="flex items-center justify-between px-3 py-1 border-t no-print"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--muted)',
        color: 'var(--muted-foreground)',
        fontSize: 11,
        height: 24,
        minHeight: 24,
      }}
    >
      {/* Left: Slide info */}
      <div className="flex items-center gap-3">
        <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
        {currentTheme && <span className="opacity-60">Theme: {currentTheme}</span>}
        {selectedElement && (
          <span className="opacity-60">
            {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
            {' '}({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
            {' '}{Math.round(selectedElement.width)}x{Math.round(selectedElement.height)}
          </span>
        )}
        {slide?.layout && (
          <span className="opacity-50">Layout: {slide.layout}</span>
        )}
      </div>

      {/* Right: View toggles and zoom */}
      <div className="flex items-center gap-2">
        {/* View toggles */}
        <button
          onClick={() => setShowSlideSorter(false)}
          className="p-0.5 rounded hover:opacity-80"
          style={{ color: !showSlideSorter ? 'var(--primary)' : 'var(--muted-foreground)' }}
          title="Normal View"
        >
          <Rows3 size={14} />
        </button>
        <button
          onClick={() => setShowSlideSorter(!showSlideSorter)}
          className="p-0.5 rounded hover:opacity-80"
          style={{ color: showSlideSorter ? 'var(--primary)' : 'var(--muted-foreground)' }}
          title="Slide Sorter"
        >
          <Grid size={14} />
        </button>
        <button
          onClick={() => setPresenterMode(true)}
          className="p-0.5 rounded hover:opacity-80"
          title="Slide Show (F5)"
        >
          <Monitor size={14} />
        </button>

        <div className="w-px h-3 mx-1" style={{ background: 'var(--border)' }} />

        {/* Zoom controls */}
        <button
          onClick={() => setCanvasZoom(Math.max(25, canvasZoom - 10))}
          className="p-0.5 rounded hover:opacity-80"
          title="Zoom out"
        >
          <Minus size={12} />
        </button>
        <input
          type="range"
          min={25}
          max={200}
          step={5}
          value={canvasZoom}
          onChange={(e) => setCanvasZoom(parseInt(e.target.value))}
          className="w-20 h-1 rounded appearance-none cursor-pointer"
          style={{ accentColor: 'var(--primary)' }}
        />
        <button
          onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 10))}
          className="p-0.5 rounded hover:opacity-80"
          title="Zoom in"
        >
          <Plus size={12} />
        </button>
        <span className="w-8 text-center">{canvasZoom}%</span>
      </div>
    </div>
  );
}
