"use client";

import { create } from "zustand";
import type { CloudDocument, DocumentType } from "@/lib/documents";
import {
  saveDocument,
  listDocuments,
  getDocument,
  deleteDocument,
} from "@/lib/documents";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface DocumentsState {
  /** All documents fetched from Supabase */
  documents: CloudDocument[];
  /** Whether the documents list is loading */
  loading: boolean;
  /** Current save status per document id */
  saveStatuses: Record<string, SaveStatus>;
  /** The currently active document id (being edited) per type */
  activeDocIds: Record<DocumentType, string | null>;
  /** Error message if any */
  error: string | null;

  // Actions
  fetchDocuments: (userId?: string) => Promise<void>;
  saveDoc: (
    doc: Pick<CloudDocument, "title" | "content" | "type"> & {
      id?: string;
      user_id?: string;
    }
  ) => Promise<CloudDocument | null>;
  openDocument: (id: string) => Promise<CloudDocument | null>;
  removeDocument: (id: string) => Promise<boolean>;
  setActiveDocId: (type: DocumentType, id: string | null) => void;
  getSaveStatus: (id: string) => SaveStatus;
}

export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: [],
  loading: false,
  saveStatuses: {},
  activeDocIds: {
    document: null,
    spreadsheet: null,
    presentation: null,
  },
  error: null,

  fetchDocuments: async (userId?: string) => {
    set({ loading: true, error: null });
    const docs = await listDocuments(userId);
    set({ documents: docs, loading: false });
  },

  saveDoc: async (doc) => {
    const tempId = doc.id || "new";
    set((state) => ({
      saveStatuses: { ...state.saveStatuses, [tempId]: "saving" },
    }));

    const saved = await saveDocument(doc);

    if (saved) {
      set((state) => {
        const existing = state.documents.findIndex((d) => d.id === saved.id);
        const docs = [...state.documents];
        if (existing >= 0) {
          docs[existing] = saved;
        } else {
          docs.unshift(saved);
        }
        return {
          documents: docs,
          saveStatuses: { ...state.saveStatuses, [saved.id]: "saved", [tempId]: "saved" },
          activeDocIds: {
            ...state.activeDocIds,
            [saved.type]: saved.id,
          },
        };
      });

      // Reset status after 3s
      setTimeout(() => {
        set((state) => ({
          saveStatuses: { ...state.saveStatuses, [saved.id]: "idle" },
        }));
      }, 3000);

      return saved;
    } else {
      set((state) => ({
        saveStatuses: { ...state.saveStatuses, [tempId]: "error" },
        error: "Failed to save document",
      }));
      return null;
    }
  },

  openDocument: async (id) => {
    const doc = await getDocument(id);
    if (doc) {
      set((state) => ({
        activeDocIds: { ...state.activeDocIds, [doc.type]: doc.id },
      }));
    }
    return doc;
  },

  removeDocument: async (id) => {
    const success = await deleteDocument(id);
    if (success) {
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
    }
    return success;
  },

  setActiveDocId: (type, id) => {
    set((state) => ({
      activeDocIds: { ...state.activeDocIds, [type]: id },
    }));
  },

  getSaveStatus: (id) => {
    return get().saveStatuses[id] || "idle";
  },
}));
