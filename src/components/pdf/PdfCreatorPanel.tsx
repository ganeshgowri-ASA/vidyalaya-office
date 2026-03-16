"use client";

import React from "react";
import {
  Type,
  Image,
  Table,
  Square,
  Circle,
  Minus,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Bold,
  Italic,
  FileDown,
  Trash2,
  Move,
} from "lucide-react";

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

interface PdfCreatorElement {
  id: string;
  type: "text" | "image" | "table" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  imageDataUrl?: string;
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][];
  shapeType?: string;
}

interface PdfCreatorPanelProps {
  elements: PdfCreatorElement[];
  onAddElement: (element: any) => void;
  onRemoveElement: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  selectedElement: string | null;
  onUpdateElement: (id: string, updates: any) => void;
  onGeneratePdf: (pageSize: string, orientation: string) => void;
}

const pageSizes: Record<string, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

export default function PdfCreatorPanel({
  elements,
  onAddElement,
  onRemoveElement,
  onSelectElement,
  selectedElement,
  onUpdateElement,
  onGeneratePdf,
}: PdfCreatorPanelProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState("A4");
  const [orientation, setOrientation] = React.useState("portrait");
  const [tableRowsInput, setTableRowsInput] = React.useState(3);
  const [tableColsInput, setTableColsInput] = React.useState(3);
  const [showShapeMenu, setShowShapeMenu] = React.useState(false);

  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const totalPages = Math.max(
    1,
    ...elements.map((e) => e.page)
  );

  const pageElements = elements.filter((e) => e.page === currentPage);
  const selected = elements.find((e) => e.id === selectedElement);

  const generateId = () =>
    `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const handleAddText = () => {
    onAddElement({
      id: generateId(),
      type: "text",
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      page: currentPage,
      text: "New Text Block",
      fontSize: 16,
      fontFamily: "Arial",
      color: "#000000",
      bold: false,
      italic: false,
    });
  };

  const handleAddImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAddElement({
        id: generateId(),
        type: "image",
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        page: currentPage,
        imageDataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddTable = () => {
    const data: string[][] = [];
    for (let r = 0; r < tableRowsInput; r++) {
      const row: string[] = [];
      for (let c = 0; c < tableColsInput; c++) {
        row.push(r === 0 ? `Header ${c + 1}` : "");
      }
      data.push(row);
    }
    onAddElement({
      id: generateId(),
      type: "table",
      x: 50,
      y: 50,
      width: tableColsInput * 80,
      height: tableRowsInput * 30,
      page: currentPage,
      tableRows: tableRowsInput,
      tableCols: tableColsInput,
      tableData: data,
    });
  };

  const handleAddShape = (shapeType: string) => {
    onAddElement({
      id: generateId(),
      type: "shape",
      x: 50,
      y: 50,
      width: 100,
      height: shapeType === "line" ? 4 : 100,
      page: currentPage,
      shapeType,
      color: "#000000",
    });
    setShowShapeMenu(false);
  };

  const handleAddPage = () => {
    setCurrentPage(totalPages + 1);
    onAddElement({
      id: generateId(),
      type: "text",
      x: -1,
      y: -1,
      width: 0,
      height: 0,
      page: totalPages + 1,
      text: "",
    });
  };

  const dims = pageSizes[pageSize] || pageSizes.A4;
  const canvasWidth =
    orientation === "portrait" ? dims.width : dims.height;
  const canvasHeight =
    orientation === "portrait" ? dims.height : dims.width;
  const scale = Math.min(1, 500 / canvasWidth, 650 / canvasHeight);

  const renderElementOnCanvas = (el: PdfCreatorElement) => {
    const isSelected = el.id === selectedElement;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x * scale,
      top: el.y * scale,
      width: el.width * scale,
      height: el.height * scale,
      cursor: "pointer",
      border: isSelected ? "2px solid var(--primary)" : "1px dashed transparent",
      boxSizing: "border-box",
    };

    if (el.x === -1 && el.y === -1 && el.width === 0) return null;

    switch (el.type) {
      case "text":
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              fontSize: (el.fontSize || 16) * scale,
              fontFamily: el.fontFamily || "Arial",
              color: el.color || "#000",
              fontWeight: el.bold ? "bold" : "normal",
              fontStyle: el.italic ? "italic" : "normal",
              overflow: "hidden",
              display: "flex",
              alignItems: "flex-start",
              padding: 2,
              lineHeight: 1.3,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
            }}
          >
            {el.text}
          </div>
        );
      case "image":
        return (
          <div
            key={el.id}
            style={baseStyle}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
            }}
          >
            {el.imageDataUrl ? (
              <img
                src={el.imageDataUrl}
                alt="element"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image size={20} />
              </div>
            )}
          </div>
        );
      case "table":
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              overflow: "hidden",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
            }}
          >
            <table
              style={{
                width: "100%",
                height: "100%",
                borderCollapse: "collapse",
                fontSize: 9 * scale,
              }}
            >
              <tbody>
                {(el.tableData || []).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          border: "1px solid #999",
                          padding: 1,
                          textAlign: "center",
                          backgroundColor: ri === 0 ? "#e0e0e0" : "#fff",
                          color: "#000",
                          fontSize: Math.max(6, 10 * scale),
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "shape": {
        const shapeColor = el.color || "#000";
        if (el.shapeType === "circle") {
          return (
            <div
              key={el.id}
              style={{
                ...baseStyle,
                borderRadius: "50%",
                border: isSelected
                  ? `2px solid var(--primary)`
                  : `2px solid ${shapeColor}`,
                backgroundColor: "transparent",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(el.id);
              }}
            />
          );
        }
        if (el.shapeType === "line") {
          return (
            <div
              key={el.id}
              style={{
                ...baseStyle,
                height: 2 * scale,
                backgroundColor: shapeColor,
                minHeight: 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(el.id);
              }}
            />
          );
        }
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              border: isSelected
                ? `2px solid var(--primary)`
                : `2px solid ${shapeColor}`,
              backgroundColor: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
            }}
          />
        );
      }
      default:
        return null;
    }
  };

  const renderProperties = () => {
    if (!selected) {
      return (
        <div
          style={{
            padding: 16,
            color: "var(--muted-foreground)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Select an element to edit its properties
        </div>
      );
    }

    return (
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--card-foreground)",
            textTransform: "capitalize",
            marginBottom: 4,
          }}
        >
          {selected.type} Properties
        </div>

        {/* Position */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>X</label>
            <input
              type="number"
              value={selected.x}
              onChange={(e) => onUpdateElement(selected.id, { x: Number(e.target.value) })}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Y</label>
            <input
              type="number"
              value={selected.y}
              onChange={(e) => onUpdateElement(selected.id, { y: Number(e.target.value) })}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>W</label>
            <input
              type="number"
              value={selected.width}
              onChange={(e) => onUpdateElement(selected.id, { width: Number(e.target.value) })}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>H</label>
            <input
              type="number"
              value={selected.height}
              onChange={(e) => onUpdateElement(selected.id, { height: Number(e.target.value) })}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Text properties */}
        {selected.type === "text" && (
          <>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Content</label>
              <textarea
                value={selected.text || ""}
                onChange={(e) => onUpdateElement(selected.id, { text: e.target.value })}
                rows={3}
                style={{
                  ...inputStyle,
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Font Size</label>
                <input
                  type="number"
                  value={selected.fontSize || 16}
                  min={8}
                  max={120}
                  onChange={(e) => onUpdateElement(selected.id, { fontSize: Number(e.target.value) })}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Font Family</label>
                <select
                  value={selected.fontFamily || "Arial"}
                  onChange={(e) => onUpdateElement(selected.id, { fontFamily: e.target.value })}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box", appearance: "auto" }}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Color</label>
                <input
                  type="color"
                  value={selected.color || "#000000"}
                  onChange={(e) => onUpdateElement(selected.id, { color: e.target.value })}
                  style={{
                    width: 36,
                    height: 32,
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: 2,
                    backgroundColor: "transparent",
                  }}
                />
              </div>
              <button
                onClick={() => onUpdateElement(selected.id, { bold: !selected.bold })}
                style={{
                  ...btnStyle,
                  padding: "6px 10px",
                  backgroundColor: selected.bold ? "var(--primary)" : "var(--card)",
                  color: selected.bold ? "var(--primary-foreground)" : "var(--card-foreground)",
                }}
              >
                <Bold size={14} />
              </button>
              <button
                onClick={() => onUpdateElement(selected.id, { italic: !selected.italic })}
                style={{
                  ...btnStyle,
                  padding: "6px 10px",
                  backgroundColor: selected.italic ? "var(--primary)" : "var(--card)",
                  color: selected.italic ? "var(--primary-foreground)" : "var(--card-foreground)",
                }}
              >
                <Italic size={14} />
              </button>
            </div>
          </>
        )}

        {/* Image properties */}
        {selected.type === "image" && (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Width</label>
              <input
                type="number"
                value={selected.width}
                min={10}
                onChange={(e) => onUpdateElement(selected.id, { width: Number(e.target.value) })}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Height</label>
              <input
                type="number"
                value={selected.height}
                min={10}
                onChange={(e) => onUpdateElement(selected.id, { height: Number(e.target.value) })}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>
        )}

        {/* Table properties */}
        {selected.type === "table" && (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Rows</label>
                <input
                  type="number"
                  value={selected.tableRows || 3}
                  min={1}
                  max={20}
                  onChange={(e) => {
                    const newRows = Number(e.target.value);
                    const currentData = selected.tableData || [];
                    const cols = selected.tableCols || 3;
                    const newData: string[][] = [];
                    for (let r = 0; r < newRows; r++) {
                      const row: string[] = [];
                      for (let c = 0; c < cols; c++) {
                        row.push(currentData[r]?.[c] ?? "");
                      }
                      newData.push(row);
                    }
                    onUpdateElement(selected.id, { tableRows: newRows, tableData: newData, height: newRows * 30 });
                  }}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Columns</label>
                <input
                  type="number"
                  value={selected.tableCols || 3}
                  min={1}
                  max={10}
                  onChange={(e) => {
                    const newCols = Number(e.target.value);
                    const currentData = selected.tableData || [];
                    const rows = selected.tableRows || 3;
                    const newData: string[][] = [];
                    for (let r = 0; r < rows; r++) {
                      const row: string[] = [];
                      for (let c = 0; c < newCols; c++) {
                        row.push(currentData[r]?.[c] ?? "");
                      }
                      newData.push(row);
                    }
                    onUpdateElement(selected.id, { tableCols: newCols, tableData: newData, width: newCols * 80 });
                  }}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Cell Data</label>
              <div
                style={{
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 4,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {(selected.tableData || []).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: 1 }}>
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => {
                                const newData = (selected.tableData || []).map((r) => [...r]);
                                newData[ri][ci] = e.target.value;
                                onUpdateElement(selected.id, { tableData: newData });
                              }}
                              style={{
                                ...inputStyle,
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "3px 4px",
                                fontSize: 11,
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Shape properties */}
        {selected.type === "shape" && (
          <>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Shape Type</label>
              <select
                value={selected.shapeType || "rectangle"}
                onChange={(e) => onUpdateElement(selected.id, {
                  shapeType: e.target.value,
                  height: e.target.value === "line" ? 4 : selected.height < 10 ? 100 : selected.height,
                })}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box", appearance: "auto" }}
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="line">Line</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 2 }}>Color</label>
                <input
                  type="color"
                  value={selected.color || "#000000"}
                  onChange={(e) => onUpdateElement(selected.id, { color: e.target.value })}
                  style={{
                    width: 36,
                    height: 32,
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: 2,
                    backgroundColor: "transparent",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Sidebar - Tool Palette */}
        <div
          style={{
            width: 200,
            backgroundColor: "var(--card)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Tools */}
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Add Elements
            </div>
            <button onClick={handleAddText} style={{ ...btnStyle, width: "100%" }}>
              <Type size={14} /> Add Text Block
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <button onClick={handleAddImage} style={{ ...btnStyle, width: "100%" }}>
              <Image size={14} /> Add Image
            </button>

            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <input
                type="number"
                value={tableRowsInput}
                min={1}
                max={20}
                onChange={(e) => setTableRowsInput(Number(e.target.value))}
                style={{ ...inputStyle, width: 40, padding: "4px 6px", textAlign: "center" }}
                title="Rows"
              />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>x</span>
              <input
                type="number"
                value={tableColsInput}
                min={1}
                max={10}
                onChange={(e) => setTableColsInput(Number(e.target.value))}
                style={{ ...inputStyle, width: 40, padding: "4px 6px", textAlign: "center" }}
                title="Cols"
              />
            </div>
            <button onClick={handleAddTable} style={{ ...btnStyle, width: "100%" }}>
              <Table size={14} /> Add Table
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowShapeMenu(!showShapeMenu)}
                style={{ ...btnStyle, width: "100%" }}
              >
                <Square size={14} /> Add Shape
              </button>
              {showShapeMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    zIndex: 10,
                    overflow: "hidden",
                    marginTop: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <button
                    onClick={() => handleAddShape("rectangle")}
                    style={{
                      ...btnStyle,
                      border: "none",
                      borderRadius: 0,
                      width: "100%",
                      padding: "8px 12px",
                    }}
                  >
                    <Square size={13} /> Rectangle
                  </button>
                  <button
                    onClick={() => handleAddShape("circle")}
                    style={{
                      ...btnStyle,
                      border: "none",
                      borderRadius: 0,
                      width: "100%",
                      padding: "8px 12px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <Circle size={13} /> Circle
                  </button>
                  <button
                    onClick={() => handleAddShape("line")}
                    style={{
                      ...btnStyle,
                      border: "none",
                      borderRadius: 0,
                      width: "100%",
                      padding: "8px 12px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <Minus size={13} /> Line
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Page Management */}
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 2,
              }}
            >
              Pages
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                style={{
                  ...btnStyle,
                  padding: "4px 6px",
                  opacity: currentPage <= 1 ? 0.4 : 1,
                  cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <span
                style={{
                  fontSize: 12,
                  flex: 1,
                  textAlign: "center",
                  color: "var(--card-foreground)",
                }}
              >
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                style={{
                  ...btnStyle,
                  padding: "4px 6px",
                  opacity: currentPage >= totalPages ? 0.4 : 1,
                  cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <button onClick={handleAddPage} style={{ ...btnStyle, width: "100%", justifyContent: "center" }}>
              <Plus size={14} /> Add Page
            </button>
          </div>

          {/* Element List */}
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 6,
                padding: "0 4px",
              }}
            >
              Elements (Page {currentPage})
            </div>
            {pageElements.filter((el) => !(el.x === -1 && el.y === -1 && el.width === 0)).length === 0 ? (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                No elements on this page
              </div>
            ) : (
              pageElements
                .filter((el) => !(el.x === -1 && el.y === -1 && el.width === 0))
                .map((el) => (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                      marginBottom: 2,
                      backgroundColor:
                        el.id === selectedElement ? "var(--accent)" : "transparent",
                      fontSize: 12,
                      color: "var(--card-foreground)",
                      transition: "background-color 0.1s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                      {el.type === "text" && <Type size={12} />}
                      {el.type === "image" && <Image size={12} />}
                      {el.type === "table" && <Table size={12} />}
                      {el.type === "shape" && <Square size={12} />}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {el.type === "text"
                          ? (el.text || "Text").slice(0, 20)
                          : el.type === "shape"
                            ? el.shapeType || "Shape"
                            : el.type === "table"
                              ? `Table ${el.tableRows}x${el.tableCols}`
                              : "Image"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveElement(el.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted-foreground)",
                        padding: 2,
                        display: "flex",
                        flexShrink: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right Area - Canvas and Properties */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Canvas Preview */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              overflow: "auto",
              backgroundColor: "var(--background)",
            }}
          >
            <div
              style={{
                width: canvasWidth * scale,
                height: canvasHeight * scale,
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
                position: "relative",
                borderRadius: 2,
                flexShrink: 0,
              }}
              onClick={() => onSelectElement(null)}
            >
              {pageElements.map(renderElementOnCanvas)}
              {pageElements.filter((el) => !(el.x === -1 && el.y === -1 && el.width === 0)).length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ccc",
                    fontSize: 14,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Move size={28} strokeWidth={1} />
                    <div style={{ marginTop: 8 }}>Add elements using the toolbar</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          <div
            style={{
              height: 220,
              backgroundColor: "var(--card)",
              borderTop: "1px solid var(--border)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                backgroundColor: "var(--secondary)",
              }}
            >
              Properties
            </div>
            {renderProperties()}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "var(--card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", marginRight: 6 }}>Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              style={{ ...inputStyle, appearance: "auto", padding: "4px 8px" }}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setOrientation("portrait")}
              style={{
                ...(orientation === "portrait" ? btnPrimaryStyle : btnStyle),
                padding: "4px 10px",
                fontSize: 12,
              }}
            >
              Portrait
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              style={{
                ...(orientation === "landscape" ? btnPrimaryStyle : btnStyle),
                padding: "4px 10px",
                fontSize: 12,
              }}
            >
              Landscape
            </button>
          </div>
        </div>

        <button
          onClick={() => onGeneratePdf(pageSize, orientation)}
          style={{ ...btnPrimaryStyle, padding: "8px 20px", fontSize: 14, fontWeight: 500 }}
        >
          <FileDown size={16} /> Generate PDF
        </button>
      </div>
    </div>
  );
}
