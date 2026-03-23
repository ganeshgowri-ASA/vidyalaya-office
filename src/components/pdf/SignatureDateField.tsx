"use client";

import React, { useState } from "react";
import { Calendar, Check, MapPin } from "lucide-react";

interface SignatureDateFieldProps {
  onPlaceDate: (date: string, format: string, x: number, y: number) => void;
  currentPage: number;
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

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
};

const DATE_FORMATS = [
  { id: "iso", label: "YYYY-MM-DD", example: "2026-03-23" },
  { id: "us", label: "MM/DD/YYYY", example: "03/23/2026" },
  { id: "eu", label: "DD/MM/YYYY", example: "23/03/2026" },
  { id: "long", label: "Month DD, YYYY", example: "March 23, 2026" },
  { id: "short", label: "DD-Mon-YYYY", example: "23-Mar-2026" },
];

function formatDate(date: string, format: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => n.toString().padStart(2, "0");

  switch (format) {
    case "iso": return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    case "us": return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    case "eu": return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    case "long": return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    case "short": return `${pad(d.getDate())}-${monthsShort[d.getMonth()]}-${d.getFullYear()}`;
    default: return date;
  }
}

export default function SignatureDateField({ onPlaceDate, currentPage }: SignatureDateFieldProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedFormat, setSelectedFormat] = useState("long");
  const [placed, setPlaced] = useState(false);

  const handlePlace = () => {
    const formatted = formatDate(date, selectedFormat);
    onPlaceDate(formatted, selectedFormat, 300, 500);
    setPlaced(true);
    setTimeout(() => setPlaced(false), 2000);
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Signature Date</span>
      </div>

      <div className="flex flex-col gap-1">
        <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Format</label>
        <div className="flex flex-col gap-1">
          {DATE_FORMATS.map((f) => (
            <label
              key={f.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded"
              style={{
                backgroundColor: selectedFormat === f.id ? "var(--accent)" : "transparent",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              <input
                type="radio"
                name="dateFormat"
                checked={selectedFormat === f.id}
                onChange={() => setSelectedFormat(f.id)}
                style={{ accentColor: "var(--primary)" }}
              />
              <span style={{ color: "var(--foreground)" }}>{f.label}</span>
              <span style={{ color: "var(--muted-foreground)", marginLeft: "auto", fontSize: 11 }}>
                {formatDate(date, f.id)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        className="flex items-center justify-center py-3 rounded-md"
        style={{ backgroundColor: "var(--background)", border: "1px dashed var(--border)" }}
      >
        <span style={{ fontSize: 14, fontFamily: "serif", color: "var(--foreground)" }}>
          {formatDate(date, selectedFormat)}
        </span>
      </div>

      <button style={btnPrimaryStyle} onClick={handlePlace}>
        {placed ? (
          <>
            <Check size={14} /> Placed on Page {currentPage}
          </>
        ) : (
          <>
            <MapPin size={14} /> Place Date on Page {currentPage}
          </>
        )}
      </button>
    </div>
  );
}
