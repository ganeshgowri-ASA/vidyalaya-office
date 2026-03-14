import { Sheet } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

export function exportToCSV(sheet: Sheet, getCellDisplay: (col: number, row: number) => string): void {
  // Find the bounds of data
  const keys = Object.keys(sheet.cells);
  if (keys.length === 0) return;

  let maxRow = 0;
  let maxCol = 0;
  keys.forEach((key) => {
    const match = key.match(/^([A-Z])(\d+)$/);
    if (match) {
      const c = match[1].charCodeAt(0) - 65;
      const r = parseInt(match[2], 10) - 1;
      if (c > maxCol) maxCol = c;
      if (r > maxRow) maxRow = r;
    }
  });

  const rows: string[] = [];
  for (let r = 0; r <= maxRow; r++) {
    const cols: string[] = [];
    for (let c = 0; c <= maxCol; c++) {
      const val = getCellDisplay(c, r);
      // Escape CSV values
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        cols.push(`"${val.replace(/"/g, '""')}"`);
      } else {
        cols.push(val);
      }
    }
    rows.push(cols.join(","));
  }

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sheet.name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printSheet(sheet: Sheet, getCellDisplay: (col: number, row: number) => string): void {
  const keys = Object.keys(sheet.cells);
  if (keys.length === 0) return;

  let maxRow = 0;
  let maxCol = 0;
  keys.forEach((key) => {
    const match = key.match(/^([A-Z])(\d+)$/);
    if (match) {
      const c = match[1].charCodeAt(0) - 65;
      const r = parseInt(match[2], 10) - 1;
      if (c > maxCol) maxCol = c;
      if (r > maxRow) maxRow = r;
    }
  });

  let html = `<html><head><title>${sheet.name}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:20px}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;font-size:12px}
      th{background:#f0f0f0;font-weight:600}
    </style></head><body>
    <h2>${sheet.name}</h2><table><thead><tr><th></th>`;

  for (let c = 0; c <= maxCol; c++) {
    html += `<th>${colToLetter(c)}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (let r = 0; r <= maxRow; r++) {
    html += `<tr><td><strong>${r + 1}</strong></td>`;
    for (let c = 0; c <= maxCol; c++) {
      const val = getCellDisplay(c, r);
      const key = `${colToLetter(c)}${r + 1}`;
      const style = sheet.cells[key]?.style || {};
      let css = "";
      if (style.bold) css += "font-weight:700;";
      if (style.italic) css += "font-style:italic;";
      if (style.align) css += `text-align:${style.align};`;
      if (style.bgColor) css += `background:${style.bgColor};`;
      if (style.textColor) css += `color:${style.textColor};`;
      html += `<td style="${css}">${val}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table></body></html>";

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
