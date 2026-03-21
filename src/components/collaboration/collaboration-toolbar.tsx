"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Share2,
  Bell,
  History,
  Users,
  ChevronDown,
  FileCheck,
} from "lucide-react";
import { useCollaborationStore } from "@/store/collaboration-store";
import { NotificationBadge } from "./notification-badge";
import { ReviewStatusBadge } from "./review-workflow-panel";

export function CollaborationToolbar() {
  const {
    collaborators,
    currentUser,
    toggleCollabComments,
    showCollabComments,
    toggleShareDialog,
    toggleNotifications,
    showNotifications,
    toggleVersionHistory,
    showVersionHistory,
    unreadNotificationCount,
    openCommentCount,
    togglePresenceDetails,
    showPresenceDetails,
    toggleReviewPanel,
    showReviewPanel,
    reviewRequest,
  } = useCollaborationStore();

  const onlineUsers = collaborators.filter((u) => u.isOnline);
  const maxAvatars = 3;
  const extraCount = Math.max(0, onlineUsers.length - maxAvatars);

  return (
    <div
      className="no-print flex items-center gap-1 px-2 py-1 border-b"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      {/* Active users / Presence */}
      <div className="flex items-center gap-1.5 mr-2">
        <div className="relative flex items-center">
          {/* Current user */}
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-[var(--card)] z-10"
            style={{ backgroundColor: currentUser.color }}
            title={`${currentUser.name} (You)`}
          >
            {currentUser.name[0]}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[var(--card)]" />
          </div>

          {/* Collaborator avatars */}
          {onlineUsers.slice(0, maxAvatars).map((user, i) => (
            <div
              key={user.id}
              className="relative flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-[var(--card)]"
              style={{
                backgroundColor: user.color,
                marginLeft: -6,
                zIndex: maxAvatars - i,
              }}
              title={`${user.name} - ${user.isOnline ? "Online" : "Offline"}`}
            >
              {user.name[0]}
              {user.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[var(--card)]" />
              )}
            </div>
          ))}

          {extraCount > 0 && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium ring-2 ring-[var(--card)]"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)",
                marginLeft: -6,
              }}
            >
              +{extraCount}
            </div>
          )}
        </div>

        <button
          onClick={togglePresenceDetails}
          className="flex items-center gap-0.5 rounded px-1.5 py-1 text-[10px] hover:bg-[var(--muted)] transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          title="Show who's online"
        >
          <Users size={12} />
          <span>{onlineUsers.length + 1} online</span>
          <ChevronDown size={10} />
        </button>
      </div>

      <div className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

      {/* Comments button */}
      <div className="relative">
        <button
          onClick={toggleCollabComments}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors ${
            showCollabComments ? "bg-[var(--accent)]" : "hover:bg-[var(--muted)]"
          }`}
          style={{
            color: showCollabComments ? "var(--accent-foreground)" : "var(--foreground)",
          }}
          title="Toggle Comments"
        >
          <MessageSquare size={14} />
          <span className="hidden sm:inline">Comments</span>
          {openCommentCount() > 0 && (
            <span
              className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
              style={{ backgroundColor: "#EA4335" }}
            >
              {openCommentCount()}
            </span>
          )}
        </button>
      </div>

      {/* Version History */}
      <button
        onClick={toggleVersionHistory}
        className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors ${
          showVersionHistory ? "bg-[var(--accent)]" : "hover:bg-[var(--muted)]"
        }`}
        style={{
          color: showVersionHistory ? "var(--accent-foreground)" : "var(--foreground)",
        }}
        title="Version History"
      >
        <History size={14} />
        <span className="hidden sm:inline">History</span>
      </button>

      <div className="mx-1 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

      {/* Review Workflow */}
      <button
        onClick={toggleReviewPanel}
        className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors ${
          showReviewPanel ? "bg-[var(--accent)]" : "hover:bg-[var(--muted)]"
        }`}
        style={{
          color: showReviewPanel ? "var(--accent-foreground)" : "var(--foreground)",
        }}
        title="Review Workflow"
      >
        <FileCheck size={14} />
        <span className="hidden sm:inline">Review</span>
      </button>

      {/* Review Status Badge */}
      <ReviewStatusBadge />

      <div className="flex-1" />

      {/* Notifications */}
      <NotificationBadge />

      {/* Share button */}
      <button
        onClick={toggleShareDialog}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors"
        style={{ backgroundColor: "var(--primary)" }}
        title="Share Document"
      >
        <Share2 size={14} />
        Share
      </button>
    </div>
  );
}
