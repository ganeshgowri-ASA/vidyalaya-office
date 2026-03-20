'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useResearchStore } from '@/store/research-store';
import { slashCommandRegistry } from '@/lib/ai/slash-commands';
import type { SlashCommandContext } from '@/lib/ai/slash-commands';
import { cn } from '@/lib/utils';
import {
  Sparkles, Send, Plus, Trash2, Edit3, Check, X, ChevronDown,
  MessageSquare, Clock, Download, Loader2, Bot, User, Copy,
  Zap, Brain, Gauge, Hash, CornerDownLeft,
} from 'lucide-react';

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4' as const, label: 'Claude Sonnet 4', desc: 'Fast & capable', icon: Zap },
  { value: 'claude-opus-4' as const, label: 'Claude Opus 4', desc: 'Most intelligent', icon: Brain },
  { value: 'claude-haiku' as const, label: 'Claude Haiku', desc: 'Fastest responses', icon: Gauge },
];

const EFFORT_OPTIONS = [
  { value: 'low' as const, label: 'Low', desc: 'Quick answers' },
  { value: 'medium' as const, label: 'Medium', desc: 'Balanced' },
  { value: 'high' as const, label: 'High', desc: 'Deep reasoning' },
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
    `<pre class="rounded p-2 my-1 text-[11px] overflow-x-auto" style="background-color:var(--background)"><code>${code.trim()}</code></pre>`
  );
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded text-[11px]" style="background-color:var(--background)">$1</code>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}

function SlashCommandMenu({
  filter,
  onSelect,
  visible,
}: {
  filter: string;
  onSelect: (name: string) => void;
  visible: boolean;
}) {
  const commands = filter
    ? slashCommandRegistry.search(filter.replace('/', ''))
    : slashCommandRegistry.getAll();

  if (!visible || commands.length === 0) return null;

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="px-2 py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] opacity-50 font-medium uppercase tracking-wider">Slash Commands</p>
      </div>
      {commands.map((cmd) => (
        <button
          key={cmd.name}
          onClick={() => onSelect(cmd.name)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'transparent' }}
        >
          <span className="text-sm">{cmd.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">/{cmd.name}</p>
            <p className="text-[10px] opacity-50 truncate">{cmd.description}</p>
          </div>
          <span className="text-[10px] opacity-30">{cmd.usage}</span>
        </button>
      ))}
    </div>
  );
}

