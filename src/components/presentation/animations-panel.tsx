'use client';

import React, { useState } from 'react';
import { X, Play, ChevronDown, GripVertical, Clock, MousePointer, ArrowRight, RotateCcw, Zap, PlayCircle } from 'lucide-react';
import {
  usePresentationStore,
  ANIMATION_DEFINITIONS,
  type AnimationType,
  type AnimationCategory,
  type AnimationTrigger,
  type ElementAnimation,
} from '@/store/presentation-store';

const CATEGORY_LABELS: Record<AnimationCategory, string> = {
  entrance: 'Entrance',
  emphasis: 'Emphasis',
  exit: 'Exit',
  motion: 'Motion Paths',
};

const CATEGORY_COLORS: Record<AnimationCategory, string> = {
  entrance: '#22c55e',
  emphasis: '#f59e0b',
  exit: '#ef4444',
  motion: '#3b82f6',
};

const TRIGGER_OPTIONS: { value: AnimationTrigger; label: string; icon: React.ReactNode }[] = [
  { value: 'onClick', label: 'On Click', icon: <MousePointer size={12} /> },
  { value: 'withPrevious', label: 'With Previous', icon: <ArrowRight size={12} /> },
  { value: 'afterPrevious', label: 'After Previous', icon: <Clock size={12} /> },
];

const SPEED_PRESETS: { label: string; value: number }[] = [
  { label: 'Very Slow', value: 3 },
  { label: 'Slow', value: 2 },
  { label: 'Medium', value: 1 },
  { label: 'Fast', value: 0.5 },
  { label: 'Very Fast', value: 0.25 },
];

const EASING_OPTIONS: { label: string; value: string }[] = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease', value: 'ease' },
  { label: 'Ease-In', value: 'ease-in' },
  { label: 'Ease-Out', value: 'ease-out' },
  { label: 'Ease-In-Out', value: 'ease-in-out' },
  { label: 'Bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
];

const REPEAT_OPTIONS: { label: string; value: number | 'infinite' }[] = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '\u221E', value: 'infinite' },
];

