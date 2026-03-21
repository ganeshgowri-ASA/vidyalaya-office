import { create } from "zustand";
import { evaluateFormula, colToLetter, parseCellRef } from "@/components/spreadsheet/formula-engine";

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  wrapText?: boolean;
  textRotation?: number;
  bgColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  format?: "general" | "number" | "currency" | "accounting" | "percent" | "date" | "shortDate" | "longDate" | "time" | "fraction" | "scientific" | "text";
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  indent?: number;
}

export interface CellComment {
  text: string;
  author: string;
  date: string;
}

export interface CellData {
  raw: string;
  style: CellStyle;
  comment?: CellComment;
}

export interface ConditionalFormatRule {
  id: string;
  range: string; // e.g. "A1:D10"
  type: "greaterThan" | "lessThan" | "between" | "equalTo" | "textContains" | "duplicates" | "top10" | "bottom10" | "colorScale2" | "colorScale3" | "dataBar" | "iconSet";
  value1?: string;
  value2?: string;
  format: Partial<CellStyle>;
  colorScaleMin?: string;
  colorScaleMid?: string;
  colorScaleMax?: string;
  dataBarColor?: string;
  iconSetType?: "arrows" | "traffic" | "flags" | "stars" | "rating";
}

export interface MergedCell {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export interface DataValidationRule {
  type: "list" | "number" | "date" | "textLength" | "custom";
  listItems?: string;
  numberMin?: string;
  numberMax?: string;
  dateMin?: string;
  dateMax?: string;
  textMinLength?: string;
  textMaxLength?: string;
  customFormula?: string;
  inputTitle?: string;
  inputMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  errorStyle?: "reject" | "warning";
}

export interface ValidationError {
  cellKey: string;
  title: string;
  message: string;
  style: "reject" | "warning";
}

export function validateCellValue(value: string, rule: DataValidationRule): boolean {
  if (!value && value !== "0") return true; // empty is valid
  switch (rule.type) {
    case "list": {
      const items = (rule.listItems || "").split(",").map((s) => s.trim());
      return items.some((item) => item.toLowerCase() === value.toLowerCase());
    }
    case "number": {
      const num = parseFloat(value);
      if (isNaN(num)) return false;
      if (rule.numberMin && num < parseFloat(rule.numberMin)) return false;
      if (rule.numberMax && num > parseFloat(rule.numberMax)) return false;
      return true;
    }
    case "date": {
      const d = new Date(value);
      if (isNaN(d.getTime())) return false;
      if (rule.dateMin && d < new Date(rule.dateMin)) return false;
      if (rule.dateMax && d > new Date(rule.dateMax)) return false;
      return true;
    }
    case "textLength": {
      const len = value.length;
      if (rule.textMinLength && len < parseInt(rule.textMinLength)) return false;
      if (rule.textMaxLength && len > parseInt(rule.textMaxLength)) return false;
      return true;
    }
    case "custom":
      return true; // custom formula validation not implemented at runtime
  }
}

export interface Sheet {
  id: string;
  name: string;
  cells: Record<string, CellData>;
  colWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  tabColor?: string;
  hidden?: boolean;
  frozenRows?: number;
  frozenCols?: number;
  showGridlines?: boolean;
  showHeadings?: boolean;
  conditionalFormats?: ConditionalFormatRule[];
  mergedCells?: MergedCell[];
  dataValidations?: Record<string, DataValidationRule>;
}

export interface EmbeddedChart {
  id: string;
  sheetId: string;
  chartType: string;
  title: string;
  dataRange: { startCol: number; startRow: number; endCol: number; endRow: number } | null;
  x: number;
  y: number;
  width: number;
  height: number;
  showLegend: boolean;
  showDataLabels: boolean;
  showGridlines: boolean;
  colors: string[];
  axisLabels: { x: string; y: string };
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
  chartType: string;
  showTemplatesModal: boolean;
  activeRibbonTab: string;
  clipboard: { cells: Record<string, CellData>; startCol: number; startRow: number; endCol: number; endRow: number; cut?: boolean } | null;
  zoom: number;
  editMode: "Ready" | "Edit" | "Enter";
  showFormulas: boolean;
  showGridlines: boolean;
  showHeadings: boolean;
  undoStack: Record<string, CellData>[];
  redoStack: Record<string, CellData>[];
  namedRanges: Record<string, string>;
  comments: Record<string, CellComment>;
  protectedSheet: boolean;
  printArea: string | null;
  validationErrors: Record<string, ValidationError>;
  embeddedCharts: EmbeddedChart[];
  selectedChartId: string | null;

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
  setRowHeight: (row: number, height: number) => void;
  getCellRaw: (col: number, row: number) => string;
  getCellDisplay: (col: number, row: number) => string;
  getCellData: (col: number, row: number) => CellData | undefined;
  getActiveSheet: () => Sheet;

