"use client";

/**
 * Unified ExportManager utility class for all document types.
 * Handles export to various formats using browser APIs (Blob, FileSaver pattern).
 */

export type ExportFormat =
  | "docx" | "pdf" | "html" | "markdown" | "txt"
  | "xlsx" | "csv" | "json"
  | "pptx" | "png"
  | "images" | "text-extract";

export type ImportFormat = "docx" | "txt" | "md" | "xlsx" | "csv" | "pptx" | "pdf";

export type DocumentType = "document" | "spreadsheet" | "presentation" | "pdf";

export interface ExportProgress {
  percent: number;
  message: string;
}

export type ProgressCallback = (progress: ExportProgress) => void;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n");
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, "_$1_");
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n");
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n\n");
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<hr\s*\/?>/gi, "---\n\n");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

function htmlToPlainText(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

// Build a simple DOCX (XML-based) from HTML content
function buildDocxBlob(html: string, fileName: string): Blob {
  const plainText = htmlToPlainText(html);
  const paragraphs = plainText.split(/\n+/).filter(Boolean);

  const docBody = paragraphs
    .map(
      (p) =>
        `<w:p><w:r><w:t xml:space="preserve">${escapeHtml(p)}</w:t></w:r></w:p>`
    )
    .join("");

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>${docBody}</w:body>
</w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

  // Build a minimal ZIP (PK archive) manually for the DOCX
  return buildZipBlob([
    { path: "[Content_Types].xml", content: contentTypes },
    { path: "_rels/.rels", content: rels },
    { path: "word/_rels/document.xml.rels", content: wordRels },
    { path: "word/document.xml", content: docXml },
  ]);
}

// Minimal ZIP builder (no compression, store-only) for DOCX/XLSX/PPTX
function buildZipBlob(files: { path: string; content: string }[]): Blob {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const data = encoder.encode(file.content);
    const pathBytes = encoder.encode(file.path);

    // Local file header
    const header = new ArrayBuffer(30);
    const hv = new DataView(header);
    hv.setUint32(0, 0x04034b50, true); // signature
    hv.setUint16(4, 20, true); // version needed
    hv.setUint16(6, 0, true); // flags
    hv.setUint16(8, 0, true); // compression (store)
    hv.setUint16(10, 0, true); // mod time
    hv.setUint16(12, 0, true); // mod date
    hv.setUint32(14, crc32(data), true);
    hv.setUint32(18, data.length, true); // compressed size
    hv.setUint32(22, data.length, true); // uncompressed size
    hv.setUint16(26, pathBytes.length, true);
    hv.setUint16(28, 0, true); // extra field length

    parts.push(new Uint8Array(header), pathBytes, data);

    // Central directory entry
    const cdEntry = new ArrayBuffer(46);
    const cv = new DataView(cdEntry);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc32(data), true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, pathBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);

    centralDir.push(new Uint8Array(cdEntry), pathBytes);

    offset += 30 + pathBytes.length + data.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  centralDir.forEach((p) => (cdSize += p.length));

  // End of central directory
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdOffset, true);
  ev.setUint16(20, 0, true);

  const allParts: BlobPart[] = [...parts.map(p => p as BlobPart), ...centralDir.map(p => p as BlobPart), new Uint8Array(eocd) as BlobPart];
  return new Blob(allParts, {
    type: "application/octet-stream",
  });
}

