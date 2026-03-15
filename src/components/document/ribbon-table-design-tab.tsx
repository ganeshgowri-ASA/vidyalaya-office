"use client";

import React, { useState, useCallback } from "react";
import {
  Table, Columns, Rows, ArrowUpDown, Merge, Split, Trash2,
  AlignLeft, AlignCenter, AlignRight, ChevronDown, Calculator,
  Maximize, Minimize, Grid3x3, Paintbrush, Ruler, Type,
  ArrowUp, ArrowDown, Plus, LayoutGrid,
} from "lucide-react";
import { ToolbarButton, ToolbarSeparator } from "./toolbar-button";

// 24 Preset Table Styles
const TABLE_STYLES = [
  { name: "Plain Table 1", headerBg: "#fff", headerColor: "#000", bandBg: "#f9f9f9", border: "1px solid #ddd", headerBorder: "2px solid #000" },
  { name: "Plain Table 2", headerBg: "#fff", headerColor: "#000", bandBg: "#f5f5f5", border: "1px solid #ccc", headerBorder: "1px solid #999" },
  { name: "Plain Table 3", headerBg: "#fff", headerColor: "#444", bandBg: "#fafafa", border: "none", headerBorder: "2px solid #444" },
  { name: "Plain Table 4", headerBg: "#fff", headerColor: "#2F5496", bandBg: "#f0f4fa", border: "none", headerBorder: "2px solid #2F5496" },
  { name: "Plain Table 5", headerBg: "#fff", headerColor: "#000", bandBg: "#fff", border: "1px solid #bbb", headerBorder: "3px double #000" },
  { name: "Grid Table 1 Light", headerBg: "#4472C4", headerColor: "#fff", bandBg: "#D6E4F0", border: "1px solid #B4C6E7", headerBorder: "1px solid #4472C4" },
  { name: "Grid Table 2", headerBg: "#4472C4", headerColor: "#fff", bandBg: "#fff", border: "1px solid #8DB4E2", headerBorder: "2px solid #2F5496" },
  { name: "Grid Table 3", headerBg: "#2F5496", headerColor: "#fff", bandBg: "#E9EFF7", border: "1px solid #B4C6E7", headerBorder: "1px solid #2F5496" },
  { name: "Grid Table 4 Accent", headerBg: "#4472C4", headerColor: "#fff", bandBg: "#D6E4F0", border: "1px solid #9DC3E6", headerBorder: "2px solid #2F5496" },
  { name: "Grid Table 5 Dark", headerBg: "#2F5496", headerColor: "#fff", bandBg: "#B4C6E7", border: "1px solid #8DB4E2", headerBorder: "1px solid #1F3763" },
  { name: "Grid Table 6 Colorful", headerBg: "#ED7D31", headerColor: "#fff", bandBg: "#FBE5D6", border: "1px solid #F4B183", headerBorder: "1px solid #ED7D31" },
  { name: "Grid Table 7 Colorful", headerBg: "#70AD47", headerColor: "#fff", bandBg: "#E2EFDA", border: "1px solid #A9D18E", headerBorder: "1px solid #70AD47" },
  { name: "List Table 1 Light", headerBg: "transparent", headerColor: "#2F5496", bandBg: "#E9EFF7", border: "none", headerBorder: "2px solid #4472C4" },
  { name: "List Table 2", headerBg: "transparent", headerColor: "#4472C4", bandBg: "#D6E4F0", border: "none", headerBorder: "1px solid #4472C4" },
  { name: "List Table 3 Accent", headerBg: "#4472C4", headerColor: "#fff", bandBg: "#E9EFF7", border: "none", headerBorder: "none" },
  { name: "List Table 4", headerBg: "#2F5496", headerColor: "#fff", bandBg: "#D6E4F0", border: "none", headerBorder: "none" },
  { name: "List Table 5 Dark", headerBg: "#1F3763", headerColor: "#fff", bandBg: "#B4C6E7", border: "none", headerBorder: "none" },
  { name: "List Table 6 Colorful", headerBg: "#FFC000", headerColor: "#000", bandBg: "#FFF2CC", border: "none", headerBorder: "2px solid #FFC000" },
  { name: "List Table 7", headerBg: "#7030A0", headerColor: "#fff", bandBg: "#E2D1F0", border: "none", headerBorder: "none" },
  { name: "Table Elegant", headerBg: "#44546A", headerColor: "#fff", bandBg: "#F2F2F2", border: "1px solid #D5D5D5", headerBorder: "2px solid #44546A" },
  { name: "Table Professional", headerBg: "#333", headerColor: "#fff", bandBg: "#f7f7f7", border: "1px solid #ddd", headerBorder: "2px solid #333" },
  { name: "Table Modern", headerBg: "#0078D4", headerColor: "#fff", bandBg: "#DEECF9", border: "none", headerBorder: "none" },
  { name: "Table Warm", headerBg: "#C55A11", headerColor: "#fff", bandBg: "#FBE5D6", border: "1px solid #F4B183", headerBorder: "2px solid #C55A11" },
  { name: "Table Nature", headerBg: "#375623", headerColor: "#fff", bandBg: "#E2EFDA", border: "1px solid #A9D18E", headerBorder: "2px solid #375623" },
];

