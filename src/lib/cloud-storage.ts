"use client";

import { supabase } from "./supabase";
import type { VFile } from "@/types";

const BUCKET_NAME = "vidyalaya-files";
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB default

export interface CloudStorageConfig {
  bucket: string;
  quotaBytes: number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface DownloadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: "downloading" | "completed" | "error";
  error?: string;
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  fileCount: number;
  byType: Record<string, number>;
}

export interface CloudFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: string;
  cloudUrl?: string;
}

function getFilePath(userId: string, fileId: string, fileName: string): string {
  return `${userId}/${fileId}/${fileName}`;
}

function isAuthenticated(): boolean {
  // Check if Supabase URL is configured (non-empty)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && url.length > 0);
}

/**
 * Upload a file to cloud storage with progress tracking.
 * Returns the cloud URL on success.
 */
export async function uploadFileToCloud(
  userId: string,
  file: VFile,
  content: Blob | string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; size: number } | null> {
  if (!isAuthenticated()) return null;

  const path = getFilePath(userId, file.id, file.name);
  const blob =
    typeof content === "string" ? new Blob([content], { type: "text/plain" }) : content;

  // Simulate progress for UX since Supabase doesn't natively emit upload progress
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let currentProgress = 0;

  if (onProgress) {
    progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 10, 90);
      onProgress(currentProgress);
    }, 200);
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        cacheControl: "3600",
        upsert: true,
      });

    if (progressInterval) clearInterval(progressInterval);

    if (error) {
      onProgress?.(0);
      throw new Error(error.message);
    }

    onProgress?.(100);

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      size: blob.size,
    };
  } catch (err) {
    if (progressInterval) clearInterval(progressInterval);
    throw err;
  }
}

/**
 * Download a file from cloud storage with progress tracking.
 */
export async function downloadFileFromCloud(
  userId: string,
  fileId: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  if (!isAuthenticated()) return null;

  const path = getFilePath(userId, fileId, fileName);

  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let currentProgress = 0;

  if (onProgress) {
    progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 15, 85);
      onProgress(currentProgress);
    }, 150);
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (progressInterval) clearInterval(progressInterval);

    if (error) {
      onProgress?.(0);
      throw new Error(error.message);
    }

    onProgress?.(100);
    return data;
  } catch (err) {
    if (progressInterval) clearInterval(progressInterval);
    throw err;
  }
}

/**
 * Delete a file from cloud storage.
 */
export async function deleteFileFromCloud(
  userId: string,
  fileId: string,
  fileName: string
): Promise<boolean> {
  if (!isAuthenticated()) return false;

  const path = getFilePath(userId, fileId, fileName);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  return !error;
}

/**
 * List all files in cloud storage for a user.
 */
export async function listCloudFiles(
  userId: string
): Promise<CloudFile[]> {
  if (!isAuthenticated()) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(userId, { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });

  if (error || !data) return [];

  return data.map((item) => ({
    id: item.id ?? item.name,
    name: item.name,
    path: `${userId}/${item.name}`,
    size: item.metadata?.size ?? 0,
    type: item.metadata?.mimetype ?? "unknown",
    lastModified: item.updated_at ?? new Date().toISOString(),
  }));
}

/**
 * Get storage usage for a user.
 */
export async function getStorageUsage(
  userId: string,
  localFiles: VFile[]
): Promise<StorageUsage> {
  // Calculate from local file data as a baseline
  let usedBytes = 0;
  const byType: Record<string, number> = {};

  localFiles.forEach((file) => {
    const size = file.size || 0;
    usedBytes += size;
    byType[file.type] = (byType[file.type] || 0) + size;
  });

  // If authenticated, try to get actual cloud usage
  if (isAuthenticated()) {
    try {
      const cloudFiles = await listCloudFiles(userId);
      if (cloudFiles.length > 0) {
        let cloudUsed = 0;
        cloudFiles.forEach((f) => {
          cloudUsed += f.size;
        });
        // Use cloud data if available, otherwise fall back to local calculation
        if (cloudUsed > 0) {
          usedBytes = cloudUsed;
        }
      }
    } catch {
      // Fall back to local calculation
    }
  }

  return {
    usedBytes,
    quotaBytes: STORAGE_QUOTA_BYTES,
    fileCount: localFiles.length,
    byType,
  };
}

/**
 * Save file content to localStorage as fallback for guest/offline mode.
 */
export function saveToLocalStorage(fileId: string, content: string): void {
  try {
    localStorage.setItem(`vfile_${fileId}`, content);
    localStorage.setItem(`vfile_${fileId}_ts`, new Date().toISOString());
  } catch {
    // localStorage might be full
    console.warn("localStorage save failed for file:", fileId);
  }
}

/**
 * Load file content from localStorage.
 */
export function loadFromLocalStorage(fileId: string): string | null {
  try {
    return localStorage.getItem(`vfile_${fileId}`);
  } catch {
    return null;
  }
}

/**
 * Get the last-saved timestamp from localStorage.
 */
export function getLocalSaveTimestamp(fileId: string): string | null {
  try {
    return localStorage.getItem(`vfile_${fileId}_ts`);
  } catch {
    return null;
  }
}

/**
 * Format bytes into human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export { BUCKET_NAME, STORAGE_QUOTA_BYTES };
