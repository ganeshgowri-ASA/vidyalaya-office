"use client";

import React, { useState, useCallback } from "react";
import {
  Table, Image, Code, Quote, Minus, Link, BookOpen,
  SeparatorHorizontal, Droplets, Hash, FileText, Mail,
  Wand2, MessageCircle, Type, Bookmark, FileImage,
  Shapes, BarChart3, Network, ImageIcon, Video,
  Stamp, ChevronDown, Calendar, Sigma, Globe,
  TextCursorInput, Pen, Puzzle, SquareStack, Layers,
  Smile,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator } from "./toolbar-button";
import {
  SPECIAL_CHARACTERS, SHAPES_GALLERY, SMARTART_TYPES,
  CHART_TYPES, WORDART_STYLES, COVER_PAGE_DESIGNS,
  HEADER_GALLERY, FOOTER_GALLERY,
} from "./constants";
import {
  ShapePicker, IconPicker, SHAPE_DEFINITIONS,
  type ShapeDefinition, type IconDefinition,
} from "@/components/shared/shapes-icons-library";
import { CHART_CATEGORIES, type AdvancedChartType } from "@/components/shared/chart-types";

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function focusEditor() {
  const editor = document.getElementById("doc-editor");
  if (editor && document.activeElement !== editor) {
    editor.focus();
  }
}

function runCmd(command: string, value?: string) {
  focusEditor();
  setTimeout(() => execCmd(command, value), 0);
}

