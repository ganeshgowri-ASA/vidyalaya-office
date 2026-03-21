"use client";

import { create } from "zustand";
import type { VFile } from "@/types";
import type { UploadProgress, DownloadProgress, StorageUsage } from "@/lib/cloud-storage";
import {
  uploadFileToCloud,
  downloadFileFromCloud,
  deleteFileFromCloud,
  getStorageUsage,
  saveToLocalStorage,
  loadFromLocalStorage,
  formatBytes,
} from "@/lib/cloud-storage";

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";
export type AuthMode = "authenticated" | "guest";

interface CloudStorageState {
  // Auth & connectivity
  authMode: AuthMode;
  userId: string;
  isOnline: boolean;

  // Sync state
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  autoSaveEnabled: boolean;
  autoSaveIntervalMs: number;

  // Progress tracking
  uploads: Record<string, UploadProgress>;
  downloads: Record<string, DownloadProgress>;

  // Storage usage
  storageUsage: StorageUsage | null;
  storageLoading: boolean;

  // Pending changes (files modified since last sync)
  pendingFileIds: Set<string>;

  // Actions
  setAuthMode: (mode: AuthMode) => void;
  setUserId: (id: string) => void;
  setOnline: (online: boolean) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;

  // File operations
  uploadFile: (file: VFile, content: string) => Promise<void>;
  downloadFile: (fileId: string, fileName: string) => Promise<string | null>;
  deleteCloudFile: (fileId: string, fileName: string) => Promise<void>;
  markFilePending: (fileId: string) => void;
  clearPending: (fileId: string) => void;

  // Auto-save
  saveFileWithFallback: (file: VFile, content: string) => Promise<void>;

  // Storage usage
  refreshStorageUsage: (files: VFile[]) => Promise<void>;

  // Bulk sync
  syncAllPending: (files: VFile[]) => Promise<void>;

  // Progress management
  clearUploadProgress: (fileId: string) => void;
  clearDownloadProgress: (fileId: string) => void;
}

