"use client";

import { PDFDocument } from "pdf-lib";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  AlignmentType,
  PageBreak,
  WidthType,
  ShadingType,
  convertInchesToTwip,
} from "docx";

// ─── Download helper ─────────────────────────────────────────────────────────

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── PDF text extraction via pdf.js ─────────────────────────────────────────

async function extractTextWithPdfJs(buffer: ArrayBuffer): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");

  // Point to the worker file copied to public/ for proper Next.js compatibility
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) {
      textParts.push(pageText);
    }
  }

  return textParts;
}

// ─── PDF → TXT ───────────────────────────────────────────────────────────────

export async function pdfToTxt(file: File): Promise<{ blob: Blob; text: string }> {
  const buffer = await file.arrayBuffer();
  let textParts: string[] = [];

  // Primary: use pdf.js for text extraction
  try {
    textParts = await extractTextWithPdfJs(buffer);
  } catch (err) {
    console.error("[PDF Conversion] pdf.js text extraction failed:", err);
  }

  // Fallback: pdf-lib content stream parsing
  if (textParts.length === 0) {
    const pdf = await PDFDocument.load(buffer);
    const pages = pdf.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const node = page.node;
      const contentsRef = node.get(node.context.obj("Contents"));
      if (!contentsRef) continue;

      try {
        const ref = node.context.lookupMaybe(contentsRef, node.context.obj("PDFStream") as never);
        if (ref) {
          const stream = ref as unknown as { getContents: () => Uint8Array };
          if (typeof stream.getContents === "function") {
            const bytes = stream.getContents();
            const decoded = new TextDecoder("latin1").decode(bytes);
            const extracted = extractTextFromStream(decoded);
            if (extracted) textParts.push(extracted);
          }
        }
      } catch (err) {
        console.error(`[PDF Conversion] pdf-lib fallback failed on page ${i + 1}:`, err);
      }
    }

    // Raw byte parsing as last resort
    if (textParts.length === 0) {
      const rawText = extractTextFromRawPdf(buffer);
      if (rawText.trim()) {
        textParts.push(rawText);
      }
    }
  }

  // Get page count for placeholder message
  if (textParts.length === 0) {
    const pdf = await PDFDocument.load(buffer);
    const pageCount = pdf.getPages().length;
    textParts.push(`[PDF contains ${pageCount} page(s). Text extraction found embedded fonts/images that could not be decoded as plain text. For scanned PDFs, use the OCR tab.]`);
  }

  const text = textParts.join("\n\n--- Page Break ---\n\n");
  const blob = new Blob([text], { type: "text/plain" });
  return { blob, text };
}

function extractTextFromStream(content: string): string {
  const textParts: string[] = [];

  // Match text-showing operators: Tj, TJ, ', "
  // Pattern: (text) Tj or [(text) num (text)] TJ
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(content)) !== null) {
    textParts.push(decodeEscaped(match[1]));
  }

  // TJ array operator: [(text) num (text) ...] TJ
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const strRegex = /\(([^)]*)\)/g;
    let strMatch;
    const parts: string[] = [];
    while ((strMatch = strRegex.exec(inner)) !== null) {
      parts.push(decodeEscaped(strMatch[1]));
    }
    textParts.push(parts.join(""));
  }

  return textParts.join(" ").replace(/\s+/g, " ").trim();
}

function decodeEscaped(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")
    .replace(/\\(.)/g, "$1");
}

function extractTextFromRawPdf(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const raw = new TextDecoder("latin1").decode(bytes);
  const textParts: string[] = [];

  // Find all stream...endstream blocks and try to extract text
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match;
  while ((match = streamRegex.exec(raw)) !== null) {
    const content = match[1];
    const extracted = extractTextFromStream(content);
    if (extracted && extracted.length > 2) {
      textParts.push(extracted);
    }
  }

  return textParts.join("\n");
}

// ─── PDF → Word (enhanced with images + structure detection) ────────────────

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, translateX, translateY]
  width: number;
  height: number;
  fontName: string;
}

