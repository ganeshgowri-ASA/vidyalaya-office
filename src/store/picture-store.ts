'use client';

import { create } from 'zustand';

export interface ImageFormatting {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpness: number;
  opacity: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  clipPath: string;
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  borderRadius: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  shadowEnabled: boolean;
  glowEnabled: boolean;
  glowColor: string;
  glowBlur: number;
  reflectionEnabled: boolean;
  reflectionOpacity: number;
  textWrap: 'inline' | 'square' | 'tight' | 'through' | 'top-bottom' | 'behind' | 'in-front';
  altText: string;
  caption: string;
  width: number | null;
  height: number | null;
  aspectRatioLocked: boolean;
  compressionEnabled: boolean;
}

export const DEFAULT_FORMATTING: ImageFormatting = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sharpness: 0,
  opacity: 100,
  rotation: 0,
  flipH: false,
  flipV: false,
  clipPath: '',
  borderWidth: 0,
  borderColor: '#000000',
  borderStyle: 'solid',
  borderRadius: 0,
  shadowOffsetX: 4,
  shadowOffsetY: 4,
  shadowBlur: 12,
  shadowSpread: 0,
  shadowColor: 'rgba(0,0,0,0.3)',
  shadowEnabled: false,
  glowEnabled: false,
  glowColor: '#4472C4',
  glowBlur: 16,
  reflectionEnabled: false,
  reflectionOpacity: 0.15,
  textWrap: 'inline',
  altText: '',
  caption: '',
  width: null,
  height: null,
  aspectRatioLocked: true,
  compressionEnabled: false,
};

export interface PictureState {
  // Panel visibility
  showInsertDialog: boolean;
  showFormattingPanel: boolean;
  showGallery: boolean;

  // Currently selected image state
  selectedImageId: string | null;
  selectedImageSrc: string | null;
  formatting: ImageFormatting;

  // Gallery images (for bulk management)
  gallery: Array<{ id: string; src: string; name: string; size?: number }>;

  // Active editor context
  activeEditorContext: 'document' | 'research' | 'spreadsheet' | 'presentation' | null;

  // Actions
  setShowInsertDialog: (v: boolean) => void;
  setShowFormattingPanel: (v: boolean) => void;
  setShowGallery: (v: boolean) => void;
  setSelectedImage: (id: string | null, src: string | null) => void;
  updateFormatting: (updates: Partial<ImageFormatting>) => void;
  resetFormatting: () => void;
  setActiveEditorContext: (ctx: PictureState['activeEditorContext']) => void;
  addToGallery: (img: { id: string; src: string; name: string; size?: number }) => void;
  removeFromGallery: (id: string) => void;
}

export const usePictureStore = create<PictureState>((set) => ({
  showInsertDialog: false,
  showFormattingPanel: false,
  showGallery: false,
  selectedImageId: null,
  selectedImageSrc: null,
  formatting: { ...DEFAULT_FORMATTING },
  gallery: [],
  activeEditorContext: null,

  setShowInsertDialog: (v) => set({ showInsertDialog: v }),
  setShowFormattingPanel: (v) => set({ showFormattingPanel: v }),
  setShowGallery: (v) => set({ showGallery: v }),
  setSelectedImage: (id, src) => set({ selectedImageId: id, selectedImageSrc: src }),
  updateFormatting: (updates) =>
    set((state) => ({ formatting: { ...state.formatting, ...updates } })),
  resetFormatting: () => set({ formatting: { ...DEFAULT_FORMATTING } }),
  setActiveEditorContext: (ctx) => set({ activeEditorContext: ctx }),
  addToGallery: (img) =>
    set((state) => ({ gallery: [...state.gallery, img] })),
  removeFromGallery: (id) =>
    set((state) => ({ gallery: state.gallery.filter((g) => g.id !== id) })),
}));
