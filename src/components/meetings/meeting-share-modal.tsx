'use client';

import React, { useState } from 'react';
import { useMeetingIntegrationsStore, type FirefliesTranscript } from '@/store/meeting-integrations-store';
import {
  X, Share2, Link2, Mail, Copy, Check, Users, Globe, Lock,
} from 'lucide-react';

export default function MeetingShareModal({
  meeting,
  onClose,
}: {
  meeting: FirefliesTranscript;
  onClose: () => void;
}) {
  const { shareConfigs, shareMeeting, toggleShareLink, removeShare, sendMeetingSummaryEmail } = useMeetingIntegrationsStore();
  const [emailInput, setEmailInput] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const config = shareConfigs[meeting.id] || {
    meetingId: meeting.id, sharedWith: [], shareLink: null, linkEnabled: false, expiresAt: null,
  };

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    shareMeeting(meeting.id, trimmed, permission);
    setEmailInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleCopyLink = () => {
    if (config.shareLink) {
      navigator.clipboard.writeText(config.shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmails = async () => {
    const recipients = config.sharedWith.map((s) => s.email);
    if (recipients.length === 0) return;
    setSending(true);
    await sendMeetingSummaryEmail(meeting.id, recipients);
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] max-h-[80vh] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold">Share Meeting Notes</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Meeting Info */}
          <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <div className="text-xs font-medium">{meeting.title}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(meeting.date).toLocaleDateString()} · {meeting.duration} min · {meeting.meeting_attendees.length} participants
            </div>
          </div>

          {/* Share Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link2 size={14} />
                <span className="text-xs font-medium">Share Link</span>
              </div>
              <button
                onClick={() => toggleShareLink(meeting.id)}
                className={`relative w-9 h-5 rounded-full transition-colors ${config.linkEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.linkEnabled ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
            {config.linkEnabled && config.shareLink && (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-2 py-1.5 rounded border text-[10px] truncate" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
                  {config.shareLink}
                </div>
                <button onClick={handleCopyLink} className="p-1.5 rounded border hover:bg-white/10" style={{ borderColor: 'var(--border)' }}>
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* Add People */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} />
              <span className="text-xs font-medium">Share with People</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="flex-1 px-3 py-1.5 rounded-lg border text-xs bg-transparent outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'view' | 'comment' | 'edit')}
                className="px-2 py-1.5 rounded-lg border text-[10px] bg-transparent outline-none"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="view">View</option>
                <option value="comment">Comment</option>
                <option value="edit">Edit</option>
              </select>
              <button
                onClick={handleAddEmail}
                disabled={!emailInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Shared With List */}
            {config.sharedWith.length > 0 && (
              <div className="mt-2 space-y-1">
                {config.sharedWith.map((share) => (
                  <div key={share.email} className="flex items-center gap-2 px-2 py-1.5 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                      {share.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-[11px]">{share.email}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                      {share.permission === 'view' && <><Globe size={8} className="inline mr-0.5" /> View</>}
                      {share.permission === 'comment' && <><MessageIcon size={8} className="inline mr-0.5" /> Comment</>}
                      {share.permission === 'edit' && <><Lock size={8} className="inline mr-0.5" /> Edit</>}
                    </span>
                    <button onClick={() => removeShare(meeting.id, share.email)} className="p-0.5 rounded hover:bg-red-500/20 text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Email Summary */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} />
              <span className="text-xs font-medium">Email Summary to Participants</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {meeting.meeting_attendees.map((a) => (
                <span key={a.email} className="text-[9px] px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border)' }}>
                  {a.displayName}
                </span>
              ))}
            </div>
            <button
              onClick={handleSendEmails}
              disabled={sending}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50 transition-colors"
            >
              {sent ? '✓ Summary Sent!' : sending ? 'Sending...' : 'Send Summary to All Participants'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tiny inline icon for comment permission label
function MessageIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
