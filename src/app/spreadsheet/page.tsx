"use client";

import { useCallback } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { SpreadsheetToolbar } from "@/components/spreadsheet/spreadsheet-toolbar";
import { FormulaBar } from "@/components/spreadsheet/formula-bar";
import { SpreadsheetGrid } from "@/components/spreadsheet/spreadsheet-grid";
import { SheetTabs } from "@/components/spreadsheet/sheet-tabs";
import { StatusBar } from "@/components/spreadsheet/status-bar";
import { ChartModal } from "@/components/spreadsheet/chart-modal";
import { TemplatesModal } from "@/components/spreadsheet/templates-modal";
import { AiPanel } from "@/components/spreadsheet/ai-panel";
import { exportToCSV, printSheet } from "@/components/spreadsheet/export-utils";

export default function SpreadsheetPage() {
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);

  const handleExportCSV = useCallback(() => {
    const sheet = getActiveSheet();
    exportToCSV(sheet, getCellDisplay);
  }, [getActiveSheet, getCellDisplay]);

  const handlePrint = useCallback(() => {
    const sheet = getActiveSheet();
    printSheet(sheet, getCellDisplay);
  }, [getActiveSheet, getCellDisplay]);

  return (
    <div
      className="flex flex-col h-full -m-6"
      style={{ backgroundColor: "var(--background)" }}
    >
      <SpreadsheetToolbar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      <FormulaBar />
      <div className="flex flex-1 overflow-hidden">
        <SpreadsheetGrid />
        <AiPanel />
      </div>
      <SheetTabs />
      <StatusBar />
      <ChartModal />
      <TemplatesModal />
    </div>
  );
}
