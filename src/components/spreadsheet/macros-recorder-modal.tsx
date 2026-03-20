"use client";

import { useState, useCallback } from "react";
import { X, Circle, Square, Play, Trash2, Edit3, Code } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

interface MacroAction {
  type: "setCellValue" | "setCellStyle" | "insertRow" | "deleteRow" | "insertCol" | "deleteCol";
  params: Record<string, unknown>;
  timestamp: number;
}

interface Macro {
  id: string;
  name: string;
  description: string;
  actions: MacroAction[];
  createdAt: string;
}

export function MacrosRecorderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const setCellStyle = useSpreadsheetStore((s) => s.setCellStyle);
  const insertRows = useSpreadsheetStore((s) => s.insertRows);
  const deleteRows = useSpreadsheetStore((s) => s.deleteRows);
  const insertCols = useSpreadsheetStore((s) => s.insertCols);
  const deleteCols = useSpreadsheetStore((s) => s.deleteCols);
  const pushUndo = useSpreadsheetStore((s) => s.pushUndo);

  const [macros, setMacros] = useState<Macro[]>([
    {
      id: "macro-sample-1",
      name: "Format Header Row",
      description: "Bold and center-align row 1, add blue background",
      actions: [
        { type: "setCellStyle", params: { col: 0, row: 0, style: { bold: true, align: "center", bgColor: "#1e40af", textColor: "#ffffff" } }, timestamp: 0 },
        { type: "setCellStyle", params: { col: 1, row: 0, style: { bold: true, align: "center", bgColor: "#1e40af", textColor: "#ffffff" } }, timestamp: 1 },
        { type: "setCellStyle", params: { col: 2, row: 0, style: { bold: true, align: "center", bgColor: "#1e40af", textColor: "#ffffff" } }, timestamp: 2 },
        { type: "setCellStyle", params: { col: 3, row: 0, style: { bold: true, align: "center", bgColor: "#1e40af", textColor: "#ffffff" } }, timestamp: 3 },
        { type: "setCellStyle", params: { col: 4, row: 0, style: { bold: true, align: "center", bgColor: "#1e40af", textColor: "#ffffff" } }, timestamp: 4 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: "macro-sample-2",
      name: "Add Sum Row",
      description: "Insert SUM formulas for columns A-E at the bottom of data",
      actions: [
        { type: "setCellValue", params: { col: 0, row: 20, value: "Total" }, timestamp: 0 },
        { type: "setCellValue", params: { col: 1, row: 20, value: "=SUM(B2:B20)" }, timestamp: 1 },
        { type: "setCellValue", params: { col: 2, row: 20, value: "=SUM(C2:C20)" }, timestamp: 2 },
        { type: "setCellValue", params: { col: 3, row: 20, value: "=SUM(D2:D20)" }, timestamp: 3 },
        { type: "setCellValue", params: { col: 4, row: 20, value: "=SUM(E2:E20)" }, timestamp: 4 },
        { type: "setCellStyle", params: { col: 0, row: 20, style: { bold: true } }, timestamp: 5 },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [currentActions, setCurrentActions] = useState<MacroAction[]>([]);
  const [macroName, setMacroName] = useState("");
  const [macroDescription, setMacroDescription] = useState("");
  const [editingMacro, setEditingMacro] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<string | null>(null);
  const [tab, setTab] = useState<"list" | "record">("list");

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setCurrentActions([]);
    setMacroName(`Macro${macros.length + 1}`);
    setMacroDescription("");
    setTab("record");
  }, [macros.length]);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (currentActions.length > 0 && macroName) {
      setMacros((prev) => [...prev, {
        id: `macro-${Date.now()}`,
        name: macroName,
        description: macroDescription,
        actions: currentActions,
        createdAt: new Date().toISOString(),
      }]);
    }
    setTab("list");
  }, [currentActions, macroName, macroDescription]);

  const handleRunMacro = useCallback((macro: Macro) => {
    pushUndo();
    for (const action of macro.actions) {
      switch (action.type) {
        case "setCellValue":
          setCellValue(
            action.params.col as number,
            action.params.row as number,
            action.params.value as string
          );
          break;
        case "setCellStyle":
          setCellStyle(
            action.params.col as number,
            action.params.row as number,
            action.params.style as Record<string, unknown>
          );
          break;
        case "insertRow":
          insertRows(action.params.row as number, 1);
          break;
        case "deleteRow":
          deleteRows(action.params.row as number, 1);
          break;
        case "insertCol":
          insertCols(action.params.col as number, 1);
          break;
        case "deleteCol":
          deleteCols(action.params.col as number, 1);
          break;
      }
    }
  }, [setCellValue, setCellStyle, insertRows, deleteRows, insertCols, deleteCols, pushUndo]);

  const handleDeleteMacro = useCallback((id: string) => {
    setMacros((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const generateCode = useCallback((macro: Macro): string => {
    let code = `// Macro: ${macro.name}\n`;
    code += `// ${macro.description}\n\n`;
    for (const action of macro.actions) {
      switch (action.type) {
        case "setCellValue":
          code += `setCellValue(${action.params.col}, ${action.params.row}, "${action.params.value}");\n`;
          break;
        case "setCellStyle":
          code += `setCellStyle(${action.params.col}, ${action.params.row}, ${JSON.stringify(action.params.style)});\n`;
          break;
        case "insertRow":
          code += `insertRows(${action.params.row}, 1);\n`;
          break;
        case "deleteRow":
          code += `deleteRows(${action.params.row}, 1);\n`;
          break;
        case "insertCol":
          code += `insertCols(${action.params.col}, 1);\n`;
          break;
        case "deleteCol":
          code += `deleteCols(${action.params.col}, 1);\n`;
          break;
      }
    }
    return code;
  }, []);

  // Simulate recording by capturing store changes
  const handleAddRecordedAction = useCallback((type: MacroAction["type"], params: Record<string, unknown>) => {
    setCurrentActions((prev) => [...prev, { type, params, timestamp: Date.now() }]);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[550px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Macro Recorder</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setTab("list")}
            className="px-4 py-2 text-xs font-medium border-b-2"
            style={{
              borderColor: tab === "list" ? "var(--primary)" : "transparent",
              color: tab === "list" ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            Macro List ({macros.length})
          </button>
          <button
            onClick={() => setTab("record")}
            className="px-4 py-2 text-xs font-medium border-b-2"
            style={{
              borderColor: tab === "record" ? "var(--primary)" : "transparent",
              color: tab === "record" ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            {isRecording ? "Recording..." : "Record New"}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {tab === "list" && (
            <div className="space-y-2">
              {macros.length === 0 && (
                <div className="text-xs text-center py-8" style={{ color: "var(--muted-foreground)" }}>
                  No macros saved. Click &quot;Record New&quot; to create one.
                </div>
              )}
              {macros.map((macro) => (
                <div
                  key={macro.id}
                  className="border rounded p-3"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-xs">{macro.name}</div>
                    <div className="flex items-center gap-1">
                      <button
                        title="Run Macro"
                        className="p-1 rounded hover:opacity-70"
                        style={{ color: "#22c55e" }}
                        onClick={() => handleRunMacro(macro)}
                      >
                        <Play size={14} />
                      </button>
                      <button
                        title="View Code"
                        className="p-1 rounded hover:opacity-70"
                        style={{ color: "var(--muted-foreground)" }}
                        onClick={() => setShowCode(showCode === macro.id ? null : macro.id)}
                      >
                        <Code size={14} />
                      </button>
                      <button
                        title="Delete"
                        className="p-1 rounded hover:opacity-70"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleDeleteMacro(macro.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {macro.description} &bull; {macro.actions.length} actions
                  </div>
                  {showCode === macro.id && (
                    <pre
                      className="mt-2 p-2 rounded text-[10px] font-mono overflow-auto max-h-32"
                      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
                    >
                      {generateCode(macro)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "record" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Macro Name</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={macroName}
                  onChange={(e) => setMacroName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Description</label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="What does this macro do?"
                  value={macroDescription}
                  onChange={(e) => setMacroDescription(e.target.value)}
                />
              </div>

              {!isRecording ? (
                <button
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 text-xs rounded hover:opacity-90"
                  style={{ backgroundColor: "#dc2626", color: "#fff" }}
                  onClick={handleStartRecording}
                >
                  <Circle size={14} fill="currentColor" /> Start Recording
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ backgroundColor: "rgba(220,38,38,0.1)", border: "1px solid #dc2626" }}>
                    <Circle size={10} fill="#dc2626" className="animate-pulse" style={{ color: "#dc2626" }} />
                    <span className="text-xs font-medium" style={{ color: "#dc2626" }}>Recording... {currentActions.length} actions captured</span>
                  </div>

                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Add actions manually while recording:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-2 py-1.5 text-xs rounded border hover:opacity-80"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => {
                        const cell = prompt("Cell (e.g. A1):");
                        const value = prompt("Value:");
                        if (cell && value !== null) {
                          const match = cell.match(/^([A-Z]+)(\d+)$/i);
                          if (match) {
                            const col = match[1].toUpperCase().split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
                            const row = parseInt(match[2]) - 1;
                            handleAddRecordedAction("setCellValue", { col, row, value });
                          }
                        }
                      }}
                    >
                      Set Cell Value
                    </button>
                    <button
                      className="px-2 py-1.5 text-xs rounded border hover:opacity-80"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => {
                        const cell = prompt("Cell (e.g. A1):");
                        if (cell) {
                          const match = cell.match(/^([A-Z]+)(\d+)$/i);
                          if (match) {
                            const col = match[1].toUpperCase().split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
                            const row = parseInt(match[2]) - 1;
                            handleAddRecordedAction("setCellStyle", { col, row, style: { bold: true } });
                          }
                        }
                      }}
                    >
                      Bold Cell
                    </button>
                    <button
                      className="px-2 py-1.5 text-xs rounded border hover:opacity-80"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => {
                        const row = prompt("Insert row at (1-based):");
                        if (row) handleAddRecordedAction("insertRow", { row: parseInt(row) - 1 });
                      }}
                    >
                      Insert Row
                    </button>
                    <button
                      className="px-2 py-1.5 text-xs rounded border hover:opacity-80"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => {
                        const row = prompt("Delete row at (1-based):");
                        if (row) handleAddRecordedAction("deleteRow", { row: parseInt(row) - 1 });
                      }}
                    >
                      Delete Row
                    </button>
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded hover:opacity-90"
                    style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                    onClick={handleStopRecording}
                  >
                    <Square size={14} /> Stop Recording & Save
                  </button>
                </>
              )}

              {currentActions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>Recorded Actions:</div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {currentActions.map((a, i) => (
                      <div key={i} className="text-[10px] font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--muted)" }}>
                        {a.type}({Object.entries(a.params).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(", ")})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
