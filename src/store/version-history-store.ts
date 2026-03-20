'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Section } from './research-store';

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  label: string;
  author: string;
  sections: { id: string; title: string; content: string; wordCount: number }[];
  totalWordCount: number;
  isAutoSave: boolean;
}

export interface InlineComment {
  id: string;
  sectionId: string;
  selectedText: string;
  comment: string;
  author: string;
  timestamp: string;
  resolved: boolean;
}

export interface SectionAuthorMeta {
  sectionId: string;
  lastEditedBy: string;
  lastEditedAt: string;
}

interface VersionHistoryState {
  snapshots: VersionSnapshot[];
  comments: InlineComment[];
  sectionAuthors: SectionAuthorMeta[];
  trackChangesEnabled: boolean;
  showVersionHistory: boolean;
  showCommentsPanel: boolean;
  selectedSnapshotId: string | null;
  diffViewActive: boolean;
  autoSaveIntervalMs: number;
  lastAutoSaveAt: string | null;

  addSnapshot: (sections: Section[], label: string, author: string, isAutoSave: boolean) => void;
  removeSnapshot: (id: string) => void;
  setSelectedSnapshot: (id: string | null) => void;
  setDiffViewActive: (val: boolean) => void;
  setShowVersionHistory: (val: boolean) => void;
  setShowCommentsPanel: (val: boolean) => void;
  setTrackChangesEnabled: (val: boolean) => void;

