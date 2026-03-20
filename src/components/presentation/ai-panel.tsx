'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, Sparkles, FileText, ListOrdered, Mic, Layout, Wand2,
  PenLine, ImageIcon, Lightbulb, CheckCircle2, Loader2, Copy,
  LayoutGrid, Palette, Type, ArrowRight,
} from 'lucide-react';
import { usePresentationStore, type SlideLayout } from '@/store/presentation-store';
import { generateId } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Generate Content', icon: Sparkles, prompt: 'Generate engaging content for the current slide. The slide title is: ', category: 'content' },
  { label: 'Create Outline', icon: ListOrdered, prompt: 'Create a presentation outline with 5-7 slides for a presentation about: ', category: 'content' },
  { label: 'Speaker Notes', icon: Mic, prompt: 'Write detailed speaker notes for a slide titled: ', category: 'content' },
  { label: 'Improve Content', icon: PenLine, prompt: 'Improve and refine the following slide content to be more compelling and professional: ', category: 'improve' },
  { label: 'Suggest Layout', icon: Layout, prompt: 'Suggest the best layout for a slide about: ', category: 'layout' },
  { label: 'Design Tips', icon: Palette, prompt: 'Give me design tips and best practices for a presentation slide about: ', category: 'design' },
];

// ── Slide Generation Templates ────────────────────────────────────────────────

const GENERATION_TEMPLATES = [
  { label: 'Pitch Deck', description: '10-slide startup pitch', slides: 10, icon: '🚀' },
  { label: 'Project Update', description: '5-slide status report', slides: 5, icon: '📊' },
  { label: 'Training', description: '8-slide training module', slides: 8, icon: '📚' },
  { label: 'Sales Proposal', description: '7-slide client proposal', slides: 7, icon: '💼' },
  { label: 'Team Intro', description: '6-slide team overview', slides: 6, icon: '👥' },
  { label: 'Quarterly Review', description: '8-slide Q review', slides: 8, icon: '📈' },
];

// ── Layout Suggestion Map ─────────────────────────────────────────────────────

