'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  { id: 'm2', channelId: 'general', userId: 'u2', userName: 'Priya Sharma', avatar: '👩‍💻', content: 'The new dashboard designs are ready for review. Check #design channel.', timestamp: '09:32 AM', reactions: [{ emoji: '🎉', count: 2, reacted: false }], thread: [], pinned: false, edited: false },
  { id: 'm3', channelId: 'general', userId: 'u3', userName: 'Rahul Verma', avatar: '👨‍🔧', content: 'CI/CD pipeline optimization complete. Build times reduced by 40%.', timestamp: '10:05 AM', reactions: [{ emoji: '🚀', count: 6, reacted: true }, { emoji: '🔥', count: 3, reacted: false }], thread: [], pinned: false, edited: false },
  { id: 'm4', channelId: 'general', userId: 'u5', userName: 'Vidyalaya Bot', avatar: '🤖', content: '✨ Daily digest: 3 PRs merged, 2 issues closed, 1 new deployment to staging.', timestamp: '10:30 AM', reactions: [], thread: [], pinned: false, edited: false },
  { id: 'm5', channelId: 'engineering', userId: 'u1', userName: 'You', avatar: '🙋', content: 'Working on the graphics editor component. SVG canvas with shape tools is done.', timestamp: '11:00 AM', reactions: [{ emoji: '💯', count: 2, reacted: false }], thread: [], pinned: false, edited: false },
  { id: 'm6', channelId: 'engineering', userId: 'u3', userName: 'Rahul Verma', avatar: '👨‍🔧', content: 'Nice! Can you add export to PNG/SVG support?', timestamp: '11:15 AM', reactions: [], thread: [], pinned: false, edited: false },
];

let msgCounter = 10;

export function ChatEngine() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [activeChannel, setActiveChannel] = useState('general');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages.filter(m => m.channelId === activeChannel);
  const currentChannel = CHANNELS.find(c => c.id === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: `m${++msgCounter}`, channelId: activeChannel, userId: 'u1', userName: 'You',
      avatar: '🙋', content: inputText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], thread: [], pinned: false, edited: false,
    };
    setMessages([...messages, msg]);
    setInputText('');
  };

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

  const statusColor = (s: string) => s === 'online' ? '#22c55e' : s === 'away' ? '#f59e0b' : s === 'busy' ? '#ef4444' : '#6b7280';

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
            <p className="px-2 text-[10px] text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider mt-2">Channels</p>
            {CHANNELS.filter(c => c.type === 'channel').map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${activeChannel === ch.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
                <span className="text-[var(--text-secondary,#94a3b8)]">#</span>
                <span className="flex-1 text-left">{ch.name}</span>
                {ch.unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">{ch.unread}</span>}
              </button>
            ))}
            <p className="px-2 text-[10px] text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider mt-3">Direct Messages</p>
            {CHANNELS.filter(c => c.type === 'dm').map(ch => (
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
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-secondary,#1e293b)] border-b border-[var(--border-color,#334155)]">
            <span className="text-sm font-semibold">{currentChannel?.type === 'channel' ? '#' : ''} {currentChannel?.name}</span>
            {currentChannel?.description && <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{currentChannel.description}</span>}
            <div className="flex-1" />
            <button onClick={() => setShowSearch(!showSearch)} className={`px-2 py-1 rounded text-xs ${showSearch ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>🔍</button>
            <button onClick={() => setShowMembers(!showMembers)} className={`px-2 py-1 rounded text-xs ${showMembers ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>👥 {currentChannel?.members}</button>
                        <button onClick={() => setShowAiPanel(!showAiPanel)} className={`px-2 py-1 rounded text-xs ${showAiPanel ? 'bg-purple-600/30 text-purple-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>🤖 AI</button>
          </div>
          {showSearch && (
            <div className="px-4 py-2 bg-[var(--bg-secondary,#1e293b)] border-b border-[var(--border-color,#334155)]">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search messages..." autoFocus
                className="w-full px-3 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {channelMessages.filter(m => !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase())).map(msg => (
              <div key={msg.id} className={`flex gap-3 group ${msg.userId === 'u1' ? '' : ''}`}>
                <span className="text-2xl mt-0.5">{msg.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${msg.userId === 'u5' ? 'text-purple-400' : ''}`}>{msg.userName}</span>
                    <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{msg.timestamp}</span>
                    {msg.pinned && <span className="text-[10px] px-1 rounded bg-yellow-600/20 text-yellow-400">📌 Pinned</span>}
                    {msg.edited && <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">(edited)</span>}
                  </div>
                  <p className="text-sm mt-0.5 leading-relaxed">{msg.content}</p>
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.reactions.map((r, i) => (
                        <button key={i} onClick={() => addReaction(msg.id, r.emoji)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${r.reacted ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)]'}`}>
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="hidden group-hover:flex gap-1 mt-1">
                    {['👍', '❤️', '😂', '🚀', '👀'].map(e => (
                      <button key={e} onClick={() => addReaction(msg.id, e)} className="px-1 py-0.5 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">{e}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-[var(--bg-secondary,#1e293b)] border-t border-[var(--border-color,#334155)]">
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">➕</button>
              <input value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={`Message #${currentChannel?.name || ''}...`}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              <button className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">😀</button>
              <button className="px-2 py-1 rounded hover:bg-[var(--bg-hover,#334155)] text-xs">📎</button>
              <button onClick={sendMessage} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs">Send</button>
            </div>
            <div className="flex gap-2 mt-1">
              <button className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 text-[10px] hover:bg-purple-600/30">✨ AI Compose</button>
              <button className="px-2 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)] text-[10px]">@mention</button>
              <button className="px-2 py-0.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)] text-[10px]">/command</button>
            </div>
          </div>
        </div>

        {/* Members Panel */}
        {showMembers && (
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
                {/* AI Chat Assistant Panel */}
        {showAiPanel && (<div className="w-72 border-l border-[var(--border-color,#334155)] bg-[var(--bg-secondary,#1e293b)] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-[var(--border-color,#334155)]">
            <h3 className="text-xs font-semibold text-purple-400">🤖 AI Chat Assistant</h3>
            <button onClick={() => setShowAiPanel(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white text-sm">✕</button>
          </div>
          <div className="flex-1 p-3 space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">Smart Replies</p>
              {['Got it, thanks!','I\'ll look into this','Can we discuss this in a meeting?','Sounds good, let\'s proceed','I need more details on this','Let me check and get back to you'].map((r,i) => (<button key={i} onClick={() => { setInputText(r); }} className="w-full text-left px-2 py-1.5 rounded text-[11px] bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] transition-colors">{r}</button>))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">Channel Stats</p>
              <div className="px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[var(--text-secondary,#94a3b8)]">Messages</span><span className="text-blue-400 font-semibold">{channelMessages.length}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary,#94a3b8)]">Channel</span><span className="text-green-400 font-semibold">{currentChannel?.name}</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">AI Actions</p>
              <button className="w-full px-2 py-1.5 rounded text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400">✨ Summarize conversation</button>
              <button className="w-full px-2 py-1.5 rounded text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400">📋 Extract action items</button>
              <button className="w-full px-2 py-1.5 rounded text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400">📅 Schedule follow-up</button>
              <button className="w-full px-2 py-1.5 rounded text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400">🔍 Search in messages</button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary,#94a3b8)]">Ask AI</p>
              <div className="flex gap-2"><input value={aiChatInput} onChange={e => setAiChatInput(e.target.value)} placeholder="Ask anything..." className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs"/><button className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-xs text-white">Go</button></div>
            </div>
          </div>
        </div>)}
      </div>

    </div>
  );
}
