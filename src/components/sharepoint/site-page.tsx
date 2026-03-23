"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useSharePointStore, type SPSection } from "@/store/sharepoint-store";
import { RenderWebPart } from "./web-parts";

// ── Section Renderer ──────────────────────────────────
function PageSection({ section }: { section: SPSection }) {
  const shadingStyles: Record<string, string> = {
    none: "transparent",
    neutral: "var(--sidebar)",
    soft: "rgba(255,255,255,0.02)",
    strong: "rgba(255,255,255,0.05)",
  };

  const bgColor = shadingStyles[section.backgroundShading || "none"];

  return (
    <div className="py-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className={cn(
          "grid gap-5",
          section.columns === 1 && "grid-cols-1",
          section.columns === 2 && "grid-cols-1 md:grid-cols-2",
          section.columns === 3 && "grid-cols-1 md:grid-cols-3",
        )}>
          {section.webParts.map((wp) => (
            <div key={wp.id} className={wp.columnSpan ? `md:col-span-${wp.columnSpan}` : ""}>
              <RenderWebPart webPart={wp} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Site Page Renderer ────────────────────────────────
export function SitePage() {
  const { activePage } = useSharePointStore();

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }}>No page selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page header */}
      {activePage.bannerImageUrl !== undefined && (
        <div className="h-16 flex items-end px-6 pb-3" style={{ backgroundColor: "var(--sidebar)" }}>
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{activePage.title}</h1>
            {activePage.description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>{activePage.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="divide-y" style={{ borderColor: "transparent" }}>
        {activePage.sections.map((section) => (
          <PageSection key={section.id} section={section} />
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 py-6 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--foreground)", opacity: 0.3 }}>
          <span>Published by {activePage.author}</span>
          <span>·</span>
          <span>Last modified {new Date(activePage.modifiedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

// ── Pages List View ───────────────────────────────────
export function PagesListView() {
  const { currentSite, setActivePage, setActiveView } = useSharePointStore();

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Site Pages</h2>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md text-white" style={{ backgroundColor: "var(--primary)" }}>
          New Page
        </button>
      </div>

      <div className="space-y-2">
        {currentSite.pages.map((page) => (
          <div
            key={page.id}
            onClick={() => { setActivePage(page); setActiveView("home"); }}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-white/[0.02] cursor-pointer transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{page.title}</h4>
                {page.isHomePage && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Home Page</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                {page.sections.length} sections · {page.sections.reduce((acc, s) => acc + s.webParts.length, 0)} web parts · by {page.author}
              </p>
            </div>
            <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.3 }}>
              {new Date(page.modifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── News Hub View ─────────────────────────────────────
export function NewsHubView() {
  const { news } = useSharePointStore();
  const categoryColors: Record<string, string> = {
    Company: "#4F46E5", HR: "#059669", Product: "#D97706", Engineering: "#DC2626", Community: "#7C3AED", Security: "#0891B2",
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>News</h2>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md text-white" style={{ backgroundColor: "var(--primary)" }}>
          Create News Post
        </button>
      </div>

      {/* Featured */}
      {news[0] && (
        <div className="rounded-lg border overflow-hidden mb-6 cursor-pointer group" style={{ borderColor: "var(--border)" }}>
          <div className="h-48 flex items-center justify-center" style={{ backgroundColor: (categoryColors[news[0].category] || "#666") + "15" }}>
            <div className="text-center px-6">
              <span className="text-[10px] font-semibold px-2 py-1 rounded text-white" style={{ backgroundColor: categoryColors[news[0].category] }}>
                {news[0].category}
              </span>
              <h3 className="text-xl font-bold mt-3 group-hover:underline" style={{ color: "var(--foreground)" }}>{news[0].title}</h3>
              <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>{news[0].description}</p>
              <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.4 }}>By {news[0].author} · {new Date(news[0].publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.slice(1).map((n) => (
          <div key={n.id} className="rounded-lg border overflow-hidden cursor-pointer group hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--border)" }}>
            <div className="h-28 flex items-center justify-center" style={{ backgroundColor: (categoryColors[n.category] || "#666") + "10" }}>
              <span className="text-3xl" style={{ color: categoryColors[n.category] || "#666", opacity: 0.3 }}>
                {n.category.charAt(0)}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: (categoryColors[n.category] || "#666") + "20", color: categoryColors[n.category] || "#666" }}>
                {n.category}
              </span>
              <h4 className="text-sm font-medium mt-2 group-hover:underline" style={{ color: "var(--foreground)" }}>{n.title}</h4>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--foreground)", opacity: 0.5 }}>{n.description}</p>
              <p className="text-[10px] mt-2" style={{ color: "var(--foreground)", opacity: 0.3 }}>{n.author} · {new Date(n.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
