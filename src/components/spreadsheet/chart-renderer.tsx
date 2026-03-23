"use client";

import React, { forwardRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from "recharts";
import type { ChartConfig, ChartSeriesConfig } from "./types";

export interface ChartData {
  name: string;
  value: number;
  [k: string]: string | number;
}

interface ChartRendererProps {
  config: ChartConfig;
  data: ChartData[];
  width?: number | string;
  height?: number | string;
}

const ChartRenderer = forwardRef<HTMLDivElement, ChartRendererProps>(
  function ChartRenderer({ config, data, width = "100%", height = "100%" }, ref) {
    const { type, title, series, xAxis, yAxis, customization } = config;
    const {
      showLegend, legendPosition, showGridlines,
      showDataLabels, showTitle, titleFontSize,
      backgroundColor, animate,
    } = customization;

    const dataKeys = series.filter(s => !s.hidden).map(s => s.dataKey);

    const getSeriesColor = (key: string) => {
      const s = series.find(s => s.dataKey === key);
      return s?.color || "#3b82f6";
    };

    const legendProps = showLegend ? {
      verticalAlign: (legendPosition === "top" || legendPosition === "bottom") ? legendPosition as "top" | "bottom" : ("bottom" as const),
      align: (legendPosition === "left" ? "left" : legendPosition === "right" ? "right" : "center") as "left" | "center" | "right",
    } : undefined;

    const gridElement = showGridlines ? <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /> : null;
    const xAxisElement = <XAxis dataKey="name" fontSize={10} tick={{ fill: "var(--foreground)" }} label={xAxis.label ? { value: xAxis.label, position: "insideBottom", offset: -5, fontSize: 11, fill: "var(--foreground)" } : undefined} />;
    const yAxisElement = <YAxis fontSize={10} tick={{ fill: "var(--foreground)" }} domain={[yAxis.min ?? "auto", yAxis.max ?? "auto"]} tickCount={yAxis.tickCount} label={yAxis.label ? { value: yAxis.label, angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--foreground)" } : undefined} />;

    const renderChart = () => {
      switch (type) {
        case "bar":
          return (
            <ResponsiveContainer width={width} height={height}>
              <BarChart data={data}>
                {gridElement}
                {xAxisElement}
                {yAxisElement}
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
                {showLegend && <Legend {...legendProps} />}
                {dataKeys.map((key) => (
                  <Bar key={key} dataKey={key} fill={getSeriesColor(key)} isAnimationActive={animate} radius={[2, 2, 0, 0]}>
                    {showDataLabels && <LabelList position="top" fontSize={9} fill="var(--foreground)" />}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          );

        case "line":
          return (
            <ResponsiveContainer width={width} height={height}>
              <LineChart data={data}>
                {gridElement}
                {xAxisElement}
                {yAxisElement}
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
                {showLegend && <Legend {...legendProps} />}
                {dataKeys.map((key) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={getSeriesColor(key)} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={animate}>
                    {showDataLabels && <LabelList position="top" fontSize={9} fill="var(--foreground)" />}
                  </Line>
                ))}
              </LineChart>
            </ResponsiveContainer>
          );

        case "area":
          return (
            <ResponsiveContainer width={width} height={height}>
              <AreaChart data={data}>
                {gridElement}
                {xAxisElement}
                {yAxisElement}
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
                {showLegend && <Legend {...legendProps} />}
                {dataKeys.map((key) => (
                  <Area key={key} type="monotone" dataKey={key} stroke={getSeriesColor(key)} fill={getSeriesColor(key)} fillOpacity={0.3} strokeWidth={2} isAnimationActive={animate}>
                    {showDataLabels && <LabelList position="top" fontSize={9} fill="var(--foreground)" />}
                  </Area>
                ))}
              </AreaChart>
            </ResponsiveContainer>
          );

        case "scatter":
          return (
            <ResponsiveContainer width={width} height={height}>
              <ScatterChart>
                {gridElement}
                <XAxis type="number" dataKey={dataKeys[0] || "value"} name={dataKeys[0] || "X"} fontSize={10} tick={{ fill: "var(--foreground)" }} />
                <YAxis type="number" dataKey={dataKeys[1] || dataKeys[0] || "value"} name={dataKeys[1] || "Y"} fontSize={10} tick={{ fill: "var(--foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} cursor={{ strokeDasharray: "3 3" }} />
                {showLegend && <Legend {...legendProps} />}
                <Scatter name="Data" data={data} fill={getSeriesColor(dataKeys[0] || "value")} isAnimationActive={animate}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={series[i % series.length]?.color || "#3b82f6"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          );

        case "pie":
        case "doughnut":
          return (
            <ResponsiveContainer width={width} height={height}>
              <PieChart>
                <Pie
                  data={data.map((d) => ({ name: d.name, value: Number(d[dataKeys[0]] || d.value || 0) }))}
                  cx="50%" cy="50%"
                  innerRadius={type === "doughnut" ? "40%" : 0}
                  outerRadius="70%"
                  dataKey="value"
                  isAnimationActive={animate}
                  label={showDataLabels ? ({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={customization.colorPalette[i % customization.colorPalette.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
                {showLegend && <Legend {...legendProps} />}
              </PieChart>
            </ResponsiveContainer>
          );

        case "radar":
          return (
            <ResponsiveContainer width={width} height={height}>
              <RadarChart data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.15)" />
                <PolarAngleAxis dataKey="name" fontSize={10} tick={{ fill: "var(--foreground)" }} />
                <PolarRadiusAxis fontSize={9} tick={{ fill: "var(--foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
                {showLegend && <Legend {...legendProps} />}
                {dataKeys.map((key) => (
                  <Radar key={key} name={key} dataKey={key} stroke={getSeriesColor(key)} fill={getSeriesColor(key)} fillOpacity={0.3} isAnimationActive={animate} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          );

        case "combo":
          return (
            <ResponsiveContainer width={width} height={height}>
              <ComposedChart data={data}>
                {gridElement}
                {xAxisElement}
                {yAxisElement}
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)" }} />
                {showLegend && <Legend {...legendProps} />}
                {series.filter(s => !s.hidden).map((s) => {
                  const seriesType = s.type || "bar";
                  if (seriesType === "line") {
                    return <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={animate} />;
                  }
                  if (seriesType === "area") {
                    return <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.3} isAnimationActive={animate} />;
                  }
                  return <Bar key={s.dataKey} dataKey={s.dataKey} fill={s.color} isAnimationActive={animate} radius={[2, 2, 0, 0]} />;
                })}
              </ComposedChart>
            </ResponsiveContainer>
          );

        default:
          return (
            <ResponsiveContainer width={width} height={height}>
              <BarChart data={data}>
                {gridElement}
                {xAxisElement}
                {yAxisElement}
                <Tooltip />
                {showLegend && <Legend />}
                {dataKeys.map((key) => (
                  <Bar key={key} dataKey={key} fill={getSeriesColor(key)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );
      }
    };

    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          background: backgroundColor || "transparent",
          borderRadius: customization.borderRadius,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showTitle && title && (
          <div style={{
            textAlign: "center",
            fontSize: titleFontSize,
            fontWeight: 600,
            color: "var(--foreground)",
            padding: "8px 8px 0",
          }}>
            {title}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          {renderChart()}
        </div>
      </div>
    );
  }
);

export default ChartRenderer;
