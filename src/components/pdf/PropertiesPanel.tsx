"use client";

import React from "react";
import { X, FileText, Info } from "lucide-react";
import type { DocumentProperties } from "./types";
import { btnStyle, inputStyle, formatBytes } from "./types";

interface PropertiesPanelProps {
  properties: DocumentProperties;
  onUpdate: (props: Partial<DocumentProperties>) => void;
  onClose: () => void;
}

export default function PropertiesPanel({ properties, onUpdate, onClose }: PropertiesPanelProps) {
  return (
    <div
      className="flex flex-col gap-3 p-3 overflow-y-auto"
      style={{
        width: 280,
        backgroundColor: "var(--card)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <Info size={16} /> Properties
        </h3>
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Document info */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Document Info
        </h4>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Title</label>
          <input
            type="text"
            value={properties.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            style={{ ...inputStyle, fontSize: 12 }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Author</label>
          <input
            type="text"
            value={properties.author}
            onChange={(e) => onUpdate({ author: e.target.value })}
            style={{ ...inputStyle, fontSize: 12 }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Subject</label>
          <input
            type="text"
            value={properties.subject}
            onChange={(e) => onUpdate({ subject: e.target.value })}
            style={{ ...inputStyle, fontSize: 12 }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Keywords</label>
          <input
            type="text"
            value={properties.keywords}
            onChange={(e) => onUpdate({ keywords: e.target.value })}
            style={{ ...inputStyle, fontSize: 12 }}
            placeholder="Comma-separated keywords"
          />
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: "var(--border)" }} />

      {/* Metadata (read-only) */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Metadata
        </h4>

        <div className="flex flex-col gap-2" style={{ fontSize: 11 }}>
          <div className="flex justify-between">
            <span style={{ color: "var(--muted-foreground)" }}>Pages</span>
            <span style={{ color: "var(--foreground)" }}>{properties.pageCount}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--muted-foreground)" }}>File Size</span>
            <span style={{ color: "var(--foreground)" }}>{formatBytes(properties.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--muted-foreground)" }}>Creator</span>
            <span style={{ color: "var(--foreground)" }}>{properties.creator || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--muted-foreground)" }}>Producer</span>
            <span style={{ color: "var(--foreground)" }}>{properties.producer || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--muted-foreground)" }}>Created</span>
            <span style={{ color: "var(--foreground)" }}>{properties.creationDate || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--muted-foreground)" }}>Modified</span>
            <span style={{ color: "var(--foreground)" }}>{properties.modDate || "—"}</span>
          </div>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: "var(--border)" }} />

      <button style={{ ...btnStyle, justifyContent: "center", fontSize: 12 }}>
        <FileText size={14} /> Apply Metadata Changes
      </button>
    </div>
  );
}
