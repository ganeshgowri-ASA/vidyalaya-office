'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Clock,
  MousePointer,
  ArrowRight,
  GripVertical,
  ChevronRight,
} from 'lucide-react';
import {
  usePresentationStore,
  ANIMATION_DEFINITIONS,
  type AnimationType,
  type AnimationCategory,
  type AnimationTrigger,
  type ElementAnimation,
} from '@/store/presentation-store';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<AnimationCategory, string> = {
  entrance: '#22c55e',
  emphasis: '#f59e0b',
  exit: '#ef4444',
  motion: '#3b82f6',
};

const CATEGORY_LABELS: Record<AnimationCategory, string> = {
  entrance: 'Entrance',
  emphasis: 'Emphasis',
  exit: 'Exit',
  motion: 'Motion',
};

const TRIGGER_LABELS: Record<AnimationTrigger, string> = {
  onClick: 'On Click',
  withPrevious: 'With Previous',
  afterPrevious: 'After Previous',
};

const TRIGGER_ICONS: Record<AnimationTrigger, React.ReactNode> = {
  onClick: <MousePointer size={10} />,
  withPrevious: <ArrowRight size={10} />,
  afterPrevious: <Clock size={10} />,
};

const PIXELS_PER_SECOND = 120;
const TIMELINE_PADDING = 16;
const BAR_HEIGHT = 28;
const BAR_GAP = 4;
const RULER_HEIGHT = 24;
const MIN_DURATION = 0.1;
const MIN_DELAY = 0;

function getAnimationLabel(type: AnimationType): string {
  for (const category of Object.keys(ANIMATION_DEFINITIONS) as AnimationCategory[]) {
    const found = ANIMATION_DEFINITIONS[category].find((a) => a.value === type);
    if (found) return found.label;
  }
  return type;
}

function getElementLabel(el: { elementId: string; elementType: string; elementContent: string }): string {
  if (el.elementType === 'text' && el.elementContent) {
    const plain = el.elementContent.replace(/<[^>]*>/g, '').trim();
    if (plain.length > 0) {
      return plain.length > 20 ? plain.slice(0, 20) + '...' : plain;
    }
  }
  return el.elementType.charAt(0).toUpperCase() + el.elementType.slice(1);
}

// ── Types ────────────────────────────────────────────────────────────────────

interface AnimatedItem {
  elementId: string;
  elementType: string;
  elementContent: string;
  animation: ElementAnimation;
}

type DragMode = 'move' | 'resize-left' | 'resize-right' | null;

interface DragState {
  itemId: string;
  mode: DragMode;
  startX: number;
  originalDelay: number;
  originalDuration: number;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AnimationTimeline() {
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    showAnimationTimeline,
    setShowAnimationTimeline,
    updateElementAnimation,
    reorderAnimations,
    selectElement,
  } = usePresentationStore();

  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [reorderDrag, setReorderDrag] = useState<{ itemId: string; startY: number; currentY: number } | null>(null);

  const playbackRef = useRef<number | null>(null);
  const playbackStartRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const slide = slides[activeSlideIndex];

  const animatedItems: AnimatedItem[] = useMemo(() => {
    if (!slide) return [];
    return slide.elements
      .filter((el) => el.animation)
      .sort((a, b) => (a.animation!.order ?? 0) - (b.animation!.order ?? 0))
      .map((el) => ({
        elementId: el.id,
        elementType: el.type,
        elementContent: el.content,
        animation: el.animation!,
      }));
  }, [slide]);

  const totalDuration = useMemo(() => {
    if (animatedItems.length === 0) return 0;
    return Math.max(
      ...animatedItems.map((item) => item.animation.delay + item.animation.duration),
    );
  }, [animatedItems]);

  const timelineWidth = Math.max(
    600,
    (totalDuration + 2) * PIXELS_PER_SECOND + TIMELINE_PADDING * 2,
  );

  const rulerSeconds = Math.ceil(totalDuration + 2);

  // ── Playback ─────────────────────────────────────────────────────────────

  const stopPlayback = useCallback(() => {
    if (playbackRef.current !== null) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    setPlaybackState('idle');
    setPlaybackTime(0);
    pausedAtRef.current = 0;
  }, []);

  const startPlayback = useCallback(() => {
    if (animatedItems.length === 0) return;

    const maxTime = Math.max(
      ...animatedItems.map((item) => item.animation.delay + item.animation.duration),
    );

    playbackStartRef.current = performance.now() - pausedAtRef.current * 1000;
    setPlaybackState('playing');

    const tick = () => {
      const elapsed = (performance.now() - playbackStartRef.current) / 1000;
      if (elapsed >= maxTime) {
        setPlaybackTime(maxTime);
        setPlaybackState('idle');
        pausedAtRef.current = 0;
        playbackRef.current = null;
        return;
      }
      setPlaybackTime(elapsed);
      playbackRef.current = requestAnimationFrame(tick);
    };

    playbackRef.current = requestAnimationFrame(tick);
  }, [animatedItems]);

