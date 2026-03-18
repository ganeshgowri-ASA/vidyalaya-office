'use client';

import React, { useEffect, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentation-store';
import SlidePanel from '@/components/presentation/slide-panel';
import SlideCanvas from '@/components/presentation/slide-canvas';
import RibbonToolbar from '@/components/presentation/ribbon-toolbar';
import PresenterMode from '@/components/presentation/presenter-mode';
import SpeakerNotes from '@/components/presentation/speaker-notes';
import TemplateModal from '@/components/presentation/template-modal';
import AIPanel from '@/components/presentation/ai-panel';
import PrintView from '@/components/presentation/print-view';
import AnimationsPanel from '@/components/presentation/animations-panel';
import SmartArtModal from '@/components/presentation/smart-art-modal';
import StatusBar from '@/components/presentation/status-bar';
import SlideSorter from '@/components/presentation/slide-sorter';
import SlideMasterPanel from '@/components/presentation/slide-master-panel';
import DesignPanel from '@/components/presentation/design-panel';
import MediaPanel from '@/components/presentation/media-panel';
import TextEffectsPanel from '@/components/presentation/text-effects-panel';
import ExportPanel from '@/components/presentation/export-panel';
import ThemeDesigner from '@/components/presentation/theme-designer';
import ShapeDrawingTools from '@/components/presentation/shape-drawing-tools';
import ImageEditor from '@/components/presentation/image-editor';
import TransitionPanel from '@/components/presentation/transition-panel';
import AnimationTimeline from '@/components/presentation/animation-timeline';
import { PageSetupDialog } from '@/components/document/page-setup-dialog';
import { CollaborationToolbar, CollabCommentsSidebar, ShareDialog, VersionHistoryPanel } from '@/components/collaboration';
import RecordNarrationModal from '@/components/presentation/record-narration-modal';
import SlideZoomModal from '@/components/presentation/slide-zoom-modal';
import KeyboardShortcutsModal from '@/components/presentation/keyboard-shortcuts-modal';
import { useCollaborationStore } from '@/store/collaboration-store';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import { ExportProgress } from '@/components/shared/export-progress';
import { ImportDialog } from '@/components/shared/import-dialog';
import { PrintPreviewModal } from '@/components/shared/print-preview-modal';
import { ExportManager, type ExportFormat } from '@/lib/export-manager';

export default function PresentationPage() {
  const {
    setPresenterMode, presenterMode, loadTemplate,
    undo, redo, pushUndo, copyElement, pasteElement,
    selectedElementId, removeElement, activeSlideIndex,
    setShowKeyboardShortcuts,
  } = usePresentationStore();
  const [showPageSetup, setShowPageSetup] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState({ percent: 0, message: '' });
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = React.useState(false);

  const slides = usePresentationStore((s) => s.slides);
  const presentationTitle = 'Presentation';

  const getSlidesData = useCallback(() => {
    return slides.map((slide) => {
      const textEls = slide.elements.filter((e) => e.type === 'text');
      const title = textEls[0]?.content || `Slide`;
      const content = textEls.slice(1).map((e) => e.content || '').join('\n');
      return { title, content };
    });
  }, [slides]);

  const handlePresentationExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const slidesData = getSlidesData();
      await ExportManager.exportPresentation(format, slidesData, presentationTitle, setExportProgress);
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  }, [getSlidesData, presentationTitle]);

  const handlePresentationPrint = useCallback(() => {
    const slidesData = getSlidesData();
    ExportManager.exportPresentation('pdf', slidesData, presentationTitle);
  }, [getSlidesData, presentationTitle]);

  const handlePresentationImport = useCallback(async (file: File) => {
    const result = await ExportManager.importPresentation(file, setExportProgress);
    const newSlides = result.slides.map((s, i) => ({
      id: `imported-${Date.now()}-${i}`,
      layout: 'content' as const,
      background: '#ffffff',
      transition: 'fade' as const,
      transitionDuration: 500,
      elements: [
        {
          id: `title-${i}`,
          type: 'text' as const,
          x: 50,
          y: 30,
          width: 860,
          height: 80,
          content: s.title,
          rotation: 0,
          style: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#000000',
            fontFamily: 'Arial',
            textAlign: 'center',
          },
        },
        {
          id: `content-${i}`,
          type: 'text' as const,
          x: 50,
          y: 140,
          width: 860,
          height: 350,
          content: s.content,
          rotation: 0,
          style: {
            fontSize: 18,
            color: '#333333',
            fontFamily: 'Arial',
            textAlign: 'left',
          },
        },
      ],
      notes: '',
    }));
    if (newSlides.length > 0) {
      loadTemplate(newSlides);
    }
  }, [loadTemplate]);

  const getPresentationPreviewHtml = useCallback(() => {
    const slidesData = getSlidesData();
    let html = '';
    slidesData.forEach((s, i) => {
      html += `<div style="border:1px solid #ddd;padding:40px;margin:20px 0;min-height:400px;page-break-after:always">`;
      html += `<h1 style="font-size:28px;margin-bottom:20px">${s.title}</h1>`;
      html += `<p style="font-size:16px;line-height:1.6;white-space:pre-wrap">${s.content}</p>`;
      html += `</div>`;
    });
    return html;
  }, [getSlidesData]);

  useEffect(() => {
    const templateData = localStorage.getItem('vidyalaya-ppt-template');
    if (templateData) {
      try {
        const slides = JSON.parse(templateData);
        if (Array.isArray(slides) && slides.length > 0) {
          loadTemplate(slides);
        }
      } catch (e) {
        console.error('Failed to load PPT template:', e);
      }
      localStorage.removeItem('vidyalaya-ppt-template');
    }
  }, [loadTemplate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'F5' && !presenterMode) {
        e.preventDefault();
        setPresenterMode(true);
      }
      // ? key opens keyboard shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.getAttribute('contenteditable') === 'true' || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.getAttribute('contenteditable') === 'true' || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        if (selectedElementId) {
          e.preventDefault();
          copyElement();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.getAttribute('contenteditable') === 'true' || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        pasteElement();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.getAttribute('contenteditable') === 'true' || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        if (selectedElementId) {
          e.preventDefault();
          pushUndo();
          removeElement(activeSlideIndex, selectedElementId);
        }
      }
    },
    [presenterMode, setPresenterMode, undo, redo, copyElement, pasteElement, selectedElementId, pushUndo, removeElement, activeSlideIndex, setShowKeyboardShortcuts],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const { showCollabComments, showVersionHistory: showCollabHistory } = useCollaborationStore();

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-48px)] no-print">
        <CollaborationToolbar />
        {/* Export/Import bar */}
        <div
          className="no-print flex items-center justify-end gap-2 border-b px-4 py-1"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Import
          </button>
          <ExportDropdown
            documentType="presentation"
            onExport={handlePresentationExport}
            onPrint={handlePresentationPrint}
            onPrintPreview={() => setShowPrintPreviewModal(true)}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />
        </div>
        <RibbonToolbar onPageSetup={() => setShowPageSetup(true)} />
        <div className="flex flex-1 overflow-hidden">
          <SlidePanel />
          <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--muted)' }}>
            <SlideCanvas />
            <AnimationTimeline />
            <SpeakerNotes />
          </div>
          <AnimationsPanel />
          <TextEffectsPanel />
          <DesignPanel />
          <ThemeDesigner />
          <ShapeDrawingTools />
          <ImageEditor />
          <TransitionPanel />
          <AIPanel />
          {showCollabComments && <CollabCommentsSidebar />}
          {showCollabHistory && <VersionHistoryPanel />}
        </div>
        <StatusBar />
      </div>
      <PresenterMode />
      <TemplateModal />
      <SmartArtModal />
      <SlideSorter />
      <SlideMasterPanel />
      <MediaPanel />
      <ExportPanel />
      <PrintView />
      <PageSetupDialog open={showPageSetup} onClose={() => setShowPageSetup(false)} />
      <ShareDialog />
      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handlePresentationImport}
        defaultType="presentation"
      />
      <PrintPreviewModal
        open={showPrintPreviewModal}
        onClose={() => setShowPrintPreviewModal(false)}
        htmlContent={getPresentationPreviewHtml()}
        title={presentationTitle}
      />
      <ExportProgress
        visible={isExporting}
        percent={exportProgress.percent}
        message={exportProgress.message}
        onClose={() => setIsExporting(false)}
      />
      <RecordNarrationModal />
      <SlideZoomModal />
      <KeyboardShortcutsModal />
    </>
  );
}
