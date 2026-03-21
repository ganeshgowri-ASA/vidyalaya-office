"use client";

import React, { useEffect, useRef } from "react";
import { Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { useRealtimeStore } from "@/store/realtime-store";
import { useAuthStore } from "@/store/auth-store";

export function SyncIndicator() {
  const { syncStatus, lastSyncedAt, pendingChanges, setSyncStatus, setSyncedNow } =
    useRealtimeStore();
  const { isGuest } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate periodic sync activity
  useEffect(() => {
    if (isGuest) return;

    intervalRef.current = setInterval(() => {
      const state = useRealtimeStore.getState();
      if (state.syncStatus === "synced") {
        // Simulate a brief sync
        setSyncStatus("syncing");
        setTimeout(() => {
          setSyncedNow();
        }, 800 + Math.random() * 400);
      }
    }, 8000 + Math.random() * 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isGuest, setSyncStatus, setSyncedNow]);

  if (isGuest) return null;

  const formatSyncTime = () => {
    if (!lastSyncedAt) return "Never";
    const diff = Date.now() - lastSyncedAt;
    if (diff < 5000) return "Just now";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const statusConfig = {
    synced: {
      icon: <Cloud size={14} />,
      label: "Synced",
      color: "#22c55e",
    },
    syncing: {
      icon: <Loader2 size={14} className="animate-spin" />,
      label: `Syncing${pendingChanges > 0 ? ` (${pendingChanges})` : ""}`,
      color: "var(--primary)",
    },
    offline: {
      icon: <CloudOff size={14} />,
      label: "Offline",
      color: "var(--muted-foreground)",
    },
    error: {
      icon: <AlertCircle size={14} />,
      label: "Sync error",
      color: "#ef4444",
    },
  };

  const config = statusConfig[syncStatus];

  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-colors"
      style={{ color: config.color }}
      title={`Last synced: ${formatSyncTime()}`}
    >
      {config.icon}
      <span className="hidden lg:inline">{config.label}</span>
    </div>
  );
}
