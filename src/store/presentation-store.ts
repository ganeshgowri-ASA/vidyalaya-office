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

// Enhanced animation types
export type AnimationCategory = 'entrance' | 'emphasis' | 'exit' | 'motion';
export type AnimationType =
  // Entrance
  | 'fadeIn' | 'flyIn' | 'zoom' | 'bounce' | 'appear'
  // Emphasis
  | 'pulse' | 'spin' | 'growShrink' | 'colorChange'
  // Exit
  | 'disappear' | 'fadeOut' | 'flyOut' | 'shrink'
  // Motion Paths
  | 'motionLine' | 'motionArc' | 'motionCustom'
  // Legacy
  | 'wipe';

export type AnimationTrigger = 'onClick' | 'withPrevious' | 'afterPrevious';

export interface ElementAnimation {
  type: AnimationType;
  category: AnimationCategory;
  duration: number;
  delay: number;
  trigger: AnimationTrigger;
  order: number;
}

export interface TableCellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
}

export interface TableData {
  rows: number;
  cols: number;
  cells: string[][];
  headerRow?: boolean;
  tableStyle?: 'default' | 'striped' | 'bordered' | 'minimal' | 'colorful';
  cellStyles?: Record<string, TableCellStyle>;
  columnWidths?: number[];
  rowHeights?: number[];
  mergedCells?: Array<{ row: number; col: number; rowSpan: number; colSpan: number }>;
}

export interface ChartData {
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
}

export interface TextEffect {
  wordArt?: string;
  textShadow?: string;
  textReflection?: boolean;
  text3DRotateX?: number;
  text3DRotateY?: number;
  gradientFill?: string;
  glowColor?: string;
  glowSize?: number;
}

export interface MediaData {
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface ImageFilters {
  brightness?: number;
  contrast?: number;
  blur?: number;
  saturate?: number;
  grayscale?: number;
  sepia?: number;
  hueRotate?: number;
}

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table' | 'chart' | 'media';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  rotation?: number;
  locked?: boolean;
  groupId?: string;
  tableData?: TableData;
  chartData?: ChartData;
  textEffect?: TextEffect;
  mediaData?: MediaData;
  imageFilters?: ImageFilters;
  imageCrop?: ImageCrop;
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
    borderStyle?: string;
    opacity?: number;
    shadow?: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    reflection?: boolean;
    glow?: boolean;
    glowColor?: string;
    rotateX?: number;
    rotateY?: number;
    fillGradient?: string;
    effect3D?: string;
  };
  animation?: ElementAnimation;
}

export interface SlideTransitionTiming {
  autoAdvance: boolean;
  autoAdvanceSeconds: number;
  onClickAdvance: boolean;
  loop: boolean;
}

export type SlideTransitionType =
  | 'none' | 'fade' | 'slide' | 'zoom' | 'wipe' | 'split' | 'push'
  | 'cover' | 'dissolve' | 'morph' | 'reveal' | 'cut' | 'uncover' | 'random';

