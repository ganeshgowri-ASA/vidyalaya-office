'use client';

import { create } from 'zustand';
import type {
  TranscriptSegment,
  TranscriptionSession,
  TranscriptionConfig,
  Speaker,
  UploadProgress,
} from '@/types/transcription';

interface TranscriptionState {
  // Sessions
  sessions: TranscriptionSession[];
  activeSessionId: string | null;

  // Config
  config: TranscriptionConfig;

  // Upload
  uploads: UploadProgress[];

  // WebSocket
  wsConnected: boolean;

  // Computed helpers
  getActiveSession: () => TranscriptionSession | null;

  // Session actions
  createSession: (meetingId: string, meetingTitle: string) => string;
  updateSessionStatus: (sessionId: string, status: TranscriptionSession['status']) => void;
  endSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;

  // Segment actions
  addSegment: (sessionId: string, segment: TranscriptSegment) => void;
  updateSegment: (sessionId: string, segmentId: string, text: string) => void;
  removeSegment: (sessionId: string, segmentId: string) => void;

  // Speaker actions
  addSpeaker: (sessionId: string, speaker: Speaker) => void;
  updateSpeakerName: (sessionId: string, speakerId: string, name: string) => void;

  // Config actions
  updateConfig: (config: Partial<TranscriptionConfig>) => void;

  // Upload actions
  addUpload: (upload: UploadProgress) => void;
  updateUploadProgress: (fileId: string, progress: number) => void;
  updateUploadStatus: (fileId: string, status: UploadProgress['status'], errorMessage?: string) => void;
  removeUpload: (fileId: string) => void;

  // WebSocket
  setWsConnected: (connected: boolean) => void;

  // Active session
  setActiveSessionId: (id: string | null) => void;
}

const DEFAULT_CONFIG: TranscriptionConfig = {
  language: 'en-US',
  enableDiarization: true,
  maxSpeakers: 6,
  showCaptions: true,
  captionFontSize: 'medium',
  autoScroll: true,
  provider: 'browser',
};

// Sample speakers for demo
const DEMO_SPEAKERS: Speaker[] = [
  { id: 'spk-1', name: 'Ganesh Gowri', avatar: 'G', color: '#6366f1' },
  { id: 'spk-2', name: 'Priya Sharma', avatar: 'P', color: '#ec4899' },
  { id: 'spk-3', name: 'Raj Kumar', avatar: 'R', color: '#14b8a6' },
  { id: 'spk-4', name: 'Sarah Chen', avatar: 'S', color: '#f59e0b' },
];

// Demo transcript
const DEMO_SEGMENTS: TranscriptSegment[] = [
  { id: 'seg-1', speakerId: 'spk-1', speakerName: 'Ganesh Gowri', text: 'Good morning everyone. Let\'s start with the sprint review. We have a lot to cover today.', timestamp: 0, endTimestamp: 5200, confidence: 0.96, language: 'en-US', isEdited: false },
  { id: 'seg-2', speakerId: 'spk-2', speakerName: 'Priya Sharma', text: 'Thanks Ganesh. I\'ve completed the authentication module and the API integration tests are all passing.', timestamp: 5500, endTimestamp: 11000, confidence: 0.94, language: 'en-US', isEdited: false },
  { id: 'seg-3', speakerId: 'spk-3', speakerName: 'Raj Kumar', text: 'Great work Priya. On my end, the database migration scripts are ready. We should be able to deploy to staging by end of day.', timestamp: 11500, endTimestamp: 18000, confidence: 0.92, language: 'en-US', isEdited: false },
  { id: 'seg-4', speakerId: 'spk-4', speakerName: 'Sarah Chen', text: 'I have a question about the new transcription feature. Are we using the Web Speech API for the initial release?', timestamp: 18500, endTimestamp: 24000, confidence: 0.95, language: 'en-US', isEdited: false },
  { id: 'seg-5', speakerId: 'spk-1', speakerName: 'Ganesh Gowri', text: 'Yes, we\'ll use the browser Web Speech API first with Deepgram as a production fallback. The speaker diarization will be handled client-side initially.', timestamp: 24500, endTimestamp: 32000, confidence: 0.93, language: 'en-US', isEdited: false },
  { id: 'seg-6', speakerId: 'spk-2', speakerName: 'Priya Sharma', text: 'That makes sense. I can help with the multi-language support. We need at least the top 20 languages for the first release.', timestamp: 32500, endTimestamp: 38000, confidence: 0.91, language: 'en-US', isEdited: false },
  { id: 'seg-7', speakerId: 'spk-3', speakerName: 'Raj Kumar', text: 'For the audio upload feature, should we support all common formats? MP3, WAV, M4A, OGG?', timestamp: 38500, endTimestamp: 43000, confidence: 0.94, language: 'en-US', isEdited: false },
  { id: 'seg-8', speakerId: 'spk-1', speakerName: 'Ganesh Gowri', text: 'Yes, all of those. Let\'s also add a progress bar for the upload and processing steps. Users need to see what\'s happening.', timestamp: 43500, endTimestamp: 50000, confidence: 0.95, language: 'en-US', isEdited: false },
];

