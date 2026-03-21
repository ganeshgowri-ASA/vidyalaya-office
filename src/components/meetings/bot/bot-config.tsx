'use client';

import React from 'react';
import { Bot, Save, RotateCcw, Bell, Globe, Mic, Video, Zap } from 'lucide-react';
import { useMeetingBotStore, BotBehavior } from '@/store/meeting-bot-store';

const BEHAVIOR_OPTIONS: { value: BotBehavior; label: string; description: string }[] = [
  { value: 'record_only', label: 'Record Only', description: 'Bot joins silently and records the meeting' },
  { value: 'transcribe_only', label: 'Transcribe Only', description: 'Bot joins and provides real-time transcription' },
  { value: 'full_participation', label: 'Full Participation', description: 'Bot records, transcribes, and can respond to commands' },
];

const AVATAR_COLORS = ['#6366f1', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'auto', label: 'Auto-detect' },
];

export default function BotConfig() {
  const { botConfig, updateBotConfig, resetBotConfig } = useMeetingBotStore();
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: botConfig.avatarColor }}
          >
            {botConfig.avatar}
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Bot Configuration</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Set up your meeting bot&apos;s identity and behavior</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetBotConfig}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: saved ? '#10b981' : 'var(--primary)' }}
          >
            <Save size={14} />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Identity Section */}
      <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          <Bot size={16} />
          Bot Identity
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Bot Name</label>
            <input
              type="text"
              value={botConfig.name}
              onChange={(e) => updateBotConfig({ name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              placeholder="Enter bot name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Avatar Initials</label>
            <input
              type="text"
              value={botConfig.avatar}
              onChange={(e) => updateBotConfig({ avatar: e.target.value.toUpperCase().slice(0, 2) })}
              maxLength={2}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              placeholder="VB"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Avatar Color</label>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateBotConfig({ avatarColor: color })}
                className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  outline: botConfig.avatarColor === color ? '2px solid var(--foreground)' : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Behavior Section */}
      <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          <Zap size={16} />
          Bot Behavior
        </h3>

        <div className="space-y-2">
          {BEHAVIOR_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
              style={{
                borderColor: botConfig.behavior === opt.value ? 'var(--primary)' : 'var(--border)',
                backgroundColor: botConfig.behavior === opt.value ? 'var(--primary)' + '15' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="behavior"
                value={opt.value}
                checked={botConfig.behavior === opt.value}
                onChange={() => updateBotConfig({ behavior: opt.value })}
                className="accent-[var(--primary)]"
              />
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{opt.label}</span>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Recording Settings */}
      <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          <Mic size={16} />
          Recording Settings
        </h3>

        <div className="space-y-3">
          <ToggleRow
            icon={<Mic size={14} />}
            label="Record Audio"
            description="Capture meeting audio"
            checked={botConfig.recordAudio}
            onChange={(v) => updateBotConfig({ recordAudio: v })}
          />
          <ToggleRow
            icon={<Video size={14} />}
            label="Record Video"
            description="Capture meeting video feed"
            checked={botConfig.recordVideo}
            onChange={(v) => updateBotConfig({ recordVideo: v })}
          />
          <ToggleRow
            icon={<Globe size={14} />}
            label="Auto-Transcribe"
            description="Generate transcript from recordings"
            checked={botConfig.autoTranscribe}
            onChange={(v) => updateBotConfig({ autoTranscribe: v })}
          />
          <ToggleRow
            icon={<Bell size={14} />}
            label="Notify Host"
            description="Send notification to host when bot joins"
            checked={botConfig.notifyHost}
            onChange={(v) => updateBotConfig({ notifyHost: v })}
          />
        </div>
      </div>

      {/* Auto-Join Settings */}
      <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          <Globe size={16} />
          Auto-Join & Language
        </h3>

        <ToggleRow
          icon={<Zap size={14} />}
          label="Auto-Join Meetings"
          description="Automatically join scheduled meetings"
          checked={botConfig.autoJoin}
          onChange={(v) => updateBotConfig({ autoJoin: v })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Join Before (minutes)</label>
            <input
              type="number"
              min={0}
              max={15}
              value={botConfig.joinBeforeMinutes}
              onChange={(e) => updateBotConfig({ joinBeforeMinutes: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Leave After (minutes)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={botConfig.leaveAfterMinutes}
              onChange={(e) => updateBotConfig({ leaveAfterMinutes: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Language</label>
          <select
            value={botConfig.language}
            onChange={(e) => updateBotConfig({ language: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
        <div>
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</span>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--muted)' }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}
