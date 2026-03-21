'use client';

/**
 * AayaatYantra - Document Import Engine
 * Parses DOCX, XLSX, PPTX, CSV/TSV files using native browser APIs.
 * ZIP-based formats (DOCX/XLSX/PPTX) are parsed using a minimal ZIP reader
 * with DecompressionStream for inflate support.
 */

import type { ImportFileType } from '@/store/import-store';

// ── File type detection ─────────────────────────────────────────────────────

const MAGIC_BYTES: { bytes: number[]; type: ImportFileType }[] = [
  { bytes: [0x50, 0x4b, 0x03, 0x04], type: 'docx' }, // ZIP (DOCX/XLSX/PPTX)
];

export function detectFileType(file: File): ImportFileType {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeMap: Record<string, ImportFileType> = {
    docx: 'docx',
    doc: 'docx',
    xlsx: 'xlsx',
    xls: 'xlsx',
    pptx: 'pptx',
    ppt: 'pptx',
    csv: 'csv',
    tsv: 'tsv',
    txt: 'txt',
    md: 'md',
    pdf: 'pdf',
  };
  return typeMap[ext] ?? 'unknown';
}

export async function detectFileTypeFromContent(file: File): Promise<ImportFileType> {
  // First try extension
  const extType = detectFileType(file);
  if (extType !== 'unknown') return extType;

  // Try magic bytes
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04) {
    // It's a ZIP - need to inspect contents to determine DOCX vs XLSX vs PPTX
    try {
      const entries = await listZipEntries(await file.arrayBuffer());
      const names = entries.map((e) => e.name);
      if (names.some((n) => n.startsWith('word/'))) return 'docx';
      if (names.some((n) => n.startsWith('xl/'))) return 'xlsx';
      if (names.some((n) => n.startsWith('ppt/'))) return 'pptx';
    } catch {
      // fallback
    }
    return 'docx'; // default ZIP to docx
  }

  // Check if it looks like CSV/TSV
  const textSample = await file.slice(0, 1024).text();
  if (textSample.includes('\t') && textSample.split('\n').every((l) => l.split('\t').length > 1)) {
    return 'tsv';
  }
  if (textSample.includes(',') && textSample.split('\n').every((l) => l.split(',').length > 1)) {
    return 'csv';
  }

  return 'txt';
}

// ── Minimal ZIP reader ──────────────────────────────────────────────────────

interface ZipEntry {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  offset: number;
}

