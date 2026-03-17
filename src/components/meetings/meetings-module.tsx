'use client';

import React, { useState, useCallback, useMemo } from 'react';

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
}

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
  🟣  agenda: ['Yesterday updates', 'Today plans', 'Blockers'], notes: 'Discussed deployment timeline. All on track.',
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
  { id: 'r1', name: 'Himalaya', capacity: 10, features: ['Projector', 'Whiteboard', 'Video'], available: true },
  { id: 'r2', name: 'Ganges', capacity: 6, features: ['TV', 'Whiteboard'], available: true },
  { id: 'r3', name: 'Lotus', capacity: 20, features: ['Projector', 'Audio', 'Video', 'Recording'], available: false },
  { id: 'r4', name: 'Bodhi', capacity: 4, features: ['TV'], available: true },
];

const PLATFORM_ICONS: Record<string, string> = {
  vidyalaya: '🟣', teams: '🟦', zoom: '🔵', meet: '🟢', webex: '🟡',
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
  const [callState, setCallState] = useState({ muted: false, videoOff: false, sharing: false, recording: false, handRaised: false });

  const [newMeeting, setNewMeeting] = useState({
    title: '', description: '', date: '', startTime: '', endTime: '',
    platform: 'vidyalaya' as string, type: 'video' as string, isRecurring: false,
  });

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
        {/* Meeting List */}
        <div className={`${selectedMeeting && !showCallUI ? 'w-96' : 'flex-1'} border-r border-[var(--border-color,#334155)] overflow-y-auto`}>
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
          </div>
        )}

        {/* ===== VIDEO CALL UI ===== */}
        {showCallUI && selectedMeeting && (
          <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            {/* Video area */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4">
                  {selectedMeeting.host.avatar}
                </div>
                <p className="text-white text-sm font-medium">{selectedMeeting.title}</p>
                <p className="text-gray-400 text-xs mt-1">{selectedMeeting.participants.length} participants</p>
                {callState.recording && <p className="text-red-400 text-[10px] mt-2 animate-pulse">● Recording</p>}
              </div>
              {/* Participant thumbnails */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {selectedMeeting.participants.slice(0, 3).map((p, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{p.avatar}</div>
                  </div>
                ))}
              </div>
              {/* Raise hand indicator */}
              {callState.handRaised && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs">✋ Hand Raised</div>
              )}
            </div>
            {/* Call controls */}
            <div className="flex items-center justify-center gap-3 py-4 bg-[#111]">
              <button onClick={() => setCallState(s => ({ ...s, muted: !s.muted }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.muted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                {callState.muted ? '🔇' : '🎙'}
              </button>
              <button onClick={() => setCallState(s => ({ ...s, videoOff: !s.videoOff }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.videoOff ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                {callState.videoOff ? '📷' : '🎥'}
              </button>
              <button onClick={() => setCallState(s => ({ ...s, sharing: !s.sharing }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.sharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                💻
              </button>
              <button onClick={() => setCallState(s => ({ ...s, recording: !s.recording }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.recording ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                ⏺
              </button>
              <button onClick={() => setCallState(s => ({ ...s, handRaised: !s.handRaised }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${callState.handRaised ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                ✋
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center text-sm">😀</button>
              <button className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center text-sm">💬</button>
              <button onClick={() => setShowCallUI(false)}
                className="w-12 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-sm">📱</button>
            </div>
          </div>
        )}

        {/* ===== ROOMS PANEL ===== */}
        {showRooms && (
          <div className="w-64 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#111827)] overflow-y-auto p-3">
            <p className="text-xs font-semibold mb-3">🏢 Meeting Rooms</p>
            {MEETING_ROOMS.map(room => (
              <div key={room.id} className={`p-3 mb-2 rounded-lg border ${room.available ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{room.name}</span>
                  <span className={`text-[8px] px-1 py-0.5 rounded ${room.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {room.available ? 'Available' : 'Occupied'}
                  </span>
                </div>
                <p className="text-[9px] text-[var(--text-secondary,#94a3b8)]">Capacity: {room.capacity} | {room.features.join(', ')}</p>
                {room.available && <button className="mt-1.5 px-2 py-0.5 rounded text-[9px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30">Book</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== SCHEDULE NEW MEETING MODAL ===== */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[480px] bg-[var(--bg-secondary,#111827)] border border-[var(--border-color,#334155)] rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">➕ Schedule New Meeting</h3>
              <button onClick={() => setShowSchedule(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <input value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                placeholder="Meeting title" className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs outline-none" />
              <textarea value={newMeeting.description} onChange={e => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Description" rows={2} className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs resize-none outline-none" />
              <div className="flex gap-2">
                <input type="date" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className="flex-1 px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                <input type="time" value={newMeeting.startTime} onChange={e => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                  className="flex-1 px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                <input type="time" value={newMeeting.endTime} onChange={e => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                  className="flex-1 px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <div className="flex gap-2">
                <select value={newMeeting.platform} onChange={e => setNewMeeting({ ...newMeeting, platform: e.target.value })}
                  className="flex-1 px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                  <option value="vidyalaya">Vidyalaya Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">MS Teams</option>
                  <option value="meet">Google Meet</option>
                  <option value="webex">Webex</option>
                </select>
                <select value={newMeeting.type} onChange={e => setNewMeeting({ ...newMeeting, type: e.target.value })}
                  className="flex-1 px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Only</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newMeeting.isRecurring}
                  onChange={e => setNewMeeting({ ...newMeeting, isRecurring: e.target.checked })} className="w-3 h-3" />
                <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Recurring meeting</span>
              </div>
              <div className="p-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                <p className="text-[9px] text-[var(--text-secondary,#94a3b8)] mb-1">Meeting Link (auto-generated)</p>
                <code className="text-[10px] text-blue-400">{generateMeetingLink()}</code>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSchedule(false)} className="px-3 py-1.5 rounded text-xs bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
              <button onClick={() => setShowSchedule(false)} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
