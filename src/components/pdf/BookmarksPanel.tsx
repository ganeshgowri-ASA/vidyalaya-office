"use client";

import React, { useState } from "react";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  CornerDownRight,
} from "lucide-react";
import type { Bookmark as BookmarkType } from "./types";
import { btnStyle, inputStyle, uid } from "./types";

interface BookmarksPanelProps {
  bookmarks: BookmarkType[];
  currentPage: number;
  onNavigate: (page: number) => void;
  onAddBookmark: (bookmark: BookmarkType) => void;
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, updates: Partial<BookmarkType>) => void;
  onClose: () => void;
  totalPages: number;
}

export default function BookmarksPanel({
  bookmarks,
  currentPage,
  onNavigate,
  onAddBookmark,
  onRemoveBookmark,
  onUpdateBookmark,
  onClose,
  totalPages,
}: BookmarksPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPage, setNewPage] = useState(String(currentPage));
  const [newLevel, setNewLevel] = useState(0);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEditing = (bookmark: BookmarkType) => {
    setEditingId(bookmark.id);
    setEditTitle(bookmark.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateBookmark(id, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleAddBookmark = () => {
    const pageNum = parseInt(newPage, 10);
    if (!newTitle.trim() || isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) return;
    onAddBookmark({
      id: uid(),
      title: newTitle.trim(),
      page: pageNum,
      level: newLevel,
    });
    setNewTitle("");
    setNewPage(String(currentPage));
    setNewLevel(0);
    setShowAddForm(false);
  };

  // Group bookmarks: top-level items at level 0, children nested under previous parent
  const hasChildren = (id: string, index: number): boolean => {
    const bk = bookmarks[index];
    if (!bk) return false;
    const nextIndex = index + 1;
    if (nextIndex >= bookmarks.length) return false;
    return bookmarks[nextIndex].level > bk.level;
  };

  const getChildrenOf = (index: number, parentLevel: number): number[] => {
    const children: number[] = [];
    for (let i = index + 1; i < bookmarks.length; i++) {
      if (bookmarks[i].level <= parentLevel) break;
      children.push(i);
    }
    return children;
  };

  const renderBookmark = (bk: BookmarkType, index: number, visible: boolean): React.ReactNode => {
    if (!visible) return null;

    const isEditing = editingId === bk.id;
    const isHovered = hoveredId === bk.id;
    const isActive = bk.page === currentPage;
    const hasKids = hasChildren(bk.id, index);
    const isExpanded = expandedIds.has(bk.id);

    return (
      <div key={bk.id}>
        <div
          className="flex items-center gap-1"
          style={{
            padding: "5px 8px",
            paddingLeft: 8 + bk.level * 16,
            borderRadius: 4,
            cursor: "pointer",
            backgroundColor: isActive ? "var(--muted)" : "transparent",
            transition: "background-color 0.12s",
          }}
          onClick={() => {
            if (!isEditing) onNavigate(bk.page);
          }}
          onMouseEnter={(e) => {
            setHoveredId(bk.id);
            if (!isActive) e.currentTarget.style.backgroundColor = "var(--muted)";
          }}
          onMouseLeave={(e) => {
            setHoveredId(null);
            if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {/* Expand/collapse toggle */}
          {hasKids ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(bk.id);
              }}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {isExpanded ? (
                <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
              ) : (
                <ChevronRight size={13} style={{ color: "var(--muted-foreground)" }} />
              )}
            </button>
          ) : (
            <span style={{ width: 13, flexShrink: 0 }} />
          )}

          {/* Bookmark icon */}
          <Bookmark
            size={13}
            style={{
              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
              flexShrink: 0,
            }}
          />

          {/* Title or edit input */}
          {isEditing ? (
            <div className="flex items-center gap-1" style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(bk.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                style={{ ...inputStyle, flex: 1, fontSize: 11, padding: "2px 6px" }}
                autoFocus
              />
              <button
                onClick={() => saveEdit(bk.id)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Check size={12} style={{ color: "var(--primary)" }} />
              </button>
            </div>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: isActive ? "var(--foreground)" : "var(--card-foreground)",
                fontWeight: isActive ? 600 : 400,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {bk.title}
            </span>
          )}

          {/* Page number */}
          {!isEditing && (
            <span
              style={{
                fontSize: 10,
                color: "var(--muted-foreground)",
                flexShrink: 0,
                minWidth: 20,
                textAlign: "right",
              }}
            >
              p.{bk.page}
            </span>
          )}

          {/* Hover actions */}
          {isHovered && !isEditing && (
            <div className="flex items-center gap-0.5" style={{ flexShrink: 0, marginLeft: 2 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(bk);
                }}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                }}
                title="Rename"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Edit3 size={11} style={{ color: "var(--muted-foreground)" }} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(bk.id);
                }}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                }}
                title="Delete"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Trash2 size={11} style={{ color: "var(--destructive, #ef4444)" }} />
              </button>
            </div>
          )}
        </div>

        {/* Render children if expanded */}
        {hasKids &&
          isExpanded &&
          getChildrenOf(index, bk.level).map((childIndex) =>
            renderBookmark(bookmarks[childIndex], childIndex, true)
          )}
      </div>
    );
  };

  // Only render top-level bookmarks directly; children are rendered via recursion
  const topLevelIndices: number[] = [];
  for (let i = 0; i < bookmarks.length; i++) {
    if (bookmarks[i].level === 0) {
      topLevelIndices.push(i);
    } else {
      // Children of an expanded parent are rendered in renderBookmark
      // Skip children of level-0 items here; they'll be rendered recursively
      // Only include items not nested under a parent at top render level
      let isChildOfTopLevel = false;
      for (let j = i - 1; j >= 0; j--) {
        if (bookmarks[j].level < bookmarks[i].level) {
          isChildOfTopLevel = true;
          break;
        }
      }
      if (!isChildOfTopLevel) {
        topLevelIndices.push(i);
      }
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        width: 220,
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="flex items-center gap-1.5"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <BookOpen size={13} />
          Bookmarks
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
            }}
            title="Add Bookmark"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Plus size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
            }}
            title="Close"
          >
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Add bookmark form */}
      {showAddForm && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)" }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddBookmark();
            }}
            placeholder="Bookmark title..."
            style={{ ...inputStyle, fontSize: 11, padding: "4px 8px" }}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1" style={{ flex: 1 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                Page:
              </label>
              <input
                type="text"
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                style={{ ...inputStyle, fontSize: 11, padding: "3px 6px", width: 40, textAlign: "center" }}
              />
            </div>
            <div className="flex items-center gap-1" style={{ flex: 1 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                <CornerDownRight size={10} style={{ display: "inline", verticalAlign: "middle" }} /> Level:
              </label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(Number(e.target.value))}
                style={{
                  ...inputStyle,
                  fontSize: 11,
                  padding: "3px 6px",
                  width: 44,
                }}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddBookmark}
              style={{
                ...btnStyle,
                flex: 1,
                justifyContent: "center",
                fontSize: 11,
                padding: "4px 8px",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "1px solid var(--primary)",
              }}
            >
              <Plus size={12} /> Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ ...btnStyle, fontSize: 11, padding: "4px 8px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bookmarks list */}
      <div
        className="flex flex-col"
        style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}
      >
        {bookmarks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2"
            style={{ padding: 24, color: "var(--muted-foreground)" }}
          >
            <BookOpen size={28} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: 12, textAlign: "center" }}>No bookmarks yet</span>
            <button
              onClick={() => setShowAddForm(true)}
              style={{ ...btnStyle, fontSize: 11, padding: "4px 10px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
            >
              <Plus size={12} /> Add Bookmark
            </button>
          </div>
        ) : (
          topLevelIndices.map((idx) => renderBookmark(bookmarks[idx], idx, true))
        )}
      </div>

      {/* Footer */}
      {bookmarks.length > 0 && (
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