const ANIMATION_KEYFRAMES = `
  /* ── Entrance ── */
  @keyframes anim-appear { from { opacity: 0; } to { opacity: 1; } }
  @keyframes anim-fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes anim-flyin { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes anim-bounce { 0% { opacity: 0; transform: translateY(-30px); } 50% { opacity: 1; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes anim-zoom { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
  @keyframes anim-splitin { 0% { opacity: 0; clip-path: inset(50% 0 50% 0); } 100% { opacity: 1; clip-path: inset(0 0 0 0); } }
  @keyframes anim-wheelin { from { opacity: 0; transform: rotate(-720deg) scale(0); } to { opacity: 1; transform: rotate(0deg) scale(1); } }
  @keyframes anim-floatin { 0% { opacity: 0; transform: translateY(30px); } 60% { opacity: 1; transform: translateY(-8px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes anim-riseup { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes anim-expandin { from { opacity: 0; transform: scaleX(0); } to { opacity: 1; transform: scaleX(1); } }
  @keyframes anim-blindsin { 0% { opacity: 0; clip-path: inset(0 0 100% 0); } 25% { clip-path: inset(0 0 75% 0); } 50% { clip-path: inset(0 0 50% 0); } 75% { clip-path: inset(0 0 25% 0); } 100% { opacity: 1; clip-path: inset(0 0 0 0); } }
  @keyframes anim-boxin { from { opacity: 0; clip-path: inset(50% 50% 50% 50%); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
  @keyframes anim-checkerboardin { 0% { opacity: 0; background-size: 0% 0%; } 50% { opacity: 0.5; } 100% { opacity: 1; background-size: 100% 100%; } }
  @keyframes anim-peekin { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
  @keyframes anim-stripesin { 0% { opacity: 0; clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } 100% { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
  @keyframes anim-swivel { from { opacity: 0; transform: perspective(400px) rotateY(-90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0deg); } }

  /* ── Emphasis ── */
  @keyframes anim-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  @keyframes anim-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes anim-growshrink { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
  @keyframes anim-colorchange { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
  @keyframes anim-teeter { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
  @keyframes anim-wobble { 0%, 100% { transform: translateX(0) rotate(0deg); } 15% { transform: translateX(-8px) rotate(-5deg); } 30% { transform: translateX(6px) rotate(3deg); } 45% { transform: translateX(-4px) rotate(-3deg); } 60% { transform: translateX(2px) rotate(2deg); } 75% { transform: translateX(-1px) rotate(-1deg); } }
  @keyframes anim-flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
  @keyframes anim-shimmer { 0% { filter: brightness(1); } 50% { filter: brightness(1.5); } 100% { filter: brightness(1); } }
  @keyframes anim-wave { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-10px); } 75% { transform: translateY(10px); } }
  @keyframes anim-jiggle { 0%, 100% { transform: skewX(0deg); } 20% { transform: skewX(-8deg); } 40% { transform: skewX(6deg); } 60% { transform: skewX(-4deg); } 80% { transform: skewX(2deg); } }
  @keyframes anim-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes anim-colorpulse { 0%, 100% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(60deg) brightness(1.3); } }
  @keyframes anim-boldreveal { 0% { font-weight: 100; opacity: 0.4; } 100% { font-weight: 900; opacity: 1; } }
  @keyframes anim-complementarycolor { 0%, 100% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(180deg); } }

  /* ── Exit ── */
  @keyframes anim-disappear { from { opacity: 1; } to { opacity: 0; } }
  @keyframes anim-fadeout { from { opacity: 1; } to { opacity: 0; } }
  @keyframes anim-flyout { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(40px); } }
  @keyframes anim-shrink { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.3); } }
  @keyframes anim-splitout { 0% { opacity: 1; clip-path: inset(0 0 0 0); } 100% { opacity: 0; clip-path: inset(50% 0 50% 0); } }
  @keyframes anim-wheelout { from { opacity: 1; transform: rotate(0deg) scale(1); } to { opacity: 0; transform: rotate(720deg) scale(0); } }
  @keyframes anim-floatout { 0% { opacity: 1; transform: translateY(0); } 40% { opacity: 1; transform: translateY(8px); } 100% { opacity: 0; transform: translateY(-30px); } }
  @keyframes anim-sinkdown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(50px); } }
  @keyframes anim-collapseout { from { opacity: 1; transform: scaleY(1); } to { opacity: 0; transform: scaleY(0); } }
  @keyframes anim-blindsout { 0% { opacity: 1; clip-path: inset(0 0 0 0); } 100% { opacity: 0; clip-path: inset(0 0 100% 0); } }
  @keyframes anim-boxout { from { opacity: 1; clip-path: inset(0 0 0 0); } to { opacity: 0; clip-path: inset(50% 50% 50% 50%); } }
  @keyframes anim-checkerboardout { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 0; } }
  @keyframes anim-peekout { from { opacity: 1; clip-path: inset(0 0 0 0); } to { opacity: 0; clip-path: inset(0 0 0 100%); } }
  @keyframes anim-stripesout { 0% { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } 100% { opacity: 0; clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } }

  /* ── Motion Paths ── */
  @keyframes anim-motionline { from { transform: translateX(-30px); } to { transform: translateX(30px); } }
  @keyframes anim-motionarc { 0% { transform: translate(-20px, 0); } 50% { transform: translate(0, -20px); } 100% { transform: translate(20px, 0); } }
  @keyframes anim-motioncustom { 0% { transform: translate(0, 0); } 25% { transform: translate(15px, -15px); } 50% { transform: translate(30px, 0); } 75% { transform: translate(15px, 15px); } 100% { transform: translate(0, 0); } }
  @keyframes anim-motioncircle { 0% { transform: translate(0, -20px); } 25% { transform: translate(20px, 0); } 50% { transform: translate(0, 20px); } 75% { transform: translate(-20px, 0); } 100% { transform: translate(0, -20px); } }
  @keyframes anim-motiondiamond { 0% { transform: translate(0, -20px); } 25% { transform: translate(20px, 0); } 50% { transform: translate(0, 20px); } 75% { transform: translate(-20px, 0); } 100% { transform: translate(0, -20px); } }
  @keyframes anim-motionheart { 0% { transform: translate(0, -10px); } 15% { transform: translate(15px, -20px); } 30% { transform: translate(20px, -5px); } 50% { transform: translate(0, 20px); } 70% { transform: translate(-20px, -5px); } 85% { transform: translate(-15px, -20px); } 100% { transform: translate(0, -10px); } }
  @keyframes anim-motionspiral { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(10px, -10px) rotate(90deg); } 50% { transform: translate(0, -20px) rotate(180deg); } 75% { transform: translate(-10px, -10px) rotate(270deg); } 100% { transform: translate(0, 0) rotate(360deg); } }
  @keyframes anim-motionbounce { 0%, 100% { transform: translateY(0); } 20% { transform: translateY(-25px); } 40% { transform: translateY(0); } 60% { transform: translateY(-15px); } 80% { transform: translateY(0); } }
  @keyframes anim-motionwave { 0% { transform: translate(0, 0); } 25% { transform: translate(10px, -15px); } 50% { transform: translate(20px, 0); } 75% { transform: translate(30px, 15px); } 100% { transform: translate(40px, 0); } }
  @keyframes anim-motionfigure8 { 0% { transform: translate(0, 0); } 25% { transform: translate(20px, -15px); } 50% { transform: translate(0, 0); } 75% { transform: translate(-20px, 15px); } 100% { transform: translate(0, 0); } }
  @keyframes anim-motionloop { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(25px, -10px); } 50% { transform: translate(25px, 10px); } 75% { transform: translate(0, 0); } }
  @keyframes anim-motionzigzag { 0% { transform: translate(0, 0); } 25% { transform: translate(15px, -15px); } 50% { transform: translate(0, 0); } 75% { transform: translate(-15px, -15px); } 100% { transform: translate(0, 0); } }
  @keyframes anim-motionstar { 0% { transform: translate(0, -20px); } 20% { transform: translate(12px, 16px); } 40% { transform: translate(-20px, -6px); } 60% { transform: translate(20px, -6px); } 80% { transform: translate(-12px, 16px); } 100% { transform: translate(0, -20px); } }

  /* Legacy */
  @keyframes anim-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
`;

