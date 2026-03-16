'use client';

import React, { useState } from 'react';
import { X, Play, ChevronDown, GripVertical, Clock, MousePointer, ArrowRight } from 'lucide-react';
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

export default function AnimationsPanel() {
  const {
    slides, activeSlideIndex, selectedElementId,
    showAnimationsPanel, setShowAnimationsPanel,
    updateElementAnimation, reorderAnimations,
  } = usePresentationStore();

  const [previewKey, setPreviewKey] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<AnimationCategory | null>('entrance');

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
      duration: currentAnimation?.duration ?? 0.5,
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

  const getPreviewStyle = (): React.CSSProperties => {
    if (!currentAnimation) return {};
    const dur = currentAnimation.duration;
    const del = currentAnimation.delay;
    const base: React.CSSProperties = {
      animationDuration: `${dur}s`,
      animationDelay: `${del}s`,
      animationFillMode: 'both',
      animationIterationCount: 1,
    };
    const nameMap: Record<string, string> = {
      fadeIn: 'anim-fadein', flyIn: 'anim-flyin', zoom: 'anim-zoom', bounce: 'anim-bounce',
      spin: 'anim-spin', wipe: 'anim-wipe', appear: 'anim-appear', pulse: 'anim-pulse',
      growShrink: 'anim-growshrink', colorChange: 'anim-colorchange',
      disappear: 'anim-disappear', fadeOut: 'anim-fadeout', flyOut: 'anim-flyout',
      shrink: 'anim-shrink', motionLine: 'anim-motionline', motionArc: 'anim-motionarc',
      motionCustom: 'anim-motioncustom',
    };
    return { ...base, animationName: nameMap[currentAnimation.type] || 'anim-fadein' };
  };

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 280, minWidth: 280,
        borderColor: 'var(--border)', background: 'var(--sidebar)', color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Keyframes */}
      <style>{`
        @keyframes anim-fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes anim-flyin { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes anim-zoom { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes anim-bounce { 0% { opacity: 0; transform: translateY(-30px); } 50% { opacity: 1; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes anim-spin { from { opacity: 0; transform: rotate(-360deg); } to { opacity: 1; transform: rotate(0deg); } }
        @keyframes anim-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes anim-appear { from { opacity: 0; } to { opacity: 1; } }
        @keyframes anim-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes anim-growshrink { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
        @keyframes anim-colorchange { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
        @keyframes anim-disappear { from { opacity: 1; } to { opacity: 0; } }
        @keyframes anim-fadeout { from { opacity: 1; } to { opacity: 0; } }
        @keyframes anim-flyout { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(40px); } }
        @keyframes anim-shrink { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.3); } }
        @keyframes anim-motionline { from { transform: translateX(-30px); } to { transform: translateX(30px); } }
        @keyframes anim-motionarc { 0% { transform: translate(-20px, 0); } 50% { transform: translate(0, -20px); } 100% { transform: translate(20px, 0); } }
        @keyframes anim-motioncustom { 0% { transform: translate(0, 0); } 25% { transform: translate(15px, -15px); } 50% { transform: translate(30px, 0); } 75% { transform: translate(15px, 15px); } 100% { transform: translate(0, 0); } }
      `}</style>

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
                  <ChevronDown size={12} className={`ml-auto transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === category && (
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {ANIMATION_DEFINITIONS[category].map((anim) => (
                      <button
                        key={anim.value}
                        onClick={() => handleSetAnimation(anim.value, category)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all border"
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

                {/* Preview */}
                <div className="text-xs font-medium mb-2 opacity-70">Preview</div>
                <div className="rounded border mb-3 flex items-center justify-center"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', height: 80 }}>
                  <div key={previewKey} className="w-12 h-12 rounded" style={{ background: 'var(--primary)', ...getPreviewStyle() }} />
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
                <div className="space-y-1">
                  {animatedElements.map((el, idx) => (
                    <div key={el.id}
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
