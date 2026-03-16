"use client";

import { useState, useCallback } from "react";
import { X, Target, FlaskConical, Layers, Table2, Cog } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { parseCellRef, colToLetter } from "./formula-engine";

type Tab = "goalseek" | "whatif" | "scenario" | "datatable" | "solver";

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

  // Data Table state
  const [dtRowInput, setDtRowInput] = useState("");
  const [dtColInput, setDtColInput] = useState("");
  const [dtFormula, setDtFormula] = useState("");
  const [dtRowValues, setDtRowValues] = useState("");
  const [dtColValues, setDtColValues] = useState("");
  const [dtResults, setDtResults] = useState<{ row: string; col: string; result: string }[]>([]);

  // Solver state
  const [solverTarget, setSolverTarget] = useState("");
  const [solverObjective, setSolverObjective] = useState<"max" | "min" | "value">("max");
  const [solverTargetValue, setSolverTargetValue] = useState("0");
  const [solverChanging, setSolverChanging] = useState("");
  const [solverConstraints, setSolverConstraints] = useState<{ cell: string; op: string; value: string }[]>([]);
  const [solverResult, setSolverResult] = useState<string | null>(null);

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

  const handleDataTable = useCallback(() => {
    const rowRef = dtRowInput ? parseCellRef(dtRowInput.toUpperCase()) : null;
    const formulaRef = parseCellRef(dtFormula.toUpperCase());
    if (!formulaRef) return;

    const rowVals = dtRowValues.split(",").map(v => v.trim()).filter(Boolean);
    const colVals = dtColValues.split(",").map(v => v.trim()).filter(Boolean);
    if (rowVals.length === 0 && colVals.length === 0) return;

    pushUndo();
    const results: { row: string; col: string; result: string }[] = [];

    if (rowVals.length > 0 && colVals.length === 0) {
      // One-variable data table (row)
      const origVal = rowRef ? getCellRaw(rowRef.col, rowRef.row) : "";
      for (const val of rowVals) {
        if (rowRef) setCellValue(rowRef.col, rowRef.row, val);
        results.push({ row: val, col: "-", result: getCellDisplay(formulaRef.col, formulaRef.row) });
      }
      if (rowRef) setCellValue(rowRef.col, rowRef.row, origVal);
    } else if (colVals.length > 0 && rowVals.length === 0) {
      const colRef = dtColInput ? parseCellRef(dtColInput.toUpperCase()) : null;
      const origVal = colRef ? getCellRaw(colRef.col, colRef.row) : "";
      for (const val of colVals) {
        if (colRef) setCellValue(colRef.col, colRef.row, val);
        results.push({ row: "-", col: val, result: getCellDisplay(formulaRef.col, formulaRef.row) });
      }
      if (colRef) setCellValue(colRef.col, colRef.row, origVal);
    } else {
      // Two-variable data table
      const colRef = dtColInput ? parseCellRef(dtColInput.toUpperCase()) : null;
      const origRow = rowRef ? getCellRaw(rowRef.col, rowRef.row) : "";
      const origCol = colRef ? getCellRaw(colRef.col, colRef.row) : "";
      for (const rv of rowVals) {
        for (const cv of colVals) {
          if (rowRef) setCellValue(rowRef.col, rowRef.row, rv);
          if (colRef) setCellValue(colRef.col, colRef.row, cv);
          results.push({ row: rv, col: cv, result: getCellDisplay(formulaRef.col, formulaRef.row) });
        }
      }
      if (rowRef) setCellValue(rowRef.col, rowRef.row, origRow);
      if (colRef) setCellValue(colRef.col, colRef.row, origCol);
    }
    setDtResults(results);
  }, [dtRowInput, dtColInput, dtFormula, dtRowValues, dtColValues, getCellRaw, getCellDisplay, setCellValue, pushUndo]);

  const handleSolver = useCallback(() => {
    const targetRef = parseCellRef(solverTarget.toUpperCase());
    if (!targetRef) { setSolverResult("Invalid target cell"); return; }
    const changingCells = solverChanging.split(",").map(c => {
      const ref = parseCellRef(c.trim().toUpperCase());
      return ref ? { cell: c.trim().toUpperCase(), ref } : null;
    }).filter(Boolean) as { cell: string; ref: { col: number; row: number } }[];
    if (changingCells.length === 0) { setSolverResult("Invalid changing cells"); return; }

    pushUndo();
    const origValues = changingCells.map(c => ({ ...c, orig: getCellRaw(c.ref.col, c.ref.row) }));

    // Simple gradient-based optimizer (steepest descent)
    let bestVal = -Infinity;
    let bestGuesses = changingCells.map(c => parseFloat(getCellRaw(c.ref.col, c.ref.row)) || 0);

    for (let iter = 0; iter < 200; iter++) {
      // Evaluate current
      changingCells.forEach((c, i) => setCellValue(c.ref.col, c.ref.row, String(bestGuesses[i])));
      const current = parseFloat(getCellDisplay(targetRef.col, targetRef.row).replace(/[$,%]/g, ""));
      if (isNaN(current)) break;

      if (solverObjective === "max" && current > bestVal) bestVal = current;
      else if (solverObjective === "min" && (bestVal === -Infinity || current < -bestVal)) bestVal = -current;
      else if (solverObjective === "value") {
        const goal = parseFloat(solverTargetValue);
        if (!isNaN(goal) && Math.abs(current - goal) < 0.001) {
          setSolverResult(`Solution found! Target = ${current.toFixed(4)}, Variables: ${bestGuesses.map((g, i) => `${changingCells[i].cell}=${g.toFixed(4)}`).join(", ")}`);
          return;
        }
      }

      // Gradient step
      const lr = Math.max(0.01, 1 / (1 + iter * 0.1));
      for (let j = 0; j < changingCells.length; j++) {
        const h = Math.max(Math.abs(bestGuesses[j]) * 1e-5, 1e-5);
        setCellValue(changingCells[j].ref.col, changingCells[j].ref.row, String(bestGuesses[j] + h));
        const fPlus = parseFloat(getCellDisplay(targetRef.col, targetRef.row).replace(/[$,%]/g, ""));
        if (isNaN(fPlus)) continue;
        const grad = (fPlus - current) / h;
        if (solverObjective === "max") bestGuesses[j] += lr * grad;
        else if (solverObjective === "min") bestGuesses[j] -= lr * grad;
        else {
          const goal = parseFloat(solverTargetValue) || 0;
          bestGuesses[j] -= lr * (current - goal) * grad / (grad * grad + 1e-10);
        }
      }
    }

    changingCells.forEach((c, i) => setCellValue(c.ref.col, c.ref.row, String(bestGuesses[i])));
    const finalVal = getCellDisplay(targetRef.col, targetRef.row);
    setSolverResult(`Solver completed. Target = ${finalVal}, Variables: ${bestGuesses.map((g, i) => `${changingCells[i].cell}=${g.toFixed(4)}`).join(", ")}`);
  }, [solverTarget, solverObjective, solverTargetValue, solverChanging, getCellRaw, getCellDisplay, setCellValue, pushUndo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[600px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
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
            { key: "datatable" as Tab, label: "Data Tables", icon: <Table2 size={12} /> },
            { key: "scenario" as Tab, label: "Scenarios", icon: <Layers size={12} /> },
            { key: "solver" as Tab, label: "Solver", icon: <Cog size={12} /> },
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

          {/* Data Tables */}
          {tab === "datatable" && (
            <>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Create a data table to see how changing one or two variables affects formula results.
              </p>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Formula Cell</label>
                <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. C5" value={dtFormula} onChange={(e) => setDtFormula(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Row Input Cell</label>
                  <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    placeholder="e.g. A1" value={dtRowInput} onChange={(e) => setDtRowInput(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Column Input Cell</label>
                  <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    placeholder="e.g. B1" value={dtColInput} onChange={(e) => setDtColInput(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Row Values (comma-separated)</label>
                <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. 5, 10, 15, 20" value={dtRowValues} onChange={(e) => setDtRowValues(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Column Values (comma-separated)</label>
                <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. 100, 200, 300" value={dtColValues} onChange={(e) => setDtColValues(e.target.value)} />
              </div>
              <button onClick={handleDataTable} className="w-full px-3 py-2 text-xs rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
                Generate Data Table
              </button>
              {dtResults.length > 0 && (
                <div className="border rounded overflow-auto max-h-[200px]" style={{ borderColor: "var(--border)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Row Input</th>
                        <th className="text-left px-2 py-1 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Col Input</th>
                        <th className="text-right px-2 py-1 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dtResults.map((r, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 border-b font-mono" style={{ borderColor: "var(--border)" }}>{r.row}</td>
                          <td className="px-2 py-1 border-b font-mono" style={{ borderColor: "var(--border)" }}>{r.col}</td>
                          <td className="px-2 py-1 border-b text-right font-mono font-bold" style={{ borderColor: "var(--border)" }}>{r.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Solver */}
          {tab === "solver" && (
            <>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Find optimal values for a formula by changing multiple cells subject to constraints.
              </p>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Objective Cell (formula)</label>
                <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. D10" value={solverTarget} onChange={(e) => setSolverTarget(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Objective</label>
                <div className="flex gap-3 text-xs">
                  {(["max", "min", "value"] as const).map(obj => (
                    <label key={obj} className="flex items-center gap-1">
                      <input type="radio" name="solver-obj" checked={solverObjective === obj} onChange={() => setSolverObjective(obj)} className="w-3 h-3" />
                      {obj === "max" ? "Maximize" : obj === "min" ? "Minimize" : "Target Value"}
                    </label>
                  ))}
                </div>
                {solverObjective === "value" && (
                  <input type="text" className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    placeholder="Target value" value={solverTargetValue} onChange={(e) => setSolverTargetValue(e.target.value)} />
                )}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Changing Variable Cells (comma-separated)</label>
                <input type="text" className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="e.g. A1, A2, A3" value={solverChanging} onChange={(e) => setSolverChanging(e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Constraints</label>
                  <button onClick={() => setSolverConstraints(prev => [...prev, { cell: "", op: "<=", value: "" }])}
                    className="text-[10px] px-2 py-0.5 rounded border hover:opacity-80"
                    style={{ borderColor: "var(--border)" }}>
                    + Add
                  </button>
                </div>
                {solverConstraints.map((c, i) => (
                  <div key={i} className="flex gap-1 mb-1">
                    <input type="text" className="w-20 text-xs rounded px-1 py-1 border outline-none font-mono"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      placeholder="Cell" value={c.cell}
                      onChange={(e) => setSolverConstraints(prev => prev.map((cc, j) => j === i ? { ...cc, cell: e.target.value } : cc))} />
                    <select className="text-xs rounded px-1 py-1 border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      value={c.op}
                      onChange={(e) => setSolverConstraints(prev => prev.map((cc, j) => j === i ? { ...cc, op: e.target.value } : cc))}>
                      <option value="<=">{"<="}</option>
                      <option value=">=">{">="}</option>
                      <option value="=">=</option>
                    </select>
                    <input type="text" className="w-20 text-xs rounded px-1 py-1 border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      placeholder="Value" value={c.value}
                      onChange={(e) => setSolverConstraints(prev => prev.map((cc, j) => j === i ? { ...cc, value: e.target.value } : cc))} />
                    <button onClick={() => setSolverConstraints(prev => prev.filter((_, j) => j !== i))}
                      className="text-xs px-1 hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>x</button>
                  </div>
                ))}
              </div>
              <button onClick={handleSolver} className="w-full px-3 py-2 text-xs rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
                Solve
              </button>
              {solverResult && (
                <div className="p-3 rounded text-xs" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="font-medium mb-1">Result:</div>
                  <div className="font-mono">{solverResult}</div>
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
