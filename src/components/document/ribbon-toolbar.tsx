"use client";

import React from "react";
import {
  Sparkles, LayoutTemplate, Terminal, Code,
  Shield, FileCode, Search, Globe, Key, Link,
  Lock, UserX, FileScan, Settings2, PlugZap,
  Type, FileType, ImageIcon, List, Calendar, CheckSquare,
  AlignLeft, ToggleLeft, ChevronDown, Paintbrush, SlidersHorizontal,
  FileJson, Layers, Map, Play, Mic, ShieldAlert,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator, RibbonGroup } from "./toolbar-button";
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

      {/* Toolbar content — taller min-height to accommodate stacked groups */}
      <div className="flex flex-wrap items-start gap-0.5 px-2 py-1 min-h-[68px]">
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
            <RibbonGroup label="Code">
              <ToolbarButton icon={<FileCode size={15} />} label="Visual Basic" title="VBA Editor" size="lg" onClick={() => onToggleDeveloper?.()} />
              <div className="flex flex-col gap-0.5">
                <ToolbarButton icon={<Play size={14} />} label="Macros" title="View and run macros" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<Mic size={14} />} label="Record Macro" title="Record a new macro" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<ShieldAlert size={14} />} label="Macro Security" title="Macro security settings" size="sm" onClick={() => onToggleDeveloper?.()} />
              </div>
            </RibbonGroup>
            <RibbonGroup label="Add-ins">
              <ToolbarButton icon={<PlugZap size={15} />} label="Add-ins" title="Add-ins Manager" size="lg" onClick={() => onToggleDeveloper?.()} />
              <ToolbarButton icon={<Settings2 size={15} />} label="COM Add-ins" title="COM Add-ins" size="md" onClick={() => onToggleDeveloper?.()} />
            </RibbonGroup>
            <RibbonGroup label="Controls">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <ToolbarButton icon={<Type size={13} />} title="Rich Text Content Control" onClick={() => onToggleDeveloper?.()} />
                  <ToolbarButton icon={<FileType size={13} />} title="Plain Text Content Control" onClick={() => onToggleDeveloper?.()} />
                  <ToolbarButton icon={<ImageIcon size={13} />} title="Picture Content Control" onClick={() => onToggleDeveloper?.()} />
                </div>
                <div className="flex items-center gap-0.5">
                  <ToolbarButton icon={<ChevronDown size={13} />} title="Combo Box" onClick={() => onToggleDeveloper?.()} />
                  <ToolbarButton icon={<Calendar size={13} />} title="Date Picker" onClick={() => onToggleDeveloper?.()} />
                  <ToolbarButton icon={<CheckSquare size={13} />} title="Check Box" onClick={() => onToggleDeveloper?.()} />
                </div>
              </div>
              <ToolbarSeparator />
              <div className="flex flex-col gap-0.5">
                <ToolbarButton icon={<AlignLeft size={13} />} label="Legacy Forms" title="Legacy Form Fields" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<Paintbrush size={13} />} label="Design Mode" title="Toggle Design Mode" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<SlidersHorizontal size={13} />} label="Properties" title="Properties" size="sm" onClick={() => onToggleDeveloper?.()} />
              </div>
            </RibbonGroup>
            <RibbonGroup label="XML">
              <div className="flex flex-col gap-0.5">
                <ToolbarButton icon={<FileJson size={14} />} label="Schema" title="XML Schema" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<Layers size={14} />} label="Expansion Packs" title="XML Expansion Packs" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<Map size={14} />} label="XML Mapping" title="XML Mapping Pane" size="sm" onClick={() => onToggleDeveloper?.()} />
              </div>
            </RibbonGroup>
            <RibbonGroup label="Protect">
              <div className="flex flex-col gap-0.5">
                <ToolbarButton icon={<Lock size={14} />} label="Restrict Editing" title="Restrict document editing" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<UserX size={14} />} label="Block Authors" title="Block Authors" size="sm" onClick={() => onToggleDeveloper?.()} />
              </div>
            </RibbonGroup>
            <RibbonGroup label="Tools">
              <ToolbarButton icon={<FileScan size={15} />} label="Doc Inspector" title="Document Inspector" size="lg" onClick={() => onToggleDeveloper?.()} />
              <div className="flex flex-col gap-0.5">
                <ToolbarButton icon={<Globe size={14} />} label="API Config" title="API Configuration" size="sm" onClick={() => onToggleDeveloper?.()} />
                <ToolbarButton icon={<Terminal size={14} />} label="Dev Console" title="Developer Console" size="sm" onClick={() => onToggleDeveloper?.()} />
              </div>
            </RibbonGroup>
          </>
        )}
      </div>
    </div>
  );
}
