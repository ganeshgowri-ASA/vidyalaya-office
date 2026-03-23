"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Settings, LogOut, HelpCircle, Keyboard, Cloud, CloudOff } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function UserMenu() {
  const { data: session, status } = useSession();
  const { setShowKeyboardShortcuts } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isGuest = status !== "authenticated";
  const user = session?.user;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Guest";
  const displayEmail = user?.email || "guest@local";
  const avatarUrl = user?.image;
  const initials = isGuest
    ? "G"
    : displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors overflow-hidden"
        style={{
          backgroundColor: isGuest ? "var(--secondary)" : "var(--primary)",
          color: isGuest ? "var(--secondary-foreground)" : "var(--primary-foreground)",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : isGuest ? (
          <User size={16} />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-56 rounded-lg border shadow-lg"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold overflow-hidden"
                style={{
                  backgroundColor: isGuest ? "var(--secondary)" : "var(--primary)",
                  color: isGuest ? "var(--secondary-foreground)" : "var(--primary-foreground)",
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : isGuest ? (
                  <User size={18} />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: "var(--card-foreground)" }}>
                  {isGuest ? "Guest User" : displayName}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {isGuest ? "Local storage mode" : displayEmail}
                </p>
              </div>
            </div>
            {/* Cloud save indicator */}
            <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              {isGuest ? (
                <>
                  <CloudOff size={12} />
                  <span>Offline mode — data saved locally</span>
                </>
              ) : (
                <>
                  <Cloud size={12} style={{ color: "#16a34a" }} />
                  <span style={{ color: "#16a34a" }}>Cloud sync enabled</span>
                </>
              )}
            </div>
          </div>

          <div className="p-1">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--card-foreground)" }}
              onClick={() => setOpen(false)}
            >
              <User size={14} /> Profile
            </Link>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--card-foreground)" }}
              onClick={() => setOpen(false)}
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--card-foreground)" }}
              onClick={() => {
                setOpen(false);
                setShowKeyboardShortcuts(true);
              }}
            >
              <Keyboard size={14} /> Keyboard Shortcuts
            </button>
            <Link
              href="/help"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--card-foreground)" }}
              onClick={() => setOpen(false)}
            >
              <HelpCircle size={14} /> Help & Feedback
            </Link>

            <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

            {isGuest ? (
              <Link
                href="/auth/signin"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--primary)" }}
                onClick={() => setOpen(false)}
              >
                <User size={14} /> Sign In
              </Link>
            ) : (
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                style={{ color: "#dc2626" }}
                onClick={handleLogout}
              >
                <LogOut size={14} /> Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
