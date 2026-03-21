"use client";

import { create } from "zustand";

export type ShareRole = "owner" | "editor" | "commenter" | "viewer";

export interface SharePermission {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: ShareRole;
  sharedAt: string;
  lastAccessed?: string;
}

export interface SharedDocument {
  id: string;
  title: string;
  type: "document" | "spreadsheet" | "presentation" | "pdf" | "graphics";
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar?: string;
  isPublic: boolean;
  shareLink?: string;
  shareLinkRole: ShareRole;
  permissions: SharePermission[];
  createdAt: string;
  modifiedAt: string;
  sharedWithMeAt?: string;
  myRole?: ShareRole;
}

interface SharingState {
  // Shared documents list (docs shared with current user)
  sharedWithMe: SharedDocument[];
  // Documents I own and have shared
  mySharedDocuments: SharedDocument[];
  // Currently selected document for permission management
  activeDocumentId: string | null;
  // UI state
  showShareDialog: boolean;
  showPermissionPanel: boolean;
  shareDialogDocId: string | null;

  // Actions
  setShowShareDialog: (show: boolean, docId?: string | null) => void;
  setShowPermissionPanel: (show: boolean) => void;
  setActiveDocumentId: (id: string | null) => void;

  // Permission management
  addPermission: (docId: string, permission: SharePermission) => void;
  removePermission: (docId: string, permissionId: string) => void;
  updatePermissionRole: (docId: string, permissionId: string, role: ShareRole) => void;

  // Document visibility
  toggleDocumentPublic: (docId: string) => void;
  setShareLinkRole: (docId: string, role: ShareRole) => void;
  generateShareLink: (docId: string) => void;
  revokeShareLink: (docId: string) => void;

  // Helpers
  getDocumentById: (docId: string) => SharedDocument | undefined;
  getMyRoleForDocument: (docId: string) => ShareRole | undefined;
  canEdit: (docId: string) => boolean;
  canComment: (docId: string) => boolean;
}

const MOCK_SHARED_WITH_ME: SharedDocument[] = [
  {
    id: "shared-1",
    title: "Q4 Financial Report 2025",
    type: "spreadsheet",
    ownerId: "user-2",
    ownerName: "Priya Sharma",
    ownerEmail: "priya@vidyalaya.edu",
    isPublic: false,
    shareLinkRole: "viewer",
    permissions: [],
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    modifiedAt: new Date(Date.now() - 3600000).toISOString(),
    sharedWithMeAt: new Date(Date.now() - 172800000).toISOString(),
    myRole: "editor",
  },
  {
    id: "shared-2",
    title: "Product Launch Presentation",
    type: "presentation",
    ownerId: "user-3",
    ownerName: "Arjun Patel",
    ownerEmail: "arjun@vidyalaya.edu",
    isPublic: true,
    shareLink: "https://vidyalaya.app/share/pl2025",
    shareLinkRole: "viewer",
    permissions: [],
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    modifiedAt: new Date(Date.now() - 86400000).toISOString(),
    sharedWithMeAt: new Date(Date.now() - 604800000).toISOString(),
    myRole: "commenter",
  },
  {
    id: "shared-3",
    title: "Engineering Team Handbook",
    type: "document",
    ownerId: "user-4",
    ownerName: "Meera Reddy",
    ownerEmail: "meera@vidyalaya.edu",
    isPublic: false,
    shareLinkRole: "viewer",
    permissions: [],
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    modifiedAt: new Date(Date.now() - 7200000).toISOString(),
    sharedWithMeAt: new Date(Date.now() - 1209600000).toISOString(),
    myRole: "viewer",
  },
  {
    id: "shared-4",
    title: "Architecture Diagram v3",
    type: "graphics",
    ownerId: "user-3",
    ownerName: "Arjun Patel",
    ownerEmail: "arjun@vidyalaya.edu",
    isPublic: false,
    shareLinkRole: "viewer",
    permissions: [],
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    modifiedAt: new Date(Date.now() - 43200000).toISOString(),
    sharedWithMeAt: new Date(Date.now() - 259200000).toISOString(),
    myRole: "editor",
  },
  {
    id: "shared-5",
    title: "Vendor Contract Template",
    type: "pdf",
    ownerId: "user-2",
    ownerName: "Priya Sharma",
    ownerEmail: "priya@vidyalaya.edu",
    isPublic: false,
    shareLinkRole: "viewer",
    permissions: [],
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    modifiedAt: new Date(Date.now() - 172800000).toISOString(),
    sharedWithMeAt: new Date(Date.now() - 432000000).toISOString(),
    myRole: "viewer",
  },
];

