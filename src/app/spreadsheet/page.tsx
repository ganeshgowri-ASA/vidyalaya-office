import { Table2 } from "lucide-react";

export default function SpreadsheetPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Table2 size={48} style={{ color: "var(--primary)" }} />
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Spreadsheet Editor
      </h1>
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Spreadsheet Editor coming in P4
      </p>
      <div
        className="mt-4 rounded-lg border px-6 py-3 text-sm"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        Formula-powered spreadsheets with AI data analysis, charting, and pivot tables.
      </div>
    </div>
  );
}
