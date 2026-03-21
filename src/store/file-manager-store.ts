"use client";

import { create } from "zustand";
import type { VFile, FileVersion, FileAuditEntry, DuplicateGroup } from "@/types";

const sampleVersions: Record<string, FileVersion[]> = {
  "1": [
    { id: "v1-3", fileId: "1", version: 3, modifiedBy: "Admin User", modifiedAt: "2024-12-10T14:30:00Z", size: 245000, note: "Updated Q4 metrics" },
    { id: "v1-2", fileId: "1", version: 2, modifiedBy: "Admin User", modifiedAt: "2024-12-05T09:00:00Z", size: 230000, note: "Added financial charts" },
    { id: "v1-1", fileId: "1", version: 1, modifiedBy: "Admin User", modifiedAt: "2024-12-01T10:00:00Z", size: 200000, note: "Initial draft" },
  ],
  "2": [
    { id: "v2-5", fileId: "2", version: 5, modifiedBy: "Admin User", modifiedAt: "2024-12-09T16:45:00Z", size: 1820000, note: "Added regional breakdown" },
    { id: "v2-4", fileId: "2", version: 4, modifiedBy: "Admin User", modifiedAt: "2024-12-03T11:00:00Z", size: 1750000, note: "Fixed formulas" },
    { id: "v2-3", fileId: "2", version: 3, modifiedBy: "Ms. Priya Patel", modifiedAt: "2024-11-25T14:00:00Z", size: 1600000 },
  ],
  "3": [
    { id: "v3-2", fileId: "3", version: 2, modifiedBy: "Admin User", modifiedAt: "2024-12-11T09:15:00Z", size: 5400000, note: "Updated market slides" },
    { id: "v3-1", fileId: "3", version: 1, modifiedBy: "Admin User", modifiedAt: "2024-12-05T11:00:00Z", size: 4800000, note: "Initial upload" },
  ],
  "4": [
    { id: "v4-7", fileId: "4", version: 7, modifiedBy: "Dr. Ananya Sharma", modifiedAt: "2024-12-08T13:00:00Z", size: 890000, note: "Final revision" },
    { id: "v4-6", fileId: "4", version: 6, modifiedBy: "Dr. Ananya Sharma", modifiedAt: "2024-12-01T10:00:00Z", size: 870000 },
  ],
  "5": [
    { id: "v5-1", fileId: "5", version: 1, modifiedBy: "Admin User", modifiedAt: "2024-10-01T10:00:00Z", size: 320000, note: "Initial version" },
  ],
};

const sampleAuditLogs: FileAuditEntry[] = [
  { id: "al1", fileId: "1", action: "modified", performedBy: "Admin User", timestamp: "2024-12-10T14:30:00Z", details: "Updated Q4 metrics section" },
  { id: "al2", fileId: "1", action: "viewed", performedBy: "Ms. Priya Patel", timestamp: "2024-12-10T11:00:00Z" },
  { id: "al3", fileId: "1", action: "shared", performedBy: "Admin User", timestamp: "2024-12-09T16:00:00Z", details: "Shared with Finance team" },
  { id: "al4", fileId: "1", action: "created", performedBy: "Admin User", timestamp: "2024-12-01T10:00:00Z" },
  { id: "al5", fileId: "2", action: "modified", performedBy: "Admin User", timestamp: "2024-12-09T16:45:00Z", details: "Added regional breakdown tabs" },
  { id: "al6", fileId: "2", action: "viewed", performedBy: "Dr. Ananya Sharma", timestamp: "2024-12-09T14:00:00Z" },
  { id: "al7", fileId: "2", action: "moved", performedBy: "Admin User", timestamp: "2024-12-03T09:00:00Z", details: "Moved to Finance folder" },
  { id: "al8", fileId: "3", action: "modified", performedBy: "Admin User", timestamp: "2024-12-11T09:15:00Z", details: "Updated slide deck" },
  { id: "al9", fileId: "3", action: "shared", performedBy: "Admin User", timestamp: "2024-12-08T10:00:00Z", details: "Shared with Product team" },
  { id: "al10", fileId: "4", action: "viewed", performedBy: "Admin User", timestamp: "2024-12-08T13:00:00Z" },
  { id: "al11", fileId: "4", action: "tagged", performedBy: "Dr. Ananya Sharma", timestamp: "2024-12-07T10:00:00Z", details: "Added tag: research" },
  { id: "al12", fileId: "5", action: "created", performedBy: "Admin User", timestamp: "2024-10-01T10:00:00Z" },
  { id: "al13", fileId: "6", action: "modified", performedBy: "Admin User", timestamp: "2024-12-06T10:00:00Z" },
  { id: "al14", fileId: "7", action: "viewed", performedBy: "Ms. Priya Patel", timestamp: "2024-12-05T15:00:00Z" },
  { id: "al15", fileId: "8", action: "shared", performedBy: "Ravi Shankar", timestamp: "2024-12-04T09:00:00Z", details: "Shared with Safety Committee" },
];

