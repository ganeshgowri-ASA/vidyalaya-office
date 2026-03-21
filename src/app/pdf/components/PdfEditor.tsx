"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Type, Highlighter, PenTool, Stamp, Pencil, Undo2, EyeOff,
  Underline, Strikethrough, StickyNote, RectangleHorizontal, Layers,
  Image, Ruler, Hash, Droplets, AlignCenter, ShieldCheck, Award,
  ScanText, Loader2, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  SquareIcon, CircleIcon, Minus, ArrowRightIcon, Star, Hexagon,
  Upload, Bold, Italic, Save, Trash2, Download, Move,
} from "lucide-react";
import type { Annotation } from "./PdfViewer";

// ─── Styles ───────────────────────────────────────────────────────────────────

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

type EditMode = "none" | "text" | "highlight" | "underline" | "strikethrough" | "draw" |
  "stamp" | "signature" | "redaction" | "sticky-note" | "shape" | "image" | "measure";
type SignatureMode = "draw" | "type" | "upload";

interface PdfEditorProps {
  pdfLoaded: boolean;
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (p: number) => void;
  onZoomChange: (z: number) => void;
  annotations: Annotation[];
  onAnnotationsChange: (a: Annotation[]) => void;
  mainCanvasRef: React.RefObject<HTMLCanvasElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  renderAnnotations: (pageNum: number) => void;
  onAddPageNumbers?: () => void;
  onShowWatermark?: () => void;
  onShowHeaderFooter?: () => void;
  onShowCertModal?: () => void;
  onRunOcr?: () => void;
  onFlattenAnnotations?: () => void;
  pageNumbersAdded?: boolean;
  watermarkApplied?: boolean;
  headerFooterApplied?: boolean;
  certSignatureApplied?: boolean;
  certificateInfo?: { name: string; organization: string; date: string };
  ocrProcessing?: boolean;
  ocrComplete?: boolean;
  flattenApplied?: boolean;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function PdfEditor({
  pdfLoaded, currentPage, totalPages, zoom, onPageChange, onZoomChange,
  annotations, onAnnotationsChange, mainCanvasRef, overlayCanvasRef, containerRef,
  renderAnnotations, onAddPageNumbers, onShowWatermark, onShowHeaderFooter,
  onShowCertModal, onRunOcr, onFlattenAnnotations, pageNumbersAdded, watermarkApplied,
  headerFooterApplied, certSignatureApplied, certificateInfo, ocrProcessing, ocrComplete,
  flattenApplied,
}: PdfEditorProps) {
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [drawColor, setDrawColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedStamp, setSelectedStamp] = useState("Approved");
  const [activeShape, setActiveShape] = useState<string>("rectangle");
  const [stickyNoteColor, setStickyNoteColor] = useState("#fff9c4");
  const [fillColor, setFillColor] = useState("transparent");
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [measureUnit, setMeasureUnit] = useState("px");

  // Signature state
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [typedSigText, setTypedSigText] = useState("");
  const [typedSigFont, setTypedSigFont] = useState("'Dancing Script', cursive");
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigDrawingRef = useRef(false);
  const sigLastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Saved signatures
  const [savedSignatures, setSavedSignatures] = useState<{ id: string; label: string; dataUrl: string; createdAt: string }[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("pdf-saved-signatures") || "[]"); } catch { return []; }
    }
    return [];
  });
  const [sigLabel, setSigLabel] = useState("");

  // Drag state for placed signatures
  const [draggingSigId, setDraggingSigId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Signature ink color
  const [sigInkColor, setSigInkColor] = useState("#000000");

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<{ x: number; y: number }[]>([]);

  // Text placement
  const [textPlacement, setTextPlacement] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState("");

  // Redaction
  const [redactionStart, setRedactionStart] = useState<{ x: number; y: number } | null>(null);

  // Image
  const [imageToAdd, setImageToAdd] = useState<string | null>(null);

  if (!pdfLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p style={{ color: "var(--muted-foreground)" }}>Please load a PDF in the View tab first.</p>
      </div>
    );
  }

  const stamps = ["Approved", "Rejected", "Draft", "Confidential", "Final"];
  const stampColors: Record<string, string> = {
    Approved: "#16a34a", Rejected: "#dc2626", Draft: "#ca8a04",
    Confidential: "#7c3aed", Final: "#2563eb",
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Check if a click hits a placed signature for drag repositioning
  const findSignatureAt = (x: number, y: number) => {
    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i];
      if (a.type === "signature" && a.page === currentPage) {
        const w = a.width ?? 200; const h = a.height ?? 80;
        if (x >= a.x && x <= a.x + w && y >= a.y && y <= a.y + h) return a;
      }
    }
    return null;
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // Allow drag repositioning of placed signatures when in signature mode
    if (editMode === "signature") {
      const hitSig = findSignatureAt(x, y);
      if (hitSig) {
        setDraggingSigId(hitSig.id);
        dragOffsetRef.current = { x: x - hitSig.x, y: y - hitSig.y };
        return;
      }
    }

    if (editMode === "text") { setTextPlacement({ x, y }); return; }
    if (editMode === "highlight") {
      onAnnotationsChange([...annotations, { id: uid(), type: "highlight", page: currentPage, x, y, width: 200, height: 30, color: drawColor }]);
      return;
    }
    if (editMode === "underline") {
      onAnnotationsChange([...annotations, { id: uid(), type: "underline", page: currentPage, x, y, width: 200, height: 20, color: drawColor }]);
      return;
    }
    if (editMode === "strikethrough") {
      onAnnotationsChange([...annotations, { id: uid(), type: "strikethrough", page: currentPage, x, y, width: 200, height: 20, color: drawColor }]);
      return;
    }
    if (editMode === "draw") { setIsDrawing(true); setCurrentDrawPoints([{ x, y }]); return; }
    if (editMode === "stamp") {
      onAnnotationsChange([...annotations, { id: uid(), type: "stamp", page: currentPage, x, y, stamp: selectedStamp }]);
      return;
    }
    if (editMode === "signature") {
      let dataUrl: string | null = null;
      if (signatureMode === "draw" && signatureCanvasRef.current) {
        dataUrl = signatureCanvasRef.current.toDataURL();
      } else if (signatureMode === "type" && typedSigText) {
        const canvas = document.createElement("canvas");
        canvas.width = 300; canvas.height = 80;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 300, 80);
        ctx.font = `32px ${typedSigFont}`; ctx.fillStyle = sigInkColor;
        ctx.textBaseline = "middle";
        ctx.fillText(typedSigText, 10, 40);
        dataUrl = canvas.toDataURL();
      } else if (signatureMode === "upload" && uploadedSigUrl) {
        dataUrl = uploadedSigUrl;
      }
      if (dataUrl) {
        onAnnotationsChange([...annotations, { id: uid(), type: "signature", page: currentPage, x, y, width: 200, height: 80, signatureDataUrl: dataUrl }]);
      }
      return;
    }
    if (editMode === "redaction") { setRedactionStart({ x, y }); return; }
    if (editMode === "sticky-note") {
      onAnnotationsChange([...annotations, { id: uid(), type: "sticky-note", page: currentPage, x, y, width: 140, height: 120, text: "Note...", noteColor: stickyNoteColor, noteOpen: true }]);
      return;
    }
    if (editMode === "shape") {
      onAnnotationsChange([...annotations, { id: uid(), type: "shape", page: currentPage, x, y, width: 120, height: 80, shapeType: activeShape, color: drawColor, strokeWidth }]);
      return;
    }
    if (editMode === "image" && imageToAdd) {
      onAnnotationsChange([...annotations, { id: uid(), type: "signature", page: currentPage, x, y, width: 200, height: 150, signatureDataUrl: imageToAdd }]);
      return;
    }
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Handle drag repositioning
    if (draggingSigId) {
      const { x, y } = getCanvasCoords(e);
      const newX = x - dragOffsetRef.current.x;
      const newY = y - dragOffsetRef.current.y;
      onAnnotationsChange(annotations.map((a) =>
        a.id === draggingSigId ? { ...a, x: newX, y: newY } : a
      ));
      renderAnnotations(currentPage);
      return;
    }
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentDrawPoints((prev) => [...prev, { x, y }]);
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (ctx && currentDrawPoints.length > 0) {
      const last = currentDrawPoints[currentDrawPoints.length - 1];
      ctx.strokeStyle = drawColor; ctx.lineWidth = strokeWidth; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke();
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingSigId) {
      setDraggingSigId(null);
      renderAnnotations(currentPage);
      return;
    }
    if (isDrawing && currentDrawPoints.length > 1) {
      onAnnotationsChange([...annotations, { id: uid(), type: "drawing", page: currentPage, x: 0, y: 0, points: currentDrawPoints, color: drawColor, strokeWidth }]);
    }
    setIsDrawing(false);
    setCurrentDrawPoints([]);

    if (editMode === "redaction" && redactionStart) {
      const { x, y } = getCanvasCoords(e);
      const rx = Math.min(redactionStart.x, x); const ry = Math.min(redactionStart.y, y);
      const rw = Math.abs(x - redactionStart.x); const rh = Math.abs(y - redactionStart.y);
      if (rw > 5 && rh > 5) {
        onAnnotationsChange([...annotations, { id: uid(), type: "redaction", page: currentPage, x: rx, y: ry, width: rw, height: rh }]);
      }
      setRedactionStart(null);
    }
  };

  const confirmTextAnnotation = () => {
    if (textPlacement && textInput.trim()) {
      onAnnotationsChange([...annotations, {
        id: uid(), type: "text", page: currentPage, x: textPlacement.x, y: textPlacement.y,
        text: textInput, fontSize, color: drawColor,
      }]);
    }
    setTextPlacement(null);
    setTextInput("");
  };

  const initSignaturePad = useCallback((canvas: HTMLCanvasElement | null) => {
    signatureCanvasRef.current = canvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // Smooth drawing with quadratic bezier curves
    canvas.onmousedown = (e) => {
      sigDrawingRef.current = true;
      const p = getPos(e);
      sigLastPosRef.current = p;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    canvas.onmousemove = (e) => {
      if (!sigDrawingRef.current || !sigLastPosRef.current) return;
      const p = getPos(e);
      const last = sigLastPosRef.current;
      const mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      ctx.strokeStyle = sigInkColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y);
      sigLastPosRef.current = p;
    };
    canvas.onmouseup = () => { sigDrawingRef.current = false; sigLastPosRef.current = null; };
    canvas.onmouseleave = () => { sigDrawingRef.current = false; sigLastPosRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigInkColor]);

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageToAdd(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSigImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedSigUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Save current signature to localStorage
  const saveCurrentSignature = () => {
    let dataUrl: string | null = null;
    if (signatureMode === "draw" && signatureCanvasRef.current) {
      dataUrl = signatureCanvasRef.current.toDataURL();
    } else if (signatureMode === "type" && typedSigText) {
      const canvas = document.createElement("canvas");
      canvas.width = 300; canvas.height = 80;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 300, 80);
      ctx.font = `32px ${typedSigFont}`; ctx.fillStyle = sigInkColor;
      ctx.textBaseline = "middle";
      ctx.fillText(typedSigText, 10, 40);
      dataUrl = canvas.toDataURL();
    } else if (signatureMode === "upload" && uploadedSigUrl) {
      dataUrl = uploadedSigUrl;
    }
    if (!dataUrl) return;
    const newSig = { id: uid(), label: sigLabel || `Signature ${savedSignatures.length + 1}`, dataUrl, createdAt: new Date().toISOString() };
    const updated = [...savedSignatures, newSig];
    setSavedSignatures(updated);
    setSigLabel("");
    try { localStorage.setItem("pdf-saved-signatures", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const deleteSavedSignature = (id: string) => {
    const updated = savedSignatures.filter((s) => s.id !== id);
    setSavedSignatures(updated);
    try { localStorage.setItem("pdf-saved-signatures", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const loadSavedSignature = (dataUrl: string) => {
    setUploadedSigUrl(dataUrl);
    setSignatureMode("upload");
  };

  const signatureFonts = [
    { label: "Dancing Script", value: "'Dancing Script', cursive" },
    { label: "Great Vibes", value: "'Great Vibes', cursive" },
    { label: "Pacifico", value: "'Pacifico', cursive" },
    { label: "Sacramento", value: "'Sacramento', cursive" },
  ];

  const sigInkColors = [
    { label: "Black", value: "#000000" },
    { label: "Blue", value: "#1d4ed8" },
    { label: "Red", value: "#dc2626" },
  ];

  // Tool button helper
  const toolBtn = (mode: EditMode, icon: React.ReactNode, label: string) => (
    <button
      style={{ ...btnStyle, width: "100%", justifyContent: "flex-start", ...(editMode === mode ? { backgroundColor: "var(--accent)" } : {}) }}
      onClick={() => setEditMode(editMode === mode ? "none" : mode)}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Edit sidebar */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto"
        style={{ width: 240, backgroundColor: "var(--card)", borderRight: "1px solid var(--border)" }}>

        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Text & Content</h3>

        {toolBtn("text", <Type size={16} />, "Add Text")}
        {editMode === "text" && (
          <div className="flex flex-col gap-2 pl-2">
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Font Size</label>
            <input type="number" value={fontSize} min={8} max={72} onChange={(e) => setFontSize(Number(e.target.value))} style={{ ...inputStyle, width: "100%" }} />
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
              <option value="sans-serif">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="cursive">Cursive</option>
            </select>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Color</label>
            <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} style={{ width: 30, height: 30, border: "none", cursor: "pointer" }} />
          </div>
        )}

        {toolBtn("image", <Image size={16} />, "Add Image")}
        {editMode === "image" && (
          <div className="flex flex-col gap-2 pl-2">
            <label style={{ ...btnStyle, cursor: "pointer", fontSize: 11, justifyContent: "center" }}>
              <Upload size={14} /> Choose Image
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {imageToAdd && (
              <>
                <img src={imageToAdd} alt="Preview" style={{ maxWidth: "100%", maxHeight: 80, borderRadius: 4, border: "1px solid var(--border)" }} />
                <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Click on PDF to place</p>
              </>
            )}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Drawing & Shapes</h3>

        {toolBtn("draw", <PenTool size={16} />, "Freehand Draw")}
        {editMode === "draw" && (
          <div className="flex flex-col gap-2 pl-2">
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} style={{ width: 30, height: 30, border: "none", cursor: "pointer" }} />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{drawColor}</span>
            </div>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Stroke Width: {strokeWidth}px</label>
            <input type="range" min={1} max={20} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} style={{ accentColor: "var(--primary)" }} />
          </div>
        )}

        {toolBtn("shape", <RectangleHorizontal size={16} />, "Shapes")}
        {editMode === "shape" && (
          <div className="flex flex-col gap-2 pl-2">
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Shape Type</label>
            <div className="flex flex-wrap gap-1">
              {([
                { type: "rectangle", icon: <SquareIcon size={14} /> },
                { type: "circle", icon: <CircleIcon size={14} /> },
                { type: "line", icon: <Minus size={14} /> },
                { type: "arrow", icon: <ArrowRightIcon size={14} /> },
                { type: "polygon", icon: <Hexagon size={14} /> },
                { type: "star", icon: <Star size={14} /> },
              ]).map(({ type, icon }) => (
                <button key={type} onClick={() => setActiveShape(type)}
                  style={{ ...btnStyle, padding: "4px 8px", backgroundColor: activeShape === type ? "var(--primary)" : "var(--card)", color: activeShape === type ? "var(--primary-foreground)" : "var(--card-foreground)" }}
                  title={type}>{icon}</button>
              ))}
            </div>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Stroke Color</label>
            <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} style={{ width: 30, height: 30, border: "none", cursor: "pointer" }} />
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Stroke Width: {strokeWidth}px</label>
            <input type="range" min={1} max={10} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} style={{ accentColor: "var(--primary)" }} />
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Markup</h3>

        {toolBtn("highlight", <Highlighter size={16} />, "Highlight")}
        {editMode === "highlight" && (
          <div className="flex gap-1 pl-2">
            {["#ffff00", "#90ee90", "#87ceeb", "#ffb6c1", "#ffa500"].map((c) => (
              <button key={c} onClick={() => setDrawColor(c)}
                style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: c, border: drawColor === c ? "2px solid var(--primary)" : "1px solid var(--border)", cursor: "pointer" }} />
            ))}
          </div>
        )}

        {toolBtn("underline", <Underline size={16} />, "Underline")}
        {toolBtn("strikethrough", <Strikethrough size={16} />, "Strikethrough")}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Annotations</h3>

        {toolBtn("sticky-note", <StickyNote size={16} />, "Sticky Note")}
        {editMode === "sticky-note" && (
          <div className="flex flex-col gap-2 pl-2">
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Note Color</label>
            <div className="flex gap-1">
              {["#fff9c4", "#c8e6c9", "#bbdefb", "#f8bbd0", "#ffe0b2"].map((c) => (
                <button key={c} onClick={() => setStickyNoteColor(c)}
                  style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: c, border: stickyNoteColor === c ? "2px solid var(--primary)" : "1px solid var(--border)", cursor: "pointer" }} />
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Stamps</h3>

        {toolBtn("stamp", <Stamp size={16} />, "Stamps")}
        {editMode === "stamp" && (
          <div className="flex flex-wrap gap-1 pl-2">
            {stamps.map((s) => (
              <button key={s} onClick={() => setSelectedStamp(s)}
                style={{ ...btnStyle, fontSize: 11, padding: "3px 8px", color: selectedStamp === s ? "#fff" : stampColors[s], backgroundColor: selectedStamp === s ? stampColors[s] : "var(--card)", borderColor: stampColors[s] }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Signatures</h3>

        {toolBtn("signature", <Pencil size={16} />, "E-Signature")}
        {editMode === "signature" && (
          <div className="flex flex-col gap-2 pl-2">
            {/* Mode tabs */}
            <div className="flex gap-1">
              {(["draw", "type", "upload"] as const).map((m) => (
                <button key={m} onClick={() => setSignatureMode(m)}
                  style={{ ...btnStyle, flex: 1, justifyContent: "center", fontSize: 10, padding: "4px 6px",
                    backgroundColor: signatureMode === m ? "var(--primary)" : "var(--card)",
                    color: signatureMode === m ? "var(--primary-foreground)" : "var(--card-foreground)" }}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* ── DRAW MODE ─── */}
            {signatureMode === "draw" && (
              <>
                <canvas ref={initSignaturePad} width={220} height={90}
                  style={{ border: "1px solid var(--border)", borderRadius: 6, backgroundColor: "#fff", cursor: "crosshair", width: "100%" }} />
                <div className="flex gap-1">
                  <button style={{ ...btnStyle, fontSize: 11, flex: 1, justifyContent: "center" }} onClick={clearSignature}>
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
                <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Ink Color</label>
                <div className="flex gap-1">
                  {sigInkColors.map((c) => (
                    <div key={c.value} title={c.label} onClick={() => setSigInkColor(c.value)}
                      style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: c.value, cursor: "pointer",
                        border: sigInkColor === c.value ? "2px solid var(--primary)" : "2px solid var(--border)" }} />
                  ))}
                </div>
              </>
            )}

            {/* ── TYPE MODE ─── */}
            {signatureMode === "type" && (
              <>
                <input type="text" value={typedSigText} onChange={(e) => setTypedSigText(e.target.value)}
                  placeholder="Type your name" style={{ ...inputStyle, fontSize: 11 }} />
                <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Font</label>
                <select value={typedSigFont} onChange={(e) => setTypedSigFont(e.target.value)} style={{ ...inputStyle, fontSize: 11 }}>
                  {signatureFonts.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <label style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Color</label>
                <div className="flex gap-1">
                  {sigInkColors.map((c) => (
                    <div key={c.value} title={c.label} onClick={() => setSigInkColor(c.value)}
                      style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: c.value, cursor: "pointer",
                        border: sigInkColor === c.value ? "2px solid var(--primary)" : "2px solid var(--border)" }} />
                  ))}
                </div>
                {typedSigText && (
                  <div style={{ padding: 8, backgroundColor: "#fff", borderRadius: 6, border: "1px solid var(--border)",
                    fontFamily: typedSigFont, fontSize: 24, color: sigInkColor, textAlign: "center" }}>
                    {typedSigText}
                  </div>
                )}
              </>
            )}

            {/* ── UPLOAD MODE ─── */}
            {signatureMode === "upload" && (
              <>
                <label style={{ ...btnStyle, cursor: "pointer", fontSize: 11, justifyContent: "center", width: "100%" }}>
                  <Upload size={14} /> Upload Image
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleSigImageUpload} />
                </label>
                {uploadedSigUrl && (
                  <>
                    <img src={uploadedSigUrl} alt="Signature" style={{ maxWidth: "100%", maxHeight: 60, borderRadius: 4, backgroundColor: "#fff", border: "1px solid var(--border)" }} />
                    <button style={{ ...btnStyle, fontSize: 11, justifyContent: "center" }} onClick={() => setUploadedSigUrl(null)}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </>
                )}
              </>
            )}

            {/* ── Place & Save ─── */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 2 }}>
              <p style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4 }}>
                <Move size={10} style={{ display: "inline", verticalAlign: "middle" }} /> Click PDF to place. Drag placed signatures to reposition.
              </p>
            </div>

            {/* ── Save Signature ─── */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.5 }}>Save Signature</label>
              <div className="flex gap-1 mt-1">
                <input type="text" value={sigLabel} onChange={(e) => setSigLabel(e.target.value)}
                  placeholder="Label (optional)" style={{ ...inputStyle, fontSize: 10, flex: 1, padding: "4px 6px" }} />
                <button style={{ ...btnStyle, fontSize: 10, padding: "4px 8px" }} onClick={saveCurrentSignature} title="Save signature">
                  <Save size={12} />
                </button>
              </div>
            </div>

            {/* ── Saved Signatures ─── */}
            {savedSignatures.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  My Signatures ({savedSignatures.length})
                </label>
                <div className="flex flex-col gap-1 mt-1" style={{ maxHeight: 150, overflowY: "auto" }}>
                  {savedSignatures.map((sig) => (
                    <div key={sig.id} className="flex items-center gap-1" style={{ border: "1px solid var(--border)", borderRadius: 4, padding: 4, backgroundColor: "var(--card)" }}>
                      <img src={sig.dataUrl} alt={sig.label} onClick={() => loadSavedSignature(sig.dataUrl)}
                        style={{ width: 60, height: 24, objectFit: "contain", borderRadius: 2, backgroundColor: "#fff", cursor: "pointer" }} />
                      <span style={{ fontSize: 9, flex: 1, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sig.label}
                      </span>
                      <button onClick={() => deleteSavedSignature(sig.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--muted-foreground)" }} title="Delete">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Redaction</h3>

        {toolBtn("redaction", <EyeOff size={16} />, "Redact Area")}
        {editMode === "redaction" && (
          <p style={{ fontSize: 10, color: "var(--muted-foreground)", paddingLeft: 8 }}>Click and drag to redact sensitive areas.</p>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Measurement</h3>

        {toolBtn("measure", <Ruler size={16} />, "Measure")}
        {editMode === "measure" && (
          <div className="flex flex-col gap-2 pl-2">
            <label style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Unit</label>
            <select value={measureUnit} onChange={(e) => setMeasureUnit(e.target.value)} style={{ ...inputStyle, fontSize: 11 }}>
              <option value="px">Pixels</option>
              <option value="in">Inches</option>
              <option value="cm">Centimeters</option>
              <option value="mm">Millimeters</option>
            </select>
            <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Click two points on the PDF to measure distance.</p>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Page Tools</h3>

        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start", ...(pageNumbersAdded ? { opacity: 0.6 } : {}) }}
          onClick={onAddPageNumbers} disabled={pageNumbersAdded}>
          <Hash size={16} /> {pageNumbersAdded ? "Numbers Added" : "Add Page Numbers"}
        </button>
        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start", ...(watermarkApplied ? { opacity: 0.6 } : {}) }}
          onClick={onShowWatermark}>
          <Droplets size={16} /> {watermarkApplied ? "Watermark Applied" : "Add Watermark"}
        </button>
        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start", ...(headerFooterApplied ? { opacity: 0.6 } : {}) }}
          onClick={onShowHeaderFooter}>
          <AlignCenter size={16} /> {headerFooterApplied ? "Headers Added" : "Headers & Footers"}
        </button>
        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start" }}
          onClick={onRunOcr} disabled={ocrProcessing}>
          {ocrProcessing ? <><Loader2 size={16} className="animate-spin" /> OCR Processing...</>
            : ocrComplete ? <><ScanText size={16} /> OCR Complete</>
            : <><ScanText size={16} /> Run OCR</>}
        </button>

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Security</h3>

        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start", ...(certSignatureApplied ? { backgroundColor: "var(--accent)" } : {}) }}
          onClick={onShowCertModal}>
          <ShieldCheck size={16} /> {certSignatureApplied ? "Certificate Applied" : "Digital Certificate"}
        </button>
        {certSignatureApplied && certificateInfo && (
          <div className="flex flex-col gap-1 pl-2" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            <div className="flex items-center gap-1"><Award size={10} style={{ color: "var(--primary)" }} /><span>Signed by: {certificateInfo.name}</span></div>
            <span>Org: {certificateInfo.organization}</span>
            <span>Date: {certificateInfo.date}</span>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "4px 0" }} />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Actions</h3>

        <button style={{ ...btnStyle, width: "100%", justifyContent: "flex-start", ...(flattenApplied ? { opacity: 0.6 } : {}) }}
          onClick={onFlattenAnnotations} disabled={annotations.length === 0 || flattenApplied}>
          <Layers size={16} /> {flattenApplied ? "Flattened" : "Flatten Annotations"}
        </button>
        <button style={btnStyle} onClick={() => onAnnotationsChange(annotations.slice(0, -1))} disabled={annotations.length === 0}>
          <Undo2 size={16} /> Undo Last
        </button>
        <p style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4 }}>
          {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* PDF view area with overlay */}
      <div className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
          <button style={btnStyle} onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>Page {currentPage} / {totalPages}</span>
          <button style={btnStyle} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
            <ChevronRight size={14} />
          </button>
          <div className="flex-1" />
          <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>
            {editMode !== "none" ? `Tool: ${editMode}` : "Select a tool"}
          </span>
          <div className="flex-1" />
          <button style={btnStyle} onClick={() => { onZoomChange(Math.max(50, zoom - 10)); }}><ZoomOut size={14} /></button>
          <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{zoom}%</span>
          <button style={btnStyle} onClick={() => { onZoomChange(Math.min(400, zoom + 10)); }}><ZoomIn size={14} /></button>
        </div>

        <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ backgroundColor: "var(--muted)" }}>
          <div className="relative inline-block" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <canvas ref={mainCanvasRef} style={{ display: "block" }} />
            <canvas ref={overlayCanvasRef} className="absolute top-0 left-0"
              style={{ cursor: editMode !== "none" ? "crosshair" : "default" }}
              onMouseDown={handleOverlayMouseDown}
              onMouseMove={handleOverlayMouseMove}
              onMouseUp={handleOverlayMouseUp}
              onMouseLeave={handleOverlayMouseUp}
            />
          </div>
        </div>
      </div>

      {/* Text placement popup */}
      {textPlacement && (
        <div className="absolute z-50 flex items-center gap-2 p-2"
          style={{ top: textPlacement.y + 100, left: textPlacement.x + 260,
            backgroundColor: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text..." autoFocus style={{ ...inputStyle, width: 200 }}
            onKeyDown={(e) => { if (e.key === "Enter") confirmTextAnnotation(); if (e.key === "Escape") { setTextPlacement(null); setTextInput(""); } }} />
          <button style={btnPrimaryStyle} onClick={confirmTextAnnotation}>Add</button>
          <button style={btnStyle} onClick={() => { setTextPlacement(null); setTextInput(""); }}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
