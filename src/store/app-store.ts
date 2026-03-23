"use client";

import { create } from "zustand";
import type { VFile, VFolder, FileType, ActivityItem } from "@/types";

type ActiveModule = "dashboard" | "document" | "spreadsheet" | "presentation" | "pdf" | "templates" | "review" | "file-manager" | "trash" | "profile" | "search";

const sampleFiles: VFile[] = [
  {
    id: "1",
    name: "Q4 Business Report",
    type: "document",
    content: "This quarterly report covers the performance metrics and strategic initiatives undertaken during Q4. Revenue exceeded targets by 15% driven by strong product adoption.",
    created: "2024-12-01T10:00:00Z",
    modified: "2024-12-10T14:30:00Z",
    owner: "Admin User",
    tags: ["business", "quarterly"],
    version: 3,
    starred: true,
    size: 245000,
    folderId: "folder-1",
  },
  {
    id: "2",
    name: "Sales Dashboard 2024",
    type: "spreadsheet",
    content: "Monthly sales data aggregated across all regions. Includes pivot tables for regional comparison and YoY growth analysis.",
    created: "2024-11-15T09:00:00Z",
    modified: "2024-12-09T16:45:00Z",
    owner: "Admin User",
    tags: ["sales", "dashboard"],
    version: 5,
    starred: false,
    size: 1820000,
    folderId: "folder-2",
  },
  {
    id: "3",
    name: "Product Launch Deck",
    type: "presentation",
    content: "Comprehensive launch deck for the new AI-powered analytics suite. Includes market analysis, product features, and go-to-market strategy.",
    created: "2024-12-05T11:00:00Z",
    modified: "2024-12-11T09:15:00Z",
    owner: "Admin User",
    tags: ["product", "launch"],
    version: 2,
    starred: true,
    size: 5400000,
    folderId: "folder-1",
  },
  {
    id: "4",
    name: "Research Paper Draft",
    type: "document",
    content: "A comprehensive study on the impact of artificial intelligence on educational outcomes in higher education institutions across South Asia.",
    created: "2024-11-20T08:00:00Z",
    modified: "2024-12-08T13:00:00Z",
    owner: "Dr. Ananya Sharma",
    tags: ["research", "academic"],
    version: 7,
    starred: false,
    size: 890000,
    folderId: "folder-3",
  },
  {
    id: "5",
    name: "Invoice Template",
    type: "pdf",
    content: "Standard invoice template with company branding, itemized billing fields, tax calculations, and payment terms.",
    created: "2024-10-01T10:00:00Z",
    modified: "2024-12-07T11:30:00Z",
    owner: "Admin User",
    tags: ["finance", "template"],
    version: 1,
    starred: true,
    size: 320000,
    folderId: "folder-2",
  },
  {
    id: "6",
    name: "Team Training Session",
    type: "presentation",
    content: "Interactive training slides covering new software tools, best practices, and team collaboration workflows.",
    created: "2024-12-03T14:00:00Z",
    modified: "2024-12-06T10:00:00Z",
    owner: "Admin User",
    tags: ["training", "team"],
    version: 2,
    starred: false,
    size: 3200000,
    folderId: "folder-4",
  },
  {
    id: "7",
    name: "Annual Budget Proposal",
    type: "spreadsheet",
    content: "Detailed budget allocation for FY2025 including departmental breakdowns, capital expenditure, and operational costs.",
    created: "2024-11-01T08:00:00Z",
    modified: "2024-12-05T15:00:00Z",
    owner: "Ms. Priya Patel",
    tags: ["budget", "finance"],
    version: 4,
    starred: false,
    size: 2100000,
    folderId: "folder-2",
  },
  {
    id: "8",
    name: "Campus Safety Audit",
    type: "pdf",
    content: "Comprehensive safety audit report covering fire safety, emergency exits, electrical compliance, and structural integrity assessments.",
    created: "2024-11-25T10:00:00Z",
    modified: "2024-12-04T09:00:00Z",
    owner: "Ravi Shankar",
    tags: ["safety", "audit"],
    version: 1,
    starred: false,
    size: 4500000,
    folderId: "folder-3",
  },
];

const sampleFolders: VFolder[] = [
  { id: "folder-root", name: "My Files", parentId: null, created: "2024-01-01T00:00:00Z", modified: "2024-12-10T14:30:00Z" },
  { id: "folder-1", name: "Business", parentId: "folder-root", created: "2024-06-01T10:00:00Z", modified: "2024-12-10T14:30:00Z" },
  { id: "folder-2", name: "Finance", parentId: "folder-root", created: "2024-06-15T10:00:00Z", modified: "2024-12-09T16:45:00Z" },
  { id: "folder-3", name: "Academic", parentId: "folder-root", created: "2024-07-01T10:00:00Z", modified: "2024-12-08T13:00:00Z" },
  { id: "folder-4", name: "Training", parentId: "folder-root", created: "2024-08-01T10:00:00Z", modified: "2024-12-06T10:00:00Z" },
  { id: "folder-5", name: "Reports", parentId: "folder-1", created: "2024-09-01T10:00:00Z", modified: "2024-12-05T15:00:00Z" },
];

