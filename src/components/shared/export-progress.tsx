"use client";

import React from "react";
import { Loader2, CheckCircle, X } from "lucide-react";

interface ExportProgressProps {
  visible: boolean;
  percent: number;
  message: string;
  onClose: () => void;
}

export function ExportProgress({ visible, percent, message, onClose }: ExportProgressProps) {
  if (!visible) return null;

  const isComplete = percent >= 100;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        minWidth: 280,
      }}
    >
      {isComplete ? (
        <CheckCircle size={18} style={{ color: "#16a34a" }} />
      ) : (
        <Loader2 size={18} className="animate-spin" style={{ color: "var(--primary)" }} />
      )}
      <div className="flex-1">
        <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          {message}
        </p>
        <div className="mt-1 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percent}%`,
              backgroundColor: isComplete ? "#16a34a" : "var(--primary)",
            }}
          />
        </div>
      </div>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-[var(--muted)]">
        <X size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </div>
  );
}
