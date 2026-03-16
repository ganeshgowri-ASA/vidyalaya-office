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
  FilePlus,
  Trash2,
  Move,
  CheckSquare,
  Square,
  MoreHorizontal,
  ArrowUp,
  Grid3X3,
  List,
  Home,
  Edit3,
  X,
  Check,
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
  const { recentFiles, folders, createFolder, deleteFile, moveFile, renameFile, renameFolder, deleteFolder, createFile } = useAppStore();
  const [currentFolderId, setCurrentFolderId] = useState<string>("folder-root");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  // New file creation
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<FileType>("document");

  // Rename
  const [renameTarget, setRenameTarget] = useState<{ id: string; kind: "file" | "folder"; name: string } | null>(null);
  const [renameName, setRenameName] = useState("");

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; kind: "file" | "folder"; name: string } | null>(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ id: string; kind: "file" | "folder"; x: number; y: number } | null>(null);

  const childFolders = folders.filter((f) => f.parentId === currentFolderId);
  const filesInFolder = recentFiles.filter((f) => f.folderId === currentFolderId);

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

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim(), newFileType, currentFolderId);
      setNewFileName("");
      setShowNewFile(false);
    }
  };

  const handleMoveSelected = (targetFolderId: string) => {
    selectedFiles.forEach((id) => moveFile(id, targetFolderId));
    setSelectedFiles(new Set());
    setShowMoveDialog(false);
  };

  const startRename = (id: string, kind: "file" | "folder", name: string) => {
    setRenameTarget({ id, kind, name });
    setRenameName(name);
    setContextMenu(null);
  };

  const applyRename = () => {
    if (!renameTarget || !renameName.trim()) return;
    if (renameTarget.kind === "file") renameFile(renameTarget.id, renameName.trim());
    else renameFolder(renameTarget.id, renameName.trim());
    setRenameTarget(null);
    setRenameName("");
  };

  const startDelete = (id: string, kind: "file" | "folder", name: string) => {
    setConfirmDelete({ id, kind, name });
    setContextMenu(null);
  };

  const applyDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === "file") deleteFile(confirmDelete.id);
    else deleteFolder(confirmDelete.id);
    setConfirmDelete(null);
  };

  const openContextMenu = (e: React.MouseEvent, id: string, kind: "file" | "folder") => {
    e.stopPropagation();
    e.preventDefault();
    setContextMenu({ id, kind, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" onClick={() => setContextMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>File Manager</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Browse and organize your files and folders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFile(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <FilePlus size={16} /> New File
          </button>
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)" }}
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
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Folder size={18} style={{ color: "var(--primary)" }} />
          <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
            placeholder="Folder name..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--foreground)" }} />
          <button onClick={handleCreateFolder} className="rounded px-3 py-1 text-sm font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>Create</button>
          <button onClick={() => setShowNewFolder(false)} className="text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
        </div>
      )}

      {/* New file dialog */}
      {showNewFile && (
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <FileText size={18} style={{ color: "var(--primary)" }} />
          <input autoFocus value={newFileName} onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateFile(); if (e.key === "Escape") setShowNewFile(false); }}
            placeholder="File name..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--foreground)" }} />
          <select value={newFileType} onChange={(e) => setNewFileType(e.target.value as FileType)}
            className="rounded border px-2 py-1 text-sm outline-none" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
            <option value="document">Document</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="presentation">Presentation</option>
            <option value="pdf">PDF</option>
          </select>
          <button onClick={handleCreateFile} className="rounded px-3 py-1 text-sm font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>Create</button>
          <button onClick={() => setShowNewFile(false)} className="text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
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
            {childFolders.map((folder) => {
              const isRenaming = renameTarget?.id === folder.id && renameTarget?.kind === "folder";
              return (
                <div
                  key={folder.id}
                  className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-[1.01] text-left w-full group relative"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <button onClick={() => setCurrentFolderId(folder.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <Folder size={viewMode === "grid" ? 24 : 18} style={{ color: "#f59e0b" }} />
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input autoFocus value={renameName} onChange={(e) => setRenameName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") applyRename(); if (e.key === "Escape") setRenameTarget(null); }}
                            className="bg-transparent text-sm outline-none border-b" style={{ color: "var(--foreground)", borderColor: "var(--primary)" }}
                            onClick={(e) => e.stopPropagation()} />
                          <button onClick={(e) => { e.stopPropagation(); applyRename(); }}><Check size={14} style={{ color: "var(--primary)" }} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setRenameTarget(null); }}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{folder.name}</p>
                          {viewMode === "grid" && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(folder.modified)}</p>}
                        </>
                      )}
                    </div>
                  </button>
                  {viewMode === "list" && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(folder.modified)}</span>}
                  <button onClick={(e) => openContextMenu(e, folder.id, "folder")} className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]">
                    <MoreHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                  <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                </div>
              );
            })}
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
              const isRenaming = renameTarget?.id === file.id && renameTarget?.kind === "file";
              return (
                <div
                  key={file.id}
                  className="group rounded-xl border p-4 transition-all hover:scale-[1.01] cursor-pointer relative"
                  style={{ backgroundColor: isSelected ? "var(--accent)" : "var(--card)", borderColor: isSelected ? "var(--primary)" : "var(--border)" }}
                  onClick={() => toggleSelect(file.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${typeColors[file.type]}15` }}>
                      <Icon size={22} style={{ color: typeColors[file.type] }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => openContextMenu(e, file.id, "file")} className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]">
                        <MoreHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
                      </button>
                      {isSelected ? <CheckSquare size={16} style={{ color: "var(--primary)" }} /> : <Square size={16} className="opacity-0 group-hover:opacity-100" style={{ color: "var(--muted-foreground)" }} />}
                    </div>
                  </div>
                  {isRenaming ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input autoFocus value={renameName} onChange={(e) => setRenameName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") applyRename(); if (e.key === "Escape") setRenameTarget(null); }}
                        className="bg-transparent text-sm outline-none border-b w-full" style={{ color: "var(--foreground)", borderColor: "var(--primary)" }} />
                      <button onClick={(e) => { e.stopPropagation(); applyRename(); }}><Check size={14} style={{ color: "var(--primary)" }} /></button>
                    </div>
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{formatFileSize(file.size)} &middot; {formatDate(file.modified)}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {filesInFolder.map((file) => {
              const Icon = typeIcons[file.type];
              const isSelected = selectedFiles.has(file.id);
              const isRenaming = renameTarget?.id === file.id && renameTarget?.kind === "file";
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90 group"
                  style={{ borderColor: "var(--border)", backgroundColor: isSelected ? "var(--accent)" : "transparent" }}
                  onClick={() => toggleSelect(file.id)}
                >
                  <button onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}>
                    {isSelected ? <CheckSquare size={16} style={{ color: "var(--primary)" }} /> : <Square size={16} style={{ color: "var(--muted-foreground)" }} />}
                  </button>
                  <Icon size={18} style={{ color: typeColors[file.type] }} />
                  <div className="min-w-0 flex-1">
                    {isRenaming ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input autoFocus value={renameName} onChange={(e) => setRenameName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") applyRename(); if (e.key === "Escape") setRenameTarget(null); }}
                          className="bg-transparent text-sm outline-none border-b flex-1" style={{ color: "var(--foreground)", borderColor: "var(--primary)" }} />
                        <button onClick={(e) => { e.stopPropagation(); applyRename(); }}><Check size={14} style={{ color: "var(--primary)" }} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setRenameTarget(null); }}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
                      </div>
                    ) : (
                      <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{file.name}</p>
                    )}
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: "var(--muted-foreground)" }}>{formatFileSize(file.size)}</span>
                  <span className="text-xs hidden md:block" style={{ color: "var(--muted-foreground)" }}>{formatDate(file.modified)}</span>
                  <span className="text-xs hidden lg:block truncate max-w-[120px]" style={{ color: "var(--muted-foreground)" }}>{file.owner}</span>
                  <button onClick={(e) => openContextMenu(e, file.id, "file")} className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-[var(--accent)]">
                    <MoreHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="fixed z-50 rounded-lg border shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y, backgroundColor: "var(--card)", borderColor: "var(--border)", minWidth: 140 }}>
          <button
            onClick={() => {
              const item = contextMenu.kind === "file" ? recentFiles.find((f) => f.id === contextMenu.id) : folders.find((f) => f.id === contextMenu.id);
              if (item) startRename(contextMenu.id, contextMenu.kind, item.name);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]" style={{ color: "var(--foreground)" }}
          >
            <Edit3 size={14} /> Rename
          </button>
          <button
            onClick={() => {
              const item = contextMenu.kind === "file" ? recentFiles.find((f) => f.id === contextMenu.id) : folders.find((f) => f.id === contextMenu.id);
              if (item) startDelete(contextMenu.id, contextMenu.kind, item.name);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]" style={{ color: "#dc2626" }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-foreground)" }}>Confirm Delete</h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Are you sure you want to delete &ldquo;{confirmDelete.name}&rdquo;?
              {confirmDelete.kind === "folder" && " Files in this folder will be moved to the root folder."}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg px-4 py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button onClick={applyDelete} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "#dc2626", color: "#fff" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
                <button key={folder.id} onClick={() => handleMoveSelected(folder.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:opacity-80" style={{ color: "var(--card-foreground)" }}>
                  <Folder size={16} style={{ color: "#f59e0b" }} /> {folder.name}
                </button>
              ))}
            </div>
            <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowMoveDialog(false)} className="w-full rounded-lg py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
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
