"use client";

import React, { useEffect, useCallback } from "react";
import { Download, FileText, FileType2 } from "lucide-react";
import { RibbonToolbar } from "@/components/document/ribbon-toolbar";
import { EditorArea } from "@/components/document/editor-area";
import { StatusBar } from "@/components/document/status-bar";
import { AIPanel } from "@/components/document/ai-panel";
import { TemplatesModal } from "@/components/document/templates-modal";
import { FindReplaceDialog } from "@/components/document/find-replace";
import { PrintPreview } from "@/components/document/print-preview";
import { useDocumentStore } from "@/store/document-store";
import { exportAsHTML, exportAsText } from "@/components/document/export-utils";

export default function DocumentPage() {
  const { fileName, setFileName, setShowFindReplace } = useDocumentStore();
  const [showExport, setShowExport] = React.useState(false);

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
      <RibbonToolbar />

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Editor */}
        <EditorArea />

        {/* Find & Replace overlay */}
        <FindReplaceDialog />

        {/* AI Panel */}
        <AIPanel />
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Modals */}
      <TemplatesModal />
      <PrintPreview />
    </div>
  );
}
