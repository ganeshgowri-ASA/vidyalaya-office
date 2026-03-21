"use client";

import { useState } from "react";
import { Folder, FolderOpen, ChevronRight, ChevronDown, Home } from "lucide-react";
import type { VFolder, VFile } from "@/types";
import { cn } from "@/lib/utils";

interface FolderNodeProps {
  folder: VFolder;
  allFolders: VFolder[];
  allFiles: VFile[];
  currentFolderId: string;
  onSelect: (folderId: string) => void;
  depth: number;
  dragOverFolderId: string | null;
  onDragOver: (folderId: string) => void;
  onDragLeave: () => void;
  onDrop: (folderId: string) => void;
}

function FolderNode({
  folder,
  allFolders,
  allFiles,
  currentFolderId,
  onSelect,
  depth,
  dragOverFolderId,
  onDragOver,
  onDragLeave,
  onDrop,
}: FolderNodeProps) {
  const children = allFolders.filter((f) => f.parentId === folder.id);
  const fileCount = allFiles.filter((f) => f.folderId === folder.id).length;
  const isOpen = currentFolderId === folder.id || isAncestor(folder.id, currentFolderId, allFolders);
  const [expanded, setExpanded] = useState(isOpen);
  const isActive = currentFolderId === folder.id;
  const isDragOver = dragOverFolderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg px-2 py-1.5 cursor-pointer select-none group transition-colors",
          isActive ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "hover:bg-[var(--accent)]",
          isDragOver && !isActive ? "ring-2 ring-[var(--primary)] ring-inset" : ""
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => onSelect(folder.id)}
        onDragOver={(e) => { e.preventDefault(); onDragOver(folder.id); }}
        onDragLeave={onDragLeave}
        onDrop={(e) => { e.preventDefault(); onDrop(folder.id); }}
      >
        {children.length > 0 ? (
          <button
            className="p-0.5 rounded hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
          >
            {expanded ? (
              <ChevronDown size={12} style={{ color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
            ) : (
              <ChevronRight size={12} style={{ color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {expanded && children.length > 0 ? (
          <FolderOpen size={14} style={{ color: isActive ? "var(--primary-foreground)" : "#f59e0b", flexShrink: 0 }} />
        ) : (
          <Folder size={14} style={{ color: isActive ? "var(--primary-foreground)" : "#f59e0b", flexShrink: 0 }} />
        )}
        <span
          className="flex-1 truncate text-xs font-medium"
          style={{ color: isActive ? "var(--primary-foreground)" : "var(--foreground)" }}
        >
          {folder.name}
        </span>
        {fileCount > 0 && (
          <span
            className="text-[10px] rounded-full px-1.5 py-0.5 ml-1"
            style={{
              backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "var(--muted)",
              color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            {fileCount}
          </span>
        )}
      </div>
      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              allFiles={allFiles}
              currentFolderId={currentFolderId}
              onSelect={onSelect}
              depth={depth + 1}
              dragOverFolderId={dragOverFolderId}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function isAncestor(folderId: string, targetId: string, allFolders: VFolder[]): boolean {
  let current = allFolders.find((f) => f.id === targetId);
  while (current?.parentId) {
    if (current.parentId === folderId) return true;
    current = allFolders.find((f) => f.id === current!.parentId);
  }
  return false;
}

interface FolderTreeProps {
  folders: VFolder[];
  files: VFile[];
  currentFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onDropFiles: (folderId: string) => void;
}

export function FolderTree({ folders, files, currentFolderId, onSelectFolder, onDropFiles }: FolderTreeProps) {
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const rootFolders = folders.filter((f) => f.parentId === null);

  return (
    <div
      className="h-full overflow-y-auto py-3"
      style={{ borderRight: "1px solid var(--border)" }}
    >
      <div className="px-3 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          Folders
        </span>
      </div>

      {/* Root / Home */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer select-none transition-colors mb-1",
          currentFolderId === "folder-root" ? "bg-[var(--primary)]" : "hover:bg-[var(--accent)]",
          dragOverFolderId === "folder-root" && currentFolderId !== "folder-root" ? "ring-2 ring-[var(--primary)] ring-inset" : ""
        )}
        onClick={() => onSelectFolder("folder-root")}
        onDragOver={(e) => { e.preventDefault(); setDragOverFolderId("folder-root"); }}
        onDragLeave={() => setDragOverFolderId(null)}
        onDrop={(e) => { e.preventDefault(); onDropFiles("folder-root"); setDragOverFolderId(null); }}
      >
        <Home size={14} style={{ color: currentFolderId === "folder-root" ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
        <span
          className="text-xs font-medium"
          style={{ color: currentFolderId === "folder-root" ? "var(--primary-foreground)" : "var(--foreground)" }}
        >
          My Files
        </span>
        <span
          className="ml-auto text-[10px] rounded-full px-1.5 py-0.5"
          style={{
            backgroundColor: currentFolderId === "folder-root" ? "rgba(255,255,255,0.2)" : "var(--muted)",
            color: currentFolderId === "folder-root" ? "var(--primary-foreground)" : "var(--muted-foreground)",
          }}
        >
          {files.length}
        </span>
      </div>

      {/* Folder tree */}
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          allFolders={folders}
          allFiles={files}
          currentFolderId={currentFolderId}
          onSelect={onSelectFolder}
          depth={0}
          dragOverFolderId={dragOverFolderId}
          onDragOver={setDragOverFolderId}
          onDragLeave={() => setDragOverFolderId(null)}
          onDrop={(folderId) => { onDropFiles(folderId); setDragOverFolderId(null); }}
        />
      ))}
    </div>
  );
}
