"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Filter, ChevronDown, ChevronRight, X, Edit3, Trash2, Archive,
  RotateCcw, Shield, Clock, User, Calendar, Building2, FileText, Tag,
  CheckCircle2, AlertCircle, XCircle, Eye, History, Download, ArrowRight,
  GitPullRequest, Settings, List, BarChart3, Layers, FolderOpen,
} from "lucide-react";

// Types
interface DocRecord {
  id: string;
  docId: string;
  name: string;
  department: string;
  author: string;
  routePath: string;
  version: string;
  status: string;
  classification: string;
  createdAt: string;
  updatedAt: string;
  retentionPeriod: string;
  expiryDate: string;
  tags: string[];
  headerConfig: { left: string; center: string; right: string };
  footerConfig: { left: string; center: string; right: string };
  deletedAt: string | null;
  versions: DocVersion[];
}

interface DocVersion {
  id: string;
  version: string;
  changeNotes: string;
  createdBy: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  description: string;
}

interface ChangeRequest {
  id: string;
  documentId: string;
  documentName: string;
  changeType: "New" | "Revision" | "Obsolete";
  reason: string;
  affectedSections: string;
  requestor: string;
  approver: string;
  status: "Draft" | "Submitted" | "Review" | "Approved" | "Implemented" | "Rejected";
  createdAt: string;
  updatedAt: string;
  comments: { author: string; text: string; date: string }[];
}

interface AuditEntry {
  id: string;
  action: string;
  documentId: string;
  documentName: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

const DEPARTMENTS = ["Engineering", "QA", "HR", "Finance", "Operations", "Legal", "IT", "Management"];
const STATUSES = ["Draft", "Under Review", "Approved", "Published", "Archived", "Deleted"];
const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"];
const RETENTION_PERIODS = ["1yr", "2yr", "5yr", "7yr", "10yr", "Permanent"];
const CHANGE_TYPES: ("New" | "Revision" | "Obsolete")[] = ["New", "Revision", "Obsolete"];
const CR_STATUSES: ChangeRequest["status"][] = ["Draft", "Submitted", "Review", "Approved", "Implemented", "Rejected"];
const DOC_TYPES = ["Word", "Excel", "PPT"] as const;

const STATUS_COLORS: Record<string, string> = {
  Draft: "#6b7280",
  "Under Review": "#f59e0b",
  Approved: "#10b981",
  Published: "#3b82f6",
  Archived: "#8b5cf6",
  Deleted: "#ef4444",
  Submitted: "#3b82f6",
  Review: "#f59e0b",
  Implemented: "#10b981",
  Rejected: "#ef4444",
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const MOCK_DOCS: DocRecord[] = [
  { id: "1", docId: "DOC-2024-001", name: "Quality Management SOP", department: "QA", author: "John Smith", routePath: "/qa/sops/SOP-001", version: "2.1", status: "Published", classification: "Internal", createdAt: "2024-01-15", updatedAt: "2024-06-20", retentionPeriod: "7yr", expiryDate: "2031-01-15", tags: ["sop", "quality"], headerConfig: { left: "QA Dept", center: "QMS SOP", right: "DOC-2024-001" }, footerConfig: { left: "Rev 2.1", center: "Confidential", right: "Page {page}" }, deletedAt: null, versions: [{ id: "v1", version: "2.1", changeNotes: "Updated section 4", createdBy: "John Smith", createdAt: "2024-06-20" }, { id: "v2", version: "2.0", changeNotes: "Major revision", createdBy: "John Smith", createdAt: "2024-03-01" }, { id: "v3", version: "1.0", changeNotes: "Initial release", createdBy: "Jane Doe", createdAt: "2024-01-15" }] },
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
  { id: "d1", name: "Engineering", code: "ENG", head: "Mike Chen", description: "Software engineering and development" },
  { id: "d2", name: "QA", code: "QA", head: "John Smith", description: "Quality assurance and testing" },
  { id: "d3", name: "HR", code: "HR", head: "Sarah Wilson", description: "Human resources management" },
  { id: "d4", name: "Finance", code: "FIN", head: "Lisa Park", description: "Financial planning and accounting" },
  { id: "d5", name: "Operations", code: "OPS", head: "Amy Brown", description: "Business operations" },
  { id: "d6", name: "Legal", code: "LEG", head: "Tom Harris", description: "Legal and compliance" },
  { id: "d7", name: "IT", code: "IT", head: "David Lee", description: "Information technology" },
  { id: "d8", name: "Management", code: "MGT", head: "Emma White", description: "Executive management" },
];

const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  { id: "CR-001", documentId: "1", documentName: "Quality Management SOP", changeType: "Revision", reason: "Section 4.2 needs updating to reflect new ISO 9001:2024 requirements", affectedSections: "4.2, 4.3, Appendix B", requestor: "John Smith", approver: "Mike Chen", status: "Approved", createdAt: "2024-09-01", updatedAt: "2024-09-15", comments: [{ author: "Mike Chen", text: "Approved. Please proceed with revision.", date: "2024-09-15" }] },
  { id: "CR-002", documentId: "4", documentName: "Financial Report Q3", changeType: "Revision", reason: "Revenue figures need correction in Section 3", affectedSections: "3.1, 3.2, Executive Summary", requestor: "Lisa Park", approver: "Emma White", status: "Review", createdAt: "2024-09-20", updatedAt: "2024-09-22", comments: [{ author: "Lisa Park", text: "Corrections identified during audit review", date: "2024-09-20" }] },
  { id: "CR-003", documentId: "6", documentName: "Operations Manual", changeType: "New", reason: "New warehouse safety procedures need to be documented", affectedSections: "New Section 7", requestor: "Amy Brown", approver: "Tom Harris", status: "Submitted", createdAt: "2024-09-25", updatedAt: "2024-09-25", comments: [] },
  { id: "CR-004", documentId: "3", documentName: "API Documentation", changeType: "Obsolete", reason: "API v1 endpoints deprecated, replaced by v2 documentation", affectedSections: "All sections", requestor: "Mike Chen", approver: "David Lee", status: "Draft", createdAt: "2024-09-28", updatedAt: "2024-09-28", comments: [] },
];

const MOCK_AUDIT: AuditEntry[] = [
  { id: "aud-1", action: "Created", documentId: "1", documentName: "Quality Management SOP", performedBy: "John Smith", timestamp: "2024-01-15T09:00:00", details: "Document created with initial version 1.0" },
  { id: "aud-2", action: "Updated", documentId: "1", documentName: "Quality Management SOP", performedBy: "John Smith", timestamp: "2024-03-01T14:30:00", details: "Major revision to version 2.0" },
  { id: "aud-3", action: "Status Changed", documentId: "1", documentName: "Quality Management SOP", performedBy: "Mike Chen", timestamp: "2024-06-20T10:15:00", details: "Status changed from Under Review to Published" },
  { id: "aud-4", action: "Created", documentId: "2", documentName: "Employee Handbook", performedBy: "Sarah Wilson", timestamp: "2024-02-10T11:00:00", details: "Document created with initial version 1.0" },
  { id: "aud-5", action: "Updated", documentId: "2", documentName: "Employee Handbook", performedBy: "Sarah Wilson", timestamp: "2024-08-15T16:00:00", details: "Annual update to version 3.0" },
  { id: "aud-6", action: "Change Request Created", documentId: "1", documentName: "Quality Management SOP", performedBy: "John Smith", timestamp: "2024-09-01T08:45:00", details: "CR-001: Revision request for ISO 9001:2024 compliance" },
  { id: "aud-7", action: "Archived", documentId: "a1", documentName: "Old Training Manual", performedBy: "Sara K.", timestamp: "2023-12-01T09:00:00", details: "Document archived after retention period review" },
  { id: "aud-8", action: "Deleted", documentId: "d1", documentName: "Deprecated Process Doc", performedBy: "Mark T.", timestamp: "2024-09-15T13:30:00", details: "Document moved to deleted state" },
  { id: "aud-9", action: "Change Request Created", documentId: "4", documentName: "Financial Report Q3", performedBy: "Lisa Park", timestamp: "2024-09-20T10:00:00", details: "CR-002: Revenue correction request" },
  { id: "aud-10", action: "Status Changed", documentId: "5", documentName: "IT Security Policy", performedBy: "David Lee", timestamp: "2024-08-01T15:00:00", details: "Status changed from Approved to Published" },
  { id: "aud-11", action: "Created", documentId: "8", documentName: "Board Meeting Minutes", performedBy: "Emma White", timestamp: "2024-08-30T17:00:00", details: "Document created for August board meeting" },
  { id: "aud-12", action: "Change Request Created", documentId: "6", documentName: "Operations Manual", performedBy: "Amy Brown", timestamp: "2024-09-25T11:30:00", details: "CR-003: New warehouse safety procedures" },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
      style={{ backgroundColor: STATUS_COLORS[status] || "#6b7280" }}
    >
      {status}
    </span>
  );
}