export interface PlaceholderPosition {
  id: string;
  type: 'title' | 'subtitle' | 'body' | 'footer' | 'date' | 'slideNumber' | 'image' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideMaster {
  id: string;
  name: string;
  background: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
  placeholders?: PlaceholderPosition[];
  logoUrl?: string;
  logoPosition?: { x: number; y: number; width: number; height: number };
  borderStyle?: string;
  headerHeight?: number;
  footerHeight?: number;
}

export interface SlideSection {
  id: string;
  name: string;
  slideIds: string[];
  collapsed?: boolean;
}

export type TransitionSound = 'none' | 'click' | 'whoosh' | 'chime' | 'drum' | 'applause';

export interface Slide {
  id: string;
  layout: SlideLayout;
  background: string;
  elements: SlideElement[];
  notes: string;
  transition?: SlideTransitionType;
  transitionDuration?: number;
  transitionTiming?: SlideTransitionTiming;
  transitionSound?: TransitionSound;
  hidden?: boolean;
  slideNumberVisible?: boolean;
  dateTimeVisible?: boolean;
  footerText?: string;
  masterId?: string;
  sectionId?: string;
}

export interface ThemeColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface ThemeFontPair {
  heading: string;
  body: string;
}

export interface ThemeBackgroundStyle {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  value: string;
}

export interface ThemeEffectPreset {
  name: string;
  shadow?: string;
  borderRadius?: string;
  opacity?: number;
}

export interface PresentationTheme {
  name: string;
  background: string;
  titleColor: string;
  textColor: string;
  accentColor?: string;
  fontFamily?: string;
  headingFont?: string;
  colorScheme?: ThemeColorScheme;
  fontPair?: ThemeFontPair;
  backgroundStyle?: ThemeBackgroundStyle;
  effectPreset?: ThemeEffectPreset;
  category?: string;
}

export interface DesignSuggestion {
  id: string;
  name: string;
  theme: PresentationTheme;
  preview: string;
}

export type RibbonTab = 'home' | 'insert' | 'design' | 'transitions' | 'animations' | 'slideshow' | 'review' | 'view';

export interface PresentationState {
  slides: Slide[];
  activeSlideIndex: number;
  selectedElementId: string | null;
  selectedElementIds: string[];
  presenterMode: boolean;
  showTemplateModal: boolean;
  showAIPanel: boolean;
  showAnimationsPanel: boolean;
  showSmartArtModal: boolean;
  showSlideMaster: boolean;
  showDesignPanel: boolean;
  showMediaPanel: boolean;
  showTextEffectsPanel: boolean;
  showExportPanel: boolean;
  showThemeDesigner: boolean;
  showShapeDrawingTools: boolean;
  showImageEditor: boolean;
  showTransitionPanel: boolean;
  showAnimationTimeline: boolean;
  canvasZoom: number;
  showGrid: boolean;
  showRuler: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  currentTheme: string | null;
  activeRibbonTab: RibbonTab;
  showSlideSorter: boolean;
  clipboardSlide: Slide | null;
  clipboardElement: SlideElement | null;
  undoStack: Slide[][];
  redoStack: Slide[][];
  slideMasters: SlideMaster[];
  sections: SlideSection[];
  slideShowAnnotations: Array<{ slideIndex: number; points: Array<{ x: number; y: number }>; color: string; tool: 'pen' | 'highlighter' }>;
  presenterViewMode: boolean;
  customThemes: PresentationTheme[];
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
  selectMultipleElements: (elementIds: string[]) => void;
  setPresenterMode: (on: boolean) => void;
  setShowTemplateModal: (on: boolean) => void;
  setShowAIPanel: (on: boolean) => void;
  loadTemplate: (slides: Slide[]) => void;
  updateElementContent: (slideIndex: number, elementId: string, content: string) => void;
  updateSlideTransition: (index: number, transition: string) => void;
  updateSlideTransitionDuration: (index: number, duration: number) => void;
  applyTransitionToAll: (transition: string, duration?: number) => void;
  setShowAnimationsPanel: (on: boolean) => void;
  setShowSmartArtModal: (on: boolean) => void;
  setShowSlideMaster: (on: boolean) => void;
  setShowDesignPanel: (on: boolean) => void;
  setShowMediaPanel: (on: boolean) => void;
  setShowTextEffectsPanel: (on: boolean) => void;
  setShowExportPanel: (on: boolean) => void;
  setCanvasZoom: (zoom: number) => void;
  setShowGrid: (on: boolean) => void;
  setShowRuler: (on: boolean) => void;
  setShowGuides: (on: boolean) => void;
  setSnapToGrid: (on: boolean) => void;
  setSnapToObjects: (on: boolean) => void;
  applyTheme: (theme: PresentationTheme) => void;
  setCurrentTheme: (name: string | null) => void;
  updateElementAnimation: (slideIndex: number, elementId: string, animation: ElementAnimation | undefined) => void;
  reorderAnimations: (slideIndex: number, elementId: string, newOrder: number) => void;
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
  bringToFront: (slideIndex: number, elementId: string) => void;
  sendToBack: (slideIndex: number, elementId: string) => void;
  groupElements: (slideIndex: number, elementIds: string[]) => void;
  ungroupElements: (slideIndex: number, groupId: string) => void;
  alignElements: (slideIndex: number, elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (slideIndex: number, elementIds: string[], direction: 'horizontal' | 'vertical') => void;
  addSlideMaster: (master: Omit<SlideMaster, 'id'>) => void;
  updateSlideMaster: (masterId: string, updates: Partial<SlideMaster>) => void;
  applySlideMaster: (slideIndex: number, masterId: string) => void;
  addSection: (name: string, slideIds: string[]) => void;
  updateSection: (sectionId: string, updates: Partial<SlideSection>) => void;
  removeSection: (sectionId: string) => void;
  addSlideShowAnnotation: (annotation: PresentationState['slideShowAnnotations'][0]) => void;
  clearSlideShowAnnotations: () => void;
  setPresenterViewMode: (on: boolean) => void;
  updateElementTextEffect: (slideIndex: number, elementId: string, textEffect: TextEffect | undefined) => void;
  setShowThemeDesigner: (on: boolean) => void;
  setShowShapeDrawingTools: (on: boolean) => void;
  setShowImageEditor: (on: boolean) => void;
  setShowTransitionPanel: (on: boolean) => void;
  setShowAnimationTimeline: (on: boolean) => void;
  addCustomTheme: (theme: PresentationTheme) => void;
  updateImageFilters: (slideIndex: number, elementId: string, filters: ImageFilters) => void;
  updateImageCrop: (slideIndex: number, elementId: string, crop: ImageCrop) => void;
  updateTableCellStyle: (slideIndex: number, elementId: string, cellKey: string, style: TableCellStyle) => void;
  updateSlideTransitionSound: (index: number, sound: TransitionSound) => void;
  updateSlideMasterPlaceholders: (masterId: string, placeholders: PlaceholderPosition[]) => void;
}

// ── Animation Definitions ───────────────────────────────────────────────────

export const ANIMATION_DEFINITIONS: Record<AnimationCategory, { value: AnimationType; label: string }[]> = {
  entrance: [
    { value: 'appear', label: 'Appear' },
    { value: 'fadeIn', label: 'Fade' },
    { value: 'flyIn', label: 'Fly In' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'zoom', label: 'Zoom' },
  ],
  emphasis: [
    { value: 'pulse', label: 'Pulse' },
    { value: 'spin', label: 'Spin' },
    { value: 'growShrink', label: 'Grow/Shrink' },
    { value: 'colorChange', label: 'Color Change' },
  ],
  exit: [
    { value: 'disappear', label: 'Disappear' },
    { value: 'fadeOut', label: 'Fade Out' },
    { value: 'flyOut', label: 'Fly Out' },
    { value: 'shrink', label: 'Shrink' },
  ],
  motion: [
    { value: 'motionLine', label: 'Lines' },
    { value: 'motionArc', label: 'Arcs' },
    { value: 'motionCustom', label: 'Custom' },
  ],
};

// ── Themes ──────────────────────────────────────────────────────────────────────

export const PRESENTATION_THEMES: PresentationTheme[] = [
  { name: 'Corporate Blue', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', titleColor: '#ffffff', textColor: '#e0e7ff', accentColor: '#3b82f6', fontFamily: 'Arial', headingFont: 'Arial', category: 'Professional', colorScheme: { primary: '#2563eb', secondary: '#1e3a5f', accent: '#3b82f6', background: '#1e3a5f', surface: '#2563eb', text: '#ffffff', textSecondary: '#e0e7ff' }, fontPair: { heading: 'Arial', body: 'Arial' } },
  { name: 'Nature Green', background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)', titleColor: '#ffffff', textColor: '#dcfce7', accentColor: '#22c55e', fontFamily: 'Georgia', headingFont: 'Georgia', category: 'Nature' },
  { name: 'Minimal White', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', titleColor: '#1e293b', textColor: '#475569', accentColor: '#3b82f6', fontFamily: 'Helvetica', headingFont: 'Helvetica', category: 'Minimal' },
  { name: 'Dark Elegance', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)', titleColor: '#f1f5f9', textColor: '#94a3b8', accentColor: '#a855f7', fontFamily: 'Georgia', headingFont: 'Georgia', category: 'Dark' },
  { name: 'Sunset', background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', titleColor: '#ffffff', textColor: '#fef3c7', accentColor: '#f59e0b', fontFamily: 'Verdana', headingFont: 'Verdana', category: 'Vibrant' },
  { name: 'Ocean', background: 'linear-gradient(135deg, #0c4a6e 0%, #06b6d4 100%)', titleColor: '#ffffff', textColor: '#cffafe', accentColor: '#06b6d4', fontFamily: 'Arial', headingFont: 'Arial', category: 'Nature' },
  { name: 'Tech', background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)', titleColor: '#22d3ee', textColor: '#a1a1aa', accentColor: '#22d3ee', fontFamily: 'Courier New', headingFont: 'Courier New', category: 'Dark' },
  { name: 'Creative', background: 'linear-gradient(135deg, #7c3aed 0%, #f472b6 100%)', titleColor: '#ffffff', textColor: '#fde68a', accentColor: '#f472b6', fontFamily: 'Trebuchet MS', headingFont: 'Trebuchet MS', category: 'Creative' },
  { name: 'Aurora', background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #415a77 60%, #778da9 100%)', titleColor: '#e0e1dd', textColor: '#a8dadc', accentColor: '#457b9d', fontFamily: 'Georgia', headingFont: 'Georgia', category: 'Dark' },
  { name: 'Rose Gold', background: 'linear-gradient(135deg, #2d1b2e 0%, #5c2d50 50%, #b76e79 100%)', titleColor: '#ffd7d7', textColor: '#e8b4b8', accentColor: '#d4a5a5', fontFamily: 'Georgia', headingFont: 'Georgia', category: 'Elegant' },
  { name: 'Arctic', background: 'linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 50%, #bee3db 100%)', titleColor: '#2b2d42', textColor: '#495057', accentColor: '#3d5a80', fontFamily: 'Helvetica', headingFont: 'Helvetica', category: 'Minimal' },
  { name: 'Midnight Purple', background: 'linear-gradient(135deg, #0d0221 0%, #150050 50%, #3f0071 100%)', titleColor: '#fb2576', textColor: '#d8b4fe', accentColor: '#a855f7', fontFamily: 'Trebuchet MS', headingFont: 'Trebuchet MS', category: 'Dark' },
  { name: 'Warm Earth', background: 'linear-gradient(135deg, #3c1518 0%, #69140e 30%, #a44200 60%, #d58936 100%)', titleColor: '#f2f0d8', textColor: '#e0d8b0', accentColor: '#d58936', fontFamily: 'Georgia', headingFont: 'Georgia', category: 'Warm' },
  { name: 'Neon City', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16003b 100%)', titleColor: '#00ff88', textColor: '#e0e0e0', accentColor: '#ff006e', fontFamily: 'Arial', headingFont: 'Arial', category: 'Creative' },
  { name: 'Clean Slate', background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)', titleColor: '#1a1a1a', textColor: '#4a4a4a', accentColor: '#2563eb', fontFamily: 'Helvetica', headingFont: 'Helvetica', category: 'Minimal' },
  { name: 'Forest', background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', titleColor: '#d8f3dc', textColor: '#b7e4c7', accentColor: '#95d5b2', fontFamily: 'Georgia', headingFont: 'Georgia', category: 'Nature' },
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

// ── Default Slide Masters ─────────────────────────────────────────────────────

export const DEFAULT_SLIDE_MASTERS: SlideMaster[] = [
  { id: 'master-default', name: 'Default', background: GRADIENT_PRESETS[0], titleColor: '#ffffff', textColor: '#e0e0e0', accentColor: '#3b82f6', fontFamily: 'Arial', headingFont: 'Arial' },
  { id: 'master-dark', name: 'Dark', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)', titleColor: '#f1f5f9', textColor: '#94a3b8', accentColor: '#a855f7', fontFamily: 'Georgia', headingFont: 'Georgia' },
  { id: 'master-light', name: 'Light', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', titleColor: '#1e293b', textColor: '#475569', accentColor: '#3b82f6', fontFamily: 'Helvetica', headingFont: 'Helvetica' },
];

// ── Shape Definitions ─────────────────────────────────────────────────────────

export const SHAPE_TOOL_DEFINITIONS = [
  { id: 'rect', label: 'Rectangle', category: 'basic' },
  { id: 'rounded-rect', label: 'Rounded Rectangle', category: 'basic' },
  { id: 'circle', label: 'Circle/Ellipse', category: 'basic' },
  { id: 'triangle', label: 'Triangle', category: 'basic' },
  { id: 'pentagon', label: 'Pentagon', category: 'basic' },
  { id: 'hexagon', label: 'Hexagon', category: 'basic' },
  { id: 'star', label: 'Star', category: 'basic' },
  { id: 'arrow', label: 'Arrow Right', category: 'arrows' },
  { id: 'arrow-left', label: 'Arrow Left', category: 'arrows' },
  { id: 'arrow-up', label: 'Arrow Up', category: 'arrows' },
  { id: 'arrow-down', label: 'Arrow Down', category: 'arrows' },
  { id: 'arrow-double', label: 'Double Arrow', category: 'arrows' },
  { id: 'callout', label: 'Callout Bubble', category: 'callouts' },
  { id: 'callout-round', label: 'Round Callout', category: 'callouts' },
  { id: 'line', label: 'Line', category: 'lines' },
  { id: 'curve', label: 'Curve', category: 'lines' },
  { id: 'diamond', label: 'Diamond', category: 'basic' },
  { id: 'cross', label: 'Cross', category: 'basic' },
  { id: 'heart', label: 'Heart', category: 'basic' },
  { id: 'cloud', label: 'Cloud', category: 'basic' },
];

// ── Design Suggestions ────────────────────────────────────────────────────────

export const DESIGN_SUGGESTIONS: DesignSuggestion[] = [
  { id: 'ds-modern', name: 'Modern Minimal', theme: PRESENTATION_THEMES[2], preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
  { id: 'ds-bold', name: 'Bold & Bright', theme: PRESENTATION_THEMES[4], preview: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { id: 'ds-elegant', name: 'Elegant Dark', theme: PRESENTATION_THEMES[3], preview: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)' },
  { id: 'ds-tech', name: 'Tech Focus', theme: PRESENTATION_THEMES[6], preview: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)' },
  { id: 'ds-creative', name: 'Creative Pop', theme: PRESENTATION_THEMES[7], preview: 'linear-gradient(135deg, #7c3aed 0%, #f472b6 100%)' },
  { id: 'ds-nature', name: 'Nature Fresh', theme: PRESENTATION_THEMES[1], preview: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)' },
];

// ── WordArt Styles ────────────────────────────────────────────────────────────

export const WORDART_STYLES = [
  { id: 'wa-gradient-blue', name: 'Blue Gradient', style: 'background: linear-gradient(to right, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;' },
  { id: 'wa-gradient-fire', name: 'Fire', style: 'background: linear-gradient(to right, #f97316, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;' },
  { id: 'wa-shadow', name: 'Shadow Text', style: 'text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-weight: bold;' },
  { id: 'wa-outline', name: 'Outline', style: '-webkit-text-stroke: 1px currentColor; -webkit-text-fill-color: transparent; font-weight: bold;' },
  { id: 'wa-glow', name: 'Glow', style: 'text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; font-weight: bold;' },
  { id: 'wa-3d', name: '3D Effect', style: 'text-shadow: 1px 1px 0 #ccc, 2px 2px 0 #999, 3px 3px 0 #666; font-weight: bold;' },
  { id: 'wa-neon', name: 'Neon', style: 'text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #3b82f6, 0 0 20px #3b82f6; font-weight: bold;' },
  { id: 'wa-gradient-rainbow', name: 'Rainbow', style: 'background: linear-gradient(to right, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;' },
];

// ── Layout helpers ─────────────────────────────────────────────────────────────

function createLayoutElements(layout: SlideLayout): SlideElement[] {
  switch (layout) {
    case 'title':
      return [
        { id: generateId(), type: 'text', x: 80, y: 160, width: 800, height: 80, content: 'Click to add title', style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 160, y: 280, width: 640, height: 50, content: 'Click to add subtitle', style: { fontSize: 24, color: '#e0e0e0' } },
      ];
    case 'content':
      return [
        { id: generateId(), type: 'text', x: 60, y: 30, width: 840, height: 60, content: 'Slide Title', style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 60, y: 110, width: 840, height: 380, content: 'Add your content here...', style: { fontSize: 20, color: '#e0e0e0' } },
      ];
    case 'two-column':
      return [
        { id: generateId(), type: 'text', x: 60, y: 30, width: 840, height: 60, content: 'Slide Title', style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 60, y: 110, width: 400, height: 380, content: 'Left column content...', style: { fontSize: 18, color: '#e0e0e0' } },
        { id: generateId(), type: 'text', x: 500, y: 110, width: 400, height: 380, content: 'Right column content...', style: { fontSize: 18, color: '#e0e0e0' } },
      ];
    case 'section-header':
      return [
        { id: generateId(), type: 'text', x: 80, y: 200, width: 800, height: 80, content: 'Section Title', style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 80, y: 290, width: 800, height: 50, content: 'Section subtitle or description', style: { fontSize: 20, color: '#b0b0b0' } },
      ];
    case 'title-only':
      return [
        { id: generateId(), type: 'text', x: 60, y: 30, width: 840, height: 60, content: 'Slide Title', style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } },
      ];
    case 'comparison':
      return [
        { id: generateId(), type: 'text', x: 60, y: 30, width: 840, height: 60, content: 'Comparison Title', style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 60, y: 110, width: 400, height: 50, content: 'Option A', style: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 60, y: 170, width: 400, height: 320, content: 'Details for option A...', style: { fontSize: 18, color: '#e0e0e0' } },
        { id: generateId(), type: 'text', x: 500, y: 110, width: 400, height: 50, content: 'Option B', style: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 500, y: 170, width: 400, height: 320, content: 'Details for option B...', style: { fontSize: 18, color: '#e0e0e0' } },
      ];
    case 'picture-caption':
      return [
        { id: generateId(), type: 'text', x: 60, y: 400, width: 840, height: 50, content: 'Picture caption goes here', style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' } },
        { id: generateId(), type: 'text', x: 60, y: 460, width: 840, height: 40, content: 'Add a description for the image above', style: { fontSize: 16, color: '#b0b0b0' } },
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
  selectedElementIds: [],
  presenterMode: false,
  showTemplateModal: false,
  showAIPanel: false,
  showAnimationsPanel: false,
  showSmartArtModal: false,
  showSlideMaster: false,
  showDesignPanel: false,
  showMediaPanel: false,
  showTextEffectsPanel: false,
  showExportPanel: false,
  showThemeDesigner: false,
  showShapeDrawingTools: false,
  showImageEditor: false,
  showTransitionPanel: false,
  showAnimationTimeline: false,
  canvasZoom: 100,
  showGrid: false,
  showRuler: false,
  showGuides: false,
  snapToGrid: false,
  snapToObjects: true,
  currentTheme: null,
  activeRibbonTab: 'home',
  showSlideSorter: false,
  clipboardSlide: null,
  clipboardElement: null,
  undoStack: [],
  redoStack: [],
  slideMasters: [...DEFAULT_SLIDE_MASTERS],
  sections: [],
  slideShowAnnotations: [],
  presenterViewMode: false,
  customThemes: [],

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

  selectElement: (elementId) => set({ selectedElementId: elementId, selectedElementIds: elementId ? [elementId] : [] }),

  selectMultipleElements: (elementIds) => set({ selectedElementIds: elementIds, selectedElementId: elementIds[0] || null }),

  setPresenterMode: (on) => set({ presenterMode: on }),
  setShowTemplateModal: (on) => set({ showTemplateModal: on }),
  setShowAIPanel: (on) => set({ showAIPanel: on }),
  setShowAnimationsPanel: (on) => set({ showAnimationsPanel: on }),
  setShowSmartArtModal: (on) => set({ showSmartArtModal: on }),
  setShowSlideMaster: (on) => set({ showSlideMaster: on }),
  setShowDesignPanel: (on) => set({ showDesignPanel: on }),
  setShowMediaPanel: (on) => set({ showMediaPanel: on }),
  setShowTextEffectsPanel: (on) => set({ showTextEffectsPanel: on }),
  setShowExportPanel: (on) => set({ showExportPanel: on }),
  setShowThemeDesigner: (on) => set({ showThemeDesigner: on }),
  setShowShapeDrawingTools: (on) => set({ showShapeDrawingTools: on }),
  setShowImageEditor: (on) => set({ showImageEditor: on }),
  setShowTransitionPanel: (on) => set({ showTransitionPanel: on }),
  setShowAnimationTimeline: (on) => set({ showAnimationTimeline: on }),
  setCanvasZoom: (zoom) => set({ canvasZoom: zoom }),
  setShowGrid: (on) => set({ showGrid: on }),
  setShowRuler: (on) => set({ showRuler: on }),
  setShowGuides: (on) => set({ showGuides: on }),
  setSnapToGrid: (on) => set({ snapToGrid: on }),
  setSnapToObjects: (on) => set({ snapToObjects: on }),
  setCurrentTheme: (name) => set({ currentTheme: name }),
  setActiveRibbonTab: (tab) => set({ activeRibbonTab: tab }),
  setShowSlideSorter: (on) => set({ showSlideSorter: on }),
  setPresenterViewMode: (on) => set({ presenterViewMode: on }),

  loadTemplate: (slides) => set({ slides, activeSlideIndex: 0, selectedElementId: null, showTemplateModal: false }),

  updateElementContent: (slideIndex, elementId, content) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, content } : el) }
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

  updateSlideTransitionDuration: (index, duration) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === index ? { ...s, transitionDuration: duration } : s,
      );
      return { slides };
    }),

  applyTransitionToAll: (transition, duration) =>
    set((state) => {
      const slides = state.slides.map((s) => ({
        ...s,
        transition: transition as SlideTransitionType,
        ...(duration !== undefined ? { transitionDuration: duration } : {}),
      }));
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
                ...(theme.fontFamily ? { fontFamily: isTitle && theme.headingFont ? theme.headingFont : theme.fontFamily } : {}),
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
          ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, animation } : el) }
          : s,
      );
      return { slides };
    }),

  reorderAnimations: (slideIndex, elementId, newOrder) =>
    set((state) => {
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        return {
          ...s,
          elements: s.elements.map((el) =>
            el.id === elementId && el.animation ? { ...el, animation: { ...el.animation, order: newOrder } } : el,
          ),
        };
      });
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

  bringToFront: (slideIndex, elementId) =>
    set((state) => {
      get().pushUndo();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        const elements = [...s.elements];
        const idx = elements.findIndex(e => e.id === elementId);
        if (idx >= 0 && idx < elements.length - 1) {
          const [el] = elements.splice(idx, 1);
          elements.push(el);
        }
        return { ...s, elements };
      });
      return { slides };
    }),