const BORDER_LINE_STYLES = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
  { label: "Groove", value: "groove" },
  { label: "Ridge", value: "ridge" },
  { label: "Inset", value: "inset" },
  { label: "Outset", value: "outset" },
];

const BORDER_WEIGHTS = ["0.5px", "1px", "1.5px", "2px", "3px", "4px"];

const TABLE_FORMULA_FUNCTIONS = ["SUM", "AVERAGE", "COUNT", "MAX", "MIN", "PRODUCT"];

function getSelectedTable(): HTMLTableElement | null {
  const sel = window.getSelection();
  if (!sel || !sel.anchorNode) return null;
  let node: Node | null = sel.anchorNode;
  while (node) {
    if (node instanceof HTMLTableElement) return node;
    if ((node as HTMLElement).id === "doc-editor") return null;
    node = node.parentNode;
  }
  return null;
}

function getSelectedCell(): HTMLTableCellElement | null {
  const sel = window.getSelection();
  if (!sel || !sel.anchorNode) return null;
  let node: Node | null = sel.anchorNode;
  while (node) {
    if (node instanceof HTMLTableCellElement) return node;
    if ((node as HTMLElement).id === "doc-editor") return null;
    node = node.parentNode;
  }
  return null;
}

function getSelectedRow(): HTMLTableRowElement | null {
  const cell = getSelectedCell();
  return cell ? (cell.parentElement as HTMLTableRowElement) : null;
}