  const pausePlayback = useCallback(() => {
    if (playbackRef.current !== null) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    pausedAtRef.current = playbackTime;
    setPlaybackState('paused');
  }, [playbackTime]);

  const resetPlayback = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  useEffect(() => {
    return () => {
      if (playbackRef.current !== null) {
        cancelAnimationFrame(playbackRef.current);
      }
    };
  }, []);

  // ── Drag to resize / reposition bars ──────────────────────────────────────

  const handleBarMouseDown = useCallback(
    (e: React.MouseEvent, itemId: string, mode: DragMode) => {
      e.stopPropagation();
      e.preventDefault();
      const item = animatedItems.find((i) => i.elementId === itemId);
      if (!item) return;

      setDragState({
        itemId,
        mode,
        startX: e.clientX,
        originalDelay: item.animation.delay,
        originalDuration: item.animation.duration,
      });
    },
    [animatedItems],
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragState.startX) / PIXELS_PER_SECOND;
      const item = animatedItems.find((i) => i.elementId === dragState.itemId);
      if (!item) return;

      if (dragState.mode === 'move') {
        const newDelay = Math.max(MIN_DELAY, dragState.originalDelay + dx);
        updateElementAnimation(activeSlideIndex, dragState.itemId, {
          ...item.animation,
          delay: Math.round(newDelay * 10) / 10,
        });
      } else if (dragState.mode === 'resize-left') {
        const maxShift = dragState.originalDuration - MIN_DURATION;
        const clampedDx = Math.max(-dragState.originalDelay, Math.min(maxShift, dx));
        const newDelay = dragState.originalDelay + clampedDx;
        const newDuration = dragState.originalDuration - clampedDx;
        updateElementAnimation(activeSlideIndex, dragState.itemId, {
          ...item.animation,
          delay: Math.round(Math.max(MIN_DELAY, newDelay) * 10) / 10,
          duration: Math.round(Math.max(MIN_DURATION, newDuration) * 10) / 10,
        });
      } else if (dragState.mode === 'resize-right') {
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration + dx);
        updateElementAnimation(activeSlideIndex, dragState.itemId, {
          ...item.animation,
          duration: Math.round(newDuration * 10) / 10,
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, animatedItems, activeSlideIndex, updateElementAnimation]);

  // ── Drag to reorder ───────────────────────────────────────────────────────

  const handleReorderMouseDown = useCallback(
    (e: React.MouseEvent, itemId: string) => {
      e.stopPropagation();
      e.preventDefault();
      setReorderDrag({ itemId, startY: e.clientY, currentY: e.clientY });
    },
    [],
  );

