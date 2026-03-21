import { create } from "zustand";

// ==================== TYPES ====================

export type BotStatus = 'idle' | 'joining' | 'recording' | 'processing' | 'error' | 'completed';
export type BotBehavior = 'record_only' | 'transcribe_only' | 'full_participation';
export type MeetingPlatform = 'zoom' | 'gmeet' | 'teams' | 'webex' | 'vidyalaya' | 'unknown';

export interface BotConfig {
  id: string;
  name: string;
  avatar: string; // initials or emoji
  avatarColor: string;
  behavior: BotBehavior;
  autoJoin: boolean;
  joinBeforeMinutes: number;
  leaveAfterMinutes: number;
  recordAudio: boolean;
  recordVideo: boolean;
  autoTranscribe: boolean;
  notifyHost: boolean;
  language: string;
}

export interface ScheduledBotAttendance {
  id: string;
  meetingTitle: string;
  meetingUrl: string;
  platform: MeetingPlatform;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // minutes
  botConfigId: string;
  status: 'pending' | 'joined' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface Recording {
  id: string;
  meetingTitle: string;
  meetingUrl: string;
  platform: MeetingPlatform;
  date: string;
  duration: number; // seconds
  fileSize: number; // bytes
  type: 'audio' | 'video';
  status: 'recording' | 'processing' | 'ready' | 'error';
  blobUrl?: string;
  thumbnailColor: string;
  participants: string[];
  tags: string[];
  transcript?: string;
}

export interface Soundbite {
  id: string;
  recordingId: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  duration: number; // seconds
  createdAt: string;
  tags: string[];
  blobUrl?: string;
}

// ==================== DEFAULT DATA ====================

const DEFAULT_BOT_CONFIG: BotConfig = {
  id: 'bot-default',
  name: 'Vidyalaya Bot',
  avatar: 'VB',
  avatarColor: '#6366f1',
  behavior: 'full_participation',
  autoJoin: true,
  joinBeforeMinutes: 2,
  leaveAfterMinutes: 5,
  recordAudio: true,
  recordVideo: true,
  autoTranscribe: true,
  notifyHost: true,
  language: 'en',
};

const MOCK_RECORDINGS: Recording[] = [
  {
    id: 'rec-1',
    meetingTitle: 'Sprint Planning - Q2',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    platform: 'gmeet',
    date: '2024-03-18',
    duration: 3420,
    fileSize: 45_000_000,
    type: 'video',
    status: 'ready',
    thumbnailColor: '#6366f1',
    participants: ['Ganesh Gowri', 'Priya Sharma', 'Raj Kumar'],
    tags: ['sprint', 'planning'],
    transcript: 'Ganesh: Let\'s review the Q2 objectives...\nPriya: I\'ve prepared the backlog items...\nRaj: The sprint velocity suggests we can take on 45 story points...',
  },
  {
    id: 'rec-2',
    meetingTitle: 'Client Demo - Phase 2',
    meetingUrl: 'https://zoom.us/j/123456789',
    platform: 'zoom',
    date: '2024-03-17',
    duration: 5400,
    fileSize: 72_000_000,
    type: 'video',
    status: 'ready',
    thumbnailColor: '#2563eb',
    participants: ['Ganesh Gowri', 'Mike Johnson', 'Sarah Chen', 'Aisha Patel'],
    tags: ['client', 'demo', 'phase-2'],
    transcript: 'Ganesh: Welcome everyone to the Phase 2 demo...\nMike: The new email module looks impressive...\nSarah: How does the AI integration work?...',
  },
  {
    id: 'rec-3',
    meetingTitle: 'Design Review - UI/UX',
    meetingUrl: 'https://teams.microsoft.com/l/meetup-join/abc',
    platform: 'teams',
    date: '2024-03-15',
    duration: 2700,
    fileSize: 35_000_000,
    type: 'audio',
    status: 'ready',
    thumbnailColor: '#8b5cf6',
    participants: ['Priya Sharma', 'Aisha Patel'],
    tags: ['design', 'review'],
    transcript: 'Priya: The new color palette looks great...\nAisha: I think we should adjust the spacing on mobile...',
  },
  {
    id: 'rec-4',
    meetingTitle: 'Engineering Standup',
    meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
    platform: 'gmeet',
    date: '2024-03-19',
    duration: 900,
    fileSize: 12_000_000,
    type: 'audio',
    status: 'ready',
    thumbnailColor: '#10b981',
    participants: ['Ganesh Gowri', 'Raj Kumar', 'Priya Sharma', 'Aisha Patel'],
    tags: ['standup', 'daily'],
  },
  {
    id: 'rec-5',
    meetingTitle: 'Vendor Integration Call',
    meetingUrl: 'https://webex.com/meet/vendor-sync',
    platform: 'webex',
    date: '2024-03-14',
    duration: 4200,
    fileSize: 55_000_000,
    type: 'video',
    status: 'ready',
    thumbnailColor: '#f59e0b',
    participants: ['Ganesh Gowri', 'Mike Johnson'],
    tags: ['vendor', 'integration'],
  },
  {
    id: 'rec-6',
    meetingTitle: 'All Hands - March',
    meetingUrl: 'https://zoom.us/j/987654321',
    platform: 'zoom',
    date: '2024-03-12',
    duration: 3600,
    fileSize: 48_000_000,
    type: 'video',
    status: 'processing',
    thumbnailColor: '#ef4444',
    participants: ['Ganesh Gowri', 'Priya Sharma', 'Raj Kumar', 'Sarah Chen', 'Mike Johnson', 'Aisha Patel'],
    tags: ['all-hands', 'company'],
  },
];

const MOCK_SOUNDBITES: Soundbite[] = [
  {
    id: 'sb-1',
    recordingId: 'rec-1',
    title: 'Sprint velocity discussion',
    startTime: 420,
    endTime: 480,
    duration: 60,
    createdAt: '2024-03-18T12:00:00Z',
    tags: ['velocity', 'sprint'],
  },
  {
    id: 'sb-2',
    recordingId: 'rec-2',
    title: 'Client feedback on email module',
    startTime: 1200,
    endTime: 1320,
    duration: 120,
    createdAt: '2024-03-17T15:30:00Z',
    tags: ['feedback', 'email'],
  },
  {
    id: 'sb-3',
    recordingId: 'rec-2',
    title: 'AI integration Q&A',
    startTime: 3600,
    endTime: 3720,
    duration: 120,
    createdAt: '2024-03-17T16:00:00Z',
    tags: ['ai', 'q&a'],
  },
];

const MOCK_SCHEDULED: ScheduledBotAttendance[] = [
  {
    id: 'sba-1',
    meetingTitle: 'Sprint Retrospective',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    platform: 'gmeet',
    scheduledDate: '2024-03-22',
    scheduledTime: '10:00',
    duration: 60,
    botConfigId: 'bot-default',
    status: 'pending',
    createdAt: '2024-03-20T09:00:00Z',
  },
  {
    id: 'sba-2',
    meetingTitle: 'Weekly Product Sync',
    meetingUrl: 'https://zoom.us/j/555666777',
    platform: 'zoom',
    scheduledDate: '2024-03-22',
    scheduledTime: '14:00',
    duration: 45,
    botConfigId: 'bot-default',
    status: 'pending',
    createdAt: '2024-03-20T09:00:00Z',
  },
  {
    id: 'sba-3',
    meetingTitle: 'Architecture Review',
    meetingUrl: 'https://teams.microsoft.com/l/meetup-join/xyz',
    platform: 'teams',
    scheduledDate: '2024-03-21',
    scheduledTime: '11:00',
    duration: 90,
    botConfigId: 'bot-default',
    status: 'joined',
    createdAt: '2024-03-19T08:00:00Z',
  },
  {
    id: 'sba-4',
    meetingTitle: 'Client Onboarding',
    meetingUrl: 'https://webex.com/meet/client-onboard',
    platform: 'webex',
    scheduledDate: '2024-03-20',
    scheduledTime: '09:00',
    duration: 120,
    botConfigId: 'bot-default',
    status: 'completed',
    createdAt: '2024-03-18T10:00:00Z',
  },
];

// ==================== STORE ====================

interface MeetingBotState {
  // Bot config
  botConfig: BotConfig;
  updateBotConfig: (updates: Partial<BotConfig>) => void;
  resetBotConfig: () => void;

