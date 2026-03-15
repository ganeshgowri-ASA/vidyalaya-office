"use client";

import React, { useState } from "react";
import {
  X,
  MessageSquarePlus,
  Check,
  Reply,
  Trash2,
  User,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function CommentsSidebar() {
  const {
    showComments,
    toggleComments,
    comments,
    addComment,
    resolveComment,
    deleteComment,
    addReply,
  } = useDocumentStore();

  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  if (!showComments) return null;

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    addComment({
      id: Date.now().toString(),
      author: "You",
      text: newCommentText.trim(),
      timestamp: new Date().toLocaleString(),
      resolved: false,
      replies: [],
    });
    setNewCommentText("");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addReply(commentId, {
      id: Date.now().toString(),
      author: "You",
      text: replyText.trim(),
      timestamp: new Date().toLocaleString(),
    });
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div
      className="flex flex-col border-l flex-shrink-0"
      style={{
        width: 320,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Comments
        </h3>
        <button
          onClick={toggleComments}
          className="rounded p-1 hover:bg-[var(--muted)]"
          title="Close Comments"
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Add comment */}
      <div className="border-b p-3" style={{ borderColor: "var(--border)" }}>
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded border p-2 text-xs outline-none resize-none"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) handleAddComment();
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={!newCommentText.trim()}
          className="mt-2 flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--accent-foreground)",
          }}
        >
          <MessageSquarePlus size={13} />
          Add Comment
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto">
        {comments.length === 0 && (
          <div
            className="p-6 text-center text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            No comments yet. Add a comment to get started.
          </div>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-b p-3"
            style={{
              borderColor: "var(--border)",
              opacity: comment.resolved ? 0.6 : 1,
            }}
          >
            {/* Comment header */}
            <div className="flex items-start gap-2">
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <User
                  size={14}
                  style={{ color: "var(--accent-foreground)" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {comment.author}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {comment.timestamp}
                  </span>
                </div>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{
                    color: "var(--foreground)",
                    textDecoration: comment.resolved
                      ? "line-through"
                      : "none",
                  }}
                >
                  {comment.text}
                </p>
                {comment.resolved && (
                  <span
                    className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    Resolved
                  </span>
                )}
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-9 mt-2 space-y-2">
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded p-2"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {reply.author}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {reply.timestamp}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 text-[11px] leading-relaxed"
                      style={{ color: "var(--foreground)" }}
                    >
                      {reply.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="ml-9 mt-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full rounded border p-2 text-[11px] outline-none resize-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  rows={2}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) handleAddReply(comment.id);
                  }}
                />
                <div className="mt-1 flex gap-1">
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="rounded px-2 py-1 text-[10px] font-medium disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    className="rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="ml-9 mt-2 flex items-center gap-1">
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                style={{ color: "var(--muted-foreground)" }}
                title="Reply"
              >
                <Reply size={11} />
                Reply
              </button>
              <button
                onClick={() => resolveComment(comment.id)}
                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                style={{ color: "var(--muted-foreground)" }}
                title={comment.resolved ? "Unresolve" : "Resolve"}
              >
                <Check size={11} />
                {comment.resolved ? "Unresolve" : "Resolve"}
              </button>
              <button
                onClick={() => deleteComment(comment.id)}
                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                style={{ color: "var(--muted-foreground)" }}
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
