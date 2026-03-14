"use client";

import { create } from "zustand";
import type { VFile, FileType } from "@/types";

type ActiveModule = "dashboard" | "document" | "spreadsheet" | "presentation" | "pdf" | "templates" | "review";

const sampleFiles: VFile[] = [
  {
    id: "1",
    name: "Q4 Business Report",
    type: "document",
    content: "",
    created: "2024-12-01T10:00:00Z",
    modified: "2024-12-10T14:30:00Z",
    owner: "user-1",
    tags: ["business", "quarterly"],
    version: 3,
    starred: true,
  },
  {
    id: "2",
    name: "Sales Dashboard 2024",
    type: "spreadsheet",
    content: "",
    created: "2024-11-15T09:00:00Z",
    modified: "2024-12-09T16:45:00Z",
    owner: "user-1",
    tags: ["sales", "dashboard"],
    version: 5,
    starred: false,
  },
  {
    id: "3",
    name: "Product Launch Deck",
    type: "presentation",
    content: "",
    created: "2024-12-05T11:00:00Z",
    modified: "2024-12-11T09:15:00Z",
    owner: "user-1",
    tags: ["product", "launch"],
    version: 2,
    starred: true,
  },
  {
    id: "4",
    name: "Research Paper Draft",
    type: "document",
    content: "",
    created: "2024-11-20T08:00:00Z",
    modified: "2024-12-08T13:00:00Z",
    owner: "user-1",
    tags: ["research", "academic"],
    version: 7,
    starred: false,
  },
  {
    id: "5",
    name: "Invoice Template",
    type: "pdf",
    content: "",
    created: "2024-10-01T10:00:00Z",
    modified: "2024-12-07T11:30:00Z",
    owner: "user-1",
    tags: ["finance", "template"],
    version: 1,
    starred: true,
  },
  {
    id: "6",
    name: "Team Training Session",
    type: "presentation",
    content: "",
    created: "2024-12-03T14:00:00Z",
    modified: "2024-12-06T10:00:00Z",
    owner: "user-1",
    tags: ["training", "team"],
    version: 2,
    starred: false,
  },
];

interface AppState {
  activeModule: ActiveModule;
  sidebarOpen: boolean;
  recentFiles: VFile[];
  setActiveModule: (module: ActiveModule) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addRecentFile: (file: VFile) => void;
  toggleStar: (fileId: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  activeModule: "dashboard",
  sidebarOpen: true,
  recentFiles: sampleFiles,
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
}));
