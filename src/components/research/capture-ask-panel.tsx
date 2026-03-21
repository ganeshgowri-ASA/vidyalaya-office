'use client';
import { useState, useCallback, useRef } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Camera, Send, Sparkles, Copy, Trash2, ChevronDown, ChevronUp,
  Image, FileText, Maximize2, Minimize2, RotateCcw, Crop, ZoomIn,
  MousePointer, Square, Circle, Type, Highlighter, MessageSquare,
  Lightbulb, BookOpen, FlaskConical, Calculator, Code, Languages,
} from 'lucide-react';

interface CaptureRegion {
  id: string;
  type: 'screenshot' | 'text-selection' | 'equation' | 'figure' | 'table';
  label: string;
  content: string;
  timestamp: string;
  thumbnail?: string;
}

interface CaptureQuestion {
  id: string;
  captureId: string;
  question: string;
  answer: string;
  timestamp: string;
  isLoading: boolean;
}

type QuickAction = {
  id: string;
  label: string;
  icon: React.ElementType;
  prompt: string;
  category: 'explain' | 'analyze' | 'improve' | 'translate';
};

const quickActions: QuickAction[] = [
  { id: 'explain', label: 'Explain This', icon: Lightbulb, prompt: 'Explain this content in simple terms:', category: 'explain' },
  { id: 'summarize', label: 'Summarize', icon: FileText, prompt: 'Provide a concise summary of:', category: 'explain' },
  { id: 'critique', label: 'Critique', icon: MessageSquare, prompt: 'Provide a critical analysis of:', category: 'analyze' },
  { id: 'improve', label: 'Suggest Improvements', icon: Sparkles, prompt: 'Suggest improvements for:', category: 'improve' },
  { id: 'references', label: 'Find References', icon: BookOpen, prompt: 'Suggest relevant references for:', category: 'analyze' },
  { id: 'methodology', label: 'Check Methodology', icon: FlaskConical, prompt: 'Evaluate the methodology described in:', category: 'analyze' },
  { id: 'calculate', label: 'Verify Calculations', icon: Calculator, prompt: 'Verify the calculations in:', category: 'analyze' },
  { id: 'code', label: 'Generate Code', icon: Code, prompt: 'Generate code to reproduce or analyze:', category: 'improve' },
  { id: 'translate', label: 'Translate', icon: Languages, prompt: 'Translate the following to English:', category: 'translate' },
  { id: 'simplify', label: 'Simplify Language', icon: Type, prompt: 'Rewrite in simpler language:', category: 'improve' },
];

const captureTools = [
  { id: 'select', label: 'Select Region', icon: MousePointer },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'freeform', label: 'Freeform', icon: Circle },
  { id: 'text', label: 'Text Select', icon: Type },
  { id: 'highlight', label: 'Highlight', icon: Highlighter },
] as const;

