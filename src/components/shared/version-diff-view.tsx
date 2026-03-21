'use client';

import React, { useMemo } from 'react';
import { X, Columns2, AlignJustify } from 'lucide-react';

interface VersionDiffViewProps {
  oldContent: string;
  newContent: string;
  oldLabel: string;
  newLabel: string;
  mode: 'unified' | 'side-by-side';
  onModeChange: (mode: 'unified' | 'side-by-side') => void;
  onClose: () => void;
}

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
  lineNumOld?: number;
  lineNumNew?: number;
}

export function VersionDiffView({
  oldContent,
  newContent,
  oldLabel,
  newLabel,
  mode,
  onModeChange,
  onClose,
}: VersionDiffViewProps) {
  const diffLines = useMemo(
    () => computeDiff(stripHtml(oldContent), stripHtml(newContent)),
    [oldContent, newContent]
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffLines.forEach((l) => {
      if (l.type === 'added') added++;
      if (l.type === 'removed') removed++;
    });
    return { added, removed };
  }, [diffLines]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      <div
        className="flex flex-col flex-1 m-4 rounded-lg border overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Version Comparison
            </h3>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                -{stats.removed} lines
              </span>
              <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                +{stats.added} lines
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex rounded-md border overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => onModeChange('unified')}
                className={`px-2.5 py-1.5 text-[10px] flex items-center gap-1 ${
                  mode === 'unified' ? 'bg-[var(--primary)] text-white' : ''
                }`}
                style={mode !== 'unified' ? { color: 'var(--foreground)' } : undefined}
              >
                <AlignJustify size={11} />
                Unified
              </button>
              <button
                onClick={() => onModeChange('side-by-side')}
                className={`px-2.5 py-1.5 text-[10px] flex items-center gap-1 ${
                  mode === 'side-by-side' ? 'bg-[var(--primary)] text-white' : ''
                }`}
                style={mode !== 'side-by-side' ? { color: 'var(--foreground)' } : undefined}
              >
                <Columns2 size={11} />
                Side by Side
              </button>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1.5 hover:bg-[var(--muted)]"
            >
              <X size={16} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>
        </div>

        {/* Labels */}
        {mode === 'side-by-side' ? (
          <div className="grid grid-cols-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div
              className="px-4 py-2 text-[11px] font-medium border-r"
              style={{ borderColor: 'var(--border)', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)' }}
            >
              A: {oldLabel}
            </div>
            <div
              className="px-4 py-2 text-[11px] font-medium"
              style={{ color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.05)' }}
            >
              B: {newLabel}
            </div>
          </div>
        ) : (
          <div
            className="px-4 py-2 text-[11px] font-medium border-b flex gap-6"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <span style={{ color: '#ef4444' }}>A: {oldLabel}</span>
            <span style={{ color: '#22c55e' }}>B: {newLabel}</span>
          </div>
        )}

        {/* Diff content */}
        <div className="flex-1 overflow-auto font-mono text-xs">
          {mode === 'side-by-side' ? (
            <SideBySideDiff lines={diffLines} />
          ) : (
            <UnifiedDiff lines={diffLines} />
          )}
        </div>
      </div>
    </div>
  );
}

