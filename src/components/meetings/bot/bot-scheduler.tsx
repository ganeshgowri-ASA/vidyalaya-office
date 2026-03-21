'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Plus, Trash2, ExternalLink, CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { useMeetingBotStore, ScheduledBotAttendance } from '@/store/meeting-bot-store';
import { parseMeetingUrl, getPlatformInfo } from '@/lib/meeting-url-parser';

const STATUS_CONFIG: Record<ScheduledBotAttendance['status'], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#f59e0b', icon: <Clock size={14} /> },
  joined: { label: 'Joined', color: '#10b981', icon: <Loader2 size={14} className="animate-spin" /> },
  completed: { label: 'Completed', color: '#6366f1', icon: <CheckCircle size={14} /> },
  failed: { label: 'Failed', color: '#ef4444', icon: <AlertCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: '#6b7280', icon: <XCircle size={14} /> },
};

export default function BotScheduler() {
  const { scheduledAttendances, addScheduledAttendance, removeScheduledAttendance, updateAttendanceStatus, botConfig } = useMeetingBotStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const parsedUrl = useMemo(() => parseMeetingUrl(newUrl), [newUrl]);

  const filteredAttendances = useMemo(() => {
    if (filter === 'all') return scheduledAttendances;
    if (filter === 'pending') return scheduledAttendances.filter((a) => a.status === 'pending' || a.status === 'joined');
    return scheduledAttendances.filter((a) => a.status === 'completed' || a.status === 'failed' || a.status === 'cancelled');
  }, [scheduledAttendances, filter]);

  const handleAdd = () => {
    if (!newUrl || !newTitle || !newDate || !newTime) return;
    addScheduledAttendance({
      meetingTitle: newTitle,
      meetingUrl: newUrl,
      platform: parsedUrl.platform,
      scheduledDate: newDate,
      scheduledTime: newTime,
      duration: newDuration,
      botConfigId: botConfig.id,
      status: 'pending',
    });
    setNewUrl('');
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewDuration(60);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Bot Scheduler</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Schedule your bot to auto-join meetings • {scheduledAttendances.filter((a) => a.status === 'pending').length} upcoming
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={14} />
          Schedule Bot
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Schedule New Bot Attendance</h3>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Meeting URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            {newUrl && (
              <div className="mt-1.5 flex items-center gap-2 text-xs" style={{ color: parsedUrl.isValid ? parsedUrl.color : '#ef4444' }}>
                <span>{parsedUrl.icon}</span>
                <span>{parsedUrl.label}</span>
                {parsedUrl.meetingId && <span className="opacity-60">({parsedUrl.meetingId})</span>}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Meeting Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Sprint Planning"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Duration (min)</label>
              <input
                type="number"
                min={15}
                max={480}
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newUrl || !newTitle || !newDate || !newTime || !parsedUrl.isValid}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors"
            style={{
              backgroundColor: filter === f ? 'var(--primary)' : 'var(--muted)',
              color: filter === f ? 'white' : 'var(--muted-foreground)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredAttendances.length === 0 && (
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)' }}>
            <Calendar size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No scheduled attendances</p>
          </div>
        )}

        {filteredAttendances.map((attendance) => {
          const platformInfo = getPlatformInfo(attendance.platform);
          const statusConfig = STATUS_CONFIG[attendance.status];

          return (
            <div
              key={attendance.id}
              className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:opacity-90"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              {/* Platform indicator */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: platformInfo.color + '20', color: platformInfo.color }}
              >
                {platformInfo.icon}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{attendance.meetingTitle}</span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: statusConfig.color + '20', color: statusConfig.color }}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="flex items-center gap-1"><Calendar size={12} />{attendance.scheduledDate}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{attendance.scheduledTime}</span>
                  <span>{attendance.duration}min</span>
                  <span style={{ color: platformInfo.color }}>{platformInfo.label}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {attendance.status === 'pending' && (
                  <button
                    onClick={() => updateAttendanceStatus(attendance.id, 'cancelled')}
                    className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Cancel"
                  >
                    <XCircle size={16} />
                  </button>
                )}
                <a
                  href={attendance.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                  style={{ color: 'var(--muted-foreground)' }}
                  title="Open meeting link"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => removeScheduledAttendance(attendance.id)}
                  className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                  style={{ color: '#ef4444' }}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
