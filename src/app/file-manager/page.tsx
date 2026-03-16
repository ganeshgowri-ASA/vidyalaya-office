"use client";

import { useState } from "react";
import {
  Folder,
  FileText,
  Table2,
  Presentation,
  FileDown,
  ChevronRight,
  FolderPlus,
  Trash2,
  Move,
  CheckSquare,
  Square,
  MoreHorizontal,
  ArrowUp,
  Grid3X3,
  List,
  Home,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { FileType, VFolder } from "@/types";

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

export default function FileManagerPage() {
  const { recentFiles, folders, createFolder, deleteFile, moveFile } = useAppStore();
  const [currentFolderId, setCurrentFolderId] = useState<string>("folder-root");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const childFolders = folders.filter((f) => f.parentId === currentFolderId);
  const filesInFolder = recentFiles.filter((f) => f.folderId === currentFolderId);

  // Build breadcrumb path
  const buildBreadcrumbs = (): VFolder[] => {
    const trail: VFolder[] = [];
    let current = folders.find((f) => f.id === currentFolderId);
    while (current) {
      trail.unshift(current);
      current = current.parentId ? folders.find((f) => f.id === current!.parentId) : undefined;
    }
    return trail;
  };

  const breadcrumbs = buildBreadcrumbs();

  const toggleSelect = (fileId: string) => {
    const next = new Set(selectedFiles);
    if (next.has(fileId)) next.delete(fileId);
    else next.add(fileId);
    setSelectedFiles(next);
  };

  const selectAll = () => {
    if (selectedFiles.size === filesInFolder.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filesInFolder.map((f) => f.id)));
    }
  };

  const deleteSelected = () => {
    selectedFiles.forEach((id) => deleteFile(id));
    setSelectedFiles(new Set());
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const handleMoveSelected = (targetFolderId: string) => {
    selectedFiles.forEach((id) => moveFile(id, targetFolderId));
    setSelectedFiles(new Set());
    setShowMoveDialog(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>File Manager</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Browse and organize your files and folders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <FolderPlus size={16} /> New Folder
          </button>
          <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="rounded-md p-1.5"
              style={{ backgroundColor: viewMode === "grid" ? "var(--accent)" : "transparent", color: viewMode === "grid" ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="rounded-md p-1.5"
              style={{ backgroundColor: viewMode === "list" ? "var(--accent)" : "transparent", color: viewMode === "list" ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <button onClick={() => setCurrentFolderId("folder-root")} className="flex items-center gap-1 hover:opacity-80">
          <Home size={14} />
        </button>
        {breadcrumbs.map((folder, i) => (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight size={12} />
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              className={`hover:opacity-80 ${i === breadcrumbs.length - 1 ? "font-medium" : ""}`}
              style={i === breadcrumbs.length - 1 ? { color: "var(--foreground)" } : undefined}
            >
              {folder.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Bulk actions bar */}
      {selectedFiles.size > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ backgroundColor: "var(--accent)", borderColor: "var(--border)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--accent-foreground)" }}>
            {selectedFiles.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setShowMoveDialog(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
            style={{ color: "var(--foreground)" }}
          >
            <Move size={14} /> Move
          </button>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:opacity-80"
            style={{ color: "#dc2626" }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* New folder dialog */}
      {showNewFolder && (
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Folder size={18} style={{ color: "var(--primary)" }} />
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
            placeholder="Folder name..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          <button onClick={handleCreateFolder} className="rounded px-3 py-1 text-sm font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            Create
          </button>
          <button onClick={() => setShowNewFolder(false)} className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Cancel
          </button>
        </div>
      )}

      {/* Select all */}
      {filesInFolder.length > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="flex items-center gap-1.5 text-sm hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
            {selectedFiles.size === filesInFolder.length ? <CheckSquare size={14} /> : <Square size={14} />}
            {selectedFiles.size === filesInFolder.length ? "Deselect all" : "Select all"}
          </button>
        </div>
      )}

      {/* Folders */}
      {childFolders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>Folders</h3>
          <div className={viewMode === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "space-y-1"}>
            {childFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-[1.01] text-left w-full ${viewMode === "grid" ? "" : ""}`}
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <Folder size={viewMode === "grid" ? 24 : 18} style={{ color: "#f59e0b" }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{folder.name}</p>
                  {viewMode === "grid" && (
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(folder.modified)}</p>
                  )}
                </div>
                {viewMode === "list" && (
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(folder.modified)}</span>
                )}
                <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>Files</h3>
        {filesInFolder.length === 0 ? (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <Folder size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No files in this folder</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filesInFolder.map((file) => {
              const Icon = typeIcons[file.type];
              const isSelected = selectedFiles.has(file.id);
              return (
                <div
                  key={file.id}
                  className="group rounded-xl border p-4 transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "var(--accent)" : "var(--card)",
                    borderColor: isSelected ? "var(--primary)" : "var(--border)",
                  }}
                  onClick={() => toggleSelect(file.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${typeColors[file.type]}15` }}>
                      <Icon size={22} style={{ color: typeColors[file.type] }} />
                    </div>
                    {isSelected ? <CheckSquare size={16} style={{ color: "var(--primary)" }} /> : <Square size={16} className="opacity-0 group-hover:opacity-100" style={{ color: "var(--muted-foreground)" }} />}
                  </div>
                  <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {formatFileSize(file.size)} &middot; {formatDate(file.modified)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {filesInFolder.map((file) => {
              const Icon = typeIcons[file.type];
              const isSelected = selectedFiles.has(file.id);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90"
                  style={{ borderColor: "var(--border)", backgroundColor: isSelected ? "var(--accent)" : "transparent" }}
                  onClick={() => toggleSelect(file.id)}
                >
                  <button onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}>
                    {isSelected ? <CheckSquare size={16} style={{ color: "var(--primary)" }} /> : <Square size={16} style={{ color: "var(--muted-foreground)" }} />}
                  </button>
                  <Icon size={18} style={{ color: typeColors[file.type] }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: "var(--muted-foreground)" }}>{formatFileSize(file.size)}</span>
                  <span className="text-xs hidden md:block" style={{ color: "var(--muted-foreground)" }}>{formatDate(file.modified)}</span>
                  <span className="text-xs hidden lg:block truncate max-w-[120px]" style={{ color: "var(--muted-foreground)" }}>{file.owner}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Move dialog */}
      {showMoveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMoveDialog(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>Move to folder</h3>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveSelected(folder.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:opacity-80"
                  style={{ color: "var(--card-foreground)" }}
                >
                  <Folder size={16} style={{ color: "#f59e0b" }} />
                  {folder.name}
                </button>
              ))}
            </div>
            <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowMoveDialog(false)} className="w-full rounded-lg py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Go up */}
      {currentFolderId !== "folder-root" && (
        <button
          onClick={() => {
            const parent = folders.find((f) => f.id === currentFolderId)?.parentId;
            if (parent) setCurrentFolderId(parent);
          }}
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          title="Go up"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