interface FileManagerState {
  versions: Record<string, FileVersion[]>;
  auditLogs: FileAuditEntry[];
  duplicateScanResults: DuplicateGroup[] | null;
  scanningDuplicates: boolean;
  selectedFileId: string | null;
  detailPanelTab: "info" | "versions" | "audit" | "tags";

  setSelectedFileId: (id: string | null) => void;
  setDetailPanelTab: (tab: "info" | "versions" | "audit" | "tags") => void;
  getVersions: (fileId: string) => FileVersion[];
  getAuditLogs: (fileId: string) => FileAuditEntry[];
  getAllAuditLogs: () => FileAuditEntry[];
  addAuditLog: (entry: Omit<FileAuditEntry, "id">) => void;
  restoreVersion: (fileId: string, versionId: string) => void;
  scanDuplicates: (files: VFile[]) => void;
  clearDuplicateScan: () => void;
  removeFromDuplicateGroup: (groupId: string, fileId: string) => void;
}

export const useFileManagerStore = create<FileManagerState>()((set, get) => ({
  versions: sampleVersions,
  auditLogs: sampleAuditLogs,
  duplicateScanResults: null,
  scanningDuplicates: false,
  selectedFileId: null,
  detailPanelTab: "info",

  setSelectedFileId: (id) => set({ selectedFileId: id }),
  setDetailPanelTab: (tab) => set({ detailPanelTab: tab }),

  getVersions: (fileId) => get().versions[fileId] || [],
  getAuditLogs: (fileId) => get().auditLogs.filter((l) => l.fileId === fileId),
  getAllAuditLogs: () => get().auditLogs,

  addAuditLog: (entry) =>
    set((state) => ({
      auditLogs: [{ ...entry, id: `al-${Date.now()}` }, ...state.auditLogs],
    })),

  restoreVersion: (fileId, versionId) => {
    const log: FileAuditEntry = {
      id: `al-${Date.now()}`,
      fileId,
      action: "restored",
      performedBy: "Admin User",
      timestamp: new Date().toISOString(),
      details: `Restored to version ${versionId}`,
    };
    set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
  },

  scanDuplicates: (files) => {
    set({ scanningDuplicates: true, duplicateScanResults: null });
    setTimeout(() => {
      const groups: DuplicateGroup[] = [];
      const usedIds = new Set<string>();

      // Find by exact size+type match (simulated hash)
      const bySizeType: Record<string, VFile[]> = {};
      files.forEach((f) => {
        if (f.size && f.size > 0) {
          const key = `${f.size}-${f.type}`;
          bySizeType[key] = [...(bySizeType[key] || []), f];
        }
      });
      Object.values(bySizeType).forEach((group, i) => {
        if (group.length > 1) {
          groups.push({ id: `exact-${i}`, files: group, reason: "exact" });
          group.forEach((f) => usedIds.add(f.id));
        }
      });

      // Find by similar name
      const remaining = files.filter((f) => !usedIds.has(f.id));
      const nameGroups: Record<string, VFile[]> = {};
      remaining.forEach((f) => {
        const normalized = f.name.toLowerCase().replace(/[\s\-_().]/g, "").substring(0, 8);
        nameGroups[normalized] = [...(nameGroups[normalized] || []), f];
      });
      Object.values(nameGroups).forEach((group, i) => {
        if (group.length > 1) {
          groups.push({ id: `similar-${i}`, files: group, reason: "similar-name" });
        }
      });

      set({ scanningDuplicates: false, duplicateScanResults: groups });
    }, 1800);
  },

  clearDuplicateScan: () => set({ duplicateScanResults: null }),

  removeFromDuplicateGroup: (groupId, fileId) =>
    set((state) => ({
      duplicateScanResults:
        state.duplicateScanResults
          ?.map((g) =>
            g.id === groupId ? { ...g, files: g.files.filter((f) => f.id !== fileId) } : g
          )
          .filter((g) => g.files.length > 1) ?? null,
    })),
}));
