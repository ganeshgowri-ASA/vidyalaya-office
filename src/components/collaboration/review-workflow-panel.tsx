"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import {
  useCollaborationStore,
  type ReviewStatus,
} from "@/store/collaboration-store";

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "#6b7280", icon: <Clock size={14} /> },
  pending_review: { label: "Pending Review", color: "#f59e0b", icon: <Clock size={14} /> },
  approved: { label: "Approved", color: "#22c55e", icon: <CheckCircle2 size={14} /> },
  rejected: { label: "Rejected", color: "#ef4444", icon: <XCircle size={14} /> },
  changes_requested: { label: "Changes Requested", color: "#f97316", icon: <AlertTriangle size={14} /> },
};

export function ReviewWorkflowPanel() {
  const {
    showReviewPanel,
    toggleReviewPanel,
    reviewRequest,
    allUsers,
    currentUser,
    collaborators,
    submitForReview,
    approveReview,
    rejectReview,
    requestChanges,
    resetReview,
  } = useCollaborationStore();

  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [responseComment, setResponseComment] = useState("");
  const [showReviewerPicker, setShowReviewerPicker] = useState(false);

  if (!showReviewPanel) return null;

  const statusInfo = STATUS_CONFIG[reviewRequest.status];

  const handleSubmit = () => {
    if (selectedReviewers.length === 0) return;
    submitForReview(selectedReviewers, message);
    setMessage("");
    setSelectedReviewers([]);
  };

  const handleApprove = () => {
    approveReview(responseComment || undefined);
    setResponseComment("");
  };

  const handleReject = () => {
    rejectReview(responseComment || undefined);
    setResponseComment("");
  };

  const handleRequestChanges = () => {
    requestChanges(responseComment || undefined);
    setResponseComment("");
  };

  const toggleReviewer = (userId: string) => {
    setSelectedReviewers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="flex flex-col border-l flex-shrink-0"
      style={{
        width: 340,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <FileCheck size={16} style={{ color: "var(--primary)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Review Workflow
          </h3>
        </div>
        <button
          onClick={toggleReviewPanel}
          className="rounded p-1 hover:bg-[var(--muted)]"
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Status banner */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{
          borderColor: "var(--border)",
          backgroundColor: `${statusInfo.color}15`,
        }}
      >
        <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>
        <span className="text-xs font-semibold" style={{ color: statusInfo.color }}>
          {statusInfo.label}
        </span>
        {reviewRequest.submittedAt && (
          <span className="text-[10px] ml-auto" style={{ color: "var(--muted-foreground)" }}>
            {formatTime(reviewRequest.submittedAt)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Draft state - Submit for review */}
        {reviewRequest.status === "draft" && (
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--foreground)" }}>
                Select Reviewers
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowReviewerPicker(!showReviewerPicker)}
                  className="w-full flex items-center justify-between rounded border px-3 py-2 text-xs"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: selectedReviewers.length > 0 ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {selectedReviewers.length > 0
                    ? `${selectedReviewers.length} reviewer${selectedReviewers.length > 1 ? "s" : ""} selected`
                    : "Choose reviewers..."}
                  <ChevronDown size={12} />
                </button>

                {showReviewerPicker && (
                  <div
                    className="absolute top-full left-0 mt-1 w-full rounded-lg border shadow-lg py-1 z-10 max-h-40 overflow-y-auto"
                    style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  >
                    {collaborators.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleReviewer(user.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--muted)]"
                        style={{ color: "var(--foreground)" }}
                      >
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selectedReviewers.includes(user.id) ? "" : ""
                          }`}
                          style={{
                            borderColor: selectedReviewers.includes(user.id) ? "var(--primary)" : "var(--border)",
                            backgroundColor: selectedReviewers.includes(user.id) ? "var(--primary)" : "transparent",
                          }}
                        >
                          {selectedReviewers.includes(user.id) && (
                            <CheckCircle2 size={10} className="text-white" />
                          )}
                        </div>
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name[0]}
                        </div>
                        <span>{user.name}</span>
                        {user.isOnline && (
                          <span className="h-2 w-2 rounded-full bg-green-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected reviewers chips */}
              {selectedReviewers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedReviewers.map((id) => {
                    const user = allUsers.find((u) => u.id === id);
                    if (!user) return null;
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
                        style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
                      >
                        <span
                          className="h-3 w-3 rounded-full flex items-center justify-center text-[6px] font-bold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name[0]}
                        </span>
                        {user.name}
                        <button
                          onClick={() => toggleReviewer(id)}
                          className="ml-0.5 hover:opacity-70"
                        >
                          <X size={8} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--foreground)" }}>
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for reviewers..."
                className="w-full rounded border p-2 text-xs outline-none resize-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                rows={3}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedReviewers.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Send size={12} />
              Submit for Review
            </button>
          </div>
        )}

        {/* Pending review / Active review */}
        {reviewRequest.status !== "draft" && (
          <div className="p-4 space-y-4">
            {/* Submitted info */}
            {reviewRequest.message && (
              <div
                className="rounded p-2.5 text-xs border-l-2"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  borderLeftColor: "var(--primary)",
                }}
              >
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Review message:
                </div>
                {reviewRequest.message}
              </div>
            )}

            {/* Reviewer statuses */}
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                Reviewers
              </h4>
              <div className="space-y-2">
                {reviewRequest.reviewers.map((reviewer) => {
                  const rStatus = STATUS_CONFIG[reviewer.status === "pending" ? "pending_review" : reviewer.status];
                  return (
                    <div
                      key={reviewer.user.id}
                      className="flex items-start gap-2 rounded p-2"
                      style={{ backgroundColor: "var(--muted)" }}
                    >
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: reviewer.user.color }}
                      >
                        {reviewer.user.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                            {reviewer.user.name}
                          </span>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                            style={{ backgroundColor: `${rStatus.color}20`, color: rStatus.color }}
                          >
                            {reviewer.status === "pending" ? "Pending" : rStatus.label}
                          </span>
                        </div>
                        {reviewer.comment && (
                          <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                            {reviewer.comment}
                          </p>
                        )}
                        {reviewer.respondedAt && (
                          <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {formatTime(reviewer.respondedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviewer actions (when current user is a reviewer) */}
            {reviewRequest.status === "pending_review" &&
              reviewRequest.reviewers.some(
                (r) => r.user.id === currentUser.id && r.status === "pending"
              ) && (
                <div className="space-y-2">
                  <label className="text-xs font-medium block" style={{ color: "var(--foreground)" }}>
                    Your Response
                  </label>
                  <textarea
                    value={responseComment}
                    onChange={(e) => setResponseComment(e.target.value)}
                    placeholder="Add a comment (optional)..."
                    className="w-full rounded border p-2 text-xs outline-none resize-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-medium text-white"
                      style={{ backgroundColor: "#22c55e" }}
                    >
                      <CheckCircle2 size={12} />
                      Approve
                    </button>
                    <button
                      onClick={handleRequestChanges}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-medium text-white"
                      style={{ backgroundColor: "#f97316" }}
                    >
                      <AlertTriangle size={12} />
                      Changes
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-medium text-white"
                      style={{ backgroundColor: "#ef4444" }}
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

            {/* Reset / resubmit */}
            {(reviewRequest.status === "approved" ||
              reviewRequest.status === "rejected" ||
              reviewRequest.status === "changes_requested") && (
              <button
                onClick={resetReview}
                className="w-full flex items-center justify-center gap-2 rounded border px-4 py-2 text-xs font-medium hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <RotateCcw size={12} />
                Reset & Resubmit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReviewStatusBadge() {
  const { reviewRequest, toggleReviewPanel, showReviewPanel } = useCollaborationStore();

  if (reviewRequest.status === "draft") return null;

  const statusInfo = STATUS_CONFIG[reviewRequest.status];

  return (
    <button
      onClick={toggleReviewPanel}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors ${
        showReviewPanel ? "bg-[var(--accent)]" : "hover:bg-[var(--muted)]"
      }`}
      title="Review Status"
    >
      <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>
      <span className="hidden sm:inline text-[10px] font-medium" style={{ color: statusInfo.color }}>
        {statusInfo.label}
      </span>
    </button>
  );
}
