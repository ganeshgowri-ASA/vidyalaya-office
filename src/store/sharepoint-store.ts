"use client";
import { create } from "zustand";

// ── Types ──────────────────────────────────────────────
export type SiteType = "team" | "communication" | "hub";
export type ViewMode = "list" | "grid" | "compact" | "calendar";
export type ColumnType = "text" | "number" | "date" | "choice" | "person" | "boolean" | "url";
export type WebPartType =
  | "text" | "image" | "hero" | "news" | "documentLibrary" | "list"
  | "quickLinks" | "people" | "events" | "weather" | "countdown"
  | "embed" | "divider" | "spacer" | "button" | "imageGallery"
  | "recentDocuments" | "siteActivity";

export interface SPSite {
  id: string;
  title: string;
  description: string;
  type: SiteType;
  url: string;
  logoUrl?: string;
  themeColor: string;
  owner: string;
  members: string[];
  createdAt: string;
  navigation: SPNavItem[];
  quickLaunch: SPNavItem[];
  pages: SPPage[];
}

export interface SPNavItem {
  id: string;
  label: string;
  href: string;
  children?: SPNavItem[];
}

export interface SPPage {
  id: string;
  title: string;
  slug: string;
  sections: SPSection[];
  author: string;
  publishedAt: string;
  modifiedAt: string;
  isHomePage?: boolean;
  bannerImageUrl?: string;
  description?: string;
}

export interface SPSection {
  id: string;
  columns: number; // 1, 2, 3
  webParts: SPWebPart[];
  backgroundShading?: "none" | "neutral" | "soft" | "strong";
}

export interface SPWebPart {
  id: string;
  type: WebPartType;
  title?: string;
  columnSpan?: number;
  config: Record<string, unknown>;
}

export interface SPDocument {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: number;
  modifiedBy: string;
  modifiedAt: string;
  createdBy: string;
  createdAt: string;
  parentId: string | null;
  shared: boolean;
  checkedOutBy?: string;
  versions: SPVersion[];
  metadata: Record<string, string>;
}

export interface SPVersion {
  number: string;
  modifiedBy: string;
  modifiedAt: string;
  size: number;
  comment: string;
}

export interface SPListColumn {
  id: string;
  name: string;
  type: ColumnType;
  required: boolean;
  choices?: string[];
  width?: number;
}

export interface SPListItem {
  id: string;
  values: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
}

export interface SPList {
  id: string;
  title: string;
  description: string;
  columns: SPListColumn[];
  items: SPListItem[];
  viewMode: ViewMode;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  groupByColumn?: string;
  filterColumn?: string;
  filterValue?: string;
}

export interface SPNewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  category: string;
}

export interface SPPerson {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  avatarColor: string;
  initials: string;
  phone?: string;
}

export interface SPEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  category: string;
  color: string;
}

// ── Mock Data ──────────────────────────────────────────
const mockPeople: SPPerson[] = [
  { id: "p1", name: "Sarah Chen", title: "VP of Engineering", department: "Engineering", email: "sarah.chen@contoso.com", avatarColor: "#4F46E5", initials: "SC", phone: "+1 555-0101" },
  { id: "p2", name: "Marcus Johnson", title: "Product Manager", department: "Product", email: "marcus.j@contoso.com", avatarColor: "#059669", initials: "MJ", phone: "+1 555-0102" },
  { id: "p3", name: "Priya Patel", title: "UX Designer", department: "Design", email: "priya.p@contoso.com", avatarColor: "#DC2626", initials: "PP", phone: "+1 555-0103" },
  { id: "p4", name: "David Kim", title: "Senior Developer", department: "Engineering", email: "david.k@contoso.com", avatarColor: "#D97706", initials: "DK", phone: "+1 555-0104" },
  { id: "p5", name: "Emma Wilson", title: "HR Director", department: "Human Resources", email: "emma.w@contoso.com", avatarColor: "#7C3AED", initials: "EW", phone: "+1 555-0105" },
  { id: "p6", name: "James Taylor", title: "CFO", department: "Finance", email: "james.t@contoso.com", avatarColor: "#0891B2", initials: "JT", phone: "+1 555-0106" },
  { id: "p7", name: "Lisa Rodriguez", title: "Marketing Lead", department: "Marketing", email: "lisa.r@contoso.com", avatarColor: "#BE185D", initials: "LR", phone: "+1 555-0107" },
  { id: "p8", name: "Alex Thompson", title: "DevOps Engineer", department: "Engineering", email: "alex.t@contoso.com", avatarColor: "#065F46", initials: "AT", phone: "+1 555-0108" },
];

