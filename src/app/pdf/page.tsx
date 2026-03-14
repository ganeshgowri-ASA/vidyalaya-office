"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Upload,
  FileDown,
  Layers,
  Wrench,
  Sparkles,
  Download,
  Printer,
  X,
} from "lucide-react";
import {
  PDFAnnotationToolbar,
  DrawingCanvas,
  StickyNoteWidget,
  useAnnotations,
} from "@/components/pdf/PDFAnnotations";
import { PDFOperations } from "@/components/pdf/PDFOperations";

// Dynamically import heavy PDF components to avoid SSR issues
const PDFViewerDynamic = dynamic(
  () => import("@/components/pdf/PDFViewer").then((m) => ({ default: m.PDFViewer })),
  { ssr: false, loading: () => <PDFLoadingPlaceholder /> }
);

const ThumbnailSidebarDynamic = dynamic(
  () => import("@/components/pdf/PDFViewer").then((m) => ({ default: m.ThumbnailSidebar })),
  { ssr: false }
);

const PDFAIPanelDynamic = dynamic(
  () => import("@/components/pdf/PDFAIPanel").then((m) => ({ default: m.PDFAIPanel })),
  { ssr: false }
);

function PDFLoadingPlaceholder() {
  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ color: "var(--foreground)" }}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
        style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

type RightPanel = "ai" | "operations" | null;

