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

  // Collect unique styles and assign IDs
  const styleMap = new Map<string, string>();
  let styleCounter = 0;
  const getStyleId = (style: Partial<CellStyle> | undefined): string => {
    if (!style || Object.keys(style).length === 0) return "Default";
    const key = JSON.stringify(style);
    if (styleMap.has(key)) return styleMap.get(key)!;
    const id = `s${++styleCounter}`;
    styleMap.set(key, id);
    return id;
  };

  // Pre-scan for styles
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c <= maxCol; c++) {
      const key = `${colToLetter(c)}${r + 1}`;
      getStyleId(sheet.cells[key]?.style);
    }
  }

  // Build styles XML
  let stylesXml = `  <Style ss:ID="Default"><Font ss:FontName="Calibri" ss:Size="11"/></Style>\n`;
  Array.from(styleMap.entries()).forEach(([styleJson, id]) => {
    const s: Partial<CellStyle> = JSON.parse(styleJson);
    let fontAttrs = `ss:FontName="${s.fontFamily || "Calibri"}" ss:Size="${s.fontSize || 11}"`;
    if (s.bold) fontAttrs += ' ss:Bold="1"';
    if (s.italic) fontAttrs += ' ss:Italic="1"';
    if (s.underline) fontAttrs += ' ss:Underline="Single"';
    if (s.textColor) fontAttrs += ` ss:Color="${s.textColor}"`;

    let interiorXml = "";
    if (s.bgColor) {
      interiorXml = `<Interior ss:Color="${s.bgColor}" ss:Pattern="Solid"/>`;
    }

    let alignXml = "";
    if (s.align || s.verticalAlign || s.wrapText) {
      const hAlign = s.align === "center" ? "Center" : s.align === "right" ? "Right" : "Left";
      const vAlign = s.verticalAlign === "top" ? "Top" : s.verticalAlign === "bottom" ? "Bottom" : "Center";
      alignXml = `<Alignment ss:Horizontal="${hAlign}" ss:Vertical="${vAlign}"${s.wrapText ? ' ss:WrapText="1"' : ""}/>`;
    }

    let numFmtXml = "";
    if (s.format === "currency") numFmtXml = `<NumberFormat ss:Format="$#,##0.00"/>`;
    else if (s.format === "percent") numFmtXml = `<NumberFormat ss:Format="0.0%"/>`;
    else if (s.format === "number") numFmtXml = `<NumberFormat ss:Format="#,##0.00"/>`;

    stylesXml += `  <Style ss:ID="${id}"><Font ${fontAttrs}/>${interiorXml}${alignXml}${numFmtXml}</Style>\n`;
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
${stylesXml} </Styles>
 <Worksheet ss:Name="${sheet.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}">
  <Table>`;

  // Column widths
  for (let c = 0; c <= maxCol; c++) {
    const w = sheet.colWidths[c] || 80;
    xml += `\n   <Column ss:Width="${w}"/>`;
  }

  for (let r = 0; r <= maxRow; r++) {
    const h = sheet.rowHeights?.[r];
    xml += h ? `\n   <Row ss:Height="${h}">` : "\n   <Row>";
    for (let c = 0; c <= maxCol; c++) {
      const val = getCellDisplay(c, r);
      const key = `${colToLetter(c)}${r + 1}`;
      const style = sheet.cells[key]?.style;
      const styleId = getStyleId(style);
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

export async function exportToPDF(
  sheet: Sheet,
  getCellDisplay: (col: number, row: number) => string,
  options: {
    headerText?: string;
    footerText?: string;
    showGridlines?: boolean;
  } = {}
): Promise<void> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const { maxRow, maxCol } = getBounds(sheet);
  if (maxRow === 0 && maxCol === 0 && Object.keys(sheet.cells).length === 0) return;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 9;

  const colWidths: number[] = [];
  for (let c = 0; c <= maxCol; c++) {
    colWidths.push(Math.min(sheet.colWidths[c] || 80, 120));
  }
  const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
  const rowHeight = 18;
  const margin = 40;
  const pageWidth = Math.max(612, tableWidth + margin * 2); // Letter width min
  const pageHeight = 792; // Letter height
  const contentHeight = pageHeight - margin * 2 - 30; // Reserve for header/footer
  const rowsPerPage = Math.floor(contentHeight / rowHeight);

  let currentRow = 0;
  let pageNum = 0;

  while (currentRow <= maxRow) {
    pageNum++;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Header
    if (options.headerText) {
      page.drawText(options.headerText, {
        x: pageWidth / 2 - font.widthOfTextAtSize(options.headerText, 10) / 2,
        y: y,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 20;
    }

    // Column headers
    let x = margin;
    for (let c = 0; c <= maxCol; c++) {
      const label = colToLetter(c);
      page.drawText(label, {
        x: x + 4,
        y: y - 12,
        size: 8,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      if (options.showGridlines !== false) {
        page.drawRectangle({
          x, y: y - rowHeight, width: colWidths[c], height: rowHeight,
          borderWidth: 0.5, borderColor: rgb(0.8, 0.8, 0.8),
          color: rgb(0.95, 0.95, 0.95),
        });
      }
      x += colWidths[c];
    }
    y -= rowHeight;

    // Data rows
    const endRow = Math.min(currentRow + rowsPerPage - 1, maxRow);
    for (let r = currentRow; r <= endRow; r++) {
      x = margin;
      for (let c = 0; c <= maxCol; c++) {
        const val = getCellDisplay(c, r);
        const key = `${colToLetter(c)}${r + 1}`;
        const style = sheet.cells[key]?.style;
        const useFont = style?.bold ? fontBold : font;

        if (options.showGridlines !== false) {
          // Cell background
          let bgColor = rgb(1, 1, 1);
          if (style?.bgColor) {
            const hex = style.bgColor.replace("#", "");
            if (hex.length === 6) {
              bgColor = rgb(
                parseInt(hex.slice(0, 2), 16) / 255,
                parseInt(hex.slice(2, 4), 16) / 255,
                parseInt(hex.slice(4, 6), 16) / 255,
              );
            }
          }
          page.drawRectangle({
            x, y: y - rowHeight, width: colWidths[c], height: rowHeight,
            borderWidth: 0.5, borderColor: rgb(0.85, 0.85, 0.85),
            color: bgColor,
          });
        }

        // Text color
        let textColor = rgb(0, 0, 0);
        if (style?.textColor) {
          const hex = style.textColor.replace("#", "");
          if (hex.length === 6) {
            textColor = rgb(
              parseInt(hex.slice(0, 2), 16) / 255,
              parseInt(hex.slice(2, 4), 16) / 255,
              parseInt(hex.slice(4, 6), 16) / 255,
            );
          }
        }

        // Truncate text to fit cell
        let displayText = val;
        const maxTextWidth = colWidths[c] - 8;
        while (displayText.length > 0 && useFont.widthOfTextAtSize(displayText, fontSize) > maxTextWidth) {
          displayText = displayText.slice(0, -1);
        }

        if (displayText) {
          let textX = x + 4;
          if (style?.align === "right") {
            textX = x + colWidths[c] - 4 - useFont.widthOfTextAtSize(displayText, fontSize);
          } else if (style?.align === "center") {
            textX = x + (colWidths[c] - useFont.widthOfTextAtSize(displayText, fontSize)) / 2;
          }

          page.drawText(displayText, {
            x: textX,
            y: y - 13,
            size: fontSize,
            font: useFont,
            color: textColor,
          });
        }
        x += colWidths[c];
      }
      y -= rowHeight;
    }

    // Footer
    if (options.footerText) {
      page.drawText(options.footerText, {
        x: pageWidth / 2 - font.widthOfTextAtSize(options.footerText, 8) / 2,
        y: margin - 15,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Page number
    const pageText = `Page ${pageNum}`;
    page.drawText(pageText, {
      x: pageWidth - margin - font.widthOfTextAtSize(pageText, 8),
      y: margin - 15,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    currentRow = endRow + 1;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sheet.name}.pdf`;
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
