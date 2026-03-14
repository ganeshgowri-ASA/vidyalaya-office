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

export default function PresentationPage() {
  const { setPresenterMode, presenterMode } = usePresentationStore();

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
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <SlidePanel />
          <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--muted)' }}>
            <SlideCanvas />
            <SpeakerNotes />
          </div>
          <AIPanel />
        </div>
      </div>
      <PresenterMode />
      <TemplateModal />
      <PrintView />
    </>
  );
}
