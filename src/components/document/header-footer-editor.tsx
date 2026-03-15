"use client";

import React, { useState } from "react";
import { X, Hash, Calendar, User, Building2, FileText, ChevronDown } from "lucide-react";

interface HeaderFooterConfig {
  left: string;
  center: string;
  right: string;
}

interface HeaderFooterEditorProps {
  open: boolean;
  onClose: () => void;
  headerConfig: HeaderFooterConfig;
  footerConfig: HeaderFooterConfig;
  onSave: (header: HeaderFooterConfig, footer: HeaderFooterConfig) => void;
}

const TEMPLATES = [
  {
    name: "Standard",
    header: { left: "", center: "{title}", right: "" },
    footer: { left: "", center: "Page {page} of {pages}", right: "" },
  },
  {
    name: "Corporate",
    header: { left: "{company}", center: "{title}", right: "{date}" },
    footer: { left: "{department}", center: "Confidential", right: "Page {page} of {pages}" },
  },
  {
    name: "Academic",
    header: { left: "{author}", center: "", right: "{title}" },
    footer: { left: "", center: "", right: "Page {page}" },
  },
];

const INSERT_FIELDS = [
  { label: "Page Number", value: "{page}", icon: Hash },
  { label: "Total Pages", value: "{pages}", icon: Hash },
  { label: "Date", value: "{date}", icon: Calendar },
  { label: "Document Title", value: "{title}", icon: FileText },
  { label: "Author", value: "{author}", icon: User },
  { label: "Department", value: "{department}", icon: Building2 },
];

export function HeaderFooterEditor({ open, onClose, headerConfig, footerConfig, onSave }: HeaderFooterEditorProps) {
  const [header, setHeader] = useState<HeaderFooterConfig>(headerConfig);
  const [footer, setFooter] = useState<HeaderFooterConfig>(footerConfig);
  const [differentFirst, setDifferentFirst] = useState(false);
  const [oddEven, setOddEven] = useState(false);
  const [activeField, setActiveField] = useState<{ section: "header" | "footer"; position: "left" | "center" | "right" } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  if (!open) return null;

  const insertField = (value: string) => {
    if (!activeField) return;
    const { section, position } = activeField;
    if (section === "header") {
      setHeader((prev) => ({ ...prev, [position]: prev[position] + value }));
    } else {
      setFooter((prev) => ({ ...prev, [position]: prev[position] + value }));
    }
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setHeader(template.header);
    setFooter(template.footer);
    setShowTemplates(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-[560px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Header & Footer</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Templates */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border"
              style={{ borderColor: "var(--border)", color: "var(--primary)" }}
            >
              Apply Template <ChevronDown size={12} />
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 z-10 mt-1 rounded-lg border shadow-lg py-1 w-48"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {TEMPLATES.map((t) => (
                  <button key={t.name} onClick={() => applyTemplate(t)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}>
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Insert Fields */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Insert Field (click a section below first)</label>
            <div className="flex flex-wrap gap-1">
              {INSERT_FIELDS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => insertField(f.value)}
                  className="flex items-center gap-1 px-2 py-1 rounded border text-xs hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  <f.icon size={12} /> {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--foreground)" }}>Header</label>
            <div className="grid grid-cols-3 gap-2">
              {(["left", "center", "right"] as const).map((pos) => (
                <div key={pos}>
                  <label className="text-[10px] uppercase mb-1 block" style={{ color: "var(--muted-foreground)" }}>{pos}</label>
                  <input
                    value={header[pos]}
                    onChange={(e) => setHeader((prev) => ({ ...prev, [pos]: e.target.value }))}
                    onFocus={() => setActiveField({ section: "header", position: pos })}
                    className={`w-full rounded border px-2 py-1.5 text-xs bg-transparent ${
                      activeField?.section === "header" && activeField.position === pos ? "border-[var(--primary)]" : ""
                    }`}
                    style={{ borderColor: activeField?.section === "header" && activeField.position === pos ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}
                    placeholder={`Header ${pos}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--foreground)" }}>Footer</label>
            <div className="grid grid-cols-3 gap-2">
              {(["left", "center", "right"] as const).map((pos) => (
                <div key={pos}>
                  <label className="text-[10px] uppercase mb-1 block" style={{ color: "var(--muted-foreground)" }}>{pos}</label>
                  <input
                    value={footer[pos]}
                    onChange={(e) => setFooter((prev) => ({ ...prev, [pos]: e.target.value }))}
                    onFocus={() => setActiveField({ section: "footer", position: pos })}
                    className={`w-full rounded border px-2 py-1.5 text-xs bg-transparent ${
                      activeField?.section === "footer" && activeField.position === pos ? "border-[var(--primary)]" : ""
                    }`}
                    style={{ borderColor: activeField?.section === "footer" && activeField.position === pos ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}
                    placeholder={`Footer ${pos}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={differentFirst} onChange={(e) => setDifferentFirst(e.target.checked)} />
              Different first page
            </label>
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
              <input type="checkbox" checked={oddEven} onChange={(e) => setOddEven(e.target.checked)} />
              Different odd/even pages
            </label>
          </div>

          {/* Preview */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Preview</label>
            <div className="rounded border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
              <div className="flex justify-between text-[10px] border-b pb-1 mb-8" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <span>{header.left || "\u00A0"}</span>
                <span>{header.center || "\u00A0"}</span>
                <span>{header.right || "\u00A0"}</span>
              </div>
              <div className="text-center text-[10px] italic" style={{ color: "var(--muted-foreground)" }}>Document content area</div>
              <div className="flex justify-between text-[10px] border-t pt-1 mt-8" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <span>{footer.left || "\u00A0"}</span>
                <span>{footer.center || "\u00A0"}</span>
                <span>{footer.right || "\u00A0"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
          <button onClick={() => { onSave(header, footer); onClose(); }}
            className="px-4 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
