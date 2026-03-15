"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Download,
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  CheckCheck,
  Clock,
  FileText,
  LogOut,
  Settings,
  Search,
  Check,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useThemeStore, themes } from "@/store/theme-store";
import { formatDate } from "@/lib/utils";
import type { ThemeName } from "@/types";

const themeSwatches: Record<ThemeName, string> = {
  midnight: "#7c73e6",
  "classic-light": "#0d6efd",
  "ocean-blue": "#00bcd4",
  "warm-sepia": "#b58900",
  "nord-frost": "#88c0d0",
};

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/document": "Document Editor",
  "/spreadsheet": "Spreadsheet",
  "/presentation": "Presentation",
  "/pdf": "PDF Tools",
  "/templates": "Templates",
  "/review": "Review & Approval",
};

export function Topbar() {
  const pathname = usePathname();
  const { toggleSidebar, notifications, markNotificationRead, markAllNotificationsRead, recentFiles, setShowKeyboardShortcuts, searchQuery, setSearchQuery } = useAppStore();
  const { themeName, setTheme } = useThemeStore();
  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (recentRef.current && !recentRef.current.contains(e.target as Node)) setRecentOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifTypeColor: Record<string, string> = {
    info: "var(--primary)",
    success: "#16a34a",
    warning: "#f59e0b",
    error: "#dc2626",
  };

  return (
    <header
      className="no-print sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4"
      style={{
        backgroundColor: "var(--topbar)",
        color: "var(--topbar-foreground)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left: menu + brand + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 transition-colors hover:opacity-80 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            विद्यालय
          </span>
          <span className="hidden text-sm font-medium opacity-60 sm:inline">
            Vidyalaya Office
          </span>
        </div>

        {/* Breadcrumb navigation */}
        <div className="hidden items-center gap-1 text-xs md:flex" style={{ color: "var(--muted-foreground)" }}>
          <ChevronRight size={12} />
          <span className="font-medium" style={{ color: "var(--foreground)" }}>
            {breadcrumbMap[pathname] || "Page"}
          </span>
        </div>

        {/* Auto-save indicator */}
        <div className="hidden items-center gap-1 text-xs lg:flex" style={{ color: "var(--muted-foreground)" }}>
          <span className="mx-2 opacity-30">|</span>
          <Check size={12} style={{ color: "#16a34a" }} />
          <span>All changes saved</span>
        </div>
      </div>

      {/* Right: search, recent, notifications, theme, export, profile */}
      <div className="flex items-center gap-1.5">
        {/* Quick Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
            title="Search (Ctrl+/)"
          >
            <Search size={16} />
          </button>
          {searchOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-72 rounded-lg border p-3 shadow-lg"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                autoFocus
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  borderColor: "var(--border)",
                }}
              />
              {searchQuery && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {recentFiles
                    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:opacity-80"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <FileText size={14} style={{ color: "var(--primary)" }} />
                        <span className="truncate">{f.name}</span>
                        <span className="ml-auto text-xs" style={{ color: "var(--muted-foreground)" }}>{f.type}</span>
                      </div>
                    ))}
                  {recentFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-xs text-center py-2" style={{ color: "var(--muted-foreground)" }}>No results found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Files dropdown */}
        <div ref={recentRef} className="relative hidden sm:block">
          <button
            onClick={() => setRecentOpen(!recentOpen)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
            title="Recent files"
          >
            <Clock size={16} />
          </button>
          {recentOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-64 rounded-lg border shadow-lg"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Recent Files</p>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {recentFiles.slice(0, 5).map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer hover:opacity-80"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    <FileText size={14} style={{ color: "var(--primary)" }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{f.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(f.modified)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: "#dc2626" }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-80 rounded-lg border shadow-lg"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs hover:opacity-70"
                    style={{ color: "var(--primary)" }}
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className="flex gap-3 rounded-md px-3 py-2.5 cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: n.read ? "transparent" : "var(--accent)",
                    }}
                  >
                    <div
                      className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: n.read ? "transparent" : notifTypeColor[n.type] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{formatDate(n.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme switcher */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
          >
            <span
              className="h-4 w-4 rounded-full border"
              style={{
                backgroundColor: themeSwatches[themeName],
                borderColor: "var(--border)",
              }}
            />
            <span className="hidden sm:inline">Theme</span>
            <ChevronDown size={14} />
          </button>

          {themeOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border p-2 shadow-lg"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setTheme(t.name);
                    setThemeOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                  style={
                    themeName === t.name
                      ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                      : { color: "var(--card-foreground)" }
                  }
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border"
                    style={{
                      backgroundColor: themeSwatches[t.name],
                      borderColor: "var(--border)",
                    }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export dropdown */}
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={14} />
          </button>

          {exportOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-40 rounded-lg border p-2 shadow-lg"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {["PDF", "DOCX", "XLSX", "PPTX"].map((fmt) => (
                <button
                  key={fmt}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--card-foreground)" }}
                  onClick={() => setExportOpen(false)}
                >
                  Export as {fmt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            <User size={16} />
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-56 rounded-lg border shadow-lg"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              {/* User info */}
              <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    AM
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>Admin User</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>admin@vidyalaya.edu</p>
                  </div>
                </div>
              </div>
              {/* Menu items */}
              <div className="p-1">
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--card-foreground)" }}
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--card-foreground)" }}
                  onClick={() => { setProfileOpen(false); setShowKeyboardShortcuts(true); }}
                >
                  <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>?</span>
                  <span className="ml-0.5">Keyboard Shortcuts</span>
                </button>
                <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: "#dc2626" }}
                  onClick={() => setProfileOpen(false)}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
