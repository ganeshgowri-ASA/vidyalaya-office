'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFileVersionStore } from '@/store/file-version-store';

interface UseAutoSaveVersionsOptions {
  /** Unique file identifier */
  fileId: string;
  /** File type (document, spreadsheet, etc.) */
  fileType: string;
  /** Function to get current editor content */
  getContent: () => string;
  /** Author name for version snapshots */
  author?: string;
}

/**
 * Hook that sets up auto-save version snapshots every 5 minutes
 * and provides a manual save function.
 */
export function useAutoSaveVersions({
  fileId,
  fileType,
  getContent,
  author = 'Current User',
}: UseAutoSaveVersionsOptions) {
  const {
    setActiveFile,
    createVersion,
    autoSaveEnabled,
    autoSaveIntervalMs,
  } = useFileVersionStore();

  const lastContentRef = useRef<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set active file on mount
  useEffect(() => {
    setActiveFile(fileId, fileType);
  }, [fileId, fileType, setActiveFile]);

  // Auto-save interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!autoSaveEnabled) return;

    intervalRef.current = setInterval(() => {
      const content = getContent();
      // Only save if content has changed
      if (content && content !== lastContentRef.current) {
        lastContentRef.current = content;
        createVersion(content, 'Auto-save', author, true);
      }
    }, autoSaveIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSaveEnabled, autoSaveIntervalMs, getContent, createVersion, author]);

  // Manual save function
  const saveVersion = useCallback(
    (label?: string) => {
      const content = getContent();
      if (content) {
        lastContentRef.current = content;
        createVersion(content, label || 'Manual save', author, false);
      }
    },
    [getContent, createVersion, author]
  );

  return { saveVersion };
}
