'use client';

import React, { useState } from 'react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: string;
  labels: string[];
  attachments: string[];
  priority: 'low' | 'normal' | 'high';
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Inbox', icon: '\uD83D\uDCE5', count: 12 },
  { id: 'starred', name: 'Starred', icon: '\u2B50', count: 3 },
  { id: 'sent', name: 'Sent', icon: '\uD83D\uDCE4', count: 0 },
  { id: 'drafts', name: 'Drafts', icon: '\uD83D\uDCDD', count: 2 },
  { id: 'archive', name: 'Archive', icon: '\uD83D\uDCE6', count: 0 },
  { id: 'spam', name: 'Spam', icon: '\u26A0\uFE0F', count: 1 },
  { id: 'trash', name: 'Trash', icon: '\uD83D\uDDD1\uFE0F', count: 0 },
];

const MOCK_EMAILS: Email[] = [
  { id: '1', from: 'team@vidyalaya.dev', to: 'user@vidyalaya.dev', subject: 'Sprint Planning - Q2 Objectives', body: 'Hi Team,\n\nPlease review the Q2 objectives and prepare your estimates for the upcoming sprint planning session.\n\nKey items:\n- Feature development roadmap\n- Performance optimization targets\n- User feedback integration\n\nBest regards,\nProject Lead', date: '2024-03-15 09:30', read: false, starred: true, folder: 'inbox', labels: ['work'], attachments: ['sprint-plan.pdf'], priority: 'high' },
  { id: '2', from: 'hr@vidyalaya.dev', to: 'user@vidyalaya.dev', subject: 'Policy Update: Remote Work Guidelines', body: 'Dear Team,\n\nWe have updated our remote work policy effective April 1st. Please review the attached document.', date: '2024-03-14 14:15', read: true, starred: false, folder: 'inbox', labels: ['hr'], attachments: ['policy.pdf'], priority: 'normal' },
  { id: '3', from: 'ci@github.com', to: 'user@vidyalaya.dev', subject: 'Build #482 Passed - main branch', body: 'All checks passed for commit abc123f on main branch.\n\nTests: 247 passed, 0 failed\nCoverage: 89.2%', date: '2024-03-14 11:00', read: true, starred: false, folder: 'inbox', labels: ['dev'], attachments: [], priority: 'low' },
  { id: '4', from: 'user@vidyalaya.dev', to: 'client@company.com', subject: 'Re: Project Proposal - Phase 2', body: 'Hi,\n\nPlease find the updated proposal with revised timelines and budget estimates.', date: '2024-03-13 16:45', read: true, starred: false, folder: 'sent', labels: ['client'], attachments: ['proposal-v2.docx'], priority: 'high' },
  { id: '5', from: 'newsletter@tech.io', to: 'user@vidyalaya.dev', subject: 'This Week in Tech: AI Advances', body: 'Top stories this week:\n\n1. New LLM benchmarks released\n2. Cloud computing trends for 2024\n3. Open source spotlight', date: '2024-03-13 08:00', read: false, starred: false, folder: 'inbox', labels: ['newsletter'], attachments: [], priority: 'low' },
];

