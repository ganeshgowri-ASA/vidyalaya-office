'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useVersionHistoryStore } from '@/store/version-history-store';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  History, Clock, RotateCcw, GitCompare, Save,
  MessageSquare, CheckCircle2, Trash2, X, User, ChevronDown,
  ChevronRight, FileText, Plus, Download, ToggleLeft, ToggleRight,
  Pencil, Timer, Columns2, Rows3, Tag, AlertTriangle,
  GitBranch, Settings,
} from 'lucide-react';
import type { VersionSnapshot } from '@/store/version-history-store';

// Simple word-level diff
function computeDiff(oldText: string, newText: string): { type: 'same' | 'add' | 'remove'; text: string }[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const result: { type: 'same' | 'add' | 'remove'; text: string }[] = [];

  const maxLen = Math.max(oldWords.length, newWords.length);
  let oi = 0;
  let ni = 0;

  while (oi < oldWords.length || ni < newWords.length) {
    if (oi < oldWords.length && ni < newWords.length && oldWords[oi] === newWords[ni]) {
      result.push({ type: 'same', text: oldWords[oi] });
      oi++;
      ni++;
    } else if (ni < newWords.length && (oi >= oldWords.length || !oldWords.slice(oi, oi + 3).includes(newWords[ni]))) {
      result.push({ type: 'add', text: newWords[ni] });
      ni++;
    } else if (oi < oldWords.length) {
      result.push({ type: 'remove', text: oldWords[oi] });
      oi++;
    } else {
      break;
    }
    if (result.length > maxLen * 2) break;
  }

  return result;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return formatDate(iso);
}

// --- Sub-components ---

