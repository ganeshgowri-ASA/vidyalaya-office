"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDocumentsStore } from "@/store/documents-store";
import type { DocumentType } from "@/lib/documents";

interface UseCloudAutoSaveOptions {
  /** The type of document */
  type: DocumentType;
  /** Function to get the current document title */
  getTitle: () => string;
  /** Function to get the current document content */
  getContent: () => string;
  /** Auto-save interval in ms (default: 30000 = 30s) */
  intervalMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook that auto-saves document content to Supabase every 30 seconds.
 * Returns a manual save function and the current save status.
 */
export function useCloudAutoSave({
  type,
  getTitle,
  getContent,
  intervalMs = 30000,
  enabled = true,
}: UseCloudAutoSaveOptions) {
  const saveDoc = useDocumentsStore((s) => s.saveDoc);
  const activeDocIds = useDocumentsStore((s) => s.activeDocIds);
  const saveStatuses = useDocumentsStore((s) => s.saveStatuses);
  const setActiveDocId = useDocumentsStore((s) => s.setActiveDocId);

  const lastContentRef = useRef<string>("");
  const docIdRef = useRef<string | null>(activeDocIds[type]);

  // Keep ref in sync
  useEffect(() => {
    docIdRef.current = activeDocIds[type];
  }, [activeDocIds, type]);

  const saveNow = useCallback(async () => {
    const title = getTitle();
    const content = getContent();

    if (!content && !title) return null;

    const result = await saveDoc({
      id: docIdRef.current || undefined,
      title: title || "Untitled",
      content,
      type,
      user_id: "anonymous",
    });

    if (result) {
      docIdRef.current = result.id;
      setActiveDocId(type, result.id);
      lastContentRef.current = content;
    }

    return result;
  }, [getTitle, getContent, saveDoc, type, setActiveDocId]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const content = getContent();
      // Only save if content has changed since last save
      if (content !== lastContentRef.current && content.length > 0) {
        saveNow();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, getContent, saveNow]);

  const currentDocId = activeDocIds[type];
  const saveStatus = currentDocId
    ? saveStatuses[currentDocId] || "idle"
    : "idle";

  return {
    saveNow,
    saveStatus,
    currentDocId,
  };
}
