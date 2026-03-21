'use client';

import React from 'react';
import { Bot, Loader2, Circle, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { useMeetingBotStore, BotStatus } from '@/store/meeting-bot-store';

const STATUS_CONFIG: Record<BotStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode; pulse: boolean }> = {
  idle: {
    label: 'Idle',
    color: '#6b7280',
    bgColor: '#6b728020',
    icon: <Circle size={14} />,
    pulse: false,
  },
  joining: {
    label: 'Joining meeting...',
    color: '#f59e0b',
    bgColor: '#f59e0b20',
    icon: <Loader2 size={14} className="animate-spin" />,
    pulse: true,
  },
  recording: {
    label: 'Recording',
    color: '#ef4444',
    bgColor: '#ef444420',
    icon: <Circle size={14} fill="#ef4444" />,
    pulse: true,
  },
  processing: {
    label: 'Processing recording...',
    color: '#6366f1',
    bgColor: '#6366f120',
    icon: <Loader2 size={14} className="animate-spin" />,
    pulse: true,
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bgColor: '#ef444420',
    icon: <AlertCircle size={14} />,
    pulse: false,
  },
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: '#10b98120',
    icon: <CheckCircle size={14} />,
    pulse: false,
  },
};

export default function BotStatusIndicator({ compact = false }: { compact?: boolean }) {
  const { botStatus, botConfig, currentMeetingUrl } = useMeetingBotStore();
  const config = STATUS_CONFIG[botStatus];

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{ backgroundColor: config.bgColor }}
      >
        {config.pulse && (
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: config.color }}
          />
        )}
        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: config.color }}>
          {config.icon}
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="flex items-center gap-3">
        {/* Bot avatar */}
        <div className="relative">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: botConfig.avatarColor }}
          >
            {botConfig.avatar}
          </div>
          {/* Status dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
            style={{
              backgroundColor: config.color,
              borderColor: 'var(--card)',
            }}
          />
        </div>

        {/* Status info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{botConfig.name}</span>
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: config.bgColor, color: config.color }}
            >
              {config.icon}
              {config.label}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1">
              <Bot size={12} />
              {botConfig.behavior.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1">
              <Wifi size={12} />
              {botConfig.autoJoin ? 'Auto-join on' : 'Manual join'}
            </span>
          </div>
        </div>
      </div>

      {/* Current meeting info */}
      {currentMeetingUrl && botStatus !== 'idle' && botStatus !== 'completed' && (
        <div className="rounded-lg p-2 text-xs" style={{ backgroundColor: 'var(--background)' }}>
          <span style={{ color: 'var(--muted-foreground)' }}>Current meeting: </span>
          <span className="truncate" style={{ color: 'var(--foreground)' }}>{currentMeetingUrl}</span>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <QuickStat label="Behavior" value={botConfig.behavior === 'full_participation' ? 'Full' : botConfig.behavior === 'record_only' ? 'Record' : 'Transcribe'} />
        <QuickStat label="Audio" value={botConfig.recordAudio ? 'On' : 'Off'} />
        <QuickStat label="Video" value={botConfig.recordVideo ? 'On' : 'Off'} />
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--background)' }}>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  );
}