  addComment: (comment: Omit<InlineComment, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;

  updateSectionAuthor: (sectionId: string, author: string) => void;
}

export const useVersionHistoryStore = create<VersionHistoryState>()(
  persist(
    (set, get) => ({
      snapshots: [
        {
          id: 'snap_initial',
          timestamp: '2026-03-20T08:00:00Z',
          label: 'Initial Draft',
          author: 'John Smith',
          sections: [
            { id: 's1', title: 'Title', content: 'Deep Learning Approaches for Renewable Energy Forecasting: A Comprehensive Review', wordCount: 12 },
            { id: 's3', title: 'Abstract', content: 'This paper presents a comprehensive review of deep learning methodologies applied to renewable energy forecasting.', wordCount: 16 },
            { id: 's5', title: 'Introduction', content: 'The global transition toward renewable energy sources has accelerated significantly over the past decade.', wordCount: 15 },
          ],
          totalWordCount: 43,
          isAutoSave: false,
        },
        {
          id: 'snap_auto_1',
          timestamp: '2026-03-20T09:30:00Z',
          label: 'Auto-save',
          author: 'John Smith',
          sections: [
            { id: 's1', title: 'Title', content: 'Deep Learning Approaches for Renewable Energy Forecasting: A Comprehensive Review', wordCount: 12 },
            { id: 's3', title: 'Abstract', content: 'This paper presents a comprehensive review of deep learning methodologies applied to renewable energy forecasting. We analyze over 200 recent publications focusing on solar, wind, and hybrid energy systems.', wordCount: 32 },
            { id: 's5', title: 'Introduction', content: 'The global transition toward renewable energy sources has accelerated significantly over the past decade, driven by climate commitments and declining technology costs [1].', wordCount: 24 },
            { id: 's6', title: 'Literature Review', content: 'Early applications of machine learning to energy forecasting focused primarily on artificial neural networks (ANNs).', wordCount: 16 },
          ],
          totalWordCount: 84,
          isAutoSave: true,
        },
        {
          id: 'snap_manual_1',
          timestamp: '2026-03-20T11:00:00Z',
          label: 'Added Methodology & Results',
          author: 'Maria Garcia',
          sections: [
            { id: 's1', title: 'Title', content: 'Deep Learning Approaches for Renewable Energy Forecasting: A Comprehensive Review', wordCount: 12 },
            { id: 's3', title: 'Abstract', content: 'This paper presents a comprehensive review of deep learning methodologies applied to renewable energy forecasting. We analyze over 200 recent publications focusing on solar, wind, and hybrid energy systems. Our findings demonstrate that transformer-based architectures achieve 15-23% improvement in prediction accuracy compared to traditional LSTM models.', wordCount: 50 },
            { id: 's5', title: 'Introduction', content: 'The global transition toward renewable energy sources has accelerated significantly over the past decade, driven by climate commitments and declining technology costs [1]. Accurate forecasting of energy generation from solar and wind sources remains a critical challenge due to their inherent variability and dependence on meteorological conditions [2,3].', wordCount: 48 },
            { id: 's6', title: 'Literature Review', content: 'Early applications of machine learning to energy forecasting focused primarily on artificial neural networks (ANNs). Sfetsos and Coonick [6] demonstrated that ANNs could outperform conventional regression techniques for wind speed prediction.', wordCount: 32 },
            { id: 's7', title: 'Methodology', content: 'Our systematic review followed PRISMA guidelines for literature search and selection.', wordCount: 11 },
          ],
          totalWordCount: 153,
          isAutoSave: false,
        },
      ],
      comments: [
        {
          id: 'cmt_1',
          sectionId: 's5',
          selectedText: 'climate commitments and declining technology costs',
          comment: 'Should we add specific figures here? E.g., Paris Agreement targets and cost reduction percentages.',
          author: 'Maria Garcia',
          timestamp: '2026-03-20T10:15:00Z',
          resolved: false,
        },
        {
          id: 'cmt_2',
          sectionId: 's3',
          selectedText: '15-23% improvement',
          comment: 'Double-check this range against the latest meta-analysis by Torres et al.',
          author: 'Wei Chen',
          timestamp: '2026-03-20T10:45:00Z',
          resolved: false,
        },
        {
          id: 'cmt_3',
          sectionId: 's7',
          selectedText: 'PRISMA guidelines',
          comment: 'We should cite the PRISMA 2020 update (Page et al., 2021) instead of the 2009 version.',
          author: 'John Smith',
          timestamp: '2026-03-20T11:30:00Z',
          resolved: true,
        },
      ],
      sectionAuthors: [
        { sectionId: 's1', lastEditedBy: 'John Smith', lastEditedAt: '2026-03-20T08:00:00Z' },
        { sectionId: 's3', lastEditedBy: 'Maria Garcia', lastEditedAt: '2026-03-20T11:00:00Z' },
        { sectionId: 's5', lastEditedBy: 'John Smith', lastEditedAt: '2026-03-20T09:30:00Z' },
        { sectionId: 's6', lastEditedBy: 'John Smith', lastEditedAt: '2026-03-20T09:30:00Z' },
        { sectionId: 's7', lastEditedBy: 'Maria Garcia', lastEditedAt: '2026-03-20T11:00:00Z' },
        { sectionId: 's8', lastEditedBy: 'Wei Chen', lastEditedAt: '2026-03-20T12:00:00Z' },
        { sectionId: 's9', lastEditedBy: 'John Smith', lastEditedAt: '2026-03-20T08:00:00Z' },
      ],
      trackChangesEnabled: false,
      showVersionHistory: false,
      showCommentsPanel: false,
      selectedSnapshotId: null,
      diffViewActive: false,
      autoSaveIntervalMs: 5 * 60 * 1000,
      lastAutoSaveAt: null,

      addSnapshot: (sections, label, author, isAutoSave) => {
        const snapshot: VersionSnapshot = {
          id: `snap_${Date.now()}`,
          timestamp: new Date().toISOString(),
          label,
          author,
          sections: sections.map((s) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            wordCount: s.wordCount,
          })),
          totalWordCount: sections.reduce((a, s) => a + s.wordCount, 0),
          isAutoSave,
        };
        set((state) => ({
          snapshots: [...state.snapshots, snapshot],
          lastAutoSaveAt: isAutoSave ? snapshot.timestamp : state.lastAutoSaveAt,
        }));
      },

      removeSnapshot: (id) => set((state) => ({
        snapshots: state.snapshots.filter((s) => s.id !== id),
      })),

      setSelectedSnapshot: (id) => set({ selectedSnapshotId: id }),
      setDiffViewActive: (val) => set({ diffViewActive: val }),
      setShowVersionHistory: (val) => set({ showVersionHistory: val }),
      setShowCommentsPanel: (val) => set({ showCommentsPanel: val }),
      setTrackChangesEnabled: (val) => set({ trackChangesEnabled: val }),

      addComment: (comment) => set((state) => ({
        comments: [...state.comments, {
          ...comment,
          id: `cmt_${Date.now()}`,
          timestamp: new Date().toISOString(),
          resolved: false,
        }],
      })),

      resolveComment: (id) => set((state) => ({
        comments: state.comments.map((c) => c.id === id ? { ...c, resolved: !c.resolved } : c),
      })),

      deleteComment: (id) => set((state) => ({
        comments: state.comments.filter((c) => c.id !== id),
      })),

      updateSectionAuthor: (sectionId, author) => set((state) => {
        const existing = state.sectionAuthors.find((a) => a.sectionId === sectionId);
        if (existing) {
          return {
            sectionAuthors: state.sectionAuthors.map((a) =>
              a.sectionId === sectionId ? { ...a, lastEditedBy: author, lastEditedAt: new Date().toISOString() } : a
            ),
          };
        }
        return {
          sectionAuthors: [...state.sectionAuthors, { sectionId, lastEditedBy: author, lastEditedAt: new Date().toISOString() }],
        };
      }),
    }),
    {
      name: 'vidyalaya-version-history',
    }
  )
);
