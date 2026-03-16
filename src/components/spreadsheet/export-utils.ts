import { Sheet, type CellStyle } from "@/store/spreadsheet-store";
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

export function getBounds(sheet: Sheet): { maxRow: number; maxCol: number } {
  const keys = Object.keys(sheet.cells);
  let maxRow = 0;
  let maxCol = 0;
  keys.forEach((key) => {
    const match = key.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const c = match[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const r = parseInt(match[2], 10) - 1;
      if (c > maxCol) maxCol = c;
      if (r > maxRow) maxRow = r;
    }
  });
  return { maxRow, maxCol };
}

export function exportToExcelXML(sheet: Sheet, getCellDisplay: (col: number, row: number) => string): void {
  const { maxRow, maxCol } = getBounds(sheet);
  if (maxRow === 0 && maxCol === 0 && Object.keys(sheet.cells).length === 0) return;

  // Build SpreadsheetML (XML-based Excel format)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default"><Font ss:FontName="Calibri" ss:Size="11"/></Style>
  <Style ss:ID="Bold"><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/></Style>
  <Style ss:ID="Header"><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#F0F0F0" ss:Pattern="Solid"/></Style>
 </Styles>
 <Worksheet ss:Name="${sheet.name}">
  <Table>`;

  for (let r = 0; r <= maxRow; r++) {
    xml += "\n   <Row>";
    for (let c = 0; c <= maxCol; c++) {
      const val = getCellDisplay(c, r);
      const key = `${colToLetter(c)}${r + 1}`;
      const style = sheet.cells[key]?.style;
      const styleId = style?.bold ? "Bold" : "Default";
      const num = parseFloat(val.replace(/[$,%]/g, ""));
      const dataType = !isNaN(num) && val.trim() !== "" ? "Number" : "String";
      const dataVal = dataType === "Number" ? num : val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      xml += `<Cell ss:StyleID="${styleId}"><Data ss:Type="${dataType}">${dataVal}</Data></Cell>`;
    }
    xml += "</Row>";
  }

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sheet.name}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
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
    rows.push(values);
  }
  return rows;
}

export function printSheetAdvanced(
  sheet: Sheet,
  getCellDisplay: (col: number, row: number) => string,
  options: {
    printArea?: string;
    showGridlines?: boolean;
    showHeadings?: boolean;
    headerText?: string;
    footerText?: string;
    scaling?: number;
  } = {}
): void {
  const { maxRow, maxCol } = getBounds(sheet);
  if (maxRow === 0 && maxCol === 0 && Object.keys(sheet.cells).length === 0) return;

  const { showGridlines = true, showHeadings = true, headerText = "", footerText = "", scaling = 100 } = options;

  let html = `<html><head><title>${sheet.name}</title>
    <style>
      body{font-family:Calibri,Arial,sans-serif;margin:20px;transform:scale(${scaling / 100});transform-origin:top left;}
      table{border-collapse:collapse;width:100%}
      th,td{${showGridlines ? "border:1px solid #ccc;" : ""}padding:4px 8px;text-align:left;font-size:11px}
      th{background:#f0f0f0;font-weight:600;font-size:10px}
      .header{text-align:center;font-size:14px;margin-bottom:10px;font-weight:600}
      .footer{text-align:center;font-size:10px;margin-top:10px;color:#666}
      @media print{body{margin:0}}
    </style></head><body>`;

  if (headerText) {
    html += `<div class="header">${headerText}</div>`;
  }

  html += `<table><thead><tr>`;
  if (showHeadings) {
    html += "<th></th>";
  }
  for (let c = 0; c <= maxCol; c++) {
    html += showHeadings ? `<th>${colToLetter(c)}</th>` : "<th></th>";
  }
  html += "</tr></thead><tbody>";

  for (let r = 0; r <= maxRow; r++) {
    html += "<tr>";
    if (showHeadings) {
      html += `<td><strong>${r + 1}</strong></td>`;
    }
    for (let c = 0; c <= maxCol; c++) {
      const val = getCellDisplay(c, r);
      const key = `${colToLetter(c)}${r + 1}`;
      const style = sheet.cells[key]?.style || {};
      let css = "";
      if (style.bold) css += "font-weight:700;";
      if (style.italic) css += "font-style:italic;";
      if (style.underline) css += "text-decoration:underline;";
      if (style.align) css += `text-align:${style.align};`;
      if (style.bgColor) css += `background:${style.bgColor};`;
      if (style.textColor) css += `color:${style.textColor};`;
      if (style.fontSize) css += `font-size:${style.fontSize}px;`;
      if (style.fontFamily) css += `font-family:${style.fontFamily};`;
      html += `<td style="${css}">${val}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table>";

  if (footerText) {
    html += `<div class="footer">${footerText}</div>`;
  }

  html += "</body></html>";

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
