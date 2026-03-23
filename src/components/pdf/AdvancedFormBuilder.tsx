"use client";

import React, { useState } from "react";
import {
  Type,
  CheckSquare,
  CircleDot,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  PenTool,
  Plus,
  Trash2,
  Settings,
  ArrowUpDown,
  Download,
  Upload,
  Hash,
  ToggleLeft,
  ToggleRight,
  Square,
  AlertCircle,
  Calculator,
  FileText,
  List,
  MousePointer,
  X,
  GripVertical,
  Eye,
  Lock,
  Copy,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FormFieldDef {
  id: string;
  type: "text" | "checkbox" | "radio" | "dropdown" | "listbox" | "button" | "signature" | "date";
  name: string;
  label: string;
  tooltip: string;
  required: boolean;
  readOnly: boolean;
  defaultValue: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  tabOrder: number;
  options: string[];
  // Validation
  validation: {
    enabled: boolean;
    type: "none" | "range" | "regex" | "custom";
    min: string;
    max: string;
    pattern: string;
    customScript: string;
    errorMessage: string;
  };
  // Format
  format: {
    type: "none" | "number" | "date" | "percentage" | "custom";
    decimalPlaces: number;
    dateFormat: string;
    prefix: string;
    suffix: string;
    customFormat: string;
  };
  // Calculate
  calculate: {
    enabled: boolean;
    operation: "none" | "sum" | "product" | "average" | "min" | "max" | "custom";
    fieldRefs: string[];
    customScript: string;
  };
}

interface AdvancedFormBuilderProps {
  fields: FormFieldDef[];
  onFieldsChange: (fields: FormFieldDef[]) => void;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  currentPage: number;
  totalPages: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const FIELD_TYPES: { type: FormFieldDef["type"]; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text Field", icon: Type },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "radio", label: "Radio Button", icon: CircleDot },
  { type: "dropdown", label: "Dropdown", icon: ChevronDown },
  { type: "listbox", label: "List Box", icon: List },
  { type: "button", label: "Button", icon: MousePointer },
  { type: "signature", label: "Signature", icon: PenTool },
  { type: "date", label: "Date Field", icon: CalendarDays },
];

const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "MMM DD, YYYY", "DD MMM YYYY"];

// ─── Styles ─────────────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "5px 10px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 11,
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
  borderRadius: 4,
  padding: "5px 8px",
  fontSize: 11,
  outline: "none",
  width: "100%",
};

