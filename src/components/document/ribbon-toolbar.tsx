"use client";

import React from "react";
import {
  Sparkles, LayoutTemplate, Terminal, Code,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator } from "./toolbar-button";
import { HomeTab } from "./ribbon-home-tab";
import { InsertTab } from "./ribbon-insert-tab";
import { DesignTab } from "./ribbon-design-tab";
import { LayoutTab } from "./ribbon-layout-tab";
import { ReferencesTab } from "./ribbon-references-tab";
import { ReviewTab } from "./ribbon-review-tab";
import { ViewTab } from "./ribbon-view-tab";
import type { TabKey } from "@/store/document-store";

interface RibbonToolbarProps {
  onPageSetup?: () => void;
  onHeaderFooterEditor?: () => void;
  onToggleVersionControl?: () => void;
  onToggleDeveloper?: () => void;
}

export function RibbonToolbar({ onPageSetup, onHeaderFooterEditor, onToggleVersionControl, onToggleDeveloper }: RibbonToolbarProps = {}) {
  const {
    activeTab, setActiveTab,
    toggleAI, showAI,
    setShowTemplates,
  } = useDocumentStore();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "insert", label: "Insert" },
    { key: "design", label: "Design" },
    { key: "layout", label: "Layout" },
    { key: "references", label: "References" },
    { key: "review", label: "Review" },
    { key: "view", label: "View" },
    { key: "developer", label: "Developer" },
  ];

  return (
    <div className="no-print flex-shrink-0 border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b px-2" style={{ borderColor: "var(--border)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
              activeTab === t.key ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--muted-foreground)]"
            }`}
            style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <ToolbarButton
          icon={<Sparkles size={16} />}
          label={showAI ? "Hide AI" : "AI Assistant"}
          title="Toggle AI Assistant"
          active={showAI}
          onClick={toggleAI}
        />
        <ToolbarButton
          icon={<LayoutTemplate size={16} />}
          label="Templates"
          title="Document Templates"
          onClick={() => setShowTemplates(true)}
        />
      </div>

      {/* Toolbar content */}
      <div className="flex flex-wrap items-start gap-0.5 px-2 py-1 min-h-[52px]">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "insert" && <InsertTab />}
        {activeTab === "design" && <DesignTab />}
        {activeTab === "layout" && <LayoutTab onPageSetup={onPageSetup} onHeaderFooterEditor={onHeaderFooterEditor} />}
        {activeTab === "references" && <ReferencesTab />}
        {activeTab === "review" && <ReviewTab />}
        {activeTab === "view" && <ViewTab onToggleVersionControl={onToggleVersionControl} onToggleDeveloper={onToggleDeveloper} />}
        {activeTab === "developer" && (
          <>
            {onToggleDeveloper && (
              <ToolbarButton icon={<Terminal size={15} />} label="Developer Tools" title="Open Developer Panel" onClick={onToggleDeveloper} />
            )}
            <ToolbarSeparator />
            <ToolbarButton icon={<Code size={15} />} label="Macro Editor" title="Open Macro Editor" onClick={() => onToggleDeveloper?.()} />
            <ToolbarButton icon={<Terminal size={15} />} label="Console" title="Developer Console" onClick={() => onToggleDeveloper?.()} />
          </>
        )}
      </div>
    </div>
  );
}
