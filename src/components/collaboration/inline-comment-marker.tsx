"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquarePlus,
  Send,
  X,
  AtSign,
} from "lucide-react";
import {
  useCollaborationStore,
  type CommentMention,
  type InlinePosition,
  type CollabComment,
} from "@/store/collaboration-store";

export function InlineCommentLayer() {
  const {
    collabComments,
    activeInlineCommentId,
    setActiveInlineComment,
    setShowCollabComments,
    inlineComments,
  } = useCollaborationStore();

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [pendingPosition, setPendingPosition] = useState<InlinePosition | null>(null);

  const inlineList = inlineComments();

  const handleEditorMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const range = selection.getRangeAt(0);
    const editorEl = document.getElementById("doc-editor");
    if (!editorEl || !editorEl.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();

    // Find paragraph index
    const paragraphs = editorEl.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, li");
    let paragraphIndex = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].contains(range.startContainer)) {
        paragraphIndex = i;
        break;
      }
    }

    const selectedText = selection.toString().trim();
    setPendingPosition({
      paragraphIndex,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      selectedText,
    });

    setPopupPosition({
      top: rect.bottom - editorRect.top + 8,
      left: rect.left - editorRect.left + rect.width / 2,
    });
    setShowAddPopup(true);
  };

  return (
    <>
      {/* Transparent overlay to capture text selection on the editor */}
      <div
        onMouseUp={handleEditorMouseUp}
        className="absolute inset-0 pointer-events-none z-[5]"
      />

      {/* Inline comment markers (gutter indicators) */}
      {inlineList.map((comment) => (
        <InlineMarker
          key={comment.id}
          comment={comment}
          isActive={activeInlineCommentId === comment.id}
          onClick={() => {
            setActiveInlineComment(
              activeInlineCommentId === comment.id ? null : comment.id
            );
          }}
          onViewInPanel={() => {
            setActiveInlineComment(comment.id);
            setShowCollabComments(true);
          }}
        />
      ))}

      {/* Active inline comment popover */}
      {activeInlineCommentId && (
        <InlineCommentPopover
          commentId={activeInlineCommentId}
          onClose={() => setActiveInlineComment(null)}
        />
      )}

      {/* Add comment popup on text selection */}
      {showAddPopup && pendingPosition && (
        <AddInlineCommentPopup
          position={popupPosition}
          inlinePosition={pendingPosition}
          onClose={() => {
            setShowAddPopup(false);
            setPendingPosition(null);
          }}
        />
      )}
    </>
  );
}

function InlineMarker({
  comment,
  isActive,
  onClick,
  onViewInPanel,
}: {
  comment: CollabComment;
  isActive: boolean;
  onClick: () => void;
  onViewInPanel: () => void;
}) {
  const markerRef = useRef<HTMLDivElement>(null);
  const [markerTop, setMarkerTop] = useState<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!comment.inlinePosition) return;
      const editorEl = document.getElementById("doc-editor");
      if (!editorEl) return;

      const paragraphs = editorEl.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, li");
      const para = paragraphs[comment.inlinePosition.paragraphIndex];
      if (!para) return;

      const editorRect = editorEl.getBoundingClientRect();
      const paraRect = para.getBoundingClientRect();
      setMarkerTop(paraRect.top - editorRect.top + paraRect.height / 2 - 10);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 2000);
    return () => clearInterval(interval);
  }, [comment.inlinePosition]);

  if (markerTop === null) return null;

  return (
    <div
      ref={markerRef}
      className="absolute right-2 z-10 cursor-pointer group"
      style={{ top: markerTop }}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium shadow-sm border transition-all"
        style={{
          backgroundColor: isActive ? "var(--primary)" : comment.resolved ? "var(--muted)" : "var(--accent)",
          borderColor: isActive ? "var(--primary)" : "var(--border)",
          color: isActive ? "white" : comment.resolved ? "var(--muted-foreground)" : "var(--accent-foreground)",
        }}
        title={`Comment by ${comment.author.name}: "${comment.text.slice(0, 50)}..."`}
      >
        <div
          className="h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
          style={{ backgroundColor: comment.author.color }}
        >
          {comment.author.name[0]}
        </div>
        {!comment.resolved && (
          <span className="max-w-[60px] truncate hidden group-hover:inline">
            {comment.replies.length > 0 ? `${comment.replies.length + 1}` : "1"}
          </span>
        )}
      </button>
    </div>
  );
}

