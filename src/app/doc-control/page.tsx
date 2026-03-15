'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
  Trash2,
  Archive,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Tag,
  Building2,
  Users,
  FolderTree,
  ChevronRight,
  Save,
  History,
  Shield,
  Lock,
  Globe,
  BookOpen,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type DocStatus = 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Archived' | 'Deleted';
type Classification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';
type RetentionPeriod = '1yr' | '2yr' | '5yr' | '7yr' | '10yr' | 'Permanent';
type TopTab = 'registry' | 'archive' | 'departments';
type ArchiveSubTab = 'active' | 'archived' | 'deleted';
type SortDir = 'asc' | 'desc';
type SortKey = 'docId' | 'name' | 'department' | 'author' | 'version' | 'status' | 'createdDate' | 'modifiedDate';

const DEPARTMENTS = ['Engineering', 'QA', 'HR', 'Finance', 'Operations', 'Legal', 'IT', 'Management'] as const;
type Department = (typeof DEPARTMENTS)[number];

const ALL_STATUSES: DocStatus[] = ['Draft', 'Under Review', 'Approved', 'Published', 'Archived', 'Deleted'];
const ALL_RETENTION: RetentionPeriod[] = ['1yr', '2yr', '5yr', '7yr', '10yr', 'Permanent'];
const ALL_CLASSIFICATION: Classification[] = ['Public', 'Internal', 'Confidential', 'Restricted'];

interface VersionEntry {
  version: string;
  author: string;
  date: string;
  notes: string;
}

interface ApprovalStep {
  role: 'Prepared By' | 'Reviewed By' | 'Approved By';
  name: string;
  date: string | null;
  status: 'Pending' | 'Completed' | 'Rejected';
}

