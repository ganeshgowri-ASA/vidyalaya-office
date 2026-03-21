'use client';

import { create } from 'zustand';

// ==================== TYPES ====================

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: string;
  duration: number; // minutes
  organizer_email: string;
  participants: string[];
  sentences: { speaker_name: string; text: string; raw_text: string; start_time: number; end_time: number }[];
  summary: {
    overview: string;
    action_items: string[];
    decisions: string[];
    keywords: string[];
  };
  meeting_attendees: { displayName: string; email: string }[];
}

export interface MeetingComment {
  id: string;
  meetingId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  reactions: { emoji: string; users: string[] }[];
  parentId: string | null;
  replies?: MeetingComment[];
}

export interface MeetingShareConfig {
  meetingId: string;
  sharedWith: { email: string; permission: 'view' | 'comment' | 'edit' }[];
  shareLink: string | null;
  linkEnabled: boolean;
  expiresAt: string | null;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  platform: 'slack' | 'teams' | 'discord' | 'custom';
  secret: string;
  lastTriggered: string | null;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
}

export interface MeetingInsight {
  totalMeetings: number;
  avgDuration: number;
  totalDuration: number;
  topSpeakers: { name: string; duration: number; meetings: number }[];
  meetingsPerWeek: { week: string; count: number }[];
  topicBreakdown: { topic: string; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
}

export interface AskFredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { meetingTitle: string; date: string; snippet: string }[];
  timestamp: string;
}

// ==================== MOCK DATA ====================

