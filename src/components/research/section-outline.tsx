'use client';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, Circle, ChevronUp, ChevronDown, Plus, Trash2, GripVertical,
} from 'lucide-react';
import { useState } from 'react';

export default function SectionOutline() {
  const {
    sections, activeSection, setActiveSection, toggleSectionComplete,
    reorderSection, removeSection, addSection,
  } = useResearchStore();

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const completed = sections.filter((s) => s.isComplete).length;

  const handleAdd = () => {
    if (!newSectionTitle.trim()) return;
    addSection(newSectionTitle.trim());
    setNewSectionTitle('');
    setShowAdd(false);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}
    >
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Sections</h2>
        <div className="flex items-center justify-between text-xs opacity-60">
          <span>{totalWords.toLocaleString()} words</span>
          <span>{completed}/{sections.length} done</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${(completed / Math.max(sections.length, 1)) * 100}%`, backgroundColor: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sorted.map((section, idx) => {
          const isActive = activeSection === section.id;
          return (
            <div
              key={section.id}
              className={cn(
                'group flex items-start gap-1 px-2 py-1.5 cursor-pointer text-xs transition-colors',
                isActive ? 'rounded-md' : 'hover:opacity-80'
              )}
              style={isActive ? { backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' } : undefined}
              onClick={() => setActiveSection(section.id)}
            >
              <GripVertical size={12} className="opacity-30 mt-0.5 shrink-0 cursor-grab" />
              <button
                className="shrink-0 mt-0.5"
                onClick={(e) => { e.stopPropagation(); toggleSectionComplete(section.id); }}
              >
                {section.isComplete
                  ? <CheckCircle2 size={13} className="text-green-400" />
                  : <Circle size={13} className="opacity-40" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium leading-tight">{section.title}</p>
                {section.wordCount > 0 && (
                  <p className="opacity-50 text-[10px]">{section.wordCount} words</p>
                )}
              </div>
              {/* Reorder & delete */}
              <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                <button
                  className="p-0.5 hover:opacity-80"
                  onClick={(e) => { e.stopPropagation(); reorderSection(section.id, 'up'); }}
                  disabled={idx === 0}
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  className="p-0.5 hover:opacity-80"
                  onClick={(e) => { e.stopPropagation(); reorderSection(section.id, 'down'); }}
                  disabled={idx === sorted.length - 1}
                >
                  <ChevronDown size={11} />
                </button>
                {section.isCustom && (
                  <button
                    className="p-0.5 hover:text-red-400"
                    onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add section */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        {showAdd ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
              placeholder="Section title..."
              autoFocus
              className="flex-1 text-xs px-2 py-1 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
            <button onClick={handleAdd} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity w-full"
          >
            <Plus size={12} /> Add section
          </button>
        )}
      </div>
    </div>
  );
}
