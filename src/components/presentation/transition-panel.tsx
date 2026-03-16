'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Volume2,
  VolumeX,
  Timer,
  MousePointerClick,
  Repeat,
  Zap,
  Shuffle,
  Check,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  usePresentationStore,
  type SlideTransitionType,
  type SlideTransitionTiming,
  type TransitionSound,
} from '@/store/presentation-store';

/* ─── Constants ─── */

const TRANSITION_TYPES: { value: SlideTransitionType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'split', label: 'Split' },
  { value: 'push', label: 'Push' },
  { value: 'cover', label: 'Cover' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'morph', label: 'Morph' },
  { value: 'reveal', label: 'Reveal' },
  { value: 'cut', label: 'Cut' },
  { value: 'uncover', label: 'Uncover' },
  { value: 'random', label: 'Random' },
];

const SOUND_OPTIONS: { value: TransitionSound; label: string }[] = [
  { value: 'none', label: 'No Sound' },
  { value: 'click', label: 'Click' },
  { value: 'whoosh', label: 'Whoosh' },
  { value: 'chime', label: 'Chime' },
  { value: 'drum', label: 'Drum' },
  { value: 'applause', label: 'Applause' },
];

const EASING_OPTIONS = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'linear', label: 'Linear' },
] as const;

/* ─── Keyframes for transition previews ─── */

const TRANSITION_KEYFRAMES = `
@keyframes t-fade { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
@keyframes t-slide { 0% { transform: translateX(0); } 50% { transform: translateX(100%); } 51% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
@keyframes t-zoom { 0% { transform: scale(1); } 50% { transform: scale(0); } 100% { transform: scale(1); } }
@keyframes t-wipe { 0% { clip-path: inset(0 0 0 0); } 50% { clip-path: inset(0 0 0 100%); } 51% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
@keyframes t-split { 0% { clip-path: inset(0 0 0 0); } 50% { clip-path: inset(50% 0 50% 0); } 100% { clip-path: inset(0 0 0 0); } }
@keyframes t-push { 0% { transform: translateX(0); opacity: 1; } 50% { transform: translateX(100%); opacity: 0; } 51% { transform: translateX(-100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes t-cover { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
@keyframes t-dissolve { 0% { opacity: 1; filter: blur(0); } 50% { opacity: 0; filter: blur(4px); } 100% { opacity: 1; filter: blur(0); } }
@keyframes t-morph { 0% { border-radius: 0; transform: scale(1); } 50% { border-radius: 50%; transform: scale(0.6); } 100% { border-radius: 0; transform: scale(1); } }
@keyframes t-reveal { 0% { clip-path: inset(0 0 100% 0); } 100% { clip-path: inset(0 0 0 0); } }
@keyframes t-cut { 0% { opacity: 1; } 49% { opacity: 1; } 50% { opacity: 0; } 51% { opacity: 1; } 100% { opacity: 1; } }
@keyframes t-uncover { 0% { transform: translateY(0); } 50% { transform: translateY(-100%); } 51% { transform: translateY(100%); } 100% { transform: translateY(0); } }
@keyframes t-random { 0% { opacity: 1; transform: scale(1) rotate(0deg); } 25% { opacity: 0; transform: scale(0.5) rotate(90deg); } 50% { opacity: 0; transform: scale(1.2) rotate(180deg); } 75% { opacity: 1; transform: scale(0.8) rotate(270deg); } 100% { opacity: 1; transform: scale(1) rotate(360deg); } }
@keyframes t-none { 0%, 100% { opacity: 1; } }
`;

const TRANSITION_ANIMATION_MAP: Record<SlideTransitionType, string> = {
  none: 't-none',
  fade: 't-fade',
  slide: 't-slide',
  zoom: 't-zoom',
  wipe: 't-wipe',
  split: 't-split',
  push: 't-push',
  cover: 't-cover',
  dissolve: 't-dissolve',
  morph: 't-morph',
  reveal: 't-reveal',
  cut: 't-cut',
  uncover: 't-uncover',
  random: 't-random',
};

/* ─── Mini preview square component ─── */