const DEMO_SESSION: TranscriptionSession = {
  id: 'session-demo-1',
  meetingId: 'meeting-1',
  meetingTitle: 'Sprint Review - Q1 Planning',
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  endedAt: new Date().toISOString(),
  status: 'completed',
  segments: DEMO_SEGMENTS,
  speakers: DEMO_SPEAKERS,
  language: 'en-US',
  duration: 50000,
  audioSource: 'microphone',
};

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  sessions: [DEMO_SESSION],
  activeSessionId: null,
  config: DEFAULT_CONFIG,
  uploads: [],
  wsConnected: false,

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId) || null;
  },

  createSession: (meetingId, meetingTitle) => {
    const id = `session-${generateId()}`;
    const session: TranscriptionSession = {
      id,
      meetingId,
      meetingTitle,
      startedAt: new Date().toISOString(),
      status: 'idle',
      segments: [],
      speakers: [],
      language: get().config.language,
      duration: 0,
      audioSource: 'microphone',
    };
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }));
    return id;
  },

  updateSessionStatus: (sessionId, status) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status } : s
      ),
    }));
  },

  endSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'completed' as const, endedAt: new Date().toISOString() }
          : s
      ),
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
    }));
  },

  addSegment: (sessionId, segment) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, segments: [...s.segments, segment], duration: Math.max(s.duration, segment.endTimestamp) }
          : s
      ),
    }));
  },

  updateSegment: (sessionId, segmentId, text) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              segments: s.segments.map((seg) =>
                seg.id === segmentId
                  ? { ...seg, text, isEdited: true, originalText: seg.originalText || seg.text }
                  : seg
              ),
            }
          : s
      ),
    }));
  },

  removeSegment: (sessionId, segmentId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, segments: s.segments.filter((seg) => seg.id !== segmentId) }
          : s
      ),
    }));
  },

  addSpeaker: (sessionId, speaker) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, speakers: [...s.speakers, speaker] }
          : s
      ),
    }));
  },

  updateSpeakerName: (sessionId, speakerId, name) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              speakers: s.speakers.map((sp) =>
                sp.id === speakerId ? { ...sp, name } : sp
              ),
              segments: s.segments.map((seg) =>
                seg.speakerId === speakerId ? { ...seg, speakerName: name } : seg
              ),
            }
          : s
      ),
    }));
  },

  updateConfig: (config) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  addUpload: (upload) => {
    set((state) => ({ uploads: [...state.uploads, upload] }));
  },

  updateUploadProgress: (fileId, progress) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.fileId === fileId ? { ...u, progress } : u
      ),
    }));
  },

  updateUploadStatus: (fileId, status, errorMessage) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.fileId === fileId ? { ...u, status, errorMessage } : u
      ),
    }));
  },

  removeUpload: (fileId) => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.fileId !== fileId),
    }));
  },

  setWsConnected: (connected) => {
    set({ wsConnected: connected });
  },

  setActiveSessionId: (id) => {
    set({ activeSessionId: id });
  },
}));
