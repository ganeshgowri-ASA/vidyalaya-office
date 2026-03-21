'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useMeetingIntegrationsStore } from '@/store/meeting-integrations-store';
import MeetingInsightsDashboard from './meeting-insights-dashboard';
import AskFred from './ask-fred';
import MeetingComments from './meeting-comments';
import MeetingShareModal from './meeting-share-modal';
import MeetingExportModal from './meeting-export-modal';
import WebhookConfigPanel from './webhook-config';
import SlackIntegration from './slack-integration';

// ==================== TYPES ====================
interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'video' | 'audio' | 'in-person';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  host: Participant;
  participants: Participant[];
  meetingLink: string;
  platform: 'vidyalaya' | 'teams' | 'zoom' | 'meet' | 'webex';
  recording?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  agenda: string[];
  notes: string;
  tags: string[];
  reminders: number[]; // minutes before
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'host' | 'co-host' | 'presenter' | 'attendee';
  status: 'accepted' | 'declined' | 'tentative' | 'pending';
  isOnline?: boolean;
}

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  available: boolean;
  floor: string;
  location: string;
  nextAvailableAt?: string;
}

interface TranscriptEntry {
  id: string;
  speaker: string;
  avatar: string;
  text: string;
  timestamp: string;
  language: 'en' | 'hi' | 'te' | 'hinglish' | 'tinglish' | 'auto';
  confidence: number;
}

interface AISummary {
  decisions: string[];
  actionItems: { task: string; assignee: string; due: string }[];
  topics: string[];
  followUps: string[];
  sentiment: 'positive' | 'neutral' | 'mixed' | 'tense';
  duration: string;
  keyPoints: string[];
}

type ScreenShareTarget = 'screen' | 'window' | 'file' | null;

// ==================== CONSTANTS ====================
const PARTICIPANTS: Participant[] = [
  { id: 'u1', name: 'Ganesh Gowri', email: 'ganesh@vidyalaya.dev', avatar: 'G', role: 'host', status: 'accepted', isOnline: true },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@vidyalaya.dev', avatar: 'P', role: 'attendee', status: 'accepted', isOnline: true },
  { id: 'u3', name: 'Raj Kumar', email: 'raj@vidyalaya.dev', avatar: 'R', role: 'presenter', status: 'accepted', isOnline: false },
  { id: 'u4', name: 'Sarah Chen', email: 'sarah@vidyalaya.dev', avatar: 'S', role: 'attendee', status: 'tentative', isOnline: true },
  { id: 'u5', name: 'Mike Johnson', email: 'mike@company.com', avatar: 'M', role: 'attendee', status: 'pending', isOnline: false },
  { id: 'u6', name: 'Aisha Patel', email: 'aisha@vidyalaya.dev', avatar: 'A', role: 'co-host', status: 'accepted', isOnline: true },
];

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1', title: 'Sprint Planning - Q2', description: 'Review Q2 objectives and plan sprint tasks',
    date: '2024-03-20', startTime: '10:00', endTime: '11:00', type: 'video', status: 'scheduled',
    host: PARTICIPANTS[0], participants: [PARTICIPANTS[0], PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[3]],
    meetingLink: 'meet.vidyalaya.dev/sprint-q2', platform: 'vidyalaya', isRecurring: true,
    recurringPattern: 'Every Monday', agenda: ['Review backlog', 'Assign story points', 'Sprint goals', 'Q&A'],
    notes: '', tags: ['sprint', 'planning'], reminders: [15, 5],
  },
  {
    id: 'm2', title: 'Client Demo - Phase 2', description: 'Present Phase 2 features to the client',
    date: '2024-03-20', startTime: '14:00', endTime: '15:30', type: 'video', status: 'scheduled',
    host: PARTICIPANTS[0], participants: [PARTICIPANTS[0], PARTICIPANTS[4], PARTICIPANTS[2], PARTICIPANTS[5]],
    meetingLink: 'zoom.us/j/123456789', platform: 'zoom', isRecurring: false,
    agenda: ['Email module demo', 'Chat engine walkthrough', 'Graphics editor showcase', 'Feedback & next steps'],
    notes: '', tags: ['client', 'demo'], reminders: [30, 10],
  },
  {
    id: 'm3', title: 'Design Review', description: 'Review UI/UX designs for meetings module',
    date: '2024-03-21', startTime: '11:00', endTime: '12:00', type: 'video', status: 'scheduled',
    host: PARTICIPANTS[1], participants: [PARTICIPANTS[0], PARTICIPANTS[1], PARTICIPANTS[3]],
    meetingLink: 'meet.google.com/abc-defg-hij', platform: 'meet', isRecurring: false,
    agenda: ['Review mockups', 'Discuss color scheme', 'Component library updates'],
    notes: '', tags: ['design', 'ui'], reminders: [15],
  },
  {
    id: 'm4', title: 'Weekly Standup', description: 'Daily standup meeting',
    date: '2024-03-19', startTime: '09:00', endTime: '09:30', type: 'video', status: 'completed',
    host: PARTICIPANTS[0], participants: PARTICIPANTS.slice(0, 4),
    meetingLink: 'teams.microsoft.com/l/meetup', platform: 'teams', isRecurring: true,
    recurringPattern: 'Every weekday', recording: 'rec_standup_0319.mp4',
       agenda: ['Yesterday updates', 'Today plans', 'Blockers'], notes: 'Discussed deployment timeline. All on track.',
    tags: ['standup', 'daily'], reminders: [5],
  },
  {
    id: 'm5', title: 'Architecture Review', description: 'Review system architecture for scaling',
    date: '2024-03-22', startTime: '15:00', endTime: '16:30', type: 'video', status: 'scheduled',
    host: PARTICIPANTS[2], participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[5]],
    meetingLink: 'webex.com/meet/arch-review', platform: 'webex', isRecurring: false,
    agenda: ['Database schema', 'API design', 'Scaling strategies', 'Caching layer'],
    notes: '', tags: ['architecture', 'technical'], reminders: [30, 15],
  },
];

const MEETING_ROOMS: MeetingRoom[] = [
  { id: 'r1', name: 'Himalaya', capacity: 10, features: ['Projector', 'Whiteboard', 'Video Conf'], available: true, floor: '3rd Floor', location: 'East Wing', },
  { id: 'r2', name: 'Ganges', capacity: 6, features: ['TV', 'Whiteboard'], available: true, floor: '2nd Floor', location: 'West Wing' },
  { id: 'r3', name: 'Lotus', capacity: 20, features: ['Projector', 'Audio', 'Video Conf', 'Recording'], available: false, floor: '4th Floor', location: 'Main Hall', nextAvailableAt: '15:00' },
  { id: 'r4', name: 'Bodhi', capacity: 4, features: ['TV'], available: true, floor: '1st Floor', location: 'North Wing' },
  { id: 'r5', name: 'Arjuna', capacity: 8, features: ['Projector', 'Video Conf', 'Whiteboard'], available: true, floor: '3rd Floor', location: 'South Wing' },
  { id: 'r6', name: 'Brahma', capacity: 30, features: ['Stage', 'Projector', 'Audio', 'Video Conf', 'Recording'], available: false, floor: '5th Floor', location: 'Conference Centre', nextAvailableAt: '17:00' },
];

