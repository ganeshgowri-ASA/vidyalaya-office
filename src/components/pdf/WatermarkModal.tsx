"use client";

import React from "react";
import { X, Type, Image, RotateCcw, Upload } from "lucide-react";

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
  fontSize: 13,
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
  fontSize: 13,
  outline: "none",
};

interface WatermarkModalProps {
  config: {
    type: "text" | "image";
    text: string;
    fontSize: number;
    opacity: number;
    rotation: number;
    color: string;
    imageDataUrl?: string;
  };
  onConfigChange: (config: any) => void;
  position: string;
  onPositionChange: (p: string) => void;
  onApply: () => void;
  onClose: () => void;
  applied: boolean;
}

const positions = [
  { key: "center", label: "Center" },
  { key: "top-left", label: "Top-Left" },
  { key: "top-right", label: "Top-Right" },
  { key: "bottom-left", label: "Bottom-Left" },
  { key: "bottom-right", label: "Bottom-Right" },
  { key: "tile", label: "Tile" },
];

const positionCoords: Record<string, { x: string; y: string }> = {
  center: { x: "50%", y: "50%" },
  "top-left": { x: "20%", y: "20%" },
  "top-right": { x: "80%", y: "20%" },
  "bottom-left": { x: "20%", y: "80%" },
  "bottom-right": { x: "80%", y: "80%" },
};

