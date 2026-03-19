"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, FileText, Table2, Presentation, FileDown, X } from "lucide-react";

interface DropzoneOverlayProps {
  onFileDrop: (files: File[]) => void;
  /** If true, the drop zone is embedded (no full-screen overlay). */
  embedded?: boolean;
  /** Additional class names for embedded mode */
  className?: string;
  acceptedTypes?: string[];
  children?: React.ReactNode;
}

const FILE_TYPE_ICONS: { ext: string; icon: React.ElementType; color: string }[] = [
  { ext: "docx", icon: FileText, color: "#3b82f6" },
  { ext: "doc", icon: FileText, color: "#3b82f6" },
  { ext: "xlsx", icon: Table2, color: "#16a34a" },
  { ext: "csv", icon: Table2, color: "#16a34a" },
  { ext: "pptx", icon: Presentation, color: "#f59e0b" },
  { ext: "ppt", icon: Presentation, color: "#f59e0b" },
  { ext: "pdf", icon: FileDown, color: "#dc2626" },
];

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_TYPE_ICONS.find((t) => t.ext === ext) ?? { icon: FileText, color: "#6b7280" };
}

/** Full-screen overlay that appears when dragging files over the window */
export function GlobalDropzoneOverlay({ onFileDrop }: { onFileDrop: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer?.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) onFileDrop(files);
    },
    [onFileDrop]
  );

  useEffect(() => {
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      />
      {/* Drop zone card */}
      <div
        className="relative z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center"
        style={{
          borderColor: "var(--primary)",
          backgroundColor: "var(--card)",
          minWidth: 400,
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--primary)", opacity: 0.9 }}
        >
          <Upload size={36} color="white" />
        </div>
        <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Drop files to import
        </h3>
        <p className="mb-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Supports DOCX, PDF, CSV, XLSX, PPTX
        </p>
        <div className="flex items-center gap-3">
          {FILE_TYPE_ICONS.map(({ ext, icon: Icon, color }) => (
            <div key={ext} className="flex flex-col items-center gap-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-[10px] uppercase" style={{ color: "var(--muted-foreground)" }}>
                {ext}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Embedded drop zone with border */
export function EmbeddedDropzone({
  onFileDrop,
  className = "",
  children,
}: {
  onFileDrop: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFileDrop(files);
    },
    [onFileDrop]
  );

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".docx,.doc,.xlsx,.csv,.pptx,.ppt,.pdf,.txt";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length > 0) onFileDrop(files);
    };
    input.click();
  }, [onFileDrop]);

  return (
    <div
      ref={ref}
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${className}`}
      style={{
        borderColor: isDragging ? "var(--primary)" : "var(--border)",
        backgroundColor: isDragging ? "var(--accent)" : "var(--card)",
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {isDragging && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
          style={{ backgroundColor: "var(--accent)", opacity: 0.95 }}
        >
          <Upload size={32} style={{ color: "var(--primary)" }} />
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--primary)" }}>
            Drop files here
          </p>
        </div>
      )}
      {children ?? (
        <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
          <Upload size={24} style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Drop files here or click to browse
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Supports DOCX, PDF, CSV, XLSX, PPTX
          </p>
        </div>
      )}
    </div>
  );
}

/** Drop notification toast */
export function DropNotification({
  files,
  onDismiss,
}: {
  files: File[];
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (files.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <Upload size={14} color="white" />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {files.length === 1 ? files[0].name : `${files.length} files`} ready to import
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {files.map((f) => {
            const { color } = getFileIcon(f.name);
            return color;
          }).length > 0 ? "Processing..." : ""}
        </p>
      </div>
      <button onClick={onDismiss} className="ml-2 hover:opacity-70">
        <X size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </div>
  );
}
