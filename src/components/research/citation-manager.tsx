'use client';
import { useState } from 'react';
import { useResearchStore, Citation, CitationStyle } from '@/store/research-store';
import { cn } from '@/lib/utils';
import { Plus, Search, Trash2, BookOpen, ExternalLink, X, FileText } from 'lucide-react';

const citationStyles: CitationStyle[] = ['APA 7th', 'IEEE', 'Vancouver', 'Chicago', 'Harvard', 'MLA 9th', 'Nature', 'ACS'];

const typeColors: Record<Citation['type'], string> = {
  article: 'text-blue-400',
  book: 'text-green-400',
  conference: 'text-purple-400',
  website: 'text-yellow-400',
  thesis: 'text-orange-400',
  report: 'text-red-400',
};

function formatCitation(c: Citation, style: CitationStyle): string {
  const authStr = c.authors.slice(0, 3).join(', ') + (c.authors.length > 3 ? ' et al.' : '');
  switch (style) {
    case 'IEEE':
      return `${authStr}, "${c.title}," ${c.journal || c.conference || c.publisher || ''}, ${c.year}.`;
    case 'APA 7th':
      return `${authStr} (${c.year}). ${c.title}. ${c.journal ? `*${c.journal}*` : c.conference || c.publisher || ''}.`;
    case 'Vancouver':
      return `${authStr}. ${c.title}. ${c.journal || c.conference || c.publisher || ''}. ${c.year}.`;
    default:
      return `${authStr} (${c.year}). ${c.title}.`;
  }
}

interface AddCitationFormProps {
  onClose: () => void;
}

function AddCitationForm({ onClose }: AddCitationFormProps) {
  const { addCitation } = useResearchStore();
  const [doi, setDoi] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Citation>>({
    type: 'article', authors: [], title: '', year: new Date().getFullYear(), journal: '',
  });
  const [authorsInput, setAuthorsInput] = useState('');
  const [tab, setTab] = useState<'doi' | 'manual'>('doi');

  const handleDOILookup = () => {
    setLoading(true);
    // Simulate DOI lookup
    setTimeout(() => {
      setForm({
        type: 'article',
        title: 'Retrieved Article from DOI Lookup',
        authors: ['Smith, J.', 'Johnson, A.'],
        year: 2024,
        journal: 'Nature Communications',
        volume: '15',
        pages: '1234-1245',
        doi,
      });
      setAuthorsInput('Smith, J.; Johnson, A.');
      setLoading(false);
    }, 800);
  };

  const handleSubmit = () => {
    if (!form.title) return;
    addCitation({
      key: `ref${Date.now()}`,
      type: form.type || 'article',
      title: form.title || '',
      authors: authorsInput.split(';').map((a) => a.trim()).filter(Boolean),
      year: form.year || new Date().getFullYear(),
      journal: form.journal,
      volume: form.volume,
      issue: form.issue,
      pages: form.pages,
      doi: form.doi,
      url: form.url,
      publisher: form.publisher,
      conference: form.conference,
      inText: false,
    });
    onClose();
  };

  return (
    <div className="border-t p-3 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold">Add Reference</h3>
        <button onClick={onClose}><X size={14} /></button>
      </div>

      <div className="flex gap-1">
        {(['doi', 'manual'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('text-xs px-3 py-1 rounded', tab === t ? 'font-medium' : 'opacity-50')}
            style={tab === t ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : undefined}
          >
            {t === 'doi' ? 'DOI Lookup' : 'Manual Entry'}
          </button>
        ))}
      </div>

      {tab === 'doi' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            placeholder="Enter DOI (e.g. 10.1038/nature14539)"
            className="flex-1 text-xs px-2 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />
          <button
            onClick={handleDOILookup}
            disabled={!doi || loading}
            className="text-xs px-3 py-1.5 rounded disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {loading ? '...' : 'Lookup'}
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] opacity-50 mb-0.5 block">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Citation['type'] })}
              className="w-full text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            >
              <option value="article">Journal Article</option>
              <option value="book">Book</option>
              <option value="conference">Conference Paper</option>
              <option value="website">Website</option>
              <option value="thesis">Thesis</option>
              <option value="report">Report</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] opacity-50 mb-0.5 block">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
              className="w-full text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] opacity-50 mb-0.5 block">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full text-xs px-2 py-1.5 rounded border"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />
        </div>
        <div>
          <label className="text-[10px] opacity-50 mb-0.5 block">Authors (semicolon-separated)</label>
          <input
            type="text"
            value={authorsInput}
            onChange={(e) => setAuthorsInput(e.target.value)}
            placeholder="Smith, J.; Garcia, M."
            className="w-full text-xs px-2 py-1.5 rounded border"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] opacity-50 mb-0.5 block">{form.type === 'book' ? 'Publisher' : form.type === 'conference' ? 'Conference' : 'Journal'}</label>
            <input
              type="text"
              value={form.type === 'book' ? (form.publisher || '') : form.type === 'conference' ? (form.conference || '') : (form.journal || '')}
              onChange={(e) => {
                if (form.type === 'book') setForm({ ...form, publisher: e.target.value });
                else if (form.type === 'conference') setForm({ ...form, conference: e.target.value });
                else setForm({ ...form, journal: e.target.value });
              }}
              className="w-full text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="text-[10px] opacity-50 mb-0.5 block">DOI</label>
            <input
              type="text"
              value={form.doi || ''}
              onChange={(e) => setForm({ ...form, doi: e.target.value })}
              className="w-full text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full text-xs py-1.5 rounded font-medium"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Add Reference
        </button>
      </div>
    </div>
  );
}

