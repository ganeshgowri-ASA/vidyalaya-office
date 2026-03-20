"use client";

import { useState, useCallback, useMemo } from "react";
import { X, ArrowRight, Search, Zap } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

type FormulaType = "VLOOKUP" | "XLOOKUP" | "INDEX_MATCH";

export function VlookupHelperModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const pushUndo = useSpreadsheetStore((s) => s.pushUndo);

  const [formulaType, setFormulaType] = useState<FormulaType>("VLOOKUP");

  // VLOOKUP fields
  const [lookupValue, setLookupValue] = useState("");
  const [tableRange, setTableRange] = useState("");
  const [colIndex, setColIndex] = useState("2");
  const [exactMatch, setExactMatch] = useState(true);

  // XLOOKUP fields
  const [xlLookupValue, setXlLookupValue] = useState("");
  const [xlLookupArray, setXlLookupArray] = useState("");
  const [xlReturnArray, setXlReturnArray] = useState("");
  const [xlIfNotFound, setXlIfNotFound] = useState("");
  const [xlMatchMode, setXlMatchMode] = useState("0");

  // INDEX-MATCH fields
  const [imReturnRange, setImReturnRange] = useState("");
  const [imLookupValue, setImLookupValue] = useState("");
  const [imLookupRange, setImLookupRange] = useState("");

  // Detect available columns from data
  const detectedColumns = useMemo(() => {
    const cols: { letter: string; header: string }[] = [];
    for (let c = 0; c < 26; c++) {
      const header = getCellDisplay(c, 0);
      if (header) {
        cols.push({ letter: colToLetter(c), header });
      } else break;
    }
    return cols;
  }, [getCellDisplay]);

  const generatedFormula = useMemo(() => {
    switch (formulaType) {
      case "VLOOKUP": {
        if (!lookupValue || !tableRange || !colIndex) return "";
        return `=VLOOKUP(${lookupValue}, ${tableRange}, ${colIndex}, ${exactMatch ? "FALSE" : "TRUE"})`;
      }
      case "XLOOKUP": {
        if (!xlLookupValue || !xlLookupArray || !xlReturnArray) return "";
        let formula = `=XLOOKUP(${xlLookupValue}, ${xlLookupArray}, ${xlReturnArray}`;
        if (xlIfNotFound) formula += `, "${xlIfNotFound}"`;
        if (xlMatchMode !== "0") formula += `, ${xlMatchMode}`;
        formula += ")";
        return formula;
      }
      case "INDEX_MATCH": {
        if (!imReturnRange || !imLookupValue || !imLookupRange) return "";
        return `=INDEX(${imReturnRange}, MATCH(${imLookupValue}, ${imLookupRange}, 0))`;
      }
    }
  }, [formulaType, lookupValue, tableRange, colIndex, exactMatch, xlLookupValue, xlLookupArray, xlReturnArray, xlIfNotFound, xlMatchMode, imReturnRange, imLookupValue, imLookupRange]);

  const handleInsert = useCallback(() => {
    if (!activeCell || !generatedFormula) return;
    pushUndo();
    setCellValue(activeCell.col, activeCell.row, generatedFormula);
    onClose();
  }, [activeCell, generatedFormula, setCellValue, pushUndo, onClose]);

  if (!open) return null;

  const InputField = ({ label, value, onChange, placeholder, monospace }: {
    label: string; value: string; onChange: (v: string) => void; placeholder: string; monospace?: boolean;
  }) => (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</label>
      <input
        type="text"
        className={`w-full text-sm rounded px-2 py-1.5 border outline-none ${monospace ? "font-mono" : ""}`}
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[550px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Search size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold">Lookup Formula Helper</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Formula type selector */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {([
            { key: "VLOOKUP" as FormulaType, label: "VLOOKUP" },
            { key: "XLOOKUP" as FormulaType, label: "XLOOKUP" },
            { key: "INDEX_MATCH" as FormulaType, label: "INDEX-MATCH" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setFormulaType(t.key)}
              className="px-4 py-2 text-xs font-medium border-b-2"
              style={{
                borderColor: formulaType === t.key ? "var(--primary)" : "transparent",
                color: formulaType === t.key ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Detected columns hint */}
          {detectedColumns.length > 0 && (
            <div className="p-2 rounded text-[10px]" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
              <span className="font-semibold">Detected columns: </span>
              {detectedColumns.map((c, i) => (
                <span key={i}>{c.letter}: {c.header}{i < detectedColumns.length - 1 ? ", " : ""}</span>
              ))}
            </div>
          )}

          {/* VLOOKUP */}
          {formulaType === "VLOOKUP" && (
            <>
              <div className="p-2 rounded text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <span className="font-mono">VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])</span>
              </div>

              <InputField label="Lookup Value (what to search for)" value={lookupValue} onChange={setLookupValue} placeholder="e.g. E2 or &quot;Product A&quot;" monospace />
              <InputField label="Table Array (data range)" value={tableRange} onChange={setTableRange} placeholder="e.g. A1:D100 or Products" monospace />

              <div className="grid grid-cols-2 gap-3">
                <InputField label="Column Index (return column #)" value={colIndex} onChange={setColIndex} placeholder="e.g. 2" monospace />
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Match Type</label>
                  <select
                    className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    value={exactMatch ? "exact" : "approximate"}
                    onChange={(e) => setExactMatch(e.target.value === "exact")}
                  >
                    <option value="exact">Exact Match (FALSE)</option>
                    <option value="approximate">Approximate (TRUE)</option>
                  </select>
                </div>
              </div>

              {/* Visual diagram */}
              <div className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                <div className="text-[10px] font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>How it works:</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="px-2 py-1 rounded" style={{ backgroundColor: "#fef08a", color: "#000" }}>
                    {lookupValue || "lookup_value"}
                  </div>
                  <ArrowRight size={12} style={{ color: "var(--muted-foreground)" }} />
                  <div className="px-2 py-1 rounded" style={{ backgroundColor: "#dbeafe", color: "#000" }}>
                    Search Column 1 of {tableRange || "table"}
                  </div>
                  <ArrowRight size={12} style={{ color: "var(--muted-foreground)" }} />
                  <div className="px-2 py-1 rounded" style={{ backgroundColor: "#bbf7d0", color: "#000" }}>
                    Return Column {colIndex || "?"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* XLOOKUP */}
          {formulaType === "XLOOKUP" && (
            <>
              <div className="p-2 rounded text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <span className="font-mono">XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])</span>
              </div>

              <InputField label="Lookup Value" value={xlLookupValue} onChange={setXlLookupValue} placeholder="e.g. E2" monospace />
              <InputField label="Lookup Array (search column)" value={xlLookupArray} onChange={setXlLookupArray} placeholder="e.g. A:A or A1:A100" monospace />
              <InputField label="Return Array (return column)" value={xlReturnArray} onChange={setXlReturnArray} placeholder="e.g. C:C or C1:C100" monospace />
              <InputField label="If Not Found (optional)" value={xlIfNotFound} onChange={setXlIfNotFound} placeholder='e.g. "Not Found"' />

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Match Mode</label>
                <select
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={xlMatchMode}
                  onChange={(e) => setXlMatchMode(e.target.value)}
                >
                  <option value="0">0 - Exact match</option>
                  <option value="-1">-1 - Exact or next smaller</option>
                  <option value="1">1 - Exact or next larger</option>
                  <option value="2">2 - Wildcard match</option>
                </select>
              </div>
            </>
          )}

          {/* INDEX-MATCH */}
          {formulaType === "INDEX_MATCH" && (
            <>
              <div className="p-2 rounded text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <span className="font-mono">INDEX(return_range, MATCH(lookup_value, lookup_range, 0))</span>
              </div>

              <InputField label="Return Range (column to return from)" value={imReturnRange} onChange={setImReturnRange} placeholder="e.g. C1:C100" monospace />
              <InputField label="Lookup Value (what to search for)" value={imLookupValue} onChange={setImLookupValue} placeholder="e.g. E2" monospace />
              <InputField label="Lookup Range (column to search in)" value={imLookupRange} onChange={setImLookupRange} placeholder="e.g. A1:A100" monospace />

              <div className="p-2 rounded text-[10px]" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                <Zap size={10} className="inline mr-1" />
                INDEX-MATCH is more flexible than VLOOKUP: it can look left, handle column insertions, and search any column.
              </div>
            </>
          )}

          {/* Generated formula */}
          {generatedFormula && (
            <div className="border rounded p-3" style={{ borderColor: "var(--primary)", backgroundColor: "rgba(59,130,246,0.05)" }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: "var(--primary)" }}>Generated Formula:</div>
              <code className="text-sm font-mono break-all" style={{ color: "var(--foreground)" }}>
                {generatedFormula}
              </code>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            onClick={() => {
              if (generatedFormula) {
                navigator.clipboard?.writeText(generatedFormula);
              }
            }}
          >
            Copy Formula
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            onClick={handleInsert}
            disabled={!generatedFormula || !activeCell}
          >
            Insert into Cell
          </button>
        </div>
      </div>
    </div>
  );
}
