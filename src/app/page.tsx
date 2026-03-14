"use client";

import {
  FileText,
  Table2,
  Presentation,
  FileDown,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { FileType } from "@/types";

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

export default function DashboardPage() {
  const { recentFiles, toggleStar } = useAppStore();
  const starredFiles = recentFiles.filter((f) => f.starred);

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

      {/* Quick Create */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Quick Create
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        </div>
      </section>

      {/* Starred Files */}
      {starredFiles.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <Star size={14} />
            Starred
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starredFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border p-4"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <Icon size={20} style={{ color: "var(--primary)" }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
                      {file.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {formatDate(file.modified)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStar(file.id)}
                    className="shrink-0"
                  >
                    <Star size={16} fill="var(--primary)" style={{ color: "var(--primary)" }} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Files */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          <Clock size={14} />
          Recent Files
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentFiles.map((file) => {
            const Icon = typeIcons[file.type];
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <Icon size={20} style={{ color: "var(--primary)" }} />
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
  );
}
