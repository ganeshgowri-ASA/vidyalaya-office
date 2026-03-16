"use client";

import { useEffect } from "react";
import { AIChatPanel } from "./ai-chat-panel";
import { useAIChatStore } from "@/store/ai-chat-store";

export function AIChatWrapper() {
  const togglePanel = useAIChatStore((s) => s.togglePanel);

  // Keyboard shortcut: Ctrl+. to toggle AI panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        togglePanel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePanel]);

  return <AIChatPanel />;
}
