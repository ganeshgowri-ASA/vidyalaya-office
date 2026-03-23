"use client";

import { create } from "zustand";

export type PageStatus = "draft" | "in_review" | "published";
export type TemplateType = "team-site" | "communication-site" | "project-hub" | "knowledge-base" | "wiki" | "blank";
export type WebPartType =
  | "text"
  | "document-embed"
  | "spreadsheet-embed"
  | "presentation-embed"
  | "quick-links"
  | "image-gallery"
  | "file-list"
  | "people"
  | "news-feed"
  | "chart"
  | "divider";
export type SectionLayout = "full" | "two-column" | "three-column";

export interface WebPart {
  id: string;
  type: WebPartType;
  title: string;
  content: string;
  config: Record<string, unknown>;
}

export interface PageSection {
  id: string;
  layout: SectionLayout;
  webParts: WebPart[];
}

export interface PageVersion {
  id: string;
  version: number;
  modifiedAt: string;
  modifiedBy: string;
  summary: string;
}

export interface IntranetPage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  template: TemplateType;
  coverImage: string;
  author: string;
  createdAt: string;
  modifiedAt: string;
  parentId: string | null;
  sections: PageSection[];
  versions: PageVersion[];
  tags: string[];
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const samplePages: IntranetPage[] = [
  {
    id: "page-1",
    title: "Engineering Team Hub",
    slug: "engineering-team-hub",
    status: "published",
    template: "team-site",
    coverImage: "",
    author: "Admin User",
    createdAt: "2026-02-10T09:00:00Z",
    modifiedAt: "2026-03-20T14:30:00Z",
    parentId: null,
    tags: ["engineering", "team"],
    versions: [
      { id: "v1", version: 1, modifiedAt: "2026-02-10T09:00:00Z", modifiedBy: "Admin User", summary: "Initial creation" },
      { id: "v2", version: 2, modifiedAt: "2026-03-20T14:30:00Z", modifiedBy: "Admin User", summary: "Updated quick links" },
    ],
    sections: [
      {
        id: "s1",
        layout: "full",
        webParts: [
          { id: "wp1", type: "text", title: "Welcome", content: "Welcome to the Engineering Team Hub. Find all resources, docs, and team info here.", config: {} },
        ],
      },
      {
        id: "s2",
        layout: "two-column",
        webParts: [
          {
            id: "wp2",
            type: "quick-links",
            title: "Quick Links",
            content: "",
            config: {
              links: [
                { label: "Sprint Board", url: "#", icon: "layout" },
                { label: "API Docs", url: "#", icon: "file-text" },
                { label: "CI/CD Pipeline", url: "#", icon: "git-branch" },
                { label: "Code Reviews", url: "#", icon: "check-circle" },
              ],
            },
          },
          {
            id: "wp3",
            type: "people",
            title: "Team Members",
            content: "",
            config: {
              members: [
                { name: "Arjun Mehta", role: "Engineering Lead", avatar: "AM" },
                { name: "Priya Patel", role: "Senior Developer", avatar: "PP" },
                { name: "Ravi Shankar", role: "DevOps Engineer", avatar: "RS" },
              ],
            },
          },
        ],
      },
      {
        id: "s3",
        layout: "full",
        webParts: [
          {
            id: "wp4",
            type: "news-feed",
            title: "Announcements",
            content: "",
            config: {
              items: [
                { title: "Sprint 24 Retrospective", date: "2026-03-18", summary: "Great velocity this sprint! Key wins and improvements discussed." },
                { title: "New CI/CD Pipeline Live", date: "2026-03-15", summary: "Deployment times reduced by 40% with the new pipeline." },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "page-2",
    title: "Company Announcements",
    slug: "company-announcements",
    status: "published",
    template: "communication-site",
    coverImage: "",
    author: "Ms. Priya Patel",
    createdAt: "2026-01-15T10:00:00Z",
    modifiedAt: "2026-03-22T11:00:00Z",
    parentId: null,
    tags: ["company", "announcements"],
    versions: [
      { id: "v3", version: 1, modifiedAt: "2026-01-15T10:00:00Z", modifiedBy: "Ms. Priya Patel", summary: "Initial creation" },
    ],
    sections: [
      {
        id: "s4",
        layout: "full",
        webParts: [
          { id: "wp5", type: "text", title: "Latest Updates", content: "Stay up to date with the latest company news and announcements. Check back regularly for updates from leadership.", config: {} },
        ],
      },
      {
        id: "s5",
        layout: "full",
        webParts: [
          {
            id: "wp6",
            type: "news-feed",
            title: "Recent News",
            content: "",
            config: {
              items: [
                { title: "Q1 2026 All-Hands Meeting", date: "2026-03-22", summary: "Join us for the quarterly all-hands meeting. Agenda includes product roadmap and team updates." },
                { title: "Office Renovation Complete", date: "2026-03-10", summary: "The 3rd floor renovation is now complete. New collaboration spaces are available." },
                { title: "New Health Benefits Program", date: "2026-02-28", summary: "Enhanced health benefits program launching April 1st. See HR portal for details." },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "page-3",
    title: "Project Atlas Hub",
    slug: "project-atlas-hub",
    status: "published",
    template: "project-hub",
    coverImage: "",
    author: "Arjun Mehta",
    createdAt: "2026-02-01T08:00:00Z",
    modifiedAt: "2026-03-19T16:00:00Z",
    parentId: null,
    tags: ["project", "atlas"],
    versions: [
      { id: "v4", version: 1, modifiedAt: "2026-02-01T08:00:00Z", modifiedBy: "Arjun Mehta", summary: "Initial creation" },
      { id: "v5", version: 2, modifiedAt: "2026-03-19T16:00:00Z", modifiedBy: "Arjun Mehta", summary: "Updated milestones" },
    ],
    sections: [
      {
        id: "s6",
        layout: "full",
        webParts: [
          { id: "wp7", type: "text", title: "Project Atlas", content: "Project Atlas is our next-generation analytics platform. Current phase: Beta Testing. Target launch: Q2 2026.", config: {} },
        ],
      },
      {
        id: "s7",
        layout: "two-column",
        webParts: [
          {
            id: "wp8",
            type: "file-list",
            title: "Project Documents",
            content: "",
            config: {
              files: [
                { name: "Project Charter.docx", type: "document", size: "245 KB", modified: "2026-02-01" },
                { name: "Technical Spec.pdf", type: "pdf", size: "1.2 MB", modified: "2026-02-15" },
                { name: "Budget Tracker.xlsx", type: "spreadsheet", size: "890 KB", modified: "2026-03-10" },
              ],
            },
          },
          {
            id: "wp9",
            type: "people",
            title: "Project Team",
            content: "",
            config: {
              members: [
                { name: "Arjun Mehta", role: "Project Lead", avatar: "AM" },
                { name: "Dr. Ananya Sharma", role: "Research Advisor", avatar: "AS" },
                { name: "Ravi Shankar", role: "Tech Lead", avatar: "RS" },
                { name: "Priya Patel", role: "Product Manager", avatar: "PP" },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "page-4",
    title: "Developer Knowledge Base",
    slug: "developer-knowledge-base",
    status: "published",
    template: "knowledge-base",
    coverImage: "",
    author: "Ravi Shankar",
    createdAt: "2026-01-20T09:00:00Z",
    modifiedAt: "2026-03-18T10:30:00Z",
    parentId: null,
    tags: ["docs", "knowledge-base", "dev"],
    versions: [
      { id: "v6", version: 1, modifiedAt: "2026-01-20T09:00:00Z", modifiedBy: "Ravi Shankar", summary: "Initial creation" },
    ],
    sections: [
      {
        id: "s8",
        layout: "full",
        webParts: [
          { id: "wp10", type: "text", title: "Developer Knowledge Base", content: "Central repository for development guides, coding standards, and architecture documentation.", config: {} },
        ],
      },
      {
        id: "s9",
        layout: "three-column",
        webParts: [
          {
            id: "wp11",
            type: "quick-links",
            title: "Getting Started",
            content: "",
            config: {
              links: [
                { label: "Setup Guide", url: "#", icon: "book-open" },
                { label: "Coding Standards", url: "#", icon: "code" },
                { label: "Git Workflow", url: "#", icon: "git-branch" },
              ],
            },
          },
          {
            id: "wp12",
            type: "quick-links",
            title: "Architecture",
            content: "",
            config: {
              links: [
                { label: "System Design", url: "#", icon: "layers" },
                { label: "API Reference", url: "#", icon: "server" },
                { label: "Database Schema", url: "#", icon: "database" },
              ],
            },
          },
          {
            id: "wp13",
            type: "quick-links",
            title: "Operations",
            content: "",
            config: {
              links: [
                { label: "Deployment", url: "#", icon: "rocket" },
                { label: "Monitoring", url: "#", icon: "activity" },
                { label: "Incident Response", url: "#", icon: "alert-triangle" },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "page-5",
    title: "HR Onboarding Wiki",
    slug: "hr-onboarding-wiki",
    status: "draft",
    template: "wiki",
    coverImage: "",
    author: "Ms. Priya Patel",
    createdAt: "2026-03-15T11:00:00Z",
    modifiedAt: "2026-03-21T09:00:00Z",
    parentId: null,
    tags: ["hr", "onboarding", "wiki"],
    versions: [
      { id: "v7", version: 1, modifiedAt: "2026-03-15T11:00:00Z", modifiedBy: "Ms. Priya Patel", summary: "Initial draft" },
    ],
    sections: [
      {
        id: "s10",
        layout: "full",
        webParts: [
          { id: "wp14", type: "text", title: "New Employee Onboarding", content: "This wiki contains everything new employees need to know. From IT setup to company policies, find all onboarding resources here.", config: {} },
        ],
      },
      {
        id: "s11",
        layout: "two-column",
        webParts: [
          {
            id: "wp15",
            type: "quick-links",
            title: "First Week Checklist",
            content: "",
            config: {
              links: [
                { label: "IT Setup", url: "#", icon: "monitor" },
                { label: "HR Forms", url: "#", icon: "clipboard" },
                { label: "Team Introductions", url: "#", icon: "users" },
                { label: "Office Tour", url: "#", icon: "map-pin" },
              ],
            },
          },
          {
            id: "wp16",
            type: "file-list",
            title: "Required Documents",
            content: "",
            config: {
              files: [
                { name: "Employee Handbook.pdf", type: "pdf", size: "3.2 MB", modified: "2026-01-10" },
                { name: "Benefits Guide.pdf", type: "pdf", size: "1.8 MB", modified: "2026-02-01" },
                { name: "IT Policy.docx", type: "document", size: "520 KB", modified: "2026-03-01" },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "page-6",
    title: "Q1 2026 Product Roadmap",
    slug: "q1-2026-product-roadmap",
    status: "in_review",
    template: "communication-site",
    coverImage: "",
    author: "Arjun Mehta",
    createdAt: "2026-03-01T10:00:00Z",
    modifiedAt: "2026-03-22T08:00:00Z",
    parentId: null,
    tags: ["product", "roadmap"],
    versions: [
      { id: "v8", version: 1, modifiedAt: "2026-03-01T10:00:00Z", modifiedBy: "Arjun Mehta", summary: "Initial version" },
    ],
    sections: [
      {
        id: "s12",
        layout: "full",
        webParts: [
          { id: "wp17", type: "text", title: "Product Roadmap", content: "This page outlines our product roadmap for Q1 2026. Key focus areas include AI features, performance improvements, and new integrations.", config: {} },
        ],
      },
    ],
  },
];

interface PagesState {
  pages: IntranetPage[];
  selectedPageId: string | null;
  searchQuery: string;
  filterStatus: PageStatus | "all";
  filterTemplate: TemplateType | "all";
  sortBy: "modified" | "alphabetical" | "status";
  viewMode: "grid" | "list";
  showTemplateChooser: boolean;

  // Actions
  setSelectedPageId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: PageStatus | "all") => void;
  setFilterTemplate: (template: TemplateType | "all") => void;
  setSortBy: (sort: "modified" | "alphabetical" | "status") => void;
  setViewMode: (mode: "grid" | "list") => void;
  setShowTemplateChooser: (show: boolean) => void;
  createPage: (title: string, template: TemplateType) => string;
  updatePage: (id: string, updates: Partial<IntranetPage>) => void;
  deletePage: (id: string) => void;
  publishPage: (id: string) => void;
  addSection: (pageId: string, layout: SectionLayout) => void;
  removeSection: (pageId: string, sectionId: string) => void;
  addWebPart: (pageId: string, sectionId: string, type: WebPartType) => void;
  updateWebPart: (pageId: string, sectionId: string, webPartId: string, updates: Partial<WebPart>) => void;
  removeWebPart: (pageId: string, sectionId: string, webPartId: string) => void;
  moveSection: (pageId: string, sectionId: string, direction: "up" | "down") => void;
}

export const usePagesStore = create<PagesState>()((set, get) => ({
  pages: samplePages,
  selectedPageId: null,
  searchQuery: "",
  filterStatus: "all",
  filterTemplate: "all",
  sortBy: "modified",
  viewMode: "grid",
  showTemplateChooser: false,

  setSelectedPageId: (id) => set({ selectedPageId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterTemplate: (template) => set({ filterTemplate: template }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowTemplateChooser: (show) => set({ showTemplateChooser: show }),

  createPage: (title, template) => {
    const id = makeId();
    const newPage: IntranetPage = {
      id,
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      status: "draft",
      template,
      coverImage: "",
      author: "Admin User",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      parentId: null,
      tags: [],
      versions: [{ id: makeId(), version: 1, modifiedAt: new Date().toISOString(), modifiedBy: "Admin User", summary: "Initial creation" }],
      sections: [
        {
          id: makeId(),
          layout: "full",
          webParts: [{ id: makeId(), type: "text", title: "Welcome", content: "Start editing this page...", config: {} }],
        },
      ],
    };
    set((state) => ({ pages: [newPage, ...state.pages], showTemplateChooser: false }));
    return id;
  },

  updatePage: (id, updates) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...updates, modifiedAt: new Date().toISOString() } : p
      ),
    })),

  deletePage: (id) =>
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== id),
    })),

  publishPage: (id) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "published" as PageStatus,
              modifiedAt: new Date().toISOString(),
              versions: [
                ...p.versions,
                {
                  id: makeId(),
                  version: p.versions.length + 1,
                  modifiedAt: new Date().toISOString(),
                  modifiedBy: "Admin User",
                  summary: "Published",
                },
              ],
            }
          : p
      ),
    })),

  addSection: (pageId, layout) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              sections: [...p.sections, { id: makeId(), layout, webParts: [] }],
              modifiedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  removeSection: (pageId, sectionId) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId), modifiedAt: new Date().toISOString() }
          : p
      ),
    })),

  addWebPart: (pageId, sectionId, type) => {
    const titles: Record<WebPartType, string> = {
      text: "Text Block",
      "document-embed": "Document Embed",
      "spreadsheet-embed": "Spreadsheet Embed",
      "presentation-embed": "Presentation Embed",
      "quick-links": "Quick Links",
      "image-gallery": "Image Gallery",
      "file-list": "File List",
      people: "Team Members",
      "news-feed": "News Feed",
      chart: "Chart Widget",
      divider: "Divider",
    };
    const newWebPart: WebPart = {
      id: makeId(),
      type,
      title: titles[type],
      content: type === "text" ? "Enter text here..." : "",
      config: {},
    };
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId ? { ...s, webParts: [...s.webParts, newWebPart] } : s
              ),
              modifiedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  updateWebPart: (pageId, sectionId, webPartId, updates) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId
                  ? {
                      ...s,
                      webParts: s.webParts.map((wp) =>
                        wp.id === webPartId ? { ...wp, ...updates } : wp
                      ),
                    }
                  : s
              ),
              modifiedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  removeWebPart: (pageId, sectionId, webPartId) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId
                  ? { ...s, webParts: s.webParts.filter((wp) => wp.id !== webPartId) }
                  : s
              ),
              modifiedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  moveSection: (pageId, sectionId, direction) =>
    set((state) => ({
      pages: state.pages.map((p) => {
        if (p.id !== pageId) return p;
        const idx = p.sections.findIndex((s) => s.id === sectionId);
        if (idx === -1) return p;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= p.sections.length) return p;
        const newSections = [...p.sections];
        [newSections[idx], newSections[newIdx]] = [newSections[newIdx], newSections[idx]];
        return { ...p, sections: newSections, modifiedAt: new Date().toISOString() };
      }),
    })),
}));
