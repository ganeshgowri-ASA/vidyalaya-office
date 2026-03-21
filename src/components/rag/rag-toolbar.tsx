"use client";

import {
  FileText,
  Upload,
  MessageSquare,
  Eye,
  Layers,
  Zap,
  Search,
  Settings,
  RefreshCw,
  BookOpen,
  Database,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRAGStore } from "@/store/rag-store";

type ActivePanel = "documents" | "chat" | "viewer" | "crossref" | "templates";

const PANELS: { key: ActivePanel; label: string; icon: React.ElementType; description: string }[] = [
  { key: "documents", label: "Documents", icon: Database, description: "Upload & manage documents" },
  { key: "chat", label: "AI Q&A", icon: Brain, description: "Ask questions about documents" },
  { key: "viewer", label: "Viewer", icon: Eye, description: "View document with highlights" },
  { key: "crossref", label: "Cross-Ref", icon: Layers, description: "Multi-document connections" },
  { key: "templates", label: "Templates", icon: Zap, description: "AI template auto-fill" },
];

export function RAGToolbar() {
  const { activePanel, setActivePanel, documents, selectedDocumentIds, conversations } = useRAGStore();

  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const processingCount = documents.filter((d) => d.status === "processing").length;

  return (
    <div
      className="flex items-center gap-1 border-b px-4 py-1.5"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Panel tabs */}
      <div className="flex items-center gap-0.5">
        {PANELS.map((panel) => {
          const isActive = activePanel === panel.key;
          return (
            <button
              key={panel.key}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive ? "" : "hover:opacity-80"
              )}
              style={{
                backgroundColor: isActive ? "var(--primary)" : "transparent",
                color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
              onClick={() => setActivePanel(panel.key)}
              title={panel.description}
            >
              <panel.icon size={14} />
              {panel.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span>{indexedCount} indexed</span>
        </div>
        {processingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <RefreshCw size={10} className="animate-spin" />
            <span>{processingCount} processing</span>
          </div>
        )}
        {selectedDocumentIds.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ backgroundColor: "var(--primary)" + "20", color: "var(--primary)" }}>
            <BookOpen size={10} />
            <span>{selectedDocumentIds.length} selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
