"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModuleType =
  | "document"
  | "spreadsheet"
  | "presentation"
  | "pdf"
  | "graphics"
  | "email"
  | "chat"
  | "notes"
  | "tasks"
  | "research"
  | "general";

export interface AIInteraction {
  id: string;
  timestamp: string;
  module: ModuleType;
  action: string;
  context?: string;
  result?: string;
}

export interface AIContextState {
  currentModule: ModuleType;
  activeDocumentTitle: string | null;
  recentInteractions: AIInteraction[];
  sessionStartTime: string;

  // Actions
  setCurrentModule: (module: ModuleType) => void;
  setActiveDocumentTitle: (title: string | null) => void;
  addInteraction: (interaction: Omit<AIInteraction, "id" | "timestamp">) => void;
  clearHistory: () => void;
  getContextSummary: () => string;
}

export const useAIContextStore = create<AIContextState>()(
  persist(
    (set, get) => ({
      currentModule: "general",
      activeDocumentTitle: null,
      recentInteractions: [],
      sessionStartTime: new Date().toISOString(),

      setCurrentModule: (module) => set({ currentModule: module }),

      setActiveDocumentTitle: (title) => set({ activeDocumentTitle: title }),

      addInteraction: (interaction) =>
        set((state) => {
          const newInteraction: AIInteraction = {
            ...interaction,
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
          };
          const updated = [newInteraction, ...state.recentInteractions].slice(0, 20);
          return { recentInteractions: updated };
        }),

      clearHistory: () => set({ recentInteractions: [] }),

      getContextSummary: () => {
        const state = get();
        const recent = state.recentInteractions.slice(0, 5);
        const parts: string[] = [
          `Current module: ${state.currentModule}`,
        ];
        if (state.activeDocumentTitle) {
          parts.push(`Active document: ${state.activeDocumentTitle}`);
        }
        if (recent.length > 0) {
          parts.push(
            `Recent actions: ${recent.map((i) => i.action).join(", ")}`
          );
        }
        return parts.join(". ");
      },
    }),
    {
      name: "vidyalaya-ai-context",
      partialize: (state) => ({
        recentInteractions: state.recentInteractions,
        currentModule: state.currentModule,
        activeDocumentTitle: state.activeDocumentTitle,
      }),
    }
  )
);
