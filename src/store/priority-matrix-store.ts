"use client";
import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type MatrixQuadrant = "q1" | "q2" | "q3" | "q4";
export type MatrixViewMode = "weekly" | "monthly";

export type MatrixTaskPriority = "Critical" | "High" | "Medium" | "Low";

export type MatrixTask = {
  id: string;
  title: string;
  description: string;
  priority: MatrixTaskPriority;
  deadline: string;
  quadrant: MatrixQuadrant;
  completed: boolean;
  assignee: string;
  assigneeColor: string;
  labels: string[];
  createdAt: string;
  fromTaskStore?: boolean;
};

export type AiSuggestion = {
  taskId: string;
  currentQuadrant: MatrixQuadrant;
  suggestedQuadrant: MatrixQuadrant;
  reason: string;
};

const daysFromNow = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().split("T")[0];
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().split("T")[0];

function suggestQuadrant(task: { priority: MatrixTaskPriority; deadline: string; labels?: string[] }): MatrixQuadrant {
  const daysLeft = Math.ceil(
    (new Date(task.deadline).getTime() - Date.now()) / 86400000
  );
  const isUrgent = daysLeft <= 7 || (task.labels ?? []).includes("Urgent");
  const isImportant = task.priority === "Critical" || task.priority === "High";

  if (isUrgent && isImportant) return "q1";
  if (!isUrgent && isImportant) return "q2";
  if (isUrgent && !isImportant) return "q3";
  return "q4";
}

const INITIAL_TASKS: MatrixTask[] = [
  {
    id: "mt1", title: "Redesign authentication flow",
    description: "Update login/signup with new design system, social auth, and SSO support.",
    priority: "High", deadline: daysFromNow(5), quadrant: "q1",
    completed: false, assignee: "Alice Chen", assigneeColor: "#8b5cf6",
    labels: ["Feature", "Enhancement"], createdAt: daysAgo(7), fromTaskStore: true,
  },
  {
    id: "mt2", title: "Dashboard performance optimization",
    description: "Reduce initial load time from 3.2s to under 1s using lazy loading and caching.",
    priority: "Critical", deadline: daysFromNow(3), quadrant: "q1",
    completed: false, assignee: "Bob Kumar", assigneeColor: "#06b6d4",
    labels: ["Enhancement"], createdAt: daysAgo(5), fromTaskStore: true,
  },
  {
    id: "mt3", title: "Fix spreadsheet formula parser bug",
    description: "Nested IF formulas with 3+ levels cause stack overflow. Needs iterative refactor.",
    priority: "Critical", deadline: daysFromNow(2), quadrant: "q1",
    completed: false, assignee: "David Lee", assigneeColor: "#f59e0b",
    labels: ["Bug", "Urgent"], createdAt: daysAgo(2), fromTaskStore: true,
  },
  {
    id: "mt4", title: "Mobile app architecture spike",
    description: "Research and document recommended architecture for React Native mobile app.",
    priority: "High", deadline: daysFromNow(20), quadrant: "q2",
    completed: false, assignee: "Alice Chen", assigneeColor: "#8b5cf6",
    labels: ["Feature"], createdAt: daysAgo(1), fromTaskStore: true,
  },
  {
    id: "mt5", title: "Write API documentation",
    description: "Document all REST endpoints with request/response examples and auth details.",
    priority: "Medium", deadline: daysFromNow(10), quadrant: "q2",
    completed: false, assignee: "Carol White", assigneeColor: "#10b981",
    labels: ["Documentation"], createdAt: daysAgo(4), fromTaskStore: true,
  },
  {
    id: "mt6", title: "Q2 roadmap planning session",
    description: "Align product roadmap priorities with engineering capacity for Q2.",
    priority: "High", deadline: daysFromNow(14), quadrant: "q2",
    completed: false, assignee: "Bob Kumar", assigneeColor: "#06b6d4",
    labels: ["Feature"], createdAt: daysAgo(1),
  },
  {
    id: "mt7", title: "Deploy hotfix to staging",
    description: "Deploy authentication hotfix and PDF export to staging for QA validation.",
    priority: "Medium", deadline: daysFromNow(1), quadrant: "q3",
    completed: true, assignee: "Bob Kumar", assigneeColor: "#06b6d4",
    labels: ["Urgent"], createdAt: daysAgo(3), fromTaskStore: true,
  },
  {
    id: "mt8", title: "Update team meeting notes",
    description: "Compile and distribute last week's meeting notes to all stakeholders.",
    priority: "Low", deadline: daysFromNow(2), quadrant: "q3",
    completed: false, assignee: "Carol White", assigneeColor: "#10b981",
    labels: [], createdAt: daysAgo(0),
  },
  {
    id: "mt9", title: "Respond to vendor email thread",
    description: "Reply to license renewal inquiry from vendor — can delegate to procurement.",
    priority: "Low", deadline: daysFromNow(3), quadrant: "q3",
    completed: false, assignee: "David Lee", assigneeColor: "#f59e0b",
    labels: [], createdAt: daysAgo(0),
  },
  {
    id: "mt10", title: "Add dark mode to mobile app",
    description: "Implement system-aware dark mode throughout the React Native mobile app.",
    priority: "Low", deadline: daysFromNow(45), quadrant: "q4",
    completed: false, assignee: "Carol White", assigneeColor: "#10b981",
    labels: ["Enhancement"], createdAt: daysAgo(0), fromTaskStore: true,
  },
  {
    id: "mt11", title: "User onboarding flow",
    description: "Create guided onboarding: welcome screen, feature tour, workspace setup.",
    priority: "Medium", deadline: daysFromNow(30), quadrant: "q4",
    completed: false, assignee: "David Lee", assigneeColor: "#f59e0b",
    labels: ["Feature", "Enhancement"], createdAt: daysAgo(0), fromTaskStore: true,
  },
  {
    id: "mt12", title: "Organize shared drive folder structure",
    description: "Reorganize Google Drive folders for better team navigation and archival.",
    priority: "Low", deadline: daysFromNow(60), quadrant: "q4",
    completed: false, assignee: "Alice Chen", assigneeColor: "#8b5cf6",
    labels: [], createdAt: daysAgo(0),
  },
];

