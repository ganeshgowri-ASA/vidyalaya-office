"use client";

import React, { useState } from "react";
import {
  FileText,
  Table2,
  Presentation,
  FileDown,
  Workflow,
  Search,
  Filter,
  Globe,
  Lock,
  Eye,
  MessageSquare,
  Pencil,
  Crown,
  Clock,
  Users,
  LogIn,
} from "lucide-react";
import { useSharingStore, type SharedDocument, type ShareRole } from "@/store/sharing-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const typeIcons: Record<SharedDocument["type"], React.ElementType> = {
  document: FileText,
  spreadsheet: Table2,
  presentation: Presentation,
  pdf: FileDown,
  graphics: Workflow,
};

const typeColors: Record<SharedDocument["type"], string> = {
  document: "#4285F4",
  spreadsheet: "#34A853",
  presentation: "#EA4335",
  pdf: "#FF6D01",
  graphics: "#7B1FA2",
};

const roleLabels: Record<ShareRole, string> = {
  owner: "Owner",
  editor: "Can edit",
  commenter: "Can comment",
  viewer: "Can view",
};

const roleIcons: Record<ShareRole, React.ElementType> = {
  owner: Crown,
  editor: Pencil,
  commenter: MessageSquare,
  viewer: Eye,
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GuestPrompt() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20"
      style={{ color: "var(--foreground)" }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <LogIn size={28} style={{ color: "var(--primary)" }} />
      </div>
      <h2 className="text-lg font-semibold mb-2">Sign in to view shared documents</h2>
      <p className="text-sm mb-6 max-w-md text-center" style={{ color: "var(--muted-foreground)" }}>
        You need to sign in to access documents shared with you and manage sharing permissions.
      </p>
      <a
        href="/auth/signin?callbackUrl=/shared"
        className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <LogIn size={16} />
        Sign in to share
      </a>
    </div>
  );
}

export function SharedDocumentsPage() {
  const { isGuest } = useAuthStore();
  const { sharedWithMe, mySharedDocuments } = useSharingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"shared-with-me" | "shared-by-me">("shared-with-me");
  const [typeFilter, setTypeFilter] = useState<SharedDocument["type"] | "all">("all");

  if (isGuest) {
    return (
      <div className="h-full" style={{ backgroundColor: "var(--background)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
            Shared Documents
          </h1>
        </div>
        <GuestPrompt />
      </div>
    );
  }

  const docs = activeTab === "shared-with-me" ? sharedWithMe : mySharedDocuments;
  const filtered = docs.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
              Shared Documents
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Documents shared with you and by you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {sharedWithMe.length} shared with you
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={() => setActiveTab("shared-with-me")}
            className={cn(
              "pb-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "shared-with-me"
                ? "border-[var(--primary)]"
                : "border-transparent"
            )}
            style={{
              color:
                activeTab === "shared-with-me"
                  ? "var(--primary)"
                  : "var(--muted-foreground)",
            }}
          >
            Shared with me ({sharedWithMe.length})
          </button>
          <button
            onClick={() => setActiveTab("shared-by-me")}
            className={cn(
              "pb-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "shared-by-me"
                ? "border-[var(--primary)]"
                : "border-transparent"
            )}
            style={{
              color:
                activeTab === "shared-by-me"
                  ? "var(--primary)"
                  : "var(--muted-foreground)",
            }}
          >
            Shared by me ({mySharedDocuments.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shared documents..."
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} style={{ color: "var(--muted-foreground)" }} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SharedDocument["type"] | "all")}
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="all">All types</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="presentation">Presentations</option>
              <option value="graphics">Graphics</option>
              <option value="pdf">PDFs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="px-6 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {searchQuery ? "No documents match your search" : "No shared documents yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table header */}
            <div
              className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>Name</span>
              <span>{activeTab === "shared-with-me" ? "Owner" : "Shared with"}</span>
              <span>Last modified</span>
              <span>Permission</span>
              <span>Access</span>
            </div>

            {filtered.map((doc) => {
              const TypeIcon = typeIcons[doc.type];
              const role = activeTab === "shared-with-me" ? doc.myRole : "owner";
              const RoleIcon = role ? roleIcons[role] : Eye;

              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${typeColors[doc.type]}20` }}
                    >
                      <TypeIcon size={18} style={{ color: typeColors[doc.type] }} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--foreground)" }}
                      >
                        {doc.title}
                      </div>
                      <div
                        className="text-[10px] capitalize"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {doc.type}
                      </div>
                    </div>
                  </div>

                  {/* Owner / Shared with */}
                  <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                    {activeTab === "shared-with-me"
                      ? doc.ownerName
                      : `${doc.permissions.length} people`}
                  </div>

                  {/* Last modified */}
                  <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <Clock size={11} />
                    {formatRelativeTime(doc.modifiedAt)}
                  </div>

                  {/* Permission */}
                  <div className="flex items-center gap-1.5">
                    <RoleIcon size={12} style={{ color: "var(--primary)" }} />
                    <span className="text-xs" style={{ color: "var(--foreground)" }}>
                      {role ? roleLabels[role] : "—"}
                    </span>
                  </div>

                  {/* Access (public/private) */}
                  <div className="flex items-center gap-1">
                    {doc.isPublic ? (
                      <>
                        <Globe size={12} style={{ color: "var(--primary)" }} />
                        <span className="text-[10px]" style={{ color: "var(--primary)" }}>
                          Public
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock size={12} style={{ color: "var(--muted-foreground)" }} />
                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                          Private
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
