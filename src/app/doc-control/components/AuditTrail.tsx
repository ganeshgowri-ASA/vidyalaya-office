"use client";

import { useState } from "react";
import { Filter, Clock } from "lucide-react";

export interface AuditEntry {
  id: string;
  action: string;
  documentId: string;
  documentName: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

const ACTION_COLORS: Record<string, string> = {
  Created: "#10b981",
  Updated: "#3b82f6",
  Archived: "#8b5cf6",
  Restored: "#06b6d4",
  Deleted: "#ef4444",
  "Permanently Deleted": "#991b1b",
  "Change Request Created": "#f59e0b",
  "CR Status Changed": "#f97316",
  "Status Changed": "#6366f1",
};

const ALL_ACTIONS = Object.keys(ACTION_COLORS);

interface Props {
  auditLog: AuditEntry[];
}

export default function AuditTrail({ auditLog }: Props) {
  const [filterAction, setFilterAction] = useState("All");

  const filtered = filterAction === "All" ? auditLog : auditLog.filter((e) => e.action === filterAction);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <Clock size={14} /> Audit Trail
          <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
            {auditLog.length} entries
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Filter size={12} style={{ color: "var(--muted-foreground)" }} />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg border px-2 py-1.5 text-xs bg-transparent"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="All">All Actions</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: "var(--muted)" }}>
              <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Timestamp</th>
              <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Action</th>
              <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Document</th>
              <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Performed By</th>
              <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-3 py-2 font-mono text-[10px]" style={{ color: "var(--muted-foreground)" }}>{entry.timestamp}</td>
                <td className="px-3 py-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: ACTION_COLORS[entry.action] || "#6b7280" }}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-3 py-2" style={{ color: "var(--foreground)" }}>{entry.documentName}</td>
                <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{entry.performedBy}</td>
                <td className="px-3 py-2 max-w-[200px] truncate" style={{ color: "var(--muted-foreground)" }}>{entry.details}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>No audit entries found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
