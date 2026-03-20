'use client';
import { useState, useMemo } from 'react';
import { useVersionHistoryStore } from '@/store/version-history-store';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  GitPullRequestDraft, Check, X, CheckCheck, XCircle, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, User, Clock, MessageSquare, Plus, Minus,
  Replace, Filter,
} from 'lucide-react';
import type { TrackedChange } from '@/store/version-history-store';

function formatRelative(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChangeItem({ change }: { change: TrackedChange }) {
  const {
    acceptTrackedChange, rejectTrackedChange, addCommentToTrackedChange,
  } = useVersionHistoryStore();
  const updateSectionContent = useResearchStore((s) => s.updateSectionContent);
  const sections = useResearchStore((s) => s.sections);
  const [expanded, setExpanded] = useState(true);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState(change.comment || '');

  const section = sections.find((s) => s.id === change.sectionId);
  const isPending = change.status === 'pending';

  const handleAccept = () => {
    acceptTrackedChange(change.id);
    if (!section) return;
    if (change.type === 'insertion') {
      updateSectionContent(section.id, section.content + '\n' + change.newText);
    } else if (change.type === 'deletion') {
      updateSectionContent(section.id, section.content.replace(change.originalText, ''));
    } else if (change.type === 'replacement') {
      updateSectionContent(section.id, section.content.replace(change.originalText, change.newText));
    }
  };

  const handleReject = () => {
    rejectTrackedChange(change.id);
  };

  const handleSaveComment = () => {
    addCommentToTrackedChange(change.id, commentText);
    setShowCommentInput(false);
  };

  const typeConfig = {
    insertion: { icon: Plus, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Insertion' },
    deletion: { icon: Minus, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Deletion' },
    replacement: { icon: Replace, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Replacement' },
  }[change.type];

  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        change.status === 'accepted' && 'opacity-50',
        change.status === 'rejected' && 'opacity-30',
      )}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className={cn('flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded', typeConfig.bg, typeConfig.color)}>
          <TypeIcon size={10} />
          {typeConfig.label}
        </span>
        <span className="text-xs truncate flex-1">{section?.title || 'Unknown'}</span>
        {change.status !== 'pending' && (
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded font-medium',
            change.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {change.status}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Inline markup preview */}
          <div className="rounded border px-2 py-2 text-xs leading-relaxed" style={{ borderColor: 'var(--border)' }}>
            {change.type === 'insertion' && (
              <span className="underline decoration-green-400 decoration-2 text-green-300 bg-green-500/10 px-0.5">
                {change.newText}
              </span>
            )}
            {change.type === 'deletion' && (
              <span className="line-through decoration-red-400 decoration-2 text-red-300 bg-red-500/10 px-0.5">
                {change.originalText}
              </span>
            )}
            {change.type === 'replacement' && (
              <>
                <span className="line-through decoration-red-400 decoration-2 text-red-300 bg-red-500/10 px-0.5">
                  {change.originalText}
                </span>
                <span className="mx-1 opacity-30">→</span>
                <span className="underline decoration-green-400 decoration-2 text-green-300 bg-green-500/10 px-0.5">
                  {change.newText}
                </span>
              </>
            )}
          </div>

          {/* Author / time annotation */}
          <div className="flex items-center gap-2 text-[10px] opacity-50">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {change.author.charAt(0)}
            </div>
            <span>{change.author}</span>
            <Clock size={9} />
            <span>{formatRelative(change.timestamp)}</span>
          </div>

          {/* Comment */}
          {change.comment && !showCommentInput && (
            <div className="flex items-start gap-1.5 text-[10px] opacity-60 border-l-2 pl-2 py-0.5" style={{ borderColor: 'var(--primary)' }}>
              <MessageSquare size={9} className="mt-0.5 shrink-0" />
              <span>{change.comment}</span>
            </div>
          )}

          {/* Comment input */}
          {showCommentInput && (
            <div className="space-y-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment on this change..."
                className="w-full text-[10px] px-2 py-1 rounded border bg-transparent resize-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                rows={2}
              />
              <div className="flex gap-1">
                <button
                  onClick={handleSaveComment}
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Save
                </button>
                <button onClick={() => setShowCommentInput(false)} className="px-2 py-0.5 rounded text-[10px] opacity-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 pt-1">
            {isPending && (
              <>
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
                >
                  <Check size={10} /> Accept
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-red-600/80 text-white hover:bg-red-500 transition-colors"
                >
                  <X size={10} /> Reject
                </button>
              </>
            )}
            {!showCommentInput && (
              <button
                onClick={() => setShowCommentInput(true)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] opacity-50 hover:opacity-100 ml-auto"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <MessageSquare size={10} /> Comment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackChanges() {
  const {
    trackedChanges, trackChangesEnabled, setTrackChangesEnabled,
    showTrackChanges, setShowTrackChanges,
    acceptAllTrackedChanges, rejectAllTrackedChanges,
  } = useVersionHistoryStore();
  const sections = useResearchStore((s) => s.sections);
  const updateSectionContent = useResearchStore((s) => s.updateSectionContent);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  const authors = useMemo(() => {
    const set = new Set(trackedChanges.map((c) => c.author));
    return Array.from(set);
  }, [trackedChanges]);

  const filtered = useMemo(() => {
    let result = trackedChanges;
    if (filter !== 'all') result = result.filter((c) => c.status === filter);
    if (authorFilter) result = result.filter((c) => c.author === authorFilter);
    return result;
  }, [trackedChanges, filter, authorFilter]);

  const stats = useMemo(() => ({
    pending: trackedChanges.filter((c) => c.status === 'pending').length,
    accepted: trackedChanges.filter((c) => c.status === 'accepted').length,
    rejected: trackedChanges.filter((c) => c.status === 'rejected').length,
    insertions: trackedChanges.filter((c) => c.type === 'insertion').length,
    deletions: trackedChanges.filter((c) => c.type === 'deletion').length,
    replacements: trackedChanges.filter((c) => c.type === 'replacement').length,
    total: trackedChanges.length,
  }), [trackedChanges]);

  const handleAcceptAll = () => {
    trackedChanges.forEach((change) => {
      if (change.status !== 'pending') return;
      const section = sections.find((s) => s.id === change.sectionId);
      if (!section) return;
      if (change.type === 'insertion') {
        updateSectionContent(section.id, section.content + '\n' + change.newText);
      } else if (change.type === 'deletion') {
        updateSectionContent(section.id, section.content.replace(change.originalText, ''));
      } else if (change.type === 'replacement') {
        updateSectionContent(section.id, section.content.replace(change.originalText, change.newText));
      }
    });
    acceptAllTrackedChanges();
  };

  if (!showTrackChanges) return null;

  return (
    <div
      className="w-80 shrink-0 border-l flex flex-col h-full"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <GitPullRequestDraft size={14} className="text-blue-400" />
        <span className="text-xs font-semibold">Track Changes</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
          {stats.pending}
        </span>
        <button
          onClick={() => setShowTrackChanges(false)}
          className="ml-auto opacity-50 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>

      {/* Track changes toggle */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setTrackChangesEnabled(!trackChangesEnabled)}
          className="flex items-center gap-1.5 text-[10px]"
        >
          {trackChangesEnabled
            ? <ToggleRight size={16} className="text-green-400" />
            : <ToggleLeft size={16} className="opacity-40" />
          }
          <span className={cn(trackChangesEnabled ? 'text-green-400 font-medium' : 'opacity-50')}>
            {trackChangesEnabled ? 'Tracking ON' : 'Tracking OFF'}
          </span>
        </button>
        <div className="flex items-center gap-1.5 ml-auto text-[10px] opacity-40">
          <span className="flex items-center gap-0.5 text-green-400">
            <Plus size={9} />{stats.insertions}
          </span>
          <span className="flex items-center gap-0.5 text-red-400">
            <Minus size={9} />{stats.deletions}
          </span>
          <span className="flex items-center gap-0.5 text-blue-400">
            <Replace size={9} />{stats.replacements}
          </span>
        </div>
      </div>

      {/* Batch actions */}
      <div className="flex items-center gap-1 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleAcceptAll}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-green-600 text-white hover:bg-green-500"
        >
          <CheckCheck size={10} /> Accept All
        </button>
        <button
          onClick={rejectAllTrackedChanges}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-red-600/80 text-white hover:bg-red-500"
        >
          <XCircle size={10} /> Reject All
        </button>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b shrink-0 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
        {/* Status filter */}
        <div className="flex gap-1">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('px-2 py-0.5 rounded text-[10px] capitalize', filter === f ? 'font-medium' : 'opacity-40')}
              style={filter === f ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Author filter */}
        {authors.length > 1 && (
          <div className="flex items-center gap-1">
            <Filter size={9} className="opacity-30" />
            <button
              onClick={() => setAuthorFilter(null)}
              className={cn('px-1.5 py-0.5 rounded text-[10px]', !authorFilter ? 'font-medium' : 'opacity-40')}
              style={!authorFilter ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
            >
              All authors
            </button>
            {authors.map((a) => (
              <button
                key={a}
                onClick={() => setAuthorFilter(authorFilter === a ? null : a)}
                className={cn('px-1.5 py-0.5 rounded text-[10px]', authorFilter === a ? 'font-medium' : 'opacity-40')}
                style={authorFilter === a ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
              >
                {a.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((change) => (
          <ChangeItem key={change.id} change={change} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <GitPullRequestDraft size={24} className="mx-auto opacity-20 mb-2" />
            <p className="text-xs opacity-40">No tracked changes</p>
            {!trackChangesEnabled && (
              <p className="text-[10px] opacity-30 mt-1">Enable tracking to start recording changes</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
