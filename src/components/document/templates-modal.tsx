"use client";

import React, { useState, useMemo } from "react";
import { X, Variable, Search, LayoutGrid, List } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { useTemplateVariablesStore } from "@/store/template-variables-store";
import { TEMPLATES } from "./templates-data";
import { setEditorContent } from "./editor-area";
import { hasVariables } from "@/lib/template-variables";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "business", label: "Business" },
  { key: "academic", label: "Academic" },
  { key: "engineering", label: "Engineering" },
  { key: "legal", label: "Legal" },
  { key: "creative", label: "Creative" },
  { key: "general", label: "General" },
];

export function TemplatesModal() {
  const { showTemplates, setShowTemplates } = useDocumentStore();
  const openVariableModal = useTemplateVariablesStore((s) => s.openModal);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      if (selectedCategory !== "all" && tpl.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return tpl.name.toLowerCase().includes(q) || tpl.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  if (!showTemplates) return null;

  const handleSelect = (name: string, content: string) => {
    if (hasVariables(content)) {
      openVariableModal(name, content, (processedContent: string) => {
        setEditorContent(processedContent);
        setShowTemplates(false);
      });
    } else {
      setEditorContent(content);
      setShowTemplates(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative mx-4 w-full max-w-4xl rounded-xl border shadow-2xl flex flex-col"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Document Templates
          </h2>
          <button
            onClick={() => setShowTemplates(false)}
            className="rounded p-1 hover:bg-[var(--muted)]"
          >
            <X size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-md border pl-8 pr-3 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === cat.key ? "var(--primary)" : "transparent",
                  color: selectedCategory === cat.key ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-0.5 border-l pl-2" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="p-1 rounded"
              style={{ backgroundColor: viewMode === "grid" ? "var(--muted)" : "transparent" }}
            >
              <LayoutGrid size={14} style={{ color: viewMode === "grid" ? "var(--foreground)" : "var(--muted-foreground)" }} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1 rounded"
              style={{ backgroundColor: viewMode === "list" ? "var(--muted)" : "transparent" }}
            >
              <List size={14} style={{ color: viewMode === "list" ? "var(--foreground)" : "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="px-6 py-1.5 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          {filtered.length} template{filtered.length !== 1 ? "s" : ""} found
        </div>

        {/* Grid/List */}
        <div className={`flex-1 overflow-y-auto p-6 ${viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}`}>
          {filtered.map((tpl) => {
            const templateHasVars = hasVariables(tpl.content);

            if (viewMode === "list") {
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelect(tpl.name, tpl.content)}
                  className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-md hover:border-[var(--primary)]"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
                >
                  <span className="text-xl flex-shrink-0">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{tpl.name}</h3>
                    <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>{tpl.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tpl.category && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                        {tpl.category}
                      </span>
                    )}
                    {templateHasVars && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
                        <Variable size={9} /> Vars
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl.name, tpl.content)}
                className="group rounded-lg border p-4 text-left transition-all hover:shadow-md hover:border-[var(--primary)]"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{tpl.icon}</span>
                  <div className="flex items-center gap-1">
                    {tpl.category && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                        {tpl.category}
                      </span>
                    )}
                    {templateHasVars && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
                        <Variable size={10} /> Variables
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-[var(--primary)]" style={{ color: "var(--foreground)" }}>
                  {tpl.name}
                </h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {tpl.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
