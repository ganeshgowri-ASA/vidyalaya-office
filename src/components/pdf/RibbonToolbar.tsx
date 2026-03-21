"use client";

import React from "react";
import {
  FileText,
  Pencil,
  MessageSquare,
  FormInput,
  LayoutGrid,
  FileOutput,
  Shield,
  Eye,
  PenTool,
} from "lucide-react";
import type { RibbonTabId } from "./types";

interface RibbonToolbarProps {
  activeTab: RibbonTabId;
  onTabChange: (tab: RibbonTabId) => void;
  pdfName: string;
}

const RIBBON_TABS: { id: RibbonTabId; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: FileText },
  { id: "edit", label: "Edit", icon: Pencil },
  { id: "annotate", label: "Annotate", icon: MessageSquare },
  { id: "forms", label: "Forms", icon: FormInput },
  { id: "organize", label: "Organize", icon: LayoutGrid },
  { id: "convert", label: "Convert", icon: FileOutput },
  { id: "security", label: "Security", icon: Shield },
  { id: "sign", label: "Sign", icon: PenTool },
  { id: "review", label: "Review", icon: Eye },
];

export default function RibbonToolbar({ activeTab, onTabChange, pdfName }: RibbonToolbarProps) {
  return (
    <div style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
      {/* Title bar */}
      <div className="flex items-center gap-4 px-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          PDF Editor
        </h1>
        {pdfName && (
          <span className="text-sm truncate" style={{ color: "var(--muted-foreground)", maxWidth: 400 }}>
            — {pdfName}
          </span>
        )}
      </div>

      {/* Ribbon tabs */}
      <div className="flex gap-0 px-2 overflow-x-auto" style={{ backgroundColor: "var(--card)" }}>
        {RIBBON_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors relative"
              style={{
                backgroundColor: isActive ? "var(--background)" : "transparent",
                color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                borderTop: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                borderRadius: "4px 4px 0 0",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "var(--muted)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
