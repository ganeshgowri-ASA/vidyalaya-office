"use client";

import React, { useState, useCallback } from "react";
import {
  Image, Crop, Sun, Contrast, Palette, Droplets, Square,
  Circle, RotateCcw, FlipHorizontal, FlipVertical, Maximize,
  Minimize, Trash2, Move, AlignLeft, AlignCenter, AlignRight,
  Type, ChevronDown, Download, Paintbrush, Layers, Eye,
  ZoomIn, ZoomOut, Lock,
} from "lucide-react";
import { ToolbarButton, ToolbarSeparator } from "./toolbar-button";

const IMAGE_EFFECTS = [
  { name: "Shadow", style: "box-shadow: 4px 4px 12px rgba(0,0,0,0.3);" },
  { name: "Shadow (Soft)", style: "box-shadow: 0 8px 24px rgba(0,0,0,0.2);" },
  { name: "Shadow (Offset)", style: "box-shadow: 8px 8px 0 rgba(0,0,0,0.15);" },
  { name: "Reflection", style: "-webkit-box-reflect: below 2px linear-gradient(transparent, rgba(0,0,0,0.15));" },
  { name: "Glow Blue", style: "box-shadow: 0 0 16px 4px rgba(68,114,196,0.5);" },
  { name: "Glow Gold", style: "box-shadow: 0 0 16px 4px rgba(255,192,0,0.5);" },
  { name: "Glow Green", style: "box-shadow: 0 0 16px 4px rgba(112,173,71,0.5);" },
  { name: "Soft Edges", style: "mask-image: radial-gradient(ellipse, black 60%, transparent 72%); -webkit-mask-image: radial-gradient(ellipse, black 60%, transparent 72%);" },
  { name: "Bevel Raised", style: "box-shadow: inset 2px 2px 4px rgba(255,255,255,0.5), inset -2px -2px 4px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.2);" },
  { name: "Bevel Soft", style: "box-shadow: inset 1px 1px 3px rgba(255,255,255,0.4), inset -1px -1px 3px rgba(0,0,0,0.15);" },
  { name: "3D Rotation Left", style: "transform: perspective(500px) rotateY(15deg); transform-origin: center;" },
  { name: "3D Rotation Right", style: "transform: perspective(500px) rotateY(-15deg); transform-origin: center;" },
  { name: "3D Tilt Up", style: "transform: perspective(500px) rotateX(10deg); transform-origin: center;" },
  { name: "3D Tilt Down", style: "transform: perspective(500px) rotateX(-10deg); transform-origin: center;" },
];