function RetentionIndicator({ expiryDate }: { expiryDate: string }) {
  if (!expiryDate) return <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Permanent</span>;
  const now = new Date();
  const exp = new Date(expiryDate);
  const daysLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const color = daysLeft > 365 ? "#10b981" : daysLeft > 90 ? "#f59e0b" : "#ef4444";
  return (
    <span className="flex items-center gap-1 text-[10px]">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span style={{ color: "var(--muted-foreground)" }}>{daysLeft > 0 ? `${daysLeft}d left` : "Expired"}</span>
    </span>
  );
}

function CRStatusStepper({ status }: { status: ChangeRequest["status"] }) {
  const steps: ChangeRequest["status"][] = ["Draft", "Submitted", "Review", "Approved", "Implemented"];
  const isRejected = status === "Rejected";
  const currentIdx = isRejected ? steps.indexOf("Review") : steps.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full py-3">
      {steps.map((step, i) => {
        const isCompleted = !isRejected && i < currentIdx;
        const isCurrent = isRejected ? false : i === currentIdx;
        const isPending = isRejected ? i > 2 : i > currentIdx;
        const color = isCompleted ? "#10b981" : isCurrent ? "#3b82f6" : "#d1d5db";
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center" style={{ minWidth: 70 }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className="text-[9px] mt-1 text-center" style={{ color: isPending ? "var(--muted-foreground)" : "var(--foreground)" }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mt-[-12px]" style={{ backgroundColor: isCompleted || (isCurrent && i < currentIdx) ? "#10b981" : "#d1d5db" }} />
            )}
          </React.Fragment>
        );
      })}
      {isRejected && (
        <div className="flex flex-col items-center ml-2" style={{ minWidth: 70 }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#ef4444" }}>
            <XCircle size={14} />
          </div>
          <span className="text-[9px] mt-1 text-center" style={{ color: "#ef4444" }}>Rejected</span>
        </div>
      )}
    </div>
  );
}

