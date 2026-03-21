'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useGraphicsStore, Shape } from '@/store/graphics-store';
import { applyLayout, LayoutAlgorithm, LayoutDirection } from '@/lib/auto-layout';

const LAYOUTS: { id: LayoutAlgorithm; label: string; icon: string; desc: string }[] = [
  { id: 'tree', label: 'Tree', icon: '🌳', desc: 'Hierarchical tree structure' },
  { id: 'hierarchical', label: 'Org Chart', icon: '🏢', desc: 'Organization chart levels' },
  { id: 'force-directed', label: 'Network', icon: '🕸', desc: 'Force-directed for networks' },
  { id: 'circular', label: 'Circular', icon: '⭕', desc: 'Nodes arranged in a circle' },
  { id: 'radial-tree', label: 'Radial', icon: '☀', desc: 'Root at center, children radiate' },
  { id: 'grid', label: 'Grid', icon: '⊞', desc: 'Simple grid arrangement' },
];

const DIRECTIONS: { id: LayoutDirection; label: string; icon: string }[] = [
  { id: 'top-down', label: 'Top → Down', icon: '↓' },
  { id: 'left-right', label: 'Left → Right', icon: '→' },
  { id: 'bottom-up', label: 'Bottom → Up', icon: '↑' },
  { id: 'right-left', label: 'Right → Left', icon: '←' },
];

