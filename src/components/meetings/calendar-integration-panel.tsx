'use client';

import React, { useState } from 'react';
import {
  Calendar, X, Check, Plus, RefreshCw, Link2, Settings,
  ChevronRight, AlertCircle, Clock, Video, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== TYPES ====================
interface CalendarSource {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple' | 'ical';
  email: string;
  connected: boolean;
  syncing: boolean;
  lastSync: string;
  color: string;
  meetingCount: number;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  start: string;
  end: string;
  platform?: string;
  link?: string;
  attendees: number;
  source: string;
  hasConflict?: boolean;
}

// ==================== MOCK DATA ====================
const MOCK_CALENDARS: CalendarSource[] = [
  { id: 'c1', name: 'Work Calendar', type: 'google', email: 'ganesh@vidyalaya.dev', connected: true, syncing: false, lastSync: '2 min ago', color: '#3b82f6', meetingCount: 12 },
  { id: 'c2', name: 'Outlook Work', type: 'outlook', email: 'ganesh@company.com', connected: true, syncing: false, lastSync: '15 min ago', color: '#0078d4', meetingCount: 6 },
  { id: 'c3', name: 'Apple Calendar', type: 'apple', email: 'ganesh@icloud.com', connected: false, syncing: false, lastSync: 'Never', color: '#ef4444', meetingCount: 0 },
  { id: 'c4', name: 'Team Shared', type: 'ical', email: 'team@vidyalaya.dev', connected: true, syncing: true, lastSync: 'Syncing...', color: '#10b981', meetingCount: 4 },
];

const MOCK_UPCOMING: UpcomingMeeting[] = [
  { id: 'um1', title: 'Daily Standup', start: '09:00', end: '09:15', platform: 'zoom', link: 'zoom.us/j/12345', attendees: 8, source: 'Work Calendar' },
  { id: 'um2', title: 'API Review with Raj', start: '10:30', end: '11:00', platform: 'meet', link: 'meet.google.com/abc-defg-hij', attendees: 3, source: 'Work Calendar', hasConflict: true },
  { id: 'um3', title: 'Client Check-in', start: '11:00', end: '11:30', platform: 'teams', link: 'teams.microsoft.com/meet/abc', attendees: 5, source: 'Outlook Work', hasConflict: true },
  { id: 'um4', title: 'Design Review', start: '14:00', end: '14:30', platform: 'vidyalaya', link: 'meet.vidyalaya.dev/design', attendees: 4, source: 'Team Shared' },
  { id: 'um5', title: 'Sprint Retro', start: '16:00', end: '17:00', platform: 'zoom', link: 'zoom.us/j/67890', attendees: 10, source: 'Work Calendar' },
];

const PLATFORM_ICONS: Record<string, string> = {
  zoom: '🔵',
  meet: '🟢',
  teams: '🟣',
  vidyalaya: '🎥',
  webex: '🟠',
};

const CAL_TYPE_ICONS: Record<string, string> = {
  google: '📅',
  outlook: '📧',
  apple: '🍎',
  ical: '📆',
};

// ==================== MAIN COMPONENT ====================
interface CalendarIntegrationPanelProps {
  onClose: () => void;
}

export default function CalendarIntegrationPanel({ onClose }: CalendarIntegrationPanelProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'calendars' | 'settings'>('upcoming');
  const [calendars, setCalendars] = useState(MOCK_CALENDARS);
  const [syncingAll, setSyncingAll] = useState(false);

  const handleConnect = (id: string) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    await new Promise(r => setTimeout(r, 1500));
    setCalendars(prev => prev.map(c => c.connected ? { ...c, lastSync: 'Just now' } : c));
    setSyncingAll(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold">Calendar Integration</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-900/30 text-green-400">
            {calendars.filter(c => c.connected).length} connected
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSyncAll}
            className={cn('p-1.5 rounded hover:bg-white/10 transition-colors', syncingAll && 'animate-spin')}>
            <RefreshCw size={13} className={syncingAll ? 'text-blue-400' : 'text-slate-400'} />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {([
          { id: 'upcoming', label: 'Upcoming', icon: Clock },
          { id: 'calendars', label: 'Calendars', icon: Calendar },
          { id: 'settings', label: 'Settings', icon: Settings },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-[11px] border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}>
            <tab.icon size={11} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* UPCOMING TAB */}
        {activeTab === 'upcoming' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today — March 21</span>
              <button className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                <Plus size={10} />
                Add event
              </button>
            </div>

            {MOCK_UPCOMING.some(m => m.hasConflict) && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                <AlertCircle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-yellow-400">2 scheduling conflicts detected</p>
                  <p className="text-[10px] text-yellow-600">API Review and Client Check-in overlap at 11:00</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {MOCK_UPCOMING.map(meeting => (
                <div key={meeting.id}
                  className={cn(
                    'p-3 rounded-lg border transition-colors hover:border-blue-500/40',
                    meeting.hasConflict ? 'border-yellow-500/30 bg-yellow-900/10' : 'bg-slate-900/50'
                  )}
                  style={{ borderColor: meeting.hasConflict ? undefined : 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-slate-300">
                          {meeting.start} – {meeting.end}
                        </span>
                        {meeting.hasConflict && (
                          <span className="text-[9px] text-yellow-400 bg-yellow-900/30 px-1 rounded">Conflict</span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium truncate">{meeting.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{CAL_TYPE_ICONS[MOCK_CALENDARS.find(c => c.name === meeting.source)?.type || 'ical']} {meeting.source}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-slate-400"><Users size={9} className="inline mr-0.5" />{meeting.attendees}</span>
                      </div>
                    </div>
                    {meeting.link && meeting.platform && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm">{PLATFORM_ICONS[meeting.platform]}</span>
                        <button className="text-[9px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                          <Link2 size={9} />
                          Join
                        </button>
                      </div>
                    )}
                  </div>
                  {meeting.link && (
                    <div className="mt-2 flex items-center gap-1 p-1.5 rounded bg-slate-800/50 text-[10px]">
                      <Video size={10} className="text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400 truncate flex-1">{meeting.link}</span>
                      <button className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 flex-shrink-0">
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CALENDARS TAB */}
        {activeTab === 'calendars' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Connected Calendars</span>
              <button className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                <Plus size={10} />
                Add Calendar
              </button>
            </div>

            <div className="space-y-2">
              {calendars.map(cal => (
                <div key={cal.id} className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${cal.color}20` }}>
                    {CAL_TYPE_ICONS[cal.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-medium truncate">{cal.name}</p>
                      {cal.connected && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-900/30 text-green-400">Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{cal.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-500">
                        {cal.connected ? `${cal.meetingCount} meetings · Synced ${cal.lastSync}` : 'Not connected'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cal.syncing && <RefreshCw size={11} className="text-blue-400 animate-spin" />}
                    <button onClick={() => handleConnect(cal.id)}
                      className={cn(
                        'px-2 py-1 rounded text-[10px] transition-colors',
                        cal.connected
                          ? 'bg-slate-700 text-slate-300 hover:bg-red-900/30 hover:text-red-400'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}>
                      {cal.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg border border-dashed text-center"
              style={{ borderColor: 'var(--border)' }}>
              <button className="flex items-center gap-2 mx-auto text-[11px] text-slate-400 hover:text-slate-200">
                <Plus size={14} />
                Add another calendar source
              </button>
            </div>
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {[
              { label: 'Auto-join meetings', description: 'Automatically join meeting links when a meeting starts', enabled: true },
              { label: 'Meeting reminders', description: 'Send desktop notifications before meetings', enabled: true },
              { label: 'Auto-detect meeting links', description: 'Detect Zoom, Teams, Meet links from calendar events', enabled: true },
              { label: 'Sync recurring meetings', description: 'Include recurring meetings from all connected calendars', enabled: false },
              { label: 'Show meeting prep', description: 'Show agenda and attendees 5 min before meeting', enabled: true },
              { label: 'Block focus time', description: 'Mark time between meetings as focus blocks', enabled: false },
            ].map((setting, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1">
                  <p className="text-[12px] font-medium">{setting.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{setting.description}</p>
                </div>
                <button
                  className={cn(
                    'w-9 h-5 rounded-full transition-colors flex-shrink-0 relative',
                    setting.enabled ? 'bg-blue-600' : 'bg-slate-700'
                  )}>
                  <div className={cn(
                    'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform',
                    setting.enabled ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            ))}

            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Reminder Timing</p>
              <div className="flex gap-2">
                {['5 min', '10 min', '15 min', '30 min'].map(t => (
                  <button key={t}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] border transition-colors',
                      t === '10 min' ? 'border-blue-500 bg-blue-900/30 text-blue-400' : 'text-slate-400 hover:text-slate-200'
                    )}
                    style={{ borderColor: t === '10 min' ? undefined : 'var(--border)' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
