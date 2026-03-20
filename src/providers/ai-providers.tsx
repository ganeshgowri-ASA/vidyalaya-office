"use client";

import React, { useEffect } from "react";
import { CommandBar, useCommandBar } from "@/components/ai/command-bar";
import { VoiceInput } from "@/components/ai/voice-input";
import { WritingAssistant } from "@/components/ai/writing-assistant";
import { SmartSuggestions } from "@/components/ai/smart-suggestions";
import { useAIContextStore } from "@/lib/ai-context-manager";
import { usePathname } from "next/navigation";
import type { ModuleType } from "@/lib/ai-context-manager";

function getModuleFromPath(pathname: string): ModuleType {
  if (pathname.startsWith("/document")) return "document";
  if (pathname.startsWith("/spreadsheet")) return "spreadsheet";
  if (pathname.startsWith("/presentation")) return "presentation";
  if (pathname.startsWith("/pdf")) return "pdf";
  if (pathname.startsWith("/graphics")) return "graphics";
  if (pathname.startsWith("/email")) return "email";
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/notes")) return "notes";
  if (pathname.startsWith("/tasks")) return "tasks";
  if (pathname.startsWith("/research")) return "research";
  return "general";
}

function AIContextSync() {
  const pathname = usePathname();
  const setCurrentModule = useAIContextStore((s) => s.setCurrentModule);

  useEffect(() => {
    const module = getModuleFromPath(pathname);
    setCurrentModule(module);
  }, [pathname, setCurrentModule]);

  return null;
}

function CommandBarWrapper() {
  const { isOpen, close } = useCommandBar();
  return <CommandBar isOpen={isOpen} onClose={close} />;
}

export function AIProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIContextSync />
      <CommandBarWrapper />
      <WritingAssistant />
      <SmartSuggestions />
      <VoiceInput />
    </>
  );
}