function listZipEntries(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const entries: ZipEntry[] = [];

  // Find End of Central Directory record (search from end)
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Invalid ZIP file: EOCD not found');

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdEntries = view.getUint16(eocdOffset + 10, true);

  let pos = cdOffset;
  for (let i = 0; i < cdEntries && pos < bytes.length - 46; i++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break;

    const compressionMethod = view.getUint16(pos + 10, true);
    const compressedSize = view.getUint32(pos + 20, true);
    const uncompressedSize = view.getUint32(pos + 24, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localHeaderOffset = view.getUint32(pos + 42, true);

    const nameBytes = bytes.slice(pos + 46, pos + 46 + nameLen);
    const name = new TextDecoder().decode(nameBytes);

    entries.push({
      name,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      offset: localHeaderOffset,
    });

    pos += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

async function extractZipEntry(buffer: ArrayBuffer, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // Read local file header to get actual data offset
  const localOffset = entry.offset;
  if (view.getUint32(localOffset, true) !== 0x04034b50) {
    throw new Error(`Invalid local header for ${entry.name}`);
  }

  const localNameLen = view.getUint16(localOffset + 26, true);
  const localExtraLen = view.getUint16(localOffset + 28, true);
  const dataOffset = localOffset + 30 + localNameLen + localExtraLen;

  const compressedData = bytes.slice(dataOffset, dataOffset + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    // Stored (no compression)
    return compressedData;
  }

  if (entry.compressionMethod === 8) {
    // Deflate - use DecompressionStream if available
    if (typeof DecompressionStream !== 'undefined') {
      try {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        const reader = ds.readable.getReader();

        const chunks: Uint8Array[] = [];
        const readAll = (async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        })();

        await writer.write(compressedData);
        await writer.close();
        await readAll;

        const totalLen = chunks.reduce((s, c) => s + c.length, 0);
        const result = new Uint8Array(totalLen);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        return result;
      } catch {
        throw new Error(`Failed to decompress ${entry.name}`);
      }
    }
    throw new Error('DecompressionStream not available - cannot decompress ZIP entries');
  }

  throw new Error(`Unsupported compression method ${entry.compressionMethod} for ${entry.name}`);
}

async function extractZipText(buffer: ArrayBuffer, fileName: string): Promise<string> {
  const entries = listZipEntries(buffer);
  const entry = entries.find((e) => e.name === fileName);
  if (!entry) throw new Error(`File ${fileName} not found in ZIP`);
  const data = await extractZipEntry(buffer, entry);
  return new TextDecoder().decode(data);
}

// ── DOCX Parser ─────────────────────────────────────────────────────────────

export interface DocxParseResult {
  html: string;
  plainText: string;
  paragraphs: { text: string; style?: string }[];
}

export async function parseDocx(
  file: File,
  onProgress?: (p: number, msg: string) => void
): Promise<DocxParseResult> {
  onProgress?.(10, 'Reading DOCX file...');

  const buffer = await file.arrayBuffer();
  onProgress?.(30, 'Extracting document content...');

  let documentXml: string;
  try {
    documentXml = await extractZipText(buffer, 'word/document.xml');
  } catch {
    throw new Error('Invalid DOCX file: could not read document.xml');
  }

  onProgress?.(50, 'Parsing document structure...');

  // Extract styles if available
  let stylesXml = '';
  try {
    stylesXml = await extractZipText(buffer, 'word/styles.xml');
  } catch {
    // styles are optional
  }

  // Parse the XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'application/xml');

  // Handle namespaces
  const nsResolver = (prefix: string | null): string | null => {
    const ns: Record<string, string> = {
      w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    };
    return ns[prefix ?? ''] ?? null;
  };

  onProgress?.(70, 'Converting to document format...');

  const paragraphs: { text: string; style?: string }[] = [];
  let html = '';
  let plainText = '';

  // Get all paragraph elements
  const body = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'body')[0];
  if (!body) {
    throw new Error('Invalid DOCX: no document body found');
  }

  const pElements = body.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'p');

  for (let i = 0; i < pElements.length; i++) {
    const p = pElements[i];
    const pPr = p.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pPr')[0];

    // Detect paragraph style (heading, list, etc.)
    let style: string | undefined;
    let tag = 'p';
    if (pPr) {
      const pStyle = pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pStyle')[0];
      if (pStyle) {
        const val = pStyle.getAttribute('w:val') ?? '';
        style = val;
        if (/heading\s*1/i.test(val) || val === 'Heading1') tag = 'h1';
        else if (/heading\s*2/i.test(val) || val === 'Heading2') tag = 'h2';
        else if (/heading\s*3/i.test(val) || val === 'Heading3') tag = 'h3';
        else if (/heading\s*4/i.test(val) || val === 'Heading4') tag = 'h4';
        else if (/heading\s*5/i.test(val) || val === 'Heading5') tag = 'h5';
        else if (/heading\s*6/i.test(val) || val === 'Heading6') tag = 'h6';
        else if (/title/i.test(val)) tag = 'h1';
        else if (/subtitle/i.test(val)) tag = 'h2';
        else if (/listparagraph/i.test(val) || /list/i.test(val)) tag = 'li';
      }
    }

    // Extract runs of text
    const runs = p.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'r');
    let paraText = '';
    let paraHtml = '';

    for (let j = 0; j < runs.length; j++) {
      const run = runs[j];
      const tElements = run.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 't');
      let runText = '';
      for (let k = 0; k < tElements.length; k++) {
        runText += tElements[k].textContent ?? '';
      }

      // Check run properties for formatting
      const rPr = run.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'rPr')[0];
      let formattedText = escapeHtml(runText);

      if (rPr) {
        const bold = rPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'b')[0];
        const italic = rPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'i')[0];
        const underline = rPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'u')[0];
        const strike = rPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'strike')[0];

        if (bold) formattedText = `<strong>${formattedText}</strong>`;
        if (italic) formattedText = `<em>${formattedText}</em>`;
        if (underline) formattedText = `<u>${formattedText}</u>`;
        if (strike) formattedText = `<s>${formattedText}</s>`;
      }

      paraText += runText;
      paraHtml += formattedText;
    }

    // Also check for w:br (break) elements
    const breaks = p.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'br');
    for (let b = 0; b < breaks.length; b++) {
      paraHtml += '<br/>';
      paraText += '\n';
    }

    if (paraText.length > 0 || tag !== 'p') {
      paragraphs.push({ text: paraText, style });
      html += `<${tag}>${paraHtml}</${tag}>`;
      plainText += paraText + '\n';
    }
  }

  onProgress?.(100, 'DOCX import complete!');

  return { html: html || '<p></p>', plainText: plainText.trim(), paragraphs };
}