// CRC-32 implementation
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Build a minimal XLSX from spreadsheet data
function buildXlsxBlob(
  sheets: { name: string; rows: string[][] }[]
): Blob {
  const sheetFiles: { path: string; content: string }[] = [];
  const sheetRels: string[] = [];

  sheets.forEach((sheet, idx) => {
    const sheetXml = buildSheetXml(sheet.rows);
    sheetFiles.push({
      path: `xl/worksheets/sheet${idx + 1}.xml`,
      content: sheetXml,
    });
    sheetRels.push(
      `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`
    );
  });

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheets
    .map(
      (s, i) =>
        `<sheet name="${escapeHtml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
    )
    .join("")}</sheets>
</workbook>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n  ")}
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRels.join("\n  ")}
</Relationships>`;

  return buildZipBlob([
    { path: "[Content_Types].xml", content: contentTypes },
    { path: "_rels/.rels", content: rels },
    { path: "xl/_rels/workbook.xml.rels", content: wbRels },
    { path: "xl/workbook.xml", content: workbook },
    ...sheetFiles,
  ]);
}

function buildSheetXml(rows: string[][]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`;

  rows.forEach((row, ri) => {
    xml += `\n    <row r="${ri + 1}">`;
    row.forEach((val, ci) => {
      const colLetter = String.fromCharCode(65 + (ci % 26));
      const ref = `${colLetter}${ri + 1}`;
      const num = parseFloat(val.replace(/[$,%]/g, ""));
      if (!isNaN(num) && val.trim() !== "") {
        xml += `<c r="${ref}"><v>${num}</v></c>`;
      } else {
        xml += `<c r="${ref}" t="inlineStr"><is><t>${escapeHtml(val)}</t></is></c>`;
      }
    });
    xml += `</row>`;
  });

  xml += `\n  </sheetData>\n</worksheet>`;
  return xml;
}

// Build a minimal PPTX from slide data
function buildPptxBlob(
  slides: { title: string; content: string }[]
): Blob {
  const slideFiles: { path: string; content: string }[] = [];
  const slideRels: string[] = [];
  const slideOverrides: string[] = [];

  slides.forEach((slide, idx) => {
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="274638"/><a:ext cx="8229600" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p><a:r><a:rPr lang="en-US" sz="2800" b="1"/><a:t>${escapeHtml(slide.title)}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="1600200"/><a:ext cx="8229600" cy="4525963"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p><a:r><a:rPr lang="en-US" sz="1800"/><a:t>${escapeHtml(slide.content)}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    slideFiles.push({
      path: `ppt/slides/slide${idx + 1}.xml`,
      content: slideXml,
    });

    const slideRelXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;
    slideFiles.push({
      path: `ppt/slides/_rels/slide${idx + 1}.xml.rels`,
      content: slideRelXml,
    });

    slideRels.push(
      `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>`
    );
    slideOverrides.push(
      `<Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    );
  });

  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>${slides
    .map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`)
    .join("")}</p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
</p:presentation>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideOverrides.join("\n  ")}
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

  const pptRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRels.join("\n  ")}
</Relationships>`;

  return buildZipBlob([
    { path: "[Content_Types].xml", content: contentTypes },
    { path: "_rels/.rels", content: rels },
    { path: "ppt/_rels/presentation.xml.rels", content: pptRels },
    { path: "ppt/presentation.xml", content: presentation },
    ...slideFiles,
  ]);
}

