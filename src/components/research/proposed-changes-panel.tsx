'use client';
import { useState, useMemo } from 'react';
import { useVersionHistoryStore } from '@/store/version-history-store';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Sparkles, Check, X, CheckCheck, XCircle, Trash2, Eye,
  ChevronDown, ChevronRight, Plus, Minus, Pencil, BarChart3,
  Columns2, Rows3,
} from 'lucide-react';
import type { ProposedChange } from '@/store/version-history-store';

function DiffChunk({ change }: { change: ProposedChange }) {
  const {
    acceptProposedChange, rejectProposedChange,
  } = useVersionHistoryStore();
  const updateSectionContent = useResearchStore((s) => s.updateSectionContent);
  const sections = useResearchStore((s) => s.sections);
  const [expanded, setExpanded] = useState(true);

  const section = sections.find((s) => s.id === change.sectionId);
  const isPending = change.status === 'pending';

  const handleAccept = () => {
    acceptProposedChange(change.id);
    if (section && change.type === 'modification') {
      const newContent = section.content.replace(change.originalText, change.proposedText);
      updateSectionContent(section.id, newContent);
    } else if (section && change.type === 'addition') {
      updateSectionContent(section.id, section.content + '\n\n' + change.proposedText);
    } else if (section && change.type === 'deletion') {
      const newContent = section.content.replace(change.originalText, '');
      updateSectionContent(section.id, newContent);
    }
  };

  const typeIcon = change.type === 'addition' ? Plus : change.type === 'deletion' ? Minus : Pencil;
  const TypeIcon = typeIcon;
  const typeColor = change.type === 'addition' ? 'text-green-400' : change.type === 'deletion' ? 'text-red-400' : 'text-yellow-400';
  const typeBg = change.type === 'addition' ? 'bg-green-400/10' : change.type === 'deletion' ? 'bg-red-400/10' : 'bg-yellow-400/10';

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
        <span className={cn('flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded', typeBg, typeColor)}>
          <TypeIcon size={10} />
          {change.type}
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
          {/* Reason */}
          <div className="flex items-start gap-1.5 text-[10px] opacity-60">
            <Sparkles size={10} className="mt-0.5 shrink-0 text-purple-400" />
            <span>{change.reason}</span>
          </div>

          {/* Diff display */}
          {change.originalText && (
            <div className="rounded border px-2 py-1.5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] opacity-40 mb-1">Original:</p>
              <p className="text-xs leading-relaxed bg-red-500/10 text-red-300 px-2 py-1 rounded">
                {change.originalText}
              </p>
            </div>
          )}
          {change.proposedText && (
            <div className="rounded border px-2 py-1.5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] opacity-40 mb-1">Proposed:</p>
              <p className="text-xs leading-relaxed bg-green-500/10 text-green-300 px-2 py-1 rounded">
                {change.proposedText}
              </p>
            </div>
          )}

          {/* Author / time */}
          <div className="flex items-center gap-2 text-[10px] opacity-40">
            <span>{change.author}</span>
            <span>·</span>
            <span>{new Date(change.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Actions */}
          {isPending && (
            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleAccept(); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
              >
                <Check size={10} /> Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); rejectProposedChange(change.id); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-red-600/80 text-white hover:bg-red-500 transition-colors"
              >
                <X size={10} /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProposedChangesPanel() {
  const {
    proposedChanges, showProposedChanges, setShowProposedChanges,
    acceptAllProposedChanges, rejectAllProposedChanges, clearProposedChanges,
  } = useVersionHistoryStore();
  const sections = useResearchStore((s) => s.sections);
  const updateSectionContent = useResearchStore((s) => s.updateSectionContent);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return proposedChanges;
    return proposedChanges.filter((c) => c.status === filter);
  }, [proposedChanges, filter]);

  const stats = useMemo(() => {
    const pending = proposedChanges.filter((c) => c.status === 'pending').length;
    const accepted = proposedChanges.filter((c) => c.status === 'accepted').length;
    const rejected = proposedChanges.filter((c) => c.status === 'rejected').length;
    const additions = proposedChanges.filter((c) => c.type === 'addition').length;
    const deletions = proposedChanges.filter((c) => c.type === 'deletion').length;
    const modifications = proposedChanges.filter((c) => c.type === 'modification').length;
    return { pending, accepted, rejected, additions, deletions, modifications, total: proposedChanges.length };
  }, [proposedChanges]);

  const handleAcceptAll = () => {
    proposedChanges.forEach((change) => {
      if (change.status !== 'pending') return;
      const section = sections.find((s) => s.id === change.sectionId);
      if (!section) return;
      if (change.type === 'modification') {
        const newContent = section.content.replace(change.originalText, change.proposedText);
        updateSectionContent(section.id, newContent);
      } else if (change.type === 'addition') {
        updateSectionContent(section.id, section.content + '\n\n' + change.proposedText);
      } else if (change.type === 'deletion') {
        const newContent = section.content.replace(change.originalText, '');
        updateSectionContent(section.id, newContent);
      }
    });
    acceptAllProposedChanges();
  };

  if (!showProposedChanges) return null;

  return (
    <div
      className="w-80 shrink-0 border-l flex flex-col h-full"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Sparkles size={14} className="text-purple-400" />
        <span className="text-xs font-semibold">Proposed Changes</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">
          {stats.pending}
        </span>
        <button
          onClick={() => setShowProposedChanges(false)}
          className="ml-auto opacity-50 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>

      {/* Summary bar */}
      <div className="px-3 py-2 border-b shrink-0 space-y-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <BarChart3 size={11} className="opacity-40" />
          <span className="text-[10px] opacity-50">Summary:</span>
          <span className="text-[10px] flex items-center gap-1 text-green-400">
            <Plus size={9} />{stats.additions}
          </span>
          <span className="text-[10px] flex items-center gap-1 text-red-400">
            <Minus size={9} />{stats.deletions}
          </span>
          <span className="text-[10px] flex items-center gap-1 text-yellow-400">
            <Pencil size={9} />{stats.modifications}
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('unified')}
            className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-[10px]', viewMode === 'unified' ? 'font-medium' : 'opacity-40')}
            style={viewMode === 'unified' ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          >
            <Rows3 size={10} /> Unified
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-[10px]', viewMode === 'split' ? 'font-medium' : 'opacity-40')}
            style={viewMode === 'split' ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          >
            <Columns2 size={10} /> Side-by-side
          </button>
        </div>
      </div>

      {/* Batch actions */}
      <div className="flex items-center gap-1 px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleAcceptAll}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-green-600 text-white hover:bg-green-500"
          title="Accept all pending"
        >
          <CheckCheck size={10} /> Accept All
        </button>
        <button
          onClick={rejectAllProposedChanges}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-red-600/80 text-white hover:bg-red-500"
          title="Reject all pending"
        >
          <XCircle size={10} /> Reject All
        </button>
        <button
          onClick={clearProposedChanges}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] opacity-40 hover:opacity-100 ml-auto"
          title="Clear all"
        >
          <Trash2 size={10} /> Clear
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 py-1.5 text-[10px] capitalize border-b-2 transition-colors',
              filter === f ? 'font-medium' : 'opacity-40 border-transparent'
            )}
            style={filter === f ? { borderColor: 'var(--primary)' } : undefined}
          >
            {f} ({f === 'all' ? stats.total : stats[f]})
          </button>
        ))}
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {viewMode === 'unified' ? (
          filtered.map((change) => (
            <DiffChunk key={change.id} change={change} />
          ))
        ) : (
          filtered.map((change) => (
            <SplitDiffChunk key={change.id} change={change} />
          ))
        )}
        {filtered.length === 0 && (
          <p className="text-xs opacity-40 text-center py-8">No changes to display</p>
        )}
      </div>
    </div>
  );
}

