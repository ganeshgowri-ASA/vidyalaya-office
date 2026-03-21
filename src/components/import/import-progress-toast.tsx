'use client';

import React, { useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, X, FileText, Table2, Presentation, FileDown } from 'lucide-react';
import { useImportStore, type ImportFileType } from '@/store/import-store';

const FILE_TYPE_CONFIG: Record<ImportFileType, { icon: React.ElementType; color: string; label: string }> = {
  docx: { icon: FileText, color: '#3b82f6', label: 'Document' },
  xlsx: { icon: Table2, color: '#16a34a', label: 'Spreadsheet' },
  pptx: { icon: Presentation, color: '#f59e0b', label: 'Presentation' },
  csv: { icon: Table2, color: '#16a34a', label: 'CSV' },
  tsv: { icon: Table2, color: '#16a34a', label: 'TSV' },
  txt: { icon: FileText, color: '#3b82f6', label: 'Text' },
  md: { icon: FileText, color: '#3b82f6', label: 'Markdown' },
  pdf: { icon: FileDown, color: '#dc2626', label: 'PDF' },
  unknown: { icon: FileText, color: '#6b7280', label: 'File' },
};

export function ImportProgressToast() {
  const { currentJob, clearJob } = useImportStore();

  // Auto-dismiss on success after 3 seconds
  useEffect(() => {
    if (currentJob?.status === 'success') {
      const timer = setTimeout(clearJob, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentJob?.status, clearJob]);

  if (!currentJob) return null;

  const config = FILE_TYPE_CONFIG[currentJob.fileType] ?? FILE_TYPE_CONFIG.unknown;
  const Icon = config.icon;
  const isActive = currentJob.status === 'detecting' || currentJob.status === 'parsing' || currentJob.status === 'importing';
  const isSuccess = currentJob.status === 'success';
  const isError = currentJob.status === 'error';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 rounded-xl border shadow-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: isError ? '#dc2626' : isSuccess ? '#16a34a' : 'var(--border)',
        width: 340,
      }}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 p-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          {isActive ? (
            <Loader2 size={20} className="animate-spin" style={{ color: config.color }} />
          ) : isSuccess ? (
            <CheckCircle size={20} style={{ color: '#16a34a' }} />
          ) : isError ? (
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
          ) : (
            <Icon size={20} style={{ color: config.color }} />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
            {isSuccess ? 'Import Complete' : isError ? 'Import Failed' : `Importing ${config.label}`}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {currentJob.message}
          </p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
            {currentJob.fileName} ({(currentJob.fileSize / 1024).toFixed(1)} KB)
          </p>
        </div>

        {/* Close */}
        <button
          onClick={clearJob}
          className="shrink-0 p-1 rounded hover:bg-[var(--muted)]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="h-1" style={{ backgroundColor: 'var(--muted)' }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${currentJob.progress}%`,
              backgroundColor: config.color,
            }}
          />
        </div>
      )}

      {/* Error details */}
      {isError && currentJob.error && (
        <div className="px-3 pb-3">
          <p className="text-[11px] p-2 rounded" style={{ backgroundColor: '#dc262610', color: '#dc2626' }}>
            {currentJob.error}
          </p>
        </div>
      )}
    </div>
  );
}
