'use client';
import React, { useState } from 'react';
import { useCADStore, Dimension, MeasureTool } from '@/store/cad-store';

let _dimCounter = 0;
const genDimId = () => `dim_${++_dimCounter}_${Date.now()}`;

const UNIT_FACTORS: Record<string, number> = {
  px: 1, mm: 0.2646, cm: 0.02646, in: 0.01042, pt: 0.75,
};

export function formatDimensionValue(valuePx: number, unit: string, precision: number): string {
  const factor = UNIT_FACTORS[unit] ?? 1;
  return (valuePx * factor).toFixed(precision) + ' ' + unit;
}

/** SVG overlay for rendering dimensions on the canvas */
export function DimensionOverlay({ dimensions, zoom }: { dimensions: Dimension[]; zoom: number }) {
  return (
    <g className="cad-dimensions">
      {dimensions.filter(d => d.visible).map(dim => {
        const { start, end, offset, color, fontSize, type } = dim;
        const display = dim.label || formatDimensionValue(dim.value, dim.unit, dim.precision);

        if (type === 'linear') {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 1) return null;
          // Perpendicular offset
          const nx = -dy / len * offset;
          const ny = dx / len * offset;
          const s = { x: start.x + nx, y: start.y + ny };
          const e = { x: end.x + nx, y: end.y + ny };
          const mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;

          return (
            <g key={dim.id}>
              {/* Extension lines */}
              <line x1={start.x} y1={start.y} x2={s.x} y2={s.y} stroke={color} strokeWidth={0.5 / zoom} strokeDasharray={`${3 / zoom} ${2 / zoom}`} opacity={0.6} />
              <line x1={end.x} y1={end.y} x2={e.x} y2={e.y} stroke={color} strokeWidth={0.5 / zoom} strokeDasharray={`${3 / zoom} ${2 / zoom}`} opacity={0.6} />
              {/* Dimension line */}
              <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke={color} strokeWidth={1 / zoom} />
              {/* Arrows */}
              <circle cx={s.x} cy={s.y} r={3 / zoom} fill={color} />
              <circle cx={e.x} cy={e.y} r={3 / zoom} fill={color} />
              {/* Label */}
              <text
                x={mid.x} y={mid.y - 6 / zoom}
                textAnchor="middle"
                dominantBaseline="auto"
                fill={color}
                fontSize={fontSize / zoom}
                fontFamily="monospace"
                transform={`rotate(${angle > 90 || angle < -90 ? angle + 180 : angle} ${mid.x} ${mid.y - 6 / zoom})`}
              >
                {display}
              </text>
            </g>
          );
        }

        if (type === 'angular') {
          const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
          return (
            <g key={dim.id}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={0.8 / zoom} strokeDasharray={`${4 / zoom} ${2 / zoom}`} />
              <text x={mid.x} y={mid.y - 8 / zoom} textAnchor="middle" fill={color} fontSize={fontSize / zoom} fontFamily="monospace">
                {display}
              </text>
            </g>
          );
        }

        if (type === 'radius' || type === 'diameter') {
          const cx = start.x, cy = start.y;
          const r = dim.value * (UNIT_FACTORS[dim.unit] ?? 1);
          return (
            <g key={dim.id}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={color} strokeWidth={0.8 / zoom} />
              <circle cx={end.x} cy={end.y} r={3 / zoom} fill={color} />
              <text x={(cx + end.x) / 2} y={(cy + end.y) / 2 - 6 / zoom} textAnchor="middle" fill={color} fontSize={fontSize / zoom} fontFamily="monospace">
                {(type === 'radius' ? 'R ' : '⌀ ') + display}
              </text>
            </g>
          );
        }

        return null;
      })}
    </g>
  );
}

/** Ruler measurement overlay */
export function RulerOverlay({ zoom }: { zoom: number }) {
  const { rulerMeasurement, dimensionUnit, dimensionPrecision } = useCADStore();
  if (!rulerMeasurement) return null;
  const { start, end, distance } = rulerMeasurement;
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const display = formatDimensionValue(distance, dimensionUnit, dimensionPrecision);

  return (
    <g className="cad-ruler">
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#00ff88" strokeWidth={1.5 / zoom} strokeDasharray={`${6 / zoom} ${3 / zoom}`} />
      <circle cx={start.x} cy={start.y} r={4 / zoom} fill="#00ff88" />
      <circle cx={end.x} cy={end.y} r={4 / zoom} fill="#00ff88" />
      <rect x={mid.x - 40 / zoom} y={mid.y - 18 / zoom} width={80 / zoom} height={16 / zoom} rx={3 / zoom} fill="#0f172a" stroke="#00ff88" strokeWidth={0.5 / zoom} opacity={0.9} />
      <text x={mid.x} y={mid.y - 7 / zoom} textAnchor="middle" fill="#00ff88" fontSize={10 / zoom} fontFamily="monospace">
        {display}
      </text>
    </g>
  );
}