  useEffect(() => {
    if (!reorderDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      setReorderDrag((prev) => (prev ? { ...prev, currentY: e.clientY } : null));
    };

    const handleMouseUp = () => {
      if (!reorderDrag) return;
      const currentIndex = animatedItems.findIndex((i) => i.elementId === reorderDrag.itemId);
      if (currentIndex === -1) {
        setReorderDrag(null);
        return;
      }

      const dy = reorderDrag.currentY - reorderDrag.startY;
      const rowHeight = BAR_HEIGHT + BAR_GAP;
      const indexShift = Math.round(dy / rowHeight);
      const targetIndex = Math.max(0, Math.min(animatedItems.length - 1, currentIndex + indexShift));

      if (targetIndex !== currentIndex) {
        const targetOrder = animatedItems[targetIndex].animation.order;
        reorderAnimations(activeSlideIndex, reorderDrag.itemId, targetOrder);
      }
      setReorderDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [reorderDrag, animatedItems, activeSlideIndex, reorderAnimations]);

  // ── Detail panel for selected bar ─────────────────────────────────────────

  const selectedItem = selectedBarId
    ? animatedItems.find((i) => i.elementId === selectedBarId)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  if (!showAnimationTimeline) return null;

  return (
    <div
      className="flex flex-col border-t select-none"
      style={{
        height: 200,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--foreground)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3 shrink-0 border-b"
        style={{ height: 36, borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold">Animation Timeline</span>

          {/* Playback controls */}
          <div className="flex items-center gap-1">
            {playbackState === 'playing' ? (
              <button
                onClick={pausePlayback}
                className="p-1 rounded hover:bg-black/10"
                title="Pause"
              >
                <Pause size={14} />
              </button>
            ) : (
              <button
                onClick={startPlayback}
                className="p-1 rounded hover:bg-black/10"
                title="Play"
                disabled={animatedItems.length === 0}
                style={{ opacity: animatedItems.length === 0 ? 0.4 : 1 }}
              >
                <Play size={14} />
              </button>
            )}
            <button
              onClick={resetPlayback}
              className="p-1 rounded hover:bg-black/10"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Total duration */}
          <span className="text-[10px] opacity-60">
            Total: {totalDuration.toFixed(1)}s
          </span>

          {/* Current playback time */}
          {playbackState !== 'idle' && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--primary)' }}>
              {playbackTime.toFixed(1)}s
            </span>
          )}
        </div>

        <button
          onClick={() => setShowAnimationTimeline(false)}
          className="p-1 rounded hover:bg-black/10"
          title="Close timeline"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Timeline area */}
        <div className="flex-1 overflow-auto relative" ref={timelineRef}>
          {animatedItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs opacity-50">
                No animations on this slide. Add animations from the Animations panel.
              </p>
            </div>
          ) : (
            <div style={{ width: timelineWidth, minHeight: '100%', position: 'relative' }}>
              {/* Ruler */}
              <div
                className="sticky top-0 z-10 border-b"
                style={{
                  height: RULER_HEIGHT,
                  borderColor: 'var(--border)',
                  background: 'var(--sidebar)',
                }}
              >
                <svg width={timelineWidth} height={RULER_HEIGHT}>
                  {Array.from({ length: rulerSeconds + 1 }, (_, i) => {
                    const x = TIMELINE_PADDING + i * PIXELS_PER_SECOND;
                    return (
                      <g key={i}>
                        <line
                          x1={x}
                          y1={RULER_HEIGHT - 8}
                          x2={x}
                          y2={RULER_HEIGHT}
                          stroke="var(--foreground)"
                          strokeOpacity={0.3}
                          strokeWidth={1}
                        />
                        <text
                          x={x}
                          y={RULER_HEIGHT - 12}
                          fill="var(--foreground)"
                          fillOpacity={0.5}
                          fontSize={9}
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {i}s
                        </text>
                        {/* Half-second ticks */}
                        {i < rulerSeconds && (
                          <line
                            x1={x + PIXELS_PER_SECOND / 2}
                            y1={RULER_HEIGHT - 4}
                            x2={x + PIXELS_PER_SECOND / 2}
                            y2={RULER_HEIGHT}
                            stroke="var(--foreground)"
                            strokeOpacity={0.15}
                            strokeWidth={1}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Animation bars */}
              <div style={{ paddingTop: 8, paddingBottom: 8 }}>
                {animatedItems.map((item, idx) => {
                  const left = TIMELINE_PADDING + item.animation.delay * PIXELS_PER_SECOND;
                  const width = Math.max(
                    24,
                    item.animation.duration * PIXELS_PER_SECOND,
                  );
                  const color = CATEGORY_COLORS[item.animation.category];
                  const isSelected = item.elementId === selectedBarId;
                  const isElementSelected = item.elementId === selectedElementId;

                  // Reorder offset
                  let translateY = 0;
                  if (reorderDrag && reorderDrag.itemId === item.elementId) {
                    translateY = reorderDrag.currentY - reorderDrag.startY;
                  }

                  return (
                    <div
                      key={item.elementId}
                      className="relative"
                      style={{
                        height: BAR_HEIGHT,
                        marginBottom: BAR_GAP,
                        transform: translateY ? `translateY(${translateY}px)` : undefined,
                        zIndex: reorderDrag?.itemId === item.elementId ? 20 : 1,
                        transition: reorderDrag?.itemId === item.elementId ? 'none' : 'transform 150ms ease',
                      }}
                    >
                      {/* Reorder grip */}
                      <div
                        className="absolute flex items-center justify-center cursor-grab active:cursor-grabbing"
                        style={{
                          left: 0,
                          top: 0,
                          width: TIMELINE_PADDING,
                          height: BAR_HEIGHT,
                          opacity: 0.4,
                        }}
                        onMouseDown={(e) => handleReorderMouseDown(e, item.elementId)}
                      >
                        <GripVertical size={12} />
                      </div>

                      {/* The bar */}
                      <div
                        className="absolute rounded-md flex items-center overflow-hidden group"
                        style={{
                          left,
                          top: 0,
                          width,
                          height: BAR_HEIGHT,
                          background: color,
                          opacity: isSelected || isElementSelected ? 1 : 0.8,
                          outline: isSelected
                            ? `2px solid var(--primary)`
                            : isElementSelected
                              ? `2px solid ${color}`
                              : 'none',
                          outlineOffset: 1,
                          cursor: dragState?.mode === 'move' ? 'grabbing' : 'pointer',
                          transition: dragState ? 'none' : 'opacity 150ms',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBarId(item.elementId);
                          selectElement(item.elementId);
                        }}
                        onMouseDown={(e) => handleBarMouseDown(e, item.elementId, 'move')}
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[6px] cursor-col-resize hover:bg-white/30 z-10"
                          onMouseDown={(e) => handleBarMouseDown(e, item.elementId, 'resize-left')}
                        />

                        {/* Bar content */}
                        <div className="flex items-center gap-1.5 px-2 flex-1 min-w-0">
                          {/* Trigger indicator */}
                          <span
                            className="flex items-center justify-center shrink-0 rounded-sm"
                            style={{
                              width: 16,
                              height: 16,
                              background: 'rgba(255,255,255,0.25)',
                              color: '#fff',
                            }}
                            title={TRIGGER_LABELS[item.animation.trigger]}
                          >
                            {TRIGGER_ICONS[item.animation.trigger]}
                          </span>

                          {/* Label */}
                          <span
                            className="text-[10px] font-medium truncate"
                            style={{ color: '#fff' }}
                          >
                            {getElementLabel(item)} - {getAnimationLabel(item.animation.type)}
                          </span>
                        </div>

                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-[6px] cursor-col-resize hover:bg-white/30 z-10"
                          onMouseDown={(e) => handleBarMouseDown(e, item.elementId, 'resize-right')}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Playhead */}
              {playbackState !== 'idle' && (
                <div
                  className="absolute top-0 bottom-0 z-30 pointer-events-none"
                  style={{
                    left: TIMELINE_PADDING + playbackTime * PIXELS_PER_SECOND,
                    width: 1,
                    background: 'var(--primary)',
                  }}
                >
                  <div
                    className="absolute -top-0 -translate-x-1/2"
                    style={{
                      width: 8,
                      height: 8,
                      background: 'var(--primary)',
                      borderRadius: '50% 50% 50% 0',
                      transform: 'translateX(-50%) rotate(-45deg)',
                      top: RULER_HEIGHT - 4,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details panel (right sidebar) */}
        {selectedItem && (
          <div
            className="shrink-0 border-l overflow-y-auto"
            style={{
              width: 220,
              borderColor: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--card-foreground)',
            }}
          >
            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold truncate">
                  {getElementLabel(selectedItem)}
                </span>
                <button
                  onClick={() => setSelectedBarId(null)}
                  className="p-0.5 rounded hover:bg-black/10"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Animation type */}
              <div className="mb-3">
                <label className="text-[10px] uppercase tracking-wider opacity-50 block mb-1">
                  Animation
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: CATEGORY_COLORS[selectedItem.animation.category] }}
                  />
                  <span className="text-xs">
                    {CATEGORY_LABELS[selectedItem.animation.category]}{' '}
                    <ChevronRight size={10} className="inline opacity-40" />{' '}
                    {getAnimationLabel(selectedItem.animation.type)}
                  </span>
                </div>
              </div>

              {/* Trigger */}
              <div className="mb-3">
                <label className="text-[10px] uppercase tracking-wider opacity-50 block mb-1">
                  Trigger
                </label>
                <select
                  className="w-full text-xs rounded border px-2 py-1"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--card)',
                    color: 'var(--card-foreground)',
                  }}
                  value={selectedItem.animation.trigger}
                  onChange={(e) => {
                    updateElementAnimation(activeSlideIndex, selectedItem.elementId, {
                      ...selectedItem.animation,
                      trigger: e.target.value as AnimationTrigger,
                    });
                  }}
                >
                  <option value="onClick">On Click</option>
                  <option value="withPrevious">With Previous</option>
                  <option value="afterPrevious">After Previous</option>
                </select>
              </div>

              {/* Duration */}
              <div className="mb-3">
                <label className="text-[10px] uppercase tracking-wider opacity-50 block mb-1">
                  Duration
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={selectedItem.animation.duration}
                    onChange={(e) => {
                      updateElementAnimation(activeSlideIndex, selectedItem.elementId, {
                        ...selectedItem.animation,
                        duration: parseFloat(e.target.value),
                      });
                    }}
                    className="flex-1 h-1 rounded appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-[10px] font-mono w-8 text-right opacity-70">
                    {selectedItem.animation.duration.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Delay */}
              <div className="mb-3">
                <label className="text-[10px] uppercase tracking-wider opacity-50 block mb-1">
                  Delay
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={selectedItem.animation.delay}
                    onChange={(e) => {
                      updateElementAnimation(activeSlideIndex, selectedItem.elementId, {
                        ...selectedItem.animation,
                        delay: parseFloat(e.target.value),
                      });
                    }}
                    className="flex-1 h-1 rounded appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-[10px] font-mono w-8 text-right opacity-70">
                    {selectedItem.animation.delay.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="text-[10px] uppercase tracking-wider opacity-50 block mb-1">
                  Order
                </label>
                <span className="text-xs font-mono opacity-70">
                  #{selectedItem.animation.order}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
