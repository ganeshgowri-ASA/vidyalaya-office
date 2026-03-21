'use client';

import React, { useState, useMemo } from 'react';
import {
  Brain, TrendingUp, MessageSquare, Clock, Users, Target,
  ChevronDown, ChevronRight, Sparkles, AlertCircle, CheckCircle2,
  X, BarChart2, Mic, Activity, Hash, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== TYPES ====================
interface TalkTimeEntry {
  speaker: string;
  avatar: string;
  seconds: number;
  words: number;
  percentage: number;
  color: string;
}

interface TopicEntry {
  topic: string;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  firstMentioned: string;
  keywords: string[];
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'done';
}

interface SentimentPoint {
  time: string;
  score: number; // 0-100
  label: 'positive' | 'neutral' | 'negative';
}

// ==================== MOCK DATA ====================
const MOCK_TALK_TIME: TalkTimeEntry[] = [
  { speaker: 'Ganesh Gowri', avatar: 'G', seconds: 840, words: 1120, percentage: 38, color: '#3b82f6' },
  { speaker: 'Priya Sharma', avatar: 'P', seconds: 560, words: 780, percentage: 25, color: '#8b5cf6' },
  { speaker: 'Raj Kumar', avatar: 'R', seconds: 420, words: 580, percentage: 19, color: '#10b981' },
  { speaker: 'Sarah Chen', avatar: 'S', seconds: 280, words: 390, percentage: 13, color: '#f59e0b' },
  { speaker: 'Aisha Patel', avatar: 'A', seconds: 110, words: 145, percentage: 5, color: '#ef4444' },
];

const MOCK_TOPICS: TopicEntry[] = [
  { topic: 'API Integration', mentions: 14, sentiment: 'positive', firstMentioned: '00:03:12', keywords: ['endpoint', 'REST', 'authentication', 'rate limit'] },
  { topic: 'Sprint Goals', mentions: 11, sentiment: 'positive', firstMentioned: '00:01:45', keywords: ['velocity', 'backlog', 'story points', 'deadline'] },
  { topic: 'Production Deploy', mentions: 8, sentiment: 'neutral', firstMentioned: '00:12:30', keywords: ['deployment', 'CI/CD', 'rollback', 'staging'] },
  { topic: 'Client Feedback', mentions: 7, sentiment: 'positive', firstMentioned: '00:18:05', keywords: ['demo', 'approval', 'revisions', 'timeline'] },
  { topic: 'Performance Issues', mentions: 5, sentiment: 'negative', firstMentioned: '00:22:15', keywords: ['latency', 'optimization', 'memory leak', 'caching'] },
  { topic: 'Team Sync', mentions: 4, sentiment: 'neutral', firstMentioned: '00:00:30', keywords: ['standup', 'blockers', 'updates', 'availability'] },
];

const MOCK_ACTION_ITEMS: ActionItem[] = [
  { id: 'a1', task: 'Complete API authentication module', assignee: 'Raj Kumar', due: 'Tomorrow', priority: 'high', status: 'in-progress' },
  { id: 'a2', task: 'Review and merge PR #127 for sprint branch', assignee: 'Sarah Chen', due: 'Today EOD', priority: 'high', status: 'pending' },
  { id: 'a3', task: 'Schedule client demo for Phase 3 features', assignee: 'Ganesh Gowri', due: 'This week', priority: 'medium', status: 'pending' },
  { id: 'a4', task: 'Fix memory leak in dashboard component', assignee: 'Priya Sharma', due: 'Mar 25', priority: 'high', status: 'in-progress' },
  { id: 'a5', task: 'Update deployment runbook for v2.1', assignee: 'Aisha Patel', due: 'Mar 27', priority: 'medium', status: 'pending' },
  { id: 'a6', task: 'Write unit tests for email module', assignee: 'Raj Kumar', due: 'Mar 28', priority: 'low', status: 'pending' },
];

const MOCK_SENTIMENT: SentimentPoint[] = [
  { time: '0:00', score: 72, label: 'positive' },
  { time: '5:00', score: 78, label: 'positive' },
  { time: '10:00', score: 65, label: 'neutral' },
  { time: '15:00', score: 55, label: 'neutral' },
  { time: '20:00', score: 42, label: 'negative' },
  { time: '25:00', score: 60, label: 'neutral' },
  { time: '30:00', score: 71, label: 'positive' },
  { time: '35:00', score: 80, label: 'positive' },
  { time: '40:00', score: 82, label: 'positive' },
  { time: '45:00', score: 76, label: 'positive' },
];

const MOCK_AI_SUMMARY = {
  overview: 'A productive sprint planning session focused on Q2 objectives. The team aligned on API integration priorities, addressed performance bottlenecks, and confirmed the client demo timeline. 6 action items assigned with clear ownership.',
  decisions: [
    'API authentication module to use OAuth 2.0 with JWT tokens',
    'Production deploy scheduled for Friday after QA sign-off',
    'Phase 3 scope expanded to include calendar integration per client request',
    'Memory leak issue escalated to P1 — must fix before deploy',
  ],
  keyInsights: [
    '📈 Team velocity up 15% vs last sprint',
    '⚠️ 2 blockers identified: API auth delay & memory leak',
    '✅ Client demo approved Phase 2 for production',
    '🎯 All 6 sprint stories have owners assigned',
  ],
  sentiment: 'positive' as const,
  engagementScore: 84,
  followUps: ['Send meeting notes to client', 'Book QA review slot for Thursday'],
};

// ==================== SUB-COMPONENTS ====================
function SectionHeader({ icon: Icon, title, color, count }: { icon: React.ElementType; title: string; color: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} style={{ color }} />
      <span className="text-xs font-semibold">{title}</span>
      {count !== undefined && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
          {count}
        </span>
      )}
    </div>
  );
}

