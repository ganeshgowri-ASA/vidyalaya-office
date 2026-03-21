"use client";

import React, { useState } from "react";
import { X, Monitor, Smartphone, RotateCcw } from "lucide-react";
import { usePrintLayoutStore, PAPER_DIMENSIONS, MARGIN_PRESETS } from "@/store/print-layout-store";
import type { PaperSize, Orientation, MarginPreset, PageMargins, ScaleMode } from "@/store/print-layout-store";

interface PrintPageSetupDialogProps {
  open: boolean;
  onClose: () => void;
  showSheetTab?: boolean;
}

export function PrintPageSetupDialog({ open, onClose, showSheetTab = false }: PrintPageSetupDialogProps) {
  const { settings, updateSettings, setMargins, setMarginPreset, activeSetupTab, setActiveSetupTab, resetSettings } = usePrintLayoutStore();

  const [localPaper, setLocalPaper] = useState<PaperSize>(settings.paperSize);
  const [localOrientation, setLocalOrientation] = useState<Orientation>(settings.orientation);
  const [localMarginPreset, setLocalMarginPreset] = useState<MarginPreset>(settings.marginPreset);
  const [localMargins, setLocalMargins] = useState<PageMargins>({ ...settings.margins });
  const [localScale, setLocalScale] = useState<ScaleMode>(settings.scaleMode);
  const [localScalePercent, setLocalScalePercent] = useState(settings.scalePercent);
  const [localFitW, setLocalFitW] = useState(settings.fitToWidth);
  const [localFitH, setLocalFitH] = useState(settings.fitToHeight);
  const [localColor, setLocalColor] = useState(settings.colorMode);
  const [localQuality, setLocalQuality] = useState(settings.quality);
  const [localDuplex, setLocalDuplex] = useState(settings.duplex);
  const [localPrintGridlines, setLocalPrintGridlines] = useState(settings.printGridlines);
  const [localPrintHeadings, setLocalPrintHeadings] = useState(settings.printHeadings);
  const [localRepeatRows, setLocalRepeatRows] = useState(settings.repeatRows || "");
  const [localRepeatCols, setLocalRepeatCols] = useState(settings.repeatColumns || "");

  if (!open) return null;

  const tabs: { key: typeof activeSetupTab; label: string }[] = [
    { key: "page", label: "Page" },
    { key: "margins", label: "Margins" },
    { key: "header-footer", label: "Header/Footer" },
  ];
  if (showSheetTab) tabs.push({ key: "sheet", label: "Sheet" });

  const handleApply = () => {
    updateSettings({
      paperSize: localPaper,
      orientation: localOrientation,
      scaleMode: localScale,
      scalePercent: localScalePercent,
      fitToWidth: localFitW,
      fitToHeight: localFitH,
      colorMode: localColor,
      quality: localQuality,
      duplex: localDuplex,
      printGridlines: localPrintGridlines,
      printHeadings: localPrintHeadings,
      repeatRows: localRepeatRows || null,
      repeatColumns: localRepeatCols || null,
    });
    setMarginPreset(localMarginPreset);
    if (localMarginPreset === "custom") {
      setMargins(localMargins);
    }
    onClose();
  };

  const handleMarginPresetChange = (preset: MarginPreset) => {
    setLocalMarginPreset(preset);
    if (preset !== "custom") {
      setLocalMargins({ ...MARGIN_PRESETS[preset] });
    }
  };

  const paperOptions = Object.entries(PAPER_DIMENSIONS).map(([key, val]) => (
    <option key={key} value={key}>{val.label}</option>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[520px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Page Setup</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 gap-1" style={{ borderColor: "var(--border)" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveSetupTab(t.key)} className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeSetupTab === t.key ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--muted)]"}`} style={{ color: activeSetupTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[55vh]">
          {activeSetupTab === "page" && (
            <div className="space-y-5">
              {/* Orientation */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Orientation</label>
                <div className="flex gap-3">
                  {(["portrait", "landscape"] as Orientation[]).map((o) => (
                    <button key={o} onClick={() => setLocalOrientation(o)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs capitalize" style={{
                      borderColor: localOrientation === o ? "var(--primary)" : "var(--border)",
                      backgroundColor: localOrientation === o ? "var(--primary)" : "transparent",
                      color: localOrientation === o ? "var(--primary-foreground)" : "var(--foreground)",
                    }}>
                      {o === "portrait" ? <Smartphone size={16} /> : <Monitor size={16} />}
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper size */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Paper Size</label>
                <select value={localPaper} onChange={(e) => setLocalPaper(e.target.value as PaperSize)} className="w-full rounded-md border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  {paperOptions}
                </select>
              </div>

              {/* Paper preview */}
              <div className="flex justify-center">
                <div className="border rounded" style={{
                  borderColor: "var(--border)",
                  width: localOrientation === "portrait" ? 80 : 110,
                  height: localOrientation === "portrait" ? 110 : 80,
                  backgroundColor: "var(--background)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                    {PAPER_DIMENSIONS[localPaper].label.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Scaling */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Scaling</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                    <input type="radio" name="scale" checked={localScale === "actual"} onChange={() => setLocalScale("actual")} style={{ accentColor: "var(--primary)" }} />
                    Actual size (100%)
                  </label>
                  <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                    <input type="radio" name="scale" checked={localScale === "custom"} onChange={() => setLocalScale("custom")} style={{ accentColor: "var(--primary)" }} />
                    Adjust to:
                    <input type="number" min={10} max={400} value={localScalePercent} onChange={(e) => { setLocalScale("custom"); setLocalScalePercent(Number(e.target.value)); }} className="w-16 rounded border px-2 py-0.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    % normal size
                  </label>
                  <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                    <input type="radio" name="scale" checked={localScale === "fit-width" || localScale === "fit-page"} onChange={() => setLocalScale("fit-page")} style={{ accentColor: "var(--primary)" }} />
                    Fit to:
                    <input type="number" min={1} max={100} value={localFitW} onChange={(e) => { setLocalScale("fit-page"); setLocalFitW(Number(e.target.value)); }} className="w-12 rounded border px-1 py-0.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    page(s) wide by
                    <input type="number" min={1} max={100} value={localFitH} onChange={(e) => { setLocalScale("fit-page"); setLocalFitH(Number(e.target.value)); }} className="w-12 rounded border px-1 py-0.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    tall
                  </label>
                </div>
              </div>

              {/* Print quality & color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Print Quality</label>
                  <select value={localQuality} onChange={(e) => setLocalQuality(e.target.value as typeof localQuality)} className="w-full rounded-md border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <option value="draft">Draft</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Quality</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Color Mode</label>
                  <select value={localColor} onChange={(e) => setLocalColor(e.target.value as typeof localColor)} className="w-full rounded-md border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <option value="color">Color</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="blackwhite">Black & White</option>
                  </select>
                </div>
              </div>

              {/* Duplex */}
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Two-sided Printing</label>
                <select value={localDuplex} onChange={(e) => setLocalDuplex(e.target.value as typeof localDuplex)} className="w-full rounded-md border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <option value="none">None (single-sided)</option>
                  <option value="long-edge">Flip on long edge</option>
                  <option value="short-edge">Flip on short edge</option>
                </select>
              </div>
            </div>
          )}

          {activeSetupTab === "margins" && (
            <div className="space-y-5">
              {/* Preset */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Margin Preset</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["normal", "narrow", "moderate", "wide"] as MarginPreset[]).map((preset) => (
                    <button key={preset} onClick={() => handleMarginPresetChange(preset)} className="px-2 py-2 rounded-md border text-xs capitalize text-center" style={{
                      borderColor: localMarginPreset === preset ? "var(--primary)" : "var(--border)",
                      backgroundColor: localMarginPreset === preset ? "var(--primary)" : "transparent",
                      color: localMarginPreset === preset ? "var(--primary-foreground)" : "var(--foreground)",
                    }}>
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom margins */}
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Custom Margins (mm)</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["top", "bottom", "left", "right"] as (keyof PageMargins)[]).map((side) => (
                    <div key={side} className="flex items-center gap-2">
                      <label className="text-xs capitalize w-12" style={{ color: "var(--muted-foreground)" }}>{side}</label>
                      <input type="number" min={0} max={100} step={0.1} value={localMargins[side]} onChange={(e) => {
                        const updated = { ...localMargins, [side]: Number(e.target.value) };
                        setLocalMargins(updated);
                        setLocalMarginPreset("custom");
                      }} className="flex-1 rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual margin preview */}
              <div className="flex justify-center pt-2">
                <div className="relative border rounded" style={{ width: 140, height: 180, borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                  {/* Inner area representing content */}
                  <div className="absolute border border-dashed" style={{
                    borderColor: "var(--primary)",
                    top: `${(localMargins.top / 50.8) * 50}%`,
                    bottom: `${(localMargins.bottom / 50.8) * 50}%`,
                    left: `${(localMargins.left / 50.8) * 50}%`,
                    right: `${(localMargins.right / 50.8) * 50}%`,
                  }}>
                    <div className="flex items-center justify-center h-full">
                      <span className="text-[8px]" style={{ color: "var(--muted-foreground)" }}>Content area</span>
                    </div>
                  </div>
                  {/* Top label */}
                  <span className="absolute left-1/2 -translate-x-1/2 text-[8px]" style={{ top: 2, color: "var(--muted-foreground)" }}>{localMargins.top}mm</span>
                  <span className="absolute left-1/2 -translate-x-1/2 text-[8px]" style={{ bottom: 2, color: "var(--muted-foreground)" }}>{localMargins.bottom}mm</span>
                </div>
              </div>
            </div>
          )}

          {activeSetupTab === "header-footer" && (
            <PrintHeaderFooterSetup />
          )}

          {activeSetupTab === "sheet" && showSheetTab && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Print Area</label>
                <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Use the Print Area button in the spreadsheet toolbar to set the area.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Rows to Repeat at Top</label>
                <input type="text" placeholder="e.g. 1:2" value={localRepeatRows} onChange={(e) => setLocalRepeatRows(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "var(--foreground)" }}>Columns to Repeat at Left</label>
                <input type="text" placeholder="e.g. A:B" value={localRepeatCols} onChange={(e) => setLocalRepeatCols(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium block" style={{ color: "var(--foreground)" }}>Print Options</label>
                <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                  <input type="checkbox" checked={localPrintGridlines} onChange={(e) => setLocalPrintGridlines(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
                  Print gridlines
                </label>
                <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                  <input type="checkbox" checked={localPrintHeadings} onChange={(e) => setLocalPrintHeadings(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
                  Print row and column headings
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => { resetSettings(); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            <RotateCcw size={12} /> Reset Defaults
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 rounded-md border text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Cancel
            </button>
            <button onClick={handleApply} className="px-4 py-1.5 rounded-md text-xs font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header/Footer setup sub-component
function PrintHeaderFooterSetup() {
  const { settings, updateSettings, setHeader, setFooter } = usePrintLayoutStore();

  const [localHeaderEnabled, setLocalHeaderEnabled] = useState(settings.headerEnabled);
  const [localFooterEnabled, setLocalFooterEnabled] = useState(settings.footerEnabled);
  const [localHeader, setLocalHeader] = useState({ ...settings.header });
  const [localFooter, setLocalFooter] = useState({ ...settings.footer });
  const [localDiffFirst, setLocalDiffFirst] = useState(settings.differentFirstPage);
  const [localFirstHeader, setLocalFirstHeader] = useState({ ...settings.firstPageHeader });
  const [localFirstFooter, setLocalFirstFooter] = useState({ ...settings.firstPageFooter });
  const [activeSection, setActiveSection] = useState<"header" | "footer">("header");

  const AUTO_FIELDS = [
    { label: "Page Number", token: "{page}" },
    { label: "Total Pages", token: "{pages}" },
    { label: "Date", token: "{date}" },
    { label: "Time", token: "{time}" },
    { label: "Title", token: "{title}" },
    { label: "Filename", token: "{filename}" },
    { label: "Author", token: "{author}" },
  ];

  const TEMPLATES = [
    { name: "Standard", header: { left: "", center: "{title}", right: "" }, footer: { left: "", center: "Page {page} of {pages}", right: "" } },
    { name: "Corporate", header: { left: "{title}", center: "", right: "{date}" }, footer: { left: "", center: "Confidential", right: "Page {page}" } },
    { name: "Academic", header: { left: "{author}", center: "", right: "{title}" }, footer: { left: "", center: "", right: "Page {page}" } },
    { name: "Simple", header: { left: "", center: "", right: "" }, footer: { left: "", center: "Page {page}", right: "" } },
  ];

  // Save on blur
  const commitChanges = () => {
    updateSettings({
      headerEnabled: localHeaderEnabled,
      footerEnabled: localFooterEnabled,
      differentFirstPage: localDiffFirst,
      firstPageHeader: localFirstHeader,
      firstPageFooter: localFirstFooter,
    });
    setHeader(localHeader);
    setFooter(localFooter);
  };

  const currentFields = activeSection === "header" ? localHeader : localFooter;
  const setCurrentFields = activeSection === "header" ? setLocalHeader : setLocalFooter;

  const insertAutoField = (position: "left" | "center" | "right", token: string) => {
    setCurrentFields((prev) => ({ ...prev, [position]: prev[position] + token }));
  };

  return (
    <div className="space-y-4" onBlur={commitChanges}>
      {/* Enable toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
          <input type="checkbox" checked={localHeaderEnabled} onChange={(e) => setLocalHeaderEnabled(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
          Enable Header
        </label>
        <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
          <input type="checkbox" checked={localFooterEnabled} onChange={(e) => setLocalFooterEnabled(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
          Enable Footer
        </label>
        <label className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground)" }}>
          <input type="checkbox" checked={localDiffFirst} onChange={(e) => setLocalDiffFirst(e.target.checked)} style={{ accentColor: "var(--primary)" }} />
          Different first page
        </label>
      </div>

      {/* Template quick-apply */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Templates</label>
        <div className="flex gap-2 flex-wrap">
          {TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => { setLocalHeader(t.header); setLocalFooter(t.footer); setLocalHeaderEnabled(true); setLocalFooterEnabled(true); }} className="px-2.5 py-1 rounded border text-[11px]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1">
        {(["header", "footer"] as const).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={`px-3 py-1 rounded text-xs capitalize ${activeSection === s ? "bg-[var(--muted)]" : ""}`} style={{ color: "var(--foreground)" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Three-column editor */}
      <div className="grid grid-cols-3 gap-3">
        {(["left", "center", "right"] as const).map((pos) => (
          <div key={pos}>
            <label className="text-[10px] capitalize block mb-1" style={{ color: "var(--muted-foreground)" }}>{pos}</label>
            <input type="text" value={currentFields[pos]} onChange={(e) => setCurrentFields((prev) => ({ ...prev, [pos]: e.target.value }))} className="w-full rounded border px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} placeholder={`${activeSection} ${pos}...`} />
          </div>
        ))}
      </div>

      {/* Auto-field buttons */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Insert Auto Fields</label>
        <p className="text-[10px] mb-2" style={{ color: "var(--muted-foreground)" }}>Click to insert into the last focused position, or type tokens directly.</p>
        <div className="flex flex-wrap gap-1.5">
          {AUTO_FIELDS.map((f) => (
            <button key={f.token} onClick={() => insertAutoField("center", f.token)} className="px-2 py-1 rounded border text-[10px] hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title={`Inserts ${f.token}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Preview</label>
        <div className="border rounded-md p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
          {localHeaderEnabled && (
            <div className="flex justify-between text-[10px] pb-1.5 mb-2 border-b" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <span>{previewField(localHeader.left)}</span>
              <span>{previewField(localHeader.center)}</span>
              <span>{previewField(localHeader.right)}</span>
            </div>
          )}
          <div className="text-[10px] text-center py-4" style={{ color: "var(--muted-foreground)" }}>
            [Document content]
          </div>
          {localFooterEnabled && (
            <div className="flex justify-between text-[10px] pt-1.5 mt-2 border-t" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <span>{previewField(localFooter.left)}</span>
              <span>{previewField(localFooter.center)}</span>
              <span>{previewField(localFooter.right)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function previewField(text: string): string {
  const now = new Date();
  return text
    .replace(/\{page\}/g, "1")
    .replace(/\{pages\}/g, "5")
    .replace(/\{date\}/g, now.toLocaleDateString())
    .replace(/\{time\}/g, now.toLocaleTimeString())
    .replace(/\{title\}/g, "Document Title")
    .replace(/\{author\}/g, "Author Name")
    .replace(/\{filename\}/g, "document.docx");
}
