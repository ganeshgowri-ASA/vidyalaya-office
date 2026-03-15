'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap as RechartsTreemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ErrorBar as RechartsErrorBar,
  ComposedChart, FunnelChart, Funnel, LabelList,
} from 'recharts';
import {
  ChartConfig, AdvancedChartType, CHART_THEME_COLORS, DataSeries,
} from './chart-types';

// ===================== UTILITY FUNCTIONS =====================

function computeStats(data: number[]) {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = sorted[Math.floor(n * 0.5)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const min = sorted[0];
  const max = sorted[n - 1];
  const mean = data.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(data.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
  const iqr = q3 - q1;
  const whiskerLow = Math.max(min, q1 - 1.5 * iqr);
  const whiskerHigh = Math.min(max, q3 + 1.5 * iqr);
  return { min, max, q1, median, q3, mean, stdDev, whiskerLow, whiskerHigh, iqr };
}

function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssRes = ys.reduce((a, y, i) => a + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const ssTot = ys.reduce((a, y) => a + (y - sumY / n) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

function movingAverage(data: number[], period: number): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - period + 1);
    const slice = data.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// ===================== TRENDLINE OVERLAY =====================

function TrendlineOverlay({ config }: { config: ChartConfig }) {
  if (!config.trendline || !config.series[0]) return null;
  const { type, period = 3 } = config.trendline;
  const ys = config.series[0].data;
  const xs = ys.map((_, i) => i);

  if (type === 'linear') {
    const { slope, intercept } = linearRegression(xs, ys);
    const trendData = xs.map(x => ({ x, y: slope * x + intercept }));
    return (
      <Line
        data={trendData}
        dataKey="y"
        stroke="#ff0000"
        strokeDasharray="5 5"
        dot={false}
        name="Trend"
        isAnimationActive={false}
      />
    );
  }
  if (type === 'moving-average') {
    const ma = movingAverage(ys, period);
    const trendData = xs.map((x, i) => ({ x, y: ma[i] }));
    return (
      <Line
        data={trendData}
        dataKey="y"
        stroke="#ff6600"
        strokeDasharray="8 4"
        dot={false}
        name="Moving Avg"
        isAnimationActive={false}
      />
    );
  }
  return null;
}

// ===================== CHART RENDERERS =====================

// Helper to get chart data in recharts format
function getRechartsData(config: ChartConfig) {
  return config.labels.map((label, i) => {
    const point: Record<string, string | number> = { name: label };
    config.series.forEach(s => {
      point[s.name] = s.data[i] ?? 0;
    });
    return point;
  });
}

function BasicBarColumnChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = getRechartsData(config);
  const isHorizontal = config.type === 'bar';
  const errorBarValue = config.errorBars?.show ? config.errorBars.value : undefined;

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} opacity={config.showGridlines ? 1 : 0} />
        {isHorizontal ? (
          <>
            <XAxis type="number" stroke={theme.text} label={config.xAxis.label ? { value: config.xAxis.label, position: 'insideBottom', offset: -5 } : undefined} />
            <YAxis dataKey="name" type="category" stroke={theme.text} width={80} label={config.yAxis.label ? { value: config.yAxis.label, angle: -90, position: 'insideLeft' } : undefined} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" stroke={theme.text} label={config.xAxis.label ? { value: config.xAxis.label, position: 'insideBottom', offset: -5 } : undefined} />
            <YAxis stroke={theme.text} label={config.yAxis.label ? { value: config.yAxis.label, angle: -90, position: 'insideLeft' } : undefined}
              yAxisId="left" />
            {config.secondaryYAxis && <YAxis yAxisId="right" orientation="right" stroke={theme.text} label={config.secondaryYAxis.label ? { value: config.secondaryYAxis.label, angle: 90, position: 'insideRight' } : undefined} />}
          </>
        )}
        <Tooltip contentStyle={{ backgroundColor: theme.bg, border: `1px solid ${theme.grid}`, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend verticalAlign={config.legendPosition === 'top' ? 'top' : 'bottom'} />}
        {config.series.map((s, idx) => (
          <Bar key={s.name} dataKey={s.name} fill={s.color || theme.colors[idx % theme.colors.length]}
            yAxisId={isHorizontal ? undefined : (s.yAxisId || 'left')}
            isAnimationActive={config.animate}
            label={config.showDataLabels ? { position: 'top', fill: theme.text, fontSize: 10 } : undefined}
          >
            {errorBarValue !== undefined && (
              <RechartsErrorBar dataKey={s.name} width={4} strokeWidth={1.5} stroke={theme.text}
                direction={isHorizontal ? 'x' : 'y'} />
            )}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartRenderer({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = getRechartsData(config);

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} opacity={config.showGridlines ? 1 : 0} />
        <XAxis dataKey="name" stroke={theme.text} label={config.xAxis.label ? { value: config.xAxis.label, position: 'insideBottom', offset: -5 } : undefined} />
        <YAxis stroke={theme.text} yAxisId="left" label={config.yAxis.label ? { value: config.yAxis.label, angle: -90, position: 'insideLeft' } : undefined} />
        {config.secondaryYAxis && <YAxis yAxisId="right" orientation="right" stroke={theme.text} />}
        <Tooltip contentStyle={{ backgroundColor: theme.bg, border: `1px solid ${theme.grid}`, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend verticalAlign={config.legendPosition === 'top' ? 'top' : 'bottom'} />}
        {config.series.map((s, idx) => (
          <Line key={s.name} type="monotone" dataKey={s.name}
            stroke={s.color || theme.colors[idx % theme.colors.length]}
            yAxisId={s.yAxisId || 'left'}
            dot={{ r: 3 }} activeDot={{ r: 5 }}
            isAnimationActive={config.animate}
            label={config.showDataLabels ? { position: 'top', fill: theme.text, fontSize: 10 } : undefined}
          />
        ))}
        <TrendlineOverlay config={config} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function PieDoughnutChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = config.labels.map((label, i) => ({
    name: label,
    value: config.series[0]?.data[i] ?? 0,
  }));
  const isDoughnut = config.type === 'doughnut';

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
          innerRadius={isDoughnut ? '40%' : 0} outerRadius="70%"
          label={config.showDataLabels ? ({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined}
          isAnimationActive={config.animate}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend verticalAlign={config.legendPosition === 'top' ? 'top' : 'bottom'} />}
      </PieChart>
    </ResponsiveContainer>
  );
}

function AreaChartRenderer({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = getRechartsData(config);

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} opacity={config.showGridlines ? 1 : 0} />
        <XAxis dataKey="name" stroke={theme.text} />
        <YAxis stroke={theme.text} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend />}
        {config.series.map((s, idx) => {
          const color = s.color || theme.colors[idx % theme.colors.length];
          return (
            <Area key={s.name} type="monotone" dataKey={s.name}
              stroke={color} fill={color} fillOpacity={0.3}
              isAnimationActive={config.animate}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ScatterChartRenderer({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  // Scatter uses pairs of data: x from first series, y from second (or same series as y-values)
  const scatterData = config.labels.map((_, i) => ({
    x: config.series[0]?.data[i] ?? i,
    y: config.series[1]?.data[i] ?? config.series[0]?.data[i] ?? 0,
    z: config.series[2]?.data[i] ?? 10, // bubble size
  }));

  const isBubble = config.type === 'bubble';

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} opacity={config.showGridlines ? 1 : 0} />
        <XAxis type="number" dataKey="x" stroke={theme.text} name="X"
          label={config.xAxis.label ? { value: config.xAxis.label, position: 'insideBottom', offset: -5 } : undefined} />
        <YAxis type="number" dataKey="y" stroke={theme.text} name="Y"
          label={config.yAxis.label ? { value: config.yAxis.label, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <Scatter data={scatterData} fill={theme.colors[0]} isAnimationActive={config.animate}>
          {isBubble && scatterData.map((entry, i) => (
            <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function RadarPolarChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = config.labels.map((label, i) => {
    const point: Record<string, string | number> = { subject: label };
    config.series.forEach(s => { point[s.name] = s.data[i] ?? 0; });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <RadarChart data={data}>
        <PolarGrid stroke={theme.grid} />
        <PolarAngleAxis dataKey="subject" stroke={theme.text} />
        <PolarRadiusAxis stroke={theme.text} />
        {config.series.map((s, idx) => (
          <Radar key={s.name} name={s.name} dataKey={s.name}
            stroke={s.color || theme.colors[idx % theme.colors.length]}
            fill={s.color || theme.colors[idx % theme.colors.length]}
            fillOpacity={0.3}
            isAnimationActive={config.animate}
          />
        ))}
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}

function TreemapChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = config.labels.map((label, i) => ({
    name: label,
    size: config.series[0]?.data[i] ?? 0,
    fill: theme.colors[i % theme.colors.length],
  }));

  const CustomTreemapContent = (props: Record<string, unknown>) => {
    const { x, y, width: w, height: h, name, fill } = props as { x: number; y: number; width: number; height: number; name: string; fill: string };
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={fill} stroke={theme.bg} strokeWidth={2} />
        {w > 40 && h > 20 && (
          <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
            fill={theme.text} fontSize={11}>{name}</text>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <RechartsTreemap
        data={data}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke={theme.bg}
        isAnimationActive={config.animate}
        content={<CustomTreemapContent />}
      />
    </ResponsiveContainer>
  );
}

function FunnelChartRenderer({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = config.labels.map((label, i) => ({
    name: label,
    value: config.series[0]?.data[i] ?? 0,
    fill: theme.colors[i % theme.colors.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <FunnelChart>
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <Funnel dataKey="value" data={data} isAnimationActive={config.animate}>
          <LabelList position="right" fill={theme.text} stroke="none" dataKey="name" />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

// ===================== STATISTICAL CHARTS (SVG-based) =====================

function BoxPlotChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const w = config.width;
  const h = config.height;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;

  const allStats = config.series.map(s => computeStats(s.data));
  const globalMin = Math.min(...allStats.map(s => s.whiskerLow));
  const globalMax = Math.max(...allStats.map(s => s.whiskerHigh));
  const range = globalMax - globalMin || 1;
  const scaleY = (v: number) => margin.top + plotH - ((v - globalMin) / range) * plotH;

  const boxWidth = Math.min(60, plotW / config.series.length - 10);

  return (
    <svg width={w} height={h} style={{ background: theme.bg }}>
      {/* Grid */}
      {config.showGridlines && Array.from({ length: 6 }, (_, i) => {
        const y = margin.top + (plotH / 5) * i;
        return <line key={i} x1={margin.left} y1={y} x2={w - margin.right} y2={y} stroke={theme.grid} strokeDasharray="3 3" />;
      })}
      {/* Y Axis */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={h - margin.bottom} stroke={theme.text} />
      {Array.from({ length: 6 }, (_, i) => {
        const val = globalMin + (range / 5) * i;
        const y = scaleY(val);
        return (
          <text key={i} x={margin.left - 8} y={y + 4} textAnchor="end" fill={theme.text} fontSize={10}>
            {val.toFixed(1)}
          </text>
        );
      })}
      {/* Box plots */}
      {allStats.map((stats, idx) => {
        const cx = margin.left + (plotW / (config.series.length + 1)) * (idx + 1);
        const color = theme.colors[idx % theme.colors.length];
        return (
          <g key={idx}>
            {/* Whiskers */}
            <line x1={cx} y1={scaleY(stats.whiskerHigh)} x2={cx} y2={scaleY(stats.q3)} stroke={color} strokeWidth={1.5} />
            <line x1={cx} y1={scaleY(stats.q1)} x2={cx} y2={scaleY(stats.whiskerLow)} stroke={color} strokeWidth={1.5} />
            {/* Caps */}
            <line x1={cx - boxWidth / 4} y1={scaleY(stats.whiskerHigh)} x2={cx + boxWidth / 4} y2={scaleY(stats.whiskerHigh)} stroke={color} strokeWidth={1.5} />
            <line x1={cx - boxWidth / 4} y1={scaleY(stats.whiskerLow)} x2={cx + boxWidth / 4} y2={scaleY(stats.whiskerLow)} stroke={color} strokeWidth={1.5} />
            {/* Box */}
            <rect x={cx - boxWidth / 2} y={scaleY(stats.q3)} width={boxWidth}
              height={scaleY(stats.q1) - scaleY(stats.q3)} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1.5} />
            {/* Median */}
            <line x1={cx - boxWidth / 2} y1={scaleY(stats.median)} x2={cx + boxWidth / 2} y2={scaleY(stats.median)} stroke={color} strokeWidth={2.5} />
            {/* Mean dot */}
            <circle cx={cx} cy={scaleY(stats.mean)} r={3} fill={color} />
            {/* Label */}
            <text x={cx} y={h - margin.bottom + 16} textAnchor="middle" fill={theme.text} fontSize={10}>
              {config.series[idx].name}
            </text>
          </g>
        );
      })}
      {config.yAxis.label && (
        <text x={15} y={h / 2} textAnchor="middle" fill={theme.text} fontSize={12}
          transform={`rotate(-90, 15, ${h / 2})`}>{config.yAxis.label}</text>
      )}
    </svg>
  );
}

function ViolinPlotChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const w = config.width;
  const h = config.height;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotH = h - margin.top - margin.bottom;
  const plotW = w - margin.left - margin.right;

  const allStats = config.series.map(s => computeStats(s.data));
  const globalMin = Math.min(...allStats.map(s => s.min));
  const globalMax = Math.max(...allStats.map(s => s.max));
  const range = globalMax - globalMin || 1;
  const scaleY = (v: number) => margin.top + plotH - ((v - globalMin) / range) * plotH;

  // Simple kernel density estimation
  function kde(data: number[], nPoints: number = 30) {
    const bandwidth = computeStats(data).stdDev * 0.5 || 1;
    const points: { y: number; density: number }[] = [];
    for (let i = 0; i < nPoints; i++) {
      const y = globalMin + (range * i) / (nPoints - 1);
      let density = 0;
      data.forEach(d => {
        const u = (y - d) / bandwidth;
        density += Math.exp(-0.5 * u * u) / (bandwidth * Math.sqrt(2 * Math.PI));
      });
      density /= data.length;
      points.push({ y, density });
    }
    return points;
  }

  const maxDensity = Math.max(...config.series.flatMap(s => kde(s.data).map(p => p.density)));
  const violinHalfWidth = Math.min(40, plotW / (config.series.length * 2));

  return (
    <svg width={w} height={h} style={{ background: theme.bg }}>
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={h - margin.bottom} stroke={theme.text} />
      {config.series.map((s, idx) => {
        const cx = margin.left + (plotW / (config.series.length + 1)) * (idx + 1);
        const color = theme.colors[idx % theme.colors.length];
        const kdePoints = kde(s.data);
        const pathRight = kdePoints.map(p => {
          const x = cx + (p.density / maxDensity) * violinHalfWidth;
          return `${x},${scaleY(p.y)}`;
        }).join(' L');
        const pathLeft = [...kdePoints].reverse().map(p => {
          const x = cx - (p.density / maxDensity) * violinHalfWidth;
          return `${x},${scaleY(p.y)}`;
        }).join(' L');

        const stats = allStats[idx];
        return (
          <g key={idx}>
            <path d={`M ${pathRight} L ${pathLeft} Z`} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1.5} />
            {/* Inner box */}
            <rect x={cx - 4} y={scaleY(stats.q3)} width={8} height={scaleY(stats.q1) - scaleY(stats.q3)}
              fill={color} fillOpacity={0.6} />
            <line x1={cx - 6} y1={scaleY(stats.median)} x2={cx + 6} y2={scaleY(stats.median)}
              stroke="#fff" strokeWidth={2} />
            <text x={cx} y={h - margin.bottom + 16} textAnchor="middle" fill={theme.text} fontSize={10}>
              {s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HistogramChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  if (!config.series[0]) return null;
  const data = config.series[0].data;
  const stats = computeStats(data);
  const nBins = Math.ceil(Math.sqrt(data.length)) || 5;
  const binWidth = (stats.max - stats.min) / nBins || 1;

  const bins = Array.from({ length: nBins }, (_, i) => {
    const low = stats.min + i * binWidth;
    const high = low + binWidth;
    const count = data.filter(v => v >= low && (i === nBins - 1 ? v <= high : v < high)).length;
    return { name: `${low.toFixed(1)}-${high.toFixed(1)}`, count, mid: (low + high) / 2 };
  });

  // Normal curve overlay points
  const normalPoints = Array.from({ length: 50 }, (_, i) => {
    const x = stats.min + ((stats.max - stats.min) * i) / 49;
    const z = (x - stats.mean) / stats.stdDev;
    const density = Math.exp(-0.5 * z * z) / (stats.stdDev * Math.sqrt(2 * Math.PI));
    const scaledY = density * data.length * binWidth;
    return { x: stats.min + ((stats.max - stats.min) * i) / 49, y: scaledY };
  });

  const barData = bins.map((b, i) => ({ ...b, normalY: normalPoints[Math.floor(i * 49 / nBins)]?.y ?? 0 }));

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <ComposedChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} opacity={config.showGridlines ? 1 : 0} />
        <XAxis dataKey="name" stroke={theme.text} angle={-30} textAnchor="end" height={60} fontSize={9} />
        <YAxis stroke={theme.text} label={config.yAxis.label ? { value: config.yAxis.label, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <Bar dataKey="count" fill={theme.colors[0]} fillOpacity={0.7} isAnimationActive={config.animate} name="Frequency" />
        <Line type="monotone" dataKey="normalY" stroke="#e15759" strokeWidth={2} dot={false} name="Normal Curve" isAnimationActive={config.animate} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function QQPlotChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  if (!config.series[0]) return null;
  const data = [...config.series[0].data].sort((a, b) => a - b);
  const n = data.length;
  const stats = computeStats(data);

  // Standard normal quantiles
  const normalQuantile = (p: number) => {
    // Approximation of inverse normal CDF
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    const pLow = 0.02425;
    let q: number, r: number;
    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
        ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    } else if (p <= 1 - pLow) {
      q = p - 0.5;
      r = q * q;
      return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
        (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
        ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    }
  };

  const qqData = data.map((v, i) => {
    const p = (i + 0.5) / n;
    return { theoretical: normalQuantile(p), observed: (v - stats.mean) / (stats.stdDev || 1) };
  });

  const minVal = Math.min(...qqData.map(d => Math.min(d.theoretical, d.observed)));
  const maxVal = Math.max(...qqData.map(d => Math.max(d.theoretical, d.observed)));

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis type="number" dataKey="theoretical" stroke={theme.text} name="Theoretical Quantiles"
          label={{ value: 'Theoretical Quantiles', position: 'insideBottom', offset: -5, fill: theme.text }} />
        <YAxis type="number" dataKey="observed" stroke={theme.text} name="Sample Quantiles"
          label={{ value: 'Sample Quantiles', angle: -90, position: 'insideLeft', fill: theme.text }} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <Scatter data={qqData} fill={theme.colors[0]} isAnimationActive={config.animate} />
        <ReferenceLine segment={[{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]} stroke="#e15759" strokeDasharray="5 5" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ParetoChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  if (!config.series[0]) return null;
  const rawData = config.labels.map((label, i) => ({
    name: label,
    value: config.series[0].data[i] ?? 0,
  }));
  rawData.sort((a, b) => b.value - a.value);
  const total = rawData.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const data = rawData.map(d => {
    cum += d.value;
    return { ...d, cumPercent: total > 0 ? (cum / total) * 100 : 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="name" stroke={theme.text} />
        <YAxis yAxisId="left" stroke={theme.text} />
        <YAxis yAxisId="right" orientation="right" stroke="#e15759" domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <Legend />
        <Bar dataKey="value" fill={theme.colors[0]} yAxisId="left" isAnimationActive={config.animate} name="Value" />
        <Line type="monotone" dataKey="cumPercent" stroke="#e15759" yAxisId="right"
          dot={{ r: 3 }} isAnimationActive={config.animate} name="Cumulative %" />
        <ReferenceLine y={80} yAxisId="right" stroke="#e15759" strokeDasharray="5 5" label="80%" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ControlChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  if (!config.series[0]) return null;
  const data = config.series[0].data;
  const stats = computeStats(data);
  const ucl = stats.mean + 3 * stats.stdDev;
  const lcl = stats.mean - 3 * stats.stdDev;

  const chartData = data.map((v, i) => ({
    name: `${i + 1}`,
    value: v,
  }));

  const chartLabel = config.type === 'control-xbar' ? 'X̄ Chart' :
    config.type === 'control-r' ? 'R Chart' :
    config.type === 'control-s' ? 'S Chart' :
    config.type === 'control-p' ? 'p Chart' :
    config.type === 'control-c' ? 'c Chart' : 'u Chart';

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="name" stroke={theme.text} label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
        <YAxis stroke={theme.text} label={{ value: chartLabel, angle: -90, position: 'insideLeft' }} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <ReferenceLine y={stats.mean} stroke={theme.colors[1]} strokeWidth={2} label={{ value: `CL: ${stats.mean.toFixed(2)}`, fill: theme.text, fontSize: 10 }} />
        <ReferenceLine y={ucl} stroke="#e15759" strokeDasharray="5 5" label={{ value: `UCL: ${ucl.toFixed(2)}`, fill: '#e15759', fontSize: 10 }} />
        <ReferenceLine y={lcl} stroke="#e15759" strokeDasharray="5 5" label={{ value: `LCL: ${lcl.toFixed(2)}`, fill: '#e15759', fontSize: 10 }} />
        <Line type="monotone" dataKey="value" stroke={theme.colors[0]} dot={{ r: 3 }}
          isAnimationActive={config.animate} name="Value" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ErrorBarChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const data = getRechartsData(config);
  const errValue = config.errorBars?.value ?? 5;
  // Add error values
  const dataWithErrors = data.map(d => {
    const result = { ...d };
    config.series.forEach(s => {
      const val = Number(d[s.name]) || 0;
      (result as Record<string, unknown>)[`${s.name}_err`] = [val - errValue, val + errValue];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <BarChart data={dataWithErrors}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="name" stroke={theme.text} />
        <YAxis stroke={theme.text} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend />}
        {config.series.map((s, idx) => (
          <Bar key={s.name} dataKey={s.name} fill={theme.colors[idx % theme.colors.length]}
            isAnimationActive={config.animate}>
            <RechartsErrorBar dataKey={`${s.name}_err`} width={4} strokeWidth={1.5} stroke={theme.text} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===================== SCIENTIFIC CHARTS (SVG-based) =====================

function HeatmapChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const w = config.width;
  const h = config.height;
  const margin = { top: 30, right: 60, bottom: 50, left: 60 };
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;

  const rows = config.series.length;
  const cols = config.labels.length;
  const allVals = config.series.flatMap(s => s.data);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  const cellW = plotW / cols;
  const cellH = plotH / rows;

  function getColor(v: number) {
    const t = (v - minVal) / range;
    // Blue to Red gradient
    const r = Math.round(255 * t);
    const b = Math.round(255 * (1 - t));
    const g = Math.round(100 * (1 - Math.abs(t - 0.5) * 2));
    return `rgb(${r},${g},${b})`;
  }

  return (
    <svg width={w} height={h} style={{ background: theme.bg }}>
      {config.series.map((s, ri) =>
        s.data.map((v, ci) => (
          <g key={`${ri}-${ci}`}>
            <rect x={margin.left + ci * cellW} y={margin.top + ri * cellH}
              width={cellW - 1} height={cellH - 1} fill={getColor(v)} />
            {cellW > 30 && cellH > 20 && (
              <text x={margin.left + ci * cellW + cellW / 2} y={margin.top + ri * cellH + cellH / 2}
                textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={9}>{v.toFixed(1)}</text>
            )}
          </g>
        ))
      )}
      {/* Column labels */}
      {config.labels.map((label, ci) => (
        <text key={ci} x={margin.left + ci * cellW + cellW / 2} y={h - margin.bottom + 16}
          textAnchor="middle" fill={theme.text} fontSize={10}>{label}</text>
      ))}
      {/* Row labels */}
      {config.series.map((s, ri) => (
        <text key={ri} x={margin.left - 8} y={margin.top + ri * cellH + cellH / 2}
          textAnchor="end" dominantBaseline="middle" fill={theme.text} fontSize={10}>{s.name}</text>
      ))}
      {/* Color bar */}
      <defs>
        <linearGradient id="heatGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgb(0,100,255)" />
          <stop offset="50%" stopColor="rgb(128,100,128)" />
          <stop offset="100%" stopColor="rgb(255,100,0)" />
        </linearGradient>
      </defs>
      <rect x={w - margin.right + 10} y={margin.top} width={15} height={plotH} fill="url(#heatGrad)" />
      <text x={w - margin.right + 30} y={margin.top + 4} fill={theme.text} fontSize={9}>{maxVal.toFixed(1)}</text>
      <text x={w - margin.right + 30} y={h - margin.bottom} fill={theme.text} fontSize={9}>{minVal.toFixed(1)}</text>
    </svg>
  );
}

function ContourPlotChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  // Simplified contour as a heatmap with contour lines
  const w = config.width;
  const h = config.height;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;
  const gridSize = 20;
  const cellW = plotW / gridSize;
  const cellH = plotH / gridSize;

  // Generate sample data from series
  const values: number[][] = [];
  for (let i = 0; i < gridSize; i++) {
    values[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const x = (j / gridSize) * 4 - 2;
      const y = (i / gridSize) * 4 - 2;
      // Use series data as coefficients or generate sample
      const a = config.series[0]?.data[0] ?? 1;
      const b = config.series[0]?.data[1] ?? 1;
      values[i][j] = a * Math.exp(-(x * x + y * y) / (b || 1)) * 10;
    }
  }
  const allVals = values.flat();
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  function getColor(v: number) {
    const t = (v - minVal) / range;
    const r = Math.round(t * 200);
    const g = Math.round(50 + t * 100);
    const b = Math.round(200 - t * 150);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <svg width={w} height={h} style={{ background: theme.bg }}>
      {values.map((row, ri) =>
        row.map((v, ci) => (
          <rect key={`${ri}-${ci}`} x={margin.left + ci * cellW} y={margin.top + ri * cellH}
            width={cellW + 0.5} height={cellH + 0.5} fill={getColor(v)} />
        ))
      )}
      {/* Contour lines - simplified */}
      {[0.2, 0.4, 0.6, 0.8].map(level => {
        const threshold = minVal + level * range;
        return (
          <g key={level}>
            {values.map((row, ri) =>
              row.map((v, ci) => {
                if (ci < gridSize - 1 && ((v < threshold && row[ci + 1] >= threshold) || (v >= threshold && row[ci + 1] < threshold))) {
                  return <line key={`h-${ri}-${ci}`}
                    x1={margin.left + (ci + 0.5) * cellW} y1={margin.top + ri * cellH}
                    x2={margin.left + (ci + 0.5) * cellW} y2={margin.top + (ri + 1) * cellH}
                    stroke={theme.text} strokeWidth={0.5} opacity={0.6} />;
                }
                return null;
              })
            )}
          </g>
        );
      })}
      <text x={w / 2} y={h - 10} textAnchor="middle" fill={theme.text} fontSize={11}>
        {config.xAxis.label || 'X'}
      </text>
      <text x={15} y={h / 2} textAnchor="middle" fill={theme.text} fontSize={11}
        transform={`rotate(-90, 15, ${h / 2})`}>{config.yAxis.label || 'Y'}</text>
    </svg>
  );
}

function Surface3DChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  // Pseudo-3D wireframe surface plot
  const w = config.width;
  const h = config.height;
  const gridSize = 15;
  const centerX = w / 2;
  const centerY = h / 2 - 20;

  // Generate surface
  const points: { x: number; y: number; z: number }[][] = [];
  for (let i = 0; i < gridSize; i++) {
    points[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const x = (j / gridSize) * 4 - 2;
      const y = (i / gridSize) * 4 - 2;
      const a = config.series[0]?.data[0] ?? 1;
      const z = a * Math.sin(Math.sqrt(x * x + y * y)) * 5;
      points[i][j] = { x, y, z };
    }
  }

  // Isometric projection
  const scale = 25;
  const project = (x: number, y: number, z: number) => ({
    px: centerX + (x - y) * scale * 0.866,
    py: centerY - z * scale * 0.5 + (x + y) * scale * 0.5,
  });

  const allZ = points.flat().map(p => p.z);
  const minZ = Math.min(...allZ);
  const maxZ = Math.max(...allZ);
  const zRange = maxZ - minZ || 1;

  return (
    <svg width={w} height={h} style={{ background: theme.bg }}>
      {/* Wireframe */}
      {points.map((row, i) =>
        row.map((p, j) => {
          const { px, py } = project(p.x, p.y, p.z);
          const t = (p.z - minZ) / zRange;
          const color = `rgb(${Math.round(50 + t * 200)}, ${Math.round(100 + t * 100)}, ${Math.round(200 - t * 150)})`;
          const elements = [];
          if (j < gridSize - 1) {
            const next = project(row[j + 1].x, row[j + 1].y, row[j + 1].z);
            elements.push(
              <line key={`h-${i}-${j}`} x1={px} y1={py} x2={next.px} y2={next.py}
                stroke={color} strokeWidth={1} opacity={0.7} />
            );
          }
          if (i < gridSize - 1) {
            const next = project(points[i + 1][j].x, points[i + 1][j].y, points[i + 1][j].z);
            elements.push(
              <line key={`v-${i}-${j}`} x1={px} y1={py} x2={next.px} y2={next.py}
                stroke={color} strokeWidth={1} opacity={0.7} />
            );
          }
          return elements;
        })
      )}
      <text x={w / 2} y={h - 10} textAnchor="middle" fill={theme.text} fontSize={11}>
        3D Surface Plot
      </text>
    </svg>
  );
}

function WaterfallChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  if (!config.series[0]) return null;
  const rawData = config.series[0].data;
  let cumulative = 0;
  const data = config.labels.map((label, i) => {
    const val = rawData[i] ?? 0;
    const start = cumulative;
    cumulative += val;
    return {
      name: label,
      value: val,
      start: Math.min(start, cumulative),
      end: Math.max(start, cumulative),
      isPositive: val >= 0,
    };
  });
  // Add total bar
  data.push({ name: 'Total', value: cumulative, start: 0, end: cumulative, isPositive: cumulative >= 0 });

  const chartData = data.map(d => ({
    name: d.name,
    invisible: d.start,
    value: d.end - d.start,
    isPositive: d.isPositive,
    isTotal: d.name === 'Total',
  }));

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="name" stroke={theme.text} />
        <YAxis stroke={theme.text} />
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        <Bar dataKey="invisible" stackId="stack" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="value" stackId="stack" isAnimationActive={config.animate}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.isTotal ? theme.colors[2] : entry.isPositive ? theme.colors[4] : theme.colors[3]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SunburstChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  // Rendered as nested pie charts
  const innerData = config.labels.slice(0, Math.ceil(config.labels.length / 2)).map((label, i) => ({
    name: label,
    value: config.series[0]?.data[i] ?? 0,
  }));
  const outerData = config.labels.map((label, i) => ({
    name: label,
    value: config.series[0]?.data[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <PieChart>
        <Pie data={innerData} dataKey="value" nameKey="name" cx="50%" cy="50%"
          outerRadius="35%" innerRadius="15%" isAnimationActive={config.animate}>
          {innerData.map((_, i) => (
            <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
          ))}
        </Pie>
        <Pie data={outerData} dataKey="value" nameKey="name" cx="50%" cy="50%"
          innerRadius="40%" outerRadius="65%"
          label={config.showDataLabels ? ({ name }: { name: string }) => name : undefined}
          isAnimationActive={config.animate}>
          {outerData.map((_, i) => (
            <Cell key={i} fill={theme.colors[(i + 2) % theme.colors.length]} opacity={0.8} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: theme.bg, color: theme.text }} />
        {config.legendPosition !== 'none' && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ===================== FINANCIAL CHARTS =====================

function CandlestickChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  const w = config.width;
  const h = config.height;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotW = w - margin.left - margin.right;
  const plotH = h - margin.top - margin.bottom;

  // OHLC data from 4 series: open, high, low, close
  const n = config.labels.length;
  const ohlc = config.labels.map((label, i) => ({
    label,
    open: config.series[0]?.data[i] ?? 0,
    high: config.series[1]?.data[i] ?? 0,
    low: config.series[2]?.data[i] ?? 0,
    close: config.series[3]?.data[i] ?? 0,
  }));

  const allVals = ohlc.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;
  const scaleY = (v: number) => margin.top + plotH - ((v - minVal) / range) * plotH;

  const candleW = Math.min(20, plotW / n - 4);
  const isOhlc = config.type === 'ohlc';

  return (
    <svg width={w} height={h} style={{ background: theme.bg }}>
      {config.showGridlines && Array.from({ length: 6 }, (_, i) => {
        const y = margin.top + (plotH / 5) * i;
        return <line key={i} x1={margin.left} y1={y} x2={w - margin.right} y2={y} stroke={theme.grid} strokeDasharray="3 3" />;
      })}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={h - margin.bottom} stroke={theme.text} />
      <line x1={margin.left} y1={h - margin.bottom} x2={w - margin.right} y2={h - margin.bottom} stroke={theme.text} />
      {/* Y axis labels */}
      {Array.from({ length: 6 }, (_, i) => {
        const val = minVal + (range / 5) * i;
        return (
          <text key={i} x={margin.left - 8} y={scaleY(val) + 4} textAnchor="end" fill={theme.text} fontSize={10}>
            {val.toFixed(1)}
          </text>
        );
      })}
      {ohlc.map((d, i) => {
        const cx = margin.left + (plotW / (n + 1)) * (i + 1);
        const bullish = d.close >= d.open;
        const color = bullish ? '#26a69a' : '#ef5350';

        if (isOhlc) {
          return (
            <g key={i}>
              <line x1={cx} y1={scaleY(d.high)} x2={cx} y2={scaleY(d.low)} stroke={color} strokeWidth={1.5} />
              <line x1={cx - candleW / 3} y1={scaleY(d.open)} x2={cx} y2={scaleY(d.open)} stroke={color} strokeWidth={2} />
              <line x1={cx} y1={scaleY(d.close)} x2={cx + candleW / 3} y2={scaleY(d.close)} stroke={color} strokeWidth={2} />
              <text x={cx} y={h - margin.bottom + 16} textAnchor="middle" fill={theme.text} fontSize={8}>{d.label}</text>
            </g>
          );
        }
        return (
          <g key={i}>
            <line x1={cx} y1={scaleY(d.high)} x2={cx} y2={scaleY(d.low)} stroke={color} strokeWidth={1} />
            <rect x={cx - candleW / 2} y={scaleY(Math.max(d.open, d.close))}
              width={candleW} height={Math.max(1, Math.abs(scaleY(d.open) - scaleY(d.close)))}
              fill={bullish ? color : color} stroke={color} fillOpacity={bullish ? 0.3 : 1} />
            <text x={cx} y={h - margin.bottom + 16} textAnchor="middle" fill={theme.text} fontSize={8}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SparklineChart({ config, theme }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light }) {
  if (!config.series[0]) return null;
  const data = config.series[0].data;
  const w = config.width;
  const h = Math.min(config.height, 60);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width={w} height={h} style={{ background: 'transparent' }}>
      <path d={pathD} fill="none" stroke={theme.colors[0]} strokeWidth={1.5} />
      <circle cx={points[points.length - 1]?.x} cy={points[points.length - 1]?.y} r={2} fill={theme.colors[0]} />
    </svg>
  );
}

// ===================== ENGINEERING PLACEHOLDERS =====================

function EngineeringPlaceholder({ config, theme, label }: { config: ChartConfig; theme: typeof CHART_THEME_COLORS.light; label: string }) {
  return (
    <svg width={config.width} height={config.height} style={{ background: theme.bg }}>
      <rect x={20} y={20} width={config.width - 40} height={config.height - 40}
        fill="none" stroke={theme.grid} strokeWidth={2} strokeDasharray="8 4" rx={8} />
      <text x={config.width / 2} y={config.height / 2 - 15} textAnchor="middle" fill={theme.text} fontSize={16} fontWeight="bold">
        {label}
      </text>
      <text x={config.width / 2} y={config.height / 2 + 15} textAnchor="middle" fill={theme.text} fontSize={12} opacity={0.6}>
        Specialized chart - requires domain-specific data input
      </text>
      {/* Draw placeholder circle for Smith chart */}
      {config.type === 'smith' && (
        <circle cx={config.width / 2} cy={config.height / 2 + 40} r={60} fill="none" stroke={theme.colors[0]} strokeWidth={1.5} />
      )}
      {/* Draw placeholder axes for Bode plot */}
      {config.type === 'bode' && (
        <g>
          <line x1={80} y1={config.height - 80} x2={config.width - 40} y2={config.height - 80} stroke={theme.colors[0]} />
          <line x1={80} y1={60} x2={80} y2={config.height - 80} stroke={theme.colors[0]} />
          <text x={config.width / 2} y={config.height - 55} textAnchor="middle" fill={theme.text} fontSize={10}>Frequency (Hz)</text>
        </g>
      )}
      {/* Nyquist circle */}
      {config.type === 'nyquist' && (
        <g>
          <circle cx={config.width / 2 - 30} cy={config.height / 2 + 40} r={40} fill="none" stroke={theme.colors[0]} strokeDasharray="4 2" />
          <line x1={60} y1={config.height / 2 + 40} x2={config.width - 40} y2={config.height / 2 + 40} stroke={theme.grid} />
        </g>
      )}
    </svg>
  );
}

// ===================== MAIN CHART RENDERER =====================

interface AdvancedChartProps {
  config: ChartConfig;
  className?: string;
  onExport?: (format: 'png' | 'svg') => void;
}

export default function AdvancedChart({ config, className }: AdvancedChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const theme = CHART_THEME_COLORS[config.theme];

  const exportChart = useCallback((format: 'png' | 'svg') => {
    const container = chartRef.current;
    if (!container) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title || 'chart'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = config.width * 2;
        canvas.height = config.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${config.title || 'chart'}.png`;
          a.click();
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [config.title, config.width, config.height]);

  const chartContent = useMemo(() => {
    switch (config.type) {
      case 'column':
      case 'bar':
        return <BasicBarColumnChart config={config} theme={theme} />;
      case 'line':
        return <LineChartRenderer config={config} theme={theme} />;
      case 'pie':
      case 'doughnut':
        return <PieDoughnutChart config={config} theme={theme} />;
      case 'area':
        return <AreaChartRenderer config={config} theme={theme} />;
      case 'scatter':
      case 'bubble':
        return <ScatterChartRenderer config={config} theme={theme} />;
      case 'polar':
      case 'radar':
        return <RadarPolarChart config={config} theme={theme} />;
      case 'treemap':
        return <TreemapChart config={config} theme={theme} />;
      case 'funnel':
        return <FunnelChartRenderer config={config} theme={theme} />;
      case 'sunburst':
        return <SunburstChart config={config} theme={theme} />;
      case 'waterfall':
        return <WaterfallChart config={config} theme={theme} />;
      case 'boxplot':
        return <BoxPlotChart config={config} theme={theme} />;
      case 'violin':
        return <ViolinPlotChart config={config} theme={theme} />;
      case 'histogram':
        return <HistogramChart config={config} theme={theme} />;
      case 'qqplot':
        return <QQPlotChart config={config} theme={theme} />;
      case 'pareto':
        return <ParetoChart config={config} theme={theme} />;
      case 'control-xbar':
      case 'control-r':
      case 'control-s':
      case 'control-p':
      case 'control-c':
      case 'control-u':
        return <ControlChart config={config} theme={theme} />;
      case 'errorbar':
        return <ErrorBarChart config={config} theme={theme} />;
      case 'heatmap':
        return <HeatmapChart config={config} theme={theme} />;
      case 'contour':
        return <ContourPlotChart config={config} theme={theme} />;
      case 'surface3d':
        return <Surface3DChart config={config} theme={theme} />;
      case 'candlestick':
      case 'ohlc':
      case 'stock-volume':
        return <CandlestickChart config={config} theme={theme} />;
      case 'sparkline':
        return <SparklineChart config={config} theme={theme} />;
      case 'smith':
        return <EngineeringPlaceholder config={config} theme={theme} label="Smith Chart" />;
      case 'bode':
        return <EngineeringPlaceholder config={config} theme={theme} label="Bode Plot" />;
      case 'nyquist':
        return <EngineeringPlaceholder config={config} theme={theme} label="Nyquist Plot" />;
      default:
        return <BasicBarColumnChart config={config} theme={theme} />;
    }
  }, [config, theme]);

  return (
    <div ref={chartRef} className={className} style={{
      background: theme.bg,
      borderRadius: '8px',
      padding: '16px',
      border: `1px solid ${theme.grid}`,
    }}>
      {/* Chart Title */}
      {config.title && (
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}>{config.title}</div>
          {config.subtitle && <div style={{ color: theme.text, fontSize: 12, opacity: 0.7 }}>{config.subtitle}</div>}
        </div>
      )}
      {/* Chart Content */}
      {chartContent}
      {/* Export buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button onClick={() => exportChart('png')}
          style={{ fontSize: 10, padding: '2px 8px', background: theme.grid, color: theme.text, border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Export PNG
        </button>
        <button onClick={() => exportChart('svg')}
          style={{ fontSize: 10, padding: '2px 8px', background: theme.grid, color: theme.text, border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Export SVG
        </button>
      </div>
    </div>
  );
}

export { computeStats, linearRegression, movingAverage, getRechartsData };
