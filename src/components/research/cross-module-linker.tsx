'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { Link2, FileText, BarChart2, Presentation, FileImage, ExternalLink, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkedItem {
  id: string;
  module: string;
  type: string;
  label: string;
  href: string;
}

// Simulated cross-module links — in a real app these would come from a shared store or API
const moduleLinks: LinkedItem[] = [
  { id: 'lnk1', module: 'Document', type: 'report', label: 'Annual Forecasting Report (Q1 2026)', href: '/document' },
  { id: 'lnk2', module: 'Document', type: 'draft', label: 'Grant Proposal — NSF 2026', href: '/document' },
  { id: 'lnk3', module: 'Spreadsheet', type: 'data', label: 'Dataset: Solar Irradiance 2015-2024', href: '/spreadsheet' },
  { id: 'lnk4', module: 'Spreadsheet', type: 'analysis', label: 'Model Comparison Results', href: '/spreadsheet' },
  { id: 'lnk5', module: 'Presentation', type: 'slides', label: 'IEEE Conference Talk Slides', href: '/presentation' },
  { id: 'lnk6', module: 'Presentation', type: 'poster', label: 'NeurIPS Poster 2025', href: '/presentation' },
  { id: 'lnk7', module: 'PDF', type: 'reference', label: 'Vaswani et al. (2017) — Attention', href: '/pdf' },
  { id: 'lnk8', module: 'PDF', type: 'reference', label: 'Hochreiter & Schmidhuber (1997) — LSTM', href: '/pdf' },
];

const moduleIcons: Record<string, React.ElementType> = {
  Document: FileText,
  Spreadsheet: BarChart2,
  Presentation: Presentation,
  PDF: FileImage,
};

const moduleColors: Record<string, string> = {
  Document: 'text-blue-400',
  Spreadsheet: 'text-green-400',
  Presentation: 'text-orange-400',
  PDF: 'text-red-400',
};

type Filter = 'all' | string;

export default function CrossModuleLinker() {
  const { sections, figures, tables, citations } = useResearchStore();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set(['lnk3', 'lnk5']));
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const modules = ['all', ...Array.from(new Set(moduleLinks.map((l) => l.module)))];

  const filtered = moduleLinks.filter((item) => {
    const matchModule = activeFilter === 'all' || item.module === activeFilter;
    const matchSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchModule && matchSearch;
  });

  const linkedItems = moduleLinks.filter((l) => linkedIds.has(l.id));

  const toggleLink = (id: string) => {
    setLinkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Summary of current research document
  const totalWords = sections.reduce((acc, s) => acc + s.wordCount, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <Link2 size={14} className="opacity-60" />
        <h3 className="text-xs font-semibold">Cross-Module Links</h3>
      </div>

      {/* Research summary */}
      <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] opacity-50 mb-1.5">Current article</p>
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { label: 'Words', value: totalWords },
            { label: 'Refs', value: citations.length },
            { label: 'Figs', value: figures.length },
            { label: 'Tabs', value: tables.length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded py-1" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-sm font-bold">{value}</p>
              <p className="text-[10px] opacity-50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Linked items */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">
            Linked Files ({linkedItems.length})
          </p>
          <button
            onClick={() => setShowLinkPicker(!showLinkPicker)}
            className="text-[10px] px-2 py-0.5 rounded flex items-center gap-1 hover:opacity-80"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Link2 size={9} />
            Link
          </button>
        </div>

        {linkedItems.length === 0 ? (
          <p className="text-[10px] opacity-40 italic">No files linked yet. Click Link to add.</p>
        ) : (
          <div className="space-y-1.5">
            {linkedItems.map((item) => {
              const Icon = moduleIcons[item.module] ?? FileText;
              const color = moduleColors[item.module] ?? 'text-gray-400';
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded group"
                  style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                >
                  <Icon size={12} className={cn('shrink-0', color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{item.label}</p>
                    <p className="text-[10px] opacity-40">{item.module}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={item.href}
                      title="Open"
                      className="p-0.5 rounded hover:opacity-80"
                    >
                      <ExternalLink size={10} />
                    </a>
                    <button
                      onClick={() => toggleLink(item.id)}
                      className="p-0.5 rounded hover:text-red-400"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Link picker */}
      {showLinkPicker && (
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-2 py-1.5 rounded border mb-2"
            style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />

          {/* Module filter tabs */}
          <div className="flex gap-1 flex-wrap mb-2">
            {modules.map((mod) => (
              <button
                key={mod}
                onClick={() => setActiveFilter(mod)}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded capitalize',
                  activeFilter === mod ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                )}
                style={activeFilter === mod ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { backgroundColor: 'var(--card)' }}
              >
                {mod}
              </button>
            ))}
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map((item) => {
              const Icon = moduleIcons[item.module] ?? FileText;
              const color = moduleColors[item.module] ?? 'text-gray-400';
              const isLinked = linkedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleLink(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all',
                    isLinked ? 'opacity-60' : 'hover:opacity-80'
                  )}
                  style={{
                    backgroundColor: isLinked ? 'var(--card)' : 'var(--background)',
                    border: `1px solid ${isLinked ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  <Icon size={12} className={cn('shrink-0', color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] truncate">{item.label}</p>
                    <p className="text-[10px] opacity-40">{item.module} · {item.type}</p>
                  </div>
                  <ChevronRight size={10} className={cn('shrink-0', isLinked ? 'text-green-400' : 'opacity-30')} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-[10px] opacity-40 text-center py-2">No matching files</p>
            )}
          </div>
        </div>
      )}

      {/* Reference integration hint */}
      <div className="p-3 text-[10px] opacity-40 space-y-1">
        <p className="font-semibold opacity-70">Integration tips</p>
        <p>• Link spreadsheet datasets to import figure data</p>
        <p>• Link presentation slides to sync key results</p>
        <p>• Link PDF references for quick access while writing</p>
      </div>
    </div>
  );
}
