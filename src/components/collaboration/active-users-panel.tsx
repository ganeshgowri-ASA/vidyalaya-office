"use client";

import React, { useState } from "react";
import { Users, X, Circle, Clock, Edit3, Eye, Monitor } from "lucide-react";
import { useRealtimeStore } from "@/store/realtime-store";
import { useAuthStore } from "@/store/auth-store";

export function ActiveUsersPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeUsers } = useRealtimeStore();
  const { isGuest, user } = useAuthStore();

  const onlineUsers = activeUsers.filter((u) => u.isOnline);
  const offlineUsers = activeUsers.filter((u) => !u.isOnline);

  const formatLastActive = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Active now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isGuest) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
          title="Collaboration"
        >
          <Users size={16} />
          <span className="hidden sm:inline">Collaborate</span>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-72 rounded-xl border shadow-xl z-50"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--border)" }}
            >
              <h3
                className="text-xs font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Collaboration
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-[var(--muted)]"
              >
                <X size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
            <div className="p-4 text-center">
              <Users
                size={32}
                className="mx-auto mb-2"
                style={{ color: "var(--muted-foreground)" }}
              />
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Sign in to collaborate
              </p>
              <p
                className="text-xs mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Create an account or sign in to collaborate with others in
                real-time.
              </p>
              <a
                href="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Sign in to collaborate
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Stacked avatars trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors hover:bg-[var(--muted)]"
        title={`${onlineUsers.length + 1} users online`}
      >
        <div className="flex items-center">
          {/* Current user */}
          <div
            className="relative flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[var(--topbar)] z-10"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {user?.email?.[0]?.toUpperCase() || "Y"}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-1 ring-[var(--topbar)]" />
          </div>

          {/* Online collaborators */}
          {onlineUsers.slice(0, 3).map((u, i) => (
            <div
              key={u.id}
              className="relative flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[var(--topbar)]"
              style={{
                backgroundColor: u.color,
                marginLeft: -4,
                zIndex: 9 - i,
              }}
            >
              {u.name[0]}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-1 ring-[var(--topbar)]" />
            </div>
          ))}

          {onlineUsers.length > 3 && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium ring-2 ring-[var(--topbar)]"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)",
                marginLeft: -4,
              }}
            >
              +{onlineUsers.length - 3}
            </div>
          )}
        </div>

        <span
          className="text-[10px] hidden sm:inline"
          style={{ color: "var(--muted-foreground)" }}
        >
          {onlineUsers.length + 1}
        </span>
      </button>

      {/* Panel dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-80 rounded-xl border shadow-xl z-50"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
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
                Active Users
              </h3>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {onlineUsers.length + 1} online
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 hover:bg-[var(--muted)]"
            >
              <X size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>

          {/* Online users */}
          <div className="px-3 py-2">
            <div
              className="text-[10px] font-medium uppercase tracking-wider mb-2 px-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Currently Editing
            </div>

            {/* You */}
            <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--muted)]">
              <div className="relative">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {user?.email?.[0]?.toUpperCase() || "Y"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[var(--card)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {user?.email?.split("@")[0] || "You"} (You)
                </div>
                <div
                  className="text-[10px] flex items-center gap-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Edit3 size={9} />
                  Editing this document
                </div>
              </div>
            </div>

            {/* Online collaborators */}
            {onlineUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--muted)]"
              >
                <div className="relative">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.name[0]}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[var(--card)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {u.name}
                  </div>
                  <div
                    className="text-[10px] flex items-center gap-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {u.editingSection ? (
                      <>
                        <Edit3 size={9} />
                        Editing &ldquo;{u.editingSection}&rdquo;
                      </>
                    ) : (
                      <>
                        <Eye size={9} />
                        Viewing {u.currentPage}
                      </>
                    )}
                  </div>
                </div>
                <div
                  className="text-[9px] flex items-center gap-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Clock size={9} />
                  {formatLastActive(u.lastActive)}
                </div>
              </div>
            ))}
          </div>

          {/* Offline users */}
          {offlineUsers.length > 0 && (
            <div
              className="px-3 py-2 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="text-[10px] font-medium uppercase tracking-wider mb-2 px-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Offline ({offlineUsers.length})
              </div>
              {offlineUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 opacity-50"
                >
                  <div className="relative">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name[0]}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[var(--card)]"
                      style={{ backgroundColor: "var(--muted-foreground)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {u.name}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Last seen {formatLastActive(u.lastActive)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="border-t px-4 py-2 flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="text-[10px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Real-time collaboration active
            </span>
            <Circle
              size={8}
              fill="#22c55e"
              className="text-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
