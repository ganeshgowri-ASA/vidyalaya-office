'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Replace,
  X,
  ChevronUp,
  ChevronDown,
  FileText,
  Table2,
  Presentation,
  FileDown,
  CaseSensitive,
  WholeWord,
  Regex,
  FolderSearch,
  Eye,
  CheckCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchReplaceStore, type SearchMatch } from '@/store/search-replace-store';
import { useAppStore } from '@/store/app-store';

const fileTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  document: { icon: FileText, color: '#3b82f6', label: 'Document' },
  spreadsheet: { icon: Table2, color: '#16a34a', label: 'Spreadsheet' },
  presentation: { icon: Presentation, color: '#f59e0b', label: 'Presentation' },
  pdf: { icon: FileDown, color: '#dc2626', label: 'PDF' },
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPattern(query: string, matchCase: boolean, wholeWord: boolean, useRegex: boolean): RegExp | null {
  if (!query) return null;
  try {
    let src: string;
    if (useRegex) {
      src = query;
    } else {
      src = escapeRegex(query);
    }
    if (wholeWord && !useRegex) {
      src = `\\b${src}\\b`;
    }
    return new RegExp(src, matchCase ? 'g' : 'gi');
  } catch {
    return null;
  }
}

function getContextSnippet(content: string, start: number, matchLen: number): { before: string; match: string; after: string } {
  const ctxLen = 40;
  const beforeStart = Math.max(0, start - ctxLen);
  const afterEnd = Math.min(content.length, start + matchLen + ctxLen);
  return {
    before: (beforeStart > 0 ? '...' : '') + content.substring(beforeStart, start),
    match: content.substring(start, start + matchLen),
    after: content.substring(start + matchLen, afterEnd) + (afterEnd < content.length ? '...' : ''),
  };
}

function MatchItem({
  match,
  isCurrent,
  onClick,
  replaceQuery,
  showPreview,
}: {
  match: SearchMatch;
  isCurrent: boolean;
  onClick: () => void;
  replaceQuery: string;
  showPreview: boolean;
}) {
  const cfg = fileTypeConfig[match.fileType] || fileTypeConfig.document;
  const Icon = cfg.icon;
  const ctx = getContextSnippet(match.context, match.startPos, match.matchText.length);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border p-2.5 transition-all hover:opacity-90',
        isCurrent && 'ring-1 ring-[var(--primary)]'
      )}
      style={{
        backgroundColor: isCurrent ? 'var(--accent)' : 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} style={{ color: cfg.color }} />
        <span className="text-[10px] font-medium truncate" style={{ color: cfg.color }}>
          {match.fileName}
        </span>
        <span
          className="text-[9px] px-1 py-0.5 rounded"
          style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
        <span style={{ color: 'var(--muted-foreground)' }}>{ctx.before}</span>
        <mark
          style={{
            backgroundColor: isCurrent ? '#FF8C00' : 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: '2px',
            padding: '0 1px',
          }}
        >
          {ctx.match}
        </mark>
        <span style={{ color: 'var(--muted-foreground)' }}>{ctx.after}</span>
      </div>
      {showPreview && replaceQuery !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
          <ArrowRight size={10} />
          <span style={{ color: '#16a34a' }}>{replaceQuery || <em>(empty)</em>}</span>
        </div>
      )}
    </button>
  );
}

