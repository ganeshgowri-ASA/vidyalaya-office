"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useSpreadsheetStore, type EmbeddedChart } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area,
} from "recharts";
import { X, Maximize2, Minimize2, Download, GripVertical, Trash2 } from "lucide-react";

const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

interface EmbeddedChartProps {
  chart: EmbeddedChart;
}

export function EmbeddedChartComponent({ chart }: EmbeddedChartProps) {
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const updateEmbeddedChart = useSpreadsheetStore((s) => s.updateEmbeddedChart);
  const removeEmbeddedChart = useSpreadsheetStore((s) => s.removeEmbeddedChart);
  const selectedChartId = useSpreadsheetStore((s) => s.selectedChartId);
  const setSelectedChart = useSpreadsheetStore((s) => s.setSelectedChart);

  const isSelected = selectedChartId === chart.id;
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, chartX: 0, chartY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Build chart data from spreadsheet cells (reactive - updates when cells change)
  const { data, dataKeys } = useMemo(() => {
    if (!chart.dataRange) return { data: [], dataKeys: [] };
    const { startCol, startRow, endCol, endRow } = chart.dataRange;
    const headerRow = startRow;
    const keys: string[] = [];
    for (let c = startCol + 1; c <= endCol; c++) {
      keys.push(getCellDisplay(c, headerRow) || colToLetter(c));
    }
    const result: Record<string, string | number>[] = [];
    for (let r = startRow + 1; r <= endRow; r++) {
      const entry: Record<string, string | number> = {};
      entry.name = getCellDisplay(startCol, r) || `Row ${r + 1}`;
      for (let c = startCol + 1; c <= endCol; c++) {
        const header = getCellDisplay(c, headerRow) || colToLetter(c);
        const val = getCellDisplay(c, r);
        const num = parseFloat(val.replace(/[$,%]/g, ""));
        entry[header] = isNaN(num) ? 0 : num;
      }
      result.push(entry);
    }
    return { data: result, dataKeys: keys.length ? keys : ["value"] };
  }, [chart.dataRange, getCellDisplay]);

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, chartX: chart.x, chartY: chart.y };
  }, [chart.x, chart.y]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      updateEmbeddedChart(chart.id, {
        x: Math.max(0, dragStart.current.chartX + dx),
        y: Math.max(0, dragStart.current.chartY + dy),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging, chart.id, updateEmbeddedChart]);

  // Resize handlers
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: chart.width, h: chart.height };
  }, [chart.width, chart.height]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      updateEmbeddedChart(chart.id, {
        width: Math.max(200, resizeStart.current.w + dx),
        height: Math.max(150, resizeStart.current.h + dy),
      });
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isResizing, chart.id, updateEmbeddedChart]);

  // Export as PNG
  const exportAsPng = useCallback(() => {
    const el = chartRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = chart.width * 2;
    canvas.height = chart.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#1e1e2e";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.drawImage(img, 0, 0, chart.width, chart.height);
      const a = document.createElement("a");
      a.download = `${chart.title || "chart"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [chart.width, chart.height, chart.title]);

  // Export as SVG
  const exportAsSvg = useCallback(() => {
    const el = chartRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = `${chart.title || "chart"}.svg`;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }, [chart.title]);

  const colors = chart.colors.length > 0 ? chart.colors : CHART_COLORS;

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-xs" style={{ color: "var(--muted-foreground)" }}>
          No data. Select a data range.
        </div>
      );
    }

    const chartHeight = chart.height - 60;

    switch (chart.chartType) {
      case "bar":
      case "column":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
              <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.x ? { value: chart.axisLabels.x, position: "insideBottom", offset: -5, fontSize: 10 } : undefined} />
              <YAxis fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.y ? { value: chart.axisLabels.y, angle: -90, position: "insideLeft", fontSize: 10 } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
              {chart.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]}
                  label={chart.showDataLabels ? { position: "top", fontSize: 9, fill: "var(--foreground)" } : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data}>
              {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
              <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.x ? { value: chart.axisLabels.x, position: "insideBottom", offset: -5, fontSize: 10 } : undefined} />
              <YAxis fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.y ? { value: chart.axisLabels.y, angle: -90, position: "insideLeft", fontSize: 10 } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
              {chart.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
              {dataKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]}
                  strokeWidth={2} dot={{ r: 3 }}
                  label={chart.showDataLabels ? { position: "top", fontSize: 9, fill: "var(--foreground)" } : undefined} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data.map((d) => ({
                  name: d.name,
                  value: typeof d[dataKeys[0]] === "number" ? d[dataKeys[0]] : 0,
                }))}
                cx="50%" cy="50%" outerRadius={Math.min(chartHeight, chart.width) * 0.32} dataKey="value"
                label={chart.showDataLabels ? ({ name, percent }: { name: string; percent: number }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%` : undefined}
                labelLine={chart.showDataLabels}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
              {chart.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
            </PieChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart>
              {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
              <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.x ? { value: chart.axisLabels.x, position: "insideBottom", offset: -5, fontSize: 10 } : undefined} />
              <YAxis fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.y ? { value: chart.axisLabels.y, angle: -90, position: "insideLeft", fontSize: 10 } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
              {chart.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
              {dataKeys.map((key, i) => (
                <Scatter key={key} name={key} data={data.map((d) => ({
                  name: d.name, [key]: d[key],
                }))} fill={colors[i % colors.length]} dataKey={key} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data}>
              {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
              <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.x ? { value: chart.axisLabels.x, position: "insideBottom", offset: -5, fontSize: 10 } : undefined} />
              <YAxis fontSize={10} stroke="var(--muted-foreground)"
                label={chart.axisLabels.y ? { value: chart.axisLabels.y, angle: -90, position: "insideLeft", fontSize: 10 } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
              {chart.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
              {dataKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key}
                  stroke={colors[i % colors.length]} fill={colors[i % colors.length]}
                  fillOpacity={0.3} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
              <XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" />
              <YAxis fontSize={10} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
              {chart.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div
      ref={chartRef}
      className="absolute rounded-lg border shadow-lg overflow-hidden"
      style={{
        left: chart.x,
        top: chart.y,
        width: chart.width,
        height: chart.height,
        backgroundColor: "var(--card)",
        borderColor: isSelected ? "var(--primary)" : "var(--border)",
        borderWidth: isSelected ? 2 : 1,
        zIndex: isSelected ? 20 : 10,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={(e) => { e.stopPropagation(); setSelectedChart(chart.id); }}
    >
      {/* Title bar with drag handle */}
      <div
        className="flex items-center justify-between px-2 py-1 border-b cursor-grab select-none"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1">
          <GripVertical size={12} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-xs font-medium truncate" style={{ color: "var(--foreground)", maxWidth: chart.width - 140 }}>
            {chart.title || "Chart"}
          </span>
        </div>
        {isSelected && (
          <div className="flex items-center gap-0.5">
            <button onClick={exportAsPng} className="p-0.5 rounded hover:bg-black/20" title="Export PNG">
              <Download size={11} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <button onClick={exportAsSvg} className="p-0.5 rounded hover:bg-black/20" title="Export SVG">
              <Maximize2 size={11} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <button onClick={() => removeEmbeddedChart(chart.id)} className="p-0.5 rounded hover:bg-red-500/20" title="Delete">
              <Trash2 size={11} className="text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Chart content */}
      <div className="p-1" style={{ height: chart.height - 28 }}>
        {renderChart()}
      </div>

      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{ background: "linear-gradient(135deg, transparent 50%, var(--primary) 50%)" }}
          onMouseDown={onResizeStart}
        />
      )}
    </div>
  );
}
