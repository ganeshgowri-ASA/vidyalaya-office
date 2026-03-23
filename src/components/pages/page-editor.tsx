"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Clock,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Settings,
  Columns2,
  Columns3,
  LayoutTemplate,
  Image,
} from "lucide-react";
import { usePagesStore, type SectionLayout, type WebPartType } from "@/store/pages-store";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { WebPartRenderer } from "./web-part-renderer";
import { VersionHistory } from "./version-history";

const webPartOptions: { type: WebPartType; label: string }[] = [
  { type: "text", label: "Text Block" },
  { type: "quick-links", label: "Quick Links" },
  { type: "people", label: "People / Team" },
  { type: "news-feed", label: "News Feed" },
  { type: "file-list", label: "File List" },
  { type: "image-gallery", label: "Image Gallery" },
  { type: "document-embed", label: "Document Embed" },
  { type: "spreadsheet-embed", label: "Spreadsheet Embed" },
  { type: "presentation-embed", label: "Presentation Embed" },
  { type: "chart", label: "Chart Widget" },
  { type: "divider", label: "Divider" },
];

function PageEditorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = searchParams.get("id");
  const {
    pages,
    updatePage,
    publishPage,
    addSection,
    removeSection,
    addWebPart,
    removeWebPart,
    updateWebPart,
    moveSection,
  } = usePagesStore();

  const page = pages.find((p) => p.id === pageId);
  const [showAddWebPart, setShowAddWebPart] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <div className="text-center">
          <p className="text-lg font-medium opacity-50">Page not found</p>
          <button onClick={() => router.push("/pages")} className="mt-4 text-sm underline opacity-70 hover:opacity-100">
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "rgb(250,204,21)",
    in_review: "rgb(96,165,250)",
    published: "rgb(74,222,128)",
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Editor toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/pages")} className="rounded-lg p-2 transition-colors hover:opacity-70" style={{ backgroundColor: "var(--sidebar)" }}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColors[page.status] || statusColors.draft }}
            />
            <span className="text-xs font-medium uppercase opacity-50">
              {page.status === "in_review" ? "In Review" : page.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <Clock size={14} />
            History
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <Save size={14} />
            Save
          </button>
          {page.status !== "published" && (
            <button
              onClick={() => publishPage(page.id)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Send size={14} />
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Cover image area */}
          <div
            className="group relative mb-6 flex h-48 items-center justify-center rounded-xl border-2 border-dashed transition-colors"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
          >
            {page.coverImage ? (
              <div className="h-full w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${page.coverImage})` }} />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
                <Image size={32} />
                <span className="text-sm">Add cover image</span>
              </div>
            )}
          </div>

          {/* Title */}
          {editingTitle ? (
            <input
              type="text"
              value={page.title}
              onChange={(e) => updatePage(page.id, { title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="mb-2 w-full border-none bg-transparent text-3xl font-bold outline-none"
              style={{ color: "var(--foreground)" }}
              autoFocus
            />
          ) : (
            <h1
              className="mb-2 cursor-pointer text-3xl font-bold transition-opacity hover:opacity-80"
              onClick={() => setEditingTitle(true)}
            >
              {page.title}
            </h1>
          )}

          <div className="mb-8 flex items-center gap-3 text-xs opacity-50">
            <span>{page.author}</span>
            <span>·</span>
            <span>
              {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(page.modifiedAt))}
            </span>
            <span>·</span>
            <span>{page.template.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
          </div>

          {/* Sections */}
          {page.sections.map((section, sIdx) => (
            <div key={section.id} className="group/section relative mb-6">
              {/* Section controls */}
              <div className="absolute -left-10 top-0 flex flex-col gap-1 opacity-0 transition-opacity group-hover/section:opacity-100">
                <button
                  onClick={() => moveSection(page.id, section.id, "up")}
                  className="rounded p-1 hover:opacity-70"
                  style={{ backgroundColor: "var(--sidebar)" }}
                  disabled={sIdx === 0}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveSection(page.id, section.id, "down")}
                  className="rounded p-1 hover:opacity-70"
                  style={{ backgroundColor: "var(--sidebar)" }}
                  disabled={sIdx === page.sections.length - 1}
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => removeSection(page.id, section.id)}
                  className="rounded p-1 text-red-400 hover:opacity-70"
                  style={{ backgroundColor: "var(--sidebar)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Section layout indicator */}
              <div className="mb-2 flex items-center gap-2 opacity-0 transition-opacity group-hover/section:opacity-50">
                <LayoutTemplate size={12} />
                <span className="text-[10px] uppercase tracking-wider">
                  {section.layout === "full" ? "Full Width" : section.layout === "two-column" ? "2 Columns" : "3 Columns"}
                </span>
              </div>

              {/* Web parts grid */}
              <div
                className={cn(
                  "grid gap-4",
                  section.layout === "full" && "grid-cols-1",
                  section.layout === "two-column" && "grid-cols-1 md:grid-cols-2",
                  section.layout === "three-column" && "grid-cols-1 md:grid-cols-3"
                )}
              >
                {section.webParts.map((wp) => (
                  <div key={wp.id} className="group/wp relative">
                    {/* Web part hover toolbar */}
                    <div
                      className="absolute -top-8 right-0 z-10 flex items-center gap-1 rounded-lg border px-1 py-0.5 opacity-0 shadow-lg transition-opacity group-hover/wp:opacity-100"
                      style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)" }}
                    >
                      <button className="rounded p-1 hover:opacity-70">
                        <Settings size={12} />
                      </button>
                      <button
                        onClick={() => removeWebPart(page.id, section.id, wp.id)}
                        className="rounded p-1 text-red-400 hover:opacity-70"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <WebPartRenderer
                      webPart={wp}
                      onUpdate={(updates) => updateWebPart(page.id, section.id, wp.id, updates)}
                    />
                  </div>
                ))}
              </div>

              {/* Add web part button */}
              <div className="relative mt-3">
                <button
                  onClick={() => setShowAddWebPart(showAddWebPart === section.id ? null : section.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm opacity-30 transition-opacity hover:opacity-60"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Plus size={16} />
                  Add web part
                </button>

                {showAddWebPart === section.id && (
                  <div
                    className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl border py-2 shadow-xl"
                    style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)" }}
                  >
                    {webPartOptions.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => {
                          addWebPart(page.id, section.id, opt.type);
                          setShowAddWebPart(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-70"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add section */}
          <div className="relative mt-8">
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm opacity-30 transition-opacity hover:opacity-60"
              style={{ borderColor: "var(--border)" }}
            >
              <Plus size={18} />
              Add section
            </button>

            {showAddSection && (
              <div
                className="absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 gap-3 rounded-xl border p-4 shadow-xl"
                style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)" }}
              >
                {([
                  { layout: "full" as SectionLayout, label: "Full Width", icon: LayoutTemplate },
                  { layout: "two-column" as SectionLayout, label: "2 Columns", icon: Columns2 },
                  { layout: "three-column" as SectionLayout, label: "3 Columns", icon: Columns3 },
                ]).map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.layout}
                      onClick={() => {
                        addSection(page.id, opt.layout);
                        setShowAddSection(false);
                      }}
                      className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:opacity-70"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <Icon size={24} />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showVersionHistory && page && (
        <VersionHistory page={page} onClose={() => setShowVersionHistory(false)} />
      )}
    </div>
  );
}

export function PageEditor() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
          Loading...
        </div>
      }
    >
      <PageEditorInner />
    </Suspense>
  );
}