  sendToBack: (slideIndex, elementId) =>
    set((state) => {
      get().pushUndo();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        const elements = [...s.elements];
        const idx = elements.findIndex(e => e.id === elementId);
        if (idx > 0) {
          const [el] = elements.splice(idx, 1);
          elements.unshift(el);
        }
        return { ...s, elements };
      });
      return { slides };
    }),

  groupElements: (slideIndex, elementIds) =>
    set((state) => {
      const groupId = generateId();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        return {
          ...s,
          elements: s.elements.map((el) =>
            elementIds.includes(el.id) ? { ...el, groupId } : el,
          ),
        };
      });
      return { slides };
    }),

  ungroupElements: (slideIndex, groupId) =>
    set((state) => {
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        return {
          ...s,
          elements: s.elements.map((el) =>
            el.groupId === groupId ? { ...el, groupId: undefined } : el,
          ),
        };
      });
      return { slides };
    }),

  alignElements: (slideIndex, elementIds, alignment) =>
    set((state) => {
      get().pushUndo();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        const targets = s.elements.filter(el => elementIds.includes(el.id));
        if (targets.length < 2) return s;

        let ref: number;
        switch (alignment) {
          case 'left': ref = Math.min(...targets.map(e => e.x)); break;
          case 'right': ref = Math.max(...targets.map(e => e.x + e.width)); break;
          case 'center': {
            const minX = Math.min(...targets.map(e => e.x));
            const maxX = Math.max(...targets.map(e => e.x + e.width));
            ref = (minX + maxX) / 2;
            break;
          }
          case 'top': ref = Math.min(...targets.map(e => e.y)); break;
          case 'bottom': ref = Math.max(...targets.map(e => e.y + e.height)); break;
          case 'middle': {
            const minY = Math.min(...targets.map(e => e.y));
            const maxY = Math.max(...targets.map(e => e.y + e.height));
            ref = (minY + maxY) / 2;
            break;
          }
        }

        return {
          ...s,
          elements: s.elements.map((el) => {
            if (!elementIds.includes(el.id)) return el;
            switch (alignment) {
              case 'left': return { ...el, x: ref };
              case 'right': return { ...el, x: ref - el.width };
              case 'center': return { ...el, x: ref - el.width / 2 };
              case 'top': return { ...el, y: ref };
              case 'bottom': return { ...el, y: ref - el.height };
              case 'middle': return { ...el, y: ref - el.height / 2 };
              default: return el;
            }
          }),
        };
      });
      return { slides };
    }),

  distributeElements: (slideIndex, elementIds, direction) =>
    set((state) => {
      get().pushUndo();
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        const targets = s.elements.filter(el => elementIds.includes(el.id));
        if (targets.length < 3) return s;

        if (direction === 'horizontal') {
          const sorted = [...targets].sort((a, b) => a.x - b.x);
          const totalWidth = sorted.reduce((sum, e) => sum + e.width, 0);
          const totalSpace = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x;
          const gap = (totalSpace - totalWidth) / (sorted.length - 1);
          let currentX = sorted[0].x;
          const xMap = new Map<string, number>();
          sorted.forEach(el => {
            xMap.set(el.id, currentX);
            currentX += el.width + gap;
          });
          return { ...s, elements: s.elements.map(el => elementIds.includes(el.id) ? { ...el, x: xMap.get(el.id) ?? el.x } : el) };
        } else {
          const sorted = [...targets].sort((a, b) => a.y - b.y);
          const totalHeight = sorted.reduce((sum, e) => sum + e.height, 0);
          const totalSpace = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y;
          const gap = (totalSpace - totalHeight) / (sorted.length - 1);
          let currentY = sorted[0].y;
          const yMap = new Map<string, number>();
          sorted.forEach(el => {
            yMap.set(el.id, currentY);
            currentY += el.height + gap;
          });
          return { ...s, elements: s.elements.map(el => elementIds.includes(el.id) ? { ...el, y: yMap.get(el.id) ?? el.y } : el) };
        }
      });
      return { slides };
    }),

  addSlideMaster: (master) =>
    set((state) => ({
      slideMasters: [...state.slideMasters, { ...master, id: generateId() }],
    })),

  updateSlideMaster: (masterId, updates) =>
    set((state) => ({
      slideMasters: state.slideMasters.map(m => m.id === masterId ? { ...m, ...updates } : m),
    })),

  applySlideMaster: (slideIndex, masterId) =>
    set((state) => {
      const master = state.slideMasters.find(m => m.id === masterId);
      if (!master) return state;
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        return {
          ...s,
          masterId,
          background: master.background,
          elements: s.elements.map((el) => {
            if (el.type === 'text') {
              const isTitle = (el.style.fontSize || 0) >= 30;
              return {
                ...el,
                style: {
                  ...el.style,
                  color: isTitle ? master.titleColor : master.textColor,
                  fontFamily: isTitle ? master.headingFont : master.fontFamily,
                },
              };
            }
            return el;
          }),
        };
      });
      return { slides };
    }),

  addSection: (name, slideIds) =>
    set((state) => ({
      sections: [...state.sections, { id: generateId(), name, slideIds }],
    })),

  updateSection: (sectionId, updates) =>
    set((state) => ({
      sections: state.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s),
    })),

  removeSection: (sectionId) =>
    set((state) => ({
      sections: state.sections.filter(s => s.id !== sectionId),
    })),

  addSlideShowAnnotation: (annotation) =>
    set((state) => ({
      slideShowAnnotations: [...state.slideShowAnnotations, annotation],
    })),

  clearSlideShowAnnotations: () => set({ slideShowAnnotations: [] }),

  updateElementTextEffect: (slideIndex, elementId, textEffect) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, textEffect } : el) }
          : s,
      );
      return { slides };
    }),

  addCustomTheme: (theme) =>
    set((state) => ({
      customThemes: [...state.customThemes, theme],
    })),

  updateImageFilters: (slideIndex, elementId, filters) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, imageFilters: filters } : el) }
          : s,
      );
      return { slides };
    }),

  updateImageCrop: (slideIndex, elementId, crop) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === slideIndex
          ? { ...s, elements: s.elements.map((el) => el.id === elementId ? { ...el, imageCrop: crop } : el) }
          : s,
      );
      return { slides };
    }),

  updateTableCellStyle: (slideIndex, elementId, cellKey, style) =>
    set((state) => {
      const slides = state.slides.map((s, i) => {
        if (i !== slideIndex) return s;
        return {
          ...s,
          elements: s.elements.map((el) => {
            if (el.id !== elementId || !el.tableData) return el;
            const cellStyles = { ...(el.tableData.cellStyles || {}), [cellKey]: { ...(el.tableData.cellStyles?.[cellKey] || {}), ...style } };
            return { ...el, tableData: { ...el.tableData, cellStyles } };
          }),
        };
      });
      return { slides };
    }),

  updateSlideTransitionSound: (index, sound) =>
    set((state) => {
      const slides = state.slides.map((s, i) =>
        i === index ? { ...s, transitionSound: sound } : s,
      );
      return { slides };
    }),

  updateSlideMasterPlaceholders: (masterId, placeholders) =>
    set((state) => ({
      slideMasters: state.slideMasters.map(m => m.id === masterId ? { ...m, placeholders } : m),
    })),
}));