  // Sheet actions
  addSheet: () => void;
  deleteSheet: (id: string) => void;
  renameSheet: (id: string, name: string) => void;
  setActiveSheet: (id: string) => void;
  setSheetTabColor: (id: string, color: string) => void;
  duplicateSheet: (id: string) => void;
  moveSheet: (id: string, direction: "left" | "right") => void;
  hideSheet: (id: string) => void;
  unhideSheet: (id: string) => void;
  setFrozenPanes: (rows: number, cols: number) => void;

  // Modal toggles
  toggleAiPanel: () => void;
  openChartModal: (type: string) => void;
  closeChartModal: () => void;
  openTemplatesModal: () => void;
  closeTemplatesModal: () => void;

  // Ribbon
  setActiveRibbonTab: (tab: string) => void;

  // Clipboard
  clipboardCopy: () => void;
  clipboardCut: () => void;
  clipboardPaste: () => void;
  clipboardPasteSpecial: (type: "values" | "formulas" | "formats" | "transpose") => void;

  // Zoom
  setZoom: (zoom: number) => void;

  // View toggles
  toggleShowFormulas: () => void;
  toggleShowGridlines: () => void;
  toggleShowHeadings: () => void;

  // Comments
  setCellComment: (col: number, row: number, comment: CellComment | undefined) => void;