const mockNews: SPNewsItem[] = [
  { id: "n1", title: "Q1 2026 All-Hands Meeting Recap", description: "Key highlights from our quarterly meeting including revenue growth, new product announcements, and team achievements.", imageUrl: "", author: "Sarah Chen", publishedAt: "2026-03-20", category: "Company" },
  { id: "n2", title: "New Office Wellness Program Launch", description: "We're excited to announce our comprehensive wellness program including gym memberships, mental health support, and flexible work hours.", imageUrl: "", author: "Emma Wilson", publishedAt: "2026-03-18", category: "HR" },
  { id: "n3", title: "Product Roadmap Update: What's Coming in Q2", description: "A look ahead at our exciting product plans including AI integration, mobile app redesign, and enterprise features.", imageUrl: "", author: "Marcus Johnson", publishedAt: "2026-03-15", category: "Product" },
  { id: "n4", title: "Engineering Team Wins Innovation Award", description: "Our engineering team received the Tech Excellence Award for their groundbreaking work on the real-time collaboration engine.", imageUrl: "", author: "David Kim", publishedAt: "2026-03-12", category: "Engineering" },
  { id: "n5", title: "Annual Charity Drive Results", description: "Together we raised over $50,000 for local STEM education programs. Thank you to everyone who contributed!", imageUrl: "", author: "Lisa Rodriguez", publishedAt: "2026-03-10", category: "Community" },
  { id: "n6", title: "New Security Compliance Certifications Achieved", description: "We're proud to announce SOC 2 Type II and ISO 27001 certifications, reinforcing our commitment to data security.", imageUrl: "", author: "Alex Thompson", publishedAt: "2026-03-08", category: "Security" },
];

const mockEvents: SPEvent[] = [
  { id: "e1", title: "Sprint Planning Meeting", startDate: "2026-03-24T09:00", endDate: "2026-03-24T10:30", location: "Conference Room A", description: "Bi-weekly sprint planning", category: "Meeting", color: "#4F46E5" },
  { id: "e2", title: "Design Review", startDate: "2026-03-25T14:00", endDate: "2026-03-25T15:00", location: "Design Studio", description: "Review new dashboard mockups", category: "Review", color: "#059669" },
  { id: "e3", title: "Company Town Hall", startDate: "2026-03-27T11:00", endDate: "2026-03-27T12:00", location: "Main Auditorium", description: "Monthly all-hands", category: "Company", color: "#DC2626" },
  { id: "e4", title: "Team Building: Escape Room", startDate: "2026-03-28T16:00", endDate: "2026-03-28T18:00", location: "Downtown Fun Zone", description: "Team social event", category: "Social", color: "#D97706" },
  { id: "e5", title: "Client Demo: Acme Corp", startDate: "2026-03-31T10:00", endDate: "2026-03-31T11:00", location: "Virtual (Teams)", description: "Product demo for enterprise client", category: "Client", color: "#7C3AED" },
];

