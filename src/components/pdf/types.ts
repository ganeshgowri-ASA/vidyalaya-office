// ─── Shared PDF Types ─────────────────────────────────────────────────────────

export type RibbonTabId = "home" | "edit" | "annotate" | "forms" | "organize" | "convert" | "security" | "review";

export type ConvertDirection =
  | "pdf-to-word" | "pdf-to-excel" | "pdf-to-ppt" | "pdf-to-image"
  | "word-to-pdf" | "excel-to-pdf" | "ppt-to-pdf" | "image-to-pdf";

export type CompressQuality = "low" | "medium" | "high";

export type SignatureMode = "draw" | "type" | "upload";

export interface Annotation {
  id: string;
  type: "text" | "highlight" | "underline" | "strikethrough" | "drawing" | "stamp" | "signature" | "redaction" | "sticky-note" | "shape";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  stamp?: string;
  stampType?: "Approved" | "Rejected" | "Draft" | "Confidential" | "Final";
  signatureDataUrl?: string;
  shapeType?: "rectangle" | "circle" | "line" | "arrow" | "polygon" | "star";
  noteColor?: string;
  noteOpen?: boolean;
}

export interface FormField {
  id: string;
  type: "text-input" | "checkbox" | "radio" | "dropdown" | "signature" | "date-picker";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  options?: string[];
  required?: boolean;
  value?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  page: number;
  level: number;
}

export interface WatermarkConfig {
  type: "text" | "image";
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  imageDataUrl?: string;
}

export interface CertificateInfo {
  name: string;
  email: string;
  organization: string;
  reason: string;
  date: string;
}

export interface MergeFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export interface HeaderFooterConfig {
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  fontSize: number;
  startPage: number;
  includePageNumbers: boolean;
  pageNumberFormat: "1" | "i" | "I" | "a" | "A";
}

export interface SearchResult {
  page: number;
  index: number;
  text: string;
}

export interface DocumentProperties {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  pageCount: number;
  fileSize: number;
}

export interface PrintOptions {
  pages: "all" | "current" | "range";
  range: string;
  copies: number;
  orientation: "portrait" | "landscape";
  scale: "actual" | "fit" | "shrink";
  includeAnnotations: boolean;
}

export interface ExportOptions {
  format: "pdf-a" | "pdf-x" | "standard";
  quality: "screen" | "ebook" | "printer" | "prepress";
  includeBookmarks: boolean;
  includeAnnotations: boolean;
  flatten: boolean;
}

export interface SecurityConfig {
  hasPassword: boolean;
  openPassword: string;
  permissionPassword: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowEditing: boolean;
  allowAnnotations: boolean;
  encryptionLevel: "128-aes" | "256-aes";
}

export interface MeasurementAnnotation {
  id: string;
  type: "distance" | "area" | "perimeter";
  page: number;
  points: { x: number; y: number }[];
  value: number;
  unit: string;
  color: string;
}

export interface CreatorElement {
  id: string;
  type: "text" | "image" | "table" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  imageDataUrl?: string;
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][];
  shapeType?: string;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

export const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  transition: "background-color 0.15s",
};

export const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

export const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
