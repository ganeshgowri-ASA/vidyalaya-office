'use client';
import { useState } from 'react';
import { useResearchStore, CitationStyle } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Search, Sparkles, BookOpen, Plus, Loader2, Star, ExternalLink,
  ChevronDown, ChevronRight, ClipboardPaste, Upload, Filter,
} from 'lucide-react';

const citationStyles: CitationStyle[] = ['APA 7th', 'IEEE', 'Vancouver', 'Chicago', 'Harvard', 'MLA 9th', 'Nature', 'ACS', 'ACM'];

export default function SmartCitationPanel() {
  const {
    smartCitationResults, smartCiteQuery, smartCiteSearching,
    searchSmartCitations, insertSmartCitation, citationStyle,
    setCitationStyle, citations,
  } = useResearchStore();

  const [query, setQuery] = useState(smartCiteQuery);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [showBibImport, setShowBibImport] = useState(false);

  const handleSearch = () => {
    if (query.trim()) searchSmartCitations(query.trim());
  };

  const filteredResults = smartCitationResults.filter((r) => {
    if (yearFilter === 'all') return true;
    if (yearFilter === '2023+') return r.year >= 2023;
    if (yearFilter === '2020-2022') return r.year >= 2020 && r.year <= 2022;
    if (yearFilter === 'pre2020') return r.year < 2020;
    return true;
  });

  const isAlreadyCited = (doi: string) => citations.some((c) => c.doi === doi);

  const handleSmartPaste = () => {
    if (!pasteInput.trim()) return;
    searchSmartCitations(pasteInput.trim());
    setPasteInput('');
    setShowPaste(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <h3 className="text-xs font-semibold">Smart Citations</h3>
        </div>

        {/* Search */}
        <div className="flex gap-1 mb-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search papers by keyword..."
              className="w-full text-xs pl-7 pr-2 py-1.5 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={smartCiteSearching || !query.trim()}
            className="text-xs px-3 py-1.5 rounded disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {smartCiteSearching ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Citation style */}
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

        {/* Quick actions */}
        <div className="flex gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('flex items-center gap-1 text-[10px] px-2 py-1 rounded border', showFilters && 'opacity-100')}
            style={{ borderColor: 'var(--border)', opacity: showFilters ? 1 : 0.6 }}
          >
            <Filter size={10} /> Filters
          </button>
          <button
            onClick={() => setShowPaste(!showPaste)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-60 hover:opacity-100"
            style={{ borderColor: 'var(--border)' }}
          >
            <ClipboardPaste size={10} /> Paste DOI
          </button>
          <button
            onClick={() => setShowBibImport(!showBibImport)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border opacity-60 hover:opacity-100"
            style={{ borderColor: 'var(--border)' }}
          >
            <Upload size={10} /> BibTeX
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {['all', '2023+', '2020-2022', 'pre2020'].map((f) => (
              <button
                key={f}
                onClick={() => setYearFilter(f)}
                className={cn('text-[10px] px-2 py-0.5 rounded border', yearFilter === f ? 'font-medium' : 'opacity-50')}
                style={yearFilter === f ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { borderColor: 'var(--border)' }}
              >
                {f === 'all' ? 'All years' : f === 'pre2020' ? 'Before 2020' : f}
              </button>
            ))}
          </div>
        )}

        {/* Smart paste */}
        {showPaste && (
          <div className="mt-2 flex gap-1">
            <input
              type="text"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="DOI, arXiv ID, or PubMed ID..."
              className="flex-1 text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSmartPaste(); }}
            />
            <button
              onClick={handleSmartPaste}
              className="text-xs px-2 py-1 rounded"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Cite
            </button>
          </div>
        )}

        {/* BibTeX import */}
        {showBibImport && (
          <div className="mt-2">
            <textarea
              placeholder="Paste BibTeX or RIS entries here..."
              className="w-full text-xs px-2 py-1.5 rounded border h-16 resize-none font-mono"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
            <button
              className="w-full mt-1 text-xs py-1 rounded"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Import References
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {smartCiteSearching && (
          <div className="flex items-center justify-center p-8 opacity-50">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-xs">Searching papers...</span>
          </div>
        )}

        {!smartCiteSearching && filteredResults.map((result) => {
          const expanded = expandedId === result.id;
          const alreadyCited = isAlreadyCited(result.doi);

          return (
            <div
              key={result.id}
              className="border-b hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => setExpandedId(expanded ? null : result.id)}
                    className="mt-0.5 shrink-0 opacity-50"
                  >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight cursor-pointer" onClick={() => setExpandedId(expanded ? null : result.id)}>
                      {result.title}
                    </p>
                    <p className="text-[10px] opacity-50 mt-0.5">
                      {result.authors.slice(0, 2).join(', ')}{result.authors.length > 2 ? ' et al.' : ''} · {result.year}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] opacity-40">{result.journal}</span>
                      <span className="flex items-center gap-0.5 text-[10px] opacity-40">
                        <Star size={8} /> {result.citationCount}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => !alreadyCited && insertSmartCitation(result)}
                    disabled={alreadyCited}
                    className={cn('shrink-0 flex items-center gap-1 text-[10px] px-2 py-1 rounded', alreadyCited ? 'opacity-40' : '')}
                    style={alreadyCited ? { backgroundColor: 'var(--background)' } : { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    {alreadyCited ? (
                      <>Cited</>
                    ) : (
                      <><Plus size={10} /> Cite</>
                    )}
                  </button>
                </div>

                {expanded && (
                  <div className="mt-2 ml-5 space-y-2">
                    <p className="text-[10px] opacity-60 leading-relaxed">{result.abstract}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-40">DOI: {result.doi}</span>
                      <button className="opacity-40 hover:opacity-100">
                        <ExternalLink size={10} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] opacity-40">Relevance:</span>
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${result.relevanceScore * 100}%`, backgroundColor: 'var(--primary)' }}
                        />
                      </div>
                      <span className="text-[10px] opacity-40">{Math.round(result.relevanceScore * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!smartCiteSearching && filteredResults.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 opacity-40">
            <BookOpen size={24} className="mb-2" />
            <p className="text-xs text-center">Search for papers to discover relevant citations</p>
            <p className="text-[10px] text-center mt-1">Type @ in the editor to trigger quick search</p>
          </div>
        )}
      </div>

      {/* Library stats */}
      <div className="p-2 border-t text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] opacity-40">
          Citation Library: {citations.length} references · {citationStyle} style
        </p>
      </div>
    </div>
  );
}