const mockDocuments: SPDocument[] = [
  { id: "d0", name: "Documents", type: "folder", modifiedBy: "System", modifiedAt: "2026-03-20", createdBy: "System", createdAt: "2026-01-01", parentId: null, shared: false, versions: [], metadata: {} },
  { id: "d1", name: "Project Proposals", type: "folder", modifiedBy: "Sarah Chen", modifiedAt: "2026-03-20", createdBy: "Sarah Chen", createdAt: "2026-01-15", parentId: "d0", shared: true, versions: [], metadata: {} },
  { id: "d2", name: "Q1 Budget Report.xlsx", type: "file", fileType: "xlsx", size: 245000, modifiedBy: "James Taylor", modifiedAt: "2026-03-19", createdBy: "James Taylor", createdAt: "2026-03-01", parentId: "d0", shared: true, versions: [
    { number: "3.0", modifiedBy: "James Taylor", modifiedAt: "2026-03-19", size: 245000, comment: "Final approved version" },
    { number: "2.0", modifiedBy: "James Taylor", modifiedAt: "2026-03-15", size: 238000, comment: "Updated with Q1 actuals" },
    { number: "1.0", modifiedBy: "James Taylor", modifiedAt: "2026-03-01", size: 220000, comment: "Initial draft" },
  ], metadata: { Department: "Finance", Status: "Approved" } },
  { id: "d3", name: "Product Roadmap 2026.pptx", type: "file", fileType: "pptx", size: 1800000, modifiedBy: "Marcus Johnson", modifiedAt: "2026-03-18", createdBy: "Marcus Johnson", createdAt: "2026-02-20", parentId: "d0", shared: true, versions: [
    { number: "2.0", modifiedBy: "Marcus Johnson", modifiedAt: "2026-03-18", size: 1800000, comment: "Added Q2 slides" },
    { number: "1.0", modifiedBy: "Marcus Johnson", modifiedAt: "2026-02-20", size: 1500000, comment: "Initial roadmap" },
  ], metadata: { Department: "Product", Status: "Published" } },
  { id: "d4", name: "Brand Guidelines v3.pdf", type: "file", fileType: "pdf", size: 5200000, modifiedBy: "Priya Patel", modifiedAt: "2026-03-15", createdBy: "Priya Patel", createdAt: "2026-01-10", parentId: "d0", shared: true, versions: [
    { number: "3.0", modifiedBy: "Priya Patel", modifiedAt: "2026-03-15", size: 5200000, comment: "Updated color palette" },
  ], metadata: { Department: "Design", Status: "Active" } },
  { id: "d5", name: "Engineering Onboarding Guide.docx", type: "file", fileType: "docx", size: 340000, modifiedBy: "David Kim", modifiedAt: "2026-03-12", createdBy: "David Kim", createdAt: "2026-02-01", parentId: "d1", shared: true, versions: [
    { number: "1.0", modifiedBy: "David Kim", modifiedAt: "2026-02-01", size: 340000, comment: "First version" },
  ], metadata: { Department: "Engineering", Status: "Draft" } },
  { id: "d6", name: "Meeting Notes - March.docx", type: "file", fileType: "docx", size: 58000, modifiedBy: "Emma Wilson", modifiedAt: "2026-03-22", createdBy: "Emma Wilson", createdAt: "2026-03-05", parentId: "d0", shared: false, versions: [], metadata: { Department: "HR", Status: "Draft" } },
  { id: "d7", name: "API Documentation.md", type: "file", fileType: "md", size: 125000, modifiedBy: "Alex Thompson", modifiedAt: "2026-03-21", createdBy: "Alex Thompson", createdAt: "2026-02-15", parentId: "d1", shared: true, versions: [
    { number: "4.0", modifiedBy: "Alex Thompson", modifiedAt: "2026-03-21", size: 125000, comment: "Added v3 endpoints" },
  ], metadata: { Department: "Engineering", Status: "Published" } },
  { id: "d8", name: "Marketing Plan Q2.pptx", type: "file", fileType: "pptx", size: 2100000, modifiedBy: "Lisa Rodriguez", modifiedAt: "2026-03-20", createdBy: "Lisa Rodriguez", createdAt: "2026-03-10", parentId: "d0", shared: true, versions: [], metadata: { Department: "Marketing", Status: "In Review" } },
  { id: "d9", name: "Security Audit Report.pdf", type: "file", fileType: "pdf", size: 890000, modifiedBy: "Alex Thompson", modifiedAt: "2026-03-17", createdBy: "Alex Thompson", createdAt: "2026-03-17", parentId: "d1", shared: false, versions: [], metadata: { Department: "Engineering", Status: "Confidential" } },
  { id: "d10", name: "Employee Handbook 2026.pdf", type: "file", fileType: "pdf", size: 3400000, modifiedBy: "Emma Wilson", modifiedAt: "2026-03-14", createdBy: "Emma Wilson", createdAt: "2026-01-05", parentId: "d0", shared: true, versions: [], metadata: { Department: "HR", Status: "Published" } },
  { id: "d11", name: "Templates", type: "folder", modifiedBy: "System", modifiedAt: "2026-03-10", createdBy: "System", createdAt: "2026-01-01", parentId: "d0", shared: false, versions: [], metadata: {} },
  { id: "d12", name: "Invoice Template.xlsx", type: "file", fileType: "xlsx", size: 45000, modifiedBy: "James Taylor", modifiedAt: "2026-03-10", createdBy: "James Taylor", createdAt: "2026-02-01", parentId: "d11", shared: true, versions: [], metadata: { Status: "Active" } },
];

