"use client";
import { useEffect } from "react";
import { usePresentationStore } from "@/store/presentation-store";
import PresentationToolbar from "@/components/presentation/toolbar";
import SlidePanel from "@/components/presentation/slide-panel";
import SlideCanvas from "@/components/presentation/slide-canvas";
import NotesPanel from "@/components/presentation/notes-panel";
import AIPanel from "@/components/presentation/ai-panel";
import PresenterMode from "@/components/presentation/presenter-mode";
import TemplateModal from "@/components/presentation/template-modal";

export default function PresentationPage() {
  const { isPresenterMode, showAIPanel, showTemplates, enterPresenterMode } =
    usePresentationStore();

  // F5 to present
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "F5") {
        e.preventDefault();
        enterPresenterMode();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enterPresenterMode]);

  return (
    <>
      {/* Presenter Mode Overlay */}
      {isPresenterMode && <PresenterMode />}

      {/* Template Modal */}
      {showTemplates && <TemplateModal />}

      {/* Editor Layout */}
      <div
        className="flex flex-col"
        style={{
          height: "calc(100vh - 56px)", // subtract topbar height
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <PresentationToolbar />

        {/* Main Editor Area */}
        <div className="flex flex-1 min-h-0">
          {/* Slide Panel */}
          <SlidePanel />

          {/* Canvas + Notes */}
          <div className="flex flex-col flex-1 min-w-0">
            <SlideCanvas />
            <NotesPanel />
          </div>

          {/* AI Panel */}
          {showAIPanel && <AIPanel />}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </>
  );
}
