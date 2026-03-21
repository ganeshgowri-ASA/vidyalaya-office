"use client";

import { useState } from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Highlighter,
  List,
  Info,
  X,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRAGStore } from "@/store/rag-store";

function ChunkHighlight({ chunk, isHighlighted }: {
  chunk: { id: string; content: string; pageNumber: number; metadata: { heading?: string; section?: string } };
  isHighlighted: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-4 p-3 transition-all",
        isHighlighted ? "ring-1" : ""
      )}
      style={{
        borderColor: isHighlighted ? "var(--primary)" : "var(--border)",
        backgroundColor: isHighlighted ? "var(--primary)" + "10" : "var(--accent)",
      }}
    >
      {chunk.metadata.heading && (
        <p className="text-xs font-semibold mb-1" style={{ color: "var(--primary)" }}>
          {chunk.metadata.heading}
        </p>
      )}
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        {chunk.content}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <span>Page {chunk.pageNumber}</span>
        {chunk.metadata.section && (
          <>
            <span>·</span>
            <span>{chunk.metadata.section}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function DocumentViewer() {
  const {
    activeDocumentId,
    documents,
    chunks,
    highlightedCitationId,
    getActiveConversation,
    setActiveDocumentId,
    setActivePanel,
  } = useRAGStore();

  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"document" | "chunks">("document");
  const [currentPage, setCurrentPage] = useState(1);

  const doc = documents.find((d) => d.id === activeDocumentId);
  const docChunks = chunks.filter((c) => c.documentId === activeDocumentId);

  // Find citations that reference this document
  const conv = getActiveConversation();
  const docCitations = conv?.messages
    .flatMap((m) => m.citations)
    .filter((c) => c.documentId === activeDocumentId) ?? [];

  if (!doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Select a document to view
        </p>
        <button
          className="mt-3 text-xs font-medium hover:underline"
          style={{ color: "var(--primary)" }}
          onClick={() => setActivePanel("documents")}
        >
          Go to Document Library
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <button
          className="rounded p-1 transition-colors hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => setActivePanel("documents")}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent)", color: "var(--primary)" }}>
          <FileText size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {doc.pages} pages · {doc.chunkCount} chunks · {doc.status}
          </p>
        </div>
        <button
          className="rounded p-1.5 transition-colors hover:opacity-80"
          onClick={() => setActiveDocumentId(null)}
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b px-4 py-2" style={{ borderColor: "var(--border)" }}>
        {/* View mode toggle */}
        <div className="flex rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <button
            className={cn("flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-l-lg")}
            style={{
              backgroundColor: viewMode === "document" ? "var(--primary)" : "transparent",
              color: viewMode === "document" ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
            onClick={() => setViewMode("document")}
          >
            <Eye size={12} />
            Document
          </button>
          <button
            className={cn("flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-r-lg")}
            style={{
              backgroundColor: viewMode === "chunks" ? "var(--primary)" : "transparent",
              color: viewMode === "chunks" ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
            onClick={() => setViewMode("chunks")}
          >
            <List size={12} />
            Chunks
          </button>
        </div>

        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1 hover:opacity-80"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <span className="text-xs w-10 text-center" style={{ color: "var(--muted-foreground)" }}>{zoom}%</span>
          <button
            className="rounded p-1 hover:opacity-80"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: "var(--border)" }}>
          <button
            className="rounded p-1 hover:opacity-80 disabled:opacity-30"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {currentPage} / {doc.pages}
          </span>
          <button
            className="rounded p-1 hover:opacity-80 disabled:opacity-30"
            disabled={currentPage >= doc.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === "document" ? (
          <div className="mx-auto max-w-2xl">
            {/* Simulated document page */}
            <div
              className="rounded-lg border p-8 shadow-sm min-h-[600px]"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card)",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <h1 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
                {doc.name.replace(/\.[^.]+$/, "")}
              </h1>
              <div className="space-y-4">
                {doc.summary && (
                  <div className="rounded-lg p-3 border-l-4" style={{ borderColor: "var(--primary)", backgroundColor: "var(--accent)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--primary)" }}>AI Summary</p>
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>{doc.summary}</p>
                  </div>
                )}

                {/* Show chunks for this page with citation highlighting */}
                {docChunks
                  .filter((c) => c.pageNumber === currentPage)
                  .map((chunk) => {
                    const isCited = docCitations.some((cit) => cit.chunkId === chunk.id);
                    return (
                      <div
                        key={chunk.id}
                        className={cn("rounded p-3 transition-all", isCited ? "ring-2" : "")}
                        style={{
                          backgroundColor: isCited ? "var(--primary)" + "10" : "transparent",
                          outlineColor: isCited ? "var(--primary)" : "transparent",
                        }}
                      >
                        {chunk.metadata.heading && (
                          <h3 className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                            {chunk.metadata.heading}
                          </h3>
                        )}
                        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                          {isCited && <Highlighter size={12} className="inline mr-1" style={{ color: "var(--primary)" }} />}
                          {chunk.content}
                        </p>
                        {isCited && (
                          <p className="mt-1 text-xs font-medium" style={{ color: "var(--primary)" }}>
                            ★ Cited in AI response
                          </p>
                        )}
                      </div>
                    );
                  })}

                {docChunks.filter((c) => c.pageNumber === currentPage).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 opacity-40">
                    <BookOpen size={32} />
                    <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      Page {currentPage} content preview
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Chunks available on other pages
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Chunks view */
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} style={{ color: "var(--muted-foreground)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {docChunks.length} chunks indexed from this document
              </span>
            </div>
            {docChunks.map((chunk) => {
              const isCited = docCitations.some((cit) => cit.chunkId === chunk.id);
              return (
                <ChunkHighlight
                  key={chunk.id}
                  chunk={chunk}
                  isHighlighted={isCited || highlightedCitationId === chunk.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Citation references footer */}
      {docCitations.length > 0 && (
        <div className="border-t px-4 py-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Highlighter size={12} style={{ color: "var(--primary)" }} />
            <span>{docCitations.length} citation(s) from AI responses reference this document</span>
          </div>
        </div>
      )}
    </div>
  );
}
