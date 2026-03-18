'use client';

import React, { useState } from 'react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineA?: number;
  lineB?: number;
}

const MOCK_DOC_A = [
  'Section 1: Introduction',
  'This document outlines the project scope and deliverables.',
  'The team consists of 5 developers and 2 designers.',
  'Project timeline: Q1 2024 to Q3 2024.',
  '',
  'Section 2: Requirements',
  'Functional requirements are detailed below.',
  'The system must support 10,000 concurrent users.',
  'Response time must be under 200ms for all API calls.',
  'Data must be encrypted at rest and in transit.',
];

const MOCK_DOC_B = [
  'Section 1: Introduction',
  'This document outlines the project scope and updated deliverables.',
  'The team consists of 7 developers and 3 designers.',
  'Project timeline: Q2 2024 to Q4 2024.',
  '',
  'Section 2: Requirements',
  'Functional and non-functional requirements are detailed below.',
  'The system must support 50,000 concurrent users.',
  'Response time must be under 200ms for all API calls.',
  'Data must be encrypted at rest and in transit.',
  'All user sessions must timeout after 30 minutes of inactivity.',
];

function computeDiff(linesA: string[], linesB: string[]): DiffLine[] {
  const diff: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < linesA.length || j < linesB.length) {
    if (i >= linesA.length) {
      diff.push({ type: 'added', text: linesB[j], lineB: j + 1 });
      j++;
    } else if (j >= linesB.length) {
      diff.push({ type: 'removed', text: linesA[i], lineA: i + 1 });
      i++;
    } else if (linesA[i] === linesB[j]) {
      diff.push({ type: 'unchanged', text: linesA[i], lineA: i + 1, lineB: j + 1 });
      i++; j++;
    } else {
      // Simple diff: look ahead to find matches
      const nextMatchA = linesB.indexOf(linesA[i], j);
      const nextMatchB = linesA.indexOf(linesB[j], i);
      if (nextMatchA !== -1 && (nextMatchB === -1 || nextMatchA - j <= nextMatchB - i)) {
        diff.push({ type: 'added', text: linesB[j], lineB: j + 1 });
        j++;
      } else {
        diff.push({ type: 'removed', text: linesA[i], lineA: i + 1 });
        i++;
      }
    }
  }
  return diff;
}

