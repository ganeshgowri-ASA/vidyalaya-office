"use client";

import { useState, useCallback, useEffect } from "react";
import { useSpreadsheetStore, type DataValidationRule } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";
import { exportToCSV, printSheet, exportToExcelXML } from "./export-utils";
import { SpreadsheetToolbar } from "./spreadsheet-toolbar";
import { FormulaBar } from "./formula-bar";
import { SpreadsheetGrid } from "./spreadsheet-grid";
import { SheetTabs } from "./sheet-tabs";
import { StatusBar } from "./status-bar";
import { AiPanel } from "./ai-panel";
import { ChartModal } from "./chart-modal";
import { TemplatesModal } from "./templates-modal";
import { PivotTableModal } from "./pivot-table-modal";
import { ConditionalFormattingModal } from "./conditional-formatting-modal";
import { DataValidationModal } from "./data-validation-modal";
import { SortFilterPanel } from "./sort-filter-panel";
import { GoalSeekModal } from "./goal-seek-modal";
import { StatisticalAnalysisModal } from "./statistical-analysis-modal";
import { FindReplaceDialog } from "./find-replace-dialog";
import { NamedRangesDialog } from "./named-ranges-dialog";
import { CellCommentsDialog } from "./cell-comments-dialog";
import { FreezePanesDialog } from "./freeze-panes-dialog";
import { CellFormattingDialog } from "./cell-formatting-dialog";
import { FinancialAnalysisModal } from "./financial-analysis-modal";
import { PowerQueryModal } from "./power-query-modal";
import { MacrosRecorderModal } from "./macros-recorder-modal";
import { SheetProtectionDialog } from "./sheet-protection-dialog";
import { VlookupHelperModal } from "./vlookup-helper-modal";
import { SplitView } from "./split-view";
import { ImportDialog } from "@/components/shared/import-dialog";
import { PrintPreviewModal } from "@/components/shared/print-preview-modal";
import { GlobalDropzoneOverlay } from "@/components/shared/dropzone-overlay";
import { ExportManager } from "@/lib/export-manager";

