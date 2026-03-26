"use client";

import { useCallback } from "react";
import { UploadCloud, Check, Loader2, AlertCircle } from "lucide-react";
import SpreadsheetWorkspace from "@/components/spreadsheet/spreadsheet-workspace";
import { CollaborationToolbar, CollabCommentsSidebar, ShareDialog, VersionHistoryPanel } from "@/components/collaboration";
import { useCollaborationStore } from "@/store/collaboration-store";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { useCloudAutoSave } from "@/hooks/use-cloud-autosave";
import { colToLetter } from "@/components/spreadsheet/formula-engine";

export default function SpreadsheetPage() {
  const { showCollabComments, showVersionHistory: showCollabHistory } = useCollaborationStore();

  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

  const getSpreadsheetContent = useCallback(() => {
    const sheet = getActiveSheet();
    const rows: string[] = [];
    for (let r = 0; r < 100; r++) {
      const cols: string[] = [];
      let hasContent = false;
      for (let c = 0; c < 26; c++) {
        const val = getCellDisplay(c, r);
        if (val) hasContent = true;
        cols.push(val || "");
      }
      if (hasContent) rows.push(cols.join("\t"));
    }
    return rows.join("\n");
  }, [getActiveSheet, getCellDisplay]);

  const { saveNow: cloudSave, saveStatus: cloudSaveStatus } = useCloudAutoSave({
    type: "spreadsheet",
    getTitle: () => "Spreadsheet",
    getContent: getSpreadsheetContent,
    intervalMs: 30000,
    enabled: true,
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Cloud Save Bar */}
      <div
        className="flex items-center justify-end gap-2 border-b px-4 py-1"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <button
          onClick={() => cloudSave()}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
          style={{
            borderColor: cloudSaveStatus === "saved" ? "#22c55e" : cloudSaveStatus === "error" ? "#dc2626" : "var(--border)",
            color: cloudSaveStatus === "saved" ? "#22c55e" : cloudSaveStatus === "error" ? "#dc2626" : "var(--foreground)",
          }}
          title="Save to Supabase Cloud"
        >
          {cloudSaveStatus === "saving" ? <Loader2 size={14} className="animate-spin" /> :
           cloudSaveStatus === "saved" ? <Check size={14} /> :
           cloudSaveStatus === "error" ? <AlertCircle size={14} /> :
           <UploadCloud size={14} />}
          {cloudSaveStatus === "saving" ? "Saving..." :
           cloudSaveStatus === "saved" ? "Saved" :
           cloudSaveStatus === "error" ? "Error" :
           "Save to Cloud"}
        </button>
      </div>
      <CollaborationToolbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <SpreadsheetWorkspace />
        </div>
        {showCollabComments && <CollabCommentsSidebar />}
        {showCollabHistory && <VersionHistoryPanel />}
      </div>
      <ShareDialog />
    </div>
  );
}
