"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Table2,
  Presentation,
  FileDown,
  Star,
  Clock,
  Search,
  HardDrive,
  Activity,
  Pin,
  BarChart3,
  CheckCircle,
  MessageSquare,
  Edit3,
  Upload,
  Trash2,
  Grid3X3,
  List,
  MoreHorizontal,
  Copy,
  Share2,
  Pencil,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { FileType } from "@/types";
import { ImportDialog } from "@/components/shared/import-dialog";
import { ExportManager } from "@/lib/export-manager";
import type { DocumentType } from "@/lib/export-manager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";

const quickCreate: { label: string; type: FileType; href: string; icon: React.ElementType }[] = [
  { label: "New Document", type: "document", href: "/document", icon: FileText },
  { label: "New Spreadsheet", type: "spreadsheet", href: "/spreadsheet", icon: Table2 },
  { label: "New Presentation", type: "presentation", href: "/presentation", icon: Presentation },
  { label: "New PDF", type: "pdf", href: "/pdf", icon: FileDown },
];

const typeIcons: Record<FileType, React.ElementType> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
};

const typeColors: Record<FileType, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
  pdf: "#dc2626",
};

const typeExtensions: Record<FileType, string> = {
  document: ".docx",
  spreadsheet: ".xlsx",
  presentation: ".pptx",
  pdf: ".pdf",
};

const activityIcons: Record<string, React.ElementType> = {
  edit: Edit3,
  approve: CheckCircle,
  comment: MessageSquare,
  share: Share2,
  upload: Upload,
  delete: Trash2,
  create: FileText,
};

