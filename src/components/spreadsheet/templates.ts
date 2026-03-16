import type { Sheet, Cell, CellStyle } from "./types";

function cell(
  value: string,
  formula?: string,
  style?: CellStyle
): Cell {
  return { value: formula ? "" : value, formula, style };
}

function header(value: string): Cell {
  return cell(value, undefined, { bold: true, bgColor: "#1e3a5f", textColor: "#ffffff", align: "center" });
}

function bold(value: string): Cell {
  return cell(value, undefined, { bold: true });
}

function currency(formula: string): Cell {
  return cell("", formula, { format: "currency" });
}

function pct(formula: string): Cell {
  return cell("", formula, { format: "percentage" });
}

function num(formula: string): Cell {
  return cell("", formula, { format: "number" });
}

export interface TemplateDefinition {
  name: string;
  description: string;
  icon: string;
  sheets: Omit<Sheet, "id">[];
}

export const TEMPLATES: TemplateDefinition[] = [
  // 1. Project Budget
  {
    name: "Project Budget",
    description: "Track planned vs actual project expenses",
    icon: "💰",
    sheets: [
      {
        name: "Budget",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 180, 1: 120, 2: 120, 3: 120, 4: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Category"),
          B1: header("Planned ($)"),
          C1: header("Actual ($)"),
          D1: header("Variance ($)"),
          E1: header("% Spent"),
          A2: bold("Development"),
          B2: cell("45000"),
          C2: cell("42500"),
          D2: currency("=C2-B2"),
          E2: pct("=C2/B2"),
          A3: bold("Design"),
          B3: cell("12000"),
          C3: cell("13200"),
          D3: currency("=C3-B3"),
          E3: pct("=C3/B3"),
          A4: bold("Marketing"),
          B4: cell("8000"),
          C4: cell("7500"),
          D4: currency("=C4-B4"),
          E4: pct("=C4/B4"),
          A5: bold("Infrastructure"),
          B5: cell("5000"),
          C5: cell("4800"),
          D5: currency("=C5-B5"),
          E5: pct("=C5/B5"),
          A6: bold("QA & Testing"),
          B6: cell("6000"),
          C6: cell("5900"),
          D6: currency("=C6-B6"),
          E6: pct("=C6/B6"),
          A7: bold("Project Management"),
          B7: cell("9000"),
          C7: cell("9500"),
          D7: currency("=C7-B7"),
          E7: pct("=C7/B7"),
          A8: bold("Contingency"),
          B8: cell("5000"),
          C8: cell("1200"),
          D8: currency("=C8-B8"),
          E8: pct("=C8/B8"),
          A9: cell("", undefined, { bold: true, bgColor: "#2d6a4f", textColor: "#ffffff" }),
          B9: cell("=SUM(B2:B8)", "=SUM(B2:B8)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          C9: cell("=SUM(C2:C8)", "=SUM(C2:C8)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          D9: cell("=C9-B9", "=C9-B9", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          E9: cell("=C9/B9", "=C9/B9", { bold: true, format: "percentage", bgColor: "#2d6a4f", textColor: "#ffffff" }),
        },
      },
    ],
  },

  // 2. Sales Dashboard
  {
    name: "Sales Dashboard",
    description: "Monthly sales performance and targets",
    icon: "📊",
    sheets: [
      {
        name: "Sales",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 120, 1: 120, 2: 120, 3: 120, 4: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Month"),
          B1: header("Sales ($)"),
          C1: header("Target ($)"),
          D1: header("Growth %"),
          E1: header("Status"),
          A2: cell("January"), B2: cell("85000"), C2: cell("80000"), D2: pct("=(B2-C2)/C2"), E2: cell("✅ On Track"),
          A3: cell("February"), B3: cell("92000"), C3: cell("85000"), D3: pct("=(B3-C3)/C3"), E3: cell("✅ On Track"),
          A4: cell("March"), B4: cell("78000"), C4: cell("90000"), D4: pct("=(B4-C4)/C4"), E4: cell("❌ Behind"),
          A5: cell("April"), B5: cell("105000"), C5: cell("95000"), D5: pct("=(B5-C5)/C5"), E5: cell("✅ On Track"),
          A6: cell("May"), B6: cell("98000"), C6: cell("100000"), D6: pct("=(B6-C6)/C6"), E6: cell("⚠️ Close"),
          A7: cell("June"), B7: cell("115000"), C7: cell("105000"), D7: pct("=(B7-C7)/C7"), E7: cell("✅ On Track"),
          A8: cell("July"), B8: cell("88000"), C8: cell("110000"), D8: pct("=(B8-C8)/C8"), E8: cell("❌ Behind"),
          A9: cell("August"), B9: cell("122000"), C9: cell("115000"), D9: pct("=(B9-C9)/C9"), E9: cell("✅ On Track"),
          A10: cell("September"), B10: cell("134000"), C10: cell("120000"), D10: pct("=(B10-C10)/C10"), E10: cell("✅ On Track"),
          A11: cell("October"), B11: cell("118000"), C11: cell("125000"), D11: pct("=(B11-C11)/C11"), E11: cell("⚠️ Close"),
          A12: cell("November"), B12: cell("145000"), C12: cell("130000"), D12: pct("=(B12-C12)/C12"), E12: cell("✅ On Track"),
          A13: cell("December"), B13: cell("162000"), C13: cell("150000"), D13: pct("=(B13-C13)/C13"), E13: cell("✅ On Track"),
          A14: bold("TOTAL"),
          B14: cell("=SUM(B2:B13)", "=SUM(B2:B13)", { bold: true, format: "currency" }),
          C14: cell("=SUM(C2:C13)", "=SUM(C2:C13)", { bold: true, format: "currency" }),
          D14: cell("=(B14-C14)/C14", "=(B14-C14)/C14", { bold: true, format: "percentage" }),
        },
      },
    ],
  },

  // 3. Inventory Tracker
  {
    name: "Inventory Tracker",
    description: "Track stock levels, prices, and reorder points",
    icon: "📦",
    sheets: [
      {
        name: "Inventory",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 160, 1: 100, 2: 80, 3: 80, 4: 100, 5: 100, 6: 100 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Product Name"), B1: header("SKU"), C1: header("Qty"), D1: header("Reorder Pt"), E1: header("Unit Price"), F1: header("Total Value"), G1: header("Status"),
          A2: cell("Laptop Pro 15"), B2: cell("LAP-001"), C2: cell("45"), D2: cell("20"), E2: cell("1299.99"), F2: currency("=C2*E2"), G2: cell("✅ In Stock"),
          A3: cell("Wireless Mouse"), B3: cell("MOU-012"), C3: cell("12"), D3: cell("25"), E3: cell("29.99"), F3: currency("=C3*E3"), G3: cell("⚠️ Low Stock"),
          A4: cell("USB-C Hub"), B4: cell("HUB-008"), C4: cell("78"), D4: cell("30"), E4: cell("49.99"), F4: currency("=C4*E4"), G4: cell("✅ In Stock"),
          A5: cell("Monitor 27\""), B5: cell("MON-027"), C5: cell("0"), D5: cell("10"), E5: cell("399.99"), F5: currency("=C5*E5"), G5: cell("❌ Out of Stock"),
          A6: cell("Keyboard Mech"), B6: cell("KEY-RGB"), C6: cell("33"), D6: cell("15"), E6: cell("89.99"), F6: currency("=C6*E6"), G6: cell("✅ In Stock"),
          A7: cell("Webcam HD"), B7: cell("CAM-1080"), C7: cell("8"), D7: cell("20"), E7: cell("69.99"), F7: currency("=C7*E7"), G7: cell("⚠️ Low Stock"),
          A8: cell("Desk Lamp LED"), B8: cell("LMP-LED"), C8: cell("54"), D8: cell("20"), E8: cell("34.99"), F8: currency("=C8*E8"), G8: cell("✅ In Stock"),
          A9: cell("Headphones NC"), B9: cell("HDP-NC35"), C9: cell("22"), D9: cell("15"), E9: cell("249.99"), F9: currency("=C9*E9"), G9: cell("✅ In Stock"),
          A10: bold("TOTAL"), F10: cell("=SUM(F2:F9)", "=SUM(F2:F9)", { bold: true, format: "currency" }),
        },
      },
    ],
  },

  // 4. Employee Directory
  {
    name: "Employee Directory",
    description: "Team members, roles, and contact information",
    icon: "👥",
    sheets: [
      {
        name: "Employees",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 160, 1: 130, 2: 160, 3: 200, 4: 130, 5: 100 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Name"), B1: header("Department"), C1: header("Job Title"), D1: header("Email"), E1: header("Phone"), F1: header("Start Date"),
          A2: cell("Alice Johnson"), B2: cell("Engineering"), C2: cell("Senior Developer"), D2: cell("alice.j@company.com"), E2: cell("+1-555-0101"), F2: cell("2020-03-15"),
          A3: cell("Bob Martinez"), B3: cell("Design"), C3: cell("UX Designer"), D3: cell("bob.m@company.com"), E3: cell("+1-555-0102"), F3: cell("2019-07-22"),
          A4: cell("Carol Chen"), B4: cell("Marketing"), C4: cell("Marketing Manager"), D4: cell("carol.c@company.com"), E4: cell("+1-555-0103"), F4: cell("2021-01-10"),
          A5: cell("David Kim"), B5: cell("Engineering"), C5: cell("DevOps Engineer"), D5: cell("david.k@company.com"), E5: cell("+1-555-0104"), F5: cell("2020-09-01"),
          A6: cell("Emma Wilson"), B6: cell("Sales"), C6: cell("Sales Director"), D6: cell("emma.w@company.com"), E6: cell("+1-555-0105"), F6: cell("2018-04-20"),
          A7: cell("Frank Davis"), B7: cell("Finance"), C7: cell("CFO"), D7: cell("frank.d@company.com"), E7: cell("+1-555-0106"), F7: cell("2017-11-05"),
          A8: cell("Grace Lee"), B8: cell("HR"), C8: cell("HR Manager"), D8: cell("grace.l@company.com"), E8: cell("+1-555-0107"), F8: cell("2022-02-28"),
          A9: cell("Henry Brown"), B9: cell("Engineering"), C9: cell("CTO"), D9: cell("henry.b@company.com"), E9: cell("+1-555-0108"), F9: cell("2016-06-15"),
          A10: cell("Iris Taylor"), B10: cell("Marketing"), C10: cell("Content Writer"), D10: cell("iris.t@company.com"), E10: cell("+1-555-0109"), F10: cell("2023-01-15"),
        },
      },
    ],
  },

  // 5. Invoice
  {
    name: "Invoice",
    description: "Professional invoice template",
    icon: "🧾",
    sheets: [
      {
        name: "Invoice",
        frozenRows: 0,
        frozenCols: 0,
        colWidths: { 0: 200, 1: 80, 2: 120, 3: 80, 4: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: cell("INVOICE", undefined, { bold: true, textColor: "#1e3a5f" }),
          A2: cell("Vidyalaya Office Solutions"),
          A3: cell("123 Business Ave, Suite 100"),
          A4: cell("New York, NY 10001"),
          D2: bold("Invoice #:"), E2: cell("INV-2024-0042"),
          D3: bold("Date:"), E3: cell("2024-03-15"),
          D4: bold("Due Date:"), E4: cell("2024-04-15"),
          A6: bold("Bill To:"),
          A7: cell("Acme Corporation"),
          A8: cell("456 Client Street"),
          A9: cell("San Francisco, CA 94102"),
          A11: header("Description"), B11: header("Qty"), C11: header("Unit Price"), D11: header("Discount"), E11: header("Total"),
          A12: cell("Web Development Services"), B12: cell("40"), C12: cell("150"), D12: cell("0"), E12: currency("=B12*C12*(1-D12/100)"),
          A13: cell("UI/UX Design"), B13: cell("20"), C13: cell("120"), D13: cell("10"), E13: currency("=B13*C13*(1-D13/100)"),
          A14: cell("Project Management"), B14: cell("10"), C14: cell("100"), D14: cell("0"), E14: currency("=B14*C14*(1-D14/100)"),
          A15: cell("Server Setup"), B15: cell("1"), C15: cell("500"), D15: cell("0"), E15: currency("=B15*C15*(1-D15/100)"),
          D16: bold("Subtotal:"), E16: currency("=SUM(E12:E15)"),
          D17: bold("Tax (8%):"), E17: currency("=E16*0.08"),
          D18: cell("TOTAL DUE:", undefined, { bold: true, bgColor: "#1e3a5f", textColor: "#ffffff" }),
          E18: cell("=E16+E17", "=E16+E17", { bold: true, format: "currency", bgColor: "#1e3a5f", textColor: "#ffffff" }),
          A20: cell("Payment Terms: Net 30 days. Thank you for your business!"),
        },
      },
    ],
  },

  // 6. Gantt Chart
  {
    name: "Gantt Chart",
    description: "Project timeline with task dependencies",
    icon: "📅",
    sheets: [
      {
        name: "Gantt",
        frozenRows: 1,
        frozenCols: 2,
        colWidths: { 0: 180, 1: 80 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Task"), B1: header("Duration"), C1: header("W1"), D1: header("W2"), E1: header("W3"), F1: header("W4"), G1: header("W5"), H1: header("W6"), I1: header("W7"), J1: header("W8"),
          A2: cell("Project Kickoff"), B2: cell("1"), C2: cell("█"),
          A3: cell("Requirements Gathering"), B3: cell("2"), C3: cell("█"), D3: cell("█"),
          A4: cell("System Architecture"), B4: cell("2"), D4: cell("█"), E4: cell("█"),
          A5: cell("Database Design"), B5: cell("1"), D5: cell("█"),
          A6: cell("Frontend Development"), B6: cell("3"), E6: cell("█"), F6: cell("█"), G6: cell("█"),
          A7: cell("Backend Development"), B7: cell("3"), E7: cell("█"), F7: cell("█"), G7: cell("█"),
          A8: cell("API Integration"), B8: cell("2"), G8: cell("█"), H8: cell("█"),
          A9: cell("Testing & QA"), B9: cell("2"), G9: cell("█"), H9: cell("█"),
          A10: cell("User Acceptance Testing"), B10: cell("1"), H10: cell("█"),
          A11: cell("Deployment"), B11: cell("1"), I11: cell("█"),
          A12: cell("Post-Launch Support"), B12: cell("2"), I12: cell("█"), J12: cell("█"),
        },
      },
    ],
  },

  // 7. Task Planner
  {
    name: "Task Planner",
    description: "Team task tracking with priorities and status",
    icon: "✅",
    sheets: [
      {
        name: "Tasks",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 200, 1: 100, 2: 100, 3: 120, 4: 130, 5: 100 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Task"), B1: header("Priority"), C1: header("Status"), D1: header("Due Date"), E1: header("Assignee"), F1: header("% Done"),
          A2: cell("Design new landing page"), B2: cell("High"), C2: cell("In Progress"), D2: cell("2024-03-20"), E2: cell("Bob Martinez"), F2: cell("65"),
          A3: cell("Set up CI/CD pipeline"), B3: cell("High"), C3: cell("Complete"), D3: cell("2024-03-15"), E3: cell("David Kim"), F3: cell("100"),
          A4: cell("Write API documentation"), B4: cell("Medium"), C4: cell("Pending"), D4: cell("2024-03-25"), E4: cell("Alice Johnson"), F4: cell("20"),
          A5: cell("Implement search feature"), B5: cell("High"), C5: cell("In Progress"), D5: cell("2024-03-22"), E5: cell("Alice Johnson"), F5: cell("45"),
          A6: cell("Performance optimization"), B6: cell("Medium"), C6: cell("Pending"), D6: cell("2024-03-30"), E6: cell("Henry Brown"), F6: cell("0"),
          A7: cell("Q1 marketing campaign"), B7: cell("High"), C7: cell("In Progress"), D7: cell("2024-03-31"), E7: cell("Carol Chen"), F7: cell("70"),
          A8: cell("Customer onboarding flow"), B8: cell("Medium"), C8: cell("Review"), D8: cell("2024-03-18"), E8: cell("Emma Wilson"), F8: cell("90"),
          A9: cell("Security audit"), B9: cell("Critical"), C9: cell("Scheduled"), D9: cell("2024-04-05"), E9: cell("Frank Davis"), F9: cell("0"),
          A10: cell("Mobile app prototype"), B10: cell("Low"), C10: cell("Planning"), D10: cell("2024-04-15"), E10: cell("Bob Martinez"), F10: cell("10"),
        },
      },
    ],
  },

  // 8. Project Planner
  {
    name: "Project Planner",
    description: "Multi-phase project planning with milestones",
    icon: "🗂️",
    sheets: [
      {
        name: "Plan",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 130, 1: 200, 2: 110, 3: 110, 4: 100, 5: 130, 6: 100 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Phase"), B1: header("Task"), C1: header("Start Date"), D1: header("End Date"), E1: header("Owner"), F1: header("Status"), G1: header("Budget"),
          A2: cell("Phase 1"), B2: cell("Discovery & Research"), C2: cell("2024-01-15"), D2: cell("2024-01-31"), E2: cell("Emma Wilson"), F2: cell("Complete"), G2: cell("5000"),
          A3: cell("Phase 1"), B3: cell("Stakeholder Interviews"), C3: cell("2024-01-16"), D3: cell("2024-01-25"), E3: cell("Carol Chen"), F3: cell("Complete"), G3: cell("2000"),
          A4: cell("Phase 2"), B4: cell("Technical Architecture"), C4: cell("2024-02-01"), D4: cell("2024-02-14"), E4: cell("Henry Brown"), F4: cell("Complete"), G4: cell("8000"),
          A5: cell("Phase 2"), B5: cell("Database Schema Design"), C5: cell("2024-02-05"), D5: cell("2024-02-10"), E5: cell("David Kim"), F5: cell("Complete"), G5: cell("3000"),
          A6: cell("Phase 3"), B6: cell("Frontend Development"), C6: cell("2024-02-15"), D6: cell("2024-03-15"), E6: cell("Alice Johnson"), F6: cell("In Progress"), G6: cell("20000"),
          A7: cell("Phase 3"), B7: cell("Backend API Development"), C7: cell("2024-02-15"), D7: cell("2024-03-20"), E7: cell("Alice Johnson"), F7: cell("In Progress"), G7: cell("25000"),
          A8: cell("Phase 4"), B8: cell("Integration Testing"), C8: cell("2024-03-21"), D8: cell("2024-04-05"), E8: cell("David Kim"), F8: cell("Pending"), G8: cell("7000"),
          A9: cell("Phase 4"), B9: cell("User Acceptance Testing"), C9: cell("2024-04-01"), D9: cell("2024-04-15"), E9: cell("Emma Wilson"), F9: cell("Pending"), G9: cell("5000"),
          A10: cell("Phase 5"), B10: cell("Production Deployment"), C10: cell("2024-04-16"), D10: cell("2024-04-18"), E10: cell("David Kim"), F10: cell("Pending"), G10: cell("3000"),
          A11: bold("Total Budget"), G11: cell("=SUM(G2:G10)", "=SUM(G2:G10)", { bold: true, format: "currency" }),
        },
      },
    ],
  },

  // 9. Sales Quote
  {
    name: "Sales Quote",
    description: "Professional sales quotation template",
    icon: "💼",
    sheets: [
      {
        name: "Quote",
        frozenRows: 0,
        frozenCols: 0,
        colWidths: { 0: 200, 1: 80, 2: 120, 3: 80, 4: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: cell("SALES QUOTE", undefined, { bold: true, textColor: "#1e3a5f" }),
          A2: cell("Vidyalaya Office Solutions"), D2: bold("Quote #:"), E2: cell("QTE-2024-0078"),
          A3: cell("sales@vidyalaya.com"), D3: bold("Date:"), E3: cell("2024-03-15"),
          D4: bold("Valid Until:"), E4: cell("2024-04-15"),
          A6: bold("Prepared For:"), A7: cell("Tech Innovations Inc."), A8: cell("789 Corporate Blvd"), A9: cell("Austin, TX 78701"),
          A11: header("Product / Service"), B11: header("Qty"), C11: header("Unit Price"), D11: header("Discount %"), E11: header("Total"),
          A12: cell("Enterprise Software License"), B12: cell("5"), C12: cell("2000"), D12: cell("15"), E12: currency("=B12*C12*(1-D12/100)"),
          A13: cell("Implementation Services"), B13: cell("1"), C13: cell("5000"), D13: cell("0"), E13: currency("=B13*C13*(1-D13/100)"),
          A14: cell("Annual Support Contract"), B14: cell("1"), C14: cell("3000"), D14: cell("10"), E14: currency("=B14*C14*(1-D14/100)"),
          A15: cell("Training (5 sessions)"), B15: cell("5"), C15: cell("400"), D15: cell("20"), E15: currency("=B15*C15*(1-D15/100)"),
          D16: bold("Subtotal:"), E16: currency("=SUM(E12:E15)"),
          D17: bold("Tax (8%):"), E17: currency("=E16*0.08"),
          D18: cell("QUOTE TOTAL:", undefined, { bold: true, bgColor: "#1e3a5f", textColor: "#ffffff" }),
          E18: cell("=E16+E17", "=E16+E17", { bold: true, format: "currency", bgColor: "#1e3a5f", textColor: "#ffffff" }),
          A20: cell("Terms: Quote valid for 30 days. 50% deposit required on acceptance."),
        },
      },
    ],
  },

  // 10. Purchase Order
  {
    name: "Purchase Order",
    description: "Vendor purchase order with line items",
    icon: "🛒",
    sheets: [
      {
        name: "PO",
        frozenRows: 0,
        frozenCols: 0,
        colWidths: { 0: 200, 1: 80, 2: 120, 3: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: cell("PURCHASE ORDER", undefined, { bold: true, textColor: "#1e3a5f" }),
          A2: cell("Vidyalaya Office Solutions"), C2: bold("PO Number:"), D2: cell("PO-2024-1234"),
          A3: cell("procurement@vidyalaya.com"), C3: bold("Date:"), D3: cell("2024-03-15"),
          C4: bold("Expected Delivery:"), D4: cell("2024-03-30"),
          A6: bold("Vendor:"), A7: cell("Global Supplies Ltd."), A8: cell("55 Supplier Lane"), A9: cell("Chicago, IL 60601"),
          A11: header("Item Description"), B11: header("Qty"), C11: header("Unit Price"), D11: header("Total"),
          A12: cell("Office Chairs (Ergonomic)"), B12: cell("10"), C12: cell("450"), D12: currency("=B12*C12"),
          A13: cell("Standing Desks"), B13: cell("5"), C13: cell("800"), D13: currency("=B13*C13"),
          A14: cell("Monitor Stands"), B14: cell("15"), C14: cell("65"), D14: currency("=B14*C14"),
          A15: cell("Laptop Docking Stations"), B15: cell("8"), C15: cell("180"), D15: currency("=B15*C15"),
          A16: cell("Webcams"), B16: cell("12"), C16: cell("70"), D16: currency("=B16*C16"),
          C17: bold("Subtotal:"), D17: currency("=SUM(D12:D16)"),
          C18: bold("Shipping:"), D18: currency("=D17*0.05"),
          C19: cell("TOTAL:", undefined, { bold: true, bgColor: "#1e3a5f", textColor: "#ffffff" }),
          D19: cell("=D17+D18", "=D17+D18", { bold: true, format: "currency", bgColor: "#1e3a5f", textColor: "#ffffff" }),
          A21: cell("Authorized Signature: _______________  Date: _______________"),
        },
      },
    ],
  },

  // 11. Expense Report
  {
    name: "Expense Report",
    description: "Employee expense tracking and reimbursement",
    icon: "🧳",
    sheets: [
      {
        name: "Expenses",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 100, 1: 150, 2: 120, 3: 80, 4: 200 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Date"), B1: header("Category"), C1: header("Amount ($)"), D1: header("Receipt"), E1: header("Description"),
          A2: cell("2024-03-01"), B2: cell("Travel"), C2: cell("485.00"), D2: cell("Yes"), E2: cell("Flight NYC to SF - Client Meeting"),
          A3: cell("2024-03-02"), B3: cell("Hotel"), C3: cell("289.00"), D3: cell("Yes"), E3: cell("Hotel Marriott - 2 nights"),
          A4: cell("2024-03-03"), B4: cell("Meals"), C4: cell("67.50"), D4: cell("Yes"), E4: cell("Team dinner - Client Entertainment"),
          A5: cell("2024-03-04"), B5: cell("Transportation"), C5: cell("45.00"), D5: cell("Yes"), E5: cell("Uber rides to meetings"),
          A6: cell("2024-03-05"), B6: cell("Office Supplies"), C6: cell("123.45"), D6: cell("Yes"), E6: cell("Printer cartridges & paper"),
          A7: cell("2024-03-06"), B7: cell("Meals"), C7: cell("34.80"), D7: cell("No"), E7: cell("Working lunch - internal meeting"),
          A8: cell("2024-03-07"), B8: cell("Software"), C8: cell("99.00"), D8: cell("Yes"), E8: cell("Adobe CC subscription"),
          A9: cell("2024-03-10"), B9: cell("Training"), C9: cell("299.00"), D9: cell("Yes"), E9: cell("React Advanced Conference ticket"),
          A10: cell("2024-03-12"), B10: cell("Travel"), C10: cell("215.00"), D10: cell("Yes"), E10: cell("Return flight SF to NYC"),
          A11: bold("TOTAL"), C11: cell("=SUM(C2:C10)", "=SUM(C2:C10)", { bold: true, format: "currency" }),
          A13: bold("Summary by Category"),
          A14: cell("Travel:"), B14: currency("=SUMIF(B2:B10,\"Travel\",C2:C10)"),
          A15: cell("Hotel:"), B15: currency("=SUMIF(B2:B10,\"Hotel\",C2:C10)"),
          A16: cell("Meals:"), B16: currency("=SUMIF(B2:B10,\"Meals\",C2:C10)"),
          A17: cell("Transportation:"), B17: currency("=SUMIF(B2:B10,\"Transportation\",C2:C10)"),
          A18: cell("Office Supplies:"), B18: currency("=SUMIF(B2:B10,\"Office Supplies\",C2:C10)"),
          A19: cell("Other:"), B19: currency("=SUMIF(B2:B10,\"Software\",C2:C10)+SUMIF(B2:B10,\"Training\",C2:C10)"),
        },
      },
    ],
  },

  // 12. Timesheet
  {
    name: "Timesheet",
    description: "Weekly time tracking by project",
    icon: "⏰",
    sheets: [
      {
        name: "Timesheet",
        frozenRows: 1,
        frozenCols: 1,
        colWidths: { 0: 180, 1: 70, 2: 70, 3: 70, 4: 70, 5: 70, 6: 80 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Project / Task"), B1: header("Mon"), C1: header("Tue"), D1: header("Wed"), E1: header("Thu"), F1: header("Fri"), G1: header("Total"),
          A2: cell("Project Alpha - Development"), B2: cell("4"), C2: cell("5"), D2: cell("3"), E2: cell("4"), F2: cell("4"), G2: num("=SUM(B2:F2)"),
          A3: cell("Project Beta - Design Review"), B3: cell("2"), C3: cell("1"), D3: cell("2"), E3: cell("2"), F3: cell("1"), G3: num("=SUM(B3:F3)"),
          A4: cell("Client Meetings"), B4: cell("1"), C4: cell("2"), D4: cell("1"), E4: cell("0"), F4: cell("1"), G4: num("=SUM(B4:F4)"),
          A5: cell("Internal Planning"), B5: cell("1"), C5: cell("0"), D5: cell("2"), E5: cell("1"), F5: cell("2"), G5: num("=SUM(B5:F5)"),
          A6: cell("Documentation"), B6: cell("0"), C6: cell("1"), D6: cell("1"), E6: cell("2"), F6: cell("1"), G6: num("=SUM(B6:F6)"),
          A7: cell("Code Review"), B7: cell("1"), C7: cell("0"), D7: cell("1"), E7: cell("1"), F7: cell("0"), G7: num("=SUM(B7:F7)"),
          A8: cell("Training"), B8: cell("0"), C8: cell("0"), D8: cell("0"), E8: cell("0"), F8: cell("1"), G8: num("=SUM(B8:F8)"),
          A9: bold("Daily Total"),
          B9: cell("=SUM(B2:B8)", "=SUM(B2:B8)", { bold: true, format: "number" }),
          C9: cell("=SUM(C2:C8)", "=SUM(C2:C8)", { bold: true, format: "number" }),
          D9: cell("=SUM(D2:D8)", "=SUM(D2:D8)", { bold: true, format: "number" }),
          E9: cell("=SUM(E2:E8)", "=SUM(E2:E8)", { bold: true, format: "number" }),
          F9: cell("=SUM(F2:F8)", "=SUM(F2:F8)", { bold: true, format: "number" }),
          G9: cell("=SUM(G2:G8)", "=SUM(G2:G8)", { bold: true, format: "number" }),
          A10: cell("Employee: _______________  Week of: _______________  Approved: _______________"),
        },
      },
    ],
  },

  // 13. Sales Forecasting
  {
    name: "Sales Forecasting",
    description: "Monthly sales data with forecast, moving average, and growth rate",
    icon: "📈",
    sheets: [
      {
        name: "Forecast",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 120, 1: 120, 2: 120, 3: 140, 4: 120, 5: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Month"),
          B1: header("Actual Sales ($)"),
          C1: header("Forecast ($)"),
          D1: header("3-Mo Avg ($)"),
          E1: header("Growth Rate"),
          F1: header("Variance ($)"),
          A2: cell("Jan 2025"), B2: cell("124000"), C2: cell("120000"), D2: cell("—"), E2: cell("—"), F2: currency("=B2-C2"),
          A3: cell("Feb 2025"), B3: cell("131000"), C3: cell("126000"), D3: cell("—"), E3: pct("=(B3-B2)/B2"), F3: currency("=B3-C3"),
          A4: cell("Mar 2025"), B4: cell("118000"), C4: cell("133000"), D4: num("=(B2+B3+B4)/3"), E4: pct("=(B4-B3)/B3"), F4: currency("=B4-C4"),
          A5: cell("Apr 2025"), B5: cell("142000"), C5: cell("125000"), D5: num("=(B3+B4+B5)/3"), E5: pct("=(B5-B4)/B4"), F5: currency("=B5-C5"),
          A6: cell("May 2025"), B6: cell("156000"), C6: cell("145000"), D6: num("=(B4+B5+B6)/3"), E6: pct("=(B6-B5)/B5"), F6: currency("=B6-C6"),
          A7: cell("Jun 2025"), B7: cell("149000"), C7: cell("155000"), D7: num("=(B5+B6+B7)/3"), E7: pct("=(B7-B6)/B6"), F7: currency("=B7-C7"),
          A8: cell("Jul 2025"), B8: cell("163000"), C8: cell("152000"), D8: num("=(B6+B7+B8)/3"), E8: pct("=(B8-B7)/B7"), F8: currency("=B8-C8"),
          A9: cell("Aug 2025"), B9: cell("171000"), C9: cell("165000"), D9: num("=(B7+B8+B9)/3"), E9: pct("=(B9-B8)/B8"), F9: currency("=B9-C9"),
          A10: cell("Sep 2025"), B10: cell("158000"), C10: cell("170000"), D10: num("=(B8+B9+B10)/3"), E10: pct("=(B10-B9)/B9"), F10: currency("=B10-C10"),
          A11: cell("Oct 2025"), B11: cell("182000"), C11: cell("162000"), D11: num("=(B9+B10+B11)/3"), E11: pct("=(B11-B10)/B10"), F11: currency("=B11-C11"),
          A12: bold("Total"),
          B12: cell("=SUM(B2:B11)", "=SUM(B2:B11)", { bold: true, format: "currency" }),
          C12: cell("=SUM(C2:C11)", "=SUM(C2:C11)", { bold: true, format: "currency" }),
          F12: cell("=SUM(F2:F11)", "=SUM(F2:F11)", { bold: true, format: "currency" }),
        },
      },
    ],
  },

  // 14. HR Headcount Analysis
  {
    name: "HR Headcount Analysis",
    description: "Department headcount tracking with attrition, hiring plan, and cost per employee",
    icon: "🏢",
    sheets: [
      {
        name: "Headcount",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 150, 1: 100, 2: 100, 3: 110, 4: 110, 5: 130, 6: 130 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Department"),
          B1: header("Headcount"),
          C1: header("Attrition"),
          D1: header("Attrition Rate"),
          E1: header("Open Roles"),
          F1: header("Avg Salary ($)"),
          G1: header("Dept Cost ($)"),
          A2: bold("Engineering"), B2: cell("48"), C2: cell("5"), D2: pct("=C2/B2"), E2: cell("8"), F2: cell("135000"), G2: currency("=B2*F2"),
          A3: bold("Product"), B3: cell("14"), C3: cell("1"), D3: pct("=C3/B3"), E3: cell("3"), F3: cell("128000"), G3: currency("=B3*F3"),
          A4: bold("Design"), B4: cell("10"), C4: cell("2"), D4: pct("=C4/B4"), E4: cell("2"), F4: cell("115000"), G4: currency("=B4*F4"),
          A5: bold("Marketing"), B5: cell("18"), C5: cell("3"), D5: pct("=C5/B5"), E5: cell("4"), F5: cell("105000"), G5: currency("=B5*F5"),
          A6: bold("Sales"), B6: cell("32"), C6: cell("6"), D6: pct("=C6/B6"), E6: cell("5"), F6: cell("95000"), G6: currency("=B6*F6"),
          A7: bold("Finance"), B7: cell("8"), C7: cell("0"), D7: pct("=C7/B7"), E7: cell("1"), F7: cell("120000"), G7: currency("=B7*F7"),
          A8: bold("HR"), B8: cell("6"), C8: cell("1"), D8: pct("=C8/B8"), E8: cell("1"), F8: cell("98000"), G8: currency("=B8*F8"),
          A9: bold("Operations"), B9: cell("12"), C9: cell("2"), D9: pct("=C9/B9"), E9: cell("2"), F9: cell("88000"), G9: currency("=B9*F9"),
          A10: bold("Legal"), B10: cell("4"), C10: cell("0"), D10: pct("=C10/B10"), E10: cell("1"), F10: cell("145000"), G10: currency("=B10*F10"),
          A11: bold("Customer Support"), B11: cell("22"), C11: cell("4"), D11: pct("=C11/B11"), E11: cell("3"), F11: cell("72000"), G11: currency("=B11*F11"),
          A12: cell("TOTAL", undefined, { bold: true, bgColor: "#2d6a4f", textColor: "#ffffff" }),
          B12: cell("=SUM(B2:B11)", "=SUM(B2:B11)", { bold: true, format: "number", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          C12: cell("=SUM(C2:C11)", "=SUM(C2:C11)", { bold: true, format: "number", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          D12: cell("=C12/B12", "=C12/B12", { bold: true, format: "percentage", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          E12: cell("=SUM(E2:E11)", "=SUM(E2:E11)", { bold: true, format: "number", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          G12: cell("=SUM(G2:G11)", "=SUM(G2:G11)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
        },
      },
    ],
  },

  // 15. Inventory Management
  {
    name: "Inventory Management",
    description: "SKU tracking with reorder points, EOQ calculations, and stock turnover",
    icon: "🏭",
    sheets: [
      {
        name: "Inventory",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 160, 1: 100, 2: 100, 3: 110, 4: 100, 5: 100, 6: 100, 7: 110 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Product"),
          B1: header("SKU"),
          C1: header("Qty on Hand"),
          D1: header("Reorder Point"),
          E1: header("Annual Demand"),
          F1: header("Unit Cost ($)"),
          G1: header("EOQ"),
          H1: header("Stock Turnover"),
          A2: cell("Industrial Bearings"), B2: cell("BRG-4420"), C2: cell("1200"), D2: cell("500"), E2: cell("6000"), F2: cell("12.50"), G2: num("=SQRT(2*E2*25/1.50)"), H2: num("=E2/C2"),
          A3: cell("Hydraulic Seals"), B3: cell("SEL-1180"), C3: cell("340"), D3: cell("200"), E3: cell("2400"), F3: cell("8.75"), G3: num("=SQRT(2*E3*25/1.05)"), H3: num("=E3/C3"),
          A4: cell("Steel Rods 10mm"), B4: cell("STL-1010"), C4: cell("5600"), D4: cell("2000"), E4: cell("24000"), F4: cell("3.20"), G4: num("=SQRT(2*E4*25/0.38)"), H4: num("=E4/C4"),
          A5: cell("Copper Wire Spool"), B5: cell("COP-2250"), C5: cell("180"), D5: cell("100"), E5: cell("900"), F5: cell("45.00"), G5: num("=SQRT(2*E5*25/5.40)"), H5: num("=E5/C5"),
          A6: cell("Nylon Bushings"), B6: cell("NYL-0830"), C6: cell("2800"), D6: cell("1000"), E6: cell("12000"), F6: cell("1.85"), G6: num("=SQRT(2*E6*25/0.22)"), H6: num("=E6/C6"),
          A7: cell("Aluminum Sheets"), B7: cell("ALU-3060"), C7: cell("420"), D7: cell("300"), E7: cell("3600"), F7: cell("28.50"), G7: num("=SQRT(2*E7*25/3.42)"), H7: num("=E7/C7"),
          A8: cell("Rubber Gaskets"), B8: cell("RBR-0550"), C8: cell("4100"), D8: cell("1500"), E8: cell("18000"), F8: cell("0.95"), G8: num("=SQRT(2*E8*25/0.11)"), H8: num("=E8/C8"),
          A9: cell("Stainless Bolts M8"), B9: cell("BLT-0880"), C9: cell("9500"), D9: cell("3000"), E9: cell("36000"), F9: cell("0.35"), G9: num("=SQRT(2*E9*25/0.04)"), H9: num("=E9/C9"),
          A10: cell("Ceramic Insulators"), B10: cell("CER-1200"), C10: cell("650"), D10: cell("400"), E10: cell("4800"), F10: cell("6.70"), G10: num("=SQRT(2*E10*25/0.80)"), H10: num("=E10/C10"),
          A11: cell("Titanium Pins"), B11: cell("TIT-0330"), C11: cell("85"), D11: cell("50"), E11: cell("600"), F11: cell("72.00"), G11: num("=SQRT(2*E11*25/8.64)"), H11: num("=E11/C11"),
          A12: bold("Total Inventory Value"),
          F12: cell("=SUMPRODUCT(C2:C11,F2:F11)", "=SUMPRODUCT(C2:C11,F2:F11)", { bold: true, format: "currency" }),
        },
      },
    ],
  },

  // 16. Budget Variance Analysis
  {
    name: "Budget Variance Analysis",
    description: "Department budgets with planned, actual, variance, and YTD tracking",
    icon: "📋",
    sheets: [
      {
        name: "Variance",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 160, 1: 120, 2: 120, 3: 120, 4: 110, 5: 120, 6: 120 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Department"),
          B1: header("Planned ($)"),
          C1: header("Actual ($)"),
          D1: header("Variance ($)"),
          E1: header("Variance %"),
          F1: header("YTD Budget ($)"),
          G1: header("YTD Actual ($)"),
          A2: bold("Engineering"), B2: cell("185000"), C2: cell("192500"), D2: currency("=B2-C2"), E2: pct("=(B2-C2)/B2"), F2: cell("555000"), G2: cell("571200"),
          A3: bold("Marketing"), B3: cell("95000"), C3: cell("88400"), D3: currency("=B3-C3"), E3: pct("=(B3-C3)/B3"), F3: cell("285000"), G3: cell("268700"),
          A4: bold("Sales"), B4: cell("120000"), C4: cell("125800"), D4: currency("=B4-C4"), E4: pct("=(B4-C4)/B4"), F4: cell("360000"), G4: cell("372100"),
          A5: bold("Operations"), B5: cell("78000"), C5: cell("74200"), D5: currency("=B5-C5"), E5: pct("=(B5-C5)/B5"), F5: cell("234000"), G5: cell("225800"),
          A6: bold("Human Resources"), B6: cell("52000"), C6: cell("53100"), D6: currency("=B6-C6"), E6: pct("=(B6-C6)/B6"), F6: cell("156000"), G6: cell("158400"),
          A7: bold("Finance"), B7: cell("45000"), C7: cell("43800"), D7: currency("=B7-C7"), E7: pct("=(B7-C7)/B7"), F7: cell("135000"), G7: cell("132600"),
          A8: bold("Legal"), B8: cell("38000"), C8: cell("41200"), D8: currency("=B8-C8"), E8: pct("=(B8-C8)/B8"), F8: cell("114000"), G8: cell("119500"),
          A9: bold("R&D"), B9: cell("210000"), C9: cell("205600"), D9: currency("=B9-C9"), E9: pct("=(B9-C9)/B9"), F9: cell("630000"), G9: cell("618300"),
          A10: bold("Customer Support"), B10: cell("62000"), C10: cell("64500"), D10: currency("=B10-C10"), E10: pct("=(B10-C10)/B10"), F10: cell("186000"), G10: cell("191200"),
          A11: bold("Facilities"), B11: cell("35000"), C11: cell("33900"), D11: currency("=B11-C11"), E11: pct("=(B11-C11)/B11"), F11: cell("105000"), G11: cell("102400"),
          A12: cell("TOTAL", undefined, { bold: true, bgColor: "#2d6a4f", textColor: "#ffffff" }),
          B12: cell("=SUM(B2:B11)", "=SUM(B2:B11)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          C12: cell("=SUM(C2:C11)", "=SUM(C2:C11)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          D12: cell("=B12-C12", "=B12-C12", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          E12: cell("=(B12-C12)/B12", "=(B12-C12)/B12", { bold: true, format: "percentage", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          F12: cell("=SUM(F2:F11)", "=SUM(F2:F11)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          G12: cell("=SUM(G2:G11)", "=SUM(G2:G11)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
        },
      },
    ],
  },

  // 17. Expense Report (Department-wise)
  {
    name: "Dept Expense Report",
    description: "Employee expense tracking with categories, approval status, and monthly totals",
    icon: "💳",
    sheets: [
      {
        name: "Expenses",
        frozenRows: 1,
        frozenCols: 0,
        colWidths: { 0: 130, 1: 120, 2: 130, 3: 110, 4: 110, 5: 110, 6: 100 },
        rowHeights: {},
        conditionalFormats: [],
        cells: {
          A1: header("Employee"),
          B1: header("Department"),
          C1: header("Category"),
          D1: header("Amount ($)"),
          E1: header("Date"),
          F1: header("Status"),
          G1: header("Month Total"),
          A2: cell("Sarah Mitchell"), B2: cell("Sales"), C2: cell("Client Meals"), D2: cell("245.80"), E2: cell("2025-03-02"), F2: cell("Approved"), G2: currency("=SUMIF(A2:A11,A2,D2:D11)"),
          A3: cell("James Parker"), B3: cell("Engineering"), C3: cell("Conference Fee"), D3: cell("1500.00"), E3: cell("2025-03-03"), F3: cell("Approved"), G3: currency("=SUMIF(A2:A11,A3,D2:D11)"),
          A4: cell("Sarah Mitchell"), B4: cell("Sales"), C4: cell("Travel - Airfare"), D4: cell("487.50"), E4: cell("2025-03-05"), F4: cell("Approved"), G4: cell(""),
          A5: cell("Nina Rodriguez"), B5: cell("Marketing"), C5: cell("Ad Spend"), D5: cell("3200.00"), E5: cell("2025-03-06"), F5: cell("Pending"), G5: currency("=SUMIF(A2:A11,A5,D2:D11)"),
          A6: cell("James Parker"), B6: cell("Engineering"), C6: cell("Software License"), D6: cell("299.00"), E6: cell("2025-03-08"), F6: cell("Approved"), G6: cell(""),
          A7: cell("Tom Edwards"), B7: cell("Operations"), C7: cell("Equipment Repair"), D7: cell("875.00"), E7: cell("2025-03-10"), F7: cell("Approved"), G7: currency("=SUMIF(A2:A11,A7,D2:D11)"),
          A8: cell("Nina Rodriguez"), B8: cell("Marketing"), C8: cell("Event Catering"), D8: cell("1650.00"), E8: cell("2025-03-11"), F8: cell("Pending"), G8: cell(""),
          A9: cell("Lisa Chang"), B9: cell("HR"), C9: cell("Recruiting - Job Ads"), D9: cell("420.00"), E9: cell("2025-03-12"), F9: cell("Rejected"), G9: currency("=SUMIF(A2:A11,A9,D2:D11)"),
          A10: cell("Tom Edwards"), B10: cell("Operations"), C10: cell("Office Supplies"), D10: cell("186.30"), E10: cell("2025-03-13"), F10: cell("Approved"), G10: cell(""),
          A11: cell("Lisa Chang"), B11: cell("HR"), C11: cell("Training Materials"), D11: cell("340.00"), E11: cell("2025-03-14"), F11: cell("Approved"), G11: cell(""),
          A12: cell("TOTAL", undefined, { bold: true, bgColor: "#2d6a4f", textColor: "#ffffff" }),
          D12: cell("=SUM(D2:D11)", "=SUM(D2:D11)", { bold: true, format: "currency", bgColor: "#2d6a4f", textColor: "#ffffff" }),
          A14: bold("By Status"),
          A15: cell("Approved:"), B15: cell("7"), D15: currency("=SUMIF(F2:F11,\"Approved\",D2:D11)"),
          A16: cell("Pending:"), B16: cell("2"), D16: currency("=SUMIF(F2:F11,\"Pending\",D2:D11)"),
          A17: cell("Rejected:"), B17: cell("1"), D17: currency("=SUMIF(F2:F11,\"Rejected\",D2:D11)"),
        },
      },
    ],
  },
];
