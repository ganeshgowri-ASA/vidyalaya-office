'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Square, Circle, Pause, Play, AlertCircle } from 'lucide-react';
import { useMeetingBotStore } from '@/store/meeting-bot-store';
import { parseMeetingUrl, formatDuration } from '@/lib/meeting-url-parser';

export default function MeetingRecorder() {
  const { addRecording, setBotStatus, botStatus, botConfig } = useMeetingBotStore();

  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordType, setRecordType] = useState<'audio' | 'video'>('audio');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const parsedUrl = React.useMemo(() => parseMeetingUrl(meetingUrl), [meetingUrl]);

  // Audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isRecording && !isPaused) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
      setAudioLevel(avg / 255);
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording, isPaused, updateAudioLevel]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];
      setBotStatus('joining');

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: recordType === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Set up audio analyzer
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = recordType === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        addRecording({
          id: `rec-${Date.now().toString(36)}`,
          meetingTitle: meetingTitle || 'Untitled Recording',
          meetingUrl,
          platform: parsedUrl.platform,
          date: new Date().toISOString().split('T')[0],
          duration: recordingTime,
          fileSize: blob.size,
          type: recordType,
          status: 'ready',
          blobUrl,
          thumbnailColor: parsedUrl.color || '#6366f1',
          participants: [botConfig.name],
          tags: [],
        });

        setBotStatus('completed');
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      setBotStatus('recording');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(message);
      setBotStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Meeting Recorder</h2>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Record audio or video from your meetings using MediaRecorder API</p>
      </div>

      {/* Recording setup */}
      {!isRecording && (
        <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Meeting Title</label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Sprint Planning - Q2"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Meeting URL (optional)</label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://zoom.us/j/123456789"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            {meetingUrl && parsedUrl.isValid && (
              <p className="mt-1 text-xs" style={{ color: parsedUrl.color }}>
                {parsedUrl.icon} {parsedUrl.label} detected
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Recording Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setRecordType('audio')}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: recordType === 'audio' ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: recordType === 'audio' ? 'var(--primary)' + '15' : 'transparent',
                  color: 'var(--foreground)',
                }}
              >
                <Mic size={16} />
                Audio Only
              </button>
              <button
                onClick={() => setRecordType('video')}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: recordType === 'video' ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: recordType === 'video' ? 'var(--primary)' + '15' : 'transparent',
                  color: 'var(--foreground)',
                }}
              >
                <Video size={16} />
                Audio + Video
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            onClick={startRecording}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#ef4444' }}
          >
            <Circle size={16} fill="currentColor" />
            Start Recording
          </button>
        </div>
      )}

      {/* Active recording UI */}
      {isRecording && (
        <div className="rounded-xl border p-6 space-y-6" style={{ borderColor: '#ef4444', backgroundColor: 'var(--card)' }}>
          {/* Status */}
          <div className="text-center">
            <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
              {/* Pulsing ring */}
              {!isPaused && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: '#ef4444' }}
                />
              )}
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: isPaused ? '#f59e0b' : '#ef4444' }}
              >
                {recordType === 'audio' ? <Mic size={32} className="text-white" /> : <Video size={32} className="text-white" />}
              </div>
            </div>

            <p className="text-3xl font-mono font-bold" style={{ color: 'var(--foreground)' }}>
              {formatDuration(recordingTime)}
            </p>
            <p className="text-xs mt-1" style={{ color: isPaused ? '#f59e0b' : '#ef4444' }}>
              {isPaused ? '⏸ Paused' : '● Recording'}
              {meetingTitle && ` — ${meetingTitle}`}
            </p>
          </div>

          {/* Audio level indicator */}
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Audio Level</p>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${Math.max(audioLevel * 100, 2)}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ef4444' : audioLevel > 0.4 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={togglePause}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
            <button
              onClick={stopRecording}
              className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#ef4444' }}
              title="Stop recording"
            >
              <Square size={24} fill="currentColor" />
            </button>
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--muted)',
                color: botConfig.recordAudio ? 'var(--foreground)' : '#ef4444',
              }}
              title={botConfig.recordAudio ? 'Mute' : 'Unmute'}
            >
              {botConfig.recordAudio ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
          </div>

          {/* Bot status */}
          <div className="text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: '#ef444420', color: '#ef4444' }}
            >
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#ef4444' }} />
              {botStatus === 'recording' ? 'Bot is recording' : botStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
