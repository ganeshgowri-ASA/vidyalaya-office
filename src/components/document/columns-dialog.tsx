"use client";

import React from "react";
import { X, Columns2, Columns3 } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import type { ColumnLayout } from "@/store/document-store";

const LAYOUTS: { value: ColumnLayout; label: string; cols: number; description: string }[] = [
  { value: "equal", label: "One", cols: 1, description: "Single column" },
  { value: "equal", label: "Two", cols: 2, description: "Two equal columns" },
  { value: "equal", label: "Three", cols: 3, description: "Three equal columns" },
  { value: "left-narrow", label: "Left", cols: 2, description: "Narrow left, wide right" },
  { value: "right-narrow", label: "Right", cols: 2, description: "Wide left, narrow right" },
];

export function ColumnsDialog() {
  const {
    showColumnsDialog, setShowColumnsDialog,
    columns, setColumns,
    columnLayout, setColumnLayout,
    columnSpacing, setColumnSpacing,
  } = useDocumentStore();

  if (!showColumnsDialog) return null;

  const applyLayout = (layout: typeof LAYOUTS[number]) => {
    setColumns(layout.cols);
    setColumnLayout(layout.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[420px] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Columns Layout</h2>
          <button onClick={() => setShowColumnsDialog(false)} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Presets */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Presets</label>
            <div className="grid grid-cols-5 gap-2">
              {LAYOUTS.map((layout, i) => (
                <button
                  key={i}
                  onClick={() => applyLayout(layout)}
                  className={`rounded-lg border p-3 flex flex-col items-center gap-1.5 ${
                    columns === layout.cols && columnLayout === layout.value ? "border-[var(--primary)] bg-[var(--muted)]" : ""
                  }`}
                  style={{ borderColor: columns === layout.cols && columnLayout === layout.value ? "var(--primary)" : "var(--border)" }}
                >
                  <div className="flex gap-0.5 h-8 w-full">
                    {layout.label === "One" && <div className="flex-1 bg-gray-300 rounded-sm" />}
                    {layout.label === "Two" && (
                      <>
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                      </>
                    )}
                    {layout.label === "Three" && (
                      <>
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                      </>
                    )}
                    {layout.label === "Left" && (
                      <>
                        <div className="w-1/3 bg-gray-300 rounded-sm" />
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                      </>
                    )}
                    {layout.label === "Right" && (
                      <>
                        <div className="flex-1 bg-gray-300 rounded-sm" />
                        <div className="w-1/3 bg-gray-300 rounded-sm" />
                      </>
                    )}
                  </div>
                  <span className="text-[9px]" style={{ color: "var(--foreground)" }}>{layout.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom settings */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Number of columns</label>
                <input type="number" min={1} max={6} value={columns}
                  onChange={(e) => setColumns(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Spacing (em)</label>
                <input type="number" min={0.5} max={10} step={0.5} value={columnSpacing}
                  onChange={(e) => setColumnSpacing(parseFloat(e.target.value) || 2)}
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Insert Column Break</label>
              <button
                onClick={() => {
                  const editor = document.getElementById("doc-editor");
                  if (editor) {
                    editor.focus();
                    document.execCommand("insertHTML", false,
                      '<div style="break-after:column;border-top:2px dashed #aaa;margin:12px 0;text-align:center;color:#999;font-size:9px;">— Column Break —</div><p></p>'
                    );
                  }
                  setShowColumnsDialog(false);
                }}
                className="w-full rounded border px-3 py-2 text-xs text-left hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Insert column break at cursor position
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Preview</label>
            <div className="rounded border p-4" style={{ borderColor: "var(--border)", backgroundColor: "#fff" }}>
              <div className="flex" style={{ gap: `${columnSpacing * 4}px` }}>
                {Array.from({ length: columns }, (_, i) => (
                  <div key={i} className="flex-1 space-y-1">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-1 rounded" style={{ backgroundColor: "#ddd", width: j === 4 ? "60%" : "100%" }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setShowColumnsDialog(false)}
            className="px-4 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
          <button onClick={() => setShowColumnsDialog(false)}
            className="px-4 py-1.5 rounded-lg text-xs text-white"
            style={{ backgroundColor: "var(--primary)" }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
