"use client";

import { useState } from "react";
import { X, Search, FileText } from "lucide-react";
import { documentTemplates } from "../templates";

interface TemplateModalProps {
  onSelect: (content: string) => void;
  onClose: () => void;
}

const CATEGORIES = ["All", "Academic", "Business", "Technical", "Personal"];

export default function TemplateModal({ onSelect, onClose }: TemplateModalProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = documentTemplates.filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex h-[85vh] w-full max-w-5xl flex-col rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Document Templates
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Choose a template to get started quickly
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className="flex w-48 flex-col border-r p-3 gap-1"
            style={{ borderColor: "var(--border)" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-md px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                style={
                  activeCategory === cat
                    ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                    : { color: "var(--foreground)" }
                }
              >
                {cat}
                <span
                  className="ml-2 text-xs"
                  style={{ color: activeCategory === cat ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
                >
                  (
                  {cat === "All"
                    ? documentTemplates.length
                    : documentTemplates.filter((t) => t.category === cat).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search */}
            <div className="border-b p-4" style={{ borderColor: "var(--border)" }}>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border py-2 pl-8 pr-4 text-sm outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <FileText size={40} style={{ color: "var(--muted-foreground)" }} />
                  <p style={{ color: "var(--muted-foreground)" }}>No templates found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((template) => (
                    <div
                      key={template.id}
                      className="group flex flex-col rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                      onClick={() => {
                        onSelect(template.content);
                        onClose();
                      }}
                    >
                      {/* Category badge */}
                      <span
                        className="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium w-fit"
                        style={{
                          backgroundColor: "var(--secondary)",
                          color: "var(--secondary-foreground)",
                        }}
                      >
                        {template.category}
                      </span>

                      {/* Template name */}
                      <h3
                        className="mb-1 font-semibold text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        {template.name}
                      </h3>

                      {/* Description */}
                      <p
                        className="mb-3 flex-1 text-xs leading-relaxed"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {template.description}
                      </p>

                      {/* Use button */}
                      <button
                        className="w-full rounded-md py-1.5 text-xs font-medium transition-colors hover:opacity-90"
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(template.content);
                          onClose();
                        }}
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
