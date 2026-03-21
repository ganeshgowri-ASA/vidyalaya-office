"use client";

import { RAGToolbar } from "./rag-toolbar";
import { DocumentPanel } from "./document-panel";
import { RAGChatPanel } from "./rag-chat-panel";
import { DocumentViewer } from "./document-viewer";
import { CrossRefPanel } from "./crossref-panel";
import { TemplateFillPanel } from "./template-fill-panel";
import { useRAGStore } from "@/store/rag-store";

export function JnanaYantraEditor() {
  const { activePanel } = useRAGStore();

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Title bar */}
      <div
        className="flex items-center gap-3 border-b px-4 py-2"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--primary)" }}>
          <span className="text-xs font-bold" style={{ color: "var(--primary-foreground)" }}>ज्ञ</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            JnanaYantra
          </h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            RAG AI Engine — Document Intelligence
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <RAGToolbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Document Library (always visible) */}
        <div
          className="w-80 shrink-0 border-r overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <DocumentPanel />
        </div>

        {/* Center panel — context-dependent */}
        <div className="flex-1 overflow-hidden">
          {activePanel === "documents" && <DocumentPlaceholder />}
          {activePanel === "chat" && <RAGChatPanel />}
          {activePanel === "viewer" && <DocumentViewer />}
          {activePanel === "crossref" && <CrossRefPanel />}
          {activePanel === "templates" && <TemplateFillPanel />}
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between border-t px-4 py-1 text-xs"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--muted-foreground)" }}
      >
        <span>JnanaYantra RAG Engine v1.0</span>
        <span>Embedding: text-embedding-3-small | Chunk: paragraph/512</span>
      </div>
    </div>
  );
}

function DocumentPlaceholder() {
  const { documents, selectedDocumentIds, setActivePanel } = useRAGStore();
  const indexedCount = documents.filter((d) => d.status === "indexed").length;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl mb-6" style={{ backgroundColor: "var(--accent)" }}>
        <span className="text-3xl">ज्ञ</span>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
        JnanaYantra — Document Intelligence
      </h2>
      <p className="text-sm max-w-md mb-6" style={{ color: "var(--muted-foreground)" }}>
        Upload documents, ask questions with AI-powered RAG, view citations in context,
        discover cross-references, and auto-fill templates using intelligent extraction.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-md w-full mb-6">
        <div className="rounded-xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{indexedCount}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Documents Indexed</p>
        </div>
        <div className="rounded-xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{selectedDocumentIds.length}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Selected for Q&A</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          onClick={() => setActivePanel("chat")}
        >
          Start AI Q&A
        </button>
        <button
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          onClick={() => setActivePanel("crossref")}
        >
          View Cross-References
        </button>
      </div>
    </div>
  );
}
