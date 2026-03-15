"use client";

import React, { useEffect, useCallback } from "react";
import { Download, FileText, FileType2 } from "lucide-react";
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
import { useDocumentStore } from "@/store/document-store";
import { exportAsHTML, exportAsText } from "@/components/document/export-utils";

export default function DocumentPage() {
  const { fileName, setFileName, setShowFindReplace, showComments, trackChanges, showStylesPanel, setHeaderText, setFooterText } = useDocumentStore();
  const [showExport, setShowExport] = React.useState(false);
  const [showPageSetup, setShowPageSetup] = React.useState(false);
  const [showHeaderFooterEditor, setShowHeaderFooterEditor] = React.useState(false);
  const [showVersionControl, setShowVersionControl] = React.useState(false);
  const [showDeveloper, setShowDeveloper] = React.useState(false);
  const [headerConfig, setHeaderConfig] = React.useState({ left: "", center: "", right: "" });
  const [footerConfig, setFooterConfig] = React.useState({ left: "", center: "", right: "" });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        window.print();
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setShowFindReplace]);

  const handleExportHTML = useCallback(() => {
    exportAsHTML(fileName);
    setShowExport(false);
  }, [fileName]);

  const handleExportText = useCallback(() => {
    exportAsText(fileName);
    setShowExport(false);
  }, [fileName]);

  const handlePrint = useCallback(() => {
    window.print();
    setShowExport(false);
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
        className="no-print flex items-center justify-between border-b px-4 py-2"
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
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <Download size={14} />
            Export
          </button>
          {showExport && (
            <div
              className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border shadow-lg py-1"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <button
                onClick={handleExportHTML}
                className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-[var(--muted)]"
                style={{ color: "var(--foreground)" }}
              >
                <FileType2 size={14} />
                Download as HTML
              </button>
              <button
                onClick={handleExportText}
                className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-[var(--muted)]"
                style={{ color: "var(--foreground)" }}
              >
                <FileText size={14} />
                Download as Text
              </button>
              <hr style={{ borderColor: "var(--border)" }} />
              <button
                onClick={handlePrint}
                className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-[var(--muted)]"
                style={{ color: "var(--foreground)" }}
              >
                <Download size={14} />
                Print (Ctrl+P)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ribbon */}
      <RibbonToolbar
        onPageSetup={() => setShowPageSetup(true)}
        onHeaderFooterEditor={() => setShowHeaderFooterEditor(true)}
        onToggleVersionControl={() => setShowVersionControl(!showVersionControl)}
        onToggleDeveloper={() => setShowDeveloper(!showDeveloper)}
      />

      {/* Track Changes Panel */}
      {trackChanges && <TrackChangesPanel />}

      {/* Developer Panel */}
      {showDeveloper && <DeveloperPanel visible={showDeveloper} onClose={() => setShowDeveloper(false)} />}

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Styles Panel */}
        {showStylesPanel && <StylesPanel />}

        {/* Editor */}
        <EditorArea />

        {/* Find & Replace overlay */}
        <FindReplaceDialog />

        {/* Comments Sidebar */}
        {showComments && <CommentsSidebar />}

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
    </div>
  );
}