const sampleCaptures: CaptureRegion[] = [
  {
    id: 'cap-1',
    type: 'text-selection',
    label: 'Abstract paragraph',
    content: 'We present a novel approach to multi-modal transformer architectures that achieves state-of-the-art results on cross-domain benchmarks. Our method introduces a hierarchical attention mechanism that reduces computational complexity from O(n²) to O(n log n) while maintaining accuracy.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'cap-2',
    type: 'equation',
    label: 'Loss function (Eq. 3)',
    content: 'L = -\\sum_{i=1}^{N} y_i \\log(\\hat{y}_i) + \\lambda ||W||_2^2 + \\beta \\sum_{k} KL(q_k || p_k)',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'cap-3',
    type: 'figure',
    label: 'Figure 2: Architecture Diagram',
    content: '[Architecture diagram showing multi-head attention layers with skip connections and layer normalization]',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'cap-4',
    type: 'table',
    label: 'Table 1: Benchmark Results',
    content: 'Model | BLEU | ROUGE-L | F1\nBaseline | 32.4 | 41.2 | 67.8\nOurs | 38.7 | 47.9 | 73.2\nOurs + FT | 41.3 | 51.4 | 76.8',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
];

const sampleQA: CaptureQuestion[] = [
  {
    id: 'qa-1',
    captureId: 'cap-1',
    question: 'What is the computational complexity improvement?',
    answer: 'The paper reports reducing computational complexity from O(n²) to O(n log n). This is achieved through a hierarchical attention mechanism. The O(n²) complexity is typical of standard transformer self-attention, where every token attends to every other token. The O(n log n) improvement suggests a divide-and-conquer or tree-based attention strategy, similar to approaches like Linformer or Longformer, but applied in a hierarchical manner.',
    timestamp: new Date(Date.now() - 250000).toISOString(),
    isLoading: false,
  },
  {
    id: 'qa-2',
    captureId: 'cap-2',
    question: 'Explain each term in this loss function',
    answer: 'This loss function has three terms:\n\n1. **Cross-entropy loss**: -Σ yᵢ log(ŷᵢ) — the standard classification loss measuring prediction vs ground truth\n\n2. **L2 regularization**: λ||W||₂² — weight decay to prevent overfitting, controlled by λ\n\n3. **KL divergence**: β Σ KL(qₖ||pₖ) — a variational term measuring divergence between learned posterior qₖ and prior pₖ, weighted by β (similar to VAE β-annealing)',
    timestamp: new Date(Date.now() - 550000).toISOString(),
    isLoading: false,
  },
];

export default function CaptureAskPanel() {
  const [captures, setCaptures] = useState<CaptureRegion[]>(sampleCaptures);
  const [questions, setQuestions] = useState<CaptureQuestion[]>(sampleQA);
  const [selectedCapture, setSelectedCapture] = useState<string | null>('cap-1');
  const [activeTool, setActiveTool] = useState<string>('select');
  const [inputValue, setInputValue] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [expandedCapture, setExpandedCapture] = useState<string | null>('cap-1');
  const [actionCategory, setActionCategory] = useState<string>('all');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedCap = captures.find(c => c.id === selectedCapture);
  const captureQuestions = questions.filter(q => q.captureId === selectedCapture);

  const typeIcons: Record<string, React.ElementType> = {
    'screenshot': Image,
    'text-selection': FileText,
    'equation': Calculator,
    'figure': Image,
    'table': FileText,
  };

  const typeColors: Record<string, string> = {
    'screenshot': '#3b82f6',
    'text-selection': '#8b5cf6',
    'equation': '#f59e0b',
    'figure': '#10b981',
    'table': '#ef4444',
  };

  const handleCapture = useCallback(() => {
    setIsCapturing(true);
    setTimeout(() => {
      const newCapture: CaptureRegion = {
        id: `cap-${Date.now().toString(36)}`,
        type: 'text-selection',
        label: `Capture ${captures.length + 1}`,
        content: 'Selected region from the document canvas...',
        timestamp: new Date().toISOString(),
      };
      setCaptures(prev => [newCapture, ...prev]);
      setSelectedCapture(newCapture.id);
      setExpandedCapture(newCapture.id);
      setIsCapturing(false);
    }, 800);
  }, [captures.length]);

  const handleAsk = useCallback((prompt?: string) => {
    const question = prompt || inputValue.trim();
    if (!question || !selectedCapture) return;

    const qaId = `qa-${Date.now().toString(36)}`;
    const newQ: CaptureQuestion = {
      id: qaId,
      captureId: selectedCapture,
      question,
      answer: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };
    setQuestions(prev => [...prev, newQ]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      setQuestions(prev => prev.map(q =>
        q.id === qaId
          ? {
              ...q,
              answer: `Based on the captured content, here is my analysis:\n\n${question.includes('explain') || question.includes('Explain')
                ? 'This content describes a key concept in the research. The main points are:\n\n1. The approach introduces a novel mechanism\n2. It achieves improved performance metrics\n3. The computational trade-offs are well-justified\n\nThe significance lies in the practical applicability of these improvements to real-world scenarios.'
                : question.includes('improve') || question.includes('Suggest')
                ? 'Here are suggestions for improvement:\n\n1. **Clarity**: Consider adding more context for domain-specific terms\n2. **Structure**: The argument flow could be strengthened with transition sentences\n3. **Evidence**: Additional citations would strengthen the claims\n4. **Precision**: Some quantitative claims need confidence intervals'
                : 'The captured content has been analyzed. Key observations:\n\n- The content is well-structured and follows standard academic conventions\n- The methodology appears sound based on the described approach\n- Consider cross-referencing with related sections for consistency'}`,
              isLoading: false,
            }
          : q
      ));
    }, 1500);
  }, [inputValue, selectedCapture]);

  const handleDeleteCapture = useCallback((id: string) => {
    setCaptures(prev => prev.filter(c => c.id !== id));
    setQuestions(prev => prev.filter(q => q.captureId !== id));
    if (selectedCapture === id) {
      setSelectedCapture(captures[0]?.id !== id ? captures[0]?.id || null : captures[1]?.id || null);
    }
  }, [captures, selectedCapture]);

  const filteredActions = actionCategory === 'all'
    ? quickActions
    : quickActions.filter(a => a.category === actionCategory);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Camera size={16} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Capture & Ask</span>
        </div>
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all',
            isCapturing ? 'opacity-50' : 'hover:opacity-90'
          )}
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          {isCapturing ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera size={12} />
          )}
          {isCapturing ? 'Capturing...' : 'Capture'}
        </button>
      </div>

      {/* Capture Tools Bar */}
      <div className="flex items-center gap-1 p-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
        {captureTools.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
              className={cn(
                'p-1.5 rounded transition-colors',
                activeTool === tool.id ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              )}
              style={activeTool === tool.id ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
            >
              <Icon size={14} />
            </button>
          );
        })}
        <div className="flex-1" />
        <span className="text-[10px] opacity-50">{captures.length} captures</span>
      </div>

      {/* Captures List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1.5">
          {captures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-40">
              <Camera size={32} className="mb-3" />
              <p className="text-xs text-center">No captures yet.<br />Click Capture or select text to begin.</p>
            </div>
          ) : (
            captures.map(cap => {
              const TypeIcon = typeIcons[cap.type] || FileText;
              const isSelected = cap.id === selectedCapture;
              const isExpanded = cap.id === expandedCapture;
              const capQs = questions.filter(q => q.captureId === cap.id);

              return (
                <div
                  key={cap.id}
                  className={cn(
                    'rounded-lg border transition-all cursor-pointer',
                    isSelected ? 'ring-1' : 'hover:border-opacity-60'
                  )}
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: isSelected ? 'var(--sidebar-accent)' : 'var(--sidebar)',
                    ...(isSelected ? { ringColor: 'var(--primary)' } : {}),
                  }}
                  onClick={() => {
                    setSelectedCapture(cap.id);
                    setExpandedCapture(isExpanded ? null : cap.id);
                  }}
                >
                  {/* Capture Header */}
                  <div className="flex items-center gap-2 p-2">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${typeColors[cap.type]}20`, color: typeColors[cap.type] }}
                    >
                      <TypeIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{cap.label}</div>
                      <div className="text-[10px] opacity-50 flex items-center gap-1">
                        <span className="capitalize">{cap.type.replace('-', ' ')}</span>
                        <span>·</span>
                        <span>{new Date(cap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {capQs.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{capQs.length} Q&A</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCapture(cap.id); }}
                        className="p-1 rounded opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                      {isExpanded ? <ChevronUp size={12} className="opacity-40" /> : <ChevronDown size={12} className="opacity-40" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-2 pb-2 space-y-2">
                      {/* Captured Content Preview */}
                      <div
                        className="rounded p-2 text-[11px] leading-relaxed max-h-24 overflow-y-auto"
                        style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                      >
                        {cap.type === 'equation' ? (
                          <code className="text-xs opacity-80">{cap.content}</code>
                        ) : cap.type === 'table' ? (
                          <pre className="text-[10px] whitespace-pre-wrap opacity-80">{cap.content}</pre>
                        ) : (
                          <p className="opacity-80">{cap.content}</p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      {showQuickActions && isSelected && (
                        <div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <Sparkles size={10} style={{ color: 'var(--primary)' }} />
                            <span className="text-[10px] font-medium opacity-70">Quick Actions</span>
                            <div className="flex-1" />
                            {['all', 'explain', 'analyze', 'improve'].map(cat => (
                              <button
                                key={cat}
                                onClick={(e) => { e.stopPropagation(); setActionCategory(cat); }}
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[9px] capitalize transition-colors',
                                  actionCategory === cat ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                                )}
                                style={actionCategory === cat ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {filteredActions.map(action => {
                              const ActionIcon = action.icon;
                              return (
                                <button
                                  key={action.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAsk(`${action.prompt} ${cap.content.slice(0, 200)}`);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:opacity-90"
                                  style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                                >
                                  <ActionIcon size={10} />
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Q&A Thread */}
                      {capQs.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-medium opacity-50 uppercase tracking-wider">Conversation</div>
                          {capQs.map(qa => (
                            <div key={qa.id} className="space-y-1.5">
                              {/* Question */}
                              <div className="flex gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                                  Q
                                </div>
                                <div className="flex-1 text-[11px] leading-relaxed pt-0.5">{qa.question}</div>
                              </div>
                              {/* Answer */}
                              <div className="flex gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]" style={{ backgroundColor: 'var(--sidebar-accent)' }}>
                                  <Sparkles size={10} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div className="flex-1">
                                  {qa.isLoading ? (
                                    <div className="flex items-center gap-2 py-1">
                                      <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
                                      <span className="text-[10px] opacity-50">Analyzing...</span>
                                    </div>
                                  ) : (
                                    <div className="text-[11px] leading-relaxed opacity-85 whitespace-pre-wrap">
                                      {qa.answer}
                                      <div className="flex items-center gap-1 mt-1">
                                        <button
                                          className="p-0.5 rounded opacity-30 hover:opacity-70 transition-opacity"
                                          title="Copy answer"
                                        >
                                          <Copy size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Input Area */}
      {selectedCapture && (
        <div className="border-t p-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] opacity-50">Asking about:</span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>
              {selectedCap?.label || 'Selected capture'}
            </span>
          </div>
          <div
            className="flex items-end gap-1 rounded-lg p-1"
            style={{ backgroundColor: 'var(--sidebar)', border: '1px solid var(--border)' }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask about this capture..."
              rows={1}
              className="flex-1 bg-transparent text-xs resize-none outline-none p-1.5 placeholder-opacity-40"
              style={{ color: 'var(--foreground)' }}
            />
            <button
              onClick={() => handleAsk()}
              disabled={!inputValue.trim()}
              className={cn(
                'p-1.5 rounded transition-colors flex-shrink-0',
                inputValue.trim() ? 'opacity-100' : 'opacity-30'
              )}
              style={inputValue.trim() ? { backgroundColor: 'var(--primary)', color: '#fff' } : undefined}
            >
              <Send size={12} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-[10px] opacity-40 hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              <Sparkles size={9} />
              {showQuickActions ? 'Hide' : 'Show'} quick actions
            </button>
            <span className="text-[9px] opacity-30">Enter to send · Shift+Enter for newline</span>
          </div>
        </div>
      )}
    </div>
  );
}
