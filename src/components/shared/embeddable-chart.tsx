"use client";

import React, { useRef, useCallback, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Image, X, Maximize2, Minimize2 } from "lucide-react";
import { exportChartAsPng, exportChartAsSvg, chartToDataUrl } from "@/components/spreadsheet/chart-export-utils";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export interface EmbeddedChartData {
  chartType: "bar" | "line" | "pie" | "scatter" | "area";
  title: string;
  data: Record<string, string | number>[];
  dataKeys: string[];
  width?: number;
  height?: number;
}

interface EmbeddableChartProps {
  chart: EmbeddedChartData;
  onRemove?: () => void;
  editable?: boolean;
}

export default function EmbeddableChart({ chart, onRemove, editable = false }: EmbeddableChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const { chartType, title, data, dataKeys } = chart;
  const w = chart.width || 480;
  const h = chart.height || 300;

  const handleExportPng = useCallback(() => {
    if (chartRef.current) exportChartAsPng(chartRef.current, `${title || "chart"}.png`);
  }, [title]);

  const handleExportSvg = useCallback(() => {
    if (chartRef.current) exportChartAsSvg(chartRef.current, `${title || "chart"}.svg`);
  }, [title]);

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <YAxis fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <YAxis fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <YAxis fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.3} />
            ))}
          </AreaChart>
        );
      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey={dataKeys[0]} fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <YAxis type="number" dataKey={dataKeys[1] || dataKeys[0]} fontSize={10} tick={{ fill: "var(--foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
            <Scatter data={data} fill="#3b82f6">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie data={data.map(d => ({ name: d.name, value: Number(d[dataKeys[0]] || 0) }))}
              cx="50%" cy="50%" outerRadius="70%" dataKey="value"
              label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div style={{
      display: "inline-block",
      width: expanded ? "100%" : w,
      border: "1px solid var(--border)",
      borderRadius: 8,
      background: "var(--card)",
      overflow: "hidden",
      margin: "8px 0",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", borderBottom: "1px solid var(--border)",
        background: "var(--background)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{title}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setExpanded(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }}>
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          {editable && (
            <>
              <button onClick={handleExportPng} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }} title="Export PNG">
                <Image size={12} />
              </button>
              <button onClick={handleExportSvg} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }} title="Export SVG">
                <Download size={12} />
              </button>
            </>
          )}
          {onRemove && (
            <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2 }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Chart body */}
      <div ref={chartRef} style={{ padding: 8, height: expanded ? 400 : h }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Helper to create chart embed data from spreadsheet chart config */
export function createEmbedData(
  type: "bar" | "line" | "pie" | "scatter" | "area",
  title: string,
  data: Record<string, string | number>[],
  dataKeys: string[],
): EmbeddedChartData {
  return { chartType: type, title, data, dataKeys };
}
