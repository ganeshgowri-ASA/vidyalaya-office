'use client';

import React, { useEffect, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentation-store';
import SlidePanel from '@/components/presentation/slide-panel';
import SlideCanvas from '@/components/presentation/slide-canvas';
import Toolbar from '@/components/presentation/toolbar';
import PresenterMode from '@/components/presentation/presenter-mode';
import SpeakerNotes from '@/components/presentation/speaker-notes';
import TemplateModal from '@/components/presentation/template-modal';
import AIPanel from '@/components/presentation/ai-panel';
import PrintView from '@/components/presentation/print-view';
import AnimationsPanel from '@/components/presentation/animations-panel';
import SmartArtModal from '@/components/presentation/smart-art-modal';
import { PageSetupDialog } from '@/components/document/page-setup-dialog';

export default function PresentationPage() {
  const { setPresenterMode, presenterMode, loadTemplate } = usePresentationStore();
  const [showPageSetup, setShowPageSetup] = React.useState(false);

  // Load template from localStorage if navigated from Templates page
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
    },
    [presenterMode, setPresenterMode],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-48px)] no-print">
        <Toolbar onPageSetup={() => setShowPageSetup(true)} />
        <div className="flex flex-1 overflow-hidden">
          <SlidePanel />
          <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--muted)' }}>
            <SlideCanvas />
            <SpeakerNotes />
          </div>
          <AnimationsPanel />
          <AIPanel />
        </div>
      </div>
      <PresenterMode />
      <TemplateModal />
      <SmartArtModal />
      <PrintView />
      <PageSetupDialog open={showPageSetup} onClose={() => setShowPageSetup(false)} />
    </>
  );
}
