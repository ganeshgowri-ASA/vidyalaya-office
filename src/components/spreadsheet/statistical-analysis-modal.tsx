"use client";

import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter, parseCellRef, parseRange } from "./formula-engine";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

type AnalysisType = "regression" | "correlation" | "descriptive" | "ttest" | "anova";
type RegressionType = "linear" | "polynomial" | "exponential" | "logarithmic" | "power";

function linReg(x: number[], y: number[]) {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumXY += (x[i] - xMean) * (y[i] - yMean);
    sumX2 += (x[i] - xMean) ** 2;
    sumY2 += (y[i] - yMean) ** 2;
  }
  const slope = sumX2 === 0 ? 0 : sumXY / sumX2;
  const intercept = yMean - slope * xMean;
  const ssRes = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const ssTot = sumY2;
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

function polyReg(x: number[], y: number[], degree: number) {
  const n = x.length;
  // Build normal equations using Vandermonde matrix
  const size = degree + 1;
  const A: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const b: number[] = Array(size).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        A[j][k] += x[i] ** (j + k);
      }
      b[j] += y[i] * x[i] ** j;
    }
  }
  // Gaussian elimination
  for (let i = 0; i < size; i++) {
    let maxRow = i;
    for (let k = i + 1; k < size; k++) if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];
    if (Math.abs(A[i][i]) < 1e-12) continue;
    for (let k = i + 1; k < size; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < size; j++) A[k][j] -= factor * A[i][j];
      b[k] -= factor * b[i];
    }
  }
  const coeffs = Array(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < size; j++) sum -= A[i][j] * coeffs[j];
    coeffs[i] = A[i][i] === 0 ? 0 : sum / A[i][i];
  }
  // R²
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const ssTot = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((s, yi, i) => {
    let predicted = 0;
    for (let j = 0; j < coeffs.length; j++) predicted += coeffs[j] * x[i] ** j;
    return s + (yi - predicted) ** 2;
  }, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { coeffs, r2 };
}

