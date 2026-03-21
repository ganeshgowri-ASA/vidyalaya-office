"use client";

import { useState, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  HardDrive,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Settings,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Table2,
  Presentation,
  FileDown,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useCloudStorageStore, formatBytes } from "@/store/cloud-storage-store";
import { useAppStore } from "@/store/app-store";
import type { StorageUsage } from "@/lib/cloud-storage";
import type { VFile } from "@/types";
import { CloudStorageIndicator } from "@/components/shared/cloud-storage-indicator";
import { FileUploadButton } from "@/components/shared/file-upload-button";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, typeof FileText> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
};

const TYPE_COLORS: Record<string, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
  pdf: "#dc2626",
};

export default function CloudStoragePage() {
  const {
    authMode,
    setAuthMode,
    syncStatus,
    autoSaveEnabled,
    setAutoSaveEnabled,
    autoSaveIntervalMs,
    storageUsage,
    refreshStorageUsage,
    storageLoading,
    uploads,
    downloads,
    pendingFileIds,
    syncAllPending,
    uploadFile,
    downloadFile,
    isOnline,
  } = useCloudStorageStore();

  const files = useAppStore((s) => s.recentFiles);

  useEffect(() => {
    refreshStorageUsage(files);
  }, [files, refreshStorageUsage]);

  const [activeTab, setActiveTab] = useState<"overview" | "files" | "settings">("overview");

  const usedPercent = storageUsage
    ? Math.round((storageUsage.usedBytes / storageUsage.quotaBytes) * 100)
    : 0;

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-6 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          href="/"
          className="p-1.5 rounded-md transition-colors hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <Cloud size={22} style={{ color: "var(--primary)" }} />
        <div>
          <h1 className="text-lg font-bold">MeghaSangraha — Cloud Storage</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Manage your cloud file storage, sync settings, and quota
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor:
                authMode === "authenticated"
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(234,179,8,0.15)",
              color: authMode === "authenticated" ? "#22c55e" : "#eab308",
            }}
          >
            {authMode === "authenticated" ? "Cloud Connected" : "Guest Mode (Local Only)"}
          </span>

          <button
            onClick={() =>
              setAuthMode(authMode === "authenticated" ? "guest" : "authenticated")
            }
            className="text-xs px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--sidebar-accent)",
              color: "var(--foreground)",
            }}
          >
            {authMode === "authenticated" ? "Switch to Guest" : "Connect Cloud"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 border-b px-6"
        style={{ borderColor: "var(--border)" }}
      >
        {(["overview", "files", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm capitalize transition-colors border-b-2",
              activeTab === tab ? "font-medium" : ""
            )}
            style={{
              borderColor: activeTab === tab ? "var(--primary)" : "transparent",
              color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "overview" && (
          <OverviewTab
            storageUsage={storageUsage}
            usedPercent={usedPercent}
            storageLoading={storageLoading}
            authMode={authMode}
            syncStatus={syncStatus}
            autoSaveEnabled={autoSaveEnabled}
            files={files}
            pendingCount={pendingFileIds.size}
            onSync={() => syncAllPending(files)}
            onRefresh={() => refreshStorageUsage(files)}
          />
        )}

        {activeTab === "files" && (
          <FilesTab files={files} uploadFile={uploadFile} downloadFile={downloadFile} />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            authMode={authMode}
            autoSaveEnabled={autoSaveEnabled}
            setAutoSaveEnabled={setAutoSaveEnabled}
            autoSaveIntervalMs={autoSaveIntervalMs}
          />
        )}
      </div>
    </div>
  );
}

/* ---- Overview Tab ---- */
function OverviewTab({
  storageUsage,
  usedPercent,
  storageLoading,
  authMode,
  syncStatus,
  autoSaveEnabled,
  files,
  pendingCount,
  onSync,
  onRefresh,
}: {
  storageUsage: StorageUsage | null;
  usedPercent: number;
  storageLoading: boolean;
  authMode: string;
  syncStatus: string;
  autoSaveEnabled: boolean;
  files: VFile[];
  pendingCount: number;
  onSync: () => void;
  onRefresh: () => void;
}) {
  const quotaColor =
    usedPercent > 90 ? "#dc2626" : usedPercent > 70 ? "#f59e0b" : "var(--primary)";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage Card */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={16} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-medium">Storage</span>
          </div>
          {storageLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
          ) : (
            <>
              <p className="text-2xl font-bold">
                {storageUsage ? formatBytes(storageUsage.usedBytes) : "0 B"}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                of {storageUsage ? formatBytes(storageUsage.quotaBytes) : "5 GB"} ({usedPercent}%)
              </p>
              <div
                className="h-2 rounded-full overflow-hidden mt-2"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(usedPercent, 100)}%`,
                    backgroundColor: quotaColor,
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Sync Status Card */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            {authMode === "authenticated" ? (
              <Cloud size={16} style={{ color: "#22c55e" }} />
            ) : (
              <CloudOff size={16} style={{ color: "#6b7280" }} />
            )}
            <span className="text-sm font-medium">Sync Status</span>
          </div>
          <p className="text-2xl font-bold capitalize">{syncStatus}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {authMode === "authenticated"
              ? `Auto-save ${autoSaveEnabled ? "enabled" : "disabled"}`
              : "Sign in for cloud sync"}
          </p>
          {pendingCount > 0 && (
            <button
              onClick={onSync}
              className="flex items-center gap-1 mt-2 text-xs px-2 py-1 rounded"
              style={{ backgroundColor: "var(--primary)", color: "white" }}
            >
              <RefreshCw size={10} />
              Sync {pendingCount} pending
            </button>
          )}
        </div>

        {/* Files Card */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-medium">Files</span>
          </div>
          <p className="text-2xl font-bold">{files.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            files managed
          </p>
          <div className="flex gap-2 mt-2">
            {Object.entries(TYPE_COLORS).map(([type, color]) => {
              const count = files.filter((f) => f.type === type).length;
              if (count === 0) return null;
              return (
                <span
                  key={type}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {count} {type}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold mb-3">Upload Files</h3>
        <FileUploadButton />
      </div>

      {/* Storage Breakdown */}
      {storageUsage && (
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Storage Breakdown</h3>
            <button
              onClick={onRefresh}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: "var(--muted-foreground)" }}
            >
              <RefreshCw size={10} />
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(storageUsage.byType).map(([type, bytes]) => {
              const Icon = TYPE_ICONS[type] || FileText;
              const color = TYPE_COLORS[type] || "#6b7280";
              const pct =
                storageUsage.usedBytes > 0
                  ? Math.round((bytes / storageUsage.usedBytes) * 100)
                  : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs capitalize flex-1">{type}s</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {formatBytes(bytes)}
                  </span>
                  <div
                    className="w-24 h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[10px] w-8 text-right" style={{ color: "var(--muted-foreground)" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Files Tab ---- */
function FilesTab({
  files,
  uploadFile,
  downloadFile,
}: {
  files: VFile[];
  uploadFile: (file: VFile, content: string) => Promise<void>;
  downloadFile: (fileId: string, fileName: string) => Promise<string | null>;
}) {
  const { uploads, downloads } = useCloudStorageStore();

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">All Files</h3>
        <FileUploadButton compact />
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-[1fr_100px_100px_120px_80px] gap-2 px-4 py-2 text-xs font-medium border-b"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          <span>Name</span>
          <span>Type</span>
          <span>Size</span>
          <span>Modified</span>
          <span>Actions</span>
        </div>

        {/* Table Rows */}
        {files.map((file) => {
          const Icon = TYPE_ICONS[file.type] || FileText;
          const color = TYPE_COLORS[file.type] || "#6b7280";
          const uploadStatus = uploads[file.id];
          const downloadStatus = downloads[file.id];

          return (
            <div
              key={file.id}
              className="grid grid-cols-[1fr_100px_100px_120px_80px] gap-2 px-4 py-2.5 border-b items-center text-xs hover:opacity-90"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={14} style={{ color }} />
                <span className="truncate">{file.name}</span>
                {uploadStatus?.status === "uploading" && (
                  <Loader2 size={10} className="animate-spin flex-shrink-0" style={{ color: "var(--primary)" }} />
                )}
                {uploadStatus?.status === "completed" && (
                  <CheckCircle2 size={10} className="flex-shrink-0" style={{ color: "#22c55e" }} />
                )}
                {uploadStatus?.status === "error" && (
                  <AlertTriangle size={10} className="flex-shrink-0" style={{ color: "#dc2626" }} />
                )}
              </div>
              <span className="capitalize" style={{ color: "var(--muted-foreground)" }}>
                {file.type}
              </span>
              <span style={{ color: "var(--muted-foreground)" }}>
                {file.size ? formatBytes(file.size) : "—"}
              </span>
              <span style={{ color: "var(--muted-foreground)" }}>
                {new Date(file.modified).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => uploadFile(file, file.content)}
                  title="Upload to cloud"
                  className="p-1 rounded hover:opacity-80"
                  style={{ color: "var(--primary)" }}
                >
                  <Upload size={12} />
                </button>
                <button
                  onClick={() => downloadFile(file.id, file.name)}
                  title="Download from cloud"
                  className="p-1 rounded hover:opacity-80"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Download size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {files.length === 0 && (
          <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
            No files yet. Upload files or create new ones.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Settings Tab ---- */
function SettingsTab({
  authMode,
  autoSaveEnabled,
  setAutoSaveEnabled,
  autoSaveIntervalMs,
}: {
  authMode: string;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  autoSaveIntervalMs: number;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Auto-save Settings */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold mb-4">Auto-save Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enable Auto-save</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Automatically save changes every {autoSaveIntervalMs / 1000} seconds
              </p>
            </div>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="relative inline-flex h-5 w-10 items-center rounded-full transition-colors"
              style={{
                backgroundColor: autoSaveEnabled ? "var(--primary)" : "var(--muted)",
              }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                style={{
                  transform: autoSaveEnabled ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Save Interval</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                How often to auto-save (in seconds)
              </p>
            </div>
            <span className="text-sm font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--muted)" }}>
              {autoSaveIntervalMs / 1000}s
            </span>
          </div>
        </div>
      </div>

      {/* Storage Mode */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold mb-4">Storage Mode</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Cloud size={18} style={{ color: "var(--primary)", marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-sm font-medium">Cloud Storage (Authenticated)</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Files are synced to Supabase Storage / S3. Auto-save pushes changes every 30s.
                Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.
              </p>
            </div>
            {authMode === "authenticated" && (
              <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
            )}
          </div>

          <div className="flex items-start gap-3">
            <HardDrive size={18} style={{ color: "var(--muted-foreground)", marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-sm font-medium">Local Storage (Guest)</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Files are saved to browser localStorage. Works offline but data is limited to this browser.
              </p>
            </div>
            {authMode === "guest" && (
              <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
            )}
          </div>
        </div>
      </div>

      {/* Offline Behavior */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold mb-4">Offline Behavior</h3>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          When offline or in guest mode, all changes are saved to localStorage automatically.
          When connectivity is restored and you&apos;re signed in, pending changes will sync to cloud storage.
          This ensures no data loss regardless of network status.
        </p>
      </div>
    </div>
  );
}
