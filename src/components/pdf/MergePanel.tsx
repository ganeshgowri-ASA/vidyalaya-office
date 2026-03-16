"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Loader2,
  CheckCircle,
  FilePlus,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, formatBytes } from "./types";

interface MergePanelProps {
  files: Array<{ id: string; name: string; data: ArrayBuffer; pageCount: number }>;
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
  onMoveFile: (index: number, dir: -1 | 1) => void;
  onMerge: () => void;
  merging: boolean;
}

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 20,
  height: "100%",
  overflowY: "auto",
};

const fileRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
};

const iconBtnStyle: React.CSSProperties = {
  ...btnStyle,
  padding: 4,
  borderRadius: 4,
  minWidth: 28,
  minHeight: 28,
  justifyContent: "center",
};

export default function MergePanel({
  files,
  onAddFiles,
  onRemoveFile,
  onMoveFile,
  onMerge,
  merging,
}: MergePanelProps) {
  const [hover, setHover] = useState(false);
  const [merged, setMerged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMerge = () => {
    setMerged(false);
    onMerge();
    // Parent handles completion; we show success via effect
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--card-foreground)" }}>
        Merge PDFs
      </h3>
      <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
        Combine multiple PDF files into a single document. Drag to reorder.
      </p>

      {/* DropZone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 cursor-pointer"
        style={{
          border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 12,
          padding: 40,
          backgroundColor: hover ? "var(--accent)" : "var(--card)",
          transition: "all 0.2s",
        }}
      >
        <Upload size={28} style={{ color: hover ? "var(--primary)" : "var(--muted-foreground)" }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)" }}>
          Drop PDF files here or click to browse
        </span>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Supports multiple files at once
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) onAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--card-foreground)" }}>
              {files.length} file{files.length !== 1 ? "s" : ""} added
            </span>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Total pages: {files.reduce((s, f) => s + f.pageCount, 0)}
            </span>
          </div>

          {files.map((file, idx) => (
            <div key={file.id} style={fileRowStyle}>
              <GripVertical
                size={16}
                style={{ color: "var(--muted-foreground)", cursor: "grab", flexShrink: 0 }}
              />
              <FilePlus size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--card-foreground)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                  {file.pageCount} page{file.pageCount !== 1 ? "s" : ""} &middot;{" "}
                  {formatBytes(file.data.byteLength)}
                </div>
              </div>

              <button
                style={iconBtnStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveFile(idx, -1);
                }}
                disabled={idx === 0}
                title="Move up"
              >
                <ChevronUp size={14} style={{ opacity: idx === 0 ? 0.3 : 1 }} />
              </button>
              <button
                style={iconBtnStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveFile(idx, 1);
                }}
                disabled={idx === files.length - 1}
                title="Move down"
              >
                <ChevronDown
                  size={14}
                  style={{ opacity: idx === files.length - 1 ? 0.3 : 1 }}
                />
              </button>
              <button
                style={{ ...iconBtnStyle, color: "var(--destructive)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(file.id);
                }}
                title="Remove file"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Merge Button */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          style={{
            ...btnPrimaryStyle,
            opacity: files.length < 2 || merging ? 0.5 : 1,
            cursor: files.length < 2 || merging ? "not-allowed" : "pointer",
          }}
          disabled={files.length < 2 || merging}
          onClick={handleMerge}
        >
          {merging ? (
            <>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Merging...
            </>
          ) : (
            "Merge All"
          )}
        </button>
        {files.length > 0 && files.length < 2 && (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Add at least 2 files to merge
          </span>
        )}
      </div>

      {/* Success message */}
      {merged && !merging && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            backgroundColor: "var(--accent)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          <CheckCircle size={16} style={{ color: "green" }} />
          <span style={{ fontSize: 13, color: "var(--card-foreground)" }}>
            PDFs merged successfully! Your download should start automatically.
          </span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
