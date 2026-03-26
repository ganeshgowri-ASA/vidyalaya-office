"use client";

import { supabase } from "./supabase";

export type DocumentType = "document" | "spreadsheet" | "presentation";

export interface CloudDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * Save a document to Supabase. Creates a new row or upserts by id.
 */
export async function saveDocument(
  doc: Pick<CloudDocument, "title" | "content" | "type"> & { id?: string; user_id?: string }
): Promise<CloudDocument | null> {
  const payload = {
    ...(doc.id ? { id: doc.id } : {}),
    title: doc.title,
    content: doc.content,
    type: doc.type,
    user_id: doc.user_id || "anonymous",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("documents")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("saveDocument error:", error.message);
    return null;
  }

  return data as CloudDocument;
}

/**
 * Fetch all documents for a user, ordered by most recently updated.
 */
export async function listDocuments(
  userId?: string
): Promise<CloudDocument[]> {
  let query = supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listDocuments error:", error.message);
    return [];
  }

  return (data as CloudDocument[]) || [];
}

/**
 * Fetch a single document by id.
 */
export async function getDocument(id: string): Promise<CloudDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getDocument error:", error.message);
    return null;
  }

  return data as CloudDocument;
}

/**
 * Delete a document by id.
 */
export async function deleteDocument(id: string): Promise<boolean> {
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    console.error("deleteDocument error:", error.message);
    return false;
  }

  return true;
}

/**
 * Upload a file to the 'documents' storage bucket.
 */
export async function uploadDocumentFile(
  path: string,
  file: Blob | File,
  contentType?: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType,
    });

  if (error) {
    console.error("uploadDocumentFile error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a file from the 'documents' storage bucket.
 */
export async function deleteDocumentFile(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from("documents")
    .remove([path]);

  if (error) {
    console.error("deleteDocumentFile error:", error.message);
    return false;
  }

  return true;
}
