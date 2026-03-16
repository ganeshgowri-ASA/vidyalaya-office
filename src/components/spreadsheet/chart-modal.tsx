"use client";

import { useMemo, useState, useCallback } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { X } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList, Treemap,
  ComposedChart, ReferenceLine,
} from "recharts";
import AdvancedChart from "@/components/shared/advanced-chart-engine";
import ChartCustomizationPanel from "@/components/shared/chart-customization-panel";
import {
  ChartConfig, AdvancedChartType, getDefaultChartConfig, CHART_CATEGORIES,
} from "@/components/shared/chart-types";

const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

const CHART_TYPE_LABELS: Record<string, string> = {
  bar: "Column Chart",
  column: "Column Chart",
  line: "Line Chart",
  pie: "Pie Chart",
  scatter: "Scatter Chart",
  area: "Area Chart",
  doughnut: "Doughnut Chart",
  radar: "Radar/Spider Chart",
  bubble: "Bubble Chart",
  waterfall: "Waterfall Chart",
  funnel: "Funnel Chart",
  treemap: "Treemap",
  sunburst: "Sunburst Chart",
  histogram: "Histogram",
  butterfly: "Butterfly/Tornado Chart",
  gantt: "Gantt Chart",
  stock: "Stock (OHLC) Chart",
  boxwhisker: "Box & Whisker",
  combo: "Combo Chart",
  logarithmic: "Logarithmic Scale",
  bode: "Bode Plot",
};

// All advanced chart type labels
const ADVANCED_CHART_LABELS: Record<string, string> = {
  ...CHART_TYPE_LABELS,
  column: "Column Chart",
  bubble: "Bubble Chart",
  boxplot: "Box Plot",
  violin: "Violin Plot",
  histogram: "Histogram",
  qqplot: "QQ Plot",
  pareto: "Pareto Chart",
  'control-xbar': "Control Chart (X̄)",
  'control-r': "Control Chart (R)",
  errorbar: "Error Bar Chart",
  heatmap: "Heatmap",
  contour: "Contour Plot",
  surface3d: "3D Surface",
  polar: "Polar/Radar",
  radar: "Radar",
  waterfall: "Waterfall",
  funnel: "Funnel",
  treemap: "Treemap",
  sunburst: "Sunburst",
  candlestick: "Candlestick",
  ohlc: "OHLC",
  sparkline: "Sparkline",
  smith: "Smith Chart",
  bode: "Bode Plot",
  nyquist: "Nyquist Plot",
};