function UnifiedDiff({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="min-w-0">
      {lines.map((line, i) => {
        const bg =
          line.type === 'added'
            ? 'rgba(34,197,94,0.1)'
            : line.type === 'removed'
              ? 'rgba(239,68,68,0.1)'
              : 'transparent';
        const color =
          line.type === 'added'
            ? '#22c55e'
            : line.type === 'removed'
              ? '#ef4444'
              : 'var(--foreground)';
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

        return (
          <div
            key={i}
            className="flex px-2 py-0.5 min-h-[20px]"
            style={{ backgroundColor: bg }}
          >
            <span
              className="w-10 text-right pr-2 select-none flex-shrink-0"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {line.lineNumOld ?? ''}
            </span>
            <span
              className="w-10 text-right pr-2 select-none flex-shrink-0"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {line.lineNumNew ?? ''}
            </span>
            <span className="w-4 text-center select-none flex-shrink-0" style={{ color }}>
              {prefix}
            </span>
            <span className="whitespace-pre-wrap break-all" style={{ color }}>
              {line.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SideBySideDiff({ lines }: { lines: DiffLine[] }) {
  // Split into left (old) and right (new)
  const leftLines: { num?: number; text: string; type: 'same' | 'removed' | 'empty' }[] = [];
  const rightLines: { num?: number; text: string; type: 'same' | 'added' | 'empty' }[] = [];

  let li = 0;
  let ri = 0;
  for (const line of lines) {
    if (line.type === 'same') {
      leftLines.push({ num: line.lineNumOld, text: line.text, type: 'same' });
      rightLines.push({ num: line.lineNumNew, text: line.text, type: 'same' });
    } else if (line.type === 'removed') {
      leftLines.push({ num: line.lineNumOld, text: line.text, type: 'removed' });
      rightLines.push({ text: '', type: 'empty' });
    } else {
      leftLines.push({ text: '', type: 'empty' });
      rightLines.push({ num: line.lineNumNew, text: line.text, type: 'added' });
    }
  }

  const maxRows = Math.max(leftLines.length, rightLines.length);

  return (
    <div className="grid grid-cols-2 min-w-0">
      {/* Left side */}
      <div className="border-r" style={{ borderColor: 'var(--border)' }}>
        {leftLines.map((line, i) => {
          const bg =
            line.type === 'removed'
              ? 'rgba(239,68,68,0.1)'
              : line.type === 'empty'
                ? 'rgba(239,68,68,0.03)'
                : 'transparent';
          const color = line.type === 'removed' ? '#ef4444' : 'var(--foreground)';

          return (
            <div
              key={i}
              className="flex px-2 py-0.5 min-h-[20px]"
              style={{ backgroundColor: bg }}
            >
              <span
                className="w-8 text-right pr-2 select-none flex-shrink-0"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {line.num ?? ''}
              </span>
              <span className="whitespace-pre-wrap break-all" style={{ color }}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
      {/* Right side */}
      <div>
        {rightLines.map((line, i) => {
          const bg =
            line.type === 'added'
              ? 'rgba(34,197,94,0.1)'
              : line.type === 'empty'
                ? 'rgba(34,197,94,0.03)'
                : 'transparent';
          const color = line.type === 'added' ? '#22c55e' : 'var(--foreground)';

          return (
            <div
              key={i}
              className="flex px-2 py-0.5 min-h-[20px]"
              style={{ backgroundColor: bg }}
            >
              <span
                className="w-8 text-right pr-2 select-none flex-shrink-0"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {line.num ?? ''}
              </span>
              <span className="whitespace-pre-wrap break-all" style={{ color }}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple line-based diff using longest common subsequence
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const lcs = lcsMatrix(oldLines, newLines);
  const result: DiffLine[] = [];

  let i = oldLines.length;
  let j = newLines.length;
  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      temp.push({ type: 'same', text: oldLines[i - 1], lineNumOld: i, lineNumNew: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      temp.push({ type: 'added', text: newLines[j - 1], lineNumNew: j });
      j--;
    } else {
      temp.push({ type: 'removed', text: oldLines[i - 1], lineNumOld: i });
      i--;
    }
  }

  temp.reverse();
  return temp;
}

function lcsMatrix(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  // For very large files, limit comparison
  if (m * n > 500000) {
    return simpleDiffMatrix(a, b);
  }
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

// Fallback for large files: simple heuristic
function simpleDiffMatrix(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  // Just mark equal lines on diagonal
  for (let i = 1; i <= Math.min(m, n); i++) {
    dp[i][i] = dp[i - 1][i - 1] + (a[i - 1] === b[i - 1] ? 1 : 0);
  }
  // Fill rest with max of neighbors
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (dp[i][j] === 0) {
        dp[i][j] = Math.max(dp[i - 1][j] || 0, dp[i][j - 1] || 0);
      }
    }
  }
  return dp;
}

function stripHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  // SSR fallback
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
