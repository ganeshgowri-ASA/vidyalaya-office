"use client";

import React, { useState } from "react";
import {
  X,
  History,
  Clock,
  User,
  RotateCcw,
  ChevronRight,
  FileText,
  Tag,
} from "lucide-react";
import { useCollaborationStore } from "@/store/collaboration-store";

export function VersionHistoryPanel() {
  const {
    showVersionHistory,
    setShowVersionHistory,
    versionHistory,
    restoreVersion,
  } = useCollaborationStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["today"])
  );

  if (!showVersionHistory) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group versions by date
  const groups: Record<string, typeof versionHistory> = {};
  versionHistory.forEach((v) => {
    const key = formatDate(v.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  });

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedGroups(next);
  };

  return (
    <div
      className="flex flex-col border-l flex-shrink-0 h-full"
      style={{
        width: 320,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <History size={15} style={{ color: "var(--primary)" }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Version History
          </h3>
        </div>
        <button
          onClick={() => setShowVersionHistory(false)}
          className="rounded p-1 hover:bg-[var(--muted)]"
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Version groups */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groups).map(([date, versions]) => (
          <div key={date}>
            {/* Date header */}
            <button
              onClick={() => toggleGroup(date)}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <ChevronRight
                size={12}
                className={`transition-transform ${
                  expandedGroups.has(date) ? "rotate-90" : ""
                }`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {date}
              </span>
              <span className="text-[9px]">({versions.length})</span>
            </button>

            {/* Versions in group */}
            {expandedGroups.has(date) &&
              versions.map((version) => (
                <div
                  key={version.id}
                  className={`px-4 py-3 border-b cursor-pointer transition-colors ${
                    selectedId === version.id
                      ? "bg-[var(--accent)]"
                      : "hover:bg-[var(--muted)]"
                  }`}
                  style={{ borderColor: "var(--border)" }}
                  onClick={() =>
                    setSelectedId(
                      selectedId === version.id ? null : version.id
                    )
                  }
                >
                  {/* Version header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor:
                            version.version === "Current"
                              ? "var(--primary)"
                              : "var(--muted)",
                          color:
                            version.version === "Current"
                              ? "white"
                              : "var(--foreground)",
                        }}
                      >
                        {version.version === "Current"
                          ? "Current"
                          : `v${version.version}`}
                      </span>
                      {version.changeCount > 0 && (
                        <span
                          className="text-[9px]"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {version.changeCount} changes
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatTime(version.timestamp)}
                    </span>
                  </div>

                  {/* Summary */}
                  <p
                    className="text-[11px] leading-relaxed mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    {version.changesSummary}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                      style={{ backgroundColor: version.author.color }}
                    >
                      {version.author.name[0]}
                    </div>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {version.author.name}
                    </span>
                  </div>

                  {/* Actions when selected */}
                  {selectedId === version.id &&
                    version.version !== "Current" && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreVersion(version.id);
                          }}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium border hover:bg-[var(--muted)] transition-colors"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--primary)",
                          }}
                        >
                          <RotateCcw size={10} />
                          Restore this version
                        </button>
                      </div>
                    )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
