"use client";

import { useRouter } from "next/navigation";
import { Table2, Eye } from "lucide-react";
import { useState } from "react";

// ── Cell helpers ──────────────────────────────────────────────────────────────
type CellStyle = { bold?: boolean; bgColor?: string; textColor?: string; format?: string; align?: string };
type CellData = { raw: string; style: CellStyle };

const hdr = (raw: string, bg = "#1565C0"): CellData => ({ raw, style: { bold: true, bgColor: bg, textColor: "#ffffff" } });
const cell = (raw: string, style?: CellStyle): CellData => ({ raw, style: style || {} });
const bold = (raw: string): CellData => ({ raw, style: { bold: true } });
const numCell = (raw: string): CellData => ({ raw, style: { format: "number" } });
const curCell = (raw: string): CellData => ({ raw, style: { format: "currency" } });
const pctCell = (raw: string): CellData => ({ raw, style: { format: "percent" } });
const mk = (data: Record<string, CellData>): string => JSON.stringify({ cells: data });

// ── 1. Budget Tracker ─────────────────────────────────────────────────────────
const budgetTracker = mk({
  A1: hdr("MONTHLY BUDGET TRACKER", "#0D47A1"), B1: hdr("", "#0D47A1"), C1: hdr("", "#0D47A1"), D1: hdr("", "#0D47A1"), E1: hdr("", "#0D47A1"),
  A3: hdr("Income Source"), B3: hdr("Jan"), C3: hdr("Feb"), D3: hdr("Mar"), E3: hdr("Q1 Total"),
  A4: cell("Salary"), B4: curCell("8500"), C4: curCell("8500"), D4: curCell("8500"), E4: cell("=SUM(B4:D4)"),
  A5: cell("Freelance"), B5: curCell("2000"), C5: curCell("1500"), D5: curCell("2800"), E5: cell("=SUM(B5:D5)"),
  A6: cell("Investments"), B6: curCell("450"), C6: curCell("520"), D6: curCell("380"), E6: cell("=SUM(B6:D6)"),
  A7: cell("Rental Income"), B7: curCell("1200"), C7: curCell("1200"), D7: curCell("1200"), E7: cell("=SUM(B7:D7)"),
  A8: bold("Total Income"), B8: cell("=SUM(B4:B7)"), C8: cell("=SUM(C4:C7)"), D8: cell("=SUM(D4:D7)"), E8: cell("=SUM(E4:E7)"),

  A10: hdr("Expense Category", "#C62828"), B10: hdr("Jan", "#C62828"), C10: hdr("Feb", "#C62828"), D10: hdr("Mar", "#C62828"), E10: hdr("Q1 Total", "#C62828"),
  A11: cell("Housing/Rent"), B11: curCell("2200"), C11: curCell("2200"), D11: curCell("2200"), E11: cell("=SUM(B11:D11)"),
  A12: cell("Utilities"), B12: curCell("320"), C12: curCell("290"), D12: curCell("310"), E12: cell("=SUM(B12:D12)"),
  A13: cell("Groceries"), B13: curCell("650"), C13: curCell("720"), D13: curCell("680"), E13: cell("=SUM(B13:D13)"),
  A14: cell("Transportation"), B14: curCell("350"), C14: curCell("380"), D14: curCell("340"), E14: cell("=SUM(B14:D14)"),
  A15: cell("Insurance"), B15: curCell("450"), C15: curCell("450"), D15: curCell("450"), E15: cell("=SUM(B15:D15)"),
  A16: cell("Entertainment"), B16: curCell("200"), C16: curCell("350"), D16: curCell("180"), E16: cell("=SUM(B16:D16)"),
  A17: cell("Savings/401k"), B17: curCell("1500"), C17: curCell("1500"), D17: curCell("1500"), E17: cell("=SUM(B17:D17)"),
  A18: cell("Healthcare"), B18: curCell("180"), C18: curCell("150"), D18: curCell("220"), E18: cell("=SUM(B18:D18)"),
  A19: cell("Subscriptions"), B19: curCell("85"), C19: curCell("85"), D19: curCell("85"), E19: cell("=SUM(B19:D19)"),
  A20: cell("Miscellaneous"), B20: curCell("300"), C20: curCell("250"), D20: curCell("280"), E20: cell("=SUM(B20:D20)"),
  A21: bold("Total Expenses"), B21: cell("=SUM(B11:B20)"), C21: cell("=SUM(C11:C20)"), D21: cell("=SUM(D11:D20)"), E21: cell("=SUM(E11:E20)"),

  A23: { raw: "Net Savings", style: { bold: true, bgColor: "#E8F5E9" } },
  B23: cell("=B8-B21"), C23: cell("=C8-C21"), D23: cell("=D8-D21"), E23: cell("=E8-E21"),
  A24: cell("Savings Rate"), B24: pctCell("=B23/B8"), C24: pctCell("=C23/C8"), D24: pctCell("=D23/D8"), E24: pctCell("=E23/E8"),
});

