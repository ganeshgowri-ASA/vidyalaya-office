"use client";

import { useState } from "react";
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

/* Mock activity feed data */
const activityFeed = [
  { id: "a1", action: "edited", item: "Q4 Business Report", tool: "Document", user: "You", time: "5 minutes ago", icon: Edit3, color: "var(--primary)" },
  { id: "a2", action: "approved", item: "Staff Recruitment Policy", tool: "Review", user: "Ms. Priya Patel", time: "2 hours ago", icon: CheckCircle, color: "#16a34a" },
  { id: "a3", action: "commented on", item: "Annual Budget Proposal", tool: "Review", user: "Dr. Ananya Sharma", time: "3 hours ago", icon: MessageSquare, color: "#f59e0b" },
  { id: "a4", action: "uploaded", item: "Campus Safety Audit", tool: "PDF Tools", user: "Ravi Shankar", time: "Yesterday", icon: Upload, color: "#8b5cf6" },
  { id: "a5", action: "created", item: "Sales Dashboard 2024", tool: "Spreadsheet", user: "You", time: "Yesterday", icon: Table2, color: "#3b82f6" },
  { id: "a6", action: "deleted", item: "Old Template Draft", tool: "Templates", user: "You", time: "2 days ago", icon: Trash2, color: "#dc2626" },
];

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
const storageUsed = 6.75; // GB
const storageTotal = 15; // GB
const storagePercent = Math.round((storageUsed / storageTotal) * 100);

export default function DashboardPage() {
  const { recentFiles, toggleStar, searchQuery, setSearchQuery } = useAppStore();
  const starredFiles = recentFiles.filter((f) => f.starred);
  const [dashSearch, setDashSearch] = useState("");
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
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
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
            <button
              onClick={() => setDashSearch("")}
              className="text-xs px-2 py-1 rounded-md hover:opacity-80"
              style={{ color: "var(--muted-foreground)" }}
            >
              Clear
            </button>
          )}
        </div>
        {/* Search results */}
        {dashSearch && (
          <div
            className="mt-2 rounded-xl border p-3"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {filteredFiles.length > 0 ? (
              <div className="space-y-1">
                {filteredFiles.map((file) => {
                  const Icon = typeIcons[file.type];
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:opacity-80"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      <Icon size={16} style={{ color: "var(--primary)" }} />
                      <span className="text-sm">{file.name}</span>
                      <span className="ml-auto text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {file.type}
                      </span>
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
        {/* Quick Create */}
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
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--card-foreground)",
                }}
              >
                <item.icon
                  size={28}
                  className="transition-colors"
                  style={{ color: "var(--primary)" }}
                />
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

        {/* Storage Usage */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <HardDrive size={14} />
            Storage
          </h2>
          <div
            className="rounded-xl border p-5 space-y-3"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{storagePercent}%</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>used</p>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {storageUsed} GB / {storageTotal} GB
              </p>
            </div>
            {/* Progress bar */}
            <div
              className="h-2.5 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--secondary)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${storagePercent}%`,
                  backgroundColor: storagePercent > 80 ? "#dc2626" : storagePercent > 60 ? "#f59e0b" : "var(--primary)",
                }}
              />
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
            <Pin size={14} />
            Pinned & Starred
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starredFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <Icon size={20} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
                      {file.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {file.type} &middot; v{file.version} &middot; {formatDate(file.modified)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStar(file.id)}
                    className="shrink-0"
                    title="Unpin"
                  >
                    <Star size={16} fill="var(--primary)" style={{ color: "var(--primary)" }} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Activity Feed + Recent Files */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <Activity size={14} />
            Recent Activity
          </h2>
          <div
            className="rounded-xl border divide-y"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {activityFeed.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: "var(--card-foreground)" }}>
                      <span className="font-medium">{item.user}</span>{" "}
                      {item.action}{" "}
                      <span className="font-medium">{item.item}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {item.tool} &middot; {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Files */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <Clock size={14} />
            Recent Files
          </h2>
          <div
            className="rounded-xl border divide-y"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {recentFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Icon size={18} style={{ color: "var(--primary)" }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
                      {file.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {file.type} &middot; v{file.version} &middot; {formatDate(file.modified)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStar(file.id)}
                    className="shrink-0"
                  >
                    <Star
                      size={16}
                      fill={file.starred ? "var(--primary)" : "none"}
                      style={{ color: "var(--primary)" }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Usage Analytics */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          <BarChart3 size={14} />
          Usage Analytics
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Documents created per week */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>
              Documents Created Per Week
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--card-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="documents" name="Documents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spreadsheets" name="Spreadsheets" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="presentations" name="Presentations" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
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

          {/* Most used templates */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>
              Most Used Templates
            </h3>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--card-foreground)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
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

      {/* Import Dialog */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
}