// ── XLSX Parser ─────────────────────────────────────────────────────────────

export interface XlsxSheet {
  name: string;
  cells: Record<string, { value: string; type?: string }>;
  maxRow: number;
  maxCol: number;
}

export interface XlsxParseResult {
  sheets: XlsxSheet[];
}

export async function parseXlsx(
  file: File,
  onProgress?: (p: number, msg: string) => void
): Promise<XlsxParseResult> {
  onProgress?.(10, 'Reading XLSX file...');

  const buffer = await file.arrayBuffer();
  const entries = listZipEntries(buffer);

  onProgress?.(20, 'Extracting workbook data...');

  // Read shared strings
  const sharedStrings: string[] = [];
  const ssEntry = entries.find((e) => e.name === 'xl/sharedStrings.xml');
  if (ssEntry) {
    const ssXml = await extractZipText(buffer, 'xl/sharedStrings.xml');
    const parser = new DOMParser();
    const ssDoc = parser.parseFromString(ssXml, 'application/xml');
    const siElements = ssDoc.getElementsByTagName('si');
    for (let i = 0; i < siElements.length; i++) {
      const tElements = siElements[i].getElementsByTagName('t');
      let text = '';
      for (let j = 0; j < tElements.length; j++) {
        text += tElements[j].textContent ?? '';
      }
      sharedStrings.push(text);
    }
  }

  onProgress?.(40, 'Reading workbook structure...');

  // Read workbook.xml for sheet names
  let workbookXml: string;
  try {
    workbookXml = await extractZipText(buffer, 'xl/workbook.xml');
  } catch {
    throw new Error('Invalid XLSX file: could not read workbook.xml');
  }

  const parser = new DOMParser();
  const wbDoc = parser.parseFromString(workbookXml, 'application/xml');
  const sheetElements = wbDoc.getElementsByTagName('sheet');
  const sheetNames: string[] = [];
  for (let i = 0; i < sheetElements.length; i++) {
    sheetNames.push(sheetElements[i].getAttribute('name') ?? `Sheet${i + 1}`);
  }

  onProgress?.(50, 'Parsing sheet data...');

  const sheets: XlsxSheet[] = [];

  // Parse each sheet
  const sheetEntries = entries.filter((e) => /^xl\/worksheets\/sheet\d+\.xml$/.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (let si = 0; si < sheetEntries.length; si++) {
    const sheetEntry = sheetEntries[si];
    const sheetXml = await extractZipText(buffer, sheetEntry.name);
    const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');

    const cells: Record<string, { value: string; type?: string }> = {};
    let maxRow = 0;
    let maxCol = 0;

    const rows = sheetDoc.getElementsByTagName('row');
    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      const rowNum = parseInt(row.getAttribute('r') ?? '0', 10);
      if (rowNum > maxRow) maxRow = rowNum;

      const cellElements = row.getElementsByTagName('c');
      for (let ci = 0; ci < cellElements.length; ci++) {
        const cell = cellElements[ci];
        const ref = cell.getAttribute('r') ?? '';
        const cellType = cell.getAttribute('t') ?? '';

        const vElement = cell.getElementsByTagName('v')[0];
        let value = vElement?.textContent ?? '';

        // Resolve shared string
        if (cellType === 's' && vElement) {
          const idx = parseInt(value, 10);
          value = sharedStrings[idx] ?? value;
        }

        // Inline string
        if (cellType === 'inlineStr') {
          const isElement = cell.getElementsByTagName('is')[0];
          if (isElement) {
            const tElements = isElement.getElementsByTagName('t');
            value = '';
            for (let ti = 0; ti < tElements.length; ti++) {
              value += tElements[ti].textContent ?? '';
            }
          }
        }

        if (ref) {
          cells[ref] = { value, type: cellType };
          const colMatch = ref.match(/^([A-Z]+)/);
          if (colMatch) {
            const col = colLetterToNumber(colMatch[1]);
            if (col > maxCol) maxCol = col;
          }
        }
      }
    }

    sheets.push({
      name: sheetNames[si] ?? `Sheet${si + 1}`,
      cells,
      maxRow,
      maxCol,
    });

    onProgress?.(50 + ((si + 1) / sheetEntries.length) * 40, `Parsed sheet "${sheetNames[si] ?? si + 1}"...`);
  }

  onProgress?.(100, 'XLSX import complete!');

  return { sheets: sheets.length > 0 ? sheets : [{ name: 'Sheet1', cells: {}, maxRow: 0, maxCol: 0 }] };
}

