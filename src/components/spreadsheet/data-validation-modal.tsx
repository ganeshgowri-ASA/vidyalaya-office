"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DataValidationRule } from "@/store/spreadsheet-store";

type ValidationType = DataValidationRule["type"];

export function DataValidationModal({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (rule: DataValidationRule) => void;
}) {
  const [rule, setRule] = useState<DataValidationRule>({
    type: "list",
    listItems: "",
    numberMin: "",
    numberMax: "",
    dateMin: "",
    dateMax: "",
    textMinLength: "",
    textMaxLength: "",
    customFormula: "",
    inputTitle: "",
    inputMessage: "",
    errorTitle: "Invalid Input",
    errorMessage: "The value entered does not meet the validation criteria.",
  });

  if (!open) return null;

  const updateRule = (partial: Partial<DataValidationRule>) => {
    setRule((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[480px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold">Data Validation</h2>
          <button onClick={onClose} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Validation type */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Validation Type
            </label>
            <select
              className="w-full text-sm rounded px-2 py-1.5 border outline-none"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              value={rule.type}
              onChange={(e) => updateRule({ type: e.target.value as ValidationType })}
            >
              <option value="list">List (Dropdown)</option>
              <option value="number">Number Range</option>
              <option value="date">Date Range</option>
              <option value="textLength">Text Length</option>
              <option value="custom">Custom Formula</option>
            </select>
          </div>

          {/* Type-specific criteria */}
          {rule.type === "list" && (
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                List Items (comma-separated)
              </label>
              <textarea
                className="w-full text-sm rounded px-2 py-1.5 border outline-none resize-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                rows={3}
                placeholder="Option 1, Option 2, Option 3"
                value={rule.listItems}
                onChange={(e) => updateRule({ listItems: e.target.value })}
              />
            </div>
          )}

          {rule.type === "number" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Minimum
                </label>
                <input
                  type="number"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="0"
                  value={rule.numberMin}
                  onChange={(e) => updateRule({ numberMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Maximum
                </label>
                <input
                  type="number"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="100"
                  value={rule.numberMax}
                  onChange={(e) => updateRule({ numberMax: e.target.value })}
                />
              </div>
            </div>
          )}

          {rule.type === "date" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  value={rule.dateMin}
                  onChange={(e) => updateRule({ dateMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  value={rule.dateMax}
                  onChange={(e) => updateRule({ dateMax: e.target.value })}
                />
              </div>
            </div>
          )}

          {rule.type === "textLength" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Min Length
                </label>
                <input
                  type="number"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="0"
                  value={rule.textMinLength}
                  onChange={(e) => updateRule({ textMinLength: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Max Length
                </label>
                <input
                  type="number"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="255"
                  value={rule.textMaxLength}
                  onChange={(e) => updateRule({ textMaxLength: e.target.value })}
                />
              </div>
            </div>
          )}

          {rule.type === "custom" && (
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                Custom Formula (must evaluate to TRUE)
              </label>
              <input
                type="text"
                className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                placeholder="=AND(A1>0, A1<100)"
                value={rule.customFormula || ""}
                onChange={(e) => updateRule({ customFormula: e.target.value })}
              />
            </div>
          )}

          {/* Error message customization */}
          <div
            className="border-t pt-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
              Error Message
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Title
                </label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  value={rule.errorTitle}
                  onChange={(e) => updateRule({ errorTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Message
                </label>
                <textarea
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none resize-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  rows={2}
                  value={rule.errorMessage}
                  onChange={(e) => updateRule({ errorMessage: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
            onClick={() => {
              onApply(rule);
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
