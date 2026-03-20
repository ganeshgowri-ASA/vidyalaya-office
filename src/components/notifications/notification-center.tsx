"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  CheckCheck,
  CheckCircle,
  MessageSquare,
  Share2,
  Clock,
  AlertCircle,
  Info,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "task_due" | "mention" | "share" | "comment" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

const STORAGE_KEY = "vidyalaya_notifications";

const defaultNotifications: AppNotification[] = [
  {
    id: "nc-1",
    type: "task_due",
    title: "Task Due Soon",
    description: "Fix spreadsheet formula parser is due in 2 hours",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "nc-2",
    type: "mention",
    title: "You were mentioned",
    description: "Priya Sharma mentioned you in Product Launch Deck",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
  {
    id: "nc-3",
    type: "share",
    title: "Document shared with you",
    description: "Rahul Verma shared 'Sales Dashboard 2024' with you",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read: false,
  },
  {
    id: "nc-4",
    type: "comment",
    title: "New comment",
    description: "Anita Patel commented on Q4 Business Report",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
  },
  {
    id: "nc-5",
    type: "system",
    title: "System Update",
    description: "Vidyalaya Office has been updated to v2.4.0 with new features",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: true,
  },
  {
    id: "nc-6",
    type: "task_due",
    title: "Task Overdue",
    description: "Implement AI summarization API was due yesterday",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "nc-7",
    type: "mention",
    title: "You were mentioned",
    description: "Dev Kumar mentioned you in the CI/CD pipeline ticket",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    read: true,
  },
  {
    id: "nc-8",
    type: "share",
    title: "File shared",
    description: "Annual Budget Proposal was shared with the Finance team",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: true,
  },
  {
    id: "nc-9",
    type: "comment",
    title: "Comment resolved",
    description: "Your comment on Research Paper Draft was resolved",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
  {
    id: "nc-10",
    type: "system",
    title: "Backup Complete",
    description: "Your files have been backed up successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
  },
];

const typeIcons: Record<NotificationType, React.ElementType> = {
  task_due: Clock,
  mention: MessageSquare,
  share: Share2,
  comment: MessageSquare,
  system: Info,
};

const typeColors: Record<NotificationType, string> = {
  task_due: "#f59e0b",
  mention: "#8b5cf6",
  share: "#3b82f6",
  comment: "#16a34a",
  system: "var(--muted-foreground)",
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return defaultNotifications;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return defaultNotifications;
}

function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(defaultNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationType | "all">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const markRead = (id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const filters: { label: string; value: NotificationType | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Tasks", value: "task_due" },
    { label: "Mentions", value: "mention" },
    { label: "Shared", value: "share" },
    { label: "Comments", value: "comment" },
    { label: "System", value: "system" },
  ];

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: "#dc2626" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 flex w-96 flex-col rounded-xl border shadow-2xl overflow-hidden"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", maxHeight: "520px" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3 shrink-0"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Bell size={16} style={{ color: "var(--primary)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                  title="Mark all as read"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
                title="Clear all"
              >
                <Trash2 size={12} />
              </button>
              <button onClick={() => setOpen(false)} style={{ color: "var(--muted-foreground)" }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div
            className="flex gap-1 overflow-x-auto border-b px-3 py-2 shrink-0"
            style={{ borderColor: "var(--border)" }}
          >
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors")}
                style={{
                  backgroundColor: activeFilter === f.value ? "var(--primary)" : "var(--secondary)",
                  color: activeFilter === f.value ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle size={32} className="mb-2" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No notifications
                </p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = typeIcons[n.type] || Info;
                const color = typeColors[n.type];
                return (
                  <div
                    key={n.id}
                    className="group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-90"
                    style={{ backgroundColor: n.read ? "transparent" : "var(--accent)" }}
                    onClick={() => markRead(n.id)}
                  >
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm"
                        style={{
                          color: "var(--card-foreground)",
                          fontWeight: n.read ? 400 : 600,
                        }}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        {n.description}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                        {formatTimeAgo(n.timestamp)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!n.read && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: "var(--primary)" }}
                        />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity hover:opacity-70"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="border-t px-4 py-2 shrink-0 text-center" style={{ borderColor: "var(--border)" }}>
              <button
                className="text-xs hover:opacity-70"
                style={{ color: "var(--primary)" }}
                onClick={() => { /* navigate to notifications page */ }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export unread count hook for use in topbar
export function useNotificationCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const notifications = loadNotifications();
    setCount(notifications.filter((n) => !n.read).length);
  }, []);
  return count;
}