// ── 2. Invoice Generator ──────────────────────────────────────────────────────
const invoiceGenerator = mk({
  A1: { raw: "INVOICE", style: { bold: true, bgColor: "#1A237E", textColor: "#ffffff" } },
  B1: { raw: "", style: { bgColor: "#1A237E" } }, C1: { raw: "", style: { bgColor: "#1A237E" } },
  D1: { raw: "", style: { bgColor: "#1A237E" } }, E1: { raw: "", style: { bgColor: "#1A237E" } },

  A3: bold("From:"), A4: cell("Vidyalaya Solutions Pvt. Ltd."), A5: cell("123 Tech Park, Suite 400"),
  A6: cell("Bangalore, KA 560001"), A7: cell("GSTIN: 29ABCDE1234F1Z5"),

  D3: bold("Invoice #:"), E3: cell("INV-2026-0042"),
  D4: bold("Date:"), E4: cell("March 15, 2026"),
  D5: bold("Due Date:"), E5: cell("April 14, 2026"),
  D6: bold("PO Number:"), E6: cell("PO-2026-1128"),

  A9: bold("Bill To:"), A10: cell("Global Enterprises Inc."), A11: cell("456 Corporate Blvd"),
  A12: cell("Mumbai, MH 400001"), A13: cell("GSTIN: 27FGHIJ5678K1Z3"),

  A15: hdr("Description", "#1A237E"), B15: hdr("Hours/Qty", "#1A237E"), C15: hdr("Rate", "#1A237E"),
  D15: hdr("Amount", "#1A237E"), E15: hdr("Tax", "#1A237E"),

  A16: cell("Web Application Development"), B16: numCell("120"), C16: curCell("150"), D16: cell("=B16*C16"), E16: cell("=D16*0.18"),
  A17: cell("UI/UX Design Services"), B17: numCell("45"), C17: curCell("125"), D17: cell("=B17*C17"), E17: cell("=D17*0.18"),
  A18: cell("Database Architecture"), B18: numCell("30"), C18: curCell("175"), D18: cell("=B18*C18"), E18: cell("=D18*0.18"),
  A19: cell("API Integration"), B19: numCell("60"), C19: curCell("160"), D19: cell("=B19*C19"), E19: cell("=D19*0.18"),
  A20: cell("Quality Assurance & Testing"), B20: numCell("40"), C20: curCell("110"), D20: cell("=B20*C20"), E20: cell("=D20*0.18"),
  A21: cell("Project Management"), B21: numCell("25"), C21: curCell("130"), D21: cell("=B21*C21"), E21: cell("=D21*0.18"),
  A22: cell("Cloud Infrastructure Setup"), B22: numCell("1"), C22: curCell("5000"), D22: cell("=B22*C22"), E22: cell("=D22*0.18"),

  A24: bold("Subtotal"), D24: cell("=SUM(D16:D22)"),
  A25: cell("CGST (9%)"), D25: cell("=D24*0.09"),
  A26: cell("SGST (9%)"), D26: cell("=D24*0.09"),
  A27: { raw: "TOTAL DUE", style: { bold: true, bgColor: "#1A237E", textColor: "#ffffff" } },
  D27: cell("=D24+D25+D26"),

  A29: bold("Payment Terms:"), A30: cell("Net 30 | Bank: HDFC Bank | A/C: 1234567890 | IFSC: HDFC0001234"),
  A31: cell("Late payments subject to 1.5% monthly interest"),
});

// ── 3. Project Timeline / Gantt Chart ─────────────────────────────────────────
const projectTimeline = mk({
  A1: { raw: "PROJECT TIMELINE - Website Redesign", style: { bold: true, bgColor: "#00695C", textColor: "#ffffff" } },

  A3: hdr("Phase / Task", "#00695C"), B3: hdr("Owner", "#00695C"), C3: hdr("Start", "#00695C"),
  D3: hdr("End", "#00695C"), E3: hdr("Days", "#00695C"), F3: hdr("Status", "#00695C"),
  G3: hdr("% Done", "#00695C"), H3: hdr("Dependencies", "#00695C"),

  A4: bold("Phase 1: Discovery & Planning"),
  A5: cell("  Stakeholder Interviews"), B5: cell("Sarah K."), C5: cell("Mar 01"), D5: cell("Mar 07"), E5: numCell("5"), F5: cell("Complete"), G5: pctCell("1.0"), H5: cell("—"),
  A6: cell("  Competitive Analysis"), B6: cell("Mike T."), C6: cell("Mar 03"), D6: cell("Mar 10"), E6: numCell("6"), F6: cell("Complete"), G6: pctCell("1.0"), H6: cell("—"),
  A7: cell("  Requirements Document"), B7: cell("Sarah K."), C7: cell("Mar 08"), D7: cell("Mar 14"), E7: numCell("5"), F7: cell("Complete"), G7: pctCell("1.0"), H7: cell("Task 1, 2"),
  A8: cell("  Project Plan & Budget"), B8: cell("PM Lead"), C8: cell("Mar 12"), D8: cell("Mar 15"), E8: numCell("4"), F8: cell("Complete"), G8: pctCell("1.0"), H8: cell("Task 3"),

  A10: bold("Phase 2: Design"),
  A11: cell("  Wireframes & Mockups"), B11: cell("Alex D."), C11: cell("Mar 16"), D11: cell("Mar 28"), E11: numCell("10"), F11: cell("In Progress"), G11: pctCell("0.75"), H11: cell("Phase 1"),
  A12: cell("  Design System & Style Guide"), B12: cell("Alex D."), C12: cell("Mar 22"), D12: cell("Apr 02"), E12: numCell("8"), F12: cell("In Progress"), G12: pctCell("0.40"), H12: cell("Task 5"),
  A13: cell("  Prototype & User Testing"), B13: cell("UX Team"), C13: cell("Mar 30"), D13: cell("Apr 10"), E13: numCell("8"), F13: cell("Not Started"), G13: pctCell("0.0"), H13: cell("Task 5, 6"),
  A14: cell("  Design Review & Sign-off"), B14: cell("Stakeholders"), C14: cell("Apr 11"), D14: cell("Apr 14"), E14: numCell("2"), F14: cell("Not Started"), G14: pctCell("0.0"), H14: cell("Task 7"),

  A16: bold("Phase 3: Development"),
  A17: cell("  Frontend Development"), B17: cell("Dev Team A"), C17: cell("Apr 15"), D17: cell("May 12"), E17: numCell("20"), F17: cell("Not Started"), G17: pctCell("0.0"), H17: cell("Phase 2"),
  A18: cell("  Backend & API Development"), B18: cell("Dev Team B"), C18: cell("Apr 15"), D18: cell("May 12"), E18: numCell("20"), F18: cell("Not Started"), G18: pctCell("0.0"), H18: cell("Phase 2"),
  A19: cell("  CMS Integration"), B19: cell("Dev Team A"), C19: cell("May 05"), D19: cell("May 16"), E19: numCell("8"), F19: cell("Not Started"), G19: pctCell("0.0"), H19: cell("Task 9"),
  A20: cell("  Third-party Integrations"), B20: cell("Dev Team B"), C20: cell("May 10"), D20: cell("May 20"), E20: numCell("7"), F20: cell("Not Started"), G20: pctCell("0.0"), H20: cell("Task 10"),

  A22: bold("Phase 4: Testing & Launch"),
  A23: cell("  QA & Bug Fixing"), B23: cell("QA Team"), C23: cell("May 15"), D23: cell("May 28"), E23: numCell("10"), F23: cell("Not Started"), G23: pctCell("0.0"), H23: cell("Phase 3"),
  A24: cell("  Performance Optimization"), B24: cell("DevOps"), C24: cell("May 22"), D24: cell("May 28"), E24: numCell("5"), F24: cell("Not Started"), G24: pctCell("0.0"), H24: cell("Task 13"),
  A25: cell("  UAT & Final Approval"), B25: cell("Stakeholders"), C25: cell("May 29"), D25: cell("Jun 02"), E25: numCell("3"), F25: cell("Not Started"), G25: pctCell("0.0"), H25: cell("Task 13, 14"),
  A26: cell("  Go-Live & Monitoring"), B26: cell("DevOps"), C26: cell("Jun 03"), D26: cell("Jun 05"), E26: numCell("3"), F26: cell("Not Started"), G26: pctCell("0.0"), H26: cell("Task 15"),

  A28: bold("Summary"), E28: cell("=SUM(E5:E8)+SUM(E11:E14)+SUM(E17:E20)+SUM(E23:E26)"),
  F28: cell("Total Working Days"),
});

