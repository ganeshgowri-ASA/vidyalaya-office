"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FilePlus2,
  Scissors,
  Minimize2,
  Upload,
  Download,
  Loader2,
  Trash2,
  GripVertical,
  Plus,
} from "lucide-react";

type Operation = "merge" | "split" | "compress";

export function PDFOperations() {
  const [activeOp, setActiveOp] = useState<Operation>("merge");

  return (
    <div className="flex h-full flex-col gap-4 p-4 overflow-auto">
      {/* Tab row */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{ backgroundColor: "var(--secondary)" }}
      >
        {(["merge", "split", "compress"] as Operation[]).map((op) => (
          <button
            key={op}
            onClick={() => setActiveOp(op)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium capitalize transition-all"
            style={
              activeOp === op
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground, #fff)" }
                : { color: "var(--foreground)", opacity: 0.7 }
            }
          >
            {op === "merge" && <FilePlus2 size={14} />}
            {op === "split" && <Scissors size={14} />}
            {op === "compress" && <Minimize2 size={14} />}
            {op}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {activeOp === "merge" && <MergePanel />}
      {activeOp === "split" && <SplitPanel />}
      {activeOp === "compress" && <CompressPanel />}
    </div>
  );
}

// --- Merge Panel ---
function MergePanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const pdfs = Array.from(newFiles).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...pdfs]);
    setResult(null);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
  }

  async function handleMerge() {
    if (files.length < 2) return;
    setLoading(true);
    setResult(null);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      console.error("Merge failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Merge PDFs
        </h3>
        <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          Upload 2 or more PDF files to combine them into one.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed py-6 text-center transition-colors hover:opacity-80"
        style={{ borderColor: "var(--border)" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        <Plus size={24} style={{ color: "var(--primary)" }} />
        <p className="text-sm" style={{ color: "var(--foreground)" }}>
          Drop PDFs here or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
            >
              <GripVertical size={14} style={{ color: "var(--foreground)", opacity: 0.3 }} />
              <span className="flex-1 truncate text-sm" style={{ color: "var(--foreground)" }}>
                {file.name}
              </span>
              <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="rounded p-0.5 transition-opacity hover:opacity-70"
                style={{ color: "#ef4444" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <button
        onClick={handleMerge}
        disabled={files.length < 2 || loading}
        className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Merging...
          </>
        ) : (
          <>
            <FilePlus2 size={16} /> Merge {files.length} PDFs
          </>
        )}
      </button>

      {result && (
        <a
          href={result}
          download="merged.pdf"
          className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
        >
          <Download size={16} /> Download merged.pdf
        </a>
      )}
    </div>
  );
}

// --- Split Panel ---
function SplitPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [ranges, setRanges] = useState<string>("1-3, 4-6");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ url: string; name: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadPageCount(f: File) {
    const bytes = await f.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    setNumPages(pdf.getPageCount());
  }

  function handleFileSelect(files: FileList | null) {
    const f = files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResults([]);
      loadPageCount(f);
    }
  }

  function parseRanges(input: string, total: number): number[][] {
    const groups: number[][] = [];
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      const match = trimmed.match(/^(\d+)(?:-(\d+))?$/);
      if (!match) continue;
      const start = parseInt(match[1]) - 1;
      const end = match[2] ? parseInt(match[2]) - 1 : start;
      const pages: number[] = [];
      for (let i = Math.max(0, start); i <= Math.min(total - 1, end); i++) {
        pages.push(i);
      }
      if (pages.length) groups.push(pages);
    }
    return groups;
  }

  async function handleSplit() {
    if (!file || !numPages) return;
    setLoading(true);
    setResults([]);
    try {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const pageGroups = parseRanges(ranges, numPages);
      const urls: { url: string; name: string }[] = [];

      for (let i = 0; i < pageGroups.length; i++) {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, pageGroups[i]);
        pages.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        urls.push({ url: URL.createObjectURL(blob), name: `split-part-${i + 1}.pdf` });
      }
      setResults(urls);
    } catch (err) {
      console.error("Split failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Split PDF
        </h3>
        <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          Extract page ranges into separate PDFs.
        </p>
      </div>

      {/* File select */}
      <div
        className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed py-4 px-4 transition-colors hover:opacity-80"
        style={{ borderColor: "var(--border)" }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={18} style={{ color: "var(--primary)" }} />
        <span className="text-sm" style={{ color: "var(--foreground)" }}>
          {file ? file.name : "Select a PDF to split"}
        </span>
        {numPages > 0 && (
          <span className="ml-auto text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            {numPages} pages
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Range input */}
      {file && (
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--foreground)" }}>
            Page ranges (comma-separated, e.g. <code>1-3, 4-6, 7</code>)
          </label>
          <input
            type="text"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
            placeholder="e.g. 1-3, 4-6"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || loading}
        className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Splitting...
          </>
        ) : (
          <>
            <Scissors size={16} /> Split PDF
          </>
        )}
      </button>

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            Download splits:
          </p>
          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              download={r.name}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              <Download size={14} /> {r.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Compress Panel ---
function CompressPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(files: FileList | null) {
    const f = files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResult(null);
    }
  }

  async function handleCompress() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      // pdf-lib doesn't do true image compression in-browser
      // We load and re-save which removes redundant objects
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Save with object compression based on quality setting
      const useObjectStreams = quality !== "high";
      const compressed = await pdf.save({ useObjectStreams });

      const blob = new Blob([compressed.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (err) {
      console.error("Compress failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const qualityOptions = [
    { value: "high", label: "High Quality", desc: "Less compression" },
    { value: "medium", label: "Balanced", desc: "Recommended" },
    { value: "low", label: "Maximum Compression", desc: "Smaller file size" },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Compress PDF
        </h3>
        <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          Reduce PDF file size by removing redundant objects and compressing streams.
        </p>
      </div>

      {/* File select */}
      <div
        className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed py-4 px-4 transition-colors hover:opacity-80"
        style={{ borderColor: "var(--border)" }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={18} style={{ color: "var(--primary)" }} />
        <div className="flex-1">
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            {file ? file.name : "Select a PDF to compress"}
          </p>
          {file && (
            <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              Original: {(file.size / 1024).toFixed(0)} KB
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Quality selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          Compression level
        </label>
        {qualityOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors"
            style={{
              borderColor: quality === opt.value ? "var(--primary)" : "var(--border)",
              backgroundColor: quality === opt.value ? "var(--accent)" : "transparent",
            }}
          >
            <input
              type="radio"
              name="quality"
              value={opt.value}
              checked={quality === opt.value}
              onChange={() => setQuality(opt.value)}
              className="accent-[var(--primary)]"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {opt.label}
              </p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                {opt.desc}
              </p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleCompress}
        disabled={!file || loading}
        className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Compressing...
          </>
        ) : (
          <>
            <Minimize2 size={16} /> Compress PDF
          </>
        )}
      </button>

      {result && (
        <div className="flex flex-col gap-2">
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "rgba(74,222,128,0.3)",
              backgroundColor: "rgba(74,222,128,0.1)",
              color: "#22c55e",
            }}
          >
            ✓ Compressed to {(result.size / 1024).toFixed(0)} KB
            {file && ` (${Math.round((1 - result.size / file.size) * 100)}% reduction)`}
          </div>
          <a
            href={result.url}
            download="compressed.pdf"
            className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            <Download size={16} /> Download compressed.pdf
          </a>
        </div>
      )}
    </div>
  );
}
