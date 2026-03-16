'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  EyeOff, X, Plus, FolderOpen, ChevronDown, ChevronRight,
  Trash2, Copy, GripVertical, LayoutGrid, Rows3, ZoomIn, ZoomOut,
  Shuffle, Eye, Lock, Unlock,
} from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

type ViewMode = 'grid' | 'list';
type ThumbnailSize = 'small' | 'medium' | 'large';

export default function SlideSorter() {
  const {
    slides, activeSlideIndex, showSlideSorter, sections,
    setActiveSlide, setShowSlideSorter, moveSlide, pushUndo,
    duplicateSlide, deleteSlide, toggleSlideHidden,
    addSection, updateSection, removeSection,
  } = usePresentationStore();

  const [selectedSlides, setSelectedSlides] = useState<Set<number>>(new Set());
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>('medium');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  if (!showSlideSorter) return null;

  const gridCols = {
    small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    large: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
  };

  const handleSlideClick = (index: number, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const newSet = new Set(selectedSlides);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      setSelectedSlides(newSet);
    } else if (e.shiftKey && selectedSlides.size > 0) {
      const lastSelected = Math.max(...Array.from(selectedSlides));
      const newSet = new Set(selectedSlides);
      const [start, end] = [Math.min(lastSelected, index), Math.max(lastSelected, index)];
      for (let i = start; i <= end; i++) newSet.add(i);
      setSelectedSlides(newSet);
    } else {
      setSelectedSlides(new Set([index]));
      setActiveSlide(index);
    }
  };

  const handleDoubleClick = (index: number) => {
    setActiveSlide(index);
    setShowSlideSorter(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    dragCounter.current = 0;
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== targetIndex && !isNaN(fromIndex)) {
      pushUndo();
      moveSlide(fromIndex, targetIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleBulkDelete = () => {
    if (selectedSlides.size === 0) return;
    pushUndo();
    const sorted = Array.from(selectedSlides).sort((a, b) => b - a);
    sorted.forEach(idx => {
      if (slides.length > 1) deleteSlide(idx);
    });
    setSelectedSlides(new Set());
  };

  const handleBulkDuplicate = () => {
    if (selectedSlides.size === 0) return;
    pushUndo();
    const sorted = Array.from(selectedSlides).sort((a, b) => a - b);
    sorted.forEach((idx, i) => duplicateSlide(idx + i));
    setSelectedSlides(new Set());
  };

  const handleSelectAll = () => {
    setSelectedSlides(new Set(slides.map((_, i) => i)));
  };

  const handleSelectNone = () => {
    setSelectedSlides(new Set());
  };

  const handleCreateSection = () => {
    if (!newSectionName.trim()) return;
    const slideIds = Array.from(selectedSlides).map(i => slides[i].id);
    addSection(newSectionName, slideIds.length > 0 ? slideIds : []);
    setNewSectionName('');
    setShowNewSection(false);
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b px-6 py-3" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Slide Sorter</h2>
            <span className="text-sm opacity-60">{slides.length} slides</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Selection controls */}
            {selectedSlides.size > 0 ? (
              <div className="flex items-center gap-1 mr-2 border-r pr-2" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs opacity-60">{selectedSlides.size} selected</span>
                <button onClick={handleBulkDuplicate} className="p-1.5 rounded hover:opacity-80" title="Duplicate selected">
                  <Copy size={15} />
                </button>
                <button onClick={handleBulkDelete} className="p-1.5 rounded hover:opacity-80 text-red-500" title="Delete selected">
                  <Trash2 size={15} />
                </button>
                <button onClick={() => {
                  pushUndo();
                  Array.from(selectedSlides).forEach(idx => toggleSlideHidden(idx));
                }} className="p-1.5 rounded hover:opacity-80" title="Toggle hidden">
                  <EyeOff size={15} />
                </button>
                <button onClick={handleSelectNone} className="text-xs px-1.5 py-0.5 rounded border hover:opacity-80"
                  style={{ borderColor: 'var(--border)' }}>
                  Clear
                </button>
              </div>
            ) : (
              <button onClick={handleSelectAll} className="text-xs px-2 py-1 rounded border hover:opacity-80 mr-2"
                style={{ borderColor: 'var(--border)' }}>
                Select All
              </button>
            )}

            {/* View controls */}
            <div className="flex items-center gap-1 border rounded" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setViewMode('grid')}
                className="p-1.5 rounded-l"
                style={{ background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'var(--primary-foreground)' : 'var(--foreground)' }}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')}
                className="p-1.5 rounded-r"
                style={{ background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? 'var(--primary-foreground)' : 'var(--foreground)' }}>
                <Rows3 size={14} />
              </button>
            </div>

            {/* Thumbnail size */}
            <div className="flex items-center gap-1">
              <button onClick={() => setThumbnailSize('small')} className="p-1 rounded hover:opacity-80" title="Small">
                <ZoomOut size={14} style={{ opacity: thumbnailSize === 'small' ? 1 : 0.4 }} />
              </button>
              <button onClick={() => setThumbnailSize('large')} className="p-1 rounded hover:opacity-80" title="Large">
                <ZoomIn size={14} style={{ opacity: thumbnailSize === 'large' ? 1 : 0.4 }} />
              </button>
            </div>

            {/* Section */}
            <div className="relative">
              <button onClick={() => setShowNewSection(!showNewSection)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                <FolderOpen size={14} /> Section
              </button>
              {showNewSection && (
                <div className="absolute right-0 top-full mt-1 p-2 rounded shadow-xl z-50 border"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 200 }}>
                  <input value={newSectionName} onChange={e => setNewSectionName(e.target.value)}
                    placeholder="Section name..."
                    className="w-full px-2 py-1 text-xs rounded border mb-2 outline-none"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateSection(); }} />
                  <button onClick={handleCreateSection}
                    className="w-full px-2 py-1 rounded text-xs"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                    Create Section
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setShowSlideSorter(false)} className="p-1.5 rounded hover:opacity-80 ml-2" style={{ color: 'var(--foreground)' }}>
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Sections */}
        {sections.length > 0 && (
          <div className="mb-6 space-y-2">
            {sections.map(section => (
              <div key={section.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => updateSection(section.id, { collapsed: !section.collapsed })} className="hover:opacity-80">
                    {section.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <span className="text-sm font-medium">{section.name}</span>
                  <span className="text-xs opacity-50">{section.slideIds.length} slides</span>
                  <button onClick={() => removeSection(section.id)} className="ml-auto p-1 hover:opacity-80 text-red-400">
                    <X size={12} />
                  </button>
                </div>
                {!section.collapsed && (
                  <div className="grid grid-cols-4 gap-2">
                    {section.slideIds.map(id => {
                      const idx = slides.findIndex(s => s.id === id);
                      const s = slides[idx];
                      if (!s) return null;
                      return (
                        <div key={s.id} className="rounded overflow-hidden border cursor-pointer hover:scale-105 transition-all"
                          style={{ borderColor: selectedSlides.has(idx) ? 'var(--primary)' : 'var(--border)', aspectRatio: '16/9', opacity: s.hidden ? 0.5 : 1, borderWidth: selectedSlides.has(idx) ? 2 : 1 }}
                          onClick={(e) => handleSlideClick(idx, e)}
                          onDoubleClick={() => handleDoubleClick(idx)}>
                          <div className="w-full h-full relative" style={{ background: s.background }}>
                            <div className="absolute bottom-1 right-2 text-white font-bold text-xs drop-shadow">{idx + 1}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Slides */}
        {viewMode === 'grid' ? (
          <div className={`grid ${gridCols[thumbnailSize]} gap-4`}>
            {slides.map((s, index) => (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onClick={(e) => handleSlideClick(index, e)}
                onDoubleClick={() => handleDoubleClick(index)}
                className="cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg relative group"
                style={{
                  borderColor: dragOverIndex === index
                    ? '#f59e0b'
                    : selectedSlides.has(index)
                      ? '#3b82f6'
                      : index === activeSlideIndex ? 'var(--primary)' : 'var(--border)',
                  aspectRatio: '16/9',
                  opacity: draggingIndex === index ? 0.5 : s.hidden ? 0.5 : 1,
                  transform: dragOverIndex === index ? 'scale(1.05)' : undefined,
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="w-full h-full relative" style={{ background: s.background }}>
                  {/* Drag indicator */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity">
                    <GripVertical size={14} className="text-white drop-shadow" />
                  </div>

                  {s.hidden && (
                    <div className="absolute top-1 right-8">
                      <EyeOff size={14} className="text-white/60" />
                    </div>
                  )}

                  {selectedSlides.has(index) && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow">
                      <span className="text-white text-[9px] font-bold">✓</span>
                    </div>
                  )}

                  {/* Mini slide content preview */}
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

                  {s.transition && s.transition !== 'none' && (
                    <div className="absolute top-1 right-1 bg-blue-500/80 text-white rounded px-1 py-0.5 backdrop-blur-sm" style={{ fontSize: 7 }}>
                      {s.transition}
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-center opacity-0 group-hover:opacity-100 transition-opacity py-1"
                  style={{ fontSize: 9 }}>
                  {s.layout} {s.notes ? '📝' : ''}
                </div>

                {/* Drop indicator line */}
                {dragOverIndex === index && draggingIndex !== index && (
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-yellow-500 rounded" />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-1">
            {slides.map((s, index) => (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onClick={(e) => handleSlideClick(index, e)}
                onDoubleClick={() => handleDoubleClick(index)}
                className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:shadow transition-all group"
                style={{
                  borderColor: dragOverIndex === index ? '#f59e0b' : selectedSlides.has(index) ? '#3b82f6' : 'var(--border)',
                  opacity: s.hidden ? 0.5 : 1,
                  background: index === activeSlideIndex ? 'var(--accent)' : 'var(--card)',
                }}
              >
                <GripVertical size={14} className="opacity-30 group-hover:opacity-60 flex-shrink-0 cursor-grab" />
                <span className="text-sm font-mono opacity-50 w-6 text-right flex-shrink-0">{index + 1}</span>
                <div className="w-24 h-14 rounded border overflow-hidden flex-shrink-0" style={{ background: s.background, borderColor: 'var(--border)' }}>
                  {s.elements.slice(0, 2).map((el) => (
                    <div key={el.id} className="absolute overflow-hidden"
                      style={{ left: `${(el.x / 960) * 100}%`, top: `${(el.y / 540) * 100}%`, fontSize: 3, color: el.style.color || '#fff' }}>
                      {el.type === 'text' ? el.content : ''}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.elements.find(e => e.type === 'text')?.content || `Slide ${index + 1}`}</div>
                  <div className="text-[10px] opacity-50">{s.layout} · {s.elements.length} elements {s.transition && s.transition !== 'none' ? `· ${s.transition}` : ''}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {s.hidden && <EyeOff size={12} className="opacity-50" />}
                  {s.notes && <span className="text-[10px] opacity-50">📝</span>}
                  {selectedSlides.has(index) && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-[8px]">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs opacity-40 pb-6 text-center">
        Drag to reorder · Click to select · Ctrl+Click for multi-select · Shift+Click for range · Double-click to edit
      </p>
    </div>
  );
}
