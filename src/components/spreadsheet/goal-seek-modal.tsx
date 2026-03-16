"use client";

import { useState, useCallback } from "react";
import { X, Target, FlaskConical, Layers } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { parseCellRef, colToLetter } from "./formula-engine";

type Tab = "goalseek" | "whatif" | "scenario";

interface Scenario {
  name: string;
  values: Record<string, string>;
}

export function GoalSeekModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const pushUndo = useSpreadsheetStore((s) => s.pushUndo);

  const [tab, setTab] = useState<Tab>("goalseek");

  // Goal seek state
  const [targetCell, setTargetCell] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [changingCell, setChangingCell] = useState("");
  const [gsResult, setGsResult] = useState<string | null>(null);
  const [gsStatus, setGsStatus] = useState<"idle" | "solving" | "found" | "notfound">("idle");

  // What-if state
  const [wiCell, setWiCell] = useState("");
  const [wiValues, setWiValues] = useState("");
  const [wiResultCell, setWiResultCell] = useState("");
  const [wiResults, setWiResults] = useState<{ input: number; output: string }[]>([]);

  // Scenario state
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioCells, setScenarioCells] = useState("");

  const handleGoalSeek = useCallback(() => {
    const targetRef = parseCellRef(targetCell.toUpperCase());
    const changingRef = parseCellRef(changingCell.toUpperCase());
    if (!targetRef || !changingRef) {
      setGsStatus("notfound");
      setGsResult("Invalid cell references");
      return;
    }

    const goal = parseFloat(targetValue);
    if (isNaN(goal)) {
      setGsStatus("notfound");
      setGsResult("Invalid target value");
      return;
    }

    setGsStatus("solving");
    pushUndo();

    // Newton's method / bisection
    const originalValue = getCellRaw(changingRef.col, changingRef.row);
    let lo = -10000, hi = 10000;
    let guess = parseFloat(originalValue) || 0;

    // Try Newton-like approach first
    for (let iter = 0; iter < 200; iter++) {
      setCellValue(changingRef.col, changingRef.row, String(guess));
      const currentStr = getCellDisplay(targetRef.col, targetRef.row);
      const current = parseFloat(currentStr.replace(/[$,%]/g, ""));

      if (isNaN(current)) break;
      if (Math.abs(current - goal) < 1e-6) {
        setGsStatus("found");
        setGsResult(`Found: ${changingCell.toUpperCase()} = ${guess.toFixed(6)}`);
        return;
      }

      // Numerical derivative
      const h = Math.max(Math.abs(guess) * 1e-6, 1e-6);
      setCellValue(changingRef.col, changingRef.row, String(guess + h));
      const fPlusH = parseFloat(getCellDisplay(targetRef.col, targetRef.row).replace(/[$,%]/g, ""));

      if (isNaN(fPlusH)) break;
      const derivative = (fPlusH - current) / h;
      if (Math.abs(derivative) < 1e-12) break;

      guess = guess - (current - goal) / derivative;
      // Clamp
      if (guess < lo) guess = lo;
      if (guess > hi) guess = hi;
    }

    // Check final result
    setCellValue(changingRef.col, changingRef.row, String(guess));
    const finalStr = getCellDisplay(targetRef.col, targetRef.row);
    const finalVal = parseFloat(finalStr.replace(/[$,%]/g, ""));

    if (!isNaN(finalVal) && Math.abs(finalVal - goal) < 0.01) {
      setGsStatus("found");
      setGsResult(`Found: ${changingCell.toUpperCase()} = ${guess.toFixed(6)}`);
    } else {
      setGsStatus("notfound");
      setGsResult(`Could not find exact solution. Best: ${changingCell.toUpperCase()} = ${guess.toFixed(6)} (result: ${finalStr})`);
    }
  }, [targetCell, targetValue, changingCell, getCellDisplay, getCellRaw, setCellValue, pushUndo]);

  const handleWhatIf = useCallback(() => {
    const cellRef = parseCellRef(wiCell.toUpperCase());
    const resultRef = parseCellRef(wiResultCell.toUpperCase());
    if (!cellRef || !resultRef) return;

    const values = wiValues.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) return;

    pushUndo();
    const original = getCellRaw(cellRef.col, cellRef.row);
    const results: { input: number; output: string }[] = [];

    for (const val of values) {
      setCellValue(cellRef.col, cellRef.row, String(val));
      const output = getCellDisplay(resultRef.col, resultRef.row);
      results.push({ input: val, output });
    }

    // Restore original
    setCellValue(cellRef.col, cellRef.row, original);
    setWiResults(results);
  }, [wiCell, wiValues, wiResultCell, getCellRaw, getCellDisplay, setCellValue, pushUndo]);

  const handleSaveScenario = useCallback(() => {
    if (!scenarioName || !scenarioCells) return;
    const cells = scenarioCells.split(",").map(c => c.trim().toUpperCase());
    const values: Record<string, string> = {};
    for (const cell of cells) {
      const ref = parseCellRef(cell);
      if (ref) {
        values[cell] = getCellRaw(ref.col, ref.row);
      }
    }
    setScenarios(prev => [...prev, { name: scenarioName, values }]);
    setScenarioName("");
  }, [scenarioName, scenarioCells, getCellRaw]);

  const handleApplyScenario = useCallback((scenario: Scenario) => {
    pushUndo();
    for (const [cell, value] of Object.entries(scenario.values)) {
      const ref = parseCellRef(cell);
      if (ref) {
        setCellValue(ref.col, ref.row, value);
      }
    }
  }, [setCellValue, pushUndo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[520px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Solver / Goal Seek</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {([
            { key: "goalseek" as Tab, label: "Goal Seek", icon: <Target size={12} /> },
            { key: "whatif" as Tab, label: "What-If", icon: <FlaskConical size={12} /> },
            { key: "scenario" as Tab, label: "Scenarios", icon: <Layers size={12} /> },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-medium border-b-2 ${
                tab === t.key ? "border-blue-500" : "border-transparent"
              }`}
              style={{ color: tab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Goal Seek */}
          {tab === "goalseek" && (
            <>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Find the input value needed to achieve a specific result.
              </p>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Set Cell (formula cell)</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. B5"
                  value={targetCell}
                  onChange={(e) => setTargetCell(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>To Value</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. 1000"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>By Changing Cell</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. A1"
                  value={changingCell}
                  onChange={(e) => setChangingCell(e.target.value)}
                />
              </div>
              <button
                onClick={handleGoalSeek}
                className="w-full px-3 py-2 text-xs rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {gsStatus === "solving" ? "Solving..." : "Find Solution"}
              </button>
              {gsResult && (
                <div
                  className="p-3 rounded text-xs"
                  style={{
                    backgroundColor: gsStatus === "found" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: gsStatus === "found" ? "#16a34a" : "#dc2626",
                    border: `1px solid ${gsStatus === "found" ? "#22c55e" : "#ef4444"}`,
                  }}
                >
                  {gsResult}
                </div>
              )}
            </>
          )}

          {/* What-If */}
          {tab === "whatif" && (
            <>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Test multiple input values and see the results.
              </p>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Input Cell</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. A1"
                  value={wiCell}
                  onChange={(e) => setWiCell(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Test Values (comma-separated)</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. 100, 200, 300, 500, 1000"
                  value={wiValues}
                  onChange={(e) => setWiValues(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Result Cell</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. B5"
                  value={wiResultCell}
                  onChange={(e) => setWiResultCell(e.target.value)}
                />
              </div>
              <button
                onClick={handleWhatIf}
                className="w-full px-3 py-2 text-xs rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Run Analysis
              </button>
              {wiResults.length > 0 && (
                <div className="border rounded overflow-auto max-h-[200px]" style={{ borderColor: "var(--border)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Input</th>
                        <th className="text-right px-2 py-1 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wiResults.map((r, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 border-b font-mono" style={{ borderColor: "var(--border)" }}>{r.input}</td>
                          <td className="px-2 py-1 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{r.output}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Scenarios */}
          {tab === "scenario" && (
            <>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Save and compare different sets of input values.
              </p>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Changing Cells (comma-separated)</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. A1, B1, C1"
                  value={scenarioCells}
                  onChange={(e) => setScenarioCells(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="Scenario name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                />
                <button
                  onClick={handleSaveScenario}
                  className="px-3 py-1.5 text-xs rounded hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Save Current
                </button>
              </div>
              {scenarios.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Saved Scenarios</div>
                  {scenarios.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div>
                        <div className="text-xs font-medium">{s.name}</div>
                        <div className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                          {Object.entries(s.values).map(([k, v]) => `${k}=${v}`).join(", ")}
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyScenario(s)}
                        className="px-2 py-1 text-[10px] rounded border hover:opacity-80"
                        style={{ borderColor: "var(--border)" }}
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
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
