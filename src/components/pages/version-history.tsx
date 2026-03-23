"use client";

import { X, Clock } from "lucide-react";
import type { IntranetPage } from "@/store/pages-store";

interface VersionHistoryProps {
  page: IntranetPage;
  onClose: () => void;
}

export function VersionHistory({ page, onClose }: VersionHistoryProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Clock size={18} />
            Version History
          </h2>
          <button onClick={onClose} className="rounded p-1 opacity-60 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-6">
          {page.versions.length === 0 ? (
            <p className="text-center text-sm opacity-50">No versions yet</p>
          ) : (
            <div className="space-y-4">
              {[...page.versions].reverse().map((version) => (
                <div
                  key={version.id}
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Version {version.version}</span>
                    <span className="text-xs opacity-40">
                      {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(version.modifiedAt))}
                    </span>
                  </div>
                  <p className="text-xs opacity-60">{version.summary}</p>
                  <p className="mt-1 text-xs opacity-40">by {version.modifiedBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
