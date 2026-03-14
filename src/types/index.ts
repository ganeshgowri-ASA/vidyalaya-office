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
