"use client";

import { create } from "zustand";

export interface ProjectTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  progress: number; // 0-100
  assignee: string;
  predecessors: string[]; // task ids
  isMilestone: boolean;
  isCritical: boolean;
  priority: "low" | "medium" | "high";
  status: "not-started" | "in-progress" | "completed" | "delayed";
  phase: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  allocation: number; // percentage
  assignedTasks: string[];
  avatar: string; // initials
  color: string;
}

export interface ProjectState {
  projectName: string;
  projectStartDate: string;
  projectEndDate: string;
  tasks: ProjectTask[];
  resources: Resource[];
  selectedTaskId: string | null;
  activeView: "gantt" | "tasks" | "resources" | "dashboard";
  zoomLevel: "day" | "week" | "month";
  showCriticalPath: boolean;

  setSelectedTaskId: (id: string | null) => void;
  setActiveView: (view: ProjectState["activeView"]) => void;
  setZoomLevel: (level: ProjectState["zoomLevel"]) => void;
  toggleCriticalPath: () => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
}

const sampleTasks: ProjectTask[] = [
  {
    id: "t1",
    name: "Discovery & Research",
    startDate: "2026-03-02",
    endDate: "2026-03-13",
    duration: 10,
    progress: 100,
    assignee: "Alice Chen",
    predecessors: [],
    isMilestone: false,
    isCritical: true,
    priority: "high",
    status: "completed",
    phase: "Planning",
  },
  {
    id: "t2",
    name: "Stakeholder Interviews",
    startDate: "2026-03-04",
    endDate: "2026-03-11",
    duration: 6,
    progress: 100,
    assignee: "Bob Martinez",
    predecessors: [],
    isMilestone: false,
    isCritical: false,
    priority: "medium",
    status: "completed",
    phase: "Planning",
  },
  {
    id: "t3",
    name: "Requirements Sign-off",
    startDate: "2026-03-13",
    endDate: "2026-03-13",
    duration: 1,
    progress: 100,
    assignee: "Alice Chen",
    predecessors: ["t1", "t2"],
    isMilestone: true,
    isCritical: true,
    priority: "high",
    status: "completed",
    phase: "Planning",
  },
  {
    id: "t4",
    name: "Wireframes & Mockups",
    startDate: "2026-03-16",
    endDate: "2026-03-27",
    duration: 10,
    progress: 85,
    assignee: "Sara Kim",
    predecessors: ["t3"],
    isMilestone: false,
    isCritical: true,
    priority: "high",
    status: "in-progress",
    phase: "Design",
  },
  {
    id: "t5",
    name: "Design System Setup",
    startDate: "2026-03-18",
    endDate: "2026-03-27",
    duration: 8,
    progress: 70,
    assignee: "Sara Kim",
    predecessors: ["t3"],
    isMilestone: false,
    isCritical: false,
    priority: "medium",
    status: "in-progress",
    phase: "Design",
  },
  {
    id: "t6",
    name: "UI Design Review",
    startDate: "2026-03-30",
    endDate: "2026-03-30",
    duration: 1,
    progress: 0,
    assignee: "Alice Chen",
    predecessors: ["t4", "t5"],
    isMilestone: true,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Design",
  },
  {
    id: "t7",
    name: "Frontend Development",
    startDate: "2026-03-31",
    endDate: "2026-04-18",
    duration: 15,
    progress: 0,
    assignee: "David Park",
    predecessors: ["t6"],
    isMilestone: false,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Development",
  },
  {
    id: "t8",
    name: "Backend API Development",
    startDate: "2026-03-31",
    endDate: "2026-04-15",
    duration: 12,
    progress: 0,
    assignee: "Emily Zhang",
    predecessors: ["t6"],
    isMilestone: false,
    isCritical: false,
    priority: "high",
    status: "not-started",
    phase: "Development",
  },
  {
    id: "t9",
    name: "CMS Integration",
    startDate: "2026-04-06",
    endDate: "2026-04-15",
    duration: 8,
    progress: 0,
    assignee: "David Park",
    predecessors: ["t7"],
    isMilestone: false,
    isCritical: false,
    priority: "medium",
    status: "not-started",
    phase: "Development",
  },
  {
    id: "t10",
    name: "Content Migration",
    startDate: "2026-04-16",
    endDate: "2026-04-25",
    duration: 8,
    progress: 0,
    assignee: "Bob Martinez",
    predecessors: ["t8", "t9"],
    isMilestone: false,
    isCritical: false,
    priority: "medium",
    status: "not-started",
    phase: "Development",
  },
  {
    id: "t11",
    name: "QA Testing",
    startDate: "2026-04-21",
    endDate: "2026-05-01",
    duration: 9,
    progress: 0,
    assignee: "Frank Liu",
    predecessors: ["t7"],
    isMilestone: false,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Testing",
  },
  {
    id: "t12",
    name: "Performance Optimization",
    startDate: "2026-04-28",
    endDate: "2026-05-05",
    duration: 6,
    progress: 0,
    assignee: "Emily Zhang",
    predecessors: ["t11"],
    isMilestone: false,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Testing",
  },
  {
    id: "t13",
    name: "UAT Sign-off",
    startDate: "2026-05-06",
    endDate: "2026-05-06",
    duration: 1,
    progress: 0,
    assignee: "Alice Chen",
    predecessors: ["t12", "t10"],
    isMilestone: true,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Testing",
  },
  {
    id: "t14",
    name: "Staging Deployment",
    startDate: "2026-05-07",
    endDate: "2026-05-09",
    duration: 3,
    progress: 0,
    assignee: "David Park",
    predecessors: ["t13"],
    isMilestone: false,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Launch",
  },
  {
    id: "t15",
    name: "Go Live",
    startDate: "2026-05-12",
    endDate: "2026-05-12",
    duration: 1,
    progress: 0,
    assignee: "Alice Chen",
    predecessors: ["t14"],
    isMilestone: true,
    isCritical: true,
    priority: "high",
    status: "not-started",
    phase: "Launch",
  },
];