const MOCK_FIREFLIES_TRANSCRIPTS: FirefliesTranscript[] = [
  {
    id: 'ff-1',
    title: 'Sprint Planning - Q2',
    date: '2024-03-20T10:00:00Z',
    duration: 58,
    organizer_email: 'ganesh@vidyalaya.dev',
    participants: ['ganesh@vidyalaya.dev', 'priya@vidyalaya.dev', 'raj@vidyalaya.dev', 'sarah@vidyalaya.dev'],
    sentences: [
      { speaker_name: 'Ganesh Gowri', text: "Let's start the sprint planning. We have 12 story points to allocate.", raw_text: "Let's start the sprint planning. We have 12 story points to allocate.", start_time: 120, end_time: 128 },
      { speaker_name: 'Priya Sharma', text: 'I reviewed the backlog. We should complete authentication stories first.', raw_text: 'Haan, maine backlog dekha. Humein authentication stories pehle complete karni chahiye.', start_time: 161, end_time: 170 },
      { speaker_name: 'Sarah Chen', text: 'The API design is 80% done. Remaining endpoints by tomorrow.', raw_text: 'The API design is 80% done. I\'ll finish the remaining endpoints by tomorrow.', start_time: 208, end_time: 216 },
      { speaker_name: 'Raj Kumar', text: 'I can take the backend stories and database migrations.', raw_text: 'I can take the backend stories and database migrations.', start_time: 250, end_time: 257 },
    ],
    summary: {
      overview: 'Sprint planning meeting to allocate 12 story points for Q2. Team discussed prioritization of authentication stories and API completion timeline.',
      action_items: ['Sarah: Complete API endpoints by tomorrow', 'Raj: Start backend stories', 'Priya: Build UI components', 'Aisha: Coordinate QA testing by Thursday'],
      decisions: ['Authentication stories prioritized', 'QA begins Thursday', 'API review on Wednesday'],
      keywords: ['sprint planning', 'authentication', 'API design', 'story points', 'QA testing'],
    },
    meeting_attendees: [
      { displayName: 'Ganesh Gowri', email: 'ganesh@vidyalaya.dev' },
      { displayName: 'Priya Sharma', email: 'priya@vidyalaya.dev' },
      { displayName: 'Raj Kumar', email: 'raj@vidyalaya.dev' },
      { displayName: 'Sarah Chen', email: 'sarah@vidyalaya.dev' },
    ],
  },
  {
    id: 'ff-2',
    title: 'Client Demo - Phase 2',
    date: '2024-03-20T14:00:00Z',
    duration: 85,
    organizer_email: 'ganesh@vidyalaya.dev',
    participants: ['ganesh@vidyalaya.dev', 'mike@company.com', 'raj@vidyalaya.dev', 'aisha@vidyalaya.dev'],
    sentences: [
      { speaker_name: 'Ganesh Gowri', text: 'Welcome everyone. Today we demo Phase 2 features including email, chat, and graphics modules.', raw_text: 'Welcome everyone. Today we demo Phase 2 features including email, chat, and graphics modules.', start_time: 30, end_time: 40 },
      { speaker_name: 'Mike Johnson', text: 'The email module looks great. Can we add calendar integration?', raw_text: 'The email module looks great. Can we add calendar integration?', start_time: 1200, end_time: 1208 },
      { speaker_name: 'Raj Kumar', text: 'The graphics editor supports SVG export and multiple shape libraries.', raw_text: 'The graphics editor supports SVG export and multiple shape libraries.', start_time: 2400, end_time: 2410 },
    ],
    summary: {
      overview: 'Phase 2 demo showing email, chat, and graphics modules. Client impressed with progress, requested calendar integration.',
      action_items: ['Add calendar integration to email module', 'Prepare Phase 3 proposal by next Friday', 'Share demo recording with stakeholders'],
      decisions: ['Phase 2 approved for production', 'Calendar integration added to Phase 3 scope'],
      keywords: ['client demo', 'email module', 'chat engine', 'graphics editor', 'calendar integration'],
    },
    meeting_attendees: [
      { displayName: 'Ganesh Gowri', email: 'ganesh@vidyalaya.dev' },
      { displayName: 'Mike Johnson', email: 'mike@company.com' },
      { displayName: 'Raj Kumar', email: 'raj@vidyalaya.dev' },
      { displayName: 'Aisha Patel', email: 'aisha@vidyalaya.dev' },
    ],
  },
  {
    id: 'ff-3',
    title: 'Design Review - Meetings UI',
    date: '2024-03-21T11:00:00Z',
    duration: 45,
    organizer_email: 'priya@vidyalaya.dev',
    participants: ['ganesh@vidyalaya.dev', 'priya@vidyalaya.dev', 'sarah@vidyalaya.dev'],
    sentences: [
      { speaker_name: 'Priya Sharma', text: 'I have the mockups ready for the meetings integration module.', raw_text: 'I have the mockups ready for the meetings integration module.', start_time: 60, end_time: 67 },
      { speaker_name: 'Sarah Chen', text: 'The Fireflies integration should show transcript and AI summary side by side.', raw_text: 'The Fireflies integration should show transcript and AI summary side by side.', start_time: 300, end_time: 310 },
      { speaker_name: 'Ganesh Gowri', text: 'Add the AskFred feature - users should be able to query across all meetings.', raw_text: 'Add the AskFred feature - users should be able to query across all meetings.', start_time: 600, end_time: 610 },
    ],
    summary: {
      overview: 'Design review for the meetings integration module. Discussed layout for Fireflies transcript view and AskFred AI Q&A feature.',
      action_items: ['Priya: Finalize mockups by EOD', 'Sarah: Research Fireflies API pagination', 'Ganesh: Draft AskFred prompt templates'],
      decisions: ['Side-by-side layout for transcript + summary', 'AskFred to support cross-meeting queries'],
      keywords: ['design review', 'meetings UI', 'Fireflies', 'AskFred', 'transcript'],
    },
    meeting_attendees: [
      { displayName: 'Ganesh Gowri', email: 'ganesh@vidyalaya.dev' },
      { displayName: 'Priya Sharma', email: 'priya@vidyalaya.dev' },
      { displayName: 'Sarah Chen', email: 'sarah@vidyalaya.dev' },
    ],
  },
];

