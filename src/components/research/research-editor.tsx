'use client';
import { useState, useEffect, useCallback } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  FlaskConical, Plus, BookOpen, LayoutGrid, ChevronRight,
  Calendar, FileText, CheckCircle2, Clock, Send, Sparkles,
  BookMarked, Sigma, FileCode, Link2, Shield, SpellCheck, Upload,
  ClipboardCheck, Users, Mail as MailIcon, BookOpenCheck, Wand2, Bot,
} from 'lucide-react';
import katex from 'katex';

import ResearchToolbar from './research-toolbar';
import SectionOutline from './section-outline';
import CitationManager from './citation-manager';
import EquationEditor from './equation-editor';
import FigureTableManager from './figure-table-manager';
import ResearchAIPanel from './research-ai-panel';
import ExportPanel from './export-panel';
import JournalTemplates from './journal-templates';
import LaTeXSettingsPanel from './latex-settings-panel';
import CrossModuleLinker from './cross-module-linker';
import PlagiarismPanel from './plagiarism-panel';
import SpellingPanel from './spelling-panel';
import SmartCitationPanel from './smart-citation-panel';
import ImportPanel from './import-panel';
import WysiwygCanvas from './wysiwyg-canvas';
import SubmissionChecker from './submission-checker';
import AuthorManager from './author-manager';
import CoverLetter from './cover-letter';
import JournalRecommendation from './journal-recommendation';
import PdfPreview from './pdf-preview';
import VersionHistory from './version-history';
import ProposedChangesPanel from './proposed-changes-panel';
import TrackChanges from './track-changes';
import ZoteroIntegration from './zotero-integration';
import ProjectWizard from './project-wizard';
import AIChatAssistant from './ai-chat-assistant';
import { useVersionHistoryStore } from '@/store/version-history-store';

function renderKatexSafe(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, strict: false });
  } catch {
    return `<code>${latex}</code>`;
  }
}

const statusColors = {
  Draft: 'text-yellow-400',
  'In Review': 'text-blue-400',
  Submitted: 'text-purple-400',
  Published: 'text-green-400',
};

const statusBg = {
  Draft: 'bg-yellow-400/10',
  'In Review': 'bg-blue-400/10',
  Submitted: 'bg-purple-400/10',
  Published: 'bg-green-400/10',
};

