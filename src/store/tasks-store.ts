"use client";
import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
export type TaskLabel = "Bug" | "Feature" | "Enhancement" | "Documentation" | "Urgent";
export type ViewMode = "kanban" | "gantt" | "list";

export type SubTask = { id: string; text: string; done: boolean };
export type TaskComment = { id: string; author: string; text: string; createdAt: string };

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  assigneeColor: string;
  deadline: string;
  labels: TaskLabel[];
  subtasks: SubTask[];
  comments: TaskComment[];
  blockedBy?: string[];
  createdAt: string;
  startDate?: string;
  order: number;
};

interface TasksState {
  tasks: Task[];
  viewMode: ViewMode;
  selectedTaskId: string | null;
  searchQuery: string;
  filterPriority: Priority | "All";
  filterAssignee: string;
  filterLabel: TaskLabel | "All";
  myTasksOnly: boolean;
  selectedIds: string[];

  // Actions
  setViewMode: (v: ViewMode) => void;
  selectTask: (id: string | null) => void;
  setSearch: (q: string) => void;
  setFilterPriority: (p: Priority | "All") => void;
  setFilterAssignee: (a: string) => void;
  setFilterLabel: (l: TaskLabel | "All") => void;
  toggleMyTasks: () => void;
  createTask: (status?: TaskStatus) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  addSubtask: (taskId: string, text: string) => void;
  addComment: (taskId: string, author: string, text: string) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: TaskStatus) => void;
  bulkDelete: () => void;
}

const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];