interface PriorityMatrixState {
  matrixTasks: MatrixTask[];
  viewMode: MatrixViewMode;
  showAnalytics: boolean;
  showAiSuggestions: boolean;
  aiSuggestions: AiSuggestion[];
  selectedTaskId: string | null;
  draggedTaskId: string | null;

  // Actions
  addTask: (quadrant: MatrixQuadrant, title: string, priority?: MatrixTaskPriority, deadline?: string) => void;
  moveTask: (taskId: string, quadrant: MatrixQuadrant) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, changes: Partial<MatrixTask>) => void;
  setViewMode: (mode: MatrixViewMode) => void;
  toggleAnalytics: () => void;
  toggleAiSuggestions: () => void;
  autoSuggest: () => void;
  generateAiSuggestions: () => void;
  applyAiSuggestion: (taskId: string) => void;
  setDraggedTask: (id: string | null) => void;
  selectTask: (id: string | null) => void;
}

function generateAiSuggestionsFromTasks(tasks: MatrixTask[]): AiSuggestion[] {
  const suggestions: AiSuggestion[] = [];
  const urgentKeywords = ["urgent", "asap", "critical", "blocker", "hotfix", "fix", "bug", "today", "immediately"];
  const importantKeywords = ["strategy", "roadmap", "architecture", "design", "planning", "research", "infrastructure", "security"];

  for (const task of tasks) {
    if (task.completed) continue;
    const text = (task.title + " " + task.description).toLowerCase();
    const hasUrgentKeyword = urgentKeywords.some((k) => text.includes(k));
    const hasImportantKeyword = importantKeywords.some((k) => text.includes(k));
    const daysLeft = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000);

    let suggestedQuadrant: MatrixQuadrant | null = null;
    let reason = "";

    // Check if AI would suggest a different quadrant
    const aiUrgent = hasUrgentKeyword || daysLeft <= 5;
    const aiImportant =
      hasImportantKeyword ||
      task.priority === "Critical" ||
      task.priority === "High";

    let aiQuadrant: MatrixQuadrant;
    if (aiUrgent && aiImportant) aiQuadrant = "q1";
    else if (!aiUrgent && aiImportant) aiQuadrant = "q2";
    else if (aiUrgent && !aiImportant) aiQuadrant = "q3";
    else aiQuadrant = "q4";

    if (aiQuadrant !== task.quadrant) {
      suggestedQuadrant = aiQuadrant;
      const qNames = { q1: "Do First", q2: "Schedule", q3: "Delegate", q4: "Eliminate" };
      const reasons: string[] = [];
      if (hasUrgentKeyword) reasons.push(`contains urgent keyword`);
      if (hasImportantKeyword) reasons.push(`strategic importance detected`);
      if (daysLeft <= 3) reasons.push(`deadline in ${daysLeft} days`);
      if (daysLeft > 14 && task.quadrant === "q1") reasons.push(`deadline is ${daysLeft} days away`);
      reason = `AI suggests "${qNames[suggestedQuadrant]}" — ${reasons.join(", ") || "based on priority and deadline analysis"}.`;
      suggestions.push({ taskId: task.id, currentQuadrant: task.quadrant, suggestedQuadrant, reason });
    }
  }
  return suggestions.slice(0, 5);
}

