"use client";

import React from "react";
import { Monitor, Clock, X } from "lucide-react";
import { useCollaborationStore } from "@/store/collaboration-store";

export function PresenceIndicators() {
  const {
    currentUser,
    collaborators,
    showPresenceDetails,
    togglePresenceDetails,
  } = useCollaborationStore();

  if (!showPresenceDetails) return null;

  const onlineUsers = collaborators.filter((u) => u.isOnline);
  const offlineUsers = collaborators.filter((u) => !u.isOnline);

  const formatLastActive = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Active now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="absolute left-2 top-full z-50 mt-1 w-72 rounded-xl border shadow-xl"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Monitor size={14} style={{ color: "var(--primary)" }} />
          <h3
            className="text-xs font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Who&apos;s here
          </h3>
        </div>
        <button
          onClick={togglePresenceDetails}
          className="rounded p-1 hover:bg-[var(--muted)]"
        >
          <X size={14} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Online section */}
      <div className="px-3 py-2">
        <div
          className="text-[10px] font-medium uppercase tracking-wider mb-2 px-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Online ({onlineUsers.length + 1})
        </div>

        {/* Current user */}
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--muted)]">
          <div className="relative">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name[0]}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[var(--card)]" />
          </div>
          <div className="flex-1">
            <div
              className="text-xs font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {currentUser.name} (You)
            </div>
            <div
              className="text-[10px] flex items-center gap-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: currentUser.color }}
              />
              Editing this document
            </div>
          </div>
        </div>

        {/* Online collaborators */}
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--muted)]"
          >
            <div className="relative">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: user.color }}
              >
                {user.name[0]}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[var(--card)]" />
            </div>
            <div className="flex-1">
              <div
                className="text-xs font-medium"
                style={{ color: "var(--foreground)" }}
              >
                {user.name}
              </div>
              <div
                className="text-[10px] flex items-center gap-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                Viewing {user.currentPage}
              </div>
            </div>
            <div
              className="text-[9px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Clock size={9} className="inline mr-0.5" />
              {formatLastActive(user.lastActive)}
            </div>
          </div>
        ))}
      </div>

      {/* Offline section */}
      {offlineUsers.length > 0 && (
        <div className="px-3 py-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div
            className="text-[10px] font-medium uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Offline ({offlineUsers.length})
          </div>
          {offlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 opacity-60"
            >
              <div className="relative">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0]}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[var(--card)]"
                  style={{ backgroundColor: "var(--muted-foreground)" }}
                />
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
                  Last seen {formatLastActive(user.lastActive)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CursorOverlays() {
  const { collaborators } = useCollaborationStore();
  const onlineUsers = collaborators.filter(
    (u) => u.isOnline && u.cursorPosition
  );

  if (onlineUsers.length === 0) return null;

  return (
    <>
      {onlineUsers.map((user) => (
        <div
          key={user.id}
          className="pointer-events-none absolute z-40 transition-all duration-200"
          style={{
            left: user.cursorPosition?.x ?? 0,
            top: user.cursorPosition?.y ?? 0,
          }}
        >
          {/* Cursor line */}
          <div
            className="w-0.5 h-5"
            style={{ backgroundColor: user.color }}
          />
          {/* Name tag */}
          <div
            className="mt-0 rounded px-1.5 py-0.5 text-[9px] font-medium text-white whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </>
  );
}