export const SUPPORTED_EXPORTS: Record<DocumentType, { format: ExportFormat; label: string; ext: string; mime: string }[]> = {
  document: [
    { format: "docx", label: "Word Document (.docx)", ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { format: "pdf", label: "PDF Document (.pdf)", ext: ".pdf", mime: "application/pdf" },
    { format: "html", label: "Web Page (.html)", ext: ".html", mime: "text/html" },
    { format: "markdown", label: "Markdown (.md)", ext: ".md", mime: "text/markdown" },
    { format: "txt", label: "Plain Text (.txt)", ext: ".txt", mime: "text/plain" },
  ],
  spreadsheet: [
    { format: "xlsx", label: "Excel Workbook (.xlsx)", ext: ".xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { format: "csv", label: "CSV (.csv)", ext: ".csv", mime: "text/csv" },
    { format: "pdf", label: "PDF Document (.pdf)", ext: ".pdf", mime: "application/pdf" },
    { format: "json", label: "JSON Data (.json)", ext: ".json", mime: "application/json" },
  ],
  presentation: [
    { format: "pptx", label: "PowerPoint (.pptx)", ext: ".pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
    { format: "pdf", label: "PDF Document (.pdf)", ext: ".pdf", mime: "application/pdf" },
    { format: "png", label: "Images (.png)", ext: ".png", mime: "image/png" },
  ],
  pdf: [
    { format: "images", label: "Export as Images (.png)", ext: ".png", mime: "image/png" },
    { format: "text-extract", label: "Extract Text (.txt)", ext: ".txt", mime: "text/plain" },
  ],
};

export const SUPPORTED_IMPORTS: Record<DocumentType, { format: ImportFormat; label: string; accept: string }[]> = {
  document: [
    { format: "docx", label: "Word Document (.docx)", accept: ".docx" },
    { format: "txt", label: "Plain Text (.txt)", accept: ".txt" },
    { format: "md", label: "Markdown (.md)", accept: ".md" },
  ],
  spreadsheet: [
    { format: "xlsx", label: "Excel Workbook (.xlsx)", accept: ".xlsx" },
    { format: "csv", label: "CSV (.csv)", accept: ".csv" },
  ],
  presentation: [
    { format: "pptx", label: "PowerPoint (.pptx)", accept: ".pptx" },
  ],
  pdf: [
    { format: "pdf", label: "PDF File (.pdf)", accept: ".pdf" },
  ],
};

export class ExportManager {
  // ─── Document Exports ───────────────────────────────────────────

  static async exportDocument(
    format: ExportFormat,
    htmlContent: string,
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.({ percent: 10, message: "Preparing export..." });

    switch (format) {
      case "docx": {
        onProgress?.({ percent: 40, message: "Building DOCX..." });
        const blob = buildDocxBlob(htmlContent, fileName);
        onProgress?.({ percent: 80, message: "Generating file..." });
        triggerDownload(blob, `${fileName}.docx`);
        break;
      }
      case "pdf": {
        onProgress?.({ percent: 30, message: "Opening print dialog..." });
        ExportManager.printContent(htmlContent, fileName);
        break;
      }
      case "html": {
        onProgress?.({ percent: 50, message: "Building HTML..." });
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(fileName)}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
  h1 { font-size: 28px; } h2 { font-size: 22px; } h3 { font-size: 18px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  blockquote { border-left: 4px solid #1565C0; margin: 12px 0; padding: 8px 16px; color: #555; background: #f9f9f9; }
  pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 12px; overflow-x: auto; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: "text/html" });
        triggerDownload(blob, `${fileName}.html`);
        break;
      }
      case "markdown": {
        onProgress?.({ percent: 50, message: "Converting to Markdown..." });
        const md = htmlToMarkdown(htmlContent);
        const blob = new Blob([md], { type: "text/markdown" });
        triggerDownload(blob, `${fileName}.md`);
        break;
      }
      case "txt": {
        onProgress?.({ percent: 50, message: "Extracting text..." });
        const text = htmlToPlainText(htmlContent);
        const blob = new Blob([text], { type: "text/plain" });
        triggerDownload(blob, `${fileName}.txt`);
        break;
      }
    }

    onProgress?.({ percent: 100, message: "Export complete!" });
  }

  // ─── Spreadsheet Exports ────────────────────────────────────────

  static async exportSpreadsheet(
    format: ExportFormat,
    sheets: { name: string; rows: string[][] }[],
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.({ percent: 10, message: "Preparing export..." });

    switch (format) {
      case "xlsx": {
        onProgress?.({ percent: 40, message: "Building XLSX..." });
        const blob = buildXlsxBlob(sheets);
        onProgress?.({ percent: 80, message: "Generating file..." });
        triggerDownload(blob, `${fileName}.xlsx`);
        break;
      }
      case "csv": {
        onProgress?.({ percent: 50, message: "Building CSV..." });
        const sheet = sheets[0];
        if (!sheet) return;
        const csv = sheet.rows
          .map((row) =>
            row
              .map((val) => {
                if (val.includes(",") || val.includes('"') || val.includes("\n")) {
                  return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
              })
              .join(",")
          )
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        triggerDownload(blob, `${fileName}.csv`);
        break;
      }
      case "pdf": {
        onProgress?.({ percent: 30, message: "Opening print dialog..." });
        const sheet = sheets[0];
        if (!sheet) return;
        const html = ExportManager.buildSpreadsheetHtml(sheet);
        ExportManager.printContent(html, fileName);
        break;
      }
      case "json": {
        onProgress?.({ percent: 50, message: "Building JSON..." });
        const jsonData = sheets.map((s) => ({
          name: s.name,
          data: s.rows.map((row, ri) => {
            const obj: Record<string, string> = {};
            row.forEach((val, ci) => {
              const colKey = s.rows[0]?.[ci] || `Column${ci + 1}`;
              if (ri > 0) obj[colKey] = val;
            });
            return ri > 0 ? obj : null;
          }).filter(Boolean),
        }));
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });
        triggerDownload(blob, `${fileName}.json`);
        break;
      }
    }

    onProgress?.({ percent: 100, message: "Export complete!" });
  }

  // ─── Presentation Exports ──────────────────────────────────────

  static async exportPresentation(
    format: ExportFormat,
    slides: { title: string; content: string; canvas?: HTMLCanvasElement }[],
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.({ percent: 10, message: "Preparing export..." });

    switch (format) {
      case "pptx": {
        onProgress?.({ percent: 40, message: "Building PPTX..." });
        const blob = buildPptxBlob(slides);
        onProgress?.({ percent: 80, message: "Generating file..." });
        triggerDownload(blob, `${fileName}.pptx`);
        break;
      }
      case "pdf": {
        onProgress?.({ percent: 30, message: "Opening print dialog..." });
        let html = `<html><head><title>${escapeHtml(fileName)}</title>
<style>
  body { margin: 0; font-family: Arial, sans-serif; }
  .slide { width: 100%; max-width: 960px; margin: 20px auto; padding: 40px; border: 1px solid #ddd; page-break-after: always; min-height: 540px; box-sizing: border-box; }
  .slide h1 { font-size: 32px; margin-bottom: 20px; }
  .slide p { font-size: 18px; line-height: 1.6; }
  @media print { .slide { border: none; margin: 0; } }
</style></head><body>`;
        slides.forEach((s) => {
          html += `<div class="slide"><h1>${escapeHtml(s.title)}</h1><p>${escapeHtml(s.content)}</p></div>`;
        });
        html += "</body></html>";
        ExportManager.printContent(html, fileName);
        break;
      }
      case "png": {
        onProgress?.({ percent: 20, message: "Rendering slides..." });
        for (let i = 0; i < slides.length; i++) {
          onProgress?.({
            percent: 20 + Math.round((i / slides.length) * 70),
            message: `Exporting slide ${i + 1} of ${slides.length}...`,
          });
          if (slides[i].canvas) {
            const blob = await new Promise<Blob | null>((resolve) =>
              slides[i].canvas!.toBlob(resolve, "image/png")
            );
            if (blob) {
              triggerDownload(blob, `${fileName}_slide_${i + 1}.png`);
            }
          } else {
            // Fallback: create a simple canvas rendering
            const canvas = document.createElement("canvas");
            canvas.width = 960;
            canvas.height = 540;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, 960, 540);
              ctx.fillStyle = "#000000";
              ctx.font = "bold 28px Arial";
              ctx.fillText(slides[i].title, 40, 80);
              ctx.font = "18px Arial";
              const lines = slides[i].content.split("\n");
              lines.forEach((line, li) => {
                ctx.fillText(line, 40, 140 + li * 30);
              });
              const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png")
              );
              if (blob) {
                triggerDownload(blob, `${fileName}_slide_${i + 1}.png`);
              }
            }
          }
          // Small delay between downloads
          await new Promise((r) => setTimeout(r, 300));
        }
        break;
      }
    }

    onProgress?.({ percent: 100, message: "Export complete!" });
  }

  // ─── PDF Exports ───────────────────────────────────────────────

  static async exportPdf(
    format: ExportFormat,
    pdfData: { pages: { imageDataUrl?: string; text?: string }[] },
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    onProgress?.({ percent: 10, message: "Preparing export..." });

    switch (format) {
      case "images": {
        for (let i = 0; i < pdfData.pages.length; i++) {
          onProgress?.({
            percent: 10 + Math.round((i / pdfData.pages.length) * 80),
            message: `Exporting page ${i + 1} of ${pdfData.pages.length}...`,
          });
          const page = pdfData.pages[i];
          if (page.imageDataUrl) {
            const res = await fetch(page.imageDataUrl);
            const blob = await res.blob();
            triggerDownload(blob, `${fileName}_page_${i + 1}.png`);
            await new Promise((r) => setTimeout(r, 300));
          }
        }
        break;
      }
      case "text-extract": {
        onProgress?.({ percent: 50, message: "Extracting text..." });
        const allText = pdfData.pages
          .map((p, i) => `--- Page ${i + 1} ---\n${p.text || ""}`)
          .join("\n\n");
        const blob = new Blob([allText], { type: "text/plain" });
        triggerDownload(blob, `${fileName}.txt`);
        break;
      }
    }

    onProgress?.({ percent: 100, message: "Export complete!" });
  }

  // ─── Import Helpers ────────────────────────────────────────────

  static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  static async importDocument(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<{ content: string; format: ImportFormat }> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    onProgress?.({ percent: 10, message: `Reading ${file.name}...` });

    switch (ext) {
      case "txt": {
        onProgress?.({ percent: 50, message: "Processing text..." });
        const text = await ExportManager.readFileAsText(file);
        const html = text.split("\n").map((line) =>
          line.trim() ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>"
        ).join("");
        onProgress?.({ percent: 100, message: "Import complete!" });
        return { content: html, format: "txt" };
      }
      case "md": {
        onProgress?.({ percent: 50, message: "Processing Markdown..." });
        const md = await ExportManager.readFileAsText(file);
        const html = ExportManager.markdownToHtml(md);
        onProgress?.({ percent: 100, message: "Import complete!" });
        return { content: html, format: "md" };
      }
      case "docx": {
        onProgress?.({ percent: 30, message: "Parsing DOCX..." });
        const buffer = await ExportManager.readFileAsArrayBuffer(file);
        const text = ExportManager.extractDocxText(buffer);
        onProgress?.({ percent: 80, message: "Building content..." });
        const html = text.split("\n").filter(Boolean).map((line) =>
          `<p>${escapeHtml(line)}</p>`
        ).join("");
        onProgress?.({ percent: 100, message: "Import complete!" });
        return { content: html, format: "docx" };
      }
      default:
        throw new Error(`Unsupported import format: .${ext}`);
    }
  }

  static async importSpreadsheet(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<{ rows: string[][]; format: ImportFormat }> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    onProgress?.({ percent: 10, message: `Reading ${file.name}...` });

    switch (ext) {
      case "csv": {
        onProgress?.({ percent: 50, message: "Parsing CSV..." });
        const text = await ExportManager.readFileAsText(file);
        const rows = ExportManager.parseCSV(text);
        onProgress?.({ percent: 100, message: "Import complete!" });
        return { rows, format: "csv" };
      }
      case "xlsx": {
        onProgress?.({ percent: 30, message: "Parsing XLSX..." });
        const buffer = await ExportManager.readFileAsArrayBuffer(file);
        const rows = ExportManager.extractXlsxData(buffer);
        onProgress?.({ percent: 100, message: "Import complete!" });
        return { rows, format: "xlsx" };
      }
      default:
        throw new Error(`Unsupported import format: .${ext}`);
    }
  }

  static async importPresentation(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<{ slides: { title: string; content: string }[]; format: ImportFormat }> {
    onProgress?.({ percent: 10, message: `Reading ${file.name}...` });
    onProgress?.({ percent: 50, message: "Parsing PPTX..." });
    const buffer = await ExportManager.readFileAsArrayBuffer(file);
    const slides = ExportManager.extractPptxSlides(buffer);
    onProgress?.({ percent: 100, message: "Import complete!" });
    return { slides, format: "pptx" };
  }

  // ─── Print ─────────────────────────────────────────────────────

  static printContent(htmlContent: string, title: string): void {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const fullHtml = htmlContent.startsWith("<html") || htmlContent.startsWith("<!DOCTYPE")
        ? htmlContent
        : `<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6}@media print{body{margin:20px}}</style>
</head><body>${htmlContent}</body></html>`;
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  }

  // ─── Print Preview ─────────────────────────────────────────────

  static generatePrintPreviewHtml(
    content: string,
    type: DocumentType,
    title: string
  ): string {
    switch (type) {
      case "document":
        return `<div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;line-height:1.6">${content}</div>`;
      case "spreadsheet":
        return content; // Already formatted as table HTML
      case "presentation":
        return content; // Already formatted with slide divs
      case "pdf":
        return `<div style="font-family:Arial,sans-serif;padding:20px">${content}</div>`;
      default:
        return content;
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────

  private static buildSpreadsheetHtml(sheet: { name: string; rows: string[][] }): string {
    let html = `<html><head><title>${escapeHtml(sheet.name)}</title>
<style>body{font-family:Calibri,Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;font-size:12px}th{background:#f0f0f0;font-weight:600}</style></head><body>
<h2>${escapeHtml(sheet.name)}</h2><table>`;

    sheet.rows.forEach((row, ri) => {
      html += "<tr>";
      row.forEach((val) => {
        const tag = ri === 0 ? "th" : "td";
        html += `<${tag}>${escapeHtml(val)}</${tag}>`;
      });
      html += "</tr>";
    });

    html += "</table></body></html>";
    return html;
  }

  private static markdownToHtml(md: string): string {
    let html = md;
    html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");
    html = html.replace(/^\- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/^\* (.+)$/gm, "<li>$1</li>");
    html = html.replace(/^---$/gm, "<hr>");
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    // Wrap remaining lines in <p> tags
    html = html.split("\n").map((line) => {
      if (line.startsWith("<h") || line.startsWith("<li") || line.startsWith("<hr") || !line.trim()) {
        return line;
      }
      return `<p>${line}</p>`;
    }).join("\n");
    return html;
  }

  static parseCSV(content: string): string[][] {
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
        } else if (ch === "," && !inQuotes) {
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

  private static extractDocxText(buffer: ArrayBuffer): string {
    // Simple XML text extraction from DOCX (ZIP containing word/document.xml)
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder();
    const content = decoder.decode(bytes);

    // Find document.xml content between <w:t> tags
    const matches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (!matches) return "Imported document content";

    return matches
      .map((m) => {
        const inner = m.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, "");
        return inner;
      })
      .join(" ")
      .replace(/\s+/g, " ");
  }

  private static extractXlsxData(buffer: ArrayBuffer): string[][] {
    // Simple extraction from XLSX XML
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder();
    const content = decoder.decode(bytes);

    const rows: string[][] = [];
    const rowMatches = content.match(/<row[^>]*>[\s\S]*?<\/row>/g);
    if (!rowMatches) return [["Imported data"]];

    for (const row of rowMatches) {
      const cells: string[] = [];
      const cellMatches = row.match(/<v>([^<]*)<\/v>|<t>([^<]*)<\/t>/g);
      if (cellMatches) {
        for (const cell of cellMatches) {
          const val = cell.replace(/<\/?[vt]>/g, "");
          cells.push(val);
        }
      }
      if (cells.length > 0) rows.push(cells);
    }
    return rows.length > 0 ? rows : [["Imported data"]];
  }

  private static extractPptxSlides(buffer: ArrayBuffer): { title: string; content: string }[] {
    // Simple extraction from PPTX XML
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder();
    const content = decoder.decode(bytes);

    const slides: { title: string; content: string }[] = [];
    const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);

    if (textMatches && textMatches.length > 0) {
      // Group texts into slides (rough heuristic)
      let currentSlide = { title: "", content: "" };
      textMatches.forEach((m, i) => {
        const text = m.replace(/<\/?a:t>/g, "");
        if (i % 3 === 0 && i > 0) {
          slides.push(currentSlide);
          currentSlide = { title: "", content: "" };
        }
        if (!currentSlide.title) {
          currentSlide.title = text;
        } else {
          currentSlide.content += (currentSlide.content ? "\n" : "") + text;
        }
      });
      slides.push(currentSlide);
    }

    return slides.length > 0 ? slides : [{ title: "Imported Slide", content: "" }];
  }

  // ─── Batch Export ──────────────────────────────────────────────

  static async batchExportSpreadsheet(
    sheets: { name: string; rows: string[][] }[],
    format: ExportFormat,
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    if (format === "xlsx") {
      // XLSX already handles multiple sheets
      return ExportManager.exportSpreadsheet(format, sheets, fileName, onProgress);
    }

    // For CSV/JSON, export each sheet separately
    for (let i = 0; i < sheets.length; i++) {
      onProgress?.({
        percent: Math.round((i / sheets.length) * 100),
        message: `Exporting sheet "${sheets[i].name}" (${i + 1}/${sheets.length})...`,
      });
      await ExportManager.exportSpreadsheet(format, [sheets[i]], `${fileName}_${sheets[i].name}`);
      await new Promise((r) => setTimeout(r, 300));
    }
    onProgress?.({ percent: 100, message: "Batch export complete!" });
  }

  static async batchExportSlides(
    slides: { title: string; content: string; canvas?: HTMLCanvasElement }[],
    fileName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    return ExportManager.exportPresentation("png", slides, fileName, onProgress);
  }
}
