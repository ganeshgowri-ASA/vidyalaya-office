"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCloudStorageStore } from "@/store/cloud-storage-store";
import type { VFile } from "@/types";

interface UseAutoSaveOptions {
  file: VFile | null;
  getContent: () => string;
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Auto-save hook that saves file content to cloud (authenticated) or localStorage (guest)
 * every `intervalMs` milliseconds (default 30s).
 */
export function useAutoSave({
  file,
  getContent,
  enabled = true,
  intervalMs,
}: UseAutoSaveOptions) {
  const {
    autoSaveEnabled,
    autoSaveIntervalMs,
    saveFileWithFallback,
    authMode,
    syncStatus,
    lastSyncedAt,
  } = useCloudStorageStore();

  const interval = intervalMs ?? autoSaveIntervalMs;
  const lastContentRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const save = useCallback(async () => {
    if (!file) return;

    const content = getContent();
    // Only save if content has changed
    if (content === lastContentRef.current) return;

    lastContentRef.current = content;
    await saveFileWithFallback(file, content);
  }, [file, getContent, saveFileWithFallback]);

  useEffect(() => {
    if (!enabled || !autoSaveEnabled || !file) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Initial save after a short delay
    const initialTimeout = setTimeout(() => {
      save();
    }, 2000);

    // Set up recurring auto-save
    timerRef.current = setInterval(() => {
      save();
    }, interval);

    return () => {
      clearTimeout(initialTimeout);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, autoSaveEnabled, file, interval, save]);

  // Save on unmount (component switching away)
  useEffect(() => {
    return () => {
      if (file && autoSaveEnabled) {
        const content = getContent();
        if (content && content !== lastContentRef.current) {
          saveFileWithFallback(file, content);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  return {
    saveNow: save,
    authMode,
    syncStatus,
    lastSyncedAt,
    isAutoSaveActive: enabled && autoSaveEnabled && !!file,
  };
}
