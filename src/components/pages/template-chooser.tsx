"use client";

import {
  X,
  Users,
  Megaphone,
  FolderKanban,
  BookOpen,
  BookMarked,
  FileText,
} from "lucide-react";
import { usePagesStore, type TemplateType } from "@/store/pages-store";
import { useRouter } from "next/navigation";
import { useState } from "react";

const templates: { type: TemplateType; label: string; description: string; icon: React.ElementType }[] = [
  { type: "team-site", label: "Team Site", description: "Hub for your team with quick links, news, and member directory", icon: Users },
  { type: "communication-site", label: "Communication Site", description: "Share news, announcements, and updates with your organization", icon: Megaphone },
  { type: "project-hub", label: "Project Hub", description: "Central place for project documents, milestones, and team info", icon: FolderKanban },
  { type: "knowledge-base", label: "Knowledge Base", description: "Searchable collection of articles and documentation", icon: BookOpen },
  { type: "wiki", label: "Wiki", description: "Hierarchical pages with internal linking for collaborative knowledge", icon: BookMarked },
  { type: "blank", label: "Blank Page", description: "Start from scratch with a blank canvas", icon: FileText },
];

export function TemplateChooser() {
  const router = useRouter();
  const { setShowTemplateChooser, createPage } = usePagesStore();
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);

  const handleCreate = () => {
    if (!selectedTemplate || !title.trim()) return;
    const id = createPage(title.trim(), selectedTemplate);
    router.push(`/pages/editor?id=${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-bold">Create New Page</h2>
          <button onClick={() => setShowTemplateChooser(false)} className="rounded p-1 opacity-60 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium opacity-70">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title..."
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              autoFocus
            />
          </div>

          <label className="mb-3 block text-sm font-medium opacity-70">Choose a Template</label>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTemplate === t.type;
              return (
                <button
                  key={t.type}
                  onClick={() => setSelectedTemplate(t.type)}
                  className="flex items-start gap-3 rounded-xl border p-4 text-left transition-all"
                  style={{
                    borderColor: isSelected ? "var(--primary)" : "var(--border)",
                    backgroundColor: isSelected ? "rgba(99,102,241,0.1)" : "var(--background)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: isSelected ? "var(--primary)" : "var(--sidebar-accent)" }}
                  >
                    <Icon size={20} style={{ color: "var(--primary-foreground)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs opacity-50 mt-0.5">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setShowTemplateChooser(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTemplate || !title.trim()}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-30"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Create Page
          </button>
        </div>
      </div>
    </div>
  );
}