interface HeaderFooterConfig {
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

interface DocRecord {
  id: string;
  docId: string;
  name: string;
  department: Department;
  author: string;
  routePath: string;
  version: string;
  status: DocStatus;
  classification: Classification;
  createdDate: string;
  modifiedDate: string;
  retention: RetentionPeriod;
  expiryDate: string;
  tags: string[];
  versionHistory: VersionEntry[];
  approvalChain: ApprovalStep[];
  headerFooter: HeaderFooterConfig;
  deletedAt: string | null;
}

interface DeptRecord {
  id: string;
  name: string;
  code: string;
  head: string;
  description: string;
  parentId: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function addYears(date: string, years: number): string {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function retentionToYears(r: RetentionPeriod): number {
  if (r === 'Permanent') return 999;
  return parseInt(r);
}

function calcExpiry(created: string, retention: RetentionPeriod): string {
  if (retention === 'Permanent') return '9999-12-31';
  return addYears(created, retentionToYears(retention));
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusColor(s: DocStatus): { bg: string; fg: string } {
  switch (s) {
    case 'Draft': return { bg: 'rgba(128,128,128,0.15)', fg: '#888' };
    case 'Under Review': return { bg: 'rgba(234,179,8,0.15)', fg: '#ca8a04' };
    case 'Approved': return { bg: 'rgba(59,130,246,0.15)', fg: '#3b82f6' };
    case 'Published': return { bg: 'rgba(34,197,94,0.15)', fg: '#16a34a' };
    case 'Archived': return { bg: 'rgba(168,85,247,0.15)', fg: '#a855f7' };
    case 'Deleted': return { bg: 'rgba(239,68,68,0.15)', fg: '#dc2626' };
  }
}

function retentionColor(expiryDate: string): string {
  const days = daysUntil(expiryDate);
  if (days < 0) return '#ef4444';
  if (days < 90) return '#f59e0b';
  return '#22c55e';
}

/* ------------------------------------------------------------------ */
/*  Initial Data                                                       */
/* ------------------------------------------------------------------ */

const INITIAL_DOCS: DocRecord[] = [
  {
    id: 'doc-1', docId: 'DOC-2024-001', name: 'Software Architecture Design', department: 'Engineering', author: 'Arjun Mehta',
    routePath: '/engineering/architecture', version: '2.0', status: 'Published', classification: 'Internal',
    createdDate: '2024-01-15', modifiedDate: '2024-06-20', retention: '5yr', expiryDate: '2029-01-15',
    tags: ['architecture', 'design', 'microservices'],
    versionHistory: [
      { version: '1.0', author: 'Arjun Mehta', date: '2024-01-15', notes: 'Initial draft of system architecture' },
      { version: '1.1', author: 'Arjun Mehta', date: '2024-03-10', notes: 'Added microservices section' },
      { version: '2.0', author: 'Priya Patel', date: '2024-06-20', notes: 'Major revision with cloud-native patterns' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Arjun Mehta', date: '2024-01-15', status: 'Completed' },
      { role: 'Reviewed By', name: 'Dr. Ananya Sharma', date: '2024-01-20', status: 'Completed' },
      { role: 'Approved By', name: 'Vikram Singh', date: '2024-01-25', status: 'Completed' },
    ],
    headerFooter: { headerLeft: 'Vidyalaya Corp', headerCenter: 'Architecture Design', headerRight: 'DOC-2024-001', footerLeft: 'Confidential', footerCenter: 'Page {n}', footerRight: 'v2.0' },
    deletedAt: null,
  },
  {
    id: 'doc-2', docId: 'DOC-2024-002', name: 'Quality Assurance Test Plan', department: 'QA', author: 'Neha Gupta',
    routePath: '/qa/test-plan', version: '1.1', status: 'Approved', classification: 'Internal',
    createdDate: '2024-02-01', modifiedDate: '2024-04-15', retention: '2yr', expiryDate: '2026-02-01',
    tags: ['testing', 'qa', 'automation'],
    versionHistory: [
      { version: '1.0', author: 'Neha Gupta', date: '2024-02-01', notes: 'Initial test plan' },
      { version: '1.1', author: 'Neha Gupta', date: '2024-04-15', notes: 'Added automation test cases' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Neha Gupta', date: '2024-02-01', status: 'Completed' },
      { role: 'Reviewed By', name: 'Rajesh Kumar', date: '2024-02-10', status: 'Completed' },
      { role: 'Approved By', name: 'Meena Iyer', date: '2024-02-15', status: 'Completed' },
    ],
    headerFooter: { headerLeft: 'QA Department', headerCenter: 'Test Plan', headerRight: 'DOC-2024-002', footerLeft: '', footerCenter: 'Page {n}', footerRight: 'v1.1' },
    deletedAt: null,
  },
  {
    id: 'doc-3', docId: 'DOC-2024-003', name: 'Employee Onboarding Manual', department: 'HR', author: 'Kavita Reddy',
    routePath: '/hr/onboarding', version: '3.0', status: 'Published', classification: 'Public',
    createdDate: '2023-06-10', modifiedDate: '2024-08-01', retention: '7yr', expiryDate: '2030-06-10',
    tags: ['hr', 'onboarding', 'policy'],
    versionHistory: [
      { version: '1.0', author: 'Kavita Reddy', date: '2023-06-10', notes: 'Initial onboarding guide' },
      { version: '2.0', author: 'Kavita Reddy', date: '2024-01-05', notes: 'Updated with remote onboarding' },
      { version: '3.0', author: 'Suresh Nair', date: '2024-08-01', notes: 'Added compliance checklists' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Kavita Reddy', date: '2023-06-10', status: 'Completed' },
      { role: 'Reviewed By', name: 'Priya Patel', date: '2023-06-15', status: 'Completed' },
      { role: 'Approved By', name: 'Vikram Singh', date: '2023-06-20', status: 'Completed' },
    ],
    headerFooter: { headerLeft: 'HR Department', headerCenter: 'Onboarding Manual', headerRight: 'DOC-2024-003', footerLeft: '', footerCenter: 'Page {n}', footerRight: 'v3.0' },
    deletedAt: null,
  },
  {
    id: 'doc-4', docId: 'DOC-2024-004', name: 'Annual Financial Report FY2024', department: 'Finance', author: 'Ravi Shankar',
    routePath: '/finance/annual-report', version: '1.0', status: 'Under Review', classification: 'Confidential',
    createdDate: '2024-07-01', modifiedDate: '2024-07-15', retention: '10yr', expiryDate: '2034-07-01',
    tags: ['finance', 'annual-report', 'audit'],
    versionHistory: [
      { version: '1.0', author: 'Ravi Shankar', date: '2024-07-01', notes: 'Draft annual financial report' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Ravi Shankar', date: '2024-07-01', status: 'Completed' },
      { role: 'Reviewed By', name: 'Meena Iyer', date: null, status: 'Pending' },
      { role: 'Approved By', name: 'Vikram Singh', date: null, status: 'Pending' },
    ],
    headerFooter: { headerLeft: 'Finance Dept', headerCenter: 'Annual Report', headerRight: 'DOC-2024-004', footerLeft: 'Strictly Confidential', footerCenter: 'Page {n}', footerRight: 'v1.0' },
    deletedAt: null,
  },
  {
    id: 'doc-5', docId: 'DOC-2024-005', name: 'IT Security Policy', department: 'IT', author: 'Deepak Joshi',
    routePath: '/it/security-policy', version: '2.1', status: 'Published', classification: 'Restricted',
    createdDate: '2023-11-01', modifiedDate: '2024-05-10', retention: '5yr', expiryDate: '2028-11-01',
    tags: ['security', 'policy', 'compliance'],
    versionHistory: [
      { version: '1.0', author: 'Deepak Joshi', date: '2023-11-01', notes: 'Initial security policy' },
      { version: '2.0', author: 'Deepak Joshi', date: '2024-02-01', notes: 'Zero-trust architecture additions' },
      { version: '2.1', author: 'Suresh Nair', date: '2024-05-10', notes: 'Updated incident response procedures' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Deepak Joshi', date: '2023-11-01', status: 'Completed' },
      { role: 'Reviewed By', name: 'Arjun Mehta', date: '2023-11-10', status: 'Completed' },
      { role: 'Approved By', name: 'Vikram Singh', date: '2023-11-15', status: 'Completed' },
    ],
    headerFooter: { headerLeft: 'IT Department', headerCenter: 'Security Policy', headerRight: 'DOC-2024-005', footerLeft: 'RESTRICTED', footerCenter: 'Page {n}', footerRight: 'v2.1' },
    deletedAt: null,
  },
  {
    id: 'doc-6', docId: 'DOC-2024-006', name: 'Operations SOP Manual', department: 'Operations', author: 'Amit Verma',
    routePath: '/operations/sop', version: '1.0', status: 'Draft', classification: 'Internal',
    createdDate: '2024-08-01', modifiedDate: '2024-08-01', retention: '2yr', expiryDate: '2026-08-01',
    tags: ['operations', 'sop', 'process'],
    versionHistory: [
      { version: '1.0', author: 'Amit Verma', date: '2024-08-01', notes: 'Initial SOP draft' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Amit Verma', date: '2024-08-01', status: 'Completed' },
      { role: 'Reviewed By', name: 'Priya Patel', date: null, status: 'Pending' },
      { role: 'Approved By', name: 'Vikram Singh', date: null, status: 'Pending' },
    ],
    headerFooter: { headerLeft: 'Operations', headerCenter: 'SOP Manual', headerRight: 'DOC-2024-006', footerLeft: '', footerCenter: 'Page {n}', footerRight: 'v1.0' },
    deletedAt: null,
  },
  {
    id: 'doc-7', docId: 'DOC-2024-007', name: 'Legal Compliance Framework', department: 'Legal', author: 'Sunita Rao',
    routePath: '/legal/compliance', version: '1.2', status: 'Approved', classification: 'Confidential',
    createdDate: '2024-03-01', modifiedDate: '2024-07-20', retention: 'Permanent', expiryDate: '9999-12-31',
    tags: ['legal', 'compliance', 'regulatory'],
    versionHistory: [
      { version: '1.0', author: 'Sunita Rao', date: '2024-03-01', notes: 'Initial compliance framework' },
      { version: '1.1', author: 'Sunita Rao', date: '2024-05-15', notes: 'Added GDPR compliance section' },
      { version: '1.2', author: 'Sunita Rao', date: '2024-07-20', notes: 'Updated data protection clauses' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Sunita Rao', date: '2024-03-01', status: 'Completed' },
      { role: 'Reviewed By', name: 'Rajesh Kumar', date: '2024-03-10', status: 'Completed' },
      { role: 'Approved By', name: 'Vikram Singh', date: '2024-03-15', status: 'Completed' },
    ],
    headerFooter: { headerLeft: 'Legal Dept', headerCenter: 'Compliance Framework', headerRight: 'DOC-2024-007', footerLeft: 'Confidential', footerCenter: 'Page {n}', footerRight: 'v1.2' },
    deletedAt: null,
  },
  {
    id: 'doc-8', docId: 'DOC-2024-008', name: 'Executive Strategic Plan 2025', department: 'Management', author: 'Vikram Singh',
    routePath: '/management/strategic-plan', version: '1.0', status: 'Under Review', classification: 'Restricted',
    createdDate: '2024-09-01', modifiedDate: '2024-09-10', retention: '10yr', expiryDate: '2034-09-01',
    tags: ['strategy', 'planning', 'executive'],
    versionHistory: [
      { version: '1.0', author: 'Vikram Singh', date: '2024-09-01', notes: 'Draft strategic plan for 2025' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Vikram Singh', date: '2024-09-01', status: 'Completed' },
      { role: 'Reviewed By', name: 'Dr. Ananya Sharma', date: null, status: 'Pending' },
      { role: 'Approved By', name: 'Board Committee', date: null, status: 'Pending' },
    ],
    headerFooter: { headerLeft: 'Management', headerCenter: 'Strategic Plan 2025', headerRight: 'DOC-2024-008', footerLeft: 'RESTRICTED', footerCenter: 'Page {n}', footerRight: 'v1.0' },
    deletedAt: null,
  },
  {
    id: 'doc-9', docId: 'DOC-2024-009', name: 'Data Retention & Archival Policy', department: 'IT', author: 'Deepak Joshi',
    routePath: '/it/data-retention', version: '1.0', status: 'Archived', classification: 'Internal',
    createdDate: '2022-01-10', modifiedDate: '2023-01-10', retention: '2yr', expiryDate: '2024-01-10',
    tags: ['data', 'retention', 'archival'],
    versionHistory: [
      { version: '1.0', author: 'Deepak Joshi', date: '2022-01-10', notes: 'Initial data retention policy' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Deepak Joshi', date: '2022-01-10', status: 'Completed' },
      { role: 'Reviewed By', name: 'Arjun Mehta', date: '2022-01-15', status: 'Completed' },
      { role: 'Approved By', name: 'Vikram Singh', date: '2022-01-20', status: 'Completed' },
    ],
    headerFooter: { headerLeft: 'IT Dept', headerCenter: 'Data Retention Policy', headerRight: 'DOC-2024-009', footerLeft: '', footerCenter: 'Page {n}', footerRight: 'v1.0' },
    deletedAt: null,
  },
  {
    id: 'doc-10', docId: 'DOC-2024-010', name: 'Vendor Contract Template', department: 'Legal', author: 'Sunita Rao',
    routePath: '/legal/vendor-contract', version: '1.0', status: 'Deleted', classification: 'Confidential',
    createdDate: '2024-01-05', modifiedDate: '2024-02-01', retention: '5yr', expiryDate: '2029-01-05',
    tags: ['legal', 'contract', 'vendor'],
    versionHistory: [
      { version: '1.0', author: 'Sunita Rao', date: '2024-01-05', notes: 'Initial vendor contract template' },
    ],
    approvalChain: [
      { role: 'Prepared By', name: 'Sunita Rao', date: '2024-01-05', status: 'Completed' },
      { role: 'Reviewed By', name: 'Rajesh Kumar', date: '2024-01-10', status: 'Completed' },
      { role: 'Approved By', name: 'Vikram Singh', date: null, status: 'Pending' },
    ],
    headerFooter: { headerLeft: 'Legal', headerCenter: 'Vendor Contract', headerRight: 'DOC-2024-010', footerLeft: '', footerCenter: 'Page {n}', footerRight: 'v1.0' },
    deletedAt: '2026-03-01',
  },
];

const INITIAL_DEPTS: DeptRecord[] = [
  { id: 'dept-1', name: 'Engineering', code: 'ENG', head: 'Arjun Mehta', description: 'Software and hardware engineering', parentId: null },
  { id: 'dept-2', name: 'QA', code: 'QA', head: 'Neha Gupta', description: 'Quality assurance and testing', parentId: null },
  { id: 'dept-3', name: 'HR', code: 'HR', head: 'Kavita Reddy', description: 'Human resources and talent management', parentId: null },
  { id: 'dept-4', name: 'Finance', code: 'FIN', head: 'Ravi Shankar', description: 'Financial planning and accounting', parentId: null },
  { id: 'dept-5', name: 'Operations', code: 'OPS', head: 'Amit Verma', description: 'Daily operations and logistics', parentId: null },
  { id: 'dept-6', name: 'Legal', code: 'LEG', head: 'Sunita Rao', description: 'Legal affairs and compliance', parentId: null },
  { id: 'dept-7', name: 'IT', code: 'IT', head: 'Deepak Joshi', description: 'Information technology and infrastructure', parentId: null },
  { id: 'dept-8', name: 'Management', code: 'MGT', head: 'Vikram Singh', description: 'Executive management and strategy', parentId: null },
];

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_KEY_DOCS = 'vidyalaya_doc_control_docs';
const STORAGE_KEY_DEPTS = 'vidyalaya_doc_control_depts';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* storage full - silently fail */
  }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Badge({ status }: { status: DocStatus }) {
  const c = statusColor(status);
  return (
    <span
      style={{ backgroundColor: c.bg, color: c.fg }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    >
      {status}
    </span>
  );
}

function ClassBadge({ classification }: { classification: Classification }) {
  const map: Record<Classification, { bg: string; fg: string; icon: typeof Globe }> = {
    Public: { bg: 'rgba(34,197,94,0.15)', fg: '#22c55e', icon: Globe },
    Internal: { bg: 'rgba(59,130,246,0.15)', fg: '#3b82f6', icon: BookOpen },
    Confidential: { bg: 'rgba(234,179,8,0.15)', fg: '#ca8a04', icon: Shield },
    Restricted: { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444', icon: Lock },
  };
  const c = map[classification];
  const Icon = c.icon;
  return (
    <span style={{ backgroundColor: c.bg, color: c.fg }} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
      <Icon size={12} /> {classification}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Department Tree Component                                          */
/* ------------------------------------------------------------------ */

function DeptTree({ depts }: { depts: DeptRecord[] }) {
  const topLevel = depts.filter(d => !d.parentId);
  const children = (parentId: string) => depts.filter(d => d.parentId === parentId);

  const renderNode = (dept: DeptRecord, level: number) => {
    const kids = children(dept.id);
    return (
      <div key={dept.id} style={{ paddingLeft: level * 20 }}>
        <div
          className="flex items-center gap-2 py-2 px-3 rounded-md mb-1 transition-colors"
          style={{ backgroundColor: level === 0 ? 'var(--muted)' : 'transparent', border: level === 0 ? '1px solid var(--border)' : 'none' }}
        >
          {kids.length > 0 ? <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} /> : <span className="w-3.5" />}
          <Building2 size={14} style={{ color: 'var(--primary)' }} />
          <div className="flex-1">
            <span className="text-sm font-medium">{dept.name}</span>
            <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>({dept.code})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} style={{ color: 'var(--muted-foreground)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dept.head}</span>
          </div>
        </div>
        {kids.map(kid => renderNode(kid, level + 1))}
      </div>
    );
  };

  if (topLevel.length === 0) {
    return <p className="text-sm py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>No departments configured.</p>;
  }

  return <div className="flex flex-col">{topLevel.map(d => renderNode(d, 0))}</div>;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DocControlPage() {
  /* ---------- State ---------- */
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [depts, setDepts] = useState<DeptRecord[]>([]);
  const [topTab, setTopTab] = useState<TopTab>('registry');
  const [archiveSubTab, setArchiveSubTab] = useState<ArchiveSubTab>('active');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('docId');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Department form
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState<DeptRecord | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', head: '', description: '', parentId: '' });

  // New doc form
  const [newDocForm, setNewDocForm] = useState({
    name: '', department: 'Engineering' as Department, author: '', routePath: '', retention: '5yr' as RetentionPeriod,
  });

  /* ---------- Load data ---------- */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) { setDocs(data); return; }
        }
      } catch { /* fall through */ }
      setDocs(loadFromStorage(STORAGE_KEY_DOCS, INITIAL_DOCS));
    }
    async function fetchDepts() {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) { setDepts(data); return; }
        }
      } catch { /* fall through */ }
      setDepts(loadFromStorage(STORAGE_KEY_DEPTS, INITIAL_DEPTS));
    }
    fetchData();
    fetchDepts();
  }, []);

  /* ---------- Persist ---------- */
  useEffect(() => { if (docs.length) saveToStorage(STORAGE_KEY_DOCS, docs); }, [docs]);
  useEffect(() => { if (depts.length) saveToStorage(STORAGE_KEY_DEPTS, depts); }, [depts]);

  /* ---------- Sorting ---------- */
  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const SortIcon = useCallback(({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown size={14} className="opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  }, [sortKey, sortDir]);

  /* ---------- Filtered & sorted docs ---------- */
  const filteredDocs = useMemo(() => {
    let list = [...docs];
    if (topTab === 'registry') {
      list = list.filter(d => d.status !== 'Archived' && d.status !== 'Deleted');
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.docId.toLowerCase().includes(q));
    }
    if (deptFilter !== 'All') list = list.filter(d => d.department === deptFilter);
    if (statusFilter !== 'All') list = list.filter(d => d.status === statusFilter);

    list.sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [docs, search, deptFilter, statusFilter, sortKey, sortDir, topTab]);

  /* ---------- Archive/Deleted filtered ---------- */
  const archiveDocs = useMemo(() => {
    switch (archiveSubTab) {
      case 'active': return docs.filter(d => d.status !== 'Archived' && d.status !== 'Deleted');
      case 'archived': return docs.filter(d => d.status === 'Archived');
      case 'deleted': return docs.filter(d => d.status === 'Deleted');
    }
  }, [docs, archiveSubTab]);

  /* ---------- Actions ---------- */
  const updateDoc = useCallback((id: string, patch: Partial<DocRecord>) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, ...patch, modifiedDate: new Date().toISOString().slice(0, 10) } : d));
    setSelectedDoc(prev => prev && prev.id === id ? { ...prev, ...patch, modifiedDate: new Date().toISOString().slice(0, 10) } : prev);
  }, []);

  const addDocument = useCallback(() => {
    const nextNum = docs.length + 1;
    const docId = `DOC-2024-${String(nextNum).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);
    const newDoc: DocRecord = {
      id: uid(), docId, name: newDocForm.name, department: newDocForm.department,
      author: newDocForm.author, routePath: newDocForm.routePath, version: '1.0',
      status: 'Draft', classification: 'Internal', createdDate: today, modifiedDate: today,
      retention: newDocForm.retention, expiryDate: calcExpiry(today, newDocForm.retention),
      tags: [], versionHistory: [{ version: '1.0', author: newDocForm.author, date: today, notes: 'Initial creation' }],
      approvalChain: [
        { role: 'Prepared By', name: newDocForm.author, date: today, status: 'Completed' },
        { role: 'Reviewed By', name: '', date: null, status: 'Pending' },
        { role: 'Approved By', name: '', date: null, status: 'Pending' },
      ],
      headerFooter: { headerLeft: '', headerCenter: newDocForm.name, headerRight: docId, footerLeft: '', footerCenter: 'Page {n}', footerRight: 'v1.0' },
      deletedAt: null,
    };
    setDocs(prev => [...prev, newDoc]);
    setShowNewDocForm(false);
    setNewDocForm({ name: '', department: 'Engineering', author: '', routePath: '', retention: '5yr' });
  }, [docs.length, newDocForm]);

  const softDelete = useCallback((id: string) => {
    updateDoc(id, { status: 'Deleted' as DocStatus, deletedAt: new Date().toISOString().slice(0, 10) });
  }, [updateDoc]);

  const archiveDocFn = useCallback((id: string) => {
    updateDoc(id, { status: 'Archived' as DocStatus });
  }, [updateDoc]);

  const restoreDoc = useCallback((id: string) => {
    updateDoc(id, { status: 'Draft' as DocStatus, deletedAt: null });
  }, [updateDoc]);

  const permanentDelete = useCallback((id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  }, []);

  const bulkAction = useCallback((action: 'archive' | 'delete' | 'restore') => {
    selectedIds.forEach(id => {
      if (action === 'archive') archiveDocFn(id);
      else if (action === 'delete') softDelete(id);
      else restoreDoc(id);
    });
    setSelectedIds(new Set());
  }, [selectedIds, archiveDocFn, softDelete, restoreDoc]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  /* ---------- Department CRUD ---------- */
  const saveDept = useCallback(() => {
    if (editingDept) {
      setDepts(prev => prev.map(d => d.id === editingDept.id ? { ...d, ...deptForm, parentId: deptForm.parentId || null } : d));
    } else {
      setDepts(prev => [...prev, { id: uid(), ...deptForm, parentId: deptForm.parentId || null }]);
    }
    setShowDeptForm(false);
    setEditingDept(null);
    setDeptForm({ name: '', code: '', head: '', description: '', parentId: '' });
  }, [deptForm, editingDept]);

  const deleteDept = useCallback((id: string) => {
    setDepts(prev => prev.filter(d => d.id !== id));
  }, []);

  /* ---------- Styles ---------- */
  const cardStyle: React.CSSProperties = { backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius, 0.5rem)' };
  const inputStyle: React.CSSProperties = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: 'var(--radius, 0.5rem)' };
  const btnPrimary: React.CSSProperties = { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground, #fff)', borderRadius: 'var(--radius, 0.5rem)' };
  const btnMuted: React.CSSProperties = { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', borderRadius: 'var(--radius, 0.5rem)' };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="flex flex-col gap-6" style={{ color: 'var(--foreground)' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText size={24} style={{ color: 'var(--primary)' }} />
            Document Control System
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage documents, versions, approvals, and retention policies
          </p>
        </div>
      </div>

      {/* Top Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
        {([
          { key: 'registry' as TopTab, label: 'Document Registry', icon: FileText },
          { key: 'archive' as TopTab, label: 'Archive & Deleted', icon: Archive },
          { key: 'departments' as TopTab, label: 'Departments', icon: Building2 },
        ]).map(tab => {
          const Icon = tab.icon;
          const active = topTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTopTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center"
              style={active ? { backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } : { color: 'var(--muted-foreground)' }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/*  TAB: Document Registry                                       */}
      {/* ============================================================ */}
      {topTab === 'registry' && (
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text" placeholder="Search by name or Doc ID..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm" style={inputStyle}
              />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 text-sm" style={inputStyle}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm" style={inputStyle}>
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowNewDocForm(v => !v)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium" style={btnPrimary}>
              <Plus size={16} /> New Document
            </button>
          </div>

          {/* New Document inline form */}
          {showNewDocForm && (
            <div className="p-4 flex flex-wrap gap-3 items-end" style={cardStyle}>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Document Name *</label>
                <input value={newDocForm.name} onChange={e => setNewDocForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 text-sm w-60" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Department</label>
                <select value={newDocForm.department} onChange={e => setNewDocForm(f => ({ ...f, department: e.target.value as Department }))} className="px-3 py-2 text-sm" style={inputStyle}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Author *</label>
                <input value={newDocForm.author} onChange={e => setNewDocForm(f => ({ ...f, author: e.target.value }))} className="px-3 py-2 text-sm w-40" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Route Path</label>
                <input value={newDocForm.routePath} onChange={e => setNewDocForm(f => ({ ...f, routePath: e.target.value }))} placeholder="/dept/doc-name" className="px-3 py-2 text-sm w-48" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Retention</label>
                <select value={newDocForm.retention} onChange={e => setNewDocForm(f => ({ ...f, retention: e.target.value as RetentionPeriod }))} className="px-3 py-2 text-sm" style={inputStyle}>
                  {ALL_RETENTION.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addDocument} disabled={!newDocForm.name || !newDocForm.author} className="px-4 py-2 text-sm font-medium disabled:opacity-50" style={btnPrimary}>Create</button>
                <button onClick={() => setShowNewDocForm(false)} className="px-4 py-2 text-sm font-medium" style={btnMuted}>Cancel</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto" style={cardStyle}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {([
                    ['docId', 'Doc ID'], ['name', 'Document Name'], ['department', 'Department'], ['author', 'Author'],
                    [null, 'Route Path'], ['version', 'Ver.'], ['status', 'Status'],
                    ['createdDate', 'Created'], ['modifiedDate', 'Modified'], [null, 'Retention'], [null, 'Expiry'],
                  ] as [SortKey | null, string][]).map(([key, label], i) => (
                    <th
                      key={i}
                      className={`px-3 py-3 text-left font-medium whitespace-nowrap ${key ? 'cursor-pointer select-none hover:opacity-80' : ''}`}
                      style={{ color: 'var(--muted-foreground)' }}
                      onClick={() => key && toggleSort(key)}
                    >
                      <span className="flex items-center gap-1">{label} {key && <SortIcon col={key} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr
                    key={doc.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onClick={() => setSelectedDoc(doc)}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--primary)' }}>{doc.docId}</td>
                    <td className="px-3 py-3 font-medium max-w-[200px] truncate">{doc.name}</td>
                    <td className="px-3 py-3" style={{ color: 'var(--muted-foreground)' }}>{doc.department}</td>
                    <td className="px-3 py-3">{doc.author}</td>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{doc.routePath}</td>
                    <td className="px-3 py-3 text-center">v{doc.version}</td>
                    <td className="px-3 py-3"><Badge status={doc.status} /></td>
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{formatDate(doc.createdDate)}</td>
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{formatDate(doc.modifiedDate)}</td>
                    <td className="px-3 py-3 text-center">{doc.retention}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span style={{ color: retentionColor(doc.expiryDate) }}>{doc.expiryDate === '9999-12-31' ? 'Never' : formatDate(doc.expiryDate)}</span>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr><td colSpan={11} className="px-3 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>No documents found matching your criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Document Detail Panel (Side panel overlay)                   */}
      {/* ============================================================ */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={e => { if (e.target === e.currentTarget) setSelectedDoc(null); }}>
          <div className="w-full max-w-2xl h-full overflow-y-auto p-6 flex flex-col gap-6" style={{ backgroundColor: 'var(--background)' }}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: 'var(--primary)' }}>{selectedDoc.docId}</p>
                <h2 className="text-xl font-bold">{selectedDoc.name}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{selectedDoc.department}</span>
                  <span className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>{selectedDoc.routePath}</span>
                  <ClassBadge classification={selectedDoc.classification} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next: DocStatus = selectedDoc.status === 'Draft' ? 'Under Review' : selectedDoc.status === 'Under Review' ? 'Approved' : selectedDoc.status === 'Approved' ? 'Published' : selectedDoc.status;
                    if (next !== selectedDoc.status) updateDoc(selectedDoc.id, { status: next });
                  }}
                  className="px-3 py-1.5 text-xs font-medium" style={btnPrimary}
                >
                  <Edit3 size={14} className="inline mr-1" /> Advance Status
                </button>
                <button onClick={() => setSelectedDoc(null)} className="p-1.5 rounded-md" style={btnMuted}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Classification selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Classification</label>
              <select
                value={selectedDoc.classification}
                onChange={e => updateDoc(selectedDoc.id, { classification: e.target.value as Classification })}
                className="px-3 py-2 text-sm w-48" style={inputStyle}
              >
                {ALL_CLASSIFICATION.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Version History Timeline */}
            <div className="p-4 flex flex-col gap-4" style={cardStyle}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><History size={16} style={{ color: 'var(--primary)' }} /> Version History</h3>
              <div className="flex flex-col gap-0">
                {selectedDoc.versionHistory.map((v, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: i === selectedDoc.versionHistory.length - 1 ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                      {i < selectedDoc.versionHistory.length - 1 && <div className="w-0.5 flex-1 min-h-[24px]" style={{ backgroundColor: 'var(--border)' }} />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">v{v.version}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatDate(v.date)}</span>
                          {i < selectedDoc.versionHistory.length - 1 && (
                            <button
                              onClick={() => updateDoc(selectedDoc.id, { version: v.version })}
                              className="text-xs px-2 py-0.5 rounded" style={btnMuted}
                            >
                              <RotateCcw size={12} className="inline mr-1" />Restore
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>by {v.author}</p>
                      <p className="text-xs mt-1">{v.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Header / Footer Config */}
            <div className="p-4 flex flex-col gap-3" style={cardStyle}>
              <h3 className="text-sm font-semibold">Header / Footer Configuration</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['Left', 'Center', 'Right'] as const).map(pos => (
                  <div key={`h-${pos}`} className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Header {pos}</label>
                    <input
                      value={selectedDoc.headerFooter[`header${pos}` as keyof HeaderFooterConfig]}
                      onChange={e => {
                        const key = `header${pos}` as keyof HeaderFooterConfig;
                        updateDoc(selectedDoc.id, { headerFooter: { ...selectedDoc.headerFooter, [key]: e.target.value } });
                      }}
                      className="px-2 py-1.5 text-xs" style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Left', 'Center', 'Right'] as const).map(pos => (
                  <div key={`f-${pos}`} className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Footer {pos}</label>
                    <input
                      value={selectedDoc.headerFooter[`footer${pos}` as keyof HeaderFooterConfig]}
                      onChange={e => {
                        const key = `footer${pos}` as keyof HeaderFooterConfig;
                        updateDoc(selectedDoc.id, { headerFooter: { ...selectedDoc.headerFooter, [key]: e.target.value } });
                      }}
                      className="px-2 py-1.5 text-xs" style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Chain */}
            <div className="p-4 flex flex-col gap-3" style={cardStyle}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><CheckCircle size={16} style={{ color: 'var(--primary)' }} /> Approval Chain</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedDoc.approvalChain.map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="p-3 rounded-lg text-center min-w-[140px]" style={{ backgroundColor: 'var(--muted)', border: step.status === 'Completed' ? '1px solid #22c55e' : step.status === 'Rejected' ? '1px solid #ef4444' : '1px solid var(--border)' }}>
                      <p className="text-xs font-medium" style={{ color: step.status === 'Completed' ? '#22c55e' : step.status === 'Rejected' ? '#ef4444' : 'var(--muted-foreground)' }}>{step.role}</p>
                      <p className="text-sm font-medium mt-1">{step.name || '\u2014'}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{step.date ? formatDate(step.date) : 'Pending'}</p>
                      <span className="text-xs" style={{ color: step.status === 'Completed' ? '#22c55e' : step.status === 'Rejected' ? '#ef4444' : '#f59e0b' }}>{step.status}</span>
                    </div>
                    {i < selectedDoc.approvalChain.length - 1 && <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Retention Settings */}
            <div className="p-4 flex flex-col gap-3" style={cardStyle}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><Clock size={16} style={{ color: 'var(--primary)' }} /> Retention Settings</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Retention Period</label>
                  <select
                    value={selectedDoc.retention}
                    onChange={e => {
                      const r = e.target.value as RetentionPeriod;
                      updateDoc(selectedDoc.id, { retention: r, expiryDate: calcExpiry(selectedDoc.createdDate, r) });
                    }}
                    className="px-3 py-2 text-sm" style={inputStyle}
                  >
                    {ALL_RETENTION.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Auto-Archive Date</label>
                  <p className="text-sm py-2" style={{ color: retentionColor(selectedDoc.expiryDate) }}>
                    {selectedDoc.expiryDate === '9999-12-31' ? 'Never' : formatDate(selectedDoc.expiryDate)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Deletion Date</label>
                  <p className="text-sm py-2" style={{ color: 'var(--muted-foreground)' }}>
                    {selectedDoc.retention === 'Permanent' ? 'Never' : formatDate(addYears(selectedDoc.expiryDate === '9999-12-31' ? selectedDoc.createdDate : selectedDoc.expiryDate, 1))}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="p-4 flex flex-col gap-3" style={cardStyle}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><Tag size={16} style={{ color: 'var(--primary)' }} /> Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedDoc.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                    {tag}
                    <button onClick={() => updateDoc(selectedDoc.id, { tags: selectedDoc.tags.filter((_, j) => j !== i) })} className="hover:opacity-70">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  placeholder="Add tag..."
                  className="px-2 py-1 text-xs w-24 outline-none"
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (!selectedDoc.tags.includes(val)) {
                        updateDoc(selectedDoc.id, { tags: [...selectedDoc.tags, val] });
                      }
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>

            {/* Close button */}
            <button onClick={() => setSelectedDoc(null)} className="w-full py-2.5 text-sm font-medium rounded-lg" style={btnMuted}>
              Close Detail Panel
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB: Archive & Deleted                                       */}
      {/* ============================================================ */}
      {topTab === 'archive' && (
        <div className="flex flex-col gap-4">
          {/* Sub-tabs */}
          <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--muted)' }}>
            {([
              { key: 'active' as ArchiveSubTab, label: 'Active', count: docs.filter(d => d.status !== 'Archived' && d.status !== 'Deleted').length },
              { key: 'archived' as ArchiveSubTab, label: 'Archived', count: docs.filter(d => d.status === 'Archived').length },
              { key: 'deleted' as ArchiveSubTab, label: 'Deleted (Recycle Bin)', count: docs.filter(d => d.status === 'Deleted').length },
            ]).map(tab => {
              const active = archiveSubTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setArchiveSubTab(tab.key); setSelectedIds(new Set()); }}
                  className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                  style={active ? { backgroundColor: 'var(--card)', color: 'var(--foreground)' } : { color: 'var(--muted-foreground)' }}
                >
                  {tab.label}
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: active ? 'var(--primary)' : 'var(--border)', color: active ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)' }}>{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              {archiveSubTab === 'active' && (
                <>
                  <button onClick={() => bulkAction('archive')} className="px-3 py-1.5 text-xs font-medium flex items-center gap-1 rounded-md" style={btnMuted}><Archive size={14} /> Archive Selected</button>
                  <button onClick={() => bulkAction('delete')} className="px-3 py-1.5 text-xs font-medium flex items-center gap-1 rounded-md" style={{ ...btnMuted, color: '#ef4444' }}><Trash2 size={14} /> Delete Selected</button>
                </>
              )}
              {(archiveSubTab === 'archived' || archiveSubTab === 'deleted') && (
                <button onClick={() => bulkAction('restore')} className="px-3 py-1.5 text-xs font-medium flex items-center gap-1 rounded-md" style={btnMuted}><RotateCcw size={14} /> Restore Selected</button>
              )}
            </div>
          )}

          {/* Archive table */}
          <div className="overflow-x-auto" style={cardStyle}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="px-3 py-3 w-10">
                    <input type="checkbox" className="cursor-pointer" onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(archiveDocs.map(d => d.id)));
                      else setSelectedIds(new Set());
                    }} checked={archiveDocs.length > 0 && selectedIds.size === archiveDocs.length} />
                  </th>
                  <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Doc ID</th>
                  <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Document Name</th>
                  <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Department</th>
                  <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                  <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Expiry</th>
                  {archiveSubTab === 'deleted' && <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Days Remaining</th>}
                  <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archiveDocs.map(doc => {
                  const deletedDaysRemaining = doc.deletedAt ? Math.max(0, 30 - Math.floor((Date.now() - new Date(doc.deletedAt).getTime()) / (1000 * 60 * 60 * 24))) : null;
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-3 py-3"><input type="checkbox" className="cursor-pointer" checked={selectedIds.has(doc.id)} onChange={() => toggleSelect(doc.id)} /></td>
                      <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--primary)' }}>{doc.docId}</td>
                      <td className="px-3 py-3 font-medium">{doc.name}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--muted-foreground)' }}>{doc.department}</td>
                      <td className="px-3 py-3"><Badge status={doc.status} /></td>
                      <td className="px-3 py-3">
                        <span style={{ color: retentionColor(doc.expiryDate) }}>
                          {doc.expiryDate === '9999-12-31' ? 'Never' : formatDate(doc.expiryDate)}
                        </span>
                      </td>
                      {archiveSubTab === 'deleted' && (
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: deletedDaysRemaining !== null && deletedDaysRemaining <= 7 ? '#ef4444' : '#f59e0b' }}>
                            <Clock size={12} /> {deletedDaysRemaining} days
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {(archiveSubTab === 'archived' || archiveSubTab === 'deleted') && (
                            <button onClick={() => restoreDoc(doc.id)} className="px-2 py-1 text-xs rounded flex items-center gap-1" style={btnMuted}>
                              <RotateCcw size={12} /> Restore
                            </button>
                          )}
                          {archiveSubTab === 'active' && (
                            <>
                              <button onClick={() => archiveDocFn(doc.id)} className="px-2 py-1 text-xs rounded flex items-center gap-1" style={btnMuted}>
                                <Archive size={12} /> Archive
                              </button>
                              <button onClick={() => softDelete(doc.id)} className="px-2 py-1 text-xs rounded flex items-center gap-1 hover:opacity-80" style={{ color: '#ef4444' }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </>
                          )}
                          {archiveSubTab === 'archived' && (
                            <button onClick={() => permanentDelete(doc.id)} className="px-2 py-1 text-xs rounded flex items-center gap-1 hover:opacity-80" style={{ color: '#ef4444' }}>
                              <Trash2 size={12} /> Permanent Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {archiveDocs.length === 0 && (
                  <tr><td colSpan={archiveSubTab === 'deleted' ? 8 : 7} className="px-3 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    {archiveSubTab === 'archived' ? 'No archived documents.' : archiveSubTab === 'deleted' ? 'Recycle bin is empty.' : 'No active documents.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB: Departments                                             */}
      {/* ============================================================ */}
      {topTab === 'departments' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Department Management</h2>
            <button
              onClick={() => { setShowDeptForm(true); setEditingDept(null); setDeptForm({ name: '', code: '', head: '', description: '', parentId: '' }); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium" style={btnPrimary}
            >
              <Plus size={16} /> Add Department
            </button>
          </div>

          {/* Department Form */}
          {showDeptForm && (
            <div className="p-4 flex flex-col gap-3" style={cardStyle}>
              <h3 className="text-sm font-semibold">{editingDept ? 'Edit Department' : 'New Department'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Name *</label>
                  <input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Code *</label>
                  <input value={deptForm.code} onChange={e => setDeptForm(f => ({ ...f, code: e.target.value }))} className="px-3 py-2 text-sm" style={inputStyle} placeholder="e.g. ENG" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Department Head</label>
                  <input value={deptForm.head} onChange={e => setDeptForm(f => ({ ...f, head: e.target.value }))} className="px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Parent Department</label>
                  <select value={deptForm.parentId} onChange={e => setDeptForm(f => ({ ...f, parentId: e.target.value }))} className="px-3 py-2 text-sm" style={inputStyle}>
                    <option value="">None (Top Level)</option>
                    {depts.filter(d => d.id !== editingDept?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Description</label>
                <input value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} className="px-3 py-2 text-sm" style={inputStyle} />
              </div>
              <div className="flex gap-2">
                <button onClick={saveDept} disabled={!deptForm.name || !deptForm.code} className="px-4 py-2 text-sm font-medium disabled:opacity-50 flex items-center gap-2" style={btnPrimary}>
                  <Save size={14} /> {editingDept ? 'Update' : 'Create'}
                </button>
                <button onClick={() => { setShowDeptForm(false); setEditingDept(null); }} className="px-4 py-2 text-sm font-medium" style={btnMuted}>Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Table */}
            <div className="overflow-x-auto" style={cardStyle}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Name</th>
                    <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Code</th>
                    <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Head</th>
                    <th className="px-3 py-3 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depts.map(dept => (
                    <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-3 py-3">
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dept.description}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--primary)' }}>{dept.code}</td>
                      <td className="px-3 py-3">{dept.head}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingDept(dept);
                              setDeptForm({ name: dept.name, code: dept.code, head: dept.head, description: dept.description, parentId: dept.parentId || '' });
                              setShowDeptForm(true);
                            }}
                            className="p-1.5 rounded" style={btnMuted}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deleteDept(dept.id)} className="p-1.5 rounded hover:opacity-80" style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Org Chart / Tree View */}
            <div className="p-4 flex flex-col gap-3" style={cardStyle}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><FolderTree size={16} style={{ color: 'var(--primary)' }} /> Department Hierarchy</h3>
              <DeptTree depts={depts} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
