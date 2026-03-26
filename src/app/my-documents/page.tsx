"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Table2,
  Presentation,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  CloudOff,
  Plus,
  Search,
} from "lucide-react";
import { useDocumentsStore } from "@/store/documents-store";
import type { CloudDocument, DocumentType } from "@/lib/documents";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<DocumentType, typeof FileText> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
};

const TYPE_COLORS: Record<DocumentType, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
};

const TYPE_ROUTES: Record<DocumentType, string> = {
  document: "/document",
  spreadsheet: "/spreadsheet",
  presentation: "/presentation",
};

export default function MyDocumentsPage() {
  const {
    documents,
    loading,
    fetchDocuments,
    removeDocument,
    setActiveDocId,
  } = useDocumentsStore();

  const router = useRouter();
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filtered = documents.filter((doc) => {
    if (filterType !== "all" && doc.type !== filterType) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpen = (doc: CloudDocument) => {
    // Store the document content so the editor can load it
    if (doc.type === "document") {
      localStorage.setItem("vidyalaya-doc-content", doc.content);
    } else if (doc.type === "spreadsheet") {
      sessionStorage.setItem("import-spreadsheet-data", JSON.stringify({
        sheets: [{ maxRow: 100, maxCol: 26, cells: parseSpreadsheetContent(doc.content) }],
      }));
    } else if (doc.type === "presentation") {
      try {
        const slides = JSON.parse(doc.content);
        if (Array.isArray(slides)) {
          localStorage.setItem("vidyalaya-ppt-template", doc.content);
        }
      } catch {
        // Not valid JSON, skip
      }
    }
    setActiveDocId(doc.type, doc.id);
    router.push(TYPE_ROUTES[doc.type]);
  };

  const handleDelete = async (doc: CloudDocument) => {
    setDeletingId(doc.id);
    await removeDocument(doc.id);
    setDeletingId(null);
  };

  const handleCreate = (type: DocumentType) => {
    setActiveDocId(type, null);
    router.push(TYPE_ROUTES[type]);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-6 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <FileText size={22} style={{ color: "var(--primary)" }} />
        <div>
          <h1 className="text-lg font-bold">My Documents</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Documents saved to Supabase cloud storage
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => fetchDocuments()}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className="flex items-center gap-3 border-b px-6 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Type filter tabs */}
        <div className="flex items-center gap-1">
          {(["all", "document", "spreadsheet", "presentation"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md capitalize transition-colors",
                filterType === t ? "font-medium" : ""
              )}
              style={{
                backgroundColor: filterType === t ? "var(--sidebar-accent)" : "transparent",
                color: filterType === t ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {t === "all" ? "All" : t + "s"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-md border bg-transparent outline-none w-60"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      {/* Create New Buttons */}
      <div className="flex items-center gap-2 px-6 py-3">
        <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
          Create New:
        </span>
        {(["document", "spreadsheet", "presentation"] as const).map((type) => {
          const Icon = TYPE_ICONS[type];
          const color = TYPE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => handleCreate(type)}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Plus size={12} style={{ color }} />
              <Icon size={12} style={{ color }} />
              <span className="capitalize">{type}</span>
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
            <span className="ml-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Loading documents...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <CloudOff size={40} style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {documents.length === 0
                ? "No documents saved yet. Use the Save to Cloud button in any editor."
                : "No documents match your filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => {
              const Icon = TYPE_ICONS[doc.type];
              const color = TYPE_COLORS[doc.type];
              const isDeleting = deletingId === doc.id;
              return (
                <div
                  key={doc.id}
                  className="rounded-xl border p-4 transition-colors hover:bg-[var(--muted)]/30 cursor-pointer group"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  onClick={() => handleOpen(doc)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{doc.title}</h3>
                      <p className="text-[11px] capitalize mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {doc.type}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Updated {new Date(doc.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen(doc);
                        }}
                        className="p-1.5 rounded-md hover:bg-[var(--muted)]"
                        title="Open"
                        style={{ color: "var(--foreground)" }}
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc);
                        }}
                        className="p-1.5 rounded-md hover:bg-[var(--muted)]"
                        title="Delete"
                        style={{ color: "#dc2626" }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Content preview */}
                  <div
                    className="mt-3 text-[11px] line-clamp-2 overflow-hidden"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {getContentPreview(doc)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getContentPreview(doc: CloudDocument): string {
  if (!doc.content) return "Empty document";
  if (doc.type === "document") {
    // Strip HTML tags for preview
    const text = doc.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 150) || "Empty document";
  }
  if (doc.type === "spreadsheet") {
    const lines = doc.content.split("\n").filter(Boolean);
    return lines.length > 0 ? `${lines.length} rows of data` : "Empty spreadsheet";
  }
  if (doc.type === "presentation") {
    try {
      const slides = JSON.parse(doc.content);
      if (Array.isArray(slides)) return `${slides.length} slide${slides.length !== 1 ? "s" : ""}`;
    } catch {
      // Not JSON
    }
    return "Presentation data";
  }
  return doc.content.slice(0, 150);
}

function parseSpreadsheetContent(content: string): Record<string, { value: string }> {
  const cells: Record<string, { value: string }> = {};
  const lines = content.split("\n");
  lines.forEach((line, rowIdx) => {
    const cols = line.split("\t");
    cols.forEach((val, colIdx) => {
      if (val) {
        const colLetter = String.fromCharCode(65 + (colIdx % 26));
        const ref = `${colLetter}${rowIdx + 1}`;
        cells[ref] = { value: val };
      }
    });
  });
  return cells;
}
