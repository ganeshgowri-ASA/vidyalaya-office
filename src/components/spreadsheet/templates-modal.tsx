"use client";

import { useSpreadsheetStore, CellData } from "@/store/spreadsheet-store";
import {
  X,
  DollarSign,
  FileText,
  TrendingUp,
  BarChart3,
  Receipt,
  CheckSquare,
} from "lucide-react";

interface TemplateItem {
  name: string;
  description: string;
  icon: React.ReactNode;
  data: Record<string, CellData>;
}

function cell(raw: string, style: CellData["style"] = {}): CellData {
  return { raw, style };
}
function hdr(raw: string): CellData {
  return { raw, style: { bold: true, bgColor: "#3b82f6", textColor: "#ffffff", align: "center" } };
}
function num(raw: string): CellData {
  return { raw, style: { format: "number", align: "right" } };
}
function cur(raw: string): CellData {
  return { raw, style: { format: "currency", align: "right" } };
}
function pct(raw: string): CellData {
  return { raw, style: { format: "percent", align: "right" } };
}
function bold(raw: string): CellData {
  return { raw, style: { bold: true } };
}

const TEMPLATES: TemplateItem[] = [
  {
    name: "Project Budget",
    description: "Track project expenses and budget allocation",
    icon: <DollarSign size={20} />,
    data: {
      A1: hdr("Category"), B1: hdr("Budget"), C1: hdr("Actual"), D1: hdr("Variance"),
      A2: cell("Personnel"), B2: cur("50000"), C2: cur("48500"), D2: { raw: "=B2-C2", style: { format: "currency", align: "right" } },
      A3: cell("Equipment"), B3: cur("15000"), C3: cur("16200"), D3: { raw: "=B3-C3", style: { format: "currency", align: "right" } },
      A4: cell("Software"), B4: cur("8000"), C4: cur("7500"), D4: { raw: "=B4-C4", style: { format: "currency", align: "right" } },
      A5: cell("Travel"), B5: cur("5000"), C5: cur("4200"), D5: { raw: "=B5-C5", style: { format: "currency", align: "right" } },
      A6: cell("Marketing"), B6: cur("12000"), C6: cur("13100"), D6: { raw: "=B6-C6", style: { format: "currency", align: "right" } },
      A7: cell("Training"), B7: cur("3000"), C7: cur("2800"), D7: { raw: "=B7-C7", style: { format: "currency", align: "right" } },
      A8: cell("Miscellaneous"), B8: cur("2000"), C8: cur("1900"), D8: { raw: "=B8-C8", style: { format: "currency", align: "right" } },
      A10: bold("TOTAL"), B10: { raw: "=SUM(B2:B8)", style: { bold: true, format: "currency", align: "right" } },
      C10: { raw: "=SUM(C2:C8)", style: { bold: true, format: "currency", align: "right" } },
      D10: { raw: "=SUM(D2:D8)", style: { bold: true, format: "currency", align: "right" } },
    },
  },
  {
    name: "Invoice",
    description: "Professional invoice template with auto-totals",
    icon: <FileText size={20} />,
    data: {
      A1: { raw: "INVOICE", style: { bold: true, align: "left" } },
      A3: bold("Bill To:"), B3: cell("Acme Corp"),
      A4: cell("Address:"), B4: cell("123 Business St, NY 10001"),
      A6: hdr("Item"), B6: hdr("Qty"), C6: hdr("Rate"), D6: hdr("Amount"),
      A7: cell("Web Design"), B7: num("1"), C7: cur("5000"), D7: { raw: "=B7*C7", style: { format: "currency", align: "right" } },
      A8: cell("Development"), B8: num("80"), C8: cur("150"), D8: { raw: "=B8*C8", style: { format: "currency", align: "right" } },
      A9: cell("Hosting (12mo)"), B9: num("12"), C9: cur("50"), D9: { raw: "=B9*C9", style: { format: "currency", align: "right" } },
      A10: cell("Maintenance"), B10: num("6"), C10: cur("200"), D10: { raw: "=B10*C10", style: { format: "currency", align: "right" } },
      A12: bold("Subtotal"), D12: { raw: "=SUM(D7:D10)", style: { bold: true, format: "currency", align: "right" } },
      A13: bold("Tax (8%)"), D13: { raw: "=D12*0.08", style: { format: "currency", align: "right" } },
      A14: { raw: "TOTAL", style: { bold: true, bgColor: "#22c55e", textColor: "#ffffff" } },
      D14: { raw: "=D12+D13", style: { bold: true, format: "currency", align: "right", bgColor: "#22c55e", textColor: "#ffffff" } },
    },
  },
  {
    name: "Sales Dashboard",
    description: "Monthly sales tracking with KPIs",
    icon: <TrendingUp size={20} />,
    data: {
      A1: hdr("Month"), B1: hdr("Revenue"), C1: hdr("Expenses"), D1: hdr("Profit"), E1: hdr("Margin"),
      A2: cell("Jan"), B2: cur("42000"), C2: cur("28000"), D2: { raw: "=B2-C2", style: { format: "currency", align: "right" } }, E2: { raw: "=D2/B2", style: { format: "percent", align: "right" } },
      A3: cell("Feb"), B3: cur("45000"), C3: cur("29500"), D3: { raw: "=B3-C3", style: { format: "currency", align: "right" } }, E3: { raw: "=D3/B3", style: { format: "percent", align: "right" } },
      A4: cell("Mar"), B4: cur("51000"), C4: cur("31000"), D4: { raw: "=B4-C4", style: { format: "currency", align: "right" } }, E4: { raw: "=D4/B4", style: { format: "percent", align: "right" } },
      A5: cell("Apr"), B5: cur("48000"), C5: cur("30500"), D5: { raw: "=B5-C5", style: { format: "currency", align: "right" } }, E5: { raw: "=D5/B5", style: { format: "percent", align: "right" } },
      A6: cell("May"), B6: cur("55000"), C6: cur("33000"), D6: { raw: "=B6-C6", style: { format: "currency", align: "right" } }, E6: { raw: "=D6/B6", style: { format: "percent", align: "right" } },
      A7: cell("Jun"), B7: cur("52000"), C7: cur("32000"), D7: { raw: "=B7-C7", style: { format: "currency", align: "right" } }, E7: { raw: "=D7/B7", style: { format: "percent", align: "right" } },
      A9: bold("TOTAL"), B9: { raw: "=SUM(B2:B7)", style: { bold: true, format: "currency", align: "right" } },
      C9: { raw: "=SUM(C2:C7)", style: { bold: true, format: "currency", align: "right" } },
      D9: { raw: "=SUM(D2:D7)", style: { bold: true, format: "currency", align: "right" } },
      E9: { raw: "=AVERAGE(E2:E7)", style: { bold: true, format: "percent", align: "right" } },
      A11: bold("Max Revenue"), B11: { raw: "=MAX(B2:B7)", style: { format: "currency", align: "right" } },
      A12: bold("Min Revenue"), B12: { raw: "=MIN(B2:B7)", style: { format: "currency", align: "right" } },
    },
  },
  {
    name: "Gantt Chart",
    description: "Simple project timeline tracker",
    icon: <BarChart3 size={20} />,
    data: {
      A1: hdr("Task"), B1: hdr("Start Week"), C1: hdr("Duration"), D1: hdr("Owner"), E1: hdr("Status"),
      A2: cell("Planning"), B2: num("1"), C2: num("2"), D2: cell("Alice"), E2: cell("Done"),
      A3: cell("Design"), B3: num("2"), C3: num("3"), D3: cell("Bob"), E3: cell("Done"),
      A4: cell("Frontend Dev"), B4: num("4"), C4: num("5"), D4: cell("Carol"), E4: cell("In Progress"),
      A5: cell("Backend Dev"), B5: num("4"), C5: num("6"), D5: cell("Dave"), E5: cell("In Progress"),
      A6: cell("Testing"), B6: num("9"), C6: num("2"), D6: cell("Eve"), E6: cell("Pending"),
      A7: cell("Deployment"), B7: num("11"), C7: num("1"), D7: cell("Frank"), E7: cell("Pending"),
      A9: bold("Total Tasks"), B9: { raw: "=COUNT(C2:C7)", style: { bold: true, align: "right" } },
      A10: bold("Total Weeks"), B10: { raw: "=MAX(B2:B7)+MAX(C2:C7)-1", style: { bold: true, align: "right" } },
    },
  },
  {
    name: "Expense Report",
    description: "Track and categorize business expenses",
    icon: <Receipt size={20} />,
    data: {
      A1: hdr("Date"), B1: hdr("Description"), C1: hdr("Category"), D1: hdr("Amount"), E1: hdr("Approved"),
      A2: cell("2024-01-05"), B2: cell("Client lunch"), C2: cell("Meals"), D2: cur("85.50"), E2: cell("Yes"),
      A3: cell("2024-01-08"), B3: cell("Uber to airport"), C3: cell("Transport"), D3: cur("42.00"), E3: cell("Yes"),
      A4: cell("2024-01-08"), B4: cell("Flight SFO-NYC"), C4: cell("Travel"), D4: cur("389.00"), E4: cell("Yes"),
      A5: cell("2024-01-09"), B5: cell("Hotel (2 nights)"), C5: cell("Lodging"), D5: cur("520.00"), E5: cell("Yes"),
      A6: cell("2024-01-10"), B6: cell("Conference ticket"), C6: cell("Events"), D6: cur("299.00"), E6: cell("Pending"),
      A7: cell("2024-01-12"), B7: cell("Office supplies"), C7: cell("Supplies"), D7: cur("67.30"), E7: cell("Yes"),
      A8: cell("2024-01-15"), B8: cell("Software license"), C8: cell("Software"), D8: cur("149.99"), E8: cell("Pending"),
      A10: bold("Total"), D10: { raw: "=SUM(D2:D8)", style: { bold: true, format: "currency", align: "right" } },
      A11: bold("Count"), D11: { raw: "=COUNT(D2:D8)", style: { bold: true, align: "right" } },
      A12: bold("Average"), D12: { raw: "=AVERAGE(D2:D8)", style: { bold: true, format: "currency", align: "right" } },
    },
  },
  {
    name: "Task Planner",
    description: "Prioritized task list with effort tracking",
    icon: <CheckSquare size={20} />,
    data: {
      A1: hdr("Task"), B1: hdr("Priority"), C1: hdr("Effort (hrs)"), D1: hdr("Status"), E1: hdr("Due Date"),
      A2: cell("Setup CI/CD pipeline"), B2: cell("High"), C2: num("8"), D2: cell("Done"), E2: cell("2024-01-15"),
      A3: cell("Design user dashboard"), B3: cell("High"), C3: num("16"), D3: cell("In Progress"), E3: cell("2024-01-20"),
      A4: cell("Implement auth flow"), B4: cell("High"), C4: num("12"), D4: cell("In Progress"), E4: cell("2024-01-22"),
      A5: cell("Write API docs"), B5: cell("Medium"), C5: num("6"), D5: cell("Pending"), E5: cell("2024-01-25"),
      A6: cell("Add unit tests"), B6: cell("Medium"), C6: num("10"), D6: cell("Pending"), E6: cell("2024-01-28"),
      A7: cell("Performance audit"), B7: cell("Low"), C7: num("4"), D7: cell("Pending"), E7: cell("2024-02-01"),
      A8: cell("Update dependencies"), B8: cell("Low"), C8: num("3"), D8: cell("Pending"), E8: cell("2024-02-05"),
      A10: bold("Total Effort"), C10: { raw: "=SUM(C2:C8)", style: { bold: true, align: "right" } },
      A11: bold("Avg Effort"), C11: { raw: "=AVERAGE(C2:C8)", style: { bold: true, format: "number", align: "right" } },
      A12: bold("Task Count"), C12: { raw: "=COUNT(C2:C8)", style: { bold: true, align: "right" } },
    },
  },
];

export function TemplatesModal() {
  const showTemplatesModal = useSpreadsheetStore((s) => s.showTemplatesModal);
  const closeTemplatesModal = useSpreadsheetStore((s) => s.closeTemplatesModal);
  const loadTemplate = useSpreadsheetStore((s) => s.loadTemplate);

  if (!showTemplatesModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[600px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Templates</h2>
          <button onClick={closeTemplatesModal} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              className="flex items-start gap-3 p-3 rounded-lg border text-left hover:opacity-80 transition-colors"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
              onClick={() => loadTemplate(t.data)}
            >
              <div
                className="p-2 rounded-md"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {t.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {t.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
