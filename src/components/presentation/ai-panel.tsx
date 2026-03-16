'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, FileText, ListOrdered, Mic } from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Generate Content', icon: Sparkles, prompt: 'Generate engaging content for the current slide. The slide title is: ' },
  { label: 'Create Outline', icon: ListOrdered, prompt: 'Create a presentation outline with 5-7 slides for a presentation about: ' },
  { label: 'Speaker Notes', icon: Mic, prompt: 'Write detailed speaker notes for a slide titled: ' },
];

export default function AIPanel() {
  const { showAIPanel, setShowAIPanel, slides, activeSlideIndex } = usePresentationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!showAIPanel) return null;

  const currentSlide = slides[activeSlideIndex];
  const slideTitle = currentSlide?.elements.find(
    (el) => el.type === 'text' && el.style.fontWeight === 'bold',
  )?.content || 'Untitled';

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
          system:
            'You are a presentation assistant helping create compelling slides. ' +
            `The current presentation has ${slides.length} slides. ` +
            `The active slide (#${activeSlideIndex + 1}) title is: "${slideTitle}". ` +
            'Provide concise, actionable suggestions for presentation content, speaker notes, and slide improvements. ' +
            'Format your responses with bullet points when listing items.',
        }),
      });

      if (!res.ok) {
        throw new Error('AI request failed');
      }

      const data = await res.json();
      const assistantContent =
        data.content?.[0]?.text || data.content || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to connect to AI. Please check your API key configuration.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full border-l no-print"
      style={{
        width: 300,
        minWidth: 300,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} />
          AI Assistant
        </div>
        <button onClick={() => setShowAIPanel(false)} className="p-1 rounded hover:opacity-80">
          <X size={16} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="p-2 border-b space-y-1" style={{ borderColor: 'var(--border)' }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => sendMessage(action.prompt + slideTitle)}
            disabled={loading}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity text-left"
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            <action.icon size={14} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-xs py-8" style={{ color: 'var(--muted-foreground)' }}>
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            Ask me to help with your presentation content, speaker notes, or slide ideas.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs rounded-lg px-3 py-2 ${
              msg.role === 'user' ? 'ml-4' : 'mr-4'
            }`}
            style={{
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--muted)',
              color: msg.role === 'user' ? 'var(--primary-foreground)' : 'var(--foreground)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs px-3 py-2 rounded-lg mr-4" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about slides..."
            className="flex-1 px-2 py-1.5 rounded text-xs outline-none border"
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-1.5 rounded"
            style={{ color: 'var(--primary)' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
