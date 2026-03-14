"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "editor" | "viewer";
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const MOCK_USERS_KEY = "vidyalaya_mock_users";

function getStoredUsers(): Record<string, { name: string; email: string; passwordHash: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function storeUser(email: string, name: string, passwordHash: string) {
  const users = getStoredUsers();
  users[email] = { name, email, passwordHash };
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

// Simple hash for mock auth (not for production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function getAvatarUrl(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=7c73e6&color=fff&size=64`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        await new Promise((resolve) => setTimeout(resolve, 600));

        const users = getStoredUsers();
        const stored = users[email];

        if (!stored || stored.passwordHash !== simpleHash(password)) {
          set({ isLoading: false, error: "Invalid email or password" });
          return false;
        }

        const user: AuthUser = {
          id: simpleHash(email),
          name: stored.name,
          email,
          avatar: getAvatarUrl(stored.name),
          role: "editor",
        };

        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return true;
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        await new Promise((resolve) => setTimeout(resolve, 600));

        const users = getStoredUsers();
        if (users[email]) {
          set({ isLoading: false, error: "An account with this email already exists" });
          return false;
        }

        storeUser(email, name, simpleHash(password));

        const user: AuthUser = {
          id: simpleHash(email),
          name,
          email,
          avatar: getAvatarUrl(name),
          role: "editor",
        };

        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "vidyalaya-auth",
    }
  )
);
