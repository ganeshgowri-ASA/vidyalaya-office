'use client';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, BarChart2, BookOpen, RefreshCw, MessageSquare, Shield, FileText, Quote, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const domains = [
  'Physics', 'Chemistry', 'Biology', 'Engineering', 'Computer Science',
  'Materials Science', 'Environmental Science', 'Medical Sciences', 'Mathematics', 'Social Sciences',
];

const QUICK_STANDARDS = ['IEC 60904', 'IEC 61215', 'IEC 61730', 'IEEE 1547', 'ASTM E2848', 'IEC 61853', 'IEC 62716'];

const modePrompts: Record<string, string[]> = {
  chat: [
    'Improve this paragraph',
    'Suggest citations',
    'Rephrase for clarity',
    'Check methodology section',
    'Generate abstract from content',
    'Suggest related work',
    'Check grammar & style',
    'Strengthen conclusion',
  ],
  standards: [],
  improve: [
    'Improve academic tone',
    'Fix passive voice usage',
    'Strengthen transitions',
    'Add technical precision',
    'Clarify methodology',
    'Improve abstract quality',
  ],
  citations: [
    'Suggest key PV papers',
    'Format IEEE citations',
    'Find seminal references',
    'Suggest recent 2023-2024 work',
  ],
};

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { title: string; standard?: string; relevance: number }[];
}

interface ResearchAIConfig {
  pineconeApiKey: string;
  pineconeIndex: string;
  pineconeEnvironment: string;
  pineconeIndexHost: string;
  llmProvider: string;
  llmApiKey: string;
  llmModel: string;
}

type Mode = 'chat' | 'standards' | 'improve' | 'citations';

const MODE_ICONS: Record<Mode, React.ElementType> = {
  chat: MessageSquare,
  standards: Shield,
  improve: FileText,
  citations: Quote,
};

const initialMessages: AIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your AI Research Assistant. I can help with scientific writing, PV standards lookup, citations, and more. Configure your API keys in Settings for full RAG capabilities.",
    timestamp: '09:00',
  },
];

