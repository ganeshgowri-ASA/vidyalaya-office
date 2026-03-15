'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  CheckCircle,
  XCircle,
  History,
  Clock,
  FileText,
  User,
  Filter,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Edit3,
  GitCompare,
  CheckSquare,
  Square,
  Calendar,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
type Status = 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
type Role = 'Submitter' | 'Reviewer';
type SortDir = 'asc' | 'desc';
type SortKey = 'name' | 'submittedBy' | 'date' | 'priority' | 'status';
type RejectionSeverity = 'Minor' | 'Major' | 'Critical';

interface Comment {
  id: string;
  user: string;
  initials: string;
  text: string;
  timestamp: string;
  parentId: string | null;
}

interface AuditEntry {
  id: string;
  action: 'submit' | 'comment' | 'approve' | 'reject' | 'request-changes' | 'assign';
  description: string;
  user: string;
  timestamp: string;
}

interface Document {
  id: string;
  name: string;
  submittedBy: string;
  date: string;
  priority: Priority;
  status: Status;
  description: string;
  fileName: string | null;
  assignedReviewers: string[];
  comments: Comment[];
  auditTrail: AuditEntry[];
  signature: string | null;
  rejectionReason: string | null;
  rejectionSeverity: RejectionSeverity | null;
  dueDate: string | null;
}

/* ------------------------------------------------------------------ */
/*  Sample reviewers                                                   */
/* ------------------------------------------------------------------ */

