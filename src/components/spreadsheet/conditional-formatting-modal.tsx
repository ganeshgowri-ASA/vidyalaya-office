"use client";

import { useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useSpreadsheetStore, type ConditionalFormatRule } from "@/store/spreadsheet-store";
import { colToLetter } from "./formula-engine";

type RuleType = ConditionalFormatRule["type"];

const RULE_LABELS: Record<RuleType, string> = {
  greaterThan: "Greater Than",
  lessThan: "Less Than",
  between: "Between",
  equalTo: "Equal To",
  textContains: "Text Contains",
  duplicates: "Duplicate Values",
  top10: "Top 10 Items",
  bottom10: "Bottom 10 Items",
  colorScale2: "2-Color Scale",
  colorScale3: "3-Color Scale",
  dataBar: "Data Bar",
  iconSet: "Icon Set",
};

const RULE_CATEGORIES = {
  "Highlight Cells": ["greaterThan", "lessThan", "between", "equalTo", "textContains", "duplicates"] as RuleType[],
  "Top/Bottom": ["top10", "bottom10"] as RuleType[],
  "Color Scales": ["colorScale2", "colorScale3"] as RuleType[],
  "Data Bars & Icons": ["dataBar", "iconSet"] as RuleType[],
};

export function ConditionalFormattingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const selectionStart = useSpreadsheetStore((s) => s.selectionStart);
  const selectionEnd = useSpreadsheetStore((s) => s.selectionEnd);
  const addConditionalFormat = useSpreadsheetStore((s) => s.addConditionalFormat);
  const removeConditionalFormat = useSpreadsheetStore((s) => s.removeConditionalFormat);
  const getConditionalFormats = useSpreadsheetStore((s) => s.getConditionalFormats);

  const [ruleType, setRuleType] = useState<RuleType>("greaterThan");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [bgColor, setBgColor] = useState("#fecaca");
  const [textColor, setTextColor] = useState("#991b1b");
  const [colorScaleMin, setColorScaleMin] = useState("#f87171");
  const [colorScaleMid, setColorScaleMid] = useState("#fbbf24");
  const [colorScaleMax, setColorScaleMax] = useState("#22c55e");
  const [dataBarColor, setDataBarColor] = useState("#3b82f6");
  const [iconSetType, setIconSetType] = useState<"arrows" | "traffic" | "flags" | "stars" | "rating">("arrows");

  const existingRules = getConditionalFormats();

  const getSelectionRange = useCallback(() => {
    if (!selectionStart || !selectionEnd) return "";
    const minC = Math.min(selectionStart.col, selectionEnd.col);
    const maxC = Math.max(selectionStart.col, selectionEnd.col);
    const minR = Math.min(selectionStart.row, selectionEnd.row);
    const maxR = Math.max(selectionStart.row, selectionEnd.row);
    return `${colToLetter(minC)}${minR + 1}:${colToLetter(maxC)}${maxR + 1}`;
  }, [selectionStart, selectionEnd]);

  const handleApply = useCallback(() => {
    const range = getSelectionRange();
    if (!range) return;

    const rule: ConditionalFormatRule = {
      id: `cf_${Date.now()}`,
      range,
      type: ruleType,
      value1: value1 || undefined,
      value2: value2 || undefined,
      format: {
        bgColor,
        textColor,
      },
      colorScaleMin,
      colorScaleMid,
      colorScaleMax,
      dataBarColor,
      iconSetType,
    };

    addConditionalFormat(rule);
    onClose();
  }, [ruleType, value1, value2, bgColor, textColor, colorScaleMin, colorScaleMid, colorScaleMax, dataBarColor, iconSetType, getSelectionRange, addConditionalFormat, onClose]);

  if (!open) return null;

  const needsValue1 = ["greaterThan", "lessThan", "between", "equalTo", "textContains"].includes(ruleType);
  const needsValue2 = ruleType === "between";
  const isColorScale = ruleType === "colorScale2" || ruleType === "colorScale3";
  const isDataBar = ruleType === "dataBar";
  const isIconSet = ruleType === "iconSet";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[550px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Conditional Formatting</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Range */}
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Apply to: <span className="font-mono font-semibold">{getSelectionRange() || "Select a range first"}</span>
          </div>

          {/* Rule type */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Rule Type</label>
            <select
              className="w-full text-sm rounded px-2 py-1.5 border outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value as RuleType)}
            >
              {Object.entries(RULE_CATEGORIES).map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map(t => (
                    <option key={t} value={t}>{RULE_LABELS[t]}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Value inputs */}
          {needsValue1 && (
            <div className={needsValue2 ? "grid grid-cols-2 gap-3" : ""}>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  {ruleType === "between" ? "Minimum" : "Value"}
                </label>
                <input
                  type="text"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="Enter value..."
                />
              </div>
              {needsValue2 && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Maximum</label>
                  <input
                    type="text"
                    className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    value={value2}
                    onChange={(e) => setValue2(e.target.value)}
                    placeholder="Enter value..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Format (for highlight rules) */}
          {!isColorScale && !isDataBar && !isIconSet && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Fill Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <span className="text-xs font-mono">{bgColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <span className="text-xs font-mono">{textColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Color scale */}
          {isColorScale && (
            <div className={`grid ${ruleType === "colorScale3" ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Min Color</label>
                <input type="color" value={colorScaleMin} onChange={(e) => setColorScaleMin(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
              {ruleType === "colorScale3" && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Mid Color</label>
                  <input type="color" value={colorScaleMid} onChange={(e) => setColorScaleMid(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Max Color</label>
                <input type="color" value={colorScaleMax} onChange={(e) => setColorScaleMax(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
              {/* Preview */}
              <div className="col-span-full">
                <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Preview</div>
                <div className="h-6 rounded" style={{
                  background: ruleType === "colorScale3"
                    ? `linear-gradient(to right, ${colorScaleMin}, ${colorScaleMid}, ${colorScaleMax})`
                    : `linear-gradient(to right, ${colorScaleMin}, ${colorScaleMax})`
                }} />
              </div>
            </div>
          )}

          {/* Data bar */}
          {isDataBar && (
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Bar Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={dataBarColor} onChange={(e) => setDataBarColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <div className="flex-1 h-6 rounded overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="h-full rounded" style={{ width: "70%", backgroundColor: dataBarColor, opacity: 0.6 }} />
                </div>
              </div>
            </div>
          )}

          {/* Icon set */}
          {isIconSet && (
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Icon Style</label>
              <select
                className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                value={iconSetType}
                onChange={(e) => setIconSetType(e.target.value as typeof iconSetType)}
              >
                <option value="arrows">Arrows (↑ → ↓)</option>
                <option value="traffic">Traffic Lights (🔴 🟡 🟢)</option>
                <option value="flags">Flags (🚩 ⚑ ⚐)</option>
                <option value="stars">Stars (★ ★ ☆)</option>
                <option value="rating">Rating (●●● ●●○ ●○○)</option>
              </select>
            </div>
          )}

          {/* Existing rules */}
          {existingRules.length > 0 && (
            <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                Active Rules ({existingRules.length})
              </div>
              <div className="space-y-1 max-h-[120px] overflow-auto">
                {existingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded text-xs"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: rule.format.bgColor || rule.dataBarColor || rule.colorScaleMax || "#ccc" }} />
                      <span>{RULE_LABELS[rule.type]}</span>
                      <span className="font-mono" style={{ color: "var(--muted-foreground)" }}>{rule.range}</span>
                    </div>
                    <button onClick={() => removeConditionalFormat(rule.id)} className="hover:opacity-70">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