const activityColors: Record<string, string> = {
  edit: "var(--primary)",
  approve: "#16a34a",
  comment: "#f59e0b",
  share: "#8b5cf6",
  upload: "#3b82f6",
  delete: "#dc2626",
  create: "#16a34a",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Mock weekly document creation data */
const weeklyData = [
  { week: "Week 1", documents: 8, spreadsheets: 3, presentations: 2 },
  { week: "Week 2", documents: 12, spreadsheets: 5, presentations: 4 },
  { week: "Week 3", documents: 6, spreadsheets: 7, presentations: 1 },
  { week: "Week 4", documents: 15, spreadsheets: 4, presentations: 6 },
  { week: "Week 5", documents: 9, spreadsheets: 6, presentations: 3 },
  { week: "Week 6", documents: 11, spreadsheets: 2, presentations: 5 },
];

/* Mock template usage data */
const templateUsage = [
  { name: "Business Report", value: 32, color: "#3b82f6" },
  { name: "Invoice", value: 24, color: "#16a34a" },
  { name: "Presentation Deck", value: 18, color: "#f59e0b" },
  { name: "Meeting Notes", value: 14, color: "#8b5cf6" },
  { name: "Other", value: 12, color: "#6b7280" },
];

/* Storage mock */
const storageUsed = 6.75;
const storageTotal = 15;
const storagePercent = Math.round((storageUsed / storageTotal) * 100);

function FileContextMenu({
  fileId,
  onClose,
  position,
}: {
  fileId: string;
  onClose: () => void;
  position: { x: number; y: number };
}) {
  const { renameFile, duplicateFile, deleteFile, recentFiles } = useAppStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const file = recentFiles.find((f) => f.id === fileId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  if (!file) return null;

  if (renaming) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 w-64 rounded-lg border p-3 shadow-xl"
        style={{ top: position.y, left: position.x, backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Rename file</p>
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newName.trim()) {
              renameFile(fileId, newName.trim());
              onClose();
            }
            if (e.key === "Escape") onClose();
          }}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none"
          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => { if (newName.trim()) { renameFile(fileId, newName.trim()); onClose(); } }}
            className="flex-1 rounded px-2 py-1 text-xs font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Save
          </button>
          <button onClick={onClose} className="flex-1 rounded px-2 py-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const actions = [
    { label: "Open", icon: ExternalLink, action: () => onClose() },
    { label: "Rename", icon: Pencil, action: () => { setNewName(file.name); setRenaming(true); } },
    { label: "Duplicate", icon: Copy, action: () => { duplicateFile(fileId); onClose(); } },
    { label: "Share", icon: Share2, action: () => onClose() },
    { label: "Delete", icon: Trash2, action: () => { deleteFile(fileId); onClose(); }, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 rounded-lg border py-1 shadow-xl"
      style={{ top: position.y, left: position.x, backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {actions.map((a, i) => (
        <button
          key={a.label}
          onClick={a.action}
          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:opacity-80 ${i === actions.length - 1 ? "border-t" : ""}`}
          style={{
            color: (a as { danger?: boolean }).danger ? "#dc2626" : "var(--card-foreground)",
            borderColor: "var(--border)",
          }}
        >
          <a.icon size={14} />
          {a.label}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { recentFiles, toggleStar, activities, dashboardView, setDashboardView, onboardingComplete, setOnboardingComplete } = useAppStore();
  const starredFiles = recentFiles.filter((f) => f.starred);
  const [dashSearch, setDashSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{ fileId: string; x: number; y: number } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  const handleImport = async (file: File, type: DocumentType) => {
    // For PDF files, navigate to PDF page
    if (type === "pdf") {
      router.push("/pdf");
      return;
    }
    // For other types, navigate to the appropriate editor
    const routes: Record<string, string> = {
      document: "/document",
      spreadsheet: "/spreadsheet",
      presentation: "/presentation",
    };
    router.push(routes[type] || "/document");
  };

  const searchTerm = dashSearch.toLowerCase();
  const filteredFiles = dashSearch
    ? recentFiles.filter((f) => f.name.toLowerCase().includes(searchTerm))
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Onboarding */}
      {!onboardingComplete && (
        <OnboardingWizard onComplete={() => setOnboardingComplete(true)} />
      )}

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Welcome to Vidyalaya
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Your AI-native office suite. Create, collaborate, and export with intelligence.
        </p>
      </div>

      {/* Quick Search Bar */}
      <section>
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Search size={18} style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text"
            value={dashSearch}
            onChange={(e) => setDashSearch(e.target.value)}
            placeholder="Search documents, spreadsheets, presentations..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {dashSearch && (
            <button onClick={() => setDashSearch("")} className="text-xs px-2 py-1 rounded-md hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
              Clear
            </button>
          )}
          <Link href="/search" className="text-xs px-2 py-1 rounded-md hover:opacity-80" style={{ color: "var(--primary)" }}>
            Advanced Search
          </Link>
        </div>
        {dashSearch && (
          <div className="mt-2 rounded-xl border p-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {filteredFiles.length > 0 ? (
              <div className="space-y-1">
                {filteredFiles.map((file) => {
                  const Icon = typeIcons[file.type];
                  return (
                    <div key={file.id} className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:opacity-80" style={{ color: "var(--card-foreground)" }}>
                      <Icon size={16} style={{ color: typeColors[file.type] }} />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{typeExtensions[file.type]}</span>
                      <span className="ml-auto text-xs" style={{ color: "var(--muted-foreground)" }}>{formatFileSize(file.size)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-center py-2" style={{ color: "var(--muted-foreground)" }}>
                No documents found matching &quot;{dashSearch}&quot;
              </p>
            )}
          </div>
        )}
      </section>

      {/* Quick Create + Storage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <section className="lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Quick Create
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {quickCreate.map((item) => (
              <Link
                key={item.type}
                href={item.href}
                className="group flex flex-col items-center gap-2 rounded-xl border p-5 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
              >
                <item.icon size={28} className="transition-colors" style={{ color: "var(--primary)" }} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setShowImport(true)}
              className="group flex flex-col items-center gap-2 rounded-xl border p-5 transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--card-foreground)",
                cursor: "pointer",
              }}
            >
              <Upload
                size={28}
                className="transition-colors"
                style={{ color: "var(--primary)" }}
              />
              <span className="text-sm font-medium">Import File</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <HardDrive size={14} /> Storage
          </h2>
          <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{storagePercent}%</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>used</p>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{storageUsed} GB / {storageTotal} GB</p>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${storagePercent}%`, backgroundColor: storagePercent > 80 ? "#dc2626" : storagePercent > 60 ? "#f59e0b" : "var(--primary)" }} />
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span>Documents: 3.2 GB</span>
              <span>Media: 2.1 GB</span>
            </div>
          </div>
        </section>
      </div>

      {/* Pinned / Starred Files */}
      {starredFiles.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <Pin size={14} /> Pinned & Starred
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starredFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div key={file.id} className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:opacity-90" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${typeColors[file.type]}15` }}>
                    <Icon size={20} style={{ color: typeColors[file.type] }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {typeExtensions[file.type]} &middot; v{file.version} &middot; {formatDate(file.modified)}
                    </p>
                  </div>
                  <button onClick={() => toggleStar(file.id)} className="shrink-0" title="Unpin">
                    <Star size={16} fill="var(--primary)" style={{ color: "var(--primary)" }} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Files Section with Grid/List Toggle */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <Clock size={14} /> Recent Files
          </h2>
          <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setDashboardView("grid")}
              className="rounded-md p-1.5 transition-colors"
              style={{ backgroundColor: dashboardView === "grid" ? "var(--accent)" : "transparent", color: dashboardView === "grid" ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
              title="Grid view"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setDashboardView("list")}
              className="rounded-md p-1.5 transition-colors"
              style={{ backgroundColor: dashboardView === "list" ? "var(--accent)" : "transparent", color: dashboardView === "list" ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {dashboardView === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="group rounded-xl border p-4 transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  onContextMenu={(e) => { e.preventDefault(); setContextMenu({ fileId: file.id, x: e.clientX, y: e.clientY }); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${typeColors[file.type]}15` }}>
                      <Icon size={22} style={{ color: typeColors[file.type] }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleStar(file.id)} className="shrink-0 p-1 rounded hover:opacity-70">
                        <Star size={14} fill={file.starred ? "var(--primary)" : "none"} style={{ color: "var(--primary)" }} />
                      </button>
                      <button
                        onClick={(e) => setContextMenu({ fileId: file.id, x: e.clientX, y: e.clientY })}
                        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:opacity-70 transition-opacity"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${typeColors[file.type]}15`, color: typeColors[file.type] }}>
                      {typeExtensions[file.type]}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatFileSize(file.size)}</span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                    Modified {formatDate(file.modified)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              <span className="w-6" />
              <span className="flex-1">Name</span>
              <span className="w-16 text-center hidden sm:block">Type</span>
              <span className="w-20 text-right hidden md:block">Size</span>
              <span className="w-28 text-right hidden lg:block">Modified</span>
              <span className="w-32 text-right hidden lg:block">Owner</span>
              <span className="w-16" />
            </div>
            {recentFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90"
                  style={{ borderColor: "var(--border)" }}
                  onContextMenu={(e) => { e.preventDefault(); setContextMenu({ fileId: file.id, x: e.clientX, y: e.clientY }); }}
                >
                  <Icon size={18} style={{ color: typeColors[file.type] }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                  </div>
                  <span className="w-16 text-center text-xs hidden sm:block px-1.5 py-0.5 rounded" style={{ color: typeColors[file.type] }}>
                    {typeExtensions[file.type]}
                  </span>
                  <span className="w-20 text-right text-xs hidden md:block" style={{ color: "var(--muted-foreground)" }}>
                    {formatFileSize(file.size)}
                  </span>
                  <span className="w-28 text-right text-xs hidden lg:block" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(file.modified)}
                  </span>
                  <span className="w-32 text-right text-xs truncate hidden lg:block" style={{ color: "var(--muted-foreground)" }}>
                    {file.owner}
                  </span>
                  <div className="w-16 flex items-center justify-end gap-1">
                    <button onClick={() => toggleStar(file.id)} className="p-1 rounded hover:opacity-70">
                      <Star size={14} fill={file.starred ? "var(--primary)" : "none"} style={{ color: "var(--primary)" }} />
                    </button>
                    <button
                      onClick={(e) => setContextMenu({ fileId: file.id, x: e.clientX, y: e.clientY })}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Activity Feed + Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <Activity size={14} /> Recent Activity
          </h2>
          <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {activities.map((item) => {
              const Icon = activityIcons[item.type] || Edit3;
              const color = activityColors[item.type] || "var(--primary)";
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: "var(--card-foreground)" }}>
                      <span className="font-medium">{item.user}</span> {item.action} <span className="font-medium">{item.item}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.tool} &middot; {item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <FolderOpen size={14} /> Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "File Manager", href: "/file-manager", icon: FolderOpen, desc: "Browse all files" },
              { label: "Templates", href: "/template-gallery", icon: Grid3X3, desc: "Start from a template" },
              { label: "Trash", href: "/trash", icon: Trash2, desc: "Recover deleted files" },
              { label: "Search", href: "/search", icon: Search, desc: "Find anything" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
              >
                <item.icon size={20} style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Usage Analytics */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          <BarChart3 size={14} /> Usage Analytics
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>Documents Created Per Week</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--card-foreground)", fontSize: 12 }} />
                  <Bar dataKey="documents" name="Documents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spreadsheets" name="Spreadsheets" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="presentations" name="Presentations" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {[
                { label: "Documents", color: "#3b82f6" },
                { label: "Spreadsheets", color: "#16a34a" },
                { label: "Presentations", color: "#f59e0b" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>Most Used Templates</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={templateUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {templateUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--card-foreground)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {templateUsage.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name} ({t.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Context Menu */}
      {contextMenu && (
        <FileContextMenu
          fileId={contextMenu.fileId}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
      {/* Import Dialog */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
}
