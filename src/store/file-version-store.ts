'use client';

import { create } from 'zustand';
import {
  type StoredVersion,
  saveVersion,
  getVersionsByFileId,
  deleteVersion,
  computeContentSize,
} from '@/lib/indexeddb-versions';

export interface FileVersionMeta {
  id: string;
  fileId: string;
  fileType: string;
  timestamp: string;
  author: string;
  label: string;
  size: number;
  isAutoSave: boolean;
}

interface FileVersionState {
  // Current file context
  activeFileId: string | null;
  activeFileType: string;

  // Version list (metadata only, content loaded on demand)
  versions: FileVersionMeta[];
  loading: boolean;

  // Panel & diff state
  showPanel: boolean;
  selectedVersionId: string | null;
  compareVersionId: string | null;
  diffViewActive: boolean;
  diffViewMode: 'unified' | 'side-by-side';

  // Restore confirmation
  restoreConfirmId: string | null;

  // Auto-save
  autoSaveIntervalMs: number;
  lastAutoSaveAt: string | null;
  autoSaveEnabled: boolean;

  // Actions
  setActiveFile: (fileId: string, fileType: string) => void;
  loadVersions: () => Promise<void>;
  createVersion: (content: string, label: string, author: string, isAutoSave: boolean) => Promise<void>;
  removeVersion: (id: string) => Promise<void>;
  setShowPanel: (val: boolean) => void;
  setSelectedVersion: (id: string | null) => void;
  setCompareVersion: (id: string | null) => void;
  setDiffViewActive: (val: boolean) => void;
  setDiffViewMode: (mode: 'unified' | 'side-by-side') => void;
  setRestoreConfirmId: (id: string | null) => void;
  setAutoSaveEnabled: (val: boolean) => void;
  setAutoSaveInterval: (ms: number) => void;
  setLastAutoSaveAt: (ts: string) => void;
}

export const useFileVersionStore = create<FileVersionState>()((set, get) => ({
  activeFileId: null,
  activeFileType: 'document',
  versions: [],
  loading: false,
  showPanel: false,
  selectedVersionId: null,
  compareVersionId: null,
  diffViewActive: false,
  diffViewMode: 'side-by-side',
  restoreConfirmId: null,
  autoSaveIntervalMs: 5 * 60 * 1000,
  lastAutoSaveAt: null,
  autoSaveEnabled: true,

  setActiveFile: (fileId, fileType) => {
    set({ activeFileId: fileId, activeFileType: fileType, versions: [], selectedVersionId: null, compareVersionId: null });
    // Load versions after setting file
    setTimeout(() => get().loadVersions(), 0);
  },

  loadVersions: async () => {
    const { activeFileId } = get();
    if (!activeFileId) return;
    set({ loading: true });
    try {
      const stored = await getVersionsByFileId(activeFileId);
      const metas: FileVersionMeta[] = stored.map((v) => ({
        id: v.id,
        fileId: v.fileId,
        fileType: v.fileType,
        timestamp: v.timestamp,
        author: v.author,
        label: v.label,
        size: v.size,
        isAutoSave: v.isAutoSave,
      }));
      set({ versions: metas, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createVersion: async (content, label, author, isAutoSave) => {
    const { activeFileId, activeFileType } = get();
    if (!activeFileId) return;
    const version: StoredVersion = {
      id: `fv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fileId: activeFileId,
      fileType: activeFileType,
      content,
      timestamp: new Date().toISOString(),
      author,
      label,
      size: computeContentSize(content),
      isAutoSave,
    };
    try {
      await saveVersion(version);
      if (isAutoSave) {
        set({ lastAutoSaveAt: version.timestamp });
      }
      await get().loadVersions();
    } catch {
      // IndexedDB write failed silently
    }
  },

  removeVersion: async (id) => {
    try {
      await deleteVersion(id);
      await get().loadVersions();
    } catch {
      // silently fail
    }
  },

  setShowPanel: (val) => set({ showPanel: val }),
  setSelectedVersion: (id) => set({ selectedVersionId: id }),
  setCompareVersion: (id) => set({ compareVersionId: id }),
  setDiffViewActive: (val) => set({ diffViewActive: val }),
  setDiffViewMode: (mode) => set({ diffViewMode: mode }),
  setRestoreConfirmId: (id) => set({ restoreConfirmId: id }),
  setAutoSaveEnabled: (val) => set({ autoSaveEnabled: val }),
  setAutoSaveInterval: (ms) => set({ autoSaveIntervalMs: ms }),
  setLastAutoSaveAt: (ts) => set({ lastAutoSaveAt: ts }),
}));