// ── 4. Sales Dashboard with KPIs ──────────────────────────────────────────────
const salesDashboard = mk({
  A1: { raw: "SALES DASHBOARD - FY 2025-26", style: { bold: true, bgColor: "#E65100", textColor: "#ffffff" } },

  A3: hdr("KEY METRICS", "#E65100"), B3: hdr("Target", "#E65100"), C3: hdr("Actual", "#E65100"),
  D3: hdr("Achievement", "#E65100"), E3: hdr("Status", "#E65100"),
  A4: cell("Annual Revenue"), B4: curCell("5000000"), C4: curCell("4250000"), D4: pctCell("=C4/B4"), E4: cell("On Track"),
  A5: cell("New Customers"), B5: numCell("200"), C5: numCell("178"), D5: pctCell("=C5/B5"), E5: cell("On Track"),
  A6: cell("Avg Deal Size"), B6: curCell("25000"), C6: curCell("28500"), D6: pctCell("=C6/B6"), E6: cell("Exceeded"),
  A7: cell("Win Rate"), B7: pctCell("0.35"), C7: pctCell("0.42"), D7: pctCell("=C7/B7"), E7: cell("Exceeded"),
  A8: cell("Sales Cycle (days)"), B8: numCell("45"), C8: numCell("38"), D8: cell("38 vs 45"), E8: cell("Improved"),
  A9: cell("Customer Retention"), B9: pctCell("0.90"), C9: pctCell("0.93"), D9: pctCell("=C9/B9"), E9: cell("Exceeded"),

  A11: hdr("Monthly Revenue", "#E65100"), B11: hdr("Revenue", "#E65100"), C11: hdr("Deals", "#E65100"),
  D11: hdr("Avg Deal", "#E65100"), E11: hdr("New Leads", "#E65100"), F11: hdr("Conversion", "#E65100"),
  A12: cell("January"), B12: curCell("380000"), C12: numCell("14"), D12: cell("=B12/C12"), E12: numCell("85"), F12: pctCell("=C12/E12"),
  A13: cell("February"), B13: curCell("420000"), C13: numCell("16"), D13: cell("=B13/C13"), E13: numCell("92"), F13: pctCell("=C13/E13"),
  A14: cell("March"), B14: curCell("465000"), C14: numCell("18"), D14: cell("=B14/C14"), E14: numCell("105"), F14: pctCell("=C14/E14"),
  A15: cell("April"), B15: curCell("510000"), C15: numCell("20"), D15: cell("=B15/C15"), E15: numCell("98"), F15: pctCell("=C15/E15"),
  A16: cell("May"), B16: curCell("485000"), C16: numCell("17"), D16: cell("=B16/C16"), E16: numCell("110"), F16: pctCell("=C16/E16"),
  A17: cell("June"), B17: curCell("550000"), C17: numCell("22"), D17: cell("=B17/C17"), E17: numCell("115"), F17: pctCell("=C17/E17"),
  A18: cell("July"), B18: curCell("495000"), C18: numCell("19"), D18: cell("=B18/C18"), E18: numCell("102"), F18: pctCell("=C18/E18"),
  A19: cell("August"), B19: curCell("530000"), C19: numCell("21"), D19: cell("=B19/C19"), E19: numCell("95"), F19: pctCell("=C19/E19"),
  A20: cell("September"), B20: curCell("415000"), C20: numCell("15"), D20: cell("=B20/C20"), E20: numCell("88"), F20: pctCell("=C20/E20"),
  A21: bold("YTD Total"), B21: cell("=SUM(B12:B20)"), C21: cell("=SUM(C12:C20)"), D21: cell("=B21/C21"),
  E21: cell("=SUM(E12:E20)"), F21: pctCell("=C21/E21"),

  A23: hdr("Top Sales Reps", "#E65100"), B23: hdr("Revenue", "#E65100"), C23: hdr("Deals Won", "#E65100"),
  D23: hdr("Quota %", "#E65100"), E23: hdr("Commission", "#E65100"),
  A24: cell("Priya Sharma"), B24: curCell("892000"), C24: numCell("35"), D24: pctCell("1.12"), E24: cell("=B24*0.08"),
  A25: cell("Rahul Verma"), B25: curCell("784000"), C25: numCell("29"), D25: pctCell("0.98"), E25: cell("=B25*0.08"),
  A26: cell("Anita Desai"), B26: curCell("725000"), C26: numCell("27"), D26: pctCell("0.91"), E26: cell("=B26*0.08"),
  A27: cell("Vikram Singh"), B27: curCell("680000"), C27: numCell("24"), D27: pctCell("0.85"), E27: cell("=B27*0.07"),
  A28: cell("Neha Patel"), B28: curCell("615000"), C28: numCell("22"), D28: pctCell("0.77"), E28: cell("=B28*0.07"),
  A29: bold("Team Total"), B29: cell("=SUM(B24:B28)"), C29: cell("=SUM(C24:C28)"), E29: cell("=SUM(E24:E28)"),
});