interface StructuredLine {
  text: string;
  fontSize: number;
  x: number;
  y: number;
  type: "heading1" | "heading2" | "heading3" | "bullet" | "normal" | "table-row";
  cells?: string[]; // for table rows
  cellWidths?: number[]; // proportional widths from PDF coordinates
}

/** Render a single PDF page to a PNG buffer using an OffscreenCanvas or DOM canvas */
async function renderPageToImage(
  page: { getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (ctx: unknown) => { promise: Promise<void> } },
  scale: number
): Promise<{ pngBuffer: ArrayBuffer; width: number; height: number }> {
  const viewport = page.getViewport({ scale });
  const width = Math.round(viewport.width);
  const height = Math.round(viewport.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // White background for the rendered page
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  await page.render({ canvasContext: ctx, viewport } as unknown).promise;

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );
  const pngBuffer = await blob.arrayBuffer();
  return { pngBuffer, width, height };
}

/** Cluster X-positions using a gap-based approach to find column boundaries */
function clusterXPositions(xValues: number[], gapThreshold: number): number[] {
  if (xValues.length === 0) return [];
  const sorted = [...xValues].sort((a, b) => a - b);
  const clusters: number[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > gapThreshold) {
      clusters.push([sorted[i]]);
    } else {
      clusters[clusters.length - 1].push(sorted[i]);
    }
  }
  // Return the median of each cluster as the canonical column position
  return clusters.map((c) => c[Math.floor(c.length / 2)]);
}

/** Detect table regions by finding consecutive lines with consistent multi-column layout */
function detectTableRegions(
  lineGroups: Map<number, TextItem[]>,
  sortedYs: number[]
): { startIdx: number; endIdx: number; columns: number[] }[] {
  // For each line, collect X-start positions of items
  const lineXPositions: { y: number; xs: number[]; items: TextItem[] }[] = [];
  for (const y of sortedYs) {
    const items = lineGroups.get(y)!;
    const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);
    const xs = sorted.map((it) => it.transform[4]);
    lineXPositions.push({ y, xs, items: sorted });
  }

  // Build X-position histogram across ALL lines (finer granularity: 5-unit buckets)
  const xHist: Map<number, number> = new Map();
  for (const lp of lineXPositions) {
    // Deduplicate per-line: only count unique bucket positions per line
    const seen = new Set<number>();
    for (const x of lp.xs) {
      const bucket = Math.round(x / 5) * 5;
      if (!seen.has(bucket)) {
        seen.add(bucket);
        xHist.set(bucket, (xHist.get(bucket) || 0) + 1);
      }
    }
  }

  // Find column positions: X-buckets that appear in at least 3 lines
  const minLineCount = Math.max(3, Math.floor(sortedYs.length * 0.15));
  const frequentXs = Array.from(xHist.entries())
    .filter(([, count]) => count >= Math.min(minLineCount, 3))
    .map(([x]) => x)
    .sort((a, b) => a - b);

  // Cluster nearby frequent X-positions (within 15 units) into column groups
  const columns = clusterXPositions(frequentXs, 15);

  if (columns.length < 2) return [];

  // Scan for consecutive line runs where items align to >= 2 columns
  const regions: { startIdx: number; endIdx: number; columns: number[] }[] = [];
  let regionStart = -1;

  for (let i = 0; i < lineXPositions.length; i++) {
    const lp = lineXPositions[i];
    // Count how many columns this line has items near
    let colHits = 0;
    for (const col of columns) {
      const hasItem = lp.xs.some((x) => Math.abs(x - col) <= 15);
      if (hasItem) colHits++;
    }
    const isTableLine = colHits >= 2 && lp.items.length >= 2;

    if (isTableLine && regionStart === -1) {
      regionStart = i;
    } else if (!isTableLine && regionStart !== -1) {
      if (i - regionStart >= 2) {
        regions.push({ startIdx: regionStart, endIdx: i - 1, columns });
      }
      regionStart = -1;
    }
  }
  // Close any open region
  if (regionStart !== -1 && lineXPositions.length - regionStart >= 2) {
    regions.push({ startIdx: regionStart, endIdx: lineXPositions.length - 1, columns });
  }

  return regions;
}