export const usePriorityMatrixStore = create<PriorityMatrixState>((set, get) => ({
  matrixTasks: INITIAL_TASKS,
  viewMode: "weekly",
  showAnalytics: true,
  showAiSuggestions: false,
  aiSuggestions: [],
  selectedTaskId: null,
  draggedTaskId: null,

  addTask: (quadrant, title, priority = "Medium", deadline = daysFromNow(7)) => {
    const task: MatrixTask = {
      id: generateId(),
      title,
      description: "",
      priority,
      deadline,
      quadrant,
      completed: false,
      assignee: "You",
      assigneeColor: "#8b5cf6",
      labels: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ matrixTasks: [...s.matrixTasks, task] }));
  },

  moveTask: (taskId, quadrant) =>
    set((s) => ({
      matrixTasks: s.matrixTasks.map((t) => (t.id === taskId ? { ...t, quadrant } : t)),
    })),

  completeTask: (taskId) =>
    set((s) => ({
      matrixTasks: s.matrixTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    })),

  deleteTask: (taskId) =>
    set((s) => ({
      matrixTasks: s.matrixTasks.filter((t) => t.id !== taskId),
      selectedTaskId: s.selectedTaskId === taskId ? null : s.selectedTaskId,
    })),

  updateTask: (taskId, changes) =>
    set((s) => ({
      matrixTasks: s.matrixTasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleAnalytics: () => set((s) => ({ showAnalytics: !s.showAnalytics })),

  toggleAiSuggestions: () =>
    set((s) => {
      if (!s.showAiSuggestions) {
        const suggestions = generateAiSuggestionsFromTasks(s.matrixTasks);
        return { showAiSuggestions: true, aiSuggestions: suggestions };
      }
      return { showAiSuggestions: false };
    }),

  autoSuggest: () =>
    set((s) => ({
      matrixTasks: s.matrixTasks.map((t) => ({
        ...t,
        quadrant: suggestQuadrant(t),
      })),
    })),

  generateAiSuggestions: () =>
    set((s) => ({
      aiSuggestions: generateAiSuggestionsFromTasks(s.matrixTasks),
    })),

  applyAiSuggestion: (taskId) =>
    set((s) => {
      const suggestion = s.aiSuggestions.find((sg) => sg.taskId === taskId);
      if (!suggestion) return s;
      return {
        matrixTasks: s.matrixTasks.map((t) =>
          t.id === taskId ? { ...t, quadrant: suggestion.suggestedQuadrant } : t
        ),
        aiSuggestions: s.aiSuggestions.filter((sg) => sg.taskId !== taskId),
      };
    }),

  setDraggedTask: (id) => set({ draggedTaskId: id }),

  selectTask: (id) => set({ selectedTaskId: id }),
}));