// ── PPTX Parser ─────────────────────────────────────────────────────────────

export interface PptxSlide {
  slideNumber: number;
  texts: { text: string; isTitle?: boolean }[];
}

export interface PptxParseResult {
  slides: PptxSlide[];
  slideCount: number;
}

export async function parsePptx(
  file: File,
  onProgress?: (p: number, msg: string) => void
): Promise<PptxParseResult> {
  onProgress?.(10, 'Reading PPTX file...');

  const buffer = await file.arrayBuffer();
  const entries = listZipEntries(buffer);

  onProgress?.(30, 'Extracting slides...');

  const slideEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.name))
    .sort((a, b) => {
      const numA = parseInt(a.name.match(/slide(\d+)/)?.[1] ?? '0', 10);
      const numB = parseInt(b.name.match(/slide(\d+)/)?.[1] ?? '0', 10);
      return numA - numB;
    });

  const parser = new DOMParser();
  const slides: PptxSlide[] = [];

  for (let i = 0; i < slideEntries.length; i++) {
    const entry = slideEntries[i];
    const slideXml = await extractZipText(buffer, entry.name);
    const slideDoc = parser.parseFromString(slideXml, 'application/xml');

    const texts: { text: string; isTitle?: boolean }[] = [];

    // Extract shape tree elements
    const spElements = slideDoc.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/presentationml/2006/main',
      'sp'
    );

    // Fallback: try without namespace
    const shapes = spElements.length > 0
      ? spElements
      : slideDoc.getElementsByTagName('p:sp');

    for (let s = 0; s < shapes.length; s++) {
      const shape = shapes[s];

      // Check if this is a title placeholder
      let isTitle = false;
      const phElements = shape.getElementsByTagName('p:ph');
      for (let ph = 0; ph < phElements.length; ph++) {
        const phType = phElements[ph].getAttribute('type') ?? '';
        if (phType === 'title' || phType === 'ctrTitle') {
          isTitle = true;
        }
      }

      // Extract all text
      const aTextElements = shape.getElementsByTagName('a:t');
      let shapeText = '';
      for (let t = 0; t < aTextElements.length; t++) {
        shapeText += aTextElements[t].textContent ?? '';
      }

      if (shapeText.trim()) {
        texts.push({ text: shapeText.trim(), isTitle });
      }
    }

    slides.push({
      slideNumber: i + 1,
      texts,
    });

    onProgress?.(30 + ((i + 1) / slideEntries.length) * 60, `Parsed slide ${i + 1} of ${slideEntries.length}...`);
  }

  onProgress?.(100, 'PPTX import complete!');

  return { slides, slideCount: slides.length };
}

// ── CSV/TSV Parser ──────────────────────────────────────────────────────────

export interface CsvParseResult {
  headers: string[];
  rows: string[][];
  delimiter: string;
  totalRows: number;
}

