import SpreadsheetEditor from "@/components/spreadsheet/SpreadsheetEditor";

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
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SpreadsheetEditor />
    </div>
  );
}
