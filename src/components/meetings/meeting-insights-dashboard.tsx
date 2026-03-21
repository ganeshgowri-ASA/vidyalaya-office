'use client';

import React from 'react';
import { useMeetingIntegrationsStore } from '@/store/meeting-integrations-store';
import {
  BarChart3, Clock, Users, TrendingUp, X, Mic, PieChart,
} from 'lucide-react';

export default function MeetingInsightsDashboard({ onClose }: { onClose: () => void }) {
  const { insights } = useMeetingIntegrationsStore();

  const maxWeekCount = Math.max(...insights.meetingsPerWeek.map((w) => w.count));
  const maxTopicCount = Math.max(...insights.topicBreakdown.map((t) => t.count));
  const totalSentiment = insights.sentimentDistribution.reduce((sum, s) => sum + s.count, 0);

  const sentimentColors: Record<string, string> = {
    Positive: 'bg-green-500',
    Neutral: 'bg-blue-500',
    Mixed: 'bg-yellow-500',
    Tense: 'bg-red-500',
  };

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return hours > 0 ? `${hours}h ${m}m` : `${m}m`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold">Meeting Insights Dashboard</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-blue-400" />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Total Meetings</span>
            </div>
            <div className="text-2xl font-bold">{insights.totalMeetings}</div>
          </div>
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-purple-400" />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Avg Duration</span>
            </div>
            <div className="text-2xl font-bold">{insights.avgDuration}<span className="text-sm font-normal ml-1">min</span></div>
          </div>
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Total Time</span>
            </div>
            <div className="text-2xl font-bold">{formatDuration(insights.totalDuration)}</div>
          </div>
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-orange-400" />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Speakers</span>
            </div>
            <div className="text-2xl font-bold">{insights.topSpeakers.length}</div>
          </div>
        </div>

        {/* Meetings Per Week */}
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-400" />
            Meetings Per Week
          </h4>
          <div className="flex items-end gap-2 h-32">
            {insights.meetingsPerWeek.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-medium">{week.count}</div>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                  style={{ height: `${(week.count / maxWeekCount) * 100}%`, minHeight: 4 }}
                />
                <div className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{week.week}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Top Speakers */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
              <Mic size={14} className="text-purple-400" />
              Top Speakers
            </h4>
            <div className="space-y-2">
              {insights.topSpeakers.map((speaker, i) => (
                <div key={speaker.name} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
                    {speaker.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium truncate">{speaker.name}</span>
                      <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{speaker.meetings} meetings</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full mt-1" style={{ backgroundColor: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(speaker.duration / insights.topSpeakers[0].duration) * 100}%`,
                          background: `hsl(${220 + i * 30}, 70%, 55%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Breakdown */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
              <PieChart size={14} className="text-green-400" />
              Topic Breakdown
            </h4>
            <div className="space-y-2">
              {insights.topicBreakdown.map((topic) => (
                <div key={topic.topic}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px]">{topic.topic}</span>
                    <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{topic.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
          <h4 className="text-xs font-semibold mb-3">Sentiment Distribution</h4>
          <div className="flex h-4 rounded-full overflow-hidden">
            {insights.sentimentDistribution.map((s) => (
              <div
                key={s.sentiment}
                className={`${sentimentColors[s.sentiment] || 'bg-gray-500'} transition-all`}
                style={{ width: `${(s.count / totalSentiment) * 100}%` }}
                title={`${s.sentiment}: ${s.count}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2">
            {insights.sentimentDistribution.map((s) => (
              <div key={s.sentiment} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${sentimentColors[s.sentiment] || 'bg-gray-500'}`} />
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                  {s.sentiment} ({Math.round((s.count / totalSentiment) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