function TransitionPreview({
  type,
  isActive,
  playing,
  easing,
}: {
  type: SlideTransitionType;
  isActive: boolean;
  playing: boolean;
  easing: string;
}) {
  const animName = TRANSITION_ANIMATION_MAP[type];
  return (
    <div
      className="w-full aspect-[4/3] rounded-sm relative overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Two-tone background to show the effect */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 60%, transparent) 100%)'
            : 'linear-gradient(135deg, color-mix(in srgb, var(--foreground) 30%, transparent) 0%, color-mix(in srgb, var(--foreground) 10%, transparent) 100%)',
        }}
      />
      {/* Animated mini square */}
      <div
        className="absolute"
        style={{
          top: '20%',
          left: '20%',
          width: '60%',
          height: '60%',
          background: isActive ? 'var(--primary)' : 'color-mix(in srgb, var(--foreground) 50%, transparent)',
          borderRadius: 2,
          animation: playing
            ? `${animName} 1.2s ${easing} infinite`
            : 'none',
        }}
      />
      {type === 'none' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'var(--foreground)', opacity: 0.4 }}
        >
          <X size={16} />
        </div>
      )}
    </div>
  );
}

/* ─── Section Header ─── */

function SectionHeader({
  title,
  icon,
  expanded,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full text-xs font-semibold py-1.5 opacity-80 hover:opacity-100 transition-opacity"
      style={{ color: 'var(--foreground)' }}
    >
      {icon}
      {title}
      <ChevronDown
        size={12}
        className="ml-auto transition-transform"
        style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
      />
    </button>
  );
}

/* ─── Main Component ─── */

