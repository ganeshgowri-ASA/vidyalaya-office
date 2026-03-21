'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  X, Table2, ArrowRight, Check, Columns, Eye, EyeOff, RotateCcw,
} from 'lucide-react';
import { useImportStore } from '@/store/import-store';

interface CsvColumnMapperProps {
  onConfirm: (mappings: { sourceColumn: string; targetColumn: number; include: boolean }[], delimiter: string) => void;
  onCancel: () => void;
}

const DELIMITER_OPTIONS = [
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab (\\t)' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '|', label: 'Pipe (|)' },
];

export function CsvColumnMapper({ onConfirm, onCancel }: CsvColumnMapperProps) {
  const { csvPreview, csvMappings, showCsvMapper, updateCsvMapping } = useImportStore();
  const [delimiter, setDelimiter] = useState(csvPreview?.delimiter ?? ',');
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true);

  const headers = useMemo(() => {
    if (!csvPreview) return [];
    return csvPreview.headers;
  }, [csvPreview]);

  const previewRows = useMemo(() => {
    if (!csvPreview) return [];
    return csvPreview.rows.slice(0, 5);
  }, [csvPreview]);

  const toggleInclude = useCallback((index: number) => {
    updateCsvMapping(index, { include: !csvMappings[index]?.include });
  }, [csvMappings, updateCsvMapping]);

  const resetMappings = useCallback(() => {
    csvMappings.forEach((_, i) => {
      updateCsvMapping(i, { targetColumn: i, include: true });
    });
  }, [csvMappings, updateCsvMapping]);

  const handleConfirm = useCallback(() => {
    onConfirm(csvMappings, delimiter);
  }, [csvMappings, delimiter, onConfirm]);

  if (!showCsvMapper || !csvPreview) return null;

  const includedCount = csvMappings.filter((m) => m.include).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="flex flex-col w-full max-w-3xl max-h-[80vh]"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Columns size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              CSV Column Mapping
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              {csvPreview.totalRows} rows
            </span>
          </div>
          <button onClick={onCancel} className="p-1 rounded hover:bg-[var(--muted)]" style={{ color: 'var(--muted-foreground)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Settings bar */}
        <div className="flex items-center gap-4 p-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="text-xs rounded px-2 py-1 border"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
              }}
            >
              {DELIMITER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--muted-foreground)' }}>
            <input
              type="checkbox"
              checked={firstRowIsHeader}
              onChange={(e) => setFirstRowIsHeader(e.target.checked)}
              className="rounded"
            />
            First row is header
          </label>

          <button
            onClick={resetMappings}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-[var(--background)]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <div className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {includedCount} of {headers.length} columns selected
          </div>
        </div>

        {/* Column mapping table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--muted-foreground)' }}>
                <th className="text-left pb-2 font-medium w-8">Include</th>
                <th className="text-left pb-2 font-medium">Source Column</th>
                <th className="text-center pb-2 font-medium w-8"></th>
                <th className="text-left pb-2 font-medium">Target Column</th>
                <th className="text-left pb-2 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody>
              {csvMappings.map((mapping, index) => (
                <tr
                  key={index}
                  className="border-t"
                  style={{
                    borderColor: 'var(--border)',
                    opacity: mapping.include ? 1 : 0.5,
                  }}
                >
                  <td className="py-2">
                    <button onClick={() => toggleInclude(index)} className="p-1 rounded hover:bg-[var(--muted)]">
                      {mapping.include ? (
                        <Eye size={14} style={{ color: 'var(--primary)' }} />
                      ) : (
                        <EyeOff size={14} style={{ color: 'var(--muted-foreground)' }} />
                      )}
                    </button>
                  </td>
                  <td className="py-2">
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {mapping.sourceColumn || `Column ${index + 1}`}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <ArrowRight size={12} style={{ color: 'var(--muted-foreground)' }} />
                  </td>
                  <td className="py-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                      Column {String.fromCharCode(65 + mapping.targetColumn)}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1 overflow-hidden">
                      {previewRows.slice(0, 3).map((row, ri) => (
                        <span
                          key={ri}
                          className="inline-block max-w-[80px] truncate px-1.5 py-0.5 rounded text-[10px]"
                          style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                        >
                          {row[index] ?? ''}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data preview */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
            Data Preview (first 5 rows)
          </p>
          <div className="overflow-auto max-h-32 rounded border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      className="text-left px-2 py-1 font-medium whitespace-nowrap"
                      style={{ color: 'var(--foreground)', borderRight: '1px solid var(--border)' }}
                    >
                      {h || `Col ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr key={ri} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    {headers.map((_, ci) => (
                      <td
                        key={ci}
                        className="px-2 py-1 whitespace-nowrap"
                        style={{ color: 'var(--foreground)', borderRight: '1px solid var(--border)' }}
                      >
                        {row[ci] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs rounded-lg border hover:bg-[var(--muted)] transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <Check size={14} />
            Import {includedCount} Columns ({csvPreview.totalRows} rows)
          </button>
        </div>
      </div>
    </div>
  );
}
