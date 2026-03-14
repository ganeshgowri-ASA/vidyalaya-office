"use client";

import React from "react";
import { X } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { TEMPLATES } from "./templates-data";
import { setEditorContent } from "./editor-area";

export function TemplatesModal() {
  const { showTemplates, setShowTemplates } = useDocumentStore();

  if (!showTemplates) return null;

  const handleSelect = (content: string) => {
    setEditorContent(content);
    setShowTemplates(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative mx-4 w-full max-w-3xl rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
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

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelect(tpl.content)}
              className="group rounded-lg border p-4 text-left transition-all hover:shadow-md hover:border-[var(--primary)]"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <div className="mb-2 text-2xl">{tpl.icon}</div>
              <h3
                className="text-sm font-semibold mb-1 group-hover:text-[var(--primary)]"
                style={{ color: "var(--foreground)" }}
              >
                {tpl.name}
              </h3>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {tpl.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