const MOCK_COMMENTS: MeetingComment[] = [
  {
    id: 'c1', meetingId: 'ff-1', userId: 'u2', userName: 'Priya Sharma', userAvatar: 'P',
    text: 'Great summary! The action items are well captured.',
    timestamp: '2024-03-20T11:15:00Z', reactions: [{ emoji: '👍', users: ['u1', 'u3'] }], parentId: null,
  },
  {
    id: 'c2', meetingId: 'ff-1', userId: 'u1', userName: 'Ganesh Gowri', userAvatar: 'G',
    text: 'Thanks Priya. Let\'s make sure we track the API completion daily.',
    timestamp: '2024-03-20T11:18:00Z', reactions: [{ emoji: '✅', users: ['u2'] }], parentId: 'c1',
  },
  {
    id: 'c3', meetingId: 'ff-1', userId: 'u4', userName: 'Sarah Chen', userAvatar: 'S',
    text: 'API endpoints are on track. Will share the Swagger docs by 5pm.',
    timestamp: '2024-03-20T11:22:00Z', reactions: [{ emoji: '🚀', users: ['u1', 'u2', 'u3'] }], parentId: null,
  },
  {
    id: 'c4', meetingId: 'ff-2', userId: 'u5', userName: 'Mike Johnson', userAvatar: 'M',
    text: 'Impressive demo! The stakeholders are excited about the graphics editor.',
    timestamp: '2024-03-20T15:30:00Z', reactions: [{ emoji: '🎉', users: ['u1', 'u6'] }], parentId: null,
  },
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-1', name: 'Slack #engineering', url: 'https://hooks.slack.com/services/T00/B00/xxx',
    events: ['meeting.completed', 'summary.generated'], enabled: true, platform: 'slack',
    secret: 'whsec_abc123', lastTriggered: '2024-03-20T11:00:00Z',
  },
  {
    id: 'wh-2', name: 'Discord Alerts', url: 'https://discord.com/api/webhooks/123/abc',
    events: ['meeting.completed'], enabled: false, platform: 'discord',
    secret: 'whsec_def456', lastTriggered: null,
  },
];

const MOCK_INSIGHTS: MeetingInsight = {
  totalMeetings: 47,
  avgDuration: 42,
  totalDuration: 1974,
  topSpeakers: [
    { name: 'Ganesh Gowri', duration: 620, meetings: 38 },
    { name: 'Priya Sharma', duration: 480, meetings: 32 },
    { name: 'Raj Kumar', duration: 350, meetings: 28 },
    { name: 'Sarah Chen', duration: 310, meetings: 25 },
    { name: 'Aisha Patel', duration: 214, meetings: 20 },
  ],
  meetingsPerWeek: [
    { week: 'Mar 4', count: 8 },
    { week: 'Mar 11', count: 12 },
    { week: 'Mar 18', count: 15 },
    { week: 'Mar 25', count: 12 },
  ],
  topicBreakdown: [
    { topic: 'Sprint Planning', count: 12 },
    { topic: 'Client Demos', count: 8 },
    { topic: 'Design Review', count: 7 },
    { topic: 'Architecture', count: 6 },
    { topic: 'Standup', count: 14 },
  ],
  sentimentDistribution: [
    { sentiment: 'Positive', count: 28 },
    { sentiment: 'Neutral', count: 14 },
    { sentiment: 'Mixed', count: 4 },
    { sentiment: 'Tense', count: 1 },
  ],
};

// ==================== STORE ====================

interface MeetingIntegrationsState {
  // Fireflies
  firefliesApiKey: string;
  firefliesTranscripts: FirefliesTranscript[];
  selectedTranscriptId: string | null;
  firefliesLoading: boolean;
  firefliesError: string | null;

  // Comments
  comments: MeetingComment[];

  // Sharing
  shareConfigs: Record<string, MeetingShareConfig>;

  // Webhooks
  webhooks: WebhookConfig[];

  // Slack
  slackChannels: SlackChannel[];
  slackConnected: boolean;
  slackDefaultChannel: string | null;

  // Insights
  insights: MeetingInsight;

  // AskFred
  askFredMessages: AskFredMessage[];
  askFredLoading: boolean;

  // Active panel
  activeIntegrationPanel: 'insights' | 'askfred' | 'webhooks' | 'fireflies' | 'comments' | null;

  // Actions - Fireflies
  setFirefliesApiKey: (key: string) => void;
  fetchFirefliesTranscripts: () => Promise<void>;
  selectTranscript: (id: string | null) => void;

