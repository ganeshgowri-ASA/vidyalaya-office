"use client";

import React, { useState } from "react";
import { X, FileText } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

interface DocumentPropertiesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DocumentPropertiesDialog({ open, onClose }: DocumentPropertiesDialogProps) {
  const { documentProperties, setDocumentProperties, fileName, wordCount, charCount, lineCount, paragraphCount } = useDocumentStore();
  const [props, setProps] = useState(documentProperties);
  const [activeTab, setActiveTab] = useState<"general" | "summary" | "statistics">("general");

  if (!open) return null;

  const handleApply = () => {
    setDocumentProperties(props);
    onClose();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] max-h-[80vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Document Properties</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5" style={{ borderColor: "var(--border)" }}>
          {(["general", "summary", "statistics"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs font-medium border-b-2 capitalize ${
                activeTab === t ? "border-[var(--primary)]" : "border-transparent"
              }`}
              style={{ color: activeTab === t ? "var(--primary)" : "var(--muted-foreground)" }}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[50vh]">
          {activeTab === "general" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="w-12 h-14 rounded border flex items-center justify-center"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                  <FileText size={24} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{fileName}</div>
                  <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Document</div>
                </div>
              </div>
              {[
                { label: "Type", value: "Document (.docx)" },
                { label: "Location", value: "Local Storage" },
                { label: "Size", value: `~${Math.max(1, Math.ceil(charCount / 1024))} KB` },
                { label: "Created", value: formatDate(props.created) },
                { label: "Modified", value: formatDate(props.modified) },
              ].map((item) => (
                <div key={item.label} className="flex text-xs">
                  <span className="w-24 shrink-0" style={{ color: "var(--muted-foreground)" }}>{item.label}:</span>
                  <span style={{ color: "var(--foreground)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-3">
              {[
                { label: "Title", key: "title" as const, placeholder: "Document title" },
                { label: "Author", key: "author" as const, placeholder: "Author name" },
                { label: "Subject", key: "subject" as const, placeholder: "Document subject" },
                { label: "Category", key: "category" as const, placeholder: "Document category" },
                { label: "Keywords", key: "keywords" as const, placeholder: "keyword1, keyword2, ..." },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>{field.label}</label>
                  <input type="text" value={props[field.key]}
                    onChange={(e) => setProps({ ...props, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full rounded border px-2 py-1.5 text-xs bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
              ))}
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Comments</label>
                <textarea value={props.comments}
                  onChange={(e) => setProps({ ...props, comments: e.target.value })}
                  placeholder="Additional comments about this document..."
                  className="w-full rounded border px-2 py-1.5 text-xs bg-transparent resize-none"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  rows={3} />
              </div>
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="space-y-1">
              <table className="w-full text-xs">
                <tbody>
                  {[
                    ["Pages", Math.max(1, Math.ceil(wordCount / 300))],
                    ["Words", wordCount.toLocaleString()],
                    ["Characters (no spaces)", charCount.toLocaleString()],
                    ["Characters (with spaces)", (charCount + Math.max(0, wordCount - 1)).toLocaleString()],
                    ["Paragraphs", paragraphCount],
                    ["Lines", lineCount.toLocaleString()],
                    ["Headings", typeof document !== "undefined" ? document.getElementById("doc-editor")?.querySelectorAll("h1,h2,h3,h4,h5,h6").length || 0 : 0],
                    ["Tables", typeof document !== "undefined" ? document.getElementById("doc-editor")?.querySelectorAll("table").length || 0 : 0],
                    ["Images", typeof document !== "undefined" ? document.getElementById("doc-editor")?.querySelectorAll("img").length || 0 : 0],
                    ["Links", typeof document !== "undefined" ? document.getElementById("doc-editor")?.querySelectorAll("a").length || 0 : 0],
                  ].map(([label, value]) => (
                    <tr key={String(label)}>
                      <td className="py-1.5 border-b" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>{label}</td>
                      <td className="py-1.5 text-right font-medium border-b" style={{ color: "var(--foreground)", borderColor: "var(--border)" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose}
            className="px-4 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Cancel
          </button>
          <button onClick={handleApply}
            className="px-4 py-1.5 rounded-lg text-xs text-white"
            style={{ backgroundColor: "var(--primary)" }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
