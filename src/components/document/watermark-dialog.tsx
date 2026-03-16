"use client";

import React, { useState } from "react";
import { X, Type, Image as ImageIcon } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import type { WatermarkDirection, WatermarkPosition } from "@/store/document-store";

const PRESET_TEXTS = ["DRAFT", "CONFIDENTIAL", "SAMPLE", "DO NOT COPY", "ORIGINAL", "APPROVED", "URGENT", "FINAL"];
const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export function WatermarkDialog() {
  const {
    showWatermarkDialog, setShowWatermarkDialog,
    showWatermark, toggleWatermark,
    watermarkText, setWatermarkText,
    watermarkDirection, setWatermarkDirection,
    watermarkOpacity, setWatermarkOpacity,
    watermarkImageUrl, setWatermarkImageUrl,
    useImageWatermark, setUseImageWatermark,
    watermarkPosition, setWatermarkPosition,
    watermarkRotation, setWatermarkRotation,
    watermarkFontSize, setWatermarkFontSize,
  } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<"text" | "image">(useImageWatermark ? "image" : "text");

  if (!showWatermarkDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Watermark Settings</h2>
          <button onClick={() => setShowWatermarkDialog(false)} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Enable toggle */}
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={showWatermark} onChange={toggleWatermark} className="w-3.5 h-3.5" />
            <span className="font-medium">Enable Watermark</span>
          </label>

          {/* Type tabs */}
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => { setActiveTab("text"); setUseImageWatermark(false); }}
              className={`flex items-center gap-1 px-4 py-2 text-xs border-b-2 ${activeTab === "text" ? "border-[var(--primary)]" : "border-transparent"}`}
              style={{ color: activeTab === "text" ? "var(--primary)" : "var(--muted-foreground)" }}>
              <Type size={13} /> Text
            </button>
            <button onClick={() => { setActiveTab("image"); setUseImageWatermark(true); }}
              className={`flex items-center gap-1 px-4 py-2 text-xs border-b-2 ${activeTab === "image" ? "border-[var(--primary)]" : "border-transparent"}`}
              style={{ color: activeTab === "image" ? "var(--primary)" : "var(--muted-foreground)" }}>
              <ImageIcon size={13} /> Image
            </button>
          </div>

          {activeTab === "text" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="Enter watermark text..."
                />
              </div>
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Presets</label>
                <div className="flex flex-wrap gap-1">
                  {PRESET_TEXTS.map((t) => (
                    <button key={t} onClick={() => setWatermarkText(t)}
                      className={`px-2 py-1 rounded text-[10px] border ${watermarkText === t ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)]"}`}
                      style={{ color: "var(--foreground)" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Font Size: {watermarkFontSize}px</label>
                <input type="range" min={24} max={200} value={watermarkFontSize}
                  onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                  className="w-full" style={{ accentColor: "var(--primary)" }} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Image URL</label>
                <input
                  type="text"
                  value={watermarkImageUrl}
                  onChange={(e) => setWatermarkImageUrl(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="Paste image URL..."
                />
              </div>
              {watermarkImageUrl && (
                <div className="flex justify-center p-3 rounded border" style={{ borderColor: "var(--border)" }}>
                  <img src={watermarkImageUrl} alt="Preview" style={{ maxWidth: 120, maxHeight: 80, opacity: watermarkOpacity }} />
                </div>
              )}
            </div>
          )}

          {/* Common settings */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div>
              <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Opacity: {Math.round(watermarkOpacity * 100)}%</label>
              <input type="range" min={5} max={100} value={Math.round(watermarkOpacity * 100)}
                onChange={(e) => setWatermarkOpacity(parseInt(e.target.value) / 100)}
                className="w-full" style={{ accentColor: "var(--primary)" }} />
            </div>

            <div>
              <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Rotation: {watermarkRotation}°</label>
              <input type="range" min={-180} max={180} value={watermarkRotation}
                onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                className="w-full" style={{ accentColor: "var(--primary)" }} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Direction</label>
                <select value={watermarkDirection}
                  onChange={(e) => setWatermarkDirection(e.target.value as WatermarkDirection)}
                  className="w-full rounded border px-2 py-1.5 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <option value="diagonal">Diagonal</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Position</label>
                <select value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value as WatermarkPosition)}
                  className="w-full rounded border px-2 py-1.5 text-xs"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted-foreground)" }}>Preview</label>
            <div className="rounded border relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "#fff", height: 120 }}>
              <div className="absolute inset-0 flex items-center justify-center" style={{
                ...(watermarkPosition === "top" ? { alignItems: "flex-start", paddingTop: 8 } : {}),
                ...(watermarkPosition === "bottom" ? { alignItems: "flex-end", paddingBottom: 8 } : {}),
                ...(watermarkPosition === "top-left" ? { alignItems: "flex-start", justifyContent: "flex-start", padding: 8 } : {}),
                ...(watermarkPosition === "top-right" ? { alignItems: "flex-start", justifyContent: "flex-end", padding: 8 } : {}),
                ...(watermarkPosition === "bottom-left" ? { alignItems: "flex-end", justifyContent: "flex-start", padding: 8 } : {}),
                ...(watermarkPosition === "bottom-right" ? { alignItems: "flex-end", justifyContent: "flex-end", padding: 8 } : {}),
              }}>
                {useImageWatermark && watermarkImageUrl ? (
                  <img src={watermarkImageUrl} alt="watermark" style={{
                    maxWidth: "40%", maxHeight: "60%", opacity: watermarkOpacity,
                    transform: `rotate(${watermarkRotation}deg)`,
                  }} />
                ) : (
                  <span style={{
                    fontSize: Math.min(watermarkFontSize / 3, 24), fontWeight: 700,
                    color: `rgba(200, 200, 200, ${watermarkOpacity})`,
                    transform: `rotate(${watermarkRotation}deg)`,
                    whiteSpace: "nowrap",
                  }}>
                    {watermarkText || "DRAFT"}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4/5 space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-1.5 rounded" style={{ backgroundColor: "#e5e5e5", width: i === 3 ? "60%" : i === 5 ? "40%" : "100%" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setShowWatermarkDialog(false)}
            className="px-4 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Close
          </button>
          <button onClick={() => { if (!showWatermark) toggleWatermark(); setShowWatermarkDialog(false); }}
            className="px-4 py-1.5 rounded-lg text-xs text-white"
            style={{ backgroundColor: "var(--primary)" }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
