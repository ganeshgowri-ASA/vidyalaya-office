"use client";

import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setGuest: (isGuest: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  isGuest: true,
  setUser: (user) => set({ user, isGuest: !user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setGuest: (isGuest) => set({ isGuest }),
  reset: () => set({ user: null, session: null, loading: false, isGuest: true }),
}));
