"use client";

import React from "react";
import {
  Bell,
  X,
  MessageSquare,
  AtSign,
  Reply,
  Lightbulb,
  Share2,
  Pencil,
  Check,
  CheckCheck,
} from "lucide-react";
import { useCollaborationStore, type Notification } from "@/store/collaboration-store";

export function NotificationBadge() {
  const {
    notifications,
    showNotifications,
    toggleNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    unreadNotificationCount,
  } = useCollaborationStore();

  const unread = unreadNotificationCount();

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className={`relative flex items-center gap-1 rounded px-2.5 py-1.5 text-xs transition-colors ${
          showNotifications ? "bg-[var(--accent)]" : "hover:bg-[var(--muted)]"
        }`}
        style={{
          color: showNotifications
            ? "var(--accent-foreground)"
            : "var(--foreground)",
        }}
        title="Notifications"
      >
        <Bell size={14} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white bg-red-500">
            {unread}
          </span>
        )}
      </button>

      {showNotifications && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border shadow-xl"
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
            <h3
              className="text-xs font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Notifications
              {unread > 0 && (
                <span
                  className="ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                  style={{ backgroundColor: "#EA4335" }}
                >
                  {unread} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[10px] hover:bg-[var(--muted)]"
                  style={{ color: "var(--primary)" }}
                  title="Mark all as read"
                >
                  <CheckCheck size={12} />
                  Read all
                </button>
              )}
              <button
                onClick={toggleNotifications}
                className="rounded p-1 hover:bg-[var(--muted)]"
              >
                <X size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div
                className="p-6 text-center text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onMarkRead={markNotificationRead}
                  onClear={clearNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onClear,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClear: (id: string) => void;
}) {
  const typeIcons: Record<Notification["type"], React.ReactNode> = {
    comment: <MessageSquare size={12} />,
    mention: <AtSign size={12} />,
    reply: <Reply size={12} />,
    suggestion: <Lightbulb size={12} />,
    share: <Share2 size={12} />,
    edit: <Pencil size={12} />,
  };

  const typeColors: Record<Notification["type"], string> = {
    comment: "#4285F4",
    mention: "#EA4335",
    reply: "#34A853",
    suggestion: "#FBBC04",
    share: "#7B1FA2",
    edit: "#46BDC6",
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b hover:bg-[var(--muted)] transition-colors cursor-pointer ${
        !notification.read ? "bg-[var(--accent)]/30" : ""
      }`}
      style={{ borderColor: "var(--border)" }}
      onClick={() => onMarkRead(notification.id)}
    >
      {/* Icon */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${typeColors[notification.type]}15`,
          color: typeColors[notification.type],
        }}
      >
        {typeIcons[notification.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[11px] leading-relaxed"
            style={{
              color: "var(--foreground)",
              fontWeight: notification.read ? 400 : 600,
            }}
          >
            {notification.message}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear(notification.id);
            }}
            className="rounded p-0.5 hover:bg-[var(--muted)] flex-shrink-0"
          >
            <X size={10} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold text-white"
            style={{ backgroundColor: notification.from.color }}
          >
            {notification.from.name[0]}
          </div>
          <span
            className="text-[10px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {formatTime(notification.timestamp)}
          </span>
          {!notification.read && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}