const mockLists: SPList[] = [
  {
    id: "l1",
    title: "Project Tracker",
    description: "Track all active projects across departments",
    viewMode: "list",
    sortColumn: "DueDate",
    sortDirection: "asc",
    columns: [
      { id: "c1", name: "Title", type: "text", required: true, width: 250 },
      { id: "c2", name: "Status", type: "choice", required: true, choices: ["Not Started", "In Progress", "In Review", "Completed", "On Hold"], width: 130 },
      { id: "c3", name: "Priority", type: "choice", required: false, choices: ["Critical", "High", "Medium", "Low"], width: 100 },
      { id: "c4", name: "Assigned To", type: "person", required: false, width: 150 },
      { id: "c5", name: "DueDate", type: "date", required: false, width: 120 },
      { id: "c6", name: "Budget", type: "number", required: false, width: 100 },
      { id: "c7", name: "Complete", type: "boolean", required: false, width: 80 },
    ],
    items: [
      { id: "li1", values: { Title: "Website Redesign", Status: "In Progress", Priority: "High", "Assigned To": "Priya Patel", DueDate: "2026-04-15", Budget: 45000, Complete: false }, createdBy: "Marcus Johnson", createdAt: "2026-02-01", modifiedBy: "Priya Patel", modifiedAt: "2026-03-20" },
      { id: "li2", values: { Title: "Mobile App v3.0", Status: "In Progress", Priority: "Critical", "Assigned To": "David Kim", DueDate: "2026-05-01", Budget: 120000, Complete: false }, createdBy: "Sarah Chen", createdAt: "2026-01-15", modifiedBy: "David Kim", modifiedAt: "2026-03-22" },
      { id: "li3", values: { Title: "SOC 2 Compliance", Status: "Completed", Priority: "Critical", "Assigned To": "Alex Thompson", DueDate: "2026-03-10", Budget: 35000, Complete: true }, createdBy: "Sarah Chen", createdAt: "2026-01-05", modifiedBy: "Alex Thompson", modifiedAt: "2026-03-08" },
      { id: "li4", values: { Title: "Employee Onboarding Portal", Status: "In Review", Priority: "Medium", "Assigned To": "Emma Wilson", DueDate: "2026-04-01", Budget: 25000, Complete: false }, createdBy: "Emma Wilson", createdAt: "2026-02-10", modifiedBy: "Emma Wilson", modifiedAt: "2026-03-18" },
      { id: "li5", values: { Title: "Q2 Marketing Campaign", Status: "Not Started", Priority: "High", "Assigned To": "Lisa Rodriguez", DueDate: "2026-04-20", Budget: 60000, Complete: false }, createdBy: "Lisa Rodriguez", createdAt: "2026-03-01", modifiedBy: "Lisa Rodriguez", modifiedAt: "2026-03-15" },
      { id: "li6", values: { Title: "Data Pipeline Migration", Status: "In Progress", Priority: "High", "Assigned To": "Alex Thompson", DueDate: "2026-04-30", Budget: 85000, Complete: false }, createdBy: "David Kim", createdAt: "2026-02-20", modifiedBy: "Alex Thompson", modifiedAt: "2026-03-21" },
      { id: "li7", values: { Title: "Customer Feedback System", Status: "On Hold", Priority: "Low", "Assigned To": "Marcus Johnson", DueDate: "2026-06-01", Budget: 15000, Complete: false }, createdBy: "Marcus Johnson", createdAt: "2026-03-05", modifiedBy: "Marcus Johnson", modifiedAt: "2026-03-12" },
      { id: "li8", values: { Title: "Annual Security Audit", Status: "Completed", Priority: "Critical", "Assigned To": "Alex Thompson", DueDate: "2026-03-15", Budget: 40000, Complete: true }, createdBy: "Sarah Chen", createdAt: "2026-02-01", modifiedBy: "Alex Thompson", modifiedAt: "2026-03-14" },
    ],
  },
  {
    id: "l2",
    title: "IT Assets",
    description: "Hardware and software inventory",
    viewMode: "grid",
    columns: [
      { id: "c1", name: "Asset Name", type: "text", required: true, width: 200 },
      { id: "c2", name: "Type", type: "choice", required: true, choices: ["Laptop", "Monitor", "Phone", "Software", "Peripheral"], width: 120 },
      { id: "c3", name: "Assigned To", type: "person", required: false, width: 150 },
      { id: "c4", name: "Purchase Date", type: "date", required: false, width: 120 },
      { id: "c5", name: "Cost", type: "number", required: false, width: 100 },
      { id: "c6", name: "Active", type: "boolean", required: false, width: 80 },
    ],
    items: [
      { id: "ai1", values: { "Asset Name": "MacBook Pro 16\"", Type: "Laptop", "Assigned To": "David Kim", "Purchase Date": "2025-09-15", Cost: 3499, Active: true }, createdBy: "System", createdAt: "2025-09-15", modifiedBy: "System", modifiedAt: "2025-09-15" },
      { id: "ai2", values: { "Asset Name": "Dell UltraSharp 27\"", Type: "Monitor", "Assigned To": "Sarah Chen", "Purchase Date": "2025-08-20", Cost: 649, Active: true }, createdBy: "System", createdAt: "2025-08-20", modifiedBy: "System", modifiedAt: "2025-08-20" },
      { id: "ai3", values: { "Asset Name": "iPhone 16 Pro", Type: "Phone", "Assigned To": "Marcus Johnson", "Purchase Date": "2025-10-01", Cost: 1199, Active: true }, createdBy: "System", createdAt: "2025-10-01", modifiedBy: "System", modifiedAt: "2025-10-01" },
      { id: "ai4", values: { "Asset Name": "Figma Enterprise", Type: "Software", "Assigned To": "Priya Patel", "Purchase Date": "2026-01-01", Cost: 75, Active: true }, createdBy: "System", createdAt: "2026-01-01", modifiedBy: "System", modifiedAt: "2026-01-01" },
    ],
  },
];

