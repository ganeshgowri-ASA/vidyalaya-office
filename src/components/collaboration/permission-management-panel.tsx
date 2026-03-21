"use client";

import React, { useState } from "react";
import {
  X,
  Crown,
  Pencil,
  MessageSquare,
  Eye,
  Trash2,
  UserPlus,
  Mail,
  Clock,
  Shield,
  ChevronDown,
  LogIn,
} from "lucide-react";
import {
  useSharingStore,
  type ShareRole,
  type SharedDocument,
} from "@/store/sharing-store";
import { useAuthStore } from "@/store/auth-store";

const roleLabels: Record<ShareRole, string> = {
  owner: "Owner",
  editor: "Editor",
  commenter: "Commenter",
  viewer: "Viewer",
};

const roleDescriptions: Record<ShareRole, string> = {
  owner: "Full access, can manage permissions",
  editor: "Can edit, comment, and view",
  commenter: "Can comment and view",
  viewer: "Can only view",
};

const roleIcons: Record<ShareRole, React.ElementType> = {
  owner: Crown,
  editor: Pencil,
  commenter: MessageSquare,
  viewer: Eye,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PermissionManagementPanel() {
  const { isGuest } = useAuthStore();
  const {
    showPermissionPanel,
    setShowPermissionPanel,
    activeDocumentId,
    mySharedDocuments,
    addPermission,
    removePermission,
    updatePermissionRole,
  } = useSharingStore();

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<ShareRole>("viewer");

  if (!showPermissionPanel || !activeDocumentId) return null;

  const doc = mySharedDocuments.find((d) => d.id === activeDocumentId);
  if (!doc) return null;

  if (isGuest) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div
          className="w-[480px] rounded-xl border shadow-2xl p-8 text-center"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <LogIn size={32} className="mx-auto mb-3" style={{ color: "var(--primary)" }} />
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            Sign in to manage permissions
          </h2>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
            You need to be signed in to manage document permissions.
          </p>
          <button
            onClick={() => setShowPermissionPanel(false)}
            className="rounded-lg border px-4 py-2 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleAddPermission = () => {
    if (!newEmail.trim()) return;
    const permission = {
      id: `perm-${Date.now()}`,
      email: newEmail.trim(),
      name: newEmail.split("@")[0],
      role: newRole,
      sharedAt: new Date().toISOString(),
    };
    addPermission(doc.id, permission);
    setNewEmail("");
    setNewRole("viewer");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div
        className="w-[560px] max-h-[80vh] rounded-xl border shadow-2xl flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4 shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <Shield size={18} style={{ color: "var(--primary)" }} />
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Manage Permissions
              </h2>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {doc.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPermissionPanel(false)}
            className="rounded-lg p-1.5 hover:bg-[var(--muted)] transition-colors"
          >
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Role legend */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
            Permission levels
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["owner", "editor", "commenter", "viewer"] as ShareRole[]).map((role) => {
              const Icon = roleIcons[role];
              return (
                <div key={role} className="flex items-center gap-2">
                  <Icon size={12} style={{ color: "var(--primary)" }} />
                  <div>
                    <span className="text-[10px] font-medium" style={{ color: "var(--foreground)" }}>
                      {roleLabels[role]}
                    </span>
                    <span className="text-[9px] ml-1" style={{ color: "var(--muted-foreground)" }}>
                      — {roleDescriptions[role]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add new person */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <label className="text-xs font-medium mb-2 block" style={{ color: "var(--foreground)" }}>
            Add people
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
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPermission();
                }}
              />
            </div>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as ShareRole)}
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="editor">Editor</option>
              <option value="commenter">Commenter</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={handleAddPermission}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <UserPlus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* People list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <h3 className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
            People with access ({doc.permissions.length + 1})
          </h3>

          {/* Owner (current user) */}
          <div className="flex items-center gap-3 py-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#4285F4" }}
            >
              Y
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                You (Owner)
              </div>
              <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                {doc.ownerEmail}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Crown size={12} style={{ color: "#FBBC04" }} />
              <span className="text-[10px] font-medium" style={{ color: "var(--foreground)" }}>
                Owner
              </span>
            </div>
          </div>

          {/* Shared users */}
          {doc.permissions.map((perm) => {
            const RoleIcon = roleIcons[perm.role];
            return (
              <div key={perm.id} className="flex items-center gap-3 py-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "#46BDC6" }}
                >
                  {perm.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                    {perm.name}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {perm.email}
                  </div>
                  {perm.lastAccessed && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={9} style={{ color: "var(--muted-foreground)" }} />
                      <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                        Last accessed {formatDate(perm.lastAccessed)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={perm.role}
                    onChange={(e) =>
                      updatePermissionRole(doc.id, perm.id, e.target.value as ShareRole)
                    }
                    className="rounded border px-2 py-1 text-[10px] outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="editor">Editor</option>
                    <option value="commenter">Commenter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => removePermission(doc.id, perm.id)}
                    className="rounded p-1 hover:bg-[var(--muted)]"
                    title="Remove access"
                  >
                    <Trash2 size={12} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              </div>
            );
          })}

          {doc.permissions.length === 0 && (
            <p className="text-[10px] py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
              No one else has access. Add people above.
            </p>
          )}
        </div>

        {/* Footer with shared date */}
        <div
          className="border-t px-5 py-3 text-[10px] shrink-0"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          Document created {formatDate(doc.createdAt)} · Last modified {formatDate(doc.modifiedAt)}
        </div>
      </div>
    </div>
  );
}
