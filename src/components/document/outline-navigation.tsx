"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronDown, Search, ListTree, Eye, EyeOff } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

interface HeadingEntry {
  text: string;
  level: number;
  id: string;
  children: HeadingEntry[];
  collapsed: boolean;
}

function buildTree(flat: { text: string; level: number; id: string }[]): HeadingEntry[] {
  const root: HeadingEntry[] = [];
  const stack: HeadingEntry[] = [];

  for (const item of flat) {
    const entry: HeadingEntry = { ...item, children: [], collapsed: false };

    while (stack.length > 0 && stack[stack.length - 1].level >= entry.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(entry);
    } else {
      stack[stack.length - 1].children.push(entry);
    }
    stack.push(entry);
  }

  return root;
}

function HeadingNode({ entry, depth, activeId, onNavigate, collapsedIds, toggleCollapse }: {
  entry: HeadingEntry;
  depth: number;
  activeId: string | null;
  onNavigate: (id: string) => void;
  collapsedIds: Set<string>;
  toggleCollapse: (id: string) => void;
}) {
  const isCollapsed = collapsedIds.has(entry.id);
  const hasChildren = entry.children.length > 0;
  const isActive = activeId === entry.id;

  return (
    <div>
      <div
        className={`flex items-center gap-0.5 px-1 py-1 rounded cursor-pointer group ${isActive ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"}`}
        style={{ paddingLeft: depth * 12 + 4 + "px" }}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); toggleCollapse(entry.id); }}
            className="p-0.5 rounded hover:bg-[var(--muted)]">
            {isCollapsed
              ? <ChevronRight size={10} style={{ color: "var(--muted-foreground)" }} />
              : <ChevronDown size={10} style={{ color: "var(--muted-foreground)" }} />
            }
          </button>
        ) : (
          <span className="w-4" />
        )}
        <button
          className="flex-1 text-left text-[11px] truncate"
          style={{
            color: isActive ? "var(--primary)" : "var(--foreground)",
            fontWeight: entry.level <= 2 ? 600 : 400,
          }}
          onClick={() => onNavigate(entry.id)}
          title={entry.text}
        >
          {entry.text || "(empty heading)"}
        </button>
        <span className="text-[8px] opacity-0 group-hover:opacity-100 flex-shrink-0"
          style={{ color: "var(--muted-foreground)" }}>
          H{entry.level}
        </span>
      </div>
      {!isCollapsed && hasChildren && entry.children.map((child) => (
        <HeadingNode
          key={child.id}
          entry={child}
          depth={depth + 1}
          activeId={activeId}
          onNavigate={onNavigate}
          collapsedIds={collapsedIds}
          toggleCollapse={toggleCollapse}
        />
      ))}
    </div>
  );
}

export function OutlineNavigationPanel() {
  const { showOutlinePanel, setShowOutlinePanel } = useDocumentStore();
  const [headings, setHeadings] = useState<{ text: string; level: number; id: string }[]>([]);
  const [tree, setTree] = useState<HeadingEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);

  const scanHeadings = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const hs = editor.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const result: { text: string; level: number; id: string }[] = [];
    hs.forEach((h, i) => {
      const id = `outline-heading-${i}`;
      h.id = id;
      result.push({
        text: h.textContent || "",
        level: parseInt(h.tagName[1]),
        id,
      });
    });
    setHeadings(result);
    setTree(buildTree(result));
  }, []);

  useEffect(() => {
    if (!showOutlinePanel) return;
    scanHeadings();
    const interval = setInterval(scanHeadings, 2000);
    return () => clearInterval(interval);
  }, [showOutlinePanel, scanHeadings]);

  const navigateTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => {
    const allIds = new Set<string>();
    const collectIds = (entries: HeadingEntry[]) => {
      entries.forEach((e) => { if (e.children.length > 0) { allIds.add(e.id); collectIds(e.children); } });
    };
    collectIds(tree);
    setCollapsedIds(allIds);
  };

  const filteredTree = searchQuery
    ? buildTree(headings.filter((h) => h.text.toLowerCase().includes(searchQuery.toLowerCase())))
    : tree;

  if (!showOutlinePanel) return null;

  return (
    <div
      className="w-60 border-r overflow-y-auto flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--foreground)" }}>
          <ListTree size={13} /> Outline
        </span>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setShowSearch(!showSearch)} className="p-1 rounded hover:bg-[var(--muted)]" title="Search">
            <Search size={11} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={expandAll} className="p-1 rounded hover:bg-[var(--muted)]" title="Expand All">
            <Eye size={11} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={collapseAll} className="p-1 rounded hover:bg-[var(--muted)]" title="Collapse All">
            <EyeOff size={11} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={() => setShowOutlinePanel(false)} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={12} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter headings..."
            className="w-full rounded border px-2 py-1 text-[10px]"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-1">
        {filteredTree.length === 0 ? (
          <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            {searchQuery ? "No matching headings" : "No headings found. Add headings (H1-H6) to see the document outline."}
          </p>
        ) : (
          filteredTree.map((entry) => (
            <HeadingNode
              key={entry.id}
              entry={entry}
              depth={0}
              activeId={activeId}
              onNavigate={navigateTo}
              collapsedIds={collapsedIds}
              toggleCollapse={toggleCollapse}
            />
          ))
        )}
      </div>

      <div className="px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        {headings.length} heading{headings.length !== 1 ? "s" : ""} in document
      </div>
    </div>
  );
}
