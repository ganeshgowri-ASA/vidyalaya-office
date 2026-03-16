"use client";

import SpreadsheetWorkspace from "@/components/spreadsheet/spreadsheet-workspace";
import { CollaborationToolbar, CollabCommentsSidebar, ShareDialog, VersionHistoryPanel } from "@/components/collaboration";
import { useCollaborationStore } from "@/store/collaboration-store";

export default function SpreadsheetPage() {
  const { showCollabComments, showVersionHistory: showCollabHistory } = useCollaborationStore();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