const sampleTrash: VFile[] = [
  {
    id: "t1",
    name: "Old Template Draft",
    type: "document",
    content: "",
    created: "2024-09-01T10:00:00Z",
    modified: "2024-11-20T10:00:00Z",
    owner: "Admin User",
    tags: ["template"],
    version: 1,
    size: 120000,
    deleted: true,
    deletedAt: "2024-12-08T10:00:00Z",
  },
  {
    id: "t2",
    name: "Duplicate Budget Sheet",
    type: "spreadsheet",
    content: "",
    created: "2024-10-01T10:00:00Z",
    modified: "2024-11-15T10:00:00Z",
    owner: "Admin User",
    tags: ["budget"],
    version: 1,
    size: 850000,
    deleted: true,
    deletedAt: "2024-12-05T14:00:00Z",
  },
  {
    id: "t3",
    name: "Test Presentation",
    type: "presentation",
    content: "",
    created: "2024-08-01T10:00:00Z",
    modified: "2024-10-20T10:00:00Z",
    owner: "Admin User",
    tags: ["test"],
    version: 1,
    size: 2400000,
    deleted: true,
    deletedAt: "2024-12-01T09:00:00Z",
  },
];

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

const sampleNotifications: Notification[] = [
  { id: "n1", title: "Document Approved", message: "Staff Recruitment Policy has been approved by Ms. Priya Patel", timestamp: "2026-03-15T09:30:00Z", read: false, type: "success" },
  { id: "n2", title: "New Comment", message: "Dr. Ananya Sharma commented on Annual Budget Proposal 2026", timestamp: "2026-03-15T08:15:00Z", read: false, type: "info" },
  { id: "n3", title: "Review Requested", message: "Campus Safety Audit requires your review", timestamp: "2026-03-14T16:05:00Z", read: false, type: "warning" },
  { id: "n4", title: "Document Rejected", message: "IT Infrastructure Upgrade Plan was rejected", timestamp: "2026-03-14T11:00:00Z", read: true, type: "error" },
  { id: "n5", title: "New Submission", message: "Student Welfare Committee Report was submitted", timestamp: "2026-03-12T10:00:00Z", read: true, type: "info" },
];

const sampleActivities: ActivityItem[] = [
  { id: "a1", action: "edited", item: "Q4 Business Report", tool: "Document", user: "You", time: "5 minutes ago", type: "edit" },
  { id: "a2", action: "approved", item: "Staff Recruitment Policy", tool: "Review", user: "Ms. Priya Patel", time: "2 hours ago", type: "approve" },
  { id: "a3", action: "commented on", item: "Annual Budget Proposal", tool: "Review", user: "Dr. Ananya Sharma", time: "3 hours ago", type: "comment" },
  { id: "a4", action: "shared", item: "Product Launch Deck", tool: "Presentation", user: "You", time: "4 hours ago", type: "share" },
  { id: "a5", action: "uploaded", item: "Campus Safety Audit", tool: "PDF Tools", user: "Ravi Shankar", time: "Yesterday", type: "upload" },
  { id: "a6", action: "created", item: "Sales Dashboard 2024", tool: "Spreadsheet", user: "You", time: "Yesterday", type: "create" },
  { id: "a7", action: "deleted", item: "Old Template Draft", tool: "Templates", user: "You", time: "2 days ago", type: "delete" },
  { id: "a8", action: "commented on", item: "Research Paper Draft", tool: "Document", user: "Dr. Ananya Sharma", time: "3 days ago", type: "comment" },
];

interface AppState {
  activeModule: ActiveModule;
  sidebarOpen: boolean;
  recentFiles: VFile[];
  folders: VFolder[];
  trash: VFile[];
  notifications: Notification[];
  activities: ActivityItem[];
  showKeyboardShortcuts: boolean;
  showCommandPalette: boolean;
  searchQuery: string;
  onboardingComplete: boolean;
  dashboardView: "grid" | "list";