export function StatisticalAnalysisModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

  const [analysisType, setAnalysisType] = useState<AnalysisType>("regression");
  const [regressionType, setRegressionType] = useState<RegressionType>("linear");
  const [polyDegree, setPolyDegree] = useState(2);

  // Extract data from selection
  const { xData, yData, labels } = useMemo(() => {
    if (!selectionStart || !selectionEnd) return { xData: [], yData: [], labels: [] };
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);

    const x: number[] = [];
    const y: number[] = [];
    const labs: string[] = [];
    const dataStart = minR + 1; // skip header

    for (let r = dataStart; r <= maxR; r++) {
      const xVal = parseFloat(getCellDisplay(minC, r).replace(/[$,%]/g, ""));
      const yVal = maxC > minC ? parseFloat(getCellDisplay(minC + 1, r).replace(/[$,%]/g, "")) : NaN;
      if (!isNaN(xVal) && !isNaN(yVal)) {
        x.push(xVal);
        y.push(yVal);
        labs.push(getCellDisplay(minC, r));
      }
    }
    return { xData: x, yData: y, labels: labs };
  }, [selectionStart, selectionEnd, getCellDisplay]);

  // Regression results
  const regressionResult = useMemo(() => {
    if (xData.length < 2 || yData.length < 2) return null;

    switch (regressionType) {
      case "linear": {
        const { slope, intercept, r2 } = linReg(xData, yData);
        const predict = (x: number) => slope * x + intercept;
        return {
          equation: `y = ${slope.toFixed(4)}x ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept).toFixed(4)}`,
          r2,
          predict,
          params: { slope, intercept },
        };
      }
      case "polynomial": {
        const { coeffs, r2 } = polyReg(xData, yData, polyDegree);
        const predict = (x: number) => coeffs.reduce((s: number, c: number, i: number) => s + c * x ** i, 0);
        const terms = coeffs.map((c, i) => i === 0 ? c.toFixed(4) : `${c.toFixed(4)}x^${i}`).reverse().join(" + ");
        return { equation: `y = ${terms}`, r2, predict, params: { coeffs } };
      }
      case "exponential": {
        const logY = yData.filter(v => v > 0).map(v => Math.log(v));
        const filteredX = xData.filter((_, i) => yData[i] > 0);
        if (logY.length < 2) return null;
        const { slope, intercept, r2 } = linReg(filteredX, logY);
        const a = Math.exp(intercept);
        const b = slope;
        const predict = (x: number) => a * Math.exp(b * x);
        return { equation: `y = ${a.toFixed(4)} * e^(${b.toFixed(4)}x)`, r2, predict, params: { a, b } };
      }
      case "logarithmic": {
        const logX = xData.filter(v => v > 0).map(v => Math.log(v));
        const filteredY = yData.filter((_, i) => xData[i] > 0);
        if (logX.length < 2) return null;
        const { slope, intercept, r2 } = linReg(logX, filteredY);
        const predict = (x: number) => x > 0 ? slope * Math.log(x) + intercept : 0;
        return { equation: `y = ${slope.toFixed(4)} * ln(x) ${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept).toFixed(4)}`, r2, predict, params: { slope, intercept } };
      }
      case "power": {
        const logX = xData.filter((v, i) => v > 0 && yData[i] > 0).map(v => Math.log(v));
        const logY = yData.filter((v, i) => v > 0 && xData[i] > 0).map(v => Math.log(v));
        if (logX.length < 2) return null;
        const { slope, intercept, r2 } = linReg(logX, logY);
        const a = Math.exp(intercept);
        const predict = (x: number) => x > 0 ? a * x ** slope : 0;
        return { equation: `y = ${a.toFixed(4)} * x^${slope.toFixed(4)}`, r2, predict, params: { a, b: slope } };
      }
    }
  }, [xData, yData, regressionType, polyDegree]);

  // Descriptive statistics
  const descriptive = useMemo(() => {
    if (xData.length === 0) return null;
    const allData = [...xData, ...yData].filter(v => !isNaN(v));
    const n = allData.length;
    const mean = allData.reduce((a, b) => a + b, 0) / n;
    const sorted = [...allData].sort((a, b) => a - b);
    const median = n % 2 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const variance = allData.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
    const stdev = Math.sqrt(variance);
    const min = sorted[0];
    const max = sorted[n - 1];
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const skewness = n > 2 ? allData.reduce((s, v) => s + ((v - mean) / stdev) ** 3, 0) * n / ((n - 1) * (n - 2)) : 0;
    const kurtosis = n > 3 ? allData.reduce((s, v) => s + ((v - mean) / stdev) ** 4, 0) * n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3)) : 0;
    return { n, mean, median, stdev, variance, min, max, q1, q3, skewness, kurtosis, range: max - min };
  }, [xData, yData]);

  // Correlation matrix
  const correlation = useMemo(() => {
    if (xData.length < 2 || yData.length < 2) return null;
    const n = Math.min(xData.length, yData.length);
    const xMean = xData.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const yMean = yData.slice(0, n).reduce((a, b) => a + b, 0) / n;
    let sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumXY += (xData[i] - xMean) * (yData[i] - yMean);
      sumX2 += (xData[i] - xMean) ** 2;
      sumY2 += (yData[i] - yMean) ** 2;
    }
    const r = Math.sqrt(sumX2 * sumY2) === 0 ? 0 : sumXY / Math.sqrt(sumX2 * sumY2);
    return { r, r2: r * r, n };
  }, [xData, yData]);

  // T-test (paired)
  const ttest = useMemo(() => {
    if (xData.length < 2 || yData.length < 2) return null;
    const n = Math.min(xData.length, yData.length);
    const diffs = Array.from({ length: n }, (_, i) => xData[i] - yData[i]);
    const dMean = diffs.reduce((a, b) => a + b, 0) / n;
    const dVar = diffs.reduce((s, d) => s + (d - dMean) ** 2, 0) / (n - 1);
    const se = Math.sqrt(dVar / n);
    const t = se === 0 ? 0 : dMean / se;
    const df = n - 1;
    // Approximate p-value using the t-distribution
    const x = df / (df + t * t);
    const p = t === 0 ? 1 : x < 0.5 ? 1 : 2 * (1 - 0.5 * (1 + Math.sign(t)));
    return { t, df, pValue: Math.min(1, Math.abs(2 * (1 / (1 + Math.exp(-0.7 * Math.abs(t))))  - 1)), meanDiff: dMean, se };
  }, [xData, yData]);

  // ANOVA (one-way, comparing X and Y as two groups)
  const anova = useMemo(() => {
    if (xData.length < 2 || yData.length < 2) return null;
    const groups = [xData, yData];
    const k = groups.length;
    const N = groups.reduce((s, g) => s + g.length, 0);
    const grandMean = groups.reduce((s, g) => s + g.reduce((a, b) => a + b, 0), 0) / N;
    const ssBetween = groups.reduce((s, g) => {
      const gMean = g.reduce((a, b) => a + b, 0) / g.length;
      return s + g.length * (gMean - grandMean) ** 2;
    }, 0);
    const ssWithin = groups.reduce((s, g) => {
      const gMean = g.reduce((a, b) => a + b, 0) / g.length;
      return s + g.reduce((ss, v) => ss + (v - gMean) ** 2, 0);
    }, 0);
    const dfBetween = k - 1;
    const dfWithin = N - k;
    const msBetween = ssBetween / dfBetween;
    const msWithin = dfWithin === 0 ? 0 : ssWithin / dfWithin;
    const f = msWithin === 0 ? 0 : msBetween / msWithin;
    return { ssBetween, ssWithin, dfBetween, dfWithin, msBetween, msWithin, f, ssTotal: ssBetween + ssWithin };
  }, [xData, yData]);

  // Chart data for regression
  const chartData = useMemo(() => {
    if (xData.length === 0) return [];
    return xData.map((x, i) => ({
      x,
      y: yData[i],
      predicted: regressionResult?.predict(x) ?? 0,
    }));
  }, [xData, yData, regressionResult]);

  if (!open) return null;

  const noData = xData.length < 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[700px] max-h-[90vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Statistical Analysis</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Analysis type tabs */}
        <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          {([
            { key: "regression" as AnalysisType, label: "Regression" },
            { key: "correlation" as AnalysisType, label: "Correlation" },
            { key: "descriptive" as AnalysisType, label: "Descriptive" },
            { key: "ttest" as AnalysisType, label: "T-Test" },
            { key: "anova" as AnalysisType, label: "ANOVA" },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setAnalysisType(t.key)}
              className={`px-4 py-2 text-xs font-medium border-b-2 whitespace-nowrap ${
                analysisType === t.key ? "border-blue-500" : "border-transparent"
              }`}
              style={{ color: analysisType === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {noData ? (
            <div className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Select a range with at least two columns of numeric data (with headers).<br />
              First column = X values, second column = Y values.
            </div>
          ) : (
            <>
              {/* Regression */}
              {analysisType === "regression" && (
                <>
                  <div className="flex gap-2 items-center">
                    <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Type:</label>
                    <select
                      className="text-xs rounded px-2 py-1 border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      value={regressionType}
                      onChange={(e) => setRegressionType(e.target.value as RegressionType)}
                    >
                      <option value="linear">Linear</option>
                      <option value="polynomial">Polynomial</option>
                      <option value="exponential">Exponential</option>
                      <option value="logarithmic">Logarithmic</option>
                      <option value="power">Power</option>
                    </select>
                    {regressionType === "polynomial" && (
                      <select
                        className="text-xs rounded px-2 py-1 border outline-none"
                        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        value={polyDegree}
                        onChange={(e) => setPolyDegree(parseInt(e.target.value))}
                      >
                        {[2, 3, 4, 5].map(d => (
                          <option key={d} value={d}>Degree {d}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {regressionResult && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Equation</div>
                          <div className="text-sm font-mono mt-1">{regressionResult.equation}</div>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>R-squared</div>
                          <div className="text-lg font-bold mt-1">{regressionResult.r2.toFixed(6)}</div>
                          <div className="text-xs" style={{ color: regressionResult.r2 > 0.8 ? "#16a34a" : regressionResult.r2 > 0.5 ? "#d97706" : "#dc2626" }}>
                            {regressionResult.r2 > 0.8 ? "Strong fit" : regressionResult.r2 > 0.5 ? "Moderate fit" : "Weak fit"}
                          </div>
                        </div>
                      </div>

                      {/* Scatter + regression line chart */}
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="x" name="X" fontSize={10} />
                          <YAxis type="number" fontSize={10} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                          <Scatter name="Data" data={chartData} fill="#3b82f6" dataKey="y" />
                          <Scatter name="Predicted" data={chartData.sort((a, b) => a.x - b.x)} fill="#ef4444" dataKey="predicted" line={{ stroke: "#ef4444", strokeWidth: 2 }} shape={(() => <circle r={0} />) as any} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}

              {/* Correlation */}
              {analysisType === "correlation" && correlation && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Pearson r</div>
                      <div className="text-lg font-bold mt-1">{correlation.r.toFixed(6)}</div>
                    </div>
                    <div className="p-3 rounded text-center" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>R-squared</div>
                      <div className="text-lg font-bold mt-1">{correlation.r2.toFixed(6)}</div>
                    </div>
                    <div className="p-3 rounded text-center" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Sample Size</div>
                      <div className="text-lg font-bold mt-1">{correlation.n}</div>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Correlation: {Math.abs(correlation.r) > 0.7 ? "Strong" : Math.abs(correlation.r) > 0.4 ? "Moderate" : "Weak"}
                    {" "}{correlation.r > 0 ? "positive" : "negative"} relationship
                  </div>

                  {/* Correlation matrix */}
                  <div className="border rounded overflow-auto" style={{ borderColor: "var(--border)" }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}></th>
                          <th className="px-3 py-1.5 border-b text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>X</th>
                          <th className="px-3 py-1.5 border-b text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Y</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-1.5 border-b font-medium" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>X</td>
                          <td className="px-3 py-1.5 border-b text-center font-mono" style={{ borderColor: "var(--border)" }}>1.0000</td>
                          <td className="px-3 py-1.5 border-b text-center font-mono" style={{ borderColor: "var(--border)" }}>{correlation.r.toFixed(4)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 border-b font-medium" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Y</td>
                          <td className="px-3 py-1.5 border-b text-center font-mono" style={{ borderColor: "var(--border)" }}>{correlation.r.toFixed(4)}</td>
                          <td className="px-3 py-1.5 border-b text-center font-mono" style={{ borderColor: "var(--border)" }}>1.0000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Descriptive */}
              {analysisType === "descriptive" && descriptive && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Count", value: descriptive.n },
                    { label: "Mean", value: descriptive.mean.toFixed(4) },
                    { label: "Median", value: descriptive.median.toFixed(4) },
                    { label: "Std Dev", value: descriptive.stdev.toFixed(4) },
                    { label: "Variance", value: descriptive.variance.toFixed(4) },
                    { label: "Min", value: descriptive.min.toFixed(4) },
                    { label: "Max", value: descriptive.max.toFixed(4) },
                    { label: "Range", value: descriptive.range.toFixed(4) },
                    { label: "Q1", value: descriptive.q1.toFixed(4) },
                    { label: "Q3", value: descriptive.q3.toFixed(4) },
                    { label: "Skewness", value: descriptive.skewness.toFixed(4) },
                    { label: "Kurtosis", value: descriptive.kurtosis.toFixed(4) },
                  ].map(stat => (
                    <div key={stat.label} className="p-2 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{stat.label}</div>
                      <div className="text-sm font-mono font-medium">{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* T-Test */}
              {analysisType === "ttest" && ttest && (
                <div className="space-y-3">
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Paired t-test comparing the two selected data columns.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "t-statistic", value: ttest.t.toFixed(6) },
                      { label: "Degrees of Freedom", value: ttest.df },
                      { label: "Mean Difference", value: ttest.meanDiff.toFixed(6) },
                      { label: "Std Error", value: ttest.se.toFixed(6) },
                    ].map(stat => (
                      <div key={stat.label} className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</div>
                        <div className="text-sm font-mono font-bold mt-1">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ANOVA */}
              {analysisType === "anova" && anova && (
                <div className="space-y-3">
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    One-way ANOVA comparing the two selected data columns as groups.
                  </div>
                  <div className="border rounded overflow-auto" style={{ borderColor: "var(--border)" }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="px-3 py-1.5 border-b text-left" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Source</th>
                          <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>SS</th>
                          <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>df</th>
                          <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>MS</th>
                          <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>F</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>Between</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.ssBetween.toFixed(4)}</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.dfBetween}</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.msBetween.toFixed(4)}</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono font-bold" style={{ borderColor: "var(--border)" }}>{anova.f.toFixed(4)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>Within</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.ssWithin.toFixed(4)}</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.dfWithin}</td>
                          <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.msWithin.toFixed(4)}</td>
                          <td className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)" }}></td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 font-medium" style={{ borderColor: "var(--border)" }}>Total</td>
                          <td className="px-3 py-1.5 text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.ssTotal.toFixed(4)}</td>
                          <td className="px-3 py-1.5 text-right font-mono" style={{ borderColor: "var(--border)" }}>{anova.dfBetween + anova.dfWithin}</td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
