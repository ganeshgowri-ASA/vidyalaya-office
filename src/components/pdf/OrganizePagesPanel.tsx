"use client";

import React, { useState, useCallback } from "react";
import {
  Trash2,
  RotateCw,
  RotateCcw,
  FilePlus,
  FileOutput,
  ArrowDownUp,
  CheckSquare,
  Square,
  GripVertical,
  ChevronDown,
  Move,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface OrganizePagesPanelProps {
  thumbnails: string[];
  pageOrder: number[];
  pageRotations: Record<number, number>;
  totalPages: number;
  onReorderPages: (newOrder: number[]) => void;
  onDeletePages: (pages: number[]) => void;
  onRotatePages: (pages: number[], degrees: number) => void;
  onInsertBlankPage: (afterPage: number) => void;
  onExtractPages: (pages: number[]) => void;
}

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 16,
  height: "100%",
  overflowY: "auto",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--muted-foreground)",
  marginBottom: 4,
};

const thumbnailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
  flex: 1,
  overflowY: "auto",
  padding: 4,
};

const thumbnailCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  padding: 6,
  borderRadius: 8,
  border: "2px solid var(--border)",
  backgroundColor: "var(--card)",
  cursor: "grab",
  transition: "border-color 0.15s, box-shadow 0.15s",
  position: "relative",
  userSelect: "none",
};

const actionBarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  padding: 10,
  backgroundColor: "var(--muted)",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const moveRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: 10,
  backgroundColor: "var(--muted)",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  color: "#ef4444",
};

