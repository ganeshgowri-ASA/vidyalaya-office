"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Palette,
  Monitor,
  Sun,
  Moon,
  Save,
  Camera,
  Bell,
  Eye,
  Grid3X3,
  List,
} from "lucide-react";
import { useThemeStore, themes } from "@/store/theme-store";
import type { ThemeName } from "@/types";

const themeSwatches: Record<ThemeName, string> = {
  midnight: "#7c73e6",
  "classic-light": "#0d6efd",
  "ocean-blue": "#00bcd4",
  "warm-sepia": "#b58900",
  "nord-frost": "#88c0d0",
};

export default function ProfilePage() {
  const { themeName, setTheme } = useThemeStore();
  const [displayName, setDisplayName] = useState("Admin User");
  const [email, setEmail] = useState("admin@vidyalaya.edu");
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");
  const [defaultView, setDefaultView] = useState<"grid" | "list">("grid");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vidyalaya_profile");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.displayName) setDisplayName(data.displayName);
        if (data.email) setEmail(data.email);
        if (data.themeMode) setThemeMode(data.themeMode);
        if (data.defaultView) setDefaultView(data.defaultView);
        if (typeof data.emailNotifications === "boolean") setEmailNotifications(data.emailNotifications);
      }
    } catch {}
  }, []);

  const handleSave = () => {
    const profileData = { displayName, email, themeMode, defaultView, emailNotifications };
    localStorage.setItem("vidyalaya_profile", JSON.stringify(profileData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Profile</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Manage your account and preferences</p>
      </div>

      {/* Avatar & Name */}
      <section className="rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              title="Change avatar"
            >
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Display Name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <Shield size={12} />
          <span>Role: <strong>Admin</strong></span>
        </div>
      </section>

      {/* Theme Selection */}
      <section className="rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>
          <Palette size={16} style={{ color: "var(--primary)" }} />
          Theme
        </h2>

        {/* Light/Dark/System toggle */}
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Appearance</p>
          <div className="flex gap-2">
            {([
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setThemeMode(opt.value)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: themeMode === opt.value ? "var(--accent)" : "transparent",
                  borderColor: themeMode === opt.value ? "var(--primary)" : "var(--border)",
                  color: themeMode === opt.value ? "var(--accent-foreground)" : "var(--muted-foreground)",
                }}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color theme */}
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Color Theme</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors"
                style={{
                  borderColor: themeName === t.name ? themeSwatches[t.name] : "var(--border)",
                  backgroundColor: themeName === t.name ? `${themeSwatches[t.name]}15` : "transparent",
                  color: "var(--card-foreground)",
                }}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: themeSwatches[t.name] }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>
          <Eye size={16} style={{ color: "var(--primary)" }} />
          Preferences
        </h2>

        {/* Default view */}
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Default File View</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultView("grid")}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
              style={{
                backgroundColor: defaultView === "grid" ? "var(--accent)" : "transparent",
                borderColor: defaultView === "grid" ? "var(--primary)" : "var(--border)",
                color: defaultView === "grid" ? "var(--accent-foreground)" : "var(--muted-foreground)",
              }}
            >
              <Grid3X3 size={14} /> Grid
            </button>
            <button
              onClick={() => setDefaultView("list")}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
              style={{
                backgroundColor: defaultView === "list" ? "var(--accent)" : "transparent",
                borderColor: defaultView === "list" ? "var(--primary)" : "var(--border)",
                color: defaultView === "list" ? "var(--accent-foreground)" : "var(--muted-foreground)",
              }}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={14} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-sm" style={{ color: "var(--card-foreground)" }}>Email Notifications</span>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ backgroundColor: emailNotifications ? "var(--primary)" : "var(--border)" }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ left: emailNotifications ? 22 : 2 }}
            />
          </button>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          style={{
            backgroundColor: saved ? "#16a34a" : "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <Save size={16} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
