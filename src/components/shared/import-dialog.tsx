"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X, Upload, FileText, FileSpreadsheet, Presentation as PresentationIcon,
  FileDown, Loader2, CheckCircle, AlertCircle,
} from "lucide-react";
import type { DocumentType, ImportFormat } from "@/lib/export-manager";
import { SUPPORTED_IMPORTS } from "@/lib/export-manager";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File, type: DocumentType) => Promise<void>;
  defaultType?: DocumentType;
}

const TYPE_CONFIG: { type: DocumentType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "document", label: "Document", icon: FileText, color: "#3b82f6" },
  { type: "spreadsheet", label: "Spreadsheet", icon: FileSpreadsheet, color: "#16a34a" },
  { type: "presentation", label: "Presentation", icon: PresentationIcon, color: "#f59e0b" },
  { type: "pdf", label: "PDF", icon: FileDown, color: "#8b5cf6" },
];

export function ImportDialog({ open, onClose, onImport, defaultType }: ImportDialogProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>(defaultType || "document");
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = SUPPORTED_IMPORTS[selectedType] || [];
  const acceptString = supportedFormats.map((f) => f.accept).join(",");

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setSuccess(false);
    setImporting(true);
    setProgress({ percent: 0, message: `Importing ${file.name}...` });

    try {
      await onImport(file, selectedType);
      setSuccess(true);
      setProgress({ percent: 100, message: "Import complete!" });
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setImporting(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setImporting(false);
    }
  }, [onImport, selectedType, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6 w-full max-w-lg"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Upload size={18} />
            Import File
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Document type selector */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: "var(--muted-foreground)" }}>
            Import as
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TYPE_CONFIG.map((tc) => {
              const Icon = tc.icon;
              const isActive = selectedType === tc.type;
              return (
                <button
                  key={tc.type}
                  onClick={() => setSelectedType(tc.type)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-xs font-medium transition-all"
                  style={{
                    borderColor: isActive ? tc.color : "var(--border)",
                    backgroundColor: isActive ? `${tc.color}10` : "transparent",
                    color: isActive ? tc.color : "var(--muted-foreground)",
                  }}
                >
                  <Icon size={20} />
                  {tc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Supported formats */}
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Supported formats: {supportedFormats.map((f) => f.accept).join(", ")}
        </div>

        {/* Drop zone */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
          style={{
            borderColor: dragOver ? "var(--primary)" : "var(--border)",
            backgroundColor: dragOver ? "var(--accent)" : "transparent",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {importing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{progress.message}</p>
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%`, backgroundColor: "var(--primary)" }}
                />
              </div>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle size={32} style={{ color: "#16a34a" }} />
              <p className="text-sm font-medium" style={{ color: "#16a34a" }}>Import successful!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                Drag and drop a file here, or click to browse
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Maximum file size: 50MB
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ backgroundColor: "#dc262610", color: "#dc2626" }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
