"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pen,
  Type,
  Upload,
  X,
  Check,
  Trash2,
  ShieldCheck,
  Save,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  ChevronDown,
  ChevronRight,
  Lock,
  Award,
  Fingerprint,
  AlertCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SignatureAppearance {
  showName: boolean;
  showDate: boolean;
  showReason: boolean;
  showLocation: boolean;
  showContact: boolean;
  showLogo: boolean;
}

export interface SignaturePlacement {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CertificateDetails {
  name: string;
  email: string;
  organization: string;
  reason: string;
  location: string;
  contact: string;
  date: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
}

export interface SavedSignatureItem {
  id: string;
  label: string;
  dataUrl: string;
  isInitials: boolean;
  createdAt: string;
}

interface DigitalSignatureModalProps {
  open: boolean;
  onClose: () => void;
  onSignatureApply: (dataUrl: string, certificate: CertificateDetails, placement: SignaturePlacement) => void;
  totalPages: number;
  currentPage: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CURSIVE_FONTS = [
  { name: "Style 1", css: "'Dancing Script', cursive", fallback: "cursive" },
  { name: "Style 2", css: "'Great Vibes', cursive", fallback: "cursive" },
  { name: "Style 3", css: "'Pacifico', cursive", fallback: "cursive" },
  { name: "Style 4", css: "'Sacramento', cursive", fallback: "cursive" },
  { name: "Style 5", css: "'Allura', cursive", fallback: "cursive" },
];

const INK_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Red", value: "#dc2626" },
  { label: "Dark Green", value: "#166534" },
];

const REASONS = [
  "I am the author of this document",
  "I have reviewed this document",
  "I approve this document",
  "I am signing as a witness",
  "Agreement to terms",
  "Other",
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  transition: "background-color 0.15s",
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
  border: "1px solid var(--primary)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  outline: "none",
  width: "100%",
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "8px 0",
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

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  marginBottom: 4,
  marginTop: 8,
};

const colorSwatch = (color: string, selected: boolean): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: 4,
  backgroundColor: color,
  border: selected ? "2px solid var(--primary)" : "2px solid var(--border)",
  cursor: "pointer",
});

// ─── Component ──────────────────────────────────────────────────────────────

