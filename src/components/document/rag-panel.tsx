"use client";

import React, { useState, useCallback } from "react";
import {
  X, Search, Upload, Database, FileText, ExternalLink,
  ChevronDown, ChevronRight, Loader2, Plus, Trash2,
  BookOpen, Sparkles, RefreshCw, Copy, Check,
} from "lucide-react";

interface KnowledgeDocument {
  id: string;
  name: string;
  type: "pdf" | "doc" | "txt" | "url";
  addedAt: string;
  chunks: number;
  status: "indexed" | "processing" | "error";
}

interface SearchResult {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata: Record<string, string>;
}

const MOCK_DOCUMENTS: KnowledgeDocument[] = [
  { id: "1", name: "IEC 61400-12-1 Power Performance", type: "pdf", addedAt: "2026-03-15", chunks: 245, status: "indexed" },
  { id: "2", name: "FMEA Handbook 4th Edition", type: "pdf", addedAt: "2026-03-10", chunks: 189, status: "indexed" },
  { id: "3", name: "Energy Yield Assessment Guidelines", type: "pdf", addedAt: "2026-03-08", chunks: 156, status: "indexed" },
  { id: "4", name: "ISO 9001:2015 Quality Management", type: "pdf", addedAt: "2026-02-28", chunks: 312, status: "indexed" },
  { id: "5", name: "Wind Turbine Design Standards", type: "doc", addedAt: "2026-02-20", chunks: 98, status: "indexed" },
];

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "r1",
    content: "The power performance test shall be conducted according to IEC 61400-12-1, measuring the power curve using the method of bins with a minimum of 180 hours of valid data across the wind speed range...",
    source: "IEC 61400-12-1 Power Performance",
    score: 0.94,
    metadata: { section: "Section 7.2", page: "42" },
  },
  {
    id: "r2",
    content: "Risk Priority Number (RPN) is calculated as Severity × Occurrence × Detection. An RPN above 100 requires immediate corrective action and documented mitigation strategy...",
    source: "FMEA Handbook 4th Edition",
    score: 0.87,
    metadata: { section: "Chapter 4", page: "78" },
  },
  {
    id: "r3",
    content: "Annual Energy Production (AEP) shall be calculated using the measured power curve and the site-specific wind resource data, applying wake losses, availability adjustments, and electrical losses...",
    source: "Energy Yield Assessment Guidelines",
    score: 0.82,
    metadata: { section: "Section 5.1", page: "33" },
  },
];

