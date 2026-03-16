"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Filter, ChevronDown, ChevronRight, X, Edit3, Trash2, Archive,
  RotateCcw, Shield, Clock, User, Calendar, Building2, FileText, Tag,
  CheckCircle2, AlertCircle, XCircle, Eye, History, Download, GitPullRequest,
} from "lucide-react";
import ChangeRequestForm from "./components/ChangeRequestForm";
import NewDocumentDialog from "./components/NewDocumentDialog";
import DocumentRoutePath from "./components/DocumentRoutePath";

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

const DEPARTMENTS = ["Engineering", "QA", "HR", "Finance", "Operations", "Legal", "IT", "Management"];
const STATUSES = ["Draft", "Under Review", "Approved", "Published", "Archived", "Deleted"];
const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"];
const RETENTION_PERIODS = ["1yr", "2yr", "5yr", "7yr", "10yr", "Permanent"];

const STATUS_COLORS: Record<string, string> = {
  Draft: "#6b7280",
  "Under Review": "#f59e0b",
  Approved: "#10b981",
  Published: "#3b82f6",
  Archived: "#8b5cf6",
  Deleted: "#ef4444",
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const MOCK_DOCS: DocRecord[] = [
  { id: "1", docId: "DOC-2024-001", name: "Quality Management SOP", department: "QA", author: "John Smith", routePath: "/qa/sops/SOP-001", version: "2.1", status: "Published", classification: "Internal", createdAt: "2024-01-15", updatedAt: "2024-06-20", retentionPeriod: "7yr", expiryDate: "2031-01-15", tags: ["sop", "quality"], headerConfig: { left: "", center: "QMS SOP", right: "" }, footerConfig: { left: "QA Dept", center: "Confidential", right: "Page {page}" }, deletedAt: null, versions: [{ id: "v1", version: "2.1", changeNotes: "Updated section 4", createdBy: "John Smith", createdAt: "2024-06-20" }, { id: "v2", version: "2.0", changeNotes: "Major revision", createdBy: "John Smith", createdAt: "2024-03-01" }, { id: "v3", version: "1.0", changeNotes: "Initial release", createdBy: "Jane Doe", createdAt: "2024-01-15" }] },
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

export default function DocControlPage() {
  const [activeTab, setActiveTab] = useState<"registry" | "archive" | "departments">("registry");
  const [docs, setDocs] = useState<DocRecord[]>(MOCK_DOCS);
  const [archivedDocs, setArchivedDocs] = useState<DocRecord[]>(MOCK_ARCHIVED);
  const [deletedDocs, setDeletedDocs] = useState<DocRecord[]>(MOCK_DELETED);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<string>("docId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [archiveTab, setArchiveTab] = useState<"active" | "archived" | "deleted">("active");
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [showNewDept, setShowNewDept] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);

  // New doc form
  const [newDocName, setNewDocName] = useState("");
  const [newDocDept, setNewDocDept] = useState("Engineering");
  const [newDocClass, setNewDocClass] = useState("Internal");
  const [newDocRetention, setNewDocRetention] = useState("5yr");

  // New dept form
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptHead, setNewDeptHead] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

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
      } catch { /* use defaults */ }
    }
  }, []);

  const saveToStorage = useCallback((d: DocRecord[], a: DocRecord[], del: DocRecord[], depts: Department[]) => {
    localStorage.setItem("vidyalaya-doc-control", JSON.stringify({ docs: d, archived: a, deleted: del, departments: depts }));
  }, []);

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
    saveToStorage(updated, archivedDocs, deletedDocs, departments);
    setNewDocName("");
    setShowNewDoc(false);
  };

  const deleteDoc = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const updated = docs.filter((d) => d.id !== id);
    const del = [...deletedDocs, { ...doc, status: "Deleted", deletedAt: new Date().toISOString().split("T")[0] }];
    setDocs(updated);
    setDeletedDocs(del);
    saveToStorage(updated, archivedDocs, del, departments);
    setSelectedDoc(null);
  };

  const archiveDoc = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const updated = docs.filter((d) => d.id !== id);
    const arch = [...archivedDocs, { ...doc, status: "Archived" }];
    setDocs(updated);
    setArchivedDocs(arch);
    saveToStorage(updated, arch, deletedDocs, departments);
    setSelectedDoc(null);
  };

  const restoreDeleted = (id: string) => {
    const doc = deletedDocs.find((d) => d.id === id);
    if (!doc) return;
    const del = deletedDocs.filter((d) => d.id !== id);
    const updated = [...docs, { ...doc, status: "Draft", deletedAt: null }];
    setDocs(updated);
    setDeletedDocs(del);
    saveToStorage(updated, archivedDocs, del, departments);
  };

  const restoreArchived = (id: string) => {
    const doc = archivedDocs.find((d) => d.id === id);
    if (!doc) return;
    const arch = archivedDocs.filter((d) => d.id !== id);
    const updated = [...docs, { ...doc, status: "Draft" }];
    setDocs(updated);
    setArchivedDocs(arch);
    saveToStorage(updated, arch, deletedDocs, departments);
  };

  const permanentDelete = (id: string) => {
    const del = deletedDocs.filter((d) => d.id !== id);
    setDeletedDocs(del);
    saveToStorage(docs, archivedDocs, del, departments);
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
    saveToStorage(remaining, arch, deletedDocs, departments);
  };

  const bulkDelete = () => {
    const toDelete = docs.filter((d) => selectedIds.has(d.id));
    const remaining = docs.filter((d) => !selectedIds.has(d.id));
    const del = [...deletedDocs, ...toDelete.map((d) => ({ ...d, status: "Deleted", deletedAt: new Date().toISOString().split("T")[0] }))];
    setDocs(remaining);
    setDeletedDocs(del);
    setSelectedIds(new Set());
    saveToStorage(remaining, archivedDocs, del, departments);
  };

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
          { key: "registry" as const, label: "Document Registry" },
          { key: "archive" as const, label: "Archive & Deleted" },
          { key: "departments" as const, label: "Departments" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 ${activeTab === t.key ? "border-[var(--primary)]" : "border-transparent"}`}
            style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
          >
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
                className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="All">All Statuses</option>
                {STATUSES.filter((s) => s !== "Archived" && s !== "Deleted").map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setShowNewDocDialog(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> New Document
              </button>
              <button onClick={() => setShowChangeRequest(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <GitPullRequest size={12} /> Change Request
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

            {/* New Doc Form */}
            {showNewDoc && (
              <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Create New Document</span>
                  <button onClick={() => setShowNewDoc(false)}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Document Name"
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <select value={newDocDept} onChange={(e) => setNewDocDept(e.target.value)}
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={newDocClass} onChange={(e) => setNewDocClass(e.target.value)}
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newDocRetention} onChange={(e) => setNewDocRetention(e.target.value)}
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {RETENTION_PERIODS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button onClick={createDoc} className="px-3 py-1.5 rounded text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
                  Create Document
                </button>
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
                        onClick={() => setSelectedDoc(doc)}>
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
                            <button onClick={() => setSelectedDoc(doc)} className="p-1 rounded hover:bg-[var(--muted)]" title="View">
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

        {/* ============ ARCHIVE & DELETED ============ */}
        {activeTab === "archive" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["active", "archived", "deleted"] as const).map((t) => (
                <button key={t} onClick={() => setArchiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${archiveTab === t ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                  style={{ color: archiveTab === t ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {t === "active" ? `Active (${docs.length})` : t === "archived" ? `Archived (${archivedDocs.length})` : `Deleted (${deletedDocs.length})`}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {archiveTab === "active" && filteredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                    <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      <span>{doc.docId}</span> <StatusBadge status={doc.status} /> <RetentionIndicator expiryDate={doc.expiryDate} />
                    </div>
                  </div>
                </div>
              ))}

              {archiveTab === "archived" && archivedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "#8b5cf6", backgroundColor: "var(--card)" }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                    <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      <span>{doc.docId}</span> <span>{doc.department}</span> <RetentionIndicator expiryDate={doc.expiryDate} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => restoreArchived(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
                      style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                      <RotateCcw size={10} /> Restore
                    </button>
                    <button onClick={() => { const arch = archivedDocs.filter((d) => d.id !== doc.id); setArchivedDocs(arch); saveToStorage(docs, arch, deletedDocs, departments); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-400">
                      <Trash2 size={10} /> Permanent Delete
                    </button>
                  </div>
                </div>
              ))}

              {archiveTab === "deleted" && deletedDocs.map((doc) => {
                const deletedDate = doc.deletedAt ? new Date(doc.deletedAt) : new Date();
                const purgeDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                const daysUntilPurge = Math.max(0, Math.floor((purgeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                return (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "#ef4444", backgroundColor: "var(--card)" }}>
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</div>
                      <div className="text-[10px] flex items-center gap-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        <span>{doc.docId}</span>
                        <span className="text-red-400">Auto-purge in {daysUntilPurge} days</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => restoreDeleted(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
                        style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                        <RotateCcw size={10} /> Restore
                      </button>
                      <button onClick={() => permanentDelete(doc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-red-500 text-red-400">
                        <Trash2 size={10} /> Permanent Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {archiveTab === "active" && filteredDocs.length === 0 && (
                <div className="text-center py-10 text-xs" style={{ color: "var(--muted-foreground)" }}>No active documents</div>
              )}
              {archiveTab === "archived" && archivedDocs.length === 0 && (
                <div className="text-center py-10 text-xs" style={{ color: "var(--muted-foreground)" }}>No archived documents</div>
              )}
              {archiveTab === "deleted" && deletedDocs.length === 0 && (
                <div className="text-center py-10 text-xs" style={{ color: "var(--muted-foreground)" }}>Recycle bin is empty</div>
              )}
            </div>
          </div>
        )}

        {/* ============ DEPARTMENTS ============ */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Departments</h2>
              <button onClick={() => setShowNewDept(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white"
                style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} /> Add Department
              </button>
            </div>

            {showNewDept && (
              <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>New Department</span>
                  <button onClick={() => setShowNewDept(false)}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Name"
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} placeholder="Code (e.g. ENG)"
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={newDeptHead} onChange={(e) => setNewDeptHead(e.target.value)} placeholder="Head"
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <input value={newDeptDesc} onChange={(e) => setNewDeptDesc(e.target.value)} placeholder="Description"
                    className="rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
                <button onClick={createDept} className="px-3 py-1.5 rounded text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>Create</button>
              </div>
            )}

            {/* Dept Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {departments.map((dept) => {
                const deptDocs = docs.filter((d) => d.department === dept.name);
                return (
                  <div key={dept.id} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} style={{ color: "var(--primary)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{dept.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                        {dept.code}
                      </span>
                    </div>
                    <div className="text-[10px] space-y-1" style={{ color: "var(--muted-foreground)" }}>
                      <div className="flex items-center gap-1"><User size={10} /> Head: {dept.head || "—"}</div>
                      <div>{dept.description || "—"}</div>
                      <div className="flex items-center gap-1"><FileText size={10} /> {deptDocs.length} documents</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simple Org Chart */}
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--foreground)" }}>Organization Chart</h3>
              <div className="flex flex-col items-center">
                <div className="rounded-lg border px-4 py-2 text-xs font-medium" style={{ borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "var(--muted)" }}>
                  Management
                </div>
                <div className="w-px h-4" style={{ backgroundColor: "var(--border)" }} />
                <div className="flex flex-wrap justify-center gap-3">
                  {departments.filter((d) => d.name !== "Management").map((dept) => (
                    <div key={dept.id} className="rounded border px-3 py-1.5 text-[10px]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      {dept.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ DOCUMENT DETAIL MODAL ============ */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedDoc(null)}>
          <div
            className="w-[700px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Detail Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>{selectedDoc.docId}</span>
                  <StatusBadge status={selectedDoc.status} />
                </div>
                <h2 className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{selectedDoc.name}</h2>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded hover:bg-[var(--muted)]">
                <X size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-5">
              {/* Meta info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Department</label>
                  <div className="text-xs mt-0.5" style={{ color: "var(--foreground)" }}>{selectedDoc.department}</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Route Path</label>
                  <div className="text-xs mt-0.5 font-mono" style={{ color: "var(--foreground)" }}>{selectedDoc.routePath}</div>
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] uppercase mb-1 block" style={{ color: "var(--muted-foreground)" }}>Document Workflow</label>
                  <DocumentRoutePath currentStage={selectedDoc.status} />
                </div>
                <div>
                  <label className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>Classification</label>
                  <div className="text-xs mt-0.5" style={{ color: "var(--foreground)" }}>{selectedDoc.classification}</div>
                </div>
              </div>

              {/* Version History */}
              <div>
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--foreground)" }}>
                  <History size={12} /> Version History
                </h3>
                <div className="space-y-2">
                  {selectedDoc.versions.length > 0 ? selectedDoc.versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded border p-2" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>v{v.version}</span>
                        <span className="text-[10px] ml-2" style={{ color: "var(--muted-foreground)" }}>{v.changeNotes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        <span>{v.createdBy}</span>
                        <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                        <button className="px-1.5 py-0.5 rounded border text-[10px] hover:bg-[var(--muted)]"
                          style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                          <RotateCcw size={8} /> Restore
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-[10px] py-2" style={{ color: "var(--muted-foreground)" }}>No version history available</div>
                  )}
                </div>
              </div>

              {/* Header/Footer Config */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Header & Footer</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border p-2" style={{ borderColor: "var(--border)" }}>
                    <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Header</div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
                      <span>L: {selectedDoc.headerConfig.left || "—"}</span>
                      <span>C: {selectedDoc.headerConfig.center || "—"}</span>
                      <span>R: {selectedDoc.headerConfig.right || "—"}</span>
                    </div>
                  </div>
                  <div className="rounded border p-2" style={{ borderColor: "var(--border)" }}>
                    <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Footer</div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]" style={{ color: "var(--foreground)" }}>
                      <span>L: {selectedDoc.footerConfig.left || "—"}</span>
                      <span>C: {selectedDoc.footerConfig.center || "—"}</span>
                      <span>R: {selectedDoc.footerConfig.right || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Chain */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Approval Chain</h3>
                <div className="flex items-center gap-2">
                  {["Prepared By", "Reviewed By", "Approved By"].map((stage, i) => (
                    <React.Fragment key={stage}>
                      <div className="rounded border p-2 text-center flex-1" style={{ borderColor: i <= 1 ? "#10b981" : "var(--border)" }}>
                        <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{stage}</div>
                        <div className="text-xs font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                          {i === 0 ? selectedDoc.author : i === 1 ? "—" : "—"}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {i === 0 ? <CheckCircle2 size={10} className="inline text-green-400" /> : <AlertCircle size={10} className="inline" style={{ color: "var(--muted-foreground)" }} />}
                        </div>
                      </div>
                      {i < 2 && <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Retention */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Retention Settings</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Period</label>
                    <div className="text-xs" style={{ color: "var(--foreground)" }}>{selectedDoc.retentionPeriod}</div>
                  </div>
                  <div>
                    <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Expiry</label>
                    <div className="text-xs" style={{ color: "var(--foreground)" }}>{selectedDoc.expiryDate || "N/A"}</div>
                  </div>
                  <div>
                    <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Status</label>
                    <RetentionIndicator expiryDate={selectedDoc.expiryDate} />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedDoc.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                      {tag}
                    </span>
                  ))}
                  {selectedDoc.tags.length === 0 && <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>No tags</span>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => archiveDoc(selectedDoc.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <Archive size={12} /> Archive
              </button>
              <button onClick={() => deleteDoc(selectedDoc.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs border-red-500 text-red-400">
                <Trash2 size={12} /> Delete
              </button>
              <button onClick={() => setSelectedDoc(null)} className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
                Close
              </button>
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
