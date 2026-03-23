"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter, FORMULA_FUNCTIONS, type FormulaFunctionInfo } from "./formula-engine";
import { Check, X } from "lucide-react";

export function FormulaBar() {
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const editingCell = useSpreadsheetStore((s) => s.editingCell);
  const editValue = useSpreadsheetStore((s) => s.editValue);
  const setEditValue = useSpreadsheetStore((s) => s.setEditValue);
  const startEditing = useSpreadsheetStore((s) => s.startEditing);
  const commitEdit = useSpreadsheetStore((s) => s.commitEdit);
  const cancelEdit = useSpreadsheetStore((s) => s.cancelEdit);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);
  const namedRanges = useSpreadsheetStore((s) => s.namedRanges);

  const [suggestions, setSuggestions] = useState<FormulaFunctionInfo[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSignature, setShowSignature] = useState<FormulaFunctionInfo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cellRef = activeCell
    ? `${colToLetter(activeCell.col)}${activeCell.row + 1}`
    : "";

  const displayValue = editingCell
    ? editValue
    : activeCell
      ? getCellRaw(activeCell.col, activeCell.row)
      : "";

  const isFormula = displayValue.startsWith("=");

  const updateSuggestions = useCallback((value: string) => {
    if (!value.startsWith("=")) {
      setSuggestions([]);
      setShowSignature(null);
      return;
    }

    // Find the last function being typed
    const afterEquals = value.slice(1);
    // Check if cursor is inside a function call (show signature)
    const openParenIdx = afterEquals.lastIndexOf("(");
    if (openParenIdx >= 0) {
      // Find the function name before the paren
      const beforeParen = afterEquals.slice(0, openParenIdx);
      const funcMatch = beforeParen.match(/([A-Z]+)$/i);
      if (funcMatch) {
        const funcName = funcMatch[1].toUpperCase();
        const info = FORMULA_FUNCTIONS.find((f) => f.name === funcName);
        if (info) setShowSignature(info);
        else setShowSignature(null);
      }
      setSuggestions([]);
      return;
    }

    // Show autocomplete for partial function name
    const funcMatch = afterEquals.match(/([A-Z]+)$/i);
    if (funcMatch && funcMatch[1].length >= 1) {
      const partial = funcMatch[1].toUpperCase();
      const matches = FORMULA_FUNCTIONS.filter((f) =>
        f.name.startsWith(partial)
      ).slice(0, 8);
      setSuggestions(matches);
      setSelectedSuggestion(0);
      setShowSignature(null);
    } else {
      setSuggestions([]);
      setShowSignature(null);
    }
  }, []);

  const applySuggestion = useCallback((func: FormulaFunctionInfo) => {
    const value = editValue;
    // Replace partial function name with full name + opening paren
    const afterEquals = value.slice(1);
    const funcMatch = afterEquals.match(/([A-Z]+)$/i);
    if (funcMatch) {
      const newValue = value.slice(0, value.length - funcMatch[1].length) + func.name + "(";
      setEditValue(newValue);
      setShowSignature(func);
    }
    setSuggestions([]);
    inputRef.current?.focus();
  }, [editValue, setEditValue]);

  // Close suggestions on escape or when not editing
  useEffect(() => {
    if (!editingCell) {
      setSuggestions([]);
      setShowSignature(null);
    }
  }, [editingCell]);

  return (
    <div
      className="flex items-center border-b px-1 py-0.5 gap-1 relative"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Name Box */}
      <div
        className="w-20 text-center text-xs font-mono font-semibold rounded px-1 py-0.5 cursor-pointer border"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          borderColor: "var(--border)",
        }}
        title={`Cell: ${cellRef}`}
        onClick={() => {
          const input = prompt("Go to cell (e.g. A1) or named range:", cellRef);
          if (!input) return;
          const namedRange = namedRanges[input];
          if (namedRange) {
            const match = namedRange.match(/^([A-Z]+)(\d+)/i);
            if (match) {
              const col = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
              const row = parseInt(match[2]) - 1;
              useSpreadsheetStore.getState().setActiveCell(col, row);
            }
            return;
          }
          const match = input.match(/^([A-Z]+)(\d+)$/i);
          if (match) {
            const col = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
            const row = parseInt(match[2]) - 1;
            if (col >= 0 && row >= 0) {
              useSpreadsheetStore.getState().setActiveCell(col, row);
            }
          }
        }}
      >
        {cellRef}
      </div>

      {/* Cancel / Confirm buttons */}
      {editingCell && (
        <>
          <button
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: "var(--destructive, #ef4444)" }}
            onClick={cancelEdit}
            title="Cancel (Esc)"
          >
            <X size={14} />
          </button>
          <button
            className="p-0.5 rounded hover:opacity-70"
            style={{ color: "var(--primary, #22c55e)" }}
            onClick={commitEdit}
            title="Confirm (Enter)"
          >
            <Check size={14} />
          </button>
        </>
      )}

      {/* fx label */}
      <div
        className="text-xs px-1 font-semibold"
        style={{ color: isFormula ? "var(--primary)" : "var(--muted-foreground)" }}
      >
        <em>f</em>x
      </div>

      {/* Formula input */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          className="w-full text-xs font-mono px-2 py-0.5 rounded border outline-none"
          style={{
            borderColor: editingCell ? "var(--primary)" : "var(--border)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          }}
          value={displayValue}
          onChange={(e) => {
            if (!editingCell && activeCell) {
              startEditing(activeCell.col, activeCell.row);
            }
            setEditValue(e.target.value);
            updateSuggestions(e.target.value);
          }}
          onKeyDown={(e) => {
            if (suggestions.length > 0) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedSuggestion((s) => Math.min(s + 1, suggestions.length - 1));
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedSuggestion((s) => Math.max(s - 1, 0));
                return;
              }
              if (e.key === "Tab" || (e.key === "Enter" && suggestions.length > 0)) {
                e.preventDefault();
                applySuggestion(suggestions[selectedSuggestion]);
                return;
              }
              if (e.key === "Escape") {
                setSuggestions([]);
                return;
              }
            }
            if (e.key === "Enter") commitEdit();
            else if (e.key === "Escape") cancelEdit();
          }}
          onFocus={() => {
            if (!editingCell && activeCell) {
              startEditing(activeCell.col, activeCell.row);
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setSuggestions([]), 200);
          }}
          placeholder="Enter value or formula (e.g. =SUM(A1:A10))"
        />

        {/* Function signature tooltip */}
        {showSignature && editingCell && (
          <div
            className="absolute left-0 top-full mt-1 z-50 px-3 py-1.5 rounded shadow-lg border text-xs font-mono"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <span style={{ color: "var(--primary)" }}>{showSignature.name}</span>
            <span style={{ color: "var(--muted-foreground)" }}>
              ({showSignature.signature.split("(")[1]}
            </span>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {showSignature.description}
            </div>
          </div>
        )}

        {/* Autocomplete suggestions dropdown */}
        {suggestions.length > 0 && editingCell && (
          <div
            className="absolute left-0 top-full mt-1 z-50 w-80 rounded shadow-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {suggestions.map((func, i) => (
              <div
                key={func.name}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs"
                style={{
                  backgroundColor: i === selectedSuggestion ? "var(--primary)" : "transparent",
                  color: i === selectedSuggestion ? "var(--primary-foreground)" : "var(--foreground)",
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(func);
                }}
                onMouseEnter={() => setSelectedSuggestion(i)}
              >
                <span className="font-mono font-semibold w-24">{func.name}</span>
                <span
                  className="text-[10px] flex-1 truncate"
                  style={{ opacity: i === selectedSuggestion ? 0.9 : 0.6 }}
                >
                  {func.signature}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: i === selectedSuggestion ? "rgba(255,255,255,0.2)" : "var(--muted)",
                    color: i === selectedSuggestion ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {func.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
