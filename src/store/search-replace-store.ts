'use client';

import { create } from 'zustand';

export interface SearchMatch {
  fileId: string;
  fileName: string;
  fileType: string;
  matchText: string;
  context: string;
  matchIndex: number;
  startPos: number;
  endPos: number;
}

export interface SearchReplaceState {
  isOpen: boolean;
  searchQuery: string;
  replaceQuery: string;
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  searchAcrossAll: boolean;
  matches: SearchMatch[];
  currentMatchIndex: number;
  isSearching: boolean;
  replacedCount: number;
  previewReplacements: boolean;

  // Actions
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  setMatchCase: (on: boolean) => void;
  setWholeWord: (on: boolean) => void;
  setUseRegex: (on: boolean) => void;
  setSearchAcrossAll: (on: boolean) => void;
  setMatches: (matches: SearchMatch[]) => void;
  setCurrentMatchIndex: (index: number) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  setIsSearching: (searching: boolean) => void;
  setReplacedCount: (count: number) => void;
  setPreviewReplacements: (on: boolean) => void;
  reset: () => void;
}

export const useSearchReplaceStore = create<SearchReplaceState>((set) => ({
  isOpen: false,
  searchQuery: '',
  replaceQuery: '',
  matchCase: false,
  wholeWord: false,
  useRegex: false,
  searchAcrossAll: true,
  matches: [],
  currentMatchIndex: 0,
  isSearching: false,
  replacedCount: 0,
  previewReplacements: false,

  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setSearchQuery: (query) => set({ searchQuery: query, currentMatchIndex: 0, replacedCount: 0 }),
  setReplaceQuery: (query) => set({ replaceQuery: query }),
  setMatchCase: (on) => set({ matchCase: on, currentMatchIndex: 0 }),
  setWholeWord: (on) => set({ wholeWord: on, currentMatchIndex: 0 }),
  setUseRegex: (on) => set({ useRegex: on, currentMatchIndex: 0 }),
  setSearchAcrossAll: (on) => set({ searchAcrossAll: on, currentMatchIndex: 0 }),
  setMatches: (matches) => set({ matches }),
  setCurrentMatchIndex: (index) => set({ currentMatchIndex: index }),
  nextMatch: () =>
    set((s) => ({
      currentMatchIndex: s.matches.length > 0 ? (s.currentMatchIndex + 1) % s.matches.length : 0,
    })),
  prevMatch: () =>
    set((s) => ({
      currentMatchIndex:
        s.matches.length > 0 ? (s.currentMatchIndex - 1 + s.matches.length) % s.matches.length : 0,
    })),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setReplacedCount: (count) => set({ replacedCount: count }),
  setPreviewReplacements: (on) => set({ previewReplacements: on }),
  reset: () =>
    set({
      searchQuery: '',
      replaceQuery: '',
      matches: [],
      currentMatchIndex: 0,
      isSearching: false,
      replacedCount: 0,
      previewReplacements: false,
    }),
}));