export default function CitationManager() {
  const { citations, citationStyle, setCitationStyle, removeCitation } = useResearchStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = citations.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      String(c.year).includes(search)
  );

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold">Citations ({citations.length})</h3>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <label className="text-[10px] opacity-50 shrink-0">Style:</label>
          <select
            value={citationStyle}
            onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
            className="flex-1 text-xs px-1.5 py-0.5 rounded border"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          >
            {citationStyles.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search references..."
            className="w-full text-xs pl-6 pr-2 py-1.5 rounded border"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />
        </div>
      </div>

      {showAdd && <AddCitationForm onClose={() => setShowAdd(false)} />}

      {/* Citation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((c, idx) => (
          <div
            key={c.id}
            className="group p-3 border-b hover:opacity-90 transition-opacity"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-2">
              <span
                className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded mt-0.5"
                style={{ backgroundColor: 'var(--background)' }}
              >
                [{idx + 1}]
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={cn('text-[10px] font-medium uppercase', typeColors[c.type])}>{c.type}</span>
                  {c.inText && (
                    <span className="text-[10px] px-1 rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', opacity: 0.8 }}>
                      in use
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium leading-tight line-clamp-2">{c.title}</p>
                <p className="text-[10px] opacity-50 mt-0.5">
                  {c.authors.slice(0, 2).join(', ')}{c.authors.length > 2 ? ' et al.' : ''} · {c.year}
                  {c.journal && ` · ${c.journal}`}
                </p>
                <p className="text-[10px] opacity-40 mt-0.5 italic leading-tight line-clamp-1">
                  {formatCitation(c, citationStyle)}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {c.doi && (
                  <button title="Open DOI">
                    <ExternalLink size={12} className="opacity-60 hover:opacity-100" />
                  </button>
                )}
                <button onClick={() => removeCitation(c.id)} title="Remove" className="hover:text-red-400">
                  <Trash2 size={12} className="opacity-60 hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-6 text-center opacity-40">
            <BookOpen size={24} className="mx-auto mb-2" />
            <p className="text-xs">No references found</p>
          </div>
        )}
      </div>

      {/* BibTeX import */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 w-full justify-center py-1">
          <FileText size={12} /> Import BibTeX (.bib)
        </button>
      </div>
    </div>
  );
}
