"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  MessageSquarePlus,
  Check,
  Reply,
  Trash2,
  Filter,
  CheckCircle,
  Circle,
  AtSign,
  RotateCcw,
  Send,
} from "lucide-react";
import {
  useCollaborationStore,
  type CollabComment,
  type CollabReply,
  type CommentMention,
} from "@/store/collaboration-store";

export function CollabCommentsSidebar() {
  const {
    showCollabComments,
    toggleCollabComments,
    collabComments,
    addCollabComment,
    resolveCollabComment,
    unresolveCollabComment,
    deleteCollabComment,
    addCollabReply,
    commentFilter,
    setCommentFilter,
    currentUser,
    allUsers,
  } = useCollaborationStore();

  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeInput, setActiveInput] = useState<"new" | "reply">("new");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  if (!showCollabComments) return null;

  const filteredComments = collabComments.filter((c) => {
    if (commentFilter === "open") return !c.resolved;
    if (commentFilter === "resolved") return c.resolved;
    return true;
  });

  const extractMentions = (text: string): CommentMention[] => {
    const mentions: CommentMention[] = [];
    const regex = /@(\w[\w\s]*?)(?=\s@|\s[^@]|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const user = allUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
      if (user) {
        mentions.push({ userId: user.id, name: user.name });
      }
    }
    return mentions;
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const mentions = extractMentions(newCommentText);
    addCollabComment({
      id: `comment-${Date.now()}`,
      author: currentUser,
      text: newCommentText.trim(),
      mentions,
      timestamp: new Date().toISOString(),
      resolved: false,
      replies: [],
    });
    setNewCommentText("");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    const mentions = extractMentions(replyText);
    addCollabReply(commentId, {
      id: `reply-${Date.now()}`,
      author: currentUser,
      text: replyText.trim(),
      mentions,
      timestamp: new Date().toISOString(),
    });
    setReplyText("");
    setReplyingTo(null);
  };

  const handleMentionInsert = (name: string) => {
    const ref = activeInput === "new" ? textareaRef : replyRef;
    const setText = activeInput === "new" ? setNewCommentText : setReplyText;
    const text = activeInput === "new" ? newCommentText : replyText;

    const beforeMention = text.slice(0, text.lastIndexOf("@"));
    setText(`${beforeMention}@${name} `);
    setShowMentions(false);
    setMentionQuery("");
    ref.current?.focus();
  };

  const handleTextChange = (
    value: string,
    setter: (v: string) => void,
    inputType: "new" | "reply"
  ) => {
    setter(value);
    setActiveInput(inputType);

    const lastAt = value.lastIndexOf("@");
    if (lastAt >= 0) {
      const afterAt = value.slice(lastAt + 1);
      if (!afterAt.includes(" ") || afterAt.length < 15) {
        setShowMentions(true);
        setMentionQuery(afterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const filteredMentionUsers = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderMentionText = (text: string) => {
    const parts = text.split(/(@\w[\w\s]*?)(?=\s@|\s[^@]|$)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const name = part.slice(1).trim();
        const isUser = allUsers.some(
          (u) => u.name.toLowerCase() === name.toLowerCase()
        );
        if (isUser) {
          return (
            <span
              key={i}
              className="rounded px-1 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: "var(--accent)", color: "var(--primary)" }}
            >
              {part}
            </span>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
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
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Comments
          </h3>
          <span
            className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            {filteredComments.length}
          </span>
        </div>
        <button
          onClick={toggleCollabComments}
          className="rounded p-1 hover:bg-[var(--muted)]"
          title="Close Comments"
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Filter tabs */}
      <div
        className="flex border-b px-2 py-1 gap-1"
        style={{ borderColor: "var(--border)" }}
      >
        {(["all", "open", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setCommentFilter(f)}
            className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
              commentFilter === f ? "bg-[var(--accent)]" : "hover:bg-[var(--muted)]"
            }`}
            style={{
              color:
                commentFilter === f
                  ? "var(--accent-foreground)"
                  : "var(--muted-foreground)",
            }}
          >
            {f === "all" ? "All" : f === "open" ? "Open" : "Resolved"}
          </button>
        ))}
      </div>

      {/* Add comment */}
      <div className="border-b p-3" style={{ borderColor: "var(--border)" }}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newCommentText}
            onChange={(e) =>
              handleTextChange(e.target.value, setNewCommentText, "new")
            }
            placeholder="Add a comment... Use @ to mention"
            className="w-full rounded border p-2 text-xs outline-none resize-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddComment();
            }}
          />
          {showMentions && activeInput === "new" && (
            <MentionDropdown
              users={filteredMentionUsers}
              onSelect={handleMentionInsert}
              onClose={() => setShowMentions(false)}
            />
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
            style={{
              backgroundColor: "var(--primary)",
              color: "white",
            }}
          >
            <Send size={12} />
            Comment
          </button>
          <button
            onClick={() => {
              setNewCommentText(newCommentText + "@");
              setShowMentions(true);
              setActiveInput("new");
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1 rounded px-2 py-1.5 text-[10px] hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
            title="Mention someone"
          >
            <AtSign size={12} />
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto">
        {filteredComments.length === 0 && (
          <div
            className="p-6 text-center text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {commentFilter === "all"
              ? "No comments yet. Start a conversation!"
              : `No ${commentFilter} comments.`}
          </div>
        )}
        {filteredComments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            replyingTo={replyingTo}
            replyText={replyText}
            onReplyTextChange={(v) =>
              handleTextChange(v, setReplyText, "reply")
            }
            onStartReply={(id) => {
              setReplyingTo(id);
              setReplyText("");
            }}
            onCancelReply={() => {
              setReplyingTo(null);
              setReplyText("");
            }}
            onSubmitReply={handleAddReply}
            onResolve={resolveCollabComment}
            onUnresolve={unresolveCollabComment}
            onDelete={deleteCollabComment}
            formatTime={formatTime}
            renderMentionText={renderMentionText}
            showMentions={showMentions && activeInput === "reply"}
            filteredMentionUsers={filteredMentionUsers}
            onMentionInsert={handleMentionInsert}
            onCloseMentions={() => setShowMentions(false)}
            replyRef={replyRef}
          />
        ))}
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  replyingTo,
  replyText,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onResolve,
  onUnresolve,
  onDelete,
  formatTime,
  renderMentionText,
  showMentions,
  filteredMentionUsers,
  onMentionInsert,
  onCloseMentions,
  replyRef,
}: {
  comment: CollabComment;
  replyingTo: string | null;
  replyText: string;
  onReplyTextChange: (v: string) => void;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (commentId: string) => void;
  onResolve: (id: string) => void;
  onUnresolve: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (iso: string) => string;
  renderMentionText: (text: string) => React.ReactNode;
  showMentions: boolean;
  filteredMentionUsers: { id: string; name: string; color: string }[];
  onMentionInsert: (name: string) => void;
  onCloseMentions: () => void;
  replyRef: React.MutableRefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div
      className="border-b p-3"
      style={{
        borderColor: "var(--border)",
        opacity: comment.resolved ? 0.7 : 1,
      }}
    >
      {/* Selected text context */}
      {comment.selectedText && (
        <div
          className="mb-2 rounded px-2 py-1 text-[10px] italic border-l-2"
          style={{
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
            borderLeftColor: comment.author.color,
          }}
        >
          &ldquo;{comment.selectedText}&rdquo;
        </div>
      )}

      {/* Comment header */}
      <div className="flex items-start gap-2">
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: comment.author.color }}
        >
          {comment.author.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {comment.author.name}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {formatTime(comment.timestamp)}
            </span>
          </div>
          <div
            className="mt-1 text-xs leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {renderMentionText(comment.text)}
          </div>
          {comment.resolved && (
            <div className="mt-1 flex items-center gap-1">
              <CheckCircle size={10} className="text-green-500" />
              <span
                className="text-[10px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Resolved by {comment.resolvedBy}
              </span>
            </div>
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
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ backgroundColor: reply.author.color }}
                >
                  {reply.author.name[0]}
                </div>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {reply.author.name}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatTime(reply.timestamp)}
                </span>
              </div>
              <div
                className="mt-0.5 ml-7 text-[11px] leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                {renderMentionText(reply.text)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="ml-9 mt-2 relative">
          <textarea
            ref={replyRef}
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Write a reply... Use @ to mention"
            className="w-full rounded border p-2 text-[11px] outline-none resize-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                onSubmitReply(comment.id);
            }}
          />
          {showMentions && (
            <MentionDropdown
              users={filteredMentionUsers}
              onSelect={onMentionInsert}
              onClose={onCloseMentions}
            />
          )}
          <div className="mt-1 flex gap-1">
            <button
              onClick={() => onSubmitReply(comment.id)}
              disabled={!replyText.trim()}
              className="rounded px-2 py-1 text-[10px] font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Reply
            </button>
            <button
              onClick={onCancelReply}
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
            replyingTo === comment.id
              ? onCancelReply()
              : onStartReply(comment.id)
          }
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
          style={{ color: "var(--muted-foreground)" }}
          title="Reply"
        >
          <Reply size={11} />
          Reply
        </button>
        <button
          onClick={() =>
            comment.resolved
              ? onUnresolve(comment.id)
              : onResolve(comment.id)
          }
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
          style={{
            color: comment.resolved ? "var(--primary)" : "var(--muted-foreground)",
          }}
          title={comment.resolved ? "Reopen" : "Resolve"}
        >
          {comment.resolved ? <RotateCcw size={11} /> : <Check size={11} />}
          {comment.resolved ? "Reopen" : "Resolve"}
        </button>
        <button
          onClick={() => onDelete(comment.id)}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
          style={{ color: "var(--muted-foreground)" }}
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

function MentionDropdown({
  users,
  onSelect,
  onClose,
}: {
  users: { id: string; name: string; color: string }[];
  onSelect: (name: string) => void;
  onClose: () => void;
}) {
  if (users.length === 0) return null;

  return (
    <div
      className="absolute bottom-full left-0 z-50 mb-1 w-48 rounded-lg border shadow-lg py-1 max-h-32 overflow-y-auto"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelect(user.name)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
          style={{ color: "var(--foreground)" }}
        >
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.name[0]}
          </div>
          {user.name}
        </button>
      ))}
    </div>
  );
}