export function detectDelimiter(text: string): string {
  const firstLines = text.split('\n').slice(0, 5);
  let tabCount = 0;
  let commaCount = 0;
  let semiCount = 0;
  let pipeCount = 0;

  for (const line of firstLines) {
    tabCount += (line.match(/\t/g) ?? []).length;
    commaCount += (line.match(/,/g) ?? []).length;
    semiCount += (line.match(/;/g) ?? []).length;
    pipeCount += (line.match(/\|/g) ?? []).length;
  }

  const counts = [
    { delim: '\t', count: tabCount },
    { delim: ',', count: commaCount },
    { delim: ';', count: semiCount },
    { delim: '|', count: pipeCount },
  ];

  counts.sort((a, b) => b.count - a.count);
  return counts[0].count > 0 ? counts[0].delim : ',';
}

export function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }

  result.push(current.trim());
  return result;
}

export async function parseCsv(
  file: File,
  delimiter?: string,
  onProgress?: (p: number, msg: string) => void
): Promise<CsvParseResult> {
  onProgress?.(10, 'Reading CSV file...');

  const text = await file.text();

  onProgress?.(30, 'Detecting format...');

  const detectedDelimiter = delimiter ?? detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('File is empty');
  }

  onProgress?.(50, 'Parsing rows...');

  const headers = parseCsvLine(lines[0], detectedDelimiter);
  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    rows.push(parseCsvLine(lines[i], detectedDelimiter));

    if (i % 1000 === 0) {
      onProgress?.(50 + (i / lines.length) * 40, `Parsed ${i} of ${lines.length} rows...`);
    }
  }

  onProgress?.(100, 'CSV import complete!');

  return {
    headers,
    rows,
    delimiter: detectedDelimiter,
    totalRows: rows.length,
  };
}

export function getCsvPreview(result: CsvParseResult, maxRows = 10): { headers: string[]; rows: string[][] } {
  return {
    headers: result.headers,
    rows: result.rows.slice(0, maxRows),
  };
}

// ── Plain text / Markdown parser ────────────────────────────────────────────

export interface TextParseResult {
  content: string;
  html: string;
  isMarkdown: boolean;
}

export async function parseTextFile(
  file: File,
  onProgress?: (p: number, msg: string) => void
): Promise<TextParseResult> {
  onProgress?.(20, 'Reading text file...');
  const content = await file.text();
  onProgress?.(50, 'Processing content...');

  const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown');

  let html: string;
  if (isMarkdown) {
    // Basic markdown to HTML conversion
    html = markdownToHtml(content);
  } else {
    // Plain text - wrap in paragraphs
    html = content
      .split(/\n\n+/)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  onProgress?.(100, 'Text import complete!');
  return { content, html, isMarkdown };
}

function markdownToHtml(md: string): string {
  let html = md;
  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  // Bold, italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Line breaks / paragraphs
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');
  html = `<p>${html}</p>`;
  // Horizontal rule
  html = html.replace(/<p>---<\/p>/g, '<hr/>');
  // List items
  html = html.replace(/<p>- (.+?)<\/p>/g, '<ul><li>$1</li></ul>');

  return html;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetterToNumber(col: string): number {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num;
}

export function cellRefToColRow(ref: string): { col: number; row: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { col: 0, row: 0 };
  return {
    col: colLetterToNumber(match[1]) - 1,
    row: parseInt(match[2], 10) - 1,
  };
}

// ── Route to correct editor ─────────────────────────────────────────────────

export function getEditorRoute(fileType: ImportFileType): string {
  switch (fileType) {
    case 'docx':
    case 'txt':
    case 'md':
      return '/document';
    case 'xlsx':
    case 'csv':
    case 'tsv':
      return '/spreadsheet';
    case 'pptx':
      return '/presentation';
    case 'pdf':
      return '/pdf';
    default:
      return '/document';
  }
}

// ── Validation ──────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 50 MB.` };
  }
  const fileType = detectFileType(file);
  if (fileType === 'unknown') {
    return { valid: false, error: `Unsupported file type: ${file.name.split('.').pop() ?? 'unknown'}` };
  }
  return { valid: true };
}