// ── 5. Employee Attendance Tracker ────────────────────────────────────────────
const attendanceTracker = mk({
  A1: { raw: "EMPLOYEE ATTENDANCE TRACKER - March 2026", style: { bold: true, bgColor: "#6A1B9A", textColor: "#ffffff" } },

  A3: hdr("Employee", "#6A1B9A"), B3: hdr("ID", "#6A1B9A"), C3: hdr("Dept", "#6A1B9A"),
  D3: hdr("Working Days", "#6A1B9A"), E3: hdr("Present", "#6A1B9A"), F3: hdr("Absent", "#6A1B9A"),
  G3: hdr("Late", "#6A1B9A"), H3: hdr("Half Day", "#6A1B9A"), I3: hdr("WFH", "#6A1B9A"),
  J3: hdr("Leaves Used", "#6A1B9A"), K3: hdr("Attendance %", "#6A1B9A"),

  A4: cell("Arun Kumar"), B4: cell("EMP-001"), C4: cell("Engineering"), D4: numCell("22"), E4: numCell("20"), F4: numCell("1"), G4: numCell("2"), H4: numCell("1"), I4: numCell("5"), J4: numCell("1"), K4: pctCell("=E4/D4"),
  A5: cell("Meera Iyer"), B5: cell("EMP-002"), C5: cell("Design"), D5: numCell("22"), E5: numCell("22"), F5: numCell("0"), G5: numCell("0"), H5: numCell("0"), I5: numCell("3"), J5: numCell("0"), K5: pctCell("=E5/D5"),
  A6: cell("Rajesh Nair"), B6: cell("EMP-003"), C6: cell("Marketing"), D6: numCell("22"), E6: numCell("18"), F6: numCell("3"), G6: numCell("1"), H6: numCell("2"), I6: numCell("4"), J6: numCell("3"), K6: pctCell("=E6/D6"),
  A7: cell("Sneha Gupta"), B7: cell("EMP-004"), C7: cell("Sales"), D7: numCell("22"), E7: numCell("21"), F7: numCell("1"), G7: numCell("3"), H7: numCell("0"), I7: numCell("8"), J7: numCell("1"), K7: pctCell("=E7/D7"),
  A8: cell("Deepak Joshi"), B8: cell("EMP-005"), C8: cell("Engineering"), D8: numCell("22"), E8: numCell("19"), F8: numCell("2"), G8: numCell("1"), H8: numCell("1"), I8: numCell("6"), J8: numCell("2"), K8: pctCell("=E8/D8"),
  A9: cell("Kavita Reddy"), B9: cell("EMP-006"), C9: cell("HR"), D9: numCell("22"), E9: numCell("21"), F9: numCell("0"), G9: numCell("0"), H9: numCell("1"), I9: numCell("2"), J9: numCell("0"), K9: pctCell("=E9/D9"),
  A10: cell("Sanjay Mehta"), B10: cell("EMP-007"), C10: cell("Finance"), D10: numCell("22"), E10: numCell("20"), F10: numCell("1"), G10: numCell("2"), H10: numCell("0"), I10: numCell("4"), J10: numCell("1"), K10: pctCell("=E10/D10"),
  A11: cell("Pooja Shah"), B11: cell("EMP-008"), C11: cell("Operations"), D11: numCell("22"), E11: numCell("22"), F11: numCell("0"), G11: numCell("1"), H11: numCell("0"), I11: numCell("7"), J11: numCell("0"), K11: pctCell("=E11/D11"),
  A12: cell("Amit Pande"), B12: cell("EMP-009"), C12: cell("Engineering"), D12: numCell("22"), E12: numCell("17"), F12: numCell("4"), G12: numCell("2"), H12: numCell("1"), I12: numCell("3"), J12: numCell("4"), K12: pctCell("=E12/D12"),
  A13: cell("Ritu Sharma"), B13: cell("EMP-010"), C13: cell("Design"), D13: numCell("22"), E13: numCell("21"), F13: numCell("1"), G13: numCell("0"), H13: numCell("0"), I13: numCell("5"), J13: numCell("1"), K13: pctCell("=E13/D13"),

  A15: bold("Team Summary"),
  A16: cell("Total Present Days"), E16: cell("=SUM(E4:E13)"),
  A17: cell("Total Absent Days"), F17: cell("=SUM(F4:F13)"),
  A18: cell("Average Attendance"), K18: pctCell("=SUM(E4:E13)/SUM(D4:D13)"),
  A19: cell("Total WFH Days"), I19: cell("=SUM(I4:I13)"),
  A20: cell("Total Leaves Used"), J20: cell("=SUM(J4:J13)"),
});

