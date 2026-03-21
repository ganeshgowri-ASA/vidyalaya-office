'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  History,
  Clock,
  User,
  RotateCcw,
  ChevronRight,
  Trash2,
  Save,
  GitCompare,
  HardDrive,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { useFileVersionStore, type FileVersionMeta } from '@/store/file-version-store';
import { getVersionById } from '@/lib/indexeddb-versions';
import { VersionDiffView } from './version-diff-view';

interface FileVersionHistoryProps {
  /** Callback to restore content to the editor */
  onRestore: (content: string) => void;
  /** Get current editor content for creating manual versions */
  getCurrentContent: () => string;
}

export function FileVersionHistory({ onRestore, getCurrentContent }: FileVersionHistoryProps) {
  const {
    versions,
    loading,
    showPanel,
    setShowPanel,
    selectedVersionId,
    setSelectedVersion,
    compareVersionId,
    setCompareVersion,
    diffViewActive,
    setDiffViewActive,
    diffViewMode,
    setDiffViewMode,
    restoreConfirmId,
    setRestoreConfirmId,
    createVersion,
    removeVersion,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastAutoSaveAt,
  } = useFileVersionStore();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Today']));
  const [compareMode, setCompareMode] = useState(false);
  const [diffContent, setDiffContent] = useState<{ oldContent: string; newContent: string; oldLabel: string; newLabel: string } | null>(null);

  // Load diff content when both versions selected
  useEffect(() => {
    if (!compareMode || !selectedVersionId || !compareVersionId) {
      setDiffContent(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [vA, vB] = await Promise.all([
        getVersionById(selectedVersionId),
        getVersionById(compareVersionId),
      ]);
      if (cancelled || !vA || !vB) return;
      setDiffContent({
        oldContent: vA.content,
        newContent: vB.content,
        oldLabel: `${vA.label} (${formatDateTime(vA.timestamp)})`,
        newLabel: `${vB.label} (${formatDateTime(vB.timestamp)})`,
      });
      setDiffViewActive(true);
    })();
    return () => { cancelled = true; };
  }, [compareMode, selectedVersionId, compareVersionId, setDiffViewActive]);

  const handleManualSave = useCallback(() => {
    const content = getCurrentContent();
    createVersion(content, 'Manual save', 'Current User', false);
  }, [getCurrentContent, createVersion]);

  const handleRestore = useCallback(async (versionId: string) => {
    const version = await getVersionById(versionId);
    if (version) {
      onRestore(version.content);
      setRestoreConfirmId(null);
      // Create a restore point
      createVersion(version.content, `Restored from "${version.label}"`, 'Current User', false);
    }
  }, [onRestore, setRestoreConfirmId, createVersion]);

  const handleCompareSelect = useCallback((id: string) => {
    if (!selectedVersionId) {
      setSelectedVersion(id);
    } else if (!compareVersionId) {
      setCompareVersion(id);
    } else {
      setSelectedVersion(id);
      setCompareVersion(null);
      setDiffContent(null);
      setDiffViewActive(false);
    }
  }, [selectedVersionId, compareVersionId, setSelectedVersion, setCompareVersion, setDiffViewActive]);

  if (!showPanel) return null;

  // Group versions by date
  const groups: Record<string, FileVersionMeta[]> = {};
  versions.forEach((v) => {
    const key = formatDateGroup(v.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  });

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedGroups(next);
  };

  return (
    <>
      <div
        className="flex flex-col border-l flex-shrink-0 h-full"
        style={{
          width: 320,
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <History size={15} style={{ color: 'var(--primary)' }} />
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              File Versions
            </h3>
          </div>
          <button
            onClick={() => setShowPanel(false)}
            className="rounded p-1 hover:bg-[var(--muted)]"
          >
            <X size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* Actions bar */}
        <div
          className="flex items-center gap-2 px-4 py-2 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={handleManualSave}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-medium hover:bg-[var(--muted)] transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            <Save size={11} />
            Save Version
          </button>
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedVersion(null);
              setCompareVersion(null);
              setDiffContent(null);
              setDiffViewActive(false);
            }}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
              compareMode ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--muted)]'
            }`}
            style={
              compareMode
                ? { borderColor: 'var(--primary)' }
                : { borderColor: 'var(--border)', color: 'var(--foreground)' }
            }
          >
            <GitCompare size={11} />
            Compare
          </button>
        </div>

        {/* Auto-save toggle */}
        <div
          className="flex items-center justify-between px-4 py-1.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <label
            className="flex items-center gap-1.5 text-[10px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            Auto-save every 5 min
          </label>
          {lastAutoSaveAt && (
            <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
              Last: {formatTime(lastAutoSaveAt)}
            </span>
          )}
        </div>

        {/* Compare mode hints */}
        {compareMode && (
          <div
            className="px-4 py-1.5 text-[10px] border-b"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
          >
            {!selectedVersionId
              ? 'Select first version (A)'
              : !compareVersionId
                ? 'Select second version (B)'
                : 'Comparing A vs B. Click another to reset.'}
          </div>
        )}

        {/* Version list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Loading versions...
              </span>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <HardDrive size={24} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                No versions yet
              </span>
              <span className="text-[10px] text-center px-4" style={{ color: 'var(--muted-foreground)' }}>
                Versions are automatically saved every 5 minutes, or save one manually.
              </span>
            </div>
          ) : (
            Object.entries(groups).map(([date, versionList]) => (
              <div key={date}>
                <button
                  onClick={() => toggleGroup(date)}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-[var(--muted)] transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <ChevronRight
                    size={12}
                    className={`transition-transform ${expandedGroups.has(date) ? 'rotate-90' : ''}`}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {date}
                  </span>
                  <span className="text-[9px]">({versionList.length})</span>
                </button>

                {expandedGroups.has(date) &&
                  versionList.map((version) => {
                    const isSelectedA = compareMode && selectedVersionId === version.id;
                    const isSelectedB = compareMode && compareVersionId === version.id;
                    const isSelected = !compareMode && selectedVersionId === version.id;

                    return (
                      <div
                        key={version.id}
                        className={`px-4 py-3 border-b cursor-pointer transition-colors ${
                          isSelected || isSelectedA || isSelectedB
                            ? 'bg-[var(--accent)]'
                            : 'hover:bg-[var(--muted)]'
                        }`}
                        style={{ borderColor: 'var(--border)' }}
                        onClick={() => {
                          if (compareMode) {
                            handleCompareSelect(version.id);
                          } else {
                            setSelectedVersion(
                              selectedVersionId === version.id ? null : version.id
                            );
                          }
                        }}
                      >
                        {/* Version header */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {compareMode && (
                              <span
                                className={`w-4 h-4 rounded-full border text-[8px] flex items-center justify-center font-bold ${
                                  isSelectedA
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : isSelectedB
                                      ? 'bg-green-500 text-white border-green-500'
                                      : ''
                                }`}
                                style={
                                  !isSelectedA && !isSelectedB
                                    ? { borderColor: 'var(--border)' }
                                    : undefined
                                }
                              >
                                {isSelectedA ? 'A' : isSelectedB ? 'B' : ''}
                              </span>
                            )}
                            <Tag size={10} style={{ color: 'var(--muted-foreground)' }} />
                            <span
                              className="text-[11px] font-medium truncate max-w-[140px]"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {version.label}
                            </span>
                            {version.isAutoSave && (
                              <span
                                className="text-[8px] px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'var(--muted)',
                                  color: 'var(--muted-foreground)',
                                }}
                              >
                                auto
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[10px]"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {formatTime(version.timestamp)}
                          </span>
                        </div>

                        {/* Author & size */}
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className="flex items-center gap-1 text-[10px]"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            <User size={9} />
                            {version.author}
                          </span>
                          <span
                            className="flex items-center gap-1 text-[10px]"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            <HardDrive size={9} />
                            {formatSize(version.size)}
                          </span>
                          <span
                            className="flex items-center gap-1 text-[10px]"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            <Clock size={9} />
                            {formatDateTime(version.timestamp)}
                          </span>
                        </div>

                        {/* Actions when selected (non-compare mode) */}
                        {isSelected && !compareMode && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRestoreConfirmId(version.id);
                              }}
                              className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-medium border hover:bg-[var(--muted)] transition-colors"
                              style={{
                                borderColor: 'var(--border)',
                                color: 'var(--primary)',
                              }}
                            >
                              <RotateCcw size={10} />
                              Restore
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVersion(version.id);
                                setSelectedVersion(null);
                              }}
                              className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-medium border hover:bg-red-900/30 transition-colors"
                              style={{
                                borderColor: 'var(--border)',
                                color: '#ef4444',
                              }}
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Version count footer */}
        <div
          className="px-4 py-2 border-t text-[10px]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          {versions.length} version{versions.length !== 1 ? 's' : ''} · Max 50 per file
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {restoreConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-lg border p-6 w-[400px] shadow-xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
              >
                <AlertTriangle size={20} style={{ color: '#eab308' }} />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Restore Version?
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  This will replace the current content with the selected version. A snapshot of the current state will be saved first.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRestoreConfirmId(null)}
                className="rounded-md border px-4 py-2 text-xs font-medium hover:bg-[var(--muted)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestore(restoreConfirmId)}
                className="rounded-md px-4 py-2 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff View Modal */}
      {diffViewActive && diffContent && (
        <VersionDiffView
          oldContent={diffContent.oldContent}
          newContent={diffContent.newContent}
          oldLabel={diffContent.oldLabel}
          newLabel={diffContent.newLabel}
          mode={diffViewMode}
          onModeChange={setDiffViewMode}
          onClose={() => {
            setDiffViewActive(false);
            setDiffContent(null);
          }}
        />
      )}
    </>
  );
}

// Helpers

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateGroup(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
