'use client';
import { useState } from 'react';
import { Sparkles, Send, ChevronDown, BarChart2, BookOpen, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const domains = [
  'Physics', 'Chemistry', 'Biology', 'Engineering', 'Computer Science',
  'Materials Science', 'Environmental Science', 'Medical Sciences', 'Mathematics', 'Social Sciences',
];

const promptSuggestions = [
  'Improve this paragraph',
  'Suggest citations',
  'Rephrase for clarity',
  'Check methodology section',
  'Generate abstract from content',
  'Suggest related work',
  'Format for IEEE',
  'Check grammar & style',
  'Identify gaps in literature review',
  'Strengthen conclusion',
];

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const initialMessages: AIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI Research Assistant. I can help you with scientific writing, citations, methodology, and more. Select a prompt below or type your question.',
    timestamp: '09:00',
  },
];

const sampleResponses: Record<string, string> = {
  'Improve this paragraph': 'Here\'s an improved version of your paragraph with more precise academic language and stronger transitions:\n\n"The proliferation of renewable energy technologies has accelerated substantially over the preceding decade, catalyzed by escalating climate imperatives and precipitous reductions in capital costs [1,2]. Precise forecasting of photovoltaic and aeolian energy generation remains a paramount challenge, attributable to their intrinsic stochasticity and meteorological dependencies [3]."',
  'Generate abstract from content': 'Based on your manuscript content, here\'s a structured abstract:\n\n**Background**: Deep learning has transformed renewable energy forecasting, yet comparative analysis of architectures remains limited.\n\n**Methods**: We conducted a systematic review of 247 peer-reviewed studies (2015-2024) analyzing LSTM, CNN, and transformer models.\n\n**Results**: Transformer architectures achieved 15-23% lower MAPE (3.2%) compared to LSTM (4.8%) baselines.\n\n**Conclusions**: Transformer models represent the current state-of-the-art, though deployment constraints necessitate lightweight alternatives.',
  default: 'I\'ve analyzed your research context. Here are my suggestions:\n\n1. **Structure**: Your methodology section would benefit from a clearer hypothesis statement before the experimental design.\n\n2. **Citations**: Consider adding recent work from 2023-2024 on transformer architectures for energy forecasting.\n\n3. **Clarity**: The results section has strong data presentation, but the discussion could more explicitly connect findings to the broader research questions.\n\nWould you like me to help with any specific aspect?',
};

export default function ResearchAIPanel() {
  const [domain, setDomain] = useState('Computer Science');
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;

    const userMsg: AIMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = sampleResponses[content] || sampleResponses.default;
      const assistantMsg: AIMessage = {
        id: `m${Date.now()}_a`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Sparkles size={13} className="text-white" />
          </div>
          <h3 className="text-xs font-semibold">Research Assistant</h3>
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

      {/* Writing analysis */}
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
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
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
              className="px-3 py-2 rounded-lg rounded-bl-none text-xs"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <span className="opacity-50">Analyzing your research...</span>
            </div>
          </div>
        )}
      </div>

      {/* Prompt suggestions */}
      <div className="px-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] opacity-40 mb-1.5">Quick prompts:</p>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {promptSuggestions.map((p) => (
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

      {/* Input */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask about your research..."
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
      </div>
    </div>
  );
}
