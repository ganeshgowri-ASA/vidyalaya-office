"use client";

import React, { useEffect, useCallback } from "react";
import { Upload, FileText } from "lucide-react";
import { RibbonToolbar } from "@/components/document/ribbon-toolbar";
import { EditorArea, getEditorContent } from "@/components/document/editor-area";
import { StatusBar } from "@/components/document/status-bar";
import { AIPanel } from "@/components/document/ai-panel";
import { TemplatesModal } from "@/components/document/templates-modal";
import { FindReplaceDialog } from "@/components/document/find-replace";
import { PrintPreview } from "@/components/document/print-preview";
import { CommentsSidebar } from "@/components/document/comments-sidebar";
import { TrackChangesPanel } from "@/components/document/track-changes";
import { StylesPanel } from "@/components/document/styles-panel";
import { PageSetupDialog } from "@/components/document/page-setup-dialog";
import { HeaderFooterEditor } from "@/components/document/header-footer-editor";
import { VersionControlPanel } from "@/components/document/version-control-panel";
import { DeveloperPanel } from "@/components/document/developer-tab";
import { MailMergeDialog } from "@/components/document/mail-merge";
import { DocumentPropertiesDialog } from "@/components/document/document-properties";
import { KeyboardShortcutsDialog } from "@/components/document/keyboard-shortcuts-dialog";
import { useDocumentStore } from "@/store/document-store";
import { SmartArtInfographicsModal } from "@/components/document/smartart-infographics-modal";
import { EquationEditor } from "@/components/document/equation-editor";
import { CitationManagerModal } from "@/components/document/citation-manager";
import {
  CollaborationToolbar,
  CollabCommentsSidebar,
  ShareDialog,
  PresenceIndicators,
  VersionHistoryPanel,
} from "@/components/collaboration";
import { useCollaborationStore } from "@/store/collaboration-store";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { ExportProgress } from "@/components/shared/export-progress";
import { ImportDialog } from "@/components/shared/import-dialog";
import { PrintPreviewModal } from "@/components/shared/print-preview-modal";
import { ExportManager, type ExportFormat } from "@/lib/export-manager";