const sampleResources: Resource[] = [
  { id: "r1", name: "Alice Chen", role: "Project Manager", allocation: 80, assignedTasks: ["t1", "t3", "t6", "t13", "t15"], avatar: "AC", color: "#6366f1" },
  { id: "r2", name: "Bob Martinez", role: "Business Analyst", allocation: 60, assignedTasks: ["t2", "t10"], avatar: "BM", color: "#f59e0b" },
  { id: "r3", name: "Sara Kim", role: "UI/UX Designer", allocation: 100, assignedTasks: ["t4", "t5"], avatar: "SK", color: "#ec4899" },
  { id: "r4", name: "David Park", role: "Frontend Developer", allocation: 100, assignedTasks: ["t7", "t9", "t14"], avatar: "DP", color: "#10b981" },
  { id: "r5", name: "Emily Zhang", role: "Backend Developer", allocation: 90, assignedTasks: ["t8", "t12"], avatar: "EZ", color: "#8b5cf6" },
  { id: "r6", name: "Frank Liu", role: "QA Engineer", allocation: 70, assignedTasks: ["t11"], avatar: "FL", color: "#ef4444" },
];

export const useProjectStore = create<ProjectState>((set) => ({
  projectName: "Website Redesign",
  projectStartDate: "2026-03-02",
  projectEndDate: "2026-05-12",
  tasks: sampleTasks,
  resources: sampleResources,
  selectedTaskId: null,
  activeView: "gantt",
  zoomLevel: "week",
  showCriticalPath: true,

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setActiveView: (view) => set({ activeView: view }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  toggleCriticalPath: () => set((s) => ({ showCriticalPath: !s.showCriticalPath })),
  updateTaskProgress: (taskId, progress) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, progress, status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started" }
          : t
      ),
    })),
}));
