"use client";

import { FileText, Table2, Presentation as PresentationIcon } from "lucide-react";

const wordTemplates = [
  "CV", "SOP", "IEEE", "Springer", "Wiley", "ScienceDirect", "SPIE",
  "Grant Proposal", "Research Paper", "Nature Article", "Business Report",
  "ISO 17025 SOP", "Thesis Chapter", "Project Proposal", "Meeting Minutes",
  "Technical Manual",
];

const excelTemplates = [
  "Project Budget", "Sales Dashboard", "Inventory Tracker", "Employee Directory",
  "Invoice", "Gantt Chart", "Task Planner", "Project Planner", "Sales Quote",
  "Purchase Order", "Expense Report", "Timesheet",
];

const pptTemplates = [
  "Startup Pitch", "Quarterly Review", "Research Talk", "Product Launch",
  "Training Session", "Company Overview", "Business Proposal",
  "Training & Teaching", "Weekly Meeting Update", "Financial Quarterly PPT",
  "Workshop",
];

const categories = [
  {
    title: "Word Templates",
    icon: FileText,
    templates: wordTemplates,
    count: 16,
  },
  {
    title: "Excel Templates",
    icon: Table2,
    templates: excelTemplates,
    count: 12,
  },
  {
    title: "PPT Templates",
    icon: PresentationIcon,
    templates: pptTemplates,
    count: 11,
  },
];

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Templates
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Start from professionally designed templates across documents, spreadsheets, and presentations.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat.title}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            <cat.icon size={16} />
            {cat.title}
            <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
              {cat.count}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {cat.templates.map((tmpl) => (
              <button
                key={tmpl}
                className="rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--card-foreground)",
                }}
              >
                {tmpl}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