function ArticlePreview({ content, title }: { content: string; title: string }) {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-center mb-3 leading-tight">{title}</h1>
        <div
          className="prose prose-sm max-w-none"
          style={{ color: 'var(--foreground)' }}
        >
          {content.split('\n\n').map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return <h3 key={i} className="text-base font-bold mt-4 mb-2">{para.slice(2, -2)}</h3>;
            }
            if (para.startsWith('*') && para.endsWith('*')) {
              return <p key={i} className="text-sm italic mt-2 mb-2">{para.slice(1, -1)}</p>;
            }
            return <p key={i} className="text-sm leading-relaxed mb-3 opacity-90">{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

function ResearchDashboard() {
  const {
    articles, setShowDashboard, createArticle, setActiveArticle, setShowTemplateGallery, setShowProjectWizard,
  } = useResearchStore();

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FlaskConical size={22} /> Research Articles
            </h1>
            <p className="text-xs opacity-50 mt-0.5">Manage and write your academic papers</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border)' }}
            >
              <LayoutGrid size={15} /> Templates
            </button>
            <button
              onClick={() => setShowProjectWizard(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border)' }}
            >
              <Wand2 size={15} /> Project Wizard
            </button>
            <button
              onClick={() => { createArticle('Untitled Research Article'); setShowDashboard(false); }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Plus size={15} /> New Article
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Articles', value: articles.length, icon: FileText, color: 'var(--primary)' },
            { label: 'In Progress', value: articles.filter((a) => a.status === 'Draft' || a.status === 'In Review').length, icon: Clock, color: '#f59e0b' },
            { label: 'Submitted', value: articles.filter((a) => a.status === 'Submitted').length, icon: Send, color: '#8b5cf6' },
            { label: 'Published', value: articles.filter((a) => a.status === 'Published').length, icon: CheckCircle2, color: '#22c55e' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 border"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <stat.icon size={20} style={{ color: stat.color }} className="mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Articles list */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold">My Articles</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center gap-4 px-4 py-3 hover:opacity-90 cursor-pointer transition-opacity"
                onClick={() => { setActiveArticle(article.id); setShowDashboard(false); }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <FlaskConical size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  <p className="text-xs opacity-50 mt-0.5 flex items-center gap-2">
                    {article.journal && <span>{article.journal}</span>}
                    {article.journal && <span>·</span>}
                    <Calendar size={11} className="inline" />
                    <span>{article.updatedAt}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs opacity-50">
                    <p>{article.wordCount.toLocaleString()} words</p>
                    <p>{article.citationCount} citations</p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      statusColors[article.status],
                      statusBg[article.status]
                    )}
                  >
                    {article.status}
                  </span>
                  <ChevronRight size={16} className="opacity-30" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResearchEditor() {
  const {
    sections, activeSection, previewMode,
    showTemplateGallery, showEquationEditor, showFigureManager,
    showDashboard, setShowDashboard, setShowTemplateGallery,
    activeRightPanel, setActiveRightPanel,
    setShowEquationEditor, setShowCitationManager,
    citations, equations, figures, pdfPreviewOpen,
    showProjectWizard, setShowProjectWizard,
  } = useResearchStore();

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === 's') {
      e.preventDefault();
      // Auto-save trigger (visual feedback only, data is already in Zustand)
    }
    if (ctrl && e.key === 'e' && !e.shiftKey) {
      e.preventDefault();
      setShowEquationEditor(true);
    }
    if (ctrl && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      setActiveRightPanel('citations');
      setShowCitationManager(true);
    }
  }, [setShowEquationEditor, setActiveRightPanel, setShowCitationManager]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const activeS = sections.find((s) => s.id === activeSection);
  const titleSection = sections.find((s) => s.title === 'Title');
  const articleTitle = titleSection?.content.split('\n')[0] || 'Untitled Research Article';

  if (showDashboard) {
    return (
      <>
        <ResearchDashboard />
        {showTemplateGallery && <JournalTemplates />}
        {showProjectWizard && <ProjectWizard onClose={() => setShowProjectWizard(false)} />}
      </>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => setShowDashboard(true)}
          className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          <FlaskConical size={15} />
          <span>Research</span>
        </button>
        <span className="opacity-30">/</span>
        <span className="text-xs font-medium truncate max-w-xs">{articleTitle}</span>
        <div className="ml-auto flex items-center gap-2 text-xs opacity-50">
          <span>{sections.reduce((s, sec) => s + sec.wordCount, 0).toLocaleString()} words</span>
          <span>·</span>
          <span>{citations.length} refs</span>
          <span>·</span>
          <span>{equations.length} eq.</span>
        </div>
      </div>

      {/* Toolbar */}
      <ResearchToolbar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section outline */}
        <div
          className="w-52 shrink-0 border-r overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <SectionOutline />
        </div>

        {/* Center: Editor / Preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeS && (
            <>
              {/* Section header */}
              <div
                className="px-4 py-2 border-b flex items-center gap-3 shrink-0"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <h2 className="text-sm font-semibold">{activeS.title}</h2>
                <span className="text-xs opacity-40">{activeS.wordCount} words</span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setActiveRightPanel('citations')}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded border opacity-60 hover:opacity-100"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <BookMarked size={12} /> Cite
                  </button>
                  <button
                    onClick={() => setShowTemplateGallery(true)}
                    className="text-xs px-2 py-1 rounded border opacity-60 hover:opacity-100"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <LayoutGrid size={12} />
                  </button>
                </div>
              </div>

              {/* Editor area */}
              <div className="flex-1 overflow-hidden">
                {previewMode ? (
                  <ArticlePreview content={activeS.content} title={activeS.title} />
                ) : (
                  <WysiwygCanvas />
                )}
              </div>
            </>
          )}
        </div>

        {/* PDF Preview Pane */}
        {pdfPreviewOpen && <PdfPreview />}

        {/* Right: Panels */}
        <div
          className="w-72 shrink-0 border-l flex flex-col"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Panel tabs - row 1 */}
          <div
            className="flex border-b shrink-0"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            {([
              ['citations', 'Refs', BookOpen],
              ['smartcite', 'Cite+', Sparkles],
              ['ai', 'AI', Sparkles],
              ['aichat', 'Chat', Bot],
              ['plagiarism', 'Plag', Shield],
              ['spelling', 'Spell', SpellCheck],
            ] as const).map(([panel, label, Icon]) => (
              <button
                key={panel}
                onClick={() => setActiveRightPanel(panel)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-0.5 py-2 text-[10px] transition-colors border-b-2',
                  activeRightPanel === panel ? 'font-medium' : 'opacity-50 border-transparent hover:opacity-80'
                )}
                style={activeRightPanel === panel ? { borderColor: 'var(--primary)', color: 'var(--foreground)' } : undefined}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
          {/* Panel tabs - row 2 */}
          <div
            className="flex border-b shrink-0"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            {([
              ['export', 'Export', Sigma],
              ['import', 'Import', Upload],
              ['latex', 'LaTeX', FileCode],
              ['links', 'Links', Link2],
            ] as const).map(([panel, label, Icon]) => (
              <button
                key={panel}
                onClick={() => setActiveRightPanel(panel)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[10px] transition-colors border-b-2',
                  activeRightPanel === panel ? 'font-medium' : 'opacity-50 border-transparent hover:opacity-80'
                )}
                style={activeRightPanel === panel ? { borderColor: 'var(--primary)', color: 'var(--foreground)' } : undefined}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
          {/* Panel tabs - row 3 (production + zotero) */}
          <div
            className="flex border-b shrink-0"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            {([
              ['submission', 'Submit', ClipboardCheck],
              ['authors', 'Authors', Users],
              ['coverletter', 'Cover', MailIcon],
              ['journals', 'Journals', BookOpenCheck],
              ['zotero', 'Zotero', BookOpen],
            ] as const).map(([panel, label, Icon]) => (
              <button
                key={panel}
                onClick={() => setActiveRightPanel(panel)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[10px] transition-colors border-b-2',
                  activeRightPanel === panel ? 'font-medium' : 'opacity-50 border-transparent hover:opacity-80'
                )}
                style={activeRightPanel === panel ? { borderColor: 'var(--primary)', color: 'var(--foreground)' } : undefined}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {activeRightPanel === 'citations' && <CitationManager />}
            {activeRightPanel === 'smartcite' && <SmartCitationPanel />}
            {activeRightPanel === 'ai' && <ResearchAIPanel />}
            {activeRightPanel === 'aichat' && <AIChatAssistant />}
            {activeRightPanel === 'export' && <ExportPanel />}
            {activeRightPanel === 'import' && <ImportPanel />}
            {activeRightPanel === 'latex' && <LaTeXSettingsPanel />}
            {activeRightPanel === 'links' && <CrossModuleLinker />}
            {activeRightPanel === 'plagiarism' && <PlagiarismPanel />}
            {activeRightPanel === 'spelling' && <SpellingPanel />}
            {activeRightPanel === 'submission' && <SubmissionChecker />}
            {activeRightPanel === 'authors' && <AuthorManager />}
            {activeRightPanel === 'coverletter' && <CoverLetter />}
            {activeRightPanel === 'journals' && <JournalRecommendation />}
            {activeRightPanel === 'zotero' && <ZoteroIntegration />}
          </div>
        </div>

        {/* Version History Panel */}
        <VersionHistory />

        {/* Proposed Changes Panel */}
        <ProposedChangesPanel />

        {/* Track Changes Panel */}
        <TrackChanges />
      </div>

      {/* Modals */}
      {showTemplateGallery && <JournalTemplates />}
      {showEquationEditor && <EquationEditor />}
      {showFigureManager && <FigureTableManager />}
      {showProjectWizard && <ProjectWizard onClose={() => setShowProjectWizard(false)} />}
    </div>
  );
}
