'use client';

import React, { useState } from 'react';
import { X, Play, Zap, RotateCcw, Maximize, Wind, RefreshCw } from 'lucide-react';
import {
  usePresentationStore,
  type AnimationType,
  type ElementAnimation,
} from '@/store/presentation-store';

const ANIMATION_TYPES: { value: AnimationType; label: string; icon: React.ReactNode }[] = [
  { value: 'fadeIn', label: 'Fade In', icon: <Wind size={16} /> },
  { value: 'flyIn', label: 'Fly In', icon: <Zap size={16} /> },
  { value: 'zoom', label: 'Zoom', icon: <Maximize size={16} /> },
  { value: 'bounce', label: 'Bounce', icon: <RefreshCw size={16} /> },
  { value: 'spin', label: 'Spin', icon: <RotateCcw size={16} /> },
  { value: 'wipe', label: 'Wipe', icon: <Play size={16} /> },
];

export default function AnimationsPanel() {
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    showAnimationsPanel,
    setShowAnimationsPanel,
    updateElementAnimation,
  } = usePresentationStore();

  const [previewKey, setPreviewKey] = useState(0);

  if (!showAnimationsPanel) return null;

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find((el) => el.id === selectedElementId);
  const currentAnimation = selectedElement?.animation;

  const handleSetAnimation = (type: AnimationType) => {
    if (!selectedElement) return;
    const animation: ElementAnimation = {
      type,
      duration: currentAnimation?.duration ?? 0.5,
      delay: currentAnimation?.delay ?? 0,
    };
    updateElementAnimation(activeSlideIndex, selectedElement.id, animation);
  };

  const handleUpdateDuration = (duration: number) => {
    if (!selectedElement || !currentAnimation) return;
    updateElementAnimation(activeSlideIndex, selectedElement.id, {
      ...currentAnimation,
      duration,
    });
  };

  const handleUpdateDelay = (delay: number) => {
    if (!selectedElement || !currentAnimation) return;
    updateElementAnimation(activeSlideIndex, selectedElement.id, {
      ...currentAnimation,
      delay,
    });
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
    switch (currentAnimation.type) {
      case 'fadeIn':
        return { ...base, animationName: 'anim-fadein' };
      case 'flyIn':
        return { ...base, animationName: 'anim-flyin' };
      case 'zoom':
        return { ...base, animationName: 'anim-zoom' };
      case 'bounce':
        return { ...base, animationName: 'anim-bounce' };
      case 'spin':
        return { ...base, animationName: 'anim-spin' };
      case 'wipe':
        return { ...base, animationName: 'anim-wipe' };
      default:
        return base;
    }
  };

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 260,
        minWidth: 260,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
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
      `}</style>

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-sm font-semibold">Animations</span>
        <button
          onClick={() => setShowAnimationsPanel(false)}
          className="p-1 rounded hover:opacity-80"
          style={{ color: 'var(--sidebar-foreground)' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!selectedElement ? (
          <p className="text-xs opacity-60 mt-4 text-center">
            Select an element on the slide to add animations.
          </p>
        ) : (
          <>
            {/* Animation types */}
            <div className="text-xs font-medium mb-2 opacity-70">Animation Type</div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {ANIMATION_TYPES.map((anim) => (
                <button
                  key={anim.value}
                  onClick={() => handleSetAnimation(anim.value)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all border"
                  style={{
                    borderColor:
                      currentAnimation?.type === anim.value ? 'var(--primary)' : 'var(--border)',
                    background:
                      currentAnimation?.type === anim.value ? 'var(--primary)' : 'var(--card)',
                    color:
                      currentAnimation?.type === anim.value
                        ? 'var(--primary-foreground)'
                        : 'var(--card-foreground)',
                  }}
                >
                  {anim.icon}
                  {anim.label}
                </button>
              ))}
            </div>

            {currentAnimation && (
              <>
                {/* Timing controls */}
                <div className="text-xs font-medium mb-2 opacity-70">Timing</div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs opacity-60 block mb-1">
                      Duration: {currentAnimation.duration}s
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={3}
                      step={0.1}
                      value={currentAnimation.duration}
                      onChange={(e) => handleUpdateDuration(parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs opacity-60 block mb-1">
                      Delay: {currentAnimation.delay}s
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.1}
                      value={currentAnimation.delay}
                      onChange={(e) => handleUpdateDelay(parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="text-xs font-medium mb-2 opacity-70">Preview</div>
                <div
                  className="rounded border mb-3 flex items-center justify-center"
                  style={{
                    background: 'var(--muted)',
                    borderColor: 'var(--border)',
                    height: 80,
                  }}
                >
                  <div
                    key={previewKey}
                    className="w-12 h-12 rounded"
                    style={{
                      background: 'var(--primary)',
                      ...getPreviewStyle(),
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreview}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium border"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--card-foreground)',
                      background: 'var(--card)',
                    }}
                  >
                    <Play size={12} />
                    Preview
                  </button>
                  <button
                    onClick={handleRemoveAnimation}
                    className="flex-1 px-2 py-1.5 rounded text-xs font-medium border"
                    style={{
                      borderColor: 'var(--border)',
                      color: '#ef4444',
                      background: 'var(--card)',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
