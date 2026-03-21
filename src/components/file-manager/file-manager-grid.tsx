"use client";

import {
  Folder, FileText, Table2, Presentation, FileDown,
  ChevronRight, MoreHorizontal, CheckSquare, Square,
  Check, X, Star,
} from "lucide-react";
import type { VFile, VFolder, FileType } from "@/types";
import { formatDate } from "@/lib/utils";

const typeIcons: Record<FileType, React.ElementType> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
};

const typeColors: Record<FileType, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
  pdf: "#dc2626",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Folder row/card ─────────────────────────────────────────────────────────

interface FolderItemProps {
  folder: VFolder;
  viewMode: "grid" | "list";
  isRenaming: boolean;
  renameName: string;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function FolderItem({
  folder, viewMode, isRenaming, renameName,
  onRenameChange, onRenameConfirm, onRenameCancel,
  onClick, onContextMenu,
  isDragOver, onDragOver, onDragLeave, onDrop,
}: FolderItemProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-[1.01] text-left w-full group relative"
      style={{
        backgroundColor: isDragOver ? "var(--accent)" : "var(--card)",
        borderColor: isDragOver ? "var(--primary)" : "var(--border)",
        cursor: "pointer",
      }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Folder size={viewMode === "grid" ? 24 : 18} style={{ color: "#f59e0b" }} />
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={renameName}
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onRenameConfirm(); if (e.key === "Escape") onRenameCancel(); }}
              className="bg-transparent text-sm outline-none border-b"
              style={{ color: "var(--foreground)", borderColor: "var(--primary)" }}
            />
            <button onClick={(e) => { e.stopPropagation(); onRenameConfirm(); }}>
              <Check size={14} style={{ color: "var(--primary)" }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRenameCancel(); }}>
              <X size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        ) : (
          <>
            <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
              {folder.name}
            </p>
            {viewMode === "grid" && (
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {formatDate(folder.modified)}
              </p>
            )}
          </>
        )}
      </div>
      {viewMode === "list" && (
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {formatDate(folder.modified)}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
        className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]"
      >
        <MoreHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
      <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
    </div>
  );
}

// ─── File grid card ───────────────────────────────────────────────────────────

interface FileGridCardProps {
  file: VFile;
  isSelected: boolean;
  isRenaming: boolean;
  renameName: string;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggleStar: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDetailClick: (e: React.MouseEvent) => void;
}

export function FileGridCard({
  file, isSelected, isRenaming, renameName,
  onRenameChange, onRenameConfirm, onRenameCancel,
  onSelect, onContextMenu, onToggleStar, onDragStart, onDetailClick,
}: FileGridCardProps) {
  const Icon = typeIcons[file.type];
  const color = typeColors[file.type];

  return (
    <div
      className="group rounded-xl border p-4 transition-all hover:scale-[1.01] cursor-pointer relative"
      style={{
        backgroundColor: isSelected ? "var(--accent)" : "var(--card)",
        borderColor: isSelected ? "var(--primary)" : "var(--border)",
      }}
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
            className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]"
          >
            <Star
              size={13}
              style={{ color: file.starred ? "#f59e0b" : "var(--muted-foreground)" }}
              fill={file.starred ? "#f59e0b" : "none"}
            />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
            className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]"
          >
            <MoreHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
          {isSelected
            ? <CheckSquare size={16} style={{ color: "var(--primary)" }} />
            : <Square size={16} className="opacity-0 group-hover:opacity-100" style={{ color: "var(--muted-foreground)" }} />
          }
        </div>
      </div>
      {isRenaming ? (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={renameName}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onRenameConfirm(); if (e.key === "Escape") onRenameCancel(); }}
            className="bg-transparent text-sm outline-none border-b w-full"
            style={{ color: "var(--foreground)", borderColor: "var(--primary)" }}
          />
          <button onClick={(e) => { e.stopPropagation(); onRenameConfirm(); }}>
            <Check size={14} style={{ color: "var(--primary)" }} />
          </button>
        </div>
      ) : (
        <>
          <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
            {file.name}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {formatFileSize(file.size)} · {formatDate(file.modified)}
          </p>
          {file.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {file.tags.slice(0, 2).map((t) => (
                <span key={t} className="rounded-full px-1.5 py-0.5 text-[9px]"
                  style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                  #{t}
                </span>
              ))}
              {file.tags.length > 2 && (
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                  +{file.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </>
      )}
      {/* Detail open button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDetailClick(e); }}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-[10px]"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
      >
        Info
      </button>
    </div>
  );
}

// ─── File list row ────────────────────────────────────────────────────────────

interface FileListRowProps {
  file: VFile;
  isSelected: boolean;
  isRenaming: boolean;
  renameName: string;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggleStar: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDetailClick: (e: React.MouseEvent) => void;
}

export function FileListRow({
  file, isSelected, isRenaming, renameName,
  onRenameChange, onRenameConfirm, onRenameCancel,
  onSelect, onContextMenu, onToggleStar, onDragStart, onDetailClick,
}: FileListRowProps) {
  const Icon = typeIcons[file.type];
  const color = typeColors[file.type];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90 group"
      style={{ borderColor: "var(--border)", backgroundColor: isSelected ? "var(--accent)" : "transparent" }}
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
    >
      <button onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        {isSelected
          ? <CheckSquare size={16} style={{ color: "var(--primary)" }} />
          : <Square size={16} style={{ color: "var(--muted-foreground)" }} />
        }
      </button>
      <Icon size={18} style={{ color }} />
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={renameName}
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onRenameConfirm(); if (e.key === "Escape") onRenameCancel(); }}
              className="bg-transparent text-sm outline-none border-b flex-1"
              style={{ color: "var(--foreground)", borderColor: "var(--primary)" }}
            />
            <button onClick={(e) => { e.stopPropagation(); onRenameConfirm(); }}>
              <Check size={14} style={{ color: "var(--primary)" }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRenameCancel(); }}>
              <X size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
              {file.name}
            </p>
            {file.starred && <Star size={12} fill="#f59e0b" style={{ color: "#f59e0b", flexShrink: 0 }} />}
          </div>
        )}
      </div>
      {!isRenaming && (
        <>
          <div className="hidden md:flex gap-1">
            {file.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full px-1.5 py-0.5 text-[10px]"
                style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                #{t}
              </span>
            ))}
          </div>
          <span className="text-xs hidden sm:block w-16 text-right" style={{ color: "var(--muted-foreground)" }}>
            {formatFileSize(file.size)}
          </span>
          <span className="text-xs hidden md:block w-28 text-right" style={{ color: "var(--muted-foreground)" }}>
            {formatDate(file.modified)}
          </span>
          <span className="text-xs hidden lg:block truncate max-w-[100px]" style={{ color: "var(--muted-foreground)" }}>
            {file.owner}
          </span>
        </>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDetailClick(e); }}
        className="opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-[10px] mr-1"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
      >
        Info
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
        className="opacity-0 group-hover:opacity-100 rounded p-1 hover:opacity-70"
      >
        <Star size={13} style={{ color: file.starred ? "#f59e0b" : "var(--muted-foreground)" }}
          fill={file.starred ? "#f59e0b" : "none"} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
        className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]"
      >
        <MoreHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </div>
  );
}
