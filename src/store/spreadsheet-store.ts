import { create } from "zustand";
import { evaluateFormula, colToLetter } from "@/components/spreadsheet/formula-engine";

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  bgColor?: string;
  textColor?: string;
  format?: "general" | "number" | "currency" | "percent" | "date";
}

export interface CellData {
  raw: string;
  style: CellStyle;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Record<string, CellData>;
  colWidths: Record<number, number>;
}

export interface SpreadsheetState {
  sheets: Sheet[];
  activeSheetId: string;
  activeCell: { col: number; row: number } | null;
  selectionStart: { col: number; row: number } | null;
  selectionEnd: { col: number; row: number } | null;
  editingCell: { col: number; row: number } | null;
  editValue: string;
  showAiPanel: boolean;
  showChartModal: boolean;
  chartType: "bar" | "line" | "pie";
  showTemplatesModal: boolean;

  // Actions
  setActiveCell: (col: number, row: number) => void;
  setSelection: (
    start: { col: number; row: number } | null,
    end: { col: number; row: number } | null
  ) => void;
  startEditing: (col: number, row: number) => void;
  setEditValue: (value: string) => void;
  commitEdit: () => void;
  cancelEdit: () => void;
  setCellValue: (col: number, row: number, value: string) => void;
  setCellStyle: (col: number, row: number, style: Partial<CellStyle>) => void;
  setSelectionStyle: (style: Partial<CellStyle>) => void;
  setColWidth: (col: number, width: number) => void;
  getCellRaw: (col: number, row: number) => string;
  getCellDisplay: (col: number, row: number) => string;
  getActiveSheet: () => Sheet;

  // Sheet actions
  addSheet: () => void;
  deleteSheet: (id: string) => void;
  renameSheet: (id: string, name: string) => void;
  setActiveSheet: (id: string) => void;

  // Modal toggles
  toggleAiPanel: () => void;
  openChartModal: (type: "bar" | "line" | "pie") => void;
  closeChartModal: () => void;
  openTemplatesModal: () => void;
  closeTemplatesModal: () => void;

  // Template loading
  loadTemplate: (cells: Record<string, CellData>) => void;
}

function makeSheet(id: string, name: string): Sheet {
  return { id, name, cells: {}, colWidths: {} };
}

function cellKey(col: number, row: number): string {
  return `${colToLetter(col)}${row + 1}`;
}

function getComputedValue(
  cells: Record<string, CellData>,
  col: number,
  row: number,
  visited: Set<string> = new Set()
): string | number {
  const key = cellKey(col, row);
  if (visited.has(key)) return "#CIRC";
  visited.add(key);

  const cell = cells[key];
  if (!cell || !cell.raw) return "";
  if (!cell.raw.startsWith("=")) {
    const n = parseFloat(cell.raw);
    return isNaN(n) ? cell.raw : n;
  }

  return evaluateFormula(cell.raw, (c, r) => {
    return getComputedValue(cells, c, r, new Set(visited));
  });
}

