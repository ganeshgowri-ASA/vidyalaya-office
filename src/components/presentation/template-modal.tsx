"use client";
import { useState } from "react";
import { X, LayoutTemplate, Check } from "lucide-react";
import {
  usePresentationStore,
  PRESENTATION_TEMPLATES,
  PresentationTemplate,
} from "@/store/presentation-store";

const CATEGORIES = ["All", "Business", "Finance", "Academic", "Marketing", "Corporate", "Education"];

export default function TemplateModal() {
  const { toggleTemplates, loadTemplate } = usePresentationStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? PRESENTATION_TEMPLATES
      : PRESENTATION_TEMPLATES.filter((t) => t.category === activeCategory);

  function handleLoad() {
    const tpl = PRESENTATION_TEMPLATES.find((t) => t.id === selected);
    if (tpl) loadTemplate(tpl);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="rounded-xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[85vh]"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} style={{ color: "var(--primary)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Choose a Template
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
              {PRESENTATION_TEMPLATES.length} templates
            </span>
          </div>
          <button
            onClick={toggleTemplates}
            className="p-1.5 rounded hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Category tabs */}
        <div
          className="flex items-center gap-1 px-6 py-3 border-b overflow-x-auto"
          style={{ borderColor: "var(--border)" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors"
              style={
                activeCategory === cat
                  ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                  : { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={selected === tpl.id}
                onSelect={() => setSelected(tpl.id)}
                onLoad={() => loadTemplate(tpl)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {selected
              ? `Selected: ${PRESENTATION_TEMPLATES.find((t) => t.id === selected)?.name}`
              : "Click a template to select it"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={toggleTemplates}
              className="px-4 py-2 rounded text-sm border"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleLoad}
              disabled={!selected}
              className="px-4 py-2 rounded text-sm font-medium disabled:opacity-40"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onLoad,
}: {
  template: PresentationTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onLoad: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      onDoubleClick={onLoad}
      className="rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105"
      style={{
        borderColor: isSelected ? "var(--primary)" : "var(--border)",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative"
        style={{
          height: 90,
          background: template.thumbnail,
        }}
      >
        {/* Mini slides preview */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 p-2">
          {template.slides.slice(0, 3).map((slide, i) => (
            <div
              key={i}
              className="rounded-sm flex-1"
              style={{
                background: slide.background,
                height: "70%",
                minWidth: 0,
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>

        {/* Selected check */}
        {isSelected && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Check size={12} className="text-white" />
          </div>
        )}

        {/* Slide count badge */}
        <div
          className="absolute bottom-1.5 left-2 text-xs px-1.5 rounded"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "white",
            fontSize: 10,
          }}
        >
          {template.slides.length} slides
        </div>
      </div>

      {/* Info */}
      <div
        className="px-2 py-2"
        style={{ backgroundColor: "var(--card)" }}
      >
        <p
          className="text-xs font-semibold truncate"
          style={{ color: "var(--foreground)" }}
        >
          {template.name}
        </p>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          {template.category}
        </p>
      </div>
    </div>
  );
}
