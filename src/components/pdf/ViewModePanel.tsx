"use client";

import React from "react";
import { FileText, Rows3, BookOpen, Maximize2, Minimize2 } from "lucide-react";

export type ViewMode = "single" | "continuous" | "two-page";

interface ViewModePanelProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "4px 10px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  transition: "background-color 0.15s",
};

const activeStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

export default function ViewModePanel({
  viewMode,
  onViewModeChange,
  isFullscreen,
  onToggleFullscreen,
}: ViewModePanelProps) {
  const modes: { id: ViewMode; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "single", label: "Single", icon: FileText, desc: "One page at a time" },
    { id: "continuous", label: "Continuous", icon: Rows3, desc: "Scroll through all pages" },
    { id: "two-page", label: "Two-Page", icon: BookOpen, desc: "Side-by-side page spread" },
  ];

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1"
      style={{ backgroundColor: "var(--background)" }}
    >
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = viewMode === m.id;
        return (
          <button
            key={m.id}
            style={isActive ? activeStyle : btnStyle}
            onClick={() => onViewModeChange(m.id)}
            title={m.desc}
          >
            <Icon size={13} />
            {m.label}
          </button>
        );
      })}
      <div style={{ width: 1, height: 20, backgroundColor: "var(--border)", margin: "0 4px" }} />
      <button
        style={btnStyle}
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
      </button>
    </div>
  );
}
