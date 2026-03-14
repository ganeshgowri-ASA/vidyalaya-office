"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { getTheme } = useThemeStore();
  const theme = getTheme();

  useEffect(() => {
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--card-foreground", colors.cardForeground);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--muted-foreground", colors.mutedForeground);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-foreground", colors.accentForeground);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--sidebar", colors.sidebar);
    root.style.setProperty("--sidebar-foreground", colors.sidebarForeground);
    root.style.setProperty("--sidebar-accent", colors.sidebarAccent);
    root.style.setProperty("--topbar", colors.topbar);
    root.style.setProperty("--topbar-foreground", colors.topbarForeground);
  }, [theme]);

  return <>{children}</>;
}
