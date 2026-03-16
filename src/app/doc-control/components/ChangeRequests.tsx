"use client";

import React, { useState } from "react";
import { Plus, X, ChevronRight, CheckCircle2, AlertCircle, Clock, XCircle, Send } from "lucide-react";

export interface ChangeRequest {
  id: string;
  crId: string;
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

const CR_STATUSES = ["Draft", "Submitted", "Review", "Approved", "Implemented", "Rejected"] as const;
const CHANGE_TYPES = ["New", "Revision", "Obsolete"] as const;

const STATUS_COLORS: Record<string, string> = {
  Draft: "#6b7280", Submitted: "#3b82f6", Review: "#f59e0b",
  Approved: "#10b981", Implemented: "#10b981", Rejected: "#ef4444",
};

function StatusStepper({ status }: { status: string }) {
  const steps = ["Draft", "Submitted", "Review", "Approved", "Implemented"];
  const rejected = status === "Rejected";
  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = i <= currentIdx && !rejected;
        const active = i === currentIdx && !rejected;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  backgroundColor: done ? STATUS_COLORS[step] || "#10b981" : rejected && i === 2 ? "#ef4444" : "var(--muted)",
                  color: done || (rejected && i === 2) ? "white" : "var(--muted-foreground)",
                  border: active ? "2px solid var(--primary)" : "none",
                }}
              >
                {done ? "✓" : rejected && i === 2 ? "✗" : i + 1}
              </div>
              <span className="text-[8px] mt-0.5" style={{ color: done ? "var(--foreground)" : "var(--muted-foreground)" }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-0.5 mb-3" style={{ backgroundColor: i < currentIdx && !rejected ? "#10b981" : "var(--muted)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface Props {
  changeRequests: ChangeRequest[];
  setChangeRequests: (crs: ChangeRequest[]) => void;
  docNames: { id: string; name: string }[];
  onAudit: (action: string, docName: string, details: string) => void;
}