  setActiveModule: (module: ActiveModule) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addRecentFile: (file: VFile) => void;
  toggleStar: (fileId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setShowKeyboardShortcuts: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setDashboardView: (view: "grid" | "list") => void;

  // File operations
  renameFile: (fileId: string, newName: string) => void;
  duplicateFile: (fileId: string) => void;
  deleteFile: (fileId: string) => void;
  moveFile: (fileId: string, folderId: string) => void;
  addTagToFile: (fileId: string, tag: string) => void;
  removeTagFromFile: (fileId: string, tag: string) => void;
  copyFile: (fileId: string, targetFolderId: string) => void;

  // Folder operations
  createFolder: (name: string, parentId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  createFile: (name: string, type: FileType, folderId: string) => void;

  // Trash operations
  restoreFile: (fileId: string) => void;
  permanentDelete: (fileId: string) => void;
  emptyTrash: () => void;

  // Onboarding
  setOnboardingComplete: (complete: boolean) => void;
}

let fileCounter = 100;

export const useAppStore = create<AppState>()((set) => ({
  activeModule: "dashboard",
  sidebarOpen: true,
  recentFiles: sampleFiles,
  folders: sampleFolders,
  trash: sampleTrash,
  notifications: sampleNotifications,
  activities: sampleActivities,
  showKeyboardShortcuts: false,
  showCommandPalette: false,
  searchQuery: "",
  onboardingComplete: false,
  dashboardView: "grid",

  setActiveModule: (module) => set({ activeModule: module }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addRecentFile: (file) =>
    set((state) => ({
      recentFiles: [file, ...state.recentFiles.filter((f) => f.id !== file.id)].slice(0, 20),
    })),
  toggleStar: (fileId) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === fileId ? { ...f, starred: !f.starred } : f
      ),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  setShowKeyboardShortcuts: (show) => set({ showKeyboardShortcuts: show }),
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDashboardView: (view) => set({ dashboardView: view }),

  // File operations
  renameFile: (fileId, newName) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === fileId ? { ...f, name: newName, modified: new Date().toISOString() } : f
      ),
    })),
  duplicateFile: (fileId) =>
    set((state) => {
      const original = state.recentFiles.find((f) => f.id === fileId);
      if (!original) return state;
      const newFile: VFile = {
        ...original,
        id: `dup-${++fileCounter}`,
        name: `${original.name} (Copy)`,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: 1,
        starred: false,
      };
      return { recentFiles: [newFile, ...state.recentFiles] };
    }),
  deleteFile: (fileId) =>
    set((state) => {
      const file = state.recentFiles.find((f) => f.id === fileId);
      if (!file) return state;
      return {
        recentFiles: state.recentFiles.filter((f) => f.id !== fileId),
        trash: [{ ...file, deleted: true, deletedAt: new Date().toISOString() }, ...state.trash],
      };
    }),
  moveFile: (fileId, folderId) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === fileId ? { ...f, folderId, modified: new Date().toISOString() } : f
      ),
    })),
  addTagToFile: (fileId, tag) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === fileId
          ? { ...f, tags: f.tags.includes(tag) ? f.tags : [...f.tags, tag] }
          : f
      ),
    })),
  removeTagFromFile: (fileId, tag) =>
    set((state) => ({
      recentFiles: state.recentFiles.map((f) =>
        f.id === fileId ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f
      ),
    })),
  copyFile: (fileId, targetFolderId) =>
    set((state) => {
      const original = state.recentFiles.find((f) => f.id === fileId);
      if (!original) return state;
      const copied: VFile = {
        ...original,
        id: `copy-${++fileCounter}`,
        name: `${original.name} (Copy)`,
        folderId: targetFolderId,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: 1,
        starred: false,
      };
      return { recentFiles: [copied, ...state.recentFiles] };
    }),

  // Folder operations
  createFolder: (name, parentId) =>
    set((state) => ({
      folders: [
        ...state.folders,
        {
          id: `folder-${++fileCounter}`,
          name,
          parentId,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      ],
    })),
  renameFolder: (folderId, newName) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, name: newName, modified: new Date().toISOString() } : f
      ),
    })),
  deleteFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
      recentFiles: state.recentFiles.map((f) =>
        f.folderId === folderId ? { ...f, folderId: "folder-root" } : f
      ),
    })),
  createFile: (name, type, folderId) =>
    set((state) => ({
      recentFiles: [
        {
          id: `file-${++fileCounter}`,
          name,
          type,
          content: "",
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          owner: "Admin User",
          tags: [],
          version: 1,
          starred: false,
          size: 0,
          folderId,
        },
        ...state.recentFiles,
      ],
    })),

  // Trash operations
  restoreFile: (fileId) =>
    set((state) => {
      const file = state.trash.find((f) => f.id === fileId);
      if (!file) return state;
      const restored: VFile = { ...file, deleted: false, deletedAt: undefined };
      return {
        trash: state.trash.filter((f) => f.id !== fileId),
        recentFiles: [restored, ...state.recentFiles],
      };
    }),
  permanentDelete: (fileId) =>
    set((state) => ({
      trash: state.trash.filter((f) => f.id !== fileId),
    })),
  emptyTrash: () => set({ trash: [] }),

  // Onboarding
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
}));
