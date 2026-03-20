"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  FileText,
  Table2,
  Presentation,
  FileDown,
  Filter,
  X,
  Clock,
  StickyNote,
  CheckSquare,
  Mail,
  BookOpen,
  ExternalLink,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { FileType } from "@/types";

// ─── Types ───────────────────────────────────────────────────
type ModuleFilter = "all" | "document" | "note" | "task" | "email" | "research";
type DateFilter = "any" | "today" | "week" | "month" | "year";

interface SearchResult {
  id: string;
  module: ModuleFilter;
  title: string;
  preview: string;
  meta: string;
  date: string;
  tags?: string[];
  href?: string;
}

// ─── Mock data for non-document modules ──────────────────────
const mockNotes: SearchResult[] = [
  {
    id: "n1",
    module: "note",
    title: "Meeting Notes - Product Standup",
    preview: "Discussed Q1 roadmap priorities. Key items: Launch AI assistant beta, improve export pipeline, fix spreadsheet formula bugs.",
    meta: "Admin User · pinned",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tags: ["meetings", "product"],
    href: "/notes",
  },
  {
    id: "n2",
    module: "note",
    title: "Research: AI Integration Patterns",
    preview: "Key findings from literature review on RAG architectures. Vector databases comparison: Pinecone vs Weaviate vs Chroma.",
    meta: "Admin User",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tags: ["research", "ai"],
    href: "/notes",
  },
  {
    id: "n3",
    module: "note",
    title: "Client Call - Acme Corp",
    preview: "Requirements gathered: Need multi-user collaboration, SSO integration with Okta, custom branding support.",
    meta: "Admin User",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    tags: ["client", "sales"],
    href: "/notes",
  },
];

const mockTasks: SearchResult[] = [
  {
    id: "t1",
    module: "task",
    title: "Implement AI summarization API",
    preview: "Build the /api/ai/summarize endpoint with support for multiple providers. Include rate limiting and error handling.",
    meta: "Dev Kumar · high priority · in_progress",
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    tags: ["api", "ai"],
    href: "/tasks",
  },
  {
    id: "t2",
    module: "task",
    title: "Fix spreadsheet formula parser",
    preview: "SUM and AVERAGE formulas break when referencing cells across sheets. Urgent fix needed.",
    meta: "Rahul Verma · urgent priority · todo",
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    tags: ["bug", "spreadsheet"],
    href: "/tasks",
  },
  {
    id: "t3",
    module: "task",
    title: "Write API documentation",
    preview: "Document all public API endpoints with request/response examples using OpenAPI 3.0 spec.",
    meta: "Anita Patel · medium priority · todo",
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    tags: ["docs", "api"],
    href: "/tasks",
  },
];

const mockEmails: SearchResult[] = [
  {
    id: "e1",
    module: "email",
    title: "Project Update - Q1 Roadmap",
    preview: "Hi team, wanted to share the latest updates on our Q1 roadmap. We're on track with most deliverables and the AI assistant beta is going well.",
    meta: "Priya Sharma → Engineering Team",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    href: "/email",
  },
  {
    id: "e2",
    module: "email",
    title: "Meeting Invitation: Design Review",
    preview: "You've been invited to Design Review on Wednesday at 2:00 PM. Agenda: Review new onboarding flow mockups and gather feedback.",
    meta: "Anita Patel → Product Team",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    href: "/email",
  },
  {
    id: "e3",
    module: "email",
    title: "Client Proposal: Enterprise Plan",
    preview: "Please find attached the enterprise plan proposal for Acme Corp. This includes custom branding, SSO, and dedicated support.",
    meta: "Admin User → contact@acmecorp.com",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    href: "/email",
  },
];

const mockResearch: SearchResult[] = [
  {
    id: "r1",
    module: "research",
    title: "Attention Is All You Need",
    preview: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer architecture based solely on attention mechanisms.",
    meta: "Vaswani et al. · arXiv · 87,432 citations",
    date: "2017-06-12T00:00:00Z",
    tags: ["transformers", "nlp"],
    href: "/research",
  },
  {
    id: "r2",
    module: "research",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    preview: "Large pre-trained language models store factual knowledge in their parameters. We explore RAG models combining parametric and non-parametric memory.",
    meta: "Lewis et al. · NeurIPS 2020 · 12,847 citations",
    date: "2020-05-22T00:00:00Z",
    tags: ["rag", "retrieval"],
    href: "/research",
  },
];

