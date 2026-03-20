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

export interface ProposedChange {
  id: string;
  sectionId: string;
  originalText: string;
  proposedText: string;
  reason: string;
  author: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'addition' | 'deletion' | 'modification';
}

export interface TrackedChange {
  id: string;
  sectionId: string;
  originalText: string;
  newText: string;
  author: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'insertion' | 'deletion' | 'replacement';
  comment?: string;
}

interface VersionHistoryState {
  snapshots: VersionSnapshot[];
  comments: InlineComment[];
  sectionAuthors: SectionAuthorMeta[];
  trackChangesEnabled: boolean;
  showVersionHistory: boolean;
  showCommentsPanel: boolean;
  selectedSnapshotId: string | null;
  compareSnapshotId: string | null;
  diffViewActive: boolean;
  diffViewMode: 'unified' | 'side-by-side';
  autoSaveIntervalMs: number;
  lastAutoSaveAt: string | null;

  proposedChanges: ProposedChange[];
  showProposedChanges: boolean;
  trackedChanges: TrackedChange[];
  showTrackChanges: boolean;

  addSnapshot: (sections: Section[], label: string, author: string, isAutoSave: boolean) => void;
  removeSnapshot: (id: string) => void;
  renameSnapshot: (id: string, label: string) => void;
  setSelectedSnapshot: (id: string | null) => void;
  setCompareSnapshot: (id: string | null) => void;
  setDiffViewActive: (val: boolean) => void;
  setDiffViewMode: (mode: 'unified' | 'side-by-side') => void;
  setShowVersionHistory: (val: boolean) => void;
  setShowCommentsPanel: (val: boolean) => void;
  setTrackChangesEnabled: (val: boolean) => void;
  setAutoSaveInterval: (ms: number) => void;

