"use client";

import React, { useState } from "react";
import {
  X, FileText, ClipboardList, ShoppingCart, Star, Calendar,
  Receipt, Award, Users,
} from "lucide-react";
import { uid } from "./types";
import type { FormField } from "./types";

// ─── Template Definitions ────────────────────────────────────────────────────

export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  fields: Omit<FormField, "id">[];
}

function f(
  type: FormField["type"],
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  opts?: Partial<Pick<FormField, "options" | "required" | "value" | "page">>,
): Omit<FormField, "id"> {
  return { type, label, x, y, width, height, page: opts?.page ?? 1, options: opts?.options, required: opts?.required, value: opts?.value };
}

const TEMPLATES: PdfTemplate[] = [
  // ── 1. Job Application Form ──────────────────────────────────────────────
  {
    id: "job-application",
    name: "Job Application Form",
    description: "Company header, personal info, education, work experience, skills, references, signature",
    icon: FileText,
    category: "HR",
    fields: [
      // Header
      f("text-input", "Company Name", 40, 40, 300, 30, { value: "Vidyalaya Technologies Pvt. Ltd." }),
      f("text-input", "Position Applied For", 40, 90, 300, 30, { required: true }),
      f("text-input", "Application Date", 380, 90, 180, 30),
      // Personal Information
      f("text-input", "Full Name", 40, 150, 260, 30, { required: true }),
      f("text-input", "Email Address", 320, 150, 240, 30, { required: true }),
      f("text-input", "Phone Number", 40, 200, 200, 30, { required: true }),
      f("text-input", "Date of Birth", 260, 200, 140, 30),
      f("text-input", "Street Address", 40, 250, 520, 30),
      f("text-input", "City", 40, 300, 180, 30),
      f("text-input", "State / Province", 240, 300, 160, 30),
      f("text-input", "Postal Code", 420, 300, 140, 30),
      // Education (table rows)
      f("text-input", "Institution 1", 40, 370, 200, 30),
      f("text-input", "Degree 1", 260, 370, 160, 30),
      f("text-input", "Year of Graduation 1", 440, 370, 120, 30),
      f("text-input", "Institution 2", 40, 410, 200, 30),
      f("text-input", "Degree 2", 260, 410, 160, 30),
      f("text-input", "Year of Graduation 2", 440, 410, 120, 30),
      // Work Experience
      f("text-input", "Employer 1", 40, 475, 200, 30),
      f("text-input", "Job Title 1", 260, 475, 160, 30),
      f("text-input", "Duration 1 (e.g. 2020-2023)", 440, 475, 120, 30),
      f("text-input", "Employer 2", 40, 515, 200, 30),
      f("text-input", "Job Title 2", 260, 515, 160, 30),
      f("text-input", "Duration 2", 440, 515, 120, 30),
      // Skills
      f("text-input", "Key Skills (comma-separated)", 40, 575, 520, 30),
      // References
      f("text-input", "Reference 1 Name & Contact", 40, 630, 260, 30),
      f("text-input", "Reference 2 Name & Contact", 320, 630, 240, 30),
      // Signature
      f("signature", "Applicant Signature", 40, 690, 200, 50),
      f("date-picker", "Date", 280, 700, 140, 30),
    ],
  },

  // ── 2. Employee Leave Request ────────────────────────────────────────────
  {
    id: "leave-request",
    name: "Employee Leave Request",
    description: "Employee details, leave type, date range, reason, manager and HR approval sections",
    icon: ClipboardList,
    category: "HR",
    fields: [
      f("text-input", "Employee Name", 40, 50, 260, 30, { required: true }),
      f("text-input", "Employee ID", 320, 50, 140, 30, { required: true }),
      f("text-input", "Department", 40, 100, 200, 30, { required: true }),
      f("text-input", "Job Title", 260, 100, 200, 30),
      f("text-input", "Manager Name", 40, 150, 260, 30),
      f("date-picker", "Request Date", 320, 150, 140, 30),
      // Leave details
      f("dropdown", "Leave Type", 40, 220, 200, 30, { options: ["Annual Leave", "Sick Leave", "Personal Leave", "Maternity/Paternity", "Bereavement", "Unpaid Leave"], required: true }),
      f("date-picker", "Date From", 260, 220, 140, 30, { required: true }),
      f("date-picker", "Date To", 420, 220, 140, 30, { required: true }),
      f("text-input", "Total Days Requested", 40, 270, 140, 30),
      f("checkbox", "Half Day (first day)", 200, 275, 20, 20),
      f("checkbox", "Half Day (last day)", 280, 275, 20, 20),
      // Reason
      f("text-input", "Reason for Leave", 40, 325, 520, 30),
      f("text-input", "Additional Comments", 40, 365, 520, 30),
      // Contact during leave
      f("text-input", "Contact Phone During Leave", 40, 420, 260, 30),
      f("text-input", "Covering Employee Name", 320, 420, 240, 30),
      // Manager approval
      f("dropdown", "Manager Decision", 40, 495, 180, 30, { options: ["Pending", "Approved", "Denied", "Approved with Conditions"] }),
      f("text-input", "Manager Comments", 240, 495, 320, 30),
      f("signature", "Manager Signature", 40, 545, 200, 50),
      f("date-picker", "Manager Approval Date", 260, 555, 140, 30),
      // HR approval
      f("dropdown", "HR Decision", 40, 625, 180, 30, { options: ["Pending", "Approved", "Denied"] }),
      f("text-input", "HR Comments", 240, 625, 320, 30),
      f("signature", "HR Signature", 40, 675, 200, 50),
      f("date-picker", "HR Approval Date", 260, 685, 140, 30),
    ],
  },

  // ── 3. Purchase Order ────────────────────────────────────────────────────
  {
    id: "purchase-order",
    name: "Purchase Order",
    description: "Company details, PO number, vendor info, items table, terms, authorized signature",
    icon: ShoppingCart,
    category: "Finance",
    fields: [
      // Company / PO header
      f("text-input", "Company Name", 40, 40, 260, 30, { value: "Vidyalaya Technologies Pvt. Ltd." }),
      f("text-input", "PO Number", 380, 40, 180, 30, { required: true }),
      f("date-picker", "PO Date", 380, 80, 180, 30),
      f("text-input", "Company Address", 40, 80, 300, 30),
      // Vendor
      f("text-input", "Vendor Name", 40, 140, 260, 30, { required: true }),
      f("text-input", "Vendor Contact Person", 320, 140, 240, 30),
      f("text-input", "Vendor Address", 40, 180, 260, 30),
      f("text-input", "Vendor Phone / Email", 320, 180, 240, 30),
      // Ship To
      f("text-input", "Ship To Address", 40, 230, 300, 30),
      f("dropdown", "Shipping Method", 360, 230, 200, 30, { options: ["Standard", "Express", "Overnight", "Pickup"] }),
      // Items table
      f("text-input", "Item 1 Description", 40, 300, 200, 30),
      f("text-input", "Qty 1", 260, 300, 60, 30),
      f("text-input", "Unit Price 1", 340, 300, 100, 30),
      f("text-input", "Total 1", 460, 300, 100, 30),
      f("text-input", "Item 2 Description", 40, 340, 200, 30),
      f("text-input", "Qty 2", 260, 340, 60, 30),
      f("text-input", "Unit Price 2", 340, 340, 100, 30),
      f("text-input", "Total 2", 460, 340, 100, 30),
      f("text-input", "Item 3 Description", 40, 380, 200, 30),
      f("text-input", "Qty 3", 260, 380, 60, 30),
      f("text-input", "Unit Price 3", 340, 380, 100, 30),
      f("text-input", "Total 3", 460, 380, 100, 30),
      f("text-input", "Item 4 Description", 40, 420, 200, 30),
      f("text-input", "Qty 4", 260, 420, 60, 30),
      f("text-input", "Unit Price 4", 340, 420, 100, 30),
      f("text-input", "Total 4", 460, 420, 100, 30),
      // Totals
      f("text-input", "Subtotal", 380, 470, 180, 30),
      f("text-input", "Tax (%)", 380, 510, 180, 30),
      f("text-input", "Grand Total", 380, 550, 180, 30),
      // Terms
      f("dropdown", "Payment Terms", 40, 470, 200, 30, { options: ["Net 30", "Net 60", "Net 90", "Due on Receipt", "COD"] }),
      f("text-input", "Special Instructions / Notes", 40, 520, 300, 30),
      // Authorization
      f("signature", "Authorized By Signature", 40, 600, 200, 50),
      f("text-input", "Printed Name & Title", 260, 610, 200, 30),
      f("date-picker", "Authorization Date", 40, 660, 140, 30),
    ],
  },

  // ── 4. Customer Feedback Survey ──────────────────────────────────────────
  {
    id: "feedback-survey",
    name: "Customer Feedback Survey",
    description: "Rating scales, multiple choice, text areas for comments, NPS score, contact info",
    icon: Star,
    category: "Marketing",
    fields: [
      f("text-input", "Survey Title", 40, 40, 300, 30, { value: "Customer Satisfaction Survey" }),
      f("date-picker", "Survey Date", 380, 40, 180, 30),
      // Customer info (optional)
      f("text-input", "Customer Name (Optional)", 40, 95, 260, 30),
      f("text-input", "Email (Optional)", 320, 95, 240, 30),
      f("text-input", "Order / Ticket Number", 40, 140, 200, 30),
      // Overall satisfaction
      f("radio", "Overall Satisfaction", 40, 200, 20, 20, { options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"], required: true }),
      // Product quality
      f("radio", "Product / Service Quality", 40, 270, 20, 20, { options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"] }),
      // Customer support
      f("radio", "Customer Support Experience", 40, 340, 20, 20, { options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"] }),
      // Value for money
      f("radio", "Value for Money", 40, 410, 20, 20, { options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"] }),
      // Ease of use
      f("dropdown", "How did you hear about us?", 40, 470, 260, 30, { options: ["Search Engine", "Social Media", "Friend/Referral", "Advertisement", "Other"] }),
      // NPS
      f("radio", "How likely to recommend? (NPS 0-10)", 40, 525, 20, 20, { options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] }),
      // Open feedback
      f("text-input", "What did you like most?", 40, 595, 520, 30),
      f("text-input", "What could we improve?", 40, 640, 520, 30),
      f("text-input", "Additional Comments", 40, 685, 520, 30),
      // Follow-up
      f("checkbox", "I agree to be contacted for follow-up", 40, 730, 20, 20),
    ],
  },

  // ── 5. Event Registration Form ───────────────────────────────────────────
  {
    id: "event-registration",
    name: "Event Registration Form",
    description: "Event details, attendee info, dietary requirements, T-shirt size, payment, emergency contact",
    icon: Calendar,
    category: "Events",
    fields: [
      // Event header
      f("text-input", "Event Name", 40, 40, 300, 30, { value: "Annual Tech Conference 2026" }),
      f("date-picker", "Event Date", 360, 40, 200, 30),
      f("text-input", "Venue / Location", 40, 80, 300, 30, { value: "Convention Center, Hall A" }),
      f("text-input", "Event Time", 360, 80, 200, 30, { value: "9:00 AM - 5:00 PM" }),
      // Attendee info
      f("text-input", "Full Name", 40, 145, 260, 30, { required: true }),
      f("text-input", "Email", 320, 145, 240, 30, { required: true }),
      f("text-input", "Phone", 40, 190, 200, 30, { required: true }),
      f("text-input", "Organization / Company", 260, 190, 300, 30),
      f("text-input", "Job Title", 40, 235, 200, 30),
      // Ticket & preferences
      f("dropdown", "Registration Type", 40, 295, 200, 30, { options: ["General Admission", "VIP", "Speaker", "Sponsor", "Student"], required: true }),
      f("dropdown", "Dietary Requirements", 260, 295, 200, 30, { options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Other"] }),
      f("text-input", "Other Dietary (specify)", 40, 340, 260, 30),
      f("dropdown", "T-Shirt Size", 320, 340, 140, 30, { options: ["XS", "S", "M", "L", "XL", "XXL"] }),
      // Sessions
      f("checkbox", "Workshop A: AI & Machine Learning", 40, 395, 20, 20),
      f("checkbox", "Workshop B: Cloud Architecture", 40, 425, 20, 20),
      f("checkbox", "Workshop C: DevOps Best Practices", 40, 455, 20, 20),
      f("checkbox", "Networking Lunch", 300, 395, 20, 20),
      f("checkbox", "After-Party", 300, 425, 20, 20),
      // Payment
      f("dropdown", "Payment Method", 40, 510, 200, 30, { options: ["Credit Card", "Bank Transfer", "PayPal", "Invoice", "Complimentary"] }),
      f("text-input", "Promo / Discount Code", 260, 510, 200, 30),
      // Emergency contact
      f("text-input", "Emergency Contact Name", 40, 575, 260, 30, { required: true }),
      f("text-input", "Emergency Contact Phone", 320, 575, 240, 30, { required: true }),
      f("text-input", "Medical Conditions / Allergies", 40, 620, 520, 30),
      // Terms
      f("checkbox", "I accept the terms and conditions", 40, 670, 20, 20, { required: true }),
      f("checkbox", "I consent to event photography", 40, 700, 20, 20),
      f("signature", "Attendee Signature", 40, 740, 200, 50),
      f("date-picker", "Date", 260, 750, 140, 30),
    ],
  },

  // ── 6. Expense Claim Form ────────────────────────────────────────────────
  {
    id: "expense-claim",
    name: "Expense Claim Form",
    description: "Employee details, expense items table, totals, manager and finance approval",
    icon: Receipt,
    category: "Finance",
    fields: [
      // Employee info
      f("text-input", "Employee Name", 40, 40, 260, 30, { required: true }),
      f("text-input", "Employee ID", 320, 40, 140, 30, { required: true }),
      f("text-input", "Department", 40, 85, 200, 30),
      f("text-input", "Cost Center", 260, 85, 140, 30),
      f("date-picker", "Claim Date", 420, 85, 140, 30),
      f("text-input", "Claim Period (e.g. March 2026)", 40, 130, 260, 30),
      f("dropdown", "Currency", 320, 130, 120, 30, { options: ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"] }),
      // Expense items table
      f("date-picker", "Expense Date 1", 40, 200, 100, 30),
      f("dropdown", "Category 1", 150, 200, 120, 30, { options: ["Travel", "Meals", "Accommodation", "Transport", "Office Supplies", "Client Entertainment", "Training", "Other"] }),
      f("text-input", "Description 1", 280, 200, 160, 30),
      f("text-input", "Amount 1", 450, 200, 110, 30),
      f("date-picker", "Expense Date 2", 40, 240, 100, 30),
      f("dropdown", "Category 2", 150, 240, 120, 30, { options: ["Travel", "Meals", "Accommodation", "Transport", "Office Supplies", "Client Entertainment", "Training", "Other"] }),
      f("text-input", "Description 2", 280, 240, 160, 30),
      f("text-input", "Amount 2", 450, 240, 110, 30),
      f("date-picker", "Expense Date 3", 40, 280, 100, 30),
      f("dropdown", "Category 3", 150, 280, 120, 30, { options: ["Travel", "Meals", "Accommodation", "Transport", "Office Supplies", "Client Entertainment", "Training", "Other"] }),
      f("text-input", "Description 3", 280, 280, 160, 30),
      f("text-input", "Amount 3", 450, 280, 110, 30),
      f("date-picker", "Expense Date 4", 40, 320, 100, 30),
      f("dropdown", "Category 4", 150, 320, 120, 30, { options: ["Travel", "Meals", "Accommodation", "Transport", "Office Supplies", "Client Entertainment", "Training", "Other"] }),
      f("text-input", "Description 4", 280, 320, 160, 30),
      f("text-input", "Amount 4", 450, 320, 110, 30),
      f("date-picker", "Expense Date 5", 40, 360, 100, 30),
      f("dropdown", "Category 5", 150, 360, 120, 30, { options: ["Travel", "Meals", "Accommodation", "Transport", "Office Supplies", "Client Entertainment", "Training", "Other"] }),
      f("text-input", "Description 5", 280, 360, 160, 30),
      f("text-input", "Amount 5", 450, 360, 110, 30),
      // Receipt checkbox per row
      f("checkbox", "Receipt 1 Attached", 40, 405, 20, 20),
      f("checkbox", "Receipt 2 Attached", 140, 405, 20, 20),
      f("checkbox", "Receipt 3 Attached", 240, 405, 20, 20),
      f("checkbox", "Receipt 4 Attached", 340, 405, 20, 20),
      f("checkbox", "Receipt 5 Attached", 440, 405, 20, 20),
      // Totals
      f("text-input", "Total Claimed Amount", 360, 445, 200, 30),
      f("text-input", "Advance Received", 360, 485, 200, 30),
      f("text-input", "Net Amount Payable", 360, 525, 200, 30),
      f("text-input", "Purpose / Justification", 40, 445, 300, 30),
      // Manager approval
      f("dropdown", "Manager Decision", 40, 590, 180, 30, { options: ["Pending", "Approved", "Partially Approved", "Rejected"] }),
      f("text-input", "Manager Comments", 240, 590, 320, 30),
      f("signature", "Manager Signature", 40, 635, 200, 50),
      f("date-picker", "Manager Approval Date", 260, 645, 140, 30),
      // Finance approval
      f("dropdown", "Finance Decision", 40, 710, 180, 30, { options: ["Pending", "Approved", "Rejected", "Paid"] }),
      f("signature", "Finance Signature", 240, 710, 200, 50),
      f("date-picker", "Payment Date", 460, 720, 100, 30),
    ],
  },

  // ── 7. Certificate Template ──────────────────────────────────────────────
  {
    id: "certificate",
    name: "Certificate Template",
    description: "Ornate border, certificate of completion/achievement, recipient, course, date, signature, seal",
    icon: Award,
    category: "Education",
    fields: [
      // Certificate type
      f("dropdown", "Certificate Type", 150, 40, 260, 30, { options: ["Certificate of Completion", "Certificate of Achievement", "Certificate of Excellence", "Certificate of Participation", "Certificate of Appreciation"] }),
      // Organization
      f("text-input", "Issuing Organization", 100, 100, 360, 30, { value: "Vidyalaya Technologies Pvt. Ltd." }),
      f("text-input", "Organization Logo Placeholder", 100, 145, 360, 30, { value: "[Organization Logo Here]" }),
      // Main content
      f("text-input", "Presented To (Recipient Name)", 80, 220, 400, 35, { required: true }),
      f("text-input", "For Completion Of (Course / Program)", 60, 290, 440, 30, { required: true }),
      f("text-input", "Description / Achievement Details", 60, 340, 440, 30),
      f("text-input", "Duration / Hours Completed", 60, 385, 220, 30),
      f("text-input", "Grade / Score (if applicable)", 300, 385, 200, 30),
      // Date
      f("date-picker", "Date of Issue", 180, 440, 200, 30, { required: true }),
      f("text-input", "Certificate Number / ID", 60, 490, 200, 30),
      // Signatures
      f("signature", "Issuer Signature 1", 60, 550, 180, 50),
      f("text-input", "Name & Title (Signer 1)", 60, 610, 180, 30),
      f("signature", "Issuer Signature 2", 320, 550, 180, 50),
      f("text-input", "Name & Title (Signer 2)", 320, 610, 180, 30),
      // Seal
      f("text-input", "Official Seal Placeholder", 210, 670, 140, 30, { value: "[Official Seal]" }),
    ],
  },

  // ── 8. Meeting Agenda Form ───────────────────────────────────────────────
  {
    id: "meeting-agenda",
    name: "Meeting Agenda Form",
    description: "Meeting title, date/time/location, organizer, attendees, agenda items, action items",
    icon: Users,
    category: "Office",
    fields: [
      // Meeting header
      f("text-input", "Meeting Title", 40, 40, 380, 30, { required: true }),
      f("dropdown", "Meeting Type", 440, 40, 120, 30, { options: ["Regular", "Standup", "Sprint Review", "Planning", "Board Meeting", "Ad-Hoc", "All-Hands"] }),
      f("date-picker", "Date", 40, 90, 140, 30, { required: true }),
      f("text-input", "Time", 200, 90, 140, 30, { value: "10:00 AM - 11:00 AM" }),
      f("text-input", "Location / Meeting Link", 360, 90, 200, 30),
      f("text-input", "Organizer", 40, 140, 200, 30, { required: true }),
      f("text-input", "Note Taker", 260, 140, 200, 30),
      // Attendees
      f("text-input", "Attendee 1", 40, 200, 160, 30),
      f("text-input", "Attendee 2", 220, 200, 160, 30),
      f("text-input", "Attendee 3", 400, 200, 160, 30),
      f("text-input", "Attendee 4", 40, 240, 160, 30),
      f("text-input", "Attendee 5", 220, 240, 160, 30),
      f("text-input", "Attendee 6", 400, 240, 160, 30),
      // Agenda items
      f("text-input", "Agenda Item 1 - Topic", 40, 310, 200, 30),
      f("text-input", "Presenter 1", 260, 310, 120, 30),
      f("text-input", "Duration 1 (min)", 400, 310, 80, 30),
      f("text-input", "Agenda Item 2 - Topic", 40, 350, 200, 30),
      f("text-input", "Presenter 2", 260, 350, 120, 30),
      f("text-input", "Duration 2 (min)", 400, 350, 80, 30),
      f("text-input", "Agenda Item 3 - Topic", 40, 390, 200, 30),
      f("text-input", "Presenter 3", 260, 390, 120, 30),
      f("text-input", "Duration 3 (min)", 400, 390, 80, 30),
      f("text-input", "Agenda Item 4 - Topic", 40, 430, 200, 30),
      f("text-input", "Presenter 4", 260, 430, 120, 30),
      f("text-input", "Duration 4 (min)", 400, 430, 80, 30),
      f("text-input", "Agenda Item 5 - Topic", 40, 470, 200, 30),
      f("text-input", "Presenter 5", 260, 470, 120, 30),
      f("text-input", "Duration 5 (min)", 400, 470, 80, 30),
      // Action items from previous meeting
      f("text-input", "Previous Action 1", 40, 540, 260, 30),
      f("dropdown", "Status 1", 320, 540, 100, 30, { options: ["Open", "In Progress", "Completed", "Deferred"] }),
      f("text-input", "Owner 1", 440, 540, 120, 30),
      f("text-input", "Previous Action 2", 40, 580, 260, 30),
      f("dropdown", "Status 2", 320, 580, 100, 30, { options: ["Open", "In Progress", "Completed", "Deferred"] }),
      f("text-input", "Owner 2", 440, 580, 120, 30),
      f("text-input", "Previous Action 3", 40, 620, 260, 30),
      f("dropdown", "Status 3", 320, 620, 100, 30, { options: ["Open", "In Progress", "Completed", "Deferred"] }),
      f("text-input", "Owner 3", 440, 620, 120, 30),
      // Notes
      f("text-input", "Meeting Notes / Decisions", 40, 680, 520, 30),
      f("text-input", "Next Meeting Date / Time", 40, 720, 260, 30),
    ],
  },
];

// ─── Modal Component ─────────────────────────────────────────────────────────

interface PdfTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onApplyTemplate: (fields: FormField[]) => void;
}

const CATEGORIES = ["All", "HR", "Finance", "Marketing", "Events", "Education", "Office"];

export default function PdfTemplatesModal({ open, onClose, onApplyTemplate }: PdfTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!open) return null;

  const filtered = selectedCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelect = (template: PdfTemplate) => {
    const fields: FormField[] = template.fields.map((f) => ({
      ...f,
      id: uid(),
    }));
    onApplyTemplate(fields);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 860, maxHeight: "85vh", borderRadius: 12,
          backgroundColor: "var(--card)", border: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              PDF Form Templates
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Choose a template to create a fillable PDF form with real fields
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--muted-foreground)", padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-6 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "4px 14px", borderRadius: 20, fontSize: 13,
                border: "1px solid var(--border)", cursor: "pointer",
                backgroundColor: selectedCategory === cat ? "var(--primary)" : "var(--card)",
                color: selectedCategory === cat ? "var(--primary-foreground)" : "var(--foreground)",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {filtered.map((template) => {
            const Icon = template.icon;
            const isHovered = hoveredId === template.id;
            const fieldCount = template.fields.length;
            const fieldTypes = new Set(template.fields.map((f) => f.type));
            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  textAlign: "left", cursor: "pointer",
                  padding: 20, borderRadius: 10,
                  border: isHovered ? "1px solid var(--primary)" : "1px solid var(--border)",
                  backgroundColor: isHovered ? "var(--accent)" : "var(--background)",
                  transition: "all 0.15s",
                  display: "flex", flexDirection: "column", gap: 10,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      backgroundColor: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--primary-foreground)" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                      {template.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {template.category}
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {fieldTypes.has("text-input") && <Badge label="Text Fields" />}
                  {fieldTypes.has("checkbox") && <Badge label="Checkboxes" />}
                  {fieldTypes.has("radio") && <Badge label="Radio Buttons" />}
                  {fieldTypes.has("dropdown") && <Badge label="Dropdowns" />}
                  {fieldTypes.has("signature") && <Badge label="Signatures" />}
                  {fieldTypes.has("date-picker") && <Badge label="Date Pickers" />}
                </div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {fieldCount} form field{fieldCount !== 1 ? "s" : ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 10, padding: "2px 8px", borderRadius: 10,
        backgroundColor: "var(--muted)", color: "var(--muted-foreground)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
