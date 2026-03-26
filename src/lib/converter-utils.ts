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

/** Analyze text content items to detect structure (headings, bullets, tables) */
function analyzeTextStructure(
  items: TextItem[],
  pageHeight: number
): StructuredLine[] {
  if (items.length === 0) return [];

  // Group items by Y position (same line if Y within 2 units)
  const lineGroups: Map<number, TextItem[]> = new Map();
  for (const item of items) {
    const y = Math.round(item.transform[5] / 2) * 2; // quantize Y
    const existing = lineGroups.get(y);
    if (existing) {
      existing.push(item);
    } else {
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
  const medianFontSize = fontSizes.length > 0
    ? fontSizes.sort((a, b) => a - b)[Math.floor(fontSizes.length / 2)]
    : 12;

  // Detect if there's a table-like grid: multiple items at similar X positions across lines
  const xPositions: Map<number, number> = new Map();
  for (const item of items) {
    const x = Math.round(item.transform[4] / 10) * 10; // quantize X to 10-unit grid
    xPositions.set(x, (xPositions.get(x) || 0) + 1);
  }
  // Column positions that repeat in many lines suggest table columns
  const columnXs = Array.from(xPositions.entries())
    .filter(([, count]) => count >= 3)
    .map(([x]) => x)
    .sort((a, b) => a - b);
  const isLikelyTable = columnXs.length >= 3;

  const lines: StructuredLine[] = [];

  for (const y of sortedYs) {
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

    if (avgFontSize > medianFontSize * 1.6) {
      type = "heading1";
    } else if (avgFontSize > medianFontSize * 1.3) {
      type = "heading2";
    } else if (avgFontSize > medianFontSize * 1.1) {
      type = "heading3";
    } else if (/^[\u2022\u2023\u25E6\u2043\u2219•●○▪◦‣-]\s/.test(lineText)) {
      type = "bullet";
    } else if (isLikelyTable && lineItems.length >= 3) {
      // Check if items align to column positions
      const itemXs = lineItems.map((it) => Math.round(it.transform[4] / 10) * 10);
      const matchCount = itemXs.filter((ix) => columnXs.includes(ix)).length;
      if (matchCount >= 2) {
        type = "table-row";
        // Group items into cells by closest column position
        cells = [];
        for (let ci = 0; ci < columnXs.length; ci++) {
          const colX = columnXs[ci];
          const nextColX = ci < columnXs.length - 1 ? columnXs[ci + 1] : Infinity;
          const cellItems = lineItems.filter((it) => {
            const ix = Math.round(it.transform[4] / 10) * 10;
            return ix >= colX && ix < nextColX;
          });
          cells.push(cellItems.map((it) => it.str).join(" ").trim());
        }
      }
    }

    lines.push({ text: lineText, fontSize: avgFontSize, x, y, type, cells });
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

    const rows = tableRows.map(
      (row) =>
        new TableRow({
          children: Array.from({ length: maxCols }, (_, i) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: row.cells?.[i] || "",
                      font: "Calibri",
                      size: 20,
                    }),
                  ],
                }),
              ],
              width: { size: Math.round(9000 / maxCols), type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            })
          ),
        })
    );

    elements.push(
      new Table({
        rows,
        width: { size: 9000, type: WidthType.DXA },
      })
    );
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
