"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  X, BarChart2, TrendingUp, PieChart as PieChartIcon, Hexagon,
  ScatterChart as ScatterIcon, Layers, Radar, Combine,
  ChevronRight, ChevronLeft, Download, Image, Eye, EyeOff,
  Palette, Settings, Type as TypeIcon,
} from "lucide-react";
import type {
  ChartConfig, SpreadsheetChartType, ChartSeriesConfig, ChartCustomization,
  ChartAxisConfig,
} from "./types";
import {
  DEFAULT_CHART_COLORS, CHART_COLOR_PALETTES,
  getDefaultChartCustomization, createDefaultChartConfig,
} from "./types";
import ChartRenderer from "./chart-renderer";
import type { ChartData } from "./chart-renderer";
import { exportChartAsPng, exportChartAsSvg } from "./chart-export-utils";

interface ChartWizardProps {
  initialRange: string;
  getData: (range: string) => ChartData[];
  getDataKeys: (range: string) => string[];
  onInsert: (config: ChartConfig) => void;
  onClose: () => void;
  editChart?: ChartConfig | null;
}

type WizardStep = "type" | "data" | "customize" | "preview";

const CHART_TYPES: { type: SpreadsheetChartType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: "bar", label: "Bar Chart", icon: <BarChart2 size={20} />, desc: "Compare values across categories" },
  { type: "line", label: "Line Chart", icon: <TrendingUp size={20} />, desc: "Show trends over time" },
  { type: "pie", label: "Pie Chart", icon: <PieChartIcon size={20} />, desc: "Show proportions of a whole" },
  { type: "scatter", label: "Scatter Plot", icon: <ScatterIcon size={20} />, desc: "Show relationships between variables" },
  { type: "area", label: "Area Chart", icon: <Layers size={20} />, desc: "Show cumulative trends" },
  { type: "doughnut", label: "Doughnut", icon: <Hexagon size={20} />, desc: "Pie chart with a center hole" },
  { type: "radar", label: "Radar Chart", icon: <Radar size={20} />, desc: "Compare multiple variables" },
  { type: "combo", label: "Combo Chart", icon: <Combine size={20} />, desc: "Mix bar and line charts" },
];

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "type", label: "Chart Type" },
  { key: "data", label: "Data & Series" },
  { key: "customize", label: "Customize" },
  { key: "preview", label: "Preview & Export" },
];

