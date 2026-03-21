'use client';

import React, { useState } from 'react';
import { Users, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Speaker, TranscriptSegment } from '@/types/transcription';

interface SpeakerDiarizationProps {
  speakers: Speaker[];
  segments: TranscriptSegment[];
  onSpeakerNameChange: (speakerId: string, name: string) => void;
}

export default function SpeakerDiarization({
  speakers,
  segments,
  onSpeakerNameChange,
}: SpeakerDiarizationProps) {
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const speakerStats = speakers.map((speaker) => {
    const speakerSegments = segments.filter((s) => s.speakerId === speaker.id);
    const wordCount = speakerSegments.reduce(
      (acc, seg) => acc + seg.text.split(/\s+/).length,
      0
    );
    const totalDuration = speakerSegments.reduce(
      (acc, seg) => acc + (seg.endTimestamp - seg.timestamp),
      0
    );
    return {
      ...speaker,
      segmentCount: speakerSegments.length,
      wordCount,
      duration: totalDuration,
      avgConfidence:
        speakerSegments.length > 0
          ? speakerSegments.reduce((acc, seg) => acc + seg.confidence, 0) /
            speakerSegments.length
          : 0,
    };
  });

  const totalWords = speakerStats.reduce((acc, s) => acc + s.wordCount, 0);

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function startEditing(speaker: Speaker) {
    setEditingSpeakerId(speaker.id);
    setEditName(speaker.name);
  }

  function saveEdit() {
    if (editingSpeakerId && editName.trim()) {
      onSpeakerNameChange(editingSpeakerId, editName.trim());
    }
    setEditingSpeakerId(null);
    setEditName('');
  }

  function cancelEdit() {
    setEditingSpeakerId(null);
    setEditName('');
  }

  if (speakers.length === 0) {
    return (
      <div
        className="rounded-lg border p-4 text-center"
        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
      >
        <Users className="mx-auto h-8 w-8 opacity-30 mb-2" />
        <p className="text-sm opacity-50">No speakers detected yet</p>
        <p className="text-xs opacity-30 mt-1">
          Speakers will appear as the transcription runs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4" style={{ color: 'var(--foreground)' }} />
        <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          Speakers ({speakers.length})
        </h3>
      </div>

      {speakerStats.map((speaker) => {
        const sharePercent =
          totalWords > 0 ? Math.round((speaker.wordCount / totalWords) * 100) : 0;

        return (
          <div
            key={speaker.id}
            className="rounded-lg border p-3 transition-colors hover:bg-white/[0.02]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: speaker.color }}
              >
                {speaker.avatar}
              </div>
              <div className="flex-1 min-w-0">
                {editingSpeakerId === speaker.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded border px-2 py-0.5 text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <button onClick={saveEdit} className="p-0.5 text-green-400 hover:text-green-300">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={cancelEdit} className="p-0.5 text-red-400 hover:text-red-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {speaker.name}
                    </span>
                    <button
                      onClick={() => startEditing(speaker)}
                      className="p-0.5 opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                    {speaker.wordCount} words
                  </span>
                  <span className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                    {speaker.segmentCount} segments
                  </span>
                  <span className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                    {formatDuration(speaker.duration)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono" style={{ color: speaker.color }}>
                  {sharePercent}%
                </span>
              </div>
            </div>

            {/* Speaking share bar */}
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <div
                className={cn('h-full rounded-full transition-all')}
                style={{ width: `${sharePercent}%`, backgroundColor: speaker.color }}
              />
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] opacity-40" style={{ color: 'var(--foreground)' }}>
                Avg confidence
              </span>
              <span className="text-[10px] font-mono opacity-60" style={{ color: 'var(--foreground)' }}>
                {(speaker.avgConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
