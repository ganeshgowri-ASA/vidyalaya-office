"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  FolderOpen,
  Trash2,
  Plus,
  Variable,
} from "lucide-react";
import { useTemplateVariablesStore } from "@/store/template-variables-store";
import type { TemplateVariable } from "@/lib/template-variables";
import { replaceVariables } from "@/lib/template-variables";

export function TemplateVariableModal() {
  const {
    isOpen,
    templateName,
    templateContent,
    variables,
    values,
    presets,
    showPreview,
    setValue,
    autoFill,
    applyVariables,
    closeModal,
    togglePreview,
    savePreset,
    loadPreset,
    deletePreset,
    addCustomVariable,
  } = useTemplateVariablesStore();

  const [presetName, setPresetName] = useState("");
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [showPresetList, setShowPresetList] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customVarName, setCustomVarName] = useState("");
  const [customVarLabel, setCustomVarLabel] = useState("");

  const previewContent = useMemo(() => {
    return replaceVariables(templateContent, values);
  }, [templateContent, values]);

  const filledCount = useMemo(() => {
    return variables.filter((v) => values[v.name]?.trim()).length;
  }, [variables, values]);

  if (!isOpen || variables.length === 0) return null;

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim());
      setPresetName("");
      setShowPresetSave(false);
    }
  };

  const handleAddCustomVariable = () => {
    if (customVarName.trim()) {
      const name = customVarName.trim().toLowerCase().replace(/\s+/g, "_");
      const label =
        customVarLabel.trim() ||
        name
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      const newVar: TemplateVariable = {
        name,
        label,
        defaultValue: "",
        description: `Custom variable: ${label}`,
        type: "text",
      };
      addCustomVariable(templateName, newVar);
      setCustomVarName("");
      setCustomVarLabel("");
      setShowAddCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div
        className="relative mx-4 flex w-full max-w-4xl flex-col rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Variable size={16} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Fill Template Variables
              </h2>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {templateName} &middot; {filledCount}/{variables.length} fields
                filled
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="rounded p-1.5 transition-colors hover:bg-[var(--muted)]"
          >
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-2 border-b px-6 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={autoFill}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Sparkles size={14} />
            AI Auto-Fill
          </button>
          <button
            onClick={togglePreview}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <div className="relative">
            <button
              onClick={() => {
                setShowPresetList(!showPresetList);
                setShowPresetSave(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--muted)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <FolderOpen size={14} />
              Presets
            </button>
            {showPresetList && (
              <div
                className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[var(--muted)]"
                  >
                    <button
                      onClick={() => {
                        loadPreset(p.id);
                        setShowPresetList(false);
                      }}
                      className="flex-1 text-left text-xs"
                      style={{ color: "var(--foreground)" }}
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => deletePreset(p.id)}
                      className="ml-2 rounded p-1 hover:bg-[var(--muted)]"
                    >
                      <Trash2
                        size={12}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </button>
                  </div>
                ))}
                {presets.length === 0 && (
                  <p
                    className="px-3 py-2 text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No presets saved
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setShowPresetSave(!showPresetSave);
              setShowPresetList(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <Save size={14} />
            Save Preset
          </button>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <Plus size={14} />
            Add Variable
          </button>
        </div>

        {/* Save Preset Inline */}
        {showPresetSave && (
          <div
            className="flex items-center gap-2 border-b px-6 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              type="text"
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
              className="flex-1 rounded-md border px-3 py-1.5 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={handleSavePreset}
              className="rounded-md px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowPresetSave(false)}
              className="rounded-md px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add Custom Variable Inline */}
        {showAddCustom && (
          <div
            className="flex items-center gap-2 border-b px-6 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              type="text"
              placeholder="Variable name (e.g. client_id)"
              value={customVarName}
              onChange={(e) => setCustomVarName(e.target.value)}
              className="flex-1 rounded-md border px-3 py-1.5 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={customVarLabel}
              onChange={(e) => setCustomVarLabel(e.target.value)}
              className="flex-1 rounded-md border px-3 py-1.5 text-xs outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={handleAddCustomVariable}
              className="rounded-md px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Add
            </button>
            <button
              onClick={() => setShowAddCustom(false)}
              className="rounded-md px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Variable Form */}
          <div
            className="flex-1 space-y-3 overflow-y-auto p-6"
            style={{ maxHeight: "50vh" }}
          >
            {variables.map((variable) => (
              <div key={variable.name}>
                <label
                  className="mb-1 flex items-center gap-2 text-xs font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  <code
                    className="rounded px-1.5 py-0.5 text-[10px]"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--primary)",
                    }}
                  >
                    {`{{${variable.name}}}`}
                  </code>
                  {variable.label}
                </label>
                {variable.type === "textarea" ? (
                  <textarea
                    value={values[variable.name] || ""}
                    onChange={(e) => setValue(variable.name, e.target.value)}
                    placeholder={variable.description}
                    rows={2}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                ) : (
                  <input
                    type={variable.type === "date" ? "date" : variable.type === "email" ? "email" : variable.type === "number" ? "number" : "text"}
                    value={values[variable.name] || ""}
                    onChange={(e) => setValue(variable.name, e.target.value)}
                    placeholder={variable.description}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div
              className="w-[45%] overflow-y-auto border-l p-6"
              style={{
                borderColor: "var(--border)",
                maxHeight: "50vh",
              }}
            >
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                Preview
              </h3>
              <div
                className="prose prose-sm rounded-lg border p-4 text-xs"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Unfilled variables will remain as placeholders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={closeModal}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={applyVariables}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
