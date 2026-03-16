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
import { TableDesignTab } from "./ribbon-table-design-tab";
import { ImageFormatTab } from "./ribbon-image-format-tab";
import type { TabKey } from "@/store/document-store";

interface RibbonToolbarProps {
  onPageSetup?: () => void;
  onHeaderFooterEditor?: () => void;
  onToggleVersionControl?: () => void;
  onToggleDeveloper?: () => void;
  onShowDocProperties?: () => void;
  onShowKeyboardShortcuts?: () => void;
}

export function RibbonToolbar({ onPageSetup, onHeaderFooterEditor, onToggleVersionControl, onToggleDeveloper, onShowDocProperties, onShowKeyboardShortcuts }: RibbonToolbarProps = {}) {
  const {
    activeTab, setActiveTab,
    toggleAI, showAI,
    setShowTemplates,
    selectedTable, selectedImage, selectedSmartArt,
  } = useDocumentStore();

  const baseTabs: { key: TabKey; label: string; contextual?: boolean; color?: string }[] = [
    { key: "home", label: "Home" },
    { key: "insert", label: "Insert" },
    { key: "design", label: "Design" },
    { key: "layout", label: "Layout" },
    { key: "references", label: "References" },
    { key: "review", label: "Review" },
    { key: "view", label: "View" },
    { key: "developer", label: "Developer" },
  ];

  // Add contextual tabs when elements are selected
  const tabs = [...baseTabs];
  if (selectedTable) tabs.push({ key: "table-design", label: "Table Design", contextual: true, color: "#70AD47" });
  if (selectedImage) tabs.push({ key: "image-format", label: "Image Format", contextual: true, color: "#7030A0" });
  if (selectedSmartArt) tabs.push({ key: "smartart-design", label: "SmartArt Design", contextual: true, color: "#ED7D31" });

  return (
    <div className="no-print flex-shrink-0 border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b px-2" style={{ borderColor: "var(--border)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
              activeTab === t.key
                ? t.contextual ? `border-current` : "border-[var(--primary)]"
                : "border-transparent hover:border-[var(--muted-foreground)]"
            }`}
            style={{
              color: activeTab === t.key
                ? (t.contextual ? t.color : "var(--primary)")
                : (t.contextual ? t.color : "var(--muted-foreground)"),
              fontWeight: t.contextual ? 600 : undefined,
            }}
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
        {activeTab === "view" && <ViewTab onToggleVersionControl={onToggleVersionControl} onToggleDeveloper={onToggleDeveloper} onShowDocProperties={onShowDocProperties} onShowKeyboardShortcuts={onShowKeyboardShortcuts} />}
        {activeTab === "table-design" && <TableDesignTab />}
        {activeTab === "image-format" && <ImageFormatTab />}
        {activeTab === "smartart-design" && <ImageFormatTab />}
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