/** Analyze text content items to detect structure (headings, bullets, tables) */
function analyzeTextStructure(
  items: TextItem[],
  pageHeight: number
): StructuredLine[] {
  if (items.length === 0) return [];

  // Group items by Y position (same line if Y within 3 units)
  const lineGroups: Map<number, TextItem[]> = new Map();
  for (const item of items) {
    const y = Math.round(item.transform[5]);
    // Find an existing line within tolerance
    let matched = false;
    const existingKeys = Array.from(lineGroups.keys());
    for (let k = 0; k < existingKeys.length; k++) {
      const existingY = existingKeys[k];
      if (Math.abs(y - existingY) <= 3) {
        lineGroups.get(existingY)!.push(item);
        matched = true;
        break;
      }
    }
    if (!matched) {
      lineGroups.set(y, [item]);
    }
  }

  // Sort lines top-to-bottom (higher Y = higher on page in PDF coords)
  const sortedYs = Array.from(lineGroups.keys()).sort((a, b) => b - a);

  // Compute font size stats to detect headings
  const fontSizes: number[] = [];
  for (const item of items) {
    const fontSize = Math.abs(item.transform[3]) || Math.abs(item.transform[0]);
    if (fontSize > 0) fontSizes.push(fontSize);
  }
  const sortedFontSizes = [...fontSizes].sort((a, b) => a - b);
  const medianFontSize = sortedFontSizes.length > 0
    ? sortedFontSizes[Math.floor(sortedFontSizes.length / 2)]
    : 12;

  // Detect table regions using X-position clustering
  const tableRegions = detectTableRegions(lineGroups, sortedYs);

  // Build a set of Y-indices that are within table regions
  const tableLineIndices = new Set<number>();
  const tableLineColumns = new Map<number, number[]>();
  for (const region of tableRegions) {
    for (let i = region.startIdx; i <= region.endIdx; i++) {
      tableLineIndices.add(i);
      tableLineColumns.set(i, region.columns);
    }
  }

  const lines: StructuredLine[] = [];

  for (let idx = 0; idx < sortedYs.length; idx++) {
    const y = sortedYs[idx];
    const lineItems = lineGroups.get(y)!;
    // Sort left to right
    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

    const lineText = lineItems.map((it) => it.str).join(" ").trim();
    if (!lineText) continue;

    // Average font size for this line
    const lineFontSizes = lineItems
      .map((it) => Math.abs(it.transform[3]) || Math.abs(it.transform[0]))
      .filter((s) => s > 0);
    const avgFontSize = lineFontSizes.length > 0
      ? lineFontSizes.reduce((a, b) => a + b, 0) / lineFontSizes.length
      : medianFontSize;

    const x = lineItems[0].transform[4];

    // Detect type
    let type: StructuredLine["type"] = "normal";
    let cells: string[] | undefined;
    let cellWidths: number[] | undefined;

    if (tableLineIndices.has(idx)) {
      // This line is in a detected table region
      const columns = tableLineColumns.get(idx)!;
      type = "table-row";
      cells = [];
      cellWidths = [];

      for (let ci = 0; ci < columns.length; ci++) {
        const colX = columns[ci];
        const nextColX = ci < columns.length - 1 ? columns[ci + 1] : Infinity;
        const tolerance = 15;

        // Items belong to this column if their X is closest to colX
        const cellItems = lineItems.filter((it) => {
          const ix = it.transform[4];
          if (ci === 0) return ix < (columns.length > 1 ? (colX + columns[ci + 1]) / 2 : Infinity);
          if (ci === columns.length - 1) return ix >= (columns[ci - 1] + colX) / 2;
          const prevMid = (columns[ci - 1] + colX) / 2;
          const nextMid = (colX + nextColX) / 2;
          return ix >= prevMid && ix < nextMid;
        });
        cells.push(cellItems.map((it) => it.str).join(" ").trim());

        // Compute proportional width based on column spacing
        if (ci < columns.length - 1) {
          cellWidths.push(nextColX - colX);
        } else {
          // Last column gets remaining width (estimate based on page width ~595 pts for A4)
          const pageWidth = 595;
          cellWidths.push(Math.max(pageWidth - colX, columns.length > 1 ? columns[1] - columns[0] : 100));
        }
      }
    } else if (avgFontSize > medianFontSize * 1.6) {
      type = "heading1";
    } else if (avgFontSize > medianFontSize * 1.3) {
      type = "heading2";
    } else if (avgFontSize > medianFontSize * 1.1) {
      type = "heading3";
    } else if (/^[\u2022\u2023\u25E6\u2043\u2219•●○▪◦‣-]\s/.test(lineText)) {
      type = "bullet";
    }

    lines.push({ text: lineText, fontSize: avgFontSize, x, y, type, cells, cellWidths });
  }

  return lines;
}

