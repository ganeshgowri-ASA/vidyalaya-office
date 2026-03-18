'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Mic, MicOff, Square, Play, Pause, Trash2, Save, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RecordNarrationModal() {
  const {
    showRecordNarration, setShowRecordNarration,
    slides, activeSlideIndex, setActiveSlide,
    slideNarrations, addSlideNarration, removeSlideNarration,
  } = usePresentationStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(activeSlideIndex);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const currentSlide = slides[currentSlideIdx];
  const currentNarration = currentSlide ? slideNarrations[currentSlide.id] : null;

  useEffect(() => {
    if (showRecordNarration) setCurrentSlideIdx(activeSlideIndex);
  }, [showRecordNarration, activeSlideIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    };
  }, []);

  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setHasMicPermission(true);
      setError(null);
    } catch {
      setHasMicPermission(false);
      setError('Microphone access denied. Please allow microphone access to record narration.');
    }
  }, []);

  useEffect(() => {
    if (showRecordNarration) requestMicPermission();
  }, [showRecordNarration, requestMicPermission]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        addSlideNarration(currentSlide.id, audioUrl, recordingSeconds);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      setError('Failed to start recording. Please check your microphone.');
    }
  }, [currentSlide, addSlideNarration, recordingSeconds]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const playPreview = useCallback(() => {
    if (!currentNarration) return;
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
      setIsPreviewing(false);
      return;
    }
    const audio = new Audio(currentNarration.audioUrl);
    audioPreviewRef.current = audio;
    audio.play();
    setIsPreviewing(true);
    audio.onended = () => {
      setIsPreviewing(false);
      audioPreviewRef.current = null;
    };
  }, [currentNarration]);

  const deleteNarration = useCallback(() => {
    if (currentNarration) {
      URL.revokeObjectURL(currentNarration.audioUrl);
      removeSlideNarration(currentSlide.id);
    }
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
      setIsPreviewing(false);
    }
  }, [currentNarration, currentSlide, removeSlideNarration]);

  if (!showRecordNarration) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div
        className="rounded-xl shadow-2xl border w-full max-w-xl flex flex-col overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <Mic size={18} style={{ color: 'var(--primary)' }} />
            <span className="font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>Record Narration</span>
          </div>
          <button
            onClick={() => { stopRecording(); setShowRecordNarration(false); }}
            className="p-1.5 rounded hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
          <button
            onClick={() => setCurrentSlideIdx(i => Math.max(0, i - 1))}
            disabled={currentSlideIdx === 0 || isRecording}
            className="p-1.5 rounded hover:opacity-80 disabled:opacity-30"
            style={{ color: 'var(--foreground)' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
              Slide {currentSlideIdx + 1} of {slides.length}
            </span>
            {currentNarration && (
              <span className="text-xs" style={{ color: 'var(--primary)' }}>
                Has narration ({formatTime(currentNarration.duration)})
              </span>
            )}
          </div>
          <button
            onClick={() => setCurrentSlideIdx(i => Math.min(slides.length - 1, i + 1))}
            disabled={currentSlideIdx === slides.length - 1 || isRecording}
            className="p-1.5 rounded hover:opacity-80 disabled:opacity-30"
            style={{ color: 'var(--foreground)' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Slide preview */}
        <div className="px-5 pt-4 pb-2">
          <div
            className="rounded-lg border overflow-hidden relative"
            style={{ borderColor: 'var(--border)', aspectRatio: '16/9', background: currentSlide?.background || '#1e293b' }}
          >
            {currentSlide?.elements.filter(e => e.type === 'text').slice(0, 2).map((el, i) => (
              <div
                key={el.id}
                className="absolute truncate px-2"
                style={{
                  left: `${(el.x / 960) * 100}%`,
                  top: `${(el.y / 540) * 100}%`,
                  width: `${(el.width / 960) * 100}%`,
                  fontSize: i === 0 ? 11 : 8,
                  color: el.style.color || '#fff',
                  fontWeight: el.style.fontWeight,
                }}
              >
                {el.content}
              </div>
            ))}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Permission / error */}
        {error && (
          <div className="mx-5 mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-red-500/10 border border-red-500/20">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Recording controls */}
        <div className="px-5 py-4 space-y-3">
          {/* Timer display */}
          <div className="flex items-center justify-center gap-2">
            <Clock size={14} style={{ color: isRecording ? '#ef4444' : 'var(--muted-foreground)' }} />
            <span
              className="text-2xl font-mono font-bold tabular-nums"
              style={{ color: isRecording ? '#ef4444' : 'var(--card-foreground)' }}
            >
              {formatTime(isRecording ? recordingSeconds : (currentNarration?.duration ?? 0))}
            </span>
            {isRecording && (
              <span className="text-xs font-medium text-red-400 animate-pulse">● REC</span>
            )}
          </div>

          {/* Main record / stop button */}
          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={hasMicPermission === false}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Mic size={16} />
                {currentNarration ? 'Re-record' : 'Start Recording'}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                <Square size={16} />
                Stop Recording
              </button>
            )}

            {currentNarration && !isRecording && (
              <>
                <button
                  onClick={playPreview}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border hover:opacity-80 transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {isPreviewing ? <Pause size={14} /> : <Play size={14} />}
                  {isPreviewing ? 'Pause' : 'Preview'}
                </button>
                <button
                  onClick={deleteNarration}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-full text-sm border hover:opacity-80 transition-all"
                  style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' } as React.CSSProperties}
                  title="Delete narration"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>

          {/* Narration list overview */}
          <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
              All Slides Narration Status
            </div>
            <div className="grid grid-cols-5 gap-1.5 max-h-20 overflow-y-auto">
              {slides.map((slide, idx) => {
                const has = !!slideNarrations[slide.id];
                return (
                  <button
                    key={slide.id}
                    onClick={() => !isRecording && setCurrentSlideIdx(idx)}
                    disabled={isRecording}
                    className="flex flex-col items-center gap-0.5 p-1 rounded text-[10px] border transition-all hover:opacity-80"
                    style={{
                      borderColor: idx === currentSlideIdx ? 'var(--primary)' : 'var(--border)',
                      background: idx === currentSlideIdx ? 'var(--accent)' : 'var(--card)',
                      color: has ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: has ? '#22c55e' : '#6b7280' }} />
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {Object.keys(slideNarrations).length} of {slides.length} slides have narration
          </span>
          <button
            onClick={() => { stopRecording(); setShowRecordNarration(false); }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