// ── 6. Inventory Management ───────────────────────────────────────────────────
const inventoryManagement = mk({
  A1: { raw: "INVENTORY MANAGEMENT SYSTEM", style: { bold: true, bgColor: "#33691E", textColor: "#ffffff" } },

  A3: hdr("Product", "#33691E"), B3: hdr("SKU", "#33691E"), C3: hdr("Category", "#33691E"),
  D3: hdr("Warehouse", "#33691E"), E3: hdr("In Stock", "#33691E"), F3: hdr("Reserved", "#33691E"),
  G3: hdr("Available", "#33691E"), H3: hdr("Reorder Lvl", "#33691E"), I3: hdr("Unit Cost", "#33691E"),
  J3: hdr("Total Value", "#33691E"), K3: hdr("Status", "#33691E"),

  A4: cell("Laptop Pro 15\""), B4: cell("LP-1501"), C4: cell("Electronics"), D4: cell("WH-North"), E4: numCell("245"), F4: numCell("30"), G4: cell("=E4-F4"), H4: numCell("50"), I4: curCell("899.99"), J4: cell("=E4*I4"), K4: cell("OK"),
  A5: cell("Wireless Mouse"), B5: cell("WM-3020"), C5: cell("Accessories"), D5: cell("WH-North"), E5: numCell("1520"), F5: numCell("200"), G5: cell("=E5-F5"), H5: numCell("300"), I5: curCell("29.99"), J5: cell("=E5*I5"), K5: cell("OK"),
  A6: cell("USB-C Hub"), B6: cell("UH-4400"), C6: cell("Accessories"), D6: cell("WH-East"), E6: numCell("85"), F6: numCell("40"), G6: cell("=E6-F6"), H6: numCell("100"), I6: curCell("49.99"), J6: cell("=E6*I6"), K6: cell("LOW STOCK"),
  A7: cell("27\" Monitor 4K"), B7: cell("MN-2704"), C7: cell("Electronics"), D7: cell("WH-North"), E7: numCell("120"), F7: numCell("15"), G7: cell("=E7-F7"), H7: numCell("25"), I7: curCell("449.99"), J7: cell("=E7*I7"), K7: cell("OK"),
  A8: cell("Ergonomic Chair"), B8: cell("EC-5500"), C8: cell("Furniture"), D8: cell("WH-South"), E8: numCell("42"), F8: numCell("12"), G8: cell("=E8-F8"), H8: numCell("20"), I8: curCell("329.99"), J8: cell("=E8*I8"), K8: cell("OK"),
  A9: cell("Mechanical Keyboard"), B9: cell("MK-7100"), C9: cell("Accessories"), D9: cell("WH-East"), E9: numCell("380"), F9: numCell("50"), G9: cell("=E9-F9"), H9: numCell("75"), I9: curCell("79.99"), J9: cell("=E9*I9"), K9: cell("OK"),
  A10: cell("Webcam HD 1080p"), B10: cell("WC-1080"), C10: cell("Electronics"), D10: cell("WH-North"), E10: numCell("15"), F10: numCell("8"), G10: cell("=E10-F10"), H10: numCell("50"), I10: curCell("69.99"), J10: cell("=E10*I10"), K10: cell("CRITICAL"),
  A11: cell("Standing Desk"), B11: cell("SD-6000"), C11: cell("Furniture"), D11: cell("WH-South"), E11: numCell("58"), F11: numCell("5"), G11: cell("=E11-F11"), H11: numCell("15"), I11: curCell("549.99"), J11: cell("=E11*I11"), K11: cell("OK"),
  A12: cell("Docking Station"), B12: cell("DS-8800"), C12: cell("Electronics"), D12: cell("WH-East"), E12: numCell("22"), F12: numCell("10"), G12: cell("=E12-F12"), H12: numCell("30"), I12: curCell("199.99"), J12: cell("=E12*I12"), K12: cell("LOW STOCK"),
  A13: cell("Noise-Cancel Headset"), B13: cell("NC-2200"), C13: cell("Accessories"), D13: cell("WH-North"), E13: numCell("210"), F13: numCell("25"), G13: cell("=E13-F13"), H13: numCell("40"), I13: curCell("149.99"), J13: cell("=E13*I13"), K13: cell("OK"),

  A15: bold("Inventory Summary"),
  A16: cell("Total Items in Stock"), E16: cell("=SUM(E4:E13)"),
  A17: cell("Total Reserved"), F17: cell("=SUM(F4:F13)"),
  A18: cell("Total Inventory Value"), J18: cell("=SUM(J4:J13)"),
  A19: cell("Items Below Reorder Level"), K19: numCell("2"),
});

