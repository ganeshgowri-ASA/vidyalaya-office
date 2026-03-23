"use client";

import React, { useState } from "react";
import { Shield, Trash2, CheckCircle, AlertTriangle, FileText, User, Calendar, Settings } from "lucide-react";

interface MetadataRemovalPanelProps {
  documentProperties: {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    creator: string;
    producer: string;
    creationDate: string;
    modDate: string;
  };
  pdfLoaded: boolean;
  onRemoveMetadata: (fields: string[]) => void;
}

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  transition: "background-color 0.15s",
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "#dc2626",
  color: "#ffffff",
  border: "1px solid #dc2626",
};

const checkboxStyle: React.CSSProperties = {
  accentColor: "var(--primary)",
  width: 14,
  height: 14,
  cursor: "pointer",
};

interface MetadataField {
  key: string;
  label: string;
  icon: React.ElementType;
  value: string;
}

export default function MetadataRemovalPanel({
  documentProperties,
  pdfLoaded,
  onRemoveMetadata,
}: MetadataRemovalPanelProps) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [removed, setRemoved] = useState(false);

  const fields: MetadataField[] = [
    { key: "title", label: "Title", icon: FileText, value: documentProperties.title },
    { key: "author", label: "Author", icon: User, value: documentProperties.author },
    { key: "subject", label: "Subject", icon: FileText, value: documentProperties.subject },
    { key: "keywords", label: "Keywords", icon: Settings, value: documentProperties.keywords },
    { key: "creator", label: "Creator Application", icon: Settings, value: documentProperties.creator },
    { key: "producer", label: "PDF Producer", icon: Settings, value: documentProperties.producer },
    { key: "creationDate", label: "Creation Date", icon: Calendar, value: documentProperties.creationDate },
    { key: "modDate", label: "Modification Date", icon: Calendar, value: documentProperties.modDate },
  ];

  const fieldsWithValue = fields.filter((f) => f.value && f.value.trim() !== "");

  const toggleField = (key: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedFields(new Set(fieldsWithValue.map((f) => f.key)));
  };

  const deselectAll = () => {
    setSelectedFields(new Set());
  };

  const handleRemove = () => {
    onRemoveMetadata(Array.from(selectedFields));
    setRemoved(true);
    setSelectedFields(new Set());
  };

  if (!pdfLoaded) {
    return (
      <div className="p-6 flex flex-col items-center gap-3" style={{ color: "var(--muted-foreground)" }}>
        <Shield size={32} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: 13 }}>Load a PDF to manage metadata</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="flex items-center gap-2">
        <Shield size={18} style={{ color: "var(--primary)" }} />
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Remove Metadata</h3>
      </div>

      <div
        className="flex items-start gap-2 p-3 rounded-lg"
        style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
      >
        <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 11, color: "#fbbf24", lineHeight: 1.5 }}>
          Removing metadata strips identifying information from the PDF. This cannot be undone.
          Select which fields to clear below.
        </p>
      </div>

      {removed && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <CheckCircle size={14} style={{ color: "#10b981" }} />
          <p style={{ fontSize: 12, color: "#34d399" }}>Metadata successfully removed</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {selectedFields.size} of {fieldsWithValue.length} selected
        </span>
        <div className="flex gap-2">
          <button style={{ ...btnStyle, padding: "3px 8px", fontSize: 11 }} onClick={selectAll}>
            Select All
          </button>
          <button style={{ ...btnStyle, padding: "3px 8px", fontSize: 11 }} onClick={deselectAll}>
            Deselect
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {fields.map((f) => {
          const Icon = f.icon;
          const hasValue = f.value && f.value.trim() !== "";
          return (
            <label
              key={f.key}
              className="flex items-center gap-3 px-3 py-2 rounded-md"
              style={{
                backgroundColor: selectedFields.has(f.key) ? "rgba(239,68,68,0.08)" : "var(--card)",
                border: "1px solid var(--border)",
                cursor: hasValue ? "pointer" : "default",
                opacity: hasValue ? 1 : 0.5,
              }}
            >
              <input
                type="checkbox"
                checked={selectedFields.has(f.key)}
                onChange={() => toggleField(f.key)}
                disabled={!hasValue}
                style={checkboxStyle}
              />
              <Icon size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{f.label}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hasValue ? f.value : "—"}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <button
        style={selectedFields.size > 0 ? btnDangerStyle : { ...btnStyle, opacity: 0.5, cursor: "not-allowed" }}
        disabled={selectedFields.size === 0}
        onClick={handleRemove}
      >
        <Trash2 size={14} />
        Remove Selected Metadata ({selectedFields.size})
      </button>
    </div>
  );
}
