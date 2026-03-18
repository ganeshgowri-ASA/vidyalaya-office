'use client';

import React, { useState } from 'react';
import { X, ZoomIn, Plus, Check, Search, Layers, Navigation } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

type ZoomType = 'slide' | 'section' | 'summary';

interface SlideZoomItem {
  slideIndex: number;
  label: string;
}

export default function SlideZoomModal() {
  const {
    showSlideZoom, setShowSlideZoom,
    slides, sections, setActiveSlide,
    addElement, activeSlideIndex, pushUndo,
  } = usePresentationStore();

  const [zoomType, setZoomType] = useState<ZoomType>('slide');
  const [selectedSlides, setSelectedSlides] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!showSlideZoom) return null;

  const filteredSlides = slides.map((slide, idx) => {
    const textEls = slide.elements.filter(e => e.type === 'text');
    const title = textEls[0]?.content || `Slide ${idx + 1}`;
    return { slide, idx, title };
  }).filter(({ title }) =>
    !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSlide = (idx: number) => {
    setSelectedSlides(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleInsert = () => {
    if (selectedSlides.length === 0) return;
    pushUndo();

    // For summary/section zoom, create one element linking multiple slides
    // For slide zoom, create one element per slide
    const zoomItems: SlideZoomItem[] = selectedSlides.map(slideIndex => ({
      slideIndex,
      label: (() => {
        const s = slides[slideIndex];
        const t = s?.elements.find(e => e.type === 'text');
        return t?.content || `Slide ${slideIndex + 1}`;
      })(),
    }));

    if (zoomType === 'summary') {
      // Insert a summary zoom element
      addElement(activeSlideIndex, {
        type: 'shape',
        x: 80, y: 80,
        width: 800, height: 400,
        content: `zoom:summary:${JSON.stringify(zoomItems.map(z => z.slideIndex))}`,
        style: {
          backgroundColor: 'rgba(59,130,246,0.1)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderStyle: 'dashed',
          borderRadius: '8px',
        },
      });
    } else {
      // Insert one zoom thumbnail per selected slide
      const cols = Math.min(selectedSlides.length, 4);
      const thumbW = Math.floor((800 - (cols - 1) * 16) / cols);
      const thumbH = Math.floor(thumbW * 9 / 16);
      selectedSlides.forEach((slideIdx, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        addElement(activeSlideIndex, {
          type: 'shape',
          x: 80 + col * (thumbW + 16),
          y: 60 + row * (thumbH + 40),
          width: thumbW,
          height: thumbH,
          content: `zoom:slide:${slideIdx}`,
          style: {
            backgroundColor: slides[slideIdx]?.background?.startsWith('#')
              ? slides[slideIdx].background
              : '#1e3a5f',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: '6px',
          },
        });
      });
    }

    setShowSlideZoom(false);
    setSelectedSlides([]);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div
        className="rounded-xl shadow-2xl border w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <ZoomIn size={18} style={{ color: 'var(--primary)' }} />
            <span className="font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>Insert Slide Zoom</span>
          </div>
          <button onClick={() => setShowSlideZoom(false)} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--muted-foreground)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Zoom type tabs */}
        <div className="flex border-b px-4 pt-3 gap-1" style={{ borderColor: 'var(--border)' }}>
          {([
            { id: 'slide' as ZoomType, label: 'Slide Zoom', icon: <ZoomIn size={14} />, desc: 'Link to specific slides' },
            { id: 'summary' as ZoomType, label: 'Summary Zoom', icon: <Layers size={14} />, desc: 'Overview of sections' },
          ] as Array<{ id: ZoomType; label: string; icon: React.ReactNode; desc: string }>).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setZoomType(tab.id); setSelectedSlides([]); }}
              className="flex items-center gap-2 px-3 py-2 rounded-t text-sm font-medium transition-all"
              style={{
                background: zoomType === tab.id ? 'var(--accent)' : 'transparent',
                color: zoomType === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottom: zoomType === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="px-5 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {zoomType === 'slide' && (
            'Select slides to create zoom thumbnails. Click a thumbnail during the presentation to jump to that slide, then return automatically.'
          )}
          {zoomType === 'summary' && (
            'Create an interactive overview. Select slides to include in your summary. During the presentation, navigate to any section and return to the summary.'
          )}
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search slides..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-sm"
              style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        {/* Slide grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {selectedSlides.length} selected
            </span>
            {selectedSlides.length > 0 && (
              <button
                onClick={() => setSelectedSlides([])}
                className="text-xs hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {filteredSlides.map(({ slide, idx, title }) => {
              const isSelected = selectedSlides.includes(idx);
              return (
                <button
                  key={slide.id}
                  onClick={() => toggleSlide(idx)}
                  className="relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all hover:opacity-90"
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    borderWidth: isSelected ? 2 : 1,
                    background: isSelected ? 'var(--accent)' : 'var(--card)',
                  }}
                >
                  {/* Slide thumbnail */}
                  <div
                    className="w-full rounded border overflow-hidden"
                    style={{ aspectRatio: '16/9', background: slide.background || '#1e293b', borderColor: 'var(--border)' }}
                  >
                    {slide.elements.filter(e => e.type === 'text').slice(0, 1).map(el => (
                      <div
                        key={el.id}
                        className="px-1 pt-1 text-[7px] truncate font-medium"
                        style={{ color: el.style.color || '#fff' }}
                      >
                        {el.content}
                      </div>
                    ))}
                  </div>
                  {/* Slide number & title */}
                  <div className="w-full text-center">
                    <div className="text-[10px] font-semibold truncate" style={{ color: 'var(--card-foreground)' }}>
                      {idx + 1}. {title.length > 16 ? title.slice(0, 16) + '…' : title}
                    </div>
                  </div>
                  {/* Selection check */}
                  {isSelected && (
                    <div
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--primary)' }}
                    >
                      <Check size={10} style={{ color: 'var(--primary-foreground)' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <Navigation size={13} />
            <span>Clicking zoom objects during slideshow navigates to that slide</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSlideZoom(false); setSelectedSlides([]); }}
              className="px-4 py-1.5 rounded-lg text-sm border hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={selectedSlides.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Plus size={14} />
              Insert {zoomType === 'summary' ? 'Summary Zoom' : `${selectedSlides.length} Zoom${selectedSlides.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
