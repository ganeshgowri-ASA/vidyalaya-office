export type FileType = "document" | "spreadsheet" | "presentation" | "pdf";

export interface VFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
  created: string;
  modified: string;
  owner: string;
  tags: string[];
  version: number;
  starred?: boolean;
  size?: number; // bytes
  folderId?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface VFolder {
  id: string;
  name: string;
  parentId: string | null;
  created: string;
  modified: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  item: string;
  tool: string;
  user: string;
  time: string;
  type: "edit" | "approve" | "comment" | "share" | "upload" | "delete" | "create";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "editor" | "viewer";
  preferences: {
    theme: "light" | "dark" | "system";
    defaultView: "grid" | "list";
    emailNotifications: boolean;
  };
}

export type TemplateCategory = "word" | "excel" | "ppt";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  subcategory: string;
  content: string;
  variables: Record<string, string>;
}

export type ReviewStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected";

export interface ReviewComment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface AuditEntry {
  action: string;
  userId: string;
  timestamp: string;
  details?: string;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  modifiedBy: string;
  modifiedAt: string;
  size?: number;
  note?: string;
}

export interface FileAuditEntry {
  id: string;
  fileId: string;
  action: "created" | "modified" | "viewed" | "shared" | "deleted" | "restored" | "moved" | "renamed" | "tagged";
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface DuplicateGroup {
  id: string;
  files: VFile[];
  reason: "exact" | "similar-name";
}

export interface RecentFileActivity {
  fileId: string;
  fileName: string;
  action: string;
  user: string;
  time: string;
}

export interface ReviewItem {
  id: string;
  fileId: string;
  status: ReviewStatus;
  submittedBy: string;
  reviewers: string[];
  comments: ReviewComment[];
  auditTrail: AuditEntry[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "editor" | "viewer";
}

export type ThemeName = "midnight" | "classic-light" | "ocean-blue" | "warm-sepia" | "nord-frost";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarAccent: string;
  topbar: string;
  topbarForeground: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
}
