"use client";

import { useState, useCallback } from "react";
import { X, MessageSquare, Trash2, Edit3, Check, Plus } from "lucide-react";
import { useSpreadsheetStore, type CellComment } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

export function CellCommentsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const setCellComment = useSpreadsheetStore((s) => s.setCellComment);
  const setActiveCell = useSpreadsheetStore((s) => s.setActiveCell);

  const [commentText, setCommentText] = useState("");
  const [author, setAuthor] = useState("User");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const sheet = getActiveSheet();

  // Collect all cells with comments
  const commentsEntries = Object.entries(sheet.cells)
    .filter(([, cell]) => cell.comment)
    .map(([key, cell]) => {
      const match = key.match(/^([A-Z]+)(\d+)$/);
      const col = match ? match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1 : 0;
      const row = match ? parseInt(match[2]) - 1 : 0;
      return { key, col, row, comment: cell.comment! };
    })
    .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);

  const activeCellKey = activeCell ? `${colToLetter(activeCell.col)}${activeCell.row + 1}` : "";
  const activeCellComment = activeCell ? sheet.cells[activeCellKey]?.comment : undefined;

  const handleAddComment = useCallback(() => {
    if (!activeCell || !commentText.trim()) return;
    setCellComment(activeCell.col, activeCell.row, {
      text: commentText.trim(),
      author,
      date: new Date().toISOString(),
    });
    setCommentText("");
  }, [activeCell, commentText, author, setCellComment]);

  const handleDeleteComment = useCallback((col: number, row: number) => {
    setCellComment(col, row, undefined);
  }, [setCellComment]);

  const handleSaveEdit = useCallback((col: number, row: number, existingComment: CellComment) => {
    if (editText.trim()) {
      setCellComment(col, row, {
        ...existingComment,
        text: editText.trim(),
        date: new Date().toISOString(),
      });
    }
    setEditingKey(null);
    setEditText("");
  }, [editText, setCellComment]);

  const navigateToCell = useCallback((col: number, row: number) => {
    setActiveCell(col, row);
  }, [setActiveCell]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[450px] max-h-[75vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <MessageSquare size={14} />
            <h2 className="text-sm font-semibold">Cell Comments</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {/* Add comment to active cell */}
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
              {activeCell
                ? `Add comment to ${activeCellKey}`
                : "Select a cell to add a comment"}
            </div>
            {activeCell && (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                />
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 text-xs rounded px-2 py-1.5 border outline-none resize-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <button
                    className="self-end p-1.5 rounded hover:opacity-90"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                    onClick={handleAddComment}
                    title="Add comment"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Show active cell's existing comment */}
            {activeCellComment && (
              <div
                className="mt-2 p-2 rounded text-xs"
                style={{ backgroundColor: "#fef9c3", color: "#000" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{activeCellComment.author}</span>
                  <span className="text-[10px]" style={{ color: "#666" }}>
                    {new Date(activeCellComment.date).toLocaleDateString()}
                  </span>
                </div>
                <div>{activeCellComment.text}</div>
              </div>
            )}
          </div>

          {/* All comments list */}
          <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
              All Comments ({commentsEntries.length})
            </div>
            {commentsEntries.length === 0 ? (
              <div className="text-xs italic py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
                No comments in this sheet
              </div>
            ) : (
              <div className="space-y-1.5">
                {commentsEntries.map(({ key, col, row, comment }) => (
                  <div
                    key={key}
                    className="rounded p-2 text-xs"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <button
                        className="font-mono font-semibold hover:underline"
                        style={{ color: "var(--primary)" }}
                        onClick={() => navigateToCell(col, row)}
                      >
                        {key}
                      </button>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                          {comment.author} - {new Date(comment.date).toLocaleDateString()}
                        </span>
                        {editingKey === key ? (
                          <button onClick={() => handleSaveEdit(col, row, comment)} className="hover:opacity-70">
                            <Check size={12} className="text-green-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setEditingKey(key); setEditText(comment.text); }}
                            className="hover:opacity-70"
                          >
                            <Edit3 size={11} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteComment(col, row)} className="hover:opacity-70 text-red-400">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    {editingKey === key ? (
                      <textarea
                        className="w-full text-xs rounded px-2 py-1 border outline-none resize-none mt-1"
                        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSaveEdit(col, row, comment);
                          if (e.key === "Escape") setEditingKey(null);
                        }}
                      />
                    ) : (
                      <div>{comment.text}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
