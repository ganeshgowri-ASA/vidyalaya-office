"use client";

import React, { useState } from "react";
import {
  ZoomIn, ZoomOut, Search, Printer, Ruler, Grid3X3,
  PanelLeft, BookOpen, FileText, Globe, Layout,
  ListTree, Edit3, Eye, SplitSquareHorizontal,
  Maximize2, Monitor, ChevronDown, History, Terminal,
  Code, GitBranch, MessageCircle,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator } from "./toolbar-button";
import type { ViewMode } from "@/store/document-store";

export interface ViewTabProps {
  onToggleVersionControl?: () => void;
  onToggleDeveloper?: () => void;
}

export function ViewTab({ onToggleVersionControl, onToggleDeveloper }: ViewTabProps) {
  const {
    zoom, setZoom,
    viewMode, setViewMode,
    showRuler, toggleRuler,
    showGridlines, toggleGridlines,
    showNavigationPane, toggleNavigationPane,
    trackChanges, toggleTrackChanges,
    showComments, toggleComments,
  } = useDocumentStore();

  const [showZoomDialog, setShowZoomDialog] = useState(false);

  return (
    <>
      {/* ===== VIEWS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<BookOpen size={14} />} label="Read" title="Read Mode"
            active={viewMode === "read"} onClick={() => setViewMode("read")} />
          <ToolbarButton icon={<FileText size={14} />} label="Print" title="Print Layout"
            active={viewMode === "print"} onClick={() => setViewMode("print")} />
          <ToolbarButton icon={<Globe size={14} />} label="Web" title="Web Layout"
            active={viewMode === "web"} onClick={() => setViewMode("web")} />
          <ToolbarButton icon={<ListTree size={14} />} label="Outline" title="Outline"
            active={viewMode === "outline"} onClick={() => setViewMode("outline")} />
          <ToolbarButton icon={<Edit3 size={14} />} label="Draft" title="Draft"
            active={viewMode === "draft"} onClick={() => setViewMode("draft")} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Views</span>
      </div>

      {/* ===== SHOW GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Ruler size={14} />} label="Ruler" title="Toggle Ruler"
            active={showRuler} onClick={toggleRuler} />
          <ToolbarButton icon={<Grid3X3 size={14} />} label="Gridlines" title="Toggle Gridlines"
            active={showGridlines} onClick={toggleGridlines} />
          <ToolbarButton icon={<PanelLeft size={14} />} label="Navigation" title="Navigation Pane"
            active={showNavigationPane} onClick={toggleNavigationPane} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Show</span>
      </div>

      {/* ===== ZOOM GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<ZoomIn size={14} />} label="Zoom" title="Zoom Dialog" onClick={() => setShowZoomDialog(!showZoomDialog)} />
            {showZoomDialog && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg w-48"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Zoom</div>
                {[50, 75, 100, 150, 200, 250, 300, 400, 500].map((z) => (
                  <button key={z} className="w-full text-left text-xs px-3 py-1 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)", fontWeight: zoom === z ? 600 : 400 }}
                    onClick={() => { setZoom(z); setShowZoomDialog(false); }}>
                    {z}%
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarButton icon={<span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>100%</span>}
            title="100%" onClick={() => setZoom(100)} />
          <ToolbarButton icon={<Monitor size={14} />} label="One Page" title="One Page" onClick={() => setZoom(80)} />
          <ToolbarButton icon={<SplitSquareHorizontal size={14} />} label="Two Pages" title="Two Pages" onClick={() => setZoom(55)} />
          <ToolbarButton icon={<Maximize2 size={14} />} label="Page Width" title="Page Width" onClick={() => setZoom(100)} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Zoom</span>
      </div>

      {/* ===== ZOOM SLIDER ===== */}
      <div className="flex items-center gap-1 border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <ToolbarButton icon={<ZoomOut size={14} />} title="Zoom Out" onClick={() => setZoom(Math.max(50, zoom - 10))} />
        <span className="w-10 text-center text-[10px]" style={{ color: "var(--foreground)" }}>{zoom}%</span>
        <ToolbarButton icon={<ZoomIn size={14} />} title="Zoom In" onClick={() => setZoom(Math.min(500, zoom + 10))} />
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="w-20"
          title="Zoom Level"
        />
      </div>

      {/* ===== TOOLS ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Search size={14} />} label="Find" title="Find & Replace (Ctrl+F)"
            onClick={() => useDocumentStore.getState().setShowFindReplace(true)} />
          <ToolbarButton icon={<Printer size={14} />} label="Print" title="Print Preview"
            onClick={() => useDocumentStore.getState().setShowPrintPreview(true)} />
          <ToolbarButton icon={<GitBranch size={14} />} label="Track" title="Track Changes"
            active={trackChanges} onClick={toggleTrackChanges} />
          <ToolbarButton icon={<MessageCircle size={14} />} label="Comments" title="Comments"
            active={showComments} onClick={toggleComments} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Tools</span>
      </div>

      {/* ===== WINDOW & MACROS ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          {onToggleVersionControl && (
            <ToolbarButton icon={<History size={14} />} label="Versions" title="Version Control" onClick={onToggleVersionControl} />
          )}
          {onToggleDeveloper && (
            <ToolbarButton icon={<Terminal size={14} />} label="Macros" title="Macros" onClick={onToggleDeveloper} />
          )}
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Window</span>
      </div>
    </>
  );
}
