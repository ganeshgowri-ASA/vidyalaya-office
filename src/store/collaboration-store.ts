import { create } from "zustand";

export type PermissionLevel = "view" | "comment" | "edit";

export interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  lastActive: string;
  isOnline: boolean;
  currentPage: string;
}

export interface CommentMention {
  userId: string;
  name: string;
}

export interface CollabComment {
  id: string;
  author: CollaboratorUser;
  text: string;
  mentions: CommentMention[];
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  replies: CollabReply[];
  selectedText?: string;
  pageContext?: string;
}

export interface CollabReply {
  id: string;
  author: CollaboratorUser;
  text: string;
  mentions: CommentMention[];
  timestamp: string;
}

export interface ShareLink {
  id: string;
  url: string;
  permission: PermissionLevel;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface SharedUser {
  user: CollaboratorUser;
  permission: PermissionLevel;
  sharedAt: string;
}

export interface VersionHistoryEntry {
  id: string;
  version: string;
  author: CollaboratorUser;
  timestamp: string;
  changesSummary: string;
  contentSnapshot: string;
  changeCount: number;
}

export interface Notification {
  id: string;
  type: "comment" | "mention" | "reply" | "suggestion" | "share" | "edit";
  message: string;
  from: CollaboratorUser;
  timestamp: string;
  read: boolean;
  commentId?: string;
}

const COLLABORATOR_COLORS = [
  "#4285F4", "#EA4335", "#FBBC04", "#34A853",
  "#FF6D01", "#46BDC6", "#7B1FA2", "#C2185B",
  "#00897B", "#5C6BC0",
];

const MOCK_USERS: CollaboratorUser[] = [
  {
    id: "user-1",
    name: "You",
    email: "you@vidyalaya.edu",
    color: COLLABORATOR_COLORS[0],
    lastActive: new Date().toISOString(),
    isOnline: true,
    currentPage: "document",
  },
  {
    id: "user-2",
    name: "Priya Sharma",
    email: "priya@vidyalaya.edu",
    color: COLLABORATOR_COLORS[1],
    lastActive: new Date(Date.now() - 30000).toISOString(),
    isOnline: true,
    currentPage: "document",
  },
  {
    id: "user-3",
    name: "Arjun Patel",
    email: "arjun@vidyalaya.edu",
    color: COLLABORATOR_COLORS[2],
    lastActive: new Date(Date.now() - 120000).toISOString(),
    isOnline: true,
    currentPage: "document",
  },
  {
    id: "user-4",
    name: "Meera Reddy",
    email: "meera@vidyalaya.edu",
    color: COLLABORATOR_COLORS[3],
    lastActive: new Date(Date.now() - 600000).toISOString(),
    isOnline: false,
    currentPage: "spreadsheet",
  },
];

const MOCK_COMMENTS: CollabComment[] = [
  {
    id: "comment-1",
    author: MOCK_USERS[1],
    text: "Can we update the introduction to include the latest data from Q4?",
    mentions: [],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resolved: false,
    replies: [
      {
        id: "reply-1",
        author: MOCK_USERS[0],
        text: "Good idea, I'll add the Q4 figures.",
        mentions: [],
        timestamp: new Date(Date.now() - 3000000).toISOString(),
      },
    ],
    selectedText: "Introduction section",
  },
  {
    id: "comment-2",
    author: MOCK_USERS[2],
    text: "@Priya Sharma Should we move the charts to the appendix?",
    mentions: [{ userId: "user-2", name: "Priya Sharma" }],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    resolved: false,
    replies: [],
    selectedText: "Charts and Figures",
  },
  {
    id: "comment-3",
    author: MOCK_USERS[3],
    text: "The formatting in this table needs fixing.",
    mentions: [],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resolved: true,
    resolvedBy: "You",
    resolvedAt: new Date(Date.now() - 43200000).toISOString(),
    replies: [],
  },
];

const MOCK_VERSIONS: VersionHistoryEntry[] = [
  {
    id: "ver-1",
    version: "Current",
    author: MOCK_USERS[0],
    timestamp: new Date().toISOString(),
    changesSummary: "Updated conclusion paragraph",
    contentSnapshot: "",
    changeCount: 3,
  },
  {
    id: "ver-2",
    version: "2.1",
    author: MOCK_USERS[1],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    changesSummary: "Added Q4 performance data and charts",
    contentSnapshot: "",
    changeCount: 12,
  },
  {
    id: "ver-3",
    version: "2.0",
    author: MOCK_USERS[0],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    changesSummary: "Major restructure of document sections",
    contentSnapshot: "",
    changeCount: 45,
  },
  {
    id: "ver-4",
    version: "1.2",
    author: MOCK_USERS[2],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    changesSummary: "Fixed table formatting and added references",
    contentSnapshot: "",
    changeCount: 8,
  },
  {
    id: "ver-5",
    version: "1.1",
    author: MOCK_USERS[3],
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    changesSummary: "Initial review comments addressed",
    contentSnapshot: "",
    changeCount: 15,
  },
  {
    id: "ver-6",
    version: "1.0",
    author: MOCK_USERS[0],
    timestamp: new Date(Date.now() - 604800000).toISOString(),
    changesSummary: "Initial document creation",
    contentSnapshot: "",
    changeCount: 0,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "mention",
    message: "Arjun Patel mentioned you in a comment",
    from: MOCK_USERS[2],
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false,
    commentId: "comment-2",
  },
  {
    id: "notif-2",
    type: "comment",
    message: "Priya Sharma added a new comment",
    from: MOCK_USERS[1],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    commentId: "comment-1",
  },
  {
    id: "notif-3",
    type: "edit",
    message: "Meera Reddy edited the document",
    from: MOCK_USERS[3],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
];

interface CollaborationState {
  // Users & presence
  currentUser: CollaboratorUser;
  collaborators: CollaboratorUser[];
  allUsers: CollaboratorUser[];

  // Comments
  collabComments: CollabComment[];
  showCollabComments: boolean;
  commentFilter: "all" | "open" | "resolved";

  // Sharing
  showShareDialog: boolean;
  sharedUsers: SharedUser[];
  shareLinks: ShareLink[];

  // Version history
  showVersionHistory: boolean;
  versionHistory: VersionHistoryEntry[];

  // Notifications
  notifications: Notification[];
  showNotifications: boolean;

  // Presence
  showPresenceDetails: boolean;

  // Actions - Comments
  toggleCollabComments: () => void;
  setShowCollabComments: (show: boolean) => void;
  setCommentFilter: (filter: "all" | "open" | "resolved") => void;
  addCollabComment: (comment: CollabComment) => void;
  resolveCollabComment: (id: string) => void;
  unresolveCollabComment: (id: string) => void;
  deleteCollabComment: (id: string) => void;
  addCollabReply: (commentId: string, reply: CollabReply) => void;

  // Actions - Sharing
  toggleShareDialog: () => void;
  setShowShareDialog: (show: boolean) => void;
  addSharedUser: (user: SharedUser) => void;
  removeSharedUser: (userId: string) => void;
  updateSharedUserPermission: (userId: string, permission: PermissionLevel) => void;
  createShareLink: (permission: PermissionLevel) => void;
  revokeShareLink: (id: string) => void;

  // Actions - Version history
  toggleVersionHistory: () => void;
  setShowVersionHistory: (show: boolean) => void;
  restoreVersion: (id: string) => void;

  // Actions - Notifications
  toggleNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;

  // Actions - Presence
  togglePresenceDetails: () => void;

  // Computed
  unreadNotificationCount: () => number;
  openCommentCount: () => number;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  collaborators: MOCK_USERS.filter((u) => u.id !== "user-1"),
  allUsers: MOCK_USERS,

  collabComments: MOCK_COMMENTS,
  showCollabComments: false,
  commentFilter: "all",

  showShareDialog: false,
  sharedUsers: MOCK_USERS.filter((u) => u.id !== "user-1").map((u) => ({
    user: u,
    permission: u.id === "user-2" ? "edit" as PermissionLevel : "comment" as PermissionLevel,
    sharedAt: new Date(Date.now() - 86400000).toISOString(),
  })),
  shareLinks: [],

  showVersionHistory: false,
  versionHistory: MOCK_VERSIONS,

  notifications: MOCK_NOTIFICATIONS,
  showNotifications: false,

  showPresenceDetails: false,

  // Comments
  toggleCollabComments: () => set((s) => ({ showCollabComments: !s.showCollabComments })),
  setShowCollabComments: (show) => set({ showCollabComments: show }),
  setCommentFilter: (filter) => set({ commentFilter: filter }),
  addCollabComment: (comment) => set((s) => ({ collabComments: [comment, ...s.collabComments] })),
  resolveCollabComment: (id) =>
    set((s) => ({
      collabComments: s.collabComments.map((c) =>
        c.id === id ? { ...c, resolved: true, resolvedBy: s.currentUser.name, resolvedAt: new Date().toISOString() } : c
      ),
    })),
  unresolveCollabComment: (id) =>
    set((s) => ({
      collabComments: s.collabComments.map((c) =>
        c.id === id ? { ...c, resolved: false, resolvedBy: undefined, resolvedAt: undefined } : c
      ),
    })),
  deleteCollabComment: (id) =>
    set((s) => ({ collabComments: s.collabComments.filter((c) => c.id !== id) })),
  addCollabReply: (commentId, reply) =>
    set((s) => ({
      collabComments: s.collabComments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      ),
    })),

  // Sharing
  toggleShareDialog: () => set((s) => ({ showShareDialog: !s.showShareDialog })),
  setShowShareDialog: (show) => set({ showShareDialog: show }),
  addSharedUser: (shared) => set((s) => ({ sharedUsers: [...s.sharedUsers, shared] })),
  removeSharedUser: (userId) =>
    set((s) => ({ sharedUsers: s.sharedUsers.filter((su) => su.user.id !== userId) })),
  updateSharedUserPermission: (userId, permission) =>
    set((s) => ({
      sharedUsers: s.sharedUsers.map((su) =>
        su.user.id === userId ? { ...su, permission } : su
      ),
    })),
  createShareLink: (permission) =>
    set((s) => ({
      shareLinks: [
        ...s.shareLinks,
        {
          id: `link-${Date.now()}`,
          url: `https://vidyalaya.app/share/${Date.now().toString(36)}`,
          permission,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ],
    })),
  revokeShareLink: (id) =>
    set((s) => ({
      shareLinks: s.shareLinks.map((l) =>
        l.id === id ? { ...l, isActive: false } : l
      ),
    })),

  // Version history
  toggleVersionHistory: () => set((s) => ({ showVersionHistory: !s.showVersionHistory })),
  setShowVersionHistory: (show) => set({ showVersionHistory: show }),
  restoreVersion: (id) => {
    const version = get().versionHistory.find((v) => v.id === id);
    if (version) {
      const restored: VersionHistoryEntry = {
        id: `ver-${Date.now()}`,
        version: "Restored",
        author: get().currentUser,
        timestamp: new Date().toISOString(),
        changesSummary: `Restored from v${version.version}`,
        contentSnapshot: version.contentSnapshot,
        changeCount: 0,
      };
      set((s) => ({ versionHistory: [restored, ...s.versionHistory] }));
    }
  },

  // Notifications
  toggleNotifications: () => set((s) => ({ showNotifications: !s.showNotifications })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  // Presence
  togglePresenceDetails: () => set((s) => ({ showPresenceDetails: !s.showPresenceDetails })),

  // Computed
  unreadNotificationCount: () => get().notifications.filter((n) => !n.read).length,
  openCommentCount: () => get().collabComments.filter((c) => !c.resolved).length,
}));