function formatValue(value: string | number, format?: string): string {
  if (typeof value === "string") return value;
  switch (format) {
    case "number":
      return value.toFixed(2);
    case "currency":
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "percent":
      return `${(value * 100).toFixed(1)}%`;
    case "date": {
      // Treat value as serial date number (days since 1900-01-01)
      const epoch = new Date(1900, 0, 1);
      const date = new Date(epoch.getTime() + (value - 1) * 86400000);
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
    default:
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
}

export const useSpreadsheetStore = create<SpreadsheetState>((set, get) => {
  const initialSheet = makeSheet("sheet1", "Sheet1");
  return {
    sheets: [initialSheet],
    activeSheetId: "sheet1",
    activeCell: null,
    selectionStart: null,
    selectionEnd: null,
    editingCell: null,
    editValue: "",
    showAiPanel: false,
    showChartModal: false,
    chartType: "bar",
    showTemplatesModal: false,

    getActiveSheet: () => {
      const state = get();
      return state.sheets.find((s) => s.id === state.activeSheetId) || state.sheets[0];
    },

    setActiveCell: (col, row) =>
      set({ activeCell: { col, row }, selectionStart: { col, row }, selectionEnd: { col, row } }),

    setSelection: (start, end) => set({ selectionStart: start, selectionEnd: end }),

    startEditing: (col, row) => {
      const sheet = get().getActiveSheet();
      const key = cellKey(col, row);
      const raw = sheet.cells[key]?.raw || "";
      set({ editingCell: { col, row }, editValue: raw });
    },

    setEditValue: (value) => set({ editValue: value }),

    commitEdit: () => {
      const state = get();
      if (!state.editingCell) return;
      const { col, row } = state.editingCell;
      get().setCellValue(col, row, state.editValue);
      set({ editingCell: null, editValue: "" });
    },

    cancelEdit: () => set({ editingCell: null, editValue: "" }),

    setCellValue: (col, row, value) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const key = cellKey(col, row);
      const existing = sheet.cells[key];
      const newCells = {
        ...sheet.cells,
        [key]: { raw: value, style: existing?.style || {} },
      };
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    setCellStyle: (col, row, style) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const key = cellKey(col, row);
      const existing = sheet.cells[key] || { raw: "", style: {} };
      const newCells = {
        ...sheet.cells,
        [key]: { ...existing, style: { ...existing.style, ...style } },
      };
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    setSelectionStyle: (style) => {
      const state = get();
      const { selectionStart, selectionEnd } = state;
      if (!selectionStart || !selectionEnd) {
        if (state.activeCell) {
          get().setCellStyle(state.activeCell.col, state.activeCell.row, style);
        }
        return;
      }
      const minR = Math.min(selectionStart.row, selectionEnd.row);
      const maxR = Math.max(selectionStart.row, selectionEnd.row);
      const minC = Math.min(selectionStart.col, selectionEnd.col);
      const maxC = Math.max(selectionStart.col, selectionEnd.col);
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          get().setCellStyle(c, r, style);
        }
      }
    },

    setColWidth: (col, width) => {
      const state = get();
      const sheet = state.getActiveSheet();
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id
            ? { ...s, colWidths: { ...s.colWidths, [col]: Math.max(40, width) } }
            : s
        ),
      });
    },

    getCellRaw: (col, row) => {
      const sheet = get().getActiveSheet();
      const key = cellKey(col, row);
      return sheet.cells[key]?.raw || "";
    },

    getCellDisplay: (col, row) => {
      const sheet = get().getActiveSheet();
      const val = getComputedValue(sheet.cells, col, row);
      const key = cellKey(col, row);
      const format = sheet.cells[key]?.style?.format;
      return formatValue(val, format);
    },

    addSheet: () => {
      const state = get();
      const id = `sheet${Date.now()}`;
      const name = `Sheet${state.sheets.length + 1}`;
      set({
        sheets: [...state.sheets, makeSheet(id, name)],
        activeSheetId: id,
      });
    },

    deleteSheet: (id) => {
      const state = get();
      if (state.sheets.length <= 1) return;
      const remaining = state.sheets.filter((s) => s.id !== id);
      set({
        sheets: remaining,
        activeSheetId:
          state.activeSheetId === id ? remaining[0].id : state.activeSheetId,
      });
    },

    renameSheet: (id, name) =>
      set({
        sheets: get().sheets.map((s) => (s.id === id ? { ...s, name } : s)),
      }),

    setActiveSheet: (id) => set({ activeSheetId: id, editingCell: null }),

    toggleAiPanel: () => set({ showAiPanel: !get().showAiPanel }),
    openChartModal: (type) => set({ showChartModal: true, chartType: type }),
    closeChartModal: () => set({ showChartModal: false }),
    openTemplatesModal: () => set({ showTemplatesModal: true }),
    closeTemplatesModal: () => set({ showTemplatesModal: false }),

    loadTemplate: (cells) => {
      const state = get();
      const sheet = state.getActiveSheet();
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells } : s
        ),
        showTemplatesModal: false,
      });
    },
  };
});
