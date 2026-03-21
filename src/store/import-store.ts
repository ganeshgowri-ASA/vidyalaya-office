'use client';

import { create } from 'zustand';

export type ImportFileType = 'docx' | 'xlsx' | 'pptx' | 'csv' | 'tsv' | 'txt' | 'md' | 'pdf' | 'unknown';
export type ImportStatus = 'idle' | 'detecting' | 'parsing' | 'mapping' | 'importing' | 'success' | 'error';

export interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: ImportFileType;
  status: ImportStatus;
  progress: number;
  message: string;
  error?: string;
  startedAt: number;
}

export interface CsvColumnMapping {
  sourceColumn: string;
  targetColumn: number;
  include: boolean;
}

export interface CsvPreviewData {
  headers: string[];
  rows: string[][];
  delimiter: string;
  totalRows: number;
}

interface ImportState {
  currentJob: ImportJob | null;
  jobHistory: ImportJob[];
  showCsvMapper: boolean;
  csvPreview: CsvPreviewData | null;
  csvMappings: CsvColumnMapping[];
  csvFile: File | null;

  // Actions
  startJob: (fileName: string, fileSize: number, fileType: ImportFileType) => string;
  updateJobProgress: (progress: number, message: string) => void;
  updateJobStatus: (status: ImportStatus, error?: string) => void;
  completeJob: () => void;
  failJob: (error: string) => void;
  clearJob: () => void;

  // CSV mapper
  openCsvMapper: (preview: CsvPreviewData, file: File) => void;
  closeCsvMapper: () => void;
  updateCsvMapping: (index: number, mapping: Partial<CsvColumnMapping>) => void;
  setCsvDelimiter: (delimiter: string) => void;
}

export const useImportStore = create<ImportState>((set, get) => ({
  currentJob: null,
  jobHistory: [],
  showCsvMapper: false,
  csvPreview: null,
  csvMappings: [],
  csvFile: null,

  startJob: (fileName, fileSize, fileType) => {
    const id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const job: ImportJob = {
      id,
      fileName,
      fileSize,
      fileType,
      status: 'detecting',
      progress: 0,
      message: 'Detecting file type...',
      startedAt: Date.now(),
    };
    set({ currentJob: job });
    return id;
  },

  updateJobProgress: (progress, message) => {
    set((s) => ({
      currentJob: s.currentJob ? { ...s.currentJob, progress, message } : null,
    }));
  },

  updateJobStatus: (status, error) => {
    set((s) => ({
      currentJob: s.currentJob ? { ...s.currentJob, status, error } : null,
    }));
  },

  completeJob: () => {
    const { currentJob } = get();
    if (currentJob) {
      const completed = { ...currentJob, status: 'success' as ImportStatus, progress: 100, message: 'Import complete!' };
      set((s) => ({
        currentJob: completed,
        jobHistory: [completed, ...s.jobHistory].slice(0, 20),
      }));
    }
  },

  failJob: (error) => {
    const { currentJob } = get();
    if (currentJob) {
      const failed = { ...currentJob, status: 'error' as ImportStatus, error, message: error };
      set((s) => ({
        currentJob: failed,
        jobHistory: [failed, ...s.jobHistory].slice(0, 20),
      }));
    }
  },

  clearJob: () => set({ currentJob: null }),

  openCsvMapper: (preview, file) => {
    const mappings: CsvColumnMapping[] = preview.headers.map((h, i) => ({
      sourceColumn: h,
      targetColumn: i,
      include: true,
    }));
    set({ showCsvMapper: true, csvPreview: preview, csvMappings: mappings, csvFile: file });
  },

  closeCsvMapper: () => set({ showCsvMapper: false, csvPreview: null, csvMappings: [], csvFile: null }),

  updateCsvMapping: (index, mapping) => {
    set((s) => {
      const updated = [...s.csvMappings];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...mapping };
      }
      return { csvMappings: updated };
    });
  },

  setCsvDelimiter: (delimiter) => {
    set((s) => {
      if (!s.csvPreview) return s;
      return { csvPreview: { ...s.csvPreview, delimiter } };
    });
  },
}));
