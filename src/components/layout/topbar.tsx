"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Download, ChevronDown, User, LogOut, Settings, UserCircle, LogIn } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useThemeStore, themes } from "@/store/theme-store";
import { useAuthStore } from "@/store/auth-store";
import type { ThemeName } from "@/types";

const themeSwatches: Record<ThemeName, string> = {
  midnight: "#7c73e6",
  "classic-light": "#0d6efd",
  "ocean-blue": "#00bcd4",
  "warm-sepia": "#b58900",
  "nord-frost": "#88c0d0",
};

export function Topbar() {
  const { toggleSidebar } = useAppStore();
  const { themeName, setTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setUserOpen(false);
    router.push("/login");
  }

  // Get initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header
      className="no-print sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4"
      style={{
        backgroundColor: "var(--topbar)",
        color: "var(--topbar-foreground)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left: menu + brand */}
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
      </div>

      {/* Right: theme switcher, export, user */}
      <div className="flex items-center gap-2">
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

        {/* User profile */}
        <div ref={userRef} className="relative">
          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground, #fff)",
                }}
                title={user.name}
              >
                {initials}
              </button>

              {userOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-52 rounded-lg border shadow-lg"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  {/* User info */}
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="truncate text-xs"
                      style={{ color: "var(--muted-foreground, #888)" }}
                    >
                      {user.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                      style={{ color: "var(--card-foreground)" }}
                      onClick={() => setUserOpen(false)}
                    >
                      <UserCircle size={15} />
                      Profile
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                      style={{ color: "var(--card-foreground)" }}
                      onClick={() => setUserOpen(false)}
                    >
                      <Settings size={15} />
                      Settings
                    </button>
                    <div
                      className="my-1 h-px"
                      style={{ backgroundColor: "var(--border)" }}
                    />
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                      style={{ color: "#ef4444" }}
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground, #fff)",
              }}
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