export default function ComparePdfPanel() {
  const [fileA, setFileA] = useState<string | null>('Document_v1.pdf');
  const [fileB, setFileB] = useState<string | null>('Document_v2.pdf');
  const [viewMode, setViewMode] = useState<'sidebyside' | 'unified' | 'overlay'>('sidebyside');
  const [showDiff, setShowDiff] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'added' | 'removed'>('all');

  const diff = computeDiff(MOCK_DOC_A, MOCK_DOC_B);
  const addedCount = diff.filter(d => d.type === 'added').length;
  const removedCount = diff.filter(d => d.type === 'removed').length;
  const filteredDiff = filter === 'all' ? diff : diff.filter(d => d.type === filter || d.type === 'unchanged');

  const lineColor = (type: DiffLine['type']) => {
    if (type === 'added') return 'bg-green-600/10 border-l-2 border-green-500';
    if (type === 'removed') return 'bg-red-600/10 border-l-2 border-red-500';
    return '';
  };
  const lineTextColor = (type: DiffLine['type']) => {
    if (type === 'added') return 'text-green-400';
    if (type === 'removed') return 'text-red-400 line-through';
    return 'text-[var(--foreground)]';
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="p-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Compare PDFs</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Side-by-side diff view of two documents</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Documents to Compare</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded bg-[var(--card)] border border-[var(--border)]">
              <span className="text-blue-400 text-xs font-bold w-4">A</span>
              <span className="flex-1 text-xs truncate">{fileA || 'No file selected'}</span>
              <button onClick={() => setFileA(fileA ? null : 'Document_v1.pdf')} className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] hover:bg-blue-600/30">
                {fileA ? 'Change' : 'Select'}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-[var(--card)] border border-[var(--border)]">
              <span className="text-purple-400 text-xs font-bold w-4">B</span>
              <span className="flex-1 text-xs truncate">{fileB || 'No file selected'}</span>
              <button onClick={() => setFileB(fileB ? null : 'Document_v2.pdf')} className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 text-[10px] hover:bg-purple-600/30">
                {fileB ? 'Change' : 'Select'}
              </button>
            </div>
          </div>
        </div>

        {/* View Mode */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">View Mode</p>
          <div className="flex gap-1">
            {[{ id: 'sidebyside', label: 'Side by Side' }, { id: 'unified', label: 'Unified' }, { id: 'overlay', label: 'Overlay' }].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as typeof viewMode)}
                className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${viewMode === mode.id ? 'bg-blue-600 text-white' : 'bg-[var(--card)] hover:bg-[var(--border)]'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Button */}
        <button
          onClick={() => setShowDiff(true)}
          disabled={!fileA || !fileB}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium"
        >
          Compare Documents
        </button>

        {showDiff && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-[var(--card)] text-center">
                <p className="text-base font-bold text-green-400">{addedCount}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Added</p>
              </div>
              <div className="p-2 rounded bg-[var(--card)] text-center">
                <p className="text-base font-bold text-red-400">{removedCount}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Removed</p>
              </div>
              <div className="p-2 rounded bg-[var(--card)] text-center">
                <p className="text-base font-bold text-[var(--foreground)]">{diff.filter(d => d.type === 'unchanged').length}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Unchanged</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-1">
              {[{ id: 'all', label: 'All' }, { id: 'added', label: '+ Added' }, { id: 'removed', label: '− Removed' }].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as typeof filter)}
                  className={`flex-1 py-1 rounded text-[10px] font-medium ${filter === f.id ? 'bg-blue-600 text-white' : 'bg-[var(--card)] hover:bg-[var(--border)]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-[var(--card)] text-xs hover:bg-[var(--border)]">‹</button>
              <span className="flex-1 text-center text-xs">Page {currentPage}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 rounded bg-[var(--card)] text-xs hover:bg-[var(--border)]">›</button>
            </div>

            {/* Diff View */}
            {viewMode === 'sidebyside' ? (
              <div className="grid grid-cols-2 gap-1 border border-[var(--border)] rounded overflow-hidden">
                <div className="bg-[var(--card)] p-1.5">
                  <p className="text-[10px] font-semibold text-blue-400 mb-1 px-1">Document A (v1)</p>
                  {diff.filter(d => d.type !== 'added').map((line, i) => (
                    <div key={i} className={`flex gap-1.5 px-1 py-0.5 ${lineColor(line.type)}`}>
                      <span className="text-[9px] text-[var(--muted-foreground)] w-4 shrink-0">{line.lineA || ''}</span>
                      <span className={`text-[10px] leading-relaxed ${lineTextColor(line.type)}`}>{line.text || '\u00A0'}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[var(--card)] p-1.5 border-l border-[var(--border)]">
                  <p className="text-[10px] font-semibold text-purple-400 mb-1 px-1">Document B (v2)</p>
                  {diff.filter(d => d.type !== 'removed').map((line, i) => (
                    <div key={i} className={`flex gap-1.5 px-1 py-0.5 ${lineColor(line.type)}`}>
                      <span className="text-[9px] text-[var(--muted-foreground)] w-4 shrink-0">{line.lineB || ''}</span>
                      <span className={`text-[10px] leading-relaxed ${lineTextColor(line.type)}`}>{line.text || '\u00A0'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-[var(--border)] rounded overflow-hidden bg-[var(--card)]">
                <p className="text-[10px] font-semibold text-[var(--muted-foreground)] p-2 border-b border-[var(--border)]">Unified Diff</p>
                <div className="p-1.5 space-y-0.5">
                  {filteredDiff.map((line, i) => (
                    <div key={i} className={`flex gap-1.5 px-1 py-0.5 ${lineColor(line.type)}`}>
                      <span className={`text-[9px] font-mono w-4 shrink-0 ${line.type === 'added' ? 'text-green-400' : line.type === 'removed' ? 'text-red-400' : 'text-[var(--muted-foreground)]'}`}>
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                      </span>
                      <span className={`text-[10px] leading-relaxed ${lineTextColor(line.type)}`}>{line.text || '\u00A0'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <button className="w-full py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs hover:bg-[var(--border)]">
              ⬇ Export Comparison Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