const SAMPLE_REVIEWERS = [
  { id: 'r1', name: 'Dr. Ananya Sharma' },
  { id: 'r2', name: 'Prof. Rajesh Kumar' },
  { id: 'r3', name: 'Ms. Priya Patel' },
  { id: 'r4', name: 'Mr. Vikram Singh' },
  { id: 'r5', name: 'Dr. Meena Iyer' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const priorityWeight: Record<Priority, number> = { Low: 0, Medium: 1, High: 2, Urgent: 3 };
const statusWeight: Record<Status, number> = { Draft: 0, Submitted: 1, 'In Review': 2, Approved: 3, Rejected: 4 };

function statusColor(s: Status): { bg: string; fg: string } {
  switch (s) {
    case 'Draft':
      return { bg: 'rgba(128,128,128,0.15)', fg: '#888' };
    case 'Submitted':
      return { bg: 'rgba(59,130,246,0.15)', fg: '#3b82f6' };
    case 'In Review':
      return { bg: 'rgba(234,179,8,0.15)', fg: '#ca8a04' };
    case 'Approved':
      return { bg: 'rgba(34,197,94,0.15)', fg: '#16a34a' };
    case 'Rejected':
      return { bg: 'rgba(239,68,68,0.15)', fg: '#dc2626' };
  }
}

function priorityColor(p: Priority): string {
  switch (p) {
    case 'Low': return '#22c55e';
    case 'Medium': return '#3b82f6';
    case 'High': return '#f59e0b';
    case 'Urgent': return '#ef4444';
  }
}

function auditColor(a: AuditEntry['action']): string {
  switch (a) {
    case 'submit': return '#3b82f6';
    case 'comment': return '#888';
    case 'approve': return '#16a34a';
    case 'reject': return '#dc2626';
    case 'request-changes': return '#ca8a04';
    case 'assign': return '#8b5cf6';
  }
}

function auditIcon(a: AuditEntry['action']) {
  switch (a) {
    case 'submit': return Send;
    case 'comment': return MessageSquare;
    case 'approve': return CheckCircle;
    case 'reject': return XCircle;
    case 'request-changes': return Edit3;
    case 'assign': return User;
  }
}

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    name: 'Annual Budget Proposal 2026',
    submittedBy: 'Arjun Mehta',
    date: '2026-03-10',
    priority: 'High',
    status: 'In Review',
    description: 'Comprehensive budget allocation plan for FY 2026-27 covering all departments.',
    fileName: 'budget_proposal_2026.pdf',
    assignedReviewers: ['Dr. Ananya Sharma', 'Prof. Rajesh Kumar'],
    comments: [
      { id: 'c1', user: 'Dr. Ananya Sharma', initials: 'AS', text: 'The projected figures for Q3 look optimistic. Could you provide supporting data for the 15% growth assumption?', timestamp: '2026-03-11 09:30', parentId: null },
      { id: 'c2', user: 'Arjun Mehta', initials: 'AM', text: 'Sure, I will attach the market analysis report that supports those projections.', timestamp: '2026-03-11 10:15', parentId: 'c1' },
      { id: 'c3', user: 'Prof. Rajesh Kumar', initials: 'RK', text: 'Please also include a risk mitigation section for each department.', timestamp: '2026-03-12 14:00', parentId: null },
    ],
    auditTrail: [
      { id: 'a1', action: 'submit', description: 'Document submitted for review', user: 'Arjun Mehta', timestamp: '2026-03-10 08:00' },
      { id: 'a2', action: 'assign', description: 'Assigned to Dr. Ananya Sharma and Prof. Rajesh Kumar', user: 'Arjun Mehta', timestamp: '2026-03-10 08:01' },
      { id: 'a3', action: 'comment', description: 'Dr. Ananya Sharma added a comment', user: 'Dr. Ananya Sharma', timestamp: '2026-03-11 09:30' },
      { id: 'a4', action: 'comment', description: 'Arjun Mehta replied to a comment', user: 'Arjun Mehta', timestamp: '2026-03-11 10:15' },
      { id: 'a5', action: 'comment', description: 'Prof. Rajesh Kumar added a comment', user: 'Prof. Rajesh Kumar', timestamp: '2026-03-12 14:00' },
    ],
    signature: null,
    rejectionReason: null,
    rejectionSeverity: null,
    dueDate: '2026-03-20',
  },
  {
    id: 'doc2',
    name: 'Staff Recruitment Policy',
    submittedBy: 'Neha Gupta',
    date: '2026-03-08',
    priority: 'Medium',
    status: 'Approved',
    description: 'Updated recruitment policy with diversity and inclusion guidelines.',
    fileName: 'recruitment_policy_v3.docx',
    assignedReviewers: ['Ms. Priya Patel'],
    comments: [
      { id: 'c4', user: 'Ms. Priya Patel', initials: 'PP', text: 'Well-structured document. The inclusion guidelines are thorough and align with our institutional goals.', timestamp: '2026-03-09 11:00', parentId: null },
    ],
    auditTrail: [
      { id: 'a6', action: 'submit', description: 'Document submitted for review', user: 'Neha Gupta', timestamp: '2026-03-08 09:00' },
      { id: 'a7', action: 'assign', description: 'Assigned to Ms. Priya Patel', user: 'Neha Gupta', timestamp: '2026-03-08 09:01' },
      { id: 'a8', action: 'comment', description: 'Ms. Priya Patel added a comment', user: 'Ms. Priya Patel', timestamp: '2026-03-09 11:00' },
      { id: 'a9', action: 'approve', description: 'Document approved by Ms. Priya Patel', user: 'Ms. Priya Patel', timestamp: '2026-03-09 14:30' },
    ],
    signature: null,
    rejectionReason: null,
    rejectionSeverity: null,
    dueDate: null,
  },
  {
    id: 'doc3',
    name: 'IT Infrastructure Upgrade Plan',
    submittedBy: 'Sanjay Verma',
    date: '2026-03-05',
    priority: 'Urgent',
    status: 'Rejected',
    description: 'Proposal for campus-wide network and server infrastructure modernization.',
    fileName: 'it_upgrade_plan.pdf',
    assignedReviewers: ['Mr. Vikram Singh', 'Dr. Meena Iyer'],
    comments: [
      { id: 'c5', user: 'Mr. Vikram Singh', initials: 'VS', text: 'The cost estimates seem incomplete. Several line items are missing vendor quotes.', timestamp: '2026-03-06 10:00', parentId: null },
      { id: 'c6', user: 'Dr. Meena Iyer', initials: 'MI', text: 'I agree with Vikram. Also, the timeline does not account for procurement lead times.', timestamp: '2026-03-06 15:00', parentId: null },
      { id: 'c7', user: 'Sanjay Verma', initials: 'SV', text: 'Understood. I will revise and resubmit with complete vendor quotes and adjusted timelines.', timestamp: '2026-03-07 09:00', parentId: 'c5' },
    ],
    auditTrail: [
      { id: 'a10', action: 'submit', description: 'Document submitted for review', user: 'Sanjay Verma', timestamp: '2026-03-05 08:30' },
      { id: 'a11', action: 'assign', description: 'Assigned to Mr. Vikram Singh and Dr. Meena Iyer', user: 'Sanjay Verma', timestamp: '2026-03-05 08:31' },
      { id: 'a12', action: 'comment', description: 'Mr. Vikram Singh added a comment', user: 'Mr. Vikram Singh', timestamp: '2026-03-06 10:00' },
      { id: 'a13', action: 'comment', description: 'Dr. Meena Iyer added a comment', user: 'Dr. Meena Iyer', timestamp: '2026-03-06 15:00' },
      { id: 'a14', action: 'reject', description: 'Document rejected — incomplete cost estimates', user: 'Mr. Vikram Singh', timestamp: '2026-03-07 11:00' },
    ],
    signature: null,
    rejectionReason: 'Incomplete cost estimates and unrealistic timeline. Vendor quotes are missing for 4 major line items.',
    rejectionSeverity: 'Major',
    dueDate: '2026-03-15',
  },
  {
    id: 'doc4',
    name: 'Student Welfare Committee Report',
    submittedBy: 'Kavitha Nair',
    date: '2026-03-12',
    priority: 'Low',
    status: 'Submitted',
    description: 'Quarterly report on student welfare activities and upcoming initiatives.',
    fileName: 'welfare_report_q1.pdf',
    assignedReviewers: ['Dr. Ananya Sharma'],
    comments: [],
    auditTrail: [
      { id: 'a15', action: 'submit', description: 'Document submitted for review', user: 'Kavitha Nair', timestamp: '2026-03-12 10:00' },
      { id: 'a16', action: 'assign', description: 'Assigned to Dr. Ananya Sharma', user: 'Kavitha Nair', timestamp: '2026-03-12 10:01' },
    ],
    signature: null,
    rejectionReason: null,
    rejectionSeverity: null,
    dueDate: '2026-03-25',
  },
  {
    id: 'doc5',
    name: 'Campus Safety Audit',
    submittedBy: 'Ravi Shankar',
    date: '2026-03-14',
    priority: 'High',
    status: 'Submitted',
    description: 'Annual safety audit findings with recommended corrective actions.',
    fileName: 'safety_audit_2026.pdf',
    assignedReviewers: ['Mr. Vikram Singh', 'Ms. Priya Patel'],
    comments: [],
    auditTrail: [
      { id: 'a17', action: 'submit', description: 'Document submitted for review', user: 'Ravi Shankar', timestamp: '2026-03-14 16:00' },
      { id: 'a18', action: 'assign', description: 'Assigned to Mr. Vikram Singh and Ms. Priya Patel', user: 'Ravi Shankar', timestamp: '2026-03-14 16:01' },
    ],
    signature: null,
    rejectionReason: null,
    rejectionSeverity: null,
    dueDate: '2026-03-22',
  },
  {
    id: 'doc6',
    name: 'Library Digitization Proposal',
    submittedBy: 'Deepa Krishnan',
    date: '2026-03-01',
    priority: 'Medium',
    status: 'Draft',
    description: 'Plan to digitize rare manuscripts and historical records in the university library.',
    fileName: null,
    assignedReviewers: [],
    comments: [],
    auditTrail: [
      { id: 'a19', action: 'submit', description: 'Document saved as draft', user: 'Deepa Krishnan', timestamp: '2026-03-01 12:00' },
    ],
    signature: null,
    rejectionReason: null,
    rejectionSeverity: null,
    dueDate: null,
  },
];

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