export function TableDesignTab() {
  const [showStyles, setShowStyles] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [showAutoFit, setShowAutoFit] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderWeight, setBorderWeight] = useState("1px");
  const [bandedRows, setBandedRows] = useState(true);
  const [headerRow, setHeaderRow] = useState(true);
  const [firstColumn, setFirstColumn] = useState(false);

  const applyTableStyle = useCallback((style: typeof TABLE_STYLES[0]) => {
    const table = getSelectedTable();
    if (!table) return;
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rIdx) => {
      const cells = row.querySelectorAll("td, th");
      cells.forEach((cell, cIdx) => {
        const el = cell as HTMLElement;
        el.style.padding = "8px";
        el.style.border = style.border;
        if (rIdx === 0 && headerRow) {
          el.style.backgroundColor = style.headerBg;
          el.style.color = style.headerColor;
          el.style.fontWeight = "bold";
          el.style.borderBottom = style.headerBorder;
        } else if (bandedRows && rIdx % 2 === 0) {
          el.style.backgroundColor = style.bandBg;
          el.style.color = "#000";
          el.style.fontWeight = "normal";
        } else {
          el.style.backgroundColor = "#fff";
          el.style.color = "#000";
          el.style.fontWeight = "normal";
        }
        if (firstColumn && cIdx === 0) {
          el.style.fontWeight = "bold";
        }
      });
    });
    setShowStyles(false);
  }, [bandedRows, headerRow, firstColumn]);

  const mergeCells = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const cell = getSelectedCell();
    if (!cell) return;
    const row = cell.parentElement as HTMLTableRowElement;
    if (!row) return;
    const cellIndex = cell.cellIndex;
    const nextCell = row.cells[cellIndex + 1];
    if (nextCell) {
      const currentColspan = parseInt(cell.getAttribute("colspan") || "1");
      cell.setAttribute("colspan", String(currentColspan + parseInt(nextCell.getAttribute("colspan") || "1")));
      cell.innerHTML += " " + nextCell.innerHTML;
      nextCell.remove();
    }
  }, []);

  const splitCell = useCallback(() => {
    const cell = getSelectedCell();
    if (!cell) return;
    const colspan = parseInt(cell.getAttribute("colspan") || "1");
    if (colspan > 1) {
      cell.setAttribute("colspan", String(colspan - 1));
      const newCell = document.createElement(cell.tagName.toLowerCase() === "th" ? "th" : "td");
      newCell.style.cssText = cell.style.cssText;
      newCell.innerHTML = "&nbsp;";
      cell.after(newCell);
    } else {
      const cols = prompt("Split into how many columns?", "2");
      if (!cols) return;
      const n = parseInt(cols);
      if (isNaN(n) || n < 2) return;
      cell.setAttribute("colspan", "1");
      for (let i = 1; i < n; i++) {
        const newCell = document.createElement(cell.tagName.toLowerCase() === "th" ? "th" : "td");
        newCell.style.cssText = cell.style.cssText;
        newCell.innerHTML = "&nbsp;";
        cell.after(newCell);
      }
    }
  }, []);

  const insertRowAbove = useCallback(() => {
    const row = getSelectedRow();
    if (!row) return;
    const table = row.closest("table");
    if (!table) return;
    const newRow = row.cloneNode(true) as HTMLTableRowElement;
    Array.from(newRow.cells).forEach(c => { c.innerHTML = "&nbsp;"; c.style.fontWeight = "normal"; });
    row.before(newRow);
  }, []);

  const insertRowBelow = useCallback(() => {
    const row = getSelectedRow();
    if (!row) return;
    const newRow = row.cloneNode(true) as HTMLTableRowElement;
    Array.from(newRow.cells).forEach(c => { c.innerHTML = "&nbsp;"; c.style.fontWeight = "normal"; });
    row.after(newRow);
  }, []);

  const insertColumnLeft = useCallback(() => {
    const cell = getSelectedCell();
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;
    const colIndex = cell.cellIndex;
    table.querySelectorAll("tr").forEach(row => {
      const refCell = row.cells[colIndex];
      if (refCell) {
        const newCell = document.createElement(refCell.tagName.toLowerCase() === "th" ? "th" : "td");
        newCell.style.cssText = refCell.style.cssText;
        newCell.style.fontWeight = "normal";
        newCell.innerHTML = "&nbsp;";
        refCell.before(newCell);
      }
    });
  }, []);

  const insertColumnRight = useCallback(() => {
    const cell = getSelectedCell();
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;
    const colIndex = cell.cellIndex;
    table.querySelectorAll("tr").forEach(row => {
      const refCell = row.cells[colIndex];
      if (refCell) {
        const newCell = document.createElement(refCell.tagName.toLowerCase() === "th" ? "th" : "td");
        newCell.style.cssText = refCell.style.cssText;
        newCell.style.fontWeight = "normal";
        newCell.innerHTML = "&nbsp;";
        refCell.after(newCell);
      }
    });
  }, []);

  const deleteRow = useCallback(() => {
    const row = getSelectedRow();
    if (row) row.remove();
  }, []);

  const deleteColumn = useCallback(() => {
    const cell = getSelectedCell();
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;
    const colIndex = cell.cellIndex;
    table.querySelectorAll("tr").forEach(row => {
      if (row.cells[colIndex]) row.cells[colIndex].remove();
    });
  }, []);

  const deleteTable = useCallback(() => {
    const table = getSelectedTable();
    if (table) {
      const p = document.createElement("p");
      p.innerHTML = "&nbsp;";
      table.replaceWith(p);
    }
  }, []);

  const applyBorders = useCallback((sides: string) => {
    const table = getSelectedTable();
    if (!table) return;
    const borderVal = `${borderWeight} ${borderStyle} ${borderColor}`;
    const noBorder = "none";
    table.querySelectorAll("td, th").forEach(cell => {
      const el = cell as HTMLElement;
      el.style.borderTop = sides.includes("top") || sides === "all" ? borderVal : noBorder;
      el.style.borderBottom = sides.includes("bottom") || sides === "all" ? borderVal : noBorder;
      el.style.borderLeft = sides.includes("left") || sides === "all" ? borderVal : noBorder;
      el.style.borderRight = sides.includes("right") || sides === "all" ? borderVal : noBorder;
    });
    if (sides === "outside") {
      table.style.border = borderVal;
      table.querySelectorAll("td, th").forEach(cell => {
        (cell as HTMLElement).style.border = noBorder;
      });
    }
    if (sides === "none") {
      table.style.border = noBorder;
    }
    setShowBorders(false);
  }, [borderColor, borderStyle, borderWeight]);

  const autoFit = useCallback((mode: string) => {
    const table = getSelectedTable();
    if (!table) return;
    switch (mode) {
      case "contents":
        table.style.width = "auto";
        table.querySelectorAll("td, th").forEach(c => { (c as HTMLElement).style.width = "auto"; });
        break;
      case "window":
        table.style.width = "100%";
        break;
      case "fixed":
        const w = prompt("Enter fixed column width (px):", "120");
        if (w) table.querySelectorAll("td, th").forEach(c => { (c as HTMLElement).style.width = w + "px"; });
        break;
    }
    setShowAutoFit(false);
  }, []);

  const sortTable = useCallback((ascending: boolean) => {
    const table = getSelectedTable();
    const cell = getSelectedCell();
    if (!table || !cell) return;
    const colIndex = cell.cellIndex;
    const tbody = table.querySelector("tbody") || table;
    const rows = Array.from(tbody.querySelectorAll("tr")).filter(r => !r.querySelector("th"));
    rows.sort((a, b) => {
      const aVal = a.cells[colIndex]?.textContent?.trim() || "";
      const bVal = b.cells[colIndex]?.textContent?.trim() || "";
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) return ascending ? aNum - bNum : bNum - aNum;
      return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    rows.forEach(row => tbody.appendChild(row));
    setShowSort(false);
  }, []);

  const repeatHeaderRows = useCallback(() => {
    const table = getSelectedTable();
    if (!table) return;
    let thead = table.querySelector("thead");
    if (!thead) {
      thead = document.createElement("thead");
      const firstRow = table.querySelector("tr");
      if (firstRow) {
        thead.appendChild(firstRow.cloneNode(true));
        table.insertBefore(thead, table.firstChild);
      }
    }
    thead.style.display = "table-header-group";
    alert("Header row will repeat on each printed page.");
  }, []);

  const insertFormula = useCallback((func: string) => {
    const cell = getSelectedCell();
    if (!cell) return;
    const table = cell.closest("table");
    if (!table || !cell.parentElement) return;
    const row = cell.parentElement as HTMLTableRowElement;
    const colIndex = cell.cellIndex;
    const rowIndex = row.rowIndex;
    const tbody = table.querySelector("tbody") || table;
    const dataRows = Array.from(tbody.querySelectorAll("tr"));

    let values: number[] = [];
    // Collect values from above cells in same column (default behavior like Word)
    dataRows.forEach((r, rIdx) => {
      if (rIdx < rowIndex || (rIdx < dataRows.length && r !== row)) {
        const c = r.cells[colIndex];
        if (c) {
          const num = parseFloat(c.textContent?.trim() || "");
          if (!isNaN(num)) values.push(num);
        }
      }
    });

    if (values.length === 0) {
      // Try left cells in same row
      for (let i = 0; i < colIndex; i++) {
        const c = row.cells[i];
        if (c) {
          const num = parseFloat(c.textContent?.trim() || "");
          if (!isNaN(num)) values.push(num);
        }
      }
    }

    let result = 0;
    switch (func) {
      case "SUM": result = values.reduce((a, b) => a + b, 0); break;
      case "AVERAGE": result = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
      case "COUNT": result = values.length; break;
      case "MAX": result = values.length ? Math.max(...values) : 0; break;
      case "MIN": result = values.length ? Math.min(...values) : 0; break;
      case "PRODUCT": result = values.length ? values.reduce((a, b) => a * b, 1) : 0; break;
    }
    cell.textContent = String(Math.round(result * 100) / 100);
    cell.style.fontWeight = "bold";
    cell.title = `=${func}(ABOVE)`;
    setShowFormula(false);
  }, []);

  const convertTableToText = useCallback(() => {
    const table = getSelectedTable();
    if (!table) return;
    const sep = prompt("Separator (tab, comma, paragraph):", "tab") || "tab";
    const delim = sep === "comma" ? ", " : sep === "paragraph" ? "\n" : "\t";
    let text = "";
    table.querySelectorAll("tr").forEach(row => {
      const cells = Array.from(row.querySelectorAll("td, th")).map(c => c.textContent?.trim() || "");
      text += cells.join(delim) + "\n";
    });
    const p = document.createElement("p");
    p.style.whiteSpace = "pre-wrap";
    p.textContent = text;
    table.replaceWith(p);
    setShowConvert(false);
  }, []);

  const convertTextToTable = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { alert("Select text to convert to table."); return; }
    const text = sel.toString();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length === 0) return;
    const sep = text.includes("\t") ? "\t" : text.includes(",") ? "," : " ";
    const rows = lines.map(l => l.split(sep).map(c => c.trim()));
    const maxCols = Math.max(...rows.map(r => r.length));
    let html = '<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tbody>';
    rows.forEach((row, rIdx) => {
      html += "<tr>";
      for (let c = 0; c < maxCols; c++) {
        const tag = rIdx === 0 ? "th" : "td";
        const bg = rIdx === 0 ? "background:#f5f5f5;font-weight:bold;" : "";
        html += `<${tag} style="border:1px solid #ddd;padding:8px;${bg}">${row[c] || "&nbsp;"}</${tag}>`;
      }
      html += "</tr>";
    });
    html += "</tbody></table><p></p>";
    document.execCommand("insertHTML", false, html);
    setShowConvert(false);
  }, []);

  const insertNestedTable = useCallback(() => {
    const cell = getSelectedCell();
    if (!cell) return;
    const rows = parseInt(prompt("Nested table rows:", "2") || "2");
    const cols = parseInt(prompt("Nested table columns:", "2") || "2");
    if (isNaN(rows) || isNaN(cols)) return;
    let html = '<table style="width:90%;border-collapse:collapse;margin:4px auto;"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #aaa;padding:4px;font-size:10px;">&nbsp;</td>';
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    cell.innerHTML += html;
  }, []);

  return (
    <>
      {/* ===== TABLE STYLE OPTIONS ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={headerRow} onChange={() => setHeaderRow(!headerRow)} className="w-3 h-3" />
            Header Row
          </label>
          <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={bandedRows} onChange={() => setBandedRows(!bandedRows)} className="w-3 h-3" />
            Banded Rows
          </label>
          <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={firstColumn} onChange={() => setFirstColumn(!firstColumn)} className="w-3 h-3" />
            First Column
          </label>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Style Options</span>
      </div>

      {/* ===== TABLE STYLES GALLERY ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Paintbrush size={14} />} label="Table Styles" title="Table Styles Gallery" onClick={() => setShowStyles(!showStyles)} />
            {showStyles && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg max-h-80 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 340 }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Table Styles ({TABLE_STYLES.length} styles)</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {TABLE_STYLES.map((style) => (
                    <button key={style.name} className="rounded border p-1 hover:ring-2 hover:ring-blue-400 cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                      title={style.name}
                      onClick={() => applyTableStyle(style)}>
                      <div className="w-full">
                        <div className="h-3 rounded-t-sm" style={{ backgroundColor: style.headerBg, borderBottom: style.headerBorder }} />
                        <div className="h-2" style={{ backgroundColor: style.bandBg, border: style.border }} />
                        <div className="h-2" style={{ backgroundColor: "#fff", border: style.border }} />
                        <div className="h-2 rounded-b-sm" style={{ backgroundColor: style.bandBg, border: style.border }} />
                      </div>
                      <span className="text-[7px] block mt-0.5 truncate" style={{ color: "var(--foreground)" }}>{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Table Styles</span>
      </div>

      {/* ===== ROWS & COLUMNS ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<ArrowUp size={14} />} label="Above" title="Insert Row Above" onClick={insertRowAbove} />
          <ToolbarButton icon={<ArrowDown size={14} />} label="Below" title="Insert Row Below" onClick={insertRowBelow} />
          <ToolbarButton icon={<Plus size={14} />} label="Left" title="Insert Column Left" onClick={insertColumnLeft} />
          <ToolbarButton icon={<Plus size={14} />} label="Right" title="Insert Column Right" onClick={insertColumnRight} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Rows & Columns</span>
      </div>

      {/* ===== MERGE / SPLIT ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<LayoutGrid size={14} />} label="Merge" title="Merge Cells" onClick={mergeCells} />
          <ToolbarButton icon={<Grid3x3 size={14} />} label="Split" title="Split Cell" onClick={splitCell} />
          <ToolbarButton icon={<Table size={14} />} label="Nested" title="Insert Nested Table" onClick={insertNestedTable} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Merge</span>
      </div>

      {/* ===== BORDERS ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Grid3x3 size={14} />} label="Borders" title="Table Borders" onClick={() => setShowBorders(!showBorders)} />
            {showBorders && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg w-56"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Border Settings</div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12" style={{ color: "var(--foreground)" }}>Color:</span>
                    <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-6 h-6 cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12" style={{ color: "var(--foreground)" }}>Style:</span>
                    <select value={borderStyle} onChange={e => setBorderStyle(e.target.value)}
                      className="text-[10px] border rounded px-1 py-0.5 flex-1" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                      {BORDER_LINE_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12" style={{ color: "var(--foreground)" }}>Weight:</span>
                    <select value={borderWeight} onChange={e => setBorderWeight(e.target.value)}
                      className="text-[10px] border rounded px-1 py-0.5 flex-1" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                      {BORDER_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "All Borders", sides: "all" },
                    { label: "No Border", sides: "none" },
                    { label: "Outside Only", sides: "outside" },
                    { label: "Top", sides: "top" },
                    { label: "Bottom", sides: "bottom" },
                    { label: "Left & Right", sides: "left,right" },
                  ].map(b => (
                    <button key={b.label} className="text-[10px] px-2 py-1 rounded hover:bg-[var(--muted)]"
                      style={{ color: "var(--foreground)" }}
                      onClick={() => applyBorders(b.sides)}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Borders</span>
      </div>

      {/* ===== AUTO-FIT ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Maximize size={14} />} label="Auto Fit" title="Auto Fit Options" onClick={() => setShowAutoFit(!showAutoFit)} />
            {showAutoFit && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {[
                  { label: "AutoFit Contents", mode: "contents" },
                  { label: "AutoFit Window", mode: "window" },
                  { label: "Fixed Column Width", mode: "fixed" },
                ].map(o => (
                  <button key={o.mode} className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => autoFit(o.mode)}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Cell Size</span>
      </div>

      {/* ===== SORT & FORMULAS ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<ArrowUpDown size={14} />} label="Sort" title="Sort Table Data" onClick={() => setShowSort(!showSort)} />
            {showSort && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-36"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <button className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={() => sortTable(true)}>
                  Sort A to Z
                </button>
                <button className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={() => sortTable(false)}>
                  Sort Z to A
                </button>
              </div>
            )}
          </div>
          <ToolbarButton icon={<Rows size={14} />} label="Repeat Header" title="Repeat Header Rows" onClick={repeatHeaderRows} />
          <div className="relative">
            <ToolbarButton icon={<Calculator size={14} />} label="Formula" title="Table Formula" onClick={() => setShowFormula(!showFormula)} />
            {showFormula && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-36"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium px-2 py-1" style={{ color: "var(--muted-foreground)" }}>Insert Formula</div>
                {TABLE_FORMULA_FUNCTIONS.map(fn => (
                  <button key={fn} className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => insertFormula(fn)}>
                    ={fn}()
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Data</span>
      </div>

      {/* ===== CONVERT & DELETE ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Type size={14} />} label="Convert" title="Convert Table" onClick={() => setShowConvert(!showConvert)} />
            {showConvert && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <button className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={convertTextToTable}>
                  Text to Table
                </button>
                <button className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={convertTableToText}>
                  Table to Text
                </button>
              </div>
            )}
          </div>
          <ToolbarButton icon={<Trash2 size={14} />} label="Del Row" title="Delete Row" onClick={deleteRow} />
          <ToolbarButton icon={<Trash2 size={14} />} label="Del Col" title="Delete Column" onClick={deleteColumn} />
          <ToolbarButton icon={<Trash2 size={14} />} label="Del Table" title="Delete Entire Table" onClick={deleteTable} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Delete</span>
      </div>
    </>
  );
}