const defaultSite: SPSite = {
  id: "site1",
  title: "Contoso Intranet",
  description: "Your company hub for news, documents, and collaboration",
  type: "communication",
  url: "/sharepoint",
  themeColor: "#4F46E5",
  owner: "Sarah Chen",
  members: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
  createdAt: "2026-01-01",
  navigation: [
    { id: "nav1", label: "Home", href: "/sharepoint" },
    { id: "nav2", label: "Documents", href: "/sharepoint?view=library" },
    { id: "nav3", label: "Lists", href: "/sharepoint?view=lists" },
    { id: "nav4", label: "Pages", href: "/sharepoint?view=pages" },
    { id: "nav5", label: "News", href: "/sharepoint?view=news" },
  ],
  quickLaunch: [
    { id: "ql1", label: "Home", href: "/sharepoint" },
    { id: "ql2", label: "Shared Documents", href: "/sharepoint?view=library" },
    { id: "ql3", label: "Project Tracker", href: "/sharepoint?view=lists&list=l1" },
    { id: "ql4", label: "IT Assets", href: "/sharepoint?view=lists&list=l2" },
    { id: "ql5", label: "Site Pages", href: "/sharepoint?view=pages" },
    { id: "ql6", label: "Recycle Bin", href: "#" },
  ],
  pages: [
    {
      id: "pg1",
      title: "Home",
      slug: "home",
      isHomePage: true,
      author: "Sarah Chen",
      publishedAt: "2026-01-01",
      modifiedAt: "2026-03-20",
      bannerImageUrl: "",
      description: "Welcome to the Contoso Intranet",
      sections: [
        { id: "s1", columns: 1, webParts: [{ id: "wp1", type: "hero", config: { layout: "tiles", items: [
          { title: "Q1 2026 All-Hands Meeting Recap", description: "Key highlights from our quarterly meeting", category: "Company News", author: "Sarah Chen" },
          { title: "New Office Wellness Program", description: "Comprehensive wellness program launch", category: "HR", author: "Emma Wilson" },
          { title: "Product Roadmap Update", description: "What's coming in Q2", category: "Product", author: "Marcus Johnson" },
          { title: "Innovation Award Winners", description: "Engineering team wins Tech Excellence Award", category: "Awards", author: "David Kim" },
        ] } }], backgroundShading: "none" },
        { id: "s2", columns: 2, webParts: [
          { id: "wp2", type: "news", title: "Company News", config: { count: 4 } },
          { id: "wp3", type: "events", title: "Upcoming Events", config: { count: 4 } },
        ], backgroundShading: "none" },
        { id: "s3", columns: 1, webParts: [{ id: "wp4", type: "quickLinks", title: "Quick Links", config: { links: [
          { label: "IT Help Desk", icon: "monitor", url: "#" },
          { label: "HR Portal", icon: "users", url: "#" },
          { label: "Expense Reports", icon: "receipt", url: "#" },
          { label: "Training Center", icon: "graduationCap", url: "#" },
          { label: "Company Directory", icon: "contact", url: "#" },
          { label: "Benefits", icon: "heart", url: "#" },
        ] } }], backgroundShading: "neutral" },
        { id: "s4", columns: 2, webParts: [
          { id: "wp5", type: "recentDocuments", title: "Recent Documents", config: { count: 5 } },
          { id: "wp6", type: "people", title: "Leadership Team", config: { people: ["p1", "p2", "p6", "p5"] } },
        ], backgroundShading: "none" },
        { id: "s5", columns: 3, webParts: [
          { id: "wp7", type: "countdown", title: "Product Launch", config: { targetDate: "2026-05-01T09:00:00", label: "Until Product Launch" } },
          { id: "wp8", type: "weather", title: "Weather", config: { city: "San Francisco", temp: 68, condition: "Partly Cloudy", humidity: 55 } },
          { id: "wp9", type: "siteActivity", title: "Site Activity", config: {} },
        ], backgroundShading: "soft" },
        { id: "s6", columns: 1, webParts: [{ id: "wp10", type: "divider", config: {} }], backgroundShading: "none" },
        { id: "s7", columns: 1, webParts: [{ id: "wp11", type: "imageGallery", title: "Office Life", config: { images: [
          { caption: "Team Building Event", color: "#4F46E5" },
          { caption: "New Office Space", color: "#059669" },
          { caption: "Hackathon 2026", color: "#DC2626" },
          { caption: "Holiday Party", color: "#D97706" },
        ] } }], backgroundShading: "none" },
      ],
    },
  ],
};