export default function DigitalSignatureModal({
  open,
  onClose,
  onSignatureApply,
  totalPages,
  currentPage,
}: DigitalSignatureModalProps) {
  const [mode, setMode] = useState<"draw" | "type" | "upload">("draw");
  const [isInitials, setIsInitials] = useState(false);

  // Draw state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type state
  const [typedText, setTypedText] = useState("");
  const [typedFont, setTypedFont] = useState(CURSIVE_FONTS[0].css);
  const [typeColor, setTypeColor] = useState("#000000");

  // Upload state
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);

  // Appearance
  const [appearance, setAppearance] = useState<SignatureAppearance>({
    showName: true,
    showDate: true,
    showReason: true,
    showLocation: false,
    showContact: false,
    showLogo: false,
  });

  // Certificate
  const [certificate, setCertificate] = useState<CertificateDetails>({
    name: "",
    email: "",
    organization: "",
    reason: REASONS[0],
    location: "",
    contact: "",
    date: new Date().toISOString().split("T")[0],
    issuer: "Self-Signed",
    serialNumber: Math.random().toString(36).slice(2, 14).toUpperCase(),
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Placement
  const [placement, setPlacement] = useState<SignaturePlacement>({
    page: currentPage,
    x: 50,
    y: 650,
    width: 200,
    height: 80,
  });

  // Saved signatures
  const [savedSignatures, setSavedSignatures] = useState<SavedSignatureItem[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showCertDetails, setShowCertDetails] = useState(false);

  // Canvas init
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
    if (open && mode === "draw") {
      setTimeout(initCanvas, 50);
    }
  }, [open, mode, initCanvas]);

  if (!open) return null;

  // Canvas drawing handlers
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

  const onMouseUp = () => setDrawing(false);

  const getCanvasDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return null;
    return canvas.toDataURL("image/png");
  };

  const getTypedDataUrl = (): string | null => {
    if (!typedText.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = isInitials ? 60 : 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = typeColor;
    ctx.font = `${isInitials ? 24 : 32}px ${typedFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedText, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL("image/png");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedDataUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getDataUrl = (): string | null => {
    if (mode === "draw") return getCanvasDataUrl();
    if (mode === "type") return getTypedDataUrl();
    if (mode === "upload") return uploadedDataUrl;
    return null;
  };

  const handleApply = () => {
    const dataUrl = getDataUrl();
    if (!dataUrl) return;
    onSignatureApply(dataUrl, certificate, placement);
  };

  const handleSave = () => {
    const dataUrl = getDataUrl();
    if (!dataUrl) return;
    setSavedSignatures((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 10),
        label: isInitials ? "Initials" : certificate.name || "Signature",
        dataUrl,
        isInitials,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateCert = (key: keyof CertificateDetails, val: string) =>
    setCertificate((prev) => ({ ...prev, [key]: val }));

  const updatePlacement = (key: keyof SignaturePlacement, val: number) =>
    setPlacement((prev) => ({ ...prev, [key]: val }));

  const toggleAppearance = (key: keyof SignatureAppearance) =>
    setAppearance((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          width: 520,
          maxWidth: "95vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Fingerprint size={18} style={{ color: "var(--primary)" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
              Digital Signature
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setIsInitials(!isInitials)}
              style={{
                ...btnStyle,
                fontSize: 11,
                padding: "4px 10px",
                backgroundColor: isInitials ? "var(--primary)" : "var(--card)",
                color: isInitials ? "var(--primary-foreground)" : "var(--card-foreground)",
              }}
            >
              {isInitials ? "Initials Mode" : "Full Signature"}
            </button>
            <button style={{ ...btnStyle, padding: "4px 6px", border: "none" }} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex" }}>
          <button style={tabStyle(mode === "draw")} onClick={() => setMode("draw")}>
            <Pen size={13} /> Draw
          </button>
          <button style={tabStyle(mode === "type")} onClick={() => setMode("type")}>
            <Type size={13} /> Type
          </button>
          <button style={tabStyle(mode === "upload")} onClick={() => setMode("upload")}>
            <Upload size={13} /> Upload
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* ── DRAW MODE ── */}
          {mode === "draw" && (
            <>
              <canvas
                ref={canvasRef}
                width={480}
                height={isInitials ? 60 : 120}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  cursor: "crosshair",
                  backgroundColor: "#fff",
                  width: "100%",
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button style={{ ...btnStyle, fontSize: 11 }} onClick={initCanvas}>
                  <Trash2 size={12} /> Clear
                </button>
                <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
                  {INK_COLORS.map((c) => (
                    <div
                      key={c.value}
                      title={c.label}
                      style={colorSwatch(c.value, drawColor === c.value)}
                      onClick={() => setDrawColor(c.value)}
                    />
                  ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Width</span>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    style={{ width: 60 }}
                  />
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{lineWidth}px</span>
                </div>
              </div>
            </>
          )}

          {/* ── TYPE MODE ── */}
          {mode === "type" && (
            <>
              <div style={sectionLabel}>{isInitials ? "Your Initials" : "Your Signature"}</div>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder={isInitials ? "Type initials (e.g. J.D.)" : "Type your full name"}
                style={inputStyle}
              />
              <div style={sectionLabel}>Font Style</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {CURSIVE_FONTS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setTypedFont(f.css)}
                    style={{
                      ...btnStyle,
                      width: "100%",
                      justifyContent: "center",
                      fontFamily: f.css,
                      fontSize: 18,
                      padding: "6px 12px",
                      backgroundColor: typedFont === f.css ? "var(--muted)" : "transparent",
                      border: typedFont === f.css ? "1px solid var(--primary)" : "1px solid var(--border)",
                    }}
                  >
                    {typedText || "Signature Preview"}
                  </button>
                ))}
              </div>
              <div style={sectionLabel}>Color</div>
              <div style={{ display: "flex", gap: 4 }}>
                {INK_COLORS.map((c) => (
                  <div
                    key={c.value}
                    title={c.label}
                    style={colorSwatch(c.value, typeColor === c.value)}
                    onClick={() => setTypeColor(c.value)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── UPLOAD MODE ── */}
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
                style={{ ...btnStyle, width: "100%", justifyContent: "center", padding: "16px 12px" }}
                onClick={() => uploadRef.current?.click()}
              >
                <Upload size={16} /> Upload Signature Image
              </button>
              {uploadedDataUrl && (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={uploadedDataUrl}
                    alt="Uploaded signature"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 120,
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      backgroundColor: "#fff",
                    }}
                  />
                  <button
                    style={{ ...btnStyle, fontSize: 11, marginTop: 6 }}
                    onClick={() => setUploadedDataUrl(null)}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Saved Signatures ── */}
          <div
            style={{ ...sectionLabel, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            onClick={() => setShowSaved(!showSaved)}
          >
            {showSaved ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Save size={12} /> Saved Signatures ({savedSignatures.length})
          </div>
          {showSaved && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {savedSignatures.length === 0 && (
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", padding: 8 }}>
                  No saved signatures. Click &quot;Save&quot; to save the current signature for reuse.
                </div>
              )}
              {savedSignatures.map((sig) => (
                <div
                  key={sig.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: 4,
                    cursor: "pointer",
                    backgroundColor: "var(--background)",
                    textAlign: "center",
                  }}
                  onClick={() => {
                    setUploadedDataUrl(sig.dataUrl);
                    setMode("upload");
                  }}
                  title={`Use: ${sig.label}`}
                >
                  <img
                    src={sig.dataUrl}
                    alt={sig.label}
                    style={{ width: 80, height: 32, objectFit: "contain" }}
                  />
                  <div style={{ fontSize: 9, color: "var(--muted-foreground)" }}>{sig.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Signature Appearance ── */}
          <div style={sectionLabel}>Appearance Options</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(
              [
                { key: "showName" as const, label: "Name", icon: <User size={12} /> },
                { key: "showDate" as const, label: "Date", icon: <Calendar size={12} /> },
                { key: "showReason" as const, label: "Reason", icon: <FileText size={12} /> },
                { key: "showLocation" as const, label: "Location", icon: <MapPin size={12} /> },
                { key: "showContact" as const, label: "Contact", icon: <Phone size={12} /> },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleAppearance(opt.key)}
                style={{
                  ...btnStyle,
                  fontSize: 10,
                  padding: "3px 8px",
                  backgroundColor: appearance[opt.key] ? "var(--primary)" : "var(--card)",
                  color: appearance[opt.key] ? "var(--primary-foreground)" : "var(--card-foreground)",
                  border: appearance[opt.key] ? "1px solid var(--primary)" : "1px solid var(--border)",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          {/* ── Certificate Info ── */}
          <div
            style={{ ...sectionLabel, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            onClick={() => setShowCertDetails(!showCertDetails)}
          >
            {showCertDetails ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <ShieldCheck size={12} /> Certificate Details
          </div>
          {showCertDetails && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Name</label>
                  <input type="text" value={certificate.name} onChange={(e) => updateCert("name", e.target.value)} placeholder="Full name" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Email</label>
                  <input type="email" value={certificate.email} onChange={(e) => updateCert("email", e.target.value)} placeholder="email@example.com" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Organization</label>
                  <input type="text" value={certificate.organization} onChange={(e) => updateCert("organization", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Location</label>
                  <input type="text" value={certificate.location} onChange={(e) => updateCert("location", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Reason</label>
                <select value={certificate.reason} onChange={(e) => updateCert("reason", e.target.value)} style={inputStyle}>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Contact</label>
                <input type="text" value={certificate.contact} onChange={(e) => updateCert("contact", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Date</label>
                <input type="date" value={certificate.date} onChange={(e) => updateCert("date", e.target.value)} style={inputStyle} />
              </div>

              {/* Validation Chain */}
              <div style={{ marginTop: 4, padding: 8, backgroundColor: "var(--background)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  <Award size={14} style={{ color: "var(--primary)" }} />
                  Certificate Validation Chain
                </div>
                <div style={{ fontSize: 10, color: "var(--muted-foreground)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Issuer:</span>
                    <span style={{ color: "var(--foreground)" }}>{certificate.issuer}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Serial No:</span>
                    <span style={{ color: "var(--foreground)", fontFamily: "monospace" }}>{certificate.serialNumber}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Valid From:</span>
                    <span style={{ color: "var(--foreground)" }}>{certificate.validFrom}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Valid To:</span>
                    <span style={{ color: "var(--foreground)" }}>{certificate.validTo}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Lock size={10} style={{ color: "#22c55e" }} />
                    <span style={{ color: "#22c55e", fontSize: 10 }}>SHA-256 with RSA Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Placement Controls ── */}
          <div style={sectionLabel}>Placement</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 80 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Page</label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={placement.page}
                onChange={(e) => updatePlacement("page", Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>X</label>
              <input type="number" value={placement.x} onChange={(e) => updatePlacement("x", Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Y</label>
              <input type="number" value={placement.y} onChange={(e) => updatePlacement("y", Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Width</label>
              <input type="number" value={placement.width} onChange={(e) => updatePlacement("width", Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Height</label>
              <input type="number" value={placement.height} onChange={(e) => updatePlacement("height", Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button style={btnStyle} onClick={handleSave}>
            <Save size={14} /> Save for Reuse
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={btnStyle} onClick={onClose}>
              Cancel
            </button>
            <button style={btnPrimaryStyle} onClick={handleApply}>
              <Check size={14} /> Apply Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