// ─── Helpers ──────────────────────────────────────────────────
const RECENT_SEARCHES_KEY = "vidyalaya_recent_searches";
const MAX_RECENT = 8;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const existing = loadRecentSearches().filter((q) => q !== query);
    const updated = [query, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", borderRadius: "2px", padding: "0 1px" }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function getSnippet(content: string, q: string): string {
  if (!content) return "";
  const idx = content.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return content.substring(0, 120) + (content.length > 120 ? "..." : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + q.length + 80);
  return (start > 0 ? "..." : "") + content.substring(start, end) + (end < content.length ? "..." : "");
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Module config ────────────────────────────────────────────
const moduleConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  document: { icon: FileText, color: "#3b82f6", label: "Documents" },
  spreadsheet: { icon: Table2, color: "#16a34a", label: "Spreadsheets" },
  presentation: { icon: Presentation, color: "#f59e0b", label: "Presentations" },
  pdf: { icon: FileDown, color: "#dc2626", label: "PDFs" },
  note: { icon: StickyNote, color: "#8b5cf6", label: "Notes" },
  task: { icon: CheckSquare, color: "#16a34a", label: "Tasks" },
  email: { icon: Mail, color: "#3b82f6", label: "Emails" },
  research: { icon: BookOpen, color: "#f59e0b", label: "Research" },
};

