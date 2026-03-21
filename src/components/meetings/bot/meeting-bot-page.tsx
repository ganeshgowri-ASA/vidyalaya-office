'use client';

import React from 'react';
import { Bot, Calendar, Disc, Scissors, Settings2 } from 'lucide-react';
import { useMeetingBotStore } from '@/store/meeting-bot-store';
import BotConfig from './bot-config';
import BotScheduler from './bot-scheduler';
import MeetingRecorder from './meeting-recorder';
import RecordingLibrary from './recording-library';
import SoundbitesPanel from './soundbites-panel';
import BotStatusIndicator from './bot-status-indicator';

const TABS = [
  { id: 'config' as const, label: 'Bot Config', icon: Settings2 },
  { id: 'scheduler' as const, label: 'Scheduler', icon: Calendar },
  { id: 'recordings' as const, label: 'Recordings', icon: Disc },
  { id: 'soundbites' as const, label: 'Soundbites', icon: Scissors },
];

export default function MeetingBotPage() {
  const { activeTab, setActiveTab, recordings, scheduledAttendances, soundbites } = useMeetingBotStore();

  const stats = {
    recordings: recordings.length,
    scheduled: scheduledAttendances.filter((a) => a.status === 'pending').length,
    soundbites: soundbites.length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" style={{ color: 'var(--foreground)' }}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Meeting Bot</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              AI-powered meeting attendance, recording & soundbite creation
            </p>
          </div>
        </div>
        <BotStatusIndicator compact />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Recordings" value={stats.recordings} icon="🎬" color="#6366f1" />
        <StatCard label="Scheduled" value={stats.scheduled} icon="📅" color="#f59e0b" />
        <StatCard label="Soundbites" value={stats.soundbites} icon="✂️" color="#10b981" />
      </div>

      {/* Bot status full */}
      <BotStatusIndicator />

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--muted-foreground)',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'config' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <BotConfig />
            <div className="space-y-6">
              <MeetingRecorder />
            </div>
          </div>
        )}
        {activeTab === 'scheduler' && <BotScheduler />}
        {activeTab === 'recordings' && <RecordingLibrary />}
        {activeTab === 'soundbites' && <SoundbitesPanel />}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-4 transition-colors"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: color + '20' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      </div>
    </div>
  );
}
