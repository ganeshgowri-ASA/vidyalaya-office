"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Table2, Presentation, Plus, X } from "lucide-react";

const DOC_TYPES = [
  { id: "word", label: "Word Document", icon: FileText, ext: ".docx", route: "/document" },
  { id: "excel", label: "Spreadsheet", icon: Table2, ext: ".xlsx", route: "/spreadsheet" },
  { id: "ppt", label: "Presentation", icon: Presentation, ext: ".pptx", route: "/presentation" },
] as const;

const DEPARTMENTS = ["Engineering", "QA", "HR", "Finance", "Operations", "Legal", "IT", "Management"];

interface NewDocumentDialogProps {
  onClose: () => void;
}

export default function NewDocumentDialog({ onClose }: NewDocumentDialogProps) {
  const router = useRouter();
  const [docType, setDocType] = useState("word");
  const [department, setDepartment] = useState("Engineering");
  const [docName, setDocName] = useState("");

  const generateDocId = () => {
    const deptCode = department.slice(0, 3).toUpperCase();
    const typeCode = docType === "word" ? "DOC" : docType === "excel" ? "XLS" : "PPT";
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return `${deptCode}-${typeCode}-${num}`;
  };

  const docId = generateDocId();
  const selectedType = DOC_TYPES.find((t) => t.id === docType)!;

  const handleCreate = () => {
    if (!docName.trim()) return;
    const meta = { docId, name: docName, department, type: docType, createdAt: new Date().toISOString() };
    localStorage.setItem("vidyalaya-new-doc-meta", JSON.stringify(meta));
    router.push(selectedType.route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Plus size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Document</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-[var(--secondary)]">
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          {/* Doc Type Selector */}
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Document Type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDocType(t.id)}
                  className="flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-all"
                  style={{
                    borderColor: docType === t.id ? "var(--primary)" : "var(--border)",
                    backgroundColor: docType === t.id ? "var(--primary)" + "12" : "transparent",
                    color: "var(--foreground)",
                  }}
                >
                  <t.icon size={20} style={{ color: docType === t.id ? "var(--primary)" : "var(--muted-foreground)" }} />
                  {t.label}
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Document Name</label>
            <input
              value={docName} onChange={(e) => setDocName(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              placeholder="Enter document name"
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Department</label>
            <select
              value={department} onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Auto-generated Doc ID */}
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--secondary)" }}>
            <div className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>Auto-Generated Document ID</div>
            <div className="mt-1 font-mono text-sm font-semibold" style={{ color: "var(--primary)" }}>{docId}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-3" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="rounded-lg border px-4 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!docName.trim()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={12} /> Create & Open
          </button>
        </div>
      </div>
    </div>
  );
}
