"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, GitCompareArrows, ChevronDown, ChevronRight, Clock, User, Check, X } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function TrackChangesPanel() {
  const {
    trackChanges, toggleTrackChanges,
    trackChangesList, acceptTrackChange, rejectTrackChange, addTrackChange,
    showRevisionHistory, setShowRevisionHistory,
  } = useDocumentStore();

  const [showDetails, setShowDetails] = useState(false);

  const pendingChanges = trackChangesList.filter((c) => c.accepted === null);
  const acceptedChanges = trackChangesList.filter((c) => c.accepted === true);
  const rejectedChanges = trackChangesList.filter((c) => c.accepted === false);

  return (
    <div className="no-print border-b" style={{ borderColor: "var(--border)" }}>
      <div className="px-4 py-2 flex items-center gap-3"
        style={{
          backgroundColor: trackChanges ? "var(--accent)" : "var(--card)",
        }}>
        <div className="flex items-center gap-2">
          <GitCompareArrows
            size={15}
            style={{ color: trackChanges ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
          />
          <span className="text-xs font-medium"
            style={{ color: trackChanges ? "var(--accent-foreground)" : "var(--foreground)" }}>
            Track Changes: {trackChanges ? "ON" : "OFF"}
          </span>
        </div>

        <button onClick={toggleTrackChanges}
          className="rounded px-2.5 py-1 text-[11px] font-medium border transition-colors"
          style={{
            borderColor: "var(--border)",
            backgroundColor: trackChanges ? "var(--card)" : "var(--accent)",
            color: trackChanges ? "var(--foreground)" : "var(--accent-foreground)",
          }}>
          {trackChanges ? "Turn Off" : "Turn On"}
        </button>

        {trackChanges && (
          <>
            <div className="mx-1 h-4 w-px" style={{ backgroundColor: "var(--border)" }} />
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
                trackChangesList.filter((c) => c.accepted === null).forEach((c) => acceptTrackChange(c.id));
              }}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--accent-foreground)" }}
              title="Accept all changes">
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
                trackChangesList.filter((c) => c.accepted === null).forEach((c) => rejectTrackChange(c.id));
              }}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--accent-foreground)" }}
              title="Reject all changes">
              <XCircle size={13} />
              Reject All
            </button>

            <button onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--accent-foreground)" }}>
              {showDetails ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Details ({pendingChanges.length})
            </button>

            <button onClick={() => setShowRevisionHistory(!showRevisionHistory)}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--accent-foreground)" }}>
              <Clock size={12} />
              History
            </button>

            {/* Legend */}
            <div className="ml-auto flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#dcfce7" }} />
                <span style={{ color: "var(--muted-foreground)" }}>Insertion</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#fee2e2" }} />
                <span style={{ color: "var(--muted-foreground)" }}>Deletion</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Detailed changes list */}
      {trackChanges && showDetails && (
        <div className="border-t px-4 py-2 max-h-48 overflow-y-auto"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          {pendingChanges.length === 0 ? (
            <p className="text-[10px] text-center py-2" style={{ color: "var(--muted-foreground)" }}>
              No pending changes
            </p>
          ) : (
            pendingChanges.map((change) => (
              <div key={change.id} className="flex items-center gap-2 py-1.5 border-b"
                style={{ borderColor: "var(--border)" }}>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  change.type === "insert" ? "bg-green-100 text-green-700" :
                  change.type === "delete" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {change.type}
                </span>
                <span className="text-[10px] flex-1 truncate" style={{ color: "var(--foreground)" }}>
                  {change.content.substring(0, 50)}{change.content.length > 50 ? "..." : ""}
                </span>
                <span className="text-[9px] flex items-center gap-0.5" style={{ color: "var(--muted-foreground)" }}>
                  <User size={9} />{change.author}
                </span>
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(change.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex gap-0.5">
                  <button onClick={() => acceptTrackChange(change.id)}
                    className="p-0.5 rounded hover:bg-green-100" title="Accept">
                    <Check size={11} className="text-green-600" />
                  </button>
                  <button onClick={() => rejectTrackChange(change.id)}
                    className="p-0.5 rounded hover:bg-red-100" title="Reject">
                    <X size={11} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Revision History Panel */}
      {trackChanges && showRevisionHistory && (
        <div className="border-t px-4 py-2 max-h-48 overflow-y-auto"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <div className="text-[10px] font-medium mb-2" style={{ color: "var(--foreground)" }}>
            Revision History
          </div>
          {trackChangesList.length === 0 ? (
            <p className="text-[10px] text-center py-2" style={{ color: "var(--muted-foreground)" }}>
              No revision history yet
            </p>
          ) : (
            trackChangesList.map((change) => (
              <div key={change.id} className="flex items-center gap-2 py-1 border-b"
                style={{ borderColor: "var(--border)" }}>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  change.accepted === true ? "bg-green-100 text-green-700" :
                  change.accepted === false ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {change.accepted === true ? "accepted" : change.accepted === false ? "rejected" : "pending"}
                </span>
                <span className="text-[10px] flex-1 truncate" style={{ color: "var(--foreground)" }}>
                  [{change.type}] {change.content.substring(0, 40)}
                </span>
                <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(change.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
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
