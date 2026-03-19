"use client";

import React, { useState } from "react";
import {
  Palette, Droplets, Frame, Paintbrush, Type, Layers, Sun,
  ChevronDown,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator } from "./toolbar-button";
import { THEMES, TEXT_COLORS } from "./constants";
import { PageBordersDialog } from "./page-borders-dialog";

export function DesignTab() {
  const {
    currentTheme, setCurrentTheme,
    showWatermark, toggleWatermark, setWatermarkText,
    pageColor, setPageColor,
    watermarkDirection, setWatermarkDirection, watermarkOpacity, setWatermarkOpacity,
    setWatermarkImageUrl, setUseImageWatermark,
  } = useDocumentStore();

  const [showThemes, setShowThemes] = useState(false);
  const [showThemeColors, setShowThemeColors] = useState(false);
  const [showThemeFonts, setShowThemeFonts] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [showPageColor, setShowPageColor] = useState(false);
  const [showPageBorders, setShowPageBorders] = useState(false);
  const [showPageBordersDialog, setShowPageBordersDialog] = useState(false);

  return (
    <>
      {/* ===== DOCUMENT FORMATTING GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          {/* Themes gallery */}
          <div className="relative">
            <ToolbarButton icon={<Palette size={14} />} label="Themes" title="Themes" onClick={() => setShowThemes(!showThemes)} />
            {showThemes && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg w-72"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Document Themes</div>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((theme) => (
                    <button key={theme.name}
                      className={`p-2 rounded border text-center hover:bg-[var(--muted)] cursor-pointer ${currentTheme === theme.name ? "ring-2 ring-[var(--primary)]" : ""}`}
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => { setCurrentTheme(theme.name); setShowThemes(false); }}>
                      <div className="flex gap-0.5 mb-1 justify-center">
                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.primary }} />
                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.secondary }} />
                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <span className="text-[9px]" style={{ color: "var(--foreground)" }}>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Colors */}
          <div className="relative">
            <ToolbarButton icon={<Paintbrush size={14} />} label="Colors" title="Theme Colors" onClick={() => setShowThemeColors(!showThemeColors)} />
            {showThemeColors && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-56"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Theme Colors</div>
                {THEMES.map((theme) => (
                  <button key={theme.name}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--muted)]"
                    onClick={() => { setCurrentTheme(theme.name); setShowThemeColors(false); }}>
                    <div className="flex gap-0.5">
                      <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: theme.primary, borderColor: "#ccc" }} />
                      <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: theme.secondary, borderColor: "#ccc" }} />
                      <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: theme.accent, borderColor: "#ccc" }} />
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--foreground)" }}>{theme.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Fonts */}
          <div className="relative">
            <ToolbarButton icon={<Type size={14} />} label="Fonts" title="Theme Fonts" onClick={() => setShowThemeFonts(!showThemeFonts)} />
            {showThemeFonts && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-56"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Theme Font Pairs</div>
                {[
                  { heading: "Calibri Light", body: "Calibri" },
                  { heading: "Cambria", body: "Calibri" },
                  { heading: "Arial", body: "Arial" },
                  { heading: "Times New Roman", body: "Times New Roman" },
                  { heading: "Georgia", body: "Verdana" },
                  { heading: "Garamond", body: "Garamond" },
                ].map((fp) => (
                  <button key={fp.heading + fp.body}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[var(--muted)]"
                    onClick={() => {
                      useDocumentStore.getState().setCurrentFont(fp.body);
                      setShowThemeFonts(false);
                    }}>
                    <div className="text-xs" style={{ fontFamily: fp.heading, color: "var(--foreground)" }}>{fp.heading}</div>
                    <div className="text-[10px]" style={{ fontFamily: fp.body, color: "var(--muted-foreground)" }}>{fp.body}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarButton icon={<Sun size={14} />} label="Effects" title="Theme Effects" onClick={() => {}} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Document Formatting</span>
      </div>

      {/* ===== PAGE BACKGROUND GROUP ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          {/* Watermark */}
          <div className="relative">
            <ToolbarButton icon={<Droplets size={14} />} label="Watermark" title="Watermark" onClick={() => setShowWatermarkMenu(!showWatermarkMenu)} />
            {showWatermarkMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-52"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Watermark</div>
                <div className="text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>Diagonal</div>
                {["CONFIDENTIAL", "DO NOT COPY", "DRAFT", "SAMPLE"].map((w) => (
                  <button key={w} className="w-full text-left text-xs px-3 py-1 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => { setWatermarkText(w); if (!showWatermark) toggleWatermark(); setShowWatermarkMenu(false); }}>
                    ↗ {w}
                  </button>
                ))}
                <div className="text-[10px] mt-2 mb-1" style={{ color: "var(--muted-foreground)" }}>Horizontal</div>
                {["CONFIDENTIAL", "DRAFT"].map((w) => (
                  <button key={"h-" + w} className="w-full text-left text-xs px-3 py-1 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => { setWatermarkText(w); if (!showWatermark) toggleWatermark(); setShowWatermarkMenu(false); }}>
                    → {w}
                  </button>
                ))}
                <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                <button className="w-full text-left text-xs px-3 py-1 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => {
                    const text = prompt("Custom watermark text:");
                    if (text) { setWatermarkText(text); if (!showWatermark) toggleWatermark(); }
                    setShowWatermarkMenu(false);
                  }}>
                  Custom Watermark...
                </button>
                <button className="w-full text-left text-xs px-3 py-1 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setWatermarkImageUrl(ev.target?.result as string);
                        setUseImageWatermark(true);
                        if (!showWatermark) toggleWatermark();
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                    setShowWatermarkMenu(false);
                  }}>
                  Image Watermark...
                </button>
                <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                <div className="px-3 py-1">
                  <div className="text-[9px] mb-1" style={{ color: "var(--muted-foreground)" }}>Direction</div>
                  <div className="flex gap-1">
                    <button onClick={() => setWatermarkDirection("diagonal")}
                      className={`px-2 py-0.5 rounded text-[10px] border ${watermarkDirection === "diagonal" ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                      style={{ color: "var(--foreground)" }}>Diagonal</button>
                    <button onClick={() => setWatermarkDirection("horizontal")}
                      className={`px-2 py-0.5 rounded text-[10px] border ${watermarkDirection === "horizontal" ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                      style={{ color: "var(--foreground)" }}>Horizontal</button>
                  </div>
                  <div className="text-[9px] mt-1.5 mb-0.5" style={{ color: "var(--muted-foreground)" }}>Opacity: {Math.round(watermarkOpacity * 100)}%</div>
                  <input type="range" min={0.05} max={0.8} step={0.05} value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full h-1" style={{ accentColor: "var(--primary)" }} />
                </div>
                <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                <button className="w-full text-left text-xs px-3 py-1 rounded hover:bg-[var(--muted)]"
                  style={{ color: showWatermark ? "var(--primary)" : "var(--foreground)" }}
                  onClick={() => { toggleWatermark(); setShowWatermarkMenu(false); }}>
                  {showWatermark ? "Remove Watermark" : "Show Watermark"}
                </button>
              </div>
            )}
          </div>
          {/* Page Color */}
          <div className="relative">
            <ToolbarButton icon={<Layers size={14} />} label="Page Color" title="Page Color" onClick={() => setShowPageColor(!showPageColor)} />
            {showPageColor && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 200 }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Page Color</div>
                <div className="grid grid-cols-5 gap-1">
                  {["#ffffff", "#f2f2f2", "#fdf2e9", "#eaf2f8", "#e8f8f5", "#fdebd0", "#d5f5e3", "#d6eaf8", "#ebdef0", "#fadbd8", "#f9e79f", "#abebc6", "#aed6f1", "#d2b4de", "#f5b7b1"].map((c) => (
                    <button key={c} className="h-6 w-6 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: c, borderColor: "#ccc" }}
                      onClick={() => { setPageColor(c); setShowPageColor(false); }}
                    />
                  ))}
                </div>
                <button className="w-full text-left text-xs px-2 py-1 mt-2 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "color";
                    input.value = pageColor;
                    input.onchange = () => { setPageColor(input.value); setShowPageColor(false); };
                    input.click();
                  }}>
                  More Colors...
                </button>
                <button className="w-full text-left text-xs px-2 py-1 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => { setPageColor("#ffffff"); setShowPageColor(false); }}>
                  No Color
                </button>
              </div>
            )}
          </div>
          {/* Page Borders */}
          <ToolbarButton icon={<Frame size={14} />} label="Page Borders" title="Page Borders — decorative styles" onClick={() => setShowPageBordersDialog(true)} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Page Background</span>
      </div>

      {/* Page Borders Dialog */}
      <PageBordersDialog open={showPageBordersDialog} onClose={() => setShowPageBordersDialog(false)} />
    </>
  );
}