const ANIM_NAME_MAP: Record<string, string> = {
  // Entrance
  appear: 'anim-appear',
  fadeIn: 'anim-fadein',
  flyIn: 'anim-flyin',
  bounce: 'anim-bounce',
  zoom: 'anim-zoom',
  splitIn: 'anim-splitin',
  wheelIn: 'anim-wheelin',
  floatIn: 'anim-floatin',
  riseUp: 'anim-riseup',
  expandIn: 'anim-expandin',
  blindsIn: 'anim-blindsin',
  boxIn: 'anim-boxin',
  checkerboardIn: 'anim-checkerboardin',
  peekIn: 'anim-peekin',
  stripesIn: 'anim-stripesin',
  swivel: 'anim-swivel',
  // Emphasis
  pulse: 'anim-pulse',
  spin: 'anim-spin',
  growShrink: 'anim-growshrink',
  colorChange: 'anim-colorchange',
  teeter: 'anim-teeter',
  wobble: 'anim-wobble',
  flash: 'anim-flash',
  shimmer: 'anim-shimmer',
  wave: 'anim-wave',
  jiggle: 'anim-jiggle',
  blink: 'anim-blink',
  colorPulse: 'anim-colorpulse',
  boldReveal: 'anim-boldreveal',
  complementaryColor: 'anim-complementarycolor',
  // Exit
  disappear: 'anim-disappear',
  fadeOut: 'anim-fadeout',
  flyOut: 'anim-flyout',
  shrink: 'anim-shrink',
  splitOut: 'anim-splitout',
  wheelOut: 'anim-wheelout',
  floatOut: 'anim-floatout',
  sinkDown: 'anim-sinkdown',
  collapseOut: 'anim-collapseout',
  blindsOut: 'anim-blindsout',
  boxOut: 'anim-boxout',
  checkerboardOut: 'anim-checkerboardout',
  peekOut: 'anim-peekout',
  stripesOut: 'anim-stripesout',
  // Motion
  motionLine: 'anim-motionline',
  motionArc: 'anim-motionarc',
  motionCustom: 'anim-motioncustom',
  motionCircle: 'anim-motioncircle',
  motionDiamond: 'anim-motiondiamond',
  motionHeart: 'anim-motionheart',
  motionSpiral: 'anim-motionspiral',
  motionBounce: 'anim-motionbounce',
  motionWave: 'anim-motionwave',
  motionFigure8: 'anim-motionfigure8',
  motionLoop: 'anim-motionloop',
  motionZigzag: 'anim-motionzigzag',
  motionStar: 'anim-motionstar',
  // Legacy
  wipe: 'anim-wipe',
};

