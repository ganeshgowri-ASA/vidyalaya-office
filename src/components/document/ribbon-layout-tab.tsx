"use client";

import React, { useState } from "react";
import {
  Columns3, Settings2, Stamp, Frame, ChevronDown, FileText,
  Minus, RotateCw, Maximize2, SeparatorHorizontal,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator, ToolbarDropdown } from "./toolbar-button";
import { PAGE_SIZES, MARGIN_PRESETS, LINE_SPACING_OPTIONS } from "./constants";
import type { PageSize, MarginPreset, LineSpacing, Orientation } from "@/store/document-store";

export interface LayoutTabProps {
  onPageSetup?: () => void;
  onHeaderFooterEditor?: () => void;
}

export function LayoutTab({ onPageSetup, onHeaderFooterEditor }: LayoutTabProps) {
  const {
    pageSize, setPageSize,
    margins, setMargins,
    lineSpacing, setLineSpacing,
    columns, setColumns,
    orientation, setOrientation,
    showHeaderFooter, toggleHeaderFooter,
    indentLeft, setIndentLeft,
    indentRight, setIndentRight,
    spacingBefore, setSpacingBefore,
    spacingAfter, setSpacingAfter,
  } = useDocumentStore();

  const [showBreaks, setShowBreaks] = useState(false);
  const [showPageBorders, setShowPageBorders] = useState(false);

  return (
    <>
      {/* ===== PAGE SETUP GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-1">
          {/* Margins */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Margins:</span>
            <ToolbarDropdown
              value={margins}
              options={Object.entries(MARGIN_PRESETS).map(([k, v]) => ({ value: k, label: v.label }))}
              onChange={(v) => setMargins(v as MarginPreset)}
              title="Margins"
              className="w-[100px]"
            />
          </div>
          <ToolbarSeparator />
          {/* Orientation */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Orientation:</span>
            <ToolbarDropdown
              value={orientation}
              options={[
                { value: "portrait", label: "Portrait" },
                { value: "landscape", label: "Landscape" },
              ]}
              onChange={(v) => setOrientation(v as Orientation)}
              title="Orientation"
              className="w-[100px]"
            />
          </div>
          <ToolbarSeparator />
          {/* Size */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Size:</span>
            <ToolbarDropdown
              value={pageSize}
              options={Object.entries(PAGE_SIZES).map(([k, v]) => ({ value: k, label: v.label }))}
              onChange={(v) => setPageSize(v as PageSize)}
              title="Page Size"
              className="w-[160px]"
            />
          </div>
          <ToolbarSeparator />
          {/* Columns */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Columns:</span>
            {[1, 2, 3].map((n) => (
              <ToolbarButton
                key={n}
                icon={<span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>{n}</span>}
                title={`${n} Column${n > 1 ? "s" : ""}`}
                active={columns === n}
                onClick={() => setColumns(n)}
              />
            ))}
            <ToolbarButton
              icon={<span className="text-[10px]" style={{ color: "var(--foreground)" }}>L</span>}
              title="Left (narrow left)"
              onClick={() => setColumns(2)}
            />
            <ToolbarButton
              icon={<span className="text-[10px]" style={{ color: "var(--foreground)" }}>R</span>}
              title="Right (narrow right)"
              onClick={() => setColumns(2)}
            />
          </div>
          <ToolbarSeparator />
          {/* Breaks */}
          <div className="relative">
            <ToolbarButton icon={<SeparatorHorizontal size={14} />} label="Breaks" title="Breaks" onClick={() => setShowBreaks(!showBreaks)} />
            {showBreaks && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-48"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-1 px-2" style={{ color: "var(--muted-foreground)" }}>Page Breaks</div>
                {[
                  { label: "Page Break", desc: "Start next page" },
                  { label: "Column Break", desc: "Start next column" },
                ].map((b) => (
                  <button key={b.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      const editor = document.getElementById("doc-editor");
                      if (editor) {
                        editor.focus();
                        document.execCommand("insertHTML",
                          false,
                          `<div style="page-break-after:always;border-top:2px dashed #ccc;margin:16px 0;text-align:center;color:#999;font-size:9px;">— ${b.label} —</div><p></p>`
                        );
                      }
                      setShowBreaks(false);
                    }}>
                    <div>{b.label}</div>
                    <div className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{b.desc}</div>
                  </button>
                ))}
                <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                <div className="text-[10px] font-medium mb-1 px-2" style={{ color: "var(--muted-foreground)" }}>Section Breaks</div>
                {[
                  { label: "Next Page", desc: "New section on next page" },
                  { label: "Continuous", desc: "New section same page" },
                ].map((b) => (
                  <button key={b.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      const editor = document.getElementById("doc-editor");
                      if (editor) {
                        editor.focus();
                        document.execCommand("insertHTML",
                          false,
                          `<div style="border-top:2px dashed #999;margin:16px 0;text-align:center;color:#888;font-size:9px;">— Section Break (${b.label}) —</div><p></p>`
                        );
                      }
                      setShowBreaks(false);
                    }}>
                    <div>{b.label}</div>
                    <div className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{b.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarSeparator />
          {/* Page Setup button */}
          {onPageSetup && (
            <ToolbarButton icon={<Settings2 size={14} />} label="Page Setup" title="Page Setup Dialog" onClick={onPageSetup} />
          )}
          {/* Header/Footer */}
          <ToolbarButton icon={<Stamp size={14} />} label="Header/Footer" title="Toggle Header & Footer" active={showHeaderFooter} onClick={toggleHeaderFooter} />
          {onHeaderFooterEditor && (
            <ToolbarButton icon={<Stamp size={14} />} label="Edit H/F" title="Advanced Header & Footer Editor" onClick={onHeaderFooterEditor} />
          )}
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Page Setup</span>
      </div>

      {/* ===== PARAGRAPH GROUP (Layout) ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Indent Left:</span>
            <input type="number" min={0} max={10} step={0.5} value={indentLeft}
              onChange={(e) => setIndentLeft(parseFloat(e.target.value) || 0)}
              className="w-14 h-6 text-[10px] rounded border px-1"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>cm</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Right:</span>
            <input type="number" min={0} max={10} step={0.5} value={indentRight}
              onChange={(e) => setIndentRight(parseFloat(e.target.value) || 0)}
              className="w-14 h-6 text-[10px] rounded border px-1"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>cm</span>
          </div>
          <ToolbarSeparator />
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>Before:</span>
            <input type="number" min={0} max={72} step={1} value={spacingBefore}
              onChange={(e) => setSpacingBefore(parseInt(e.target.value) || 0)}
              className="w-12 h-6 text-[10px] rounded border px-1"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>pt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>After:</span>
            <input type="number" min={0} max={72} step={1} value={spacingAfter}
              onChange={(e) => setSpacingAfter(parseInt(e.target.value) || 0)}
              className="w-12 h-6 text-[10px] rounded border px-1"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>pt</span>
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Paragraph</span>
      </div>
    </>
  );
}