const sectionHeader: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  marginBottom: 4,
  marginTop: 10,
  display: "flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  userSelect: "none",
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "6px 0",
  textAlign: "center",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: active ? "var(--primary)" : "var(--card)",
  color: active ? "var(--primary-foreground)" : "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  transition: "background-color 0.15s",
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createDefaultField(type: FormFieldDef["type"], page: number, tabOrder: number): FormFieldDef {
  const fieldNames: Record<string, string> = {
    text: "text_field",
    checkbox: "checkbox",
    radio: "radio_group",
    dropdown: "dropdown",
    listbox: "listbox",
    button: "button",
    signature: "signature",
    date: "date_field",
  };

  const fieldLabels: Record<string, string> = {
    text: "Text Field",
    checkbox: "Checkbox",
    radio: "Radio Button",
    dropdown: "Dropdown",
    listbox: "List Box",
    button: "Submit",
    signature: "Signature",
    date: "Date",
  };

  return {
    id: uid(),
    type,
    name: `${fieldNames[type]}_${uid().slice(0, 4)}`,
    label: fieldLabels[type] || "Field",
    tooltip: "",
    required: false,
    readOnly: false,
    defaultValue: "",
    page,
    x: 50,
    y: 100 + tabOrder * 40,
    width: type === "button" ? 100 : 180,
    height: type === "signature" ? 60 : 28,
    tabOrder,
    options: type === "radio" || type === "dropdown" || type === "listbox" ? ["Option 1", "Option 2", "Option 3"] : [],
    validation: {
      enabled: false,
      type: "none",
      min: "",
      max: "",
      pattern: "",
      customScript: "",
      errorMessage: "Invalid value",
    },
    format: {
      type: "none",
      decimalPlaces: 2,
      dateFormat: "MM/DD/YYYY",
      prefix: "",
      suffix: "",
      customFormat: "",
    },
    calculate: {
      enabled: false,
      operation: "none",
      fieldRefs: [],
      customScript: "",
    },
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdvancedFormBuilder({
  fields,
  onFieldsChange,
  selectedFieldId,
  onSelectField,
  currentPage,
  totalPages,
}: AdvancedFormBuilderProps) {
  const [propertyTab, setPropertyTab] = useState<"general" | "validate" | "format" | "calculate">("general");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [newOptionText, setNewOptionText] = useState("");
  const [showTabOrder, setShowTabOrder] = useState(false);
  const [dragFieldId, setDragFieldId] = useState<string | null>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const toggleSection = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const addField = (type: FormFieldDef["type"]) => {
    const newField = createDefaultField(type, currentPage, fields.length);
    onFieldsChange([...fields, newField]);
    onSelectField(newField.id);
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) onSelectField(null);
  };

  const duplicateField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    const newField = { ...field, id: uid(), name: `${field.name}_copy`, y: field.y + 40, tabOrder: fields.length };
    onFieldsChange([...fields, newField]);
    onSelectField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormFieldDef>) => {
    onFieldsChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const updateValidation = (id: string, updates: Partial<FormFieldDef["validation"]>) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    updateField(id, { validation: { ...field.validation, ...updates } });
  };

  const updateFormat = (id: string, updates: Partial<FormFieldDef["format"]>) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    updateField(id, { format: { ...field.format, ...updates } });
  };

  const updateCalculate = (id: string, updates: Partial<FormFieldDef["calculate"]>) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    updateField(id, { calculate: { ...field.calculate, ...updates } });
  };

  const addOption = (id: string) => {
    if (!newOptionText.trim()) return;
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    updateField(id, { options: [...field.options, newOptionText.trim()] });
    setNewOptionText("");
  };

  const removeOption = (id: string, index: number) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    updateField(id, { options: field.options.filter((_, i) => i !== index) });
  };

  const moveFieldInOrder = (id: string, direction: "up" | "down") => {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const updated = [...fields];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((f, i) => (f.tabOrder = i));
    onFieldsChange(updated);
  };

  const handleExport = (format: "xml" | "fdf") => {
    const data = fields.map((f) => ({
      name: f.name,
      type: f.type,
      value: f.defaultValue,
      page: f.page,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-data.${format === "xml" ? "xml" : "fdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xml,.fdf,.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (Array.isArray(data)) {
            const importedFields = data.map((d: Record<string, unknown>, i: number) =>
              createDefaultField(
                (d.type as FormFieldDef["type"]) || "text",
                (d.page as number) || currentPage,
                fields.length + i
              )
            );
            onFieldsChange([...fields, ...importedFields]);
          }
        } catch {
          // Invalid file format
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const fieldsOnPage = fields.filter((f) => f.page === currentPage);

  return (
    <div
      style={{
        width: 300,
        height: "100%",
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
          Form Builder
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setShowTabOrder(!showTabOrder)}
            title="Tab Order"
            style={{
              ...btnStyle,
              padding: "3px 6px",
              backgroundColor: showTabOrder ? "var(--primary)" : "var(--card)",
              color: showTabOrder ? "var(--primary-foreground)" : "var(--card-foreground)",
            }}
          >
            <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {/* ── Add Fields ── */}
        <div style={sectionHeader} onClick={() => toggleSection("addField")}>
          {collapsed["addField"] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          <Plus size={12} /> Add Field
        </div>
        {!collapsed["addField"] && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
            {FIELD_TYPES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                style={{
                  ...btnStyle,
                  flexDirection: "column",
                  padding: "8px 4px",
                  fontSize: 10,
                  justifyContent: "center",
                }}
              >
                <ft.icon size={16} />
                {ft.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Import / Export ── */}
        <div style={sectionHeader} onClick={() => toggleSection("importExport")}>
          {collapsed["importExport"] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          <FileText size={12} /> Import / Export
        </div>
        {!collapsed["importExport"] && (
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            <button style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 10 }} onClick={handleImport}>
              <Upload size={12} /> Import
            </button>
            <button style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 10 }} onClick={() => handleExport("xml")}>
              <Download size={12} /> XML
            </button>
            <button style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 10 }} onClick={() => handleExport("fdf")}>
              <Download size={12} /> FDF
            </button>
          </div>
        )}

        {/* ── Field List ── */}
        <div style={sectionHeader}>
          <List size={12} /> Fields on Page {currentPage} ({fieldsOnPage.length})
        </div>

        {fieldsOnPage.length === 0 && (
          <div
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              padding: 12,
              textAlign: "center",
              backgroundColor: "var(--background)",
              borderRadius: 6,
            }}
          >
            No fields on this page. Click a field type above to add one.
          </div>
        )}

        {(showTabOrder ? [...fieldsOnPage].sort((a, b) => a.tabOrder - b.tabOrder) : fieldsOnPage).map((field) => {
          const FieldIcon = FIELD_TYPES.find((ft) => ft.type === field.type)?.icon || Type;
          const isSelected = selectedFieldId === field.id;

          return (
            <div
              key={field.id}
              onClick={() => onSelectField(field.id)}
              style={{
                padding: "6px 8px",
                marginBottom: 4,
                border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: 6,
                backgroundColor: isSelected ? "var(--muted)" : "var(--card)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {showTabOrder && (
                  <span style={{ fontSize: 9, color: "var(--muted-foreground)", fontWeight: 700, minWidth: 16 }}>
                    #{field.tabOrder}
                  </span>
                )}
                <FieldIcon size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {field.label}
                </span>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {field.required && <AlertCircle size={10} style={{ color: "#ef4444" }} />}
                  {field.readOnly && <Lock size={10} style={{ color: "var(--muted-foreground)" }} />}
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                    style={{ ...btnStyle, padding: 2, border: "none", fontSize: 10 }}
                    title="Duplicate"
                  >
                    <Copy size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                    style={{ ...btnStyle, padding: 2, border: "none", color: "#ef4444", fontSize: 10 }}
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 9, color: "var(--muted-foreground)", marginTop: 2 }}>
                {field.type} | {field.name}
              </div>

              {showTabOrder && isSelected && (
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveFieldInOrder(field.id, "up"); }}
                    style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 9, padding: "2px 4px" }}
                  >
                    Move Up
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveFieldInOrder(field.id, "down"); }}
                    style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 9, padding: "2px 4px" }}
                  >
                    Move Down
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Selected Field Properties ── */}
        {selectedField && (
          <>
            <div style={{ height: 1, backgroundColor: "var(--border)", margin: "10px 0" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <Settings size={14} />
              Field Properties
            </div>

            {/* Property Tabs */}
            <div style={{ display: "flex", marginBottom: 8 }}>
              <button style={tabBtn(propertyTab === "general")} onClick={() => setPropertyTab("general")}>
                <Settings size={10} /> General
              </button>
              <button style={tabBtn(propertyTab === "validate")} onClick={() => setPropertyTab("validate")}>
                <AlertCircle size={10} /> Validate
              </button>
              <button style={tabBtn(propertyTab === "format")} onClick={() => setPropertyTab("format")}>
                <Hash size={10} /> Format
              </button>
              <button style={tabBtn(propertyTab === "calculate")} onClick={() => setPropertyTab("calculate")}>
                <Calculator size={10} /> Calculate
              </button>
            </div>

            {/* ── General Tab ── */}
            {propertyTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Field Name</label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Label</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Tooltip</label>
                  <input
                    type="text"
                    value={selectedField.tooltip}
                    onChange={(e) => updateField(selectedField.id, { tooltip: e.target.value })}
                    placeholder="Help text shown on hover"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Default Value</label>
                  <input
                    type="text"
                    value={selectedField.defaultValue}
                    onChange={(e) => updateField(selectedField.id, { defaultValue: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Toggles */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11 }}
                    onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                  >
                    {selectedField.required ? (
                      <ToggleRight size={16} style={{ color: "var(--primary)" }} />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                    Required
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11 }}
                    onClick={() => updateField(selectedField.id, { readOnly: !selectedField.readOnly })}
                  >
                    {selectedField.readOnly ? (
                      <ToggleRight size={16} style={{ color: "var(--primary)" }} />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                    Read-only
                  </div>
                </div>

                {/* Position / Size */}
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", marginTop: 4 }}>POSITION & SIZE</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: "var(--muted-foreground)" }}>X</label>
                    <input type="number" value={selectedField.x} onChange={(e) => updateField(selectedField.id, { x: Number(e.target.value) })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: "var(--muted-foreground)" }}>Y</label>
                    <input type="number" value={selectedField.y} onChange={(e) => updateField(selectedField.id, { y: Number(e.target.value) })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: "var(--muted-foreground)" }}>W</label>
                    <input type="number" value={selectedField.width} onChange={(e) => updateField(selectedField.id, { width: Number(e.target.value) })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: "var(--muted-foreground)" }}>H</label>
                    <input type="number" value={selectedField.height} onChange={(e) => updateField(selectedField.id, { height: Number(e.target.value) })} style={inputStyle} />
                  </div>
                </div>

                {/* Options for radio/dropdown/listbox */}
                {(selectedField.type === "radio" || selectedField.type === "dropdown" || selectedField.type === "listbox") && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", marginTop: 4 }}>OPTIONS</div>
                    {selectedField.options.map((opt, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, flex: 1, padding: "2px 6px", backgroundColor: "var(--background)", borderRadius: 4 }}>
                          {opt}
                        </span>
                        <button
                          onClick={() => removeOption(selectedField.id, i)}
                          style={{ ...btnStyle, padding: 2, border: "none", color: "#ef4444" }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="text"
                        value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        placeholder="New option"
                        style={{ ...inputStyle, flex: 1 }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addOption(selectedField.id);
                        }}
                      />
                      <button style={{ ...btnStyle, padding: "4px 8px" }} onClick={() => addOption(selectedField.id)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Validate Tab ── */}
            {propertyTab === "validate" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11 }}
                  onClick={() => updateValidation(selectedField.id, { enabled: !selectedField.validation.enabled })}
                >
                  {selectedField.validation.enabled ? (
                    <ToggleRight size={16} style={{ color: "var(--primary)" }} />
                  ) : (
                    <ToggleLeft size={16} />
                  )}
                  Enable Validation
                </div>

                {selectedField.validation.enabled && (
                  <>
                    <div>
                      <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Type</label>
                      <select
                        value={selectedField.validation.type}
                        onChange={(e) => updateValidation(selectedField.id, { type: e.target.value as FormFieldDef["validation"]["type"] })}
                        style={inputStyle}
                      >
                        <option value="none">None</option>
                        <option value="range">Range</option>
                        <option value="regex">Regular Expression</option>
                        <option value="custom">Custom Script</option>
                      </select>
                    </div>

                    {selectedField.validation.type === "range" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Min</label>
                          <input
                            type="text"
                            value={selectedField.validation.min}
                            onChange={(e) => updateValidation(selectedField.id, { min: e.target.value })}
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Max</label>
                          <input
                            type="text"
                            value={selectedField.validation.max}
                            onChange={(e) => updateValidation(selectedField.id, { max: e.target.value })}
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    )}

                    {selectedField.validation.type === "regex" && (
                      <div>
                        <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Pattern</label>
                        <input
                          type="text"
                          value={selectedField.validation.pattern}
                          onChange={(e) => updateValidation(selectedField.id, { pattern: e.target.value })}
                          placeholder="e.g. ^[a-zA-Z]+$"
                          style={{ ...inputStyle, fontFamily: "monospace" }}
                        />
                      </div>
                    )}

                    {selectedField.validation.type === "custom" && (
                      <div>
                        <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Custom Script</label>
                        <textarea
                          value={selectedField.validation.customScript}
                          onChange={(e) => updateValidation(selectedField.id, { customScript: e.target.value })}
                          placeholder="// Return true if valid"
                          rows={4}
                          style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Error Message</label>
                      <input
                        type="text"
                        value={selectedField.validation.errorMessage}
                        onChange={(e) => updateValidation(selectedField.id, { errorMessage: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Format Tab ── */}
            {propertyTab === "format" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Format Type</label>
                  <select
                    value={selectedField.format.type}
                    onChange={(e) => updateFormat(selectedField.id, { type: e.target.value as FormFieldDef["format"]["type"] })}
                    style={inputStyle}
                  >
                    <option value="none">None</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="percentage">Percentage</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {selectedField.format.type === "number" && (
                  <>
                    <div>
                      <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Decimal Places</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={selectedField.format.decimalPlaces}
                        onChange={(e) => updateFormat(selectedField.id, { decimalPlaces: Number(e.target.value) })}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Prefix</label>
                        <input
                          type="text"
                          value={selectedField.format.prefix}
                          onChange={(e) => updateFormat(selectedField.id, { prefix: e.target.value })}
                          placeholder="e.g. $"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Suffix</label>
                        <input
                          type="text"
                          value={selectedField.format.suffix}
                          onChange={(e) => updateFormat(selectedField.id, { suffix: e.target.value })}
                          placeholder="e.g. USD"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedField.format.type === "date" && (
                  <div>
                    <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Date Format</label>
                    <select
                      value={selectedField.format.dateFormat}
                      onChange={(e) => updateFormat(selectedField.id, { dateFormat: e.target.value })}
                      style={inputStyle}
                    >
                      {DATE_FORMATS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedField.format.type === "custom" && (
                  <div>
                    <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Custom Format</label>
                    <input
                      type="text"
                      value={selectedField.format.customFormat}
                      onChange={(e) => updateFormat(selectedField.id, { customFormat: e.target.value })}
                      placeholder="Custom format string"
                      style={{ ...inputStyle, fontFamily: "monospace" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Calculate Tab ── */}
            {propertyTab === "calculate" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11 }}
                  onClick={() => updateCalculate(selectedField.id, { enabled: !selectedField.calculate.enabled })}
                >
                  {selectedField.calculate.enabled ? (
                    <ToggleRight size={16} style={{ color: "var(--primary)" }} />
                  ) : (
                    <ToggleLeft size={16} />
                  )}
                  Enable Calculation
                </div>

                {selectedField.calculate.enabled && (
                  <>
                    <div>
                      <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Operation</label>
                      <select
                        value={selectedField.calculate.operation}
                        onChange={(e) => updateCalculate(selectedField.id, { operation: e.target.value as FormFieldDef["calculate"]["operation"] })}
                        style={inputStyle}
                      >
                        <option value="none">None</option>
                        <option value="sum">Sum</option>
                        <option value="product">Product</option>
                        <option value="average">Average</option>
                        <option value="min">Minimum</option>
                        <option value="max">Maximum</option>
                        <option value="custom">Custom Script</option>
                      </select>
                    </div>

                    {selectedField.calculate.operation !== "none" && selectedField.calculate.operation !== "custom" && (
                      <div>
                        <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                          Source Fields (select fields to calculate from)
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 120, overflowY: "auto" }}>
                          {fields
                            .filter((f) => f.id !== selectedField.id && (f.type === "text" || f.type === "date"))
                            .map((f) => {
                              const isRef = selectedField.calculate.fieldRefs.includes(f.name);
                              return (
                                <div
                                  key={f.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    cursor: "pointer",
                                    fontSize: 11,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    backgroundColor: isRef ? "var(--muted)" : "transparent",
                                  }}
                                  onClick={() => {
                                    const refs = isRef
                                      ? selectedField.calculate.fieldRefs.filter((r) => r !== f.name)
                                      : [...selectedField.calculate.fieldRefs, f.name];
                                    updateCalculate(selectedField.id, { fieldRefs: refs });
                                  }}
                                >
                                  {isRef ? <CheckSquare size={12} style={{ color: "var(--primary)" }} /> : <Square size={12} />}
                                  {f.label} ({f.name})
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {selectedField.calculate.operation === "custom" && (
                      <div>
                        <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Custom Script</label>
                        <textarea
                          value={selectedField.calculate.customScript}
                          onChange={(e) => updateCalculate(selectedField.id, { customScript: e.target.value })}
                          placeholder="// Return calculated value"
                          rows={4}
                          style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderTop: "1px solid var(--border)",
          fontSize: 10,
          color: "var(--muted-foreground)",
        }}
      >
        <span>{fields.length} field{fields.length !== 1 ? "s" : ""} total</span>
        <span>Page {currentPage}/{totalPages}</span>
      </div>
    </div>
  );
}