export function InsertTab() {
  const {
    showWatermark, toggleWatermark, setWatermarkText, watermarkText,
    toggleHeaderFooter, showHeaderFooter,
    toggleComments, showComments,
    setShowSmartArtModal,
  } = useDocumentStore();

  const [showTableGrid, setShowTableGrid] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [showWordArt, setShowWordArt] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showSmartArt, setShowSmartArt] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [showPageNumber, setShowPageNumber] = useState(false);
  const [showTextBox, setShowTextBox] = useState(false);
  const [showDropCap, setShowDropCap] = useState(false);
  const [tableHover, setTableHover] = useState({ row: 0, col: 0 });
  const [showAdvancedShapes, setShowAdvancedShapes] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showAdvancedChart, setShowAdvancedChart] = useState(false);

  const insertTable = useCallback((rows: number, cols: number) => {
    focusEditor();
    let html = '<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += '<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">Header ' + (c + 1) + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #ddd;padding:8px;">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p></p>';
    execCmd("insertHTML", html);
    setShowTableGrid(false);
  }, []);

  const insertImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        focusEditor();
        execCmd("insertHTML", `<img src="${ev.target?.result}" style="max-width:100%;height:auto;margin:12px 0;cursor:pointer;" />`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (!url) return;
    const text = prompt("Display text:", url) || url;
    const tooltip = prompt("Tooltip (optional):") || "";
    focusEditor();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      execCmd("createLink", url);
      setTimeout(() => {
        const links = document.querySelectorAll('#doc-editor a[href="' + url + '"]');
        links.forEach((l) => {
          if (tooltip) (l as HTMLElement).title = tooltip;
          (l as HTMLElement).style.color = "#1565C0";
        });
      }, 0);
    } else {
      execCmd("insertHTML", `<a href="${encodeURI(url)}" target="_blank" title="${tooltip}" style="color:#1565C0;">${text}</a>`);
    }
  }, []);

  const insertTOC = useCallback(() => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const headings = editor.querySelectorAll("h1, h2, h3, h4");
    let tocHtml = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;"><h3 style="margin-top:0;color:#2F5496;">Table of Contents</h3><ul style="list-style:none;padding:0;">';
    headings.forEach((h, i) => {
      const level = parseInt(h.tagName[1]);
      const indent = (level - 1) * 20;
      tocHtml += `<li style="margin-left:${indent}px;padding:2px 0;"><a href="#toc-${i}" style="color:#1565C0;text-decoration:none;">${h.textContent}</a></li>`;
      h.id = `toc-${i}`;
    });
    tocHtml += '</ul></div><p></p>';
    execCmd("insertHTML", tocHtml);
  }, []);

  const insertShape = (shapeName: string) => {
    focusEditor();
    const colors = ["#4472C4", "#ED7D31", "#70AD47", "#FFC000", "#5B9BD5"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    let svg = "";
    switch (shapeName) {
      case "Rectangle":
      case "Process":
        svg = `<div style="width:150px;height:80px;background:${color};border:2px solid ${color};margin:12px auto;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;" contenteditable="true">Text</div>`;
        break;
      case "Rounded Rectangle":
      case "Terminator":
        svg = `<div style="width:150px;height:80px;background:${color};border-radius:12px;border:2px solid ${color};margin:12px auto;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;" contenteditable="true">Text</div>`;
        break;
      case "Oval":
        svg = `<div style="width:120px;height:80px;background:${color};border-radius:50%;border:2px solid ${color};margin:12px auto;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;" contenteditable="true">Text</div>`;
        break;
      case "Diamond":
      case "Decision":
        svg = `<div style="width:100px;height:100px;background:${color};transform:rotate(45deg);margin:24px auto;display:flex;align-items:center;justify-content:center;" contenteditable="true"><span style="transform:rotate(-45deg);color:white;font-size:11px;">Text</span></div>`;
        break;
      default:
        svg = `<div style="width:150px;height:80px;background:${color};border:2px solid ${color};margin:12px auto;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;" contenteditable="true">${shapeName}</div>`;
    }
    execCmd("insertHTML", svg + "<p></p>");
    setShowShapes(false);
  };

  const insertAdvancedShape = useCallback((shape: ShapeDefinition) => {
    focusEditor();
    const color = "#4472C4";
    const svgHtml = `<div style="display:inline-block;margin:12px auto;text-align:center;">
      <svg viewBox="0 0 100 100" width="150" height="120" style="display:block;margin:0 auto;">
        <path d="${shape.svgPath}" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2" />
        ${shape.allowText ? `<text x="50" y="52" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="10">Text</text>` : ''}
      </svg>
      <div style="font-size:9px;color:#666;margin-top:2px;">${shape.name}</div>
    </div><p></p>`;
    execCmd("insertHTML", svgHtml);
    setShowAdvancedShapes(false);
  }, []);

  const insertIcon = useCallback((icon: IconDefinition) => {
    focusEditor();
    // Insert as a styled span placeholder
    execCmd("insertHTML", `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#4472C4;color:white;border-radius:4px;font-size:14px;vertical-align:middle;margin:0 4px;" title="${icon.name}">⬡</span>`);
    setShowIconPicker(false);
  }, []);

  const insertAdvancedChart = useCallback((chartType: string, chartLabel: string) => {
    focusEditor();
    const barColors = ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5'];
    const chartHtml = `<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;text-align:center;border-radius:8px;">
      <div style="font-weight:bold;margin-bottom:8px;color:#2F5496;font-size:13px;">${chartLabel}</div>
      <div style="font-size:10px;color:#888;margin-bottom:8px;">Chart Type: ${chartType}</div>
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:6px;height:100px;padding:8px;">
        ${[55, 75, 40, 85, 65, 50, 70].map((h, i) =>
          `<div style="width:24px;height:${h}%;background:${barColors[i % barColors.length]};border-radius:2px 2px 0 0;"></div>`
        ).join('')}
      </div>
      <div style="font-size:9px;color:#888;margin-top:4px;">Sample visualization - ${chartLabel}</div>
    </div><p></p>`;
    execCmd("insertHTML", chartHtml);
    setShowAdvancedChart(false);
  }, []);

  const insertChart = (chartType: string) => {
    focusEditor();
    // Insert a placeholder chart image
    const chartHtml = `<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;text-align:center;">
      <div style="font-weight:bold;margin-bottom:8px;color:#2F5496;">${chartType} Chart</div>
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;height:120px;padding:8px;">
        ${[60, 80, 45, 90, 70].map((h, i) =>
          `<div style="width:30px;height:${h}%;background:#4472C4;border-radius:2px 2px 0 0;opacity:${0.6 + i * 0.08};"></div>`
        ).join("")}
      </div>
      <div style="font-size:10px;color:#666;margin-top:4px;">Sample Data - Click to edit</div>
    </div><p></p>`;
    execCmd("insertHTML", chartHtml);
    setShowChart(false);
  };

  return (
    <>
      {/* ===== PAGES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<FileImage size={14} />} label="Cover Page" title="Cover Page" onClick={() => setShowCoverPage(!showCoverPage)} />
            {showCoverPage && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-52"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Cover Page Designs</div>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_PAGE_DESIGNS.map((d) => (
                    <button key={d.name} className="p-2 rounded border text-center hover:bg-[var(--muted)] cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => {
                        focusEditor();
                        const coverHtml = `<div style="page-break-after:always;min-height:800px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-left:8px solid ${d.color};">
                          <h1 style="font-size:36pt;color:${d.color};margin-bottom:16px;" contenteditable="true">Document Title</h1>
                          <h2 style="font-size:18pt;color:#666;margin-bottom:24px;" contenteditable="true">Subtitle</h2>
                          <p style="color:#888;" contenteditable="true">Author Name</p>
                          <p style="color:#888;" contenteditable="true">${new Date().toLocaleDateString()}</p>
                        </div><p></p>`;
                        execCmd("insertHTML", coverHtml);
                        setShowCoverPage(false);
                      }}>
                      <div className="w-full h-12 rounded mb-1" style={{ background: `linear-gradient(135deg, ${d.color}22, ${d.color}44)`, borderLeft: `4px solid ${d.color}` }} />
                      <span className="text-[9px]" style={{ color: "var(--foreground)" }}>{d.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <ToolbarButton icon={<SquareStack size={14} />} label="Blank Page" title="Insert Blank Page" onClick={() => {
            focusEditor();
            execCmd("insertHTML", '<div style="page-break-after:always;min-height:200px;"><p>&nbsp;</p></div><p></p>');
          }} />
          <ToolbarButton icon={<SeparatorHorizontal size={14} />} label="Page Break" title="Insert Page Break" onClick={() => {
            focusEditor();
            execCmd("insertHTML", '<div style="page-break-after:always;border-top:2px dashed #ccc;margin:24px 0;padding-top:4px;text-align:center;color:#999;font-size:10px;">— Page Break —</div><p></p>');
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Pages</span>
      </div>

      {/* ===== TABLES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Table size={14} />} label="Table" title="Insert Table" onClick={() => setShowTableGrid(!showTableGrid)} />
            {showTableGrid && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] mb-2" style={{ color: "var(--muted-foreground)" }}>
                  {tableHover.row > 0 ? `${tableHover.row} x ${tableHover.col} Table` : "Insert Table"}
                </div>
                <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(10, 16px)" }}>
                  {Array.from({ length: 8 }, (_, r) =>
                    Array.from({ length: 10 }, (_, c) => (
                      <button
                        key={`${r}-${c}`}
                        className="w-4 h-4 border transition-colors"
                        style={{
                          borderColor: "#ccc",
                          backgroundColor: r < tableHover.row && c < tableHover.col ? "#4472C4" : "#fff",
                        }}
                        onMouseEnter={() => setTableHover({ row: r + 1, col: c + 1 })}
                        onClick={() => insertTable(r + 1, c + 1)}
                      />
                    ))
                  )}
                </div>
                <hr className="my-2" style={{ borderColor: "var(--border)" }} />
                <button className="w-full text-left text-xs px-2 py-1 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => {
                    const rows = parseInt(prompt("Number of rows:") || "3");
                    const cols = parseInt(prompt("Number of columns:") || "3");
                    if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) insertTable(rows, cols);
                  }}>
                  Insert Table...
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Tables</span>
      </div>

      {/* ===== ILLUSTRATIONS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Image size={14} />} label="Pictures" title="Insert Picture" onClick={insertImage} />
          <ToolbarButton icon={<Globe size={14} />} label="Online" title="Online Pictures" onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) {
              focusEditor();
              execCmd("insertHTML", `<img src="${encodeURI(url)}" style="max-width:100%;height:auto;margin:12px 0;" />`);
            }
          }} />
          {/* Shapes */}
          <div className="relative">
            <ToolbarButton icon={<Shapes size={14} />} label="Shapes" title="Shapes" onClick={() => setShowAdvancedShapes(!showAdvancedShapes)} />
            {showAdvancedShapes && (
              <div className="absolute top-full left-0 z-50 mt-1">
                <ShapePicker onSelectShape={insertAdvancedShape} onClose={() => setShowAdvancedShapes(false)} />
              </div>
            )}
          </div>
          {/* Icons */}
          <div className="relative">
            <ToolbarButton icon={<Smile size={14} />} label="Icons" title="Icons Library" onClick={() => setShowIconPicker(!showIconPicker)} />
            {showIconPicker && (
              <div className="absolute top-full left-0 z-50 mt-1">
                <IconPicker onSelectIcon={insertIcon} onClose={() => setShowIconPicker(false)} />
              </div>
            )}
          </div>
          {/* SmartArt */}
          <ToolbarButton icon={<Network size={14} />} label="SmartArt" title="SmartArt & Infographics" onClick={() => setShowSmartArtModal(true)} />
          {/* Chart */}
          <div className="relative">
            <ToolbarButton icon={<BarChart3 size={14} />} label="Chart" title="Insert Chart" onClick={() => setShowAdvancedChart(!showAdvancedChart)} />
            {showAdvancedChart && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-72 max-h-96 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Chart Types</div>
                {/* Basic charts */}
                {CHART_TYPES.map((ct) => (
                  <button key={ct.name} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => insertChart(ct.name)}>
                    {ct.name}
                  </button>
                ))}
                <hr className="my-1.5" style={{ borderColor: "var(--border)" }} />
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Advanced Charts</div>
                {Object.entries(CHART_CATEGORIES).map(([key, category]) => (
                  <div key={key}>
                    <div className="text-[9px] font-semibold mt-1.5 mb-0.5 px-2" style={{ color: "var(--muted-foreground)" }}>{category.label}</div>
                    <div className="grid grid-cols-2 gap-0.5">
                      {category.types.map(ct => (
                        <button key={ct.type} className="text-left text-[10px] px-2 py-1 rounded hover:bg-[var(--muted)]"
                          style={{ color: "var(--foreground)" }}
                          onClick={() => insertAdvancedChart(ct.type, ct.label)}>
                          {ct.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Illustrations</span>
      </div>

      {/* ===== LINKS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Link size={14} />} label="Link" title="Insert Hyperlink" onClick={insertLink} />
          <ToolbarButton icon={<Bookmark size={14} />} label="Bookmark" title="Insert Bookmark" onClick={() => {
            const name = prompt("Bookmark name:");
            if (!name) return;
            focusEditor();
            execCmd("insertHTML", `<a name="${name}" id="bookmark-${name}" style="background:#e8f4fd;border:1px solid #90caf9;border-radius:2px;padding:0 4px;font-size:10px;color:#1565C0;">🔖${name}</a>`);
          }} />
          <ToolbarButton icon={<Hash size={14} />} label="Cross-ref" title="Cross-reference" onClick={() => {
            const ref = prompt("Reference name (bookmark):");
            if (!ref) return;
            focusEditor();
            execCmd("insertHTML", `<a href="#bookmark-${ref}" style="color:#1565C0;text-decoration:underline;">${ref}</a>`);
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Links</span>
      </div>

      {/* ===== COMMENTS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<MessageCircle size={14} />} label="Comment" title="New Comment" active={showComments} onClick={toggleComments} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Comments</span>
      </div>

      {/* ===== HEADER & FOOTER GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Stamp size={14} />} label="Header" title="Header" onClick={() => setShowHeaderMenu(!showHeaderMenu)} />
            {showHeaderMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {HEADER_GALLERY.map((h) => (
                  <button key={h.name} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      if (!showHeaderFooter) toggleHeaderFooter();
                      setShowHeaderMenu(false);
                    }}>
                    {h.name || "Blank Header"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <ToolbarButton icon={<Stamp size={14} />} label="Footer" title="Footer" onClick={() => setShowFooterMenu(!showFooterMenu)} />
            {showFooterMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {FOOTER_GALLERY.map((f) => (
                  <button key={f.name} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      if (!showHeaderFooter) toggleHeaderFooter();
                      setShowFooterMenu(false);
                    }}>
                    {f.name || "Blank Footer"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <ToolbarButton icon={<Hash size={14} />} label="Page #" title="Page Number" onClick={() => setShowPageNumber(!showPageNumber)} />
            {showPageNumber && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {["Top of Page", "Bottom of Page", "Page Margins", "Current Position"].map((pos) => (
                  <button key={pos} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      if (!showHeaderFooter) toggleHeaderFooter();
                      const store = useDocumentStore.getState();
                      if (pos === "Top of Page" || pos === "Page Margins") {
                        store.setHeaderText(store.headerText ? store.headerText + " | Page #" : "Page #");
                      } else {
                        store.setFooterText(store.footerText ? store.footerText + " | Page #" : "Page #");
                      }
                      setShowPageNumber(false);
                    }}>
                    {pos}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Header & Footer</span>
      </div>

      {/* ===== TEXT GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<TextCursorInput size={14} />} label="Text Box" title="Text Box" onClick={() => {
            focusEditor();
            execCmd("insertHTML", '<div style="border:1px solid #ccc;padding:12px;margin:12px 0;min-height:60px;background:#fafafa;" contenteditable="true">Type text here...</div><p></p>');
          }} />
          {/* Word Art */}
          <div className="relative">
            <ToolbarButton icon={<Wand2 size={14} />} label="WordArt" title="Insert Word Art" onClick={() => setShowWordArt(!showWordArt)} />
            {showWordArt && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg w-72 max-h-64 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Word Art Styles</div>
                <div className="grid grid-cols-3 gap-2">
                  {WORDART_STYLES.map((art) => (
                    <button key={art.label} className="p-2 rounded border text-center hover:bg-[var(--muted)] cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => {
                        const text = prompt("Enter Word Art text:") || "Word Art";
                        focusEditor();
                        execCmd("insertHTML", `<p style="${art.style}">${text}</p><p></p>`);
                        setShowWordArt(false);
                      }}>
                      <span className="text-[9px]" style={{ color: "var(--foreground)" }}>{art.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Drop Cap */}
          <div className="relative">
            <ToolbarButton icon={<Type size={14} />} label="Drop Cap" title="Drop Cap" onClick={() => setShowDropCap(!showDropCap)} />
            {showDropCap && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-36"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {[
                  { label: "Dropped", style: "float:left;font-size:48px;line-height:1;margin:0 8px 0 0;font-weight:bold;color:#2F5496;" },
                  { label: "In Margin", style: "float:left;font-size:48px;line-height:1;margin:0 8px 0 -40px;font-weight:bold;color:#2F5496;" },
                  { label: "None", style: "" },
                ].map((dc) => (
                  <button key={dc.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      if (dc.style) {
                        focusEditor();
                        const sel = window.getSelection();
                        if (sel && sel.anchorNode) {
                          const text = sel.anchorNode.textContent || "";
                          if (text.length > 0) {
                            const firstChar = text.charAt(0);
                            const rest = text.substring(1);
                            const parent = sel.anchorNode.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span style="${dc.style}">${firstChar}</span>${rest}`;
                            }
                          }
                        }
                      }
                      setShowDropCap(false);
                    }}>
                    {dc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarButton icon={<Calendar size={14} />} label="Date" title="Insert Date & Time" onClick={() => {
            focusEditor();
            const now = new Date();
            execCmd("insertText", now.toLocaleDateString() + " " + now.toLocaleTimeString());
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Text</span>
      </div>

      {/* ===== SYMBOLS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Sigma size={14} />} label="Equation" title="Equation Editor" onClick={() => {
            useDocumentStore.getState().setShowEquationEditor(true);
          }} />
          <div className="relative">
            <ToolbarButton icon={<span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Ω</span>} label="Symbol" title="Insert Symbol" onClick={() => setShowSpecialChars(!showSpecialChars)} />
            {showSpecialChars && (
              <div className="absolute top-full right-0 z-50 mt-1 rounded-lg border p-3 shadow-lg"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 280 }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Special Characters</div>
                <div className="grid grid-cols-8 gap-0.5">
                  {SPECIAL_CHARACTERS.map((ch, i) => (
                    <button
                      key={ch + i}
                      className="w-7 h-7 rounded text-sm hover:bg-[var(--muted)] flex items-center justify-center cursor-pointer"
                      style={{ color: "var(--foreground)" }}
                      onClick={() => {
                        focusEditor();
                        execCmd("insertText", ch);
                        setShowSpecialChars(false);
                      }}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Symbols</span>
      </div>

      {/* ===== MEDIA & WATERMARK ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Video size={14} />} label="Video" title="Online Video" onClick={() => {
            const url = prompt("Enter video URL (YouTube, etc.):");
            if (url) {
              focusEditor();
              execCmd("insertHTML", `<div style="border:1px solid #ddd;padding:8px;margin:12px 0;background:#000;text-align:center;">
                <div style="color:white;padding:40px;">▶ Video: ${url}</div>
              </div><p></p>`);
            }
          }} />
          {/* Watermark */}
          <div className="relative">
            <ToolbarButton icon={<Droplets size={14} />} label="Watermark" title="Insert Watermark" onClick={() => setShowWatermarkMenu(!showWatermarkMenu)} />
            {showWatermarkMenu && (
              <div className="absolute top-full right-0 z-50 mt-1 rounded-lg border p-2 shadow-lg"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 180 }}>
                <div className="text-[10px] font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Watermark</div>
                {["CONFIDENTIAL", "DO NOT COPY", "DRAFT", "SAMPLE"].map((w) => (
                  <button key={w} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => { setWatermarkText(w); if (!showWatermark) toggleWatermark(); setShowWatermarkMenu(false); }}>
                    {w}
                  </button>
                ))}
                <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => {
                    const text = prompt("Enter custom watermark:");
                    if (text) { setWatermarkText(text); if (!showWatermark) toggleWatermark(); }
                    setShowWatermarkMenu(false);
                  }}>
                  Custom Text...
                </button>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: showWatermark ? "var(--primary)" : "var(--foreground)" }}
                  onClick={() => { toggleWatermark(); setShowWatermarkMenu(false); }}>
                  {showWatermark ? "Remove Watermark" : "Show Watermark"}
                </button>
              </div>
            )}
          </div>
          {/* Footnotes */}
          <ToolbarButton icon={<FileText size={14} />} label="Footnote" title="Insert Footnote" onClick={() => {
            focusEditor();
            const editor = document.getElementById("doc-editor");
            if (!editor) return;
            const footnotes = editor.querySelectorAll(".doc-footnote-ref");
            const num = footnotes.length + 1;
            execCmd("insertHTML", `<sup class="doc-footnote-ref" style="color:#1565C0;cursor:pointer;font-size:10px;">[${num}]</sup>`);
            let fnContainer = editor.querySelector(".doc-footnotes");
            if (!fnContainer) {
              const div = document.createElement("div");
              div.className = "doc-footnotes";
              div.style.cssText = "border-top:1px solid #ccc;margin-top:40px;padding-top:10px;font-size:10px;color:#555;";
              div.innerHTML = '<div style="font-weight:bold;margin-bottom:4px;">Footnotes</div>';
              editor.appendChild(div);
              fnContainer = div;
            }
            const fnDiv = document.createElement("div");
            fnDiv.style.cssText = "margin:2px 0;";
            fnDiv.innerHTML = `<sup style="color:#1565C0;">[${num}]</sup> <span contenteditable="true" style="outline:none;">Enter footnote text here</span>`;
            fnContainer.appendChild(fnDiv);
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Media</span>
      </div>
    </>
  );
}