function InlineCommentPopover({
  commentId,
  onClose,
}: {
  commentId: string;
  onClose: () => void;
}) {
  const {
    collabComments,
    resolveCollabComment,
    unresolveCollabComment,
    addCollabReply,
    currentUser,
    allUsers,
  } = useCollaborationStore();
  const [replyText, setReplyText] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const comment = collabComments.find((c) => c.id === commentId);
  if (!comment || !comment.inlinePosition) return null;

  // Position the popover based on the paragraph
  const editorEl = typeof document !== "undefined" ? document.getElementById("doc-editor") : null;
  let topPos = 100;
  if (editorEl) {
    const paragraphs = editorEl.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, li");
    const para = paragraphs[comment.inlinePosition.paragraphIndex];
    if (para) {
      const editorRect = editorEl.getBoundingClientRect();
      const paraRect = para.getBoundingClientRect();
      topPos = paraRect.top - editorRect.top;
    }
  }

  const extractMentions = (text: string): CommentMention[] => {
    const mentions: CommentMention[] = [];
    const regex = /@(\w[\w\s]*?)(?=\s@|\s[^@]|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const user = allUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
      if (user) mentions.push({ userId: user.id, name: user.name });
    }
    return mentions;
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    addCollabReply(commentId, {
      id: `reply-${Date.now()}`,
      author: currentUser,
      text: replyText.trim(),
      mentions: extractMentions(replyText),
      timestamp: new Date().toISOString(),
    });
    setReplyText("");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-14 z-20 w-72 rounded-lg border shadow-xl"
      style={{
        top: topPos,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ backgroundColor: comment.author.color }}
          >
            {comment.author.name[0]}
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            {comment.author.name}
          </span>
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {formatTime(comment.timestamp)}
          </span>
        </div>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-[var(--muted)]">
          <X size={12} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Selected text context */}
      {comment.selectedText && (
        <div
          className="mx-3 mt-2 rounded px-2 py-1 text-[10px] italic border-l-2"
          style={{
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
            borderLeftColor: comment.author.color,
          }}
        >
          &ldquo;{comment.selectedText}&rdquo;
        </div>
      )}

      {/* Comment text */}
      <div className="px-3 py-2 text-xs" style={{ color: "var(--foreground)" }}>
        {comment.text}
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="border-t px-3 py-1 space-y-1.5" style={{ borderColor: "var(--border)" }}>
          {comment.replies.map((reply) => (
            <div key={reply.id} className="rounded p-1.5" style={{ backgroundColor: "var(--muted)" }}>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ backgroundColor: reply.author.color }}
                >
                  {reply.author.name[0]}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {reply.author.name}
                </span>
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                  {formatTime(reply.timestamp)}
                </span>
              </div>
              <div className="ml-5.5 text-[10px] mt-0.5" style={{ color: "var(--foreground)" }}>
                {reply.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions & Reply */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => comment.resolved ? unresolveCollabComment(commentId) : resolveCollabComment(commentId)}
            className="rounded px-2 py-1 text-[10px] font-medium hover:bg-[var(--muted)]"
            style={{ color: comment.resolved ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            {comment.resolved ? "Reopen" : "Resolve"}
          </button>
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply..."
            className="flex-1 rounded border px-2 py-1 text-[10px] outline-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim()}
            className="rounded p-1 disabled:opacity-40"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            <Send size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddInlineCommentPopup({
  position,
  inlinePosition,
  onClose,
}: {
  position: { top: number; left: number };
  inlinePosition: InlinePosition;
  onClose: () => void;
}) {
  const { addInlineComment, allUsers, currentUser } = useCollaborationStore();
  const [text, setText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const extractMentions = (t: string): CommentMention[] => {
    const mentions: CommentMention[] = [];
    const regex = /@(\w[\w\s]*?)(?=\s@|\s[^@]|$)/g;
    let match;
    while ((match = regex.exec(t)) !== null) {
      const name = match[1].trim();
      const user = allUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
      if (user) mentions.push({ userId: user.id, name: user.name });
    }
    return mentions;
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    addInlineComment(text.trim(), extractMentions(text), inlinePosition);
    onClose();
  };

  const handleTextChange = (value: string) => {
    setText(value);
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

  const filteredUsers = allUsers.filter(
    (u) => u.id !== currentUser.id && u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleMentionInsert = (name: string) => {
    const beforeMention = text.slice(0, text.lastIndexOf("@"));
    setText(`${beforeMention}@${name} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={popupRef}
      className="absolute z-30 w-64 rounded-lg border shadow-xl"
      style={{
        top: position.top,
        left: Math.min(position.left, 400),
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
        <MessageSquarePlus size={14} style={{ color: "var(--primary)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
          Add Comment
        </span>
        <button onClick={onClose} className="ml-auto p-0.5 rounded hover:bg-[var(--muted)]">
          <X size={12} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      <div
        className="mx-3 mt-2 rounded px-2 py-1 text-[10px] italic border-l-2"
        style={{
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
          borderLeftColor: "var(--primary)",
        }}
      >
        &ldquo;{inlinePosition.selectedText.slice(0, 60)}{inlinePosition.selectedText.length > 60 ? "..." : ""}&rdquo;
      </div>

      <div className="p-3 relative">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Add a comment... Use @ to mention"
          className="w-full rounded border p-2 text-xs outline-none resize-none"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
        />

        {showMentions && filteredUsers.length > 0 && (
          <div
            className="absolute bottom-full left-3 z-50 mb-1 w-48 rounded-lg border shadow-lg py-1 max-h-32 overflow-y-auto"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleMentionInsert(user.name)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
                style={{ color: "var(--foreground)" }}
              >
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0]}
                </div>
                {user.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Send size={12} />
            Comment
          </button>
          <button
            onClick={() => {
              setText(text + "@");
              setShowMentions(true);
              inputRef.current?.focus();
            }}
            className="flex items-center gap-1 rounded px-2 py-1.5 text-[10px] hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <AtSign size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
