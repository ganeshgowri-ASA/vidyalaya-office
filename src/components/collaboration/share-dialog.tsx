"use client";

import React, { useState } from "react";
import {
  X,
  Link2,
  Copy,
  Check,
  UserPlus,
  Globe,
  Lock,
  Mail,
  Trash2,
  ChevronDown,
  Shield,
  Eye,
  MessageSquare,
  Pencil,
} from "lucide-react";
import {
  useCollaborationStore,
  type PermissionLevel,
} from "@/store/collaboration-store";

export function ShareDialog() {
  const {
    showShareDialog,
    setShowShareDialog,
    sharedUsers,
    shareLinks,
    removeSharedUser,
    updateSharedUserPermission,
    createShareLink,
    revokeShareLink,
    currentUser,
    allUsers,
  } = useCollaborationStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<PermissionLevel>("comment");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [linkPermission, setLinkPermission] = useState<PermissionLevel>("view");

  if (!showShareDialog) return null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateLink = () => {
    createShareLink(linkPermission);
  };

  const permissionIcons: Record<PermissionLevel, React.ReactNode> = {
    view: <Eye size={12} />,
    comment: <MessageSquare size={12} />,
    edit: <Pencil size={12} />,
  };

  const permissionLabels: Record<PermissionLevel, string> = {
    view: "Can view",
    comment: "Can comment",
    edit: "Can edit",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div
        className="w-[520px] rounded-xl border shadow-2xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Share Document
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Manage access and invite collaborators
            </p>
          </div>
          <button
            onClick={() => setShowShareDialog(false)}
            className="rounded-lg p-1.5 hover:bg-[var(--muted)] transition-colors"
          >
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Invite people */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <label
            className="text-xs font-medium mb-2 block"
            style={{ color: "var(--foreground)" }}
          >
            Invite people
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <select
              value={invitePermission}
              onChange={(e) => setInvitePermission(e.target.value as PermissionLevel)}
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="view">Can view</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
            </select>
            <button
              onClick={() => {
                if (inviteEmail) setInviteEmail("");
              }}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <UserPlus size={14} />
              Invite
            </button>
          </div>
        </div>

        {/* People with access */}
        <div
          className="px-5 py-3 max-h-48 overflow-y-auto border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h3
            className="text-xs font-medium mb-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            People with access
          </h3>

          {/* Owner */}
          <div className="flex items-center gap-3 py-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name[0]}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                {currentUser.name} (You)
              </div>
              <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                {currentUser.email}
              </div>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-medium"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
            >
              Owner
            </span>
          </div>

          {/* Shared users */}
          {sharedUsers.map(({ user, permission }) => (
            <div key={user.id} className="flex items-center gap-3 py-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: user.color }}
              >
                {user.name[0]}
              </div>
              <div className="flex-1">
                <div
                  className="text-xs font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {user.name}
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {user.email}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={permission}
                  onChange={(e) =>
                    updateSharedUserPermission(
                      user.id,
                      e.target.value as PermissionLevel
                    )
                  }
                  className="rounded border px-2 py-1 text-[10px] outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <option value="view">Can view</option>
                  <option value="comment">Can comment</option>
                  <option value="edit">Can edit</option>
                </select>
                <button
                  onClick={() => removeSharedUser(user.id)}
                  className="rounded p-1 hover:bg-[var(--muted)]"
                  title="Remove access"
                >
                  <Trash2 size={12} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Link sharing */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 size={14} style={{ color: "var(--primary)" }} />
              <h3
                className="text-xs font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Share via link
              </h3>
            </div>
          </div>

          {/* Create new link */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={linkPermission}
              onChange={(e) =>
                setLinkPermission(e.target.value as PermissionLevel)
              }
              className="rounded-lg border px-3 py-2 text-xs outline-none flex-1"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="view">Anyone with the link can view</option>
              <option value="comment">Anyone with the link can comment</option>
              <option value="edit">Anyone with the link can edit</option>
            </select>
            <button
              onClick={handleCreateLink}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-[var(--muted)] transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <Link2 size={12} />
              Create link
            </button>
          </div>

          {/* Active links */}
          {shareLinks
            .filter((l) => l.isActive)
            .map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 mb-2"
                style={{ borderColor: "var(--border)" }}
              >
                <Globe
                  size={14}
                  style={{ color: "var(--muted-foreground)" }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {link.url}
                  </div>
                  <div
                    className="text-[9px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {permissionLabels[link.permission]}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyLink(link.url)}
                  className="rounded p-1.5 hover:bg-[var(--muted)]"
                  title="Copy link"
                >
                  {copiedLink === link.url ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Copy
                      size={12}
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  )}
                </button>
                <button
                  onClick={() => revokeShareLink(link.id)}
                  className="rounded p-1.5 hover:bg-[var(--muted)]"
                  title="Revoke link"
                >
                  <X
                    size={12}
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </button>
              </div>
            ))}

          {shareLinks.filter((l) => l.isActive).length === 0 && (
            <p
              className="text-[10px] text-center py-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              No active share links. Create one above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
