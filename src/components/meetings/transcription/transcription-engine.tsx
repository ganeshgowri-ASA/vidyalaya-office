'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Mic, MicOff, Square, Play, Pause, Settings, Users, FileAudio,
  Wifi, WifiOff, Clock, ChevronLeft, Subtitles, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranscriptionStore } from '@/store/transcription-store';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTranscriptWebSocket } from '@/hooks/use-transcript-websocket';
import type { TranscriptSegment, Speaker } from '@/types/transcription';
import TranscriptEditor from './transcript-editor';
import SpeakerDiarization from './speaker-diarization';
import LanguageSelector from './language-selector';
import LiveCaptions from './live-captions';
import AudioUpload from './audio-upload';

interface TranscriptionEngineProps {
  meetingId?: string;
  meetingTitle?: string;
  onBack?: () => void;
}

type TabView = 'transcript' | 'speakers' | 'upload' | 'settings';

const SPEAKER_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function TranscriptionEngine({
  meetingId = 'default',
  meetingTitle = 'Meeting Transcription',
  onBack,
}: TranscriptionEngineProps) {
  const [activeTab, setActiveTab] = useState<TabView>('transcript');
  const [showCaptionOverlay, setShowCaptionOverlay] = useState(false);

  const {
    sessions,
    activeSessionId,
    config,
    wsConnected,
    createSession,
    updateSessionStatus,
    endSession,
    addSegment,
    updateSegment,
    removeSegment,
    addSpeaker,
    updateSpeakerName,
    updateConfig,
    setActiveSessionId,
    setWsConnected,
  } = useTranscriptionStore();

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const isRecording = activeSession?.status === 'recording';
  const isPaused = activeSession?.status === 'paused';

  // Handle new transcript segment from speech recognition
  const handleNewSegment = useCallback(
    (segment: TranscriptSegment) => {
      if (!activeSessionId) return;

      // Ensure speaker exists in session
      const session = sessions.find((s) => s.id === activeSessionId);
      if (session && !session.speakers.find((sp) => sp.id === segment.speakerId)) {
        const speakerIndex = parseInt(segment.speakerId.replace(/\D/g, '') || '1', 10) - 1;
        const newSpeaker: Speaker = {
          id: segment.speakerId,
          name: segment.speakerName,
          avatar: segment.speakerName.charAt(0),
          color: SPEAKER_COLORS[speakerIndex % SPEAKER_COLORS.length],
        };
        addSpeaker(activeSessionId, newSpeaker);
      }

      addSegment(activeSessionId, segment);
    },
    [activeSessionId, sessions, addSegment, addSpeaker]
  );

  // Speech recognition hook
  const {
    isListening,
    isSupported,
    interimText,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    language: config.language,
    onSegment: handleNewSegment,
  });

  // WebSocket hook for live streaming
  const {
    isConnected: wsIsConnected,
    connectionState,
    connect: wsConnect,
    disconnect: wsDisconnect,
  } = useTranscriptWebSocket({
    sessionId: activeSessionId,
    enabled: false, // Manual connect for now
    onSegment: handleNewSegment,
    onStatusChange: (status) => {
      setWsConnected(status === 'connected');
    },
  });

  // Start recording
  const handleStartRecording = useCallback(() => {
    let sessionId = activeSessionId;
    if (!sessionId || activeSession?.status === 'completed') {
      sessionId = createSession(meetingId, meetingTitle);
    }
    updateSessionStatus(sessionId, 'recording');
    startListening();
  }, [
    activeSessionId,
    activeSession,
    createSession,
    meetingId,
    meetingTitle,
    updateSessionStatus,
    startListening,
  ]);

  // Pause recording
  const handlePauseRecording = useCallback(() => {
    if (!activeSessionId) return;
    updateSessionStatus(activeSessionId, 'paused');
    stopListening();
  }, [activeSessionId, updateSessionStatus, stopListening]);

  // Resume recording
  const handleResumeRecording = useCallback(() => {
    if (!activeSessionId) return;
    updateSessionStatus(activeSessionId, 'recording');
    startListening();
  }, [activeSessionId, updateSessionStatus, startListening]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    if (!activeSessionId) return;
    stopListening();
    endSession(activeSessionId);
  }, [activeSessionId, stopListening, endSession]);

  // Session selector
  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId);
    },
    [setActiveSessionId]
  );

  const handleUpdateSegment = useCallback(
    (segmentId: string, text: string) => {
      if (activeSessionId) {
        updateSegment(activeSessionId, segmentId, text);
      }
    },
    [activeSessionId, updateSegment]
  );

  const handleRemoveSegment = useCallback(
    (segmentId: string) => {
      if (activeSessionId) {
        removeSegment(activeSessionId, segmentId);
      }
    },
    [activeSessionId, removeSegment]
  );

  const handleSpeakerNameChange = useCallback(
    (speakerId: string, name: string) => {
      if (activeSessionId) {
        updateSpeakerName(activeSessionId, speakerId, name);
      }
    },
    [activeSessionId, updateSpeakerName]
  );

  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-semibold">{meetingTitle}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {activeSession && (
                <>
                  <span className="text-[10px] opacity-50">
                    {activeSession.segments.length} segments
                  </span>
                  <span className="text-[10px] opacity-30">|</span>
                  <span className="text-[10px] opacity-50">
                    <Clock className="inline h-3 w-3 mr-0.5" />
                    {formatDuration(activeSession.duration)}
                  </span>
                  <span className="text-[10px] opacity-30">|</span>
                  <span className="text-[10px] opacity-50">
                    {activeSession.speakers.length} speakers
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <LanguageSelector
            selectedLanguage={config.language}
            onLanguageChange={(lang) => updateConfig({ language: lang })}
            compact
          />

          {/* WebSocket status */}
          <button
            onClick={() => {
              if (wsIsConnected) wsDisconnect();
              else wsConnect();
            }}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-colors',
              wsIsConnected ? 'border-green-500/30 text-green-400' : 'hover:bg-white/5'
            )}
            style={{ borderColor: wsIsConnected ? undefined : 'var(--border)' }}
            title={`WebSocket: ${connectionState}`}
          >
            {wsIsConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3 opacity-50" />
            )}
            <span className="hidden sm:inline">
              {wsIsConnected ? 'Live' : 'WS'}
            </span>
          </button>

          {/* Captions toggle */}
          <button
            onClick={() => setShowCaptionOverlay(!showCaptionOverlay)}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              showCaptionOverlay ? 'border-blue-500/30 text-blue-400' : 'hover:bg-white/5'
            )}
            style={{ borderColor: showCaptionOverlay ? undefined : 'var(--border)' }}
            title="Toggle live captions"
          >
            <Subtitles className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recording controls */}
      <div
        className="flex items-center justify-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.01)' }}
      >
        {!isRecording && !isPaused ? (
          <button
            onClick={handleStartRecording}
            disabled={!isSupported}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
              isSupported
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            )}
          >
            <Mic className="h-4 w-4" />
            Start Transcription
          </button>
        ) : (
          <>
            {/* Recording indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 mr-3">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-400">Recording</span>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center gap-2 mr-3">
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-xs font-medium text-yellow-400">Paused</span>
              </div>
            )}

            {isPaused ? (
              <button
                onClick={handleResumeRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                <Play className="h-4 w-4" />
                Resume
              </button>
            ) : (
              <button
                onClick={handlePauseRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            )}

            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          </>
        )}

        {!isSupported && (
          <p className="text-xs text-red-400 ml-2">
            Speech recognition not supported. Try Chrome or Edge.
          </p>
        )}
        {speechError && (
          <p className="text-xs text-red-400 ml-2">{speechError}</p>
        )}

        {/* Interim text indicator */}
        {interimText && (
          <div className="flex items-center gap-1.5 ml-3">
            <Radio className="h-3 w-3 text-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300 italic max-w-xs truncate">{interimText}</span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center border-b px-4" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'transcript' as TabView, label: 'Transcript', icon: FileAudio },
          { id: 'speakers' as TabView, label: 'Speakers', icon: Users },
          { id: 'upload' as TabView, label: 'Upload Audio', icon: FileAudio },
          { id: 'settings' as TabView, label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent opacity-50 hover:opacity-80'
            )}
            style={{ color: activeTab === tab.id ? undefined : 'var(--foreground)' }}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}

        {/* Session selector */}
        {sessions.length > 0 && (
          <div className="ml-auto">
            <select
              value={activeSessionId || ''}
              onChange={(e) => handleSessionSelect(e.target.value)}
              className="text-xs rounded border px-2 py-1 outline-none"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="">Select session...</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.meetingTitle} ({session.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'transcript' && (
          <TranscriptEditor
            segments={activeSession?.segments || []}
            speakers={activeSession?.speakers || []}
            isRecording={isRecording}
            autoScroll={config.autoScroll}
            onUpdateSegment={handleUpdateSegment}
            onRemoveSegment={handleRemoveSegment}
          />
        )}

        {activeTab === 'speakers' && (
          <div className="p-4 overflow-y-auto h-full">
            <SpeakerDiarization
              speakers={activeSession?.speakers || []}
              segments={activeSession?.segments || []}
              onSpeakerNameChange={handleSpeakerNameChange}
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="p-4 overflow-y-auto h-full max-w-xl mx-auto">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              Upload Audio for Offline Transcription
            </h3>
            <p className="text-xs opacity-50 mb-4" style={{ color: 'var(--foreground)' }}>
              Upload audio files to transcribe them offline. Supports multiple formats.
            </p>
            <AudioUpload
              language={config.language}
              onUploadComplete={(sessionId) => {
                setActiveSessionId(sessionId);
                setActiveTab('transcript');
              }}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 overflow-y-auto h-full max-w-xl mx-auto space-y-4">
            <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Transcription Settings
            </h3>

            {/* Provider */}
            <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
              <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Provider
              </label>
              <select
                value={config.provider}
                onChange={(e) => updateConfig({ provider: e.target.value as 'browser' | 'deepgram' | 'assemblyai' })}
                className="w-full rounded border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="browser">Browser (Web Speech API)</option>
                <option value="deepgram">Deepgram (requires API key)</option>
                <option value="assemblyai">AssemblyAI (requires API key)</option>
              </select>
            </div>

            {/* Diarization */}
            <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  Speaker Diarization
                </label>
                <button
                  onClick={() => updateConfig({ enableDiarization: !config.enableDiarization })}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors',
                    config.enableDiarization ? 'bg-blue-500' : 'bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                      config.enableDiarization ? 'left-[18px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
              <p className="text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                Automatically detect and label different speakers
              </p>

              {config.enableDiarization && (
                <div className="mt-2">
                  <label className="text-[10px] opacity-60" style={{ color: 'var(--foreground)' }}>
                    Max speakers: {config.maxSpeakers}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={config.maxSpeakers}
                    onChange={(e) => updateConfig({ maxSpeakers: parseInt(e.target.value, 10) })}
                    className="w-full mt-1"
                  />
                </div>
              )}
            </div>

            {/* Caption settings */}
            <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  Live Captions
                </label>
                <button
                  onClick={() => updateConfig({ showCaptions: !config.showCaptions })}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors',
                    config.showCaptions ? 'bg-blue-500' : 'bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                      config.showCaptions ? 'left-[18px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>

              {config.showCaptions && (
                <div className="mt-2">
                  <label className="text-[10px] opacity-60" style={{ color: 'var(--foreground)' }}>
                    Font size
                  </label>
                  <div className="flex gap-1 mt-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateConfig({ captionFontSize: size })}
                        className={cn(
                          'px-3 py-1 rounded text-xs capitalize transition-colors',
                          config.captionFontSize === size
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'hover:bg-white/5'
                        )}
                        style={{ color: config.captionFontSize === size ? undefined : 'var(--foreground)' }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auto-scroll */}
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  Auto-scroll transcript
                </label>
                <button
                  onClick={() => updateConfig({ autoScroll: !config.autoScroll })}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors',
                    config.autoScroll ? 'bg-blue-500' : 'bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                      config.autoScroll ? 'left-[18px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live captions overlay */}
      {showCaptionOverlay && (
        <LiveCaptions
          segments={activeSession?.segments || []}
          interimText={interimText}
          isRecording={isRecording}
          config={config}
          onClose={() => setShowCaptionOverlay(false)}
        />
      )}
    </div>
  );
}
