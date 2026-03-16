"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { SpreadsheetToolbar } from "@/components/spreadsheet/spreadsheet-toolbar";
import { FormulaBar } from "@/components/spreadsheet/formula-bar";
import { SpreadsheetGrid } from "@/components/spreadsheet/spreadsheet-grid";
import { SheetTabs } from "@/components/spreadsheet/sheet-tabs";
import { StatusBar } from "@/components/spreadsheet/status-bar";
import { ChartModal } from "@/components/spreadsheet/chart-modal";
import { TemplatesModal } from "@/components/spreadsheet/templates-modal";
import { AiPanel } from "@/components/spreadsheet/ai-panel";
import { PivotTableModal } from "@/components/spreadsheet/pivot-table-modal";
import { DataValidationModal } from "@/components/spreadsheet/data-validation-modal";
import { SortFilterPanel } from "@/components/spreadsheet/sort-filter-panel";
import { ConditionalFormattingModal } from "@/components/spreadsheet/conditional-formatting-modal";
import { GoalSeekModal } from "@/components/spreadsheet/goal-seek-modal";
import { StatisticalAnalysisModal } from "@/components/spreadsheet/statistical-analysis-modal";
import { exportToCSV, exportToExcelXML, printSheet } from "@/components/spreadsheet/export-utils";
import { PageSetupDialog } from "@/components/document/page-setup-dialog";

export default function SpreadsheetPage() {
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const loadTemplate = useSpreadsheetStore((s) => s.loadTemplate);
  const importCSV = useSpreadsheetStore((s) => s.importCSV);

  const [showPivot, setShowPivot] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showCondFormat, setShowCondFormat] = useState(false);
  const [showGoalSeek, setShowGoalSeek] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const csvInputRef = useRef<HTMLInputElement>(null);

  // Load template from localStorage if navigated from Templates page
  useEffect(() => {
    const templateData = localStorage.getItem("vidyalaya-spreadsheet-template");
    if (templateData) {
      try {
        const parsed = JSON.parse(templateData);
        if (parsed.cells) {
          loadTemplate(parsed.cells);
        }
      } catch (e) {
        console.error("Failed to load template:", e);
      }
      localStorage.removeItem("vidyalaya-spreadsheet-template");
    }
  }, [loadTemplate]);

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

  const handleImportCSV = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt";
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
  }, [importCSV]);

  return (
    <div
      className="flex flex-col h-full -m-6"
      style={{ backgroundColor: "var(--background)" }}
    >
      <SpreadsheetToolbar
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onOpenPivot={() => setShowPivot(true)}
        onOpenValidation={() => setShowValidation(true)}
        onOpenSortFilter={() => setShowSortFilter(true)}
        onOpenCondFormatDialog={() => setShowCondFormat(true)}
        onOpenGoalSeek={() => setShowGoalSeek(true)}
        onOpenStatistics={() => setShowStatistics(true)}
        onPageSetup={() => setShowPageSetup(true)}
        onImportCSV={handleImportCSV}
      />
      <FormulaBar />
      <div className="flex flex-1 overflow-hidden">
        <SpreadsheetGrid />
        <AiPanel />
      </div>
      <SheetTabs />
      <StatusBar />
      <ChartModal />
      <TemplatesModal />
      <PivotTableModal open={showPivot} onClose={() => setShowPivot(false)} />
      <DataValidationModal
        open={showValidation}
        onClose={() => setShowValidation(false)}
        onApply={(rule) => {
          setShowValidation(false);
        }}
      />
      <SortFilterPanel
        open={showSortFilter}
        onClose={() => setShowSortFilter(false)}
      />
      <ConditionalFormattingModal
        open={showCondFormat}
        onClose={() => setShowCondFormat(false)}
      />
      <GoalSeekModal
        open={showGoalSeek}
        onClose={() => setShowGoalSeek(false)}
      />
      <StatisticalAnalysisModal
        open={showStatistics}
        onClose={() => setShowStatistics(false)}
      />
      <PageSetupDialog open={showPageSetup} onClose={() => setShowPageSetup(false)} />
    </div>
  );
}
