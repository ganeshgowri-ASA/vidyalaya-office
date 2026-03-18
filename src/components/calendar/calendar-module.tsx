'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Users, Clock,
  Eye, EyeOff, Settings, CheckSquare, Grid3X3, List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== TYPES ====================
interface CalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  color: string;
  calendarId: string;
  description?: string;
  location?: string;
  isAllDay?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  visible: boolean;
}

interface OtherCalendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  source: 'google' | 'outlook' | 'ical' | 'team' | 'project';
}

// ==================== MOCK DATA ====================
const TEAM_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'Ganesh Gowri', email: 'ganesh@vidyalaya.dev', avatar: 'G', color: '#6366f1', visible: true },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@vidyalaya.dev', avatar: 'P', color: '#22c55e', visible: true },
  { id: 'u3', name: 'Raj Kumar', email: 'raj@vidyalaya.dev', avatar: 'R', color: '#f59e0b', visible: false },
  { id: 'u4', name: 'Sarah Chen', email: 'sarah@vidyalaya.dev', avatar: 'S', color: '#ec4899', visible: true },
  { id: 'u5', name: 'Mike Johnson', email: 'mike@company.com', avatar: 'M', color: '#14b8a6', visible: false },
  { id: 'u6', name: 'Aisha Patel', email: 'aisha@vidyalaya.dev', avatar: 'A', color: '#f97316', visible: true },
];

const OTHER_CALENDARS: OtherCalendar[] = [
  { id: 'c1', name: 'My Calendar', color: '#6366f1', visible: true, source: 'team' },
  { id: 'c2', name: 'Team Meetings', color: '#22c55e', visible: true, source: 'team' },
  { id: 'c3', name: 'Product Sprints', color: '#f59e0b', visible: true, source: 'project' },
  { id: 'c4', name: 'Google Calendar', color: '#ea4335', visible: false, source: 'google' },
  { id: 'c5', name: 'Outlook', color: '#0078d4', visible: false, source: 'outlook' },
  { id: 'c6', name: 'Public Holidays', color: '#8b5cf6', visible: true, source: 'ical' },
];

const TODAY = '2026-03-18';

const MOCK_EVENTS: CalEvent[] = [
  { id: 'e1', title: 'Sprint Planning', date: '2026-03-18', startTime: '10:00', endTime: '11:00', color: '#6366f1', calendarId: 'c2' },
  { id: 'e2', title: 'Client Demo', date: '2026-03-18', startTime: '14:00', endTime: '15:30', color: '#22c55e', calendarId: 'c2' },
  { id: 'e3', title: 'Design Review', date: '2026-03-19', startTime: '11:00', endTime: '12:00', color: '#f59e0b', calendarId: 'c3' },
  { id: 'e4', title: 'Weekly Standup', date: '2026-03-17', startTime: '09:00', endTime: '09:30', color: '#6366f1', calendarId: 'c2', description: 'Daily sync' },
  { id: 'e5', title: 'Architecture Review', date: '2026-03-20', startTime: '15:00', endTime: '16:30', color: '#ec4899', calendarId: 'c3' },
  { id: 'e6', title: 'Board Meeting', date: '2026-03-21', startTime: '09:00', endTime: '10:30', color: '#f97316', calendarId: 'c1', isAllDay: false },
  { id: 'e7', title: 'Team Lunch', date: '2026-03-19', startTime: '13:00', endTime: '14:00', color: '#14b8a6', calendarId: 'c1', location: 'Cafeteria' },
  { id: 'e8', title: 'Q1 Review', date: '2026-03-24', startTime: '10:00', endTime: '12:00', color: '#8b5cf6', calendarId: 'c3' },
  { id: 'e9', title: 'Holi Holiday', date: '2026-03-14', startTime: '00:00', endTime: '23:59', color: '#ec4899', calendarId: 'c6', isAllDay: true },
  { id: 'e10', title: 'Vendor Call', date: '2026-03-22', startTime: '16:00', endTime: '17:00', color: '#22c55e', calendarId: 'c2' },
  { id: 'e11', title: 'Monthly 1:1', date: '2026-03-25', startTime: '11:00', endTime: '11:30', color: '#6366f1', calendarId: 'c1' },
  { id: 'e12', title: 'Product Demo', date: '2026-03-26', startTime: '14:00', endTime: '15:00', color: '#f59e0b', calendarId: 'c3' },
  // Week view events for today
  { id: 'e13', title: 'Morning Sync', date: '2026-03-16', startTime: '09:00', endTime: '09:30', color: '#6366f1', calendarId: 'c2' },
  { id: 'e14', title: 'Project Kickoff', date: '2026-03-17', startTime: '14:00', endTime: '15:30', color: '#22c55e', calendarId: 'c3' },
];