function SplitDiffChunk({ change }: { change: ProposedChange }) {
  const { acceptProposedChange, rejectProposedChange } = useVersionHistoryStore();
  const updateSectionContent = useResearchStore((s) => s.updateSectionContent);
  const sections = useResearchStore((s) => s.sections);
  const section = sections.find((s) => s.id === change.sectionId);
  const isPending = change.status === 'pending';

  const handleAccept = () => {
    acceptProposedChange(change.id);
    if (section && change.type === 'modification') {
      updateSectionContent(section.id, section.content.replace(change.originalText, change.proposedText));
    } else if (section && change.type === 'addition') {
      updateSectionContent(section.id, section.content + '\n\n' + change.proposedText);
    } else if (section && change.type === 'deletion') {
      updateSectionContent(section.id, section.content.replace(change.originalText, ''));
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border',
        change.status === 'accepted' && 'opacity-50',
        change.status === 'rejected' && 'opacity-30',
      )}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-medium">{section?.title}</span>
        <span className="text-[10px] opacity-40 ml-auto">{change.type}</span>
      </div>
      <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--border)' }}>
        <div className="p-2">
          <p className="text-[10px] opacity-30 mb-1">Before</p>
          <p className="text-[10px] leading-relaxed bg-red-500/10 text-red-300 px-1.5 py-1 rounded min-h-[2rem]">
            {change.originalText || <span className="opacity-30 italic">empty</span>}
          </p>
        </div>
        <div className="p-2">
          <p className="text-[10px] opacity-30 mb-1">After</p>
          <p className="text-[10px] leading-relaxed bg-green-500/10 text-green-300 px-1.5 py-1 rounded min-h-[2rem]">
            {change.proposedText || <span className="opacity-30 italic">empty</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 border-t text-[10px] opacity-40" style={{ borderColor: 'var(--border)' }}>
        <Sparkles size={9} className="text-purple-400" />
        <span className="truncate">{change.reason}</span>
      </div>
      {isPending && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleAccept}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-green-600 text-white hover:bg-green-500"
          >
            <Check size={9} /> Accept
          </button>
          <button
            onClick={() => rejectProposedChange(change.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-600/80 text-white hover:bg-red-500"
          >
            <X size={9} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