export default function ChangeRequests({ changeRequests, setChangeRequests, docNames, onAudit }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  const [formDocId, setFormDocId] = useState("");
  const [formType, setFormType] = useState<"New" | "Revision" | "Obsolete">("Revision");
  const [formReason, setFormReason] = useState("");
  const [formSections, setFormSections] = useState("");
  const [formApprover, setFormApprover] = useState("QA Manager");
  const [commentText, setCommentText] = useState("");

  const createCR = () => {
    if (!formDocId || !formReason.trim()) return;
    const doc = docNames.find((d) => d.id === formDocId);
    const num = changeRequests.length + 1;
    const cr: ChangeRequest = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      crId: `CR-${new Date().getFullYear()}-${String(num).padStart(3, "0")}`,
      documentId: formDocId,
      documentName: doc?.name || "Unknown",
      changeType: formType,
      reason: formReason,
      affectedSections: formSections,
      requestor: "Current User",
      approver: formApprover,
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      comments: [],
    };
    const updated = [...changeRequests, cr];
    setChangeRequests(updated);
    onAudit("Change Request Created", cr.documentName, `CR ${cr.crId} created for ${cr.changeType}`);
    setShowForm(false);
    setFormReason("");
    setFormSections("");
  };

  const advanceStatus = (cr: ChangeRequest, newStatus: ChangeRequest["status"]) => {
    const updated = changeRequests.map((c) =>
      c.id === cr.id ? { ...c, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] } : c
    );
    setChangeRequests(updated);
    setSelectedCR({ ...cr, status: newStatus });
    onAudit("CR Status Changed", cr.documentName, `${cr.crId}: ${cr.status} → ${newStatus}`);
  };

  const addComment = () => {
    if (!selectedCR || !commentText.trim()) return;
    const comment = { author: "Current User", text: commentText, date: new Date().toISOString().split("T")[0] };
    const updated = changeRequests.map((c) =>
      c.id === selectedCR.id ? { ...c, comments: [...c.comments, comment] } : c
    );
    setChangeRequests(updated);
    setSelectedCR({ ...selectedCR, comments: [...selectedCR.comments, comment] });
    setCommentText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Change Requests</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>
          <Plus size={12} /> New Change Request
        </button>
      </div>

      {/* New CR Form */}
      {showForm && (
        <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>New Change Request</span>
            <button onClick={() => setShowForm(false)}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Document</label>
              <select value={formDocId} onChange={(e) => setFormDocId(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="">Select document...</option>
                {docNames.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Change Type</label>
              <div className="flex gap-2">
                {CHANGE_TYPES.map((t) => (
                  <label key={t} className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] cursor-pointer ${formType === t ? "border-[var(--primary)]" : ""}`} style={{ borderColor: formType === t ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}>
                    <input type="radio" name="crType" checked={formType === t} onChange={() => setFormType(t)} className="hidden" />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Reason for Change</label>
            <textarea value={formReason} onChange={(e) => setFormReason(e.target.value)} rows={2} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} placeholder="Describe the reason for this change..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Affected Sections</label>
              <input value={formSections} onChange={(e) => setFormSections(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} placeholder="e.g., Section 3, Appendix A" />
            </div>
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Approver</label>
              <select value={formApprover} onChange={(e) => setFormApprover(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                {["QA Manager", "Department Head", "VP Engineering", "CTO", "Compliance Officer"].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <button onClick={createCR} className="px-3 py-1.5 rounded text-xs text-white" style={{ backgroundColor: "var(--primary)" }}>Create Change Request</button>
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
              <tr key={cr.id} className="border-t hover:bg-[var(--muted)] cursor-pointer" style={{ borderColor: "var(--border)" }} onClick={() => setSelectedCR(cr)}>
                <td className="px-3 py-2 font-mono" style={{ color: "var(--primary)" }}>{cr.crId}</td>
                <td className="px-3 py-2" style={{ color: "var(--foreground)" }}>{cr.documentName}</td>
                <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>{cr.changeType}</span></td>
                <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{cr.requestor}</td>
                <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: STATUS_COLORS[cr.status] }}>{cr.status}</span></td>
                <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>{cr.createdAt}</td>
              </tr>
            ))}
            {changeRequests.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>No change requests yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CR Detail Modal */}
      {selectedCR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedCR(null)}>
          <div className="w-[600px] max-h-[80vh] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>{selectedCR.crId}</span>
                <h2 className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{selectedCR.documentName}</h2>
              </div>
              <button onClick={() => setSelectedCR(null)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
              <StatusStepper status={selectedCR.status} />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Change Type</label><div style={{ color: "var(--foreground)" }}>{selectedCR.changeType}</div></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Approver</label><div style={{ color: "var(--foreground)" }}>{selectedCR.approver}</div></div>
                <div className="col-span-2"><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Reason</label><div style={{ color: "var(--foreground)" }}>{selectedCR.reason}</div></div>
                {selectedCR.affectedSections && <div className="col-span-2"><label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Affected Sections</label><div style={{ color: "var(--foreground)" }}>{selectedCR.affectedSections}</div></div>}
              </div>
              {/* Comments */}
              <div>
                <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Comments</h3>
                <div className="space-y-2">
                  {selectedCR.comments.map((c, i) => (
                    <div key={i} className="rounded border p-2" style={{ borderColor: "var(--border)" }}>
                      <div className="flex justify-between text-[10px]" style={{ color: "var(--muted-foreground)" }}><span>{c.author}</span><span>{c.date}</span></div>
                      <div className="text-xs mt-1" style={{ color: "var(--foreground)" }}>{c.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded border px-2 py-1.5 text-xs bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <button onClick={addComment} className="px-2 py-1.5 rounded text-xs text-white" style={{ backgroundColor: "var(--primary)" }}><Send size={10} /></button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              {selectedCR.status === "Draft" && <button onClick={() => advanceStatus(selectedCR, "Submitted")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#3b82f6" }}><Send size={10} /> Submit</button>}
              {selectedCR.status === "Submitted" && <button onClick={() => advanceStatus(selectedCR, "Review")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#f59e0b" }}><Clock size={10} /> Start Review</button>}
              {selectedCR.status === "Review" && (
                <>
                  <button onClick={() => advanceStatus(selectedCR, "Rejected")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-red-500 text-red-400"><XCircle size={10} /> Reject</button>
                  <button onClick={() => advanceStatus(selectedCR, "Approved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#10b981" }}><CheckCircle2 size={10} /> Approve</button>
                </>
              )}
              {selectedCR.status === "Approved" && <button onClick={() => advanceStatus(selectedCR, "Implemented")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: "#10b981" }}><CheckCircle2 size={10} /> Mark Implemented</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
