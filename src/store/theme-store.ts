"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme, ThemeName } from "@/types";

export const themes: Theme[] = [
  {
    name: "midnight",
    label: "Midnight",
    colors: {
      background: "#0f0e17",
      foreground: "#e0e0ff",
      card: "#1a1a2e",
      cardForeground: "#e0e0ff",
      primary: "#7c73e6",
      primaryForeground: "#ffffff",
      secondary: "#2a2a4a",
      secondaryForeground: "#c0c0e0",
      muted: "#1a1a2e",
      mutedForeground: "#8888aa",
      accent: "#7c73e6",
      accentForeground: "#ffffff",
      border: "#2a2a4a",
      sidebar: "#0d0c14",
      sidebarForeground: "#c0c0e0",
      sidebarAccent: "#7c73e6",
      topbar: "#141326",
      topbarForeground: "#e0e0ff",
    },
  },
  {
    name: "classic-light",
    label: "Classic Light",
    colors: {
      background: "#ffffff",
      foreground: "#212529",
      card: "#f8f9fa",
      cardForeground: "#212529",
      primary: "#0d6efd",
      primaryForeground: "#ffffff",
      secondary: "#e9ecef",
      secondaryForeground: "#495057",
      muted: "#f8f9fa",
      mutedForeground: "#6c757d",
      accent: "#0d6efd",
      accentForeground: "#ffffff",
      border: "#dee2e6",
      sidebar: "#f8f9fa",
      sidebarForeground: "#495057",
      sidebarAccent: "#0d6efd",
      topbar: "#ffffff",
      topbarForeground: "#212529",
    },
  },
  {
    name: "ocean-blue",
    label: "Ocean Blue",
    colors: {
      background: "#0a1628",
      foreground: "#e0f7fa",
      card: "#132743",
      cardForeground: "#e0f7fa",
      primary: "#00bcd4",
      primaryForeground: "#0a1628",
      secondary: "#1a3a5c",
      secondaryForeground: "#b2ebf2",
      muted: "#132743",
      mutedForeground: "#80cbc4",
      accent: "#00bcd4",
      accentForeground: "#0a1628",
      border: "#1a3a5c",
      sidebar: "#081220",
      sidebarForeground: "#b2ebf2",
      sidebarAccent: "#00bcd4",
      topbar: "#0e1e38",
      topbarForeground: "#e0f7fa",
    },
  },
  {
    name: "warm-sepia",
    label: "Warm Sepia",
    colors: {
      background: "#fdf6e3",
      foreground: "#657b83",
      card: "#eee8d5",
      cardForeground: "#657b83",
      primary: "#b58900",
      primaryForeground: "#fdf6e3",
      secondary: "#eee8d5",
      secondaryForeground: "#586e75",
      muted: "#eee8d5",
      mutedForeground: "#93a1a1",
      accent: "#b58900",
      accentForeground: "#fdf6e3",
      border: "#ddd6c1",
      sidebar: "#eee8d5",
      sidebarForeground: "#586e75",
      sidebarAccent: "#b58900",
      topbar: "#fdf6e3",
      topbarForeground: "#657b83",
    },
  },
  {
    name: "nord-frost",
    label: "Nord Frost",
    colors: {
      background: "#2e3440",
      foreground: "#eceff4",
      card: "#3b4252",
      cardForeground: "#eceff4",
      primary: "#88c0d0",
      primaryForeground: "#2e3440",
      secondary: "#434c5e",
      secondaryForeground: "#d8dee9",
      muted: "#3b4252",
      mutedForeground: "#a0aec0",
      accent: "#88c0d0",
      accentForeground: "#2e3440",
      border: "#434c5e",
      sidebar: "#2b303b",
      sidebarForeground: "#d8dee9",
      sidebarAccent: "#88c0d0",
      topbar: "#323846",
      topbarForeground: "#eceff4",
    },
  },
];

interface ThemeState {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  getTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeName: "midnight",
      setTheme: (name: ThemeName) => set({ themeName: name }),
      getTheme: () => {
        const { themeName } = get();
        return themes.find((t) => t.name === themeName) ?? themes[0];
      },
    }),
    { name: "vidyalaya-theme" }
  )
);