function UnifiedDiffView({ snapshot, compareSnapshot }: { snapshot: VersionSnapshot; compareSnapshot?: VersionSnapshot | null }) {
  const sections = useResearchStore((s) => s.sections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const baseSections = compareSnapshot ? compareSnapshot.sections : sections;

  const sectionDiffs = useMemo(() => {
    const targetSections = compareSnapshot ? snapshot.sections : sections;
    return targetSections.map((current) => {
      const old = (compareSnapshot ? compareSnapshot.sections : snapshot.sections).find((s) => s.id === current.id);
      const oldContent = compareSnapshot ? (old?.content || '') : (snapshot.sections.find((s) => s.id === current.id)?.content || '');
      const newContent = compareSnapshot ? current.content : current.content;
      const actualOld = compareSnapshot ? oldContent : oldContent;
      const actualNew = compareSnapshot ? newContent : sections.find((s) => s.id === current.id)?.content || '';
      const diff = computeDiff(actualOld, actualNew);
      const hasChanges = diff.some((d) => d.type !== 'same');
      return { sectionId: current.id, title: current.title, diff, hasChanges };
    });
  }, [sections, snapshot, compareSnapshot]);

  return (
    <div className="space-y-1 p-2">
      <div className="flex items-center gap-2 px-2 py-1 text-[10px] opacity-50">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Insertions
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Deletions
        </span>
      </div>
      {sectionDiffs.map(({ sectionId, title, diff, hasChanges }) => (
        <div key={sectionId} className="rounded border" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => toggleSection(sectionId)}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium hover:opacity-80"
          >
            {expandedSections.has(sectionId) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>{title}</span>
            {hasChanges ? (
              <span className="ml-auto text-[10px] text-yellow-400">Modified</span>
            ) : (
              <span className="ml-auto text-[10px] opacity-30">No changes</span>
            )}
          </button>
          {expandedSections.has(sectionId) && (
            <div className="px-3 py-2 border-t text-xs leading-relaxed" style={{ borderColor: 'var(--border)' }}>
              {diff.map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    d.type === 'add' && 'bg-green-500/20 text-green-300',
                    d.type === 'remove' && 'bg-red-500/20 text-red-300 line-through',
                  )}
                >
                  {d.text}
                </span>
              ))}
              {diff.length === 0 && <span className="opacity-40">Empty section</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SideBySideDiffView({ snapshot, compareSnapshot }: { snapshot: VersionSnapshot; compareSnapshot?: VersionSnapshot | null }) {
  const sections = useResearchStore((s) => s.sections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentSections = compareSnapshot ? snapshot.sections : sections;

  return (
    <div className="space-y-1 p-2">
      <div className="grid grid-cols-2 gap-1 px-2 py-1 text-[10px] opacity-40">
        <span>{compareSnapshot ? compareSnapshot.label : snapshot.label}</span>
        <span>{compareSnapshot ? snapshot.label : 'Current'}</span>
      </div>
      {currentSections.map((current) => {
        const oldSection = (compareSnapshot ? compareSnapshot.sections : snapshot.sections).find((s) => s.id === current.id);
        const oldContent = oldSection?.content || '';
        const newContent = compareSnapshot ? current.content : (sections.find((s) => s.id === current.id)?.content || '');
        const hasChanges = oldContent !== newContent;
        const isExpanded = expandedSections.has(current.id);

        return (
          <div key={current.id} className="rounded border" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => toggleSection(current.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium hover:opacity-80"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span>{current.title}</span>
              {hasChanges ? (
                <span className="ml-auto text-[10px] text-yellow-400">Modified</span>
              ) : (
                <span className="ml-auto text-[10px] opacity-30">No changes</span>
              )}
            </button>
            {isExpanded && (
              <div className="grid grid-cols-2 divide-x border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="px-2 py-1.5 text-[10px] leading-relaxed bg-red-500/5">
                  {oldContent || <span className="opacity-30 italic">empty</span>}
                </div>
                <div className="px-2 py-1.5 text-[10px] leading-relaxed bg-green-500/5">
                  {newContent || <span className="opacity-30 italic">empty</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VersionTimeline() {
  const {
    snapshots, selectedSnapshotId, compareSnapshotId,
    setSelectedSnapshot, setCompareSnapshot, setDiffViewActive,
    removeSnapshot, renameSnapshot,
  } = useVersionHistoryStore();
  const sections = useResearchStore((s) => s.sections);
  const updateSectionContent = useResearchStore((s) => s.updateSectionContent);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [snapshots]
  );

  const handleRestore = (snapshot: VersionSnapshot) => {
    snapshot.sections.forEach((s) => {
      updateSectionContent(s.id, s.content);
    });
    setConfirmRestore(null);
    setSelectedSnapshot(null);
  };

  const handleExportVersion = (snapshot: VersionSnapshot) => {
    let doc = `${snapshot.label}\n${'='.repeat(snapshot.label.length)}\n`;
    doc += `Author: ${snapshot.author} | Date: ${formatDate(snapshot.timestamp)}\n`;
    doc += `Words: ${snapshot.totalWordCount} | Sections: ${snapshot.sections.length}\n\n`;
    snapshot.sections.forEach((s) => {
      doc += `--- ${s.title} ---\n${s.content}\n\n`;
    });
    const blob = new Blob([doc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snapshot.label.replace(/\s+/g, '-').toLowerCase()}-${new Date(snapshot.timestamp).toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startRename = (snap: VersionSnapshot) => {
    setEditingLabel(snap.id);
    setLabelText(snap.label);
  };

  const saveRename = () => {
    if (editingLabel && labelText.trim()) {
      renameSnapshot(editingLabel, labelText.trim());
    }
    setEditingLabel(null);
  };

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: VersionSnapshot[] }[] = [];
    sorted.forEach((snap) => {
      const date = formatDate(snap.timestamp);
      const existing = groups.find((g) => g.date === date);
      if (existing) existing.items.push(snap);
      else groups.push({ date, items: [snap] });
    });
    return groups;
  }, [sorted]);

  return (
    <div className="space-y-1 p-2">
      {groupedByDate.map((group) => (
        <div key={group.date}>
          <p className="text-[10px] opacity-30 px-2 py-1 font-medium">{group.date}</p>
          {group.items.map((snap) => {
            const isSelected = selectedSnapshotId === snap.id;
            const isCompare = compareSnapshotId === snap.id;
            return (
              <div
                key={snap.id}
                className={cn(
                  'rounded-lg border p-2 cursor-pointer transition-all mb-1',
                  isSelected ? 'ring-1' : isCompare ? 'ring-1 ring-blue-400/50' : 'hover:opacity-90'
                )}
                style={{
                  backgroundColor: isSelected ? 'var(--sidebar-accent)' : isCompare ? 'rgba(96, 165, 250, 0.05)' : 'var(--background)',
                  borderColor: isSelected ? 'var(--primary)' : isCompare ? 'rgba(96, 165, 250, 0.3)' : 'var(--border)',
                }}
                onClick={() => {
                  if (isSelected) {
                    setSelectedSnapshot(null);
                    setDiffViewActive(false);
                  } else {
                    setSelectedSnapshot(snap.id);
                    setDiffViewActive(true);
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center mt-1">
                    <div
                      className={cn('w-2.5 h-2.5 rounded-full shrink-0', snap.isAutoSave ? 'bg-blue-400' : 'bg-green-400')}
                    />
                    <div className="w-px h-4 opacity-20" style={{ backgroundColor: 'var(--foreground)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingLabel === snap.id ? (
                      <div className="flex gap-1 mb-1">
                        <input
                          value={labelText}
                          onChange={(e) => setLabelText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                          onBlur={saveRename}
                          className="text-xs px-1.5 py-0.5 rounded border bg-transparent flex-1"
                          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Tag size={9} className="opacity-30" />
                        <p className="text-xs font-medium truncate">{snap.label}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(snap); }}
                          className="opacity-0 group-hover:opacity-50 hover:opacity-100 ml-0.5"
                          title="Rename snapshot"
                        >
                          <Pencil size={9} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-50">
                      <User size={9} />
                      <span>{snap.author}</span>
                      <span>·</span>
                      <Clock size={9} />
                      <span>{formatTime(snap.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-40">
                      <FileText size={9} />
                      <span>{snap.sections.length} sections</span>
                      <span>·</span>
                      <span>{snap.totalWordCount} words</span>
                      {snap.isAutoSave && (
                        <span className="text-blue-400 flex items-center gap-0.5">
                          <Timer size={8} /> auto
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDiffViewActive(true); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:opacity-80"
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <GitCompare size={10} /> Diff
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCompareSnapshot(snap.id); }}
                      className={cn('flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:opacity-80', isCompare && 'ring-1 ring-blue-400')}
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <GitBranch size={10} /> Compare
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleExportVersion(snap); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:opacity-80"
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <Download size={10} /> Export
                    </button>
                    {confirmRestore === snap.id ? (
                      <div className="flex items-center gap-1 ml-auto">
                        <AlertTriangle size={10} className="text-yellow-400" />
                        <span className="text-[10px] text-yellow-400">Restore?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestore(snap); }}
                          className="px-2 py-0.5 rounded text-[10px] bg-green-600 text-white hover:bg-green-500"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmRestore(null); }}
                          className="px-2 py-0.5 rounded text-[10px] opacity-60 hover:opacity-100"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmRestore(snap.id); }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:opacity-80 ml-auto"
                        style={{ backgroundColor: 'var(--background)' }}
                      >
                        <RotateCcw size={10} /> Restore
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-xs opacity-40 text-center py-4">No snapshots yet</p>
      )}
    </div>
  );
}

function CommentsPanel() {
  const { comments, resolveComment, deleteComment, addComment } = useVersionHistoryStore();
  const sections = useResearchStore((s) => s.sections);
  const [showAdd, setShowAdd] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newSelectedText, setNewSelectedText] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filtered = useMemo(() => {
    if (filter === 'open') return comments.filter((c) => !c.resolved);
    if (filter === 'resolved') return comments.filter((c) => c.resolved);
    return comments;
  }, [comments, filter]);

  const handleAdd = () => {
    if (!newComment.trim() || !newSection) return;
    addComment({
      sectionId: newSection,
      selectedText: newSelectedText,
      comment: newComment,
      author: 'John Smith',
    });
    setNewComment('');
    setNewSelectedText('');
    setShowAdd(false);
  };

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center gap-1">
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn('px-2 py-1 rounded text-[10px] capitalize', filter === f ? 'font-medium' : 'opacity-50')}
            style={filter === f ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          >
            {f} {f === 'open' ? `(${comments.filter((c) => !c.resolved).length})` : f === 'all' ? `(${comments.length})` : ''}
          </button>
        ))}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:opacity-80"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={10} /> Add
        </button>
      </div>

      {showAdd && (
        <div className="rounded border p-2 space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <select
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            className="w-full text-xs px-2 py-1 rounded border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="">Select section...</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <input
            value={newSelectedText}
            onChange={(e) => setNewSelectedText(e.target.value)}
            placeholder="Referenced text (optional)"
            className="w-full text-xs px-2 py-1 rounded border bg-transparent"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full text-xs px-2 py-1 rounded border bg-transparent resize-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            rows={2}
          />
          <div className="flex gap-1">
            <button
              onClick={handleAdd}
              className="px-3 py-1 rounded text-[10px] font-medium"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Post
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1 rounded text-[10px] opacity-50 hover:opacity-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {filtered.map((cmt) => {
        const section = sections.find((s) => s.id === cmt.sectionId);
        return (
          <div
            key={cmt.id}
            className={cn('rounded border p-2', cmt.resolved && 'opacity-50')}
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {cmt.author.charAt(0)}
              </div>
              <span className="text-[10px] font-medium">{cmt.author}</span>
              <span className="text-[10px] opacity-40 ml-auto">{formatRelative(cmt.timestamp)}</span>
            </div>
            {cmt.selectedText && (
              <div
                className="text-[10px] italic px-2 py-1 rounded mb-1 border-l-2 opacity-60"
                style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--card)' }}
              >
                &ldquo;{cmt.selectedText}&rdquo;
              </div>
            )}
            <p className="text-xs leading-relaxed">{cmt.comment}</p>
            {section && (
              <p className="text-[10px] opacity-30 mt-1">in {section.title}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={() => resolveComment(cmt.id)}
                className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-[10px]', cmt.resolved ? 'text-green-400' : 'opacity-50 hover:opacity-100')}
              >
                <CheckCircle2 size={10} /> {cmt.resolved ? 'Resolved' : 'Resolve'}
              </button>
              <button
                onClick={() => deleteComment(cmt.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] opacity-40 hover:opacity-100 hover:text-red-400 ml-auto"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <p className="text-xs opacity-40 text-center py-4">No comments</p>
      )}
    </div>
  );
}

function AutoSaveSettings() {
  const { autoSaveIntervalMs, setAutoSaveInterval } = useVersionHistoryStore();
  const intervals = [
    { label: '1 min', ms: 60000 },
    { label: '2 min', ms: 120000 },
    { label: '5 min', ms: 300000 },
    { label: '10 min', ms: 600000 },
    { label: '15 min', ms: 900000 },
    { label: '30 min', ms: 1800000 },
  ];

  return (
    <div className="px-3 py-2 space-y-2">
      <div className="flex items-center gap-2 text-[10px] opacity-50">
        <Settings size={10} />
        <span>Auto-save interval</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {intervals.map((iv) => (
          <button
            key={iv.ms}
            onClick={() => setAutoSaveInterval(iv.ms)}
            className={cn(
              'px-2 py-1 rounded text-[10px]',
              autoSaveIntervalMs === iv.ms ? 'font-medium' : 'opacity-40'
            )}
            style={autoSaveIntervalMs === iv.ms ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          >
            {iv.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExportComparisonButton() {
  const { snapshots, selectedSnapshotId } = useVersionHistoryStore();
  const sections = useResearchStore((s) => s.sections);

  const handleExport = () => {
    const snap = snapshots.find((s) => s.id === selectedSnapshotId);
    if (!snap) return;

    let report = `VERSION COMPARISON REPORT\n`;
    report += `========================\n\n`;
    report += `Comparing: "${snap.label}" (${formatDate(snap.timestamp)}) vs Current\n\n`;

    sections.forEach((current) => {
      const old = snap.sections.find((s) => s.id === current.id);
      report += `--- ${current.title} ---\n`;
      if (!old) {
        report += `[NEW SECTION]\n${current.content}\n\n`;
      } else if (old.content !== current.content) {
        report += `Previous (${old.wordCount} words):\n${old.content}\n\n`;
        report += `Current (${current.wordCount} words):\n${current.content}\n\n`;
      } else {
        report += `[No changes]\n\n`;
      }
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `version-comparison-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedSnapshotId) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] opacity-60 hover:opacity-100"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Download size={10} /> Export Report
    </button>
  );
}

// --- Main Component ---

export default function VersionHistory() {
  const {
    showVersionHistory, setShowVersionHistory,
    trackChangesEnabled, setTrackChangesEnabled,
    snapshots, selectedSnapshotId, compareSnapshotId, diffViewActive, setDiffViewActive,
    diffViewMode, setDiffViewMode,
    addSnapshot, lastAutoSaveAt, autoSaveIntervalMs,
    sectionAuthors,
  } = useVersionHistoryStore();

  const sections = useResearchStore((s) => s.sections);

  const [activeTab, setActiveTab] = useState<'history' | 'comments' | 'authors' | 'settings'>('history');
  const [snapshotLabel, setSnapshotLabel] = useState('');

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      addSnapshot(sections, 'Auto-save', 'John Smith', true);
    }, autoSaveIntervalMs);
    return () => clearInterval(interval);
  }, [sections, addSnapshot, autoSaveIntervalMs]);

  const handleManualSave = useCallback(() => {
    const label = snapshotLabel.trim() || `Manual save at ${new Date().toLocaleTimeString()}`;
    addSnapshot(sections, label, 'John Smith', false);
    setSnapshotLabel('');
  }, [sections, snapshotLabel, addSnapshot]);

  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId);
  const compareSnapshot = snapshots.find((s) => s.id === compareSnapshotId);

  if (!showVersionHistory) return null;

  return (
    <div
      className="w-80 shrink-0 border-l flex flex-col h-full"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <History size={14} />
        <span className="text-xs font-semibold">Version History</span>
        <button
          onClick={() => setShowVersionHistory(false)}
          className="ml-auto opacity-50 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        {([
          ['history', 'History', History],
          ['comments', 'Comments', MessageSquare],
          ['authors', 'Authors', User],
          ['settings', 'Config', Settings],
        ] as const).map(([tab, label, Icon]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 text-[10px] border-b-2 transition-colors',
              activeTab === tab ? 'font-medium' : 'opacity-50 border-transparent hover:opacity-80'
            )}
            style={activeTab === tab ? { borderColor: 'var(--primary)' } : undefined}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Track changes toggle */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setTrackChangesEnabled(!trackChangesEnabled)}
          className="flex items-center gap-1.5 text-[10px]"
        >
          {trackChangesEnabled ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} className="opacity-40" />}
          <span className={cn(trackChangesEnabled ? 'text-green-400' : 'opacity-50')}>Track Changes</span>
        </button>
        <ExportComparisonButton />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'history' && (
          <>
            {/* Manual save */}
            <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-1">
                <input
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  placeholder="Checkpoint name..."
                  className="flex-1 text-xs px-2 py-1.5 rounded border bg-transparent"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSave()}
                />
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] shrink-0"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <Save size={10} /> Save
                </button>
              </div>
              {lastAutoSaveAt && (
                <p className="text-[10px] opacity-30 mt-1 px-1">
                  Last auto-save: {formatRelative(lastAutoSaveAt)}
                </p>
              )}
            </div>

            {/* Diff view or timeline */}
            {diffViewActive && selectedSnapshot ? (
              <div>
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <GitCompare size={12} />
                  <span className="text-[10px] font-medium truncate flex-1">
                    {compareSnapshot
                      ? `${compareSnapshot.label} → ${selectedSnapshot.label}`
                      : `${selectedSnapshot.label} → Current`
                    }
                  </span>
                  {/* Diff mode toggle */}
                  <button
                    onClick={() => setDiffViewMode(diffViewMode === 'unified' ? 'side-by-side' : 'unified')}
                    className="flex items-center gap-0.5 text-[10px] opacity-50 hover:opacity-100"
                    title={diffViewMode === 'unified' ? 'Switch to side-by-side' : 'Switch to unified'}
                  >
                    {diffViewMode === 'unified' ? <Rows3 size={10} /> : <Columns2 size={10} />}
                  </button>
                  <button
                    onClick={() => setDiffViewActive(false)}
                    className="text-[10px] opacity-50 hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
                {diffViewMode === 'unified' ? (
                  <UnifiedDiffView snapshot={selectedSnapshot} compareSnapshot={compareSnapshot} />
                ) : (
                  <SideBySideDiffView snapshot={selectedSnapshot} compareSnapshot={compareSnapshot} />
                )}
              </div>
            ) : (
              <VersionTimeline />
            )}
          </>
        )}

        {activeTab === 'comments' && <CommentsPanel />}

        {activeTab === 'authors' && (
          <div className="p-2 space-y-1">
            <p className="text-[10px] opacity-40 px-2 mb-2">Section authorship metadata</p>
            {sections.map((sec) => {
              const meta = sectionAuthors.find((a) => a.sectionId === sec.id);
              return (
                <div
                  key={sec.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <FileText size={12} className="opacity-40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{sec.title}</p>
                    {meta ? (
                      <p className="text-[10px] opacity-40">
                        {meta.lastEditedBy} - {formatRelative(meta.lastEditedAt)}
                      </p>
                    ) : (
                      <p className="text-[10px] opacity-30">No edits recorded</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'settings' && <AutoSaveSettings />}
      </div>
    </div>
  );
}
