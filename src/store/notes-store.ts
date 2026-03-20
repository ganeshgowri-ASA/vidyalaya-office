"use client";
import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type NoteTemplate =
  | "blank"
  | "mom"
  | "standup"
  | "retro"
  | "one-on-one"
  | "brainstorm"
  | "project-brief";

export type NoteFolder = { id: string; name: string; color: string };

export type ActionItem = {
  id: string;
  text: string;
  assignee: string;
  deadline: string;
  done: boolean;
};

export type Decision = {
  id: string;
  decision: string;
  owner: string;
  deadline: string;
  status: "Open" | "In Progress" | "Done" | "Cancelled";
};

export type Note = {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  meetingId?: string;
  template: NoteTemplate;
  actionItems: ActionItem[];
  decisions: Decision[];
};

interface NotesState {
  notes: Note[];
  folders: NoteFolder[];
  selectedNoteId: string | null;
  selectedFolder: string;
  searchQuery: string;
  sortBy: "date" | "title";
  activeTab: "editor" | "meeting" | "decisions" | "actions";
  aiPanelOpen: boolean;
  templateModalOpen: boolean;

  // Actions
  selectNote: (id: string | null) => void;
  setFolder: (folder: string) => void;
  setSearch: (q: string) => void;
  setSortBy: (s: "date" | "title") => void;
  setActiveTab: (t: "editor" | "meeting" | "decisions" | "actions") => void;
  toggleAiPanel: () => void;
  setTemplateModal: (open: boolean) => void;
  createNote: (template?: NoteTemplate) => void;
  updateNote: (id: string, changes: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addActionItem: (noteId: string, item: Omit<ActionItem, "id">) => void;
  toggleActionItem: (noteId: string, itemId: string) => void;
  addDecision: (noteId: string, dec: Omit<Decision, "id">) => void;
  updateDecision: (noteId: string, decId: string, changes: Partial<Decision>) => void;
}

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const SAMPLE_NOTES: Note[] = [
  {
    id: "n1",
    title: "Sprint 14 Planning - MoM",
    content: `# Sprint 14 Planning Meeting\n\n**Date:** ${new Date().toDateString()}\n**Attendees:** Alice Chen, Bob Kumar, Carol White, David Lee\n\n## Agenda\n1. Review Sprint 13 outcomes\n2. Sprint 14 scope and priorities\n3. Resource allocation\n4. Risk review\n\n## Discussion\nThe team reviewed Sprint 13 velocity (42 points) and discussed capacity for Sprint 14. Agreed to target 38 points given two team members on PTO.\n\nKey items selected for Sprint 14:\n- User authentication redesign (13pts)\n- Dashboard performance optimization (8pts)\n- PDF export feature (8pts)\n- Bug fixes from backlog (5pts)\n\n## Next Steps\n- Alice to finalize sprint board by EOD\n- Bob to share design specs for auth redesign\n- All: daily standup at 9:30 AM`,
    folder: "Meetings",
    tags: ["sprint", "planning", "scrum"],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    pinned: true,
    template: "mom",
    actionItems: [
      { id: "ai1", text: "Finalize sprint board", assignee: "Alice Chen", deadline: daysAgo(-1), done: false },
      { id: "ai2", text: "Share design specs for auth redesign", assignee: "Bob Kumar", deadline: daysAgo(-2), done: false },
      { id: "ai3", text: "Set up daily standup recurring calendar event", assignee: "Carol White", deadline: daysAgo(-3), done: true },
    ],
    decisions: [
      { id: "d1", decision: "Target 38 story points for Sprint 14", owner: "Alice Chen", deadline: daysAgo(-1), status: "Done" },
      { id: "d2", decision: "Prioritize auth redesign over new features", owner: "David Lee", deadline: daysAgo(-7), status: "In Progress" },
    ],
  },
  {
    id: "n2",
    title: "Q1 Product Roadmap Brainstorm",
    content: `# Q1 Product Roadmap Brainstorm\n\n## Ideas\n- AI-powered document summarization\n- Real-time collaboration features\n- Mobile app for iOS and Android\n- Integration with Slack and Teams\n- Advanced analytics dashboard\n\n## Themes\n1. **Productivity**: Reduce time spent on manual tasks\n2. **Collaboration**: Enable seamless team workflows\n3. **Intelligence**: AI features that add real value\n\n## Prioritization Matrix\n| Feature | Impact | Effort | Priority |\n|---------|--------|--------|----------|\n| AI Summary | High | Medium | 1 |\n| Mobile App | High | High | 3 |\n| Slack Integration | Medium | Low | 2 |`,
    folder: "Projects",
    tags: ["roadmap", "q1", "product"],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    pinned: false,
    template: "brainstorm",
    actionItems: [
      { id: "ai4", text: "Create detailed specs for AI Summary feature", assignee: "Carol White", deadline: daysAgo(-5), done: false },
    ],
    decisions: [
      { id: "d3", decision: "AI Summary will be Q1 top priority", owner: "David Lee", deadline: daysAgo(-10), status: "Open" },
    ],
  },
  {
    id: "n3",
    title: "1-on-1 with Manager - March",
    content: `# 1-on-1 Meeting Notes\n\n**Date:** March 15, 2026\n**Manager:** Sarah Johnson\n\n## Wins This Month\n- Shipped PDF export feature ahead of schedule\n- Mentored two junior developers\n- Received positive feedback from Product team\n\n## Challenges\n- Struggling with context switching between projects\n- Need better documentation practices\n\n## Career Goals\n- Target: Senior Engineer promotion by Q3\n- Want to lead the mobile app initiative\n- Interested in architecture decision-making\n\n## Action Items\n- Schedule architecture review sessions\n- Create personal development plan\n- Read "Staff Engineer" book`,
    folder: "Personal",
    tags: ["1on1", "career", "growth"],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    pinned: false,
    template: "one-on-one",
    actionItems: [
      { id: "ai5", text: "Schedule architecture review sessions", assignee: "Me", deadline: daysAgo(-7), done: false },
      { id: "ai6", text: "Create personal development plan", assignee: "Me", deadline: daysAgo(-14), done: false },
    ],
    decisions: [],
  },
  {
    id: "n4",
    title: "Daily Standup - March 20",
    content: `# Daily Standup\n**Date:** March 20, 2026\n\n## Yesterday\n- Fixed authentication bug (#234)\n- Code review for Carol's PR\n- Updated sprint board\n\n## Today\n- Continue work on dashboard performance\n- Meeting with design team at 2pm\n- Deploy hotfix to staging\n\n## Blockers\n- Waiting for API keys from DevOps (Bob to follow up)`,
    folder: "Meetings",
    tags: ["standup", "daily"],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    pinned: false,
    template: "standup",
    actionItems: [
      { id: "ai7", text: "Follow up with DevOps for API keys", assignee: "Bob Kumar", deadline: daysAgo(-1), done: false },
    ],
    decisions: [],
  },
  {
    id: "n5",
    title: "Project Kickoff - Vidyalaya Mobile",
    content: `# Project Brief: Vidyalaya Mobile App\n\n## Overview\nNative mobile app for iOS and Android providing core Vidyalaya Office functionality on the go.\n\n## Goals\n- 50,000 downloads in first 3 months\n- 4.5+ app store rating\n- Feature parity with top 5 web features\n\n## Scope\n**In Scope:**\n- Document viewer and basic editor\n- Email client\n- Chat functionality\n- Offline mode\n\n**Out of Scope:**\n- Spreadsheet editing\n- Advanced graphics tools\n\n## Timeline\n- Q1: Design and architecture\n- Q2: Core features development\n- Q3: Beta testing\n- Q4: Launch`,
    folder: "Projects",
    tags: ["mobile", "project", "kickoff"],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
    pinned: true,
    template: "project-brief",
    actionItems: [],
    decisions: [
      { id: "d4", decision: "React Native selected as mobile framework", owner: "CTO", deadline: daysAgo(-30), status: "Done" },
      { id: "d5", decision: "Offline-first architecture approach", owner: "Lead Architect", deadline: daysAgo(-25), status: "In Progress" },
    ],
  },
];

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: SAMPLE_NOTES,
  folders: [
    { id: "f1", name: "Meetings", color: "#8b5cf6" },
    { id: "f2", name: "Projects", color: "#06b6d4" },
    { id: "f3", name: "Personal", color: "#10b981" },
    { id: "f4", name: "Research", color: "#f59e0b" },
  ],
  selectedNoteId: "n1",
  selectedFolder: "All",
  searchQuery: "",
  sortBy: "date",
  activeTab: "editor",
  aiPanelOpen: false,
  templateModalOpen: false,

