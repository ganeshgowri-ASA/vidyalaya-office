'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, X, Clock, Users, Mic, FileText, Tag, Calendar,
  ChevronRight, Sparkles, Filter, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== TYPES ====================
interface SearchResult {
  id: string;
  type: 'meeting' | 'transcript' | 'action' | 'participant' | 'topic';
  title: string;
  subtitle: string;
  match: string;
  date: string;
  relevance: number;
  icon: React.ElementType;
  color: string;
  tags?: string[];
}

// ==================== MOCK SEARCH DATA ====================
const SEARCH_CORPUS: SearchResult[] = [
  {
    id: 's1', type: 'meeting', title: 'Sprint Planning - Q2',
    subtitle: 'Mar 20 · 60 min · 4 participants',
    match: 'Discussed API integration, sprint velocity, and deployment schedule',
    date: '2024-03-20', relevance: 95, icon: Calendar, color: '#3b82f6',
    tags: ['sprint', 'planning', 'api']
  },
  {
    id: 's2', type: 'transcript', title: '"API authentication module"',
    subtitle: 'Sprint Planning Q2 · 00:12:33',
    match: '...the API authentication module needs OAuth 2.0 with JWT tokens. Raj, can you own this?',
    date: '2024-03-20', relevance: 92, icon: Mic, color: '#8b5cf6',
    tags: ['api', 'authentication']
  },
  {
    id: 's3', type: 'action', title: 'Complete API auth module',
    subtitle: 'Assigned to Raj Kumar · Due Tomorrow',
    match: 'Action item extracted from Sprint Planning Q2',
    date: '2024-03-20', relevance: 88, icon: FileText, color: '#10b981',
    tags: ['action', 'api', 'raj']
  },
  {
    id: 's4', type: 'meeting', title: 'Client Demo - Phase 2',
    subtitle: 'Mar 20 · 45 min · 6 participants',
    match: 'Phase 2 demo approved for production. Calendar integration added to Phase 3.',
    date: '2024-03-20', relevance: 85, icon: Calendar, color: '#3b82f6',
    tags: ['client', 'demo', 'phase2']
  },
  {
    id: 's5', type: 'transcript', title: '"memory leak dashboard"',
    subtitle: 'Client Demo · 00:28:15',
    match: '...there\'s a memory leak in the dashboard component. This is P1, needs to be fixed before deploy.',
    date: '2024-03-20', relevance: 82, icon: Mic, color: '#8b5cf6',
    tags: ['bug', 'memory', 'dashboard']
  },
  {
    id: 's6', type: 'participant', title: 'Priya Sharma',
    subtitle: '12 meetings · 8.2h talk time · Lead Engineer',
    match: 'Mentioned in 12 recent meetings, owns 4 action items',
    date: '2024-03-20', relevance: 78, icon: Users, color: '#f59e0b',
    tags: ['engineer', 'lead']
  },
  {
    id: 's7', type: 'topic', title: 'Production Deployment',
    subtitle: 'Discussed in 3 meetings · 24 mentions',
    match: 'Recurring topic: CI/CD pipeline, rollback strategy, staging environment',
    date: '2024-03-20', relevance: 75, icon: Hash, color: '#ef4444',
    tags: ['deploy', 'cicd', 'production']
  },
  {
    id: 's8', type: 'meeting', title: 'Design Review - UI Components',
    subtitle: 'Mar 19 · 30 min · 3 participants',
    match: 'Reviewed new dashboard design, approved color scheme for dark mode',
    date: '2024-03-19', relevance: 70, icon: Calendar, color: '#3b82f6',
    tags: ['design', 'ui', 'review']
  },
];

const RECENT_SEARCHES = ['API integration', 'action items', 'Raj Kumar', 'deployment'];
const SUGGESTED_FILTERS = ['Unread', 'Has action items', 'This week', 'With transcript', 'Starred'];