export default function PDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [rightPanel, setRightPanel] = useState<RightPanel>("ai");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const annotations = useAnnotations();

  function handleFileSelect(files: FileList | null) {
    const f = files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setCurrentPage(1);
    }
  }

  function handleViewerClick(e: React.MouseEvent<HTMLDivElement>) {
    if (annotations.activeTool === "note") {
      const rect = e.currentTarget.getBoundingClientRect();
      annotations.addNote(e.clientX - rect.left, e.clientY - rect.top, currentPage);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pageNotes = annotations.notes.filter((n) => n.page === currentPage);

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Top toolbar */}
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b px-3 py-2"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        {/* File upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            borderColor: "var(--primary)",
            color: "var(--primary)",
          }}
        >
          <Upload size={15} />
          {file ? "Change PDF" : "Open PDF"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {file && (
          <>
            <span
              className="hidden truncate text-sm sm:inline"
              style={{ color: "var(--foreground)", opacity: 0.7, maxWidth: 200 }}
            >
              {file.name}
            </span>

            <div className="flex-1" />

            {/* Panel toggles */}
            <div
              className="flex gap-1 rounded-lg p-0.5"
              style={{ backgroundColor: "var(--secondary)" }}
            >
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`rounded-md p-1.5 transition-all ${showThumbnails ? "opacity-100" : "opacity-50 hover:opacity-70"}`}
                title="Thumbnail sidebar"
                style={{
                  backgroundColor: showThumbnails ? "var(--background)" : "transparent",
                  color: "var(--foreground)",
                }}
              >
                <Layers size={15} />
              </button>
              <button
                onClick={() => setRightPanel(rightPanel === "operations" ? null : "operations")}
                className={`rounded-md p-1.5 transition-all ${rightPanel === "operations" ? "opacity-100" : "opacity-50 hover:opacity-70"}`}
                title="PDF Operations"
                style={{
                  backgroundColor: rightPanel === "operations" ? "var(--background)" : "transparent",
                  color: "var(--foreground)",
                }}
              >
                <Wrench size={15} />
              </button>
              <button
                onClick={() => setRightPanel(rightPanel === "ai" ? null : "ai")}
                className={`rounded-md p-1.5 transition-all ${rightPanel === "ai" ? "opacity-100" : "opacity-50 hover:opacity-70"}`}
                title="AI Panel"
                style={{
                  backgroundColor: rightPanel === "ai" ? "var(--background)" : "transparent",
                  color: "var(--foreground)",
                }}
              >
                <Sparkles size={15} />
              </button>
            </div>

            {/* Print / Download */}
            <button
              onClick={handlePrint}
              className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
              title="Print"
              style={{ color: "var(--foreground)" }}
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
              title="Download"
              style={{ color: "var(--foreground)" }}
            >
              <Download size={16} />
            </button>
          </>
        )}

        {!file && <div className="flex-1" />}

        <span className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>
          PDF Tools
        </span>
      </div>

      {/* Upload / empty state */}
      {!file ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-6"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
        >
          <div
            className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              dragging ? "scale-105 opacity-100" : "opacity-80"
            }`}
            style={{
              borderColor: dragging ? "var(--primary)" : "var(--border)",
              backgroundColor: dragging ? "var(--accent)" : "transparent",
            }}
          >
            <FileDown size={52} style={{ color: "var(--primary)" }} />
            <div>
              <h2 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
                Open a PDF
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                Drag & drop a PDF here, or click the button above
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: "👁", label: "View & Navigate" },
                { icon: "✏️", label: "Annotations" },
                { icon: "🔧", label: "Merge & Split" },
                { icon: "✨", label: "AI Insights" },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="flex flex-col items-center gap-1 rounded-lg px-4 py-3"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <span className="text-xl">{feat.icon}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Main editor layout
        <div className="flex flex-1 overflow-hidden">
          {/* Thumbnail sidebar */}
          {showThumbnails && (
            <div
              className="w-28 flex-shrink-0 overflow-hidden border-r"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <ThumbnailSidebarDynamic
                file={file}
                numPages={numPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* PDF Viewer area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Annotation toolbar */}
            <PDFAnnotationToolbar
              activeTool={annotations.activeTool}
              onToolChange={annotations.setActiveTool}
              highlightColor={annotations.highlightColor}
              onHighlightColorChange={annotations.setHighlightColor}
              drawColor={annotations.drawColor}
              onDrawColorChange={annotations.setDrawColor}
              onClearAll={annotations.clearAll}
            />

            {/* Viewer with overlay */}
            <div
              ref={viewerContainerRef}
              className="relative flex-1 overflow-auto"
              onClick={handleViewerClick}
              style={{
                cursor: annotations.activeTool === "note" ? "cell" : "default",
              }}
            >
              <PDFViewerDynamic
                file={file}
                onFileLoad={(n) => setNumPages(n)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />

              {/* Drawing canvas overlay */}
              <DrawingCanvas
                active={annotations.activeTool === "draw"}
                color={annotations.drawColor}
                page={currentPage}
                draws={annotations.draws}
                onAddPath={annotations.addDraw}
              />

              {/* Sticky notes */}
              {pageNotes.map((note) => (
                <StickyNoteWidget
                  key={note.id}
                  note={note}
                  onUpdate={annotations.updateNote}
                  onDelete={annotations.deleteNote}
                />
              ))}
            </div>
          </div>

          {/* Right panel */}
          {rightPanel && (
            <div
              className="w-72 flex-shrink-0 overflow-hidden border-l xl:w-80"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <div className="flex h-full flex-col">
                {/* Panel header tabs */}
                <div
                  className="flex flex-shrink-0 items-center justify-between border-b px-3 py-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRightPanel("ai")}
                      className={`rounded px-2 py-1 text-xs font-medium transition-all ${
                        rightPanel === "ai" ? "opacity-100" : "opacity-50 hover:opacity-70"
                      }`}
                      style={{
                        backgroundColor: rightPanel === "ai" ? "var(--accent)" : "transparent",
                        color: "var(--foreground)",
                      }}
                    >
                      ✨ AI
                    </button>
                    <button
                      onClick={() => setRightPanel("operations")}
                      className={`rounded px-2 py-1 text-xs font-medium transition-all ${
                        rightPanel === "operations" ? "opacity-100" : "opacity-50 hover:opacity-70"
                      }`}
                      style={{
                        backgroundColor: rightPanel === "operations" ? "var(--accent)" : "transparent",
                        color: "var(--foreground)",
                      }}
                    >
                      🔧 Operations
                    </button>
                  </div>
                  <button
                    onClick={() => setRightPanel(null)}
                    className="rounded p-1 transition-opacity hover:opacity-70"
                    style={{ color: "var(--foreground)" }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-hidden">
                  {rightPanel === "ai" && <PDFAIPanelDynamic file={file} />}
                  {rightPanel === "operations" && <PDFOperations />}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
