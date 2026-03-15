'use client';

import { create } from 'zustand';
import { generateId } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

export type SlideLayout =
  | 'title'
  | 'content'
  | 'two-column'
  | 'blank'
  | 'section-header'
  | 'title-only'
  | 'comparison'
  | 'picture-caption';

export type AnimationType = 'fadeIn' | 'flyIn' | 'zoom' | 'bounce' | 'spin' | 'wipe';

export interface ElementAnimation {
  type: AnimationType;
  duration: number; // seconds
  delay: number; // seconds
}

export interface TableData {
  rows: number;
  cols: number;
  cells: string[][];
  headerRow?: boolean;
}

export interface ChartData {
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  rotation?: number;
  locked?: boolean;
  tableData?: TableData;
  chartData?: ChartData;
  style: {
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    fontFamily?: string;
    textDecoration?: string;
    textAlign?: string;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
    backgroundColor?: string;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
    shadow?: boolean;
    rotateX?: number;
    rotateY?: number;
  };
  animation?: ElementAnimation;
}

export interface SlideTransitionTiming {
  autoAdvance: boolean;
  autoAdvanceSeconds: number;
  onClickAdvance: boolean;
  loop: boolean;
}

export type SlideTransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'wipe' | 'split' | 'push' | 'cover' | 'dissolve';

export interface Slide {
  id: string;
  layout: SlideLayout;
  background: string;
  elements: SlideElement[];
  notes: string;
  transition?: SlideTransitionType;
  transitionTiming?: SlideTransitionTiming;
  hidden?: boolean;
  slideNumberVisible?: boolean;
  dateTimeVisible?: boolean;
  footerText?: string;
}

export interface PresentationTheme {
  name: string;
  background: string;
  titleColor: string;
  textColor: string;
}

export type RibbonTab = 'home' | 'insert' | 'design' | 'transitions' | 'animations' | 'slideshow' | 'review' | 'view';

export interface PresentationState {
  slides: Slide[];
  activeSlideIndex: number;
  selectedElementId: string | null;
  presenterMode: boolean;
  showTemplateModal: boolean;
  showAIPanel: boolean;
  showAnimationsPanel: boolean;
  showSmartArtModal: boolean;
  canvasZoom: number;
  showGrid: boolean;
  showRuler: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  currentTheme: string | null;
  activeRibbonTab: RibbonTab;
  showSlideSorter: boolean;
  clipboardSlide: Slide | null;
  clipboardElement: SlideElement | null;
  undoStack: Slide[][];
  redoStack: Slide[][];
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
  setShowAnimationsPanel: (on: boolean) => void;
  setShowSmartArtModal: (on: boolean) => void;
  setCanvasZoom: (zoom: number) => void;
  setShowGrid: (on: boolean) => void;
  setShowRuler: (on: boolean) => void;
  setShowGuides: (on: boolean) => void;
  setSnapToGrid: (on: boolean) => void;
  applyTheme: (theme: PresentationTheme) => void;
  setCurrentTheme: (name: string | null) => void;
  updateElementAnimation: (slideIndex: number, elementId: string, animation: ElementAnimation | undefined) => void;
  updateSlideTransitionTiming: (index: number, timing: Partial<SlideTransitionTiming>) => void;
  toggleSlideHidden: (index: number) => void;
  setActiveRibbonTab: (tab: RibbonTab) => void;
  setShowSlideSorter: (on: boolean) => void;
  copySlide: (index: number) => void;
  pasteSlide: (afterIndex: number) => void;
  copyElement: () => void;
  pasteElement: () => void;
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
  updateSlideFooter: (index: number, footer: { slideNumberVisible?: boolean; dateTimeVisible?: boolean; footerText?: string }) => void;
  bringForward: (slideIndex: number, elementId: string) => void;
  sendBackward: (slideIndex: number, elementId: string) => void;
}

