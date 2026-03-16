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
import { useCollaborationStore } from '@/store/collaboration-store';

export default function PresentationPage() {
  const {
    setPresenterMode, presenterMode, loadTemplate,
    undo, redo, pushUndo, copyElement, pasteElement,
    selectedElementId, removeElement, activeSlideIndex,
  } = usePresentationStore();
  const [showPageSetup, setShowPageSetup] = React.useState(false);

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
    [presenterMode, setPresenterMode, undo, redo, copyElement, pasteElement, selectedElementId, pushUndo, removeElement, activeSlideIndex],
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
    </>
  );
}
