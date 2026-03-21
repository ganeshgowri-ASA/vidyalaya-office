'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Download, Upload, X, FileImage, FileText, File, Layers, Settings } from 'lucide-react';
import { useGraphicsStore, Shape } from '@/store/graphics-store';
import {
  ExportFormat, ExportOptions, DEFAULT_EXPORT_OPTIONS, DPI_PRESETS,
  exportSvg, exportPng, exportPdf, exportJson, exportDrawio, batchExport,
} from '@/lib/graphics-export';
import { importFile, ImportFormat } from '@/lib/graphics-import';

// ── Export Modal ────────────────────────────────────────────────────────────

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const FORMAT_INFO: Record<ExportFormat, { label: string; desc: string; icon: React.ReactNode }> = {
  svg: { label: 'SVG', desc: 'Scalable vector, lossless', icon: <FileImage size={16} /> },
  png: { label: 'PNG', desc: 'Raster image with DPI control', icon: <FileImage size={16} /> },
  pdf: { label: 'PDF', desc: 'Print-ready document', icon: <FileText size={16} /> },
  json: { label: 'JSON', desc: 'Project file (re-importable)', icon: <File size={16} /> },
  drawio: { label: '.drawio', desc: 'draw.io compatible XML', icon: <File size={16} /> },
};

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { shapes, canvasWidth, canvasHeight } = useGraphicsStore();
  const [opts, setOpts] = useState<ExportOptions>({
    ...DEFAULT_EXPORT_OPTIONS,
    pageWidth: canvasWidth,
    pageHeight: canvasHeight,
  });
  const [batchFormats, setBatchFormats] = useState<ExportFormat[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [exporting, setExporting] = useState(false);

  const update = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) =>
    setOpts(o => ({ ...o, [key]: value }));

  const toggleBatchFormat = (f: ExportFormat) =>
    setBatchFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleExport = async () => {
    setExporting(true);
    try {
      if (batchMode && batchFormats.length > 0) {
        await batchExport(shapes, opts, batchFormats);
      } else {
        switch (opts.format) {
          case 'svg': exportSvg(opts); break;
          case 'png': await exportPng(opts); break;
          case 'pdf': await exportPdf(opts); break;
          case 'json': exportJson(shapes, opts); break;
          case 'drawio': exportDrawio(shapes, opts); break;
        }
      }
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[480px] max-h-[90vh] overflow-y-auto rounded-xl bg-[#1e293b] border border-[#334155] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-[#e2e8f0]">Export Diagram</h2>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Batch toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={e => setBatchMode(e.target.checked)}
              className="rounded border-[#334155] bg-[#0f172a]"
            />
            <Layers size={14} className="text-purple-400" />
            <span className="text-xs text-[#e2e8f0]">Batch export (multiple formats)</span>
          </label>

          {/* Format selection */}
          {batchMode ? (
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#94a3b8] mb-2">Select formats</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FORMAT_INFO) as [ExportFormat, typeof FORMAT_INFO[ExportFormat]][]).map(([f, info]) => (
                  <button
                    key={f}
                    onClick={() => toggleBatchFormat(f)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-colors ${
                      batchFormats.includes(f)
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                        : 'border-[#334155] bg-[#0f172a] text-[#94a3b8] hover:border-[#475569]'
                    }`}
                  >
                    {info.icon}
                    <div>
                      <div className="font-medium text-[#e2e8f0]">{info.label}</div>
                      <div className="text-[10px]">{info.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#94a3b8] mb-2">Format</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FORMAT_INFO) as [ExportFormat, typeof FORMAT_INFO[ExportFormat]][]).map(([f, info]) => (
                  <button
                    key={f}
                    onClick={() => update('format', f)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-colors ${
                      opts.format === f
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                        : 'border-[#334155] bg-[#0f172a] text-[#94a3b8] hover:border-[#475569]'
                    }`}
                  >
                    {info.icon}
                    <div>
                      <div className="font-medium text-[#e2e8f0]">{info.label}</div>
                      <div className="text-[10px]">{info.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DPI (for PNG and PDF) */}
          {(opts.format === 'png' || opts.format === 'pdf' || batchMode) && (
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#94a3b8] mb-2 flex items-center gap-1">
                <Settings size={12} /> Resolution (DPI)
              </p>
              <div className="grid grid-cols-4 gap-1">
                {DPI_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => update('dpi', p.value)}
                    className={`py-1.5 rounded text-[10px] transition-colors ${
                      opts.dpi === p.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'
                    }`}
                  >
                    {p.value}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#64748b] mt-1">
                Output: {Math.round(opts.pageWidth * opts.dpi / 72)} × {Math.round(opts.pageHeight * opts.dpi / 72)} px
              </p>
            </div>
          )}

          {/* Background */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] uppercase font-semibold text-[#94a3b8] mb-1">Background</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={opts.background}
                  onChange={e => update('background', e.target.value)}
                  className="w-8 h-8 rounded border border-[#334155] bg-transparent cursor-pointer"
                  disabled={opts.transparent}
                />
                <input
                  type="text"
                  value={opts.background}
                  onChange={e => update('background', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0]"
                  disabled={opts.transparent}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={opts.transparent}
                onChange={e => update('transparent', e.target.checked)}
                className="rounded border-[#334155] bg-[#0f172a]"
              />
              <span className="text-xs text-[#e2e8f0]">Transparent</span>
            </label>
          </div>

          {/* File name */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-[#94a3b8] mb-1">File name</p>
            <input
              type="text"
              value={opts.fileName}
              onChange={e => update('fileName', e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0]"
              placeholder="diagram"
            />
          </div>

          {/* Info */}
          <div className="text-[10px] text-[#64748b] bg-[#0f172a] rounded-lg px-3 py-2">
            {shapes.length} shape{shapes.length !== 1 ? 's' : ''} • Canvas {opts.pageWidth}×{opts.pageHeight}
            {batchMode && batchFormats.length > 0 && ` • ${batchFormats.length} format${batchFormats.length !== 1 ? 's' : ''} selected`}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#334155]">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#0f172a] text-xs text-[#94a3b8] hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || (batchMode && batchFormats.length === 0)}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs text-white font-medium flex items-center gap-1.5"
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : batchMode ? 'Batch Export' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Import Modal ────────────────────────────────────────────────────────────

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportModal({ open, onClose }: ImportModalProps) {
  const { shapes, pushHistory } = useGraphicsStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ count: number; format: ImportFormat } | null>(null);
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('merge');

  const handleFile = useCallback(async (file: File) => {
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const { shapes: imported, format } = await importFile(file);
      if (mergeMode === 'replace') {
        pushHistory(imported);
      } else {
        // Offset imported shapes to avoid overlap
        const offsetX = shapes.length > 0 ? Math.max(...shapes.map(s => s.x + s.width)) + 40 : 0;
        const adjusted = imported.map(s => ({ ...s, x: s.x + offsetX } as Shape));
        pushHistory([...shapes, ...adjusted]);
      }
      setResult({ count: imported.length, format });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import file');
    } finally {
      setImporting(false);
    }
  }, [shapes, pushHistory, mergeMode]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[440px] rounded-xl bg-[#1e293b] border border-[#334155] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-green-400" />
            <h2 className="text-sm font-semibold text-[#e2e8f0]">Import Diagram</h2>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Merge mode */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-[#94a3b8] mb-2">Import mode</p>
            <div className="flex gap-2">
              {(['merge', 'replace'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setMergeMode(mode)}
                  className={`flex-1 py-1.5 rounded text-xs capitalize transition-colors ${
                    mergeMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'
                  }`}
                >
                  {mode === 'merge' ? 'Add to canvas' : 'Replace canvas'}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-600/10'
                : 'border-[#334155] hover:border-[#475569] bg-[#0f172a]'
            }`}
          >
            <Upload size={32} className="mx-auto mb-3 text-[#475569]" />
            <p className="text-xs text-[#e2e8f0] mb-1">Drop file here or click to browse</p>
            <p className="text-[10px] text-[#64748b]">
              Supported: .drawio, .xml, .vsdx (Visio XML), .json
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".drawio,.xml,.vsdx,.json"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          {/* Status */}
          {importing && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/10 border border-blue-600/30">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-300">Importing...</span>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-600/10 border border-red-600/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {result && (
            <div className="px-3 py-2 rounded-lg bg-green-600/10 border border-green-600/30 text-xs text-green-300">
              Successfully imported {result.count} shape{result.count !== 1 ? 's' : ''} from .{result.format} file
            </div>
          )}

          {/* Format info */}
          <div className="text-[10px] text-[#64748b] space-y-1">
            <p><strong className="text-[#94a3b8]">.drawio/.xml</strong> — draw.io / diagrams.net files</p>
            <p><strong className="text-[#94a3b8]">.vsdx</strong> — Visio XML page content</p>
            <p><strong className="text-[#94a3b8]">.json</strong> — Vidyalaya project files</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#334155]">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#0f172a] text-xs text-[#94a3b8] hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