const SAMPLE_TASKS: Task[] = [
  {
    id: "t1", title: "Redesign authentication flow", description: "Update login/signup screens with new design system components including social auth and SSO support.", status: "In Progress", priority: "High",
    assignee: "Alice Chen", assigneeColor: "#8b5cf6", deadline: daysFromNow(5), labels: ["Feature", "Enhancement"],
    subtasks: [
      { id: "s1", text: "Create wireframes", done: true },
      { id: "s2", text: "Implement OAuth providers", done: true },
      { id: "s3", text: "Add SSO integration", done: false },
      { id: "s4", text: "Write unit tests", done: false },
    ],
    comments: [{ id: "c1", author: "Bob Kumar", text: "Designs look great! SSO might take extra time.", createdAt: daysAgo(1) }],
    createdAt: daysAgo(7), startDate: daysAgo(3), order: 1,
  },
  {
    id: "t2", title: "Dashboard performance optimization", description: "Reduce initial load time from 3.2s to under 1s using lazy loading, code splitting, and caching strategies.", status: "In Progress", priority: "Critical",
    assignee: "Bob Kumar", assigneeColor: "#06b6d4", deadline: daysFromNow(3), labels: ["Enhancement"],
    subtasks: [
      { id: "s5", text: "Profile performance bottlenecks", done: true },
      { id: "s6", text: "Implement lazy loading", done: true },
      { id: "s7", text: "Add Redis caching layer", done: false },
    ],
    comments: [], blockedBy: [], createdAt: daysAgo(5), startDate: daysAgo(2), order: 2,
  },
  {
    id: "t3", title: "PDF export feature", description: "Allow users to export any document to PDF with custom page sizes and margins.", status: "Review", priority: "High",
    assignee: "Carol White", assigneeColor: "#10b981", deadline: daysFromNow(1), labels: ["Feature"],
    subtasks: [
      { id: "s8", text: "Integrate pdf-lib", done: true },
      { id: "s9", text: "Custom page settings UI", done: true },
      { id: "s10", text: "Test edge cases", done: true },
    ],
    comments: [
      { id: "c2", author: "Alice Chen", text: "LGTM! Just a few minor style fixes needed.", createdAt: daysAgo(0) },
    ],
    createdAt: daysAgo(10), startDate: daysAgo(8), order: 1,
  },
  {
    id: "t4", title: "Fix spreadsheet formula parser bug", description: "Nested IF formulas with more than 3 levels cause stack overflow. Needs refactoring of recursive parser.", status: "To Do", priority: "Critical",
    assignee: "David Lee", assigneeColor: "#f59e0b", deadline: daysFromNow(2), labels: ["Bug", "Urgent"],
    subtasks: [
      { id: "s11", text: "Reproduce the bug", done: true },
      { id: "s12", text: "Refactor parser to iterative", done: false },
      { id: "s13", text: "Add regression tests", done: false },
    ],
    comments: [], blockedBy: [], createdAt: daysAgo(2), order: 1,
  },
  {
    id: "t5", title: "Write API documentation", description: "Document all REST endpoints with request/response examples, error codes, and authentication details.", status: "To Do", priority: "Medium",
    assignee: "Carol White", assigneeColor: "#10b981", deadline: daysFromNow(10), labels: ["Documentation"],
    subtasks: [
      { id: "s14", text: "Document auth endpoints", done: false },
      { id: "s15", text: "Document file management APIs", done: false },
      { id: "s16", text: "Add OpenAPI spec", done: false },
    ],
    comments: [], createdAt: daysAgo(4), order: 2,
  },
  {
    id: "t6", title: "Mobile app architecture spike", description: "Research and document the recommended architecture for the React Native mobile app.", status: "Backlog", priority: "High",
    assignee: "Alice Chen", assigneeColor: "#8b5cf6", deadline: daysFromNow(20), labels: ["Feature"],
    subtasks: [], comments: [], createdAt: daysAgo(1), order: 1,
  },
  {
    id: "t7", title: "User onboarding flow", description: "Create guided onboarding for new users: welcome screen, feature tour, initial workspace setup.", status: "Backlog", priority: "Medium",
    assignee: "David Lee", assigneeColor: "#f59e0b", deadline: daysFromNow(30), labels: ["Feature", "Enhancement"],
    subtasks: [], comments: [], createdAt: daysAgo(0), order: 2,
  },
  {
    id: "t8", title: "Deploy hotfix to staging", description: "Deploy the authentication hotfix and PDF export to staging environment for QA validation.", status: "Done", priority: "High",
    assignee: "Bob Kumar", assigneeColor: "#06b6d4", deadline: daysAgo(1), labels: ["Urgent"],
    subtasks: [
      { id: "s17", text: "Run CI/CD pipeline", done: true },
      { id: "s18", text: "Smoke test on staging", done: true },
      { id: "s19", text: "Notify QA team", done: true },
    ],
    comments: [{ id: "c3", author: "Alice Chen", text: "All checks passed. Great work!", createdAt: daysAgo(1) }],
    createdAt: daysAgo(3), startDate: daysAgo(3), order: 1,
  },
  {
    id: "t9", title: "Setup monitoring and alerts", description: "Configure Datadog APM and set up PagerDuty alerts for error rate and latency thresholds.", status: "Done", priority: "Medium",
    assignee: "David Lee", assigneeColor: "#f59e0b", deadline: daysAgo(5), labels: ["Enhancement"],
    subtasks: [
      { id: "s20", text: "Install Datadog agent", done: true },
      { id: "s21", text: "Configure dashboards", done: true },
      { id: "s22", text: "Set up PagerDuty integration", done: true },
    ],
    comments: [], createdAt: daysAgo(14), startDate: daysAgo(12), order: 2,
  },
  {
    id: "t10", title: "Add dark mode support to mobile", description: "Implement system-aware dark mode throughout the mobile app.", status: "Backlog", priority: "Low",
    assignee: "Carol White", assigneeColor: "#10b981", deadline: daysFromNow(45), labels: ["Enhancement"],
    subtasks: [], comments: [], createdAt: daysAgo(0), order: 3,
  },
];

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: SAMPLE_TASKS,
  viewMode: "kanban",
  selectedTaskId: null,
  searchQuery: "",
  filterPriority: "All",
  filterAssignee: "",
  filterLabel: "All",
  myTasksOnly: false,
  selectedIds: [],

  setViewMode: (v) => set({ viewMode: v }),
  selectTask: (id) => set({ selectedTaskId: id }),
  setSearch: (q) => set({ searchQuery: q }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterAssignee: (a) => set({ filterAssignee: a }),
  setFilterLabel: (l) => set({ filterLabel: l }),
  toggleMyTasks: () => set((s) => ({ myTasksOnly: !s.myTasksOnly })),

  createTask: (status = "To Do") => {
    const id = generateId();
    const cols = get().tasks.filter((t) => t.status === status);
    const task: Task = {
      id, title: "New Task", description: "", status, priority: "Medium",
      assignee: "Alice Chen", assigneeColor: "#8b5cf6",
      deadline: daysFromNow(7), labels: [], subtasks: [], comments: [],
      createdAt: new Date().toISOString(), order: cols.length + 1,
    };
    set((s) => ({ tasks: [...s.tasks, task], selectedTaskId: id }));
  },

  updateTask: (id, changes) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)) })),

  deleteTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
    })),

  moveTask: (id, status) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),

  toggleSubtask: (taskId, subId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subId ? { ...st, done: !st.done } : st)) }
          : t
      ),
    })),

  addSubtask: (taskId, text) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, { id: generateId(), text, done: false }] }
          : t
      ),
    })),

  addComment: (taskId, author, text) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, { id: generateId(), author, text, createdAt: new Date().toISOString() }] }
          : t
      ),
    })),

  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((i) => i !== id)
        : [...s.selectedIds, id],
    })),

  clearSelection: () => set({ selectedIds: [] }),

  bulkUpdateStatus: (status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (s.selectedIds.includes(t.id) ? { ...t, status } : t)),
      selectedIds: [],
    })),

  bulkDelete: () =>
    set((s) => ({
      tasks: s.tasks.filter((t) => !s.selectedIds.includes(t.id)),
      selectedIds: [],
    })),
}));
