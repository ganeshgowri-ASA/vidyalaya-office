"use client";

import React, { useState, useRef, useCallback } from "react";
import { FileUp, File, X, Plus } from "lucide-react";
import { btnStyle } from "./types";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  sublabel?: string;
  maxSizeMB?: number;
}

export default function DropZone({
  onFilesSelected,
  multiple = false,
  accept = ".pdf",
  label = "Drop PDF file here",
  sublabel = "or click to browse",
  maxSizeMB = 100,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error: string | null } => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const acceptExts = accept
        .split(",")
        .map((s) => s.trim().toLowerCase());

      const valid: File[] = [];
      for (const file of files) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        const mimeMatch =
          acceptExts.some((a) => a.startsWith(".") && a === ext) ||
          acceptExts.some((a) => !a.startsWith(".") && file.type.startsWith(a));

        if (!mimeMatch && acceptExts.length > 0 && acceptExts[0] !== "") {
          return { valid: [], error: `"${file.name}" is not a supported file type.` };
        }
        if (file.size > maxBytes) {
          return {
            valid: [],
            error: `"${file.name}" exceeds the ${maxSizeMB}MB size limit.`,
          };
        }
        valid.push(file);
      }
      return { valid, error: null };
    },
    [accept, maxSizeMB]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError(null);

      const files = Array.from(fileList);
      const subset = multiple ? files : [files[0]];
      const { valid, error: validationError } = validateFiles(subset);

      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFiles(valid);
      onFilesSelected(valid);
    },
    [multiple, onFilesSelected, validateFiles]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we actually left the container
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX <= rect.left ||
      clientX >= rect.right ||
      clientY <= rect.top ||
      clientY >= rect.bottom
    ) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so the same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: isDragOver
            ? "2px dashed var(--primary)"
            : "2px dashed var(--border)",
          borderRadius: 12,
          padding: "36px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: "pointer",
          backgroundColor: isDragOver ? "var(--muted)" : "var(--background)",
          transition: "border-color 0.2s, background-color 0.2s",
          minHeight: 160,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDragOver ? "var(--primary)" : "var(--muted)",
            transition: "background-color 0.2s",
          }}
        >
          <FileUp
            size={24}
            style={{
              color: isDragOver ? "var(--primary-foreground)" : "var(--muted-foreground)",
              transition: "color 0.2s",
            }}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isDragOver ? "var(--primary)" : "var(--foreground)",
              margin: 0,
              transition: "color 0.2s",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              margin: "4px 0 0 0",
            }}
          >
            {sublabel}
          </p>
        </div>

        <span
          style={{
            fontSize: 10,
            color: "var(--muted-foreground)",
            opacity: 0.7,
          }}
        >
          {multiple ? "Multiple files supported" : "Single file"} &middot; Max {maxSizeMB}MB &middot;{" "}
          {accept}
        </span>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-center gap-2"
          style={{
            fontSize: 12,
            color: "var(--destructive, #ef4444)",
            padding: "8px 12px",
            backgroundColor: "var(--background)",
            border: "1px solid var(--destructive, #ef4444)",
            borderRadius: 6,
          }}
        >
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}
          >
            <X size={14} style={{ color: "var(--destructive, #ef4444)" }} />
          </button>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2"
              style={{
                padding: "6px 10px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              <File size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  color: "var(--foreground)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.name}
              </span>
              <span style={{ color: "var(--muted-foreground)", fontSize: 10, flexShrink: 0 }}>
                {formatSize(file.size)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
                title="Remove file"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <X size={13} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          ))}

          {multiple && (
            <button
              onClick={handleClick}
              style={{
                ...btnStyle,
                justifyContent: "center",
                fontSize: 11,
                padding: "5px 10px",
                marginTop: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card)")}
            >
              <Plus size={13} /> Add More Files
            </button>
          )}
        </div>
      )}
    </div>
  );
}
