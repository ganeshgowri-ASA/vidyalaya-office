"use client";

import { useState } from "react";
import { Search, FileText, Table2, Presentation, GitBranch, BarChart3 } from "lucide-react";
import WordTemplates from "./components/WordTemplates";
import ExcelTemplates from "./components/ExcelTemplates";
import PptTemplates from "./components/PptTemplates";
import FlowchartTemplates from "./components/FlowchartTemplates";
import InfographicTemplates from "./components/InfographicTemplates";

const tabs = [
  { key: "all", label: "All Templates", icon: null },
  { key: "word", label: "Word", icon: FileText },
  { key: "excel", label: "Excel", icon: Table2 },
  { key: "ppt", label: "PPT", icon: Presentation },
  { key: "flowchart", label: "Flowcharts", icon: GitBranch },
  { key: "infographic", label: "Infographics", icon: BarChart3 },
] as const;

type Tab = (typeof tabs)[number]["key"];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Templates
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Start from professionally designed templates. Click any template to open it in the editor.
        </p>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs bg-transparent"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                activeTab === t.key ? "border-[var(--primary)]" : "border-[var(--border)]"
              }`}
              style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {t.icon && <t.icon size={12} />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Sections */}
      <div className="space-y-8">
        {(activeTab === "all" || activeTab === "word") && <WordTemplates />}
        {(activeTab === "all" || activeTab === "excel") && <ExcelTemplates />}
        {(activeTab === "all" || activeTab === "ppt") && <PptTemplates />}
        {(activeTab === "all" || activeTab === "flowchart") && <FlowchartTemplates />}
        {(activeTab === "all" || activeTab === "infographic") && <InfographicTemplates />}
      </div>
    </div>
  );
}