export default function ResearchAIPanel() {
  const [domain, setDomain] = useState('Physics');
  const [activeMode, setActiveMode] = useState<Mode>('chat');
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [standardSearch, setStandardSearch] = useState('');
  const [ragStatus, setRagStatus] = useState<'unknown' | 'connected' | 'fallback'>('unknown');
  const [config, setConfig] = useState<ResearchAIConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load config from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('research-ai-config');
      if (stored) {
        const parsed = JSON.parse(stored) as ResearchAIConfig;
        setConfig(parsed);
        setRagStatus(parsed.llmApiKey ? 'connected' : 'fallback');
      } else {
        // Try to pull from vidyalaya_providers for backward compat
        const providers = localStorage.getItem('vidyalaya_providers');
        if (providers) {
          const arr = JSON.parse(providers) as Array<{ key: string; apiKey: string; extra?: Record<string, string> }>;
          const pinecone = arr.find((p) => p.key === 'pinecone');
          const openai = arr.find((p) => p.key === 'openai');
          if (pinecone || openai) {
            const derived: ResearchAIConfig = {
              pineconeApiKey: pinecone?.apiKey || '',
              pineconeIndex: pinecone?.extra?.indexName || '',
              pineconeEnvironment: pinecone?.extra?.environment || '',
              pineconeIndexHost: '',
              llmProvider: 'openai',
              llmApiKey: openai?.apiKey || '',
              llmModel: 'gpt-4o-mini',
            };
            setConfig(derived);
            setRagStatus(derived.llmApiKey ? 'connected' : 'fallback');
          } else {
            setRagStatus('fallback');
          }
        } else {
          setRagStatus('fallback');
        }
      }
    } catch {
      setRagStatus('fallback');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/research-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: content,
          mode: activeMode,
          domain,
          config: config
            ? {
                pineconeApiKey: config.pineconeApiKey,
                pineconeIndex: config.pineconeIndex,
                pineconeEnvironment: config.pineconeEnvironment,
                pineconeIndexHost: config.pineconeIndexHost,
                llmProvider: config.llmProvider,
                llmApiKey: config.llmApiKey,
                llmModel: config.llmModel,
              }
            : undefined,
        }),
      });

      const data = await res.json() as {
        response?: string;
        sources?: { title: string; standard?: string; relevance: number }[];
        fallback?: boolean;
        error?: string;
      };

      if (data.error) throw new Error(data.error);

      if (data.fallback === false) setRagStatus('connected');
      if (data.fallback === true && ragStatus !== 'connected') setRagStatus('fallback');

      const assistantMsg: AIMessage = {
        id: `m${Date.now()}_a`,
        role: 'assistant',
        content: data.response || 'No response received.',
        timestamp: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: AIMessage = {
        id: `m${Date.now()}_e`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please check your API configuration in Settings.',
        timestamp: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const searchStandard = (standard: string) => {
    setActiveMode('standards');
    sendMessage(`Tell me about ${standard} – scope, key requirements, and test procedures`);
  };

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <Sparkles size={13} className="text-white" />
            </div>
            <h3 className="text-xs font-semibold">Research Assistant</h3>
          </div>
          {/* RAG status indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn('w-2 h-2 rounded-full shrink-0', {
                'bg-green-400': ragStatus === 'connected',
                'bg-yellow-400': ragStatus === 'fallback',
                'bg-gray-400': ragStatus === 'unknown',
              })}
            />
            <span className="text-[10px] opacity-60">
              {ragStatus === 'connected' ? 'RAG on' : ragStatus === 'fallback' ? 'Offline' : '...'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] opacity-50 shrink-0">Domain:</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 text-xs px-1.5 py-0.5 rounded border"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          >
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['chat', 'standards', 'improve', 'citations'] as Mode[]).map((m) => {
          const Icon = MODE_ICONS[m];
          return (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={cn('flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors', {
                'font-medium': activeMode === m,
                'opacity-50 hover:opacity-80': activeMode !== m,
              })}
              style={activeMode === m ? { borderBottom: '2px solid var(--primary)', color: 'var(--primary)' } : {}}
            >
              <Icon size={12} />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Writing analysis (chat/improve modes) */}
      {(activeMode === 'chat' || activeMode === 'improve') && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Writing Analysis</p>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {[
              { label: 'Readability', value: 'Good', color: 'text-green-400', icon: BarChart2 },
              { label: 'Passive Voice', value: '12%', color: 'text-yellow-400', icon: RefreshCw },
              { label: 'Academic Tone', value: '92%', color: 'text-green-400', icon: BookOpen },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded p-1.5 text-center"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <item.icon size={12} className={cn('mx-auto mb-0.5', item.color)} />
                <p className={cn('font-medium', item.color)}>{item.value}</p>
                <p className="opacity-50 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standards mode – quick search UI */}
      {activeMode === 'standards' && (
        <div className="p-2 border-b space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex gap-1">
            <div className="relative flex-1">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={standardSearch}
                onChange={(e) => setStandardSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && standardSearch.trim()) { searchStandard(standardSearch); setStandardSearch(''); } }}
                placeholder="Search IEC, IEEE, ASTM standards..."
                className="w-full text-xs pl-6 pr-2 py-1.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              />
            </div>
            <button
              onClick={() => { if (standardSearch.trim()) { searchStandard(standardSearch); setStandardSearch(''); } }}
              className="px-2 rounded text-xs"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Search size={11} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_STANDARDS.map((s) => (
              <button
                key={s}
                onClick={() => searchStandard(s)}
                className="text-[10px] px-1.5 py-0.5 rounded border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'transparent' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div
                className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <Sparkles size={11} className="text-white" />
              </div>
            )}
            <div className="max-w-[90%] flex flex-col gap-1">
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none',
                )}
                style={
                  msg.role === 'user'
                    ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                    : { backgroundColor: 'var(--background)', color: 'var(--foreground)' }
                }
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <p className="text-[9px] opacity-40 mt-1 text-right">{msg.timestamp}</p>
              </div>
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {msg.sources.map((src, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded-full border opacity-70"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                      title={`Relevance: ${Math.round(src.relevance * 100)}%`}
                    >
                      {src.standard || src.title.slice(0, 20)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <div
              className="w-5 h-5 rounded shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <Sparkles size={11} className="text-white" />
            </div>
            <div
              className="px-3 py-2 rounded-lg rounded-bl-none text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <Loader2 size={11} className="animate-spin opacity-60" />
              <span className="opacity-50">
                {activeMode === 'standards' ? 'Looking up standard...' : 'Analyzing your research...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts (non-standards mode) */}
      {activeMode !== 'standards' && modePrompts[activeMode]?.length > 0 && (
        <div className="px-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] opacity-40 mb-1.5">Quick prompts:</p>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {modePrompts[activeMode].map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-[10px] px-2 py-1 rounded border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={
              activeMode === 'standards'
                ? 'Ask about any PV/energy standard...'
                : activeMode === 'improve'
                ? 'Paste text to improve...'
                : activeMode === 'citations'
                ? 'Ask for citation suggestions...'
                : 'Ask about your research...'
            }
            className="flex-1 text-xs px-3 py-2 rounded border outline-none"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-2 rounded disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Send size={14} />
          </button>
        </div>
        {ragStatus === 'fallback' && (
          <p className="text-[9px] opacity-40 mt-1 text-center">
            Offline mode — configure API keys in Settings for full RAG
          </p>
        )}
      </div>
    </div>
  );
}
