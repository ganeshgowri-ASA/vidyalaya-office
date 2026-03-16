"use client";

import React, { useState } from "react";
import { X, FilePlus2 } from "lucide-react";
import { btnPrimaryStyle, inputStyle } from "./types";

interface CreateBlankModalProps {
  onCreateBlank: (pageSize: string, orientation: string, pageCount: number) => void;
  onClose: () => void;
}

export default function CreateBlankModal({ onCreateBlank, onClose }: CreateBlankModalProps) {
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [pageCount, setPageCount] = useState(1);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          width: 380,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <FilePlus2 size={18} /> Create Blank PDF
          </h3>
          <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Page Size</label>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={inputStyle}>
            <option value="a4">A4 (210 × 297 mm)</option>
            <option value="letter">Letter (8.5 × 11 in)</option>
            <option value="legal">Legal (8.5 × 14 in)</option>
            <option value="a3">A3 (297 × 420 mm)</option>
            <option value="a5">A5 (148 × 210 mm)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Orientation</label>
          <div className="flex gap-2">
            <button
              style={{
                ...inputStyle,
                flex: 1,
                textAlign: "center" as const,
                cursor: "pointer",
                backgroundColor: orientation === "portrait" ? "var(--primary)" : "var(--card)",
                color: orientation === "portrait" ? "var(--primary-foreground)" : "var(--card-foreground)",
              }}
              onClick={() => setOrientation("portrait")}
            >
              Portrait
            </button>
            <button
              style={{
                ...inputStyle,
                flex: 1,
                textAlign: "center" as const,
                cursor: "pointer",
                backgroundColor: orientation === "landscape" ? "var(--primary)" : "var(--card)",
                color: orientation === "landscape" ? "var(--primary-foreground)" : "var(--card-foreground)",
              }}
              onClick={() => setOrientation("landscape")}
            >
              Landscape
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Number of Pages</label>
          <input
            type="number"
            value={pageCount}
            onChange={(e) => setPageCount(Math.max(1, Math.min(100, Number(e.target.value))))}
            style={inputStyle}
            min={1}
            max={100}
          />
        </div>

        <button style={btnPrimaryStyle} onClick={() => onCreateBlank(pageSize, orientation, pageCount)}>
          <FilePlus2 size={16} /> Create Document
        </button>
      </div>
    </div>
  );
}