const MOCK_MY_SHARED: SharedDocument[] = [
  {
    id: "my-shared-1",
    title: "Project Roadmap 2026",
    type: "document",
    ownerId: "user-1",
    ownerName: "You",
    ownerEmail: "you@vidyalaya.edu",
    isPublic: true,
    shareLink: "https://vidyalaya.app/share/pr2026",
    shareLinkRole: "viewer",
    permissions: [
      {
        id: "perm-1",
        email: "priya@vidyalaya.edu",
        name: "Priya Sharma",
        role: "editor",
        sharedAt: new Date(Date.now() - 86400000).toISOString(),
        lastAccessed: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "perm-2",
        email: "arjun@vidyalaya.edu",
        name: "Arjun Patel",
        role: "commenter",
        sharedAt: new Date(Date.now() - 172800000).toISOString(),
        lastAccessed: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "perm-3",
        email: "meera@vidyalaya.edu",
        name: "Meera Reddy",
        role: "viewer",
        sharedAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    modifiedAt: new Date(Date.now() - 1800000).toISOString(),
    myRole: "owner",
  },
  {
    id: "my-shared-2",
    title: "Budget Analysis Spreadsheet",
    type: "spreadsheet",
    ownerId: "user-1",
    ownerName: "You",
    ownerEmail: "you@vidyalaya.edu",
    isPublic: false,
    shareLinkRole: "viewer",
    permissions: [
      {
        id: "perm-4",
        email: "priya@vidyalaya.edu",
        name: "Priya Sharma",
        role: "editor",
        sharedAt: new Date(Date.now() - 432000000).toISOString(),
        lastAccessed: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    modifiedAt: new Date(Date.now() - 43200000).toISOString(),
    myRole: "owner",
  },
];

export const useSharingStore = create<SharingState>((set, get) => ({
  sharedWithMe: MOCK_SHARED_WITH_ME,
  mySharedDocuments: MOCK_MY_SHARED,
  activeDocumentId: null,
  showShareDialog: false,
  showPermissionPanel: false,
  shareDialogDocId: null,

  setShowShareDialog: (show, docId) =>
    set({ showShareDialog: show, shareDialogDocId: docId ?? null }),
  setShowPermissionPanel: (show) => set({ showPermissionPanel: show }),
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),

  addPermission: (docId, permission) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId
          ? { ...d, permissions: [...d.permissions, permission] }
          : d
      ),
    })),

  removePermission: (docId, permissionId) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId
          ? { ...d, permissions: d.permissions.filter((p) => p.id !== permissionId) }
          : d
      ),
    })),

  updatePermissionRole: (docId, permissionId, role) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId
          ? {
              ...d,
              permissions: d.permissions.map((p) =>
                p.id === permissionId ? { ...p, role } : p
              ),
            }
          : d
      ),
    })),

  toggleDocumentPublic: (docId) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId ? { ...d, isPublic: !d.isPublic } : d
      ),
    })),

  setShareLinkRole: (docId, role) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId ? { ...d, shareLinkRole: role } : d
      ),
    })),

  generateShareLink: (docId) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId
          ? {
              ...d,
              shareLink: `https://vidyalaya.app/share/${Date.now().toString(36)}`,
              isPublic: true,
            }
          : d
      ),
    })),

  revokeShareLink: (docId) =>
    set((s) => ({
      mySharedDocuments: s.mySharedDocuments.map((d) =>
        d.id === docId
          ? { ...d, shareLink: undefined, isPublic: false }
          : d
      ),
    })),

  getDocumentById: (docId) => {
    const all = [...get().sharedWithMe, ...get().mySharedDocuments];
    return all.find((d) => d.id === docId);
  },

  getMyRoleForDocument: (docId) => {
    const doc = get().getDocumentById(docId);
    return doc?.myRole;
  },

  canEdit: (docId) => {
    const role = get().getMyRoleForDocument(docId);
    return role === "owner" || role === "editor";
  },

  canComment: (docId) => {
    const role = get().getMyRoleForDocument(docId);
    return role === "owner" || role === "editor" || role === "commenter";
  },
}));
