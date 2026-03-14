"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Download, ChevronDown, User } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useThemeStore, themes } from "@/store/theme-store";
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
  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* Right: theme switcher, export, avatar */}
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

        {/* Export dropdown placeholder */}
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

        {/* User avatar placeholder */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
