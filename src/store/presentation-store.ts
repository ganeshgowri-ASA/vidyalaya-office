'use client';

import { create } from 'zustand';
import { generateId } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

export type SlideLayout = 'title' | 'content' | 'two-column' | 'blank' | 'section-header';

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: {
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
}

export interface Slide {
  id: string;
  layout: SlideLayout;
  background: string;
  elements: SlideElement[];
  notes: string;
  transition?: 'none' | 'fade' | 'slide' | 'zoom';
}

export interface PresentationState {
  slides: Slide[];
  activeSlideIndex: number;
  selectedElementId: string | null;
  presenterMode: boolean;
  showTemplateModal: boolean;
  showAIPanel: boolean;
}

export interface PresentationActions {
  setActiveSlide: (index: number) => void;
  addSlide: (layout: SlideLayout, afterIndex?: number) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  moveSlide: (fromIndex: number, toIndex: number) => void;
  updateSlideBackground: (index: number, bg: string) => void;
  updateSlideNotes: (index: number, notes: string) => void;
  addElement: (slideIndex: number, element: Omit<SlideElement, 'id'>) => void;
  updateElement: (slideIndex: number, elementId: string, updates: Partial<SlideElement>) => void;
  removeElement: (slideIndex: number, elementId: string) => void;
  selectElement: (elementId: string | null) => void;
  setPresenterMode: (on: boolean) => void;
  setShowTemplateModal: (on: boolean) => void;
  setShowAIPanel: (on: boolean) => void;
  loadTemplate: (slides: Slide[]) => void;
  updateElementContent: (slideIndex: number, elementId: string, content: string) => void;
  updateSlideTransition: (index: number, transition: string) => void;
}

// ── Gradient presets ───────────────────────────────────────────────────────────

export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

export const SOLID_COLORS = [
  '#ffffff', '#f8f9fa', '#1a1a2e', '#16213e',
  '#0f3460', '#533483', '#e94560', '#2d4059',
];

// ── Layout helpers ─────────────────────────────────────────────────────────────

function createLayoutElements(layout: SlideLayout): SlideElement[] {
  switch (layout) {
    case 'title':
      return [
        {
          id: generateId(),
          type: 'text',
          x: 80,
          y: 160,
          width: 800,
          height: 80,
          content: 'Click to add title',
          style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 160,
          y: 280,
          width: 640,
          height: 50,
          content: 'Click to add subtitle',
          style: { fontSize: 24, color: '#e0e0e0' },
        },
      ];
    case 'content':
      return [
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 30,
          width: 840,
          height: 60,
          content: 'Slide Title',
          style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 110,
          width: 840,
          height: 380,
          content: 'Add your content here...',
          style: { fontSize: 20, color: '#e0e0e0' },
        },
      ];
    case 'two-column':
      return [
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 30,
          width: 840,
          height: 60,
          content: 'Slide Title',
          style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 110,
          width: 400,
          height: 380,
          content: 'Left column content...',
          style: { fontSize: 18, color: '#e0e0e0' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 500,
          y: 110,
          width: 400,
          height: 380,
          content: 'Right column content...',
          style: { fontSize: 18, color: '#e0e0e0' },
        },
      ];
    case 'section-header':
      return [
        {
          id: generateId(),
          type: 'text',
          x: 80,
          y: 200,
          width: 800,
          height: 80,
          content: 'Section Title',
          style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 80,
          y: 290,
          width: 800,
          height: 50,
          content: 'Section subtitle or description',
          style: { fontSize: 20, color: '#b0b0b0' },
        },
      ];
    case 'blank':
    default:
      return [];
  }
}

// ── Default slides ─────────────────────────────────────────────────────────────

function createDefaultSlides(): Slide[] {
  return [
    {
      id: generateId(),
      layout: 'title',
      background: GRADIENT_PRESETS[0],
      elements: createLayoutElements('title'),
      notes: '',
    },
  ];
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const usePresentationStore = create<PresentationState & PresentationActions>((set) => ({
  slides: createDefaultSlides(),
  activeSlideIndex: 0,
  selectedElementId: null,
  presenterMode: false,
  showTemplateModal: false,
  showAIPanel: false,

  setActiveSlide: (index) => set({ activeSlideIndex: index, selectedElementId: null }),

  addSlide: (layout, afterIndex) =>
    set((state) => {
      const insertAt = afterIndex !== undefined ? afterIndex + 1 : state.slides.length;
      const newSlide: Slide = {
        id: generateId(),
        layout,
        background: GRADIENT_PRESETS[insertAt % GRADIENT_PRESETS.length],
        elements: createLayoutElements(layout),
        notes: '',
      };
      const slides = [...state.slides];
      slides.splice(insertAt, 0, newSlide);
      return { slides, activeSlideIndex: insertAt };
    }),

  deleteSlide: (index) =>
    set((state) => {
      if (state.slides.length <= 1) return state;
      const slides = state.slides.filter((_, i) => i !== index);
      const activeSlideIndex = Math.min(state.activeSlideIndex, slides.length - 1);
      return { slides, activeSlideIndex };
    }),

  duplicateSlide: (index) =>
    set((state) => {
      const source = state.slides[index];
      const dup: Slide = {
        ...source,
        id: generateId(),
        elements: source.elements.map((el) => ({ ...el, id: generateId(), style: { ...el.style } })),
      };
      const slides = [...state.slides];
      slides.splice(index + 1, 0, dup);
      return { slides, activeSlideIndex: index + 1 };
    }),

  moveSlide: (fromIndex, toIndex) =>
    set((state) => {
      if (toIndex < 0 || toIndex >= state.slides.length) return state;
      const slides = [...state.slides];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      return { slides, activeSlideIndex: toIndex };
    }),

  updateSlideBackground: (index, bg) =>
    set((state) => {
      const slides = state.slides.map((s, i) => (i === index ? { ...s, background: bg } : s));
      return { slides };
    }),

  updateSlideNotes: (index, notes) =>
    set((state) => {
      const slides = state.slides.map((s, i) => (i === index ? { ...s, notes } : s));
      return { slides };
    }),

  addElement: (slideIndex, element) =>
    set((state) => {
      const newEl: SlideElement = { ...element, id: generateId(), style: { ...element.style } };
      const slides = state.slides.map((s, i) =>
        i === slideIndex ? { ...s, elements: [...s.elements, newEl] } : s,
      );
      return { slides, selectedElementId: newEl.id };
    }),

  updateElement: (slideIndex, elementId, updates) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? {
              ...s,
              elements: s.elements.map((el) =>
                el.id === elementId
                  ? { ...el, ...updates, style: { ...el.style, ...updates.style } }
                  : el,
              ),
            }
          : s,
      );
      return { slides };
    }),

  removeElement: (slideIndex, elementId) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) } : s,
      );
      return { slides, selectedElementId: null };
    }),

  selectElement: (elementId) => set({ selectedElementId: elementId }),

  setPresenterMode: (on) => set({ presenterMode: on }),
  setShowTemplateModal: (on) => set({ showTemplateModal: on }),
  setShowAIPanel: (on) => set({ showAIPanel: on }),

  loadTemplate: (slides) => set({ slides, activeSlideIndex: 0, selectedElementId: null, showTemplateModal: false }),

  updateElementContent: (slideIndex, elementId, content) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? {
              ...s,
              elements: s.elements.map((el) =>
                el.id === elementId ? { ...el, content } : el,
              ),
            }
          : s,
      );
      return { slides };
    }),

  updateSlideTransition: (index, transition) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === index ? { ...s, transition: transition as Slide['transition'] } : s,
      );
      return { slides };
    }),
}));