function SessionList({
  onClose,
}: {
  onClose: () => void;
}) {
  const {
    aiChatSessions, activeAIChatSessionId, setActiveAIChatSession,
    deleteAIChatSession, renameAIChatSession, createAIChatSession,
  } = useResearchStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <h4 className="text-xs font-semibold">Chat Sessions</h4>
        <div className="flex gap-1">
          <button
            onClick={() => { createAIChatSession(); onClose(); }}
            className="p-1 rounded hover:opacity-80"
            title="New session"
          >
            <Plus size={13} />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:opacity-80">
            <X size={13} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {aiChatSessions.length === 0 && (
          <p className="text-[10px] opacity-40 text-center py-6">No sessions yet</p>
        )}
        {aiChatSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              'flex items-center gap-2 px-2 py-2 cursor-pointer border-b transition-opacity',
              session.id === activeAIChatSessionId ? 'opacity-100' : 'opacity-60 hover:opacity-80'
            )}
            style={{
              borderColor: 'var(--border)',
              backgroundColor: session.id === activeAIChatSessionId ? 'var(--sidebar-accent)' : 'transparent',
            }}
            onClick={() => { setActiveAIChatSession(session.id); onClose(); }}
          >
            <MessageSquare size={12} className="shrink-0" />
            <div className="flex-1 min-w-0">
              {editingId === session.id ? (
                <div className="flex gap-1">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 text-xs px-1 py-0.5 rounded border outline-none"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { renameAIChatSession(session.id, editTitle); setEditingId(null); }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button onClick={(e) => { e.stopPropagation(); renameAIChatSession(session.id, editTitle); setEditingId(null); }}>
                    <Check size={11} />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs truncate font-medium">{session.title}</p>
                  <p className="text-[9px] opacity-40 flex items-center gap-1">
                    <Clock size={8} />
                    {formatTime(session.updatedAt)}
                    <span>· {session.messages.length} msgs</span>
                  </p>
                </>
              )}
            </div>
            {editingId !== session.id && (
              <div className="flex gap-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingId(session.id); setEditTitle(session.title); }}
                  className="p-0.5 rounded hover:opacity-80"
                  title="Rename"
                >
                  <Edit3 size={10} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAIChatSession(session.id); }}
                  className="p-0.5 rounded hover:opacity-80 text-red-400"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIChatAssistant() {
  const {
    sections, activeSection, citations,
    selectedTemplateId, journalTemplates,
    aiChatSessions, activeAIChatSessionId, aiChatModel, aiChatReasoningEffort,
    aiChatLoading,
    createAIChatSession, addAIChatMessage, updateAIChatMessage,
    setAIChatModel, setAIChatReasoningEffort, setAIChatLoading,
    getActiveAIChatSession,
  } = useResearchStore();

  const [input, setInput] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = getActiveAIChatSession();
  const activeS = sections.find((s) => s.id === activeSection);
  const template = journalTemplates.find((t) => t.id === selectedTemplateId);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, aiChatLoading]);

  // Build context for slash commands
  const buildContext = useCallback((): SlashCommandContext => ({
    args: '',
    sectionContent: activeS?.content || '',
    sectionTitle: activeS?.title || 'Untitled',
    allSections: sections.map((s) => ({ title: s.title, content: s.content })),
    citations: citations.map((c) => ({ key: c.key, title: c.title, authors: c.authors, year: c.year })),
    templateName: template?.name || 'Default',
  }), [activeS, sections, citations, template]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || aiChatLoading) return;

    let sessionId = activeAIChatSessionId;
    if (!sessionId) {
      sessionId = createAIChatSession();
    }

    const content = input.trim();
    setInput('');
    setShowSlashMenu(false);

    // Check for slash command
    const parsed = slashCommandRegistry.parse(content);
    let finalPrompt = content;
    let systemCtx = '';
    let slashLabel: string | undefined;

    if (parsed) {
      const ctx = buildContext();
      const result = slashCommandRegistry.execute(content, ctx);
      if (result) {
        finalPrompt = result.prompt;
        systemCtx = result.systemContext;
        slashLabel = result.label;
      }
    }

    // Add user message
    addAIChatMessage(sessionId, {
      role: 'user',
      content,
      model: aiChatModel,
      slashCommand: slashLabel,
    });

    // Add placeholder assistant message
    const placeholderId = `msg-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    addAIChatMessage(sessionId, {
      role: 'assistant',
      content: '',
      model: aiChatModel,
      isStreaming: true,
    });

    setAIChatLoading(true);

    try {
      // Build context-aware system prompt
      const sectionContext = activeS
        ? `\n\nCurrent section: "${activeS.title}" (${activeS.wordCount} words)\nContent excerpt: ${activeS.content.slice(0, 500)}${activeS.content.length > 500 ? '...' : ''}`
        : '';
      const templateContext = template ? `\nTemplate: ${template.name} (${template.category})` : '';
      const citationContext = citations.length > 0
        ? `\nReferences (${citations.length}): ${citations.slice(0, 5).map((c) => c.key).join(', ')}${citations.length > 5 ? '...' : ''}`
        : '';

      const systemPrompt = systemCtx || `You are an AI research assistant embedded in an academic paper editor. Help with scientific writing, citations, methodology, and academic conventions.${sectionContext}${templateContext}${citationContext}`;

      const res = await fetch('/api/research-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalPrompt,
          mode: 'chat',
          domain: 'Research',
          systemPrompt,
          model: aiChatModel,
          reasoningEffort: aiChatReasoningEffort,
        }),
      });

      const data = await res.json() as { response?: string; error?: string };
      const responseText = data.response || data.error || 'No response received. Check your API configuration in Settings.';

      // Update the last assistant message in the session
      const currentSession = useResearchStore.getState().aiChatSessions.find((s) => s.id === sessionId);
      const lastAssistantMsg = currentSession?.messages.filter((m) => m.role === 'assistant').pop();
      if (lastAssistantMsg) {
        updateAIChatMessage(sessionId, lastAssistantMsg.id, responseText);
      }
    } catch {
      const currentSession = useResearchStore.getState().aiChatSessions.find((s) => s.id === sessionId);
      const lastAssistantMsg = currentSession?.messages.filter((m) => m.role === 'assistant').pop();
      if (lastAssistantMsg) {
        updateAIChatMessage(sessionId, lastAssistantMsg.id, 'Sorry, an error occurred. Please check your API configuration in Settings.');
      }
    } finally {
      setAIChatLoading(false);
    }
  }, [input, aiChatLoading, activeAIChatSessionId, createAIChatSession, addAIChatMessage, updateAIChatMessage, setAIChatLoading, aiChatModel, aiChatReasoningEffort, activeS, template, citations, buildContext]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setShowSlashMenu(val.startsWith('/') && !val.includes(' '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSlashSelect = (name: string) => {
    setInput(`/${name} `);
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportSession = () => {
    if (!activeSession) return;
    const text = activeSession.messages
      .map((m) => `[${m.role.toUpperCase()}] ${formatTime(m.timestamp)}\n${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedModel = MODEL_OPTIONS.find((m) => m.value === aiChatModel)!;

  // Quick context actions based on current section
  const quickActions = [
    { label: 'Review section', cmd: '/review' },
    { label: 'Find citations', cmd: '/cite' },
    { label: 'Check grammar', cmd: '/check-grammar' },
    { label: 'Summarize', cmd: '/summarize' },
    { label: 'Expand content', cmd: '/expand' },
    { label: 'Condense', cmd: '/condense' },
  ];

  if (showSessions) {
    return <SessionList onClose={() => setShowSessions(false)} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              <Bot size={12} className="text-white" />
            </div>
            <h3 className="text-xs font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSessions(true)}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              title="Chat sessions"
            >
              <Clock size={12} />
            </button>
            {activeSession && (
              <button
                onClick={exportSession}
                className="p-1 rounded hover:opacity-80 transition-opacity"
                title="Export chat"
              >
                <Download size={12} />
              </button>
            )}
            <button
              onClick={() => createAIChatSession()}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              title="New chat"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="w-full flex items-center justify-between gap-1 px-2 py-1 rounded border text-[10px]"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-1.5">
              <selectedModel.icon size={10} style={{ color: 'var(--primary)' }} />
              <span className="font-medium">{selectedModel.label}</span>
              <span className="opacity-40">·</span>
              <span className="opacity-50">Reasoning: {aiChatReasoningEffort}</span>
            </div>
            <ChevronDown size={10} className={cn('transition-transform', showModelPicker && 'rotate-180')} />
          </button>

          {showModelPicker && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 overflow-hidden"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="p-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[9px] uppercase tracking-wider opacity-40 font-medium">Model</p>
              </div>
              {MODEL_OPTIONS.map((model) => (
                <button
                  key={model.value}
                  onClick={() => { setAIChatModel(model.value); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-left transition-opacity',
                    aiChatModel === model.value ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                  )}
                  style={aiChatModel === model.value ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
                >
                  <model.icon size={12} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="text-[11px] font-medium">{model.label}</p>
                    <p className="text-[9px] opacity-50">{model.desc}</p>
                  </div>
                </button>
              ))}
              <div className="p-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[9px] uppercase tracking-wider opacity-40 font-medium mb-1">Reasoning Effort</p>
                <div className="flex gap-1">
                  {EFFORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setAIChatReasoningEffort(opt.value); setShowModelPicker(false); }}
                      className={cn(
                        'flex-1 py-1 rounded text-[10px] font-medium transition-opacity border',
                        aiChatReasoningEffort === opt.value ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                      )}
                      style={{
                        borderColor: aiChatReasoningEffort === opt.value ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: aiChatReasoningEffort === opt.value ? 'var(--primary)' : 'transparent',
                        color: aiChatReasoningEffort === opt.value ? 'var(--primary-foreground)' : 'var(--foreground)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context indicator */}
      {activeS && (
        <div
          className="px-2 py-1 border-b flex items-center gap-1 shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <Hash size={9} className="opacity-40" />
          <span className="text-[10px] opacity-50 truncate">
            Context: <span className="font-medium opacity-70">{activeS.title}</span>
            <span className="opacity-40"> ({activeS.wordCount}w)</span>
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {!activeSession || activeSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <p className="text-xs font-semibold mb-1">Research AI Assistant</p>
            <p className="text-[10px] opacity-50 mb-4 leading-relaxed">
              Context-aware help for your research paper. Use slash commands or ask anything.
            </p>
            <div className="w-full space-y-1">
              <p className="text-[9px] uppercase tracking-wider opacity-30 font-medium text-left">Quick Actions</p>
              {quickActions.map((action) => (
                <button
                  key={action.cmd}
                  onClick={() => { setInput(action.cmd); inputRef.current?.focus(); }}
                  className="w-full text-left text-[11px] px-2 py-1.5 rounded border hover:opacity-80 transition-opacity flex items-center gap-2"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                >
                  <CornerDownLeft size={10} className="opacity-40 shrink-0" />
                  <span className="opacity-70">{action.label}</span>
                  <span className="ml-auto text-[9px] opacity-30 font-mono">{action.cmd}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeSession.messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-1.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                  >
                    <Bot size={11} className="text-white" />
                  </div>
                )}
                <div className="max-w-[88%] flex flex-col gap-0.5">
                  {msg.slashCommand && msg.role === 'user' && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full self-end font-medium"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      {msg.slashCommand}
                    </span>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-2.5 py-2 text-xs leading-relaxed',
                      msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none',
                    )}
                    style={
                      msg.role === 'user'
                        ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                        : { backgroundColor: 'var(--background)', color: 'var(--foreground)' }
                    }
                  >
                    {msg.isStreaming && !msg.content ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 size={11} className="animate-spin opacity-60" />
                        <span className="opacity-50">Thinking...</span>
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <div
                        className="whitespace-pre-line prose-sm"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{msg.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[8px] opacity-30">{formatTime(msg.timestamp)}</span>
                      {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-0.5 rounded hover:opacity-80 transition-opacity"
                          title="Copy"
                        >
                          {copiedId === msg.id ? (
                            <Check size={10} className="text-green-400" />
                          ) : (
                            <Copy size={10} className="opacity-40" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {msg.model && msg.role === 'assistant' && !msg.isStreaming && (
                    <span className="text-[8px] opacity-25 px-1">{msg.model}</span>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div
                    className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--sidebar-accent)' }}
                  >
                    <User size={11} className="opacity-60" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-2 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="relative">
          <SlashCommandMenu
            filter={input}
            onSelect={handleSlashSelect}
            visible={showSlashMenu}
          />
          <div className="flex gap-1.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your research or type / for commands..."
              rows={1}
              className="flex-1 text-xs px-2.5 py-2 rounded border outline-none resize-none"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                minHeight: '32px',
                maxHeight: '80px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || aiChatLoading}
              className="p-2 rounded disabled:opacity-30 transition-opacity self-end"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[9px] opacity-30">
            <kbd className="px-0.5 rounded" style={{ backgroundColor: 'var(--background)' }}>Enter</kbd> send · <kbd className="px-0.5 rounded" style={{ backgroundColor: 'var(--background)' }}>Shift+Enter</kbd> newline · <kbd className="px-0.5 rounded" style={{ backgroundColor: 'var(--background)' }}>/</kbd> commands
          </p>
        </div>
      </div>
    </div>
  );
}
