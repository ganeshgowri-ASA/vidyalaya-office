"use client";

import { create } from "zustand";

export interface CursorPresence {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  lastUpdated: number;
  isTyping: boolean;
  currentElement?: string;
}

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  color: string;
  avatar?: string;
  isOnline: boolean;
  currentPage: string;
  lastActive: number;
  editingSection?: string;
  cursorPosition?: { x: number; y: number };
}

const CURSOR_COLORS = [
  "#EA4335", "#FBBC04", "#34A853", "#FF6D01",
  "#46BDC6", "#7B1FA2", "#C2185B", "#00897B",
  "#5C6BC0", "#F4511E",
];

const SIMULATED_USERS: ActiveUser[] = [
  {
    id: "rt-user-2",
    name: "Priya Sharma",
    email: "priya@vidyalaya.edu",
    color: CURSOR_COLORS[0],
    isOnline: true,
    currentPage: "document",
    lastActive: Date.now() - 15000,
    editingSection: "Introduction",
  },
  {
    id: "rt-user-3",
    name: "Arjun Patel",
    email: "arjun@vidyalaya.edu",
    color: CURSOR_COLORS[1],
    isOnline: true,
    currentPage: "document",
    lastActive: Date.now() - 5000,
    editingSection: "Conclusion",
  },
  {
    id: "rt-user-4",
    name: "Meera Reddy",
    email: "meera@vidyalaya.edu",
    color: CURSOR_COLORS[2],
    isOnline: false,
    currentPage: "spreadsheet",
    lastActive: Date.now() - 600000,
  },
  {
    id: "rt-user-5",
    name: "Vikram Singh",
    email: "vikram@vidyalaya.edu",
    color: CURSOR_COLORS[3],
    isOnline: true,
    currentPage: "presentation",
    lastActive: Date.now() - 30000,
    editingSection: "Slide 3",
  },
];

const SIMULATED_CURSORS: CursorPresence[] = [
  {
    userId: "rt-user-2",
    name: "Priya Sharma",
    color: CURSOR_COLORS[0],
    x: 320,
    y: 180,
    lastUpdated: Date.now(),
    isTyping: true,
    currentElement: "paragraph-2",
  },
  {
    userId: "rt-user-3",
    name: "Arjun Patel",
    color: CURSOR_COLORS[1],
    x: 480,
    y: 420,
    lastUpdated: Date.now(),
    isTyping: false,
    currentElement: "paragraph-5",
  },
];

interface RealtimeState {
  // Cursor presence
  cursors: CursorPresence[];
  localCursor: CursorPresence | null;

  // Active users
  activeUsers: ActiveUser[];

  // Sync status
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  pendingChanges: number;

  // Simulation state
  isSimulating: boolean;

  // Actions
  updateCursor: (cursor: CursorPresence) => void;
  removeCursor: (userId: string) => void;
  setLocalCursor: (cursor: CursorPresence | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setSyncedNow: () => void;
  incrementPendingChanges: () => void;
  clearPendingChanges: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setActiveUsers: (users: ActiveUser[]) => void;
  updateUserPresence: (userId: string, update: Partial<ActiveUser>) => void;

  // Computed
  onlineUserCount: () => number;
  getColorForUser: (userId: string) => string;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  cursors: SIMULATED_CURSORS,
  localCursor: null,
  activeUsers: SIMULATED_USERS,
  syncStatus: "synced",
  lastSyncedAt: Date.now(),
  pendingChanges: 0,
  isSimulating: false,

  updateCursor: (cursor) =>
    set((s) => {
      const idx = s.cursors.findIndex((c) => c.userId === cursor.userId);
      if (idx >= 0) {
        const updated = [...s.cursors];
        updated[idx] = cursor;
        return { cursors: updated };
      }
      return { cursors: [...s.cursors, cursor] };
    }),

  removeCursor: (userId) =>
    set((s) => ({ cursors: s.cursors.filter((c) => c.userId !== userId) })),

  setLocalCursor: (cursor) => set({ localCursor: cursor }),

  setSyncStatus: (status) => set({ syncStatus: status }),

  setSyncedNow: () =>
    set({ syncStatus: "synced", lastSyncedAt: Date.now(), pendingChanges: 0 }),

  incrementPendingChanges: () =>
    set((s) => ({ pendingChanges: s.pendingChanges + 1, syncStatus: "syncing" })),

  clearPendingChanges: () =>
    set({ pendingChanges: 0, syncStatus: "synced", lastSyncedAt: Date.now() }),

  startSimulation: () => set({ isSimulating: true }),
  stopSimulation: () => set({ isSimulating: false }),

  setActiveUsers: (users) => set({ activeUsers: users }),

  updateUserPresence: (userId, update) =>
    set((s) => ({
      activeUsers: s.activeUsers.map((u) =>
        u.id === userId ? { ...u, ...update } : u
      ),
    })),

  onlineUserCount: () => get().activeUsers.filter((u) => u.isOnline).length,

  getColorForUser: (userId) => {
    const user = get().activeUsers.find((u) => u.id === userId);
    if (user) return user.color;
    // Deterministic color from userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
    }
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
  },
}));
