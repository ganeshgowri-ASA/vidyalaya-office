"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  FileText,
  Clock,
  SortAsc,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit3,
  Globe,
} from "lucide-react";
import { usePagesStore, type PageStatus, type TemplateType } from "@/store/pages-store";
import { cn } from "@/lib/utils";
import { TemplateChooser } from "./template-chooser";
import { useRouter } from "next/navigation";

const statusColors: Record<PageStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "rgba(250,204,21,0.15)", text: "rgb(250,204,21)", label: "Draft" },
  in_review: { bg: "rgba(96,165,250,0.15)", text: "rgb(96,165,250)", label: "In Review" },
  published: { bg: "rgba(74,222,128,0.15)", text: "rgb(74,222,128)", label: "Published" },
};

const templateLabels: Record<TemplateType, string> = {
  "team-site": "Team Site",
  "communication-site": "Communication Site",
  "project-hub": "Project Hub",
  "knowledge-base": "Knowledge Base",
  wiki: "Wiki",
  blank: "Blank Page",
};

export function PagesHub() {
  const router = useRouter();
  const {
    pages,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterTemplate,
    setFilterTemplate,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    showTemplateChooser,
    setShowTemplateChooser,
    deletePage,
  } = usePagesStore();

  const [contextMenu, setContextMenu] = useState<string | null>(null);

  const filtered = pages
    .filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterTemplate !== "all" && p.template !== filterTemplate) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "modified") return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
      if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
      return a.status.localeCompare(b.status);
    });

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <Globe size={24} style={{ color: "var(--primary)" }} />
          <h1 className="text-xl font-bold">Pages</h1>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--sidebar-accent)", color: "var(--primary-foreground)" }}>
            {pages.length}
          </span>
        </div>
        <button
          onClick={() => setShowTemplateChooser(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Plus size={16} />
          Create New Page
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="opacity-50" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PageStatus | "all")}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="published">Published</option>
          </select>

          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value as TemplateType | "all")}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="all">All Templates</option>
            <option value="team-site">Team Site</option>
            <option value="communication-site">Communication Site</option>
            <option value="project-hub">Project Hub</option>
            <option value="knowledge-base">Knowledge Base</option>
            <option value="wiki">Wiki</option>
            <option value="blank">Blank</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc size={14} className="opacity-50" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "modified" | "alphabetical" | "status")}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="modified">Recently Modified</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setViewMode("grid")}
            className={cn("rounded-md p-1.5 transition-colors", viewMode === "grid" ? "opacity-100" : "opacity-40 hover:opacity-70")}
            style={viewMode === "grid" ? { backgroundColor: "var(--sidebar-accent)" } : undefined}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("rounded-md p-1.5 transition-colors", viewMode === "list" ? "opacity-100" : "opacity-40 hover:opacity-70")}
            style={viewMode === "list" ? { backgroundColor: "var(--sidebar-accent)" } : undefined}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <FileText size={48} className="mb-4" />
            <p className="text-lg font-medium">No pages found</p>
            <p className="text-sm">Create a new page or adjust your filters</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((page) => (
              <div
                key={page.id}
                className="group relative cursor-pointer rounded-xl border transition-all hover:shadow-lg"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
                onClick={() => router.push(`/pages/editor?id=${page.id}`)}
              >
                {/* Thumbnail */}
                <div
                  className="flex h-36 items-center justify-center rounded-t-xl"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <FileText size={32} />
                    <span className="text-xs">{templateLabels[page.template]}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{page.title}</h3>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenu(contextMenu === page.id ? null : page.id);
                        }}
                        className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {contextMenu === page.id && (
                        <div
                          className="absolute right-0 top-8 z-10 w-40 rounded-lg border py-1 shadow-xl"
                          style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)" }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/pages/editor?id=${page.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:opacity-70"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContextMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:opacity-70"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(page.id);
                              setContextMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:opacity-70"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs opacity-60">
                    <Clock size={12} />
                    <span>{formatDate(page.modifiedAt)}</span>
                    <span>·</span>
                    <span>{page.author}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: statusColors[page.status].bg, color: statusColors[page.status].text }}
                    >
                      {statusColors[page.status].label}
                    </span>
                    <span className="text-[10px] opacity-40">{templateLabels[page.template]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider opacity-50" style={{ borderColor: "var(--border)" }}>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Modified</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((page) => (
                  <tr
                    key={page.id}
                    className="cursor-pointer border-b transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => router.push(`/pages/editor?id=${page.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="opacity-50" />
                        <span className="font-medium text-sm">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm opacity-60">{templateLabels[page.template]}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: statusColors[page.status].bg, color: statusColors[page.status].text }}
                      >
                        {statusColors[page.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm opacity-60">{page.author}</td>
                    <td className="px-4 py-3 text-sm opacity-60">{formatDate(page.modifiedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        className="rounded p-1 opacity-30 hover:opacity-70 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showTemplateChooser && <TemplateChooser />}
    </div>
  );
}
