'use client';

import React, { useState, useRef } from 'react';
import { X, Image, Video, Music, Upload, Link } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

export default function MediaPanel() {
  const {
    showMediaPanel,
    setShowMediaPanel,
    activeSlideIndex,
    addElement,
    pushUndo,
  } = usePresentationStore();

  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!showMediaPanel) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      pushUndo();
      addElement(activeSlideIndex, {
        type: 'image',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        content: dataUrl,
        style: {},
      });
      setShowMediaPanel(false);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleInsertVideo = () => {
    const url = videoUrl.trim();
    if (!url) return;

    pushUndo();
    addElement(activeSlideIndex, {
      type: 'media',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      content: url,
      mediaData: {
        mediaType: 'video',
        url,
      },
      style: {},
    });
    setVideoUrl('');
    setShowMediaPanel(false);
  };

  const handleInsertAudio = () => {
    const url = audioUrl.trim();
    if (!url) return;

    pushUndo();
    addElement(activeSlideIndex, {
      type: 'media',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      content: url,
      mediaData: {
        mediaType: 'audio',
        url,
      },
      style: {},
    });
    setAudioUrl('');
    setShowMediaPanel(false);
  };

  const handleScreenRecordingPlaceholder = () => {
    pushUndo();
    addElement(activeSlideIndex, {
      type: 'shape',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      content: 'Screen Recording Placeholder',
      style: {
        backgroundColor: '#1e293b',
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        borderColor: '#334155',
        borderWidth: 2,
        borderRadius: '8px',
      },
    });
    setShowMediaPanel(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-lg rounded-xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg-primary, #ffffff)',
          borderColor: 'var(--color-border, #e2e8f0)',
          color: 'var(--color-text-primary, #1e293b)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--color-border, #e2e8f0)' }}>
          <h2 className="text-lg font-semibold">Insert Media</h2>
          <button
            onClick={() => setShowMediaPanel(false)}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close media panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-5">
          {/* ── Insert Image ─────────────────────────────────── */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-70">
              <Image size={16} />
              Insert Image
            </h3>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              style={{ borderColor: 'var(--color-border, #cbd5e1)' }}
            >
              <Upload size={16} />
              Choose Image File
            </button>
          </section>

          {/* ── Insert Video ─────────────────────────────────── */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-70">
              <Video size={16} />
              Insert Video
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube or video embed URL"
                  className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                    borderColor: 'var(--color-border, #e2e8f0)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsertVideo();
                  }}
                />
              </div>
              <button
                onClick={handleInsertVideo}
                disabled={!videoUrl.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Insert
              </button>
            </div>
          </section>

          {/* ── Insert Audio ─────────────────────────────────── */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-70">
              <Music size={16} />
              Insert Audio
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="Audio file or streaming URL"
                  className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                    borderColor: 'var(--color-border, #e2e8f0)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsertAudio();
                  }}
                />
              </div>
              <button
                onClick={handleInsertAudio}
                disabled={!audioUrl.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Insert
              </button>
            </div>
          </section>

          {/* ── Screen Recording Placeholder ─────────────────── */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-70">
              Screen Recording Placeholder
            </h3>
            <button
              onClick={handleScreenRecordingPlaceholder}
              className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{ borderColor: 'var(--color-border, #cbd5e1)' }}
            >
              Add Screen Recording Placeholder
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
