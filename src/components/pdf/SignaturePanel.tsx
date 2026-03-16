"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Pen,
  Type,
  Upload,
  Trash2,
  ShieldCheck,
  X,
  Check,
  MousePointer,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

/* ── props ────────────────────────────────────────────────────────────────── */

interface SignaturePanelProps {
  mode: "draw" | "type" | "upload";
  onModeChange: (m: "draw" | "type" | "upload") => void;
  typedText: string;
  onTypedTextChange: (t: string) => void;
  typedFont: string;
  onTypedFontChange: (f: string) => void;
  uploadedDataUrl: string | null;
  onUploadedDataUrlChange: (url: string | null) => void;
  onSignatureReady: (dataUrl: string) => void;
  showCertModal: boolean;
  onToggleCertModal: () => void;
  certificateInfo: {
    name: string;
    email: string;
    organization: string;
    reason: string;
    date: string;
  };
  onCertificateInfoChange: (info: any) => void;
  onApplyCertificate: () => void;
  certApplied: boolean;
}

/* ── helpers ──────────────────────────────────────────────────────────────── */

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "7px 0",
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: active ? "var(--primary)" : "var(--card)",
  color: active ? "var(--primary-foreground)" : "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  transition: "background-color 0.15s",
});

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  marginBottom: 6,
  marginTop: 10,
};

const signatureFonts = [
  "Dancing Script",
  "Great Vibes",
  "Pacifico",
  "Sacramento",
  "Allura",
];

const inkColors = [
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Red", value: "#dc2626" },
];

/* ── component ────────────────────────────────────────────────────────────── */