const LAYOUT_SUGGESTIONS: Array<{ layout: SlideLayout; label: string; bestFor: string }> = [
  { layout: 'title', label: 'Title Slide', bestFor: 'Opening, closing, or major section starts' },
  { layout: 'content', label: 'Title + Content', bestFor: 'Main content slides with bullet points' },
  { layout: 'two-column', label: 'Two Content', bestFor: 'Comparisons, pros/cons, before/after' },
  { layout: 'section-header', label: 'Section Header', bestFor: 'Breaking up presentation sections' },
  { layout: 'comparison', label: 'Comparison', bestFor: 'Side-by-side analysis or options' },
  { layout: 'picture-caption', label: 'Picture + Caption', bestFor: 'Image-heavy slides with descriptions' },
  { layout: 'blank', label: 'Blank', bestFor: 'Custom layouts, diagrams, or full-bleed images' },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIPanel() {
  const {
    showAIPanel, setShowAIPanel, slides, activeSlideIndex,
    addSlide, pushUndo, applySlideLayout, updateElement,
    updateSlideNotes,
  } = usePresentationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'chat' | 'generate' | 'layouts' | 'improve'>('chat');
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!showAIPanel) return null;

  const currentSlide = slides[activeSlideIndex];
  const slideTitle = currentSlide?.elements.find(
    (el) => el.type === 'text' && el.style.fontWeight === 'bold',
  )?.content || 'Untitled';

  const slideContent = currentSlide?.elements
    .filter((el) => el.type === 'text')
    .map((el) => el.content?.replace(/<[^>]*>/g, '').trim())
    .filter(Boolean)
    .join(' | ') || '';

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
            `The slide content is: "${slideContent}". ` +
            'Provide concise, actionable suggestions for presentation content, speaker notes, and slide improvements. ' +
            'Format your responses with bullet points when listing items. ' +
            'When suggesting layouts, recommend from: Title, Title+Content, Two Content, Blank, Section Header, Comparison, Picture+Caption.',
        }),
      });

      if (!res.ok) throw new Error('AI request failed');

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

  const handleGenerateSlides = (template: typeof GENERATION_TEMPLATES[0]) => {
    setGeneratingSlides(true);
    pushUndo();

    // Generate placeholder slides based on template
    const slideLayouts: Array<{ layout: SlideLayout; title: string; content: string }> = [];
    switch (template.label) {
      case 'Pitch Deck':
        slideLayouts.push(
          { layout: 'title', title: 'Company Name', content: 'Your Tagline Here' },
          { layout: 'content', title: 'The Problem', content: 'Describe the problem your product solves...' },
          { layout: 'content', title: 'Our Solution', content: 'How your product addresses the problem...' },
          { layout: 'two-column', title: 'Market Opportunity', content: 'Market size and growth potential...' },
          { layout: 'content', title: 'Business Model', content: 'How you make money...' },
          { layout: 'content', title: 'Traction', content: 'Key metrics and milestones...' },
          { layout: 'comparison', title: 'Competitive Advantage', content: 'How you compare to alternatives...' },
          { layout: 'content', title: 'Go-to-Market Strategy', content: 'Your plan to reach customers...' },
          { layout: 'two-column', title: 'The Team', content: 'Key team members and experience...' },
          { layout: 'content', title: 'The Ask', content: 'Funding requirements and use of funds...' },
        );
        break;
      case 'Project Update':
        slideLayouts.push(
          { layout: 'title', title: 'Project Update', content: 'Status Report - ' + new Date().toLocaleDateString() },
          { layout: 'content', title: 'Executive Summary', content: 'High-level project status and key updates...' },
          { layout: 'two-column', title: 'Progress & Milestones', content: 'Completed vs upcoming milestones...' },
          { layout: 'content', title: 'Risks & Issues', content: 'Current blockers and mitigation plans...' },
          { layout: 'content', title: 'Next Steps', content: 'Action items and timeline for next period...' },
        );
        break;
      case 'Training':
        slideLayouts.push(
          { layout: 'title', title: 'Training Module', content: 'Course Name - Session Overview' },
          { layout: 'content', title: 'Learning Objectives', content: 'By the end of this session, you will...' },
          { layout: 'content', title: 'Topic 1: Introduction', content: 'Key concepts and foundation...' },
          { layout: 'two-column', title: 'Topic 2: Core Concepts', content: 'Detailed explanation with examples...' },
          { layout: 'content', title: 'Topic 3: Best Practices', content: 'Industry standards and recommendations...' },
          { layout: 'comparison', title: 'Common Mistakes vs Best Practices', content: 'What to avoid and what to do...' },
          { layout: 'content', title: 'Practice Exercise', content: 'Hands-on activity instructions...' },
          { layout: 'content', title: 'Summary & Q&A', content: 'Key takeaways and open discussion...' },
        );
        break;
      default:
        for (let i = 0; i < template.slides; i++) {
          const layout: SlideLayout = i === 0 ? 'title' : i === template.slides - 1 ? 'section-header' : 'content';
          slideLayouts.push({
            layout,
            title: i === 0 ? template.label : `Slide ${i + 1}`,
            content: i === 0 ? template.description : 'Add your content here...',
          });
        }
    }

    // Add the generated slides
    slideLayouts.forEach((sl, i) => {
      addSlide(sl.layout, slides.length + i - 1);
    });

    setGeneratingSlides(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Generated ${slideLayouts.length} slides for "${template.label}". Navigate to the new slides to customize them.`,
    }]);
    setActiveSection('chat');
  };

  const handleApplyLayoutSuggestion = (layout: SlideLayout) => {
    pushUndo();
    applySlideLayout(activeSlideIndex, layout);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Applied "${LAYOUT_SUGGESTIONS.find(l => l.layout === layout)?.label}" layout to Slide ${activeSlideIndex + 1}.`,
    }]);
  };

  const handleImproveContent = (action: string) => {
    const prompt = action === 'concise'
      ? `Make this slide content more concise and impactful: "${slideContent}"`
      : action === 'detailed'
      ? `Expand this slide content with more detail and supporting points: "${slideContent}"`
      : action === 'professional'
      ? `Rewrite this slide content in a more professional business tone: "${slideContent}"`
      : `Suggest speaker notes for a slide with this content: "${slideContent}"`;
    sendMessage(prompt);
    setActiveSection('chat');
  };

  const sectionTabs = [
    { key: 'chat' as const, label: 'Chat', icon: <Sparkles size={12} /> },
    { key: 'generate' as const, label: 'Generate', icon: <Wand2 size={12} /> },
    { key: 'layouts' as const, label: 'Layouts', icon: <LayoutGrid size={12} /> },
    { key: 'improve' as const, label: 'Improve', icon: <PenLine size={12} /> },
  ];

  return (
    <div
      className="flex flex-col h-full border-l no-print"
      style={{
        width: 320,
        minWidth: 320,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} />
          AI Assistant
        </div>
        <button onClick={() => setShowAIPanel(false)} className="p-1 rounded hover:opacity-80">
          <X size={16} />
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex border-b px-1 pt-1" style={{ borderColor: 'var(--border)' }}>
        {sectionTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-t transition-colors"
            style={{
              background: activeSection === tab.key ? 'var(--background)' : 'transparent',
              color: activeSection === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderBottom: activeSection === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chat Section ── */}
      {activeSection === 'chat' && (
        <>
          {/* Quick actions */}
          <div className="p-2 border-b space-y-0.5" style={{ borderColor: 'var(--border)' }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.prompt + slideTitle)}
                disabled={loading}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity text-left"
                style={{ color: 'var(--sidebar-foreground)' }}
              >
                <action.icon size={13} />
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-xs py-8" style={{ color: 'var(--muted-foreground)' }}>
                <Lightbulb size={28} className="mx-auto mb-2 opacity-40" />
                <p>Ask me to help with your presentation.</p>
                <p className="mt-1 opacity-60">I can generate content, suggest layouts, write speaker notes, and more.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-xs rounded-lg px-3 py-2 ${msg.role === 'user' ? 'ml-4' : 'mr-4'}`}
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
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mr-4" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <Loader2 size={12} className="animate-spin" />
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
                style={{ background: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
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
        </>
      )}

      {/* ── Generate Slides Section ── */}
      {activeSection === 'generate' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Generate a set of slides from a template. Slides are added after your current slides.
          </p>
          <div className="space-y-2">
            {GENERATION_TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => handleGenerateSlides(template)}
                disabled={generatingSlides}
                className="w-full flex items-center gap-3 p-3 rounded-lg border text-left hover:opacity-90 transition-opacity"
                style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
              >
                <span className="text-xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{template.label}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{template.description}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  {template.slides}
                </span>
              </button>
            ))}
          </div>
          {generatingSlides && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <Loader2 size={14} className="animate-spin" />
              Generating slides...
            </div>
          )}
        </div>
      )}

      {/* ── Layout Suggestions Section ── */}
      {activeSection === 'layouts' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Apply a suggested layout to Slide {activeSlideIndex + 1}.
          </p>
          <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
            Current layout: <strong>{currentSlide?.layout || 'content'}</strong>
          </div>
          <div className="space-y-2">
            {LAYOUT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.layout}
                onClick={() => handleApplyLayoutSuggestion(suggestion.layout)}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg border text-left hover:opacity-90 transition-opacity"
                style={{
                  borderColor: currentSlide?.layout === suggestion.layout ? 'var(--primary)' : 'var(--border)',
                  background: currentSlide?.layout === suggestion.layout ? 'var(--primary)/10' : 'var(--background)',
                }}
              >
                <Layout size={14} style={{ color: 'var(--primary)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{suggestion.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{suggestion.bestFor}</div>
                </div>
                {currentSlide?.layout === suggestion.layout && (
                  <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Improve Content Section ── */}
      {activeSection === 'improve' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Improve Slide {activeSlideIndex + 1} content with AI assistance.
          </p>

          {/* Current slide preview */}
          <div className="p-2.5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <div className="text-[10px] font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Current content:</div>
            <div className="text-xs" style={{ color: 'var(--foreground)' }}>
              {slideContent || <span className="opacity-40">No text content on this slide</span>}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleImproveContent('concise')}
              disabled={loading || !slideContent}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border text-left hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            >
              <ArrowRight size={14} style={{ color: '#22c55e' }} />
              <div className="flex-1">
                <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Make Concise</div>
                <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Shorten and sharpen the content</div>
              </div>
            </button>
            <button
              onClick={() => handleImproveContent('detailed')}
              disabled={loading || !slideContent}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border text-left hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            >
              <ArrowRight size={14} style={{ color: '#3b82f6' }} />
              <div className="flex-1">
                <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Expand & Detail</div>
                <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Add more supporting points</div>
              </div>
            </button>
            <button
              onClick={() => handleImproveContent('professional')}
              disabled={loading || !slideContent}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border text-left hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            >
              <ArrowRight size={14} style={{ color: '#a855f7' }} />
              <div className="flex-1">
                <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Professional Tone</div>
                <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Rewrite in business language</div>
              </div>
            </button>
            <button
              onClick={() => handleImproveContent('notes')}
              disabled={loading || !slideContent}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border text-left hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            >
              <Mic size={14} style={{ color: '#f59e0b' }} />
              <div className="flex-1">
                <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Generate Speaker Notes</div>
                <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Create talking points for this slide</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
