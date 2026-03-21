"use client";

import { useState } from "react";
import { ClipboardList, Clock, Search, Filter } from "lucide-react";
import type { FileAuditEntry } from "@/types";
import { formatDate } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  created: "#16a34a",
  modified: "#3b82f6",
  viewed: "#6b7280",
  shared: "#8b5cf6",
  deleted: "#dc2626",
  restored: "#f59e0b",
  moved: "#f59e0b",
  renamed: "#06b6d4",
  tagged: "#06b6d4",
};

const ACTION_LABELS: Record<string, string> = {
  created: "Created",
  modified: "Modified",
  viewed: "Viewed",
  shared: "Shared",
  deleted: "Deleted",
  restored: "Restored",
  moved: "Moved",
  renamed: "Renamed",
  tagged: "Tagged",
};

interface AuditLogPanelProps {
  logs: FileAuditEntry[];
  fileNames: Record<string, string>;
}

export function AuditLogPanel({ logs, fileNames }: AuditLogPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesSearch =
      !searchQuery ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fileNames[log.fileId] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>
              File Audit Log
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {logs.length} total events — who accessed, modified, or shared files
            </p>
          </div>
          <ClipboardList size={18} style={{ color: "var(--muted-foreground)" }} />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, file, or details…"
              className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border pl-7 pr-3 py-1.5 text-xs outline-none appearance-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {ACTION_LABELS[action] || action}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Log entries */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No events match your search</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((log) => (
              <div key={log.id} className="flex gap-3 px-4 py-3">
                {/* Action dot */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ACTION_COLORS[log.action] || "#6b7280" }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: "var(--foreground)" }}>
                        <span className="font-semibold">{log.performedBy}</span>
                        {" "}
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${ACTION_COLORS[log.action] || "#6b7280"}20`,
                            color: ACTION_COLORS[log.action] || "#6b7280",
                          }}
                        >
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        {" "}
                        <span className="font-medium">{fileNames[log.fileId] || `File ${log.fileId}`}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs mt-0.5 italic" style={{ color: "var(--muted-foreground)" }}>
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                      <Clock size={11} />
                      <span className="text-[10px] whitespace-nowrap">{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