export default function ChartWizard({ initialRange, getData, getDataKeys, onInsert, onClose, editChart }: ChartWizardProps) {
  const [step, setStep] = useState<WizardStep>("type");
  const [chartType, setChartType] = useState<SpreadsheetChartType>(editChart?.type || "bar");
  const [chartTitle, setChartTitle] = useState(editChart?.title || "");
  const [dataRange, setDataRange] = useState(editChart?.dataRange || initialRange);
  const [seriesConfigs, setSeriesConfigs] = useState<ChartSeriesConfig[]>(editChart?.series || []);
  const [xAxisConfig, setXAxisConfig] = useState<ChartAxisConfig>(editChart?.xAxis || { label: "", showGridlines: true });
  const [yAxisConfig, setYAxisConfig] = useState<ChartAxisConfig>(editChart?.yAxis || { label: "", showGridlines: true });
  const [customization, setCustomization] = useState<ChartCustomization>(editChart?.customization || getDefaultChartCustomization());
  const [activeCustomTab, setActiveCustomTab] = useState<"general" | "colors" | "axis" | "labels">("general");
  const chartRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => getData(dataRange), [getData, dataRange]);
  const autoDataKeys = useMemo(() => getDataKeys(dataRange), [getDataKeys, dataRange]);

  // Auto-populate series when data keys change
  const effectiveSeries = useMemo(() => {
    if (seriesConfigs.length > 0) return seriesConfigs;
    return autoDataKeys.map((key, i): ChartSeriesConfig => ({
      dataKey: key,
      label: key,
      color: customization.colorPalette[i % customization.colorPalette.length],
      type: "bar",
      hidden: false,
    }));
  }, [seriesConfigs, autoDataKeys, customization.colorPalette]);

  const previewConfig: ChartConfig = useMemo(() => ({
    id: editChart?.id || "preview",
    type: chartType,
    title: chartTitle || "Chart",
    dataRange,
    position: editChart?.position || { x: 100, y: 100, width: 520, height: 360 },
    series: effectiveSeries,
    xAxis: xAxisConfig,
    yAxis: yAxisConfig,
    customization,
  }), [chartType, chartTitle, dataRange, effectiveSeries, xAxisConfig, yAxisConfig, customization, editChart]);

  const handleInsert = () => {
    onInsert(previewConfig);
  };

  const updateSeries = (idx: number, partial: Partial<ChartSeriesConfig>) => {
    const updated = [...effectiveSeries];
    updated[idx] = { ...updated[idx], ...partial };
    setSeriesConfigs(updated);
  };

  const handleExportPng = useCallback(() => {
    if (chartRef.current) exportChartAsPng(chartRef.current, `${chartTitle || "chart"}.png`);
  }, [chartTitle]);

  const handleExportSvg = useCallback(() => {
    if (chartRef.current) exportChartAsSvg(chartRef.current, `${chartTitle || "chart"}.svg`);
  }, [chartTitle]);

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const canGoNext = stepIndex < STEPS.length - 1;
  const canGoBack = stepIndex > 0;

  const inputStyle: React.CSSProperties = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "6px 10px",
    color: "var(--foreground)",
    fontSize: 12,
    width: "100%",
    outline: "none",
  };

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid",
    borderColor: active ? "var(--primary)" : "var(--border)",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "var(--primary-foreground)" : "var(--foreground)",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 4,
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: 900, maxWidth: "95vw", maxHeight: "90vh",
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 12, display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
            {editChart ? "Edit Chart" : "Insert Chart"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{
          display: "flex", gap: 0, padding: "0 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              style={{
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: step === s.key ? 600 : 400,
                color: step === s.key ? "var(--primary)" : "var(--muted-foreground)",
                borderBottom: step === s.key ? "2px solid var(--primary)" : "2px solid transparent",
                background: "none",
                border: "none",
                borderBottomWidth: 2,
                borderBottomStyle: "solid",
                cursor: "pointer",
                opacity: i <= stepIndex ? 1 : 0.5,
              }}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20, minHeight: 400 }}>
          {/* Step 1: Chart Type */}
          {step === "type" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Chart Title</label>
                <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} placeholder="My Chart" style={inputStyle} />
              </div>
              <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>Select Chart Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {CHART_TYPES.map(ct => (
                  <button
                    key={ct.type}
                    onClick={() => setChartType(ct.type)}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      border: "2px solid",
                      borderColor: chartType === ct.type ? "var(--primary)" : "var(--border)",
                      background: chartType === ct.type ? "rgba(59,130,246,0.1)" : "var(--background)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--foreground)",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ color: chartType === ct.type ? "var(--primary)" : "var(--muted-foreground)" }}>{ct.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{ct.label}</span>
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)", textAlign: "center" }}>{ct.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Data & Series */}
          {step === "data" && (
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Data Range</label>
                  <input
                    value={dataRange}
                    onChange={e => { setDataRange(e.target.value.toUpperCase()); setSeriesConfigs([]); }}
                    placeholder="A1:D10"
                    style={inputStyle}
                  />
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4 }}>
                    Row 1 = headers, Column A = categories. e.g. A1:D10
                  </div>
                </div>

                <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>Data Series ({effectiveSeries.length})</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                  {effectiveSeries.map((s, i) => (
                    <div key={s.dataKey} style={{
                      padding: 10, borderRadius: 6,
                      border: "1px solid var(--border)", background: "var(--background)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <input
                        type="color"
                        value={s.color}
                        onChange={e => updateSeries(i, { color: e.target.value })}
                        style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <input
                          value={s.label}
                          onChange={e => updateSeries(i, { label: e.target.value })}
                          style={{ ...inputStyle, marginBottom: 4, fontWeight: 600 }}
                        />
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Key: {s.dataKey}</div>
                      </div>
                      {chartType === "combo" && (
                        <select
                          value={s.type || "bar"}
                          onChange={e => updateSeries(i, { type: e.target.value as "bar" | "line" | "area" })}
                          style={{ ...inputStyle, width: 80 }}
                        >
                          <option value="bar">Bar</option>
                          <option value="line">Line</option>
                          <option value="area">Area</option>
                        </select>
                      )}
                      <button
                        onClick={() => updateSeries(i, { hidden: !s.hidden })}
                        style={{ background: "none", border: "none", cursor: "pointer", color: s.hidden ? "var(--muted-foreground)" : "var(--foreground)" }}
                        title={s.hidden ? "Show series" : "Hide series"}
                      >
                        {s.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini preview */}
              <div style={{ width: 340, background: "var(--background)", borderRadius: 8, border: "1px solid var(--border)", padding: 8 }}>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 8, textAlign: "center" }}>Preview</div>
                <div style={{ height: 250 }}>
                  <ChartRenderer config={previewConfig} data={data} />
                </div>
                <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4, textAlign: "center" }}>
                  {data.length} rows, {effectiveSeries.filter(s => !s.hidden).length} series
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === "customize" && (
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ width: 280, flexShrink: 0 }}>
                {/* Custom tabs */}
                <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  {([
                    { key: "general", label: "General", icon: <Settings size={12} /> },
                    { key: "colors", label: "Colors", icon: <Palette size={12} /> },
                    { key: "axis", label: "Axes", icon: <BarChart2 size={12} /> },
                    { key: "labels", label: "Labels", icon: <TypeIcon size={12} /> },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveCustomTab(tab.key)}
                      style={{
                        padding: "6px 10px", fontSize: 11,
                        borderBottom: activeCustomTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
                        color: activeCustomTab === tab.key ? "var(--primary)" : "var(--muted-foreground)",
                        background: "none", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeCustomTab === "general" && (
                    <>
                      <CheckOption label="Show Legend" checked={customization.showLegend} onChange={v => setCustomization(c => ({ ...c, showLegend: v }))} />
                      {customization.showLegend && (
                        <div>
                          <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Legend Position</label>
                          <div style={{ display: "flex", gap: 4 }}>
                            {(["top", "bottom", "left", "right"] as const).map(pos => (
                              <button key={pos} onClick={() => setCustomization(c => ({ ...c, legendPosition: pos }))}
                                style={btnStyle(customization.legendPosition === pos)}>
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <CheckOption label="Show Gridlines" checked={customization.showGridlines} onChange={v => setCustomization(c => ({ ...c, showGridlines: v }))} />
                      <CheckOption label="Show Data Labels" checked={customization.showDataLabels} onChange={v => setCustomization(c => ({ ...c, showDataLabels: v }))} />
                      <CheckOption label="Show Title" checked={customization.showTitle} onChange={v => setCustomization(c => ({ ...c, showTitle: v }))} />
                      <CheckOption label="Animate" checked={customization.animate} onChange={v => setCustomization(c => ({ ...c, animate: v }))} />
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Title Font Size</label>
                        <input type="range" min={10} max={24} value={customization.titleFontSize}
                          onChange={e => setCustomization(c => ({ ...c, titleFontSize: Number(e.target.value) }))}
                          style={{ width: "100%" }} />
                        <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{customization.titleFontSize}px</span>
                      </div>
                    </>
                  )}

                  {activeCustomTab === "colors" && (
                    <>
                      <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Color Palette</label>
                      {Object.entries(CHART_COLOR_PALETTES).map(([name, colors]) => (
                        <button
                          key={name}
                          onClick={() => {
                            setCustomization(c => ({ ...c, colorPalette: colors }));
                            setSeriesConfigs(prev => prev.map((s, i) => ({ ...s, color: colors[i % colors.length] })));
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 10px", borderRadius: 6,
                            border: "1px solid",
                            borderColor: JSON.stringify(customization.colorPalette) === JSON.stringify(colors) ? "var(--primary)" : "var(--border)",
                            background: "var(--background)", cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", gap: 2 }}>
                            {colors.slice(0, 6).map((c, i) => (
                              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 11, color: "var(--foreground)", textTransform: "capitalize" }}>{name}</span>
                        </button>
                      ))}
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Background Color</label>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input type="color" value={customization.backgroundColor || "#1a1a2e"}
                            onChange={e => setCustomization(c => ({ ...c, backgroundColor: e.target.value }))}
                            style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }} />
                          <button onClick={() => setCustomization(c => ({ ...c, backgroundColor: "transparent" }))}
                            style={{ ...btnStyle(), fontSize: 10 }}>
                            Transparent
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {activeCustomTab === "axis" && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>X-Axis</div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Label</label>
                        <input value={xAxisConfig.label} onChange={e => setXAxisConfig(c => ({ ...c, label: e.target.value }))} style={inputStyle} placeholder="X-Axis Label" />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginTop: 8, marginBottom: 4 }}>Y-Axis</div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Label</label>
                        <input value={yAxisConfig.label} onChange={e => setYAxisConfig(c => ({ ...c, label: e.target.value }))} style={inputStyle} placeholder="Y-Axis Label" />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Min</label>
                          <input type="number" value={yAxisConfig.min ?? ""} onChange={e => setYAxisConfig(c => ({ ...c, min: e.target.value ? Number(e.target.value) : undefined }))} style={inputStyle} placeholder="Auto" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Max</label>
                          <input type="number" value={yAxisConfig.max ?? ""} onChange={e => setYAxisConfig(c => ({ ...c, max: e.target.value ? Number(e.target.value) : undefined }))} style={inputStyle} placeholder="Auto" />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Tick Count</label>
                        <input type="number" value={yAxisConfig.tickCount ?? ""} onChange={e => setYAxisConfig(c => ({ ...c, tickCount: e.target.value ? Number(e.target.value) : undefined }))} style={inputStyle} placeholder="Auto" min={2} max={20} />
                      </div>
                    </>
                  )}

                  {activeCustomTab === "labels" && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Chart Title</label>
                        <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} style={inputStyle} placeholder="My Chart" />
                      </div>
                      <CheckOption label="Show Title" checked={customization.showTitle} onChange={v => setCustomization(c => ({ ...c, showTitle: v }))} />
                      <CheckOption label="Show Data Labels" checked={customization.showDataLabels} onChange={v => setCustomization(c => ({ ...c, showDataLabels: v }))} />
                      <div>
                        <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Border Radius</label>
                        <input type="range" min={0} max={20} value={customization.borderRadius}
                          onChange={e => setCustomization(c => ({ ...c, borderRadius: Number(e.target.value) }))}
                          style={{ width: "100%" }} />
                        <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{customization.borderRadius}px</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div style={{ flex: 1, background: "var(--background)", borderRadius: 8, border: "1px solid var(--border)", padding: 8 }}>
                <div style={{ height: "100%", minHeight: 340 }}>
                  <ChartRenderer config={previewConfig} data={data} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview & Export */}
          {step === "preview" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "flex-end" }}>
                <button onClick={handleExportPng} style={btnStyle()}>
                  <Image size={14} /> Export PNG
                </button>
                <button onClick={handleExportSvg} style={btnStyle()}>
                  <Download size={14} /> Export SVG
                </button>
              </div>
              <div ref={chartRef} style={{
                height: 380,
                background: customization.backgroundColor || "var(--background)",
                borderRadius: customization.borderRadius,
                border: "1px solid var(--border)",
                padding: 8,
              }}>
                <ChartRenderer config={previewConfig} data={data} />
              </div>
              <div style={{
                marginTop: 12, padding: 10, borderRadius: 6,
                background: "var(--background)", border: "1px solid var(--border)",
                fontSize: 11, color: "var(--muted-foreground)",
              }}>
                <strong style={{ color: "var(--foreground)" }}>Chart Summary:</strong>{" "}
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart with {effectiveSeries.filter(s => !s.hidden).length} series,{" "}
                {data.length} data points. Range: {dataRange}.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px", borderTop: "1px solid var(--border)",
        }}>
          <button onClick={onClose} style={btnStyle()}>Cancel</button>
          <div style={{ display: "flex", gap: 8 }}>
            {canGoBack && (
              <button onClick={() => setStep(STEPS[stepIndex - 1].key)} style={btnStyle()}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {canGoNext ? (
              <button onClick={() => setStep(STEPS[stepIndex + 1].key)}
                style={{ ...btnStyle(true), fontWeight: 600 }}>
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleInsert}
                style={{
                  padding: "8px 20px", borderRadius: 6,
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                }}>
                {editChart ? "Update Chart" : "Insert Chart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", color: "var(--foreground)" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ accentColor: "var(--primary)" }} />
      {label}
    </label>
  );
}
