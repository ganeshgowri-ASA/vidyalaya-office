'use client';

import React, { useState } from 'react';
import { Scissors, Play, Pause, Share2, Trash2, Tag, Clock, Music } from 'lucide-react';
import { useMeetingBotStore } from '@/store/meeting-bot-store';
import { formatDuration } from '@/lib/meeting-url-parser';

export default function SoundbitesPanel() {
  const { soundbites, removeSoundbite, recordings } = useMeetingBotStore();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSoundbites = searchQuery
    ? soundbites.filter(
        (sb) =>
          sb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sb.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : soundbites;

  const getRecordingTitle = (recordingId: string) => {
    return recordings.find((r) => r.id === recordingId)?.meetingTitle || 'Unknown Recording';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Soundbites</h2>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {soundbites.length} clips from your meeting recordings
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Scissors size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search soundbites..."
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {/* Soundbites grid */}
      {filteredSoundbites.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)' }}>
          <Music size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {searchQuery ? 'No soundbites match your search' : 'No soundbites yet. Create clips from your recordings.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredSoundbites.map((soundbite) => {
            const isPlaying = playingId === soundbite.id;
            const recordingTitle = getRecordingTitle(soundbite.recordingId);

            return (
              <div
                key={soundbite.id}
                className="rounded-xl border p-4 space-y-3 transition-colors hover:opacity-95"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{soundbite.title}</h4>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      from {recordingTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => setPlayingId(isPlaying ? null : soundbite.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{ backgroundColor: isPlaying ? 'var(--primary)' : 'var(--muted)', color: isPlaying ? 'white' : 'var(--foreground)' }}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>

                {/* Waveform placeholder */}
                <div className="flex items-center gap-0.5 h-8 px-1">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full transition-all"
                      style={{
                        height: `${Math.random() * 100}%`,
                        minHeight: '2px',
                        backgroundColor: isPlaying
                          ? i < 20 ? 'var(--primary)' : 'var(--muted)'
                          : 'var(--muted)',
                        opacity: isPlaying && i < 20 ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>

                {/* Time info */}
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatDuration(soundbite.startTime)} — {formatDuration(soundbite.endTime)}
                  </span>
                  <span>{formatDuration(soundbite.duration)}</span>
                </div>

                {/* Tags */}
                {soundbite.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag size={10} style={{ color: 'var(--muted-foreground)' }} />
                    {soundbite.tags.map((tag) => (
                      <span key={tag} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Share2 size={12} />
                    Share
                  </button>
                  <button
                    onClick={() => removeSoundbite(soundbite.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:opacity-80"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