  // Actions - Comments
  addComment: (meetingId: string, text: string, parentId?: string | null) => void;
  toggleReaction: (commentId: string, emoji: string, userId: string) => void;
  deleteComment: (commentId: string) => void;

  // Actions - Sharing
  shareMeeting: (meetingId: string, email: string, permission: 'view' | 'comment' | 'edit') => void;
  toggleShareLink: (meetingId: string) => void;
  removeShare: (meetingId: string, email: string) => void;

  // Actions - Webhooks
  addWebhook: (webhook: Omit<WebhookConfig, 'id' | 'lastTriggered'>) => void;
  updateWebhook: (id: string, updates: Partial<WebhookConfig>) => void;
  deleteWebhook: (id: string) => void;
  testWebhook: (id: string) => Promise<void>;

  // Actions - Slack
  connectSlack: () => void;
  disconnectSlack: () => void;
  setSlackDefaultChannel: (channelId: string | null) => void;
  postToSlack: (channelId: string, meetingId: string) => Promise<void>;

  // Actions - AskFred
  askFred: (question: string) => Promise<void>;
  clearAskFred: () => void;

  // Actions - Panel
  setActiveIntegrationPanel: (panel: 'insights' | 'askfred' | 'webhooks' | 'fireflies' | 'comments' | null) => void;

  // Actions - Export
  exportMeetingNotes: (meetingId: string, format: 'notion' | 'google-docs' | 'markdown' | 'pdf') => Promise<string>;

  // Actions - Auto-email
  sendMeetingSummaryEmail: (meetingId: string, recipients: string[]) => Promise<void>;
}

