"use client";

import { create } from "zustand";

export interface PlannerTask {
  id: string;
  title: string;
  bucket: "todo" | "in-progress" | "review" | "done";
  assignee: string;
  assigneeAvatar: string;
  assigneeColor: string;
  priority: "urgent" | "important" | "medium" | "low";
  dueDate: string;
  labels: string[];
  checklist: { text: string; done: boolean }[];
  notes: string;
}

export interface PlannerState {
  planName: string;
  tasks: PlannerTask[];
  activeView: "board" | "charts" | "schedule";
  selectedTaskId: string | null;
  filterAssignee: string | null;
  filterPriority: string | null;

  setActiveView: (view: PlannerState["activeView"]) => void;
  setSelectedTaskId: (id: string | null) => void;
  moveTask: (taskId: string, bucket: PlannerTask["bucket"]) => void;
  setFilterAssignee: (assignee: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
}

const sampleTasks: PlannerTask[] = [
  {
    id: "p1",
    title: "Define campaign goals & KPIs",
    bucket: "done",
    assignee: "Maya Johnson",
    assigneeAvatar: "MJ",
    assigneeColor: "#6366f1",
    priority: "urgent",
    dueDate: "2026-03-10",
    labels: ["Strategy"],
    checklist: [{ text: "Revenue targets", done: true }, { text: "Engagement metrics", done: true }],
    notes: "Align with quarterly OKRs",
  },
  {
    id: "p2",
    title: "Audience segmentation analysis",
    bucket: "done",
    assignee: "Leo Wang",
    assigneeAvatar: "LW",
    assigneeColor: "#10b981",
    priority: "important",
    dueDate: "2026-03-14",
    labels: ["Research"],
    checklist: [{ text: "Demographic analysis", done: true }, { text: "Behavioral segments", done: true }],
    notes: "",
  },
  {
    id: "p3",
    title: "Create content calendar",
    bucket: "done",
    assignee: "Nina Patel",
    assigneeAvatar: "NP",
    assigneeColor: "#ec4899",
    priority: "important",
    dueDate: "2026-03-18",
    labels: ["Content"],
    checklist: [{ text: "Blog schedule", done: true }, { text: "Social schedule", done: true }, { text: "Email cadence", done: true }],
    notes: "",
  },
  {
    id: "p4",
    title: "Design social media creatives",
    bucket: "review",
    assignee: "Omar Farah",
    assigneeAvatar: "OF",
    assigneeColor: "#f59e0b",
    priority: "important",
    dueDate: "2026-03-25",
    labels: ["Design", "Social"],
    checklist: [{ text: "Instagram posts", done: true }, { text: "LinkedIn banners", done: true }, { text: "Twitter cards", done: false }],
    notes: "Use new brand guidelines",
  },
  {
    id: "p5",
    title: "Write blog series (4 articles)",
    bucket: "in-progress",
    assignee: "Nina Patel",
    assigneeAvatar: "NP",
    assigneeColor: "#ec4899",
    priority: "important",
    dueDate: "2026-04-01",
    labels: ["Content", "Blog"],
    checklist: [{ text: "Article 1 draft", done: true }, { text: "Article 2 draft", done: true }, { text: "Article 3 draft", done: false }, { text: "Article 4 draft", done: false }],
    notes: "SEO-optimized, targeting long-tail keywords",
  },
  {
    id: "p6",
    title: "Set up email automation flows",
    bucket: "in-progress",
    assignee: "Leo Wang",
    assigneeAvatar: "LW",
    assigneeColor: "#10b981",
    priority: "urgent",
    dueDate: "2026-03-28",
    labels: ["Email", "Automation"],
    checklist: [{ text: "Welcome sequence", done: true }, { text: "Nurture flow", done: false }, { text: "Re-engagement flow", done: false }],
    notes: "Using HubSpot workflows",
  },
  {
    id: "p7",
    title: "Landing page A/B test setup",
    bucket: "in-progress",
    assignee: "Omar Farah",
    assigneeAvatar: "OF",
    assigneeColor: "#f59e0b",
    priority: "medium",
    dueDate: "2026-03-30",
    labels: ["Design", "Testing"],
    checklist: [{ text: "Variant A design", done: true }, { text: "Variant B design", done: false }],
    notes: "",
  },
  {
    id: "p8",
    title: "Configure paid ad campaigns",
    bucket: "todo",
    assignee: "Maya Johnson",
    assigneeAvatar: "MJ",
    assigneeColor: "#6366f1",
    priority: "urgent",
    dueDate: "2026-04-02",
    labels: ["Ads", "Budget"],
    checklist: [{ text: "Google Ads setup", done: false }, { text: "Meta Ads setup", done: false }, { text: "LinkedIn Ads setup", done: false }],
    notes: "Budget: $15K/month",
  },
  {
    id: "p9",
    title: "Influencer outreach (10 targets)",
    bucket: "todo",
    assignee: "Nina Patel",
    assigneeAvatar: "NP",
    assigneeColor: "#ec4899",
    priority: "medium",
    dueDate: "2026-04-05",
    labels: ["Social", "Partnerships"],
    checklist: [{ text: "Identify influencers", done: false }, { text: "Draft outreach emails", done: false }],
    notes: "Focus on micro-influencers in tech space",
  },
  {
    id: "p10",
    title: "Webinar planning & promotion",
    bucket: "todo",
    assignee: "Leo Wang",
    assigneeAvatar: "LW",
    assigneeColor: "#10b981",
    priority: "important",
    dueDate: "2026-04-10",
    labels: ["Events", "Content"],
    checklist: [{ text: "Topic & speakers", done: false }, { text: "Registration page", done: false }, { text: "Promo emails", done: false }],
    notes: "Target 500 registrations",
  },
  {
    id: "p11",
    title: "Analytics dashboard setup",
    bucket: "todo",
    assignee: "Leo Wang",
    assigneeAvatar: "LW",
    assigneeColor: "#10b981",
    priority: "medium",
    dueDate: "2026-04-08",
    labels: ["Analytics"],
    checklist: [{ text: "UTM tracking", done: false }, { text: "Dashboard build", done: false }],
    notes: "Consolidate all campaign metrics",
  },
  {
    id: "p12",
    title: "PR & media kit distribution",
    bucket: "todo",
    assignee: "Maya Johnson",
    assigneeAvatar: "MJ",
    assigneeColor: "#6366f1",
    priority: "low",
    dueDate: "2026-04-12",
    labels: ["PR"],
    checklist: [{ text: "Press release draft", done: false }, { text: "Media list", done: false }],
    notes: "",
  },
  {
    id: "p13",
    title: "Video testimonial production",
    bucket: "review",
    assignee: "Omar Farah",
    assigneeAvatar: "OF",
    assigneeColor: "#f59e0b",
    priority: "medium",
    dueDate: "2026-03-27",
    labels: ["Content", "Video"],
    checklist: [{ text: "Script approval", done: true }, { text: "Filming", done: true }, { text: "Editing", done: false }],
    notes: "3 customer stories",
  },
];

export const usePlannerStore = create<PlannerState>((set) => ({
  planName: "Q2 Marketing Campaign",
  tasks: sampleTasks,
  activeView: "board",
  selectedTaskId: null,
  filterAssignee: null,
  filterPriority: null,

  setActiveView: (view) => set({ activeView: view }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  moveTask: (taskId, bucket) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, bucket } : t)),
    })),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
}));