/** Build DOCX paragraphs from structured lines */
function buildStructuredParagraphs(lines: StructuredLine[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  let tableRows: StructuredLine[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const maxCols = Math.max(...tableRows.map((r) => r.cells?.length || 0));
    if (maxCols === 0) {
      tableRows = [];
      return;
    }

    // Compute proportional column widths from cellWidths data
    // Use the first row with cellWidths as reference, or distribute evenly
    const totalTableWidth = 9000; // DXA units for ~6.25 inches
    let colWidths: number[];

    const refRow = tableRows.find((r) => r.cellWidths && r.cellWidths.length === maxCols);
    if (refRow && refRow.cellWidths) {
      const totalPdfWidth = refRow.cellWidths.reduce((a, b) => a + b, 0);
      colWidths = refRow.cellWidths.map((w) =>
        Math.max(Math.round((w / totalPdfWidth) * totalTableWidth), 500)
      );
      // Adjust to ensure total matches
      const sum = colWidths.reduce((a, b) => a + b, 0);
      if (sum !== totalTableWidth) {
        colWidths[colWidths.length - 1] += totalTableWidth - sum;
      }
    } else {
      colWidths = Array.from({ length: maxCols }, () => Math.round(totalTableWidth / maxCols));
    }

    const borderConfig = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    };

    const rows = tableRows.map(
      (row, rowIdx) =>
        new TableRow({
          children: Array.from({ length: maxCols }, (_, i) => {
            const cellText = row.cells?.[i] || "";
            // First row is treated as header with bold text
            const isHeader = rowIdx === 0;
            return new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cellText,
                      font: "Calibri",
                      size: 20,
                      bold: isHeader,
                    }),
                  ],
                  spacing: { before: 40, after: 40 },
                }),
              ],
              width: { size: colWidths[i], type: WidthType.DXA },
              borders: borderConfig,
              shading: isHeader ? { type: ShadingType.CLEAR, fill: "E8E8E8", color: "auto" } : undefined,
            });
          }),
        })
    );

    elements.push(
      new Table({
        rows,
        width: { size: totalTableWidth, type: WidthType.DXA },
      })
    );
    elements.push(new Paragraph({ children: [], spacing: { before: 80, after: 80 } }));
    tableRows = [];
  };

  for (const line of lines) {
    if (line.type === "table-row" && line.cells) {
      tableRows.push(line);
      continue;
    }

    // Flush any pending table rows before non-table content
    flushTable();

    switch (line.type) {
      case "heading1":
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.text,
                font: "Calibri",
                size: 32,
                bold: true,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      case "heading2":
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.text,
                font: "Calibri",
                size: 28,
                bold: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
        break;
      case "heading3":
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.text,
                font: "Calibri",
                size: 24,
                bold: true,
              }),
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
        break;
      case "bullet": {
        const bulletText = line.text.replace(/^[\u2022\u2023\u25E6\u2043\u2219•●○▪◦‣-]\s*/, "");
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: bulletText,
                font: "Calibri",
                size: 22,
              }),
            ],
            bullet: { level: 0 },
          })
        );
        break;
      }
      default:
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.text,
                font: "Calibri",
                size: 22,
              }),
            ],
          })
        );
    }
  }

  flushTable();
  return elements;
}