export default function SignaturePanel(props: SignaturePanelProps) {
  const {
    mode,
    onModeChange,
    typedText,
    onTypedTextChange,
    typedFont,
    onTypedFontChange,
    uploadedDataUrl,
    onUploadedDataUrlChange,
    onSignatureReady,
    showCertModal,
    onToggleCertModal,
    certificateInfo,
    onCertificateInfoChange,
    onApplyCertificate,
    certApplied,
  } = props;

  /* ── draw state ─────────────────────────────────────────────────────── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [hasDrawn, setHasDrawn] = useState(false);

  /* ── type state ─────────────────────────────────────────────────────── */
  const [typeColor, setTypeColor] = useState("#000000");

  /* ── upload state ───────────────────────────────────────────────────── */
  const uploadRef = useRef<HTMLInputElement>(null);
  const [cropWidth, setCropWidth] = useState(250);
  const [cropHeight, setCropHeight] = useState(100);

  /* ── canvas drawing ─────────────────────────────────────────────────── */
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  useEffect(() => {
    if (mode === "draw") initCanvas();
  }, [mode, initCanvas]);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const onMouseUp = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
  };

  const getCanvasDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return null;
    return canvas.toDataURL("image/png");
  };

  /* ── typed signature as data URL ────────────────────────────────────── */
  const getTypedDataUrl = (): string | null => {
    if (!typedText.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 250, 100);
    ctx.fillStyle = typeColor;
    ctx.font = `32px "${typedFont}", cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedText, 125, 50);
    return canvas.toDataURL("image/png");
  };

  /* ── upload handling ────────────────────────────────────────────────── */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUploadedDataUrlChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── place signature ────────────────────────────────────────────────── */
  const handlePlace = () => {
    let dataUrl: string | null = null;
    if (mode === "draw") dataUrl = getCanvasDataUrl();
    else if (mode === "type") dataUrl = getTypedDataUrl();
    else if (mode === "upload") dataUrl = uploadedDataUrl;
    if (dataUrl) onSignatureReady(dataUrl);
  };

  /* ── cert info helper ───────────────────────────────────────────────── */
  const updateCert = (key: string, val: string) =>
    onCertificateInfoChange({ ...certificateInfo, [key]: val });

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        width: 280,
        height: "100%",
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Mode tabs */}
      <div style={{ display: "flex" }}>
        <button style={tabStyle(mode === "draw")} onClick={() => onModeChange("draw")}>
          <Pen size={13} /> Draw
        </button>
        <button style={tabStyle(mode === "type")} onClick={() => onModeChange("type")}>
          <Type size={13} /> Type
        </button>
        <button style={tabStyle(mode === "upload")} onClick={() => onModeChange("upload")}>
          <Upload size={13} /> Upload
        </button>
      </div>

      <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* ── DRAW MODE ───────────────────────────────────────────────── */}
        {mode === "draw" && (
          <>
            <canvas
              ref={canvasRef}
              width={250}
              height={100}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                cursor: "crosshair",
                backgroundColor: "#fff",
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
            <button
              style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
              onClick={clearCanvas}
            >
              <Trash2 size={14} /> Clear
            </button>

            <div style={sectionHeaderStyle}>Line Thickness</div>
            <input
              type="range"
              min={1}
              max={8}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              {lineWidth}px
            </span>

            <div style={sectionHeaderStyle}>Ink Color</div>
            <div style={{ display: "flex", gap: 6 }}>
              {inkColors.map((c) => (
                <div
                  key={c.value}
                  title={c.label}
                  onClick={() => setDrawColor(c.value)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 4,
                    backgroundColor: c.value,
                    border:
                      drawColor === c.value
                        ? "2px solid var(--primary)"
                        : "2px solid var(--border)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ── TYPE MODE ───────────────────────────────────────────────── */}
        {mode === "type" && (
          <>
            <div style={sectionHeaderStyle}>Your Signature</div>
            <input
              type="text"
              value={typedText}
              onChange={(e) => onTypedTextChange(e.target.value)}
              placeholder="Type your name"
              style={{ ...inputStyle, width: "100%" }}
            />

            <div style={sectionHeaderStyle}>Font</div>
            <select
              value={typedFont}
              onChange={(e) => onTypedFontChange(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            >
              {signatureFonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <div style={sectionHeaderStyle}>Preview</div>
            <div
              style={{
                width: "100%",
                height: 80,
                border: "1px solid var(--border)",
                borderRadius: 6,
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: `"${typedFont}", cursive`,
                fontSize: 28,
                color: typeColor,
              }}
            >
              {typedText || "Preview"}
            </div>

            <div style={sectionHeaderStyle}>Color</div>
            <div style={{ display: "flex", gap: 6 }}>
              {inkColors.map((c) => (
                <div
                  key={c.value}
                  title={c.label}
                  onClick={() => setTypeColor(c.value)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 4,
                    backgroundColor: c.value,
                    border:
                      typeColor === c.value
                        ? "2px solid var(--primary)"
                        : "2px solid var(--border)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ── UPLOAD MODE ─────────────────────────────────────────────── */}
        {mode === "upload" && (
          <>
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
            <button
              style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
              onClick={() => uploadRef.current?.click()}
            >
              <Upload size={14} /> Upload Image
            </button>

            {uploadedDataUrl && (
              <>
                <div style={sectionHeaderStyle}>Preview</div>
                <img
                  src={uploadedDataUrl}
                  alt="Signature"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "contain",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    backgroundColor: "#fff",
                  }}
                />

                <div style={sectionHeaderStyle}>Resize</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                    <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                      Width
                    </label>
                    <input
                      type="number"
                      value={cropWidth}
                      onChange={(e) => setCropWidth(Number(e.target.value))}
                      style={{ ...inputStyle, width: "100%" }}
                      min={20}
                      max={600}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                    <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                      Height
                    </label>
                    <input
                      type="number"
                      value={cropHeight}
                      onChange={(e) => setCropHeight(Number(e.target.value))}
                      style={{ ...inputStyle, width: "100%" }}
                      min={20}
                      max={300}
                    />
                  </div>
                </div>

                <button
                  style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
                  onClick={() => onUploadedDataUrlChange(null)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </>
            )}
          </>
        )}

        {/* ── Place Signature button ──────────────────────────────────── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
          <button
            style={{ ...btnPrimaryStyle, width: "100%", justifyContent: "center" }}
            onClick={handlePlace}
          >
            <MousePointer size={14} /> Click on PDF to Place
          </button>
        </div>

        {/* ── Certificate Section ─────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
          <div style={sectionHeaderStyle}>Certificate-Based Signature</div>

          {certApplied && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#22c55e",
                marginBottom: 6,
              }}
            >
              <ShieldCheck size={16} /> Certificate Applied
            </div>
          )}

          {!certApplied && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--muted-foreground)",
                marginBottom: 6,
              }}
            >
              <ShieldCheck size={16} style={{ opacity: 0.4 }} /> Unsigned
            </div>
          )}

          <button
            style={{ ...btnStyle, width: "100%", justifyContent: "center" }}
            onClick={onToggleCertModal}
          >
            <ShieldCheck size={14} />{" "}
            {certApplied ? "View Certificate" : "Add Certificate Signature"}
          </button>
        </div>

        {/* ── Certificate Modal ───────────────────────────────────────── */}
        {showCertModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onToggleCertModal();
            }}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 20,
                width: 380,
                maxWidth: "90vw",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  Certificate-Based Signature
                </h3>
                <button
                  style={{ ...btnStyle, padding: "4px 6px", border: "none" }}
                  onClick={onToggleCertModal}
                >
                  <X size={16} />
                </button>
              </div>

              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Name
              </label>
              <input
                type="text"
                value={certificateInfo.name}
                onChange={(e) => updateCert("name", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                placeholder="Full name"
              />

              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Email
              </label>
              <input
                type="email"
                value={certificateInfo.email}
                onChange={(e) => updateCert("email", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                placeholder="email@example.com"
              />

              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Organization
              </label>
              <input
                type="text"
                value={certificateInfo.organization}
                onChange={(e) => updateCert("organization", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                placeholder="Organization name"
              />

              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Reason
              </label>
              <select
                value={certificateInfo.reason}
                onChange={(e) => updateCert("reason", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              >
                <option value="">Select reason...</option>
                <option value="I am the author of this document">
                  I am the author of this document
                </option>
                <option value="I have reviewed this document">
                  I have reviewed this document
                </option>
                <option value="I approve this document">
                  I approve this document
                </option>
                <option value="I am signing as a witness">
                  I am signing as a witness
                </option>
                <option value="Other">Other</option>
              </select>

              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Date
              </label>
              <input
                type="date"
                value={certificateInfo.date}
                onChange={(e) => updateCert("date", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <button style={btnStyle} onClick={onToggleCertModal}>
                  Cancel
                </button>
                <button style={btnPrimaryStyle} onClick={onApplyCertificate}>
                  <Check size={14} /> Apply Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
