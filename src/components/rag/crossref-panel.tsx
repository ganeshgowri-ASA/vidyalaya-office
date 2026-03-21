"use client";

import {
  GitCompareArrows,
  FileText,
  ArrowRight,
  Layers,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRAGStore } from "@/store/rag-store";

function SimilarityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--accent)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score * 100}%`,
            backgroundColor: score > 0.8 ? "#22c55e" : score > 0.6 ? "#f59e0b" : "#ef4444",
          }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

function CrossRefCard({ xref }: {
  xref: {
    id: string;
    sourceDocId: string;
    targetDocId: string;
    sourceChunkId: string;
    targetChunkId: string;
    similarity: number;
    topic: string;
  };
}) {
  const { documents, setActiveDocumentId, setActivePanel, chunks } = useRAGStore();
  const sourceDoc = documents.find((d) => d.id === xref.sourceDocId);
  const targetDoc = documents.find((d) => d.id === xref.targetDocId);
  const sourceChunk = chunks.find((c) => c.id === xref.sourceChunkId);
  const targetChunk = chunks.find((c) => c.id === xref.targetChunkId);

  if (!sourceDoc || !targetDoc) return null;

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
      {/* Topic header */}
      <div className="flex items-center gap-2">
        <GitCompareArrows size={14} style={{ color: "var(--primary)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{xref.topic}</span>
      </div>

      <SimilarityBar score={xref.similarity} />

      {/* Source → Target */}
      <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-start">
        {/* Source */}
        <button
          className="rounded-lg border p-2.5 text-left transition-colors hover:border-opacity-100 group"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--accent)" }}
          onClick={() => { setActiveDocumentId(xref.sourceDocId); setActivePanel("viewer"); }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <FileText size={12} style={{ color: "var(--primary)" }} />
            <span className="truncate text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {sourceDoc.name.length > 25 ? sourceDoc.name.slice(0, 25) + "…" : sourceDoc.name}
            </span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 shrink-0" style={{ color: "var(--muted-foreground)" }} />
          </div>
          {sourceChunk && (
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--muted-foreground)" }}>
              {sourceChunk.content.slice(0, 120)}...
            </p>
          )}
          {sourceChunk?.metadata.heading && (
            <p className="mt-1 text-xs" style={{ color: "var(--primary)" }}>§ {sourceChunk.metadata.heading}</p>
          )}
        </button>

        {/* Arrow */}
        <div className="flex items-center justify-center pt-6">
          <ArrowRight size={16} style={{ color: "var(--muted-foreground)" }} />
        </div>

        {/* Target */}
        <button
          className="rounded-lg border p-2.5 text-left transition-colors hover:border-opacity-100 group"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--accent)" }}
          onClick={() => { setActiveDocumentId(xref.targetDocId); setActivePanel("viewer"); }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <FileText size={12} style={{ color: "var(--primary)" }} />
            <span className="truncate text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {targetDoc.name.length > 25 ? targetDoc.name.slice(0, 25) + "…" : targetDoc.name}
            </span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 shrink-0" style={{ color: "var(--muted-foreground)" }} />
          </div>
          {targetChunk && (
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--muted-foreground)" }}>
              {targetChunk.content.slice(0, 120)}...
            </p>
          )}
          {targetChunk?.metadata.heading && (
            <p className="mt-1 text-xs" style={{ color: "var(--primary)" }}>§ {targetChunk.metadata.heading}</p>
          )}
        </button>
      </div>
    </div>
  );
}

export function CrossRefPanel() {
  const { crossReferences, documents } = useRAGStore();

  // Group by topic
  const topics = Array.from(new Set(crossReferences.map((x) => x.topic)));

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Layers size={16} style={{ color: "var(--primary)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Cross-References
          </h2>
          <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--muted-foreground)" }}>
            {crossReferences.length}
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Automatically discovered connections between your indexed documents based on semantic similarity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{crossReferences.length}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>References</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{topics.length}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Topics</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {crossReferences.length > 0 ? Math.round(crossReferences.reduce((sum, x) => sum + x.similarity, 0) / crossReferences.length * 100) : 0}%
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Avg Similarity</p>
        </div>
      </div>

      {/* Cross references list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {crossReferences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GitCompareArrows size={40} className="mb-3 opacity-20" />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No cross-references found</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Upload and index more documents to discover connections
            </p>
          </div>
        ) : (
          crossReferences
            .sort((a, b) => b.similarity - a.similarity)
            .map((xref) => <CrossRefCard key={xref.id} xref={xref} />)
        )}
      </div>

      {/* Document coverage */}
      <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
          Documents with cross-references:
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(crossReferences.flatMap((x) => [x.sourceDocId, x.targetDocId]))).map((docId) => {
            const doc = documents.find((d) => d.id === docId);
            if (!doc) return null;
            return (
              <span
                key={docId}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: "var(--accent)", color: "var(--muted-foreground)" }}
              >
                {doc.name.length > 20 ? doc.name.slice(0, 20) + "…" : doc.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