export default function DocumentPage() {
  const {
    fileName, setFileName, setShowFindReplace, showComments, trackChanges,
    showStylesPanel, setHeaderText, setFooterText, showNavigationPane,
    showEquationEditor, setShowEquationEditor,
    showCitationManager, setShowCitationManager,
    showMailMerge, setShowMailMerge,
    showDocProperties, setShowDocProperties,
    showKeyboardShortcuts, setShowKeyboardShortcuts,
  } = useDocumentStore();

  const {
    showCollabComments,
    showVersionHistory: showCollabVersionHistory,
  } = useCollaborationStore();

  const [showPageSetup, setShowPageSetup] = React.useState(false);
  const [showHeaderFooterEditor, setShowHeaderFooterEditor] = React.useState(false);
  const [showVersionControl, setShowVersionControl] = React.useState(false);
  const [showDeveloper, setShowDeveloper] = React.useState(false);
  const [headerConfig, setHeaderConfig] = React.useState({ left: "", center: "", right: "" });
  const [footerConfig, setFooterConfig] = React.useState({ left: "", center: "", right: "" });
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState({ percent: 0, message: "" });
  const [showImport, setShowImport] = React.useState(false);
  const [showPrintPreview, setShowPrintPreview] = React.useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "p":
            e.preventDefault();
            window.print();
            break;
          case "f":
            e.preventDefault();
            setShowFindReplace(true);
            break;
          case "h":
            if (e.ctrlKey) {
              e.preventDefault();
              setShowFindReplace(true);
            }
            break;
          case "s":
            e.preventDefault();
            // Trigger save
            const editor = document.getElementById("doc-editor");
            if (editor) {
              localStorage.setItem("vidyalaya-doc-content", editor.innerHTML);
              useDocumentStore.getState().setLastSaved(new Date().toLocaleTimeString());
            }
            break;
          case "b":
            // Bold - handled by browser contentEditable
            break;
          case "i":
            // Italic - handled by browser contentEditable
            break;
          case "u":
            // Underline - handled by browser contentEditable
            break;
          case "z":
            // Undo - handled by browser contentEditable
            break;
          case "y":
            // Redo - handled by browser contentEditable
            break;
          case "a":
            // Select All - handled by browser contentEditable
            break;
          case "c":
            // Copy - handled by browser contentEditable
            break;
          case "v":
            // Paste - handled by browser contentEditable
            break;
          case "x":
            // Cut - handled by browser contentEditable
            break;
          case "e":
            e.preventDefault();
            document.execCommand("justifyCenter");
            break;
          case "l":
            e.preventDefault();
            document.execCommand("justifyLeft");
            break;
          case "r":
            e.preventDefault();
            document.execCommand("justifyRight");
            break;
          case "j":
            e.preventDefault();
            document.execCommand("justifyFull");
            break;
          case "1":
            e.preventDefault();
            useDocumentStore.getState().setLineSpacing("1");
            break;
          case "2":
            e.preventDefault();
            useDocumentStore.getState().setLineSpacing("2");
            break;
        }
        // Ctrl+Shift+/ for keyboard shortcuts
        if (e.shiftKey && (e.key === "/" || e.key === "?")) {
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setShowFindReplace, showKeyboardShortcuts, setShowKeyboardShortcuts]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    const content = getEditorContent();
    setIsExporting(true);
    try {
      await ExportManager.exportDocument(format, content, fileName, setExportProgress);
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  }, [fileName]);

  const handlePrint = useCallback(() => {
    const content = getEditorContent();
    ExportManager.printContent(content, fileName);
  }, [fileName]);

  const handleImport = useCallback(async (file: File) => {
    const result = await ExportManager.importDocument(file, setExportProgress);
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.innerHTML = result.content;
      localStorage.setItem("vidyalaya-doc-content", result.content);
    }
  }, []);

  const handleHeaderFooterSave = (header: { left: string; center: string; right: string }, footer: { left: string; center: string; right: string }) => {
    setHeaderConfig(header);
    setFooterConfig(footer);
    setHeaderText(header.center || header.left || header.right);
    setFooterText(footer.center || footer.left || footer.right);
  };

  const handleVersionRestore = (content: string) => {
    const editor = document.getElementById("doc-editor");
    if (editor) editor.innerHTML = content;
  };

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Document title bar */}
      <div
        className="no-print flex items-center justify-between border-b px-4 py-1.5"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-2">
          <FileText size={18} style={{ color: "var(--primary)" }} />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] px-1 py-0.5"
            style={{ color: "var(--foreground)" }}
            aria-label="Document name"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <Upload size={14} />
            Import
          </button>
          <ExportDropdown
            documentType="document"
            onExport={handleExport}
            onPrint={handlePrint}
            onPrintPreview={() => setShowPrintPreview(true)}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />
        </div>
      </div>

      {/* Collaboration Toolbar */}
      <CollaborationToolbar />

      {/* Ribbon */}
      <RibbonToolbar
        onPageSetup={() => setShowPageSetup(true)}
        onHeaderFooterEditor={() => setShowHeaderFooterEditor(true)}
        onToggleVersionControl={() => setShowVersionControl(!showVersionControl)}
        onToggleDeveloper={() => setShowDeveloper(!showDeveloper)}
        onShowDocProperties={() => setShowDocProperties(true)}
        onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
      />

      {/* Track Changes Panel */}
      {trackChanges && <TrackChangesPanel />}

      {/* Developer Panel */}
      {showDeveloper && <DeveloperPanel visible={showDeveloper} onClose={() => setShowDeveloper(false)} />}

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Navigation Pane */}
        {showNavigationPane && <NavigationPane />}

        {/* Styles Panel */}
        {showStylesPanel && <StylesPanel />}

        {/* Editor */}
        <EditorArea />

        {/* Find & Replace overlay */}
        <FindReplaceDialog />

        {/* Comments Sidebar */}
        {showComments && <CommentsSidebar />}

        {/* Collaboration Comments Sidebar */}
        {showCollabComments && <CollabCommentsSidebar />}

        {/* Collaboration Version History */}
        {showCollabVersionHistory && <VersionHistoryPanel />}

        {/* Version Control */}
        <VersionControlPanel
          visible={showVersionControl}
          onClose={() => setShowVersionControl(false)}
          currentContent={typeof window !== "undefined" ? getEditorContent() : ""}
          onRestore={handleVersionRestore}
          documentName={fileName}
        />

        {/* AI Panel */}
        <AIPanel />
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Modals */}
      <TemplatesModal />
      <PrintPreview />
      <PageSetupDialog open={showPageSetup} onClose={() => setShowPageSetup(false)} />
      <HeaderFooterEditor
        open={showHeaderFooterEditor}
        onClose={() => setShowHeaderFooterEditor(false)}
        headerConfig={headerConfig}
        footerConfig={footerConfig}
        onSave={handleHeaderFooterSave}
      />
      <SmartArtInfographicsModal />
      <EquationEditor
        open={showEquationEditor}
        onClose={() => setShowEquationEditor(false)}
        onInsert={(html) => {
          const editor = document.getElementById("doc-editor");
          if (editor) {
            editor.focus();
            document.execCommand("insertHTML", false, html);
          }
        }}
      />
      <CitationManagerModal
        open={showCitationManager}
        onClose={() => setShowCitationManager(false)}
      />
      <MailMergeDialog
        open={showMailMerge}
        onClose={() => setShowMailMerge(false)}
      />
      <DocumentPropertiesDialog
        open={showDocProperties}
        onClose={() => setShowDocProperties(false)}
      />
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
      {/* Collaboration modals */}
      <ShareDialog />

      {/* Export/Import modals */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        defaultType="document"
      />
      <PrintPreviewModal
        open={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        htmlContent={typeof window !== "undefined" ? getEditorContent() : ""}
        title={fileName}
      />
      <ExportProgress
        visible={isExporting}
        percent={exportProgress.percent}
        message={exportProgress.message}
        onClose={() => setIsExporting(false)}
      />
    </div>
  );
}

// Navigation Pane component
function NavigationPane() {
  const [headings, setHeadings] = React.useState<{ text: string; level: number; id: string }[]>([]);

  React.useEffect(() => {
    const updateHeadings = () => {
      const editor = document.getElementById("doc-editor");
      if (!editor) return;
      const hs = editor.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const result: { text: string; level: number; id: string }[] = [];
      hs.forEach((h, i) => {
        const id = `nav-heading-${i}`;
        h.id = id;
        result.push({
          text: h.textContent || "",
          level: parseInt(h.tagName[1]),
          id,
        });
      });
      setHeadings(result);
    };

    updateHeadings();
    const interval = setInterval(updateHeadings, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-56 border-r overflow-y-auto flex-shrink-0"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="px-3 py-2 border-b text-xs font-medium" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
        Navigation
      </div>
      <div className="p-2">
        {headings.length === 0 ? (
          <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            No headings found. Add headings (H1-H6) to navigate your document.
          </p>
        ) : (
          headings.map((h) => (
            <button
              key={h.id}
              className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-[var(--muted)] block truncate"
              style={{
                color: "var(--foreground)",
                paddingLeft: (h.level - 1) * 12 + 8 + "px",
                fontWeight: h.level <= 2 ? 600 : 400,
              }}
              onClick={() => {
                const el = document.getElementById(h.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {h.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
