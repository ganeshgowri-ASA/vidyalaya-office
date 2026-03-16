"use client";

import { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Table2,
  Presentation,
  FileDown,
  Filter,
  X,
  Calendar,
  User,
  HardDrive,
  Star,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { FileType } from "@/types";

const typeIcons: Record<FileType, React.ElementType> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
};

const typeColors: Record<FileType, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
  pdf: "#dc2626",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type SizeFilter = "any" | "small" | "medium" | "large";
type DateFilter = "any" | "today" | "week" | "month" | "year";

export default function SearchPage() {
  const { recentFiles, toggleStar } = useAppStore();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FileType | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("any");
  const [ownerFilter, setOwnerFilter] = useState("");

  const owners = useMemo(() => Array.from(new Set(recentFiles.map((f) => f.owner))), [recentFiles]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return recentFiles.filter((file) => {
      // Text match
      const matchesText =
        file.name.toLowerCase().includes(q) ||
        file.content.toLowerCase().includes(q) ||
        file.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesText) return false;

      // Type filter
      if (typeFilter !== "all" && file.type !== typeFilter) return false;

      // Owner filter
      if (ownerFilter && file.owner !== ownerFilter) return false;

      // Date filter
      if (dateFilter !== "any") {
        const modified = new Date(file.modified);
        const now = new Date();
        const diff = now.getTime() - modified.getTime();
        const day = 86400000;
        if (dateFilter === "today" && diff > day) return false;
        if (dateFilter === "week" && diff > 7 * day) return false;
        if (dateFilter === "month" && diff > 30 * day) return false;
        if (dateFilter === "year" && diff > 365 * day) return false;
      }

      // Size filter
      if (sizeFilter !== "any" && file.size) {
        if (sizeFilter === "small" && file.size > 500000) return false;
        if (sizeFilter === "medium" && (file.size < 500000 || file.size > 5000000)) return false;
        if (sizeFilter === "large" && file.size < 5000000) return false;
      }

      return true;
    });
  }, [query, recentFiles, typeFilter, dateFilter, sizeFilter, ownerFilter]);

  const getSnippet = (content: string, q: string): string => {
    if (!content) return "";
    const idx = content.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return content.substring(0, 120) + (content.length > 120 ? "..." : "");
    const start = Math.max(0, idx - 40);
    const end = Math.min(content.length, idx + q.length + 80);
    return (start > 0 ? "..." : "") + content.substring(start, end) + (end < content.length ? "..." : "");
  };

  const activeFilters = (typeFilter !== "all" ? 1 : 0) + (dateFilter !== "any" ? 1 : 0) + (sizeFilter !== "any" ? 1 : 0) + (ownerFilter ? 1 : 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Search</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Find documents across all your files</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div
          className="flex flex-1 items-center gap-3 rounded-xl border px-4 py-3"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Search size={18} style={{ color: "var(--muted-foreground)" }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, content, or tags..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: showFilters ? "var(--accent)" : "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <Filter size={16} />
          Filters
          {activeFilters > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          {/* Type */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
              <FileText size={12} /> Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FileType | "all")}
              className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="all">All types</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="presentation">Presentations</option>
              <option value="pdf">PDFs</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
              <Calendar size={12} /> Modified
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="any">Any time</option>
              <option value="today">Today</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="year">Past year</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
              <HardDrive size={12} /> Size
            </label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value as SizeFilter)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="any">Any size</option>
              <option value="small">&lt; 500 KB</option>
              <option value="medium">500 KB – 5 MB</option>
              <option value="large">&gt; 5 MB</option>
            </select>
          </div>

          {/* Owner */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>
              <User size={12} /> Owner
            </label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="">Anyone</option>
              {owners.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {query.trim() && (
        <div>
          <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
            {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>

          {results.length === 0 ? (
            <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <Search size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>No results found</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Try different keywords or adjust your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((file) => {
                const Icon = typeIcons[file.type];
                const snippet = getSnippet(file.content, query);
                return (
                  <div
                    key={file.id}
                    className="rounded-xl border p-4 cursor-pointer hover:opacity-90 transition-all"
                    style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${typeColors[file.type]}15` }}>
                        <Icon size={20} style={{ color: typeColors[file.type] }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${typeColors[file.type]}15`, color: typeColors[file.type] }}>
                            {file.type}
                          </span>
                        </div>
                        {snippet && (
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                            {snippet}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          <span>{formatDate(file.modified)}</span>
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.owner}</span>
                          {file.tags.length > 0 && (
                            <div className="flex gap-1">
                              {file.tags.map((t) => (
                                <span key={t} className="rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--accent)" }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => toggleStar(file.id)} className="shrink-0 p-1">
                        <Star size={14} fill={file.starred ? "var(--primary)" : "none"} style={{ color: "var(--primary)" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no query */}
      {!query.trim() && (
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Search size={48} className="mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>Search across all your documents</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Search by file name, content, or tags. Use filters to narrow results.
          </p>
        </div>
      )}
    </div>
  );
}
