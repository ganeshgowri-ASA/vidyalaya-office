'use client';

import React, { useState } from 'react';
import { useMeetingIntegrationsStore } from '@/store/meeting-integrations-store';
import {
  X, Webhook, Plus, Trash2, Check, Loader2, ExternalLink, ToggleLeft, ToggleRight, Zap,
} from 'lucide-react';

const WEBHOOK_EVENTS = [
  'meeting.completed',
  'summary.generated',
  'transcript.ready',
  'action_items.created',
  'comment.added',
  'meeting.shared',
];

const PLATFORM_OPTIONS = [
  { id: 'slack' as const, label: 'Slack', color: 'text-green-400' },
  { id: 'teams' as const, label: 'Microsoft Teams', color: 'text-blue-400' },
  { id: 'discord' as const, label: 'Discord', color: 'text-purple-400' },
  { id: 'custom' as const, label: 'Custom Webhook', color: 'text-gray-400' },
];

export default function WebhookConfigPanel({ onClose }: { onClose: () => void }) {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook, testWebhook } = useMeetingIntegrationsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: ['meeting.completed'] as string[],
    platform: 'slack' as 'slack' | 'teams' | 'discord' | 'custom',
    enabled: true,
    secret: '',
  });

  const handleAdd = () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) return;
    addWebhook(newWebhook);
    setNewWebhook({ name: '', url: '', events: ['meeting.completed'], platform: 'slack', enabled: true, secret: '' });
    setShowAdd(false);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    await testWebhook(id);
    setTestingId(null);
  };

  const toggleEvent = (event: string) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Webhook size={16} className="text-orange-400" />
          <h3 className="text-sm font-semibold">Webhook Configuration</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px]"
          >
            <Plus size={10} /> Add
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Add New Form */}
        {showAdd && (
          <div className="rounded-lg border p-3 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
            <div className="text-xs font-semibold">New Webhook</div>
            <input
              value={newWebhook.name}
              onChange={(e) => setNewWebhook((p) => ({ ...p, name: e.target.value }))}
              placeholder="Webhook name"
              className="w-full px-3 py-1.5 rounded border text-xs bg-transparent outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
            <input
              value={newWebhook.url}
              onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))}
              placeholder="Webhook URL (https://...)"
              className="w-full px-3 py-1.5 rounded border text-xs bg-transparent outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
            <div>
              <label className="text-[10px] font-medium block mb-1">Platform</label>
              <div className="flex gap-1">
                {PLATFORM_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setNewWebhook((prev) => ({ ...prev, platform: p.id }))}
                    className={`px-2 py-1 rounded text-[10px] border ${
                      newWebhook.platform === p.id ? 'border-blue-500 bg-blue-500/10' : ''
                    }`}
                    style={{ borderColor: newWebhook.platform === p.id ? undefined : 'var(--border)' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium block mb-1">Events</label>
              <div className="flex flex-wrap gap-1">
                {WEBHOOK_EVENTS.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-2 py-0.5 rounded text-[9px] border ${
                      newWebhook.events.includes(event) ? 'border-green-500 bg-green-500/10 text-green-400' : ''
                    }`}
                    style={{ borderColor: newWebhook.events.includes(event) ? undefined : 'var(--border)' }}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={newWebhook.secret}
              onChange={(e) => setNewWebhook((p) => ({ ...p, secret: e.target.value }))}
              placeholder="Signing secret (optional)"
              className="w-full px-3 py-1.5 rounded border text-xs bg-transparent outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded text-xs hover:bg-white/10">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!newWebhook.name.trim() || !newWebhook.url.trim()}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Existing Webhooks */}
        {webhooks.length === 0 && !showAdd ? (
          <div className="flex flex-col items-center justify-center h-48 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <Zap size={24} className="mb-2 opacity-50" />
            <p className="text-[11px]">No webhooks configured</p>
            <p className="text-[10px]">Add a webhook to receive meeting notifications</p>
          </div>
        ) : (
          webhooks.map((wh) => (
            <div key={wh.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => updateWebhook(wh.id, { enabled: !wh.enabled })}
                  title={wh.enabled ? 'Disable' : 'Enable'}
                >
                  {wh.enabled ? (
                    <ToggleRight size={16} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={16} className="text-gray-500" />
                  )}
                </button>
                <span className="text-xs font-medium flex-1">{wh.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  PLATFORM_OPTIONS.find((p) => p.id === wh.platform)?.color || ''
                } bg-white/5`}>
                  {wh.platform}
                </span>
              </div>

              <div className="text-[10px] truncate mb-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                <ExternalLink size={9} />
                {wh.url}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {wh.events.map((e) => (
                  <span key={e} className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{e}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                  {wh.lastTriggered ? `Last triggered: ${new Date(wh.lastTriggered).toLocaleString()}` : 'Never triggered'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTest(wh.id)}
                    disabled={testingId === wh.id}
                    className="px-2 py-0.5 rounded text-[9px] border hover:bg-white/10 disabled:opacity-50"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {testingId === wh.id ? <Loader2 size={10} className="animate-spin" /> : 'Test'}
                  </button>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
