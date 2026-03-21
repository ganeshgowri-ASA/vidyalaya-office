"use client";

import React, { useState } from "react";
import { Users, X, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function GuestCollabPrompt() {
  const { isGuest } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <div
      className="flex items-center gap-3 border-b px-4 py-2"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <Users size={16} style={{ color: "var(--primary)" }} />
      <p
        className="flex-1 text-xs"
        style={{ color: "var(--foreground)" }}
      >
        <span className="font-medium">Sign in to collaborate</span>
        <span style={{ color: "var(--muted-foreground)" }}>
          {" "}&mdash; Work together with others in real-time, share documents, and track changes.
        </span>
      </p>
      <a
        href="/auth/login"
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <LogIn size={12} />
        Sign in
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-1 hover:bg-[var(--muted)] transition-colors"
        title="Dismiss"
      >
        <X size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </div>
  );
}