export default function OrganizePagesPanel({
  thumbnails,
  pageOrder,
  pageRotations,
  totalPages,
  onReorderPages,
  onDeletePages,
  onRotatePages,
  onInsertBlankPage,
  onExtractPages,
}: OrganizePagesPanelProps) {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [rotateDropdownOpen, setRotateDropdownOpen] = useState(false);
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState("");

  const handlePageClick = useCallback(
    (pageIndex: number, e: React.MouseEvent) => {
      setSelectedPages((prev) => {
        const next = new Set(prev);
        if (e.ctrlKey || e.metaKey) {
          if (next.has(pageIndex)) next.delete(pageIndex);
          else next.add(pageIndex);
        } else if (e.shiftKey && prev.size > 0) {
          const lastSelected = Array.from(prev).pop()!;
          const start = Math.min(lastSelected, pageIndex);
          const end = Math.max(lastSelected, pageIndex);
          for (let i = start; i <= end; i++) next.add(i);
        } else {
          if (next.size === 1 && next.has(pageIndex)) {
            next.clear();
          } else {
            next.clear();
            next.add(pageIndex);
          }
        }
        return next;
      });
    },
    []
  );

  const handleSelectAll = () => {
    const all = new Set<number>();
    for (let i = 0; i < pageOrder.length; i++) all.add(i);
    setSelectedPages(all);
  };

  const handleDeselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedPages.size === 0) return;
    const pagesToDelete = Array.from(selectedPages).map((i) => pageOrder[i]);
    onDeletePages(pagesToDelete);
    setSelectedPages(new Set());
  };

  const handleRotateSelected = (degrees: number) => {
    if (selectedPages.size === 0) return;
    const pagesToRotate = Array.from(selectedPages).map((i) => pageOrder[i]);
    onRotatePages(pagesToRotate, degrees);
    setRotateDropdownOpen(false);
  };

  const handleInsertBlank = () => {
    const selected = Array.from(selectedPages);
    const afterIndex = selected.length > 0 ? Math.max(...selected) : pageOrder.length - 1;
    const afterPage = afterIndex >= 0 ? pageOrder[afterIndex] : totalPages;
    onInsertBlankPage(afterPage);
  };

  const handleExtractSelected = () => {
    if (selectedPages.size === 0) return;
    const pages = Array.from(selectedPages).map((i) => pageOrder[i]);
    onExtractPages(pages);
  };

  const handleReverseOrder = () => {
    const newOrder = [...pageOrder].reverse();
    onReorderPages(newOrder);
    setSelectedPages(new Set());
  };

  const handleMovePages = () => {
    const from = parseInt(moveFrom, 10);
    const to = parseInt(moveTo, 10);
    if (isNaN(from) || isNaN(to) || from < 1 || from > pageOrder.length || to < 1 || to > pageOrder.length || from === to) return;
    const newOrder = [...pageOrder];
    const [item] = newOrder.splice(from - 1, 1);
    newOrder.splice(to - 1, 0, item);
    onReorderPages(newOrder);
    setMoveFrom("");
    setMoveTo("");
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...pageOrder];
    const [dragged] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, dragged);
    onReorderPages(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setSelectedPages(new Set());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div style={panelStyle}>
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--muted-foreground)",
        }}
      >
        <span>
          {totalPages} page{totalPages !== 1 ? "s" : ""} total, {selectedPages.size} selected
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={{ ...btnStyle, padding: "4px 8px", fontSize: 11 }} onClick={handleSelectAll}>
            <CheckSquare size={12} /> Select All
          </button>
          <button style={{ ...btnStyle, padding: "4px 8px", fontSize: 11 }} onClick={handleDeselectAll}>
            <Square size={12} /> Deselect All
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div style={actionBarStyle}>
        <button
          style={{
            ...btnDangerStyle,
            opacity: selectedPages.size === 0 ? 0.4 : 1,
            cursor: selectedPages.size === 0 ? "not-allowed" : "pointer",
          }}
          onClick={handleDeleteSelected}
          disabled={selectedPages.size === 0}
        >
          <Trash2 size={14} /> Delete Selected
        </button>

        <div style={{ position: "relative" }}>
          <button
            style={{
              ...btnStyle,
              opacity: selectedPages.size === 0 ? 0.4 : 1,
              cursor: selectedPages.size === 0 ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              if (selectedPages.size > 0) setRotateDropdownOpen(!rotateDropdownOpen);
            }}
            disabled={selectedPages.size === 0}
          >
            <RotateCw size={14} /> Rotate <ChevronDown size={12} />
          </button>
          {rotateDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 4,
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 10,
                minWidth: 140,
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  width: "100%",
                  border: "none",
                  background: "none",
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--card-foreground)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                }}
                onClick={() => handleRotateSelected(90)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <RotateCw size={14} /> 90° CW
              </button>
              <button
                style={{
                  width: "100%",
                  border: "none",
                  background: "none",
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--card-foreground)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                }}
                onClick={() => handleRotateSelected(-90)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <RotateCcw size={14} /> 90° CCW
              </button>
              <button
                style={{
                  width: "100%",
                  border: "none",
                  background: "none",
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--card-foreground)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                }}
                onClick={() => handleRotateSelected(180)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <RotateCw size={14} /> 180°
              </button>
            </div>
          )}
        </div>

        <button style={btnStyle} onClick={handleInsertBlank}>
          <FilePlus size={14} /> Insert Blank
        </button>

        <button
          style={{
            ...btnStyle,
            opacity: selectedPages.size === 0 ? 0.4 : 1,
            cursor: selectedPages.size === 0 ? "not-allowed" : "pointer",
          }}
          onClick={handleExtractSelected}
          disabled={selectedPages.size === 0}
        >
          <FileOutput size={14} /> Extract
        </button>

        <button style={btnStyle} onClick={handleReverseOrder}>
          <ArrowDownUp size={14} /> Reverse
        </button>
      </div>

      {/* Move pages section */}
      <div style={moveRowStyle}>
        <Move size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>Move page</span>
        <input
          type="number"
          placeholder="from"
          value={moveFrom}
          onChange={(e) => setMoveFrom(e.target.value)}
          min={1}
          max={pageOrder.length}
          style={{ ...inputStyle, width: 56 }}
        />
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>to</span>
        <input
          type="number"
          placeholder="to"
          value={moveTo}
          onChange={(e) => setMoveTo(e.target.value)}
          min={1}
          max={pageOrder.length}
          style={{ ...inputStyle, width: 56 }}
        />
        <button style={{ ...btnPrimaryStyle, padding: "4px 10px", fontSize: 12 }} onClick={handleMovePages}>
          Move
        </button>
      </div>

      {/* Thumbnails grid */}
      <div style={{ ...sectionLabelStyle }}>Pages</div>
      <div style={thumbnailGridStyle}>
        {pageOrder.map((pageNum, index) => {
          const isSelected = selectedPages.has(index);
          const isDragged = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          const rotation = pageRotations[pageNum] || 0;

          return (
            <div
              key={`${pageNum}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onClick={(e) => handlePageClick(index, e)}
              style={{
                ...thumbnailCardStyle,
                borderColor: isSelected ? "var(--primary)" : isDragOver ? "var(--accent)" : "var(--border)",
                boxShadow: isSelected ? "0 0 0 2px var(--primary)" : isDragOver ? "0 0 0 2px var(--accent)" : "none",
                opacity: isDragged ? 0.4 : 1,
                transform: isDragOver ? "scale(1.02)" : "scale(1)",
              }}
            >
              <GripVertical
                size={12}
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  color: "var(--muted-foreground)",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  backgroundColor: "var(--muted)",
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {thumbnails[pageNum] ? (
                  <img
                    src={thumbnails[pageNum]}
                    alt={`Page ${pageNum + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.2s",
                    }}
                    draggable={false}
                  />
                ) : (
                  <span style={{ fontSize: 20, color: "var(--muted-foreground)" }}>{pageNum + 1}</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>
                  Page {pageNum + 1}
                </span>
                {rotation !== 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--primary)",
                      backgroundColor: "var(--accent)",
                      padding: "1px 4px",
                      borderRadius: 3,
                    }}
                  >
                    {rotation}°
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