export default function TransitionPanel() {
  const {
    slides,
    activeSlideIndex,
    showTransitionPanel,
    setShowTransitionPanel,
    updateSlideTransition,
    updateSlideTransitionDuration,
    updateSlideTransitionTiming,
    updateSlideTransitionSound,
    applyTransitionToAll,
  } = usePresentationStore();

  const [previewKey, setPreviewKey] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [hoveredType, setHoveredType] = useState<SlideTransitionType | null>(null);
  const [easing, setEasing] = useState('ease');
  const [expandedSections, setExpandedSections] = useState({
    transitions: true,
    duration: true,
    timing: true,
    effects: false,
    sound: false,
  });

  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  if (!showTransitionPanel) return null;

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  const currentTransition: SlideTransitionType = slide.transition ?? 'none';
  const currentDuration = slide.transitionDuration ?? 0.5;
  const currentTiming: SlideTransitionTiming = slide.transitionTiming ?? {
    autoAdvance: false,
    autoAdvanceSeconds: 5,
    onClickAdvance: true,
    loop: false,
  };
  const currentSound: TransitionSound = slide.transitionSound ?? 'none';

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectTransition = (type: SlideTransitionType) => {
    updateSlideTransition(activeSlideIndex, type);
  };

  const handleDurationChange = (value: number) => {
    updateSlideTransitionDuration(activeSlideIndex, value);
  };

  const handleTimingChange = (updates: Partial<SlideTransitionTiming>) => {
    updateSlideTransitionTiming(activeSlideIndex, updates);
  };

  const handleSoundChange = (sound: TransitionSound) => {
    updateSlideTransitionSound(activeSlideIndex, sound);
  };

  const handleApplyToAll = () => {
    applyTransitionToAll(currentTransition, currentDuration);
  };

  const handlePreview = useCallback(() => {
    setIsPreviewPlaying(true);
    setPreviewKey((k) => k + 1);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setIsPreviewPlaying(false);
    }, Math.max(currentDuration * 1000 + 200, 1400));
  }, [currentDuration]);

  const handlePlaySound = () => {
    // In a production app this would play the actual audio file.
    // For now we trigger a small visual feedback.
  };

  return (
    <div
      className="h-full border-l flex flex-col"
      style={{
        width: 300,
        minWidth: 300,
        borderColor: 'var(--border)',
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Keyframes */}
      <style>{TRANSITION_KEYFRAMES}</style>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          <Zap size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold">Slide Transitions</span>
        </div>
        <button
          onClick={() => setShowTransitionPanel(false)}
          className="p-1 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--sidebar-foreground)' }}
          title="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 flex flex-col gap-3">
          {/* ── Transition Types Grid ── */}
          <div>
            <SectionHeader
              title="Transition Type"
              icon={<Layers size={12} />}
              expanded={expandedSections.transitions}
              onToggle={() => toggleSection('transitions')}
            />
            {expandedSections.transitions && (
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {TRANSITION_TYPES.map((t) => {
                  const isActive = currentTransition === t.value;
                  const isHovered = hoveredType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => handleSelectTransition(t.value)}
                      onMouseEnter={() => setHoveredType(t.value)}
                      onMouseLeave={() => setHoveredType(null)}
                      className="flex flex-col items-center gap-1 p-1 rounded transition-all"
                      style={{
                        background: isActive
                          ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                          : 'transparent',
                        border: isActive
                          ? '1.5px solid var(--primary)'
                          : '1.5px solid transparent',
                        outline: 'none',
                      }}
                      title={t.label}
                    >
                      <TransitionPreview
                        type={t.value}
                        isActive={isActive}
                        playing={isHovered || (isActive && isPreviewPlaying)}
                        easing={easing}
                      />
                      <span
                        className="text-[10px] leading-tight truncate w-full text-center"
                        style={{
                          color: isActive ? 'var(--primary)' : 'var(--foreground)',
                          fontWeight: isActive ? 600 : 400,
                          opacity: isActive ? 1 : 0.7,
                        }}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Duration ── */}
          <div>
            <SectionHeader
              title="Duration"
              icon={<Timer size={12} />}
              expanded={expandedSections.duration}
              onToggle={() => toggleSection('duration')}
            />
            {expandedSections.duration && (
              <div className="mt-1.5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={currentDuration}
                    onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: 'var(--primary)',
                      background: 'var(--border)',
                    }}
                  />
                  <span
                    className="text-xs font-mono tabular-nums w-10 text-right shrink-0"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {currentDuration.toFixed(1)}s
                  </span>
                </div>
                <div
                  className="flex justify-between text-[10px] opacity-50 -mt-1 px-0.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span>0.1s</span>
                  <span>5.0s</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Effect Options (Easing) ── */}
          <div>
            <SectionHeader
              title="Effect Options"
              icon={<Zap size={12} />}
              expanded={expandedSections.effects}
              onToggle={() => toggleSection('effects')}
            />
            {expandedSections.effects && (
              <div className="mt-1.5 flex flex-col gap-1.5">
                <label
                  className="text-[11px] opacity-60"
                  style={{ color: 'var(--foreground)' }}
                >
                  Easing
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {EASING_OPTIONS.map((opt) => {
                    const isSelected = easing === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setEasing(opt.value)}
                        className="px-2 py-1.5 rounded text-[11px] transition-all border"
                        style={{
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                          background: isSelected
                            ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                            : 'var(--card)',
                          color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Timing Controls ── */}
          <div>
            <SectionHeader
              title="Timing"
              icon={<Timer size={12} />}
              expanded={expandedSections.timing}
              onToggle={() => toggleSection('timing')}
            />
            {expandedSections.timing && (
              <div className="mt-1.5 flex flex-col gap-2.5">
                {/* Click to advance */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className="relative w-8 h-[18px] rounded-full transition-colors shrink-0"
                    style={{
                      background: currentTiming.onClickAdvance
                        ? 'var(--primary)'
                        : 'var(--border)',
                    }}
                  >
                    <div
                      className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm"
                      style={{
                        left: currentTiming.onClickAdvance ? 14 : 2,
                      }}
                    />
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={currentTiming.onClickAdvance}
                      onChange={(e) =>
                        handleTimingChange({ onClickAdvance: e.target.checked })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointerClick size={12} style={{ color: 'var(--foreground)', opacity: 0.6 }} />
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                      Click to advance
                    </span>
                  </div>
                </label>

                {/* Auto-advance */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className="relative w-8 h-[18px] rounded-full transition-colors shrink-0"
                    style={{
                      background: currentTiming.autoAdvance
                        ? 'var(--primary)'
                        : 'var(--border)',
                    }}
                  >
                    <div
                      className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm"
                      style={{
                        left: currentTiming.autoAdvance ? 14 : 2,
                      }}
                    />
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={currentTiming.autoAdvance}
                      onChange={(e) =>
                        handleTimingChange({ autoAdvance: e.target.checked })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer size={12} style={{ color: 'var(--foreground)', opacity: 0.6 }} />
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                      Auto-advance
                    </span>
                  </div>
                </label>

                {/* Auto-advance seconds */}
                {currentTiming.autoAdvance && (
                  <div
                    className="ml-10 flex items-center gap-2 pl-1 border-l-2"
                    style={{ borderColor: 'var(--primary)' }}
                  >
                    <span
                      className="text-[11px] opacity-60"
                      style={{ color: 'var(--foreground)' }}
                    >
                      After
                    </span>
                    <input
                      type="number"
                      min={0.5}
                      max={999}
                      step={0.5}
                      value={currentTiming.autoAdvanceSeconds}
                      onChange={(e) =>
                        handleTimingChange({
                          autoAdvanceSeconds: Math.max(0.5, parseFloat(e.target.value) || 5),
                        })
                      }
                      className="w-14 text-xs text-center rounded px-1 py-0.5 border outline-none"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                      }}
                    />
                    <span
                      className="text-[11px] opacity-60"
                      style={{ color: 'var(--foreground)' }}
                    >
                      seconds
                    </span>
                  </div>
                )}

                {/* Loop */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className="relative w-8 h-[18px] rounded-full transition-colors shrink-0"
                    style={{
                      background: currentTiming.loop
                        ? 'var(--primary)'
                        : 'var(--border)',
                    }}
                  >
                    <div
                      className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm"
                      style={{
                        left: currentTiming.loop ? 14 : 2,
                      }}
                    />
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={currentTiming.loop}
                      onChange={(e) =>
                        handleTimingChange({ loop: e.target.checked })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat size={12} style={{ color: 'var(--foreground)', opacity: 0.6 }} />
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                      Loop presentation
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* ── Sound ── */}
          <div>
            <SectionHeader
              title="Sound"
              icon={<Volume2 size={12} />}
              expanded={expandedSections.sound}
              onToggle={() => toggleSection('sound')}
            />
            {expandedSections.sound && (
              <div className="mt-1.5 flex flex-col gap-1.5">
                {SOUND_OPTIONS.map((s) => {
                  const isSelected = currentSound === s.value;
                  return (
                    <div key={s.value} className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSoundChange(s.value)}
                        className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all border"
                        style={{
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                          background: isSelected
                            ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                            : 'var(--card)',
                          color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {isSelected ? (
                          <Check size={12} />
                        ) : s.value === 'none' ? (
                          <VolumeX size={12} style={{ opacity: 0.5 }} />
                        ) : (
                          <Volume2 size={12} style={{ opacity: 0.5 }} />
                        )}
                        {s.label}
                      </button>
                      {s.value !== 'none' && (
                        <button
                          onClick={handlePlaySound}
                          className="p-1.5 rounded transition-all hover:opacity-80"
                          style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                          }}
                          title={`Preview ${s.label} sound`}
                        >
                          <Play size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div
        className="shrink-0 border-t p-3 flex flex-col gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Preview */}
        <button
          onClick={handlePreview}
          disabled={currentTransition === 'none'}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all border"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--card)',
            color: currentTransition === 'none' ? 'color-mix(in srgb, var(--foreground) 40%, transparent)' : 'var(--foreground)',
            cursor: currentTransition === 'none' ? 'not-allowed' : 'pointer',
            opacity: currentTransition === 'none' ? 0.5 : 1,
          }}
        >
          <Play size={12} />
          {isPreviewPlaying ? 'Playing...' : 'Preview Transition'}
        </button>

        {/* Preview mini animation area */}
        {isPreviewPlaying && currentTransition !== 'none' && (
          <div
            key={previewKey}
            className="w-full h-16 rounded overflow-hidden relative"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="absolute inset-1 rounded-sm"
              style={{
                background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 50%, var(--card)))',
                animation: `${TRANSITION_ANIMATION_MAP[currentTransition]} ${currentDuration}s ${easing} 1 forwards`,
              }}
            >
              <div
                className="flex items-center justify-center h-full text-[10px] font-medium"
                style={{ color: 'white' }}
              >
                {currentTransition.charAt(0).toUpperCase() + currentTransition.slice(1)}
              </div>
            </div>
          </div>
        )}

        {/* Apply buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSelectTransition(currentTransition)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
          >
            <Check size={12} />
            Apply to Slide
          </button>
          <button
            onClick={handleApplyToAll}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all border"
            style={{
              borderColor: 'var(--primary)',
              background: 'transparent',
              color: 'var(--primary)',
            }}
          >
            <Layers size={12} />
            Apply to All
          </button>
        </div>

        {/* Current slide info */}
        <div
          className="text-center text-[10px] opacity-50"
          style={{ color: 'var(--foreground)' }}
        >
          Slide {activeSlideIndex + 1} of {slides.length}
          {currentTransition !== 'none' && (
            <span>
              {' '}&middot; {currentTransition} ({currentDuration.toFixed(1)}s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