type ChartMode = 'basic' | 'advanced';

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
  const [chartMode, setChartMode] = useState<ChartMode>('basic');
  const [basicChartType, setBasicChartType] = useState<string>(chartType || 'bar');
  const [advancedConfig, setAdvancedConfig] = useState<ChartConfig | null>(null);
  const [showCustomPanel, setShowCustomPanel] = useState(false);

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

  // Build advanced config from spreadsheet data
  const buildAdvancedConfig = useCallback((type: AdvancedChartType): ChartConfig => {
    const labels = data.map(d => String(d.name));
    const series = dataKeys.map((key, idx) => ({
      name: key,
      data: data.map(d => Number(d[key]) || 0),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));

    return {
      ...getDefaultChartConfig(type),
      title: chartTitle,
      labels: labels.length > 0 ? labels : ['A', 'B', 'C', 'D', 'E'],
      series: series.length > 0 ? series : [{ name: 'Series 1', data: [10, 25, 15, 30, 20] }],
      showDataLabels,
      legendPosition: showLegend ? 'bottom' : 'none',
      width: 580,
      height: 380,
    };
  }, [data, dataKeys, chartTitle, showDataLabels, showLegend]);

  const switchToAdvanced = useCallback((type: AdvancedChartType) => {
    setChartMode('advanced');
    setAdvancedConfig(buildAdvancedConfig(type));
  }, [buildAdvancedConfig]);

  if (!showChartModal) return null;

  const noData = data.length === 0;

  const renderBasicChart = () => {
    if (noData) {
      return (
        <div className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Select a range of cells first, then open a chart.<br />
          First column = labels, other columns = data series.
        </div>
      );
    }

    const commonProps = { data };

    switch (basicChartType) {
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
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
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
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
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
      case "radar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" fontSize={10} />
              <PolarRadiusAxis fontSize={10} />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, i) => (
                <Radar key={key} name={key} dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.3} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );
      case "bubble":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="X" fontSize={11} />
              <YAxis type="number" dataKey="y" name="Y" fontSize={11} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {showLegend && <Legend />}
              <Scatter
                name="Bubble"
                data={data.map((d, i) => ({
                  x: Number(d[dataKeys[0]] || 0),
                  y: Number(d[dataKeys[1] || dataKeys[0]] || 0),
                  z: Number(d[dataKeys[2] || dataKeys[0]] || 10) * 5,
                  name: d.name,
                }))}
                fill="#3b82f6"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "waterfall": {
        let cumulative = 0;
        const waterfallData = data.map((d, i) => {
          const val = Number(d[dataKeys[0]] || 0);
          const start = cumulative;
          cumulative += val;
          return { name: d.name, value: val, start, end: cumulative, fill: val >= 0 ? "#22c55e" : "#ef4444" };
        });
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="value" stackId="a" name="Value"
                label={showDataLabels ? { position: "top", fontSize: 10 } : undefined}>
                {waterfallData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case "funnel": {
        const funnelData = data.map((d, i) => ({
          name: String(d.name),
          value: Number(d[dataKeys[0]] || 0),
          fill: CHART_COLORS[i % CHART_COLORS.length],
        })).sort((a, b) => b.value - a.value);
        return (
          <ResponsiveContainer width="100%" height={350}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" fontSize={11} />
                {funnelData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );
      }
      case "treemap": {
        const treemapData = data.map((d, i) => ({
          name: String(d.name),
          size: Math.abs(Number(d[dataKeys[0]] || 0)),
          fill: CHART_COLORS[i % CHART_COLORS.length],
        }));
        return (
          <ResponsiveContainer width="100%" height={350}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
            >
              {treemapData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Treemap>
          </ResponsiveContainer>
        );
      }
      case "histogram": {
        // Create histogram bins from data
        const values = data.map(d => Number(d[dataKeys[0]] || 0));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
        const binWidth = (max - min) / binCount || 1;
        const bins = Array.from({ length: binCount }, (_, i) => ({
          name: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
          count: 0,
        }));
        values.forEach(v => {
          const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
          if (idx >= 0 && idx < bins.length) bins[idx].count++;
        });
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={bins}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={9} angle={-45} textAnchor="end" height={60} />
              <YAxis fontSize={11} label={{ value: "Frequency", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Frequency"
                label={showDataLabels ? { position: "top", fontSize: 10 } : undefined} />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case "butterfly": {
        // Butterfly/Tornado chart - horizontal bar chart with mirrored values
        const butterflyData = data.map(d => ({
          name: d.name,
          left: -Math.abs(Number(d[dataKeys[0]] || 0)),
          right: Math.abs(Number(d[dataKeys[1] || dataKeys[0]] || 0)),
        }));
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={butterflyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={11} />
              <YAxis dataKey="name" type="category" fontSize={11} width={80} />
              <Tooltip />
              {showLegend && <Legend />}
              <ReferenceLine x={0} stroke="#666" />
              <Bar dataKey="left" fill="#ef4444" name={dataKeys[0] || "Left"} />
              <Bar dataKey="right" fill="#3b82f6" name={dataKeys[1] || "Right"} />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case "gantt": {
        // Simple Gantt chart - expects columns: Task, Start, Duration
        const ganttData = data.map((d, i) => ({
          name: d.name,
          start: Number(d[dataKeys[0]] || i),
          duration: Number(d[dataKeys[1] || dataKeys[0]] || 1),
        }));
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ganttData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={11} />
              <YAxis dataKey="name" type="category" fontSize={11} width={100} />
              <Tooltip />
              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="duration" stackId="a" name="Duration"
                label={showDataLabels ? { position: "center", fontSize: 10, fill: "#fff" } : undefined}>
                {ganttData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case "stock": {
        // OHLC-like with high-low bars
        const stockData = data.map(d => ({
          name: d.name,
          open: Number(d[dataKeys[0]] || 0),
          high: Number(d[dataKeys[1] || dataKeys[0]] || 0),
          low: Number(d[dataKeys[2] || dataKeys[0]] || 0),
          close: Number(d[dataKeys[3] || dataKeys[0]] || 0),
        }));
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey="low" stackId="hl" fill="transparent" />
              <Bar dataKey="high" stackId="hl" fill="#8b5cf6" name="High-Low Range" />
              <Line type="monotone" dataKey="open" stroke="#22c55e" name="Open" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="close" stroke="#ef4444" name="Close" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      }
      case "boxwhisker": {
        // Box and Whisker using bars
        const allValues = data.map(d => Number(d[dataKeys[0]] || 0)).sort((a, b) => a - b);
        const n = allValues.length;
        const q1 = allValues[Math.floor(n * 0.25)];
        const median = allValues[Math.floor(n * 0.5)];
        const q3 = allValues[Math.floor(n * 0.75)];
        const min = allValues[0];
        const max = allValues[n - 1];
        const boxData = [{ name: "Data", min, q1, median, q3, max, iqr: q3 - q1 }];
        return (
          <div className="space-y-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={boxData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={11} />
                <Tooltip />
                <Bar dataKey="q1" stackId="box" fill="transparent" />
                <Bar dataKey="iqr" stackId="box" fill="#3b82f680" stroke="#3b82f6" strokeWidth={2} name="IQR" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-5 gap-2 text-xs text-center">
              <div className="p-1.5 rounded" style={{ backgroundColor: "var(--muted)" }}>
                <div style={{ color: "var(--muted-foreground)" }}>Min</div>
                <div className="font-mono font-bold">{min.toFixed(2)}</div>
              </div>
              <div className="p-1.5 rounded" style={{ backgroundColor: "var(--muted)" }}>
                <div style={{ color: "var(--muted-foreground)" }}>Q1</div>
                <div className="font-mono font-bold">{q1.toFixed(2)}</div>
              </div>
              <div className="p-1.5 rounded" style={{ backgroundColor: "var(--muted)" }}>
                <div style={{ color: "var(--muted-foreground)" }}>Median</div>
                <div className="font-mono font-bold">{median.toFixed(2)}</div>
              </div>
              <div className="p-1.5 rounded" style={{ backgroundColor: "var(--muted)" }}>
                <div style={{ color: "var(--muted-foreground)" }}>Q3</div>
                <div className="font-mono font-bold">{q3.toFixed(2)}</div>
              </div>
              <div className="p-1.5 rounded" style={{ backgroundColor: "var(--muted)" }}>
                <div style={{ color: "var(--muted-foreground)" }}>Max</div>
                <div className="font-mono font-bold">{max.toFixed(2)}</div>
              </div>
            </div>
          </div>
        );
      }
      case "column":
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
      case "combo": {
        // Combo chart: first series as bar, rest as lines
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, i) =>
                i === 0 ? (
                  <Bar key={key} dataKey={key} fill={CHART_COLORS[0]} name={key}
                    label={showDataLabels ? { position: "top", fontSize: 10 } : undefined} />
                ) : (
                  <Line key={key} type="monotone" dataKey={key}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2}
                    dot={{ r: 4 }} name={key} />
                )
              )}
            </ComposedChart>
          </ResponsiveContainer>
        );
      }
      case "sunburst": {
        // Sunburst as nested donut rings
        const outerData = data.map((d, i) => ({
          name: String(d.name),
          value: Math.abs(Number(d[dataKeys[0]] || 0)),
          fill: CHART_COLORS[i % CHART_COLORS.length],
        }));
        const innerData = dataKeys.length > 1
          ? data.map((d, i) => ({
              name: String(d.name),
              value: Math.abs(Number(d[dataKeys[1]] || d[dataKeys[0]] || 0)),
              fill: CHART_COLORS[(i + 3) % CHART_COLORS.length],
            }))
          : outerData.map((d, i) => ({ ...d, fill: CHART_COLORS[(i + 4) % CHART_COLORS.length] }));
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={innerData} cx="50%" cy="50%" innerRadius={0} outerRadius={60} dataKey="value" stroke="#fff" strokeWidth={2}>
                {innerData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Pie data={outerData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="value"
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                stroke="#fff" strokeWidth={2}>
                {outerData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      }
      case "logarithmic":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} scale="log" domain={["auto", "auto"]} allowDataOverflow />
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
      case "bode": {
        // Bode plot - magnitude and phase vs frequency (log scale)
        const bodeData = data.map((d, i) => {
          const freq = Number(d[dataKeys[0]] || (i + 1));
          const magnitude = Number(d[dataKeys[1] || dataKeys[0]] || 0);
          const phase = Number(d[dataKeys[2] || dataKeys[0]] || 0);
          return { name: d.name, freq, magnitude, phase };
        });
        return (
          <div className="space-y-2">
            <div className="text-[10px] text-center font-medium" style={{ color: "var(--muted-foreground)" }}>Magnitude (dB)</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={bodeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={9} />
                <YAxis fontSize={9} />
                <Tooltip />
                <Line type="monotone" dataKey="magnitude" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Magnitude (dB)" />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-center font-medium" style={{ color: "var(--muted-foreground)" }}>Phase (degrees)</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={bodeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={9} />
                <YAxis fontSize={9} />
                <Tooltip />
                <Line type="monotone" dataKey="phase" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Phase (deg)" />
                <ReferenceLine y={-180} stroke="#666" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="max-h-[90vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)",
          width: chartMode === 'advanced' && showCustomPanel ? '1050px' : '750px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">
              {chartMode === 'advanced' && advancedConfig
                ? (ADVANCED_CHART_LABELS[advancedConfig.type] || 'Advanced Chart')
                : (CHART_TYPE_LABELS[basicChartType] || CHART_TYPE_LABELS[chartType] || "Chart")}
            </h2>
            {/* Mode switcher */}
            <div className="flex rounded-md overflow-hidden border text-[10px]" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setChartMode('basic')}
                className={`px-2 py-0.5 ${chartMode === 'basic' ? 'bg-blue-500 text-white' : ''}`}>
                Basic
              </button>
              <button onClick={() => switchToAdvanced((chartType === 'bar' ? 'column' : chartType) as AdvancedChartType)}
                className={`px-2 py-0.5 ${chartMode === 'advanced' ? 'bg-blue-500 text-white' : ''}`}>
                Advanced
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chartMode === 'advanced' && (
              <button onClick={() => setShowCustomPanel(!showCustomPanel)}
                className="text-[10px] px-2 py-0.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ borderColor: "var(--border)" }}>
                {showCustomPanel ? 'Hide' : 'Show'} Customization
              </button>
            )}
            <button onClick={closeChartModal} className="hover:opacity-70"><X size={16} /></button>
          </div>
        </div>

        {/* Advanced chart type selector */}
        {chartMode === 'advanced' && (
          <div className="flex items-center gap-1 px-4 py-1.5 border-b overflow-x-auto text-[10px]" style={{ borderColor: "var(--border)" }}>
            {Object.entries(CHART_CATEGORIES).map(([key, category]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-gray-400 font-medium whitespace-nowrap">{category.label}:</span>
                {category.types.slice(0, 4).map(ct => (
                  <button key={ct.type}
                    onClick={() => {
                      const cfg = buildAdvancedConfig(ct.type as AdvancedChartType);
                      setAdvancedConfig(cfg);
                    }}
                    className={`px-1.5 py-0.5 rounded whitespace-nowrap ${
                      advancedConfig?.type === ct.type ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                    {ct.label}
                  </button>
                ))}
                <span className="text-gray-300 dark:text-gray-600">|</span>
              </div>
            ))}
          </div>
        )}

        {/* Chart type selector for basic mode */}
        {chartMode === 'basic' && (
          <div className="px-4 py-1.5 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-1 text-[10px]">
              {Object.entries({
                "Standard": ["bar", "column", "line", "area", "scatter", "combo"],
                "Circular": ["pie", "doughnut", "sunburst"],
                "Specialty": ["radar", "bubble", "waterfall", "funnel", "treemap", "histogram"],
                "Financial": ["stock", "gantt"],
                "Analysis": ["boxwhisker", "butterfly", "logarithmic", "bode"],
              }).map(([cat, types]) => (
                <div key={cat} className="flex items-center gap-0.5">
                  <span className="text-gray-400 font-medium whitespace-nowrap">{cat}:</span>
                  {types.map(t => (
                    <button key={t}
                      onClick={() => setBasicChartType(t)}
                      className={`px-1.5 py-0.5 rounded whitespace-nowrap ${
                        basicChartType === t ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}>
                      {CHART_TYPE_LABELS[t]?.replace(" Chart", "") || t}
                    </button>
                  ))}
                  <span className="text-gray-300 dark:text-gray-600 mx-0.5">|</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart settings for basic mode */}
        {chartMode === 'basic' && (
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
        )}

        {/* Chart content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chart area */}
          <div className="flex-1 p-4 overflow-auto">
            {chartMode === 'basic' ? (
              <>
                {chartTitle && (
                  <div className="text-center text-sm font-semibold mb-2">{chartTitle}</div>
                )}
                {renderBasicChart()}
              </>
            ) : advancedConfig ? (
              <AdvancedChart config={advancedConfig} />
            ) : null}
          </div>

          {/* Customization panel (advanced mode) */}
          {chartMode === 'advanced' && showCustomPanel && advancedConfig && (
            <div className="w-[280px] border-l overflow-y-auto" style={{ borderColor: "var(--border)" }}>
              <ChartCustomizationPanel
                config={advancedConfig}
                onChange={setAdvancedConfig}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
