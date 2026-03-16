"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Filter, ChevronDown, ChevronRight, X, Edit3, Trash2, Archive,
  RotateCcw, Shield, Clock, User, Calendar, Building2, FileText, Tag,
  CheckCircle2, AlertCircle, XCircle, Eye, History, Download, Send, GitPullRequest,
} from "lucide-react";
import ChangeRequests, { type ChangeRequest } from "./components/ChangeRequests";
import AuditTrail, { type AuditEntry } from "./components/AuditTrail";
import ChangeRequestForm from "./components/ChangeRequestForm";
import NewDocumentDialog from "./components/NewDocumentDialog";

// ── Types ────────────────────────────────────────────────────────────────────

interface DocRecord {
  id: string; docId: string; name: string; department: string; author: string;
  routePath: string; version: string; status: string; classification: string;
  createdAt: string; updatedAt: string; retentionPeriod: string; expiryDate: string;
  tags: string[];
  headerConfig: { left: string; center: string; right: string };
  footerConfig: { left: string; center: string; right: string };
  deletedAt: string | null;
  versions: DocVersion[];
  docType?: "Word" | "Excel" | "PPT";
}

interface DocVersion { id: string; version: string; changeNotes: string; createdBy: string; createdAt: string; }

interface Department {
  id: string; name: string; code: string; head: string; description: string;
  numberingPrefix?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = ["Engineering", "QA", "HR", "Finance", "Operations", "Legal", "IT", "Management"];
const STATUSES = ["Draft", "Under Review", "Approved", "Published", "Archived", "Deleted"];
const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"];
const RETENTION_PERIODS = ["1yr", "2yr", "5yr", "7yr", "10yr", "Permanent"];

const STATUS_COLORS: Record<string, string> = {
  Draft: "#6b7280", "Under Review": "#f59e0b", Approved: "#10b981",
  Published: "#3b82f6", Archived: "#8b5cf6", Deleted: "#ef4444",
};

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DOCS: DocRecord[] = [
  { id: "1", docId: "DOC-2024-001", name: "Quality Management SOP", department: "QA", author: "John Smith", routePath: "/qa/sops/SOP-001", version: "2.1", status: "Published", classification: "Internal", createdAt: "2024-01-15", updatedAt: "2024-06-20", retentionPeriod: "7yr", expiryDate: "2031-01-15", tags: ["sop", "quality"], headerConfig: { left: "QA Dept", center: "QMS SOP", right: "DOC-2024-001" }, footerConfig: { left: "QA Dept", center: "Confidential", right: "Page {page}" }, deletedAt: null, versions: [{ id: "v1", version: "2.1", changeNotes: "Updated section 4", createdBy: "John Smith", createdAt: "2024-06-20" }, { id: "v2", version: "2.0", changeNotes: "Major revision", createdBy: "John Smith", createdAt: "2024-03-01" }, { id: "v3", version: "1.0", changeNotes: "Initial release", createdBy: "Jane Doe", createdAt: "2024-01-15" }] },
  { id: "2", docId: "DOC-2024-002", name: "Employee Handbook", department: "HR", author: "Sarah Wilson", routePath: "/hr/policies/handbook", version: "3.0", status: "Approved", classification: "Internal", createdAt: "2024-02-10", updatedAt: "2024-08-15", retentionPeriod: "Permanent", expiryDate: "", tags: ["policy", "hr"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [{ id: "v4", version: "3.0", changeNotes: "Annual update", createdBy: "Sarah Wilson", createdAt: "2024-08-15" }] },
  { id: "3", docId: "DOC-2024-003", name: "API Documentation", department: "Engineering", author: "Mike Chen", routePath: "/engineering/docs/api", version: "1.5", status: "Published", classification: "Confidential", createdAt: "2024-03-01", updatedAt: "2024-09-10", retentionPeriod: "5yr", expiryDate: "2029-03-01", tags: ["api", "technical"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
  { id: "4", docId: "DOC-2024-004", name: "Financial Report Q3", department: "Finance", author: "Lisa Park", routePath: "/finance/reports/q3-2024", version: "1.0", status: "Under Review", classification: "Restricted", createdAt: "2024-07-01", updatedAt: "2024-09-25", retentionPeriod: "10yr", expiryDate: "2034-07-01", tags: ["finance", "report"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
  { id: "5", docId: "DOC-2024-005", name: "IT Security Policy", department: "IT", author: "David Lee", routePath: "/it/policies/security", version: "2.0", status: "Published", classification: "Internal", createdAt: "2024-04-15", updatedAt: "2024-08-01", retentionPeriod: "5yr", expiryDate: "2029-04-15", tags: ["security", "policy"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
  { id: "6", docId: "DOC-2024-006", name: "Operations Manual", department: "Operations", author: "Amy Brown", routePath: "/ops/manuals/ops-001", version: "1.2", status: "Draft", classification: "Internal", createdAt: "2024-05-20", updatedAt: "2024-09-30", retentionPeriod: "7yr", expiryDate: "2031-05-20", tags: ["manual", "operations"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
  { id: "7", docId: "DOC-2024-007", name: "Legal Compliance Guide", department: "Legal", author: "Tom Harris", routePath: "/legal/guides/compliance", version: "1.0", status: "Approved", classification: "Confidential", createdAt: "2024-06-10", updatedAt: "2024-09-05", retentionPeriod: "Permanent", expiryDate: "", tags: ["legal", "compliance"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
  { id: "8", docId: "DOC-2024-008", name: "Board Meeting Minutes", department: "Management", author: "Emma White", routePath: "/mgmt/minutes/2024-08", version: "1.0", status: "Published", classification: "Restricted", createdAt: "2024-08-30", updatedAt: "2024-08-30", retentionPeriod: "10yr", expiryDate: "2034-08-30", tags: ["minutes", "board"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
];

const MOCK_ARCHIVED: DocRecord[] = [
  { id: "a1", docId: "DOC-2023-015", name: "Old Training Manual", department: "HR", author: "Sara K.", routePath: "/hr/training/old", version: "1.0", status: "Archived", classification: "Internal", createdAt: "2023-01-10", updatedAt: "2023-12-01", retentionPeriod: "1yr", expiryDate: "2024-01-10", tags: ["archived"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: null, versions: [] },
];

const MOCK_DELETED: DocRecord[] = [
  { id: "d1", docId: "DOC-2024-009", name: "Deprecated Process Doc", department: "Operations", author: "Mark T.", routePath: "/ops/deprecated", version: "1.0", status: "Deleted", classification: "Internal", createdAt: "2024-03-15", updatedAt: "2024-09-01", retentionPeriod: "1yr", expiryDate: "2025-03-15", tags: ["deprecated"], headerConfig: { left: "", center: "", right: "" }, footerConfig: { left: "", center: "", right: "" }, deletedAt: "2024-09-15", versions: [] },
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: "d1", name: "Engineering", code: "ENG", head: "Mike Chen", description: "Software engineering and development", numberingPrefix: "ENG-DOC" },
  { id: "d2", name: "QA", code: "QA", head: "John Smith", description: "Quality assurance and testing", numberingPrefix: "QA-DOC" },
  { id: "d3", name: "HR", code: "HR", head: "Sarah Wilson", description: "Human resources management", numberingPrefix: "HR-DOC" },
  { id: "d4", name: "Finance", code: "FIN", head: "Lisa Park", description: "Financial planning and accounting", numberingPrefix: "FIN-DOC" },
  { id: "d5", name: "Operations", code: "OPS", head: "Amy Brown", description: "Business operations", numberingPrefix: "OPS-DOC" },
  { id: "d6", name: "Legal", code: "LEG", head: "Tom Harris", description: "Legal and compliance", numberingPrefix: "LEG-DOC" },
  { id: "d7", name: "IT", code: "IT", head: "David Lee", description: "Information technology", numberingPrefix: "IT-DOC" },
  { id: "d8", name: "Management", code: "MGT", head: "Emma White", description: "Executive management", numberingPrefix: "MGT-DOC" },
];

const MOCK_CRS: ChangeRequest[] = [
  { id: "cr1", crId: "CR-2024-001", documentId: "1", documentName: "Quality Management SOP", changeType: "Revision", reason: "Update to reflect new ISO 9001:2025 requirements", affectedSections: "Section 4, Section 7", requestor: "John Smith", approver: "QA Manager", status: "Implemented", createdAt: "2024-05-10", updatedAt: "2024-06-20", comments: [{ author: "QA Manager", text: "Approved - critical update needed", date: "2024-05-15" }] },
  { id: "cr2", crId: "CR-2024-002", documentId: "5", documentName: "IT Security Policy", changeType: "Revision", reason: "Add zero-trust architecture requirements", affectedSections: "Section 3, new Section 8", requestor: "David Lee", approver: "CTO", status: "Approved", createdAt: "2024-07-20", updatedAt: "2024-08-01", comments: [] },
  { id: "cr3", crId: "CR-2024-003", documentId: "6", documentName: "Operations Manual", changeType: "Obsolete", reason: "Being replaced by new digital SOP system", affectedSections: "Entire document", requestor: "Amy Brown", approver: "Department Head", status: "Review", createdAt: "2024-09-01", updatedAt: "2024-09-15", comments: [{ author: "Amy Brown", text: "New system goes live in Q1 2025", date: "2024-09-01" }] },
  { id: "cr4", crId: "CR-2025-001", documentId: "2", documentName: "Employee Handbook", changeType: "Revision", reason: "Annual policy updates for 2025", affectedSections: "Benefits, PTO Policy, Remote Work", requestor: "Sarah Wilson", approver: "VP Engineering", status: "Draft", createdAt: "2025-01-15", updatedAt: "2025-01-15", comments: [] },
];

const MOCK_AUDIT: AuditEntry[] = [
  { id: "a1", action: "Created", documentId: "1", documentName: "Quality Management SOP", performedBy: "Jane Doe", timestamp: "2024-01-15 09:00", details: "Initial document creation" },
  { id: "a2", action: "Updated", documentId: "1", documentName: "Quality Management SOP", performedBy: "John Smith", timestamp: "2024-03-01 14:30", details: "Major revision - version 2.0" },
  { id: "a3", action: "Status Changed", documentId: "1", documentName: "Quality Management SOP", performedBy: "QA Manager", timestamp: "2024-03-15 10:00", details: "Draft → Under Review" },
  { id: "a4", action: "Status Changed", documentId: "1", documentName: "Quality Management SOP", performedBy: "VP Engineering", timestamp: "2024-04-01 11:00", details: "Under Review → Published" },
  { id: "a5", action: "Change Request Created", documentId: "1", documentName: "Quality Management SOP", performedBy: "John Smith", timestamp: "2024-05-10 09:00", details: "CR-2024-001: ISO 9001:2025 update" },
  { id: "a6", action: "Created", documentId: "3", documentName: "API Documentation", performedBy: "Mike Chen", timestamp: "2024-03-01 10:00", details: "Initial API docs" },
  { id: "a7", action: "Archived", documentId: "a1", documentName: "Old Training Manual", performedBy: "Sara K.", timestamp: "2023-12-01 16:00", details: "Moved to archive - outdated" },
  { id: "a8", action: "Deleted", documentId: "d1", documentName: "Deprecated Process Doc", performedBy: "Mark T.", timestamp: "2024-09-15 12:00", details: "Marked for deletion" },
  { id: "a9", action: "Created", documentId: "8", documentName: "Board Meeting Minutes", performedBy: "Emma White", timestamp: "2024-08-30 17:00", details: "August board meeting" },
  { id: "a10", action: "CR Status Changed", documentId: "5", documentName: "IT Security Policy", performedBy: "CTO", timestamp: "2024-08-01 09:30", details: "CR-2024-002: Review → Approved" },
];

// ── Helper Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: STATUS_COLORS[status] || "#6b7280" }}>{status}</span>;
}

function RetentionIndicator({ expiryDate }: { expiryDate: string }) {
  if (!expiryDate) return <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Permanent</span>;
  const daysLeft = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const color = daysLeft > 365 ? "#10b981" : daysLeft > 90 ? "#f59e0b" : "#ef4444";
  return (
    <span className="flex items-center gap-1 text-[10px]">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span style={{ color: "var(--muted-foreground)" }}>{daysLeft > 0 ? `${daysLeft}d left` : "Expired"}</span>
    </span>
  );
}

function RoutePathVisual({ doc }: { doc: DocRecord }) {
  const stages = [
    { name: "Created", date: doc.createdAt, person: doc.author, done: true },
    { name: "Under Review", date: doc.status === "Under Review" ? doc.updatedAt : doc.status === "Approved" || doc.status === "Published" ? doc.updatedAt : "", person: "Reviewer", done: ["Under Review", "Approved", "Published"].includes(doc.status) },
    { name: "Approved", date: doc.status === "Approved" || doc.status === "Published" ? doc.updatedAt : "", person: "Approver", done: ["Approved", "Published"].includes(doc.status) },
    { name: "Published", date: doc.status === "Published" ? doc.updatedAt : "", person: "Publisher", done: doc.status === "Published" },
  ];
  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <React.Fragment key={s.name}>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px]`}
              style={{ backgroundColor: s.done ? "#10b981" : doc.status === s.name ? "#f59e0b" : "var(--muted)", color: s.done || doc.status === s.name ? "white" : "var(--muted-foreground)" }}>
              {s.done ? "✓" : i + 1}
            </div>
            <span className="text-[8px] mt-0.5 text-center max-w-[60px]" style={{ color: s.done ? "var(--foreground)" : "var(--muted-foreground)" }}>{s.name}</span>
            {s.date && <span className="text-[7px]" style={{ color: "var(--muted-foreground)" }}>{s.date}</span>}
          </div>
          {i < stages.length - 1 && <div className="w-8 h-0.5 mb-6" style={{ backgroundColor: s.done ? "#10b981" : "var(--muted)" }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function DocControlPage() {
  const [activeTab, setActiveTab] = useState<"registry" | "changes" | "archive" | "departments" | "audit">("registry");
  const [docs, setDocs] = useState<DocRecord[]>(MOCK_DOCS);
  const [archivedDocs, setArchivedDocs] = useState<DocRecord[]>(MOCK_ARCHIVED);
  const [deletedDocs, setDeletedDocs] = useState<DocRecord[]>(MOCK_DELETED);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(MOCK_CRS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(MOCK_AUDIT);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<string>("docId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [archiveTab, setArchiveTab] = useState<"active" | "archived" | "deleted">("archived");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);

  // New Document Dialog
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocDept, setNewDocDept] = useState("Engineering");
  const [newDocClass, setNewDocClass] = useState("Internal");
  const [newDocRetention, setNewDocRetention] = useState("5yr");
  const [newDocType, setNewDocType] = useState<"Word" | "Excel" | "PPT">("Word");

  // Department form
  const [showNewDept, setShowNewDept] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptPrefix, setDeptPrefix] = useState("");

  // Header/Footer editing in detail modal
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerLeft, setHeaderLeft] = useState("");
  const [headerCenter, setHeaderCenter] = useState("");
  const [headerRight, setHeaderRight] = useState("");
  const [footerLeft, setFooterLeft] = useState("");
  const [footerCenter, setFooterCenter] = useState("");
  const [footerRight, setFooterRight] = useState("");

  // Confirm dialog
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vidyalaya-doc-control");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.docs) setDocs(data.docs);
        if (data.archived) setArchivedDocs(data.archived);
        if (data.deleted) setDeletedDocs(data.deleted);
        if (data.departments) setDepartments(data.departments);
        if (data.changeRequests) setChangeRequests(data.changeRequests);
        if (data.auditLog) setAuditLog(data.auditLog);
      } catch { /* use defaults */ }
    }
  }, []);

  const saveToStorage = useCallback((d: DocRecord[], a: DocRecord[], del: DocRecord[], depts: Department[], crs?: ChangeRequest[], audit?: AuditEntry[]) => {
    localStorage.setItem("vidyalaya-doc-control", JSON.stringify({ docs: d, archived: a, deleted: del, departments: depts, changeRequests: crs || changeRequests, auditLog: audit || auditLog }));
  }, [changeRequests, auditLog]);

  const addAuditEntry = useCallback((action: string, docName: string, details: string) => {
    const entry: AuditEntry = { id: generateId(), action, documentId: "", documentName: docName, performedBy: "Current User", timestamp: new Date().toISOString().replace("T", " ").slice(0, 16), details };
    setAuditLog((prev) => [entry, ...prev]);
  }, []);

  // Filtering & sorting
  const filteredDocs = docs
    .filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.docId.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterDept !== "All" && d.department !== filterDept) return false;
      if (filterStatus !== "All" && d.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] as string;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] as string;
      return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // Document CRUD
  const createDoc = () => {
    if (!newDocName.trim()) return;
    const year = new Date().getFullYear();
    const num = docs.length + archivedDocs.length + deletedDocs.length + 1;
    const newDoc: DocRecord = {
      id: generateId(), docId: `DOC-${year}-${String(num).padStart(3, "0")}`, name: newDocName, department: newDocDept, author: "Current User",
      routePath: `/${newDocDept.toLowerCase()}/${newDocName.toLowerCase().replace(/\s+/g, "-")}`, version: "1.0", status: "Draft",
      classification: newDocClass, createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0],
      retentionPeriod: newDocRetention, expiryDate: "", tags: [],
      headerConfig: { left: newDocDept, center: newDocName, right: `DOC-${year}-${String(num).padStart(3, "0")}` },
      footerConfig: { left: newDocDept, center: newDocClass, right: "Page {page}" },
      deletedAt: null, docType: newDocType,
      versions: [{ id: generateId(), version: "1.0", changeNotes: "Initial version", createdBy: "Current User", createdAt: new Date().toISOString() }],
    };
    const updated = [...docs, newDoc];
    setDocs(updated);
    addAuditEntry("Created", newDoc.name, `New ${newDocType} document created`);
    saveToStorage(updated, archivedDocs, deletedDocs, departments);
    setNewDocName("");
    setShowNewDoc(false);

    // Navigate to editor
    if (newDocType === "Word") {
      localStorage.setItem("vidyalaya-doc-content", `<h1>${newDocName}</h1><p>Start editing your document here...</p>`);
      window.location.href = "/document";
    } else if (newDocType === "Excel") {
      window.location.href = "/spreadsheet";
    } else {
      window.location.href = "/presentation";
    }
  };

  const deleteDoc = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const updated = docs.filter((d) => d.id !== id);
    const del = [...deletedDocs, { ...doc, status: "Deleted", deletedAt: new Date().toISOString().split("T")[0] }];
    setDocs(updated); setDeletedDocs(del);
    addAuditEntry("Deleted", doc.name, "Moved to trash");
    saveToStorage(updated, archivedDocs, del, departments);
    setSelectedDoc(null);
  };

  const archiveDoc = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const updated = docs.filter((d) => d.id !== id);
    const arch = [...archivedDocs, { ...doc, status: "Archived" }];
    setDocs(updated); setArchivedDocs(arch);
    addAuditEntry("Archived", doc.name, "Moved to archive");
    saveToStorage(updated, arch, deletedDocs, departments);
    setSelectedDoc(null);
  };

  const restoreDeleted = (id: string) => {
    const doc = deletedDocs.find((d) => d.id === id);
    if (!doc) return;
    const del = deletedDocs.filter((d) => d.id !== id);
    const updated = [...docs, { ...doc, status: "Draft", deletedAt: null }];
    setDocs(updated); setDeletedDocs(del);
    addAuditEntry("Restored", doc.name, "Restored from trash");
    saveToStorage(updated, archivedDocs, del, departments);
  };

  const restoreArchived = (id: string) => {
    const doc = archivedDocs.find((d) => d.id === id);
    if (!doc) return;
    const arch = archivedDocs.filter((d) => d.id !== id);
    const updated = [...docs, { ...doc, status: "Draft" }];
    setDocs(updated); setArchivedDocs(arch);
    addAuditEntry("Restored", doc.name, "Restored from archive");
    saveToStorage(updated, arch, deletedDocs, departments);
  };

  const permanentDelete = (id: string) => {
    const doc = deletedDocs.find((d) => d.id === id);
    const del = deletedDocs.filter((d) => d.id !== id);
    setDeletedDocs(del);
    if (doc) addAuditEntry("Permanently Deleted", doc.name, "Permanently removed");
    saveToStorage(docs, archivedDocs, del, departments);
    setConfirmDelete(null);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const bulkArchive = () => {
    const toArchive = docs.filter((d) => selectedIds.has(d.id));
    const remaining = docs.filter((d) => !selectedIds.has(d.id));
    const arch = [...archivedDocs, ...toArchive.map((d) => ({ ...d, status: "Archived" }))];
    setDocs(remaining); setArchivedDocs(arch); setSelectedIds(new Set());
    toArchive.forEach((d) => addAuditEntry("Archived", d.name, "Bulk archive"));
    saveToStorage(remaining, arch, deletedDocs, departments);
  };

  const bulkDelete = () => {
    const toDelete = docs.filter((d) => selectedIds.has(d.id));
    const remaining = docs.filter((d) => !selectedIds.has(d.id));
    const del = [...deletedDocs, ...toDelete.map((d) => ({ ...d, status: "Deleted", deletedAt: new Date().toISOString().split("T")[0] }))];
    setDocs(remaining); setDeletedDocs(del); setSelectedIds(new Set());
    toDelete.forEach((d) => addAuditEntry("Deleted", d.name, "Bulk delete"));
    saveToStorage(remaining, archivedDocs, del, departments);
  };

  // Department CRUD
  const saveDept = () => {
    if (!deptName.trim() || !deptCode.trim()) return;
    if (editingDept) {
      const updated = departments.map((d) => d.id === editingDept.id ? { ...d, name: deptName, code: deptCode, head: deptHead, description: deptDesc, numberingPrefix: deptPrefix } : d);
      setDepartments(updated);
      saveToStorage(docs, archivedDocs, deletedDocs, updated);
    } else {
      const dept: Department = { id: generateId(), name: deptName, code: deptCode, head: deptHead, description: deptDesc, numberingPrefix: deptPrefix };
      const updated = [...departments, dept];
      setDepartments(updated);
      saveToStorage(docs, archivedDocs, deletedDocs, updated);
    }
    setDeptName(""); setDeptCode(""); setDeptHead(""); setDeptDesc(""); setDeptPrefix("");
    setShowNewDept(false); setEditingDept(null);
  };

  const editDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name); setDeptCode(dept.code); setDeptHead(dept.head); setDeptDesc(dept.description); setDeptPrefix(dept.numberingPrefix || "");
    setShowNewDept(true);
  };

  const deleteDept = (id: string) => {
    const updated = departments.filter((d) => d.id !== id);
    setDepartments(updated);
    saveToStorage(docs, archivedDocs, deletedDocs, updated);
  };

  // Header/Footer save
  const saveHeaderFooter = () => {
    if (!selectedDoc) return;
    const updated = docs.map((d) => d.id === selectedDoc.id ? {
      ...d,
      headerConfig: { left: headerLeft, center: headerCenter, right: headerRight },
      footerConfig: { left: footerLeft, center: footerCenter, right: footerRight },
    } : d);
    setDocs(updated);
    setSelectedDoc({ ...selectedDoc, headerConfig: { left: headerLeft, center: headerCenter, right: headerRight }, footerConfig: { left: footerLeft, center: footerCenter, right: footerRight } });
    setEditingHeader(false);
    addAuditEntry("Updated", selectedDoc.name, "Header/Footer configuration updated");
    saveToStorage(updated, archivedDocs, deletedDocs, departments);
  };

  const openHeaderEditor = () => {
    if (!selectedDoc) return;
    setHeaderLeft(selectedDoc.headerConfig.left);
    setHeaderCenter(selectedDoc.headerConfig.center);
    setHeaderRight(selectedDoc.headerConfig.right);
    setFooterLeft(selectedDoc.footerConfig.left);
    setFooterCenter(selectedDoc.footerConfig.center);
    setFooterRight(selectedDoc.footerConfig.right);
    setEditingHeader(true);
  };

  // Save CRs and audit to storage when they change
  useEffect(() => {
    const saved = localStorage.getItem("vidyalaya-doc-control");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        localStorage.setItem("vidyalaya-doc-control", JSON.stringify({ ...data, changeRequests, auditLog }));
      } catch { /* ignore */ }
    }
  }, [changeRequests, auditLog]);

  const tabItems = [
    { key: "registry" as const, label: "Document Registry" },
    { key: "changes" as const, label: "Change Requests" },
    { key: "archive" as const, label: "Archive & Retention" },
    { key: "departments" as const, label: "Departments" },
    { key: "audit" as const, label: "Audit Trail" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        <div className="flex items-center gap-2">
          <Shield size={20} style={{ color: "var(--primary)" }} />
          <h1 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Document Control</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-5 overflow-x-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        {tabItems.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap ${activeTab === t.key ? "border-[var(--primary)]" : "border-transparent"}`}
            style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5">
        {/* ═══ REGISTRY ═══ */}
        {activeTab === "registry" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or Doc ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="All">All Statuses</option>
                {STATUSES.filter((s) => s !== "Archived" && s !== "Deleted").map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setShowNewDoc(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> New Document
              </button>
              <button onClick={() => setShowChangeRequest(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <GitPullRequest size={12} /> Change Request
              </button>
              {selectedIds.size > 0 && (
                <div className="flex gap-1">
                  <button onClick={bulkArchive} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <Archive size={10} /> Archive ({selectedIds.size})
                  </button>
                  <button onClick={bulkDelete} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-500">
                    <Trash2 size={10} /> Delete ({selectedIds.size})
                  </button>
                </div>
              )}
            </div>

            {/* New Doc Dialog */}
            {showNewDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNewDoc(false)}>
                <div className="w-[500px] rounded-xl border shadow-2xl p-5 space-y-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Create New Document</span>
                    <button onClick={() => setShowNewDoc(false)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Document Type</label>
                    <div className="flex gap-2">
                      {(["Word", "Excel", "PPT"] as const).map((t) => (
                        <button key={t} onClick={() => setNewDocType(t)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-medium ${newDocType === t ? "border-[var(--primary)]" : ""}`}
                          style={{ borderColor: newDocType === t ? "var(--primary)" : "var(--border)", color: newDocType === t ? "var(--primary)" : "var(--foreground)", backgroundColor: newDocType === t ? "var(--muted)" : "transparent" }}>
                          {t === "Word" ? <FileText size={16} /> : t === "Excel" ? <FileText size={16} /> : <FileText size={16} />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Document Name"
                    className="w-full rounded border px-3 py-2 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Department</label>
                      <select value={newDocDept} onChange={(e) => setNewDocDept(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Classification</label>
                      <select value={newDocClass} onChange={(e) => setNewDocClass(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Retention</label>
                      <select value={newDocRetention} onChange={(e) => setNewDocRetention(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        {RETENTION_PERIODS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="text-[10px] rounded border p-2" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    <strong>Preview:</strong> Doc ID: DOC-{new Date().getFullYear()}-{String(docs.length + archivedDocs.length + deletedDocs.length + 1).padStart(3, "0")} | Author: Current User
                  </div>
                  <button onClick={createDoc} className="w-full px-3 py-2 rounded-lg text-xs text-white font-medium" style={{ backgroundColor: "var(--primary)" }}>
                    Create & Open in Editor
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "var(--muted)" }}>
                      <th className="px-2 py-2 text-left w-8">
                        <input type="checkbox" onChange={(e) => { if (e.target.checked) setSelectedIds(new Set(filteredDocs.map((d) => d.id))); else setSelectedIds(new Set()); }} />
                      </th>
                      {[{ key: "docId", label: "Doc ID" }, { key: "name", label: "Name" }, { key: "department", label: "Department" }, { key: "author", label: "Author" }, { key: "version", label: "Version" }, { key: "status", label: "Status" }, { key: "createdAt", label: "Created" }, { key: "retentionPeriod", label: "Retention" }].map((col) => (
                        <th key={col.key} onClick={() => handleSort(col.key)} className="px-2 py-2 text-left cursor-pointer hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
                          <span className="flex items-center gap-1">{col.label}{sortField === col.key && (sortDir === "asc" ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}</span>
                        </th>
                      ))}
                      <th className="px-2 py-2" style={{ color: "var(--muted-foreground)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-t hover:bg-[var(--muted)] cursor-pointer" style={{ borderColor: "var(--border)" }} onClick={() => setSelectedDoc(doc)}>
                        <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} /></td>
                        <td className="px-2 py-2 font-mono" style={{ color: "var(--primary)" }}>{doc.docId}</td>
                        <td className="px-2 py-2 font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</td>
                        <td className="px-2 py-2" style={{ color: "var(--muted-foreground)" }}>{doc.department}</td>
                        <td className="px-2 py-2" style={{ color: "var(--muted-foreground)" }}>{doc.author}</td>
                        <td className="px-2 py-2" style={{ color: "var(--foreground)" }}>v{doc.version}</td>
                        <td className="px-2 py-2"><StatusBadge status={doc.status} /></td>
                        <td className="px-2 py-2" style={{ color: "var(--muted-foreground)" }}>{doc.createdAt}</td>
                        <td className="px-2 py-2"><RetentionIndicator expiryDate={doc.expiryDate} /></td>
                        <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <button onClick={() => setSelectedDoc(doc)} className="p-1 rounded hover:bg-[var(--muted)]" title="View"><Eye size={12} style={{ color: "var(--primary)" }} /></button>
                            <button onClick={() => archiveDoc(doc.id)} className="p-1 rounded hover:bg-[var(--muted)]" title="Archive"><Archive size={12} style={{ color: "var(--muted-foreground)" }} /></button>
                            <button onClick={() => deleteDoc(doc.id)} className="p-1 rounded hover:bg-[var(--muted)]" title="Delete"><Trash2 size={12} className="text-red-400" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHANGE REQUESTS ═══ */}
        {activeTab === "changes" && (
          <ChangeRequests
            changeRequests={changeRequests}
            setChangeRequests={setChangeRequests}
            docNames={docs.map((d) => ({ id: d.id, name: d.name }))}
            onAudit={addAuditEntry}
          />
        )}

        {/* ═══ ARCHIVE & RETENTION ═══ */}
        {activeTab === "archive" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["archived", "deleted"] as const).map((t) => (
                <button key={t} onClick={() => setArchiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${archiveTab === t ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                  style={{ color: archiveTab === t ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {t === "archived" ? `Archived (${archivedDocs.length})` : `Deleted (${deletedDocs.length})`}
                </button>
              ))}
            </div>
            {/* Retention summary */}
            <div className="grid grid-cols-4 gap-3">
              {[{ label: "Active", count: docs.length, color: "#3b82f6" }, { label: "Archived", count: archivedDocs.length, color: "#8b5cf6" }, { label: "Expiring Soon", count: docs.filter((d) => { if (!d.expiryDate) return false; const dl = Math.floor((new Date(d.expiryDate).getTime() - Date.now()) / 86400000); return dl > 0 && dl <= 365; }).length, color: "#f59e0b" }, { label: "Expired", count: docs.filter((d) => d.expiryDate && new Date(d.expiryDate) < new Date()).length, color: "#ef4444" }].map((s) => (
                <div key={s.label} className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {archiveTab === "archived" && archivedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "#8b5cf6", backgroundColor: "var(--card)" }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                    <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      <span>{doc.docId}</span><span>{doc.department}</span><RetentionIndicator expiryDate={doc.expiryDate} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => restoreArchived(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                      <RotateCcw size={10} /> Restore
                    </button>
                    <button onClick={() => setConfirmDelete(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-400">
                      <Trash2 size={10} /> Permanent Delete
                    </button>
                  </div>
                </div>
              ))}
              {archiveTab === "deleted" && deletedDocs.map((doc) => {
                const deletedDate = doc.deletedAt ? new Date(doc.deletedAt) : new Date();
                const purgeDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                const daysUntilPurge = Math.max(0, Math.floor((purgeDate.getTime() - Date.now()) / 86400000));
                return (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "#ef4444", backgroundColor: "var(--card)" }}>
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                      <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        <span>{doc.docId}</span><span className="text-red-400">Auto-purge in {daysUntilPurge} days</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => restoreDeleted(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                        <RotateCcw size={10} /> Restore
                      </button>
                      <button onClick={() => setConfirmDelete(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-400">
                        <Trash2 size={10} /> Permanent Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {archiveTab === "archived" && archivedDocs.length === 0 && <div className="text-center py-10 text-xs" style={{ color: "var(--muted-foreground)" }}>No archived documents</div>}
              {archiveTab === "deleted" && deletedDocs.length === 0 && <div className="text-center py-10 text-xs" style={{ color: "var(--muted-foreground)" }}>Recycle bin is empty</div>}
            </div>
          </div>
        )}

        {/* ═══ DEPARTMENTS ═══ */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Departments</h2>
              <button onClick={() => { setEditingDept(null); setDeptName(""); setDeptCode(""); setDeptHead(""); setDeptDesc(""); setDeptPrefix(""); setShowNewDept(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> Add Department
              </button>
            </div>
            {showNewDept && (
              <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{editingDept ? "Edit Department" : "New Department"}</span>
                  <button onClick={() => { setShowNewDept(false); setEditingDept(null); }}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="Name" className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={deptCode} onChange={(e) => setDeptCode(e.target.value)} placeholder="Code (e.g. ENG)" className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={deptHead} onChange={(e) => setDeptHead(e.target.value)} placeholder="Head" className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={deptDesc} onChange={(e) => setDeptDesc(e.target.value)} placeholder="Description" className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={deptPrefix} onChange={(e) => setDeptPrefix(e.target.value)} placeholder="Doc Prefix (e.g. ENG-DOC)" className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
                <button onClick={saveDept} className="px-3 py-1.5 rounded text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>{editingDept ? "Update" : "Create"}</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {departments.map((dept) => {
                const deptDocs = docs.filter((d) => d.department === dept.name);
                const byStatus = STATUSES.slice(0, 4).map((s) => ({ s, c: deptDocs.filter((d) => d.status === s).length })).filter((x) => x.c > 0);
                return (
                  <div key={dept.id} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} style={{ color: "var(--primary)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{dept.code}</span>
                        <button onClick={() => editDept(dept)} className="p-1 rounded hover:bg-[var(--muted)]"><Edit3 size={10} style={{ color: "var(--muted-foreground)" }} /></button>
                        <button onClick={() => deleteDept(dept.id)} className="p-1 rounded hover:bg-[var(--muted)]"><Trash2 size={10} className="text-red-400" /></button>
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1" style={{ color: "var(--muted-foreground)" }}>
                      <div className="flex items-center gap-1"><User size={10} /> Head: {dept.head || "—"}</div>
                      <div>{dept.description || "—"}</div>
                      {dept.numberingPrefix && <div className="font-mono">Prefix: {dept.numberingPrefix}-###</div>}
                      <div className="flex items-center gap-1"><FileText size={10} /> {deptDocs.length} documents</div>
                      {byStatus.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {byStatus.map((x) => (
                            <span key={x.s} className="px-1 py-0.5 rounded text-[8px] text-white" style={{ backgroundColor: STATUS_COLORS[x.s] }}>{x.s}: {x.c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Org Chart */}
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--foreground)" }}>Organization Chart</h3>
              <div className="flex flex-col items-center">
                <div className="rounded-lg border px-4 py-2 text-xs font-medium" style={{ borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "var(--muted)" }}>Management</div>
                <div className="w-px h-4" style={{ backgroundColor: "var(--border)" }} />
                <div className="flex flex-wrap justify-center gap-3">
                  {departments.filter((d) => d.name !== "Management").map((dept) => (
                    <div key={dept.id} className="rounded border px-3 py-1.5 text-[10px] text-center" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <div className="font-medium">{dept.name}</div>
                      <div style={{ color: "var(--muted-foreground)" }}>{dept.head}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ AUDIT TRAIL ═══ */}
        {activeTab === "audit" && <AuditTrail auditLog={auditLog} />}
      </div>

      {/* ═══ DOCUMENT DETAIL MODAL ═══ */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setSelectedDoc(null); setEditingHeader(false); }}>
          <div className="w-[720px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="flex items-center gap-2"><span className="text-xs font-mono" style={{ color: "var(--primary)" }}>{selectedDoc.docId}</span><StatusBadge status={selectedDoc.status} /></div>
                <h2 className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{selectedDoc.name}</h2>
              </div>
              <button onClick={() => { setSelectedDoc(null); setEditingHeader(false); }}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-5">
              {/* Route Path */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Document Lifecycle</h3>
                <RoutePathVisual doc={selectedDoc} />
              </div>
              {/* Meta */}
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Department</label><div className="text-xs mt-0.5" style={{ color: "var(--foreground)" }}>{selectedDoc.department}</div></div>
                <div><label className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Route Path</label><div className="text-xs mt-0.5 font-mono" style={{ color: "var(--foreground)" }}>{selectedDoc.routePath}</div></div>
                <div><label className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Classification</label><div className="text-xs mt-0.5" style={{ color: "var(--foreground)" }}>{selectedDoc.classification}</div></div>
              </div>
              {/* Version History */}
              <div>
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--foreground)" }}><History size={12} /> Version History</h3>
                {selectedDoc.versions.length > 0 ? selectedDoc.versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded border p-2 mb-1" style={{ borderColor: "var(--border)" }}>
                    <div><span className="text-xs font-medium" style={{ color: "var(--primary)" }}>v{v.version}</span><span className="text-[10px] ml-2" style={{ color: "var(--muted-foreground)" }}>{v.changeNotes}</span></div>
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted-foreground)" }}><span>{v.createdBy}</span><span>{new Date(v.createdAt).toLocaleDateString()}</span></div>
                  </div>
                )) : <div className="text-[10px] py-2" style={{ color: "var(--muted-foreground)" }}>No version history</div>}
              </div>
              {/* Header & Footer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Header & Footer</h3>
                  <button onClick={editingHeader ? saveHeaderFooter : openHeaderEditor} className="px-2 py-1 rounded text-[10px] border" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                    {editingHeader ? "Save" : "Edit"}
                  </button>
                </div>
                {editingHeader ? (
                  <div className="space-y-3">
                    <div className="rounded border p-3" style={{ borderColor: "var(--border)" }}>
                      <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Header</div>
                      <div className="grid grid-cols-3 gap-2">
                        <input value={headerLeft} onChange={(e) => setHeaderLeft(e.target.value)} placeholder="Left (e.g., Logo/Dept)" className="rounded border px-2 py-1 text-[10px] bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                        <input value={headerCenter} onChange={(e) => setHeaderCenter(e.target.value)} placeholder="Center (e.g., Doc Title)" className="rounded border px-2 py-1 text-[10px] bg-transparent text-center" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                        <input value={headerRight} onChange={(e) => setHeaderRight(e.target.value)} placeholder="Right (e.g., Doc ID)" className="rounded border px-2 py-1 text-[10px] bg-transparent text-right" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                      </div>
                    </div>
                    <div className="rounded border p-3" style={{ borderColor: "var(--border)" }}>
                      <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Footer</div>
                      <div className="grid grid-cols-3 gap-2">
                        <input value={footerLeft} onChange={(e) => setFooterLeft(e.target.value)} placeholder="Left (e.g., Dept)" className="rounded border px-2 py-1 text-[10px] bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                        <input value={footerCenter} onChange={(e) => setFooterCenter(e.target.value)} placeholder="Center (e.g., Confidentiality)" className="rounded border px-2 py-1 text-[10px] bg-transparent text-center" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                        <input value={footerRight} onChange={(e) => setFooterRight(e.target.value)} placeholder="Right (e.g., Page {page})" className="rounded border px-2 py-1 text-[10px] bg-transparent text-right" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                      </div>
                    </div>
                    {/* Live Preview */}
                    <div className="rounded border p-2" style={{ borderColor: "var(--primary)", backgroundColor: "var(--muted)" }}>
                      <div className="text-[8px] font-medium mb-1" style={{ color: "var(--primary)" }}>LIVE PREVIEW</div>
                      <div className="flex justify-between text-[10px] border-b pb-1 mb-3" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        <span>{headerLeft || "—"}</span><span>{headerCenter || "—"}</span><span>{headerRight || "—"}</span>
                      </div>
                      <div className="h-8 flex items-center justify-center text-[9px]" style={{ color: "var(--muted-foreground)" }}>[Document Content]</div>
                      <div className="flex justify-between text-[10px] border-t pt-1 mt-3" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        <span>{footerLeft || "—"}</span><span>{footerCenter || "—"}</span><span>{footerRight || "—"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border p-2" style={{ borderColor: "var(--border)" }}>
                      <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Header</div>
                      <div className="grid grid-cols-3 gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
                        <span>L: {selectedDoc.headerConfig.left || "—"}</span><span>C: {selectedDoc.headerConfig.center || "—"}</span><span>R: {selectedDoc.headerConfig.right || "—"}</span>
                      </div>
                    </div>
                    <div className="rounded border p-2" style={{ borderColor: "var(--border)" }}>
                      <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Footer</div>
                      <div className="grid grid-cols-3 gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
                        <span>L: {selectedDoc.footerConfig.left || "—"}</span><span>C: {selectedDoc.footerConfig.center || "—"}</span><span>R: {selectedDoc.footerConfig.right || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Retention */}
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Retention Period</label><div className="text-xs" style={{ color: "var(--foreground)" }}>{selectedDoc.retentionPeriod}</div></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Expiry</label><div className="text-xs" style={{ color: "var(--foreground)" }}>{selectedDoc.expiryDate || "N/A"}</div></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Status</label><RetentionIndicator expiryDate={selectedDoc.expiryDate} /></div>
              </div>
              {/* Tags */}
              <div>
                <h3 className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedDoc.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 rounded-full text-[10px] border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{tag}</span>))}
                  {selectedDoc.tags.length === 0 && <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>No tags</span>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => archiveDoc(selectedDoc.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><Archive size={12} /> Archive</button>
              <button onClick={() => deleteDoc(selectedDoc.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs border-red-500 text-red-400"><Trash2 size={12} /> Delete</button>
              <button onClick={() => { setSelectedDoc(null); setEditingHeader(false); }} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div className="w-[360px] rounded-xl border p-5 shadow-2xl" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Confirm Permanent Deletion</h3>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Are you sure? This action cannot be undone. The document and all its versions will be permanently removed.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
              <button onClick={() => permanentDelete(confirmDelete)} className="px-3 py-1.5 rounded-lg text-xs text-white bg-red-500">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Request Dialog */}
      {showChangeRequest && (
        <ChangeRequestForm
          onClose={() => setShowChangeRequest(false)}
          onSubmit={(data) => {
            console.log("Change request submitted:", data);
            setShowChangeRequest(false);
          }}
        />
      )}

      {/* New Document Dialog */}
      {showNewDocDialog && (
        <NewDocumentDialog onClose={() => setShowNewDocDialog(false)} />
      )}
    </div>
  );
}