export default function AnimationsPanel() {
  const {
    slides, activeSlideIndex, selectedElementId,
    showAnimationsPanel, setShowAnimationsPanel,
    updateElementAnimation, reorderAnimations,
  } = usePresentationStore();

  const [previewKey, setPreviewKey] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<AnimationCategory | null>('entrance');
  const [selectedEasing, setSelectedEasing] = useState('ease');
  const [selectedRepeat, setSelectedRepeat] = useState<number | 'infinite'>(1);
  const [playAllKey, setPlayAllKey] = useState(0);

  if (!showAnimationsPanel) return null;

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find((el) => el.id === selectedElementId);
  const currentAnimation = selectedElement?.animation;

  // Get all animated elements for the timeline
  const animatedElements = slide?.elements
    .filter(el => el.animation)
    .sort((a, b) => (a.animation?.order ?? 0) - (b.animation?.order ?? 0)) ?? [];

  const handleSetAnimation = (type: AnimationType, category: AnimationCategory) => {
    if (!selectedElement) return;
    const maxOrder = Math.max(0, ...animatedElements.map(el => el.animation?.order ?? 0));
    const animation: ElementAnimation = {
      type,
      category,
      duration: currentAnimation?.duration ?? 1,
      delay: currentAnimation?.delay ?? 0,
      trigger: currentAnimation?.trigger ?? 'onClick',
      order: currentAnimation?.order ?? maxOrder + 1,
    };
    updateElementAnimation(activeSlideIndex, selectedElement.id, animation);
  };

  const handleUpdateDuration = (duration: number) => {
    if (!selectedElement || !currentAnimation) return;
    updateElementAnimation(activeSlideIndex, selectedElement.id, { ...currentAnimation, duration });
  };

  const handleUpdateDelay = (delay: number) => {
    if (!selectedElement || !currentAnimation) return;
    updateElementAnimation(activeSlideIndex, selectedElement.id, { ...currentAnimation, delay });
  };

  const handleUpdateTrigger = (trigger: AnimationTrigger) => {
    if (!selectedElement || !currentAnimation) return;
    updateElementAnimation(activeSlideIndex, selectedElement.id, { ...currentAnimation, trigger });
  };

  const handleRemoveAnimation = () => {
    if (!selectedElement) return;
    updateElementAnimation(activeSlideIndex, selectedElement.id, undefined);
  };

  const handlePreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const handlePlayAll = () => {
    setPlayAllKey((k) => k + 1);
  };

  const getPreviewStyle = (): React.CSSProperties => {
    if (!currentAnimation) return {};
    const dur = currentAnimation.duration;
    const del = currentAnimation.delay;
    return {
      animationDuration: `${dur}s`,
      animationDelay: `${del}s`,
      animationFillMode: 'both',
      animationIterationCount: selectedRepeat === 'infinite' ? 'infinite' : selectedRepeat,
      animationTimingFunction: selectedEasing,
      animationName: ANIM_NAME_MAP[currentAnimation.type] || 'anim-fadein',
    };
  };

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 300, minWidth: 300,
        borderColor: 'var(--border)', background: 'var(--sidebar)', color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Keyframes */}
      <style>{ANIMATION_KEYFRAMES}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-semibold">Animations</span>
        <button onClick={() => setShowAnimationsPanel(false)} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--sidebar-foreground)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!selectedElement ? (
          <p className="text-xs opacity-60 mt-4 text-center">Select an element on the slide to add animations.</p>
        ) : (
          <>
            {/* Animation Categories */}
            {(Object.keys(ANIMATION_DEFINITIONS) as AnimationCategory[]).map((category) => (
              <div key={category} className="mb-3">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  className="flex items-center gap-2 w-full text-xs font-medium mb-1.5 opacity-80 hover:opacity-100"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
                  {CATEGORY_LABELS[category]}
                  <span className="text-[10px] opacity-50 ml-1">({ANIMATION_DEFINITIONS[category].length})</span>
                  <ChevronDown size={12} className={`ml-auto transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === category && (
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {ANIMATION_DEFINITIONS[category].map((anim) => (
                      <button
                        key={anim.value}
                        onClick={() => handleSetAnimation(anim.value, category)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] transition-all border"
                        style={{
                          borderColor: currentAnimation?.type === anim.value ? CATEGORY_COLORS[category] : 'var(--border)',
                          background: currentAnimation?.type === anim.value ? CATEGORY_COLORS[category] : 'var(--card)',
                          color: currentAnimation?.type === anim.value ? '#fff' : 'var(--card-foreground)',
                        }}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {currentAnimation && (
              <>
                {/* Trigger */}
                <div className="text-xs font-medium mb-2 opacity-70">Trigger</div>
                <div className="flex gap-1 mb-4">
                  {TRIGGER_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => handleUpdateTrigger(opt.value)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border flex-1"
                      style={{
                        borderColor: currentAnimation.trigger === opt.value ? 'var(--primary)' : 'var(--border)',
                        background: currentAnimation.trigger === opt.value ? 'var(--primary)' : 'var(--card)',
                        color: currentAnimation.trigger === opt.value ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                      }}
                    >
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Speed Presets */}
                <div className="text-xs font-medium mb-2 opacity-70 flex items-center gap-1">
                  <Zap size={12} /> Speed
                </div>
                <div className="flex gap-1 mb-4 flex-wrap">
                  {SPEED_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleUpdateDuration(preset.value)}
                      className="px-2 py-1 rounded text-[10px] border transition-all"
                      style={{
                        borderColor: currentAnimation.duration === preset.value ? 'var(--primary)' : 'var(--border)',
                        background: currentAnimation.duration === preset.value ? 'var(--primary)' : 'var(--card)',
                        color: currentAnimation.duration === preset.value ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                      }}
                    >
                      {preset.label} ({preset.value}s)
                    </button>
                  ))}
                </div>

                {/* Timing controls */}
                <div className="text-xs font-medium mb-2 opacity-70">Timing</div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs opacity-60 block mb-1">Duration: {currentAnimation.duration}s</label>
                    <input type="range" min={0.1} max={5} step={0.1} value={currentAnimation.duration}
                      onChange={(e) => handleUpdateDuration(parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded appearance-none cursor-pointer" style={{ accentColor: 'var(--primary)' }} />
                  </div>
                  <div>
                    <label className="text-xs opacity-60 block mb-1">Delay: {currentAnimation.delay}s</label>
                    <input type="range" min={0} max={10} step={0.1} value={currentAnimation.delay}
                      onChange={(e) => handleUpdateDelay(parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded appearance-none cursor-pointer" style={{ accentColor: 'var(--primary)' }} />
                  </div>
                </div>

                {/* Easing */}
                <div className="text-xs font-medium mb-2 opacity-70">Easing</div>
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {EASING_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedEasing(opt.value)}
                      className="px-2 py-1 rounded text-[10px] border transition-all"
                      style={{
                        borderColor: selectedEasing === opt.value ? 'var(--primary)' : 'var(--border)',
                        background: selectedEasing === opt.value ? 'var(--primary)' : 'var(--card)',
                        color: selectedEasing === opt.value ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Repeat Count */}
                <div className="text-xs font-medium mb-2 opacity-70 flex items-center gap-1">
                  <RotateCcw size={12} /> Repeat
                </div>
                <div className="flex gap-1 mb-4">
                  {REPEAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedRepeat(opt.value)}
                      className="flex-1 px-2 py-1 rounded text-[11px] border transition-all font-medium"
                      style={{
                        borderColor: selectedRepeat === opt.value ? 'var(--primary)' : 'var(--border)',
                        background: selectedRepeat === opt.value ? 'var(--primary)' : 'var(--card)',
                        color: selectedRepeat === opt.value ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="text-xs font-medium mb-2 opacity-70">Preview</div>
                <div
                  className="rounded-lg border mb-3 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #1e1e2e 0%, #313244 50%, #45475a 100%)',
                    borderColor: 'var(--border)',
                    height: 120,
                  }}
                >
                  <div
                    key={previewKey}
                    className="w-14 h-14 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      ...getPreviewStyle(),
                    }}
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={handlePreview}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium border"
                    style={{ borderColor: 'var(--border)', color: 'var(--card-foreground)', background: 'var(--card)' }}>
                    <Play size={12} /> Preview
                  </button>
                  <button onClick={handleRemoveAnimation}
                    className="flex-1 px-2 py-1.5 rounded text-xs font-medium border"
                    style={{ borderColor: 'var(--border)', color: '#ef4444', background: 'var(--card)' }}>
                    Remove
                  </button>
                </div>
              </>
            )}

            {/* Animation Timeline */}
            {animatedElements.length > 0 && (
              <>
                <div className="text-xs font-medium mb-2 opacity-70 mt-2">Animation Timeline</div>
                <div className="space-y-1 mb-3">
                  {animatedElements.map((el, idx) => (
                    <div key={`${el.id}-${playAllKey}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs border cursor-pointer"
                      style={{
                        borderColor: el.id === selectedElementId ? 'var(--primary)' : 'var(--border)',
                        background: el.id === selectedElementId ? 'var(--accent)' : 'var(--card)',
                        color: 'var(--card-foreground)',
                      }}
                      onClick={() => usePresentationStore.getState().selectElement(el.id)}
                    >
                      <GripVertical size={12} className="opacity-40 flex-shrink-0" />
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[el.animation!.category] }} />
                      <span className="truncate flex-1">{el.type}: {el.animation!.type}</span>
                      <span className="opacity-50 flex-shrink-0">{el.animation!.duration}s</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handlePlayAll}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:opacity-90"
                  style={{
                    borderColor: 'var(--primary)',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  <PlayCircle size={14} /> Play All Animations
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