export function GlobalSearchReplace() {
  const {
    isOpen,
    searchQuery,
    replaceQuery,
    matchCase,
    wholeWord,
    useRegex,
    searchAcrossAll,
    matches,
    currentMatchIndex,
    replacedCount,
    previewReplacements,
    setOpen,
    setSearchQuery,
    setReplaceQuery,
    setMatchCase,
    setWholeWord,
    setUseRegex,
    setSearchAcrossAll,
    setMatches,
    setCurrentMatchIndex,
    nextMatch,
    prevMatch,
    setReplacedCount,
    setPreviewReplacements,
    reset,
  } = useSearchReplaceStore();

  const { recentFiles } = useAppStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [showReplace, setShowReplace] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);
  const [activeFileFilter, setActiveFileFilter] = useState<string | null>(null);

  // Keyboard shortcut: Ctrl+Shift+H to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, setOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Perform search whenever query/options change
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setMatches([]);
      setRegexError(null);
      return;
    }

    const pattern = buildPattern(searchQuery, matchCase, wholeWord, useRegex);
    if (!pattern) {
      setRegexError(useRegex ? 'Invalid regex pattern' : null);
      setMatches([]);
      return;
    }
    setRegexError(null);

    const filesToSearch = searchAcrossAll
      ? recentFiles.filter((f) => !f.deleted)
      : recentFiles.filter((f) => !f.deleted).slice(0, 1);

    const allMatches: SearchMatch[] = [];

    for (const file of filesToSearch) {
      if (activeFileFilter && file.type !== activeFileFilter) continue;

      const content = file.content || '';
      if (!content) continue;

      pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      let idx = 0;

      while ((m = pattern.exec(content)) !== null) {
        allMatches.push({
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          matchText: m[0],
          context: content,
          matchIndex: idx,
          startPos: m.index,
          endPos: m.index + m[0].length,
        });
        idx++;
        if (!pattern.global) break;
        if (allMatches.length > 500) break;
      }
      if (allMatches.length > 500) break;
    }

    setMatches(allMatches);
  }, [searchQuery, matchCase, wholeWord, useRegex, searchAcrossAll, recentFiles, activeFileFilter, setMatches]);

  useEffect(() => {
    const timer = setTimeout(performSearch, 200);
    return () => clearTimeout(timer);
  }, [performSearch]);

  // Scroll current match into view
  useEffect(() => {
    if (resultsRef.current && matches.length > 0) {
      const el = resultsRef.current.children[currentMatchIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentMatchIndex, matches.length]);

  const handleReplaceCurrent = useCallback(() => {
    if (matches.length === 0) return;
    const match = matches[currentMatchIndex];
    if (!match) return;

    const { recentFiles: files } = useAppStore.getState();
    const file = files.find((f) => f.id === match.fileId);
    if (!file) return;

    const before = file.content.substring(0, match.startPos);
    const after = file.content.substring(match.endPos);
    const newContent = before + replaceQuery + after;

    useAppStore.setState((s) => ({
      recentFiles: s.recentFiles.map((f) =>
        f.id === match.fileId
          ? { ...f, content: newContent, modified: new Date().toISOString() }
          : f
      ),
    }));

    setReplacedCount(replacedCount + 1);
    // Re-search after a short delay
    setTimeout(performSearch, 100);
  }, [matches, currentMatchIndex, replaceQuery, replacedCount, setReplacedCount, performSearch]);

  const handleReplaceAll = useCallback(() => {
    if (matches.length === 0) return;

    const pattern = buildPattern(searchQuery, matchCase, wholeWord, useRegex);
    if (!pattern) return;

    const { recentFiles: files } = useAppStore.getState();
    const fileIdsWithMatches = new Set(matches.map((m) => m.fileId));
    let totalReplaced = 0;

    const updatedFiles = files.map((file) => {
      if (!fileIdsWithMatches.has(file.id)) return file;
      const original = file.content || '';
      pattern.lastIndex = 0;
      const replaced = original.replace(pattern, replaceQuery);
      if (replaced !== original) {
        const count = (original.match(pattern) || []).length;
        totalReplaced += count;
        return { ...file, content: replaced, modified: new Date().toISOString() };
      }
      return file;
    });

    useAppStore.setState({ recentFiles: updatedFiles });
    setReplacedCount(totalReplaced);
    setMatches([]);
    setCurrentMatchIndex(0);
    setTimeout(performSearch, 100);
  }, [matches, searchQuery, matchCase, wholeWord, useRegex, replaceQuery, setReplacedCount, setMatches, setCurrentMatchIndex, performSearch]);

  // Group matches by file for display
  const groupedMatches = useMemo(() => {
    const groups: Record<string, { fileName: string; fileType: string; count: number }> = {};
    for (const m of matches) {
      if (!groups[m.fileId]) {
        groups[m.fileId] = { fileName: m.fileName, fileType: m.fileType, count: 0 };
      }
      groups[m.fileId].count++;
    }
    return groups;
  }, [matches]);

  const fileTypes = useMemo(() => {
    const types = new Set(recentFiles.filter((f) => !f.deleted).map((f) => f.type));
    return Array.from(types);
  }, [recentFiles]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 z-50 flex h-full w-[420px] max-w-full flex-col border-l shadow-2xl"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <FolderSearch size={18} style={{ color: 'var(--primary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Global Search & Replace
          </h2>
        </div>
        <button
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded p-1 hover:bg-[var(--muted)] transition-colors"
          title="Close (Esc)"
        >
          <X size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>

      {/* Search inputs */}
      <div className="space-y-2 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        {/* Search field */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2 top-2.5" style={{ color: 'var(--muted-foreground)' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) prevMatch();
                  else nextMatch();
                }
              }}
              placeholder={useRegex ? 'Regex pattern...' : 'Search across documents...'}
              className="w-full rounded-lg border py-2 pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-[var(--primary)]"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="flex gap-0.5">
            <button
              onClick={prevMatch}
              disabled={matches.length === 0}
              className="rounded-lg border p-1.5 hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
              style={{ borderColor: 'var(--border)' }}
              title="Previous (Shift+Enter)"
            >
              <ChevronUp size={14} style={{ color: 'var(--foreground)' }} />
            </button>
            <button
              onClick={nextMatch}
              disabled={matches.length === 0}
              className="rounded-lg border p-1.5 hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
              style={{ borderColor: 'var(--border)' }}
              title="Next (Enter)"
            >
              <ChevronDown size={14} style={{ color: 'var(--foreground)' }} />
            </button>
          </div>
        </div>

        {/* Replace field (toggle) */}
        <div className="flex items-center gap-1 mb-1">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="flex items-center gap-1 text-[10px] font-medium"
            style={{ color: 'var(--primary)' }}
          >
            <Replace size={10} />
            {showReplace ? 'Hide Replace' : 'Show Replace'}
          </button>
        </div>

        {showReplace && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Replace size={14} className="absolute left-2 top-2.5" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="w-full rounded-lg border py-2 pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-[var(--primary)]"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <button
              onClick={handleReplaceCurrent}
              disabled={matches.length === 0}
              className="rounded-lg border px-2.5 py-1.5 text-[10px] font-medium hover:bg-[var(--muted)] disabled:opacity-30 transition-colors whitespace-nowrap"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              title="Replace current match"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={matches.length === 0}
              className="rounded-lg border px-2.5 py-1.5 text-[10px] font-medium hover:bg-[var(--muted)] disabled:opacity-30 transition-colors whitespace-nowrap"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              title="Replace all matches"
            >
              All
            </button>
          </div>
        )}

        {/* Search options */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setMatchCase(!matchCase)}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors',
              matchCase && 'ring-1 ring-[var(--primary)]'
            )}
            style={{
              backgroundColor: matchCase ? 'var(--accent)' : 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            title="Match Case"
          >
            <CaseSensitive size={12} />
            Aa
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors',
              wholeWord && 'ring-1 ring-[var(--primary)]'
            )}
            style={{
              backgroundColor: wholeWord ? 'var(--accent)' : 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            title="Whole Word"
          >
            <WholeWord size={12} />
            Word
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors',
              useRegex && 'ring-1 ring-[var(--primary)]'
            )}
            style={{
              backgroundColor: useRegex ? 'var(--accent)' : 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            title="Regular Expression"
          >
            <Regex size={12} />
            .*
          </button>
          <button
            onClick={() => setSearchAcrossAll(!searchAcrossAll)}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors',
              searchAcrossAll && 'ring-1 ring-[var(--primary)]'
            )}
            style={{
              backgroundColor: searchAcrossAll ? 'var(--accent)' : 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            title="Search across all documents"
          >
            <FolderSearch size={12} />
            All Docs
          </button>
          {showReplace && (
            <button
              onClick={() => setPreviewReplacements(!previewReplacements)}
              className={cn(
                'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors',
                previewReplacements && 'ring-1 ring-[var(--primary)]'
              )}
              style={{
                backgroundColor: previewReplacements ? 'var(--accent)' : 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              title="Preview replacements"
            >
              <Eye size={12} />
              Preview
            </button>
          )}
        </div>

        {/* File type filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveFileFilter(null)}
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] transition-colors',
              !activeFileFilter && 'ring-1 ring-[var(--primary)]'
            )}
            style={{
              backgroundColor: !activeFileFilter ? 'var(--accent)' : 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            All
          </button>
          {fileTypes.map((type) => {
            const cfg = fileTypeConfig[type];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveFileFilter(activeFileFilter === type ? null : type)}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] transition-colors',
                  activeFileFilter === type && 'ring-1 ring-[var(--primary)]'
                )}
                style={{
                  backgroundColor: activeFileFilter === type ? 'var(--accent)' : 'var(--card)',
                  borderColor: 'var(--border)',
                  color: cfg.color,
                }}
              >
                <Icon size={10} />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Regex error */}
        {regexError && (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#dc2626' }}>
            <AlertCircle size={12} />
            {regexError}
          </div>
        )}
      </div>

      {/* Results summary */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          {searchQuery.trim()
            ? matches.length > 0
              ? `${currentMatchIndex + 1} of ${matches.length} match${matches.length !== 1 ? 'es' : ''} in ${Object.keys(groupedMatches).length} file${Object.keys(groupedMatches).length !== 1 ? 's' : ''}`
              : 'No matches found'
            : 'Type to search'}
        </span>
        {replacedCount > 0 && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: '#16a34a' }}>
            <CheckCheck size={12} />
            {replacedCount} replaced
          </span>
        )}
      </div>

      {/* Results list */}
      <div ref={resultsRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {matches.length === 0 && searchQuery.trim() && (
          <div className="flex flex-col items-center py-12 text-center">
            <Search size={32} style={{ color: 'var(--muted-foreground)' }} className="mb-2 opacity-40" />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              No matches found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Try different keywords or adjust search options
            </p>
          </div>
        )}
        {!searchQuery.trim() && (
          <div className="flex flex-col items-center py-12 text-center">
            <FolderSearch size={32} style={{ color: 'var(--muted-foreground)' }} className="mb-2 opacity-40" />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Search across all your documents
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Documents, Spreadsheets, Presentations & PDFs
            </p>
            <div className="mt-3 text-[10px] rounded-lg border p-2" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              <p><kbd className="rounded border px-1 py-0.5 text-[9px]" style={{ borderColor: 'var(--border)' }}>Ctrl</kbd> + <kbd className="rounded border px-1 py-0.5 text-[9px]" style={{ borderColor: 'var(--border)' }}>Shift</kbd> + <kbd className="rounded border px-1 py-0.5 text-[9px]" style={{ borderColor: 'var(--border)' }}>H</kbd> to toggle</p>
            </div>
          </div>
        )}
        {matches.map((match, i) => (
          <MatchItem
            key={`${match.fileId}-${match.startPos}-${i}`}
            match={match}
            isCurrent={i === currentMatchIndex}
            onClick={() => setCurrentMatchIndex(i)}
            replaceQuery={replaceQuery}
            showPreview={previewReplacements && showReplace}
          />
        ))}
      </div>

      {/* File summary footer */}
      {matches.length > 0 && (
        <div
          className="border-t px-4 py-2 flex flex-wrap gap-2"
          style={{ borderColor: 'var(--border)' }}
        >
          {Object.entries(groupedMatches).map(([fileId, info]) => {
            const cfg = fileTypeConfig[info.fileType] || fileTypeConfig.document;
            const Icon = cfg.icon;
            return (
              <div
                key={fileId}
                className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <Icon size={10} style={{ color: cfg.color }} />
                <span className="truncate max-w-[120px]">{info.fileName}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                  style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                >
                  {info.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
