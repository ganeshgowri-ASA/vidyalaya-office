"use client";

import {
  Upload, FilePlus, FolderPlus, Grid3X3, List,
  Home, ChevronRight, Move, Copy, Trash2, Tag,
  CheckSquare, Square,
} from "lucide-react";
import type { VFolder, FileType } from "@/types";

interface BreadcrumbProps {
  breadcrumbs: VFolder[];
  onNavigate: (folderId: string) => void;
}

export function Breadcrumb({ breadcrumbs, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap" style={{ color: "var(--muted-foreground)" }}>
      <button onClick={() => onNavigate("folder-root")} className="flex items-center gap-1 hover:opacity-80 rounded p-1">
        <Home size={14} />
      </button>
      {breadcrumbs.map((folder, i) => (
        <div key={folder.id} className="flex items-center gap-1">
          <ChevronRight size={12} />
          <button
            onClick={() => onNavigate(folder.id)}
            className="rounded px-1 py-0.5 hover:opacity-80 max-w-[120px] truncate"
            style={i === breadcrumbs.length - 1 ? { color: "var(--foreground)", fontWeight: 500 } : undefined}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </nav>
  );
}

interface TopBarProps {
  viewMode: "grid" | "list";
  onViewMode: (m: "grid" | "list") => void;
  onImport: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
}

export function TopBar({ viewMode, onViewMode, onImport, onNewFile, onNewFolder }: TopBarProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>File Manager</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Browse and organize your files
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)" }}
        >
          <Upload size={16} /> Import
        </button>
        <button
          onClick={onNewFile}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <FilePlus size={16} /> New File
        </button>
        <button
          onClick={onNewFolder}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)" }}
        >
          <FolderPlus size={16} /> New Folder
        </button>
        <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => onViewMode("grid")}
            className="rounded-md p-1.5"
            style={{
              backgroundColor: viewMode === "grid" ? "var(--accent)" : "transparent",
              color: viewMode === "grid" ? "var(--accent-foreground)" : "var(--muted-foreground)",
            }}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => onViewMode("list")}
            className="rounded-md p-1.5"
            style={{
              backgroundColor: viewMode === "list" ? "var(--accent)" : "transparent",
              color: viewMode === "list" ? "var(--accent-foreground)" : "var(--muted-foreground)",
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface BulkActionsBarProps {
  count: number;
  totalFiles: number;
  onSelectAll: () => void;
  onMove: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onTag: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  count, totalFiles, onSelectAll, onMove, onCopy, onDelete, onTag, onClear,
}: BulkActionsBarProps) {
  if (count === 0) return null;
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{ backgroundColor: "var(--accent)", borderColor: "var(--border)" }}
    >
      <button onClick={onSelectAll} className="flex items-center gap-1.5 text-sm hover:opacity-80">
        {count === totalFiles
          ? <CheckSquare size={14} style={{ color: "var(--primary)" }} />
          : <Square size={14} style={{ color: "var(--accent-foreground)" }} />
        }
        <span className="font-medium" style={{ color: "var(--accent-foreground)" }}>
          {count} selected
        </span>
      </button>
      <div className="flex-1" />
      <button
        onClick={onTag}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
        style={{ color: "var(--foreground)" }}
      >
        <Tag size={14} /> Tag
      </button>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
        style={{ color: "var(--foreground)" }}
      >
        <Copy size={14} /> Copy
      </button>
      <button
        onClick={onMove}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
        style={{ color: "var(--foreground)" }}
      >
        <Move size={14} /> Move
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
        style={{ color: "#dc2626" }}
      >
        <Trash2 size={14} /> Delete
      </button>
      <button onClick={onClear} className="text-sm hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
        Clear
      </button>
    </div>
  );
}

interface InlineCreateProps {
  kind: "file" | "folder";
  value: string;
  fileType?: FileType;
  onChange: (v: string) => void;
  onTypeChange?: (t: FileType) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function InlineCreate({ kind, value, fileType, onChange, onTypeChange, onConfirm, onCancel }: InlineCreateProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {kind === "folder"
        ? <FolderPlus size={18} style={{ color: "var(--primary)" }} />
        : <FilePlus size={18} style={{ color: "var(--primary)" }} />
      }
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); if (e.key === "Escape") onCancel(); }}
        placeholder={kind === "folder" ? "Folder name…" : "File name…"}
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: "var(--foreground)" }}
      />
      {kind === "file" && onTypeChange && (
        <select
          value={fileType}
          onChange={(e) => onTypeChange(e.target.value as FileType)}
          className="rounded border px-2 py-1 text-sm outline-none"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="document">Document</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="presentation">Presentation</option>
          <option value="pdf">PDF</option>
        </select>
      )}
      <button
        onClick={onConfirm}
        className="rounded px-3 py-1 text-sm font-medium"
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Create
      </button>
      <button onClick={onCancel} className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Cancel
      </button>
    </div>
  );
}