export const useMeetingIntegrationsStore = create<MeetingIntegrationsState>()((set, get) => ({
  firefliesApiKey: '',
  firefliesTranscripts: MOCK_FIREFLIES_TRANSCRIPTS,
  selectedTranscriptId: null,
  firefliesLoading: false,
  firefliesError: null,

  comments: MOCK_COMMENTS,

  shareConfigs: {},

  webhooks: MOCK_WEBHOOKS,

  slackChannels: [
    { id: 'sc-1', name: '#general', isPrivate: false },
    { id: 'sc-2', name: '#engineering', isPrivate: false },
    { id: 'sc-3', name: '#product-updates', isPrivate: false },
    { id: 'sc-4', name: '#meeting-notes', isPrivate: false },
    { id: 'sc-5', name: '#private-leadership', isPrivate: true },
  ],
  slackConnected: true,
  slackDefaultChannel: 'sc-4',

  insights: MOCK_INSIGHTS,

  askFredMessages: [],
  askFredLoading: false,

  activeIntegrationPanel: null,

  setFirefliesApiKey: (key) => set({ firefliesApiKey: key }),

  fetchFirefliesTranscripts: async () => {
    set({ firefliesLoading: true, firefliesError: null });
    // Simulate API call - in production, this would call /api/meetings/fireflies
    await new Promise(r => setTimeout(r, 1500));
    set({ firefliesTranscripts: MOCK_FIREFLIES_TRANSCRIPTS, firefliesLoading: false });
  },

  selectTranscript: (id) => set({ selectedTranscriptId: id }),

  addComment: (meetingId, text, parentId = null) => {
    const comment: MeetingComment = {
      id: `c-${Date.now()}`,
      meetingId,
      userId: 'u1',
      userName: 'Ganesh Gowri',
      userAvatar: 'G',
      text,
      timestamp: new Date().toISOString(),
      reactions: [],
      parentId,
    };
    set((state) => ({ comments: [...state.comments, comment] }));
  },

  toggleReaction: (commentId, emoji, userId) => {
    set((state) => ({
      comments: state.comments.map((c) => {
        if (c.id !== commentId) return c;
        const existing = c.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes(userId)) {
            const updated = { ...existing, users: existing.users.filter((u) => u !== userId) };
            return { ...c, reactions: updated.users.length > 0 ? c.reactions.map((r) => (r.emoji === emoji ? updated : r)) : c.reactions.filter((r) => r.emoji !== emoji) };
          }
          return { ...c, reactions: c.reactions.map((r) => (r.emoji === emoji ? { ...r, users: [...r.users, userId] } : r)) };
        }
        return { ...c, reactions: [...c.reactions, { emoji, users: [userId] }] };
      }),
    }));
  },

  deleteComment: (commentId) => {
    set((state) => ({ comments: state.comments.filter((c) => c.id !== commentId && c.parentId !== commentId) }));
  },

  shareMeeting: (meetingId, email, permission) => {
    set((state) => {
      const existing = state.shareConfigs[meetingId] || {
        meetingId, sharedWith: [], shareLink: null, linkEnabled: false, expiresAt: null,
      };
      return {
        shareConfigs: {
          ...state.shareConfigs,
          [meetingId]: {
            ...existing,
            sharedWith: [...existing.sharedWith.filter((s) => s.email !== email), { email, permission }],
          },
        },
      };
    });
  },

  toggleShareLink: (meetingId) => {
    set((state) => {
      const existing = state.shareConfigs[meetingId] || {
        meetingId, sharedWith: [], shareLink: null, linkEnabled: false, expiresAt: null,
      };
      const linkEnabled = !existing.linkEnabled;
      return {
        shareConfigs: {
          ...state.shareConfigs,
          [meetingId]: {
            ...existing,
            linkEnabled,
            shareLink: linkEnabled ? `https://vidyalaya.dev/meetings/shared/${meetingId}?token=${Math.random().toString(36).slice(2)}` : null,
          },
        },
      };
    });
  },

  removeShare: (meetingId, email) => {
    set((state) => {
      const existing = state.shareConfigs[meetingId];
      if (!existing) return state;
      return {
        shareConfigs: {
          ...state.shareConfigs,
          [meetingId]: { ...existing, sharedWith: existing.sharedWith.filter((s) => s.email !== email) },
        },
      };
    });
  },

  addWebhook: (webhook) => {
    const newWebhook: WebhookConfig = { ...webhook, id: `wh-${Date.now()}`, lastTriggered: null };
    set((state) => ({ webhooks: [...state.webhooks, newWebhook] }));
  },

  updateWebhook: (id, updates) => {
    set((state) => ({ webhooks: state.webhooks.map((w) => (w.id === id ? { ...w, ...updates } : w)) }));
  },

  deleteWebhook: (id) => {
    set((state) => ({ webhooks: state.webhooks.filter((w) => w.id !== id) }));
  },

  testWebhook: async (id) => {
    await new Promise(r => setTimeout(r, 1000));
    set((state) => ({
      webhooks: state.webhooks.map((w) => (w.id === id ? { ...w, lastTriggered: new Date().toISOString() } : w)),
    }));
  },

  connectSlack: () => set({ slackConnected: true }),
  disconnectSlack: () => set({ slackConnected: false, slackDefaultChannel: null }),
  setSlackDefaultChannel: (channelId) => set({ slackDefaultChannel: channelId }),

  postToSlack: async (channelId, meetingId) => {
    // Simulate posting - in production calls /api/meetings/share with platform: 'slack'
    await new Promise(r => setTimeout(r, 800));
    const channel = get().slackChannels.find(c => c.id === channelId);
    if (channel) {
      // eslint-disable-next-line no-console
      console.log(`Posted meeting ${meetingId} summary to ${channel.name}`);
    }
  },

  askFred: async (question) => {
    const userMsg: AskFredMessage = {
      id: `af-${Date.now()}`, role: 'user', content: question, timestamp: new Date().toISOString(),
    };
    set((state) => ({ askFredMessages: [...state.askFredMessages, userMsg], askFredLoading: true }));

    await new Promise(r => setTimeout(r, 2000));

    const transcripts = get().firefliesTranscripts;
    const lowerQ = question.toLowerCase();

    // Simple mock AI response based on available transcripts
    let responseText = '';
    const sources: AskFredMessage['sources'] = [];

    if (lowerQ.includes('action') || lowerQ.includes('task') || lowerQ.includes('todo')) {
      const allActions = transcripts.flatMap((t) => t.summary.action_items.map((a) => ({ action: a, meeting: t.title, date: t.date })));
      responseText = `Here are the action items across your meetings:\n\n${allActions.map((a, i) => `${i + 1}. **${a.action}** (from "${a.meeting}")`).join('\n')}`;
      transcripts.forEach((t) => { if (t.summary.action_items.length > 0) sources.push({ meetingTitle: t.title, date: t.date, snippet: t.summary.action_items.join('; ') }); });
    } else if (lowerQ.includes('decision')) {
      const allDecisions = transcripts.flatMap((t) => t.summary.decisions.map((d) => ({ decision: d, meeting: t.title, date: t.date })));
      responseText = `Key decisions made across meetings:\n\n${allDecisions.map((d, i) => `${i + 1}. **${d.decision}** (from "${d.meeting}")`).join('\n')}`;
      transcripts.forEach((t) => { if (t.summary.decisions.length > 0) sources.push({ meetingTitle: t.title, date: t.date, snippet: t.summary.decisions.join('; ') }); });
    } else if (lowerQ.includes('api') || lowerQ.includes('endpoint')) {
      responseText = 'Based on your meetings, the API design is **80% complete** as mentioned by Sarah Chen in the Sprint Planning meeting. The remaining endpoints are expected to be finished by tomorrow. An API review is scheduled for Wednesday.';
      sources.push({ meetingTitle: 'Sprint Planning - Q2', date: '2024-03-20T10:00:00Z', snippet: 'The API design is 80% done. Remaining endpoints by tomorrow.' });
    } else if (lowerQ.includes('client') || lowerQ.includes('demo') || lowerQ.includes('phase')) {
      responseText: 'The Phase 2 client demo was successful. Mike Johnson from the client side was impressed with the email and graphics modules. Key feedback: requested calendar integration for the email module. Phase 2 has been **approved for production** and calendar integration is added to Phase 3 scope.';
      sources.push({ meetingTitle: 'Client Demo - Phase 2', date: '2024-03-20T14:00:00Z', snippet: 'Phase 2 approved for production. Calendar integration added to Phase 3 scope.' });
    } else {
      responseText = `Based on your ${transcripts.length} recent meetings, here\'s what I found:\n\n${transcripts.map((t) => `- **${t.title}** (${new Date(t.date).toLocaleDateString()}): ${t.summary.overview}`).join('\n\n')}\n\nWould you like me to dive deeper into any specific meeting or topic?`;
      transcripts.forEach((t) => sources.push({ meetingTitle: t.title, date: t.date, snippet: t.summary.overview }));
    }

    const assistantMsg: AskFredMessage = {
      id: `af-${Date.now() + 1}`, role: 'assistant', content: responseText, sources, timestamp: new Date().toISOString(),
    };
    set((state) => ({ askFredMessages: [...state.askFredMessages, assistantMsg], askFredLoading: false }));
  },

  clearAskFred: () => set({ askFredMessages: [] }),

  setActiveIntegrationPanel: (panel) => set({ activeIntegrationPanel: panel }),

  exportMeetingNotes: async (meetingId, format) => {
    await new Promise(r => setTimeout(r, 1000));
    const transcript = get().firefliesTranscripts.find((t) => t.id === meetingId);
    if (!transcript) throw new Error('Transcript not found');

    // Mock export - in production calls /api/meetings/export
    const exportData = {
      title: transcript.title,
      date: transcript.date,
      summary: transcript.summary.overview,
      actionItems: transcript.summary.action_items,
      decisions: transcript.summary.decisions,
      participants: transcript.meeting_attendees.map((a) => a.displayName),
      format,
    };

    return JSON.stringify(exportData);
  },

  sendMeetingSummaryEmail: async (meetingId, recipients) => {
    await new Promise(r => setTimeout(r, 1200));
    const transcript = get().firefliesTranscripts.find((t) => t.id === meetingId);
    if (!transcript) throw new Error('Transcript not found');
    // eslint-disable-next-line no-console
    console.log(`Sent meeting summary for "${transcript.title}" to ${recipients.join(', ')}`);
  },
}));