// ── 7. Financial Statement (P&L + Balance Sheet) ──────────────────────────────
const financialStatement = mk({
  A1: { raw: "FINANCIAL STATEMENTS - FY 2025-26", style: { bold: true, bgColor: "#004D40", textColor: "#ffffff" } },
  B1: { raw: "", style: { bgColor: "#004D40" } }, C1: { raw: "", style: { bgColor: "#004D40" } },

  A3: { raw: "INCOME STATEMENT (P&L)", style: { bold: true, bgColor: "#E0F2F1" } },
  A4: hdr("", "#00796B"), B4: hdr("FY 2025-26", "#00796B"), C4: hdr("FY 2024-25", "#00796B"), D4: hdr("Change %", "#00796B"),

  A5: bold("Revenue"),
  A6: cell("  Product Sales"), B6: curCell("32500000"), C6: curCell("26800000"), D6: pctCell("=(B6-C6)/C6"),
  A7: cell("  Service Revenue"), B7: curCell("12800000"), C7: curCell("10500000"), D7: pctCell("=(B7-C7)/C7"),
  A8: cell("  Subscription Revenue"), B8: curCell("8200000"), C8: curCell("5900000"), D8: pctCell("=(B8-C8)/C8"),
  A9: cell("  Other Income"), B9: curCell("1500000"), C9: curCell("1200000"), D9: pctCell("=(B9-C9)/C9"),
  A10: bold("Total Revenue"), B10: cell("=SUM(B6:B9)"), C10: cell("=SUM(C6:C9)"), D10: pctCell("=(B10-C10)/C10"),

  A12: bold("Cost of Goods Sold"),
  A13: cell("  Direct Materials"), B13: curCell("9750000"), C13: curCell("8040000"), D13: pctCell("=(B13-C13)/C13"),
  A14: cell("  Direct Labor"), B14: curCell("6500000"), C14: curCell("5360000"), D14: pctCell("=(B14-C14)/C14"),
  A15: cell("  Manufacturing Overhead"), B15: curCell("3250000"), C15: curCell("2680000"), D15: pctCell("=(B15-C15)/C15"),
  A16: bold("Total COGS"), B16: cell("=SUM(B13:B15)"), C16: cell("=SUM(C13:C15)"), D16: pctCell("=(B16-C16)/C16"),

  A18: { raw: "Gross Profit", style: { bold: true, bgColor: "#E8F5E9" } }, B18: cell("=B10-B16"), C18: cell("=C10-C16"), D18: pctCell("=(B18-C18)/C18"),
  A19: cell("Gross Margin"), B19: pctCell("=B18/B10"), C19: pctCell("=C18/C10"),

  A21: bold("Operating Expenses"),
  A22: cell("  Sales & Marketing"), B22: curCell("5500000"), C22: curCell("4800000"), D22: pctCell("=(B22-C22)/C22"),
  A23: cell("  Research & Development"), B23: curCell("7200000"), C23: curCell("6100000"), D23: pctCell("=(B23-C23)/C23"),
  A24: cell("  General & Administrative"), B24: curCell("3800000"), C24: curCell("3400000"), D24: pctCell("=(B24-C24)/C24"),
  A25: cell("  Depreciation & Amort."), B25: curCell("2100000"), C25: curCell("1800000"), D25: pctCell("=(B25-C25)/C25"),
  A26: bold("Total OpEx"), B26: cell("=SUM(B22:B25)"), C26: cell("=SUM(C22:C25)"), D26: pctCell("=(B26-C26)/C26"),

  A28: { raw: "Operating Income (EBIT)", style: { bold: true, bgColor: "#E3F2FD" } }, B28: cell("=B18-B26"), C28: cell("=C18-C26"), D28: pctCell("=(B28-C28)/C28"),
  A29: cell("  Interest Expense"), B29: curCell("800000"), C29: curCell("950000"),
  A30: cell("  Tax Expense (25%)"), B30: cell("=(B28-B29)*0.25"), C30: cell("=(C28-C29)*0.25"),
  A31: { raw: "Net Income", style: { bold: true, bgColor: "#C8E6C9" } }, B31: cell("=B28-B29-B30"), C31: cell("=C28-C29-C30"), D31: pctCell("=(B31-C31)/C31"),
  A32: cell("Net Margin"), B32: pctCell("=B31/B10"), C32: pctCell("=C31/C10"),

  A35: { raw: "BALANCE SHEET", style: { bold: true, bgColor: "#E0F2F1" } },
  A36: hdr("", "#00796B"), B36: hdr("Current Year", "#00796B"), C36: hdr("Prior Year", "#00796B"),

  A37: bold("ASSETS"),
  A38: cell("  Cash & Equivalents"), B38: curCell("18500000"), C38: curCell("14200000"),
  A39: cell("  Accounts Receivable"), B39: curCell("9200000"), C39: curCell("7800000"),
  A40: cell("  Inventory"), B40: curCell("4500000"), C40: curCell("3800000"),
  A41: cell("  Prepaid Expenses"), B41: curCell("1200000"), C41: curCell("900000"),
  A42: bold("Total Current Assets"), B42: cell("=SUM(B38:B41)"), C42: cell("=SUM(C38:C41)"),
  A43: cell("  Property & Equipment"), B43: curCell("15000000"), C43: curCell("12500000"),
  A44: cell("  Intangible Assets"), B44: curCell("6800000"), C44: curCell("5200000"),
  A45: cell("  Long-term Investments"), B45: curCell("3500000"), C45: curCell("2800000"),
  A46: bold("Total Assets"), B46: cell("=B42+B43+B44+B45"), C46: cell("=C42+C43+C44+C45"),

  A48: bold("LIABILITIES"),
  A49: cell("  Accounts Payable"), B49: curCell("5200000"), C49: curCell("4500000"),
  A50: cell("  Accrued Expenses"), B50: curCell("2800000"), C50: curCell("2200000"),
  A51: cell("  Short-term Debt"), B51: curCell("3000000"), C51: curCell("3500000"),
  A52: bold("Total Current Liabilities"), B52: cell("=SUM(B49:B51)"), C52: cell("=SUM(C49:C51)"),
  A53: cell("  Long-term Debt"), B53: curCell("8000000"), C53: curCell("9500000"),
  A54: cell("  Deferred Tax"), B54: curCell("1500000"), C54: curCell("1200000"),
  A55: bold("Total Liabilities"), B55: cell("=B52+B53+B54"), C55: cell("=C52+C53+C54"),

  A57: bold("EQUITY"),
  A58: cell("  Common Stock"), B58: curCell("12000000"), C58: curCell("12000000"),
  A59: cell("  Retained Earnings"), B59: cell("=B46-B55-B58"), C59: cell("=C46-C55-C58"),
  A60: bold("Total Equity"), B60: cell("=B58+B59"), C60: cell("=C58+C59"),
  A61: bold("Total Liabilities + Equity"), B61: cell("=B55+B60"), C61: cell("=C55+C60"),
});