const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  { id: 't1', speaker: 'Ganesh Gowri', avatar: 'G', text: "Alright team, let's start the sprint planning. We have 12 story points to allocate this week.", timestamp: '10:02:14', language: 'en', confidence: 0.98 },
  { id: 't2', speaker: 'Priya Sharma', avatar: 'P', text: "Haan, maine backlog dekha. Humein authentication stories pehle complete karni chahiye.", timestamp: '10:02:41', language: 'hinglish', confidence: 0.91 },
  { id: 't3', speaker: 'Raj Kumar', avatar: 'R', text: "Naaku okka doubt undi — API design complete aindaa?", timestamp: '10:03:05', language: 'tinglish', confidence: 0.87 },
  { id: 't4', speaker: 'Sarah Chen', avatar: 'S', text: "The API design is 80% done. I'll finish the remaining endpoints by tomorrow.", timestamp: '10:03:28', language: 'en', confidence: 0.97 },
  { id: 't5', speaker: 'Ganesh Gowri', avatar: 'G', text: "Good. Raj, can you take the backend stories? Priya, you handle the UI components.", timestamp: '10:04:10', language: 'en', confidence: 0.96 },
  { id: 't6', speaker: 'Priya Sharma', avatar: 'P', text: "Sure! Main UI start karungi after the standup. Koi blocker nahi hai abhi.", timestamp: '10:04:35', language: 'hinglish', confidence: 0.89 },
  { id: 't7', speaker: 'Aisha Patel', avatar: 'A', text: "I'll coordinate with QA team. Testing should begin by Thursday.", timestamp: '10:05:00', language: 'en', confidence: 0.98 },
];

const MOCK_AI_SUMMARY: AISummary = {
  decisions: [
    'API design to be completed by Sarah Chen by tomorrow',
    'Raj Kumar assigned to all backend stories',
    'Priya Sharma to handle UI component development',
    'QA testing to commence Thursday, coordinated by Aisha Patel',
  ],
  actionItems: [
    { task: 'Complete API endpoints (remaining 20%)', assignee: 'Sarah Chen', due: 'Tomorrow' },
    { task: 'Start backend story implementation', assignee: 'Raj Kumar', due: 'This Sprint' },
    { task: 'Build UI components for authentication', assignee: 'Priya Sharma', due: 'This Sprint' },
    { task: 'Coordinate QA testing schedule', assignee: 'Aisha Patel', due: 'Thursday' },
  ],
  topics: ['Sprint planning', 'API design status', 'Story point allocation', 'QA coordination'],
  followUps: ['Daily standup at 9am', 'API design review on Wednesday', 'Sprint review next Monday'],
  sentiment: 'positive',
  duration: '58 min',
  keyPoints: [
    '12 story points allocated for the sprint',
    'Authentication stories prioritized',
    'API is 80% complete — no blockers reported',
    'Team morale high, clear ownership established',
  ],
};

// Calendar helpers for calendar view
const WEEK_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CALENDAR_TODAY = '2024-03-20';

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatCalDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const LANG_LABELS: Record<string, { label: string; color: string }> = {
  en: { label: 'EN', color: 'bg-blue-500/20 text-blue-400' },
  hi: { label: 'HI', color: 'bg-orange-500/20 text-orange-400' },
  te: { label: 'TE', color: 'bg-green-500/20 text-green-400' },
  hinglish: { label: 'HI+EN', color: 'bg-yellow-500/20 text-yellow-400' },
  tinglish: { label: 'TE+EN', color: 'bg-purple-500/20 text-purple-400' },
  auto: { label: 'AUTO', color: 'bg-gray-500/20 text-gray-400' },
};

const PLATFORM_ICONS: Record<string, string> = {
  vidyalaya: '🟣', teams: '🟦', jiomeet: '🔷', zoom: '🔵', meet: '🟢', webex: '🟡',
};

const PLATFORM_LABELS: Record<string, string> = {
  vidyalaya: 'Vidyalaya Meet', teams: 'Microsoft Teams', jiomeet: 'Jio Meet', zoom: 'Zoom', meet: 'Google Meet', webex: 'Cisco Webex',
};

const getStatusColor = (s: string) => {
  switch (s) {
    case 'scheduled': return 'bg-blue-500/20 text-blue-400';
    case 'in-progress': return 'bg-green-500/20 text-green-400';
    case 'completed': return 'bg-gray-500/20 text-gray-400';
    case 'cancelled': return 'bg-red-500/20 text-red-400';
    default: return '';
  }
};

const getRsvpColor = (s: string) => {
  switch (s) {
    case 'accepted': return 'text-green-400';
    case 'declined': return 'text-red-400';
    case 'tentative': return 'text-yellow-400';
    case 'pending': return 'text-gray-400';
    default: return '';
  }
};

