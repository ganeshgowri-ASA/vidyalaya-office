'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import { X, Check, Columns, AlignLeft } from 'lucide-react';

const categories = [
  'All',
  // Existing publishers
  'IEEE', 'Elsevier', 'Springer Nature', 'Nature', 'PLOS', 'MDPI', 'ACS', 'RSC', 'Wiley', 'Taylor & Francis',
  // New publishers
  'Hindawi', 'SPIE', 'IntechOpen', 'Frontiers', 'IOP', 'SAGE', 'Cambridge', 'Oxford', 'ACM', 'AAAS', 'Cell Press',
  'De Gruyter', 'Emerald', 'Copernicus', 'ASME', 'ASCE',
  // Categories
  'Conference', 'Review', 'Academic', 'Technical',
  'Custom',
];

export default function JournalTemplates() {
  const { journalTemplates, selectedTemplateId, applyTemplate, setShowTemplateGallery } = useResearchStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string>(selectedTemplateId);

  const filtered = journalTemplates.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  const handleApply = () => {
    applyTemplate(pendingId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowTemplateGallery(false)}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-lg font-bold">Journal Templates</h2>
            <p className="text-xs opacity-60 mt-0.5">Select a journal format to auto-structure your article</p>
          </div>
          <button onClick={() => setShowTemplateGallery(false)} className="p-1.5 rounded hover:opacity-80">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-40 border-r shrink-0 overflow-y-auto py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs transition-colors',
                  selectedCategory === cat ? 'font-medium' : 'opacity-60 hover:opacity-90'
                )}
                style={selectedCategory === cat ? { backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((template) => {
                const isSelected = pendingId === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setPendingId(template.id)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'relative rounded-lg p-3 cursor-pointer transition-all border',
                      isSelected ? 'border-2' : 'hover:opacity-90'
                    )}
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 rounded-full p-0.5"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <Check size={10} style={{ color: 'var(--primary-foreground)' }} />
                      </div>
                    )}

                    {/* Template preview */}
                    <div
                      className="h-24 rounded mb-2 p-2 flex gap-1"
                      style={{ backgroundColor: 'var(--card)' }}
                    >
                      {Array.from({ length: template.columns }).map((_, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1">
                          {i === 0 && <div className="h-1.5 rounded w-full opacity-50" style={{ backgroundColor: 'var(--muted-foreground)' }} />}
                          {i === 0 && <div className="h-1 rounded w-3/4 opacity-30" style={{ backgroundColor: 'var(--muted-foreground)' }} />}
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="h-1 rounded w-full opacity-20" style={{ backgroundColor: 'var(--muted-foreground)' }} />
                          ))}
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xs font-semibold leading-tight">{template.name}</h3>
                    <p className="text-[10px] opacity-50 mt-0.5 leading-tight line-clamp-2">{template.description}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-0.5 text-[10px] opacity-50">
                        {template.columns === 2 ? <Columns size={10} /> : <AlignLeft size={10} />}
                        {template.columns === 2 ? '2-col' : '1-col'}
                      </span>
                      <span className="text-[10px] opacity-50">{template.referenceStyle}</span>
                      {template.abstractLimit && (
                        <span className="text-[10px] opacity-50">{template.abstractLimit}w abstract</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs opacity-60">
            {pendingId && journalTemplates.find((t) => t.id === pendingId) && (
              <span>
                Selected: <strong>{journalTemplates.find((t) => t.id === pendingId)!.name}</strong> —{' '}
                {journalTemplates.find((t) => t.id === pendingId)!.sections.length} sections,{' '}
                {journalTemplates.find((t) => t.id === pendingId)!.referenceStyle} citations
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateGallery(false)}
              className="px-4 py-1.5 rounded text-sm border"
              style={{ borderColor: 'var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!pendingId}
              className="px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
