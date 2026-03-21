'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Search, Filter, Play, Pause, Trash2, Download, Tag, Clock, HardDrive, Users, FileText, Scissors } from 'lucide-react';
import { useMeetingBotStore, Recording } from '@/store/meeting-bot-store';
import { getPlatformInfo, formatDuration, formatFileSize } from '@/lib/meeting-url-parser';

export default function RecordingLibrary() {
  const {
    recordings, removeRecording,
    recordingSearchQuery, setRecordingSearchQuery,
    recordingFilterPlatform, setRecordingFilterPlatform,
    recordingFilterType, setRecordingFilterType,
    addSoundbite,
  } = useMeetingBotStore();

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showClipModal, setShowClipModal] = useState<string | null>(null);
  const [clipTitle, setClipTitle] = useState('');
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredRecordings = useMemo(() => {
    let result = recordings;
    if (recordingSearchQuery) {
      const q = recordingSearchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.meetingTitle.toLowerCase().includes(q) ||
          r.participants.some((p) => p.toLowerCase().includes(q)) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (recordingFilterPlatform !== 'all') {
      result = result.filter((r) => r.platform === recordingFilterPlatform);
    }
    if (recordingFilterType !== 'all') {
      result = result.filter((r) => r.type === recordingFilterType);
    }
    return result;
  }, [recordings, recordingSearchQuery, recordingFilterPlatform, recordingFilterType]);

  const totalSize = recordings.reduce((sum, r) => sum + r.fileSize, 0);
  const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);

  const togglePlay = (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      setPlayingId(recording.id);
    }
  };

  const handleCreateClip = (recordingId: string) => {
    if (!clipTitle) return;
    addSoundbite({
      recordingId,
      title: clipTitle,
      startTime: clipStart,
      endTime: clipEnd,
      duration: clipEnd - clipStart,
      tags: [],
    });
    setShowClipModal(null);
    setClipTitle('');
    setClipStart(0);
    setClipEnd(30);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Recording Library</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {recordings.length} recordings • {formatDuration(totalDuration)} total • {formatFileSize(totalSize)}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={recordingSearchQuery}
            onChange={(e) => setRecordingSearchQuery(e.target.value)}
            placeholder="Search recordings..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
          <select
            value={recordingFilterPlatform}
            onChange={(e) => setRecordingFilterPlatform(e.target.value as typeof recordingFilterPlatform)}
            className="rounded-lg border px-2 py-1.5 text-xs outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="all">All Platforms</option>
            <option value="zoom">Zoom</option>
            <option value="gmeet">Google Meet</option>
            <option value="teams">Teams</option>
            <option value="webex">Webex</option>
          </select>

          <select
            value={recordingFilterType}
            onChange={(e) => setRecordingFilterType(e.target.value as typeof recordingFilterType)}
            className="rounded-lg border px-2 py-1.5 text-xs outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="all">All Types</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* Recordings Grid */}
      <div className="space-y-3">
        {filteredRecordings.length === 0 && (
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)' }}>
            <HardDrive size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No recordings found</p>
          </div>
        )}

        {filteredRecordings.map((recording) => {
          const platformInfo = getPlatformInfo(recording.platform);
          const isExpanded = expandedId === recording.id;
          const isPlaying = playingId === recording.id;

          return (
            <div key={recording.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
              {/* Main row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer transition-colors hover:opacity-90"
                onClick={() => setExpandedId(isExpanded ? null : recording.id)}
              >
                {/* Thumbnail */}
                <div
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: recording.thumbnailColor + '20' }}
                >
                  <span className="text-lg">{recording.type === 'video' ? '🎬' : '🎙️'}</span>
                  {recording.status === 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{recording.meetingTitle}</span>
                    {recording.status === 'processing' && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                        Processing
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{recording.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{formatDuration(recording.duration)}</span>
                    <span className="flex items-center gap-1"><HardDrive size={10} />{formatFileSize(recording.fileSize)}</span>
                    <span style={{ color: platformInfo.color }}>{platformInfo.icon} {platformInfo.label}</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {recording.status === 'ready' && (
                    <>
                      <button
                        onClick={() => togglePlay(recording)}
                        className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                        style={{ color: isPlaying ? 'var(--primary)' : 'var(--muted-foreground)' }}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setShowClipModal(recording.id);
                          setClipEnd(Math.min(30, recording.duration));
                        }}
                        className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Create soundbite"
                      >
                        <Scissors size={16} />
                      </button>
                      <button
                        className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeRecording(recording.id)}
                    className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                    style={{ color: '#ef4444' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  {/* Participants */}
                  <div className="flex items-start gap-2">
                    <Users size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Participants</p>
                      <p className="text-xs" style={{ color: 'var(--foreground)' }}>{recording.participants.join(', ')}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {recording.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <div className="flex flex-wrap gap-1">
                        {recording.tags.map((tag) => (
                          <span key={tag} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transcript preview */}
                  {recording.transcript && (
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Transcript Preview</p>
                        <p className="mt-1 text-xs whitespace-pre-line leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                          {recording.transcript.slice(0, 200)}
                          {recording.transcript.length > 200 && '...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Create soundbite modal */}
              {showClipModal === recording.id && (
                <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--card)' }}>
                  <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                    <Scissors size={14} />
                    Create Soundbite
                  </h4>
                  <input
                    type="text"
                    value={clipTitle}
                    onChange={(e) => setClipTitle(e.target.value)}
                    placeholder="Soundbite title"
                    className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Start (sec)</label>
                      <input
                        type="number"
                        min={0}
                        max={recording.duration}
                        value={clipStart}
                        onChange={(e) => setClipStart(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border px-2 py-1 text-xs outline-none"
                        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>End (sec)</label>
                      <input
                        type="number"
                        min={clipStart + 1}
                        max={recording.duration}
                        value={clipEnd}
                        onChange={(e) => setClipEnd(parseInt(e.target.value) || clipStart + 1)}
                        className="w-full rounded-lg border px-2 py-1 text-xs outline-none"
                        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowClipModal(null)}
                      className="rounded-lg px-3 py-1 text-xs"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCreateClip(recording.id)}
                      disabled={!clipTitle}
                      className="rounded-lg px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