// Team availability (free/busy blocks per member per day)
const BUSY_BLOCKS: Record<string, Record<string, { start: number; end: number }[]>> = {
  u1: {
    '2026-03-18': [{ start: 10, end: 11 }, { start: 14, end: 15.5 }],
    '2026-03-19': [{ start: 9, end: 9.5 }, { start: 13, end: 14 }],
    '2026-03-20': [{ start: 15, end: 16.5 }],
  },
  u2: {
    '2026-03-18': [{ start: 11, end: 12 }, { start: 15, end: 16 }],
    '2026-03-19': [{ start: 10, end: 11.5 }],
    '2026-03-20': [{ start: 9, end: 10 }, { start: 14, end: 15 }],
  },
  u4: {
    '2026-03-18': [{ start: 9, end: 10 }, { start: 13, end: 14.5 }],
    '2026-03-19': [{ start: 11, end: 12 }, { start: 14, end: 15 }],
    '2026-03-20': [{ start: 10, end: 11 }],
  },
  u6: {
    '2026-03-18': [{ start: 10, end: 11 }, { start: 16, end: 17 }],
    '2026-03-19': [{ start: 9, end: 9.5 }, { start: 13.5, end: 15 }],
    '2026-03-20': [{ start: 11, end: 12.5 }],
  },
};

