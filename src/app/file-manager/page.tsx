"use client";

import { useState, useCallback } from "react";
import {
  Edit3, Trash2, ExternalLink, Share2, X, Star,
  Folder, BarChart2, ScanSearch, ClipboardList, Clock,
  ArrowUp, Copy,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useFileManagerStore } from "@/store/file-manager-store";
import type { FileType, VFolder } from "@/types";
import { ImportDialog } from "@/components/shared/import-dialog";
import { GlobalDropzoneOverlay } from "@/components/shared/dropzone-overlay";
import { FolderTree } from "@/components/file-manager/folder-tree";
import { FileDetailPanel } from "@/components/file-manager/file-detail-panel";
import { StorageChart } from "@/components/file-manager/storage-chart";
import { RecycleBin } from "@/components/file-manager/recycle-bin";
import { AuditLogPanel } from "@/components/file-manager/audit-log-panel";
import { DuplicatePanel } from "@/components/file-manager/file-manager-duplicate-scanner";
import {
  TopBar, Breadcrumb, BulkActionsBar, InlineCreate,
} from "@/components/file-manager/file-manager-toolbar";
import { FolderItem, FileGridCard, FileListRow } from "@/components/file-manager/file-manager-grid";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "files" | "starred" | "recent" | "trash" | "analytics" | "duplicates" | "audit";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "files", label: "All Files", icon: Folder },
  { id: "starred", label: "Starred", icon: Star },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "trash", label: "Trash", icon: Trash2 },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "duplicates", label: "Duplicates", icon: ScanSearch },
  { id: "audit", label: "Audit Log", icon: ClipboardList },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FileManagerPage() {
  const {
    recentFiles, folders, trash,
    createFolder, deleteFile, moveFile, copyFile, renameFile, renameFolder,
    deleteFolder, createFile, toggleStar, restoreFile, permanentDelete, emptyTrash,
    addTagToFile, removeTagFromFile,
  } = useAppStore();

  const {
    getVersions, getAuditLogs, getAllAuditLogs, restoreVersion,
    scanDuplicates, clearDuplicateScan, duplicateScanResults, scanningDuplicates,
    removeFromDuplicateGroup,
  } = useFileManagerStore();

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>("files");
  const [currentFolderId, setCurrentFolderId] = useState("folder-root");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Selection
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Inline create
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<FileType>("document");

  // Rename
  const [renameTarget, setRenameTarget] = useState<{ id: string; kind: "file" | "folder" } | null>(null);
  const [renameName, setRenameName] = useState("");

  // Dialogs
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; kind: "file" | "folder"; name: string } | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [contextMenu, setContextMenu] = useState<{ id: string; kind: "file" | "folder"; x: number; y: number } | null>(null);
  const [showImport, setShowImport] = useState(false);

  // Detail panel
  const [detailFileId, setDetailFileId] = useState<string | null>(null);

  // Drag state
  const [dragFileId, setDragFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const childFolders = folders.filter((f) => f.parentId === currentFolderId);
  const filesInFolder = recentFiles.filter((f) => f.folderId === currentFolderId && !f.deleted);
  const starredFiles = recentFiles.filter((f) => f.starred && !f.deleted);
  const recentActivity = [...recentFiles].sort(
    (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
  ).slice(0, 12);

  const buildBreadcrumbs = (): VFolder[] => {
    const trail: VFolder[] = [];
    let cur = folders.find((f) => f.id === currentFolderId);
    while (cur) {
      trail.unshift(cur);
      cur = cur.parentId ? folders.find((f) => f.id === cur!.parentId) : undefined;
    }
    return trail;
  };
  const breadcrumbs = buildBreadcrumbs();

  const detailFile = detailFileId ? recentFiles.find((f) => f.id === detailFileId) : null;
  const detailFolder = detailFile ? folders.find((f) => f.id === detailFile.folderId) : undefined;

  const fileNames: Record<string, string> = {};
  recentFiles.forEach((f) => { fileNames[f.id] = f.name; });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    const next = new Set(selectedFiles);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedFiles(next);
  };

  const selectAll = () => {
    if (selectedFiles.size === filesInFolder.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(filesInFolder.map((f) => f.id)));
  };

  const deleteSelected = () => { selectedFiles.forEach((id) => deleteFile(id)); setSelectedFiles(new Set()); };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) { createFolder(newFolderName.trim(), currentFolderId); setNewFolderName(""); setShowNewFolder(false); }
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) { createFile(newFileName.trim(), newFileType, currentFolderId); setNewFileName(""); setShowNewFile(false); }
  };

  const applyRename = () => {
    if (!renameTarget || !renameName.trim()) return;
    if (renameTarget.kind === "file") renameFile(renameTarget.id, renameName.trim());
    else renameFolder(renameTarget.id, renameName.trim());
    setRenameTarget(null); setRenameName("");
  };

  const startRename = (id: string, kind: "file" | "folder", name: string) => {
    setRenameTarget({ id, kind }); setRenameName(name); setContextMenu(null);
  };

  const startDelete = (id: string, kind: "file" | "folder", name: string) => {
    setConfirmDelete({ id, kind, name }); setContextMenu(null);
  };

  const applyDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === "file") deleteFile(confirmDelete.id);
    else deleteFolder(confirmDelete.id);
    setConfirmDelete(null);
  };

  const openContextMenu = (e: React.MouseEvent, id: string, kind: "file" | "folder") => {
    e.stopPropagation(); e.preventDefault();
    setContextMenu({ id, kind, x: e.clientX, y: e.clientY });
  };

  const handleMoveSelected = (targetFolderId: string) => {
    selectedFiles.forEach((id) => moveFile(id, targetFolderId));
    setSelectedFiles(new Set()); setShowMoveDialog(false);
  };

  const handleCopySelected = (targetFolderId: string) => {
    selectedFiles.forEach((id) => copyFile(id, targetFolderId));
    setSelectedFiles(new Set()); setShowCopyDialog(false);
  };

  const handleBulkTag = () => {
    if (!tagInput.trim()) return;
    selectedFiles.forEach((id) => addTagToFile(id, tagInput.trim().toLowerCase()));
    setTagInput(""); setShowTagDialog(false); setSelectedFiles(new Set());
  };

  const handleDropOnFolder = useCallback((targetFolderId: string) => {
    if (dragFileId) { moveFile(dragFileId, targetFolderId); setDragFileId(null); }
  }, [dragFileId, moveFile]);

  const handleImportFile = async (file: File) => {
    const type: FileType = /\.(xlsx|csv)$/i.test(file.name) ? "spreadsheet"
      : /\.(pptx|ppt)$/i.test(file.name) ? "presentation"
      : /\.pdf$/i.test(file.name) ? "pdf"
      : "document";
    createFile(file.name, type, currentFolderId);
    setShowImport(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-4" onClick={() => setContextMenu(null)}>
      {/* Top bar */}
      <TopBar
        viewMode={viewMode}
        onViewMode={setViewMode}
        onImport={() => setShowImport(true)}
        onNewFile={() => setShowNewFile(true)}
        onNewFolder={() => setShowNewFolder(true)}
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
            style={{
              color: activeTab === id ? "var(--primary)" : "var(--muted-foreground)",
              borderBottom: activeTab === id ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            <Icon size={14} />
            {label}
            {id === "trash" && trash.length > 0 && (
              <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px]"
                style={{ backgroundColor: "#dc262620", color: "#dc2626" }}>
                {trash.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 gap-0 overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>

        {/* Folder tree sidebar (only on files tab) */}
        {activeTab === "files" && (
          <div style={{ width: 220, minWidth: 220 }}>
            <FolderTree
              folders={folders}
              files={recentFiles.filter((f) => !f.deleted)}
              currentFolderId={currentFolderId}
              onSelectFolder={setCurrentFolderId}
              onDropFiles={handleDropOnFolder}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-0">

          {/* ── FILES TAB ── */}
          {activeTab === "files" && (
            <>
              <Breadcrumb breadcrumbs={breadcrumbs} onNavigate={setCurrentFolderId} />

              {showNewFolder && (
                <InlineCreate kind="folder" value={newFolderName}
                  onChange={setNewFolderName} onConfirm={handleCreateFolder}
                  onCancel={() => setShowNewFolder(false)} />
              )}
              {showNewFile && (
                <InlineCreate kind="file" value={newFileName} fileType={newFileType}
                  onChange={setNewFileName} onTypeChange={setNewFileType}
                  onConfirm={handleCreateFile} onCancel={() => setShowNewFile(false)} />
              )}

              <BulkActionsBar
                count={selectedFiles.size}
                totalFiles={filesInFolder.length}
                onSelectAll={selectAll}
                onMove={() => setShowMoveDialog(true)}
                onCopy={() => setShowCopyDialog(true)}
                onDelete={deleteSelected}
                onTag={() => setShowTagDialog(true)}
                onClear={() => setSelectedFiles(new Set())}
              />

              {/* Folders */}
              {childFolders.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--muted-foreground)" }}>Folders</h3>
                  <div className={viewMode === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "space-y-1"}>
                    {childFolders.map((folder) => (
                      <FolderItem
                        key={folder.id}
                        folder={folder}
                        viewMode={viewMode}
                        isRenaming={renameTarget?.id === folder.id && renameTarget?.kind === "folder"}
                        renameName={renameName}
                        onRenameChange={setRenameName}
                        onRenameConfirm={applyRename}
                        onRenameCancel={() => setRenameTarget(null)}
                        onClick={() => setCurrentFolderId(folder.id)}
                        onContextMenu={(e) => openContextMenu(e, folder.id, "folder")}
                        isDragOver={dragOverFolderId === folder.id}
                        onDragOver={(e) => { e.preventDefault(); setDragOverFolderId(folder.id); }}
                        onDragLeave={() => setDragOverFolderId(null)}
                        onDrop={(e) => { e.preventDefault(); handleDropOnFolder(folder.id); setDragOverFolderId(null); }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--muted-foreground)" }}>Files</h3>
                {filesInFolder.length === 0 ? (
                  <div className="rounded-xl border p-12 text-center"
                    style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                    <Folder size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No files in this folder</p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {filesInFolder.map((file) => (
                      <FileGridCard
                        key={file.id}
                        file={file}
                        isSelected={selectedFiles.has(file.id)}
                        isRenaming={renameTarget?.id === file.id && renameTarget?.kind === "file"}
                        renameName={renameName}
                        onRenameChange={setRenameName}
                        onRenameConfirm={applyRename}
                        onRenameCancel={() => setRenameTarget(null)}
                        onSelect={() => toggleSelect(file.id)}
                        onContextMenu={(e) => openContextMenu(e, file.id, "file")}
                        onToggleStar={() => toggleStar(file.id)}
                        onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragFileId(file.id); }}
                        onDetailClick={(e) => { e.stopPropagation(); setDetailFileId(file.id); }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border divide-y"
                    style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                    {filesInFolder.map((file) => (
                      <FileListRow
                        key={file.id}
                        file={file}
                        isSelected={selectedFiles.has(file.id)}
                        isRenaming={renameTarget?.id === file.id && renameTarget?.kind === "file"}
                        renameName={renameName}
                        onRenameChange={setRenameName}
                        onRenameConfirm={applyRename}
                        onRenameCancel={() => setRenameTarget(null)}
                        onSelect={() => toggleSelect(file.id)}
                        onContextMenu={(e) => openContextMenu(e, file.id, "file")}
                        onToggleStar={() => toggleStar(file.id)}
                        onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragFileId(file.id); }}
                        onDetailClick={(e) => { e.stopPropagation(); setDetailFileId(file.id); }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Go up button */}
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
            </>
          )}

          {/* ── STARRED TAB ── */}
          {activeTab === "starred" && (
            <div>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Starred Files ({starredFiles.length})
              </h3>
              {starredFiles.length === 0 ? (
                <div className="rounded-xl border p-12 text-center"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                  <Star size={36} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No starred files yet</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Star files to access them quickly from here
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {starredFiles.map((file) => (
                    <FileGridCard
                      key={file.id}
                      file={file}
                      isSelected={false}
                      isRenaming={false}
                      renameName=""
                      onRenameChange={() => {}}
                      onRenameConfirm={() => {}}
                      onRenameCancel={() => {}}
                      onSelect={() => setDetailFileId(file.id)}
                      onContextMenu={(e) => openContextMenu(e, file.id, "file")}
                      onToggleStar={() => toggleStar(file.id)}
                      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragFileId(file.id); }}
                      onDetailClick={(e) => { e.stopPropagation(); setDetailFileId(file.id); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RECENT TAB ── */}
          {activeTab === "recent" && (
            <div>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Recent Files
              </h3>
              <div className="rounded-xl border divide-y overflow-hidden"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {recentActivity.map((file) => (
                  <FileListRow
                    key={file.id}
                    file={file}
                    isSelected={false}
                    isRenaming={false}
                    renameName=""
                    onRenameChange={() => {}}
                    onRenameConfirm={() => {}}
                    onRenameCancel={() => {}}
                    onSelect={() => setDetailFileId(file.id)}
                    onContextMenu={(e) => openContextMenu(e, file.id, "file")}
                    onToggleStar={() => toggleStar(file.id)}
                    onDragStart={() => {}}
                    onDetailClick={(e) => { e.stopPropagation(); setDetailFileId(file.id); }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── TRASH TAB ── */}
          {activeTab === "trash" && (
            <RecycleBin
              trash={trash}
              onRestore={restoreFile}
              onPermanentDelete={permanentDelete}
              onEmptyTrash={emptyTrash}
            />
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === "analytics" && (
            <StorageChart files={recentFiles.filter((f) => !f.deleted)} />
          )}

          {/* ── DUPLICATES TAB ── */}
          {activeTab === "duplicates" && (
            <DuplicatePanel
              files={recentFiles.filter((f) => !f.deleted)}
              scanning={scanningDuplicates}
              results={duplicateScanResults}
              onScan={() => scanDuplicates(recentFiles.filter((f) => !f.deleted))}
              onDeleteFiles={(ids) => { ids.forEach((id) => deleteFile(id)); }}
              onDismissGroup={(groupId, keepId) => removeFromDuplicateGroup(groupId, keepId)}
            />
          )}

          {/* ── AUDIT TAB ── */}
          {activeTab === "audit" && (
            <AuditLogPanel logs={getAllAuditLogs()} fileNames={fileNames} />
          )}
        </div>

        {/* Detail panel */}
        {detailFile && (
          <FileDetailPanel
            file={detailFile}
            folder={detailFolder}
            versions={getVersions(detailFile.id)}
            auditLogs={getAuditLogs(detailFile.id)}
            onClose={() => setDetailFileId(null)}
            onRestoreVersion={(fileId, versionId) => restoreVersion(fileId, versionId)}
            onToggleStar={(id) => toggleStar(id)}
            onAddTag={(fileId, tag) => addTagToFile(fileId, tag)}
            onRemoveTag={(fileId, tag) => removeTagFromFile(fileId, tag)}
          />
        )}
      </div>

      {/* ── Context menu ── */}
      {contextMenu && (
        <div className="fixed z-50 rounded-lg border shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y, backgroundColor: "var(--card)", borderColor: "var(--border)", minWidth: 160 }}>
          {contextMenu.kind === "file" && (
            <>
              <button
                onClick={() => {
                  const file = recentFiles.find((f) => f.id === contextMenu.id);
                  if (file) {
                    const routes: Record<FileType, string> = { document: "/document", spreadsheet: "/spreadsheet", presentation: "/presentation", pdf: "/pdf" };
                    window.location.href = routes[file.type] || "/";
                  }
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
                style={{ color: "var(--foreground)" }}
              >
                <ExternalLink size={14} /> Open
              </button>
              <button
                onClick={() => {
                  setDetailFileId(contextMenu.id); setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
                style={{ color: "var(--foreground)" }}
              >
                <Share2 size={14} /> Info / Share
              </button>
              <button
                onClick={() => {
                  const file = recentFiles.find((f) => f.id === contextMenu.id);
                  if (file) toggleStar(file.id);
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
                style={{ color: "var(--foreground)" }}
              >
                <Star size={14} /> Star / Unstar
              </button>
              <button
                onClick={() => {
                  copyFile(contextMenu.id, currentFolderId); setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
                style={{ color: "var(--foreground)" }}
              >
                <Copy size={14} /> Duplicate
              </button>
              <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
            </>
          )}
          <button
            onClick={() => {
              const item = contextMenu.kind === "file"
                ? recentFiles.find((f) => f.id === contextMenu.id)
                : folders.find((f) => f.id === contextMenu.id);
              if (item) startRename(contextMenu.id, contextMenu.kind, item.name);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
            style={{ color: "var(--foreground)" }}
          >
            <Edit3 size={14} /> Rename
          </button>
          <button
            onClick={() => {
              const item = contextMenu.kind === "file"
                ? recentFiles.find((f) => f.id === contextMenu.id)
                : folders.find((f) => f.id === contextMenu.id);
              if (item) startDelete(contextMenu.id, contextMenu.kind, item.name);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
            style={{ color: "#dc2626" }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl p-6"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--card-foreground)" }}>Confirm Delete</h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Delete &ldquo;{confirmDelete.name}&rdquo;?
              {confirmDelete.kind === "folder" && " Files will be moved to root."}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg px-4 py-2 text-sm"
                style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button onClick={applyDelete} className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "#dc2626", color: "#fff" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Move dialog ── */}
      {(showMoveDialog || showCopyDialog) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowMoveDialog(false); setShowCopyDialog(false); }} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>
                {showMoveDialog ? "Move to folder" : "Copy to folder"}
              </h3>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {folders.map((folder) => (
                <button key={folder.id}
                  onClick={() => showMoveDialog ? handleMoveSelected(folder.id) : handleCopySelected(folder.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:opacity-80"
                  style={{ color: "var(--card-foreground)" }}>
                  <Folder size={16} style={{ color: "#f59e0b" }} /> {folder.name}
                </button>
              ))}
            </div>
            <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => { setShowMoveDialog(false); setShowCopyDialog(false); }}
                className="w-full rounded-lg py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk tag dialog ── */}
      {showTagDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTagDialog(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border shadow-2xl p-6"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--card-foreground)" }}>
              Add Tag to {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""}
            </h3>
            <input
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleBulkTag(); if (e.key === "Escape") setShowTagDialog(false); }}
              placeholder="e.g. finance, draft, review"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-4"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTagDialog(false)} className="rounded-lg px-4 py-2 text-sm"
                style={{ color: "var(--muted-foreground)" }}>Cancel</button>
              <button onClick={handleBulkTag} className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
                Add Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import ── */}
      <ImportDialog open={showImport} onClose={() => setShowImport(false)} onImport={handleImportFile} />

      {/* ── Drop overlay ── */}
      <GlobalDropzoneOverlay
        onFileDrop={(files) => files.forEach((f) => {
          const type: FileType = /\.(xlsx|csv)$/i.test(f.name) ? "spreadsheet"
            : /\.(pptx|ppt)$/i.test(f.name) ? "presentation"
            : /\.pdf$/i.test(f.name) ? "pdf" : "document";
          createFile(f.name, type, currentFolderId);
        })}
      />
    </div>
  );
}