// ─── Result Item ──────────────────────────────────────────────
function ResultItem({
  result,
  query,
  onDelete,
}: {
  result: SearchResult;
  query: string;
  onDelete?: (id: string) => void;
}) {
  const cfg = moduleConfig[result.module] || moduleConfig.document;
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all hover:opacity-90"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${cfg.color}15` }}
      >
        <Icon size={20} style={{ color: cfg.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
            {highlightText(result.title, query)}
          </p>
          <span
            className="text-xs px-1.5 py-0.5 rounded capitalize"
            style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
        {result.preview && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {highlightText(getSnippet(result.preview, query), query)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
          {result.meta && <span>{result.meta}</span>}
          <span>{formatDate(result.date)}</span>
          {result.tags && result.tags.length > 0 && (
            <div className="flex gap-1">
              {result.tags.map((t) => (
                <span key={t} className="rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--accent)" }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Quick actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          className="rounded p-1.5 hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted-foreground)" }}
          title="Open"
        >
          <ExternalLink size={13} />
        </button>
        <button
          className="rounded p-1.5 hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted-foreground)" }}
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(result.id); }}
            className="rounded p-1.5 hover:opacity-70 transition-opacity"
            style={{ color: "#dc2626" }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Results Group ────────────────────────────────────────────
function ResultGroup({
  module,
  results,
  query,
}: {
  module: string;
  results: SearchResult[];
  query: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const cfg = moduleConfig[module];
  if (!cfg || results.length === 0) return null;
  const Icon = cfg.icon;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide hover:opacity-70"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Icon size={12} style={{ color: cfg.color }} />
        {cfg.label}
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px]"
          style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
        >
          {results.length}
        </span>
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {expanded && (
        <div className="space-y-2 pl-2">
          {results.map((r) => (
            <ResultItem key={r.id} result={r} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function SearchPage() {
  const { recentFiles } = useAppStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim().length > 1) {
        saveRecentSearch(query.trim());
        setRecentSearches(loadRecentSearches());
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const matchesDate = useCallback(
    (dateStr: string) => {
      if (dateFilter === "any") return true;
      const modified = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - modified.getTime();
      const day = 86400000;
      if (dateFilter === "today" && diff > day) return false;
      if (dateFilter === "week" && diff > 7 * day) return false;
      if (dateFilter === "month" && diff > 30 * day) return false;
      if (dateFilter === "year" && diff > 365 * day) return false;
      return true;
    },
    [dateFilter]
  );

  const { grouped, total } = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return { grouped: {} as Record<string, SearchResult[]>, total: 0 };

    const grouped: Record<string, SearchResult[]> = {};
    let total = 0;

    // Documents from store
    if (moduleFilter === "all" || ["document", "spreadsheet", "presentation", "pdf"].includes(moduleFilter)) {
      const docResults = recentFiles
        .filter((file) => {
          const matchText =
            file.name.toLowerCase().includes(q) ||
            file.content.toLowerCase().includes(q) ||
            file.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchText) return false;
          if (moduleFilter !== "all" && file.type !== moduleFilter) return false;
          if (!matchesDate(file.modified)) return false;
          return true;
        })
        .map((file) => ({
          id: file.id,
          module: file.type as ModuleFilter,
          title: file.name,
          preview: getSnippet(file.content, debouncedQuery),
          meta: `${file.owner} · v${file.version} · ${formatFileSize(file.size)}`,
          date: file.modified,
          tags: file.tags,
        }));

      for (const r of docResults) {
        if (!grouped[r.module]) grouped[r.module] = [];
        grouped[r.module].push(r);
        total++;
      }
    }

    // Notes
    if (moduleFilter === "all" || moduleFilter === "note") {
      const noteResults = mockNotes.filter(
        (n) =>
          (n.title.toLowerCase().includes(q) || n.preview.toLowerCase().includes(q)) &&
          matchesDate(n.date)
      );
      if (noteResults.length) { grouped["note"] = noteResults; total += noteResults.length; }
    }

    // Tasks
    if (moduleFilter === "all" || moduleFilter === "task") {
      const taskResults = mockTasks.filter(
        (t) =>
          (t.title.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q)) &&
          matchesDate(t.date)
      );
      if (taskResults.length) { grouped["task"] = taskResults; total += taskResults.length; }
    }

    // Emails
    if (moduleFilter === "all" || moduleFilter === "email") {
      const emailResults = mockEmails.filter(
        (e) =>
          (e.title.toLowerCase().includes(q) || e.preview.toLowerCase().includes(q)) &&
          matchesDate(e.date)
      );
      if (emailResults.length) { grouped["email"] = emailResults; total += emailResults.length; }
    }

    // Research
    if (moduleFilter === "all" || moduleFilter === "research") {
      const researchResults = mockResearch.filter(
        (r) =>
          (r.title.toLowerCase().includes(q) || r.preview.toLowerCase().includes(q)) &&
          matchesDate(r.date)
      );
      if (researchResults.length) { grouped["research"] = researchResults; total += researchResults.length; }
    }

    return { grouped, total };
  }, [debouncedQuery, recentFiles, moduleFilter, matchesDate]);

  const activeFilters = (moduleFilter !== "all" ? 1 : 0) + (dateFilter !== "any" ? 1 : 0);
  const moduleOrder = ["document", "spreadsheet", "presentation", "pdf", "note", "task", "email", "research"];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Search</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Find content across Documents, Notes, Tasks, Emails, and Research
        </p>
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
            onChange={(e) => { setQuery(e.target.value); setShowRecent(false); }}
            onFocus={() => setShowRecent(!query && recentSearches.length > 0)}
            placeholder="Search across all modules..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); setShowRecent(false); }}
              className="hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
            >
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
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Recent searches */}
      {showRecent && !query && recentSearches.length > 0 && (
        <div
          className="rounded-xl border p-3"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Recent Searches
            </p>
            <button
              onClick={() => { clearRecentSearches(); setRecentSearches([]); setShowRecent(false); }}
              className="text-xs hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); setShowRecent(false); }}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--card-foreground)" }}
              >
                <Clock size={10} style={{ color: "var(--muted-foreground)" }} />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div
          className="grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-3"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Module */}
          <div>
            <label
              className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Search size={12} /> Module
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as ModuleFilter)}
              className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="all">All modules</option>
              <option value="document">Documents</option>
              <option value="note">Notes</option>
              <option value="task">Tasks</option>
              <option value="email">Emails</option>
              <option value="research">Research</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Clock size={12} /> Date range
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

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => { setModuleFilter("all"); setDateFilter("any"); }}
              className="w-full rounded-lg border px-3 py-1.5 text-sm hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {debouncedQuery.trim() ? (
        <div className="space-y-6">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {total} result{total !== 1 ? "s" : ""} for &quot;{debouncedQuery}&quot;
          </p>

          {total === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <Search size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>No results found</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Try different keywords or change your filters
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {moduleOrder
                .filter((m) => grouped[m]?.length > 0)
                .map((m) => (
                  <ResultGroup key={m} module={m} results={grouped[m]} query={debouncedQuery} />
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Search size={48} className="mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
            Search across all your content
          </p>
          <p className="text-xs mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>
            Documents, Notes, Tasks, Emails, and Research — all in one place
          </p>
          {/* Module chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(moduleConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => { setModuleFilter(key as ModuleFilter); }}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: cfg.color }}
                >
                  <Icon size={12} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