const CROP_SHAPES = [
  { name: "Rectangle", clip: "inset(0)" },
  { name: "Rounded Rectangle", clip: "inset(0 round 12px)" },
  { name: "Circle", clip: "circle(50% at 50% 50%)" },
  { name: "Ellipse", clip: "ellipse(50% 40% at 50% 50%)" },
  { name: "Triangle", clip: "polygon(50% 0%, 0% 100%, 100% 100%)" },
  { name: "Diamond", clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { name: "Pentagon", clip: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" },
  { name: "Hexagon", clip: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
  { name: "Star", clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
  { name: "Heart", clip: "polygon(50% 18%, 61% 0%, 80% 0%, 100% 18%, 100% 40%, 50% 100%, 0% 40%, 0% 18%, 20% 0%, 39% 0%)" },
  { name: "Arrow Right", clip: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)" },
  { name: "Cross", clip: "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)" },
];

const ASPECT_RATIOS = [
  { name: "1:1 Square", w: 1, h: 1 },
  { name: "4:3 Standard", w: 4, h: 3 },
  { name: "16:9 Widescreen", w: 16, h: 9 },
  { name: "3:2 Photo", w: 3, h: 2 },
  { name: "2:3 Portrait", w: 2, h: 3 },
  { name: "3:4 Portrait", w: 3, h: 4 },
];

const LAYOUT_OPTIONS = [
  { name: "Inline", style: "display:inline;vertical-align:baseline;margin:4px;" },
  { name: "Square Wrap", style: "float:left;margin:8px 12px 8px 0;shape-outside:margin-box;" },
  { name: "Tight Wrap", style: "float:left;margin:4px 8px 4px 0;shape-outside:content-box;" },
  { name: "Through", style: "float:left;margin:2px 8px 2px 0;" },
  { name: "Top and Bottom", style: "display:block;margin:16px auto;clear:both;" },
  { name: "Behind Text", style: "position:relative;z-index:-1;margin:8px;" },
  { name: "In Front of Text", style: "position:relative;z-index:10;margin:8px;" },
  { name: "Float Right", style: "float:right;margin:8px 0 8px 12px;" },
];

const PICTURE_BORDERS = [
  { name: "None", style: "border:none;" },
  { name: "Thin Black", style: "border:1px solid #000;" },
  { name: "Thin Gray", style: "border:1px solid #999;" },
  { name: "Medium Black", style: "border:2px solid #000;" },
  { name: "Thick Blue", style: "border:3px solid #4472C4;" },
  { name: "Double Gold", style: "border:3px double #FFC000;" },
  { name: "Shadow Frame", style: "border:1px solid #ccc;box-shadow:3px 3px 6px rgba(0,0,0,0.2);" },
  { name: "Rounded", style: "border:2px solid #ddd;border-radius:8px;" },
  { name: "Rounded Shadow", style: "border:2px solid #eee;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);" },
  { name: "Polaroid", style: "border:8px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);" },
  { name: "Dashed", style: "border:2px dashed #4472C4;" },
  { name: "Dotted Red", style: "border:2px dotted #FF0000;" },
];

function getSelectedImage(): HTMLImageElement | null {
  const editor = document.getElementById("doc-editor");
  if (!editor) return null;
  const img = editor.querySelector("img.selected-image, img:focus, img[data-selected='true']") as HTMLImageElement | null;
  if (img) return img;
  // Try selection
  const sel = window.getSelection();
  if (sel && sel.anchorNode) {
    let node: Node | null = sel.anchorNode;
    while (node && node !== editor) {
      if (node instanceof HTMLImageElement) return node;
      if (node instanceof HTMLElement) {
        const childImg = node.querySelector("img");
        if (childImg) return childImg;
      }
      node = node.parentNode;
    }
  }
  // Last resort: get most recently clicked image
  const allImgs = editor.querySelectorAll("img");
  for (let i = allImgs.length - 1; i >= 0; i--) {
    if ((allImgs[i] as HTMLElement).dataset.selected === "true") return allImgs[i] as HTMLImageElement;
  }
  return allImgs.length > 0 ? allImgs[allImgs.length - 1] as HTMLImageElement : null;
}

export function ImageFormatTab() {
  const [showEffects, setShowEffects] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [showBorderPicker, setShowBorderPicker] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showAltText, setShowAltText] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [altText, setAltText] = useState("");

  const applyFilter = useCallback((b: number, c: number, s: number) => {
    const img = getSelectedImage();
    if (img) {
      img.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
    }
  }, []);

  const applyEffect = useCallback((effect: typeof IMAGE_EFFECTS[0]) => {
    const img = getSelectedImage();
    if (!img) return;
    // Preserve existing transform styles if they exist
    const currentStyle = img.getAttribute("style") || "";
    // Remove old effect styles
    const cleaned = currentStyle.replace(/box-shadow:[^;]+;?/g, "")
      .replace(/-webkit-box-reflect:[^;]+;?/g, "")
      .replace(/mask-image:[^;]+;?/g, "")
      .replace(/-webkit-mask-image:[^;]+;?/g, "")
      .replace(/transform:[^;]+;?/g, "")
      .replace(/transform-origin:[^;]+;?/g, "")
      .replace(/perspective:[^;]+;?/g, "");
    img.setAttribute("style", cleaned + effect.style);
    setShowEffects(false);
  }, []);

  const cropToShape = useCallback((shape: typeof CROP_SHAPES[0]) => {
    const img = getSelectedImage();
    if (!img) return;
    img.style.clipPath = shape.clip;
    img.style.setProperty("-webkit-clip-path", shape.clip);
    setShowCrop(false);
  }, []);

  const cropToAspectRatio = useCallback((ratio: typeof ASPECT_RATIOS[0]) => {
    const img = getSelectedImage();
    if (!img) return;
    const currentWidth = img.offsetWidth || 300;
    const newHeight = Math.round(currentWidth * ratio.h / ratio.w);
    img.style.width = currentWidth + "px";
    img.style.height = newHeight + "px";
    img.style.objectFit = "cover";
    setShowCrop(false);
  }, []);

  const removeBackground = useCallback(() => {
    const img = getSelectedImage();
    if (!img) return;
    // Create canvas for basic color-key removal
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tempImg = new window.Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.onload = () => {
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      ctx.drawImage(tempImg, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // Sample corner pixel as background color
      const bgR = data[0], bgG = data[1], bgB = data[2];
      const threshold = 40;
      for (let i = 0; i < data.length; i += 4) {
        const diffR = Math.abs(data[i] - bgR);
        const diffG = Math.abs(data[i + 1] - bgG);
        const diffB = Math.abs(data[i + 2] - bgB);
        if (diffR < threshold && diffG < threshold && diffB < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }
      ctx.putImageData(imageData, 0, 0);
      img.src = canvas.toDataURL("image/png");
    };
    tempImg.src = img.src;
  }, []);

  const compressImage = useCallback(() => {
    const img = getSelectedImage();
    if (!img) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tempImg = new window.Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.onload = () => {
      // Reduce to 60% quality
      const scale = 0.7;
      canvas.width = tempImg.width * scale;
      canvas.height = tempImg.height * scale;
      ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
      const original = img.src.length;
      img.src = canvas.toDataURL("image/jpeg", 0.6);
      const compressed = img.src.length;
      const saved = Math.round((1 - compressed / original) * 100);
      alert(`Image compressed. Size reduced by ~${saved}%.`);
    };
    tempImg.src = img.src;
  }, []);

  const applyLayout = useCallback((layout: typeof LAYOUT_OPTIONS[0]) => {
    const img = getSelectedImage();
    if (!img) return;
    // Keep size-related styles
    const width = img.style.width;
    const height = img.style.height;
    const maxWidth = img.style.maxWidth;
    const filter = img.style.filter;
    const clipPath = img.style.clipPath;
    // Reset layout styles
    img.style.cssText = layout.style + (filter ? `filter:${filter};` : "") + (clipPath ? `clip-path:${clipPath};` : "");
    if (width) img.style.width = width;
    if (height) img.style.height = height;
    if (maxWidth) img.style.maxWidth = maxWidth;
    setShowLayout(false);
  }, []);

  const applyBorder = useCallback((border: typeof PICTURE_BORDERS[0]) => {
    const img = getSelectedImage();
    if (!img) return;
    const current = img.getAttribute("style") || "";
    const cleaned = current.replace(/border[^;]*;?/g, "").replace(/box-shadow[^;]*;?/g, "");
    img.setAttribute("style", cleaned + border.style);
    setShowBorderPicker(false);
  }, []);

  const rotateImage = useCallback((degrees: number) => {
    const img = getSelectedImage();
    if (!img) return;
    const current = img.style.transform || "";
    const match = current.match(/rotate\(([^)]+)\)/);
    const currentDeg = match ? parseFloat(match[1]) : 0;
    const newDeg = currentDeg + degrees;
    img.style.transform = current.replace(/rotate\([^)]+\)/, "").trim() + ` rotate(${newDeg}deg)`;
  }, []);

  const flipImage = useCallback((direction: "horizontal" | "vertical") => {
    const img = getSelectedImage();
    if (!img) return;
    const current = img.style.transform || "";
    if (direction === "horizontal") {
      if (current.includes("scaleX(-1)")) {
        img.style.transform = current.replace("scaleX(-1)", "");
      } else {
        img.style.transform = current + " scaleX(-1)";
      }
    } else {
      if (current.includes("scaleY(-1)")) {
        img.style.transform = current.replace("scaleY(-1)", "");
      } else {
        img.style.transform = current + " scaleY(-1)";
      }
    }
  }, []);

  const resizeImage = useCallback((mode: "width" | "height" | "both") => {
    const img = getSelectedImage();
    if (!img) return;
    const val = prompt(`Enter new ${mode === "both" ? "width" : mode} in pixels:`, "400");
    if (!val) return;
    const px = parseInt(val);
    if (isNaN(px)) return;
    if (mode === "width" || mode === "both") img.style.width = px + "px";
    if (mode === "height") img.style.height = px + "px";
    if (mode === "both") img.style.height = "auto";
  }, []);

  const resetImage = useCallback(() => {
    const img = getSelectedImage();
    if (!img) return;
    img.style.filter = "";
    img.style.transform = "";
    img.style.clipPath = "";
    img.style.border = "";
    img.style.boxShadow = "";
    img.style.width = "";
    img.style.height = "";
    img.style.maxWidth = "100%";
    img.style.objectFit = "";
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  }, []);

  const insertFromURL = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.focus();
      document.execCommand("insertHTML", false, `<img src="${encodeURI(url)}" style="max-width:100%;height:auto;margin:12px 0;cursor:pointer;" />`);
    }
  }, []);

  const insertFromLocal = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const editor = document.getElementById("doc-editor");
        if (editor) {
          editor.focus();
          document.execCommand("insertHTML", false, `<img src="${ev.target?.result}" style="max-width:100%;height:auto;margin:12px 0;cursor:pointer;" />`);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const showStockPhotos = useCallback(() => {
    const photos = [
      { name: "Mountain Landscape", color: "#4472C4" },
      { name: "Ocean Sunset", color: "#ED7D31" },
      { name: "Forest Trail", color: "#70AD47" },
      { name: "City Skyline", color: "#7030A0" },
      { name: "Abstract Pattern", color: "#FFC000" },
      { name: "Technology", color: "#44546A" },
    ];
    const choice = prompt(`Stock Photos Gallery:\n${photos.map((p, i) => `${i + 1}. ${p.name}`).join("\n")}\n\nEnter number (1-${photos.length}):`);
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= photos.length) return;
    const photo = photos[idx];
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.focus();
      // Generate a placeholder SVG for the stock photo
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="${photo.color}" width="600" height="400"/><text fill="white" font-family="Arial" font-size="24" x="300" y="200" text-anchor="middle" dominant-baseline="central">${photo.name}</text></svg>`;
      const b64 = btoa(svg);
      document.execCommand("insertHTML", false, `<img src="data:image/svg+xml;base64,${b64}" style="max-width:100%;height:auto;margin:12px 0;cursor:pointer;" alt="${photo.name}" />`);
    }
  }, []);

  return (
    <>
      {/* ===== INSERT IMAGE GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Image size={14} />} label="Local" title="Insert from Computer" onClick={insertFromLocal} />
          <ToolbarButton icon={<Download size={14} />} label="URL" title="Insert from URL" onClick={insertFromURL} />
          <ToolbarButton icon={<Palette size={14} />} label="Stock" title="Stock Photos Gallery" onClick={showStockPhotos} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Insert</span>
      </div>

      {/* ===== ADJUST GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Sun size={14} />} label="Adjust" title="Image Adjustments" onClick={() => setShowAdjust(!showAdjust)} />
            {showAdjust && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg w-56"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Image Adjustments</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--foreground)" }}>
                      <span>Brightness</span><span>{brightness}%</span>
                    </div>
                    <input type="range" min="20" max="200" value={brightness}
                      onChange={e => { const v = parseInt(e.target.value); setBrightness(v); applyFilter(v, contrast, saturation); }}
                      className="w-full h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--foreground)" }}>
                      <span>Contrast</span><span>{contrast}%</span>
                    </div>
                    <input type="range" min="20" max="200" value={contrast}
                      onChange={e => { const v = parseInt(e.target.value); setContrast(v); applyFilter(brightness, v, saturation); }}
                      className="w-full h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--foreground)" }}>
                      <span>Saturation</span><span>{saturation}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={saturation}
                      onChange={e => { const v = parseInt(e.target.value); setSaturation(v); applyFilter(brightness, contrast, v); }}
                      className="w-full h-1.5" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 text-[10px] px-2 py-1 rounded border hover:bg-[var(--muted)]"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      onClick={() => {
                        const img = getSelectedImage();
                        if (img) img.style.filter = "grayscale(100%)";
                      }}>
                      Grayscale
                    </button>
                    <button className="flex-1 text-[10px] px-2 py-1 rounded border hover:bg-[var(--muted)]"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      onClick={() => {
                        const img = getSelectedImage();
                        if (img) img.style.filter = "sepia(100%)";
                      }}>
                      Sepia
                    </button>
                    <button className="flex-1 text-[10px] px-2 py-1 rounded border hover:bg-[var(--muted)]"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      onClick={() => {
                        const img = getSelectedImage();
                        if (img) img.style.filter = "invert(100%)";
                      }}>
                      Invert
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <ToolbarButton icon={<Eye size={14} />} label="Remove BG" title="Remove Background" onClick={removeBackground} />
          <ToolbarButton icon={<Minimize size={14} />} label="Compress" title="Compress Image" onClick={compressImage} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Adjust</span>
      </div>

      {/* ===== CROP GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Crop size={14} />} label="Crop" title="Crop Image" onClick={() => setShowCrop(!showCrop)} />
            {showCrop && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-60 max-h-80 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Crop to Shape</div>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {CROP_SHAPES.map(shape => (
                    <button key={shape.name} className="w-12 h-12 rounded border flex items-center justify-center hover:bg-[var(--muted)] cursor-pointer"
                      style={{ borderColor: "var(--border)" }} title={shape.name}
                      onClick={() => cropToShape(shape)}>
                      <div className="w-8 h-8 bg-blue-400" style={{ clipPath: shape.clip }} />
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Aspect Ratio</div>
                {ASPECT_RATIOS.map(ratio => (
                  <button key={ratio.name} className="w-full text-left text-[11px] px-3 py-1 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => cropToAspectRatio(ratio)}>
                    {ratio.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Crop</span>
      </div>

      {/* ===== EFFECTS GALLERY ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Droplets size={14} />} label="Effects" title="Picture Effects Gallery" onClick={() => setShowEffects(!showEffects)} />
            {showEffects && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-56 max-h-72 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Picture Effects</div>
                <div className="space-y-0.5">
                  {IMAGE_EFFECTS.map(effect => (
                    <button key={effect.name} className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                      style={{ color: "var(--foreground)" }}
                      onClick={() => applyEffect(effect)}>
                      {effect.name}
                    </button>
                  ))}
                </div>
                <hr className="my-1.5" style={{ borderColor: "var(--border)" }} />
                <button className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => { const img = getSelectedImage(); if (img) { img.style.boxShadow = ""; img.style.transform = ""; img.style.clipPath = ""; } setShowEffects(false); }}>
                  Clear All Effects
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Effects</span>
      </div>

      {/* ===== PICTURE BORDER ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Square size={14} />} label="Border" title="Picture Border" onClick={() => setShowBorderPicker(!showBorderPicker)} />
            {showBorderPicker && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-48 max-h-64 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Picture Borders</div>
                {PICTURE_BORDERS.map(border => (
                  <button key={border.name} className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => applyBorder(border)}>
                    {border.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Border</span>
      </div>

      {/* ===== LAYOUT OPTIONS ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Layers size={14} />} label="Layout" title="Image Layout Options" onClick={() => setShowLayout(!showLayout)} />
            {showLayout && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Text Wrapping</div>
                {LAYOUT_OPTIONS.map(layout => (
                  <button key={layout.name} className="w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => applyLayout(layout)}>
                    {layout.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Layout</span>
      </div>

      {/* ===== SIZE & TRANSFORM ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Maximize size={14} />} label="Resize" title="Resize Image" onClick={() => resizeImage("both")} />
          <ToolbarButton icon={<RotateCcw size={14} />} label="Rotate" title="Rotate 90" onClick={() => rotateImage(90)} />
          <ToolbarButton icon={<FlipHorizontal size={14} />} label="Flip H" title="Flip Horizontal" onClick={() => flipImage("horizontal")} />
          <ToolbarButton icon={<FlipVertical size={14} />} label="Flip V" title="Flip Vertical" onClick={() => flipImage("vertical")} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Size</span>
      </div>

      {/* ===== ACCESSIBILITY ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Type size={14} />} label="Alt Text" title="Alt Text for Accessibility" onClick={() => {
              const img = getSelectedImage();
              if (img) setAltText(img.alt || "");
              setShowAltText(!showAltText);
            }} />
            {showAltText && (
              <div className="absolute top-full right-0 z-50 mt-1 rounded-lg border p-3 shadow-lg w-56"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Alt Text (Accessibility)</div>
                <textarea
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  className="w-full text-[11px] border rounded p-2 h-20 resize-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                  placeholder="Describe this image for screen readers..."
                />
                <button className="w-full mt-2 text-[11px] px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    const img = getSelectedImage();
                    if (img) img.alt = altText;
                    setShowAltText(false);
                  }}>
                  Apply
                </button>
              </div>
            )}
          </div>
          <ToolbarButton icon={<RotateCcw size={14} />} label="Reset" title="Reset All Formatting" onClick={resetImage} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Accessibility</span>
      </div>
    </>
  );
}
