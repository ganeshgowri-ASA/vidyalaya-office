"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare, Highlighter, Underline, Strikethrough, StickyNote,
  Pencil, Stamp, PenTool, EyeOff, Square, X, Filter, ChevronDown,
  ChevronRight, Trash2, MapPin, Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Annotation {
  id: string;
  type: string;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  stamp?: string;
  stampType?: string;
  signatureDataUrl?: string;
  shapeType?: string;
  noteColor?: string;
  noteOpen?: boolean;
  author?: string;
  createdAt?: string;
  replies?: { id: string; author: string; text: string; createdAt: string }[];
}

interface CommentPanelProps {
  annotations: Annotation[];
  currentPage: number;
  totalPages: number;
  onNavigate: (page: number) => void;
  onRemoveAnnotation: (id: string) => void;
  onClose: () => void;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  width: 280,
  flexShrink: 0,
  borderLeft: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid var(--border)",
  backgroundColor: "var(--card)",
};

const btnSmall: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--muted-foreground)",
  padding: 4,
  borderRadius: 4,
  display: "inline-flex",
  alignItems: "center",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANNOTATION_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  text: { icon: PenTool, label: "Text", color: "#3b82f6" },
  highlight: { icon: Highlighter, label: "Highlight", color: "#eab308" },
  underline: { icon: Underline, label: "Underline", color: "#3b82f6" },
  strikethrough: { icon: Strikethrough, label: "Strikethrough", color: "#ef4444" },
  drawing: { icon: Pencil, label: "Drawing", color: "#f97316" },
  stamp: { icon: Stamp, label: "Stamp", color: "#8b5cf6" },
  signature: { icon: PenTool, label: "Signature", color: "#06b6d4" },
  redaction: { icon: EyeOff, label: "Redaction", color: "#000000" },
  "sticky-note": { icon: StickyNote, label: "Sticky Note", color: "#fbbf24" },
  shape: { icon: Square, label: "Shape", color: "#0ea5e9" },
};