// ==================== HELPERS ====================
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToDecimal(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// ==================== SUB-COMPONENTS ====================

function EventBlock({ event, style, compact }: { event: CalEvent; style?: React.CSSProperties; compact?: boolean }) {
  return (
    <div
      className="rounded px-1 py-0.5 text-white text-[9px] font-medium truncate cursor-pointer hover:opacity-90 select-none"
      style={{ backgroundColor: event.color, ...style }}
      title={`${event.title} ${event.startTime}-${event.endTime}`}
    >
      {!compact && <span className="text-[8px] opacity-80 mr-1">{event.startTime}</span>}
      {event.title}
    </div>
  );
}

interface MonthViewProps {
  year: number;
  month: number;
  events: CalEvent[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

function MonthView({ year, month, events, onSelectDate, selectedDate }: MonthViewProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
        {WEEK_DAYS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase"
            style={{ color: 'var(--foreground)', opacity: 0.5 }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {cells.map((day, idx) => {
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
          const isToday = dateStr === TODAY;
          const isSelected = dateStr === selectedDate;
          const dayEvents = day ? events.filter(e => e.date === dateStr) : [];

          return (
            <div key={idx}
              onClick={() => day && onSelectDate(dateStr)}
              className={cn(
                'border-r border-b p-1 min-h-[80px] cursor-pointer transition-colors overflow-hidden',
                day ? 'hover:bg-white/5' : 'opacity-20',
                isSelected && 'ring-1 ring-inset ring-blue-500/50',
              )}
              style={{ borderColor: 'var(--border)' }}
            >
              {day && (
                <>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium mb-0.5',
                    isToday ? 'bg-blue-600 text-white' : 'text-[var(--foreground)]',
                  )}>{day}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <EventBlock key={e.id} event={e} compact />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] opacity-60 pl-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WeekViewProps {
  weekStart: Date;
  events: CalEvent[];
  onSelectDate: (date: string) => void;
}

function WeekView({ weekStart, events, onSelectDate }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const VISIBLE_HOURS = HOURS.slice(7, 21); // 7am - 8pm

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b" style={{ gridTemplateColumns: '48px repeat(7, 1fr)', borderColor: 'var(--border)' }}>
        <div className="w-12" />
        {days.map((day, i) => {
          const dateStr = formatYMD(day);
          const isToday = dateStr === TODAY;
          return (
            <div key={i} onClick={() => onSelectDate(dateStr)}
              className="py-2 text-center cursor-pointer hover:bg-white/5">
              <div className="text-[9px] uppercase font-medium opacity-50">{WEEK_DAYS[day.getDay()]}</div>
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mx-auto mt-0.5',
                isToday ? 'bg-blue-600 text-white' : ''
              )}>{day.getDate()}</div>
            </div>
          );
        })}
      </div>
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative" style={{ minHeight: `${VISIBLE_HOURS.length * 48}px` }}>
          {/* Hour rows */}
          {VISIBLE_HOURS.map((h) => (
            <div key={h} className="grid border-b" style={{ gridTemplateColumns: '48px repeat(7, 1fr)', borderColor: 'var(--border)', height: 48 }}>
              <div className="text-[9px] opacity-40 text-right pr-2 pt-0.5"
                style={{ color: 'var(--foreground)' }}>{h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}</div>
              {days.map((_, di) => (
                <div key={di} className="border-l relative" style={{ borderColor: 'var(--border)' }} />
              ))}
            </div>
          ))}
          {/* Events overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ paddingLeft: 48, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day, di) => {
              const dateStr = formatYMD(day);
              const dayEvents = events.filter(e => e.date === dateStr && !e.isAllDay);
              return (
                <div key={di} className="relative pointer-events-auto">
                  {dayEvents.map(event => {
                    const startH = timeToDecimal(event.startTime);
                    const endH = timeToDecimal(event.endTime);
                    const top = (startH - 7) * 48;
                    const height = (endH - startH) * 48;
                    if (top < 0 || top > VISIBLE_HOURS.length * 48) return null;
                    return (
                      <div key={event.id}
                        className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-white text-[9px] font-medium cursor-pointer hover:opacity-90 overflow-hidden"
                        style={{ backgroundColor: event.color, top, height: Math.max(height, 18) }}
                        title={`${event.title} ${event.startTime}-${event.endTime}`}
                      >
                        <div>{event.title}</div>
                        <div className="opacity-70">{event.startTime}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayViewProps {
  date: string;
  events: CalEvent[];
}

function DayView({ date, events }: DayViewProps) {
  const dayEvents = events.filter(e => e.date === date && !e.isAllDay);
  const allDayEvents = events.filter(e => e.date === date && e.isAllDay);
  const VISIBLE_HOURS = HOURS.slice(6, 22);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* All-day section */}
      {allDayEvents.length > 0 && (
        <div className="px-12 py-1 border-b flex gap-1 flex-wrap" style={{ borderColor: 'var(--border)' }}>
          <span className="text-[9px] opacity-40 mr-1 self-center">All day</span>
          {allDayEvents.map(e => <EventBlock key={e.id} event={e} compact />)}
        </div>
      )}
      {/* Hourly grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative" style={{ minHeight: `${VISIBLE_HOURS.length * 60}px` }}>
          {VISIBLE_HOURS.map((h) => (
            <div key={h} className="flex border-b" style={{ borderColor: 'var(--border)', height: 60 }}>
              <div className="w-12 text-[9px] opacity-40 text-right pr-2 pt-0.5 shrink-0"
                style={{ color: 'var(--foreground)' }}>
                {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
              </div>
              <div className="flex-1 border-l" style={{ borderColor: 'var(--border)' }} />
            </div>
          ))}
          {/* Events overlay */}
          <div className="absolute inset-0" style={{ paddingLeft: 48 }}>
            {dayEvents.map(event => {
              const startH = timeToDecimal(event.startTime);
              const endH = timeToDecimal(event.endTime);
              const top = (startH - 6) * 60;
              const height = (endH - startH) * 60;
              return (
                <div key={event.id}
                  className="absolute left-1 right-4 rounded px-2 py-1 text-white text-xs font-medium cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: event.color, top, height: Math.max(height, 24) }}
                >
                  <div className="font-semibold text-[11px]">{event.title}</div>
                  <div className="text-[9px] opacity-80">{event.startTime} – {event.endTime}</div>
                  {event.location && <div className="text-[9px] opacity-70">📍 {event.location}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AvailabilityViewProps {
  members: TeamMember[];
  weekStart: Date;
}

function AvailabilityView({ members, weekStart }: AvailabilityViewProps) {
  const visibleMembers = members.filter(m => m.visible);
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + (i + 1)); // Mon-Fri
    return d;
  });
  const SLOTS = Array.from({ length: 20 }, (_, i) => 8 + i * 0.5); // 8am-5:30pm in 30min blocks

  const isBusy = (memberId: string, dateStr: string, slotH: number) => {
    const blocks = BUSY_BLOCKS[memberId]?.[dateStr] || [];
    return blocks.some(b => slotH >= b.start && slotH < b.end);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid sticky top-0 z-10 border-b" style={{ gridTemplateColumns: `140px repeat(${days.length}, 1fr)`, borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <div className="px-3 py-2 text-[10px] font-semibold opacity-50">TEAM MEMBER</div>
          {days.map((d, i) => {
            const dateStr = formatYMD(d);
            const isToday = dateStr === TODAY;
            return (
              <div key={i} className="py-2 text-center">
                <div className="text-[9px] uppercase font-medium opacity-50">{WEEK_DAYS[d.getDay()]}</div>
                <div className={cn('text-xs font-semibold', isToday && 'text-blue-400')}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
        {/* Slots header row */}
        <div className="grid text-[8px] opacity-30 border-b" style={{ gridTemplateColumns: `140px repeat(${days.length}, 1fr)`, borderColor: 'var(--border)' }}>
          <div className="px-3 py-1">Hours →</div>
          {days.map((_, di) => (
            <div key={di} className="flex">
              {SLOTS.map((s, si) => (
                <div key={si} className="flex-1 text-center border-l py-0.5" style={{ borderColor: 'var(--border)' }}>
                  {s % 2 === 0 ? `${s < 12 ? s : s === 12 ? 12 : s - 12}${s < 12 ? 'a' : 'p'}` : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Member rows */}
        {visibleMembers.map(member => (
          <div key={member.id} className="grid border-b hover:bg-white/5 transition-colors"
            style={{ gridTemplateColumns: `140px repeat(${days.length}, 1fr)`, borderColor: 'var(--border)' }}>
            {/* Member info */}
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: member.color }}>{member.avatar}</div>
              <div className="overflow-hidden">
                <div className="text-[10px] font-medium truncate">{member.name.split(' ')[0]}</div>
              </div>
            </div>
            {/* Availability per day */}
            {days.map((day, di) => {
              const dateStr = formatYMD(day);
              return (
                <div key={di} className="flex border-l" style={{ borderColor: 'var(--border)' }}>
                  {SLOTS.map((slot, si) => {
                    const busy = isBusy(member.id, dateStr, slot);
                    return (
                      <div key={si}
                        className={cn('flex-1 border-l h-8', busy ? 'opacity-90' : 'opacity-10')}
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: busy ? member.color : 'transparent',
                        }}
                        title={busy ? `${member.name}: Busy at ${slot}:00` : `${member.name}: Free`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 text-[9px] opacity-50">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-indigo-500 opacity-90" /> Busy</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-white opacity-10" /> Free</span>
        </div>
      </div>
    </div>
  );
}

// ==================== MINI CALENDAR ====================
function MiniCalendar({ year, month, selectedDate, onSelectDate, onMonthChange }:
  { year: number; month: number; selectedDate: string; onSelectDate: (d: string) => void; onMonthChange: (y: number, m: number) => void }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => { const d = new Date(year, month - 1); onMonthChange(d.getFullYear(), d.getMonth()); };
  const next = () => { const d = new Date(year, month + 1); onMonthChange(d.getFullYear(), d.getMonth()); };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} className="p-1 rounded hover:bg-white/10"><ChevronLeft size={12} /></button>
        <span className="text-[11px] font-semibold">{MONTH_NAMES[month]} {year}</span>
        <button onClick={next} className="p-1 rounded hover:bg-white/10"><ChevronRight size={12} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {WEEK_DAYS.map(d => <div key={d} className="text-[8px] text-center opacity-40 py-0.5 font-medium">{d[0]}</div>)}
        {cells.map((day, idx) => {
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
          const isToday = dateStr === TODAY;
          const isSelected = dateStr === selectedDate;
          return (
            <div key={idx} onClick={() => day && onSelectDate(dateStr)}
              className={cn(
                'w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[9px] cursor-pointer transition-colors',
                day ? 'hover:bg-white/10' : 'opacity-0 pointer-events-none',
                isToday && !isSelected && 'text-blue-400 font-bold',
                isSelected && 'bg-blue-600 text-white',
              )}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== TEAM SIDE-BY-SIDE VIEW ====================
function TeamCalendarView({ members, events, date }: { members: TeamMember[]; events: CalEvent[]; date: string }) {
  const visibleMembers = members.filter(m => m.visible);
  const VISIBLE_HOURS = HOURS.slice(7, 20);

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex min-w-max">
        {/* Time column */}
        <div className="w-12 shrink-0">
          <div className="h-12 border-b" style={{ borderColor: 'var(--border)' }} />
          {VISIBLE_HOURS.map(h => (
            <div key={h} className="border-b flex items-start justify-end pr-1 pt-0.5"
              style={{ height: 52, borderColor: 'var(--border)' }}>
              <span className="text-[9px] opacity-40">{h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}</span>
            </div>
          ))}
        </div>
        {/* Member columns */}
        {visibleMembers.map(member => (
          <div key={member.id} className="w-44 shrink-0 border-l" style={{ borderColor: 'var(--border)' }}>
            {/* Header */}
            <div className="h-12 border-b flex items-center gap-2 px-2" style={{ borderColor: 'var(--border)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: member.color }}>{member.avatar}</div>
              <div>
                <div className="text-[10px] font-medium">{member.name.split(' ')[0]}</div>
                <div className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1" />
              </div>
            </div>
            {/* Hour rows */}
            <div className="relative">
              {VISIBLE_HOURS.map(h => (
                <div key={h} className="border-b" style={{ height: 52, borderColor: 'var(--border)' }} />
              ))}
              {/* Events */}
              {events.filter(e => e.date === date).map(event => {
                const startH = timeToDecimal(event.startTime);
                const endH = timeToDecimal(event.endTime);
                const top = (startH - 7) * 52;
                const height = (endH - startH) * 52;
                if (top < 0) return null;
                return (
                  <div key={event.id}
                    className="absolute left-1 right-1 rounded px-1 py-0.5 text-white text-[9px] font-medium truncate cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: member.color, top, height: Math.max(height, 18) }}>
                    {event.title}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN CALENDAR MODULE ====================
type MainView = 'month' | 'week' | 'day' | 'team' | 'availability';

export default function CalendarModule() {
  const todayDate = parseDate(TODAY);
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [mainView, setMainView] = useState<MainView>('month');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [otherCalendars, setOtherCalendars] = useState<OtherCalendar[]>(OTHER_CALENDARS);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');

  const visibleCalIds = useMemo(() => new Set(otherCalendars.filter(c => c.visible).map(c => c.id)), [otherCalendars]);
  const visibleEvents = useMemo(() => MOCK_EVENTS.filter(e => visibleCalIds.has(e.calendarId)), [visibleCalIds]);

  const weekStart = useMemo(() => {
    const d = parseDate(selectedDate);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return start;
  }, [selectedDate]);

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(currentYear, currentMonth + dir);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  const goToday = () => {
    setSelectedDate(TODAY);
    const d = parseDate(TODAY);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  const toggleCalendar = (id: string) => {
    setOtherCalendars(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const toggleMember = (id: string) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
  };

  const displayDate = useMemo(() => {
    if (mainView === 'month') return `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    if (mainView === 'day') {
      const d = parseDate(selectedDate);
      return `${WEEK_DAYS[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    const ws = new Date(weekStart);
    const we = new Date(weekStart); we.setDate(we.getDate() + 6);
    return `${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()} – ${ws.getDate() !== we.getDate() ? we.getDate() : ''} ${ws.getMonth() !== we.getMonth() ? MONTH_NAMES[we.getMonth()] + ' ' : ''}${ws.getFullYear()}`;
  }, [mainView, currentMonth, currentYear, selectedDate, weekStart]);

  const navigateView = (dir: -1 | 1) => {
    if (mainView === 'month') navigateMonth(dir);
    else if (mainView === 'week' || mainView === 'team' || mainView === 'availability') {
      const d = new Date(weekStart); d.setDate(d.getDate() + dir * 7);
      setSelectedDate(formatYMD(d));
    } else {
      const d = parseDate(selectedDate); d.setDate(d.getDate() + dir);
      setSelectedDate(formatYMD(d));
    }
  };

  const VIEW_OPTIONS: { key: MainView; label: string; icon: React.ReactNode }[] = [
    { key: 'day', label: 'Day', icon: <Clock size={13} /> },
    { key: 'week', label: 'Week', icon: <List size={13} /> },
    { key: 'month', label: 'Month', icon: <Grid3X3 size={13} /> },
    { key: 'team', label: 'Team', icon: <Users size={13} /> },
    { key: 'availability', label: 'Availability', icon: <CheckSquare size={13} /> },
  ];

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* ===== LEFT SIDEBAR ===== */}
      <div className="w-56 shrink-0 border-r flex flex-col overflow-y-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
        {/* New Event button */}
        <div className="p-3">
          <button
            onClick={() => setShowNewEvent(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={14} /> New Event
          </button>
        </div>

        {/* Mini Calendar */}
        <MiniCalendar
          year={currentYear}
          month={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={d => { setSelectedDate(d); const p = parseDate(d); setCurrentYear(p.getFullYear()); setCurrentMonth(p.getMonth()); }}
          onMonthChange={(y, m) => { setCurrentYear(y); setCurrentMonth(m); }}
        />

        <div className="px-3 pb-1 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          {/* My Calendars */}
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 mb-2">My Calendars</p>
          {otherCalendars.filter(c => c.source === 'team' || c.source === 'project').map(cal => (
            <div key={cal.id} className="flex items-center gap-2 py-1 cursor-pointer hover:opacity-80"
              onClick={() => toggleCalendar(cal.id)}>
              <div className={cn('w-3 h-3 rounded border-2', cal.visible ? 'border-transparent' : 'border-white/30 bg-transparent')}
                style={{ backgroundColor: cal.visible ? cal.color : 'transparent', borderColor: cal.visible ? cal.color : undefined }} />
              <span className="text-[10px]">{cal.name}</span>
            </div>
          ))}
        </div>

        <div className="px-3 pb-1 pt-3" style={{}}>
          {/* Other Calendars */}
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 mb-2">Other Calendars</p>
          {otherCalendars.filter(c => c.source !== 'team' && c.source !== 'project').map(cal => (
            <div key={cal.id} className="flex items-center gap-2 py-1 cursor-pointer hover:opacity-80"
              onClick={() => toggleCalendar(cal.id)}>
              <div className={cn('w-3 h-3 rounded border-2')}
                style={{ backgroundColor: cal.visible ? cal.color : 'transparent', borderColor: cal.color }} />
              <span className="text-[10px]">{cal.name}</span>
              <span className="text-[8px] opacity-40 ml-auto">{cal.source}</span>
            </div>
          ))}
          <button className="mt-2 text-[9px] text-blue-400 hover:underline flex items-center gap-1">
            <Plus size={10} /> Add other calendar
          </button>
        </div>

        <div className="px-3 pb-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Team Members */}
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-40 mb-2">Team Calendars</p>
          {teamMembers.map(m => (
            <div key={m.id} className="flex items-center gap-2 py-1 cursor-pointer hover:opacity-80"
              onClick={() => toggleMember(m.id)}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                style={{ backgroundColor: m.visible ? m.color : '#555', opacity: m.visible ? 1 : 0.5 }}>
                {m.avatar}
              </div>
              <span className={cn('text-[10px]', !m.visible && 'opacity-40')}>{m.name.split(' ')[0]}</span>
              {m.visible ? <Eye size={9} className="ml-auto opacity-40" /> : <EyeOff size={9} className="ml-auto opacity-30" />}
            </div>
          ))}
        </div>
      </div>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <Calendar size={16} className="text-blue-400" />
          <button onClick={goToday}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-white/10 transition-colors"
            style={{ borderColor: 'var(--border)' }}>
            Today
          </button>
          <button onClick={() => navigateView(-1)} className="p-1 rounded hover:bg-white/10"><ChevronLeft size={16} /></button>
          <button onClick={() => navigateView(1)} className="p-1 rounded hover:bg-white/10"><ChevronRight size={16} /></button>
          <span className="text-sm font-semibold">{displayDate}</span>
          <div className="flex-1" />
          {/* View switcher */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            {VIEW_OPTIONS.map(v => (
              <button key={v.key} onClick={() => setMainView(v.key)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  mainView === v.key ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                )}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <button className="p-1.5 rounded hover:bg-white/10"><Settings size={14} /></button>
        </div>

        {/* Calendar Content */}
        {mainView === 'month' && (
          <MonthView
            year={currentYear}
            month={currentMonth}
            events={visibleEvents}
            onSelectDate={d => { setSelectedDate(d); setMainView('day'); }}
            selectedDate={selectedDate}
          />
        )}
        {mainView === 'week' && (
          <WeekView weekStart={weekStart} events={visibleEvents} onSelectDate={d => { setSelectedDate(d); setMainView('day'); }} />
        )}
        {mainView === 'day' && (
          <DayView date={selectedDate} events={visibleEvents} />
        )}
        {mainView === 'team' && (
          <TeamCalendarView members={teamMembers} events={visibleEvents} date={selectedDate} />
        )}
        {mainView === 'availability' && (
          <AvailabilityView members={teamMembers} weekStart={weekStart} />
        )}
      </div>

      {/* ===== NEW EVENT MODAL ===== */}
      {showNewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-xl border shadow-2xl p-5" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">New Event</h3>
              <button onClick={() => setShowNewEvent(false)} className="opacity-50 hover:opacity-100 text-xs">✕</button>
            </div>
            <div className="space-y-3">
              <input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)}
                placeholder="Event title"
                className="w-full px-3 py-2 rounded border text-xs outline-none"
                style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }} />
              <input type="date" defaultValue={selectedDate}
                className="w-full px-3 py-2 rounded border text-xs"
                style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }} />
              <div className="flex gap-2">
                <input type="time" defaultValue="09:00"
                  className="flex-1 px-3 py-2 rounded border text-xs"
                  style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }} />
                <input type="time" defaultValue="10:00"
                  className="flex-1 px-3 py-2 rounded border text-xs"
                  style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }} />
              </div>
              <select className="w-full px-3 py-2 rounded border text-xs"
                style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }}>
                {otherCalendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea placeholder="Description (optional)" rows={2}
                className="w-full px-3 py-2 rounded border text-xs resize-none"
                style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowNewEvent(false)}
                className="px-3 py-1.5 rounded text-xs hover:bg-white/10">Cancel</button>
              <button onClick={() => { setShowNewEvent(false); setNewEventTitle(''); }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
