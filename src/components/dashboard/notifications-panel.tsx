"use client";

import { useState } from "react";
import {
  Bell,
  X,
  CheckCheck,
  Edit3,
  CheckCircle,
  MessageSquare,
  Share2,
  Upload,
  Trash2,
  FileText,
  Filter,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const activityIcons: Record<string, React.ElementType> = {
  edit: Edit3,
  approve: CheckCircle,
  comment: MessageSquare,
  share: Share2,
  upload: Upload,
  delete: Trash2,
  create: FileText,
};

const activityColors: Record<string, string> = {
  edit: "var(--primary)",
  approve: "#16a34a",
  comment: "#f59e0b",
  share: "#8b5cf6",
  upload: "#3b82f6",
  delete: "#dc2626",
  create: "#16a34a",
};

export function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    notifications,
    activities,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();
  const [tab, setTab] = useState<"notifications" | "activity">("notifications");
  const [filterType, setFilterType] = useState<string>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const notifTypeColor: Record<string, string> = {
    info: "var(--primary)",
    success: "#16a34a",
    warning: "#f59e0b",
    error: "#dc2626",
  };

  const filteredActivities = filterType === "all"
    ? activities
    : activities.filter((a) => a.type === filterType);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative z-10 flex w-full max-w-md flex-col border-l shadow-2xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Bell size={18} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "#dc2626" }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllNotificationsRead} className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: "var(--primary)" }}>
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="rounded-md p-1 hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {(["notifications", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                color: tab === t ? "var(--primary)" : "var(--muted-foreground)",
                borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "notifications" ? (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: n.read ? "transparent" : "var(--accent)",
                    }}
                  >
                    <div
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: n.read ? "transparent" : notifTypeColor[n.type] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{formatDate(n.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Activity filter */}
              <div className="flex items-center gap-2 px-4 py-2 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                {["all", "edit", "comment", "share", "approve", "create"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs capitalize"
                    style={{
                      backgroundColor: filterType === f ? "var(--accent)" : "transparent",
                      color: filterType === f ? "var(--accent-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredActivities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Filter size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No activity matching filter</p>
                  </div>
                ) : (
                  filteredActivities.map((item) => {
                    const Icon = activityIcons[item.type] || Edit3;
                    const color = activityColors[item.type] || "var(--primary)";
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
                        <div
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          <Icon size={12} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm" style={{ color: "var(--card-foreground)" }}>
                            <span className="font-medium">{item.user}</span> {item.action}{" "}
                            <span className="font-medium">{item.item}</span>
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {item.tool} &middot; {item.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
