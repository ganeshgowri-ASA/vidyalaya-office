"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Maximize2,
  RotateCw,
  RotateCcw,
  BookOpen,
  Columns2,
  Search,
  Printer,
  Download,
  Info,
  Layers,
  FilePlus2,
  ScanText,
  Fullscreen,
} from "lucide-react";
import { btnStyle, inputStyle } from "./types";

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 24,
  backgroundColor: "var(--border)",
  margin: "0 4px",
  flexShrink: 0,
};

interface PdfViewerToolbarProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  fitMode: "none" | "width" | "page";
  showThumbnails: boolean;
  showBookmarks: boolean;
  isFullscreen: boolean;
  multiPageView: boolean;
  onZoomChange: (z: number) => void;
  onPageChange: (p: number) => void;
  onFitModeChange: (m: "none" | "width" | "page") => void;
  onToggleThumbnails: () => void;
  onToggleBookmarks: () => void;
  onToggleFullscreen: () => void;
  onToggleMultiPage: () => void;
  onRotatePage: (deg: 90 | -90 | 180) => void;
  onRotateAll: (deg: 90 | -90 | 180) => void;
  onSearch: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onProperties: () => void;
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

export default function PdfViewerToolbar(props: PdfViewerToolbarProps) {
  const {
    zoom,
    currentPage,
    totalPages,
    fitMode,
    showThumbnails,
    showBookmarks,
    isFullscreen,
    multiPageView,
    onZoomChange,
    onPageChange,
    onFitModeChange,
    onToggleThumbnails,
    onToggleBookmarks,
    onToggleFullscreen,
    onToggleMultiPage,
    onRotatePage,
    onRotateAll,
    onSearch,
    onPrint,
    onDownload,
    onProperties,
  } = props;

  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowZoomDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageInputSubmit = () => {
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const activeBtn = (active: boolean): React.CSSProperties => ({
    ...btnStyle,
    padding: "5px 8px",
    backgroundColor: active ? "var(--primary)" : "var(--card)",
    color: active ? "var(--primary-foreground)" : "var(--card-foreground)",
    border: active ? "1px solid var(--primary)" : "1px solid var(--border)",
  });

  const iconBtn: React.CSSProperties = { ...btnStyle, padding: "5px 8px" };

  return (
    <div
      className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto"
      style={{
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
        minHeight: 42,
      }}
    >
      {/* ── Sidebar Toggles ── */}
      <button
        style={activeBtn(showThumbnails)}
        onClick={onToggleThumbnails}
        title="Thumbnails"
        onMouseEnter={(e) => {
          if (!showThumbnails) e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (!showThumbnails) e.currentTarget.style.backgroundColor = "var(--card)";
        }}
      >
        <Layers size={15} />
      </button>
      <button
        style={activeBtn(showBookmarks)}
        onClick={onToggleBookmarks}
        title="Bookmarks"
        onMouseEnter={(e) => {
          if (!showBookmarks) e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (!showBookmarks) e.currentTarget.style.backgroundColor = "var(--card)";
        }}
      >
        <BookOpen size={15} />
      </button>

      <div style={dividerStyle} />

      {/* ── Page Navigation ── */}
      <button
        style={iconBtn}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        title="Previous Page"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <ChevronLeft size={15} />
      </button>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={handlePageInputSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePageInputSubmit();
          }}
          style={{ ...inputStyle, width: 44, textAlign: "center", padding: "4px 6px", fontSize: 12 }}
        />
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
          / {totalPages}
        </span>
      </div>
      <button
        style={iconBtn}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        title="Next Page"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <ChevronRight size={15} />
      </button>

      <div style={dividerStyle} />

      {/* ── Zoom Controls ── */}
      <button
        style={iconBtn}
        onClick={() => onZoomChange(Math.max(25, zoom - 10))}
        title="Zoom Out"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <ZoomOut size={15} />
      </button>

      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          style={{ ...iconBtn, minWidth: 70, justifyContent: "center", fontSize: 12 }}
          onClick={() => setShowZoomDropdown(!showZoomDropdown)}
          title="Zoom Level"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
        >
          {fitMode === "width" ? "Fit Width" : fitMode === "page" ? "Fit Page" : `${Math.round(zoom)}%`}
        </button>

        {showZoomDropdown && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              zIndex: 100,
              minWidth: 130,
              overflow: "hidden",
            }}
          >
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  onFitModeChange("none");
                  onZoomChange(preset);
                  setShowZoomDropdown(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "7px 14px",
                  border: "none",
                  backgroundColor: zoom === preset && fitMode === "none" ? "var(--muted)" : "transparent",
                  color: "var(--card-foreground)",
                  fontSize: 12,
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    zoom === preset && fitMode === "none" ? "var(--muted)" : "transparent";
                }}
              >
                {preset}%
              </button>
            ))}
            <div style={{ height: 1, backgroundColor: "var(--border)" }} />
            <button
              onClick={() => {
                onFitModeChange("width");
                setShowZoomDropdown(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "7px 14px",
                border: "none",
                backgroundColor: fitMode === "width" ? "var(--muted)" : "transparent",
                color: "var(--card-foreground)",
                fontSize: 12,
                textAlign: "left",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = fitMode === "width" ? "var(--muted)" : "transparent";
              }}
            >
              Fit Width
            </button>
            <button
              onClick={() => {
                onFitModeChange("page");
                setShowZoomDropdown(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "7px 14px",
                border: "none",
                backgroundColor: fitMode === "page" ? "var(--muted)" : "transparent",
                color: "var(--card-foreground)",
                fontSize: 12,
                textAlign: "left",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = fitMode === "page" ? "var(--muted)" : "transparent";
              }}
            >
              Fit Page
            </button>
          </div>
        )}
      </div>

      <button
        style={iconBtn}
        onClick={() => onZoomChange(Math.min(400, zoom + 10))}
        title="Zoom In"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <ZoomIn size={15} />
      </button>

      <div style={dividerStyle} />

      {/* ── Fit Mode Buttons ── */}
      <button
        style={activeBtn(fitMode === "width")}
        onClick={() => onFitModeChange(fitMode === "width" ? "none" : "width")}
        title="Fit Width"
        onMouseEnter={(e) => {
          if (fitMode !== "width") e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (fitMode !== "width") e.currentTarget.style.backgroundColor = "var(--card)";
        }}
      >
        <Maximize size={15} />
      </button>
      <button
        style={activeBtn(fitMode === "page")}
        onClick={() => onFitModeChange(fitMode === "page" ? "none" : "page")}
        title="Fit Page"
        onMouseEnter={(e) => {
          if (fitMode !== "page") e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (fitMode !== "page") e.currentTarget.style.backgroundColor = "var(--card)";
        }}
      >
        <Maximize2 size={15} />
      </button>

      <div style={dividerStyle} />

      {/* ── Rotation ── */}
      <button
        style={iconBtn}
        onClick={() => onRotatePage(-90)}
        title="Rotate Page Counter-Clockwise"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <RotateCcw size={15} />
      </button>
      <button
        style={iconBtn}
        onClick={() => onRotatePage(90)}
        title="Rotate Page Clockwise"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <RotateCw size={15} />
      </button>

      <div style={dividerStyle} />

      {/* ── View Modes ── */}
      <button
        style={activeBtn(multiPageView)}
        onClick={onToggleMultiPage}
        title="Multi-Page View"
        onMouseEnter={(e) => {
          if (!multiPageView) e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (!multiPageView) e.currentTarget.style.backgroundColor = "var(--card)";
        }}
      >
        <Columns2 size={15} />
      </button>
      <button
        style={activeBtn(isFullscreen)}
        onClick={onToggleFullscreen}
        title="Fullscreen"
        onMouseEnter={(e) => {
          if (!isFullscreen) e.currentTarget.style.backgroundColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          if (!isFullscreen) e.currentTarget.style.backgroundColor = "var(--card)";
        }}
      >
        <Fullscreen size={15} />
      </button>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Actions ── */}
      <button
        style={iconBtn}
        onClick={onSearch}
        title="Search"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <Search size={15} />
      </button>
      <button
        style={iconBtn}
        onClick={onPrint}
        title="Print"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <Printer size={15} />
      </button>
      <button
        style={iconBtn}
        onClick={onDownload}
        title="Download"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <Download size={15} />
      </button>
      <button
        style={iconBtn}
        onClick={onProperties}
        title="Properties"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
      >
        <Info size={15} />
      </button>
    </div>
  );
}