function formatAnnotationLabel(ann: Annotation): string {
  if (ann.type === "stamp" && ann.stamp) return `Stamp: ${ann.stamp}`;
  if (ann.type === "sticky-note" && ann.text) return ann.text.length > 40 ? ann.text.slice(0, 40) + "..." : ann.text;
  if (ann.type === "text" && ann.text) return ann.text.length > 40 ? ann.text.slice(0, 40) + "..." : ann.text;
  if (ann.type === "shape" && ann.shapeType) return `Shape: ${ann.shapeType}`;
  const meta = ANNOTATION_META[ann.type];
  return meta ? meta.label : ann.type;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommentPanel({
  annotations,
  currentPage,
  totalPages,
  onNavigate,
  onRemoveAnnotation,
  onClose,
}: CommentPanelProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"page" | "type">("page");

  const types = useMemo(() => {
    const s = new Set(annotations.map((a) => a.type));
    return Array.from(s);
  }, [annotations]);

  const filtered = useMemo(() => {
    if (filterType === "all") return annotations;
    return annotations.filter((a) => a.type === filterType);
  }, [annotations, filterType]);

  const groupedByPage = useMemo(() => {
    const groups: Record<number, Annotation[]> = {};
    for (const a of filtered) {
      if (!groups[a.page]) groups[a.page] = [];
      groups[a.page].push(a);
    }
    return groups;
  }, [filtered]);

  const sortedPages = useMemo(() => {
    return Object.keys(groupedByPage).map(Number).sort((a, b) => a - b);
  }, [groupedByPage]);

  const togglePage = (page: number) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
            Comments ({annotations.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            style={{ ...btnSmall, backgroundColor: showFilter ? "var(--accent)" : "transparent" }}
            onClick={() => setShowFilter(!showFilter)}
            title="Filter annotations"
          >
            <Filter size={14} />
          </button>
          <button style={btnSmall} onClick={onClose} title="Close panel">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilter && (
        <div
          className="flex flex-wrap gap-1.5 p-2"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)" }}
        >
          <button
            onClick={() => setFilterType("all")}
            style={{
              ...btnSmall,
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 12,
              backgroundColor: filterType === "all" ? "var(--primary)" : "var(--card)",
              color: filterType === "all" ? "var(--primary-foreground)" : "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            All
          </button>
          {types.map((t) => {
            const meta = ANNOTATION_META[t];
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  ...btnSmall,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 12,
                  backgroundColor: filterType === t ? "var(--primary)" : "var(--card)",
                  color: filterType === t ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                  gap: 4,
                }}
              >
                {meta && <meta.icon size={10} />}
                {meta?.label ?? t}
              </button>
            );
          })}
        </div>
      )}

      {/* Sort controls */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--muted-foreground)" }}
      >
        <span>{filtered.length} annotation{filtered.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          <span>Sort:</span>
          <button
            onClick={() => setSortBy("page")}
            style={{ ...btnSmall, fontSize: 11, textDecoration: sortBy === "page" ? "underline" : "none", color: sortBy === "page" ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            Page
          </button>
          <button
            onClick={() => setSortBy("type")}
            style={{ ...btnSmall, fontSize: 11, textDecoration: sortBy === "type" ? "underline" : "none", color: sortBy === "type" ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            Type
          </button>
        </div>
      </div>

      {/* Annotation list */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8" style={{ color: "var(--muted-foreground)" }}>
            <MessageSquare size={32} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 12 }}>No annotations yet</p>
            <p style={{ fontSize: 11, opacity: 0.7 }}>Use the Edit or Annotate tab to add annotations</p>
          </div>
        ) : sortBy === "page" ? (
          sortedPages.map((page) => {
            const pageAnns = groupedByPage[page];
            const isExpanded = expandedPages.has(page) || expandedPages.size === 0;
            return (
              <div key={page}>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2"
                  style={{
                    backgroundColor: page === currentPage ? "var(--accent)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    color: "var(--foreground)",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                  onClick={() => {
                    togglePage(page);
                    onNavigate(page);
                  }}
                >
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <MapPin size={12} style={{ color: "var(--primary)" }} />
                  Page {page}
                  <span style={{ fontSize: 10, fontWeight: 400, color: "var(--muted-foreground)", marginLeft: "auto" }}>
                    {pageAnns.length}
                  </span>
                </button>
                {isExpanded &&
                  pageAnns.map((ann) => {
                    const meta = ANNOTATION_META[ann.type] ?? { icon: PenTool, label: ann.type, color: "#888" };
                    const Icon = meta.icon;
                    return (
                      <div
                        key={ann.id}
                        className="flex items-start gap-2 px-4 py-2 hover:opacity-80"
                        style={{
                          borderBottom: "1px solid var(--border)",
                          cursor: "pointer",
                          backgroundColor: "var(--card)",
                        }}
                        onClick={() => onNavigate(ann.page)}
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            backgroundColor: meta.color + "20",
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          <Icon size={12} style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
                            {formatAnnotationLabel(ann)}
                          </div>
                          <div className="flex items-center gap-2" style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>
                            <span style={{ color: meta.color }}>{meta.label}</span>
                            <span>·</span>
                            <span>({Math.round(ann.x)}, {Math.round(ann.y)})</span>
                          </div>
                        </div>
                        <button
                          style={{ ...btnSmall, padding: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAnnotation(ann.id);
                          }}
                          title="Delete annotation"
                        >
                          <Trash2 size={12} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            );
          })
        ) : (
          // Sort by type
          types
            .filter((t) => filterType === "all" || t === filterType)
            .map((t) => {
              const typeAnns = filtered.filter((a) => a.type === t);
              if (typeAnns.length === 0) return null;
              const meta = ANNOTATION_META[t] ?? { icon: PenTool, label: t, color: "#888" };
              const Icon = meta.icon;
              return (
                <div key={t}>
                  <div
                    className="flex items-center gap-2 px-3 py-2"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                    {meta.label}
                    <span style={{ fontSize: 10, fontWeight: 400, color: "var(--muted-foreground)", marginLeft: "auto" }}>
                      {typeAnns.length}
                    </span>
                  </div>
                  {typeAnns.map((ann) => (
                    <div
                      key={ann.id}
                      className="flex items-center gap-2 px-4 py-2 hover:opacity-80"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        backgroundColor: "var(--card)",
                      }}
                      onClick={() => onNavigate(ann.page)}
                    >
                      <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1 }}>
                        {formatAnnotationLabel(ann)}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>p.{ann.page}</span>
                      <button
                        style={{ ...btnSmall, padding: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAnnotation(ann.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={12} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })
        )}
      </div>

      {/* Summary footer */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--muted-foreground)" }}
      >
        <span>
          {types.length} type{types.length !== 1 ? "s" : ""} · {sortedPages.length} page{sortedPages.length !== 1 ? "s" : ""}
        </span>
        <span>
          Page {currentPage}/{totalPages}
        </span>
      </div>
    </div>
  );
}
