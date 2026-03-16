"use client";

import { useRouter } from "next/navigation";
import { FileText, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface WordTemplate {
  name: string;
  desc: string;
  category: string;
}

const templates: WordTemplate[] = [
  // General / Existing
  { name: "IEEE Paper", desc: "IEEE conference paper format with abstract, keywords, and two-column layout", category: "Academic" },
  { name: "CV", desc: "Professional 2-3 page CV/Resume with experience, education, skills, publications", category: "Professional" },
  { name: "Business Report", desc: "10+ page business report with executive summary, SWOT, financials, appendices", category: "Business" },
  { name: "SOP", desc: "Multi-page SOP with scope, RACI matrix, procedures, flowcharts, revision history", category: "Operations" },
  { name: "Meeting Minutes", desc: "Meeting minutes with attendees, agenda, action items, and decisions", category: "Business" },
  { name: "Project Proposal", desc: "Project proposal with objectives, timeline, budget, and risk analysis", category: "Business" },
  { name: "Annual Report", desc: "Multi-page annual report with financial statements, governance, sustainability", category: "Business" },
  { name: "Legal Contract", desc: "Service agreement with terms, payment, IP, and dispute resolution", category: "Legal" },
  { name: "Technical Spec", desc: "Technical specification with requirements, architecture, and API specs", category: "Technical" },
  { name: "Training Manual", desc: "Training manual with modules, exercises, and assessment questions", category: "HR" },
  // Academic Journal Formats
  { name: "Springer Journal", desc: "Springer/Nature journal format with structured abstract, data availability, author contributions", category: "Academic" },
  { name: "Wiley Journal", desc: "Wiley journal format with literature review, mixed-methods methodology, implications", category: "Academic" },
  { name: "ScienceDirect Paper", desc: "Elsevier/ScienceDirect format with highlights, graphical abstract, CRediT statement", category: "Academic" },
  { name: "SPIE Conference", desc: "SPIE proceedings format with paper number, experimental setup, optical analysis", category: "Academic" },
  { name: "Research Proposal", desc: "Comprehensive research proposal with budget, timeline, methodology, broader impacts", category: "Academic" },
  // Department-wise Templates
  { name: "Sales Invoice", desc: "Multi-page professional invoice with line items, tax breakdown, payment terms", category: "Sales" },
  { name: "Purchase Order", desc: "Detailed purchase order with vendor info, delivery schedule, terms & conditions", category: "Procurement" },
  { name: "HR Onboarding Checklist", desc: "Comprehensive onboarding with pre-arrival, Day 1, 30-60-90 day goals, IT setup", category: "HR" },
  { name: "Legal NDA", desc: "Non-Disclosure Agreement with definitions, obligations, remedies, schedules", category: "Legal" },
  { name: "P&L Statement", desc: "Profit & Loss statement with quarterly breakdown, ratios, YoY comparison", category: "Accounts" },
];

const thumbnailColors = ["#1565C0", "#2E7D32", "#6A1B9A", "#C62828", "#E65100", "#00838F", "#1a237e", "#333333", "#00695c", "#2e7d32"];

const wordContent: Record<string, string> = {};

export default function WordTemplates() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Academic: true, Business: true, Professional: true });

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const toggle = (cat: string) => setExpanded(p => ({ ...p, [cat]: !p[cat] }));

  const handleUse = (name: string) => {
    const keyMap: Record<string, string> = {
      "CV": "CV",
      "IEEE Paper": "IEEE",
      "Technical Spec": "Technical Specification",
      "Springer Journal": "Springer Journal",
      "Wiley Journal": "Wiley Journal",
      "ScienceDirect Paper": "ScienceDirect Paper",
      "SPIE Conference": "SPIE Conference",
      "Research Proposal": "Research Proposal",
      "Sales Invoice": "Sales Invoice",
      "Purchase Order": "Purchase Order",
      "HR Onboarding Checklist": "HR Onboarding Checklist",
      "Legal NDA": "Legal NDA",
      "P&L Statement": "P&L Statement",
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
      <div className="space-y-2">
        {categories.map((cat) => {
          const catTemplates = templates.filter(t => t.category === cat);
          return (
            <div key={cat} className="rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <button
                onClick={() => toggle(cat)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                <span className="flex items-center gap-2">
                  {cat}
                  <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {catTemplates.length}
                  </span>
                </span>
                {expanded[cat] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expanded[cat] && (
                <div className="grid grid-cols-2 gap-2 px-4 pb-3 sm:grid-cols-3">
                  {catTemplates.map((t) => (
                    <div
                      key={t.name}
                      className="rounded-lg border px-3 py-2 transition-all hover:border-[var(--primary)] group"
                      style={{ borderColor: "var(--border)", color: "var(--card-foreground)" }}
                    >
                      <div className="text-[11px] font-medium group-hover:text-[var(--primary)]">{t.name}</div>
                      <div className="text-[9px] mt-0.5 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</div>
                      <div className="flex gap-1 mt-1.5">
                        <button
                          onClick={() => handleUse(t.name)}
                          className="px-2 py-0.5 rounded text-[9px] text-white"
                          style={{ backgroundColor: "var(--primary)" }}
                        >
                          Use
                        </button>
                        <button
                          onClick={() => setPreview(preview === t.name ? null : t.name)}
                          className="px-2 py-0.5 rounded text-[9px] border"
                          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                        >
                          <Eye size={8} className="inline mr-0.5" />Preview
                        </button>
                      </div>
                      {preview === t.name && (
                        <div
                          className="mt-1.5 max-h-32 overflow-y-auto rounded border p-1.5 text-[9px]"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
                        >
                          <p style={{ color: "var(--muted-foreground)" }}>{t.desc}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
