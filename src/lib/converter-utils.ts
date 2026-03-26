"use client";

import { PDFDocument } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";

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

// ─── PDF → Word (real OOXML .docx via docx library) ─────────────────────────

export async function pdfToDocx(file: File): Promise<Blob> {
  const { text } = await pdfToTxt(file);

  const lines = text.split("\n");
  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line || "",
            font: "Calibri",
            size: 22, // 11pt in half-points
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
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
