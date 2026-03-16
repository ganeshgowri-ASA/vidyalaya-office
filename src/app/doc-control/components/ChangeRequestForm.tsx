"use client";

import { useState } from "react";
import { FileText, Send, X } from "lucide-react";

const CHANGE_TYPES = ["New", "Revision", "Obsolete"] as const;
const STATUSES = ["Pending", "Under Review", "Approved", "Rejected"] as const;

interface ChangeRequestFormProps {
  onClose: () => void;
  onSubmit: (data: {
    docName: string;
    changeType: string;
    reason: string;
    requestor: string;
    approver: string;
    status: string;
  }) => void;
}

export default function ChangeRequestForm({ onClose, onSubmit }: ChangeRequestFormProps) {
  const [form, setForm] = useState({
    docName: "",
    changeType: "New" as string,
    reason: "",
    requestor: "",
    approver: "",
    status: "Pending" as string,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border shadow-2xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Change Request</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--secondary)]">
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Document Name</label>
            <input
              required value={form.docName} onChange={(e) => set("docName", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              placeholder="Enter document name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Change Type</label>
              <select
                value={form.changeType} onChange={(e) => set("changeType", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {CHANGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Status</label>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      form.status === "Approved" ? "#10b981" :
                      form.status === "Rejected" ? "#ef4444" :
                      form.status === "Under Review" ? "#f59e0b" : "#6b7280",
                  }}
                />
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{form.status}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Reason for Change</label>
            <textarea
              required value={form.reason} onChange={(e) => set("reason", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none resize-none focus:border-[var(--primary)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              placeholder="Describe why this change is needed..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Requestor</label>
              <input
                required value={form.requestor} onChange={(e) => set("requestor", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Approver</label>
              <input
                required value={form.approver} onChange={(e) => set("approver", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                placeholder="Approver name"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-3" style={{ borderColor: "var(--border)" }}>
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: "var(--primary)" }}>
            <Send size={12} /> Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
