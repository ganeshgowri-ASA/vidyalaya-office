'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FileAttachment {
  name: string;
  size: string;
  type: 'doc' | 'image' | 'pdf' | 'code' | 'other';
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedBy: string[];
}

interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  closed: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Task {
  id: string;
  title: string;
  channelId: string;
  createdBy: string;
  assigneeName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  thread: Message[];
  pinned: boolean;
  edited: boolean;
  attachment?: FileAttachment;
  poll?: Poll;
  checklist?: { items: ChecklistItem[] };
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm' | 'group';
  icon: string;
  unread: number;
  members: number;
  description: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: string;
}

const USERS: User[] = [
  { id: 'u1', name: 'You', avatar: '🙋', status: 'online', role: 'Developer' },
  { id: 'u2', name: 'Priya Sharma', avatar: '👩‍💻', status: 'online', role: 'Designer' },
  { id: 'u3', name: 'Rahul Verma', avatar: '👨‍🔧', status: 'away', role: 'DevOps' },
  { id: 'u4', name: 'Anita Patel', avatar: '👩‍🏫', status: 'busy', role: 'PM' },
  { id: 'u5', name: 'Vidyalaya Bot', avatar: '🤖', status: 'online', role: 'AI Assistant' },
];

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', type: 'channel', icon: '#', unread: 3, members: 15, description: 'Company-wide announcements' },
  { id: 'engineering', name: 'engineering', type: 'channel', icon: '#', unread: 7, members: 8, description: 'Engineering discussions' },
  { id: 'design', name: 'design', type: 'channel', icon: '#', unread: 0, members: 5, description: 'Design reviews and feedback' },
  { id: 'random', name: 'random', type: 'channel', icon: '#', unread: 1, members: 15, description: 'Water cooler chat' },
  { id: 'dm-priya', name: 'Priya Sharma', type: 'dm', icon: '👩‍💻', unread: 2, members: 2, description: '' },
  { id: 'dm-rahul', name: 'Rahul Verma', type: 'dm', icon: '👨‍🔧', unread: 0, members: 2, description: '' },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', channelId: 'general', userId: 'u4', userName: 'Anita Patel', avatar: '👩‍🏫', content: 'Team standup at 10 AM today. Please update your task boards.', timestamp: '09:15 AM', reactions: [{ emoji: '👍', count: 4, reacted: true }], thread: [], pinned: true, edited: false },
  { id: 'm2', channelId: 'general', userId: 'u2', userName: 'Priya Sharma', avatar: '👩‍💻', content: 'The new dashboard designs are ready for review. Check #design channel.', timestamp: '09:32 AM', reactions: [{ emoji: '🎉', count: 2, reacted: false }], thread: [
    { id: 'm2t1', channelId: 'general', userId: 'u3', userName: 'Rahul Verma', avatar: '👨‍🔧', content: 'Looks great! The color palette is really polished.', timestamp: '09:45 AM', reactions: [], thread: [], pinned: false, edited: false },
    { id: 'm2t2', channelId: 'general', userId: 'u4', userName: 'Anita Patel', avatar: '👩‍🏫', content: 'Can you share the Figma link too?', timestamp: '09:50 AM', reactions: [], thread: [], pinned: false, edited: false },
  ], pinned: false, edited: false },
  { id: 'm3', channelId: 'general', userId: 'u3', userName: 'Rahul Verma', avatar: '👨‍🔧', content: 'CI/CD pipeline optimization complete. Build times reduced by 40%.', timestamp: '10:05 AM', reactions: [{ emoji: '🚀', count: 6, reacted: true }, { emoji: '🔥', count: 3, reacted: false }], thread: [], pinned: false, edited: false },
  { id: 'm4', channelId: 'general', userId: 'u5', userName: 'Vidyalaya Bot', avatar: '🤖', content: '✨ Daily digest: 3 PRs merged, 2 issues closed, 1 new deployment to staging.', timestamp: '10:30 AM', reactions: [], thread: [], pinned: false, edited: false },
  { id: 'm5', channelId: 'general', userId: 'u2', userName: 'Priya Sharma', avatar: '👩‍💻', content: 'Attaching the design spec for review.', timestamp: '11:00 AM', reactions: [], thread: [], pinned: false, edited: false, attachment: { name: 'design-spec-v3.pdf', size: '2.4 MB', type: 'pdf' } },
  { id: 'm6', channelId: 'engineering', userId: 'u1', userName: 'You', avatar: '🙋', content: 'Working on the graphics editor component. SVG canvas with shape tools is done.', timestamp: '11:00 AM', reactions: [{ emoji: '💯', count: 2, reacted: false }], thread: [], pinned: false, edited: false },
  { id: 'm7', channelId: 'engineering', userId: 'u3', userName: 'Rahul Verma', avatar: '👨‍🔧', content: 'Nice! Can you add export to PNG/SVG support?', timestamp: '11:15 AM', reactions: [], thread: [], pinned: false, edited: false },
  { id: 'm8', channelId: 'general', userId: 'u4', userName: 'Anita Patel', avatar: '👩‍🏫',
    content: '📋 Sprint review checklist for Q1:', timestamp: '11:45 AM',
    reactions: [], thread: [], pinned: false, edited: false,
    checklist: { items: [
      { id: 'ci1', text: 'Review Q1 OKR progress report', checked: true },
      { id: 'ci2', text: 'Update sprint board before standup', checked: false },
      { id: 'ci3', text: 'Send weekly digest to stakeholders', checked: false },
      { id: 'ci4', text: 'Archive completed project channels', checked: false },
    ]}},
  { id: 'm9', channelId: 'engineering', userId: 'u3', userName: 'Rahul Verma', avatar: '👨‍🔧',
    content: '🔧 Deployment checklist:', timestamp: '11:50 AM',
    reactions: [], thread: [], pinned: false, edited: false,
    checklist: { items: [
      { id: 'ci5', text: 'Run unit tests', checked: true },
      { id: 'ci6', text: 'Update environment variables', checked: true },
      { id: 'ci7', text: 'Deploy to staging', checked: false },
      { id: 'ci8', text: 'Smoke test on staging', checked: false },
      { id: 'ci9', text: 'Deploy to production', checked: false },
    ]}},
];