export const useCloudStorageStore = create<CloudStorageState>()((set, get) => ({
  authMode: "guest",
  userId: "guest-user",
  isOnline: true,
  syncStatus: "idle",
  lastSyncedAt: null,
  autoSaveEnabled: true,
  autoSaveIntervalMs: 30000, // 30 seconds
  uploads: {},
  downloads: {},
  storageUsage: null,
  storageLoading: false,
  pendingFileIds: new Set<string>(),

  setAuthMode: (mode) => set({ authMode: mode }),
  setUserId: (id) => set({ userId: id }),
  setOnline: (online) =>
    set({
      isOnline: online,
      syncStatus: online ? "idle" : "offline",
    }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),

  uploadFile: async (file, content) => {
    const { authMode, userId } = get();

    // Always save to localStorage
    saveToLocalStorage(file.id, content);

    if (authMode === "guest") return;

    set((state) => ({
      uploads: {
        ...state.uploads,
        [file.id]: {
          fileId: file.id,
          fileName: file.name,
          progress: 0,
          status: "uploading",
        },
      },
      syncStatus: "syncing",
    }));

    try {
      await uploadFileToCloud(userId, file, content, (progress) => {
        set((state) => ({
          uploads: {
            ...state.uploads,
            [file.id]: {
              ...state.uploads[file.id],
              progress,
            },
          },
        }));
      });

      set((state) => ({
        uploads: {
          ...state.uploads,
          [file.id]: {
            ...state.uploads[file.id],
            progress: 100,
            status: "completed",
          },
        },
        syncStatus: "synced",
        lastSyncedAt: new Date().toISOString(),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      set((state) => ({
        uploads: {
          ...state.uploads,
          [file.id]: {
            ...state.uploads[file.id],
            progress: 0,
            status: "error",
            error: message,
          },
        },
        syncStatus: "error",
      }));
    }
  },

  downloadFile: async (fileId, fileName) => {
    const { authMode, userId } = get();

    // Try localStorage first
    const localContent = loadFromLocalStorage(fileId);

    if (authMode === "guest") return localContent;

    set((state) => ({
      downloads: {
        ...state.downloads,
        [fileId]: {
          fileId,
          fileName,
          progress: 0,
          status: "downloading",
        },
      },
    }));

    try {
      const blob = await downloadFileFromCloud(userId, fileId, fileName, (progress) => {
        set((state) => ({
          downloads: {
            ...state.downloads,
            [fileId]: {
              ...state.downloads[fileId],
              progress,
            },
          },
        }));
      });

      if (blob) {
        const text = await blob.text();
        set((state) => ({
          downloads: {
            ...state.downloads,
            [fileId]: {
              ...state.downloads[fileId],
              progress: 100,
              status: "completed",
            },
          },
        }));
        // Cache in localStorage
        saveToLocalStorage(fileId, text);
        return text;
      }

      set((state) => ({
        downloads: {
          ...state.downloads,
          [fileId]: {
            ...state.downloads[fileId],
            progress: 100,
            status: "completed",
          },
        },
      }));
      return localContent;
    } catch {
      set((state) => ({
        downloads: {
          ...state.downloads,
          [fileId]: {
            ...state.downloads[fileId],
            progress: 0,
            status: "error",
            error: "Download failed",
          },
        },
      }));
      return localContent; // Fallback to local
    }
  },

  deleteCloudFile: async (fileId, fileName) => {
    const { authMode, userId } = get();
    if (authMode !== "guest") {
      await deleteFileFromCloud(userId, fileId, fileName);
    }
    try {
      localStorage.removeItem(`vfile_${fileId}`);
      localStorage.removeItem(`vfile_${fileId}_ts`);
    } catch {
      // ignore
    }
  },

  markFilePending: (fileId) =>
    set((state) => {
      const next = new Set(state.pendingFileIds);
      next.add(fileId);
      return { pendingFileIds: next };
    }),

  clearPending: (fileId) =>
    set((state) => {
      const next = new Set(state.pendingFileIds);
      next.delete(fileId);
      return { pendingFileIds: next };
    }),

  saveFileWithFallback: async (file, content) => {
    const { authMode, isOnline } = get();

    // Always save locally
    saveToLocalStorage(file.id, content);

    if (authMode === "authenticated" && isOnline) {
      await get().uploadFile(file, content);
      get().clearPending(file.id);
    } else {
      get().markFilePending(file.id);
    }
  },

  refreshStorageUsage: async (files) => {
    const { userId } = get();
    set({ storageLoading: true });
    try {
      const usage = await getStorageUsage(userId, files);
      set({ storageUsage: usage, storageLoading: false });
    } catch {
      // Calculate locally
      let usedBytes = 0;
      const byType: Record<string, number> = {};
      files.forEach((f) => {
        const s = f.size || 0;
        usedBytes += s;
        byType[f.type] = (byType[f.type] || 0) + s;
      });
      set({
        storageUsage: {
          usedBytes,
          quotaBytes: 5 * 1024 * 1024 * 1024,
          fileCount: files.length,
          byType,
        },
        storageLoading: false,
      });
    }
  },

  syncAllPending: async (files) => {
    const { pendingFileIds, authMode, isOnline } = get();
    if (authMode === "guest" || !isOnline || pendingFileIds.size === 0) return;

    set({ syncStatus: "syncing" });

    for (const fileId of Array.from(pendingFileIds)) {
      const file = files.find((f) => f.id === fileId);
      if (!file) continue;

      const content = loadFromLocalStorage(fileId);
      if (content) {
        await get().uploadFile(file, content);
        get().clearPending(fileId);
      }
    }

    set({ syncStatus: "synced", lastSyncedAt: new Date().toISOString() });
  },

  clearUploadProgress: (fileId) =>
    set((state) => {
      const next = { ...state.uploads };
      delete next[fileId];
      return { uploads: next };
    }),

  clearDownloadProgress: (fileId) =>
    set((state) => {
      const next = { ...state.downloads };
      delete next[fileId];
      return { downloads: next };
    }),
}));

export { formatBytes };
