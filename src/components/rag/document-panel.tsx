"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Tag,
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  File,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRAGStore } from "@/store/rag-store";
import type { RAGDocument } from "@/types/rag";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_CONFIG: Record<RAGDocument["status"], { icon: React.ReactNode; label: string; color: string }> = {
  uploading: { icon: <Loader2 size={14} className="animate-spin" />, label: "Uploading", color: "#f59e0b" },
  processing: { icon: <Loader2 size={14} className="animate-spin" />, label: "Indexing", color: "#3b82f6" },
  indexed: { icon: <Check size={14} />, label: "Indexed", color: "#22c55e" },
  error: { icon: <AlertCircle size={14} />, label: "Error", color: "#ef4444" },
};

function DocumentRow({ doc }: { doc: RAGDocument }) {
  const { selectedDocumentIds, toggleDocumentSelection, setActiveDocumentId, activeDocumentId, removeDocument } = useRAGStore();
  const isSelected = selectedDocumentIds.includes(doc.id);
  const isActive = activeDocumentId === doc.id;
  const status = STATUS_CONFIG[doc.status];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors border",
        isActive ? "border-opacity-100" : "border-transparent hover:border-opacity-50"
      )}
      style={{
        backgroundColor: isActive ? "var(--sidebar-accent)" : undefined,
        borderColor: isActive ? "var(--primary)" : "var(--border)",
      }}
      onClick={() => setActiveDocumentId(doc.id)}
    >
      <button
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
        )}
        style={{
          borderColor: isSelected ? "var(--primary)" : "var(--border)",
          backgroundColor: isSelected ? "var(--primary)" : "transparent",
        }}
        onClick={(e) => { e.stopPropagation(); toggleDocumentSelection(doc.id); }}
      >
        {isSelected && <Check size={12} style={{ color: "var(--primary-foreground)" }} />}
      </button>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent)", color: "var(--primary)" }}>
        <FileText size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</p>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{formatBytes(doc.size)}</span>
          <span>·</span>
          <span>{doc.pages} pages</span>
          <span>·</span>
          <span>{doc.chunkCount} chunks</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ color: status.color, backgroundColor: status.color + "18" }}
        >
          {status.icon}
          {status.label}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 rounded p-1 transition-opacity hover:bg-red-500/20"
          onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }}
        >
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

function CollectionCard({ collection }: { collection: { id: string; name: string; description: string; documentIds: string[]; color: string } }) {
  const [expanded, setExpanded] = useState(false);
  const { documents, setSelectedDocumentIds } = useRAGStore();
  const docs = documents.filter((d) => collection.documentIds.includes(d.id));

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
      <button
        className="flex w-full items-center gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: collection.color }} />
        <span className="flex-1 text-left text-sm font-medium" style={{ color: "var(--foreground)" }}>{collection.name}</span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{docs.length} docs</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 pl-5">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-xs py-1" style={{ color: "var(--muted-foreground)" }}>
              <File size={12} />
              <span className="truncate">{d.name}</span>
            </div>
          ))}
          <button
            className="mt-1 text-xs font-medium hover:underline"
            style={{ color: "var(--primary)" }}
            onClick={() => setSelectedDocumentIds(collection.documentIds)}
          >
            Select all for Q&A
          </button>
        </div>
      )}
    </div>
  );
}

function UploadZone() {
  const { addDocument } = useRAGStore();
  const [dragging, setDragging] = useState(false);

  const handleUpload = () => {
    const newDoc: RAGDocument = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: "New Document.pdf",
      type: "pdf",
      size: Math.floor(Math.random() * 5_000_000),
      pages: Math.floor(Math.random() * 50) + 1,
      uploadedAt: new Date().toISOString(),
      indexedAt: null,
      status: "processing",
      tags: [],
      summary: "",
      chunkCount: 0,
      collectionId: null,
    };
    addDocument(newDoc);
    setTimeout(() => {
      useRAGStore.getState().updateDocumentStatus(newDoc.id, "indexed");
    }, 3000);
  };

  return (
    <div className="p-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
          dragging ? "border-solid" : ""
        )}
        style={{
          borderColor: dragging ? "var(--primary)" : "var(--border)",
          backgroundColor: dragging ? "var(--primary)" + "10" : "transparent",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleUpload(); }}
        onClick={handleUpload}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--accent)" }}>
          <Upload size={24} style={{ color: "var(--primary)" }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Drop documents here or click to upload
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            PDF, DOCX, TXT, MD, CSV, XLSX supported
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Indexing Configuration</p>
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <div>
            <span className="block mb-1">Chunk Strategy</span>
            <select
              className="w-full rounded border px-2 py-1 text-xs"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              defaultValue="paragraph"
            >
              <option value="paragraph">Paragraph</option>
              <option value="sentence">Sentence</option>
              <option value="fixed">Fixed Size</option>
              <option value="semantic">Semantic</option>
            </select>
          </div>
          <div>
            <span className="block mb-1">Chunk Size</span>
            <input
              type="number"
              defaultValue={512}
              className="w-full rounded border px-2 py-1 text-xs"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <span className="block mb-1">Overlap</span>
            <input
              type="number"
              defaultValue={64}
              className="w-full rounded border px-2 py-1 text-xs"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <span className="block mb-1">Embedding Model</span>
            <select
              className="w-full rounded border px-2 py-1 text-xs"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              defaultValue="text-embedding-3-small"
            >
              <option value="text-embedding-3-small">text-embedding-3-small</option>
              <option value="text-embedding-3-large">text-embedding-3-large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentPanel() {
  const { documents, collections, documentSearchQuery, setDocumentSearchQuery, activeTab, setActiveTab, selectedDocumentIds } = useRAGStore();

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
    d.tags.some((t) => t.toLowerCase().includes(documentSearchQuery.toLowerCase()))
  );

  const tabs = [
    { key: "library" as const, label: "Library", count: documents.length },
    { key: "collections" as const, label: "Collections", count: collections.length },
    { key: "upload" as const, label: "Upload", count: null },
  ];

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Documents
          </h2>
          {selectedDocumentIds.length > 0 && (
            <span className="text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
              {selectedDocumentIds.length} selected
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg p-0.5" style={{ backgroundColor: "var(--accent)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={cn("flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors")}
              style={{
                backgroundColor: activeTab === tab.key ? "var(--background)" : "transparent",
                color: activeTab === tab.key ? "var(--foreground)" : "var(--muted-foreground)",
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1 opacity-60">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab !== "upload" && (
          <div className="relative mt-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search documents..."
              value={documentSearchQuery}
              onChange={(e) => setDocumentSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
              style={{ backgroundColor: "var(--accent)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            {documentSearchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setDocumentSearchQuery("")}
              >
                <X size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "upload" && <UploadZone />}

        {activeTab === "library" && (
          <div className="space-y-1">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen size={40} className="mb-3 opacity-30" />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No documents found</p>
              </div>
            ) : (
              filteredDocs.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div className="space-y-2">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-xs font-medium transition-colors hover:border-solid"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <Plus size={14} />
              New Collection
            </button>
          </div>
        )}
      </div>

      {/* Tags summary */}
      {activeTab === "library" && (
        <div className="border-t px-4 py-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(documents.flatMap((d) => d.tags))).slice(0, 8).map((tag) => (
              <button
                key={tag}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--accent)", color: "var(--muted-foreground)" }}
                onClick={() => setDocumentSearchQuery(tag)}
              >
                <Tag size={10} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
