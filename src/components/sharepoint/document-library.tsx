"use client";
import React, { useState, useMemo } from "react";
import {
  Search, Upload, FolderPlus, Download, Trash2, Share2, MoreHorizontal,
  ChevronRight, Folder, FileText, Check, X, Eye, Clock, ArrowUpDown,
  Grid3X3, List, Filter, ChevronDown, Plus, ExternalLink, Copy, Edit3,
  Info, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSharePointStore, type SPDocument, type ViewMode } from "@/store/sharepoint-store";
import { Breadcrumb } from "./site-navigation";

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getFileIcon(doc: SPDocument) {
  if (doc.type === "folder") return <Folder size={18} className="text-yellow-500" />;
  const colors: Record<string, string> = { xlsx: "#059669", docx: "#4F46E5", pptx: "#D97706", pdf: "#DC2626", md: "#6B7280" };
  const ext = doc.fileType || "";
  return (
    <div className="w-5 h-5 flex items-center justify-center">
      <FileText size={18} style={{ color: colors[ext] || "#6B7280" }} />
    </div>
  );
}

function getFileTypeBadge(ext?: string) {
  if (!ext) return null;
  const colors: Record<string, string> = { xlsx: "#059669", docx: "#4F46E5", pptx: "#D97706", pdf: "#DC2626", md: "#6B7280" };
  return (
    <span className="text-[10px] font-bold uppercase px-1 py-0.5 rounded" style={{ color: colors[ext] || "#6B7280", backgroundColor: (colors[ext] || "#6B7280") + "15" }}>
      {ext}
    </span>
  );
}

