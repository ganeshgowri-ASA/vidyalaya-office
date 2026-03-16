'use client';

import React, { useState } from 'react';
import { EyeOff, X, Plus, FolderOpen, ChevronDown, ChevronRight, Trash2, Copy } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

export default function SlideSorter() {
  const {
    slides, activeSlideIndex, showSlideSorter, sections,
    setActiveSlide, setShowSlideSorter, moveSlide, pushUndo,
    duplicateSlide, deleteSlide, toggleSlideHidden,
    addSection, updateSection, removeSection, selectMultipleElements,
  } = usePresentationStore();

  const [selectedSlides, setSelectedSlides] = useState<Set<number>>(new Set());
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  if (!showSlideSorter) return null;

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

  const handleCreateSection = () => {
    if (!newSectionName.trim()) return;
    const slideIds = Array.from(selectedSlides).map(i => slides[i].id);
    addSection(newSectionName, slideIds.length > 0 ? slideIds : []);
    setNewSectionName('');
    setShowNewSection(false);
  };

  return (
    <div
      className="fixed inset-0 z-[999] overflow-auto p-8"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Slide Sorter</h2>
        <div className="flex items-center gap-3">
          {selectedSlides.size > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{selectedSlides.size} selected</span>
              <button onClick={handleBulkDuplicate} className="p-1.5 rounded hover:opacity-80" title="Duplicate selected">
                <Copy size={16} />
              </button>
              <button onClick={handleBulkDelete} className="p-1.5 rounded hover:opacity-80 text-red-500" title="Delete selected">
                <Trash2 size={16} />
              </button>
              <button onClick={() => {
                const slideIds = Array.from(selectedSlides).map(i => slides[i].id);
                toggleSlideHidden(Array.from(selectedSlides)[0]);
              }} className="p-1.5 rounded hover:opacity-80" title="Toggle hidden">
                <EyeOff size={16} />
              </button>
            </div>
          )}
          <div className="relative">
            <button onClick={() => setShowNewSection(!showNewSection)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs border hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <FolderOpen size={14} /> Add Section
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
          <span className="text-sm opacity-60">{slides.length} slides</span>
          <button onClick={() => setShowSlideSorter(false)} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--foreground)' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Sections */}
      {sections.length > 0 && (
        <div className="mb-4 space-y-2">
          {sections.map(section => (
            <div key={section.id} className="rounded border p-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => updateSection(section.id, { collapsed: !section.collapsed })}>
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

      {/* All slides grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {slides.map((s, index) => (
          <div
            key={s.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={(e) => handleSlideClick(index, e)}
            onDoubleClick={() => handleDoubleClick(index)}
            className="cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 relative group"
            style={{
              borderColor: selectedSlides.has(index)
                ? '#3b82f6'
                : index === activeSlideIndex ? 'var(--primary)' : 'var(--border)',
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
              {selectedSlides.has(index) && (
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">✓</span>
                </div>
              )}
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
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded px-1 py-0.5" style={{ fontSize: 7 }}>
                  {s.transition}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ fontSize: 9, padding: '1px 0' }}>
              {s.layout}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs opacity-40 mt-4 text-center">
        Drag to reorder. Click to select. Ctrl+Click for multi-select. Shift+Click for range. Double-click to edit.
      </p>
    </div>
  );
}
