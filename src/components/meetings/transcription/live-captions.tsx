'use client';

import React, { useEffect, useRef } from 'react';
import { Subtitles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptSegment, TranscriptionConfig } from '@/types/transcription';

interface LiveCaptionsProps {
  segments: TranscriptSegment[];
  interimText: string;
  isRecording: boolean;
  config: TranscriptionConfig;
  onClose: () => void;
}

export default function LiveCaptions({
  segments,
  interimText,
  isRecording,
  config,
  onClose,
}: LiveCaptionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const recentSegments = segments.slice(-3);

  const fontSizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  useEffect(() => {
    if (config.autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments, interimText, config.autoScroll]);

  if (!config.showCaptions) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
    >
      <div
        className="rounded-xl border shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Subtitles className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium text-white/70">Live Captions</span>
            {isRecording && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400">LIVE</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-white/50" />
          </button>
        </div>

        {/* Captions area */}
        <div
          ref={containerRef}
          className="px-4 py-3 max-h-32 overflow-y-auto"
        >
          {recentSegments.map((segment) => (
            <div key={segment.id} className="mb-2 last:mb-0">
              <span
                className="text-xs font-medium mr-2"
                style={{ color: getSpeakerColor(segment.speakerId) }}
              >
                {segment.speakerName}:
              </span>
              <span className={cn('text-white', fontSizeMap[config.captionFontSize])}>
                {segment.text}
              </span>
            </div>
          ))}

          {/* Interim text (currently being spoken) */}
          {interimText && (
            <div className="mb-0">
              <span className={cn('text-white/50 italic', fontSizeMap[config.captionFontSize])}>
                {interimText}
              </span>
            </div>
          )}

          {!isRecording && segments.length === 0 && (
            <p className="text-sm text-white/30 text-center">
              Captions will appear here when recording starts
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getSpeakerColor(speakerId: string): string {
  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];
  const index = parseInt(speakerId.replace(/\D/g, '') || '0', 10) - 1;
  return colors[Math.abs(index) % colors.length];
}
