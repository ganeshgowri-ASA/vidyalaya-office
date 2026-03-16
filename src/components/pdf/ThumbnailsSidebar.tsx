"use client";

import React, { useState } from "react";
import { GripVertical, Trash2, RotateCw, RotateCcw, Plus, X } from "lucide-react";
import { btnStyle } from "./types";

interface ThumbnailsSidebarProps {
  thumbnails: string[];
  currentPage: number;
  pageOrder: number[];
  pageRotations: Record<number, number>;
  onPageSelect: (page: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  onDeletePage: (page: number) => void;
  onAddBlankPage: () => void;
  onRotatePage: (page: number, deg: 90 | -90) => void;
  totalPages: number;
}

export default function ThumbnailsSidebar({
  thumbnails,
  currentPage,
  pageOrder,
  pageRotations,
  onPageSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDeletePage,
  onAddBlankPage,
  onRotatePage,
  totalPages,
}: ThumbnailsSidebarProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
    onDragOver(e, index);
  };

  const handleDrop = (index: number) => {
    setDragOverIndex(null);
    onDrop(index);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    onDragEnd();
  };

  return (
    <div
      className="flex flex-col"
      style={{
        width: 160,
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
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Pages
        </span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{totalPages}</span>
      </div>

      {/* Thumbnails list */}
      <div
        className="flex flex-col gap-2 p-2"
        style={{ overflowY: "auto", flex: 1 }}
      >
        {pageOrder.map((pageNum, index) => {
          const isActive = pageNum === currentPage;
          const isDragOver = dragOverIndex === index;
          const isHovered = hoveredPage === pageNum;
          const rotation = pageRotations[pageNum] || 0;

          return (
            <div
              key={`page-${pageNum}`}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onClick={() => onPageSelect(pageNum)}
              onMouseEnter={() => setHoveredPage(pageNum)}
              onMouseLeave={() => setHoveredPage(null)}
              style={{
                position: "relative",
                borderRadius: 6,
                border: isActive
                  ? "2px solid var(--primary)"
                  : isDragOver
                  ? "2px dashed var(--primary)"
                  : "2px solid transparent",
                backgroundColor: isActive ? "var(--muted)" : "transparent",
                cursor: "pointer",
                transition: "border-color 0.15s, background-color 0.15s",
                padding: 4,
              }}
            >
              {/* Drag handle */}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: 2,
                  cursor: "grab",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.15s",
                  color: "var(--muted-foreground)",
                }}
              >
                <GripVertical size={12} />
              </div>

              {/* Thumbnail image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "3 / 4",
                  backgroundColor: "var(--background)",
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
                  transition: "transform 0.2s",
                }}
              >
                {thumbnails[pageNum - 1] ? (
                  <img
                    src={thumbnails[pageNum - 1]}
                    alt={`Page ${pageNum}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    draggable={false}
                  />
                ) : (
                  <span style={{ fontSize: 24, color: "var(--muted-foreground)", fontWeight: 300 }}>
                    {pageNum}
                  </span>
                )}
              </div>

              {/* Page number label */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  marginTop: 4,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {pageNum}
                {rotation !== 0 && (
                  <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>
                    {rotation}°
                  </span>
                )}
              </div>

              {/* Hover action buttons */}
              {isHovered && (
                <div
                  className="flex items-center gap-0.5"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 4,
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    padding: "2px 2px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(pageNum, 90);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 3,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Rotate Clockwise"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <RotateCw size={11} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(pageNum, -90);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 3,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Rotate Counter-Clockwise"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <RotateCcw size={11} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                  {totalPages > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(pageNum);
                      }}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        padding: 3,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Delete Page"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Trash2 size={11} style={{ color: "var(--destructive, #ef4444)" }} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add blank page button */}
      <div style={{ padding: 8, borderTop: "1px solid var(--border)" }}>
        <button
          onClick={onAddBlankPage}
          style={{
            ...btnStyle,
            width: "100%",
            justifyContent: "center",
            fontSize: 11,
            padding: "6px 8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
        >
          <Plus size={13} /> Add Page
        </button>
      </div>
    </div>
  );
}
