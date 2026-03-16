"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

const templates = [
  { name: "IEEE Paper", desc: "IEEE conference paper format with abstract, keywords, and two-column layout" },
  { name: "CV", desc: "Professional CV/Resume with sections for experience, education, and skills" },
  { name: "Business Report", desc: "Formal business report with executive summary and analysis sections" },
  { name: "SOP", desc: "Annual report template with financial highlights and company overview" },
  { name: "ISO 17025 SOP", desc: "Standard operating procedure with step-by-step instructions and compliance" },
  { name: "Springer", desc: "Springer journal article format with structured sections and references" },
];

const thumbnailColors = ["#1565C0", "#2E7D32", "#6A1B9A", "#C62828", "#E65100", "#00838F"];

export default function WordTemplates() {
  const router = useRouter();

  const handleUse = (name: string) => {
    const key = name === "CV" ? "CV" : name === "IEEE Paper" ? "IEEE" : name === "ISO 17025 SOP" ? "ISO 17025 SOP" : name;
    const stored = localStorage.getItem("vidyalaya-doc-content");
    if (!stored) {
      localStorage.setItem("vidyalaya-template-hint", key);
    }
    router.push("/document");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t, i) => (
        <div
          key={t.name}
          className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-[var(--primary)]"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Thumbnail */}
          <div
            className="h-28 flex items-center justify-center relative"
            style={{ backgroundColor: thumbnailColors[i] + "18" }}
          >
            <FileText size={36} style={{ color: thumbnailColors[i] }} className="opacity-60" />
            <div
              className="absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: thumbnailColors[i] + "22", color: thumbnailColors[i] }}
            >
              .docx
            </div>
          </div>
          {/* Content */}
          <div className="p-3 space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>
              {t.name}
            </h3>
            <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
              {t.desc}
            </p>
            <button
              onClick={() => handleUse(t.name)}
              className="w-full mt-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Use Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
