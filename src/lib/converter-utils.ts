"use client";

import { PDFDocument } from "pdf-lib";

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

// ─── PDF → TXT ───────────────────────────────────────────────────────────────

export async function pdfToTxt(file: File): Promise<{ blob: Blob; text: string }> {
  const buffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();

  // pdf-lib doesn't directly extract text; we use the low-level page content
  // For proper text extraction we parse the PDF content streams
  const textParts: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    // Access raw content via page node
    const node = page.node;
    const contentsRef = node.get(node.context.obj("Contents"));
    if (!contentsRef) continue;

    try {
      // Try to get the content stream
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
    } catch {
      // Fallback: try iterating indirect objects
    }
  }

  // If pdf-lib extraction fails, try raw byte parsing
  if (textParts.length === 0) {
    const rawText = extractTextFromRawPdf(buffer);
    if (rawText.trim()) {
      textParts.push(rawText);
    }
  }

  // If still empty, add a placeholder
  if (textParts.length === 0) {
    textParts.push(`[PDF contains ${pages.length} page(s). Text extraction found embedded fonts/images that could not be decoded as plain text. For scanned PDFs, use the OCR tab.]`);
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

// ─── PDF → Word (simple HTML-based docx) ─────────────────────────────────────

export async function pdfToDocx(file: File): Promise<Blob> {
  const { text } = await pdfToTxt(file);

  // Create a simple HTML-based document that Word can open
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Converted Document</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
  p { margin: 0 0 8pt 0; }
</style>
</head>
<body>
${text
  .split("\n")
  .map((line) => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "&nbsp;"}</p>`)
  .join("\n")}
</body>
</html>`;

  return new Blob([html], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
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