  // Named ranges
  setNamedRange: (name: string, range: string) => void;
  deleteNamedRange: (name: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;

  // Template loading
  loadTemplate: (cells: Record<string, CellData>) => void;

  // Bulk operations
  clearRange: (startCol: number, startRow: number, endCol: number, endRow: number, type: "all" | "formats" | "contents" | "comments") => void;
  insertRows: (row: number, count: number) => void;
  deleteRows: (row: number, count: number) => void;
  insertCols: (col: number, count: number) => void;
  deleteCols: (col: number, count: number) => void;

  // Conditional formatting
  addConditionalFormat: (rule: ConditionalFormatRule) => void;
  removeConditionalFormat: (ruleId: string) => void;
  getConditionalFormats: () => ConditionalFormatRule[];

  // Merge cells
  mergeCells: (startCol: number, startRow: number, endCol: number, endRow: number) => void;
  unmergeCells: (startCol: number, startRow: number) => void;
  getMergedCells: () => MergedCell[];

  // Data validation
  setDataValidation: (cellKey: string, rule: DataValidationRule | undefined) => void;
  getDataValidation: (cellKey: string) => DataValidationRule | undefined;
  clearValidationError: (cellKey: string) => void;
  getValidationErrors: () => Record<string, ValidationError>;

  // Import
  importCSV: (csvContent: string) => void;

  // Embedded charts
  addEmbeddedChart: (chart: Omit<EmbeddedChart, 'id'>) => void;
  updateEmbeddedChart: (id: string, updates: Partial<EmbeddedChart>) => void;
  removeEmbeddedChart: (id: string) => void;
  setSelectedChart: (id: string | null) => void;
  getChartsForActiveSheet: () => EmbeddedChart[];
}

function makeSheet(id: string, name: string): Sheet {
  return { id, name, cells: {}, colWidths: {}, rowHeights: {}, showGridlines: true, showHeadings: true };
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

  return evaluateFormula(cell.raw, (ref) => {
    const parsed = parseCellRef(ref);
    if (!parsed) return "";
    return getComputedValue(cells, parsed.col, parsed.row, new Set(visited));
  });
}

function formatValue(value: string | number, format?: string): string {
  if (typeof value === "string") return value;
  switch (format) {
    case "number":
      return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "currency":
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "accounting":
      return value < 0
        ? `($${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
        : `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "percent":
      return `${(value * 100).toFixed(1)}%`;
    case "date":
    case "shortDate": {
      const epoch = new Date(1900, 0, 1);
      const date = new Date(epoch.getTime() + (value - 1) * 86400000);
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
    case "longDate": {
      const epoch = new Date(1900, 0, 1);
      const date = new Date(epoch.getTime() + (value - 1) * 86400000);
      return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    case "time": {
      const fraction = value - Math.floor(value);
      const totalMinutes = Math.round(fraction * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
    }
    case "fraction": {
      const whole = Math.floor(value);
      const frac = value - whole;
      if (frac === 0) return String(whole);
      // Simple fraction approximation
      const denom = 8;
      const numer = Math.round(frac * denom);
      return whole ? `${whole} ${numer}/${denom}` : `${numer}/${denom}`;
    }
    case "scientific":
      return value.toExponential(2);
    case "text":
      return String(value);
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
    activeRibbonTab: "Home",
    clipboard: null,
    zoom: 100,
    editMode: "Ready",
    showFormulas: false,
    showGridlines: true,
    showHeadings: true,
    undoStack: [],
    redoStack: [],
    namedRanges: {},
    comments: {},
    protectedSheet: false,
    printArea: null,
    validationErrors: {},
    embeddedCharts: [],
    selectedChartId: null,

    getActiveSheet: () => {
      const state = get();
      return state.sheets.find((s) => s.id === state.activeSheetId) || state.sheets[0];
    },

    setActiveCell: (col, row) =>
      set({ activeCell: { col, row }, selectionStart: { col, row }, selectionEnd: { col, row }, editMode: "Ready" }),

    setSelection: (start, end) => set({ selectionStart: start, selectionEnd: end }),

    startEditing: (col, row) => {
      const sheet = get().getActiveSheet();
      const key = cellKey(col, row);
      const raw = sheet.cells[key]?.raw || "";
      set({ editingCell: { col, row }, editValue: raw, editMode: "Edit" });
    },

    setEditValue: (value) => set({ editValue: value }),

    commitEdit: () => {
      const state = get();
      if (!state.editingCell) return;
      const { col, row } = state.editingCell;
      const key = cellKey(col, row);
      const sheet = state.getActiveSheet();
      const rule = sheet.dataValidations?.[key];

      if (rule && state.editValue) {
        const isValid = validateCellValue(state.editValue, rule);
        if (!isValid) {
          const errorStyle = rule.errorStyle || "reject";
          const error: ValidationError = {
            cellKey: key,
            title: rule.errorTitle || "Invalid Input",
            message: rule.errorMessage || "The value entered does not meet the validation criteria.",
            style: errorStyle,
          };
          if (errorStyle === "reject") {
            // Reject: revert to previous value, show error
            set({
              editingCell: null,
              editValue: "",
              editMode: "Ready",
              validationErrors: { ...state.validationErrors, [key]: error },
            });
            return;
          }
          // Warning: allow but show warning
          set({
            validationErrors: { ...state.validationErrors, [key]: error },
          });
        } else {
          // Clear any previous error
          const errors = { ...state.validationErrors };
          delete errors[key];
          set({ validationErrors: errors });
        }
      }

      get().pushUndo();
      get().setCellValue(col, row, state.editValue);
      set({ editingCell: null, editValue: "", editMode: "Ready" });
    },

    cancelEdit: () => set({ editingCell: null, editValue: "", editMode: "Ready" }),

    setCellValue: (col, row, value) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const key = cellKey(col, row);
      const existing = sheet.cells[key];
      const newCells = {
        ...sheet.cells,
        [key]: { raw: value, style: existing?.style || {}, comment: existing?.comment },
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
            ? { ...s, colWidths: { ...s.colWidths, [col]: Math.max(30, width) } }
            : s
        ),
      });
    },

    setRowHeight: (row, height) => {
      const state = get();
      const sheet = state.getActiveSheet();
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id
            ? { ...s, rowHeights: { ...s.rowHeights, [row]: Math.max(16, height) } }
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
      const state = get();
      const sheet = state.getActiveSheet();
      if (state.showFormulas) {
        const key = cellKey(col, row);
        return sheet.cells[key]?.raw || "";
      }
      const val = getComputedValue(sheet.cells, col, row);
      const key = cellKey(col, row);
      const format = sheet.cells[key]?.style?.format;
      return formatValue(val, format);
    },

    getCellData: (col, row) => {
      const sheet = get().getActiveSheet();
      const key = cellKey(col, row);
      return sheet.cells[key];
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

    setSheetTabColor: (id, color) =>
      set({
        sheets: get().sheets.map((s) => (s.id === id ? { ...s, tabColor: color } : s)),
      }),

    duplicateSheet: (id) => {
      const state = get();
      const source = state.sheets.find((s) => s.id === id);
      if (!source) return;
      const newId = `sheet${Date.now()}`;
      const newSheet: Sheet = {
        ...source,
        id: newId,
        name: `${source.name} (Copy)`,
        cells: { ...source.cells },
        colWidths: { ...source.colWidths },
        rowHeights: { ...source.rowHeights },
      };
      const idx = state.sheets.findIndex((s) => s.id === id);
      const newSheets = [...state.sheets];
      newSheets.splice(idx + 1, 0, newSheet);
      set({ sheets: newSheets, activeSheetId: newId });
    },

    moveSheet: (id, direction) => {
      const state = get();
      const idx = state.sheets.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const newIdx = direction === "left" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= state.sheets.length) return;
      const newSheets = [...state.sheets];
      [newSheets[idx], newSheets[newIdx]] = [newSheets[newIdx], newSheets[idx]];
      set({ sheets: newSheets });
    },

    hideSheet: (id) => {
      const state = get();
      const visibleSheets = state.sheets.filter((s) => !s.hidden);
      if (visibleSheets.length <= 1) return;
      set({
        sheets: state.sheets.map((s) => (s.id === id ? { ...s, hidden: true } : s)),
        activeSheetId: state.activeSheetId === id
          ? (visibleSheets.find((s) => s.id !== id)?.id || state.activeSheetId)
          : state.activeSheetId,
      });
    },

    unhideSheet: (id) =>
      set({
        sheets: get().sheets.map((s) => (s.id === id ? { ...s, hidden: false } : s)),
      }),

    setFrozenPanes: (rows, cols) => {
      const state = get();
      const sheet = state.getActiveSheet();
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, frozenRows: rows, frozenCols: cols } : s
        ),
      });
    },

    toggleAiPanel: () => set({ showAiPanel: !get().showAiPanel }),
    openChartModal: (type) => set({ showChartModal: true, chartType: type }),
    closeChartModal: () => set({ showChartModal: false }),
    openTemplatesModal: () => set({ showTemplatesModal: true }),
    closeTemplatesModal: () => set({ showTemplatesModal: false }),

    setActiveRibbonTab: (tab) => set({ activeRibbonTab: tab }),

    clipboardCopy: () => {
      const state = get();
      const { selectionStart, selectionEnd, activeCell } = state;
      const s = selectionStart || activeCell;
      const e = selectionEnd || activeCell;
      if (!s || !e) return;
      const minC = Math.min(s.col, e.col);
      const maxC = Math.max(s.col, e.col);
      const minR = Math.min(s.row, e.row);
      const maxR = Math.max(s.row, e.row);
      const sheet = state.getActiveSheet();
      const cells: Record<string, CellData> = {};
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const key = cellKey(c, r);
          if (sheet.cells[key]) cells[key] = { ...sheet.cells[key] };
        }
      }
      set({ clipboard: { cells, startCol: minC, startRow: minR, endCol: maxC, endRow: maxR } });
    },

    clipboardCut: () => {
      get().clipboardCopy();
      set((state) => ({ clipboard: state.clipboard ? { ...state.clipboard, cut: true } : null }));
    },

    clipboardPaste: () => {
      const state = get();
      if (!state.clipboard || !state.activeCell) return;
      const { clipboard, activeCell } = state;
      const colOffset = activeCell.col - clipboard.startCol;
      const rowOffset = activeCell.row - clipboard.startRow;
      get().pushUndo();
      const sheet = state.getActiveSheet();
      const newCells = { ...sheet.cells };
      for (const [key, data] of Object.entries(clipboard.cells)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if (!match) continue;
        const origCol = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        const origRow = parseInt(match[2]) - 1;
        const newKey = cellKey(origCol + colOffset, origRow + rowOffset);
        newCells[newKey] = { ...data };
      }
      if (clipboard.cut) {
        for (const key of Object.keys(clipboard.cells)) {
          if (!newCells[key] || Object.keys(clipboard.cells).includes(key)) {
            const match = key.match(/^([A-Z]+)(\d+)$/);
            if (match) {
              const origCol = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
              const origRow = parseInt(match[2]) - 1;
              const movedKey = cellKey(origCol + colOffset, origRow + rowOffset);
              if (movedKey !== key) {
                newCells[key] = { raw: "", style: {} };
              }
            }
          }
        }
        set({ clipboard: null });
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    clipboardPasteSpecial: (type) => {
      const state = get();
      if (!state.clipboard || !state.activeCell) return;
      const { clipboard, activeCell } = state;
      const colOffset = activeCell.col - clipboard.startCol;
      const rowOffset = activeCell.row - clipboard.startRow;
      get().pushUndo();
      const sheet = state.getActiveSheet();
      const newCells = { ...sheet.cells };

      if (type === "transpose") {
        const width = clipboard.endCol - clipboard.startCol;
        const height = clipboard.endRow - clipboard.startRow;
        for (const [key, data] of Object.entries(clipboard.cells)) {
          const match = key.match(/^([A-Z]+)(\d+)$/);
          if (!match) continue;
          const origCol = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
          const origRow = parseInt(match[2]) - 1;
          const relCol = origCol - clipboard.startCol;
          const relRow = origRow - clipboard.startRow;
          const newKey = cellKey(activeCell.col + relRow, activeCell.row + relCol);
          newCells[newKey] = { ...data };
        }
      } else {
        for (const [key, data] of Object.entries(clipboard.cells)) {
          const match = key.match(/^([A-Z]+)(\d+)$/);
          if (!match) continue;
          const origCol = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
          const origRow = parseInt(match[2]) - 1;
          const newKey = cellKey(origCol + colOffset, origRow + rowOffset);
          const existing = newCells[newKey] || { raw: "", style: {} };
          switch (type) {
            case "values": {
              const val = getComputedValue(sheet.cells, origCol, origRow);
              newCells[newKey] = { ...existing, raw: String(val) };
              break;
            }
            case "formulas":
              newCells[newKey] = { ...existing, raw: data.raw };
              break;
            case "formats":
              newCells[newKey] = { ...existing, style: { ...data.style } };
              break;
          }
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(400, zoom)) }),

    toggleShowFormulas: () => set({ showFormulas: !get().showFormulas }),
    toggleShowGridlines: () => set({ showGridlines: !get().showGridlines }),
    toggleShowHeadings: () => set({ showHeadings: !get().showHeadings }),

    setCellComment: (col, row, comment) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const key = cellKey(col, row);
      const existing = sheet.cells[key] || { raw: "", style: {} };
      const newCells = {
        ...sheet.cells,
        [key]: { ...existing, comment },
      };
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    setNamedRange: (name, range) =>
      set({ namedRanges: { ...get().namedRanges, [name]: range } }),

    deleteNamedRange: (name) => {
      const { [name]: _, ...rest } = get().namedRanges;
      set({ namedRanges: rest });
    },

    pushUndo: () => {
      const state = get();
      const sheet = state.getActiveSheet();
      set({
        undoStack: [...state.undoStack.slice(-49), { ...sheet.cells }],
        redoStack: [],
      });
    },

    undo: () => {
      const state = get();
      if (state.undoStack.length === 0) return;
      const sheet = state.getActiveSheet();
      const prev = state.undoStack[state.undoStack.length - 1];
      set({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { ...sheet.cells }],
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: prev } : s
        ),
      });
    },

    redo: () => {
      const state = get();
      if (state.redoStack.length === 0) return;
      const sheet = state.getActiveSheet();
      const next = state.redoStack[state.redoStack.length - 1];
      set({
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, { ...sheet.cells }],
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: next } : s
        ),
      });
    },

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

    clearRange: (startCol, startRow, endCol, endRow, type) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const newCells = { ...sheet.cells };
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const key = cellKey(c, r);
          const cell = newCells[key];
          if (!cell) continue;
          switch (type) {
            case "all":
              delete newCells[key];
              break;
            case "contents":
              newCells[key] = { ...cell, raw: "" };
              break;
            case "formats":
              newCells[key] = { ...cell, style: {} };
              break;
            case "comments":
              newCells[key] = { ...cell, comment: undefined };
              break;
          }
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    insertRows: (row, count) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const newCells: Record<string, CellData> = {};
      for (const [key, data] of Object.entries(sheet.cells)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if (!match) { newCells[key] = data; continue; }
        const r = parseInt(match[2]) - 1;
        if (r >= row) {
          newCells[`${match[1]}${r + count + 1}`] = data;
        } else {
          newCells[key] = data;
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    deleteRows: (row, count) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const newCells: Record<string, CellData> = {};
      for (const [key, data] of Object.entries(sheet.cells)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if (!match) { newCells[key] = data; continue; }
        const r = parseInt(match[2]) - 1;
        if (r >= row && r < row + count) continue;
        if (r >= row + count) {
          newCells[`${match[1]}${r - count + 1}`] = data;
        } else {
          newCells[key] = data;
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    insertCols: (col, count) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const newCells: Record<string, CellData> = {};
      for (const [key, data] of Object.entries(sheet.cells)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if (!match) { newCells[key] = data; continue; }
        const c = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        if (c >= col) {
          newCells[`${colToLetter(c + count)}${match[2]}`] = data;
        } else {
          newCells[key] = data;
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    deleteCols: (col, count) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const newCells: Record<string, CellData> = {};
      for (const [key, data] of Object.entries(sheet.cells)) {
        const match = key.match(/^([A-Z]+)(\d+)$/);
        if (!match) { newCells[key] = data; continue; }
        const c = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        if (c >= col && c < col + count) continue;
        if (c >= col + count) {
          newCells[`${colToLetter(c - count)}${match[2]}`] = data;
        } else {
          newCells[key] = data;
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: newCells } : s
        ),
      });
    },

    // Conditional formatting
    addConditionalFormat: (rule) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const existing = sheet.conditionalFormats || [];
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, conditionalFormats: [...existing, rule] } : s
        ),
      });
    },

    removeConditionalFormat: (ruleId) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const existing = sheet.conditionalFormats || [];
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, conditionalFormats: existing.filter(r => r.id !== ruleId) } : s
        ),
      });
    },

    getConditionalFormats: () => {
      return get().getActiveSheet().conditionalFormats || [];
    },

    // Merge cells
    mergeCells: (startCol, startRow, endCol, endRow) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const existing = sheet.mergedCells || [];
      // Get value from top-left cell
      const topLeftKey = cellKey(startCol, startRow);
      const topLeftVal = sheet.cells[topLeftKey]?.raw || "";
      // Clear all other cells in the merge range
      const newCells = { ...sheet.cells };
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r === startRow && c === startCol) continue;
          const k = cellKey(c, r);
          if (newCells[k]) {
            newCells[k] = { ...newCells[k], raw: "" };
          }
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? {
            ...s,
            cells: newCells,
            mergedCells: [...existing, { startCol, startRow, endCol, endRow }]
          } : s
        ),
      });
    },

    unmergeCells: (startCol, startRow) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const existing = sheet.mergedCells || [];
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? {
            ...s,
            mergedCells: existing.filter(m => !(m.startCol === startCol && m.startRow === startRow))
          } : s
        ),
      });
    },

    getMergedCells: () => {
      return get().getActiveSheet().mergedCells || [];
    },

    // Data validation
    setDataValidation: (key, rule) => {
      const state = get();
      const sheet = state.getActiveSheet();
      const existing = { ...(sheet.dataValidations || {}) };
      if (rule) {
        existing[key] = rule;
      } else {
        delete existing[key];
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, dataValidations: existing } : s
        ),
      });
    },

    getDataValidation: (key) => {
      return get().getActiveSheet().dataValidations?.[key];
    },

    clearValidationError: (key) => {
      const errors = { ...get().validationErrors };
      delete errors[key];
      set({ validationErrors: errors });
    },

    getValidationErrors: () => {
      return get().validationErrors;
    },

    // Embedded charts
    addEmbeddedChart: (chart) => {
      const id = `chart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      set({ embeddedCharts: [...get().embeddedCharts, { ...chart, id }], selectedChartId: id });
    },
    updateEmbeddedChart: (id, updates) => {
      set({
        embeddedCharts: get().embeddedCharts.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      });
    },
    removeEmbeddedChart: (id) => {
      set({
        embeddedCharts: get().embeddedCharts.filter((c) => c.id !== id),
        selectedChartId: get().selectedChartId === id ? null : get().selectedChartId,
      });
    },
    setSelectedChart: (id) => set({ selectedChartId: id }),
    getChartsForActiveSheet: () => {
      const state = get();
      return state.embeddedCharts.filter((c) => c.sheetId === state.activeSheetId);
    },

    // Import CSV
    importCSV: (csvContent) => {
      const state = get();
      const sheet = state.getActiveSheet();
      get().pushUndo();
      const newCells: Record<string, CellData> = {};
      const lines = csvContent.split(/\r?\n/);
      for (let r = 0; r < lines.length; r++) {
        const line = lines[r];
        if (!line.trim()) continue;
        // Simple CSV parse (handles quoted fields)
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === ',' && !inQuotes) {
            values.push(current);
            current = "";
          } else {
            current += ch;
          }
        }
        values.push(current);
        for (let c = 0; c < values.length; c++) {
          const val = values[c].trim();
          if (val) {
            newCells[cellKey(c, r)] = { raw: val, style: {} };
          }
        }
      }
      set({
        sheets: state.sheets.map((s) =>
          s.id === sheet.id ? { ...s, cells: { ...sheet.cells, ...newCells } } : s
        ),
      });
    },
  };
});
