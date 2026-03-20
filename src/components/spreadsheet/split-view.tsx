"use client";

import { useState, useCallback, useMemo } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

const ROWS = 100;
const COLS = 52;
const DEFAULT_COL_WIDTH = 80;
const DEFAULT_ROW_HEIGHT = 24;

export function SplitView({
  direction,
  onClose,
}: {
  direction: "horizontal" | "vertical";
  onClose: () => void;
}) {
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const setActiveCell = useSpreadsheetStore((s) => s.setActiveCell);
  const startEditing = useSpreadsheetStore((s) => s.startEditing);
  const zoom = useSpreadsheetStore((s) => s.zoom);
  const showGridlines = useSpreadsheetStore((s) => s.showGridlines);

  const [splitPosition, setSplitPosition] = useState(50);
  const [pane1Scroll, setPane1Scroll] = useState({ top: 0, left: 0 });
  const [pane2Scroll, setPane2Scroll] = useState({ top: 0, left: 0 });

  const sheet = getActiveSheet();
  const scale = zoom / 100;

  const getColWidth = useCallback((col: number) => sheet.colWidths[col] || DEFAULT_COL_WIDTH, [sheet.colWidths]);
  const getRowHeight = useCallback((row: number) => sheet.rowHeights?.[row] || DEFAULT_ROW_HEIGHT, [sheet.rowHeights]);

  const renderMiniGrid = useCallback((startRow: number, startCol: number, maxRows: number, maxCols: number) => {
    const rows = [];
    for (let r = startRow; r < Math.min(startRow + maxRows, ROWS); r++) {
      const cells = [];
      for (let c = startCol; c < Math.min(startCol + maxCols, COLS); c++) {
        const display = getCellDisplay(c, r);
        const cellData = sheet.cells[`${colToLetter(c)}${r + 1}`];
        const style = cellData?.style || {};
        cells.push(
          <td
            key={`${c}-${r}`}
            className="text-xs px-1 overflow-hidden"
            style={{
              width: getColWidth(c),
              minWidth: getColWidth(c),
              height: getRowHeight(r),
              border: showGridlines ? "1px solid var(--border)" : "1px solid transparent",
              backgroundColor: style.bgColor || "var(--background)",
              color: style.textColor || "var(--foreground)",
              fontWeight: style.bold ? 700 : 400,
              fontStyle: style.italic ? "italic" : "normal",
              textAlign: (style.align as "left" | "center" | "right") || "left",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              cursor: "cell",
            }}
            onClick={() => {
              setActiveCell(c, r);
            }}
            onDoubleClick={() => {
              startEditing(c, r);
            }}
          >
            {display}
          </td>
        );
      }
      rows.push(<tr key={r}>{cells}</tr>);
    }
    return rows;
  }, [getCellDisplay, sheet.cells, getColWidth, getRowHeight, showGridlines, setActiveCell, startEditing]);

  return (
    <div
      className={`flex ${direction === "horizontal" ? "flex-row" : "flex-col"} flex-1 overflow-hidden`}
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Pane 1 */}
      <div
        className="overflow-auto"
        style={{
          [direction === "horizontal" ? "width" : "height"]: `${splitPosition}%`,
          borderRight: direction === "horizontal" ? "3px solid var(--primary)" : undefined,
          borderBottom: direction === "vertical" ? "3px solid var(--primary)" : undefined,
        }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          setPane1Scroll({ top: target.scrollTop, left: target.scrollLeft });
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <table className="border-collapse">
            <thead>
              <tr>
                <th
                  className="sticky top-0 left-0 z-20 text-[10px] font-medium select-none"
                  style={{ width: 36, minWidth: 36, height: 20, backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                />
                {Array.from({ length: 26 }, (_, c) => (
                  <th
                    key={c}
                    className="sticky top-0 z-10 text-[10px] font-medium select-none"
                    style={{
                      width: getColWidth(c), minWidth: getColWidth(c), height: 20,
                      backgroundColor: "var(--muted)", color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {colToLetter(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 50 }, (_, r) => (
                <tr key={r}>
                  <td
                    className="sticky left-0 z-10 text-[10px] text-center font-medium select-none"
                    style={{
                      width: 36, minWidth: 36, height: getRowHeight(r),
                      backgroundColor: "var(--muted)", color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {r + 1}
                  </td>
                  {renderMiniGrid(r, 0, 1, 26).flatMap((row) =>
                    (row as React.ReactElement).props.children
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drag handle */}
      <div
        className={`${direction === "horizontal" ? "cursor-col-resize w-1 hover:bg-blue-400" : "cursor-row-resize h-1 hover:bg-blue-400"}`}
        style={{ backgroundColor: "var(--primary)", opacity: 0.5 }}
        onMouseDown={(e) => {
          e.preventDefault();
          const start = direction === "horizontal" ? e.clientX : e.clientY;
          const startPos = splitPosition;
          const parent = (e.target as HTMLElement).parentElement;
          if (!parent) return;
          const totalSize = direction === "horizontal" ? parent.offsetWidth : parent.offsetHeight;

          const handleMove = (me: MouseEvent) => {
            const current = direction === "horizontal" ? me.clientX : me.clientY;
            const delta = ((current - start) / totalSize) * 100;
            setSplitPosition(Math.max(20, Math.min(80, startPos + delta)));
          };
          const handleUp = () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
          };
          window.addEventListener("mousemove", handleMove);
          window.addEventListener("mouseup", handleUp);
        }}
      />

      {/* Pane 2 */}
      <div
        className="overflow-auto flex-1"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          setPane2Scroll({ top: target.scrollTop, left: target.scrollLeft });
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <table className="border-collapse">
            <thead>
              <tr>
                <th
                  className="sticky top-0 left-0 z-20 text-[10px] font-medium select-none"
                  style={{ width: 36, minWidth: 36, height: 20, backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                />
                {Array.from({ length: 26 }, (_, c) => (
                  <th
                    key={c}
                    className="sticky top-0 z-10 text-[10px] font-medium select-none"
                    style={{
                      width: getColWidth(c), minWidth: getColWidth(c), height: 20,
                      backgroundColor: "var(--muted)", color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {colToLetter(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 50 }, (_, r) => (
                <tr key={r}>
                  <td
                    className="sticky left-0 z-10 text-[10px] text-center font-medium select-none"
                    style={{
                      width: 36, minWidth: 36, height: getRowHeight(r),
                      backgroundColor: "var(--muted)", color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {r + 1}
                  </td>
                  {renderMiniGrid(r, 0, 1, 26).flatMap((row) =>
                    (row as React.ReactElement).props.children
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