// ── Store ──────────────────────────────────────────────
interface SharePointStore {
  // Site
  currentSite: SPSite;
  activePage: SPPage | null;
  activeView: "home" | "library" | "lists" | "pages" | "news" | "settings";

  // Document Library
  documents: SPDocument[];
  currentFolderId: string;
  selectedDocIds: string[];
  docSearchQuery: string;
  docViewMode: ViewMode;
  showVersionHistory: string | null;
  showDocDetails: string | null;

  // Lists
  lists: SPList[];
  activeListId: string | null;

  // News & People & Events
  news: SPNewsItem[];
  people: SPPerson[];
  events: SPEvent[];

  // UI
  quickLaunchOpen: boolean;
  editMode: boolean;
  searchQuery: string;
  showNewItemModal: boolean;
  showShareModal: boolean;
  showSettingsPanel: boolean;

  // Actions
  setActiveView: (view: SharePointStore["activeView"]) => void;
  setActivePage: (page: SPPage | null) => void;
  setCurrentFolderId: (id: string) => void;
  setSelectedDocIds: (ids: string[]) => void;
  toggleDocSelected: (id: string) => void;
  setDocSearchQuery: (q: string) => void;
  setDocViewMode: (mode: ViewMode) => void;
  setShowVersionHistory: (id: string | null) => void;
  setShowDocDetails: (id: string | null) => void;
  setActiveListId: (id: string | null) => void;
  setListViewMode: (listId: string, mode: ViewMode) => void;
  setListSort: (listId: string, column: string, direction: "asc" | "desc") => void;
  setListGroupBy: (listId: string, column: string | undefined) => void;
  setListFilter: (listId: string, column: string | undefined, value: string | undefined) => void;
  setQuickLaunchOpen: (open: boolean) => void;
  setEditMode: (mode: boolean) => void;
  setSearchQuery: (q: string) => void;
  setShowNewItemModal: (show: boolean) => void;
  setShowShareModal: (show: boolean) => void;
  setShowSettingsPanel: (show: boolean) => void;
  deleteDocuments: (ids: string[]) => void;
  addListItem: (listId: string, values: Record<string, unknown>) => void;
  deleteListItems: (listId: string, itemIds: string[]) => void;
}

