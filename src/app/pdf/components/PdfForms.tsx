"use client";

import React, { useState } from "react";
import {
  FormInput, CheckSquare, Circle, ChevronDown, X, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, List, Calendar, Pencil, Eye, Wrench,
} from "lucide-react";

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 13, transition: "background-color 0.15s",
};
const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle, backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};
const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px",
  fontSize: 13, outline: "none",
};

interface FormField {
  id: string;
  type: "text-input" | "checkbox" | "radio" | "dropdown" | "signature" | "date-picker";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  options?: string[];
  required?: boolean;
  value?: string;
}

interface PdfFormsProps {
  pdfLoaded: boolean;
  formFields: FormField[];
  onAddField: (type: FormField["type"]) => void;
  onRemoveField: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  mainCanvasRef: React.RefObject<HTMLCanvasElement>;
  fieldValues: Record<string, string>;
  onFieldValueChange: (id: string, value: string) => void;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function PdfForms({
  pdfLoaded, formFields, onAddField, onRemoveField, currentPage, totalPages,
  onPageChange, mainCanvasRef, fieldValues, onFieldValueChange,
}: PdfFormsProps) {
  const [mode, setMode] = useState<"fill" | "build">("build");

  if (!pdfLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p style={{ color: "var(--muted-foreground)" }}>Please load a PDF in the View tab first.</p>
      </div>
    );
  }

  const fieldTypes: { type: FormField["type"]; label: string; icon: React.ElementType }[] = [
    { type: "text-input", label: "Text Field", icon: FormInput },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "radio", label: "Radio Button", icon: Circle },
    { type: "dropdown", label: "Dropdown", icon: ChevronDown },
    { type: "date-picker", label: "Date Picker", icon: Calendar },
    { type: "signature", label: "Signature", icon: Pencil },
  ];

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text-input": return <FormInput size={12} />;
      case "checkbox": return <CheckSquare size={12} />;
      case "radio": return <Circle size={12} />;
      case "dropdown": return <ChevronDown size={12} />;
      case "date-picker": return <Calendar size={12} />;
      case "signature": return <Pencil size={12} />;
      default: return <FormInput size={12} />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Form sidebar */}
      <div className="flex flex-col gap-3 p-3 overflow-y-auto"
        style={{ width: 280, backgroundColor: "var(--card)", borderRight: "1px solid var(--border)" }}>

        {/* Mode toggle */}
        <div className="flex gap-1">
          <button onClick={() => setMode("fill")}
            style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 12,
              backgroundColor: mode === "fill" ? "var(--primary)" : "var(--card)",
              color: mode === "fill" ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
            <Eye size={14} /> Fill Form
          </button>
          <button onClick={() => setMode("build")}
            style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 12,
              backgroundColor: mode === "build" ? "var(--primary)" : "var(--card)",
              color: mode === "build" ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
            <Wrench size={14} /> Build Form
          </button>
        </div>

        {mode === "build" ? (
          <>
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Add Form Fields
            </h3>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Add form elements to page {currentPage}.
            </p>
            {fieldTypes.map(({ type, label, icon: Icon }) => (
              <button key={type} style={{ ...btnStyle, width: "100%", justifyContent: "flex-start" }}
                onClick={() => onAddField(type)}>
                <Icon size={16} /> Add {label}
              </button>
            ))}

            <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Fields ({formFields.length})
            </h3>
            {formFields.length === 0 ? (
              <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>No fields added yet.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {formFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 px-2 py-1"
                    style={{ backgroundColor: "var(--secondary)", borderRadius: 4, fontSize: 11 }}>
                    {getFieldIcon(field.type)}
                    <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>{field.label}</span>
                    <span style={{ fontSize: 9, color: "var(--muted-foreground)" }}>p.{field.page}</span>
                    <button onClick={() => onRemoveField(field.id)}
                      style={{ border: "none", background: "none", cursor: "pointer", padding: 1 }}>
                      <X size={10} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Fill Form Fields
            </h3>
            {formFields.length === 0 ? (
              <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                No form fields detected. Switch to Build mode to add fields.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {formFields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {getFieldIcon(field.type)} {field.label}
                      {field.required && <span style={{ color: "#dc2626" }}> *</span>}
                    </label>
                    {field.type === "text-input" && (
                      <input type="text" value={fieldValues[field.id] ?? ""} placeholder={field.label}
                        onChange={(e) => onFieldValueChange(field.id, e.target.value)} style={inputStyle} />
                    )}
                    {field.type === "checkbox" && (
                      <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12 }}>
                        <input type="checkbox" checked={fieldValues[field.id] === "true"}
                          onChange={(e) => onFieldValueChange(field.id, e.target.checked ? "true" : "false")} />
                        {field.label}
                      </label>
                    )}
                    {field.type === "radio" && field.options && (
                      <div className="flex flex-col gap-1">
                        {field.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12 }}>
                            <input type="radio" name={field.id} value={opt}
                              checked={fieldValues[field.id] === opt}
                              onChange={() => onFieldValueChange(field.id, opt)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {field.type === "dropdown" && (
                      <select value={fieldValues[field.id] ?? ""} onChange={(e) => onFieldValueChange(field.id, e.target.value)} style={inputStyle}>
                        <option value="">Select...</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === "date-picker" && (
                      <input type="date" value={fieldValues[field.id] ?? ""}
                        onChange={(e) => onFieldValueChange(field.id, e.target.value)} style={inputStyle} />
                    )}
                    {field.type === "signature" && (
                      <div style={{ height: 40, border: "1px dashed var(--border)", borderRadius: 4,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--muted-foreground)" }}>
                        Click to sign
                      </div>
                    )}
                  </div>
                ))}
                <button style={btnPrimaryStyle}>Submit Form</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2"
          style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
          <button style={btnStyle} onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>Page {currentPage} / {totalPages}</span>
          <button style={btnStyle} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ backgroundColor: "var(--muted)" }}>
          <div className="relative inline-block" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <canvas ref={mainCanvasRef} style={{ display: "block" }} />
            {formFields.filter((f) => f.page === currentPage).map((field) => (
              <div key={field.id} className="absolute flex items-center justify-center"
                style={{ left: field.x, top: field.y, width: field.width, height: field.height,
                  border: "2px dashed var(--primary)", borderRadius: 4,
                  backgroundColor: "rgba(59, 130, 246, 0.08)", fontSize: 10, color: "var(--primary)" }}>
                <div className="flex items-center gap-1 px-1">
                  {getFieldIcon(field.type)}
                  <span>{field.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FormField };