function RoutePathViz({ doc }: { doc: DocRecord }) {
  const stages = [
    { name: "Created", timestamp: doc.createdAt, person: doc.author },
    { name: "Under Review", timestamp: doc.status === "Under Review" || doc.status === "Approved" || doc.status === "Published" ? doc.updatedAt : "", person: doc.department + " Lead" },
    { name: "Approved", timestamp: doc.status === "Approved" || doc.status === "Published" ? doc.updatedAt : "", person: "Approver" },
    { name: "Published", timestamp: doc.status === "Published" ? doc.updatedAt : "", person: "Admin" },
  ];

  const statusOrder = ["Draft", "Under Review", "Approved", "Published"];
  const currentIdx = statusOrder.indexOf(doc.status);

  return (
    <div className="flex items-start gap-0 w-full py-3 overflow-x-auto">
      {stages.map((stage, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isPending = i > currentIdx;
        const color = isCompleted ? "#10b981" : isCurrent ? "#f59e0b" : "#d1d5db";
        return (
          <React.Fragment key={stage.name}>
            <div className="flex flex-col items-center" style={{ minWidth: 100 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : isCurrent ? <Clock size={14} /> : <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-[10px] font-medium mt-1 text-center" style={{ color: isPending ? "var(--muted-foreground)" : "var(--foreground)" }}>
                {stage.name}
              </span>
              {stage.timestamp && (
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{stage.timestamp}</span>
              )}
              {stage.timestamp && (
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{stage.person}</span>
              )}
            </div>
            {i < stages.length - 1 && (
              <div className="flex-1 h-0.5 mt-4" style={{ backgroundColor: isCompleted ? "#10b981" : "#d1d5db", minWidth: 20 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function DocControlPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"registry" | "changeRequests" | "archive" | "departments" | "audit">("registry");
  const [docs, setDocs] = useState<DocRecord[]>(MOCK_DOCS);
  const [archivedDocs, setArchivedDocs] = useState<DocRecord[]>(MOCK_ARCHIVED);
  const [deletedDocs, setDeletedDocs] = useState<DocRecord[]>(MOCK_DELETED);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(MOCK_CHANGE_REQUESTS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<string>("docId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [archiveTab, setArchiveTab] = useState<"active" | "archived" | "deleted">("active");
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [showNewDept, setShowNewDept] = useState(false);
  const [showNewCR, setShowNewCR] = useState(false);
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState<string | null>(null);
  const [retentionFilter, setRetentionFilter] = useState<"all" | "active" | "expiring" | "expired">("all");
  const [auditFilterAction, setAuditFilterAction] = useState("All");
  const [auditFilterDateFrom, setAuditFilterDateFrom] = useState("");
  const [auditFilterDateTo, setAuditFilterDateTo] = useState("");

  // New doc form
  const [newDocName, setNewDocName] = useState("");
  const [newDocDept, setNewDocDept] = useState("Engineering");
  const [newDocClass, setNewDocClass] = useState("Internal");
  const [newDocRetention, setNewDocRetention] = useState("5yr");
  const [newDocType, setNewDocType] = useState<"Word" | "Excel" | "PPT">("Word");

  // New dept form
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptHead, setNewDeptHead] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

  // New CR form
  const [crDocId, setCrDocId] = useState("");
  const [crChangeType, setCrChangeType] = useState<"New" | "Revision" | "Obsolete">("Revision");
  const [crReason, setCrReason] = useState("");
  const [crAffectedSections, setCrAffectedSections] = useState("");
  const [crApprover, setCrApprover] = useState("");

  // Edit dept form
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptCode, setEditDeptCode] = useState("");
  const [editDeptHead, setEditDeptHead] = useState("");
  const [editDeptDesc, setEditDeptDesc] = useState("");

  // Header/Footer editing
  const [editHeaderLeft, setEditHeaderLeft] = useState("");
  const [editHeaderCenter, setEditHeaderCenter] = useState("");
  const [editHeaderRight, setEditHeaderRight] = useState("");
  const [editFooterLeft, setEditFooterLeft] = useState("");
  const [editFooterCenter, setEditFooterCenter] = useState("");
  const [editFooterRight, setEditFooterRight] = useState("");

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
    localStorage.setItem("vidyalaya-doc-control", JSON.stringify({
      docs: d, archived: a, deleted: del, departments: depts,
      changeRequests: crs || changeRequests, auditLog: audit || auditLog,
    }));
  }, [changeRequests, auditLog]);

  const addAuditEntry = useCallback((action: string, docId: string, docName: string, details: string, currentAudit?: AuditEntry[]) => {
    const entry: AuditEntry = {
      id: generateId(),
      action,
      documentId: docId,
      documentName: docName,
      performedBy: "Current User",
      timestamp: new Date().toISOString(),
      details,
    };
    const updated = [...(currentAudit || auditLog), entry];
    setAuditLog(updated);
    return updated;
  }, [auditLog]);

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

  const createDoc = () => {
    if (!newDocName.trim()) return;
    const year = new Date().getFullYear();
    const num = docs.length + archivedDocs.length + deletedDocs.length + 1;
    const newDoc: DocRecord = {
      id: generateId(),
      docId: `DOC-${year}-${String(num).padStart(3, "0")}`,
      name: newDocName,
      department: newDocDept,
      author: "Current User",
      routePath: `/${newDocDept.toLowerCase()}/${newDocName.toLowerCase().replace(/\s+/g, "-")}`,
      version: "1.0",
      status: "Draft",
      classification: newDocClass,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      retentionPeriod: newDocRetention,
      expiryDate: "",
      tags: [],
      headerConfig: { left: "", center: "", right: "" },
      footerConfig: { left: "", center: "", right: "" },
      deletedAt: null,
      versions: [{ id: generateId(), version: "1.0", changeNotes: "Initial version", createdBy: "Current User", createdAt: new Date().toISOString() }],
    };
    const updated = [...docs, newDoc];
    setDocs(updated);
    const newAudit = addAuditEntry("Created", newDoc.id, newDoc.name, `Document created: ${newDoc.docId}`);
    saveToStorage(updated, archivedDocs, deletedDocs, departments, changeRequests, newAudit);
    setNewDocName("");
    setShowNewDoc(false);

    // Navigate based on type
    const routes: Record<string, string> = { Word: "/document", Excel: "/spreadsheet", PPT: "/presentation" };
    router.push(routes[newDocType]);
  };

  const deleteDoc = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const updated = docs.filter((d) => d.id !== id);
    const del = [...deletedDocs, { ...doc, status: "Deleted", deletedAt: new Date().toISOString().split("T")[0] }];
    setDocs(updated);
    setDeletedDocs(del);
    const newAudit = addAuditEntry("Deleted", doc.id, doc.name, `Document moved to deleted: ${doc.docId}`);
    saveToStorage(updated, archivedDocs, del, departments, changeRequests, newAudit);
    setSelectedDoc(null);
  };

  const archiveDoc = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const updated = docs.filter((d) => d.id !== id);
    const arch = [...archivedDocs, { ...doc, status: "Archived" }];
    setDocs(updated);
    setArchivedDocs(arch);
    const newAudit = addAuditEntry("Archived", doc.id, doc.name, `Document archived: ${doc.docId}`);
    saveToStorage(updated, arch, deletedDocs, departments, changeRequests, newAudit);
    setSelectedDoc(null);
  };

  const restoreDeleted = (id: string) => {
    const doc = deletedDocs.find((d) => d.id === id);
    if (!doc) return;
    const del = deletedDocs.filter((d) => d.id !== id);
    const updated = [...docs, { ...doc, status: "Draft", deletedAt: null }];
    setDocs(updated);
    setDeletedDocs(del);
    const newAudit = addAuditEntry("Restored", doc.id, doc.name, `Document restored from deleted: ${doc.docId}`);
    saveToStorage(updated, archivedDocs, del, departments, changeRequests, newAudit);
  };

  const restoreArchived = (id: string) => {
    const doc = archivedDocs.find((d) => d.id === id);
    if (!doc) return;
    const arch = archivedDocs.filter((d) => d.id !== id);
    const updated = [...docs, { ...doc, status: "Draft" }];
    setDocs(updated);
    setArchivedDocs(arch);
    const newAudit = addAuditEntry("Restored", doc.id, doc.name, `Document restored from archive: ${doc.docId}`);
    saveToStorage(updated, arch, deletedDocs, departments, changeRequests, newAudit);
  };

  const permanentDelete = (id: string) => {
    const doc = deletedDocs.find((d) => d.id === id);
    const del = deletedDocs.filter((d) => d.id !== id);
    setDeletedDocs(del);
    const newAudit = addAuditEntry("Permanently Deleted", doc?.id || id, doc?.name || "Unknown", `Document permanently deleted: ${doc?.docId || id}`);
    saveToStorage(docs, archivedDocs, del, departments, changeRequests, newAudit);
    setConfirmPermanentDelete(null);
  };

  const createDept = () => {
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    const dept: Department = { id: generateId(), name: newDeptName, code: newDeptCode, head: newDeptHead, description: newDeptDesc };
    const updated = [...departments, dept];
    setDepartments(updated);
    saveToStorage(docs, archivedDocs, deletedDocs, updated);
    setNewDeptName(""); setNewDeptCode(""); setNewDeptHead(""); setNewDeptDesc("");
    setShowNewDept(false);
  };

  const updateDept = () => {
    if (!editingDept) return;
    const updated = departments.map((d) => d.id === editingDept.id ? { ...d, name: editDeptName, code: editDeptCode, head: editDeptHead, description: editDeptDesc } : d);
    setDepartments(updated);
    saveToStorage(docs, archivedDocs, deletedDocs, updated);
    setEditingDept(null);
  };

  const deleteDept = (id: string) => {
    const updated = departments.filter((d) => d.id !== id);
    setDepartments(updated);
    saveToStorage(docs, archivedDocs, deletedDocs, updated);
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
    setDocs(remaining);
    setArchivedDocs(arch);
    setSelectedIds(new Set());
    const newAudit = toArchive.reduce((acc, d) => addAuditEntry("Archived", d.id, d.name, `Bulk archive: ${d.docId}`, acc), auditLog);
    saveToStorage(remaining, arch, deletedDocs, departments, changeRequests, newAudit);
  };

  const bulkDelete = () => {
    const toDelete = docs.filter((d) => selectedIds.has(d.id));
    const remaining = docs.filter((d) => !selectedIds.has(d.id));
    const del = [...deletedDocs, ...toDelete.map((d) => ({ ...d, status: "Deleted", deletedAt: new Date().toISOString().split("T")[0] }))];
    setDocs(remaining);
    setDeletedDocs(del);
    setSelectedIds(new Set());
    const newAudit = toDelete.reduce((acc, d) => addAuditEntry("Deleted", d.id, d.name, `Bulk delete: ${d.docId}`, acc), auditLog);
    saveToStorage(remaining, archivedDocs, del, departments, changeRequests, newAudit);
  };

  const bulkRestore = () => {
    if (archiveTab === "archived") {
      const toRestore = archivedDocs.filter((d) => selectedIds.has(d.id));
      const remaining = archivedDocs.filter((d) => !selectedIds.has(d.id));
      const updated = [...docs, ...toRestore.map((d) => ({ ...d, status: "Draft" }))];
      setDocs(updated);
      setArchivedDocs(remaining);
      setSelectedIds(new Set());
      saveToStorage(updated, remaining, deletedDocs, departments);
    } else if (archiveTab === "deleted") {
      const toRestore = deletedDocs.filter((d) => selectedIds.has(d.id));
      const remaining = deletedDocs.filter((d) => !selectedIds.has(d.id));
      const updated = [...docs, ...toRestore.map((d) => ({ ...d, status: "Draft", deletedAt: null }))];
      setDocs(updated);
      setDeletedDocs(remaining);
      setSelectedIds(new Set());
      saveToStorage(updated, archivedDocs, remaining, departments);
    }
  };

  const createCR = () => {
    if (!crDocId || !crReason.trim()) return;
    const doc = docs.find((d) => d.id === crDocId);
    if (!doc) return;
    const cr: ChangeRequest = {
      id: `CR-${String(changeRequests.length + 1).padStart(3, "0")}`,
      documentId: crDocId,
      documentName: doc.name,
      changeType: crChangeType,
      reason: crReason,
      affectedSections: crAffectedSections,
      requestor: "Current User",
      approver: crApprover || "Unassigned",
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      comments: [],
    };
    const updatedCRs = [...changeRequests, cr];
    setChangeRequests(updatedCRs);
    const newAudit = addAuditEntry("Change Request Created", doc.id, doc.name, `${cr.id}: ${cr.changeType} - ${cr.reason.slice(0, 50)}`);
    saveToStorage(docs, archivedDocs, deletedDocs, departments, updatedCRs, newAudit);
    setCrDocId(""); setCrReason(""); setCrAffectedSections(""); setCrApprover("");
    setShowNewCR(false);
  };

  const advanceCRStatus = (crId: string, newStatus: ChangeRequest["status"]) => {
    const updatedCRs = changeRequests.map((cr) =>
      cr.id === crId ? { ...cr, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] } : cr
    );
    setChangeRequests(updatedCRs);
    const cr = changeRequests.find((c) => c.id === crId);
    const newAudit = addAuditEntry("Status Changed", cr?.documentId || "", cr?.documentName || "", `CR ${crId} status changed to ${newStatus}`);
    saveToStorage(docs, archivedDocs, deletedDocs, departments, updatedCRs, newAudit);
    if (selectedCR && selectedCR.id === crId) {
      setSelectedCR({ ...selectedCR, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] });
    }
  };

  const saveHeaderFooter = () => {
    if (!selectedDoc) return;
    const updated = docs.map((d) =>
      d.id === selectedDoc.id
        ? { ...d, headerConfig: { left: editHeaderLeft, center: editHeaderCenter, right: editHeaderRight }, footerConfig: { left: editFooterLeft, center: editFooterCenter, right: editFooterRight } }
        : d
    );
    setDocs(updated);
    const updatedDoc = { ...selectedDoc, headerConfig: { left: editHeaderLeft, center: editHeaderCenter, right: editHeaderRight }, footerConfig: { left: editFooterLeft, center: editFooterCenter, right: editFooterRight } };
    setSelectedDoc(updatedDoc);
    saveToStorage(updated, archivedDocs, deletedDocs, departments);
  };

  const getRetentionDocs = () => {
    const allActive = docs;
    if (retentionFilter === "all") return allActive;
    const now = new Date();
    return allActive.filter((d) => {
      if (!d.expiryDate) return retentionFilter === "active";
      const exp = new Date(d.expiryDate);
      const daysLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (retentionFilter === "expired") return daysLeft <= 0;
      if (retentionFilter === "expiring") return daysLeft > 0 && daysLeft <= 90;
      return daysLeft > 90;
    });
  };

  const getDocCountForDept = (deptName: string) => docs.filter((d) => d.department === deptName).length;
  const getDocStatusBreakdown = (deptName: string) => {
    const deptDocs = docs.filter((d) => d.department === deptName);
    const breakdown: Record<string, number> = {};
    deptDocs.forEach((d) => { breakdown[d.status] = (breakdown[d.status] || 0) + 1; });
    return breakdown;
  };

  const filteredAudit = auditLog
    .filter((a) => {
      if (auditFilterAction !== "All" && a.action !== auditFilterAction) return false;
      if (auditFilterDateFrom && a.timestamp < auditFilterDateFrom) return false;
      if (auditFilterDateTo && a.timestamp > auditFilterDateTo + "T23:59:59") return false;
      return true;
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const inputStyle = "rounded border px-2 py-1.5 text-xs bg-transparent";
  const inputStyleObj = { borderColor: "var(--border)", color: "var(--foreground)" };

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
      <div className="flex border-b px-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        {([
          { key: "registry" as const, label: "Document Registry", icon: FileText },
          { key: "changeRequests" as const, label: "Change Requests", icon: GitPullRequest },
          { key: "archive" as const, label: "Archive & Retention", icon: Archive },
          { key: "departments" as const, label: "Departments", icon: Building2 },
          { key: "audit" as const, label: "Audit Trail", icon: History },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 ${activeTab === t.key ? "border-[var(--primary)]" : "border-transparent"}`}
            style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5">
        {/* ============ REGISTRY ============ */}
        {activeTab === "registry" && (
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or Doc ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs bg-transparent"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={inputStyleObj}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={inputStyleObj}>
                <option value="All">All Statuses</option>
                {STATUSES.filter((s) => s !== "Archived" && s !== "Deleted").map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setShowNewDoc(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> New Document
              </button>
              {selectedIds.size > 0 && (
                <div className="flex gap-1">
                  <button onClick={bulkArchive} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <Archive size={10} /> Archive ({selectedIds.size})
                  </button>
                  <button onClick={bulkDelete} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-500">
                    <Trash2 size={10} /> Delete ({selectedIds.size})
                  </button>
                </div>
              )}
            </div>

            {/* New Doc Modal */}
            {showNewDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="rounded-xl border p-6 w-full max-w-lg space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Create New Document</span>
                    <button onClick={() => setShowNewDoc(false)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
                  </div>

                  {/* Doc Type Selection */}
                  <div>
                    <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Document Type</label>
                    <div className="flex gap-2">
                      {DOC_TYPES.map((t) => (
                        <button key={t} onClick={() => setNewDocType(t)}
                          className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 ${newDocType === t ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                          style={{ backgroundColor: newDocType === t ? "var(--muted)" : "transparent" }}>
                          <FileText size={20} style={{ color: newDocType === t ? "var(--primary)" : "var(--muted-foreground)" }} />
                          <span className="text-[10px] font-medium" style={{ color: newDocType === t ? "var(--primary)" : "var(--muted-foreground)" }}>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-generated Doc ID preview */}
                  <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Doc ID: </span>
                    <span className="text-xs font-mono font-medium" style={{ color: "var(--primary)" }}>
                      DOC-{new Date().getFullYear()}-{String(docs.length + archivedDocs.length + deletedDocs.length + 1).padStart(3, "0")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Document Name</label>
                      <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Enter document name"
                        className={inputStyle + " w-full"} style={inputStyleObj} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Department</label>
                      <select value={newDocDept} onChange={(e) => setNewDocDept(e.target.value)}
                        className={inputStyle + " w-full"} style={inputStyleObj}>
                        {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Author</label>
                      <input value="Current User" disabled className={inputStyle + " w-full opacity-60"} style={inputStyleObj} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Classification</label>
                      <select value={newDocClass} onChange={(e) => setNewDocClass(e.target.value)}
                        className={inputStyle + " w-full"} style={inputStyleObj}>
                        {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Retention Period</label>
                      <select value={newDocRetention} onChange={(e) => setNewDocRetention(e.target.value)}
                        className={inputStyle + " w-full"} style={inputStyleObj}>
                        {RETENTION_PERIODS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <button onClick={createDoc} disabled={!newDocName.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)" }}>
                    <Plus size={14} /> Create & Open in Editor
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
                        <input type="checkbox" onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
                          else setSelectedIds(new Set());
                        }} />
                      </th>
                      {[
                        { key: "docId", label: "Doc ID" },
                        { key: "name", label: "Name" },
                        { key: "department", label: "Department" },
                        { key: "author", label: "Author" },
                        { key: "version", label: "Version" },
                        { key: "status", label: "Status" },
                        { key: "createdAt", label: "Created" },
                        { key: "retentionPeriod", label: "Retention" },
                      ].map((col) => (
                        <th key={col.key} onClick={() => handleSort(col.key)} className="px-2 py-2 text-left cursor-pointer hover:opacity-80"
                          style={{ color: "var(--muted-foreground)" }}>
                          <span className="flex items-center gap-1">
                            {col.label}
                            {sortField === col.key && (sortDir === "asc" ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}
                          </span>
                        </th>
                      ))}
                      <th className="px-2 py-2" style={{ color: "var(--muted-foreground)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-t hover:bg-[var(--muted)] cursor-pointer" style={{ borderColor: "var(--border)" }}
                        onClick={() => { setSelectedDoc(doc); setShowHeaderFooter(false); setEditHeaderLeft(doc.headerConfig.left); setEditHeaderCenter(doc.headerConfig.center); setEditHeaderRight(doc.headerConfig.right); setEditFooterLeft(doc.footerConfig.left); setEditFooterCenter(doc.footerConfig.center); setEditFooterRight(doc.footerConfig.right); }}>
                        <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} />
                        </td>
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
                            <button onClick={() => { setSelectedDoc(doc); setShowHeaderFooter(false); setEditHeaderLeft(doc.headerConfig.left); setEditHeaderCenter(doc.headerConfig.center); setEditHeaderRight(doc.headerConfig.right); setEditFooterLeft(doc.footerConfig.left); setEditFooterCenter(doc.footerConfig.center); setEditFooterRight(doc.footerConfig.right); }} className="p-1 rounded hover:bg-[var(--muted)]" title="View">
                              <Eye size={12} style={{ color: "var(--primary)" }} />
                            </button>
                            <button onClick={() => archiveDoc(doc.id)} className="p-1 rounded hover:bg-[var(--muted)]" title="Archive">
                              <Archive size={12} style={{ color: "var(--muted-foreground)" }} />
                            </button>
                            <button onClick={() => deleteDoc(doc.id)} className="p-1 rounded hover:bg-[var(--muted)]" title="Delete">
                              <Trash2 size={12} className="text-red-400" />
                            </button>
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

        {/* ============ CHANGE REQUESTS ============ */}
        {activeTab === "changeRequests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Change Requests</h2>
              <button onClick={() => setShowNewCR(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> New Change Request
              </button>
            </div>

            {/* New CR Modal */}
            {showNewCR && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="rounded-xl border p-6 w-full max-w-lg space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Change Request</span>
                    <button onClick={() => setShowNewCR(false)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Document</label>
                      <select value={crDocId} onChange={(e) => setCrDocId(e.target.value)}
                        className={inputStyle + " w-full"} style={inputStyleObj}>
                        <option value="">Select a document...</option>
                        {docs.map((d) => <option key={d.id} value={d.id}>{d.docId} - {d.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Change Type</label>
                      <div className="flex gap-2">
                        {CHANGE_TYPES.map((t) => (
                          <label key={t} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs ${crChangeType === t ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                            style={{ backgroundColor: crChangeType === t ? "var(--muted)" : "transparent", color: "var(--foreground)" }}>
                            <input type="radio" name="changeType" value={t} checked={crChangeType === t} onChange={() => setCrChangeType(t)} className="hidden" />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Reason for Change</label>
                      <textarea value={crReason} onChange={(e) => setCrReason(e.target.value)} rows={3}
                        className={inputStyle + " w-full resize-none"} style={inputStyleObj} placeholder="Describe the reason for this change..." />
                    </div>

                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Affected Sections</label>
                      <input value={crAffectedSections} onChange={(e) => setCrAffectedSections(e.target.value)}
                        className={inputStyle + " w-full"} style={inputStyleObj} placeholder="e.g., Section 4.2, Appendix A" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Requestor</label>
                        <input value="Current User" disabled className={inputStyle + " w-full opacity-60"} style={inputStyleObj} />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Approver</label>
                        <select value={crApprover} onChange={(e) => setCrApprover(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj}>
                          <option value="">Select approver...</option>
                          {departments.map((d) => <option key={d.id} value={d.head}>{d.head} ({d.name})</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button onClick={createCR} disabled={!crDocId || !crReason.trim()} className="w-full px-4 py-2 rounded-lg text-xs text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)" }}>
                    Create Change Request
                  </button>
                </div>
              </div>
            )}

            {/* CR Detail Modal */}
            {selectedCR && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="rounded-xl border p-6 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{selectedCR.id}: {selectedCR.documentName}</span>
                    <button onClick={() => setSelectedCR(null)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
                  </div>

                  <CRStatusStepper status={selectedCR.status} />

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span style={{ color: "var(--muted-foreground)" }}>Change Type: </span><span style={{ color: "var(--foreground)" }}>{selectedCR.changeType}</span></div>
                    <div><span style={{ color: "var(--muted-foreground)" }}>Requestor: </span><span style={{ color: "var(--foreground)" }}>{selectedCR.requestor}</span></div>
                    <div><span style={{ color: "var(--muted-foreground)" }}>Approver: </span><span style={{ color: "var(--foreground)" }}>{selectedCR.approver}</span></div>
                    <div><span style={{ color: "var(--muted-foreground)" }}>Created: </span><span style={{ color: "var(--foreground)" }}>{selectedCR.createdAt}</span></div>
                    <div className="col-span-2"><span style={{ color: "var(--muted-foreground)" }}>Affected Sections: </span><span style={{ color: "var(--foreground)" }}>{selectedCR.affectedSections}</span></div>
                    <div className="col-span-2"><span style={{ color: "var(--muted-foreground)" }}>Reason: </span><span style={{ color: "var(--foreground)" }}>{selectedCR.reason}</span></div>
                  </div>

                  {/* Comments */}
                  {selectedCR.comments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>Comments</span>
                      {selectedCR.comments.map((c, i) => (
                        <div key={i} className="rounded-lg p-2 text-xs" style={{ backgroundColor: "var(--muted)" }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium" style={{ color: "var(--foreground)" }}>{c.author}</span>
                            <span style={{ color: "var(--muted-foreground)" }}>{c.date}</span>
                          </div>
                          <span style={{ color: "var(--foreground)" }}>{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {selectedCR.status === "Draft" && (
                      <button onClick={() => advanceCRStatus(selectedCR.id, "Submitted")} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#3b82f6" }}>
                        Submit
                      </button>
                    )}
                    {selectedCR.status === "Submitted" && (
                      <button onClick={() => advanceCRStatus(selectedCR.id, "Review")} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#f59e0b" }}>
                        Start Review
                      </button>
                    )}
                    {selectedCR.status === "Review" && (
                      <>
                        <button onClick={() => advanceCRStatus(selectedCR.id, "Approved")} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#10b981" }}>
                          Approve
                        </button>
                        <button onClick={() => advanceCRStatus(selectedCR.id, "Rejected")} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#ef4444" }}>
                          Reject
                        </button>
                      </>
                    )}
                    {selectedCR.status === "Approved" && (
                      <button onClick={() => advanceCRStatus(selectedCR.id, "Implemented")} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#10b981" }}>
                        Mark Implemented
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CR Table */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "var(--muted)" }}>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>CR ID</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Document</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Type</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Requestor</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Status</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.map((cr) => (
                    <tr key={cr.id} className="border-t hover:bg-[var(--muted)] cursor-pointer" style={{ borderColor: "var(--border)" }}
                      onClick={() => setSelectedCR(cr)}>
                      <td className="px-3 py-2 font-mono" style={{ color: "var(--primary)" }}>{cr.id}</td>
                      <td className="px-3 py-2" style={{ color: "var(--foreground)" }}>{cr.documentName}</td>
                      <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{cr.changeType}</td>
                      <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{cr.requestor}</td>
                      <td className="px-3 py-2"><StatusBadge status={cr.status} /></td>
                      <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{cr.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ ARCHIVE & RETENTION ============ */}
        {activeTab === "archive" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              {(["active", "archived", "deleted"] as const).map((t) => (
                <button key={t} onClick={() => { setArchiveTab(t); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${archiveTab === t ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                  style={{ color: archiveTab === t ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {t === "active" ? `Active (${docs.length})` : t === "archived" ? `Archived (${archivedDocs.length})` : `Deleted (${deletedDocs.length})`}
                </button>
              ))}
              {archiveTab === "active" && (
                <>
                  <div className="h-4 w-px mx-1" style={{ backgroundColor: "var(--border)" }} />
                  {(["all", "active", "expiring", "expired"] as const).map((f) => (
                    <button key={f} onClick={() => setRetentionFilter(f)}
                      className={`px-2 py-1 rounded text-[10px] border ${retentionFilter === f ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                      style={{ color: retentionFilter === f ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {f === "all" ? "All" : f === "active" ? "Active" : f === "expiring" ? "Expiring Soon" : "Expired"}
                    </button>
                  ))}
                </>
              )}
              {selectedIds.size > 0 && (archiveTab === "archived" || archiveTab === "deleted") && (
                <button onClick={bulkRestore} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <RotateCcw size={10} /> Restore ({selectedIds.size})
                </button>
              )}
            </div>

            {/* Retention Summary */}
            {archiveTab === "active" && (
              <div className="grid grid-cols-4 gap-3">
                {RETENTION_PERIODS.map((rp) => {
                  const count = docs.filter((d) => d.retentionPeriod === rp).length;
                  return (
                    <div key={rp} className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                      <div className="text-lg font-bold" style={{ color: "var(--primary)" }}>{count}</div>
                      <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{rp}</div>
                      <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                        <div className="h-full rounded-full" style={{ width: `${docs.length ? (count / docs.length) * 100 : 0}%`, backgroundColor: "var(--primary)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {archiveTab === "active" && getRetentionDocs().map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} onClick={(e) => e.stopPropagation()} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                      <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        <span>{doc.docId}</span> <StatusBadge status={doc.status} /> <RetentionIndicator expiryDate={doc.expiryDate} />
                        <span>Retention: {doc.retentionPeriod}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => archiveDoc(doc.id)} className="p-1 rounded hover:bg-[var(--muted)]" title="Archive">
                    <Archive size={14} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              ))}

              {archiveTab === "archived" && archivedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "#8b5cf6", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                      <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        <span>{doc.docId}</span> <StatusBadge status="Archived" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => restoreArchived(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <RotateCcw size={10} /> Restore
                  </button>
                </div>
              ))}

              {archiveTab === "deleted" && deletedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "#ef4444", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                      <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        <span>{doc.docId}</span> <StatusBadge status="Deleted" /> <span>Deleted: {doc.deletedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => restoreDeleted(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <RotateCcw size={10} /> Restore
                    </button>
                    <button onClick={() => setConfirmPermanentDelete(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-500">
                      <Trash2 size={10} /> Permanent Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Permanent Delete Confirmation */}
            {confirmPermanentDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="rounded-xl border p-6 w-full max-w-sm space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-500" />
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Confirm Permanent Deletion</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Are you sure? This cannot be undone. The document will be permanently removed from the system.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setConfirmPermanentDelete(null)} className="px-3 py-1.5 rounded-lg text-xs border"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      Cancel
                    </button>
                    <button onClick={() => permanentDelete(confirmPermanentDelete)} className="px-3 py-1.5 rounded-lg text-xs text-white bg-red-500">
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ DEPARTMENTS ============ */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Departments ({departments.length})</h2>
              <button onClick={() => setShowNewDept(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> Add Department
              </button>
            </div>

            {/* New Dept Modal */}
            {showNewDept && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="rounded-xl border p-6 w-full max-w-md space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Add New Department</span>
                    <button onClick={() => setShowNewDept(false)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Department Name</label>
                      <input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Department name" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Code</label>
                      <input value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} className={inputStyle + " w-full"} style={inputStyleObj} placeholder="e.g., ENG" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Head</label>
                      <input value={newDeptHead} onChange={(e) => setNewDeptHead(e.target.value)} className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Department head" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Description</label>
                      <textarea value={newDeptDesc} onChange={(e) => setNewDeptDesc(e.target.value)} rows={2} className={inputStyle + " w-full resize-none"} style={inputStyleObj} placeholder="Description" />
                    </div>
                  </div>
                  <button onClick={createDept} disabled={!newDeptName.trim() || !newDeptCode.trim()} className="w-full px-4 py-2 rounded-lg text-xs text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)" }}>
                    Create Department
                  </button>
                </div>
              </div>
            )}

            {/* Edit Dept Modal */}
            {editingDept && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="rounded-xl border p-6 w-full max-w-md space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Edit Department</span>
                    <button onClick={() => setEditingDept(null)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Department Name</label>
                      <input value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} className={inputStyle + " w-full"} style={inputStyleObj} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Code</label>
                      <input value={editDeptCode} onChange={(e) => setEditDeptCode(e.target.value)} className={inputStyle + " w-full"} style={inputStyleObj} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Head</label>
                      <input value={editDeptHead} onChange={(e) => setEditDeptHead(e.target.value)} className={inputStyle + " w-full"} style={inputStyleObj} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Description</label>
                      <textarea value={editDeptDesc} onChange={(e) => setEditDeptDesc(e.target.value)} rows={2} className={inputStyle + " w-full resize-none"} style={inputStyleObj} />
                    </div>
                  </div>
                  <button onClick={updateDept} className="w-full px-4 py-2 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Department Cards */}
            <div className="grid grid-cols-2 gap-4">
              {departments.map((dept) => {
                const docCount = getDocCountForDept(dept.name);
                const breakdown = getDocStatusBreakdown(dept.name);
                return (
                  <div key={dept.id} className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} style={{ color: "var(--primary)" }} />
                          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{dept.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{dept.code}</span>
                        </div>
                        <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                          <User size={10} /> {dept.head}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingDept(dept); setEditDeptName(dept.name); setEditDeptCode(dept.code); setEditDeptHead(dept.head); setEditDeptDesc(dept.description); }}
                          className="p-1 rounded hover:bg-[var(--muted)]">
                          <Edit3 size={12} style={{ color: "var(--muted-foreground)" }} />
                        </button>
                        <button onClick={() => deleteDept(dept.id)} className="p-1 rounded hover:bg-[var(--muted)]">
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{dept.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Documents: <strong style={{ color: "var(--foreground)" }}>{docCount}</strong></span>
                      <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>{dept.code}-DOC-001</span>
                    </div>

                    {/* Status breakdown */}
                    {Object.keys(breakdown).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(breakdown).map(([status, count]) => (
                          <span key={status} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: "var(--muted)" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] || "#6b7280" }} />
                            <span style={{ color: "var(--muted-foreground)" }}>{status}: {count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ AUDIT TRAIL ============ */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Audit Trail ({filteredAudit.length} entries)</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select value={auditFilterAction} onChange={(e) => setAuditFilterAction(e.target.value)}
                className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={inputStyleObj}>
                <option value="All">All Actions</option>
                {["Created", "Updated", "Archived", "Restored", "Deleted", "Permanently Deleted", "Change Request Created", "Status Changed"].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>From:</span>
                <input type="date" value={auditFilterDateFrom} onChange={(e) => setAuditFilterDateFrom(e.target.value)}
                  className={inputStyle} style={inputStyleObj} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>To:</span>
                <input type="date" value={auditFilterDateTo} onChange={(e) => setAuditFilterDateTo(e.target.value)}
                  className={inputStyle} style={inputStyleObj} />
              </div>
              {(auditFilterAction !== "All" || auditFilterDateFrom || auditFilterDateTo) && (
                <button onClick={() => { setAuditFilterAction("All"); setAuditFilterDateFrom(""); setAuditFilterDateTo(""); }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <X size={10} /> Clear Filters
                </button>
              )}
            </div>

            {/* Audit Table */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "var(--muted)" }}>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Timestamp</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Action</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Document</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Performed By</th>
                    <th className="px-3 py-2 text-left" style={{ color: "var(--muted-foreground)" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map((entry) => (
                    <tr key={entry.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                          style={{ backgroundColor: STATUS_COLORS[entry.action] || "#6b7280" }}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ color: "var(--foreground)" }}>{entry.documentName}</td>
                      <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{entry.performedBy}</td>
                      <td className="px-3 py-2 max-w-xs truncate" style={{ color: "var(--muted-foreground)" }}>{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============ DOCUMENT DETAIL MODAL ============ */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl border w-full max-w-3xl max-h-[85vh] overflow-auto p-6 space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{selectedDoc.name}</h2>
                <span className="text-[10px] font-mono" style={{ color: "var(--primary)" }}>{selectedDoc.docId}</span>
              </div>
              <button onClick={() => setSelectedDoc(null)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>

            {/* Doc Info Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Department</span>
                <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--foreground)" }}><Building2 size={12} /> {selectedDoc.department}</div>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Author</span>
                <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--foreground)" }}><User size={12} /> {selectedDoc.author}</div>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedDoc.status} /></div>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Version</span>
                <div style={{ color: "var(--foreground)" }}>v{selectedDoc.version}</div>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Classification</span>
                <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--foreground)" }}><Shield size={12} /> {selectedDoc.classification}</div>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Retention</span>
                <div className="flex items-center gap-1 mt-0.5"><Clock size={12} style={{ color: "var(--muted-foreground)" }} /> <RetentionIndicator expiryDate={selectedDoc.expiryDate} /></div>
              </div>
            </div>

            {/* Route Path Visualization */}
            <div>
              <h3 className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Document Lifecycle</h3>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                <RoutePathViz doc={selectedDoc} />
                <div className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Route: <span className="font-mono" style={{ color: "var(--primary)" }}>{selectedDoc.routePath}</span>
                </div>
              </div>
            </div>

            {/* Header & Footer Config */}
            <div>
              <button onClick={() => setShowHeaderFooter(!showHeaderFooter)}
                className="flex items-center gap-1 text-xs font-medium w-full" style={{ color: "var(--foreground)" }}>
                {showHeaderFooter ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Header & Footer Configuration
              </button>
              {showHeaderFooter && (
                <div className="mt-2 rounded-lg border p-4 space-y-4" style={{ borderColor: "var(--border)" }}>
                  {/* Header Config */}
                  <div>
                    <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>Header</span>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <label className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Left (Logo/Dept)</label>
                        <input value={editHeaderLeft} onChange={(e) => setEditHeaderLeft(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Logo / Department" />
                      </div>
                      <div>
                        <label className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Center (Title)</label>
                        <input value={editHeaderCenter} onChange={(e) => setEditHeaderCenter(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Document Title" />
                      </div>
                      <div>
                        <label className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Right (Doc ID)</label>
                        <input value={editHeaderRight} onChange={(e) => setEditHeaderRight(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Doc ID" />
                      </div>
                    </div>
                  </div>

                  {/* Footer Config */}
                  <div>
                    <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>Footer</span>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <label className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Left (Revision)</label>
                        <input value={editFooterLeft} onChange={(e) => setEditFooterLeft(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Revision" />
                      </div>
                      <div>
                        <label className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Center (Confidentiality)</label>
                        <input value={editFooterCenter} onChange={(e) => setEditFooterCenter(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Confidentiality" />
                      </div>
                      <div>
                        <label className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Right (Page Number)</label>
                        <input value={editFooterRight} onChange={(e) => setEditFooterRight(e.target.value)}
                          className={inputStyle + " w-full"} style={inputStyleObj} placeholder="Page {page}" />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <span className="text-[9px] font-medium" style={{ color: "var(--muted-foreground)" }}>Preview</span>
                    <div className="rounded border mt-1" style={{ borderColor: "var(--border)" }}>
                      {/* Header preview */}
                      <div className="flex items-center justify-between px-3 py-1.5 border-b text-[9px]" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                        <span style={{ color: "var(--foreground)" }}>{editHeaderLeft || "Left"}</span>
                        <span className="font-medium" style={{ color: "var(--foreground)" }}>{editHeaderCenter || "Center"}</span>
                        <span style={{ color: "var(--foreground)" }}>{editHeaderRight || "Right"}</span>
                      </div>
                      {/* Body placeholder */}
                      <div className="px-3 py-6 text-center text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                        Document Content Area
                      </div>
                      {/* Footer preview */}
                      <div className="flex items-center justify-between px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                        <span style={{ color: "var(--foreground)" }}>{editFooterLeft || "Left"}</span>
                        <span style={{ color: "var(--foreground)" }}>{editFooterCenter || "Center"}</span>
                        <span style={{ color: "var(--foreground)" }}>{editFooterRight || "Right"}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={saveHeaderFooter} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
                    Save Header & Footer
                  </button>
                </div>
              )}
            </div>

            {/* Version History */}
            {selectedDoc.versions.length > 0 && (
              <div>
                <h3 className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Version History</h3>
                <div className="space-y-1">
                  {selectedDoc.versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg p-2 text-xs" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="flex items-center gap-2">
                        <History size={12} style={{ color: "var(--muted-foreground)" }} />
                        <span className="font-mono font-medium" style={{ color: "var(--foreground)" }}>v{v.version}</span>
                        <span style={{ color: "var(--muted-foreground)" }}>{v.changeNotes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        <span>{v.createdBy}</span>
                        <span>{v.createdAt.split("T")[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedDoc.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag size={12} style={{ color: "var(--muted-foreground)" }} />
                {selectedDoc.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => archiveDoc(selectedDoc.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <Archive size={12} /> Archive
              </button>
              <button onClick={() => deleteDoc(selectedDoc.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-red-500 text-red-500">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
