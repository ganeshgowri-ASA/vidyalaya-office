"use client";

import { useRouter } from "next/navigation";
import { Table2 } from "lucide-react";

const templates = [
  { name: "Sales Dashboard", dept: "Sales", desc: "Monthly sales performance with revenue tracking and margin analysis" },
  { name: "Employee Directory", dept: "HR", desc: "Staff directory with contact details, roles, and department info" },
  { name: "Project Budget", dept: "Finance", desc: "Budget tracker with actual vs planned spending and variance" },
  { name: "Inventory Tracker", dept: "Operations", desc: "Product inventory with stock levels, reorder points, and suppliers" },
  { name: "Timesheet", dept: "HR", desc: "Weekly hours tracking per employee with overtime calculations" },
  { name: "Invoice", dept: "Legal", desc: "Professional invoice with line items, tax, and payment terms" },
  { name: "Gantt Chart", dept: "Management", desc: "Project timeline with task dependencies and progress tracking" },
  { name: "Expense Report", dept: "Finance", desc: "Employee expense categorization with approval workflow" },
];

const deptColors: Record<string, string> = {
  Sales: "#3b82f6",
  HR: "#8b5cf6",
  Finance: "#10b981",
  Operations: "#f59e0b",
  Legal: "#ef4444",
  Management: "#06b6d4",
};

export default function ExcelTemplates() {
  const router = useRouter();

  const handleUse = (name: string) => {
    localStorage.setItem("vidyalaya-template-hint", name);
    router.push("/spreadsheet");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {templates.map((t) => {
        const color = deptColors[t.dept] || "#6b7280";
        return (
          <div
            key={t.name}
            className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-[var(--primary)]"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {/* Thumbnail */}
            <div className="h-24 flex items-center justify-center relative" style={{ backgroundColor: color + "14" }}>
              <Table2 size={32} style={{ color }} className="opacity-60" />
              <span
                className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: color + "22", color }}
              >
                {t.dept}
              </span>
              <span
                className="absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: color + "22", color }}
              >
                .xlsx
              </span>
            </div>
            {/* Content */}
            <div className="p-3 space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>{t.name}</h3>
              <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</p>
              <button
                onClick={() => handleUse(t.name)}
                className="w-full mt-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Use Template
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