  addComment: (comment: Omit<InlineComment, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;

  updateSectionAuthor: (sectionId: string, author: string) => void;

  addProposedChange: (change: Omit<ProposedChange, 'id' | 'timestamp' | 'status'>) => void;
  acceptProposedChange: (id: string) => void;
  rejectProposedChange: (id: string) => void;
  acceptAllProposedChanges: () => void;
  rejectAllProposedChanges: () => void;
  clearProposedChanges: () => void;
  setShowProposedChanges: (val: boolean) => void;

  addTrackedChange: (change: Omit<TrackedChange, 'id' | 'timestamp' | 'status'>) => void;
  acceptTrackedChange: (id: string) => void;
  rejectTrackedChange: (id: string) => void;
  acceptAllTrackedChanges: () => void;
  rejectAllTrackedChanges: () => void;
  addCommentToTrackedChange: (id: string, comment: string) => void;
  setShowTrackChanges: (val: boolean) => void;
}

const defaultProposedChanges: ProposedChange[] = [
  {
    id: 'pc_1',
    sectionId: 's3',
    originalText: 'We analyze over 200 recent publications focusing on solar, wind, and hybrid energy systems.',
    proposedText: 'We systematically analyze over 200 peer-reviewed publications from 2015-2024, focusing on solar photovoltaic, wind turbine, and hybrid renewable energy systems.',
    reason: 'More specific scope and time range improves clarity',
    author: 'AI Assistant',
    timestamp: '2026-03-20T13:00:00Z',
    status: 'pending',
    type: 'modification',
  },
  {
    id: 'pc_2',
    sectionId: 's5',
    originalText: 'Accurate forecasting of energy generation from solar and wind sources remains a critical challenge due to their inherent variability and dependence on meteorological conditions [2,3].',
    proposedText: 'Accurate forecasting of energy generation from solar and wind sources remains a critical challenge due to their inherent stochastic variability, intermittency, and strong dependence on meteorological conditions [2,3].',
    reason: 'Added technical specificity with "stochastic" and "intermittency"',
    author: 'AI Assistant',
    timestamp: '2026-03-20T13:01:00Z',
    status: 'pending',
    type: 'modification',
  },
  {
    id: 'pc_3',
    sectionId: 's7',
    originalText: 'Our systematic review followed PRISMA guidelines for literature search and selection.',
    proposedText: 'Our systematic review followed the PRISMA 2020 guidelines (Page et al., 2021) for transparent reporting of literature search and study selection.',
    reason: 'Updated to PRISMA 2020 and added citation as suggested in comments',
    author: 'AI Assistant',
    timestamp: '2026-03-20T13:02:00Z',
    status: 'pending',
    type: 'modification',
  },
  {
    id: 'pc_4',
    sectionId: 's8',
    originalText: '',
    proposedText: 'Furthermore, ensemble methods combining multiple deep learning architectures showed promising results, achieving MAPE values below 2.5% for day-ahead solar forecasting in favorable conditions.',
    reason: 'Adding discussion of ensemble methods strengthens the results section',
    author: 'AI Assistant',
    timestamp: '2026-03-20T13:03:00Z',
    status: 'pending',
    type: 'addition',
  },
  {
    id: 'pc_5',
    sectionId: 's9',
    originalText: 'though computational requirements limit practical deployment',
    proposedText: 'although their higher computational requirements and larger training data needs may limit immediate practical deployment in resource-constrained environments',
    reason: 'More nuanced conclusion about deployment limitations',
    author: 'AI Assistant',
    timestamp: '2026-03-20T13:04:00Z',
    status: 'pending',
    type: 'modification',
  },
];

const defaultTrackedChanges: TrackedChange[] = [
  {
    id: 'tc_1',
    sectionId: 's3',
    originalText: '',
    newText: 'Our findings demonstrate that transformer-based architectures achieve 15-23% improvement in prediction accuracy compared to traditional LSTM models.',
    author: 'Maria Garcia',
    timestamp: '2026-03-20T10:30:00Z',
    status: 'pending',
    type: 'insertion',
  },
  {
    id: 'tc_2',
    sectionId: 's5',
    originalText: 'Machine learning approaches, particularly deep neural networks, have emerged as promising alternatives, offering superior performance in high-dimensional feature spaces [5].',
    newText: 'Machine learning approaches, particularly deep neural networks and attention-based architectures, have emerged as powerful alternatives, demonstrating superior performance in modeling high-dimensional, nonlinear feature spaces [5].',
    author: 'Wei Chen',
    timestamp: '2026-03-20T11:15:00Z',
    status: 'pending',
    type: 'replacement',
    comment: 'Updated to reflect current state of the field including attention mechanisms',
  },
  {
    id: 'tc_3',
    sectionId: 's6',
    originalText: 'Multiple studies have validated LSTM superiority over conventional methods for both solar irradiance and wind power forecasting.',
    newText: '',
    author: 'John Smith',
    timestamp: '2026-03-20T11:45:00Z',
    status: 'pending',
    type: 'deletion',
    comment: 'This claim is too broad without specific citations - removing until we can add references',
  },
];

export const useVersionHistoryStore = create<VersionHistoryState>()(
  persist(
    (set) => ({
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
      compareSnapshotId: null,
      diffViewActive: false,
      diffViewMode: 'unified',
      autoSaveIntervalMs: 5 * 60 * 1000,
      lastAutoSaveAt: null,

      proposedChanges: defaultProposedChanges,
      showProposedChanges: false,
      trackedChanges: defaultTrackedChanges,
      showTrackChanges: false,

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

      renameSnapshot: (id, label) => set((state) => ({
        snapshots: state.snapshots.map((s) => s.id === id ? { ...s, label } : s),
      })),

      setSelectedSnapshot: (id) => set({ selectedSnapshotId: id }),
      setCompareSnapshot: (id) => set({ compareSnapshotId: id }),
      setDiffViewActive: (val) => set({ diffViewActive: val }),
      setDiffViewMode: (mode) => set({ diffViewMode: mode }),
      setShowVersionHistory: (val) => set({ showVersionHistory: val }),
      setShowCommentsPanel: (val) => set({ showCommentsPanel: val }),
      setTrackChangesEnabled: (val) => set({ trackChangesEnabled: val }),
      setAutoSaveInterval: (ms) => set({ autoSaveIntervalMs: ms }),

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

      addProposedChange: (change) => set((state) => ({
        proposedChanges: [...state.proposedChanges, {
          ...change,
          id: `pc_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
        }],
      })),

      acceptProposedChange: (id) => set((state) => ({
        proposedChanges: state.proposedChanges.map((c) => c.id === id ? { ...c, status: 'accepted' } : c),
      })),

      rejectProposedChange: (id) => set((state) => ({
        proposedChanges: state.proposedChanges.map((c) => c.id === id ? { ...c, status: 'rejected' } : c),
      })),

      acceptAllProposedChanges: () => set((state) => ({
        proposedChanges: state.proposedChanges.map((c) => c.status === 'pending' ? { ...c, status: 'accepted' } : c),
      })),

      rejectAllProposedChanges: () => set((state) => ({
        proposedChanges: state.proposedChanges.map((c) => c.status === 'pending' ? { ...c, status: 'rejected' } : c),
      })),

      clearProposedChanges: () => set({ proposedChanges: [] }),

      setShowProposedChanges: (val) => set({ showProposedChanges: val }),

      addTrackedChange: (change) => set((state) => ({
        trackedChanges: [...state.trackedChanges, {
          ...change,
          id: `tc_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
        }],
      })),

      acceptTrackedChange: (id) => set((state) => ({
        trackedChanges: state.trackedChanges.map((c) => c.id === id ? { ...c, status: 'accepted' } : c),
      })),

      rejectTrackedChange: (id) => set((state) => ({
        trackedChanges: state.trackedChanges.map((c) => c.id === id ? { ...c, status: 'rejected' } : c),
      })),

      acceptAllTrackedChanges: () => set((state) => ({
        trackedChanges: state.trackedChanges.map((c) => c.status === 'pending' ? { ...c, status: 'accepted' } : c),
      })),

      rejectAllTrackedChanges: () => set((state) => ({
        trackedChanges: state.trackedChanges.map((c) => c.status === 'pending' ? { ...c, status: 'rejected' } : c),
      })),

      addCommentToTrackedChange: (id, comment) => set((state) => ({
        trackedChanges: state.trackedChanges.map((c) => c.id === id ? { ...c, comment } : c),
      })),

      setShowTrackChanges: (val) => set({ showTrackChanges: val }),
    }),
    {
      name: 'vidyalaya-version-history',
    }
  )
);
