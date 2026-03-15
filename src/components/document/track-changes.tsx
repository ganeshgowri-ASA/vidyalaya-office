"use client";

import React from "react";
import { CheckCircle2, XCircle, GitCompareArrows } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function TrackChangesPanel() {
  const { trackChanges, toggleTrackChanges } = useDocumentStore();

  return (
    <div
      className="no-print border-b px-4 py-2 flex items-center gap-3"
      style={{
        backgroundColor: trackChanges ? "var(--accent)" : "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <GitCompareArrows
          size={15}
          style={{ color: trackChanges ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
        />
        <span
          className="text-xs font-medium"
          style={{ color: trackChanges ? "var(--accent-foreground)" : "var(--foreground)" }}
        >
          Track Changes: {trackChanges ? "ON" : "OFF"}
        </span>
      </div>

      <button
        onClick={toggleTrackChanges}
        className="rounded px-2.5 py-1 text-[11px] font-medium border transition-colors"
        style={{
          borderColor: "var(--border)",
          backgroundColor: trackChanges ? "var(--card)" : "var(--accent)",
          color: trackChanges ? "var(--foreground)" : "var(--accent-foreground)",
        }}
      >
        {trackChanges ? "Turn Off" : "Turn On"}
      </button>

      {trackChanges && (
        <>
          <div
            className="mx-1 h-4 w-px"
            style={{ backgroundColor: "var(--border)" }}
          />
          <button
            onClick={() => {
              const editor = document.getElementById("doc-editor");
              if (!editor) return;
              const insertions = editor.querySelectorAll(".track-insert");
              insertions.forEach((el) => {
                el.classList.remove("track-insert");
                (el as HTMLElement).style.color = "";
                (el as HTMLElement).style.backgroundColor = "";
              });
              const deletions = editor.querySelectorAll(".track-delete");
              deletions.forEach((el) => el.remove());
            }}
            className="flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--muted)] transition-colors"
            style={{ color: "var(--accent-foreground)" }}
            title="Accept all changes"
          >
            <CheckCircle2 size={13} />
            Accept All
          </button>
          <button
            onClick={() => {
              const editor = document.getElementById("doc-editor");
              if (!editor) return;
              const deletions = editor.querySelectorAll(".track-delete");
              deletions.forEach((el) => {
                el.classList.remove("track-delete");
                (el as HTMLElement).style.textDecoration = "";
                (el as HTMLElement).style.color = "";
                (el as HTMLElement).style.backgroundColor = "";
              });
              const insertions = editor.querySelectorAll(".track-insert");
              insertions.forEach((el) => el.remove());
            }}
            className="flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--muted)] transition-colors"
            style={{ color: "var(--accent-foreground)" }}
            title="Reject all changes"
          >
            <XCircle size={13} />
            Reject All
          </button>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: "#dcfce7" }}
              />
              <span style={{ color: "var(--muted-foreground)" }}>Insertion</span>
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: "#fee2e2" }}
              />
              <span style={{ color: "var(--muted-foreground)" }}>Deletion</span>
            </span>
          </div>
        </>
      )}

      {/* Inject track changes styles */}
      <style>{`
        .track-insert {
          color: #166534 !important;
          background-color: #dcfce7 !important;
          border-bottom: 2px solid #22c55e;
        }
        .track-delete {
          color: #991b1b !important;
          background-color: #fee2e2 !important;
          text-decoration: line-through !important;
        }
      `}</style>
    </div>
  );
}