function AISummaryPanel() {
  const [expanded, setExpanded] = useState(true);
  const sentimentConfig = {
    positive: { color: '#10b981', label: 'Positive 😊', bg: 'bg-green-900/20' },
    neutral: { color: '#94a3b8', label: 'Neutral 😐', bg: 'bg-slate-800/40' },
    mixed: { color: '#f59e0b', label: 'Mixed 🤔', bg: 'bg-yellow-900/20' },
    negative: { color: '#ef4444', label: 'Negative 😟', bg: 'bg-red-900/20' },
  };
  const sc = sentimentConfig[MOCK_AI_SUMMARY.sentiment];

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
      <button className="flex items-center gap-2 w-full" onClick={() => setExpanded(!expanded)}>
        <Sparkles size={14} className="text-yellow-400" />
        <span className="text-xs font-semibold flex-1 text-left">AI Summary</span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full ${sc.bg}`} style={{ color: sc.color }}>{sc.label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-900/30 text-blue-400 ml-1">
          {MOCK_AI_SUMMARY.engagementScore}% engagement
        </span>
        {expanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {MOCK_AI_SUMMARY.overview}
          </p>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1.5">KEY INSIGHTS</p>
            <div className="space-y-1">
              {MOCK_AI_SUMMARY.keyInsights.map((insight, i) => (
                <div key={i} className="text-[11px] px-2 py-1 rounded bg-slate-800/40">{insight}</div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1.5">DECISIONS MADE</p>
            <div className="space-y-1">
              {MOCK_AI_SUMMARY.decisions.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px]">
                  <CheckCircle2 size={10} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span style={{ color: 'var(--foreground)' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 mb-1.5">FOLLOW-UPS</p>
            <div className="space-y-1">
              {MOCK_AI_SUMMARY.followUps.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px]">
                  <AlertCircle size={10} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span style={{ color: 'var(--foreground)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionItemsPanel() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'done'>('all');
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#94a3b8' };
  const statusColors = { pending: '#94a3b8', 'in-progress': '#3b82f6', done: '#10b981' };

  const filtered = useMemo(() =>
    filter === 'all' ? MOCK_ACTION_ITEMS : MOCK_ACTION_ITEMS.filter(a => a.status === filter),
    [filter]
  );

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
      <div className="flex items-center justify-between mb-3">
        <SectionHeader icon={Target} title="Action Items" color="#10b981" count={MOCK_ACTION_ITEMS.filter(a => a.status !== 'done').length} />
        <div className="flex gap-1">
          {(['all', 'pending', 'in-progress', 'done'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', filter === f ? 'bg-green-900/30 text-green-400' : 'text-slate-400 hover:text-slate-200')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: 'var(--sidebar, #0f172a)' }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: priorityColors[item.priority] }} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate">{item.task}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>@{item.assignee}</span>
                <span className="text-[9px] text-slate-500">·</span>
                <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>Due: {item.due}</span>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `${statusColors[item.status]}20`, color: statusColors[item.status] }}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SentimentAnalysisPanel() {
  const avgScore = Math.round(MOCK_SENTIMENT.reduce((s, p) => s + p.score, 0) / MOCK_SENTIMENT.length);
  const maxScore = Math.max(...MOCK_SENTIMENT.map(p => p.score));
  const minScore = Math.min(...MOCK_SENTIMENT.map(p => p.score));

  const getColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
      <SectionHeader icon={Activity} title="Sentiment Analysis" color="#8b5cf6" />

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--sidebar, #0f172a)' }}>
          <div className="text-lg font-bold" style={{ color: getColor(avgScore) }}>{avgScore}</div>
          <div className="text-[9px] text-slate-400">Avg Score</div>
        </div>
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--sidebar, #0f172a)' }}>
          <div className="text-lg font-bold text-green-400">{maxScore}</div>
          <div className="text-[9px] text-slate-400">Peak</div>
        </div>
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--sidebar, #0f172a)' }}>
          <div className="text-lg font-bold text-red-400">{minScore}</div>
          <div className="text-[9px] text-slate-400">Low</div>
        </div>
      </div>

      {/* Timeline chart */}
      <div className="relative h-16 flex items-end gap-0.5 mb-2">
        {MOCK_SENTIMENT.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full rounded-t transition-all"
              style={{ height: `${point.score}%`, backgroundColor: getColor(point.score), opacity: 0.8 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {MOCK_SENTIMENT.map((p, i) => (
          <span key={i} className="text-[8px] text-slate-500">{i % 2 === 0 ? p.time : ''}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-2">
        {[
          { label: 'Positive', color: '#10b981', count: MOCK_SENTIMENT.filter(p => p.score >= 70).length },
          { label: 'Neutral', color: '#f59e0b', count: MOCK_SENTIMENT.filter(p => p.score >= 50 && p.score < 70).length },
          { label: 'Negative', color: '#ef4444', count: MOCK_SENTIMENT.filter(p => p.score < 50).length },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[9px] text-slate-400">{s.label}: {s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicTrackerPanel() {
  const sentimentIcon = { positive: '📈', neutral: '➡️', negative: '📉' };
  const sentimentColor = { positive: '#10b981', neutral: '#94a3b8', negative: '#ef4444' };

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
      <SectionHeader icon={Hash} title="Topic Tracker" color="#f59e0b" count={MOCK_TOPICS.length} />

      <div className="space-y-2">
        {MOCK_TOPICS.map((topic, i) => (
          <div key={i} className="p-2 rounded" style={{ backgroundColor: 'var(--sidebar, #0f172a)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span>{sentimentIcon[topic.sentiment]}</span>
                <span className="text-[11px] font-medium">{topic.topic}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px]" style={{ color: sentimentColor[topic.sentiment] }}>
                  {topic.mentions} mentions
                </span>
                <span className="text-[9px] text-slate-500">@{topic.firstMentioned}</span>
              </div>
            </div>
            {/* Mention bar */}
            <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(topic.mentions / 14) * 100}%`, backgroundColor: sentimentColor[topic.sentiment] }} />
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {topic.keywords.map((kw, j) => (
                <span key={j} className="text-[9px] px-1 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TalkTimePanel() {
  const totalSeconds = MOCK_TALK_TIME.reduce((s, e) => s + e.seconds, 0);
  const formatTime = (secs: number) => `${Math.floor(secs / 60)}m ${secs % 60}s`;

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
      <SectionHeader icon={Mic} title="Talk-Time Analytics" color="#3b82f6" />

      <div className="text-[10px] text-slate-400 mb-3">
        Total: {formatTime(totalSeconds)} · {MOCK_TALK_TIME.length} speakers
      </div>

      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex mb-3">
        {MOCK_TALK_TIME.map((e, i) => (
          <div key={i} className="h-full transition-all" title={`${e.speaker}: ${e.percentage}%`}
            style={{ width: `${e.percentage}%`, backgroundColor: e.color }} />
        ))}
      </div>

      <div className="space-y-2">
        {MOCK_TALK_TIME.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: `${entry.color}30`, color: entry.color }}>
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium truncate">{entry.speaker}</span>
                <span className="text-[10px] ml-2" style={{ color: entry.color }}>{entry.percentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${entry.percentage}%`, backgroundColor: entry.color }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-slate-300">{formatTime(entry.seconds)}</div>
              <div className="text-[9px] text-slate-500">{entry.words}w</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 rounded text-[10px]" style={{ backgroundColor: 'var(--sidebar, #0f172a)' }}>
        <span className="text-yellow-400">💡 Insight: </span>
        <span className="text-slate-300">Ganesh is dominating at 38%. Consider encouraging more input from Aisha (5%).</span>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
interface MeetingIntelligenceProps {
  onClose: () => void;
}

type IntelTab = 'summary' | 'actions' | 'sentiment' | 'topics' | 'talktime';

export default function MeetingIntelligence({ onClose }: MeetingIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<IntelTab>('summary');

  const tabs: { id: IntelTab; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'summary', label: 'AI Summary', icon: Sparkles, color: '#f59e0b' },
    { id: 'actions', label: 'Actions', icon: Target, color: '#10b981' },
    { id: 'sentiment', label: 'Sentiment', icon: Activity, color: '#8b5cf6' },
    { id: 'topics', label: 'Topics', icon: Hash, color: '#f59e0b' },
    { id: 'talktime', label: 'Talk Time', icon: Mic, color: '#3b82f6' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold">Meeting Intelligence</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-900/30 text-purple-400">AI-Powered</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors',
              activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}>
            <tab.icon size={11} style={{ color: activeTab === tab.id ? tab.color : undefined }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'summary' && <AISummaryPanel />}
        {activeTab === 'actions' && <ActionItemsPanel />}
        {activeTab === 'sentiment' && <SentimentAnalysisPanel />}
        {activeTab === 'topics' && <TopicTrackerPanel />}
        {activeTab === 'talktime' && <TalkTimePanel />}
      </div>
    </div>
  );
}