export function RAGPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"search" | "documents" | "settings">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_DOCUMENTS);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pineconeApiKey, setPineconeApiKey] = useState("");
  const [pineconeIndex, setPineconeIndex] = useState("vidyalaya-docs");
  const [pineconeEnv, setPineconeEnv] = useState("us-east-1");

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    // Simulate API call to Pinecone
    await new Promise((r) => setTimeout(r, 1200));
    setResults(MOCK_RESULTS.filter((r) =>
      r.content.toLowerCase().includes(query.toLowerCase()) ||
      r.source.toLowerCase().includes(query.toLowerCase()) ||
      query.length > 3
    ));
    setSearching(false);
  }, [query]);

  const handleUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.txt";
    input.multiple = true;
    input.onchange = () => {
      if (input.files) {
        const newDocs: KnowledgeDocument[] = Array.from(input.files).map((f, i) => ({
          id: `new-${Date.now()}-${i}`,
          name: f.name,
          type: f.name.endsWith(".pdf") ? "pdf" : f.name.endsWith(".txt") ? "txt" : "doc",
          addedAt: new Date().toISOString().split("T")[0],
          chunks: 0,
          status: "processing" as const,
        }));
        setDocuments((prev) => [...newDocs, ...prev]);
        // Simulate processing
        setTimeout(() => {
          setDocuments((prev) =>
            prev.map((d) =>
              d.status === "processing" ? { ...d, status: "indexed" as const, chunks: Math.floor(Math.random() * 200) + 20 } : d
            )
          );
        }, 3000);
      }
    };
    input.click();
  }, []);

  const handleInsert = useCallback((content: string) => {
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.focus();
      document.execCommand("insertHTML", false, `<blockquote style="border-left:3px solid #6366f1;padding-left:12px;margin:8px 0;font-style:italic;color:#888;">${content}</blockquote>`);
    }
  }, []);

  const handleCopy = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="no-print flex w-[320px] flex-shrink-0 flex-col border-l"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Database size={14} style={{ color: "var(--primary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            Knowledge Base (RAG)
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
          <X size={14} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {(["search", "documents", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 text-[10px] py-1.5 capitalize border-b-2 transition-colors"
            style={{
              borderColor: activeTab === tab ? "var(--primary)" : "transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex gap-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Search knowledge base..."
                className="flex-1 rounded border px-2 py-1.5 text-xs outline-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="rounded px-2 py-1.5 transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {searching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              </button>
            </div>
            <p className="text-[9px] mt-1" style={{ color: "var(--muted-foreground)" }}>
              Semantic search across {documents.filter((d) => d.status === "indexed").length} indexed documents ({documents.reduce((s, d) => s + d.chunks, 0)} chunks)
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {results.length === 0 && !searching && (
              <div className="text-center py-8">
                <BookOpen size={20} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  Search your knowledge base to find relevant content for your document.
                </p>
              </div>
            )}
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-md border p-2"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
                    {r.source}
                  </span>
                  <span className="text-[9px] px-1 rounded" style={{ backgroundColor: r.score > 0.9 ? "#22c55e20" : r.score > 0.8 ? "#f59e0b20" : "#64748b20", color: r.score > 0.9 ? "#22c55e" : r.score > 0.8 ? "#f59e0b" : "#64748b" }}>
                    {(r.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p
                  className="text-[10px] leading-relaxed cursor-pointer"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                >
                  {expandedResult === r.id ? r.content : r.content.slice(0, 150) + "..."}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {Object.entries(r.metadata).map(([k, v]) => (
                    <span key={k} className="text-[8px] px-1 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {k}: {v}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1 mt-1.5">
                  <button
                    onClick={() => handleInsert(r.content)}
                    className="flex-1 flex items-center justify-center gap-1 rounded border px-1.5 py-1 text-[9px] hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <Sparkles size={9} /> Insert as Quote
                  </button>
                  <button
                    onClick={() => handleCopy(r.id, r.content)}
                    className="rounded border px-1.5 py-1 hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    {copiedId === r.id ? <Check size={10} color="#22c55e" /> : <Copy size={10} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={handleUpload}
              className="w-full flex items-center justify-center gap-1.5 rounded border-2 border-dashed px-3 py-3 text-xs transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Upload size={14} />
              Upload Documents
            </button>
            <p className="text-[9px] mt-1 text-center" style={{ color: "var(--muted-foreground)" }}>
              PDF, DOC, DOCX, TXT supported
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 rounded-md border p-2"
                style={{ borderColor: "var(--border)" }}
              >
                <FileText size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate" style={{ color: "var(--foreground)" }}>{doc.name}</p>
                  <div className="flex items-center gap-2 text-[8px]" style={{ color: "var(--muted-foreground)" }}>
                    <span>{doc.chunks} chunks</span>
                    <span>{doc.addedAt}</span>
                    <span
                      className="px-1 rounded"
                      style={{
                        backgroundColor: doc.status === "indexed" ? "#22c55e20" : doc.status === "processing" ? "#f59e0b20" : "#ef444420",
                        color: doc.status === "indexed" ? "#22c55e" : doc.status === "processing" ? "#f59e0b" : "#ef4444",
                      }}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                  className="p-1 rounded hover:bg-[var(--muted)]"
                  title="Remove"
                >
                  <Trash2 size={11} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div>
            <label className="text-[10px] font-medium block mb-1" style={{ color: "var(--foreground)" }}>Pinecone API Key</label>
            <input
              type="password"
              value={pineconeApiKey}
              onChange={(e) => setPineconeApiKey(e.target.value)}
              placeholder="pc-..."
              className="w-full rounded border px-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium block mb-1" style={{ color: "var(--foreground)" }}>Index Name</label>
            <input
              value={pineconeIndex}
              onChange={(e) => setPineconeIndex(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium block mb-1" style={{ color: "var(--foreground)" }}>Environment</label>
            <input
              value={pineconeEnv}
              onChange={(e) => setPineconeEnv(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Connect your Pinecone vector database to enable semantic search across your knowledge base.
              Documents will be chunked, embedded, and indexed automatically.
            </p>
          </div>
          <button
            className="w-full rounded px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Save & Test Connection
          </button>
        </div>
      )}
    </div>
  );
}