// ==================== COMPONENTS ====================
function SearchResultCard({ result, query }: { result: SearchResult; query: string }) {
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-500/30 text-yellow-300 rounded px-0.5">{part}</mark> : part
    );
  };

  const typeLabels = { meeting: 'Meeting', transcript: 'Transcript', action: 'Action Item', participant: 'Person', topic: 'Topic' };

  return (
    <button className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-slate-800/50 transition-colors group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${result.color}20` }}>
        <result.icon size={14} style={{ color: result.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-medium" style={{ color: result.color }}>{typeLabels[result.type]}</span>
          <span className="text-[10px] text-slate-500">{result.date}</span>
          <span className="ml-auto text-[9px] text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5">
            <ChevronRight size={10} />
          </span>
        </div>
        <p className="text-[12px] font-medium truncate">{highlightMatch(result.title, query)}</p>
        <p className="text-[10px] text-slate-400 truncate">{result.subtitle}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{highlightMatch(result.match, query)}</p>
        {result.tags && (
          <div className="flex flex-wrap gap-1 mt-1">
            {result.tags.map((tag, i) => (
              <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ==================== MAIN COMPONENT ====================
interface SmartSearchProps {
  onClose: () => void;
}

export default function SmartSearch({ onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SearchResult['type'] | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    let filtered = SEARCH_CORPUS;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.match.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    return filtered.sort((a, b) => b.relevance - a.relevance);
  }, [query, typeFilter]);

  const typeFilters: { id: SearchResult['type'] | 'all'; label: string; color: string }[] = [
    { id: 'all', label: 'All', color: '#94a3b8' },
    { id: 'meeting', label: 'Meetings', color: '#3b82f6' },
    { id: 'transcript', label: 'Transcripts', color: '#8b5cf6' },
    { id: 'action', label: 'Actions', color: '#10b981' },
    { id: 'participant', label: 'People', color: '#f59e0b' },
    { id: 'topic', label: 'Topics', color: '#ef4444' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Search size={14} className="text-blue-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search meetings, transcripts, people, topics..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-0.5 rounded hover:bg-slate-700">
            <X size={12} className="text-slate-400" />
          </button>
        )}
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 ml-1">
          <X size={14} />
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Filter size={10} className="text-slate-500 flex-shrink-0" />
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {typeFilters.map(f => (
            <button key={f.id} onClick={() => setTypeFilter(f.id)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 transition-colors',
                typeFilter === f.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              style={typeFilter === f.id ? { backgroundColor: `${f.color}30`, color: f.color } : {}}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!query ? (
          <div className="p-3 space-y-4">
            {/* Recent searches */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={11} className="text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recent</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RECENT_SEARCHES.map((s, i) => (
                  <button key={i} onClick={() => setQuery(s)}
                    className="text-[11px] px-2 py-1 rounded-full border hover:bg-slate-800/50 transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart filters */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={11} className="text-yellow-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Smart Filters</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_FILTERS.map((f, i) => (
                  <button key={i} onClick={() => setQuery(f)}
                    className={cn(
                      'text-[11px] px-2 py-1 rounded-full border transition-colors',
                      activeFilter === f ? 'border-blue-500/50 bg-blue-900/20 text-blue-400' : 'hover:bg-slate-800/50'
                    )}
                    style={{ borderColor: activeFilter === f ? undefined : 'var(--border)', color: activeFilter === f ? undefined : 'var(--muted-foreground)' }}
                    onMouseEnter={() => setActiveFilter(f)}
                    onMouseLeave={() => setActiveFilter(null)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* All results preview */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Tag size={11} className="text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">All Meetings</span>
                <span className="text-[9px] text-slate-500">{SEARCH_CORPUS.filter(r => r.type === 'meeting').length}</span>
              </div>
              <div className="space-y-1">
                {SEARCH_CORPUS.filter(r => r.type === 'meeting').map(r => (
                  <SearchResultCard key={r.id} result={r} query="" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-400">
                {results.length} result{results.length !== 1 ? 's' : ''} for <strong className="text-white">&quot;{query}&quot;</strong>
              </span>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Search size={24} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No results found</p>
                <p className="text-[11px] text-slate-500 mt-1">Try different keywords or filters</p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map(r => <SearchResultCard key={r.id} result={r} query={query} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
