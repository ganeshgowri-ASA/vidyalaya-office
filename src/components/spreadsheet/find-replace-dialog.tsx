"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, Search, Replace, ChevronDown, ChevronUp } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

interface MatchResult {
  col: number;
  row: number;
  cellKey: string;
  value: string;
}

export function FindReplaceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const sheets = useSpreadsheetStore((s) => s.sheets);
  const setActiveCell = useSpreadsheetStore((s) => s.setActiveCell);
  const setActiveSheet = useSpreadsheetStore((s) => s.setActiveSheet);
  const setCellValue = useSpreadsheetStore((s) => s.setCellValue);
  const pushUndo = useSpreadsheetStore((s) => s.pushUndo);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [searchInFormulas, setSearchInFormulas] = useState(false);
  const [searchAllSheets, setSearchAllSheets] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const [showReplace, setShowReplace] = useState(false);
  const [replaceCount, setReplaceCount] = useState(0);

  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && findInputRef.current) findInputRef.current.focus();
  }, [open]);

  const doSearch = useCallback(() => {
    if (!findText) {
      setMatches([]);
      setCurrentMatch(-1);
      return;
    }

    const results: MatchResult[] = [];
    const sheetsToSearch = searchAllSheets ? sheets : [getActiveSheet()];

    for (const sheet of sheetsToSearch) {
      for (const [key, cell] of Object.entries(sheet.cells)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if (!match) continue;

        const searchTarget = searchInFormulas ? cell.raw : cell.raw;
        let found = false;

        if (useRegex) {
          try {
            const flags = caseSensitive ? "g" : "gi";
            const re = new RegExp(findText, flags);
            found = re.test(searchTarget);
          } catch {
            // Invalid regex
          }
        } else {
          const haystack = caseSensitive ? searchTarget : searchTarget.toLowerCase();
          const needle = caseSensitive ? findText : findText.toLowerCase();
          found = haystack.includes(needle);
        }

        if (found) {
          const col = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
          const row = parseInt(match[2]) - 1;
          results.push({ col, row, cellKey: key, value: searchTarget });
        }
      }
    }

    results.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
    setMatches(results);
    setCurrentMatch(results.length > 0 ? 0 : -1);
    if (results.length > 0) {
      setActiveCell(results[0].col, results[0].row);
    }
  }, [findText, caseSensitive, useRegex, searchInFormulas, searchAllSheets, sheets, getActiveSheet, setActiveCell]);

  const goToMatch = useCallback((index: number) => {
    if (matches.length === 0) return;
    const wrapped = ((index % matches.length) + matches.length) % matches.length;
    setCurrentMatch(wrapped);
    const m = matches[wrapped];
    setActiveCell(m.col, m.row);
  }, [matches, setActiveCell]);

  const findNext = useCallback(() => goToMatch(currentMatch + 1), [goToMatch, currentMatch]);
  const findPrev = useCallback(() => goToMatch(currentMatch - 1), [goToMatch, currentMatch]);

  const replaceCurrent = useCallback(() => {
    if (currentMatch < 0 || currentMatch >= matches.length) return;
    const m = matches[currentMatch];
    pushUndo();

    const sheet = getActiveSheet();
    const cell = sheet.cells[m.cellKey];
    if (!cell) return;

    let newValue: string;
    if (useRegex) {
      try {
        const flags = caseSensitive ? "g" : "gi";
        const re = new RegExp(findText, flags);
        newValue = cell.raw.replace(re, replaceText);
      } catch {
        return;
      }
    } else {
      if (caseSensitive) {
        newValue = cell.raw.split(findText).join(replaceText);
      } else {
        const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        newValue = cell.raw.replace(re, replaceText);
      }
    }

    setCellValue(m.col, m.row, newValue);
    setReplaceCount((c) => c + 1);

    // Re-search after replace
    setTimeout(() => doSearch(), 50);
  }, [currentMatch, matches, findText, replaceText, caseSensitive, useRegex, getActiveSheet, setCellValue, pushUndo, doSearch]);

  const replaceAll = useCallback(() => {
    if (matches.length === 0) return;
    pushUndo();

    let count = 0;
    const sheet = getActiveSheet();
    for (const m of matches) {
      const cell = sheet.cells[m.cellKey];
      if (!cell) continue;

      let newValue: string;
      if (useRegex) {
        try {
          const flags = caseSensitive ? "g" : "gi";
          const re = new RegExp(findText, flags);
          newValue = cell.raw.replace(re, replaceText);
        } catch {
          continue;
        }
      } else {
        if (caseSensitive) {
          newValue = cell.raw.split(findText).join(replaceText);
        } else {
          const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          newValue = cell.raw.replace(re, replaceText);
        }
      }

      setCellValue(m.col, m.row, newValue);
      count++;
    }

    setReplaceCount((c) => c + count);
    setTimeout(() => doSearch(), 50);
  }, [matches, findText, replaceText, caseSensitive, useRegex, getActiveSheet, setCellValue, pushUndo, doSearch]);

  if (!open) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      <div
        className="w-[400px] rounded-lg border shadow-xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Search size={14} />
            <h3 className="text-xs font-semibold">Find & Replace</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70"><X size={14} /></button>
        </div>

        <div className="p-3 space-y-2">
          {/* Find input */}
          <div className="flex items-center gap-2">
            <label className="text-xs w-14 shrink-0" style={{ color: "var(--muted-foreground)" }}>Find:</label>
            <input
              ref={findInputRef}
              type="text"
              className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (matches.length === 0) doSearch();
                  else findNext();
                }
              }}
              placeholder="Search text or /regex/"
            />
            <button
              className="p-1 rounded hover:opacity-80"
              style={{ color: "var(--muted-foreground)" }}
              onClick={findPrev}
              title="Previous"
            >
              <ChevronUp size={14} />
            </button>
            <button
              className="p-1 rounded hover:opacity-80"
              style={{ color: "var(--muted-foreground)" }}
              onClick={findNext}
              title="Next"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Replace input (collapsible) */}
          <button
            className="text-xs flex items-center gap-1 hover:opacity-80"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setShowReplace(!showReplace)}
          >
            {showReplace ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Replace
          </button>

          {showReplace && (
            <div className="flex items-center gap-2">
              <label className="text-xs w-14 shrink-0" style={{ color: "var(--muted-foreground)" }}>Replace:</label>
              <input
                type="text"
                className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement text"
              />
              <button
                className="px-2 py-1 text-xs rounded border hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                onClick={replaceCurrent}
              >
                Replace
              </button>
              <button
                className="px-2 py-1 text-xs rounded border hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                onClick={replaceAll}
              >
                All
              </button>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
              Match case
            </label>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
              Regex
            </label>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={searchInFormulas} onChange={(e) => setSearchInFormulas(e.target.checked)} />
              In formulas
            </label>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={searchAllSheets} onChange={(e) => setSearchAllSheets(e.target.checked)} />
              All sheets
            </label>
          </div>

          {/* Search button + results */}
          <div className="flex items-center justify-between pt-1">
            <button
              className="px-3 py-1.5 text-xs rounded hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              onClick={doSearch}
            >
              Find All
            </button>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {matches.length > 0
                ? `${currentMatch + 1} of ${matches.length} matches`
                : findText ? "No matches" : ""}
              {replaceCount > 0 && ` (${replaceCount} replaced)`}
            </span>
          </div>

          {/* Match list */}
          {matches.length > 0 && (
            <div
              className="border rounded max-h-[120px] overflow-auto"
              style={{ borderColor: "var(--border)" }}
            >
              {matches.map((m, i) => (
                <button
                  key={`${m.cellKey}-${i}`}
                  className="w-full text-left px-2 py-1 text-xs flex items-center gap-2 hover:opacity-80"
                  style={{
                    backgroundColor: i === currentMatch ? "rgba(59,130,246,0.15)" : "transparent",
                    color: "var(--foreground)",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onClick={() => goToMatch(i)}
                >
                  <span className="font-mono w-10 shrink-0" style={{ color: "var(--muted-foreground)" }}>{m.cellKey}</span>
                  <span className="truncate">{m.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
