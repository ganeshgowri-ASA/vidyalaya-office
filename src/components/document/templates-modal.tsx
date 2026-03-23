"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { X, Variable, Search, Star, ChevronRight } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { useTemplateVariablesStore } from "@/store/template-variables-store";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "./templates-data";
import type { TemplateCategory } from "./templates-data";
import { setEditorContent } from "./editor-area";
import { hasVariables } from "@/lib/template-variables";

function TemplatePreview({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  return (
    <div
      className="relative w-full h-[120px] overflow-hidden rounded border mb-3"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "#fff",
      }}
    >
      <div
        ref={ref}
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: "scale(0.18)",
          transformOrigin: "top left",
          width: "556%",
          fontSize: "12px",
          lineHeight: "1.4",
          padding: "12px",
          color: "#1a1a1a",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 60%, rgba(255,255,255,0.95) 100%)",
        }}
      />
    </div>
  );
}

export function TemplatesModal() {
  const { showTemplates, setShowTemplates } = useDocumentStore();
  const openVariableModal = useTemplateVariablesStore((s) => s.openModal);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    let results = TEMPLATES;

    if (activeCategory !== "All") {
      results = results.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Featured first
    return [...results].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [activeCategory, searchQuery]);

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

  const handleClose = () => {
    setShowTemplates(false);
    setActiveCategory("All");
    setSearchQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative mx-4 w-full max-w-5xl rounded-xl border shadow-2xl flex flex-col"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Document Templates
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Choose a template to start with pre-filled professional content
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1 hover:bg-[var(--muted)]"
          >
            <X size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
          >
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search templates by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-0.5 rounded hover:bg-[var(--muted)]">
                <X size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Category sidebar */}
          <div
            className="w-[200px] flex-shrink-0 border-r overflow-y-auto p-2"
            style={{ borderColor: "var(--border)" }}
          >
            {TEMPLATE_CATEGORIES.map((cat) => {
              const count =
                cat.key === "All"
                  ? TEMPLATES.length
                  : TEMPLATES.filter((t) => t.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] transition-colors mb-0.5 ${
                    activeCategory === cat.key ? "font-semibold" : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeCategory === cat.key ? "var(--primary)" : "transparent",
                    color:
                      activeCategory === cat.key
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                  }}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="flex-1">{cat.label}</span>
                  <span
                    className="text-[10px] rounded-full px-1.5 py-0.5"
                    style={{
                      backgroundColor:
                        activeCategory === cat.key
                          ? "rgba(255,255,255,0.2)"
                          : "var(--muted)",
                      color:
                        activeCategory === cat.key
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Category header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {activeCategory === "All" ? "All Templates" : activeCategory}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Search size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                <p className="mt-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No templates found matching your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((tpl) => {
                  const templateHasVars = hasVariables(tpl.content);
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelect(tpl.name, tpl.content)}
                      className="group rounded-lg border text-left transition-all hover:shadow-lg hover:border-[var(--primary)] relative"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--background)",
                      }}
                    >
                      {/* Featured badge */}
                      {tpl.featured && (
                        <div
                          className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: "#f59e0b",
                            color: "#fff",
                          }}
                        >
                          <Star size={10} fill="currentColor" />
                          Featured
                        </div>
                      )}

                      {/* Preview thumbnail */}
                      <TemplatePreview html={tpl.content} />

                      {/* Info */}
                      <div className="px-3 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{tpl.icon}</span>
                          <h4
                            className="text-[13px] font-semibold group-hover:text-[var(--primary)] truncate flex-1"
                            style={{ color: "var(--foreground)" }}
                          >
                            {tpl.name}
                          </h4>
                        </div>

                        <p
                          className="text-[11px] leading-relaxed line-clamp-2"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {tpl.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] rounded-full px-2 py-0.5"
                            style={{
                              backgroundColor: "var(--muted)",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            {tpl.category}
                          </span>
                          {templateHasVars && (
                            <span
                              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "var(--primary-foreground)",
                              }}
                            >
                              <Variable size={10} />
                              Variables
                            </span>
                          )}
                          <span className="flex-1" />
                          <span
                            className="flex items-center gap-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "var(--primary)" }}
                          >
                            Use template
                            <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
