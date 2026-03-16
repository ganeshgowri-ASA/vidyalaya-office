"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckSquare,
  CircleDot,
  ChevronDown,
  CalendarDays,
  PenTool,
  Plus,
  Trash2,
  Eye,
  Send,
  Download,
  ToggleLeft,
  ToggleRight,
  Type,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle, FormField } from "./types";

/* ── props ────────────────────────────────────────────────────────────────── */

interface FormFillingPanelProps {
  mode: "fill" | "build";
  onModeChange: (m: "fill" | "build") => void;
  formFields: FormField[];
  onAddField: (type: string) => void;
  onRemoveField: (id: string) => void;
  onFieldValueChange: (id: string, value: string) => void;
  fieldValues: Record<string, string>;
  currentPage: number;
}

/* ── helpers ──────────────────────────────────────────────────────────────── */

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "8px 0",
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: active ? "var(--primary)" : "var(--card)",
  color: active ? "var(--primary-foreground)" : "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  transition: "background-color 0.15s",
});

const fieldTypeIcon: Record<string, React.ElementType> = {
  "text-input": Type,
  checkbox: CheckSquare,
  radio: CircleDot,
  dropdown: ChevronDown,
  "date-picker": CalendarDays,
  signature: PenTool,
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  marginBottom: 6,
  marginTop: 10,
};

/* ── component ────────────────────────────────────────────────────────────── */