export async function pdfToDocx(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  const sectionChildren: (Paragraph | Table)[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // Add page break before pages after the first
    if (i > 1) {
      sectionChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }

    // ── 1. Render page as image for visual fidelity ──
    try {
      const scale = 2.0;
      const { pngBuffer, width, height } = await renderPageToImage(
        page as unknown as Parameters<typeof renderPageToImage>[0],
        scale
      );

      // Fit image within DOCX page width (6.5 inches content area at 96 DPI)
      const maxWidthInches = 6.5;
      const imgWidthInches = width / (scale * 72); // PDF points are 72 per inch
      const imgHeightInches = height / (scale * 72);
      const fitScale = Math.min(1, maxWidthInches / imgWidthInches);
      const finalWidth = Math.round(convertInchesToTwip(imgWidthInches * fitScale) / 15); // twips to pixels approx
      const finalHeight = Math.round(convertInchesToTwip(imgHeightInches * fitScale) / 15);

      sectionChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `── Page ${i} (Visual) ──`,
              font: "Calibri",
              size: 18,
              color: "888888",
              italics: true,
            }),
          ],
          spacing: { before: 120, after: 60 },
          alignment: AlignmentType.CENTER,
        })
      );

      sectionChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: pngBuffer,
              transformation: { width: finalWidth, height: finalHeight },
              type: "png",
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    } catch (err) {
      console.error(`[PDF→DOCX] Failed to render page ${i} as image:`, err);
      sectionChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Page ${i} image could not be rendered]`,
              font: "Calibri",
              size: 20,
              italics: true,
              color: "999999",
            }),
          ],
        })
      );
    }

    // ── 2. Extract structured text for searchability ──
    try {
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const textItems: TextItem[] = content.items
        .filter((item) => "str" in item && (item as { str: string }).str.trim().length > 0)
        .map((item) => ({
          str: (item as { str: string }).str,
          transform: (item as { transform: number[] }).transform,
          width: (item as { width: number }).width,
          height: (item as { height: number }).height || 0,
          fontName: (item as { fontName: string }).fontName || "",
        }));

      if (textItems.length > 0) {
        sectionChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `── Page ${i} (Text) ──`,
                font: "Calibri",
                size: 18,
                color: "888888",
                italics: true,
              }),
            ],
            spacing: { before: 200, after: 60 },
            alignment: AlignmentType.CENTER,
          })
        );

        const structuredLines = analyzeTextStructure(textItems, viewport.height);
        const structuredElements = buildStructuredParagraphs(structuredLines);
        sectionChildren.push(...structuredElements);
      }
    } catch (err) {
      console.error(`[PDF→DOCX] Failed to extract text from page ${i}:`, err);
    }
  }

  // Fallback: if no content was generated at all
  if (sectionChildren.length === 0) {
    sectionChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "No content could be extracted from this PDF.",
            font: "Calibri",
            size: 22,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: sectionChildren,
      },
    ],
  });

  return Packer.toBlob(doc);
}

// ─── Image → PDF ─────────────────────────────────────────────────────────────

export async function imageToPdf(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const pdf = await PDFDocument.create();

  let image;
  const type = file.type.toLowerCase();
  if (type === "image/png") {
    image = await pdf.embedPng(buffer);
  } else if (type === "image/jpeg" || type === "image/jpg") {
    image = await pdf.embedJpg(buffer);
  } else {
    // Convert to PNG via canvas for other formats
    const bitmap = await createImageBitmap(new Blob([buffer], { type: file.type }));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const pngBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    const pngBuffer = await pngBlob.arrayBuffer();
    image = await pdf.embedPng(pngBuffer);
  }

  const page = pdf.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

// ─── OCR via Tesseract.js ────────────────────────────────────────────────────

export async function performOcr(
  file: File,
  language: string,
  onProgress: (progress: number) => void
): Promise<{ text: string; confidence: number }> {
  const Tesseract = await import("tesseract.js");
  const worker = await Tesseract.createWorker(language, undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const {
    data: { text, confidence },
  } = await worker.recognize(file);
  await worker.terminate();

  return { text, confidence };
}

// ─── Image → Text (OCR) returns text as a file ──────────────────────────────

export async function imageToText(
  file: File,
  onProgress: (progress: number) => void
): Promise<Blob> {
  const { text } = await performOcr(file, "eng", onProgress);
  return new Blob([text], { type: "text/plain" });
}