// ── Themes ──────────────────────────────────────────────────────────────────────

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    name: 'Corporate Blue',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    titleColor: '#ffffff',
    textColor: '#e0e7ff',
  },
  {
    name: 'Nature Green',
    background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)',
    titleColor: '#ffffff',
    textColor: '#dcfce7',
  },
  {
    name: 'Minimal White',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    titleColor: '#1e293b',
    textColor: '#475569',
  },
  {
    name: 'Dark Elegance',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
    titleColor: '#f1f5f9',
    textColor: '#94a3b8',
  },
  {
    name: 'Sunset',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    titleColor: '#ffffff',
    textColor: '#fef3c7',
  },
  {
    name: 'Ocean',
    background: 'linear-gradient(135deg, #0c4a6e 0%, #06b6d4 100%)',
    titleColor: '#ffffff',
    textColor: '#cffafe',
  },
  {
    name: 'Tech',
    background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
    titleColor: '#22d3ee',
    textColor: '#a1a1aa',
  },
  {
    name: 'Creative',
    background: 'linear-gradient(135deg, #7c3aed 0%, #f472b6 100%)',
    titleColor: '#ffffff',
    textColor: '#fde68a',
  },
];

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
    case 'title-only':
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
      ];
    case 'comparison':
      return [
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 30,
          width: 840,
          height: 60,
          content: 'Comparison Title',
          style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 110,
          width: 400,
          height: 50,
          content: 'Option A',
          style: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 170,
          width: 400,
          height: 320,
          content: 'Details for option A...',
          style: { fontSize: 18, color: '#e0e0e0' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 500,
          y: 110,
          width: 400,
          height: 50,
          content: 'Option B',
          style: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 500,
          y: 170,
          width: 400,
          height: 320,
          content: 'Details for option B...',
          style: { fontSize: 18, color: '#e0e0e0' },
        },
      ];
    case 'picture-caption':
      return [
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 400,
          width: 840,
          height: 50,
          content: 'Picture caption goes here',
          style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
        },
        {
          id: generateId(),
          type: 'text',
          x: 60,
          y: 460,
          width: 840,
          height: 40,
          content: 'Add a description for the image above',
          style: { fontSize: 16, color: '#b0b0b0' },
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

const MAX_UNDO = 50;

export const usePresentationStore = create<PresentationState & PresentationActions>((set, get) => ({
  slides: createDefaultSlides(),
  activeSlideIndex: 0,
  selectedElementId: null,
  presenterMode: false,
  showTemplateModal: false,
  showAIPanel: false,
  showAnimationsPanel: false,
  showSmartArtModal: false,
  canvasZoom: 100,
  showGrid: false,
  showRuler: false,
  showGuides: false,
  snapToGrid: false,
  currentTheme: null,
  activeRibbonTab: 'home',
  showSlideSorter: false,
  clipboardSlide: null,
  clipboardElement: null,
  undoStack: [],
  redoStack: [],

  pushUndo: () =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-(MAX_UNDO - 1)), state.slides.map(s => ({ ...s, elements: s.elements.map(e => ({ ...e, style: { ...e.style } })) }))],
      redoStack: [],
    })),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.slides.map(s => ({ ...s, elements: s.elements.map(e => ({ ...e, style: { ...e.style } })) }))],
        slides: prev,
        activeSlideIndex: Math.min(state.activeSlideIndex, prev.length - 1),
        selectedElementId: null,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.slides.map(s => ({ ...s, elements: s.elements.map(e => ({ ...e, style: { ...e.style } })) }))],
        slides: next,
        activeSlideIndex: Math.min(state.activeSlideIndex, next.length - 1),
        selectedElementId: null,
      };
    }),

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
  setShowAnimationsPanel: (on) => set({ showAnimationsPanel: on }),
  setShowSmartArtModal: (on) => set({ showSmartArtModal: on }),
  setCanvasZoom: (zoom) => set({ canvasZoom: zoom }),
  setShowGrid: (on) => set({ showGrid: on }),
  setShowRuler: (on) => set({ showRuler: on }),
  setShowGuides: (on) => set({ showGuides: on }),
  setSnapToGrid: (on) => set({ snapToGrid: on }),
  setCurrentTheme: (name) => set({ currentTheme: name }),
  setActiveRibbonTab: (tab) => set({ activeRibbonTab: tab }),
  setShowSlideSorter: (on) => set({ showSlideSorter: on }),

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
        i === index ? { ...s, transition: transition as SlideTransitionType } : s,
      );
      return { slides };
    }),

  applyTheme: (theme) =>
    set((state) => {
      const slides = state.slides.map((s) => ({
        ...s,
        background: theme.background,
        elements: s.elements.map((el) => {
          if (el.type === 'text') {
            const isTitle = (el.style.fontSize || 0) >= 30;
            return {
              ...el,
              style: {
                ...el.style,
                color: isTitle ? theme.titleColor : theme.textColor,
              },
            };
          }
          return el;
        }),
      }));
      return { slides, currentTheme: theme.name };
    }),

  updateElementAnimation: (slideIndex, elementId, animation) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? {
              ...s,
              elements: s.elements.map((el) =>
                el.id === elementId ? { ...el, animation } : el,
              ),
            }
          : s,
      );
      return { slides };
    }),

  updateSlideTransitionTiming: (index, timing) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === index
          ? {
              ...s,
              transitionTiming: {
                autoAdvance: s.transitionTiming?.autoAdvance ?? false,
                autoAdvanceSeconds: s.transitionTiming?.autoAdvanceSeconds ?? 5,
                onClickAdvance: s.transitionTiming?.onClickAdvance ?? true,
                loop: s.transitionTiming?.loop ?? false,
                ...timing,
              },
            }
          : s,
      );
      return { slides };
    }),

  toggleSlideHidden: (index) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === index ? { ...s, hidden: !s.hidden } : s,
      );
      return { slides };
    }),

  copySlide: (index) =>
    set((state) => {
      const source = state.slides[index];
      return { clipboardSlide: { ...source, id: generateId(), elements: source.elements.map(el => ({ ...el, id: generateId(), style: { ...el.style } })) } };
    }),

  pasteSlide: (afterIndex) =>
    set((state) => {
      if (!state.clipboardSlide) return state;
      get().pushUndo();
      const pasted = { ...state.clipboardSlide, id: generateId(), elements: state.clipboardSlide.elements.map(el => ({ ...el, id: generateId(), style: { ...el.style } })) };
      const slides = [...state.slides];
      slides.splice(afterIndex + 1, 0, pasted);
      return { slides, activeSlideIndex: afterIndex + 1 };
    }),

  copyElement: () =>
    set((state) => {
      const slide = state.slides[state.activeSlideIndex];
      const el = slide?.elements.find(e => e.id === state.selectedElementId);
      if (!el) return state;
      return { clipboardElement: { ...el, style: { ...el.style } } };
    }),

  pasteElement: () =>
    set((state) => {
      if (!state.clipboardElement) return state;
      get().pushUndo();
      const newEl: SlideElement = { ...state.clipboardElement, id: generateId(), x: state.clipboardElement.x + 20, y: state.clipboardElement.y + 20, style: { ...state.clipboardElement.style } };
      const slides = state.slides.map((s, i) =>
        i === state.activeSlideIndex ? { ...s, elements: [...s.elements, newEl] } : s,
      );
      return { slides, selectedElementId: newEl.id };
    }),

  updateSlideFooter: (index, footer) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === index ? { ...s, ...footer } : s,
      );
      return { slides };
    }),

  bringForward: (slideIndex, elementId) =>
    set((state) => {
      get().pushUndo();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        const elements = [...s.elements];
        const idx = elements.findIndex(e => e.id === elementId);
        if (idx < elements.length - 1) {
          [elements[idx], elements[idx + 1]] = [elements[idx + 1], elements[idx]];
        }
        return { ...s, elements };
      });
      return { slides };
    }),

  sendBackward: (slideIndex, elementId) =>
    set((state) => {
      get().pushUndo();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        const elements = [...s.elements];
        const idx = elements.findIndex(e => e.id === elementId);
        if (idx > 0) {
          [elements[idx], elements[idx - 1]] = [elements[idx - 1], elements[idx]];
        }
        return { ...s, elements };
      });
      return { slides };
    }),
}));
