"use client";

import { useMemo } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export function ChartModal() {
  const showChartModal = useSpreadsheetStore((s) => s.showChartModal);
  const chartType = useSpreadsheetStore((s) => s.chartType);
  const closeChartModal = useSpreadsheetStore((s) => s.closeChartModal);
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

  const data = useMemo(() => {
    if (!selectionStart || !selectionEnd) return [];
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);

    const result: Record<string, string | number>[] = [];

    // First column = labels, remaining columns = data series
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
    for (let c = minC + 1; c <= maxC; c++) {
      keys.push(colToLetter(c));
    }
    return keys.length ? keys : ["value"];
  }, [selectionStart, selectionEnd]);

  if (!showChartModal) return null;

  const noData = data.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[700px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold capitalize">{chartType} Chart</h2>
          <button onClick={closeChartModal} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          {noData ? (
            <div className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Select a range of cells first, then open a chart.<br />
              First column = labels, other columns = data series.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {chartType === "bar" ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  {dataKeys.map((key, i) => (
                    <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  {dataKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data.map((d) => ({
                      name: d.name,
                      value: typeof d[dataKeys[0]] === "number" ? d[dataKeys[0]] : 0,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
