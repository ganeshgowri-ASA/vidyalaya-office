"use client";

import { useMemo, useState } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { X, Move, GripVertical } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area,
} from "recharts";

const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

const CHART_TYPE_LABELS: Record<string, string> = {
  bar: "Column Chart",
  line: "Line Chart",
  pie: "Pie Chart",
  scatter: "Scatter Chart",
  area: "Area Chart",
  doughnut: "Doughnut Chart",
};

export function ChartModal() {
  const showChartModal = useSpreadsheetStore((s) => s.showChartModal);
  const chartType = useSpreadsheetStore((s) => s.chartType);
  const closeChartModal = useSpreadsheetStore((s) => s.closeChartModal);
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

  const [chartTitle, setChartTitle] = useState("Chart");
  const [showLegend, setShowLegend] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);

  const data = useMemo(() => {
    if (!selectionStart || !selectionEnd) return [];
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);

    const result: Record<string, string | number>[] = [];
    for (let r = minR; r <= maxR; r++) {
      const entry: Record<string, string | number> = {};
      entry.name = getCellDisplay(minC, r) || `Row ${r + 1}`;
      for (let c = minC + 1; c <= maxC; c++) {
        const val = getCellDisplay(c, r);
        const num = parseFloat(val.replace(/[$,%]/g, ""));
        entry[colToLetter(c)] = isNaN(num) ? 0 : num;
      }
      result.push(entry);
    }
    return result;
  }, [selectionStart, selectionEnd, getCellDisplay]);

  const dataKeys = useMemo(() => {
    if (!selectionStart || !selectionEnd) return [];
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);
    const keys: string[] = [];
    for (let c = minC + 1; c <= maxC; c++) keys.push(colToLetter(c));
    return keys.length ? keys : ["value"];
  }, [selectionStart, selectionEnd]);

  if (!showChartModal) return null;

  const noData = data.length === 0;

  const renderChart = () => {
    if (noData) {
      return (
        <div className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Select a range of cells first, then open a chart.<br />
          First column = labels, other columns = data series.
        </div>
      );
    }

    const commonProps = { data };

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]}
                  label={showDataLabels ? { position: "top", fontSize: 10 } : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2}
                  dot={{ r: 4 }}
                  label={showDataLabels ? { position: "top", fontSize: 10 } : undefined} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.3} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, i) => (
                <Scatter key={key} name={key} data={data.map((d) => ({
                  name: d.name, [key]: d[key],
                }))} fill={CHART_COLORS[i % CHART_COLORS.length]} dataKey={key} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data.map((d) => ({
                  name: d.name,
                  value: typeof d[dataKeys[0]] === "number" ? d[dataKeys[0]] : 0,
                }))}
                cx="50%" cy="50%" outerRadius={120} dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      case "doughnut":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data.map((d) => ({
                  name: d.name,
                  value: typeof d[dataKeys[0]] === "number" ? d[dataKeys[0]] : 0,
                }))}
                cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[750px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">{CHART_TYPE_LABELS[chartType] || "Chart"}</h2>
          <button onClick={closeChartModal} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Chart settings */}
        <div className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{ borderColor: "var(--border)" }}>
          <label className="flex items-center gap-1">
            Title:
            <input
              className="border rounded px-1 py-0.5 text-xs w-32"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={showLegend} onChange={() => setShowLegend(!showLegend)} className="w-3 h-3" />
            Legend
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={showDataLabels} onChange={() => setShowDataLabels(!showDataLabels)} className="w-3 h-3" />
            Data Labels
          </label>
        </div>

        {/* Chart */}
        <div className="p-4 flex-1 overflow-auto">
          {chartTitle && (
            <div className="text-center text-sm font-semibold mb-2">{chartTitle}</div>
          )}
          {renderChart()}
        </div>
      </div>
    </div>
  );
}
