'use client';

import React, { useState } from 'react';
import { X, Type, Sparkles } from 'lucide-react';
import {
  usePresentationStore,
  WORDART_STYLES,
  type TextEffect,
} from '@/store/presentation-store';

const SHADOW_PRESET_COLORS = [
  '#000000',
  '#374151',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#f59e0b',
];

const GRADIENT_PRESETS = [
  { id: 'grad-blue', name: 'Ocean', value: 'linear-gradient(to right, #3b82f6, #06b6d4)' },
  { id: 'grad-fire', name: 'Fire', value: 'linear-gradient(to right, #f97316, #ef4444)' },
  { id: 'grad-sunset', name: 'Sunset', value: 'linear-gradient(to right, #f59e0b, #ec4899)' },
  { id: 'grad-forest', name: 'Forest', value: 'linear-gradient(to right, #22c55e, #14b8a6)' },
  { id: 'grad-purple', name: 'Purple', value: 'linear-gradient(to right, #8b5cf6, #ec4899)' },
  { id: 'grad-rainbow', name: 'Rainbow', value: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7)' },
];

const GLOW_PRESET_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
];

export default function TextEffectsPanel() {
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    showTextEffectsPanel,
    setShowTextEffectsPanel,
    updateElementTextEffect,
  } = usePresentationStore();

  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [glowColor, setGlowColor] = useState('#3b82f6');
  const [glowSize, setGlowSize] = useState(10);

  if (!showTextEffectsPanel) return null;

  const slide = slides[activeSlideIndex];
  const selectedElement = slide?.elements.find((el) => el.id === selectedElementId);
  const isTextElement = selectedElement?.type === 'text';
  const currentEffect: TextEffect = selectedElement?.textEffect ?? {};

  const applyEffect = (partial: Partial<TextEffect>) => {
    if (!selectedElement) return;
    const merged: TextEffect = { ...currentEffect, ...partial };
    updateElementTextEffect(activeSlideIndex, selectedElement.id, merged);
  };

  const handleWordArt = (styleId: string) => {
    applyEffect({ wordArt: currentEffect.wordArt === styleId ? undefined : styleId });
  };

  const buildShadowString = (color: string, blur: number, ox: number, oy: number) =>
    `${ox}px ${oy}px ${blur}px ${color}`;

  const handleToggleShadow = (enabled: boolean) => {
    setShadowEnabled(enabled);
    if (enabled) {
      applyEffect({ textShadow: buildShadowString(shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY) });
    } else {
      applyEffect({ textShadow: undefined });
    }
  };

  const handleShadowChange = (color: string, blur: number, ox: number, oy: number) => {
    setShadowColor(color);
    setShadowBlur(blur);
    setShadowOffsetX(ox);
    setShadowOffsetY(oy);
    if (shadowEnabled) {
      applyEffect({ textShadow: buildShadowString(color, blur, ox, oy) });
    }
  };

  const handleToggleReflection = (enabled: boolean) => {
    applyEffect({ textReflection: enabled || undefined });
  };

  const handleRotation = (axis: 'x' | 'y', value: number) => {
    if (axis === 'x') {
      applyEffect({ text3DRotateX: value });
    } else {
      applyEffect({ text3DRotateY: value });
    }
  };

  const handleGradient = (gradient: string) => {
    applyEffect({ gradientFill: currentEffect.gradientFill === gradient ? undefined : gradient });
  };

  const handleToggleGlow = (enabled: boolean) => {
    setGlowEnabled(enabled);
    if (enabled) {
      applyEffect({ glowColor, glowSize });
    } else {
      applyEffect({ glowColor: undefined, glowSize: undefined });
    }
  };

  const handleGlowChange = (color: string, size: number) => {
    setGlowColor(color);
    setGlowSize(size);
    if (glowEnabled) {
      applyEffect({ glowColor: color, glowSize: size });
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
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} />
          <span className="text-sm font-semibold">Text Effects</span>
        </div>
        <button
          onClick={() => setShowTextEffectsPanel(false)}
          className="p-1 rounded hover:opacity-80"
          style={{ color: 'var(--sidebar-foreground)' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!isTextElement ? (
          <p className="text-xs opacity-60 mt-4 text-center">
            Select a text element on the slide to apply text effects.
          </p>
        ) : (
          <>
            {/* ── WordArt Styles ─────────────────────────────── */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-medium mb-2 opacity-80">
                <Type size={12} />
                WordArt Styles
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {WORDART_STYLES.map((wa) => (
                  <button
                    key={wa.id}
                    onClick={() => handleWordArt(wa.id)}
                    className="px-2 py-2 rounded text-[11px] font-bold text-center border transition-all truncate"
                    style={{
                      borderColor:
                        currentEffect.wordArt === wa.id
                          ? 'var(--primary)'
                          : 'var(--border)',
                      background:
                        currentEffect.wordArt === wa.id
                          ? 'var(--accent)'
                          : 'var(--card)',
                      color: 'var(--card-foreground)',
                    }}
                    title={wa.name}
                  >
                    {wa.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Text Shadow ────────────────────────────────── */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-80">Text Shadow</span>
                <button
                  onClick={() => handleToggleShadow(!shadowEnabled)}
                  className="w-8 h-4 rounded-full relative transition-colors"
                  style={{
                    background: shadowEnabled ? 'var(--primary)' : 'var(--muted)',
                  }}
                >
                  <span
                    className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                    style={{
                      left: shadowEnabled ? 16 : 2,
                      background: shadowEnabled
                        ? 'var(--primary-foreground)'
                        : 'var(--muted-foreground)',
                    }}
                  />
                </button>
              </div>
              {shadowEnabled && (
                <div className="space-y-2 pl-1">
                  <div>
                    <label className="text-[10px] opacity-60 block mb-1">Color</label>
                    <div className="flex gap-1.5">
                      {SHADOW_PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            handleShadowChange(c, shadowBlur, shadowOffsetX, shadowOffsetY)
                          }
                          className="w-5 h-5 rounded-full border-2 transition-all"
                          style={{
                            background: c,
                            borderColor:
                              shadowColor === c ? 'var(--primary)' : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] opacity-60 block mb-1">
                      Blur: {shadowBlur}px
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={shadowBlur}
                      onChange={(e) =>
                        handleShadowChange(
                          shadowColor,
                          parseInt(e.target.value),
                          shadowOffsetX,
                          shadowOffsetY,
                        )
                      }
                      className="w-full h-1.5 rounded appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] opacity-60 block mb-1">
                      Offset X: {shadowOffsetX}px
                    </label>
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      step={1}
                      value={shadowOffsetX}
                      onChange={(e) =>
                        handleShadowChange(
                          shadowColor,
                          shadowBlur,
                          parseInt(e.target.value),
                          shadowOffsetY,
                        )
                      }
                      className="w-full h-1.5 rounded appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] opacity-60 block mb-1">
                      Offset Y: {shadowOffsetY}px
                    </label>
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      step={1}
                      value={shadowOffsetY}
                      onChange={(e) =>
                        handleShadowChange(
                          shadowColor,
                          shadowBlur,
                          shadowOffsetX,
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full h-1.5 rounded appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Text Reflection ─────────────────────────────── */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-80">Text Reflection</span>
                <button
                  onClick={() => handleToggleReflection(!currentEffect.textReflection)}
                  className="w-8 h-4 rounded-full relative transition-colors"
                  style={{
                    background: currentEffect.textReflection
                      ? 'var(--primary)'
                      : 'var(--muted)',
                  }}
                >
                  <span
                    className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                    style={{
                      left: currentEffect.textReflection ? 16 : 2,
                      background: currentEffect.textReflection
                        ? 'var(--primary-foreground)'
                        : 'var(--muted-foreground)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* ── 3D Rotation ─────────────────────────────────── */}
            <div className="mb-4">
              <span className="text-xs font-medium opacity-80 block mb-2">3D Rotation</span>
              <div className="space-y-2 pl-1">
                <div>
                  <label className="text-[10px] opacity-60 block mb-1">
                    Rotate X: {currentEffect.text3DRotateX ?? 0}&deg;
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={currentEffect.text3DRotateX ?? 0}
                    onChange={(e) => handleRotation('x', parseInt(e.target.value))}
                    className="w-full h-1.5 rounded appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] opacity-60 block mb-1">
                    Rotate Y: {currentEffect.text3DRotateY ?? 0}&deg;
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={currentEffect.text3DRotateY ?? 0}
                    onChange={(e) => handleRotation('y', parseInt(e.target.value))}
                    className="w-full h-1.5 rounded appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* ── Gradient Fill ────────────────────────────────── */}
            <div className="mb-4">
              <span className="text-xs font-medium opacity-80 block mb-2">Gradient Fill</span>
              <div className="grid grid-cols-3 gap-1.5">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGradient(g.value)}
                    className="rounded border transition-all flex flex-col items-center gap-0.5 p-1"
                    style={{
                      borderColor:
                        currentEffect.gradientFill === g.value
                          ? 'var(--primary)'
                          : 'var(--border)',
                    }}
                    title={g.name}
                  >
                    <div
                      className="w-full h-5 rounded-sm"
                      style={{ background: g.value }}
                    />
                    <span className="text-[9px] opacity-60 truncate w-full text-center">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Glow Effect ─────────────────────────────────── */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-80">Glow Effect</span>
                <button
                  onClick={() => handleToggleGlow(!glowEnabled)}
                  className="w-8 h-4 rounded-full relative transition-colors"
                  style={{
                    background: glowEnabled ? 'var(--primary)' : 'var(--muted)',
                  }}
                >
                  <span
                    className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                    style={{
                      left: glowEnabled ? 16 : 2,
                      background: glowEnabled
                        ? 'var(--primary-foreground)'
                        : 'var(--muted-foreground)',
                    }}
                  />
                </button>
              </div>
              {glowEnabled && (
                <div className="space-y-2 pl-1">
                  <div>
                    <label className="text-[10px] opacity-60 block mb-1">Color</label>
                    <div className="flex gap-1.5">
                      {GLOW_PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleGlowChange(c, glowSize)}
                          className="w-5 h-5 rounded-full border-2 transition-all"
                          style={{
                            background: c,
                            borderColor:
                              glowColor === c ? 'var(--primary)' : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] opacity-60 block mb-1">
                      Size: {glowSize}px
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      step={1}
                      value={glowSize}
                      onChange={(e) => handleGlowChange(glowColor, parseInt(e.target.value))}
                      className="w-full h-1.5 rounded appearance-none cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