  selectNote: (id) => set({ selectedNoteId: id }),
  setFolder: (folder) => set({ selectedFolder: folder }),
  setSearch: (q) => set({ searchQuery: q }),
  setSortBy: (s) => set({ sortBy: s }),
  setActiveTab: (t) => set({ activeTab: t }),
  toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setTemplateModal: (open) => set({ templateModalOpen: open }),

  createNote: (template = "blank") => {
    const id = generateId();
    const note: Note = {
      id,
      title: "Untitled Note",
      content: "",
      folder: "Meetings",
      tags: [],
      createdAt: now(),
      updatedAt: now(),
      pinned: false,
      template,
      actionItems: [],
      decisions: [],
    };
    set((s) => ({ notes: [note, ...s.notes], selectedNoteId: id }));
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
      selectedNoteId: s.selectedNoteId === id ? null : s.selectedNoteId,
    })),

  addActionItem: (noteId, item) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? { ...n, actionItems: [...n.actionItems, { ...item, id: generateId() }], updatedAt: now() }
          : n
      ),
    })),

  toggleActionItem: (noteId, itemId) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              actionItems: n.actionItems.map((ai) =>
                ai.id === itemId ? { ...ai, done: !ai.done } : ai
              ),
            }
          : n
      ),
    })),

  addDecision: (noteId, dec) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? { ...n, decisions: [...n.decisions, { ...dec, id: generateId() }], updatedAt: now() }
          : n
      ),
    })),

  updateDecision: (noteId, decId, changes) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              decisions: n.decisions.map((d) =>
                d.id === decId ? { ...d, ...changes } : d
              ),
            }
          : n
      ),
    })),
}));