export default function MeetingsModule() {
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showCallUI, setShowCallUI] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [callState, setCallState] = useState({ muted: false, videoOff: false, sharing: false, recording: false, handRaised: false, recordingPaused: false });

  // Recording timer
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Transcript
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [transcriptLang, setTranscriptLang] = useState<'auto' | 'en' | 'hi' | 'te' | 'hinglish' | 'tinglish'>('auto');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // AI Summary
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Screen share
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareTarget, setShareTarget] = useState<ScreenShareTarget>(null);

  // Room booking
  const [roomFilter, setRoomFilter] = useState({ minCapacity: 0, feature: 'all' });

  // Integration panels
  const { activeIntegrationPanel, setActiveIntegrationPanel, firefliesTranscripts, selectedTranscriptId, selectTranscript } = useMeetingIntegrationsStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSlackModal, setShowSlackModal] = useState(false);

  const selectedTranscript = firefliesTranscripts.find(t => t.id === selectedTranscriptId) || firefliesTranscripts[0] || null;

  // Calendar view state
  const [calYear, setCalYear] = useState(2024);
  const [calMonth, setCalMonth] = useState(2); // March = index 2

  const [newMeeting, setNewMeeting] = useState({
    title: '', description: '', date: '', startTime: '', endTime: '',
    platform: 'vidyalaya' as string, type: 'video' as string, isRecurring: false,
    recurringType: 'weekly' as string,
    meetingId: `vid-meet-${Math.random().toString(36).substr(2, 5)}`,
    password: Math.random().toString(36).substr(2, 8).toUpperCase(),
    roomId: '',
    sendCalendarInvite: true,
    agenda: '',
  });

  // ---- Recording timer effects ----
  useEffect(() => {
    if (callState.recording && !callState.recordingPaused) {
      recordingIntervalRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => { if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); };
  }, [callState.recording, callState.recordingPaused]);

  // Simulate transcript lines appearing when in call + transcript open
  useEffect(() => {
    if (!showCallUI || !showTranscript) { setTranscript([]); return; }
    setTranscript(MOCK_TRANSCRIPT.slice(0, 2));
    const ids = MOCK_TRANSCRIPT.slice(2);
    const timers: ReturnType<typeof setTimeout>[] = ids.map((entry, i) =>
      setTimeout(() => setTranscript(prev => [...prev, entry]), (i + 1) * 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [showCallUI, showTranscript]);

  useEffect(() => {
    if (transcriptEndRef.current) transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const formatRecordingTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleEndMeeting = useCallback(() => {
    setShowCallUI(false);
    setCallState(s => ({ ...s, recording: false, recordingPaused: false }));
    setRecordingSeconds(0);
    setSummaryLoading(true);
    setShowAISummary(true);
    setTimeout(() => { setAiSummary(MOCK_AI_SUMMARY); setSummaryLoading(false); }, 2000);
  }, []);

  const startScreenShare = (target: ScreenShareTarget) => {
    setShareTarget(target);
    setShowShareOptions(false);
    setCallState(s => ({ ...s, sharing: true }));
  };

  const filteredRooms = useMemo(() => {
    return MEETING_ROOMS.filter(r => {
      const capOk = r.capacity >= roomFilter.minCapacity;
      const featOk = roomFilter.feature === 'all' || r.features.some(f => f.toLowerCase().includes(roomFilter.feature.toLowerCase()));
      return capOk && featOk;
    });
  }, [roomFilter]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchFilter = filter === 'all' || m.status === filter;
      const matchSearch = searchQuery === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    }).sort((a, b) => {
      const da = new Date(`${a.date} ${a.startTime}`);
      const db = new Date(`${b.date} ${b.startTime}`);
      return da.getTime() - db.getTime();
    });
  }, [meetings, filter, searchQuery]);

  const todayMeetings = useMemo(() => {
    const today = '2024-03-20';
    return meetings.filter(m => m.date === today && m.status !== 'cancelled');
  }, [meetings]);

  const joinMeeting = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowCallUI(true);
  }, []);

  const cancelMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' as const } : m));
  }, []);

  const generateMeetingLink = () => {
    return `meet.vidyalaya.dev/${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary,#0a0f1a)] text-[var(--text-primary,#e2e8f0)]">
      {/* Top Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#111827)]">
        <h2 className="text-sm font-bold">🎥 Meetings</h2>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
          <span className="text-[10px]">🔍</span>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search meetings..." className="bg-transparent text-xs outline-none w-48" />
        </div>
        <div className="flex items-center gap-1">
          {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[10px] capitalize ${filter === f ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {(['list', 'calendar', 'timeline'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`px-2 py-1 rounded text-[10px] capitalize ${viewMode === v ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setShowRooms(!showRooms)}
          className="px-2 py-1 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">🏢 Rooms</button>
        <button onClick={() => setActiveIntegrationPanel(activeIntegrationPanel === 'insights' ? null : 'insights')}
          className={`px-2 py-1 rounded text-[10px] ${activeIntegrationPanel === 'insights' ? 'bg-blue-600/20 text-blue-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>📊 Insights</button>
        <button onClick={() => setActiveIntegrationPanel(activeIntegrationPanel === 'askfred' ? null : 'askfred')}
          className={`px-2 py-1 rounded text-[10px] ${activeIntegrationPanel === 'askfred' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>✨ AskFred</button>
        <button onClick={() => setActiveIntegrationPanel(activeIntegrationPanel === 'fireflies' ? null : 'fireflies')}
          className={`px-2 py-1 rounded text-[10px] ${activeIntegrationPanel === 'fireflies' ? 'bg-purple-600/20 text-purple-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>🔥 Fireflies</button>
        <button onClick={() => setActiveIntegrationPanel(activeIntegrationPanel === 'webhooks' ? null : 'webhooks')}
          className={`px-2 py-1 rounded text-[10px] ${activeIntegrationPanel === 'webhooks' ? 'bg-orange-600/20 text-orange-400' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>🔗 Webhooks</button>
        <button onClick={() => setShowSchedule(true)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">➕ New Meeting</button>
      </div>

      {/* Today's overview */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-900/10 to-purple-900/10 border-b border-[var(--border-color,#334155)]">
        <span className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)]">TODAY</span>
        <span className="text-[10px] text-blue-400">{todayMeetings.length} meetings</span>
        {todayMeetings.map(m => (
          <button key={m.id} onClick={() => setSelectedMeeting(m)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-[9px] hover:border-blue-500/50">
            <span>{PLATFORM_ICONS[m.platform]}</span>
            <span>{m.startTime}</span>
            <span className="text-[var(--text-secondary,#94a3b8)]">{m.title.substring(0, 20)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Meeting List / Calendar / Timeline */}
        <div className={`${selectedMeeting && !showCallUI && viewMode === 'list' ? 'w-96' : viewMode !== 'list' && !showCallUI ? 'flex-1' : showCallUI ? 'hidden' : 'flex-1'} border-r border-[var(--border-color,#334155)] overflow-hidden flex flex-col`}>

          {/* ===== CALENDAR VIEW ===== */}
          {viewMode === 'calendar' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Calendar nav */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#111827)]">
                <button onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}
                  className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">◀</button>
                <span className="text-xs font-semibold">{MONTH_NAMES_SHORT[calMonth]} {calYear}</span>
                <button onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}
                  className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">▶</button>
                <button onClick={() => { setCalYear(2024); setCalMonth(2); }}
                  className="px-2 py-0.5 rounded text-[9px] border border-[var(--border-color,#334155)] hover:bg-[var(--bg-hover,#334155)]">Today</button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-[var(--border-color,#334155)]">
                {WEEK_DAYS_SHORT.map(d => (
                  <div key={d} className="py-1.5 text-center text-[9px] font-semibold uppercase text-[var(--text-secondary,#94a3b8)]">{d}</div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                {getCalendarDays(calYear, calMonth).map((day, idx) => {
                  const dateStr = day ? formatCalDate(calYear, calMonth, day) : '';
                  const isToday = dateStr === CALENDAR_TODAY;
                  const dayMeetings = day ? meetings.filter(m => m.date === dateStr && m.status !== 'cancelled') : [];
                  return (
                    <div key={idx}
                      className={`border-r border-b border-[var(--border-color,#334155)] p-1 min-h-[72px] cursor-pointer hover:bg-[var(--bg-hover,#334155)] transition-colors`}
                      onClick={() => day && setSelectedMeeting(null)}
                    >
                      {day && (
                        <>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium mb-0.5 ${isToday ? 'bg-blue-600 text-white' : 'text-[var(--text-primary,#e2e8f0)]'}`}>
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayMeetings.slice(0, 2).map(m => (
                              <div key={m.id}
                                onClick={e => { e.stopPropagation(); setSelectedMeeting(m); setShowCallUI(false); }}
                                className="text-[8px] px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80"
                                style={{ backgroundColor: m.platform === 'zoom' ? '#2563eb' : m.platform === 'teams' ? '#7c3aed' : m.platform === 'meet' ? '#16a34a' : '#6366f1' }}>
                                {m.startTime} {m.title}
                              </div>
                            ))}
                            {dayMeetings.length > 2 && (
                              <div className="text-[7px] text-[var(--text-secondary,#94a3b8)] pl-0.5">+{dayMeetings.length - 2} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== TIMELINE VIEW ===== */}
          {viewMode === 'timeline' && (
            <div className="flex-1 overflow-y-auto p-3">
              {['2024-03-19', '2024-03-20', '2024-03-21', '2024-03-22'].map(date => {
                const dayMeetings = meetings.filter(m => m.date === date && m.status !== 'cancelled');
                if (dayMeetings.length === 0) return null;
                return (
                  <div key={date} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-2 py-0.5 rounded text-[9px] font-semibold ${date === CALENDAR_TODAY ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)]'}`}>
                        {date === CALENDAR_TODAY ? 'Today' : date}
                      </div>
                      <div className="flex-1 h-px bg-[var(--border-color,#334155)]" />
                    </div>
                    <div className="relative ml-4 pl-4 border-l-2 border-[var(--border-color,#334155)] space-y-2">
                      {dayMeetings.map(m => (
                        <div key={m.id}
                          onClick={() => { setSelectedMeeting(m); setShowCallUI(false); }}
                          className="relative flex items-start gap-3 p-2 rounded-lg bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)] cursor-pointer hover:border-blue-500/40 transition-colors">
                          <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-blue-500 bg-[var(--bg-primary,#0a0f1a)]" />
                          <span className="text-base">{PLATFORM_ICONS[m.platform]}</span>
                          <div className="flex-1">
                            <div className="text-xs font-medium">{m.title}</div>
                            <div className="text-[9px] text-[var(--text-secondary,#94a3b8)]">{m.startTime} – {m.endTime}</div>
                          </div>
                          <span className={`text-[7px] px-1.5 py-0.5 rounded self-start ${getStatusColor(m.status)}`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== LIST VIEW ===== */}
          {viewMode === 'list' && (
            <div className="overflow-y-auto flex-1">
              {filteredMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary,#94a3b8)]">
                  <span className="text-4xl mb-2">🎥</span>
                  <p className="text-xs">No meetings found</p>
                </div>
              ) : filteredMeetings.map(meeting => (
                <div key={meeting.id} onClick={() => { setSelectedMeeting(meeting); setShowCallUI(false); }}
                  className={`px-4 py-3 border-b border-[var(--border-color,#334155)] cursor-pointer transition-colors ${selectedMeeting?.id === meeting.id ? 'bg-blue-600/10' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{PLATFORM_ICONS[meeting.platform]}</span>
                    <span className={`text-xs font-medium ${meeting.status === 'cancelled' ? 'line-through text-[var(--text-secondary,#94a3b8)]' : ''}`}>{meeting.title}</span>
                    <div className="flex-1" />
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${getStatusColor(meeting.status)}`}>{meeting.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary,#94a3b8)]">
                    <span>📅 {meeting.date}</span>
                    <span>⏰ {meeting.startTime} - {meeting.endTime}</span>
                    {meeting.isRecurring && <span>🔁 {meeting.recurringPattern}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {meeting.participants.slice(0, 4).map((p, i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white -ml-1 first:ml-0 border border-[var(--bg-primary,#0a0f1a)]">
                        {p.avatar}
                      </div>
                    ))}
                    {meeting.participants.length > 4 && (
                      <span className="text-[9px] text-[var(--text-secondary,#94a3b8)] ml-1">+{meeting.participants.length - 4}</span>
                    )}
                    <div className="flex-1" />
                    {meeting.status === 'scheduled' && (
                      <button onClick={(e) => { e.stopPropagation(); joinMeeting(meeting); }}
                        className="px-2 py-0.5 rounded bg-green-600/20 hover:bg-green-600/30 text-green-400 text-[9px]">Join</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== MEETING DETAIL / CALL UI ===== */}
        {selectedMeeting && !showCallUI && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{PLATFORM_ICONS[selectedMeeting.platform]}</span>
                <h3 className="text-lg font-semibold">{selectedMeeting.title}</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded ${getStatusColor(selectedMeeting.status)}`}>{selectedMeeting.status}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)] mb-3">{selectedMeeting.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary,#94a3b8)] mb-3">
                <span>📅 {selectedMeeting.date}</span>
                <span>⏰ {selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
                <span>🌐 {selectedMeeting.platform}</span>
                {selectedMeeting.isRecurring && <span>🔁 {selectedMeeting.recurringPattern}</span>}
              </div>
              <div className="flex items-center gap-2 mb-4">
                {selectedMeeting.status === 'scheduled' && (
                  <button onClick={() => joinMeeting(selectedMeeting)}
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium">🎥 Join Meeting</button>
                )}
                <button className="px-2 py-1 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">🔗 Copy Link</button>
                <button className="px-2 py-1 rounded text-[10px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">✉ Send Invite</button>
                {selectedMeeting.status === 'scheduled' && (
                  <button onClick={() => cancelMeeting(selectedMeeting.id)}
                    className="px-2 py-1 rounded text-[10px] bg-red-600/20 hover:bg-red-600/30 text-red-400">Cancel</button>
                )}
              </div>
            </div>

            {/* Meeting Link */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)]">
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-1">🔗 Meeting Link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-blue-400 flex-1">{selectedMeeting.meetingLink}</code>
                <button className="px-2 py-1 rounded text-[9px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400">Copy</button>
              </div>
            </div>

            {/* Agenda */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)]">
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">📋 Agenda</p>
              {selectedMeeting.agenda.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{i + 1}.</span>
                  <span className="text-xs">{item}</span>
                </div>
              ))}
            </div>

            {/* Participants */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)]">
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">👥 Participants ({selectedMeeting.participants.length})</p>
              {selectedMeeting.participants.map(p => (
                <div key={p.id} className="flex items-center gap-2 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">{p.avatar}</div>
                  <div className="flex-1">
                    <span className="text-xs">{p.name}</span>
                    <span className="text-[9px] text-[var(--text-secondary,#94a3b8)] ml-1">({p.role})</span>
                  </div>
                  <span className={`text-[9px] ${getRsvpColor(p.status)}`}>{p.status}</span>
                  {p.isOnline && <span className="w-2 h-2 rounded-full bg-green-400" />}
                </div>
              ))}
            </div>

            {/* Recording */}
            {selectedMeeting.recording && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)]">
                <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-1">🎥 Recording</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400">{selectedMeeting.recording}</span>
                  <button className="px-2 py-0.5 rounded text-[9px] bg-blue-600/20 text-blue-400">Play</button>
                  <button className="px-2 py-0.5 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)]">Download</button>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)]">
              <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">📝 Notes</p>
              <textarea placeholder="Add meeting notes..." rows={4}
                className="w-full bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] rounded px-3 py-2 text-xs resize-none outline-none"
                defaultValue={selectedMeeting.notes} />
            </div>

            {/* AI Actions */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20">
              <p className="text-[10px] font-semibold text-purple-400 mb-2">✨ AI Meeting Actions</p>
              <div className="flex flex-wrap gap-1.5">
                <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Generate MoM</button>
                <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Extract Action Items</button>
                <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Summarize</button>
                <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Send Follow-up Email</button>
                <button className="px-2 py-1 rounded text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">Create Tasks</button>
              </div>
            </div>

            {/* Integration Actions */}
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-500/20">
              <p className="text-[10px] font-semibold text-blue-400 mb-2">🔗 Integrations</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => { if (selectedTranscript) { selectTranscript(selectedTranscript.id); } setShowShareModal(true); }}
                  className="px-2 py-1 rounded text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-300">📤 Share Notes</button>
                <button onClick={() => { if (selectedTranscript) { selectTranscript(selectedTranscript.id); } setShowExportModal(true); }}
                  className="px-2 py-1 rounded text-[10px] bg-green-600/20 hover:bg-green-600/30 text-green-300">📥 Export (Notion/Docs)</button>
                <button onClick={() => { if (selectedTranscript) { selectTranscript(selectedTranscript.id); } setShowSlackModal(true); }}
                  className="px-2 py-1 rounded text-[10px] bg-green-600/20 hover:bg-green-600/30 text-green-300">💬 Post to Slack</button>
                <button onClick={() => setActiveIntegrationPanel(activeIntegrationPanel === 'comments' ? null : 'comments')}
                  className="px-2 py-1 rounded text-[10px] bg-orange-600/20 hover:bg-orange-600/30 text-orange-300">💬 Comments</button>
                <button onClick={() => setActiveIntegrationPanel('askfred')}
                  className="px-2 py-1 rounded text-[10px] bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300">✨ Ask Fred</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== VIDEO CALL UI ===== */}
        {showCallUI && selectedMeeting && (
          <div className="flex-1 flex bg-[#0a0a0a] overflow-hidden">
            {/* Main call area */}
            <div className="flex-1 flex flex-col">
              {/* Recording / sharing status bar */}
              {(callState.recording || callState.sharing) && (
                <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1a1a1a] border-b border-gray-800">
                  {callState.recording && (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full bg-red-500 ${callState.recordingPaused ? '' : 'animate-pulse'}`} />
                      <span className="text-red-400 text-[10px] font-semibold">
                        {callState.recordingPaused ? 'PAUSED' : 'REC'} {formatRecordingTime(recordingSeconds)}
                      </span>
                      <button onClick={() => setCallState(s => ({ ...s, recordingPaused: !s.recordingPaused }))}
                        className="px-1.5 py-0.5 rounded text-[8px] bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        {callState.recordingPaused ? '▶ Resume' : '⏸ Pause'}
                      </button>
                    </div>
                  )}
                  {callState.sharing && (
                    <div className="flex items-center gap-1.5 text-blue-400 text-[10px]">
                      <span>💻</span>
                      <span>Sharing: {shareTarget === 'screen' ? 'Entire Screen' : shareTarget === 'window' ? 'Window' : shareTarget === 'file' ? 'File' : 'Screen'}</span>
                      <button onClick={() => { setCallState(s => ({ ...s, sharing: false })); setShareTarget(null); }}
                        className="px-1.5 py-0.5 rounded text-[8px] bg-blue-900/40 hover:bg-blue-900/60">Stop</button>
                    </div>
                  )}
                </div>
              )}
              {/* Video area */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4">
                    {selectedMeeting.host.avatar}
                  </div>
                  <p className="text-white text-sm font-medium">{selectedMeeting.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{selectedMeeting.participants.length} participants</p>
                </div>
                {/* Participant thumbnails */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {selectedMeeting.participants.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-600 flex flex-col items-center justify-center gap-0.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{p.avatar}</div>
                      <span className="text-[7px] text-gray-400">{p.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                {callState.handRaised && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs">✋ Hand Raised</div>
                )}
                {/* Screen share options popup */}
                {showShareOptions && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-4 w-72 z-20">
                    <p className="text-xs font-semibold text-white mb-3">Choose what to share</p>
                    {([
                      { key: 'screen', icon: '🖥️', label: 'Entire Screen', desc: 'Share everything on your display' },
                      { key: 'window', icon: '🪟', label: 'Application Window', desc: 'Share a specific app window' },
                      { key: 'file', icon: '📄', label: 'File Only', desc: 'Select a file from file manager' },
                    ] as { key: ScreenShareTarget; icon: string; label: string; desc: string }[]).map(opt => (
                      <button key={opt.key as string} onClick={() => startScreenShare(opt.key)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left mb-1 transition-colors">
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <div className="text-xs font-medium text-white">{opt.label}</div>
                          <div className="text-[9px] text-gray-400">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                    <button onClick={() => setShowShareOptions(false)}
                      className="w-full mt-2 py-1 text-[10px] text-gray-500 hover:text-gray-300">Cancel</button>
                  </div>
                )}
              </div>
              {/* Call controls */}
              <div className="flex items-center justify-center gap-2 py-3 bg-[#111]">
                <button onClick={() => setCallState(s => ({ ...s, muted: !s.muted }))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.muted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                  {callState.muted ? '🔇' : '🎙'}
                </button>
                <button onClick={() => setCallState(s => ({ ...s, videoOff: !s.videoOff }))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.videoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                  {callState.videoOff ? '📷' : '🎥'}
                </button>
                {/* Screen share button */}
                <div className="relative">
                  <button onClick={() => callState.sharing ? (setCallState(s => ({ ...s, sharing: false })), setShareTarget(null)) : setShowShareOptions(!showShareOptions)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.sharing ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                    💻
                  </button>
                </div>
                {/* Recording with pause */}
                <div className="flex items-center gap-1">
                  <button onClick={() => {
                    if (callState.recording) {
                      setCallState(s => ({ ...s, recording: false, recordingPaused: false }));
                      setRecordingSeconds(0);
                    } else {
                      setCallState(s => ({ ...s, recording: true, recordingPaused: false }));
                    }
                  }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.recording ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                    ⏺
                  </button>
                  {callState.recording && (
                    <button onClick={() => setCallState(s => ({ ...s, recordingPaused: !s.recordingPaused }))}
                      className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-xs">
                      {callState.recordingPaused ? '▶' : '⏸'}
                    </button>
                  )}
                </div>
                <button onClick={() => setCallState(s => ({ ...s, handRaised: !s.handRaised }))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.handRaised ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                  ✋
                </button>
                <button onClick={() => setShowTranscript(!showTranscript)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${showTranscript ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                  title="Live Transcript">
                  📝
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center text-sm">😀</button>
                <button className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center text-sm">💬</button>
                <button onClick={handleEndMeeting}
                  className="px-4 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs font-semibold gap-1">
                  📴 End
                </button>
              </div>
            </div>

            {/* ===== TRANSCRIPT PANEL ===== */}
            {showTranscript && (
              <div className="w-72 border-l border-gray-800 bg-[#0f0f0f] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-white">Live Transcript</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <select value={transcriptLang} onChange={e => setTranscriptLang(e.target.value as typeof transcriptLang)}
                      className="text-[8px] bg-gray-800 text-gray-300 rounded px-1 py-0.5 border border-gray-700 outline-none">
                      <option value="auto">Auto-Detect</option>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="te">Telugu</option>
                      <option value="hinglish">Hinglish</option>
                      <option value="tinglish">Tinglish</option>
                    </select>
                    <button onClick={() => setShowTranscript(false)} className="text-gray-500 hover:text-white text-xs ml-1">✕</button>
                  </div>
                </div>
                {/* Lang info */}
                <div className="px-3 py-1.5 border-b border-gray-800">
                  <p className="text-[8px] text-gray-500">
                    {transcriptLang === 'auto'
                      ? 'Auto-detecting: EN, HI, TE, Hinglish, Tinglish'
                      : `Transcribing in: ${LANG_LABELS[transcriptLang]?.label}`}
                  </p>
                </div>
                {/* Transcript lines */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
                  {transcript.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">Transcript will appear here…</div>
                  )}
                  {transcript.map(entry => (
                    <div key={entry.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[7px] font-bold text-white">{entry.avatar}</div>
                        <span className="text-[9px] font-medium text-gray-300">{entry.speaker}</span>
                        <span className="text-[7px] text-gray-600">{entry.timestamp}</span>
                        <span className={`text-[7px] px-1 rounded ${LANG_LABELS[entry.language]?.color}`}>
                          {LANG_LABELS[entry.language]?.label}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400 pl-5 leading-relaxed">{entry.text}</p>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
                {/* Footer */}
                <div className="px-3 py-2 border-t border-gray-800 flex gap-1">
                  <button className="flex-1 py-1 text-[8px] rounded bg-gray-800 hover:bg-gray-700 text-gray-300">Copy All</button>
                  <button className="flex-1 py-1 text-[8px] rounded bg-gray-800 hover:bg-gray-700 text-gray-300">Export .txt</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== INTEGRATION PANELS ===== */}
        {activeIntegrationPanel && !showCallUI && (
          <div className="w-80 border-l border-[var(--border-color,#334155)] overflow-hidden flex flex-col">
            {activeIntegrationPanel === 'insights' && (
              <MeetingInsightsDashboard onClose={() => setActiveIntegrationPanel(null)} />
            )}
            {activeIntegrationPanel === 'askfred' && (
              <AskFred onClose={() => setActiveIntegrationPanel(null)} />
            )}
            {activeIntegrationPanel === 'webhooks' && (
              <WebhookConfigPanel onClose={() => setActiveIntegrationPanel(null)} />
            )}
            {activeIntegrationPanel === 'comments' && selectedTranscript && (
              <MeetingComments meetingId={selectedTranscript.id} onClose={() => setActiveIntegrationPanel(null)} />
            )}
            {activeIntegrationPanel === 'comments' && !selectedTranscript && (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center" style={{ color: 'var(--muted-foreground, #94a3b8)' }}>
                <p className="text-xs">Select a meeting to view comments</p>
                <button onClick={() => setActiveIntegrationPanel(null)} className="mt-2 text-[10px] text-blue-400 hover:underline">Close</button>
              </div>
            )}
            {activeIntegrationPanel === 'fireflies' && (
              <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔥</span>
                    <h3 className="text-sm font-semibold">Fireflies Transcripts</h3>
                  </div>
                  <button onClick={() => setActiveIntegrationPanel(null)} className="p-1 rounded hover:bg-white/10 text-xs">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {firefliesTranscripts.map(t => (
                    <div key={t.id}
                      onClick={() => selectTranscript(t.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTranscriptId === t.id ? 'border-purple-500/50 bg-purple-500/10' : 'hover:border-purple-500/30'}`}
                      style={{ borderColor: selectedTranscriptId === t.id ? undefined : 'var(--border, #334155)', backgroundColor: selectedTranscriptId === t.id ? undefined : 'var(--card, #111827)' }}>
                      <div className="text-xs font-medium mb-1">{t.title}</div>
                      <div className="text-[9px] mb-1" style={{ color: 'var(--muted-foreground, #94a3b8)' }}>
                        {new Date(t.date).toLocaleDateString()} · {t.duration} min · {t.meeting_attendees.length} attendees
                      </div>
                      <div className="text-[10px] line-clamp-2" style={{ color: 'var(--muted-foreground, #94a3b8)' }}>
                        {t.summary.overview}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.summary.keywords.slice(0, 3).map(kw => (
                          <span key={kw} className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{kw}</span>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); selectTranscript(t.id); setShowExportModal(true); }}
                          className="px-1.5 py-0.5 rounded text-[8px] bg-green-600/20 text-green-400 hover:bg-green-600/30">Export</button>
                        <button onClick={(e) => { e.stopPropagation(); selectTranscript(t.id); setShowShareModal(true); }}
                          className="px-1.5 py-0.5 rounded text-[8px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30">Share</button>
                        <button onClick={(e) => { e.stopPropagation(); selectTranscript(t.id); setShowSlackModal(true); }}
                          className="px-1.5 py-0.5 rounded text-[8px] bg-green-600/20 text-green-400 hover:bg-green-600/30">Slack</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SMART ROOMS PANEL ===== */}
        {showRooms && !showCallUI && (
          <div className="w-72 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#111827)] overflow-y-auto flex flex-col">
            <div className="px-3 py-2 border-b border-[var(--border-color,#334155)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">🏢 Smart Room Booking</p>
                <button onClick={() => setShowRooms(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-xs">✕</button>
              </div>
              {/* Filters */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--text-secondary,#94a3b8)] w-16">Capacity ≥</span>
                  <select value={roomFilter.minCapacity} onChange={e => setRoomFilter(f => ({ ...f, minCapacity: Number(e.target.value) }))}
                    className="flex-1 px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-[9px] outline-none">
                    <option value={0}>Any</option>
                    <option value={5}>5+</option>
                    <option value={10}>10+</option>
                    <option value={20}>20+</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--text-secondary,#94a3b8)] w-16">Equipment</span>
                  <select value={roomFilter.feature} onChange={e => setRoomFilter(f => ({ ...f, feature: e.target.value }))}
                    className="flex-1 px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-[9px] outline-none">
                    <option value="all">All</option>
                    <option value="Projector">Projector</option>
                    <option value="Video">Video Conf</option>
                    <option value="Whiteboard">Whiteboard</option>
                    <option value="Recording">Recording</option>
                  </select>
                </div>
              </div>
              {/* Auto-suggest */}
              <div className="mt-2 p-2 rounded bg-blue-900/20 border border-blue-500/20 text-[9px] text-blue-300">
                ✨ <span className="font-semibold">AI Suggestion:</span> Himalaya (3F East) fits your 4-person meeting with video conf
              </div>
            </div>
            {/* Room list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-1">{filteredRooms.length} rooms found</p>
              {filteredRooms.map(room => (
                <div key={room.id}
                  className={`p-3 rounded-lg border transition-colors ${room.available ? 'border-green-500/30 bg-green-900/10 hover:border-green-500/50' : 'border-red-500/30 bg-red-900/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{room.name}</span>
                    <span className={`text-[7px] px-1 py-0.5 rounded font-medium ${room.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {room.available ? '✓ Available' : '✗ Busy'}
                    </span>
                  </div>
                  <div className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-1">
                    📍 {room.floor}, {room.location}
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] text-[var(--text-secondary,#94a3b8)]">👥 {room.capacity} people</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {room.features.map(f => (
                      <span key={f} className="text-[7px] px-1 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-[var(--text-secondary,#94a3b8)]">{f}</span>
                    ))}
                  </div>
                  {!room.available && room.nextAvailableAt && (
                    <p className="text-[8px] text-yellow-400 mb-1.5">Next free at {room.nextAvailableAt}</p>
                  )}
                  {room.available ? (
                    <button className="w-full py-1 rounded text-[9px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium transition-colors">
                      📅 Book Now
                    </button>
                  ) : (
                    <button className="w-full py-1 rounded text-[9px] bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)] hover:bg-[var(--bg-hover,#334155)]">
                      ⏰ Schedule
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== AI MEETING SUMMARY MODAL ===== */}
      {showAISummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[560px] max-h-[85vh] overflow-y-auto bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)] rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color,#334155)] sticky top-0 bg-[var(--bg-secondary,#111827)]">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h3 className="text-sm font-semibold">AI Meeting Summary</h3>
              </div>
              <button onClick={() => setShowAISummary(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-xs">✕</button>
            </div>
            {summaryLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-[var(--text-secondary,#94a3b8)]">Generating AI summary…</p>
              </div>
            ) : aiSummary ? (
              <div className="p-5 space-y-4">
                {/* Header stats */}
                <div className="flex gap-3">
                  <div className="flex-1 p-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-center">
                    <div className="text-sm font-bold text-blue-400">{aiSummary.duration}</div>
                    <div className="text-[8px] text-[var(--text-secondary,#94a3b8)]">Duration</div>
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-center">
                    <div className="text-sm font-bold text-green-400">{aiSummary.actionItems.length}</div>
                    <div className="text-[8px] text-[var(--text-secondary,#94a3b8)]">Action Items</div>
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-center">
                    <div className="text-sm font-bold text-purple-400 capitalize">{aiSummary.sentiment}</div>
                    <div className="text-[8px] text-[var(--text-secondary,#94a3b8)]">Sentiment</div>
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-center">
                    <div className="text-sm font-bold text-yellow-400">{aiSummary.decisions.length}</div>
                    <div className="text-[8px] text-[var(--text-secondary,#94a3b8)]">Decisions</div>
                  </div>
                </div>
                {/* Key Points */}
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">📌 Key Points</p>
                  {aiSummary.keyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="text-blue-400 text-[9px] mt-0.5">•</span>
                      <span className="text-[10px]">{kp}</span>
                    </div>
                  ))}
                </div>
                {/* Decisions */}
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">⚡ Key Decisions</p>
                  {aiSummary.decisions.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="text-green-400 text-[9px] mt-0.5">✓</span>
                      <span className="text-[10px]">{d}</span>
                    </div>
                  ))}
                </div>
                {/* Action Items */}
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">✅ Action Items</p>
                  {aiSummary.actionItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 border-b border-[var(--border-color,#334155)] last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[10px] flex-1">{item.task}</span>
                      <span className="text-[8px] text-purple-400 font-medium">{item.assignee.split(' ')[0]}</span>
                      <span className="text-[8px] text-yellow-400">{item.due}</span>
                    </div>
                  ))}
                </div>
                {/* Topics */}
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">💬 Discussion Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSummary.topics.map((t, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300">{t}</span>
                    ))}
                  </div>
                </div>
                {/* Follow-ups */}
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] mb-2">🔄 Follow-ups</p>
                  {aiSummary.followUps.map((fu, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="text-yellow-400 text-[9px]">→</span>
                      <span className="text-[10px]">{fu}</span>
                    </div>
                  ))}
                </div>
                {/* Sentiment */}
                <div className={`p-2 rounded-lg border text-center text-[9px] font-medium ${
                  aiSummary.sentiment === 'positive' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                  aiSummary.sentiment === 'tense' ? 'bg-red-900/20 border-red-500/30 text-red-400' :
                  'bg-blue-900/20 border-blue-500/30 text-blue-400'
                }`}>
                  Sentiment Analysis: {aiSummary.sentiment.charAt(0).toUpperCase() + aiSummary.sentiment.slice(1)} 😊
                </div>
              </div>
            ) : null}
            <div className="flex gap-2 px-5 pb-4">
              <button className="flex-1 py-2 rounded-lg text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300">📧 Send to Team</button>
              <button className="flex-1 py-2 rounded-lg text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-300">📋 Create Tasks</button>
              <button onClick={() => setShowAISummary(false)} className="flex-1 py-2 rounded-lg text-[10px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SCHEDULE NEW MEETING MODAL ===== */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[560px] max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)] rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">➕ Schedule New Meeting</h3>
                <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mt-0.5">Set up a meeting across platforms with auto-generated credentials</p>
              </div>
              <button onClick={() => setShowSchedule(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <input value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                placeholder="Meeting title *" className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs outline-none" />
              <textarea value={newMeeting.description} onChange={e => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Description / Agenda" rows={2} className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs resize-none outline-none" />

              {/* Date & Time row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-[var(--text-secondary,#94a3b8)] block mb-1">Date</label>
                  <input type="date" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-[var(--text-secondary,#94a3b8)] block mb-1">Start Time</label>
                  <input type="time" value={newMeeting.startTime} onChange={e => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-[var(--text-secondary,#94a3b8)] block mb-1">End Time</label>
                  <input type="time" value={newMeeting.endTime} onChange={e => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                </div>
              </div>

              {/* Platform & Type */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-[var(--text-secondary,#94a3b8)] block mb-1">External Platform</label>
                  <select value={newMeeting.platform} onChange={e => setNewMeeting({ ...newMeeting, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                    <option value="vidyalaya">🟣 Vidyalaya Meet</option>
                    <option value="teams">🟦 Microsoft Teams</option>
                    <option value="jiomeet">🔷 Jio Meet</option>
                    <option value="zoom">🔵 Zoom</option>
                    <option value="meet">🟢 Google Meet</option>
                    <option value="webex">🟡 Cisco Webex</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-secondary,#94a3b8)] block mb-1">Meeting Type</label>
                  <select value={newMeeting.type} onChange={e => setNewMeeting({ ...newMeeting, type: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                    <option value="video">📹 Video Call</option>
                    <option value="audio">🎙 Audio Only</option>
                    <option value="in-person">🏢 In-Person</option>
                  </select>
                </div>
              </div>

              {/* Conference Room */}
              <div>
                <label className="text-[9px] text-[var(--text-secondary,#94a3b8)] block mb-1">Conference Room (optional)</label>
                <select value={newMeeting.roomId} onChange={e => setNewMeeting({ ...newMeeting, roomId: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                  <option value="">No physical room</option>
                  {MEETING_ROOMS.map(r => (
                    <option key={r.id} value={r.id} disabled={!r.available}>
                      {r.name} — {r.floor}, {r.location} ({r.capacity} ppl){!r.available ? ` [Busy until ${r.nextAvailableAt}]` : ' ✓'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-generated Meeting ID & Password */}
              <div className="p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-blue-400">Auto-Generated Credentials</p>
                  <button onClick={() => setNewMeeting(p => ({ ...p, meetingId: `vid-meet-${Math.random().toString(36).substr(2, 5)}`, password: Math.random().toString(36).substr(2, 8).toUpperCase() }))}
                    className="text-[9px] text-[var(--text-secondary,#94a3b8)] hover:text-white px-1.5 py-0.5 rounded border border-[var(--border-color,#334155)] hover:border-blue-500/50">
                    ↺ Regenerate
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-1">Meeting ID</p>
                    <code className="text-[11px] text-blue-400 font-mono">{newMeeting.meetingId}</code>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-1">Password</p>
                    <code className="text-[11px] text-green-400 font-mono">{newMeeting.password}</code>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border-color,#334155)]">
                  <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-0.5">Meeting Link</p>
                  <code className="text-[10px] text-[var(--text-secondary,#94a3b8)]">meet.vidyalaya.dev/{newMeeting.meetingId}</code>
                </div>
              </div>

              {/* Recurring + Calendar Invite */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newMeeting.isRecurring}
                      onChange={e => setNewMeeting({ ...newMeeting, isRecurring: e.target.checked })} className="w-3 h-3 rounded" />
                    <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Recurring meeting</span>
                  </label>
                  {newMeeting.isRecurring && (
                    <select value={newMeeting.recurringType} onChange={e => setNewMeeting({ ...newMeeting, recurringType: e.target.value })}
                      className="flex-1 px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                      <option value="daily">Every day</option>
                      <option value="weekdays">Every weekday (Mon–Fri)</option>
                      <option value="weekly">Every week</option>
                      <option value="biweekly">Every 2 weeks</option>
                      <option value="monthly">Every month</option>
                      <option value="quarterly">Every quarter</option>
                    </select>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newMeeting.sendCalendarInvite}
                    onChange={e => setNewMeeting({ ...newMeeting, sendCalendarInvite: e.target.checked })} className="w-3 h-3 rounded" />
                  <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Send calendar invite to all participants</span>
                  {newMeeting.sendCalendarInvite && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">📧 Email invite will be sent</span>}
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowSchedule(false)} className="px-3 py-1.5 rounded text-xs bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
              <button
                onClick={() => {
                  if (!newMeeting.title) return;
                  const meeting: Meeting = {
                    id: `m${Date.now()}`, title: newMeeting.title, description: newMeeting.description,
                    date: newMeeting.date || '2024-03-25', startTime: newMeeting.startTime || '10:00', endTime: newMeeting.endTime || '11:00',
                    type: newMeeting.type as Meeting['type'], status: 'scheduled',
                    host: { id: 'p1', name: 'Ganesh Gowri', email: 'ganesh@vidyalaya.dev', avatar: 'G', role: 'host', status: 'accepted', isOnline: true },
                    participants: [], meetingLink: `meet.vidyalaya.dev/${newMeeting.meetingId}`,
                    platform: (newMeeting.platform === 'jiomeet' ? 'vidyalaya' : newMeeting.platform) as Meeting['platform'],
                    isRecurring: newMeeting.isRecurring,
                    recurringPattern: newMeeting.isRecurring ? { daily: 'Every day', weekdays: 'Every weekday', weekly: 'Every week', biweekly: 'Every 2 weeks', monthly: 'Every month', quarterly: 'Every quarter' }[newMeeting.recurringType] || 'Weekly' : undefined,
                    agenda: newMeeting.agenda ? newMeeting.agenda.split('\n').filter(Boolean) : [],
                    notes: '', tags: [], reminders: [15],
                  };
                  setMeetings(prev => [...prev, meeting]);
                  setShowSchedule(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== SHARE MODAL ===== */}
      {showShareModal && selectedTranscript && (
        <MeetingShareModal meeting={selectedTranscript} onClose={() => setShowShareModal(false)} />
      )}

      {/* ===== EXPORT MODAL ===== */}
      {showExportModal && selectedTranscript && (
        <MeetingExportModal meeting={selectedTranscript} onClose={() => setShowExportModal(false)} />
      )}

      {/* ===== SLACK MODAL ===== */}
      {showSlackModal && (
        <SlackIntegration meeting={selectedTranscript} onClose={() => setShowSlackModal(false)} />
      )}
    </div>
  );
}
