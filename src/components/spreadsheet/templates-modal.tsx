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
  Package,
  CalendarDays,
  Gauge,
  PieChart,
  LayoutGrid,
  ShieldAlert,
  ListChecks,
  Clock,
  Users,
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
  {
    name: "Inventory Tracker",
    description: "Track stock levels, reorder points, and inventory value",
    icon: <Package size={20} />,
    data: {
      A1: hdr("Item"), B1: hdr("SKU"), C1: hdr("Qty"), D1: hdr("Unit Cost"), E1: hdr("Total Value"), F1: hdr("Reorder Pt"),
      A2: cell("Laptop Pro 15"), B2: cell("LP-001"), C2: num("45"), D2: cur("1200"), E2: { raw: "=C2*D2", style: { format: "currency", align: "right" } }, F2: num("20"),
      A3: cell("Wireless Mouse"), B3: cell("WM-042"), C3: num("230"), D3: cur("25"), E3: { raw: "=C3*D3", style: { format: "currency", align: "right" } }, F3: num("50"),
      A4: cell("USB-C Hub"), B4: cell("UH-108"), C4: num("85"), D4: cur("45"), E4: { raw: "=C4*D4", style: { format: "currency", align: "right" } }, F4: num("30"),
      A5: cell("Monitor 27\""), B5: cell("MN-027"), C5: num("32"), D5: cur("350"), E5: { raw: "=C5*D5", style: { format: "currency", align: "right" } }, F5: num("15"),
      A6: cell("Keyboard Mech"), B6: cell("KB-055"), C6: num("120"), D6: cur("75"), E6: { raw: "=C6*D6", style: { format: "currency", align: "right" } }, F6: num("40"),
      A7: cell("Webcam HD"), B7: cell("WC-019"), C7: num("60"), D7: cur("65"), E7: { raw: "=C7*D7", style: { format: "currency", align: "right" } }, F7: num("25"),
      A9: bold("Total Items"), C9: { raw: "=SUM(C2:C7)", style: { bold: true, align: "right" } },
      A10: bold("Total Value"), E10: { raw: "=SUM(E2:E7)", style: { bold: true, format: "currency", align: "right" } },
    },
  },
  {
    name: "Employee Schedule",
    description: "Weekly staff scheduling with hours tracking",
    icon: <CalendarDays size={20} />,
    data: {
      A1: hdr("Employee"), B1: hdr("Mon"), C1: hdr("Tue"), D1: hdr("Wed"), E1: hdr("Thu"), F1: hdr("Fri"), G1: hdr("Total Hrs"),
      A2: cell("Sarah Chen"), B2: num("8"), C2: num("8"), D2: num("8"), E2: num("8"), F2: num("8"), G2: { raw: "=SUM(B2:F2)", style: { bold: true, align: "right" } },
      A3: cell("James Wilson"), B3: num("6"), C3: num("8"), D3: num("8"), E3: num("6"), F3: num("0"), G3: { raw: "=SUM(B3:F3)", style: { bold: true, align: "right" } },
      A4: cell("Maria Garcia"), B4: num("8"), C4: num("8"), D4: num("4"), E4: num("8"), F4: num("8"), G4: { raw: "=SUM(B4:F4)", style: { bold: true, align: "right" } },
      A5: cell("Alex Kim"), B5: num("0"), C5: num("8"), D5: num("8"), E5: num("8"), F5: num("8"), G5: { raw: "=SUM(B5:F5)", style: { bold: true, align: "right" } },
      A6: cell("Priya Patel"), B6: num("8"), C6: num("4"), D6: num("8"), E6: num("8"), F6: num("4"), G6: { raw: "=SUM(B6:F6)", style: { bold: true, align: "right" } },
      A8: bold("Daily Total"), B8: { raw: "=SUM(B2:B6)", style: { bold: true, align: "right" } }, C8: { raw: "=SUM(C2:C6)", style: { bold: true, align: "right" } },
      D8: { raw: "=SUM(D2:D6)", style: { bold: true, align: "right" } }, E8: { raw: "=SUM(E2:E6)", style: { bold: true, align: "right" } },
      F8: { raw: "=SUM(F2:F6)", style: { bold: true, align: "right" } }, G8: { raw: "=SUM(G2:G6)", style: { bold: true, align: "right" } },
    },
  },
  {
    name: "KPI Dashboard",
    description: "Key performance indicators with targets and actuals",
    icon: <Gauge size={20} />,
    data: {
      A1: hdr("KPI"), B1: hdr("Target"), C1: hdr("Actual"), D1: hdr("% Achieved"), E1: hdr("Status"),
      A2: cell("Revenue"), B2: cur("500000"), C2: cur("485000"), D2: { raw: "=C2/B2", style: { format: "percent", align: "right" } }, E2: cell("On Track"),
      A3: cell("New Customers"), B3: num("200"), C3: num("215"), D3: { raw: "=C3/B3", style: { format: "percent", align: "right" } }, E3: cell("Exceeded"),
      A4: cell("Churn Rate"), B4: pct("0.05"), C4: pct("0.042"), D4: { raw: "=C4/B4", style: { format: "percent", align: "right" } }, E4: cell("On Track"),
      A5: cell("NPS Score"), B5: num("70"), C5: num("74"), D5: { raw: "=C5/B5", style: { format: "percent", align: "right" } }, E5: cell("Exceeded"),
      A6: cell("Support Tickets"), B6: num("50"), C6: num("63"), D6: { raw: "=C6/B6", style: { format: "percent", align: "right" } }, E6: cell("At Risk"),
      A7: cell("Employee Satisfaction"), B7: pct("0.85"), C7: pct("0.82"), D7: { raw: "=C7/B7", style: { format: "percent", align: "right" } }, E7: cell("On Track"),
      A9: bold("Avg Achievement"), D9: { raw: "=AVERAGE(D2:D7)", style: { bold: true, format: "percent", align: "right" } },
    },
  },
  {
    name: "Financial Statement",
    description: "Income statement with revenue, expenses, and net income",
    icon: <PieChart size={20} />,
    data: {
      A1: { raw: "INCOME STATEMENT", style: { bold: true, align: "left" } },
      A3: { raw: "REVENUE", style: { bold: true, bgColor: "#22c55e", textColor: "#ffffff" } },
      A4: cell("Product Sales"), B4: cur("320000"),
      A5: cell("Service Revenue"), B5: cur("185000"),
      A6: cell("Licensing Fees"), B6: cur("45000"),
      A7: bold("Total Revenue"), B7: { raw: "=SUM(B4:B6)", style: { bold: true, format: "currency", align: "right" } },
      A9: { raw: "EXPENSES", style: { bold: true, bgColor: "#ef4444", textColor: "#ffffff" } },
      A10: cell("Cost of Goods"), B10: cur("128000"),
      A11: cell("Salaries"), B11: cur("195000"),
      A12: cell("Rent & Utilities"), B12: cur("36000"),
      A13: cell("Marketing"), B13: cur("42000"),
      A14: cell("R&D"), B14: cur("58000"),
      A15: bold("Total Expenses"), B15: { raw: "=SUM(B10:B14)", style: { bold: true, format: "currency", align: "right" } },
      A17: { raw: "NET INCOME", style: { bold: true, bgColor: "#3b82f6", textColor: "#ffffff" } },
      B17: { raw: "=B7-B15", style: { bold: true, format: "currency", align: "right", bgColor: "#3b82f6", textColor: "#ffffff" } },
    },
  },
  {
    name: "SWOT Matrix",
    description: "Strategic analysis: Strengths, Weaknesses, Opportunities, Threats",
    icon: <LayoutGrid size={20} />,
    data: {
      A1: { raw: "STRENGTHS", style: { bold: true, bgColor: "#22c55e", textColor: "#ffffff", align: "center" } },
      C1: { raw: "WEAKNESSES", style: { bold: true, bgColor: "#ef4444", textColor: "#ffffff", align: "center" } },
      A2: cell("Strong brand recognition"), C2: cell("Limited market presence in APAC"),
      A3: cell("Experienced leadership team"), C3: cell("High employee turnover"),
      A4: cell("Proprietary technology"), C4: cell("Outdated legacy systems"),
      A5: cell("Strong cash reserves"), C5: cell("Narrow product line"),
      A7: { raw: "OPPORTUNITIES", style: { bold: true, bgColor: "#3b82f6", textColor: "#ffffff", align: "center" } },
      C7: { raw: "THREATS", style: { bold: true, bgColor: "#f97316", textColor: "#ffffff", align: "center" } },
      A8: cell("Emerging markets expansion"), C8: cell("New competitor entrants"),
      A9: cell("AI/ML integration potential"), C9: cell("Regulatory changes"),
      A10: cell("Strategic partnership opportunities"), C10: cell("Economic downturn risk"),
      A11: cell("Growing demand for SaaS"), C11: cell("Cybersecurity threats"),
    },
  },
  {
    name: "Risk Register",
    description: "Track project risks with likelihood, impact, and mitigation",
    icon: <ShieldAlert size={20} />,
    data: {
      A1: hdr("Risk ID"), B1: hdr("Description"), C1: hdr("Likelihood"), D1: hdr("Impact"), E1: hdr("Score"), F1: hdr("Mitigation"),
      A2: cell("R-001"), B2: cell("Vendor delivery delay"), C2: num("4"), D2: num("5"), E2: { raw: "=C2*D2", style: { bold: true, align: "right" } }, F2: cell("Identify backup vendors"),
      A3: cell("R-002"), B3: cell("Budget overrun"), C3: num("3"), D3: num("4"), E3: { raw: "=C3*D3", style: { bold: true, align: "right" } }, F3: cell("Monthly budget reviews"),
      A4: cell("R-003"), B4: cell("Key staff departure"), C4: num("2"), D4: num("5"), E4: { raw: "=C4*D4", style: { bold: true, align: "right" } }, F4: cell("Cross-training program"),
      A5: cell("R-004"), B5: cell("Scope creep"), C5: num("4"), D5: num("3"), E5: { raw: "=C5*D5", style: { bold: true, align: "right" } }, F5: cell("Strict change control"),
      A6: cell("R-005"), B6: cell("Security breach"), C6: num("2"), D6: num("5"), E6: { raw: "=C6*D6", style: { bold: true, align: "right" } }, F6: cell("Penetration testing"),
      A8: bold("Avg Risk Score"), E8: { raw: "=AVERAGE(E2:E6)", style: { bold: true, format: "number", align: "right" } },
      A9: bold("Max Risk Score"), E9: { raw: "=MAX(E2:E6)", style: { bold: true, align: "right" } },
    },
  },
  {
    name: "Action Items",
    description: "Track action items with owners, deadlines, and progress",
    icon: <ListChecks size={20} />,
    data: {
      A1: hdr("Action Item"), B1: hdr("Owner"), C1: hdr("Priority"), D1: hdr("Deadline"), E1: hdr("% Done"), F1: hdr("Status"),
      A2: cell("Finalize Q2 budget proposal"), B2: cell("Lisa M."), C2: cell("High"), D2: cell("2026-04-01"), E2: pct("0.9"), F2: cell("In Progress"),
      A3: cell("Update onboarding docs"), B3: cell("Tom R."), C3: cell("Medium"), D3: cell("2026-04-10"), E3: pct("0.5"), F3: cell("In Progress"),
      A4: cell("Deploy v2.3 hotfix"), B4: cell("Dev Team"), C4: cell("Critical"), D4: cell("2026-03-25"), E4: pct("1"), F4: cell("Done"),
      A5: cell("Vendor contract review"), B5: cell("Sarah K."), C5: cell("High"), D5: cell("2026-04-05"), E5: pct("0.3"), F5: cell("In Progress"),
      A6: cell("Schedule team retrospective"), B6: cell("PM Office"), C6: cell("Low"), D6: cell("2026-04-15"), E6: pct("0"), F6: cell("Pending"),
      A7: cell("Security audit preparation"), B7: cell("InfoSec"), C7: cell("High"), D7: cell("2026-04-20"), E7: pct("0.15"), F7: cell("In Progress"),
      A9: bold("Avg Completion"), E9: { raw: "=AVERAGE(E2:E7)", style: { bold: true, format: "percent", align: "right" } },
      A10: bold("Total Items"), B10: { raw: "=COUNT(E2:E7)", style: { bold: true, align: "right" } },
    },
  },
  {
    name: "Timesheet",
    description: "Weekly timesheet with project hours and billing",
    icon: <Clock size={20} />,
    data: {
      A1: hdr("Project"), B1: hdr("Mon"), C1: hdr("Tue"), D1: hdr("Wed"), E1: hdr("Thu"), F1: hdr("Fri"), G1: hdr("Total"), H1: hdr("Rate"), I1: hdr("Amount"),
      A2: cell("Client Portal"), B2: num("3"), C2: num("4"), D2: num("2"), E2: num("5"), F2: num("3"), G2: { raw: "=SUM(B2:F2)", style: { bold: true, align: "right" } }, H2: cur("150"), I2: { raw: "=G2*H2", style: { format: "currency", align: "right" } },
      A3: cell("Internal Tools"), B3: num("2"), C3: num("1"), D3: num("3"), E3: num("1"), F3: num("2"), G3: { raw: "=SUM(B3:F3)", style: { bold: true, align: "right" } }, H3: cur("0"), I3: { raw: "=G3*H3", style: { format: "currency", align: "right" } },
      A4: cell("Mobile App"), B4: num("1"), C4: num("2"), D4: num("3"), E4: num("2"), F4: num("3"), G4: { raw: "=SUM(B4:F4)", style: { bold: true, align: "right" } }, H4: cur("175"), I4: { raw: "=G4*H4", style: { format: "currency", align: "right" } },
      A5: cell("Meetings"), B5: num("2"), C5: num("1"), D5: num("0"), E5: num("0"), F5: num("0"), G5: { raw: "=SUM(B5:F5)", style: { bold: true, align: "right" } }, H5: cur("0"), I5: { raw: "=G5*H5", style: { format: "currency", align: "right" } },
      A7: bold("Daily Total"), B7: { raw: "=SUM(B2:B5)", style: { bold: true, align: "right" } }, C7: { raw: "=SUM(C2:C5)", style: { bold: true, align: "right" } },
      D7: { raw: "=SUM(D2:D5)", style: { bold: true, align: "right" } }, E7: { raw: "=SUM(E2:E5)", style: { bold: true, align: "right" } },
      F7: { raw: "=SUM(F2:F5)", style: { bold: true, align: "right" } }, G7: { raw: "=SUM(G2:G5)", style: { bold: true, align: "right" } },
      A8: bold("Total Billable"), I8: { raw: "=SUM(I2:I5)", style: { bold: true, format: "currency", align: "right" } },
    },
  },
  {
    name: "Payroll Summary",
    description: "Employee payroll with deductions and net pay",
    icon: <Users size={20} />,
    data: {
      A1: hdr("Employee"), B1: hdr("Base Salary"), C1: hdr("Bonus"), D1: hdr("Gross Pay"), E1: hdr("Tax (22%)"), F1: hdr("Insurance"), G1: hdr("Net Pay"),
      A2: cell("John Adams"), B2: cur("6500"), C2: cur("800"), D2: { raw: "=B2+C2", style: { format: "currency", align: "right" } }, E2: { raw: "=D2*0.22", style: { format: "currency", align: "right" } }, F2: cur("350"), G2: { raw: "=D2-E2-F2", style: { format: "currency", align: "right" } },
      A3: cell("Emily Brooks"), B3: cur("7200"), C3: cur("1000"), D3: { raw: "=B3+C3", style: { format: "currency", align: "right" } }, E3: { raw: "=D3*0.22", style: { format: "currency", align: "right" } }, F3: cur("400"), G3: { raw: "=D3-E3-F3", style: { format: "currency", align: "right" } },
      A4: cell("Carlos Diaz"), B4: cur("5800"), C4: cur("500"), D4: { raw: "=B4+C4", style: { format: "currency", align: "right" } }, E4: { raw: "=D4*0.22", style: { format: "currency", align: "right" } }, F4: cur("300"), G4: { raw: "=D4-E4-F4", style: { format: "currency", align: "right" } },
      A5: cell("Diana Evans"), B5: cur("8000"), C5: cur("1200"), D5: { raw: "=B5+C5", style: { format: "currency", align: "right" } }, E5: { raw: "=D5*0.22", style: { format: "currency", align: "right" } }, F5: cur("450"), G5: { raw: "=D5-E5-F5", style: { format: "currency", align: "right" } },
      A6: cell("Frank Garcia"), B6: cur("6100"), C6: cur("600"), D6: { raw: "=B6+C6", style: { format: "currency", align: "right" } }, E6: { raw: "=D6*0.22", style: { format: "currency", align: "right" } }, F6: cur("325"), G6: { raw: "=D6-E6-F6", style: { format: "currency", align: "right" } },
      A8: bold("Totals"), B8: { raw: "=SUM(B2:B6)", style: { bold: true, format: "currency", align: "right" } },
      C8: { raw: "=SUM(C2:C6)", style: { bold: true, format: "currency", align: "right" } },
      D8: { raw: "=SUM(D2:D6)", style: { bold: true, format: "currency", align: "right" } },
      E8: { raw: "=SUM(E2:E6)", style: { bold: true, format: "currency", align: "right" } },
      F8: { raw: "=SUM(F2:F6)", style: { bold: true, format: "currency", align: "right" } },
      G8: { raw: "=SUM(G2:G6)", style: { bold: true, format: "currency", align: "right" } },
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