const BOT_COMMANDS: Record<string, string> = {
  '/help': '📋 Available commands: /status, /remind, /poll, /standup, /joke, /weather',
  '/status': '🟢 All systems operational. API: 99.9% uptime. Latency: 42ms.',
  '/standup': '📋 Standup template:\n• Yesterday: \n• Today: \n• Blockers: ',
  '/joke': '😄 Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
  '/weather': '🌤 Today: 24°C, Partly cloudy. Good day to ship code!',
};

let msgCounter = 20;
let channelCounter = 10;

export function ChatEngine() {
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [activeChannel, setActiveChannel] = useState('general');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [threadInput, setThreadInput] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callActive, setCallActive] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>(['m1']);
  const [showPinned, setShowPinned] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelForm, setChannelForm] = useState({ name: '', description: '', isPrivate: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Checklists ──
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['', '']);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  // ── Tasks ──
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Update API documentation', channelId: 'engineering', createdBy: 'u1', assigneeName: 'Rahul Verma', dueDate: '2026-03-22', priority: 'high', status: 'in-progress' },
    { id: 't2', title: 'Review design specs for v2', channelId: 'design', createdBy: 'u4', assigneeName: 'Priya Sharma', dueDate: '2026-03-25', priority: 'medium', status: 'todo' },
    { id: 't3', title: 'Deploy hotfix to production', channelId: 'engineering', createdBy: 'u1', assigneeName: 'Rahul Verma', dueDate: '2026-03-20', priority: 'high', status: 'done' },
  ]);
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState<{ title: string; assignee: string; dueDate: string; priority: 'low' | 'medium' | 'high' }>({ title: '', assignee: 'u2', dueDate: '', priority: 'medium' });
  // ── @Mention ──
  const [mentionDropdown, setMentionDropdown] = useState<{ show: boolean; type: '@' | '#'; query: string; startIdx: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // ── AI panel messages ──
  const [aiPanelMessages, setAiPanelMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: '👋 Hi! I can summarize conversations, extract action items, suggest replies, and answer questions. Try the quick actions below!' }
  ]);

  const channelMessages = messages.filter(m => m.channelId === activeChannel);
  const currentChannel = channels.find(c => c.id === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  // Simulate typing indicators
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (inputText && inputText.length > 0) {
      const randomUser = USERS.filter(u => u.id !== 'u1')[Math.floor(Math.random() * 4)];
      timeout = setTimeout(() => {
        setTypingUsers([randomUser.name]);
        setTimeout(() => setTypingUsers([]), 2000);
      }, 800);
    }
    return () => clearTimeout(timeout);
  }, [inputText]);

  // Call timer
  useEffect(() => {
    if (callActive) {
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callActive]);

  const formatCallDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const sendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    // Handle bot commands
    if (inputText.startsWith('/')) {
      const response = BOT_COMMANDS[inputText.trim()] || `❌ Unknown command: ${inputText.trim()}. Try /help`;
      const userMsg: Message = {
        id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
        avatar: '🙋', content: inputText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [], thread: [], pinned: false, edited: false,
      };
      const botMsg: Message = {
        id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u5', userName: 'Vidyalaya Bot',
        avatar: '🤖', content: response, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [], thread: [], pinned: false, edited: false,
      };
      setMessages(prev => [...prev, userMsg, botMsg]);
      setInputText('');
      return;
    }

    const msg: Message = {
      id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
      avatar: '🙋', content: inputText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], thread: [], pinned: false, edited: false,
    };
    setMessages(prev => [...prev, msg]);
    setInputText('');
  }, [inputText, activeChannel]);

  const addReaction = (msgId: string, emoji: string) => {
    setMessages(messages.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r) };
      }
      return { ...m, reactions: [...m.reactions, { emoji, count: 1, reacted: true }] };
    }));
  };

  const togglePin = (msgId: string) => {
    setPinnedMessages(prev => prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m));
  };

  const sendThreadReply = () => {
    if (!threadInput.trim() || !threadMessage) return;
    const reply: Message = {
      id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
      avatar: '🙋', content: threadInput, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], thread: [], pinned: false, edited: false,
    };
    setMessages(prev => prev.map(m => m.id === threadMessage.id ? { ...m, thread: [...m.thread, reply] } : m));
    setThreadMessage(prev => prev ? { ...prev, thread: [...prev.thread, reply] } : prev);
    setThreadInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setTimeout(() => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType: FileAttachment['type'] = ext === 'pdf' ? 'pdf' : ['jpg', 'png', 'gif', 'webp'].includes(ext) ? 'image' : ['js', 'ts', 'py', 'go'].includes(ext) ? 'code' : ext === 'doc' || ext === 'docx' ? 'doc' : 'other';
      const msg: Message = {
        id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
        avatar: '🙋', content: `Shared a file: ${file.name}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [], thread: [], pinned: false, edited: false,
        attachment: { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, type: fileType },
      };
      setMessages(prev => [...prev, msg]);
      setUploadingFile(false);
    }, 800);
    e.target.value = '';
  };

  const createPoll = () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return;
    const poll: Poll = {
      question: pollQuestion,
      options: pollOptions.filter(o => o.trim()).map((text, i) => ({ id: `opt_${i}`, text, votes: 0, votedBy: [] })),
      totalVotes: 0,
      closed: false,
    };
    const msg: Message = {
      id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
      avatar: '🙋', content: `Created a poll: ${pollQuestion}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], thread: [], pinned: false, edited: false, poll,
    };
    setMessages(prev => [...prev, msg]);
    setShowPollModal(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const votePoll = (msgId: string, optionId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.poll) return m;
      if (m.poll.closed) return m;
      const alreadyVoted = m.poll.options.some(o => o.votedBy.includes('u1'));
      if (alreadyVoted) return m;
      const updatedOptions = m.poll.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1, votedBy: [...o.votedBy, 'u1'] } : o);
      return { ...m, poll: { ...m.poll, options: updatedOptions, totalVotes: m.poll.totalVotes + 1 } };
    }));
  };

  const toggleChecklistItem = (msgId: string, itemId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.checklist) return m;
      return { ...m, checklist: { items: m.checklist.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) } };
    }));
  };

  const createChecklist = () => {
    const valid = newChecklistItems.filter(i => i.trim());
    if (!valid.length) return;
    const msg: Message = {
      id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
      avatar: '🙋', content: newChecklistTitle || 'Checklist:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], thread: [], pinned: false, edited: false,
      checklist: { items: valid.map((text, i) => ({ id: `ci_${msgCounter}_${i}`, text, checked: false })) },
    };
    setMessages(prev => [...prev, msg]);
    setShowChecklistModal(false);
    setNewChecklistItems(['', '']);
    setNewChecklistTitle('');
  };

  const createTask = () => {
    if (!taskForm.title.trim()) return;
    const assignee = USERS.find(u => u.id === taskForm.assignee);
    const task: Task = {
      id: `task_${Date.now()}`, title: taskForm.title, channelId: activeChannel,
      createdBy: 'u1', assigneeName: assignee?.name || 'Team',
      dueDate: taskForm.dueDate, priority: taskForm.priority, status: 'todo',
    };
    setTasks(prev => [...prev, task]);
    const msg: Message = {
      id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
      avatar: '🙋',
      content: `📌 Task assigned to ${task.assigneeName}: "${task.title}" · ${task.priority.toUpperCase()} priority${task.dueDate ? ` · Due ${task.dueDate}` : ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], thread: [], pinned: false, edited: false,
    };
    setMessages(prev => [...prev, msg]);
    setShowTaskModal(false);
    setTaskForm({ title: '', assignee: 'u2', dueDate: '', priority: 'medium' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    const cursorPos = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    const hashMatch = textBefore.match(/#(\w*)$/);
    if (atMatch) {
      setMentionDropdown({ show: true, type: '@', query: atMatch[1].toLowerCase(), startIdx: cursorPos - atMatch[0].length });
    } else if (hashMatch) {
      setMentionDropdown({ show: true, type: '#', query: hashMatch[1].toLowerCase(), startIdx: cursorPos - hashMatch[0].length });
    } else {
      setMentionDropdown(null);
    }
  };

  const insertMention = (label: string) => {
    if (!mentionDropdown) return;
    const before = inputText.slice(0, mentionDropdown.startIdx);
    const afterIdx = inputText.indexOf(' ', mentionDropdown.startIdx + 1);
    const after = afterIdx >= 0 ? inputText.slice(afterIdx) : '';
    const insert = mentionDropdown.type === '@' ? `@${label} ` : `#${label} `;
    setInputText(before + insert + after);
    setMentionDropdown(null);
    inputRef.current?.focus();
  };

  const handleAiPanelAction = (action: 'summarize' | 'actionItems' | 'schedule') => {
    const responses: Record<string, string> = {
      summarize: `📝 **Summary of #${currentChannel?.name}**\n\n• ${channelMessages.length} messages today\n• Key topics: team standup, design reviews, CI/CD improvements\n• ${pinnedMsgs.length} pinned message(s)\n• Most active: ${USERS.slice(1, 3).map(u => u.name).join(', ')}\n• Overall sentiment: positive & productive`,
      actionItems: `✅ **Action Items Extracted:**\n\n1. Review dashboard designs in #design channel\n2. Update sprint boards before 10 AM standup\n3. Share Figma link for design review (Priya)\n4. Monitor CI/CD pipeline improvements (Rahul)\n5. Respond to client proposal by EOD`,
      schedule: `📅 **Follow-up Scheduled:**\n\nTime: Tomorrow 9:00 AM\nAgenda: Review today's action items\nInvited: ${USERS.filter(u => u.id !== 'u1').map(u => u.name).join(', ')}\nLocation: #general standup call`,
    };
    setAiPanelMessages(prev => [...prev, { role: 'ai', content: responses[action] }]);
  };

  const sendAiPanelMessage = () => {
    if (!aiChatInput.trim()) return;
    const query = aiChatInput.trim();
    setAiPanelMessages(prev => [...prev, { role: 'user', content: query }]);
    setAiChatInput('');
    const lower = query.toLowerCase();
    let response = '';
    if (lower.includes('summar')) response = `📝 Summary of #${currentChannel?.name}: ${channelMessages.length} messages covering standup, design reviews, and CI/CD work. Team is aligned on sprint goals.`;
    else if (lower.includes('action') || lower.includes('task')) response = `📋 Action items:\n1) Review designs 2) Update sprint board 3) Monitor pipeline 4) Send weekly digest`;
    else if (lower.includes('who') || lower.includes('member')) response = `👥 Members: ${USERS.map(u => `${u.name} (${u.status})`).join(', ')}`;
    else if (lower.includes('suggest') || lower.includes('reply')) response = `💡 Suggested replies:\n• "Got it, I'll look into this"\n• "Let's discuss in tomorrow's standup"\n• "Can you share more details?"`;
    else response = `🤖 Based on #${currentChannel?.name}'s ${channelMessages.length} messages: the team is working on design reviews, CI/CD improvements, and sprint planning. How can I help further?`;
    setTimeout(() => setAiPanelMessages(prev => [...prev, { role: 'ai', content: response }]), 400);
  };

  const statusColor = (s: string) => s === 'online' ? '#22c55e' : s === 'away' ? '#f59e0b' : s === 'busy' ? '#ef4444' : '#6b7280';

  const fileIcon = (type: FileAttachment['type']) => type === 'pdf' ? '📄' : type === 'image' ? '🖼' : type === 'code' ? '💻' : type === 'doc' ? '📝' : '📎';

  const pinnedMsgs = messages.filter(m => pinnedMessages.includes(m.id));

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary,#0f172a)] text-[var(--text-primary,#e2e8f0)]">
      <div className="flex flex-1 overflow-hidden">

        {/* Channel Sidebar */}
        <div className="w-56 bg-[var(--bg-secondary,#1e293b)] border-r border-[var(--border-color,#334155)] flex flex-col">
          <div className="p-3 border-b border-[var(--border-color,#334155)]">
            <h2 className="text-sm font-bold">💬 Vidyalaya Chat</h2>
            <p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Internal Team Communication</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="flex items-center justify-between px-2 mt-2">
              <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider">Channels</p>
              <button onClick={() => setShowChannelModal(true)} className="text-[10px] text-blue-400 hover:text-blue-300" title="Create channel">+</button>
            </div>
            {channels.filter(c => c.type === 'channel').map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${activeChannel === ch.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
                <span className="text-[var(--text-secondary,#94a3b8)]">#</span>
                <span className="flex-1 text-left">{ch.name}</span>
                {ch.unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">{ch.unread}</span>}
              </button>
            ))}
            <p className="px-2 text-[10px] text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider mt-3">Direct Messages</p>
            {channels.filter(c => c.type === 'dm').map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${activeChannel === ch.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
                <span>{ch.icon}</span>
                <span className="flex-1 text-left truncate">{ch.name}</span>
                {ch.unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">{ch.unread}</span>}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-[var(--border-color,#334155)]">
            <div className="flex items-center gap-2 px-2 py-1">
              <span>🙋</span>
              <div className="flex-1">
                <p className="text-xs font-medium">You</p>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">Online</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary,#1e293b)] border-b border-[var(--border-color,#334155)] flex-wrap">
            <span className="text-sm font-semibold">{currentChannel?.type === 'channel' ? '#' : ''} {currentChannel?.name}</span>
            {currentChannel?.description && <span className="text-[10px] text-[var(--text-secondary,#94a3b8)] hidden sm:block">{currentChannel.description}</span>}
            <div className="flex-1" />
            <button onClick={() => { setShowSearch(!showSearch); }} className={`px-2 py-1 rounded text-xs ${showSearch ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`} title="Search">🔍</button>
            <button onClick={() => setShowPinned(!showPinned)} className={`px-2 py-1 rounded text-xs ${showPinned ? 'bg-yellow-600/30 text-yellow-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`} title="Pinned">📌 {pinnedMsgs.length}</button>
            <button onClick={() => { setCallType('voice'); setShowCallModal(true); }} className="px-2 py-1 rounded text-xs hover:bg-[var(--bg-hover,#334155)]" title="Voice call">📞</button>
            <button onClick={() => { setCallType('video'); setShowCallModal(true); }} className="px-2 py-1 rounded text-xs hover:bg-[var(--bg-hover,#334155)]" title="Video call">📹</button>
            <button onClick={() => setShowMembers(!showMembers)} className={`px-2 py-1 rounded text-xs ${showMembers ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>👥 {currentChannel?.members}</button>
            <button onClick={() => setShowTasksPanel(!showTasksPanel)} className={`px-2 py-1 rounded text-xs ${showTasksPanel ? 'bg-orange-600/30 text-orange-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`} title="Tasks">📋 Tasks</button>
            <button onClick={() => setShowAiPanel(!showAiPanel)} className={`px-2 py-1 rounded text-xs ${showAiPanel ? 'bg-purple-600/30 text-purple-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>🤖 AI</button>
          </div>

          {showSearch && (
            <div className="px-4 py-2 bg-[var(--bg-secondary,#1e293b)] border-b border-[var(--border-color,#334155)]">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search messages in this channel..." autoFocus
                className="w-full px-3 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              {searchQuery && <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mt-1">{channelMessages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())).length} results</p>}
            </div>
          )}

          {showPinned && pinnedMsgs.length > 0 && (
            <div className="px-4 py-2 bg-yellow-600/5 border-b border-yellow-600/20">
              <p className="text-[10px] font-semibold text-yellow-400 mb-1">📌 Pinned Messages ({pinnedMsgs.length})</p>
              {pinnedMsgs.map(msg => (
                <div key={msg.id} className="text-[10px] text-[var(--text-secondary,#94a3b8)] py-0.5 flex items-start gap-2">
                  <span>{msg.avatar}</span>
                  <span className="truncate">{msg.content}</span>
                  <button onClick={() => togglePin(msg.id)} className="text-yellow-400 hover:text-yellow-300 shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {channelMessages.filter(m => !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase())).map(msg => (
              <div key={msg.id} className={`flex gap-3 group`}>
                <span className="text-2xl mt-0.5 shrink-0">{msg.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-xs font-semibold ${msg.userId === 'u5' ? 'text-purple-400' : ''}`}>{msg.userName}</span>
                    <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{msg.timestamp}</span>
                    {msg.pinned && <span className="text-[10px] px-1 rounded bg-yellow-600/20 text-yellow-400">📌</span>}
                    {msg.edited && <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">(edited)</span>}
                    {msg.thread.length > 0 && (
                      <button onClick={() => setThreadMessage(msg)} className="text-[10px] text-blue-400 hover:text-blue-300">
                        💬 {msg.thread.length} {msg.thread.length === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm mt-0.5 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* File Attachment */}
                  {msg.attachment && (
                    <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] max-w-xs">
                      <span className="text-lg">{fileIcon(msg.attachment.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{msg.attachment.name}</p>
                        <p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{msg.attachment.size}</p>
                      </div>
                      <button className="text-blue-400 text-xs hover:text-blue-300 shrink-0">⬇</button>
                    </div>
                  )}

                  {/* Poll */}
                  {msg.poll && (
                    <div className="mt-2 p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] max-w-sm">
                      <p className="text-xs font-semibold mb-2">📊 {msg.poll.question}</p>
                      {msg.poll.options.map(opt => {
                        const pct = msg.poll!.totalVotes > 0 ? Math.round((opt.votes / msg.poll!.totalVotes) * 100) : 0;
                        const voted = opt.votedBy.includes('u1');
                        return (
                          <button key={opt.id} onClick={() => votePoll(msg.id, opt.id)} className={`w-full flex items-center gap-2 mb-1.5 rounded px-2 py-1.5 text-xs text-left transition-colors ${voted ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[var(--bg-secondary,#1e293b)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                            <span className="flex-1 truncate">{opt.text}</span>
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-16 bg-[var(--border-color,#334155)] rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{pct}%</span>
                            </div>
                          </button>
                        );
                      })}
                      <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mt-1">{msg.poll.totalVotes} votes {msg.poll.closed ? '· Closed' : ''}</p>
                    </div>
                  )}

                  {/* Checklist */}
                  {msg.checklist && (
                    <div className="mt-2 p-3 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] max-w-sm">
                      <p className="text-[10px] font-semibold text-[var(--text-secondary,#94a3b8)] uppercase tracking-wide mb-2">CHECKLIST · {msg.checklist.items.filter(i => i.checked).length}/{msg.checklist.items.length} done</p>
                      {msg.checklist.items.map(item => (
                        <button key={item.id} onClick={() => toggleChecklistItem(msg.id, item.id)}
                          className="w-full flex items-center gap-2 mb-1.5 text-left hover:bg-[var(--bg-hover,#334155)] px-1 py-0.5 rounded transition-colors">
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 text-[8px] font-bold ${item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--border-color,#334155)]'}`}>
                            {item.checked && '✓'}
                          </span>
                          <span className={`text-xs ${item.checked ? 'line-through text-[var(--text-secondary,#94a3b8)]' : ''}`}>{item.text}</span>
                        </button>
                      ))}
                      <div className="mt-1.5 h-1 bg-[var(--border-color,#334155)] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${msg.checklist.items.length > 0 ? (msg.checklist.items.filter(i => i.checked).length / msg.checklist.items.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {msg.reactions.filter(r => r.count > 0).map((r, i) => (
                        <button key={i} onClick={() => addReaction(msg.id, r.emoji)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${r.reacted ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="hidden group-hover:flex gap-1 mt-1 items-center">
                    {['👍', '❤️', '😂', '🚀', '👀'].map(e => (
                      <button key={e} onClick={() => addReaction(msg.id, e)} className="px-1 py-0.5 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">{e}</button>
                    ))}
                    <button onClick={() => setThreadMessage(msg)} className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover,#334155)] text-[10px] text-[var(--text-secondary,#94a3b8)]">Reply</button>
                    <button onClick={() => togglePin(msg.id)} className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover,#334155)] text-[10px] text-[var(--text-secondary,#94a3b8)]">{pinnedMessages.includes(msg.id) ? 'Unpin' : 'Pin'}</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary,#94a3b8)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary,#94a3b8)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary,#94a3b8)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-[var(--bg-secondary,#1e293b)] border-t border-[var(--border-color,#334155)]">
            {uploadingFile && <p className="text-[10px] text-blue-400 mb-1">⏳ Uploading file...</p>}
            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs" title="Attach file">📎</button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <button onClick={() => setShowPollModal(true)} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs" title="Create poll">📊</button>
              <button onClick={() => setShowChecklistModal(true)} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs" title="Create checklist">☑️</button>
              <button onClick={() => setShowTaskModal(true)} className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs" title="Assign task">📌</button>
              <div className="flex-1 relative">
              {mentionDropdown?.show && (
                <div className="absolute bottom-full left-0 mb-1 bg-[var(--bg-secondary,#1e293b)] border border-[var(--border-color,#334155)] rounded-lg shadow-lg z-10 min-w-[180px] overflow-hidden max-h-48 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] text-[var(--text-secondary,#94a3b8)] border-b border-[var(--border-color,#334155)]">
                    {mentionDropdown.type === '@' ? 'Mention a person' : 'Mention a channel'}
                  </div>
                  {mentionDropdown.type === '@'
                    ? USERS.filter(u => u.name.toLowerCase().includes(mentionDropdown.query)).map(u => (
                        <button key={u.id} onClick={() => insertMention(u.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover,#334155)] text-xs text-left">
                          <span>{u.avatar}</span>
                          <span className="font-medium">{u.name}</span>
                          <span className="text-[var(--text-secondary,#94a3b8)] text-[10px]">{u.role}</span>
                        </button>
                      ))
                    : channels.filter(c => c.name.toLowerCase().includes(mentionDropdown.query)).map(c => (
                        <button key={c.id} onClick={() => insertMention(c.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover,#334155)] text-xs text-left">
                          <span className="text-[var(--text-secondary,#94a3b8)]">#</span>
                          <span>{c.name}</span>
                        </button>
                      ))
                  }
                </div>
              )}
              <input ref={inputRef} value={inputText} onChange={handleInputChange}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { sendMessage(); setMentionDropdown(null); } else if (e.key === 'Escape') setMentionDropdown(null); }}
                placeholder={`Message ${currentChannel?.type === 'channel' ? '#' : ''}${currentChannel?.name || ''}... (try /help, @mention, #channel)`}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <button className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs" title="Emoji">😀</button>
              <button onClick={sendMessage} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs">Send</button>
            </div>
            <div className="flex gap-2 mt-1">
              <button className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 text-[10px] hover:bg-purple-600/30">✨ AI Compose</button>
              <button onClick={() => { setInputText(prev => prev + '@'); inputRef.current?.focus(); }} className="px-2 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)] text-[10px]">@mention</button>
              <button onClick={() => setInputText('/help')} className="px-2 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)] text-[10px]">/command</button>
            </div>
          </div>
        </div>

        {/* Thread Panel */}
        {threadMessage && (
          <div className="w-72 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color,#334155)]">
              <h3 className="text-xs font-semibold">Thread</h3>
              <button onClick={() => setThreadMessage(null)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">✕</button>
            </div>
            <div className="p-3 border-b border-[var(--border-color,#334155)] bg-[var(--bg-tertiary,#0f172a)]/50">
              <div className="flex gap-2">
                <span className="text-lg shrink-0">{threadMessage.avatar}</span>
                <div>
                  <span className="text-xs font-semibold">{threadMessage.userName}</span>
                  <p className="text-xs mt-0.5 text-[var(--text-secondary,#94a3b8)]">{threadMessage.content}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {threadMessage.thread.length === 0 && (
                <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] text-center py-4">No replies yet. Start the thread!</p>
              )}
              {threadMessage.thread.map(reply => (
                <div key={reply.id} className="flex gap-2">
                  <span className="text-base shrink-0">{reply.avatar}</span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold">{reply.userName}</span>
                      <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{reply.timestamp}</span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border-color,#334155)]">
              <div className="flex gap-2">
                <input value={threadInput} onChange={e => setThreadInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendThreadReply()}
                  placeholder="Reply in thread..." className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                <button onClick={sendThreadReply} className="px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs">↵</button>
              </div>
            </div>
          </div>
        )}

        {/* Members Panel */}
        {showMembers && !threadMessage && (
          <div className="w-52 bg-[var(--bg-secondary,#1e293b)] border-l border-[var(--border-color,#334155)] p-3 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)] mb-3">Members ({USERS.length})</h3>
            <div className="space-y-2">
              {USERS.map(u => (
                <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--bg-hover,#334155)] cursor-pointer">
                  <div className="relative"><span className="text-lg">{u.avatar}</span><span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-secondary,#1e293b)]" style={{ backgroundColor: statusColor(u.status) }} /></div>
                  <div><p className="text-xs font-medium">{u.name}</p><p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{u.role}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Panel */}
        {showTasksPanel && !threadMessage && !showMembers && !showAiPanel && (
          <div className="w-64 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color,#334155)]">
              <h3 className="text-xs font-semibold text-orange-400">📋 Tasks</h3>
              <div className="flex gap-1">
                <button onClick={() => setShowTaskModal(true)} className="px-2 py-0.5 rounded bg-orange-600/20 text-orange-400 text-[10px] hover:bg-orange-600/30">+ New</button>
                <button onClick={() => setShowTasksPanel(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {tasks.length === 0 && <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] text-center py-4">No tasks yet. Create one!</p>}
              {tasks.map(task => (
                <div key={task.id} className="p-2.5 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)]">
                  <div className="flex items-start gap-2">
                    <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t))}
                      className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 text-[8px] font-bold ${task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--border-color,#334155)]'}`}>
                      {task.status === 'done' && '✓'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${task.status === 'done' ? 'line-through text-[var(--text-secondary,#94a3b8)]' : ''}`}>{task.title}</p>
                      <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mt-0.5">→ {task.assigneeName}</p>
                      {task.dueDate && <p className="text-[10px] text-[var(--text-secondary,#94a3b8)]">📅 {task.dueDate}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${task.priority === 'high' ? 'bg-red-600/20 text-red-400' : task.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-green-600/20 text-green-400'}`}>
                      {task.priority}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${task.status === 'done' ? 'bg-green-600/20 text-green-400' : task.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' : 'bg-[var(--bg-hover,#334155)] text-[var(--text-secondary,#94a3b8)]'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Chat Panel */}
        {showAiPanel && !threadMessage && !showMembers && (
          <div className="w-72 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color,#334155)]">
              <h3 className="text-xs font-semibold text-purple-400">🤖 AI Chat Assistant</h3>
              <button onClick={() => setShowAiPanel(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">✕</button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* AI Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {aiPanelMessages.map((m, i) => (
                  <div key={i} className={`${m.role === 'user' ? 'ml-4' : 'mr-4'}`}>
                    <div className={`px-3 py-2 rounded-lg text-xs whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600/20 text-blue-100 text-right' : 'bg-[var(--bg-tertiary,#0f172a)] text-[var(--foreground,#e2e8f0)]'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              {/* Quick Actions */}
              <div className="p-2 border-t border-[var(--border-color,#334155)] space-y-1">
                <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1">Quick Actions:</p>
                <button onClick={() => handleAiPanelAction('summarize')} className="w-full px-2 py-1.5 rounded text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-left">✨ Summarize conversation</button>
                <button onClick={() => handleAiPanelAction('actionItems')} className="w-full px-2 py-1.5 rounded text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-left">📋 Extract action items</button>
                <button onClick={() => handleAiPanelAction('schedule')} className="w-full px-2 py-1.5 rounded text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 text-left">📅 Schedule follow-up</button>
                <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] mb-1 mt-2">Smart Replies:</p>
                {['Got it, thanks!', "I'll look into this", 'Let\'s discuss in standup'].map((r, i) => (
                  <button key={i} onClick={() => setInputText(r)} className="w-full text-left px-2 py-1 rounded text-[11px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]">{r}</button>
                ))}
              </div>
              {/* Ask AI Input */}
              <div className="p-2 border-t border-[var(--border-color,#334155)]">
                <div className="flex gap-1">
                  <input value={aiChatInput} onChange={e => setAiChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendAiPanelMessage()}
                    placeholder="Ask about this conversation..." className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                  <button onClick={sendAiPanelMessage} className="px-2 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-xs text-white">↵</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-80 rounded-2xl bg-[var(--bg-secondary,#1e293b)] border border-[var(--border-color,#334155)] overflow-hidden shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4 text-4xl">
                {currentChannel?.type === 'dm' ? currentChannel.icon : '👥'}
              </div>
              <h3 className="text-base font-semibold">{currentChannel?.name}</h3>
              <p className="text-xs text-[var(--text-secondary,#94a3b8)] mt-1">
                {callActive ? (callType === 'video' ? '📹 Video Call' : '📞 Voice Call') + ' · ' + formatCallDuration(callDuration) : `${callType === 'video' ? 'Video' : 'Voice'} Call`}
              </p>
              {callActive && screenSharing && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 text-[10px]">🖥 Screen Sharing</span>
              )}
            </div>

            {callType === 'video' && callActive && !cameraOff && (
              <div className="mx-4 mb-4 h-32 rounded-lg bg-gray-900 flex items-center justify-center border border-[var(--border-color,#334155)]">
                <p className="text-xs text-[var(--text-secondary,#94a3b8)]">📹 Camera Preview</p>
              </div>
            )}

            <div className="flex justify-center gap-3 pb-4 px-4">
              <button onClick={() => setCallMuted(!callMuted)} className={`w-11 h-11 rounded-full flex items-center justify-center text-sm ${callMuted ? 'bg-red-600' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`} title="Mute">
                {callMuted ? '🔇' : '🎤'}
              </button>
              {callType === 'video' && (
                <button onClick={() => setCameraOff(!cameraOff)} className={`w-11 h-11 rounded-full flex items-center justify-center text-sm ${cameraOff ? 'bg-red-600' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`} title="Camera">
                  {cameraOff ? '📷' : '📹'}
                </button>
              )}
              <button onClick={() => setScreenSharing(!screenSharing)} className={`w-11 h-11 rounded-full flex items-center justify-center text-sm ${screenSharing ? 'bg-green-600' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`} title="Screen Share">
                🖥
              </button>
              {!callActive ? (
                <button onClick={() => setCallActive(true)} className="w-11 h-11 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-sm" title="Answer">
                  📞
                </button>
              ) : (
                <button onClick={() => { setCallActive(false); setShowCallModal(false); setScreenSharing(false); setCallMuted(false); setCameraOff(false); }} className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-sm" title="End call">
                  📴
                </button>
              )}
            </div>
            {!callActive && (
              <div className="border-t border-[var(--border-color,#334155)] flex">
                <button onClick={() => { setShowCallModal(false); }} className="flex-1 py-3 text-xs text-[var(--text-secondary,#94a3b8)] hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-80 rounded-xl bg-[var(--bg-secondary,#1e293b)] border border-[var(--border-color,#334155)] p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">📊 Create Poll</h3>
              <button onClick={() => setShowPollModal(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Question</label>
                <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Ask a question..." className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Options</label>
                <div className="space-y-1.5">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-1">
                      <input value={opt} onChange={e => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o); }} placeholder={`Option ${i + 1}`} className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                      {pollOptions.length > 2 && <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 5 && (
                  <button onClick={() => setPollOptions([...pollOptions, ''])} className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300">+ Add option</button>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowPollModal(false)} className="flex-1 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
                <button onClick={createPoll} disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2} className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs">Create Poll</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-80 rounded-xl bg-[var(--bg-secondary,#1e293b)] border border-[var(--border-color,#334155)] p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">☑️ Create Checklist</h3>
              <button onClick={() => setShowChecklistModal(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Title</label>
                <input value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} placeholder="Checklist title..." className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Items</label>
                <div className="space-y-1.5">
                  {newChecklistItems.map((item, i) => (
                    <div key={i} className="flex gap-1">
                      <input value={item} onChange={e => { const items = [...newChecklistItems]; items[i] = e.target.value; setNewChecklistItems(items); }} placeholder={`Item ${i + 1}`} className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                      {newChecklistItems.length > 1 && <button onClick={() => setNewChecklistItems(newChecklistItems.filter((_, j) => j !== i))} className="text-red-400 text-xs px-1">✕</button>}
                    </div>
                  ))}
                </div>
                {newChecklistItems.length < 10 && (
                  <button onClick={() => setNewChecklistItems([...newChecklistItems, ''])} className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300">+ Add item</button>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowChecklistModal(false)} className="flex-1 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
                <button onClick={createChecklist} disabled={!newChecklistItems.filter(i => i.trim()).length} className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Creation Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-80 rounded-xl bg-[var(--bg-secondary,#1e293b)] border border-[var(--border-color,#334155)] p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold"># Create Channel</h3>
              <button onClick={() => setShowChannelModal(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Channel Name</label>
                <input value={channelForm.name} onChange={e => setChannelForm({ ...channelForm, name: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  placeholder="e.g. project-alpha" className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Description</label>
                <input value={channelForm.description} onChange={e => setChannelForm({ ...channelForm, description: e.target.value })}
                  placeholder="What is this channel about?" className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={channelForm.isPrivate} onChange={e => setChannelForm({ ...channelForm, isPrivate: e.target.checked })}
                  className="w-3.5 h-3.5 rounded" />
                <span className="text-xs">{channelForm.isPrivate ? '🔒 Private' : '🌐 Public'} channel</span>
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowChannelModal(false)} className="flex-1 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
                <button disabled={!channelForm.name.trim()} onClick={() => {
                  const newChannel: Channel = {
                    id: `ch-${++channelCounter}`, name: channelForm.name, type: 'channel',
                    icon: '#', unread: 0, members: 1, description: channelForm.description,
                  };
                  setChannels(prev => [...prev, newChannel]);
                  setActiveChannel(newChannel.id);
                  setShowChannelModal(false);
                  setChannelForm({ name: '', description: '', isPrivate: false });
                  const msg: Message = {
                    id: `m${++msgCounter}`, channelId: newChannel.id, userId: 'u5', userName: 'Vidyalaya Bot',
                    avatar: '🤖', content: `Welcome to #${newChannel.name}! ${newChannel.description || 'Start the conversation.'}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    reactions: [], thread: [], pinned: false, edited: false,
                  };
                  setMessages(prev => [...prev, msg]);
                }} className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs">Create Channel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-80 rounded-xl bg-[var(--bg-secondary,#1e293b)] border border-[var(--border-color,#334155)] p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">📌 Assign Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Task Title</label>
                <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Describe the task..." className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Assign To</label>
                <select value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })} className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                  {USERS.filter(u => u.id !== 'u1' && u.id !== 'u5').map(u => (
                    <option key={u.id} value={u.id}>{u.avatar} {u.name} — {u.role}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary,#94a3b8)] block mb-1">Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as 'low'|'medium'|'high' })} className="w-full px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowTaskModal(false)} className="flex-1 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs hover:bg-[var(--bg-hover,#334155)]">Cancel</button>
                <button onClick={createTask} disabled={!taskForm.title.trim()} className="flex-1 py-1.5 rounded bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-xs">Assign Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
