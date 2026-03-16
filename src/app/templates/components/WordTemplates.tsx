"use client";

import { useRouter } from "next/navigation";
import { FileText, Eye } from "lucide-react";
import { useState } from "react";

const templates = [
  { name: "IEEE Paper", desc: "IEEE conference paper format with abstract, keywords, and two-column layout" },
  { name: "CV", desc: "Professional CV/Resume with sections for experience, education, and skills" },
  { name: "Business Report", desc: "Formal business report with executive summary and analysis sections" },
  { name: "SOP", desc: "Standard operating procedure with step-by-step instructions and compliance" },
  { name: "Meeting Minutes", desc: "Meeting minutes with attendees, agenda, action items, and decisions" },
  { name: "Project Proposal", desc: "Project proposal with objectives, timeline, budget, and risk analysis" },
  { name: "Annual Report", desc: "Corporate annual report with financial statements and governance" },
  { name: "Legal Contract", desc: "Service agreement with terms, payment, IP, and dispute resolution" },
  { name: "Technical Spec", desc: "Technical specification with requirements, architecture, and API specs" },
  { name: "Training Manual", desc: "Training manual with modules, exercises, and assessment questions" },
];

const thumbnailColors = ["#1565C0", "#2E7D32", "#6A1B9A", "#C62828", "#E65100", "#00838F", "#1a237e", "#333333", "#00695c", "#2e7d32"];

/* wordContent is defined in the parent page; previews use the key lookup */
const wordContent: Record<string, string> = {};

export default function WordTemplates() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const handleUse = (name: string) => {
    const keyMap: Record<string, string> = {
      "CV": "CV",
      "IEEE Paper": "IEEE",
      "Technical Spec": "Technical Specification",
    };
    const key = keyMap[name] || name;
    const stored = localStorage.getItem("vidyalaya-doc-content");
    if (!stored) {
      localStorage.setItem("vidyalaya-template-hint", key);
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
        <FileText size={16} />
        Word Templates
        <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
          {templates.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border px-4 py-3 transition-all hover:border-[var(--primary)] group"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="text-sm font-medium group-hover:text-[var(--primary)]">{t.name}</div>
            <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => handleUse(t.name)}
                className="px-2 py-1 rounded text-[10px] text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Use Template
              </button>
              <button
                onClick={() => setPreview(preview === t.name ? null : t.name)}
                className="px-2 py-1 rounded text-[10px] border"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <Eye size={10} className="inline mr-1" />Preview
              </button>
            </div>
            {preview === t.name && wordContent[t.name] && (
              <div
                className="mt-2 max-h-48 overflow-y-auto rounded border p-2 text-[10px]"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
                dangerouslySetInnerHTML={{ __html: wordContent[t.name].slice(0, 1500) + "..." }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