// ── 8. Grade Book ─────────────────────────────────────────────────────────────
const gradeBook = mk({
  A1: { raw: "GRADE BOOK - Computer Science 101 (Spring 2026)", style: { bold: true, bgColor: "#283593", textColor: "#ffffff" } },
  A2: cell("Instructor: Dr. Lakshmi Narayan | Section: CS101-A | Credits: 4"),

  A4: hdr("Student Name", "#283593"), B4: hdr("ID", "#283593"), C4: hdr("HW1 (10)", "#283593"),
  D4: hdr("HW2 (10)", "#283593"), E4: hdr("HW3 (10)", "#283593"), F4: hdr("HW4 (10)", "#283593"),
  G4: hdr("Quiz1 (15)", "#283593"), H4: hdr("Quiz2 (15)", "#283593"),
  I4: hdr("Midterm (50)", "#283593"), J4: hdr("Project (30)", "#283593"),
  K4: hdr("Final (50)", "#283593"), L4: hdr("Total (200)", "#283593"),
  M4: hdr("Percentage", "#283593"), N4: hdr("Grade", "#283593"),

  A5: cell("Aarav Patel"), B5: cell("CS-2601"), C5: numCell("9"), D5: numCell("8"), E5: numCell("10"), F5: numCell("9"), G5: numCell("14"), H5: numCell("13"), I5: numCell("45"), J5: numCell("28"), K5: numCell("46"), L5: cell("=SUM(C5:K5)"), M5: pctCell("=L5/200"), N5: cell("A"),
  A6: cell("Diya Sharma"), B6: cell("CS-2602"), C6: numCell("10"), D6: numCell("9"), E6: numCell("9"), F6: numCell("10"), G6: numCell("15"), H6: numCell("14"), I6: numCell("48"), J6: numCell("30"), K6: numCell("49"), L6: cell("=SUM(C6:K6)"), M6: pctCell("=L6/200"), N6: cell("A+"),
  A7: cell("Ishaan Reddy"), B7: cell("CS-2603"), C7: numCell("7"), D7: numCell("8"), E7: numCell("6"), F7: numCell("7"), G7: numCell("11"), H7: numCell("10"), I7: numCell("35"), J7: numCell("22"), K7: numCell("33"), L7: cell("=SUM(C7:K7)"), M7: pctCell("=L7/200"), N7: cell("C+"),
  A8: cell("Kavya Iyer"), B8: cell("CS-2604"), C8: numCell("8"), D8: numCell("9"), E8: numCell("8"), F8: numCell("8"), G8: numCell("12"), H8: numCell("13"), I8: numCell("42"), J8: numCell("26"), K8: numCell("41"), L8: cell("=SUM(C8:K8)"), M8: pctCell("=L8/200"), N8: cell("B+"),
  A9: cell("Rohan Gupta"), B9: cell("CS-2605"), C9: numCell("9"), D9: numCell("7"), E9: numCell("9"), F9: numCell("8"), G9: numCell("13"), H9: numCell("12"), I9: numCell("40"), J9: numCell("25"), K9: numCell("38"), L9: cell("=SUM(C9:K9)"), M9: pctCell("=L9/200"), N9: cell("B"),
  A10: cell("Ananya Singh"), B10: cell("CS-2606"), C10: numCell("6"), D10: numCell("5"), E10: numCell("7"), F10: numCell("6"), G10: numCell("9"), H10: numCell("8"), I10: numCell("30"), J10: numCell("20"), K10: numCell("28"), L10: cell("=SUM(C10:K10)"), M10: pctCell("=L10/200"), N10: cell("D+"),
  A11: cell("Vivaan Mehta"), B11: cell("CS-2607"), C11: numCell("10"), D11: numCell("10"), E11: numCell("9"), F11: numCell("9"), G11: numCell("14"), H11: numCell("15"), I11: numCell("47"), J11: numCell("29"), K11: numCell("48"), L11: cell("=SUM(C11:K11)"), M11: pctCell("=L11/200"), N11: cell("A+"),
  A12: cell("Mira Desai"), B12: cell("CS-2608"), C12: numCell("8"), D12: numCell("7"), E12: numCell("8"), F12: numCell("7"), G12: numCell("12"), H12: numCell("11"), I12: numCell("38"), J12: numCell("24"), K12: numCell("36"), L12: cell("=SUM(C12:K12)"), M12: pctCell("=L12/200"), N12: cell("B-"),
  A13: cell("Arjun Nair"), B13: cell("CS-2609"), C13: numCell("7"), D13: numCell("6"), E13: numCell("5"), F13: numCell("6"), G13: numCell("10"), H13: numCell("9"), I13: numCell("32"), J13: numCell("21"), K13: numCell("30"), L13: cell("=SUM(C13:K13)"), M13: pctCell("=L13/200"), N13: cell("C"),
  A14: cell("Tara Joshi"), B14: cell("CS-2610"), C14: numCell("9"), D14: numCell("8"), E14: numCell("9"), F14: numCell("10"), G14: numCell("13"), H14: numCell("14"), I14: numCell("44"), J14: numCell("27"), K14: numCell("43"), L14: cell("=SUM(C14:K14)"), M14: pctCell("=L14/200"), N14: cell("A-"),

  A16: { raw: "CLASS STATISTICS", style: { bold: true, bgColor: "#E8EAF6" } },
  A17: cell("Class Average"), L17: cell("=SUM(L5:L14)/10"), M17: pctCell("=L17/200"),
  A18: cell("Highest Score"), L18: cell("=MAX(L5:L14)"), M18: pctCell("=L18/200"),
  A19: cell("Lowest Score"), L19: cell("=MIN(L5:L14)"), M19: pctCell("=L19/200"),
  A20: cell("Median"), L20: cell("=MEDIAN(L5:L14)"), M20: pctCell("=L20/200"),

  A22: { raw: "GRADING SCALE", style: { bold: true, bgColor: "#E8EAF6" } },
  A23: cell("A+ : 95-100%"), B23: cell("A : 90-94%"), C23: cell("A- : 87-89%"),
  A24: cell("B+ : 83-86%"), B24: cell("B : 80-82%"), C24: cell("B- : 77-79%"),
  A25: cell("C+ : 73-76%"), B25: cell("C : 70-72%"), C25: cell("C- : 67-69%"),
  A26: cell("D+ : 63-66%"), B26: cell("D : 60-62%"), C26: cell("F : Below 60%"),

  A28: { raw: "WEIGHT DISTRIBUTION", style: { bold: true, bgColor: "#E8EAF6" } },
  A29: cell("Homework (4x10) = 40pts (20%)"), B29: cell("Quizzes (2x15) = 30pts (15%)"),
  A30: cell("Midterm = 50pts (25%)"), B30: cell("Project = 30pts (15%)"),
  A31: cell("Final Exam = 50pts (25%)"), B31: cell("Total = 200pts (100%)"),
});