export default function ReviewPage() {
  /* ---- Core state ------------------------------------------------ */
  const [role, setRole] = useState<Role>('Reviewer');
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  /* ---- Table state ----------------------------------------------- */
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  /* ---- Submission form state ------------------------------------- */
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('Medium');
  const [formFile, setFormFile] = useState<string | null>(null);
  const [formReviewers, setFormReviewers] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  /* ---- Comment state --------------------------------------------- */
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  /* ---- Bulk selection state -------------------------------------- */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ---- Comparison state ----------------------------------------- */
  const [showComparison, setShowComparison] = useState(false);

  /* ---- Due date form state -------------------------------------- */
  const [formDueDate, setFormDueDate] = useState('');

  /* ---- Approve / Reject state ------------------------------------ */
  const [showApprovePanel, setShowApprovePanel] = useState(false);
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSeverity, setRejectSeverity] = useState<RejectionSeverity>('Minor');
  const [requestChangesComment, setRequestChangesComment] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  /* ---- Derived --------------------------------------------------- */
  const selectedDoc = documents.find((d) => d.id === selectedDocId) ?? null;

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.status === 'Submitted' || d.status === 'In Review').length,
    approved: documents.filter((d) => d.status === 'Approved').length,
    rejected: documents.filter((d) => d.status === 'Rejected').length,
  };

  /* ---- Sorting & filtering --------------------------------------- */
  const filtered = documents.filter((d) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') return d.status === 'Submitted' || d.status === 'In Review';
    return d.status === statusFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'submittedBy': cmp = a.submittedBy.localeCompare(b.submittedBy); break;
      case 'date': cmp = a.date.localeCompare(b.date); break;
      case 'priority': cmp = priorityWeight[a.priority] - priorityWeight[b.priority]; break;
      case 'status': cmp = statusWeight[a.status] - statusWeight[b.status]; break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  /* ---- Submission ------------------------------------------------ */
  function handleSubmit() {
    if (!formTitle.trim()) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toISOString().slice(11, 16).replace('T', ' ');
    const newDoc: Document = {
      id: uid(),
      name: formTitle,
      submittedBy: 'You',
      date: dateStr,
      priority: formPriority,
      status: 'Submitted',
      description: formDesc,
      fileName: formFile,
      assignedReviewers: formReviewers,
      comments: [],
      auditTrail: [
        { id: uid(), action: 'submit', description: 'Document submitted for review', user: 'You', timestamp: `${dateStr} ${timeStr}` },
        ...(formReviewers.length
          ? [{ id: uid(), action: 'assign' as const, description: `Assigned to ${formReviewers.join(', ')}`, user: 'You', timestamp: `${dateStr} ${timeStr}` }]
          : []),
      ],
      signature: null,
      rejectionReason: null,
      rejectionSeverity: null,
      dueDate: formDueDate || null,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('Medium');
    setFormFile(null);
    setFormReviewers([]);
    setFormDueDate('');
  }

  /* ---- Comments -------------------------------------------------- */
  function addComment(parentId: string | null, text: string) {
    if (!selectedDoc || !text.trim()) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const userName = role === 'Reviewer' ? 'Dr. Ananya Sharma' : 'You';
    const comment: Comment = { id: uid(), user: userName, initials: initials(userName), text: text.trim(), timestamp: ts, parentId };
    const auditEntry: AuditEntry = { id: uid(), action: 'comment', description: `${userName} added a comment`, user: userName, timestamp: ts };
    setDocuments((prev) =>
      prev.map((d) => (d.id === selectedDoc.id ? { ...d, comments: [...d.comments, comment], auditTrail: [...d.auditTrail, auditEntry] } : d))
    );
    setNewComment('');
    setReplyTo(null);
    setReplyText('');
  }

  /* ---- Signature canvas ------------------------------------------ */
  const initCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const onEnd = () => { isDrawingRef.current = false; };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);
  }, []);

  function clearCanvas() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx?.clearRect(0, 0, c.width, c.height);
  }

  function applySignature() {
    if (!selectedDoc || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const reviewer = 'Dr. Ananya Sharma';
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === selectedDoc.id
          ? {
              ...d,
              status: 'Approved' as Status,
              signature: dataUrl,
              auditTrail: [...d.auditTrail, { id: uid(), action: 'approve' as const, description: `Document approved by ${reviewer}`, user: reviewer, timestamp: ts }],
            }
          : d
      )
    );
    setShowApprovePanel(false);
  }

  function submitRejection() {
    if (!selectedDoc || !rejectReason.trim()) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const reviewer = 'Dr. Ananya Sharma';
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === selectedDoc.id
          ? {
              ...d,
              status: 'Rejected' as Status,
              rejectionReason: rejectReason,
              rejectionSeverity: rejectSeverity,
              auditTrail: [...d.auditTrail, { id: uid(), action: 'reject' as const, description: `Document rejected — ${rejectSeverity.toLowerCase()} severity`, user: reviewer, timestamp: ts }],
            }
          : d
      )
    );
    setShowRejectPanel(false);
    setRejectReason('');
    setRejectSeverity('Minor');
  }

  function submitRequestChanges() {
    if (!selectedDoc || !requestChangesComment.trim()) return;
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const reviewer = 'Dr. Ananya Sharma';
    const comment: Comment = { id: uid(), user: reviewer, initials: initials(reviewer), text: `[Changes Requested] ${requestChangesComment}`, timestamp: ts, parentId: null };
    const audit: AuditEntry = { id: uid(), action: 'request-changes', description: `${reviewer} requested changes`, user: reviewer, timestamp: ts };
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === selectedDoc.id
          ? { ...d, status: 'In Review' as Status, comments: [...d.comments, comment], auditTrail: [...d.auditTrail, audit] }
          : d
      )
    );
    setShowRequestChanges(false);
    setRequestChangesComment('');
  }

  /* ---- Bulk actions ---------------------------------------------- */
  function toggleSelectDoc(docId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((d) => d.id)));
    }
  }

  function bulkApprove() {
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const reviewer = 'Dr. Ananya Sharma';
    setDocuments((prev) =>
      prev.map((d) =>
        selectedIds.has(d.id) && d.status !== 'Draft' && d.status !== 'Approved'
          ? {
              ...d,
              status: 'Approved' as Status,
              auditTrail: [...d.auditTrail, { id: uid(), action: 'approve' as const, description: `Document bulk-approved by ${reviewer}`, user: reviewer, timestamp: ts }],
            }
          : d
      )
    );
    setSelectedIds(new Set());
  }

  function bulkReject() {
    const now = new Date();
    const ts = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    const reviewer = 'Dr. Ananya Sharma';
    setDocuments((prev) =>
      prev.map((d) =>
        selectedIds.has(d.id) && d.status !== 'Draft' && d.status !== 'Rejected'
          ? {
              ...d,
              status: 'Rejected' as Status,
              rejectionReason: 'Rejected via bulk action',
              rejectionSeverity: 'Minor' as RejectionSeverity,
              auditTrail: [...d.auditTrail, { id: uid(), action: 'reject' as const, description: `Document bulk-rejected by ${reviewer}`, user: reviewer, timestamp: ts }],
            }
          : d
      )
    );
    setSelectedIds(new Set());
  }

  /* ---- File drop ------------------------------------------------- */
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFormFile(file.name);
  }

  /* ---- Render helpers -------------------------------------------- */
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    borderColor: 'var(--border)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    color: 'var(--card-foreground)',
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ========== HEADER + ROLE TOGGLE ========== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Review &amp; Approval</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage document submissions, reviews, and approvals</p>
          </div>
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {(['Submitter', 'Reviewer'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setSelectedDocId(null); setShowApprovePanel(false); setShowRejectPanel(false); setShowRequestChanges(false); }}
                className="px-5 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: role === r ? 'var(--primary)' : 'var(--card)',
                  color: role === r ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ========== STATS DASHBOARD ========== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: stats.total, icon: FileText, color: 'var(--primary)' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#f59e0b' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#16a34a' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#dc2626' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-5" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon size={28} style={{ color: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* ========== SUBMISSION FORM (Submitter only) ========== */}
        {role === 'Submitter' && (
          <div className="rounded-xl border p-6 space-y-4" style={cardStyle}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plus size={18} style={{ color: 'var(--primary)' }} />
              Submit New Document
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Document Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Attach File</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e: any) => { if (e.target.files?.[0]) setFormFile(e.target.files[0].name); };
                  input.click();
                }}
                className="rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
                style={{
                  borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: dragOver ? 'var(--accent)' : 'var(--background)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {formFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={16} />
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{formFile}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFormFile(null); }}
                      className="ml-2 p-0.5 rounded hover:opacity-70"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Plus size={24} className="mx-auto" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-sm">Drag &amp; drop a file here, or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Describe the document purpose and any notes for reviewers..."
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              />
            </div>

            {/* Priority + Reviewers */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as Priority)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Assign Reviewers</label>
                <div className="space-y-1 rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                  {SAMPLE_REVIEWERS.map((rev) => (
                    <label key={rev.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formReviewers.includes(rev.name)}
                        onChange={(e) =>
                          setFormReviewers((prev) =>
                            e.target.checked ? [...prev, rev.name] : prev.filter((n) => n !== rev.name)
                          )
                        }
                        className="rounded"
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      {rev.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Due Date</label>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formTitle.trim()}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Send size={16} />
              Submit for Review
            </button>
          </div>
        )}

        {/* ========== MAIN GRID: table + detail panel ========== */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ---- Review Queue Table ---- */}
          <div className={`${selectedDoc ? 'lg:col-span-3' : 'lg:col-span-5'} rounded-xl border overflow-hidden`} style={cardStyle}>
            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b"
                style={{ backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'var(--border)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  <CheckSquare size={14} className="inline mr-1.5 -mt-0.5" />
                  {selectedIds.size} document{selectedIds.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={bulkApprove}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    <CheckCircle size={12} /> Bulk Approve
                  </button>
                  <button
                    onClick={bulkReject}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    <XCircle size={12} /> Bulk Reject
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                Review Queue
              </h2>
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                  style={inputStyle}
                >
                  {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--secondary)' }}>
                    <th className="px-4 py-3 w-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelectAll(); }}
                        className="flex items-center justify-center"
                        style={{ color: 'var(--secondary-foreground)' }}
                        title={selectedIds.size === sorted.length ? 'Deselect all' : 'Select all'}
                      >
                        {selectedIds.size === sorted.length && sorted.length > 0
                          ? <CheckSquare size={16} style={{ color: 'var(--primary)' }} />
                          : <Square size={16} />}
                      </button>
                    </th>
                    {([
                      ['name', 'Document Name'],
                      ['submittedBy', 'Submitted By'],
                      ['date', 'Date'],
                      ['priority', 'Priority'],
                      ['status', 'Status'],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="px-4 py-3 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                        style={{ color: 'var(--secondary-foreground)' }}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {sortKey === key ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--secondary-foreground)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((doc) => {
                    const sc = statusColor(doc.status);
                    const isSelected = selectedDocId === doc.id;
                    return (
                      <tr
                        key={doc.id}
                        className="border-t transition-colors cursor-pointer"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: isSelected ? 'var(--accent)' : undefined,
                        }}
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setShowApprovePanel(false);
                          setShowRejectPanel(false);
                          setShowRequestChanges(false);
                        }}
                      >
                        <td className="px-4 py-3 w-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelectDoc(doc.id); }}
                            className="flex items-center justify-center"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {selectedIds.has(doc.id)
                              ? <CheckSquare size={16} style={{ color: 'var(--primary)' }} />
                              : <Square size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{doc.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{doc.submittedBy}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{doc.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-semibold" style={{ color: priorityColor(doc.priority) }}>
                            {doc.priority === 'Urgent' && <AlertTriangle size={12} className="inline mr-1 -mt-0.5" />}
                            {doc.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: sc.bg, color: sc.fg }}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedDocId(doc.id); }}
                            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                            style={{ color: 'var(--primary)' }}
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                        No documents match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---- Detail Panel ---- */}
          {selectedDoc && (
            <div className="lg:col-span-2 space-y-4">
              {/* Document info */}
              <div className="rounded-xl border p-5 space-y-3" style={cardStyle}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-snug">{selectedDoc.name}</h3>
                  <button onClick={() => setSelectedDocId(null)} className="shrink-0 p-1 rounded hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                    <XCircle size={18} />
                  </button>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{selectedDoc.description}</p>
                <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="flex items-center gap-1"><User size={12} /> {selectedDoc.submittedBy}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {selectedDoc.date}</span>
                  {selectedDoc.fileName && (
                    <span className="flex items-center gap-1"><FileText size={12} /> {selectedDoc.fileName}</span>
                  )}
                  {selectedDoc.dueDate && (
                    <span className="flex items-center gap-1"><Calendar size={12} /> Due: {selectedDoc.dueDate}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: statusColor(selectedDoc.status).bg, color: statusColor(selectedDoc.status).fg }}
                  >
                    {selectedDoc.status}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: priorityColor(selectedDoc.priority) }}>
                    {selectedDoc.priority} Priority
                  </span>
                </div>
                {selectedDoc.assignedReviewers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Assigned Reviewers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDoc.assignedReviewers.map((r) => (
                        <span key={r} className="text-xs rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection info */}
                {selectedDoc.status === 'Rejected' && selectedDoc.rejectionReason && (
                  <div className="rounded-lg p-3 text-sm space-y-1" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="font-semibold text-xs" style={{ color: '#dc2626' }}>
                      Rejection — {selectedDoc.rejectionSeverity} severity
                    </p>
                    <p style={{ color: 'var(--foreground)' }}>{selectedDoc.rejectionReason}</p>
                  </div>
                )}

                {/* Signature display */}
                {selectedDoc.signature && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approval Signature</p>
                    <img src={selectedDoc.signature} alt="Signature" className="rounded-lg border h-16" style={{ borderColor: 'var(--border)' }} />
                  </div>
                )}

                {/* Compare button */}
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <GitCompare size={14} style={{ color: 'var(--primary)' }} />
                  {showComparison ? 'Hide Comparison' : 'Compare Versions'}
                </button>
              </div>

              {/* ---- Document Comparison (side-by-side diff) ---- */}
              {showComparison && (
                <div className="rounded-xl border p-5 space-y-3" style={cardStyle}>
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                    <GitCompare size={14} style={{ color: 'var(--primary)' }} />
                    Version Comparison
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left panel - Original */}
                    <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Original Version</p>
                      <div className="text-xs space-y-1 font-mono" style={{ color: 'var(--foreground)' }}>
                        <p>Title: {selectedDoc.name}</p>
                        <p style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#dc2626', padding: '2px 4px', borderRadius: '2px' }}>
                          - Budget allocation: $450,000
                        </p>
                        <p>Department: Operations</p>
                        <p style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#dc2626', padding: '2px 4px', borderRadius: '2px' }}>
                          - Timeline: 6 months
                        </p>
                        <p>Priority: {selectedDoc.priority}</p>
                      </div>
                    </div>
                    {/* Right panel - Current */}
                    <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Current Version</p>
                      <div className="text-xs space-y-1 font-mono" style={{ color: 'var(--foreground)' }}>
                        <p>Title: {selectedDoc.name}</p>
                        <p style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a', padding: '2px 4px', borderRadius: '2px' }}>
                          + Budget allocation: $520,000
                        </p>
                        <p>Department: Operations</p>
                        <p style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a', padding: '2px 4px', borderRadius: '2px' }}>
                          + Timeline: 8 months
                        </p>
                        <p>Priority: {selectedDoc.priority}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    2 changes detected between versions
                  </p>
                </div>
              )}

              {/* ---- Approval Workflow Builder ---- */}
              <div className="rounded-xl border p-5 space-y-3" style={cardStyle}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                  <ArrowRight size={14} style={{ color: 'var(--primary)' }} />
                  Approval Workflow
                </h3>
                <div className="flex items-center justify-between">
                  {(() => {
                    const steps = [
                      { label: 'Submit', key: 'submit' },
                      { label: 'Review', key: 'review' },
                      { label: 'Approve', key: 'approve' },
                      { label: 'Publish', key: 'publish' },
                    ];
                    // Determine current step index based on status
                    let currentIdx = 0;
                    if (selectedDoc.status === 'Submitted') currentIdx = 1;
                    else if (selectedDoc.status === 'In Review') currentIdx = 1;
                    else if (selectedDoc.status === 'Approved') currentIdx = 3;
                    else if (selectedDoc.status === 'Rejected') currentIdx = 1;
                    else if (selectedDoc.status === 'Draft') currentIdx = 0;

                    return steps.map((step, idx) => {
                      let stepStatus: 'completed' | 'current' | 'pending' = 'pending';
                      if (selectedDoc.status === 'Rejected' && idx >= 1) {
                        stepStatus = idx === 1 ? 'current' : 'pending';
                        if (idx === 0) stepStatus = 'completed';
                      } else if (idx < currentIdx) {
                        stepStatus = 'completed';
                      } else if (idx === currentIdx) {
                        stepStatus = 'current';
                      }

                      const circleColor = stepStatus === 'completed' ? '#16a34a'
                        : stepStatus === 'current' ? 'var(--primary)'
                        : 'var(--border)';
                      const textColor = stepStatus === 'completed' ? '#16a34a'
                        : stepStatus === 'current' ? 'var(--primary)'
                        : 'var(--muted-foreground)';

                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: stepStatus === 'pending' ? 'transparent' : circleColor,
                                border: stepStatus === 'pending' ? `2px solid var(--border)` : 'none',
                                color: stepStatus === 'pending' ? 'var(--muted-foreground)' : '#fff',
                              }}
                            >
                              {stepStatus === 'completed' ? <CheckCircle size={16} color="#fff" /> : idx + 1}
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: textColor }}>
                              {step.label}
                            </span>
                            <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                              {stepStatus === 'completed' ? 'Done' : stepStatus === 'current' ? 'Current' : 'Pending'}
                            </span>
                          </div>
                          {idx < steps.length - 1 && (
                            <div
                              className="flex-1 h-0.5 mt-[-16px]"
                              style={{
                                backgroundColor: idx < currentIdx ? '#16a34a' : 'var(--border)',
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ---- Approve / Reject Panel (Reviewer only) ---- */}
              {role === 'Reviewer' && selectedDoc.status !== 'Approved' && selectedDoc.status !== 'Rejected' && selectedDoc.status !== 'Draft' && (
                <div className="rounded-xl border p-5 space-y-3" style={cardStyle}>
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                    <Edit3 size={14} style={{ color: 'var(--primary)' }} />
                    Review Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setShowApprovePanel(true); setShowRejectPanel(false); setShowRequestChanges(false); }}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => { setShowRejectPanel(true); setShowApprovePanel(false); setShowRequestChanges(false); }}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={() => { setShowRequestChanges(true); setShowApprovePanel(false); setShowRejectPanel(false); }}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#ca8a04', color: '#fff' }}
                    >
                      <Edit3 size={14} /> Request Changes
                    </button>
                  </div>

                  {/* Approve panel with signature pad */}
                  {showApprovePanel && (
                    <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <p className="text-sm font-medium">Draw your signature below</p>
                      <canvas
                        ref={(node) => { canvasRef.current = node; initCanvas(node); }}
                        width={300}
                        height={100}
                        className="rounded-lg border cursor-crosshair w-full"
                        style={{ borderColor: 'var(--border)', backgroundColor: '#fff', touchAction: 'none' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={clearCanvas}
                          className="rounded-lg border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
                          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        >
                          Clear
                        </button>
                        <button
                          onClick={applySignature}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: '#16a34a' }}
                        >
                          Apply Signature
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reject panel */}
                  {showRejectPanel && (
                    <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason for Rejection *</label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why this document is being rejected..."
                          rows={3}
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Severity</label>
                        <div className="flex gap-4">
                          {(['Minor', 'Major', 'Critical'] as RejectionSeverity[]).map((sev) => (
                            <label key={sev} className="flex items-center gap-1.5 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="severity"
                                checked={rejectSeverity === sev}
                                onChange={() => setRejectSeverity(sev)}
                                style={{ accentColor: sev === 'Critical' ? '#dc2626' : sev === 'Major' ? '#f59e0b' : '#3b82f6' }}
                              />
                              {sev}
                            </label>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={submitRejection}
                        disabled={!rejectReason.trim()}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                        style={{ backgroundColor: '#dc2626' }}
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}

                  {/* Request changes panel */}
                  {showRequestChanges && (
                    <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>What changes are needed?</label>
                        <textarea
                          value={requestChangesComment}
                          onChange={(e) => setRequestChangesComment(e.target.value)}
                          placeholder="Describe the changes required..."
                          rows={3}
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                          style={inputStyle}
                        />
                      </div>
                      <button
                        onClick={submitRequestChanges}
                        disabled={!requestChangesComment.trim()}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                        style={{ backgroundColor: '#ca8a04' }}
                      >
                        Submit Request
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Comment Thread System ---- */}
              <div className="rounded-xl border p-5 space-y-4" style={cardStyle}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                  <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                  Comments ({selectedDoc.comments.length})
                </h3>

                {/* Render top-level comments */}
                {selectedDoc.comments.filter((c) => c.parentId === null).length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No comments yet.</p>
                )}
                <div className="space-y-3">
                  {selectedDoc.comments
                    .filter((c) => c.parentId === null)
                    .map((c) => {
                      const replies = selectedDoc.comments.filter((r) => r.parentId === c.id);
                      return (
                        <div key={c.id}>
                          {/* Top-level comment */}
                          <div className="flex gap-3">
                            <div
                              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                            >
                              {c.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{c.user}</span>
                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.timestamp}</span>
                              </div>
                              <p className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>{c.text}</p>
                              <button
                                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                                className="text-xs mt-1 hover:underline"
                                style={{ color: 'var(--primary)' }}
                              >
                                Reply
                              </button>
                            </div>
                          </div>

                          {/* Replies */}
                          {replies.map((r) => (
                            <div key={r.id} className="flex gap-3 ml-11 mt-2">
                              <div
                                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
                              >
                                {r.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">{r.user}</span>
                                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.timestamp}</span>
                                </div>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{r.text}</p>
                              </div>
                            </div>
                          ))}

                          {/* Reply input */}
                          {replyTo === c.id && (
                            <div className="ml-11 mt-2 flex gap-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
                                style={inputStyle}
                                onKeyDown={(e) => { if (e.key === 'Enter') { addComment(c.id, replyText); } }}
                              />
                              <button
                                onClick={() => addComment(c.id, replyText)}
                                disabled={!replyText.trim()}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-40"
                                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Add new comment */}
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => addComment(null, newComment)}
                    disabled={!newComment.trim()}
                    className="self-end rounded-lg px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {/* ---- Audit Trail Timeline ---- */}
              <div className="rounded-xl border p-5 space-y-4" style={cardStyle}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                  <History size={14} style={{ color: 'var(--primary)' }} />
                  Audit Trail
                </h3>

                <div className="relative space-y-0">
                  {selectedDoc.auditTrail.map((entry, idx) => {
                    const Icon = auditIcon(entry.action);
                    const color = auditColor(entry.action);
                    const isLast = idx === selectedDoc.auditTrail.length - 1;
                    return (
                      <div key={entry.id} className="flex gap-3 relative pb-4">
                        {/* Vertical line */}
                        {!isLast && (
                          <div
                            className="absolute left-[11px] top-6 bottom-0 w-0.5"
                            style={{ backgroundColor: 'var(--border)' }}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center z-10"
                          style={{ backgroundColor: color }}
                        >
                          <Icon size={12} color="#fff" />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 -mt-0.5">
                          <p className="text-sm font-medium">{entry.description}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            {entry.user} &middot; {entry.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