export default function FormFillingPanel(props: FormFillingPanelProps) {
  const {
    mode,
    onModeChange,
    formFields,
    onAddField,
    onRemoveField,
    onFieldValueChange,
    fieldValues,
    currentPage,
  } = props;

  const [preview, setPreview] = useState(false);
  const [editingOptions, setEditingOptions] = useState<string | null>(null);
  const [optionText, setOptionText] = useState("");

  const fieldsOnPage = formFields.filter((f) => f.page === currentPage);

  /* ── Fill Mode ──────────────────────────────────────────────────────── */
  const renderFillMode = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--muted-foreground)",
          padding: "8px",
          backgroundColor: "var(--accent)",
          borderRadius: 6,
        }}
      >
        {formFields.length === 0
          ? "No form fields detected. Upload a PDF with form fields or switch to Build mode."
          : `${formFields.length} form field(s) detected across all pages.`}
      </div>

      {fieldsOnPage.length > 0 && (
        <div style={sectionHeaderStyle}>
          Fields on Page {currentPage + 1}
        </div>
      )}

      {fieldsOnPage.map((field) => {
        const Icon = fieldTypeIcon[field.type] || FileText;
        const val = fieldValues[field.id] ?? field.value ?? "";

        return (
          <div
            key={field.id}
            style={{
              padding: 8,
              border: "1px solid var(--border)",
              borderRadius: 6,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              <Icon size={14} />
              {field.label}
              {field.required && (
                <span style={{ color: "#ef4444", fontSize: 11 }}>*</span>
              )}
            </div>

            {field.type === "text-input" && (
              <input
                type="text"
                value={val}
                onChange={(e) => onFieldValueChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label}`}
                style={{ ...inputStyle, width: "100%" }}
              />
            )}

            {field.type === "checkbox" && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={val === "true"}
                  onChange={(e) =>
                    onFieldValueChange(
                      field.id,
                      e.target.checked ? "true" : "false"
                    )
                  }
                />
                {field.label}
              </label>
            )}

            {field.type === "radio" && field.options && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {field.options.map((opt) => (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      checked={val === opt}
                      onChange={() => onFieldValueChange(field.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.type === "dropdown" && (
              <select
                value={val}
                onChange={(e) => onFieldValueChange(field.id, e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              >
                <option value="">Select...</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "date-picker" && (
              <input
                type="date"
                value={val}
                onChange={(e) => onFieldValueChange(field.id, e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            )}

            {field.type === "signature" && (
              <div
                style={{
                  width: "100%",
                  height: 60,
                  border: "2px dashed var(--border)",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                }}
                onClick={() => onFieldValueChange(field.id, "__signature__")}
              >
                {val ? "Signature placed" : "Click to sign"}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
        <button
          style={{ ...btnPrimaryStyle, flex: 1, justifyContent: "center" }}
        >
          <Send size={14} /> Submit Form
        </button>
        <button style={{ ...btnStyle, flex: 1, justifyContent: "center" }}>
          <Download size={14} /> Export
        </button>
      </div>
    </div>
  );

  /* ── Build Mode ─────────────────────────────────────────────────────── */
  const fieldTypes: { type: string; label: string; Icon: React.ElementType }[] =
    [
      { type: "text-input", label: "Text Input", Icon: Type },
      { type: "checkbox", label: "Checkbox", Icon: CheckSquare },
      { type: "radio", label: "Radio Button", Icon: CircleDot },
      { type: "dropdown", label: "Dropdown", Icon: ChevronDown },
      { type: "date-picker", label: "Date Picker", Icon: CalendarDays },
      { type: "signature", label: "Signature", Icon: PenTool },
    ];

  const renderBuildMode = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Add field buttons */}
      <div style={sectionHeaderStyle}>Add Field</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
        }}
      >
        {fieldTypes.map((ft) => (
          <button
            key={ft.type}
            style={{
              ...btnStyle,
              flexDirection: "column",
              padding: "8px 4px",
              fontSize: 10,
              justifyContent: "center",
            }}
            onClick={() => onAddField(ft.type)}
          >
            <ft.Icon size={16} />
            {ft.label}
          </button>
        ))}
      </div>

      {/* Preview toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 8,
          cursor: "pointer",
        }}
        onClick={() => setPreview(!preview)}
      >
        {preview ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        <span style={{ fontSize: 12 }}>Preview Mode</span>
      </div>

      {/* Field list */}
      <div style={sectionHeaderStyle}>
        Fields ({formFields.length})
      </div>

      {formFields.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            padding: 8,
            backgroundColor: "var(--accent)",
            borderRadius: 6,
          }}
        >
          No fields added yet. Click a field type above to add one.
        </div>
      )}

      {formFields.map((field) => {
        const Icon = fieldTypeIcon[field.type] || FileText;

        return (
          <div
            key={field.id}
            style={{
              padding: 8,
              border: "1px solid var(--border)",
              borderRadius: 6,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Icon size={14} />
                {field.label}
              </div>
              <button
                style={{
                  ...btnStyle,
                  padding: "2px 6px",
                  border: "none",
                  color: "#ef4444",
                }}
                onClick={() => onRemoveField(field.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--muted-foreground)",
              }}
            >
              <span>
                Page {field.page + 1} | {field.type}
              </span>
            </div>

            {/* Required toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                cursor: "pointer",
              }}
              onClick={() =>
                onFieldValueChange(
                  field.id,
                  field.required ? "optional" : "required"
                )
              }
            >
              {field.required ? (
                <ToggleRight size={14} style={{ color: "var(--primary)" }} />
              ) : (
                <ToggleLeft size={14} />
              )}
              Required
            </div>

            {/* Dropdown options editor */}
            {field.type === "dropdown" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <label
                  style={{ fontSize: 10, color: "var(--muted-foreground)" }}
                >
                  Options:
                </label>
                {(field.options ?? []).map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      backgroundColor: "var(--accent)",
                      borderRadius: 4,
                    }}
                  >
                    {opt}
                  </div>
                ))}
                {editingOptions === field.id && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="text"
                      value={optionText}
                      onChange={(e) => setOptionText(e.target.value)}
                      placeholder="New option"
                      style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && optionText.trim()) {
                          onFieldValueChange(
                            field.id,
                            `__add_option__${optionText.trim()}`
                          );
                          setOptionText("");
                        }
                      }}
                    />
                    <button
                      style={{ ...btnStyle, padding: "2px 6px", fontSize: 11 }}
                      onClick={() => {
                        if (optionText.trim()) {
                          onFieldValueChange(
                            field.id,
                            `__add_option__${optionText.trim()}`
                          );
                          setOptionText("");
                        }
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
                <button
                  style={{
                    ...btnStyle,
                    fontSize: 10,
                    padding: "2px 6px",
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    setEditingOptions(
                      editingOptions === field.id ? null : field.id
                    )
                  }
                >
                  {editingOptions === field.id
                    ? "Done"
                    : "Edit Options"}
                </button>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div
                style={{
                  padding: 4,
                  border: "1px dashed var(--border)",
                  borderRadius: 4,
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                }}
              >
                {field.type === "text-input" && (
                  <input
                    type="text"
                    placeholder={field.label}
                    disabled
                    style={{ ...inputStyle, width: "100%", fontSize: 11 }}
                  />
                )}
                {field.type === "checkbox" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <input type="checkbox" disabled /> {field.label}
                  </label>
                )}
                {field.type === "radio" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <input type="radio" disabled /> {field.label}
                  </label>
                )}
                {field.type === "dropdown" && (
                  <select disabled style={{ ...inputStyle, width: "100%", fontSize: 11 }}>
                    <option>Select...</option>
                  </select>
                )}
                {field.type === "date-picker" && (
                  <input
                    type="date"
                    disabled
                    style={{ ...inputStyle, width: "100%", fontSize: 11 }}
                  />
                )}
                {field.type === "signature" && (
                  <div
                    style={{
                      height: 40,
                      border: "2px dashed var(--border)",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Signature
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        width: 280,
        height: "100%",
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Mode tabs */}
      <div style={{ display: "flex" }}>
        <button
          style={{
            ...tabStyle(mode === "fill"),
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          onClick={() => onModeChange("fill")}
        >
          Fill Form
        </button>
        <button
          style={{
            ...tabStyle(mode === "build"),
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
          onClick={() => onModeChange("build")}
        >
          Form Builder
        </button>
      </div>

      <div style={{ padding: 12, flex: 1 }}>
        {mode === "fill" ? renderFillMode() : renderBuildMode()}
      </div>
    </div>
  );
}
