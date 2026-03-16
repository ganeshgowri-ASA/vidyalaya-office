"use client";

import React, { useState } from "react";
import {
  X, Shield, Lock, Unlock, Eye, EyeOff, ShieldCheck, Award,
  ScanText, Loader2, Columns2, ChevronLeft, ChevronRight, Upload,
  FormInput, Image,
} from "lucide-react";

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px",
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 13, transition: "background-color 0.15s",
};
const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle, backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};
const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)", color: "var(--card-foreground)",
  border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px",
  fontSize: 13, outline: "none",
};

// ─── Password Protection Modal ─────────────────────────────────────────────

interface SecurityConfig {
  hasPassword: boolean;
  openPassword: string;
  permissionPassword: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowEditing: boolean;
  allowAnnotations: boolean;
  encryptionLevel: "128-aes" | "256-aes";
}

interface PasswordProtectionModalProps {
  config: SecurityConfig;
  onConfigChange: (config: SecurityConfig) => void;
  onApply: () => void;
  onClose: () => void;
  applied: boolean;
}

export function PasswordProtectionModal({ config, onConfigChange, onApply, onClose, applied }: PasswordProtectionModalProps) {
  const [showOpenPwd, setShowOpenPwd] = useState(false);
  const [showPermPwd, setShowPermPwd] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState("");
  const [confirmPerm, setConfirmPerm] = useState("");

  const update = (partial: Partial<SecurityConfig>) => onConfigChange({ ...config, ...partial });

  const getStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: "", color: "transparent", width: "0%" };
    if (pwd.length < 6) return { label: "Weak", color: "#dc2626", width: "33%" };
    if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: "Medium", color: "#ca8a04", width: "66%" };
    return { label: "Strong", color: "#16a34a", width: "100%" };
  };

  const strength = getStrength(config.openPassword);
  const pwdMatch = config.openPassword === confirmOpen || !confirmOpen;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="flex flex-col gap-4 p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: 480, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Shield size={18} /> PDF Security & Protection
          </h3>
          <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Document Open Password */}
        <div className="flex flex-col gap-2 p-3" style={{ backgroundColor: "var(--secondary)", borderRadius: 8 }}>
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}>
            <input type="checkbox" checked={config.hasPassword} onChange={(e) => update({ hasPassword: e.target.checked })} />
            <Lock size={14} /> Document Open Password
          </label>

          {config.hasPassword && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="relative">
                <input type={showOpenPwd ? "text" : "password"} value={config.openPassword}
                  onChange={(e) => update({ openPassword: e.target.value })} style={{ ...inputStyle, width: "100%", paddingRight: 36 }}
                  placeholder="Password to open document" />
                <button onClick={() => setShowOpenPwd(!showOpenPwd)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer" }}>
                  {showOpenPwd ? <EyeOff size={14} style={{ color: "var(--muted-foreground)" }} /> : <Eye size={14} style={{ color: "var(--muted-foreground)" }} />}
                </button>
              </div>
              {config.openPassword && (
                <div className="flex items-center gap-2">
                  <div style={{ flex: 1, height: 4, backgroundColor: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: strength.width, height: "100%", backgroundColor: strength.color, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
              <input type={showOpenPwd ? "text" : "password"} value={confirmOpen}
                onChange={(e) => setConfirmOpen(e.target.value)} style={inputStyle} placeholder="Confirm password" />
              {confirmOpen && !pwdMatch && (
                <span style={{ fontSize: 10, color: "#dc2626" }}>Passwords do not match</span>
              )}
            </div>
          )}
        </div>

        {/* Permissions Password */}
        <div className="flex flex-col gap-2 p-3" style={{ backgroundColor: "var(--secondary)", borderRadius: 8 }}>
          <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}>
            <input type="checkbox" checked={!!config.permissionPassword}
              onChange={(e) => update({ permissionPassword: e.target.checked ? config.permissionPassword || "" : "" })} />
            <Unlock size={14} /> Permissions Password (Owner)
          </label>

          {config.permissionPassword !== undefined && config.hasPassword && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="relative">
                <input type={showPermPwd ? "text" : "password"} value={config.permissionPassword}
                  onChange={(e) => update({ permissionPassword: e.target.value })}
                  style={{ ...inputStyle, width: "100%", paddingRight: 36 }} placeholder="Owner password" />
                <button onClick={() => setShowPermPwd(!showPermPwd)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer" }}>
                  {showPermPwd ? <EyeOff size={14} style={{ color: "var(--muted-foreground)" }} /> : <Eye size={14} style={{ color: "var(--muted-foreground)" }} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        {config.hasPassword && (
          <div className="flex flex-col gap-2 p-3" style={{ backgroundColor: "var(--secondary)", borderRadius: 8 }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Permissions</h4>
            {[
              { key: "allowPrinting", label: "Allow Printing" },
              { key: "allowCopying", label: "Allow Copying Text" },
              { key: "allowEditing", label: "Allow Editing" },
              { key: "allowAnnotations", label: "Allow Annotations" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
                <input type="checkbox" checked={(config as any)[key]}
                  onChange={(e) => update({ [key]: e.target.checked } as any)} />
                {label}
              </label>
            ))}
          </div>
        )}

        {/* Encryption */}
        {config.hasPassword && (
          <div className="flex flex-col gap-2 p-3" style={{ backgroundColor: "var(--secondary)", borderRadius: 8 }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Encryption Level</h4>
            {[
              { value: "128-aes" as const, label: "128-bit AES", desc: "Compatible with older viewers" },
              { value: "256-aes" as const, label: "256-bit AES (Recommended)", desc: "Strongest encryption" },
            ].map(({ value, label, desc }) => (
              <label key={value} className="flex items-start gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
                <input type="radio" name="encryption" value={value} checked={config.encryptionLevel === value}
                  onChange={() => update({ encryptionLevel: value })} style={{ marginTop: 2 }} />
                <div><div style={{ fontWeight: 500 }}>{label}</div><div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{desc}</div></div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button style={btnPrimaryStyle} onClick={onApply} disabled={config.hasPassword && !config.openPassword}>
            <Shield size={16} /> Apply Protection
          </button>
          {applied && (
            <button style={{ ...btnStyle, color: "#dc2626" }} onClick={() => { update({ hasPassword: false, openPassword: "", permissionPassword: "" }); onApply(); }}>
              Remove Protection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Compare Panel ──────────────────────────────────────────────────────────

interface ComparePanelProps {
  pdfLoaded: boolean;
  pdfName: string;
  compareName: string;
  comparePage: number;
  compareTotalPages: number;
  totalPages: number;
  highlightDiffs: boolean;
  syncScroll: boolean;
  onLoadCompareDoc: (file: File) => void;
  onPageChange: (p: number) => void;
  onToggleHighlightDiffs: () => void;
  onToggleSyncScroll: () => void;
  canvasRef1: React.RefObject<HTMLCanvasElement>;
  canvasRef2: React.RefObject<HTMLCanvasElement>;
}

export function ComparePanel({
  pdfLoaded, pdfName, compareName, comparePage, compareTotalPages, totalPages,
  highlightDiffs, syncScroll, onLoadCompareDoc, onPageChange,
  onToggleHighlightDiffs, onToggleSyncScroll, canvasRef1, canvasRef2,
}: ComparePanelProps) {
  const [hover, setHover] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (!pdfLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p style={{ color: "var(--muted-foreground)" }}>Load a PDF in the View tab first, then compare here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 600 }}>
          <Columns2 size={16} style={{ display: "inline", marginRight: 6 }} /> Side-by-Side Compare
        </span>
        <div className="flex-1" />
        <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          <input type="checkbox" checked={highlightDiffs} onChange={onToggleHighlightDiffs} /> Highlight Diffs
        </label>
        <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          <input type="checkbox" checked={syncScroll} onChange={onToggleSyncScroll} /> Sync Scroll
        </label>
        {compareName && (
          <>
            <button style={btnStyle} onClick={() => onPageChange(Math.max(1, comparePage - 1))} disabled={comparePage <= 1}><ChevronLeft size={14} /></button>
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>Page {comparePage}</span>
            <button style={btnStyle} onClick={() => onPageChange(Math.min(Math.max(totalPages, compareTotalPages), comparePage + 1))}
              disabled={comparePage >= Math.max(totalPages, compareTotalPages)}><ChevronRight size={14} /></button>
          </>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: original */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: "2px solid var(--border)" }}>
          <div className="px-3 py-1 text-center" style={{ backgroundColor: "var(--secondary)", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)", fontWeight: 600 }}>
            Original: {pdfName} ({totalPages} pages)
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ backgroundColor: "var(--muted)" }}>
            <div style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}><canvas ref={canvasRef1} style={{ display: "block" }} /></div>
          </div>
        </div>

        {/* Right: compare */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!compareName ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-sm">
                <div
                  onDragOver={(e) => { e.preventDefault(); setHover(true); }}
                  onDragLeave={() => setHover(false)}
                  onDrop={(e) => { e.preventDefault(); setHover(false); if (e.dataTransfer.files[0]) onLoadCompareDoc(e.dataTransfer.files[0]); }}
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 cursor-pointer"
                  style={{ border: `2px dashed ${hover ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, padding: 40,
                    backgroundColor: hover ? "var(--accent)" : "var(--card)", transition: "all 0.2s" }}>
                  <Upload size={36} style={{ color: "var(--muted-foreground)" }} />
                  <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>Drop a second PDF to compare</p>
                  <input ref={inputRef} type="file" accept=".pdf" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) onLoadCompareDoc(e.target.files[0]); }} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-3 py-1 text-center" style={{ backgroundColor: "var(--secondary)", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)", fontWeight: 600 }}>
                Compare: {compareName} ({compareTotalPages} pages)
              </div>
              <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ backgroundColor: "var(--muted)" }}>
                <div style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}><canvas ref={canvasRef2} style={{ display: "block" }} /></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {highlightDiffs && compareName && (
        <div className="flex items-center gap-4 px-4 py-1" style={{ backgroundColor: "var(--card)", borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--muted-foreground)" }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: "#16a34a", marginRight: 4 }} />Added</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: "#dc2626", marginRight: 4 }} />Removed</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: "#ca8a04", marginRight: 4 }} />Modified</span>
        </div>
      )}
    </div>
  );
}

// ─── OCR Panel ──────────────────────────────────────────────────────────────

interface OcrPanelProps {
  processing: boolean;
  complete: boolean;
  language: string;
  onLanguageChange: (l: string) => void;
  onStartOcr: () => void;
  pdfLoaded: boolean;
}

export function OcrPanel({ processing, complete, language, onLanguageChange, onStartOcr, pdfLoaded }: OcrPanelProps) {
  const languages = [
    { code: "eng", label: "English" }, { code: "spa", label: "Spanish" },
    { code: "fra", label: "French" }, { code: "deu", label: "German" },
    { code: "zho", label: "Chinese" }, { code: "jpn", label: "Japanese" },
    { code: "ara", label: "Arabic" }, { code: "hin", label: "Hindi" },
    { code: "por", label: "Portuguese" }, { code: "rus", label: "Russian" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <ScanText size={20} /> OCR — Text Recognition
        </h2>

        <div className="flex items-center gap-3 p-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%",
            backgroundColor: complete ? "#16a34a" : processing ? "#ca8a04" : "#dc2626" }} />
          <span style={{ fontSize: 13, color: "var(--foreground)" }}>
            {complete ? "OCR Complete — Text Layer Available" : processing ? "Processing..." : "Not Processed"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>OCR Language</label>
          <select value={language} onChange={(e) => onLanguageChange(e.target.value)} style={inputStyle}>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          OCR extracts text from scanned documents and images within PDFs, making them searchable and selectable.
        </p>

        <button style={btnPrimaryStyle} onClick={onStartOcr} disabled={processing || !pdfLoaded}>
          {processing ? <><Loader2 size={16} className="animate-spin" /> Analyzing Document...</> : complete ? <><ScanText size={16} /> Re-run OCR</> : <><ScanText size={16} /> Start OCR</>}
        </button>

        {complete && (
          <div className="p-3" style={{ backgroundColor: "var(--accent)", borderRadius: 8, fontSize: 12, color: "var(--accent-foreground)" }}>
            Text layer successfully extracted. The document is now searchable.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PDF Creator Panel ──────────────────────────────────────────────────────

interface CreatorElement {
  id: string;
  type: "text" | "image" | "table" | "shape";
  x: number; y: number; width: number; height: number; page: number;
  text?: string; fontSize?: number; fontFamily?: string; color?: string;
  bold?: boolean; italic?: boolean; imageDataUrl?: string;
  tableRows?: number; tableCols?: number; tableData?: string[][];
  shapeType?: string;
}

interface PdfCreatorPanelProps {
  elements: CreatorElement[];
  onAddElement: (el: CreatorElement) => void;
  onRemoveElement: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  selectedElement: string | null;
  onGeneratePdf: (pageSize: string, orientation: string) => void;
}

export function PdfCreatorPanel({
  elements, onAddElement, onRemoveElement, onSelectElement, selectedElement, onGeneratePdf,
}: PdfCreatorPanelProps) {
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");

  const addText = () => onAddElement({
    id: Math.random().toString(36).slice(2, 10), type: "text",
    x: 50, y: 50, width: 200, height: 40, page: 1,
    text: "New Text", fontSize: 16, fontFamily: "sans-serif", color: "#000000",
  });

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => onAddElement({
        id: Math.random().toString(36).slice(2, 10), type: "image",
        x: 50, y: 50, width: 200, height: 150, page: 1,
        imageDataUrl: reader.result as string,
      });
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addTable = () => onAddElement({
    id: Math.random().toString(36).slice(2, 10), type: "table",
    x: 50, y: 50, width: 300, height: 120, page: 1,
    tableRows: 3, tableCols: 3, tableData: Array(3).fill(null).map(() => Array(3).fill("")),
  });

  const selected = elements.find((e) => e.id === selectedElement);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Tool palette */}
      <div className="flex flex-col gap-3 p-3 overflow-y-auto"
        style={{ width: 220, backgroundColor: "var(--card)", borderRight: "1px solid var(--border)" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Create PDF from Scratch
        </h3>
        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start" }} onClick={addText}>
          <FormInput size={16} /> Add Text Block
        </button>
        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start" }} onClick={addImage}>
          <Image size={16} /> Add Image
        </button>
        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start" }} onClick={addTable}>
          <Columns2 size={16} /> Add Table
        </button>

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Elements ({elements.length})
        </h3>
        {elements.map((el) => (
          <div key={el.id} className="flex items-center gap-2 px-2 py-1 cursor-pointer"
            onClick={() => onSelectElement(el.id)}
            style={{ backgroundColor: selectedElement === el.id ? "var(--accent)" : "var(--secondary)", borderRadius: 4, fontSize: 11 }}>
            <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>{el.type}: {el.text?.substring(0, 15) ?? el.type}</span>
            <button onClick={(e) => { e.stopPropagation(); onRemoveElement(el.id); }}
              style={{ border: "none", background: "none", cursor: "pointer", padding: 1 }}>
              <X size={10} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Page Size</label>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={inputStyle}>
            <option value="a4">A4</option><option value="letter">Letter</option>
            <option value="legal">Legal</option><option value="a3">A3</option>
          </select>
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Orientation</label>
          <div className="flex gap-1">
            <button onClick={() => setOrientation("portrait")} style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 11,
              backgroundColor: orientation === "portrait" ? "var(--primary)" : "var(--card)", color: orientation === "portrait" ? "var(--primary-foreground)" : "var(--card-foreground)" }}>Portrait</button>
            <button onClick={() => setOrientation("landscape")} style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 11,
              backgroundColor: orientation === "landscape" ? "var(--primary)" : "var(--card)", color: orientation === "landscape" ? "var(--primary-foreground)" : "var(--card-foreground)" }}>Landscape</button>
          </div>
        </div>

        <button style={btnPrimaryStyle} onClick={() => onGeneratePdf(pageSize, orientation)}>
          Generate PDF
        </button>
      </div>

      {/* Preview canvas */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: "var(--muted)" }}>
        <div style={{
          width: orientation === "portrait" ? 420 : 594,
          height: orientation === "portrait" ? 594 : 420,
          backgroundColor: "#ffffff", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
          position: "relative", borderRadius: 2,
        }}>
          {elements.map((el) => (
            <div key={el.id} onClick={() => onSelectElement(el.id)}
              style={{
                position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height,
                border: selectedElement === el.id ? "2px solid var(--primary)" : "1px dashed var(--border)",
                borderRadius: 2, cursor: "pointer", padding: 4, overflow: "hidden",
                fontSize: el.fontSize ?? 14, fontFamily: el.fontFamily ?? "sans-serif",
                color: el.color ?? "#000", fontWeight: el.bold ? "bold" : "normal",
                fontStyle: el.italic ? "italic" : "normal",
              }}>
              {el.type === "text" && (el.text ?? "Text")}
              {el.type === "image" && el.imageDataUrl && (
                <img src={el.imageDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              )}
              {el.type === "table" && (
                <div style={{ fontSize: 8, color: "#666" }}>Table {el.tableRows}×{el.tableCols}</div>
              )}
            </div>
          ))}
          {elements.length === 0 && (
            <div className="flex items-center justify-center h-full" style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
              Add elements from the sidebar to build your PDF
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { SecurityConfig, CreatorElement };