export const useSharePointStore = create<SharePointStore>((set) => ({
  currentSite: defaultSite,
  activePage: defaultSite.pages[0],
  activeView: "home",
  documents: mockDocuments,
  currentFolderId: "d0",
  selectedDocIds: [],
  docSearchQuery: "",
  docViewMode: "list",
  showVersionHistory: null,
  showDocDetails: null,
  lists: mockLists,
  activeListId: "l1",
  news: mockNews,
  people: mockPeople,
  events: mockEvents,
  quickLaunchOpen: true,
  editMode: false,
  searchQuery: "",
  showNewItemModal: false,
  showShareModal: false,
  showSettingsPanel: false,

  setActiveView: (view) => set({ activeView: view }),
  setActivePage: (page) => set({ activePage: page }),
  setCurrentFolderId: (id) => set({ currentFolderId: id, selectedDocIds: [] }),
  setSelectedDocIds: (ids) => set({ selectedDocIds: ids }),
  toggleDocSelected: (id) => set((s) => ({
    selectedDocIds: s.selectedDocIds.includes(id)
      ? s.selectedDocIds.filter((d) => d !== id)
      : [...s.selectedDocIds, id],
  })),
  setDocSearchQuery: (q) => set({ docSearchQuery: q }),
  setDocViewMode: (mode) => set({ docViewMode: mode }),
  setShowVersionHistory: (id) => set({ showVersionHistory: id }),
  setShowDocDetails: (id) => set({ showDocDetails: id }),
  setActiveListId: (id) => set({ activeListId: id }),
  setListViewMode: (listId, mode) => set((s) => ({
    lists: s.lists.map((l) => l.id === listId ? { ...l, viewMode: mode } : l),
  })),
  setListSort: (listId, column, direction) => set((s) => ({
    lists: s.lists.map((l) => l.id === listId ? { ...l, sortColumn: column, sortDirection: direction } : l),
  })),
  setListGroupBy: (listId, column) => set((s) => ({
    lists: s.lists.map((l) => l.id === listId ? { ...l, groupByColumn: column } : l),
  })),
  setListFilter: (listId, column, value) => set((s) => ({
    lists: s.lists.map((l) => l.id === listId ? { ...l, filterColumn: column, filterValue: value } : l),
  })),
  setQuickLaunchOpen: (open) => set({ quickLaunchOpen: open }),
  setEditMode: (mode) => set({ editMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowNewItemModal: (show) => set({ showNewItemModal: show }),
  setShowShareModal: (show) => set({ showShareModal: show }),
  setShowSettingsPanel: (show) => set({ showSettingsPanel: show }),
  deleteDocuments: (ids) => set((s) => ({
    documents: s.documents.filter((d) => !ids.includes(d.id)),
    selectedDocIds: [],
  })),
  addListItem: (listId, values) => set((s) => ({
    lists: s.lists.map((l) => l.id === listId ? {
      ...l,
      items: [...l.items, {
        id: `li-${Date.now()}`,
        values,
        createdBy: "Current User",
        createdAt: new Date().toISOString().slice(0, 10),
        modifiedBy: "Current User",
        modifiedAt: new Date().toISOString().slice(0, 10),
      }],
    } : l),
  })),
  deleteListItems: (listId, itemIds) => set((s) => ({
    lists: s.lists.map((l) => l.id === listId ? {
      ...l,
      items: l.items.filter((i) => !itemIds.includes(i.id)),
    } : l),
  })),
}));