export function EmailClient() {
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const filteredEmails = emails.filter(e => {
    const matchFolder = activeFolder === 'starred' ? e.starred : e.folder === activeFolder;
    const matchSearch = searchQuery === '' || e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.from.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const toggleStar = (id: string) => setEmails(emails.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  const markRead = (id: string) => setEmails(emails.map(e => e.id === id ? { ...e, read: true } : e));
  const moveToTrash = (id: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };
  const archiveEmail = (id: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, folder: 'archive' } : e));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary,#0f172a)] text-[var(--text-primary,#e2e8f0)]">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-secondary,#1e293b)] border-b border-[var(--border-color,#334155)]">
        <h2 className="text-sm font-semibold">\u2709 Email</h2>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search emails..."
          className="flex-1 max-w-md px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
        <button onClick={() => setShowCompose(true)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">\u2795 Compose</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Folders Sidebar */}
        <div className="w-48 bg-[var(--bg-secondary,#1e293b)] border-r border-[var(--border-color,#334155)] p-2 space-y-0.5">
          {FOLDERS.map(f => (
            <button key={f.id} onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${activeFolder === f.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[var(--bg-hover,#334155)]'}`}>
              <span>{f.icon}</span>
              <span className="flex-1 text-left">{f.name}</span>
              {f.count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-blue-600/30 text-[10px]">{f.count}</span>}
            </button>
          ))}
          <div className="border-t border-[var(--border-color,#334155)] mt-3 pt-3">
            <p className="px-3 text-[10px] text-[var(--text-secondary,#94a3b8)] uppercase tracking-wider mb-1">Labels</p>
            {['work', 'hr', 'dev', 'client', 'newsletter'].map(l => (
              <div key={l} className="flex items-center gap-2 px-3 py-1 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l === 'work' ? '#3b82f6' : l === 'hr' ? '#22c55e' : l === 'dev' ? '#f59e0b' : l === 'client' ? '#ef4444' : '#8b5cf6' }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="w-80 border-r border-[var(--border-color,#334155)] overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary,#94a3b8)]">
              <span className="text-3xl mb-2">\uD83D\uDCEC</span>
              <p className="text-xs">No emails in this folder</p>
            </div>
          ) : filteredEmails.map(email => (
            <div key={email.id} onClick={() => { setSelectedEmail(email); markRead(email.id); }}
              className={`flex flex-col gap-1 px-3 py-2.5 border-b border-[var(--border-color,#334155)] cursor-pointer transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-[var(--bg-hover,#334155)]'} ${!email.read ? 'bg-[var(--bg-tertiary,#0f172a)]' : ''}`}>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }} className="text-xs">{email.starred ? '\u2B50' : '\u2606'}</button>
                <span className={`flex-1 text-xs truncate ${!email.read ? 'font-semibold' : ''}`}>{email.from}</span>
                <span className="text-[10px] text-[var(--text-secondary,#94a3b8)]">{email.date.split(' ')[0]}</span>
              </div>
              <p className={`text-xs truncate ${!email.read ? 'font-medium' : 'text-[var(--text-secondary,#94a3b8)]'}`}>{email.subject}</p>
              <div className="flex gap-1">
                {email.priority === 'high' && <span className="text-[10px] px-1 rounded bg-red-600/20 text-red-400">High</span>}
                {email.attachments.length > 0 && <span className="text-[10px] px-1 rounded bg-[var(--bg-tertiary,#0f172a)] text-[var(--text-secondary,#94a3b8)]">\uD83D\uDCCE {email.attachments.length}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Email Viewer */}
        <div className="flex-1 overflow-y-auto">
          {selectedEmail ? (
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                  <p className="text-xs text-[var(--text-secondary,#94a3b8)] mt-1">From: {selectedEmail.from} | To: {selectedEmail.to}</p>
                  <p className="text-xs text-[var(--text-secondary,#94a3b8)]">{selectedEmail.date}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setComposeData({ to: selectedEmail.from, subject: `Re: ${selectedEmail.subject}`, body: '' }); setShowCompose(true); }} className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-xs">Reply</button>
                  <button onClick={() => archiveEmail(selectedEmail.id)} className="px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] hover:bg-[var(--bg-hover,#334155)] text-xs">Archive</button>
                  <button onClick={() => moveToTrash(selectedEmail.id)} className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs">Delete</button>
                </div>
              </div>
              {selectedEmail.attachments.length > 0 && (
                <div className="flex gap-2">
                  {selectedEmail.attachments.map(a => (
                    <div key={a} className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs">\uD83D\uDCCE {a}</div>
                  ))}
                </div>
              )}
              <div className="bg-[var(--bg-secondary,#1e293b)] rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{selectedEmail.body}</div>
              <div className="border-t border-[var(--border-color,#334155)] pt-3">
                <p className="text-xs text-[var(--text-secondary,#94a3b8)] mb-2">\u2728 AI Quick Actions</p>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-xs hover:bg-purple-600/30">Summarize</button>
                  <button className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-xs hover:bg-purple-600/30">Draft Reply</button>
                  <button className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-xs hover:bg-purple-600/30">Extract Tasks</button>
                  <button className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-xs hover:bg-purple-600/30">Translate</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary,#94a3b8)]">
              <span className="text-4xl mb-3">\u2709\uFE0F</span>
              <p className="text-sm">Select an email to read</p>
              <p className="text-xs mt-1">Or compose a new message</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-end p-4 z-50">
          <div className="w-[500px] bg-[var(--bg-secondary,#1e293b)] rounded-t-xl border border-[var(--border-color,#334155)] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-tertiary,#0f172a)] rounded-t-xl">
              <span className="text-xs font-medium">New Message</span>
              <button onClick={() => setShowCompose(false)} className="text-[var(--text-secondary,#94a3b8)] hover:text-white">\u2715</button>
            </div>
            <div className="p-3 space-y-2">
              <input value={composeData.to} onChange={e => setComposeData({ ...composeData, to: e.target.value })} placeholder="To"
                className="w-full px-3 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              <input value={composeData.subject} onChange={e => setComposeData({ ...composeData, subject: e.target.value })} placeholder="Subject"
                className="w-full px-3 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs" />
              <textarea value={composeData.body} onChange={e => setComposeData({ ...composeData, body: e.target.value })} placeholder="Write your message..."
                rows={8} className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary,#0f172a)] border border-[var(--border-color,#334155)] text-xs resize-none" />
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-[10px] hover:bg-purple-600/30">\u2728 AI Draft</button>
                <button className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-[10px] hover:bg-purple-600/30">\uD83D\uDCCE Attach</button>
                <div className="flex-1" />
                <button onClick={() => setShowCompose(false)} className="px-3 py-1.5 rounded bg-[var(--bg-tertiary,#0f172a)] text-xs">Discard</button>
                <button onClick={() => setShowCompose(false)} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}