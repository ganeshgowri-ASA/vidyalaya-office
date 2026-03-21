'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Edit3, Check, X, Trash2, Copy, Download, Search,
  ChevronDown, ChevronUp, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptSegment, Speaker } from '@/types/transcription';

interface TranscriptEditorProps {
  segments: TranscriptSegment[];
  speakers: Speaker[];
  isRecording: boolean;
  autoScroll: boolean;
  onUpdateSegment: (segmentId: string, text: string) => void;
  onRemoveSegment: (segmentId: string) => void;
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getSpeakerColor(speakerId: string, speakers: Speaker[]): string {
  const speaker = speakers.find((s) => s.id === speakerId);
  if (speaker) return speaker.color;
  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];
  const index = parseInt(speakerId.replace(/\D/g, '') || '0', 10) - 1;
  return colors[Math.abs(index) % colors.length];
}

export default function TranscriptEditor({
  segments,
  speakers,
  isRecording,
  autoScroll,
  onUpdateSegment,
  onRemoveSegment,
}: TranscriptEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current && isRecording) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, autoScroll, isRecording]);

  // Focus edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filteredSegments = searchQuery
    ? segments.filter((s) =>
        s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speakerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : segments;

  const searchMatches = searchQuery
    ? segments.filter((s) =>
        s.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const startEditing = (segment: TranscriptSegment) => {
    setEditingId(segment.id);
    setEditText(segment.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdateSegment(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const copyTranscript = useCallback(() => {
    const text = segments
      .map((s) => `[${formatTimestamp(s.timestamp)}] ${s.speakerName}: ${s.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  }, [segments]);

  const downloadTranscript = useCallback(() => {
    const text = segments
      .map((s) => `[${formatTimestamp(s.timestamp)}] ${s.speakerName}: ${s.text}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [segments]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
            Transcript ({segments.length} segments)
          </span>
          {isRecording && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400">Recording</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              'p-1.5 rounded transition-colors',
              showSearch ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5'
            )}
            style={{ color: showSearch ? undefined : 'var(--foreground)' }}
            title="Search transcript"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={copyTranscript}
            className="p-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: 'var(--foreground)' }}
            title="Copy transcript"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={downloadTranscript}
            className="p-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: 'var(--foreground)' }}
            title="Download transcript"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              className="w-full rounded border px-7 py-1.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              autoFocus
            />
            {searchQuery && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                  {searchMatches.length} matches
                </span>
                <button
                  onClick={() => setHighlightedIndex(Math.max(0, highlightedIndex - 1))}
                  className="p-0.5 hover:bg-white/10 rounded"
                  style={{ color: 'var(--foreground)' }}
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() =>
                    setHighlightedIndex(
                      Math.min(searchMatches.length - 1, highlightedIndex + 1)
                    )
                  }
                  className="p-0.5 hover:bg-white/10 rounded"
                  style={{ color: 'var(--foreground)' }}
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setHighlightedIndex(-1);
                  }}
                  className="p-0.5 hover:bg-white/10 rounded"
                  style={{ color: 'var(--foreground)' }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Segments */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm opacity-50" style={{ color: 'var(--foreground)' }}>
              {segments.length === 0
                ? 'No transcript yet. Start recording to begin transcription.'
                : 'No matches found.'}
            </p>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isEditing = editingId === segment.id;
            const speakerColor = getSpeakerColor(segment.speakerId, speakers);

            return (
              <div
                key={segment.id}
                className={cn(
                  'group rounded-lg px-3 py-2 transition-colors',
                  'hover:bg-white/[0.02]',
                  isEditing && 'bg-white/[0.03] ring-1 ring-blue-500/30'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Speaker avatar */}
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                    style={{ backgroundColor: speakerColor }}
                  >
                    {segment.speakerName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: speakerColor }}
                      >
                        {segment.speakerName}
                      </span>
                      <span className="text-[10px] font-mono opacity-40" style={{ color: 'var(--foreground)' }}>
                        {formatTimestamp(segment.timestamp)}
                      </span>
                      {segment.isEdited && (
                        <span className="text-[9px] px-1 rounded bg-yellow-500/10 text-yellow-500">
                          edited
                        </span>
                      )}
                      <span
                        className="text-[9px] font-mono opacity-30"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {(segment.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Text */}
                    {isEditing ? (
                      <div className="mt-1">
                        <textarea
                          ref={editInputRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full rounded border p-2 text-sm resize-none outline-none"
                          style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                          }}
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          >
                            <Check className="h-3 w-3" /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/5"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <X className="h-3 w-3" /> Cancel
                          </button>
                          <span className="text-[9px] opacity-30 ml-2" style={{ color: 'var(--foreground)' }}>
                            Ctrl+Enter to save, Esc to cancel
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        {highlightText(segment.text, searchQuery)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(segment)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--foreground)' }}
                        title="Edit"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      {segment.isEdited && (
                        <button
                          onClick={() => {
                            if (segment.originalText) {
                              onUpdateSegment(segment.id, segment.originalText);
                            }
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          style={{ color: 'var(--foreground)' }}
                          title="Restore original"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveSegment(segment.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