export default function AutoLayoutPanel({ onClose }: { onClose: () => void }) {
  const { shapes, pushHistory, canvasWidth, canvasHeight } = useGraphicsStore();
  const [algorithm, setAlgorithm] = useState<LayoutAlgorithm>('tree');
  const [direction, setDirection] = useState<LayoutDirection>('top-down');
  const [hSpacing, setHSpacing] = useState(60);
  const [vSpacing, setVSpacing] = useState(80);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const applyWithAnimation = useCallback(() => {
    if (shapes.length === 0 || isAnimating) return;

    const targetShapes = applyLayout(algorithm, shapes, {
      horizontalSpacing: hSpacing,
      verticalSpacing: vSpacing,
      direction,
      centerOnCanvas: true,
      canvasWidth,
      canvasHeight,
    });

    // Animate from current positions to target positions
    setIsAnimating(true);
    const startPositions = shapes.map(s => ({ x: s.x, y: s.y }));
    const targetPositions = targetShapes.map(s => ({ x: s.x, y: s.y }));
    const duration = 500; // ms
    const startTime = performance.now();

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      const interpolated = shapes.map((s, i) => ({
        ...s,
        x: Math.round(startPositions[i].x + (targetPositions[i].x - startPositions[i].x) * eased),
        y: Math.round(startPositions[i].y + (targetPositions[i].y - startPositions[i].y) * eased),
      } as Shape));

      // Use setShapes for intermediate frames, pushHistory only for final
      useGraphicsStore.getState().setShapes(interpolated);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        pushHistory(targetShapes);
        setIsAnimating(false);
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, [shapes, algorithm, direction, hSpacing, vSpacing, canvasWidth, canvasHeight, pushHistory, isAnimating]);

  const applyInstant = useCallback(() => {
    if (shapes.length === 0) return;
    const result = applyLayout(algorithm, shapes, {
      horizontalSpacing: hSpacing,
      verticalSpacing: vSpacing,
      direction,
      centerOnCanvas: true,
      canvasWidth,
      canvasHeight,
    });
    pushHistory(result);
  }, [shapes, algorithm, direction, hSpacing, vSpacing, canvasWidth, canvasHeight, pushHistory]);

  const showDirection = algorithm === 'tree' || algorithm === 'hierarchical';

  return (
    <div className="w-64 border-l border-[#334155] bg-[#1e293b] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#334155]">
        <p className="text-xs font-semibold text-green-400">📏 Auto-Layout</p>
        <button onClick={onClose} className="text-[#94a3b8] hover:text-white text-sm">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Algorithm Selection */}
        <div>
          <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Algorithm</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => setAlgorithm(l.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded text-[10px] transition-colors ${
                  algorithm === l.id
                    ? 'bg-green-600/30 text-green-300 ring-1 ring-green-500/50'
                    : 'bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8]'
                }`}
                title={l.desc}
              >
                <span className="text-base">{l.icon}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Direction (for tree/hierarchical) */}
        {showDirection && (
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Direction</p>
            <div className="grid grid-cols-4 gap-1">
              {DIRECTIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDirection(d.id)}
                  className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded text-[10px] transition-colors ${
                    direction === d.id
                      ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50'
                      : 'bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8]'
                  }`}
                  title={d.label}
                >
                  <span className="text-sm">{d.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spacing Controls */}
        <div>
          <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Spacing</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-[#94a3b8]">Horizontal</label>
                <span className="text-[10px] text-[#64748b]">{hSpacing}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                value={hSpacing}
                onChange={e => setHSpacing(+e.target.value)}
                className="w-full h-1 rounded-lg appearance-none bg-[#334155] accent-green-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-[#94a3b8]">Vertical</label>
                <span className="text-[10px] text-[#64748b]">{vSpacing}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                value={vSpacing}
                onChange={e => setVSpacing(+e.target.value)}
                className="w-full h-1 rounded-lg appearance-none bg-[#334155] accent-green-500"
              />
            </div>
          </div>
        </div>

        {/* Shape count info */}
        <div className="px-2 py-1.5 rounded bg-[#0f172a] text-[10px] text-[#64748b]">
          {shapes.length} shape{shapes.length !== 1 ? 's' : ''} on canvas
          {shapes.length === 0 && ' — add shapes first'}
        </div>

        {/* Apply Buttons */}
        <div className="space-y-2">
          <button
            onClick={applyWithAnimation}
            disabled={shapes.length === 0 || isAnimating}
            className="w-full px-3 py-2 rounded text-xs font-medium transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnimating ? '⏳ Animating...' : '▶ Apply with Animation'}
          </button>
          <button
            onClick={applyInstant}
            disabled={shapes.length === 0 || isAnimating}
            className="w-full px-3 py-1.5 rounded text-xs transition-colors bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply Instant
          </button>
        </div>

        {/* Quick Layout Presets */}
        <div>
          <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Quick Presets</p>
          <div className="space-y-1">
            {[
              { label: 'Org Chart (Top-Down)', algo: 'hierarchical' as LayoutAlgorithm, dir: 'top-down' as LayoutDirection, h: 80, v: 100 },
              { label: 'Network Diagram', algo: 'force-directed' as LayoutAlgorithm, dir: 'top-down' as LayoutDirection, h: 80, v: 80 },
              { label: 'Flow (Left-Right)', algo: 'tree' as LayoutAlgorithm, dir: 'left-right' as LayoutDirection, h: 80, v: 60 },
              { label: 'Radial Mind Map', algo: 'radial-tree' as LayoutAlgorithm, dir: 'top-down' as LayoutDirection, h: 60, v: 100 },
              { label: 'Circle Layout', algo: 'circular' as LayoutAlgorithm, dir: 'top-down' as LayoutDirection, h: 60, v: 60 },
            ].map(preset => (
              <button
                key={preset.label}
                disabled={shapes.length === 0 || isAnimating}
                onClick={() => {
                  setAlgorithm(preset.algo);
                  setDirection(preset.dir);
                  setHSpacing(preset.h);
                  setVSpacing(preset.v);
                  const result = applyLayout(preset.algo, shapes, {
                    horizontalSpacing: preset.h,
                    verticalSpacing: preset.v,
                    direction: preset.dir,
                    centerOnCanvas: true,
                    canvasWidth,
                    canvasHeight,
                  });
                  pushHistory(result);
                }}
                className="w-full text-left px-2 py-1.5 rounded text-[11px] bg-[#0f172a] hover:bg-[#334155] text-[#e2e8f0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
