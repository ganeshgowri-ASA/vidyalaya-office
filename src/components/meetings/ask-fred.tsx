'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMeetingIntegrationsStore } from '@/store/meeting-integrations-store';
import { X, Send, Sparkles, Trash2, FileText, Loader2 } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What action items were assigned last week?',
  'What decisions were made about the API?',
  'Summarize the client demo feedback',
  'Who is responsible for QA testing?',
  'What are the upcoming deadlines?',
];

export default function AskFred({ onClose }: { onClose: () => void }) {
  const { askFredMessages, askFredLoading, askFred, clearAskFred } = useMeetingIntegrationsStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [askFredMessages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || askFredLoading) return;
    setInput('');
    askFred(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold">AskFred</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">AI</span>
        </div>
        <div className="flex items-center gap-1">
          {askFredMessages.length > 0 && (
            <button onClick={clearAskFred} className="p-1 rounded hover:bg-white/10" title="Clear conversation">
              <Trash2 size={12} />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {askFredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles size={32} className="text-yellow-400 mb-3" />
            <h4 className="text-sm font-semibold mb-1">Ask Fred anything about your meetings</h4>
            <p className="text-[11px] mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Search across all transcripts, action items, decisions, and notes
            </p>
            <div className="space-y-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); askFred(q); }}
                  className="w-full text-left px-3 py-2 rounded-lg border text-[11px] transition-colors hover:border-yellow-500/50"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {askFredMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : ''
              }`}
              style={msg.role === 'assistant' ? { backgroundColor: 'var(--card, #111827)', border: '1px solid var(--border)' } : {}}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles size={10} className="text-yellow-400" />
                  <span className="text-[9px] font-semibold text-yellow-400">Fred</span>
                </div>
              )}
              <div className="text-[11px] whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[9px] font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Sources</div>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="flex items-start gap-1.5 py-1">
                      <FileText size={10} className="text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-medium">{src.meetingTitle}</div>
                        <div className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                          {new Date(src.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[8px] mt-1" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {askFredLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 border" style={{ backgroundColor: 'var(--card, #111827)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-yellow-400" />
                <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Fred is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card, #111827)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your meetings..."
            className="flex-1 bg-transparent text-xs outline-none"
            disabled={askFredLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || askFredLoading}
            className="p-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
