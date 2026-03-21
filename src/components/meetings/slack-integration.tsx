'use client';

import React, { useState } from 'react';
import { useMeetingIntegrationsStore, type FirefliesTranscript } from '@/store/meeting-integrations-store';
import { X, Hash, Lock, Check, Loader2, Send } from 'lucide-react';

export default function SlackIntegration({
  meeting,
  onClose,
}: {
  meeting: FirefliesTranscript | null;
  onClose: () => void;
}) {
  const {
    slackChannels, slackConnected, slackDefaultChannel,
    connectSlack, disconnectSlack, setSlackDefaultChannel, postToSlack,
  } = useMeetingIntegrationsStore();

  const [selectedChannel, setSelectedChannel] = useState(slackDefaultChannel || '');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [includeDecisions, setIncludeDecisions] = useState(true);

  const handlePost = async () => {
    if (!meeting || !selectedChannel) return;
    setPosting(true);
    await postToSlack(selectedChannel, meeting.id);
    setPosting(false);
    setPosted(true);
    setTimeout(() => { setPosted(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[400px] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <SlackIcon size={16} />
            <h3 className="text-sm font-semibold">Post to Slack</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!slackConnected ? (
            <div className="text-center py-6">
              <SlackIcon size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Connect your Slack workspace to post meeting summaries
              </p>
              <button
                onClick={connectSlack}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
              >
                Connect to Slack
              </button>
            </div>
          ) : (
            <>
              {/* Meeting Preview */}
              {meeting && (
                <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
                  <div className="text-xs font-medium">{meeting.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(meeting.date).toLocaleDateString()} · {meeting.duration} min
                  </div>
                  <div className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                    {meeting.summary.overview}
                  </div>
                </div>
              )}

              {/* Channel Selection */}
              <div>
                <label className="text-xs font-medium block mb-2">Select Channel</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {slackChannels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-colors ${
                        selectedChannel === ch.id ? 'border-blue-500 bg-blue-500/10' : 'hover:bg-white/5'
                      }`}
                      style={{ borderColor: selectedChannel === ch.id ? undefined : 'var(--border)' }}
                    >
                      {ch.isPrivate ? <Lock size={12} /> : <Hash size={12} />}
                      <span className="flex-1">{ch.name}</span>
                      {selectedChannel === ch.id && <Check size={12} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-xs font-medium block">Include in Summary</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeActionItems} onChange={(e) => setIncludeActionItems(e.target.checked)} className="rounded" />
                  <span className="text-[11px]">Action Items ({meeting?.summary.action_items.length || 0})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeDecisions} onChange={(e) => setIncludeDecisions(e.target.checked)} className="rounded" />
                  <span className="text-[11px]">Decisions ({meeting?.summary.decisions.length || 0})</span>
                </label>
              </div>

              {/* Default Channel */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                  Set as default channel
                </span>
                <button
                  onClick={() => setSlackDefaultChannel(selectedChannel || null)}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  {slackDefaultChannel === selectedChannel ? 'Default ✓' : 'Set Default'}
                </button>
              </div>

              {/* Post Button */}
              <button
                onClick={handlePost}
                disabled={!selectedChannel || !meeting || posting}
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {posted ? (
                  <><Check size={14} /> Posted!</>
                ) : posting ? (
                  <><Loader2 size={14} className="animate-spin" /> Posting...</>
                ) : (
                  <><Send size={14} /> Post to {slackChannels.find((c) => c.id === selectedChannel)?.name || 'Slack'}</>
                )}
              </button>

              {/* Disconnect */}
              <div className="text-center">
                <button onClick={disconnectSlack} className="text-[10px] text-red-400 hover:underline">
                  Disconnect Slack
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SlackIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}