/** Panel for measurement settings and dimension list */
export function DimensionPanel() {
  const {
    dimensions, removeDimension, updateDimension,
    dimensionUnit, dimensionPrecision, setDimensionUnit, setDimensionPrecision,
    measureTool, setMeasureTool, showDimensions, setShowDimensions,
  } = useCADStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const units: Dimension['unit'][] = ['px', 'mm', 'cm', 'in', 'pt'];
  const tools: { id: MeasureTool; icon: string; label: string }[] = [
    { id: 'none', icon: '▷', label: 'Select' },
    { id: 'linear', icon: '↔', label: 'Linear' },
    { id: 'angular', icon: '∠', label: 'Angular' },
    { id: 'radius', icon: '⊙', label: 'Radius' },
    { id: 'area', icon: '▢', label: 'Area' },
    { id: 'ruler', icon: '📏', label: 'Ruler' },
  ];

  const btn = (active: boolean) =>
    `px-2 py-1 rounded text-[10px] transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8]'}`;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-[#334155] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Measure</span>
          <button onClick={() => setShowDimensions(!showDimensions)} className={btn(showDimensions)}>
            {showDimensions ? '👁 Show' : '— Hide'}
          </button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {tools.map(t => (
            <button key={t.id} onClick={() => setMeasureTool(t.id)} title={t.label} className={btn(measureTool === t.id)}>
              {t.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Unit settings */}
      <div className="px-3 py-2 border-b border-[#334155]">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-[#94a3b8]">Unit:</label>
          <select
            value={dimensionUnit}
            onChange={e => setDimensionUnit(e.target.value as Dimension['unit'])}
            className="flex-1 px-1 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[10px] text-[#e2e8f0]"
          >
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <label className="text-[10px] text-[#94a3b8]">Dec:</label>
          <select
            value={dimensionPrecision}
            onChange={e => setDimensionPrecision(+e.target.value)}
            className="w-12 px-1 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[10px] text-[#e2e8f0]"
          >
            {[0, 1, 2, 3].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Dimension list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {dimensions.length === 0 && (
          <p className="text-[10px] text-[#94a3b8] text-center py-4">
            No dimensions added yet.<br />Select a measure tool and click on the canvas.
          </p>
        )}
        {dimensions.map(dim => (
          <div key={dim.id} className="rounded bg-[#0f172a] border border-[#334155] overflow-hidden">
            <div
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-[#1e293b]"
              onClick={() => setExpandedId(expandedId === dim.id ? null : dim.id)}
            >
              <span className="text-[10px]" style={{ color: dim.color }}>●</span>
              <span className="flex-1 text-[10px] truncate">
                {dim.type.charAt(0).toUpperCase() + dim.type.slice(1)}: {formatDimensionValue(dim.value, dim.unit, dim.precision)}
              </span>
              <button
                onClick={e => { e.stopPropagation(); updateDimension(dim.id, { visible: !dim.visible }); }}
                className={`text-[10px] ${dim.visible ? 'text-blue-400' : 'text-[#475569]'}`}
              >
                {dim.visible ? '👁' : '—'}
              </button>
              <button
                onClick={e => { e.stopPropagation(); removeDimension(dim.id); }}
                className="text-red-400 text-[10px]"
              >✕</button>
            </div>
            {expandedId === dim.id && (
              <div className="px-2 py-1.5 border-t border-[#334155] space-y-1">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#94a3b8] w-10">Label:</label>
                  <input
                    value={dim.label}
                    onChange={e => updateDimension(dim.id, { label: e.target.value })}
                    placeholder="Auto"
                    className="flex-1 px-1.5 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[10px] text-[#e2e8f0]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#94a3b8] w-10">Color:</label>
                  <input
                    type="color"
                    value={dim.color}
                    onChange={e => updateDimension(dim.id, { color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <label className="text-[10px] text-[#94a3b8] ml-2">Size:</label>
                  <input
                    type="number"
                    value={dim.fontSize}
                    onChange={e => updateDimension(dim.id, { fontSize: +e.target.value })}
                    className="w-12 px-1 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[10px] text-[#e2e8f0]"
                    min={6}
                    max={24}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#94a3b8] w-10">Offset:</label>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={dim.offset}
                    onChange={e => updateDimension(dim.id, { offset: +e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-[#94a3b8] w-8">{dim.offset}px</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Helper to create a dimension from two points */
export function createLinearDimension(
  start: { x: number; y: number },
  end: { x: number; y: number },
  unit: Dimension['unit'],
  precision: number,
  layerId: string,
): Dimension {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return {
    id: genDimId(),
    type: 'linear',
    shapeIds: [],
    start, end,
    offset: 25,
    value: distance,
    unit, precision,
    label: '',
    color: '#f59e0b',
    fontSize: 11,
    layerId,
    visible: true,
  };
}

export function createRadiusDimension(
  center: { x: number; y: number },
  edge: { x: number; y: number },
  unit: Dimension['unit'],
  precision: number,
  layerId: string,
): Dimension {
  const dx = edge.x - center.x;
  const dy = edge.y - center.y;
  const radius = Math.sqrt(dx * dx + dy * dy);
  return {
    id: genDimId(),
    type: 'radius',
    shapeIds: [],
    start: center, end: edge,
    offset: 0,
    value: radius,
    unit, precision,
    label: '',
    color: '#f59e0b',
    fontSize: 11,
    layerId,
    visible: true,
  };
}
