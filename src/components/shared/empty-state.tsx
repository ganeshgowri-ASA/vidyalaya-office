"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  Table2,
  Presentation,
  FileDown,
  FolderOpen,
  Search,
  Trash2,
  Mail,
  MessageSquare,
  Inbox,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div
        className="float-animation mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: "var(--accent)", color: "var(--primary)" }}
      >
        <Icon size={36} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
        {description}
      </p>
      {actionLabel && (actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Plus size={16} />
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      ) : null)}
    </div>
  );
}

export const emptyStates = {
  documents: {
    icon: FileText,
    title: "No documents yet",
    description: "Create your first document to get started with the AI-powered editor.",
    actionLabel: "New Document",
    actionHref: "/document",
  },
  spreadsheets: {
    icon: Table2,
    title: "No spreadsheets yet",
    description: "Create a spreadsheet with formulas, charts, and pivot tables.",
    actionLabel: "New Spreadsheet",
    actionHref: "/spreadsheet",
  },
  presentations: {
    icon: Presentation,
    title: "No presentations yet",
    description: "Design beautiful slides with AI-generated content and layouts.",
    actionLabel: "New Presentation",
    actionHref: "/presentation",
  },
  pdfs: {
    icon: FileDown,
    title: "No PDF files",
    description: "Upload, annotate, merge, or convert PDF documents.",
    actionLabel: "Open PDF Tools",
    actionHref: "/pdf",
  },
  files: {
    icon: FolderOpen,
    title: "This folder is empty",
    description: "Upload files or create new documents to populate this folder.",
    actionLabel: "Upload Files",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters to find what you're looking for.",
  },
  trash: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Deleted files will appear here. They are automatically removed after 30 days.",
  },
  emails: {
    icon: Mail,
    title: "No emails",
    description: "Your inbox is empty. New messages will appear here.",
  },
  chat: {
    icon: MessageSquare,
    title: "No conversations yet",
    description: "Start a new conversation to collaborate with your team.",
    actionLabel: "New Conversation",
  },
  inbox: {
    icon: Inbox,
    title: "You're all caught up",
    description: "No new notifications or items require your attention.",
  },
} as const;