export default function SpreadsheetWorkspace() {
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const showAiPanel = useSpreadsheetStore((s) => s.showAiPanel);
  const showChartModal = useSpreadsheetStore((s) => s.showChartModal);
  const showTemplatesModal = useSpreadsheetStore((s) => s.showTemplatesModal);
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const setDataValidation = useSpreadsheetStore((s) => s.setDataValidation);
  const importCSV = useSpreadsheetStore((s) => s.importCSV);

  // Modal states
  const [showPivot, setShowPivot] = useState(false);
  const [showCondFormat, setShowCondFormat] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [showGoalSeek, setShowGoalSeek] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showNamedRanges, setShowNamedRanges] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFreezePanes, setShowFreezePanes] = useState(false);
  const [showCellFormatting, setShowCellFormatting] = useState(false);
  const [showFinancialAnalysis, setShowFinancialAnalysis] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showPowerQuery, setShowPowerQuery] = useState(false);
  const [showMacros, setShowMacros] = useState(false);
  const [showSheetProtection, setShowSheetProtection] = useState(false);
  const [showVlookupHelper, setShowVlookupHelper] = useState(false);
  const [splitView, setSplitView] = useState<"horizontal" | "vertical" | null>(null);

  // Pick up imported spreadsheet data from sessionStorage (set by import engine)
  useEffect(() => {
    const importedData = sessionStorage.getItem("import-spreadsheet-data");
    if (importedData) {
      try {
        const parsed = JSON.parse(importedData);
        if (parsed.sheets && parsed.sheets.length > 0) {
          const sheet = parsed.sheets[0];
          // Convert to CSV format for importCSV
          const rows: string[] = [];
          for (let r = 1; r <= sheet.maxRow; r++) {
            const cols: string[] = [];
            for (let c = 0; c < sheet.maxCol; c++) {
              const colLetter = String.fromCharCode(65 + (c % 26));
              const ref = `${colLetter}${r}`;
              const cell = sheet.cells[ref];
              const val = cell?.value ?? "";
              // Quote values containing commas
              cols.push(val.includes(",") ? `"${val}"` : val);
            }
            rows.push(cols.join(","));
          }
          if (rows.length > 0) {
            importCSV(rows.join("\n"));
          }
        }
      } catch {
        // ignore parse errors
      }
      sessionStorage.removeItem("import-spreadsheet-data");
      sessionStorage.removeItem("import-spreadsheet-name");
    }
  }, [importCSV]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    const sheet = getActiveSheet();
    exportToCSV(sheet, getCellDisplay);
  }, [getActiveSheet, getCellDisplay]);

  const handleExportExcel = useCallback(() => {
    const sheet = getActiveSheet();
    exportToExcelXML(sheet, getCellDisplay);
  }, [getActiveSheet, getCellDisplay]);

  const handlePrint = useCallback(() => {
    const sheet = getActiveSheet();
    printSheet(sheet, getCellDisplay);
  }, [getActiveSheet, getCellDisplay]);

  const handleImport = useCallback(async (file: File) => {
    const progress = (_p: { percent: number; message: string }) => {};
    if (file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.name.endsWith(".txt")) {
      const text = await file.text();
      importCSV(text);
    } else {
      try {
        const result = await ExportManager.importDocument(file, progress);
        importCSV(result.content);
      } catch {
        // fallback: try reading as text
        const text = await file.text();
        importCSV(text);
      }
    }
  }, [importCSV]);

  const getSpreadsheetHtml = useCallback(() => {
    const sheet = getActiveSheet();
    let html = "<table border='1' style='border-collapse:collapse;font-size:13px;'>";
    for (let r = 0; r < 50; r++) {
      let hasContent = false;
      let row = "<tr>";
      for (let c = 0; c < 26; c++) {
        const key = `${colToLetter(c)}${r + 1}`;
        const val = getCellDisplay(c, r);
        if (val) hasContent = true;
        row += `<td style='padding:4px 8px;border:1px solid #ddd;'>${val || ""}</td>`;
      }
      row += "</tr>";
      if (hasContent) html += row;
    }
    html += "</table>";
    return html;
  }, [getActiveSheet, getCellDisplay]);

  // Data validation apply
  const handleValidationApply = useCallback((rule: DataValidationRule) => {
    if (!activeCell) return;
    const key = `${colToLetter(activeCell.col)}${activeCell.row + 1}`;
    setDataValidation(key, rule);
  }, [activeCell, setDataValidation]);

  // Clipboard paste handler for CSV/TSV auto-detection
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only intercept if no cell is being edited
      const editingCell = useSpreadsheetStore.getState().editingCell;
      if (editingCell) return;

      const text = e.clipboardData?.getData("text/plain");
      if (!text) return;

      // Detect if it's tabular data (TSV or CSV)
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 1) return;

      const hasTab = text.includes("\t");
      const hasComma = text.includes(",");
      const isTabular = lines.length > 1 && (hasTab || hasComma);

      if (isTabular) {
        e.preventDefault();
        const delimiter = hasTab ? "\t" : ",";
        const ac = useSpreadsheetStore.getState().activeCell;
        if (!ac) return;

        useSpreadsheetStore.getState().pushUndo();
        const setCellValue = useSpreadsheetStore.getState().setCellValue;

        for (let r = 0; r < lines.length; r++) {
          const values = lines[r].split(delimiter);
          for (let c = 0; c < values.length; c++) {
            const val = values[c].trim().replace(/^"|"$/g, "");
            if (val) {
              setCellValue(ac.col + c, ac.row + r, val);
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Keyboard shortcut: Ctrl+H for Find & Replace, Ctrl+F for Find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        setShowFindReplace(true);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for custom events from context menu
  useEffect(() => {
    const handleOpenFormatCells = () => setShowCellFormatting(true);
    const handleOpenSortFilter = () => setShowSortFilter(true);
    window.addEventListener("spreadsheet:openFormatCells", handleOpenFormatCells);
    window.addEventListener("spreadsheet:openSortFilter", handleOpenSortFilter);
    return () => {
      window.removeEventListener("spreadsheet:openFormatCells", handleOpenFormatCells);
      window.removeEventListener("spreadsheet:openSortFilter", handleOpenSortFilter);
    };
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--background)" }}>
      {/* Toolbar */}
      <SpreadsheetToolbar
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        onOpenPivot={() => setShowPivot(true)}
        onOpenCondFormatDialog={() => setShowCondFormat(true)}
        onOpenValidation={() => setShowValidation(true)}
        onOpenSortFilter={() => setShowSortFilter(true)}
        onOpenGoalSeek={() => setShowGoalSeek(true)}
        onOpenStatistics={() => setShowStatistics(true)}
        onOpenFindReplace={() => setShowFindReplace(true)}
        onOpenNamedRanges={() => setShowNamedRanges(true)}
        onOpenComments={() => setShowComments(true)}
        onOpenFreezePanes={() => setShowFreezePanes(true)}
        onOpenCellFormatting={() => setShowCellFormatting(true)}
        onOpenFinancialAnalysis={() => setShowFinancialAnalysis(true)}
        onOpenPowerQuery={() => setShowPowerQuery(true)}
        onOpenMacros={() => setShowMacros(true)}
        onOpenSheetProtection={() => setShowSheetProtection(true)}
        onOpenVlookupHelper={() => setShowVlookupHelper(true)}
        onSplitView={(dir) => setSplitView(dir)}
        onRemoveSplit={() => setSplitView(null)}
        splitView={splitView}
        onImportCSV={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv,.tsv,.txt";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const content = ev.target?.result as string;
              if (content) importCSV(content);
            };
            reader.readAsText(file);
          };
          input.click();
        }}
        onImport={() => setShowImport(true)}
        onPrintPreview={() => setShowPrintPreview(true)}
      />

      {/* Formula Bar */}
      <FormulaBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Grid or Split View */}
        {splitView ? (
          <SplitView direction={splitView} onClose={() => setSplitView(null)} />
        ) : (
          <div className="flex-1 overflow-hidden">
            <SpreadsheetGrid />
          </div>
        )}

        {/* AI Panel */}
        {showAiPanel && (
          <div className="w-80 border-l" style={{ borderColor: "var(--border)" }}>
            <AiPanel />
          </div>
        )}
      </div>

      {/* Sheet Tabs */}
      <SheetTabs />

      {/* Status Bar */}
      <StatusBar />

      {/* ─── Modals ─── */}
      {showChartModal && <ChartModal />}
      {showTemplatesModal && <TemplatesModal />}

      <PivotTableModal open={showPivot} onClose={() => setShowPivot(false)} />
      <ConditionalFormattingModal open={showCondFormat} onClose={() => setShowCondFormat(false)} />
      <DataValidationModal
        open={showValidation}
        onClose={() => setShowValidation(false)}
        onApply={handleValidationApply}
      />
      <SortFilterPanel open={showSortFilter} onClose={() => setShowSortFilter(false)} />
      <GoalSeekModal open={showGoalSeek} onClose={() => setShowGoalSeek(false)} />
      <StatisticalAnalysisModal open={showStatistics} onClose={() => setShowStatistics(false)} />
      <FindReplaceDialog open={showFindReplace} onClose={() => setShowFindReplace(false)} />
      <NamedRangesDialog open={showNamedRanges} onClose={() => setShowNamedRanges(false)} />
      <CellCommentsDialog open={showComments} onClose={() => setShowComments(false)} />
      <FreezePanesDialog open={showFreezePanes} onClose={() => setShowFreezePanes(false)} />
      <CellFormattingDialog open={showCellFormatting} onClose={() => setShowCellFormatting(false)} />
      <FinancialAnalysisModal open={showFinancialAnalysis} onClose={() => setShowFinancialAnalysis(false)} />
      <PowerQueryModal open={showPowerQuery} onClose={() => setShowPowerQuery(false)} />
      <MacrosRecorderModal open={showMacros} onClose={() => setShowMacros(false)} />
      <SheetProtectionDialog open={showSheetProtection} onClose={() => setShowSheetProtection(false)} />
      <VlookupHelperModal open={showVlookupHelper} onClose={() => setShowVlookupHelper(false)} />
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        defaultType="spreadsheet"
      />
      <PrintPreviewModal
        open={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        htmlContent={getSpreadsheetHtml()}
        title="Spreadsheet"
      />
      <GlobalDropzoneOverlay
        onFileDrop={(files) => {
          if (files[0]) handleImport(files[0]);
        }}
      />
    </div>
  );
}
