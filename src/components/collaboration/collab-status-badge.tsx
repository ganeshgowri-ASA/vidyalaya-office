"use client";

import React from "react";
import { Users, Wifi, WifiOff } from "lucide-react";
import { useRealtimeStore } from "@/store/realtime-store";
import { useAuthStore } from "@/store/auth-store";

interface CollabStatusBadgeProps {
  compact?: boolean;
}

export function CollabStatusBadge({ compact = false }: CollabStatusBadgeProps) {
  const { activeUsers, syncStatus } = useRealtimeStore();
  const { isGuest } = useAuthStore();

  const onlineCount = activeUsers.filter((u) => u.isOnline).length;

  if (isGuest) {
    return (
      <div
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
        }}
      >
        <WifiOff size={10} />
        {!compact && <span>Local only</span>}
      </div>
    );
  }

  const isConnected = syncStatus !== "offline" && syncStatus !== "error";

  return (
    <div
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: isConnected
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(239, 68, 68, 0.15)",
        color: isConnected ? "#22c55e" : "#ef4444",
      }}
    >
      {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
      {!compact && (
        <>
          <Users size={10} />
          <span>
            {onlineCount + 1} {onlineCount + 1 === 1 ? "user" : "users"}
          </span>
        </>
      )}
    </div>
  );
}