// ── Template metadata ─────────────────────────────────────────────────────────
const spreadsheetTemplateList = [
  { name: "Budget Tracker", desc: "Monthly income/expense tracker with quarterly totals, savings rate, and category breakdown", color: "#0D47A1" },
  { name: "Invoice Generator", desc: "Professional GST invoice with line items, tax calculations, and payment terms", color: "#1A237E" },
  { name: "Project Timeline", desc: "Gantt-style project timeline with phases, dependencies, owners, and progress tracking", color: "#00695C" },
  { name: "Sales Dashboard", desc: "Comprehensive sales KPIs, monthly trends, rep performance, and conversion metrics", color: "#E65100" },
  { name: "Attendance Tracker", desc: "Employee attendance with present/absent/late/WFH tracking and team statistics", color: "#6A1B9A" },
  { name: "Inventory Management", desc: "Product inventory with stock levels, reorder alerts, warehouse locations, and valuations", color: "#33691E" },
  { name: "Financial Statement", desc: "Complete P&L and Balance Sheet with YoY comparison, margins, and financial ratios", color: "#004D40" },
  { name: "Grade Book", desc: "Academic grade book with assignments, quizzes, exams, weighted scoring, and class statistics", color: "#283593" },
];

const spreadsheetContent: Record<string, string> = {
  "Budget Tracker": budgetTracker,
  "Invoice Generator": invoiceGenerator,
  "Project Timeline": projectTimeline,
  "Sales Dashboard": salesDashboard,
  "Attendance Tracker": attendanceTracker,
  "Inventory Management": inventoryManagement,
  "Financial Statement": financialStatement,
  "Grade Book": gradeBook,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function SpreadsheetTemplates() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const handleUse = (name: string) => {
    const data = spreadsheetContent[name];
    if (data) {
      localStorage.setItem("vidyalaya-spreadsheet-template", data);
      router.push("/spreadsheet");
    }
  };

  return (
    <div>
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Table2 size={16} />
        Spreadsheet Templates
        <span
          className="ml-1 rounded-full px-2 py-0.5 text-xs"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
        >
          {spreadsheetTemplateList.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {spreadsheetTemplateList.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border px-4 py-3 transition-all hover:border-[var(--primary)] group"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-sm font-medium group-hover:text-[var(--primary)]">{t.name}</span>
            </div>
            <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
              {t.desc}
            </div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => handleUse(t.name)}
                className="px-2 py-1 rounded text-[10px] text-white"
                style={{ backgroundColor: t.color }}
              >
                Use Template
              </button>
              <button
                onClick={() => setPreview(preview === t.name ? null : t.name)}
                className="px-2 py-1 rounded text-[10px] border"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <Eye size={10} className="inline mr-1" />
                Preview
              </button>
            </div>
            {preview === t.name && (
              <div
                className="mt-2 max-h-48 overflow-y-auto rounded border p-2 text-[9px] font-mono"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
              >
                {(() => {
                  const parsed = JSON.parse(spreadsheetContent[t.name]);
                  const cells = parsed.cells as Record<string, CellData>;
                  const rows: Record<number, Record<string, CellData>> = {};
                  Object.entries(cells).forEach(([key, val]) => {
                    const col = key.replace(/[0-9]/g, "");
                    const row = parseInt(key.replace(/[A-Z]/g, ""), 10);
                    if (!rows[row]) rows[row] = {};
                    rows[row][col] = val as CellData;
                  });
                  const sortedRows = Object.keys(rows).map(Number).sort((a, b) => a - b).slice(0, 12);
                  return (
                    <table className="w-full border-collapse">
                      <tbody>
                        {sortedRows.map((r) => (
                          <tr key={r}>
                            {["A", "B", "C", "D", "E"].map((c) => {
                              const cellData = rows[r]?.[c];
                              return (
                                <td
                                  key={c}
                                  className="border px-1 py-0.5 truncate max-w-[80px]"
                                  style={{
                                    borderColor: "var(--border)",
                                    backgroundColor: cellData?.style?.bgColor || "transparent",
                                    color: cellData?.style?.textColor || "inherit",
                                    fontWeight: cellData?.style?.bold ? "bold" : "normal",
                                  }}
                                >
                                  {cellData?.raw || ""}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
                <div className="mt-1 text-center" style={{ color: "var(--muted-foreground)" }}>
                  ... more rows in full template
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
