'use client';

import { cn } from '@/lib/utils';

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded', className)}
      style={{
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      aria-hidden="true"
    />
  );
}

// ─── Card Skeleton ────────────────────────────────────────────────────────────

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-lg p-4 flex flex-col gap-3', className)}
      style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
      aria-hidden="true"
    >
      {/* Title line */}
      <Skeleton className="h-5 w-2/3" />

      {/* Body lines */}
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-[90%]" />
      <Skeleton className="h-3.5 w-4/5" />

      {/* Action bar */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, columns, className }: { rows?: number; columns?: number; className?: string }) {
  const bodyRows = Array.from({ length: rows }, (_, i) => [70, 85, 60, 75, 80][i % 5]);
  const colWidths = columns ? Array.from({ length: columns }) : null;

  return (
    <div
      className={cn('rounded-lg overflow-hidden', className)}
      style={{ border: '1px solid var(--border)' }}
      aria-hidden="true"
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        <Skeleton className="h-4 w-4 rounded" />
        {(colWidths ?? [40, 60, 50, 30]).map((w, i) => (
          <Skeleton key={i} className="h-4 flex-1" width={colWidths ? undefined : `${w}%`} />
        ))}
      </div>

      {/* Body rows */}
      {bodyRows.map((widthPercent, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-4 py-3"
          style={{
            borderBottom: rowIdx < bodyRows.length - 1 ? '1px solid var(--border)' : undefined,
            backgroundColor: rowIdx % 2 === 0 ? 'var(--background)' : 'var(--sidebar)',
          }}
        >
          <Skeleton className="h-4 w-4 rounded" />
          {(colWidths ?? [widthPercent, 100 - widthPercent + 20, 45, 25]).map((w, colIdx) => (
            <Skeleton key={colIdx} className="h-3.5 flex-1" width={colWidths ? undefined : `${Math.min(w as number, 100)}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Editor Skeleton ──────────────────────────────────────────────────────────

export function EditorSkeleton({ className }: { className?: string }) {
  // Varying widths to mimic natural paragraph text
  const lineWidths = ['100%', '96%', '88%', '100%', '92%', '75%', '100%', '97%', '83%', '100%', '90%', '60%'];

  return (
    <div className={cn('flex flex-col h-full', className)} style={{ backgroundColor: 'var(--background)' }} aria-hidden="true">
      {/* Toolbar skeleton */}
      <div
        className="flex items-center gap-2 px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        {/* Toolbar button groups */}
        {[6, 6, 6, 8, 6, 10, 6].map((w, i) => (
          <Skeleton key={i} className="h-7 rounded" width={`${w * 4}px`} />
        ))}
        <div className="flex-1" />
        <Skeleton className="h-7 w-24 rounded" />
      </div>

      {/* Ruler line */}
      <div
        className="flex items-center px-4 py-1 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        <Skeleton className="h-2.5 w-full opacity-50" />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex items-start justify-center py-8 px-4">
        <div
          className="w-full max-w-2xl rounded-lg p-8 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
        >
          {/* Document title */}
          <Skeleton className="h-8 w-1/2 mb-4" />

          {/* Paragraph lines */}
          {lineWidths.map((w, i) => (
            <Skeleton key={i} className="h-4" width={w} />
          ))}

          {/* Blank gap between paragraphs */}
          <div className="h-2" />

          {[...lineWidths].reverse().slice(0, 8).map((w, i) => (
            <Skeleton key={`p2-${i}`} className="h-4" width={w} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Skeleton ────────────────────────────────────────────────────────────

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-full w-full', className)} style={{ backgroundColor: 'var(--background)' }} aria-hidden="true">
      {/* Sidebar-like area */}
      <div
        className="w-52 shrink-0 flex flex-col gap-3 p-4"
        style={{ borderRight: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        {/* Logo area */}
        <Skeleton className="h-8 w-32 mb-2" />

        {/* Nav group label */}
        <Skeleton className="h-3 w-16 mb-1" />
        {[70, 80, 65, 75].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-md" width={`${w}%`} />
        ))}

        {/* Second nav group */}
        <Skeleton className="h-3 w-20 mt-3 mb-1" />
        {[60, 72, 68].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-md" width={`${w}%`} />
        ))}

        <div className="flex-1" />

        {/* Bottom nav items */}
        {[65, 55].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-md" width={`${w}%`} />
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div
          className="flex items-center gap-3 px-6 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
        >
          <Skeleton className="h-6 w-40" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Content grid */}
        <div className="flex-1 overflow-auto p-6">
          {/* Page title */}
          <Skeleton className="h-8 w-56 mb-6" />

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>

          {/* Table section */}
          <div className="mt-8">
            <Skeleton className="h-6 w-36 mb-4" />
            <TableSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
