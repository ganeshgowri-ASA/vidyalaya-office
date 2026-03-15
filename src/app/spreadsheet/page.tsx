"use client";

import { useCallback, useEffect, useState } from "react";
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
import { exportToCSV, printSheet } from "@/components/spreadsheet/export-utils";
import { PageSetupDialog } from "@/components/document/page-setup-dialog";

export default function SpreadsheetPage() {
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const loadTemplate = useSpreadsheetStore((s) => s.loadTemplate);

  const [showPivot, setShowPivot] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);

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

  const handlePrint = useCallback(() => {
    const sheet = getActiveSheet();
    printSheet(sheet, getCellDisplay);
  }, [getActiveSheet, getCellDisplay]);

  return (
    <div
      className="flex flex-col h-full -m-6"
      style={{ backgroundColor: "var(--background)" }}
    >
      <SpreadsheetToolbar
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        onOpenPivot={() => setShowPivot(true)}
        onOpenValidation={() => setShowValidation(true)}
        onOpenSortFilter={() => setShowSortFilter(true)}
        onPageSetup={() => setShowPageSetup(true)}
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
          // Validation rules are stored - for now just close
          setShowValidation(false);
        }}
      />
      <SortFilterPanel
        open={showSortFilter}
        onClose={() => setShowSortFilter(false)}
      />
      <PageSetupDialog open={showPageSetup} onClose={() => setShowPageSetup(false)} />
    </div>
  );
}