// ── Version History Panel ─────────────────────────────
function VersionHistoryPanel({ docId }: { docId: string }) {
  const { documents, setShowVersionHistory } = useSharePointStore();
  const doc = documents.find((d) => d.id === docId);
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowVersionHistory(null)} />
      <div className="relative w-96 h-full overflow-y-auto border-l" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Version History</h3>
            <button onClick={() => setShowVersionHistory(null)} className="p-1 rounded hover:bg-white/10">
              <X size={16} style={{ color: "var(--foreground)" }} />
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--foreground)", opacity: 0.6 }}>{doc.name}</p>

          {doc.versions.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }}>No version history available</p>
          ) : (
            <div className="space-y-3">
              {doc.versions.map((v, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>Version {v.number}</span>
                    {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Current</span>}
                  </div>
                  <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.7 }}>{v.comment}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                    <span>{v.modifiedBy}</span>
                    <span>·</span>
                    <span>{formatDate(v.modifiedAt)}</span>
                    <span>·</span>
                    <span>{formatFileSize(v.size)}</span>
                  </div>
                  {i > 0 && (
                    <div className="flex gap-2 mt-2">
                      <button className="text-[10px] hover:underline" style={{ color: "var(--primary)" }}>Restore</button>
                      <button className="text-[10px] hover:underline" style={{ color: "var(--primary)" }}>Download</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Document Details Panel ────────────────────────────
function DocumentDetailsPanel({ docId }: { docId: string }) {
  const { documents, setShowDocDetails } = useSharePointStore();
  const doc = documents.find((d) => d.id === docId);
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowDocDetails(null)} />
      <div className="relative w-80 h-full overflow-y-auto border-l" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Details</h3>
            <button onClick={() => setShowDocDetails(null)} className="p-1 rounded hover:bg-white/10">
              <X size={16} style={{ color: "var(--foreground)" }} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            {getFileIcon(doc)}
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{doc.name}</p>
              {getFileTypeBadge(doc.fileType)}
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Type", value: doc.type === "folder" ? "Folder" : (doc.fileType?.toUpperCase() || "File") },
              { label: "Size", value: formatFileSize(doc.size) || "—" },
              { label: "Created by", value: doc.createdBy },
              { label: "Created", value: formatDate(doc.createdAt) },
              { label: "Modified by", value: doc.modifiedBy },
              { label: "Modified", value: formatDate(doc.modifiedAt) },
              { label: "Shared", value: doc.shared ? "Yes" : "No" },
              { label: "Versions", value: String(doc.versions.length) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{row.label}</span>
                <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{row.value}</span>
              </div>
            ))}

            {Object.keys(doc.metadata).length > 0 && (
              <>
                <hr style={{ borderColor: "var(--border)" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Metadata</p>
                {Object.entries(doc.metadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{key}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{val}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Document Library ─────────────────────────────
export function DocumentLibrary() {
  const {
    documents, currentFolderId, selectedDocIds, docSearchQuery, docViewMode,
    setCurrentFolderId, toggleDocSelected, setSelectedDocIds,
    setDocSearchQuery, setDocViewMode, deleteDocuments,
    showVersionHistory, setShowVersionHistory,
    showDocDetails, setShowDocDetails,
  } = useSharePointStore();

  const [sortField, setSortField] = useState<"name" | "modifiedAt" | "size">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: { id: string; name: string }[] = [];
    let currentId: string | null = currentFolderId;
    while (currentId) {
      const folder = documents.find((d) => d.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else break;
    }
    return path;
  }, [currentFolderId, documents]);

  // Filter & sort
  const currentItems = useMemo(() => {
    let items = documents.filter((d) => d.parentId === currentFolderId);
    if (docSearchQuery) {
      items = items.filter((d) => d.name.toLowerCase().includes(docSearchQuery.toLowerCase()));
    }
    items.sort((a, b) => {
      // Folders first
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "modifiedAt") cmp = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      else if (sortField === "size") cmp = (a.size || 0) - (b.size || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [documents, currentFolderId, docSearchQuery, sortField, sortDir]);

  const allSelected = currentItems.length > 0 && currentItems.every((d) => selectedDocIds.includes(d.id));

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function handleRowClick(doc: SPDocument) {
    if (doc.type === "folder") {
      setCurrentFolderId(doc.id);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0">
        <Breadcrumb
          items={breadcrumbPath.map((p, i) => ({
            label: p.name,
            onClick: i < breadcrumbPath.length - 1 ? () => setCurrentFolderId(p.id) : undefined,
          }))}
        />
        <div className="flex items-center justify-between mt-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Documents</h2>
          <div className="flex items-center gap-2">
            {/* View mode */}
            <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setDocViewMode("list")}
                className={cn("p-1.5", docViewMode === "list" ? "bg-white/10" : "")}
                style={{ color: "var(--foreground)" }}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setDocViewMode("grid")}
                className={cn("p-1.5", docViewMode === "grid" ? "bg-white/10" : "")}
                style={{ color: "var(--foreground)" }}
              >
                <Grid3X3 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white" style={{ backgroundColor: "var(--primary)" }}>
            <Upload size={13} /> Upload
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <FolderPlus size={13} /> New Folder
          </button>
          {selectedDocIds.length > 0 && (
            <>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <Download size={13} /> Download
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <Share2 size={13} /> Share
              </button>
              <button
                onClick={() => deleteDocuments(selectedDocIds)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border text-red-400"
                style={{ borderColor: "var(--border)" }}
              >
                <Trash2 size={13} /> Delete
              </button>
              <span className="text-xs ml-2" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                {selectedDocIds.length} selected
              </span>
            </>
          )}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input
            type="text"
            value={docSearchQuery}
            onChange={(e) => setDocSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-md border w-56 focus:outline-none focus:ring-1"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
          />
        </div>
      </div>

      {/* Content */}
      {docViewMode === "list" ? (
        <div className="flex-1 overflow-auto px-6">
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--background)" }}>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="w-8 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => {
                      if (allSelected) setSelectedDocIds([]);
                      else setSelectedDocIds(currentItems.map((d) => d.id));
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-2 text-xs font-medium cursor-pointer select-none" style={{ color: "var(--foreground)", opacity: 0.5 }} onClick={() => toggleSort("name")}>
                  <span className="flex items-center gap-1">Name <ArrowUpDown size={10} /></span>
                </th>
                <th className="text-left py-2 text-xs font-medium w-32 cursor-pointer select-none" style={{ color: "var(--foreground)", opacity: 0.5 }} onClick={() => toggleSort("modifiedAt")}>
                  <span className="flex items-center gap-1">Modified <ArrowUpDown size={10} /></span>
                </th>
                <th className="text-left py-2 text-xs font-medium w-36" style={{ color: "var(--foreground)", opacity: 0.5 }}>Modified By</th>
                <th className="text-left py-2 text-xs font-medium w-24 cursor-pointer select-none" style={{ color: "var(--foreground)", opacity: 0.5 }} onClick={() => toggleSort("size")}>
                  <span className="flex items-center gap-1">Size <ArrowUpDown size={10} /></span>
                </th>
                <th className="w-16 py-2 text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Sharing</th>
                <th className="w-8 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((doc) => {
                const selected = selectedDocIds.includes(doc.id);
                return (
                  <tr
                    key={doc.id}
                    className={cn("border-b transition-colors cursor-pointer group", selected ? "bg-white/5" : "hover:bg-white/[0.02]")}
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => handleRowClick(doc)}
                  >
                    <td className="py-2 px-1" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected} onChange={() => toggleDocSelected(doc.id)} className="rounded" />
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2.5">
                        {getFileIcon(doc)}
                        <span className="text-sm group-hover:underline" style={{ color: "var(--foreground)" }}>{doc.name}</span>
                        {getFileTypeBadge(doc.fileType)}
                      </div>
                    </td>
                    <td className="py-2 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{formatDate(doc.modifiedAt)}</td>
                    <td className="py-2 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{doc.modifiedBy}</td>
                    <td className="py-2 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{formatFileSize(doc.size)}</td>
                    <td className="py-2 text-center">
                      {doc.shared && <Share2 size={12} style={{ color: "var(--primary)" }} />}
                    </td>
                    <td className="py-2 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setContextMenu(contextMenu === doc.id ? null : doc.id)}
                        className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal size={14} style={{ color: "var(--foreground)" }} />
                      </button>
                      {contextMenu === doc.id && (
                        <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border shadow-xl py-1" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
                          {[
                            { icon: Eye, label: "Preview", action: () => {} },
                            { icon: Download, label: "Download", action: () => {} },
                            { icon: Share2, label: "Share", action: () => {} },
                            { icon: Copy, label: "Copy link", action: () => {} },
                            { icon: Edit3, label: "Rename", action: () => {} },
                            { icon: History, label: "Version history", action: () => { setShowVersionHistory(doc.id); setContextMenu(null); } },
                            { icon: Info, label: "Details", action: () => { setShowDocDetails(doc.id); setContextMenu(null); } },
                            { icon: Trash2, label: "Delete", action: () => { deleteDocuments([doc.id]); setContextMenu(null); } },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5"
                              style={{ color: item.label === "Delete" ? "#EF4444" : "var(--foreground)" }}
                            >
                              <item.icon size={13} /> {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <FileText size={32} className="mx-auto mb-2" style={{ color: "var(--foreground)", opacity: 0.2 }} />
                    <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                      {docSearchQuery ? "No documents match your search" : "This folder is empty"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="flex-1 overflow-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
            {currentItems.map((doc) => {
              const selected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => handleRowClick(doc)}
                  className={cn(
                    "rounded-lg border p-3 cursor-pointer transition-colors group relative",
                    selected ? "ring-1" : "hover:bg-white/[0.03]"
                  )}
                  style={{
                    borderColor: selected ? "var(--primary)" : "var(--border)",
                  }}
                >
                  <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected} onChange={() => toggleDocSelected(doc.id)} className="rounded opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col items-center pt-2">
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      {doc.type === "folder" ? <Folder size={32} className="text-yellow-500" /> : <FileText size={32} style={{ color: doc.fileType === "xlsx" ? "#059669" : doc.fileType === "docx" ? "#4F46E5" : doc.fileType === "pptx" ? "#D97706" : doc.fileType === "pdf" ? "#DC2626" : "#6B7280" }} />}
                    </div>
                    <p className="text-xs text-center truncate w-full" style={{ color: "var(--foreground)" }}>{doc.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>{formatDate(doc.modifiedAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Panels */}
      {showVersionHistory && <VersionHistoryPanel docId={showVersionHistory} />}
      {showDocDetails && <DocumentDetailsPanel docId={showDocDetails} />}

      {/* Footer */}
      <div className="px-6 py-2 border-t flex items-center justify-between shrink-0" style={{ borderColor: "var(--border)" }}>
        <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>
          {currentItems.length} items
          {currentItems.filter(d => d.type === "file").length > 0 && ` · ${formatFileSize(currentItems.filter(d => d.type === "file").reduce((acc, d) => acc + (d.size || 0), 0))} total`}
        </span>
      </div>
    </div>
  );
}