  // Bot status
  botStatus: BotStatus;
  setBotStatus: (status: BotStatus) => void;
  currentMeetingUrl: string;
  setCurrentMeetingUrl: (url: string) => void;

  // Scheduled attendances
  scheduledAttendances: ScheduledBotAttendance[];
  addScheduledAttendance: (attendance: Omit<ScheduledBotAttendance, 'id' | 'createdAt'>) => void;
  removeScheduledAttendance: (id: string) => void;
  updateAttendanceStatus: (id: string, status: ScheduledBotAttendance['status']) => void;

  // Recordings
  recordings: Recording[];
  addRecording: (recording: Recording) => void;
  removeRecording: (id: string) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;

  // Soundbites
  soundbites: Soundbite[];
  addSoundbite: (soundbite: Omit<Soundbite, 'id' | 'createdAt'>) => void;
  removeSoundbite: (id: string) => void;

  // UI state
  activeTab: 'config' | 'scheduler' | 'recordings' | 'soundbites';
  setActiveTab: (tab: 'config' | 'scheduler' | 'recordings' | 'soundbites') => void;
  recordingSearchQuery: string;
  setRecordingSearchQuery: (query: string) => void;
  recordingFilterPlatform: MeetingPlatform | 'all';
  setRecordingFilterPlatform: (platform: MeetingPlatform | 'all') => void;
  recordingFilterType: 'all' | 'audio' | 'video';
  setRecordingFilterType: (type: 'all' | 'audio' | 'video') => void;
}

export const useMeetingBotStore = create<MeetingBotState>()((set) => ({
  // Bot config
  botConfig: DEFAULT_BOT_CONFIG,
  updateBotConfig: (updates) => set((state) => ({ botConfig: { ...state.botConfig, ...updates } })),
  resetBotConfig: () => set({ botConfig: DEFAULT_BOT_CONFIG }),

  // Bot status
  botStatus: 'idle',
  setBotStatus: (status) => set({ botStatus: status }),
  currentMeetingUrl: '',
  setCurrentMeetingUrl: (url) => set({ currentMeetingUrl: url }),

  // Scheduled attendances
  scheduledAttendances: MOCK_SCHEDULED,
  addScheduledAttendance: (attendance) => set((state) => ({
    scheduledAttendances: [...state.scheduledAttendances, {
      ...attendance,
      id: `sba-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }],
  })),
  removeScheduledAttendance: (id) => set((state) => ({
    scheduledAttendances: state.scheduledAttendances.filter((a) => a.id !== id),
  })),
  updateAttendanceStatus: (id, status) => set((state) => ({
    scheduledAttendances: state.scheduledAttendances.map((a) =>
      a.id === id ? { ...a, status } : a
    ),
  })),

  // Recordings
  recordings: MOCK_RECORDINGS,
  addRecording: (recording) => set((state) => ({
    recordings: [recording, ...state.recordings],
  })),
  removeRecording: (id) => set((state) => ({
    recordings: state.recordings.filter((r) => r.id !== id),
  })),
  updateRecording: (id, updates) => set((state) => ({
    recordings: state.recordings.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    ),
  })),

  // Soundbites
  soundbites: MOCK_SOUNDBITES,
  addSoundbite: (soundbite) => set((state) => ({
    soundbites: [...state.soundbites, {
      ...soundbite,
      id: `sb-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }],
  })),
  removeSoundbite: (id) => set((state) => ({
    soundbites: state.soundbites.filter((s) => s.id !== id),
  })),

  // UI state
  activeTab: 'config',
  setActiveTab: (tab) => set({ activeTab: tab }),
  recordingSearchQuery: '',
  setRecordingSearchQuery: (query) => set({ recordingSearchQuery: query }),
  recordingFilterPlatform: 'all',
  setRecordingFilterPlatform: (platform) => set({ recordingFilterPlatform: platform }),
  recordingFilterType: 'all',
  setRecordingFilterType: (type) => set({ recordingFilterType: type }),
}));
