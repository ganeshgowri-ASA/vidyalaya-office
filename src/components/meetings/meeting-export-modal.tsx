'use client';

import React, { useState } from 'react';
import { useMeetingIntegrationsStore, type FirefliesTranscript } from '@/store/meeting-integrations-store';
import { X, Download, FileText, Loader2, Check } from 'lucide-react';

const EXPORT_FORMATS = [
  { id: 'notion' as const, label: 'Notion', icon: '📝', description: 'Export as Notion-compatible blocks' },
  { id: 'google-docs' as const, label: 'Google Docs', icon: '📄', description: 'Export for Google Docs API' },
  { id: 'markdown' as const, label: 'Markdown', icon: '📋', description: 'Export as .md file' },
  { id: 'pdf' as const, label: 'PDF', icon: '📑', description: 'Export as PDF document' },
];

export default function MeetingExportModal({
  meeting,
  onClose,
}: {
  meeting: FirefliesTranscript;
  onClose: () => void;
}) {
  const { exportMeetingNotes } = useMeetingIntegrationsStore();
  const [selectedFormat, setSelectedFormat] = useState<'notion' | 'google-docs' | 'markdown' | 'pdf'>('markdown');
  const [includeTranscript, setIncludeTranscript] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportMeetingNotes(meeting.id, selectedFormat);

      // Create and download file
      const blob = new Blob([result], {
        type: selectedFormat === 'markdown' ? 'text/markdown' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}.${selectedFormat === 'markdown' ? 'md' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => { setExported(false); onClose(); }, 1500);
    } catch {
      // Export failed silently
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[420px] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Download size={16} className="text-green-400" />
            <h3 className="text-sm font-semibold">Export Meeting Notes</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Meeting Info */}
          <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-blue-400" />
              <div>
                <div className="text-xs font-medium">{meeting.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(meeting.date).toLocaleDateString()} · {meeting.summary.action_items.length} action items · {meeting.summary.decisions.length} decisions
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-xs font-medium mb-2 block">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-colors ${
                    selectedFormat === format.id ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-500/30'
                  }`}
                  style={{ borderColor: selectedFormat === format.id ? undefined : 'var(--border)' }}
                >
                  <span className="text-lg">{format.icon}</span>
                  <div>
                    <div className="text-[11px] font-medium">{format.label}</div>
                    <div className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{format.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs">Include full transcript</span>
            </label>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {exported ? (
              <><Check size={14} /> Exported!</>
            ) : exporting ? (
              <><Loader2 size={14} className="animate-spin" /> Exporting...</>
            ) : (
              <><Download size={14} /> Export as {EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.label}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