export default function WatermarkModal({
  config,
  onConfigChange,
  position,
  onPositionChange,
  onApply,
  onClose,
  applied,
}: WatermarkModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onConfigChange({ ...config, imageDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const renderPreview = () => {
    const pageStyle: React.CSSProperties = {
      width: 180,
      height: 240,
      backgroundColor: "#fff",
      border: "1px solid var(--border)",
      borderRadius: 4,
      position: "relative",
      overflow: "hidden",
    };

    const watermarkBaseStyle: React.CSSProperties = {
      position: "absolute",
      opacity: config.opacity,
      transform: `rotate(${config.rotation}deg)`,
      pointerEvents: "none",
      whiteSpace: "nowrap",
    };

    if (config.type === "text") {
      if (position === "tile") {
        const tileElements = [];
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 3; col++) {
            tileElements.push(
              <span
                key={`${row}-${col}`}
                style={{
                  ...watermarkBaseStyle,
                  left: `${10 + col * 30}%`,
                  top: `${10 + row * 25}%`,
                  fontSize: Math.max(8, config.fontSize * 0.18),
                  color: config.color,
                  transformOrigin: "center",
                }}
              >
                {config.text}
              </span>
            );
          }
        }
        return <div style={pageStyle}>{tileElements}</div>;
      }

      const coords = positionCoords[position] || positionCoords.center;
      return (
        <div style={pageStyle}>
          <span
            style={{
              ...watermarkBaseStyle,
              left: coords.x,
              top: coords.y,
              transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
              fontSize: Math.max(8, config.fontSize * 0.18),
              color: config.color,
            }}
          >
            {config.text}
          </span>
        </div>
      );
    }

    if (config.type === "image" && config.imageDataUrl) {
      if (position === "tile") {
        const tileElements = [];
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            tileElements.push(
              <img
                key={`${row}-${col}`}
                src={config.imageDataUrl}
                alt="watermark"
                style={{
                  ...watermarkBaseStyle,
                  left: `${10 + col * 30}%`,
                  top: `${10 + row * 30}%`,
                  width: 30,
                  height: 30,
                  objectFit: "contain",
                }}
              />
            );
          }
        }
        return <div style={pageStyle}>{tileElements}</div>;
      }

      const coords = positionCoords[position] || positionCoords.center;
      return (
        <div style={pageStyle}>
          <img
            src={config.imageDataUrl}
            alt="watermark"
            style={{
              ...watermarkBaseStyle,
              left: coords.x,
              top: coords.y,
              transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
              width: 50,
              height: 50,
              objectFit: "contain",
            }}
          />
        </div>
      );
    }

    return (
      <div style={pageStyle}>
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "var(--muted-foreground)",
            fontSize: 11,
          }}
        >
          No image selected
        </span>
      </div>
    );
  };

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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 24,
          width: 560,
          maxHeight: "85vh",
          overflowY: "auto",
          color: "var(--card-foreground)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Watermark Settings
          </h3>
          <button
            onClick={onClose}
            style={{
              ...btnStyle,
              padding: 6,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Type Selector */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 6,
              display: "block",
            }}
          >
            Watermark Type
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onConfigChange({ ...config, type: "text" })}
              style={{
                ...(config.type === "text" ? btnPrimaryStyle : btnStyle),
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Type size={14} /> Text
            </button>
            <button
              onClick={() => onConfigChange({ ...config, type: "image" })}
              style={{
                ...(config.type === "image" ? btnPrimaryStyle : btnStyle),
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Image size={14} /> Image
            </button>
          </div>
        </div>

        {/* Text Watermark Options */}
        {config.type === "text" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Text
              </label>
              <input
                type="text"
                value={config.text}
                onChange={(e) =>
                  onConfigChange({ ...config, text: e.target.value })
                }
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                placeholder="CONFIDENTIAL"
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Font Size: {config.fontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={96}
                value={config.fontSize}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    fontSize: Number(e.target.value),
                  })
                }
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) =>
                    onConfigChange({ ...config, color: e.target.value })
                  }
                  style={{
                    width: 36,
                    height: 36,
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 2,
                    backgroundColor: "transparent",
                  }}
                />
                <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                  {config.color}
                </span>
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Opacity: {config.opacity.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={config.opacity}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    opacity: Number(e.target.value),
                  })
                }
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                <RotateCcw
                  size={12}
                  style={{ display: "inline", verticalAlign: "middle" }}
                />{" "}
                Rotation: {config.rotation}&deg;
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                value={config.rotation}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    rotation: Number(e.target.value),
                  })
                }
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>
          </div>
        )}

        {/* Image Watermark Options */}
        {config.type === "image" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Upload Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={btnStyle}
              >
                <Upload size={14} /> Choose Image
              </button>
            </div>

            {config.imageDataUrl && (
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Preview
                </label>
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: 8,
                    display: "inline-block",
                    backgroundColor: "var(--background)",
                  }}
                >
                  <img
                    src={config.imageDataUrl}
                    alt="Watermark preview"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Opacity: {config.opacity.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={config.opacity}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    opacity: Number(e.target.value),
                  })
                }
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Scale: {Math.round(config.fontSize * (200 / 96))}%
              </label>
              <input
                type="range"
                min={10}
                max={200}
                value={Math.round(config.fontSize * (200 / 96))}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    fontSize: Math.round(
                      Number(e.target.value) * (96 / 200)
                    ),
                  })
                }
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>
          </div>
        )}

        {/* Position Selector */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 8,
              display: "block",
            }}
          >
            Position
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}
          >
            {positions.map((pos) => {
              const isActive = position === pos.key;
              const dotPositions: Record<
                string,
                React.CSSProperties
              > = {
                center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
                "top-left": { top: 4, left: 4 },
                "top-right": { top: 4, right: 4 },
                "bottom-left": { bottom: 4, left: 4 },
                "bottom-right": { bottom: 4, right: 4 },
                tile: {},
              };

              return (
                <button
                  key={pos.key}
                  onClick={() => onPositionChange(pos.key)}
                  style={{
                    ...btnStyle,
                    flexDirection: "column",
                    padding: 6,
                    gap: 4,
                    justifyContent: "center",
                    border: isActive
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border)",
                    backgroundColor: isActive
                      ? "var(--accent)"
                      : "var(--card)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 30,
                      border: "1px solid var(--border)",
                      borderRadius: 2,
                      position: "relative",
                      backgroundColor: "var(--background)",
                    }}
                  >
                    {pos.key === "tile" ? (
                      <>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              backgroundColor: "var(--primary)",
                              top: `${Math.floor(i / 3) * 50 + 15}%`,
                              left: `${(i % 3) * 33 + 10}%`,
                            }}
                          />
                        ))}
                      </>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          ...dotPositions[pos.key],
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: 10 }}>{pos.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 8,
              display: "block",
            }}
          >
            Preview
          </label>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 16,
              backgroundColor: "var(--background)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            {renderPreview()}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button onClick={onClose} style={btnStyle}>
            Cancel
          </button>
          <button onClick={onApply} style={btnPrimaryStyle}>
            {applied ? "Update Watermark" : "Apply Watermark"}
          </button>
        </div>
      </div>
    </div>
  );
}
