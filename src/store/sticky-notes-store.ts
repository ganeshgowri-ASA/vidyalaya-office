"use client";
import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type StickyColor = "yellow" | "pink" | "blue" | "green" | "purple" | "orange";
export type StickyPriority = "urgent" | "high" | "medium" | "low";

export type PinnedTarget = {
  type: "document" | "meeting" | "note";
  id: string;
  label: string;
};

export type StickyNote = {
  id: string;
  title: string;
  content: string;
  color: StickyColor;
  priority: StickyPriority;
  dueDate: string | null;
  reminderAt: string | null;
  pinnedTo: PinnedTarget | null;
  position: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export const STICKY_COLORS: Record<StickyColor, { bg: string; border: string; text: string; label: string }> = {
  yellow:  { bg: "#fef08a", border: "#facc15", text: "#713f12", label: "Yellow" },
  pink:    { bg: "#fbcfe8", border: "#f472b6", text: "#831843", label: "Pink" },
  blue:    { bg: "#bfdbfe", border: "#60a5fa", text: "#1e3a5f", label: "Blue" },
  green:   { bg: "#bbf7d0", border: "#4ade80", text: "#14532d", label: "Green" },
  purple:  { bg: "#ddd6fe", border: "#a78bfa", text: "#3b0764", label: "Purple" },
  orange:  { bg: "#fed7aa", border: "#fb923c", text: "#7c2d12", label: "Orange" },
};

export const PRIORITY_CONFIG: Record<StickyPriority, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "#ef4444", dot: "bg-red-500" },
  high:   { label: "High",   color: "#f97316", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "#eab308", dot: "bg-yellow-500" },
  low:    { label: "Low",    color: "#22c55e", dot: "bg-green-500" },
};

interface StickyNotesState {
  notes: StickyNote[];
  selectedId: string | null;
  editingId: string | null;
  searchQuery: string;
  filterColor: StickyColor | "all";
  filterPriority: StickyPriority | "all";

  // Actions
  selectNote: (id: string | null) => void;
  setEditing: (id: string | null) => void;
  setSearch: (q: string) => void;
  setFilterColor: (c: StickyColor | "all") => void;
  setFilterPriority: (p: StickyPriority | "all") => void;
  createNote: (color?: StickyColor) => void;
  updateNote: (id: string, changes: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  moveNote: (id: string, position: { x: number; y: number }) => void;
  pinNote: (id: string, target: PinnedTarget | null) => void;
}

const now = () => new Date().toISOString();
const daysFromNow = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().split("T")[0];
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

/** Format a timestamp for display. Recent = relative ("2 min ago"), older = absolute ("Mar 25, 2:34 PM"). */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + ", " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const SAMPLE_NOTES: StickyNote[] = [
  {
    id: "sn1",
    title: "Sprint Review Prep",
    content: "Prepare demo slides for sprint 14 review.\n- Auth redesign demo\n- Performance metrics\n- PDF export showcase",
    color: "yellow",
    priority: "high",
    dueDate: daysFromNow(2),
    reminderAt: null,
    pinnedTo: { type: "document", id: "doc1", label: "Sprint 14 Board" },
    position: { x: 60, y: 80 },
    createdAt: hoursAgo(26),
    updatedAt: minsAgo(15),
    tags: ["sprint", "demo"],
  },
  {
    id: "sn2",
    title: "Fix critical auth bug",
    content: "OAuth token refresh is broken on mobile. Reproduce steps:\n1. Login via Google\n2. Leave app idle 30 min\n3. Token expires, no refresh",
    color: "pink",
    priority: "urgent",
    dueDate: daysFromNow(1),
    reminderAt: null,
    pinnedTo: null,
    position: { x: 360, y: 80 },
    createdAt: minsAgo(45),
    updatedAt: minsAgo(3),
    tags: ["bug", "auth"],
  },
  {
    id: "sn3",
    title: "Team Lunch 🍕",
    content: "Friday team lunch at Olive Garden.\nConfirm dietary restrictions by Thursday.",
    color: "green",
    priority: "low",
    dueDate: daysFromNow(4),
    reminderAt: null,
    pinnedTo: { type: "meeting", id: "mtg1", label: "Team Weekly" },
    position: { x: 660, y: 80 },
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(2),
    tags: ["team", "social"],
  },
  {
    id: "sn4",
    title: "API Rate Limiting",
    content: "Implement rate limiting on public endpoints:\n- Max 100 req/min per user\n- Max 1000 req/min per IP\n- Return 429 with Retry-After header",
    color: "blue",
    priority: "medium",
    dueDate: daysFromNow(7),
    reminderAt: null,
    pinnedTo: null,
    position: { x: 60, y: 340 },
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(48),
    tags: ["backend", "security"],
  },
  {
    id: "sn5",
    title: "Design System Update",
    content: "Update color tokens for dark mode:\n- Replace hardcoded hex with CSS variables\n- Add new 'surface' and 'overlay' tokens\n- Document in Storybook",
    color: "purple",
    priority: "medium",
    dueDate: daysFromNow(10),
    reminderAt: null,
    pinnedTo: null,
    position: { x: 360, y: 340 },
    createdAt: hoursAgo(120),
    updatedAt: hoursAgo(96),
    tags: ["design", "frontend"],
  },
  {
    id: "sn6",
    title: "Q2 Budget Review",
    content: "Check cloud spend vs budget:\n- AWS: $4,200 / $4,500\n- Vercel: $180 / $200\n- GitHub: $120 / $150\nNeed approval for extra $500 AI credits.",
    color: "orange",
    priority: "high",
    dueDate: daysFromNow(3),
    reminderAt: null,
    pinnedTo: { type: "document", id: "doc2", label: "Q2 Budget Sheet" },
    position: { x: 660, y: 340 },
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(1),
    tags: ["finance", "q2"],
  },
];

export const useStickyNotesStore = create<StickyNotesState>((set, get) => ({
  notes: SAMPLE_NOTES,
  selectedId: null,
  editingId: null,
  searchQuery: "",
  filterColor: "all",
  filterPriority: "all",

  selectNote: (id) => set({ selectedId: id }),
  setEditing: (id) => set({ editingId: id }),
  setSearch: (q) => set({ searchQuery: q }),
  setFilterColor: (c) => set({ filterColor: c }),
  setFilterPriority: (p) => set({ filterPriority: p }),

  createNote: (color = "yellow") => {
    const id = generateId();
    // Cascade new notes so they don't stack exactly
    const count = get().notes.length;
    const note: StickyNote = {
      id,
      title: "New Note",
      content: "",
      color,
      priority: "medium",
      dueDate: null,
      reminderAt: null,
      pinnedTo: null,
      position: { x: 80 + (count % 5) * 40, y: 80 + (count % 3) * 40 },
      createdAt: now(),
      updatedAt: now(),
      tags: [],
    };
    set((s) => ({ notes: [...s.notes, note], editingId: id, selectedId: id }));
  },

  updateNote: (id, changes) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id ? { ...n, ...changes, updatedAt: now() } : n
      ),
    })),

  deleteNote: (id) =>
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      editingId: s.editingId === id ? null : s.editingId,
    })),

  moveNote: (id, position) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, position } : n)),
    })),

  pinNote: (id, target) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id ? { ...n, pinnedTo: target, updatedAt: now() } : n
      ),
    })),
}));
