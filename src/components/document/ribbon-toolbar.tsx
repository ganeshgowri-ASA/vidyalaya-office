"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent,
  Table, Image, Code, Quote, Minus, Link, BookOpen,
  Columns3, Search, Printer, ZoomIn, ZoomOut,
  Type, Highlighter, Heading1, Heading2, Heading3, Pilcrow,
  Sparkles, LayoutTemplate,
  Undo2, Redo2, SeparatorHorizontal, Hash, Ruler,
  Droplets, Paintbrush, Footprints, Mail, Frame, PaintBucket,
  GitBranch, MessageCircle, PanelRight, Stamp,
  FileText as FootnoteIcon, Wand2,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator, ToolbarDropdown } from "./toolbar-button";
import { FONTS, FONT_SIZES, TEXT_COLORS, HIGHLIGHT_COLORS, PAGE_SIZES, MARGIN_PRESETS } from "./constants";
import type { PageSize, MarginPreset, LineSpacing } from "@/store/document-store";

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

// Color picker popover
function ColorPicker({
  colors,
  onSelect,
  onClose,
}: {
  colors: string[];
  onSelect: (color: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="grid grid-cols-4 gap-1">
        {colors.map((c) => (
          <button
            key={c}
            className="h-6 w-6 rounded border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
            onClick={() => {
              onSelect(c);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function RibbonToolbar() {
  const {
    activeTab, setActiveTab,
    currentFont, setCurrentFont,
    currentFontSize, setCurrentFontSize,
    zoom, setZoom,
    pageSize, setPageSize,
    margins, setMargins,
    lineSpacing, setLineSpacing,
    columns, setColumns,
    toggleAI, showAI,
    setShowTemplates,
    setShowFindReplace,
    setShowPrintPreview,
    trackChanges, toggleTrackChanges,
    showComments, toggleComments,
    showStylesPanel, toggleStylesPanel,
    showWatermark, toggleWatermark, setWatermarkText, watermarkText,
    showHeaderFooter, toggleHeaderFooter,
  } = useDocumentStore();

  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [showWordArt, setShowWordArt] = useState(false);
  const [showParaBorders, setShowParaBorders] = useState(false);
  const [showPageBorders, setShowPageBorders] = useState(false);
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleFont = useCallback((font: string) => {
    setCurrentFont(font);
    runCmd("fontName", font);
  }, [setCurrentFont]);

  const handleFontSize = useCallback((size: string) => {
    setCurrentFontSize(size);
    focusEditor();
    // execCommand fontSize only supports 1-7. We use a span approach.
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      execCmd("fontSize", "7");
      // Replace the font size
      setTimeout(() => {
        const fontElements = document.querySelectorAll('#doc-editor font[size="7"]');
        fontElements.forEach((el) => {
          const span = document.createElement("span");
          span.style.fontSize = size + "pt";
          span.innerHTML = el.innerHTML;
          el.parentNode?.replaceChild(span, el);
        });
      }, 0);
    }
  }, [setCurrentFontSize]);

  const insertTable = useCallback(() => {
    focusEditor();
    const rows = parseInt(prompt("Number of rows:") || "3");
    const cols = parseInt(prompt("Number of columns:") || "3");
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) return;
    let html = '<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += '<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">Header ' + (c + 1) + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #ddd;padding:8px;">Cell</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p></p>';
    execCmd("insertHTML", html);
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
        execCmd("insertHTML", `<img src="${ev.target?.result}" style="max-width:100%;height:auto;margin:12px 0;" />`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (!url) return;
    const sel = window.getSelection();
    const text = sel && !sel.isCollapsed ? sel.toString() : url;
    focusEditor();
    if (sel && !sel.isCollapsed) {
      execCmd("createLink", url);
    } else {
      execCmd("insertHTML", `<a href="${encodeURI(url)}" target="_blank" style="color:#1565C0;">${text}</a>`);
    }
  }, []);

  const insertTOC = useCallback(() => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const headings = editor.querySelectorAll("h1, h2, h3");
    let tocHtml = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;"><h3 style="margin-top:0;">Table of Contents</h3><ul>';
    headings.forEach((h, i) => {
      const level = parseInt(h.tagName[1]);
      const indent = (level - 1) * 20;
      tocHtml += `<li style="margin-left:${indent}px;list-style:none;padding:2px 0;"><a href="#toc-${i}" style="color:#1565C0;text-decoration:none;">${h.textContent}</a></li>`;
      h.id = `toc-${i}`;
    });
    tocHtml += '</ul></div><p></p>';
    execCmd("insertHTML", tocHtml);
  }, []);

  const tabs = [
    { key: "home" as const, label: "Home" },
    { key: "insert" as const, label: "Insert" },
    { key: "layout" as const, label: "Layout" },
    { key: "view" as const, label: "View" },
  ];

  return (
    <div className="no-print flex-shrink-0 border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b px-2" style={{ borderColor: "var(--border)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === t.key ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--muted-foreground)]"
            }`}
            style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <ToolbarButton
          icon={<Sparkles size={16} />}
          label={showAI ? "Hide AI" : "AI Assistant"}
          title="Toggle AI Assistant"
          active={showAI}
          onClick={toggleAI}
        />
        <ToolbarButton
          icon={<LayoutTemplate size={16} />}
          label="Templates"
          title="Document Templates"
          onClick={() => setShowTemplates(true)}
        />
      </div>

      {/* Toolbar content */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 min-h-[44px]">
        {activeTab === "home" && (
          <>
            {/* Undo/Redo */}
            <ToolbarButton icon={<Undo2 size={15} />} title="Undo (Ctrl+Z)" onClick={() => runCmd("undo")} />
            <ToolbarButton icon={<Redo2 size={15} />} title="Redo (Ctrl+Y)" onClick={() => runCmd("redo")} />
            <ToolbarSeparator />

            {/* Font */}
            <ToolbarDropdown
              value={currentFont}
              options={FONTS.map((f) => ({ value: f, label: f }))}
              onChange={handleFont}
              title="Font Family"
              className="w-[140px]"
            />
            <ToolbarDropdown
              value={currentFontSize}
              options={FONT_SIZES.map((s) => ({ value: s, label: s }))}
              onChange={handleFontSize}
              title="Font Size"
              className="w-[60px]"
            />
            <ToolbarSeparator />

            {/* Formatting */}
            <ToolbarButton icon={<Bold size={15} />} title="Bold (Ctrl+B)" onClick={() => runCmd("bold")} />
            <ToolbarButton icon={<Italic size={15} />} title="Italic (Ctrl+I)" onClick={() => runCmd("italic")} />
            <ToolbarButton icon={<Underline size={15} />} title="Underline (Ctrl+U)" onClick={() => runCmd("underline")} />
            <ToolbarButton icon={<Strikethrough size={15} />} title="Strikethrough" onClick={() => runCmd("strikeThrough")} />
            <ToolbarSeparator />

            {/* Colors */}
            <div className="relative" ref={textColorRef}>
              <ToolbarButton
                icon={<Type size={15} />}
                title="Text Color"
                onClick={() => { setShowTextColor(!showTextColor); setShowHighlight(false); }}
              />
              {showTextColor && (
                <ColorPicker
                  colors={TEXT_COLORS}
                  onSelect={(c) => runCmd("foreColor", c)}
                  onClose={() => setShowTextColor(false)}
                />
              )}
            </div>
            <div className="relative" ref={highlightRef}>
              <ToolbarButton
                icon={<Highlighter size={15} />}
                title="Highlight Color"
                onClick={() => { setShowHighlight(!showHighlight); setShowTextColor(false); }}
              />
              {showHighlight && (
                <ColorPicker
                  colors={HIGHLIGHT_COLORS}
                  onSelect={(c) => runCmd("hiliteColor", c)}
                  onClose={() => setShowHighlight(false)}
                />
              )}
            </div>
            <ToolbarSeparator />

            {/* Headings */}
            <ToolbarButton icon={<Heading1 size={15} />} title="Heading 1" onClick={() => runCmd("formatBlock", "h1")} />
            <ToolbarButton icon={<Heading2 size={15} />} title="Heading 2" onClick={() => runCmd("formatBlock", "h2")} />
            <ToolbarButton icon={<Heading3 size={15} />} title="Heading 3" onClick={() => runCmd("formatBlock", "h3")} />
            <ToolbarButton icon={<Pilcrow size={15} />} title="Paragraph" onClick={() => runCmd("formatBlock", "p")} />
            <ToolbarSeparator />

            {/* Alignment */}
            <ToolbarButton icon={<AlignLeft size={15} />} title="Align Left" onClick={() => runCmd("justifyLeft")} />
            <ToolbarButton icon={<AlignCenter size={15} />} title="Align Center" onClick={() => runCmd("justifyCenter")} />
            <ToolbarButton icon={<AlignRight size={15} />} title="Align Right" onClick={() => runCmd("justifyRight")} />
            <ToolbarButton icon={<AlignJustify size={15} />} title="Justify" onClick={() => runCmd("justifyFull")} />
            <ToolbarSeparator />

            {/* Lists */}
            <ToolbarButton icon={<List size={15} />} title="Bullet List" onClick={() => runCmd("insertUnorderedList")} />
            <ToolbarButton icon={<ListOrdered size={15} />} title="Numbered List" onClick={() => runCmd("insertOrderedList")} />
            <ToolbarButton icon={<Indent size={15} />} title="Indent" onClick={() => runCmd("indent")} />
            <ToolbarButton icon={<Outdent size={15} />} title="Outdent" onClick={() => runCmd("outdent")} />
            <ToolbarSeparator />

            {/* Styles Panel */}
            <ToolbarButton icon={<PanelRight size={15} />} label="Styles" title="Styles Panel" active={showStylesPanel} onClick={toggleStylesPanel} />

            {/* Paragraph Borders & Shading */}
            <div className="relative">
              <ToolbarButton icon={<PaintBucket size={15} />} label="Para Borders" title="Paragraph Borders & Shading" onClick={() => setShowParaBorders(!showParaBorders)} />
              {showParaBorders && (
                <div
                  className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 220 }}
                >
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Paragraph Shading</div>
                  <div className="grid grid-cols-4 gap-1 mb-3">
                    {["#fff3cd", "#d1ecf1", "#d4edda", "#f8d7da", "#e2e3e5", "#cce5ff", "#fff", "transparent"].map((c) => (
                      <button key={c} className="h-6 w-6 rounded border" style={{ backgroundColor: c, borderColor: "#ccc" }}
                        onClick={() => {
                          focusEditor();
                          const sel = window.getSelection();
                          if (sel && sel.rangeCount) {
                            const block = sel.anchorNode?.parentElement?.closest("p, div, blockquote, li, h1, h2, h3, h4, h5, h6");
                            if (block) (block as HTMLElement).style.backgroundColor = c;
                          }
                          setShowParaBorders(false);
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Paragraph Border</div>
                  <div className="space-y-1">
                    {[
                      { label: "Box Border", style: "1px solid #333" },
                      { label: "Shadow Border", style: "2px solid #666" },
                      { label: "Dashed Border", style: "1px dashed #999" },
                      { label: "No Border", style: "none" },
                    ].map((b) => (
                      <button key={b.label} className="w-full text-left text-xs px-2 py-1 rounded hover:bg-[var(--muted)]"
                        style={{ color: "var(--foreground)" }}
                        onClick={() => {
                          focusEditor();
                          const sel = window.getSelection();
                          if (sel && sel.rangeCount) {
                            const block = sel.anchorNode?.parentElement?.closest("p, div, blockquote, li, h1, h2, h3, h4, h5, h6");
                            if (block) {
                              (block as HTMLElement).style.border = b.style;
                              (block as HTMLElement).style.padding = b.style === "none" ? "" : "8px 12px";
                              (block as HTMLElement).style.borderRadius = "4px";
                            }
                          }
                          setShowParaBorders(false);
                        }}
                      >{b.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "insert" && (
          <>
            <ToolbarButton icon={<Table size={15} />} label="Table" title="Insert Table" onClick={insertTable} />
            <ToolbarButton icon={<Image size={15} />} label="Image" title="Insert Image" onClick={insertImage} />
            <ToolbarButton icon={<Code size={15} />} label="Code Block" title="Insert Code Block" onClick={() => {
              focusEditor();
              execCmd("insertHTML", '<pre style="background:#f5f5f5;border:1px solid #ddd;border-radius:4px;padding:12px;font-family:Courier New,monospace;font-size:13px;overflow-x:auto;margin:12px 0;"><code>// Your code here\n</code></pre><p></p>');
            }} />
            <ToolbarButton icon={<Quote size={15} />} label="Quote" title="Insert Blockquote" onClick={() => {
              focusEditor();
              execCmd("insertHTML", '<blockquote style="border-left:4px solid #1565C0;margin:12px 0;padding:8px 16px;color:#555;background:#f9f9f9;">Quote text here</blockquote><p></p>');
            }} />
            <ToolbarSeparator />
            <ToolbarButton icon={<Minus size={15} />} label="Horizontal Rule" title="Insert Horizontal Rule" onClick={() => runCmd("insertHorizontalRule")} />
            <ToolbarButton icon={<Link size={15} />} label="Link" title="Insert Link" onClick={insertLink} />
            <ToolbarButton icon={<BookOpen size={15} />} label="Table of Contents" title="Insert Table of Contents" onClick={insertTOC} />
            <ToolbarSeparator />
            <ToolbarButton icon={<SeparatorHorizontal size={15} />} label="Page Break" title="Insert Page Break" onClick={() => {
              focusEditor();
              execCmd("insertHTML", '<div style="page-break-after:always;border-top:2px dashed #ccc;margin:24px 0;padding-top:4px;text-align:center;color:#999;font-size:10px;">— Page Break —</div><p></p>');
            }} />
            <ToolbarSeparator />
            {/* Watermark */}
            <div className="relative">
              <ToolbarButton icon={<Droplets size={15} />} label="Watermark" title="Insert Watermark" onClick={() => setShowWatermarkMenu(!showWatermarkMenu)} />
              {showWatermarkMenu && (
                <div
                  className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 180 }}
                >
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Watermark Text</div>
                  {["DRAFT", "CONFIDENTIAL", "DO NOT COPY", "SAMPLE", "FINAL"].map((w) => (
                    <button key={w} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                      style={{ color: "var(--foreground)" }}
                      onClick={() => { setWatermarkText(w); if (!showWatermark) toggleWatermark(); setShowWatermarkMenu(false); }}
                    >{w}</button>
                  ))}
                  <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                  <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      const text = prompt("Enter custom watermark:");
                      if (text) { setWatermarkText(text); if (!showWatermark) toggleWatermark(); }
                      setShowWatermarkMenu(false);
                    }}
                  >Custom Text...</button>
                  <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: showWatermark ? "var(--primary)" : "var(--foreground)" }}
                    onClick={() => { toggleWatermark(); setShowWatermarkMenu(false); }}
                  >{showWatermark ? "Remove Watermark" : "Show Watermark"}</button>
                </div>
              )}
            </div>

            {/* Word Art */}
            <div className="relative">
              <ToolbarButton icon={<Wand2 size={15} />} label="Word Art" title="Insert Word Art" onClick={() => setShowWordArt(!showWordArt)} />
              {showWordArt && (
                <div
                  className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 260 }}
                >
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Word Art Styles</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Shadow", style: "font-size:28px;font-weight:bold;color:#1565C0;text-shadow:3px 3px 6px rgba(0,0,0,0.3);" },
                      { label: "Outline", style: "font-size:28px;font-weight:bold;color:transparent;-webkit-text-stroke:2px #E64A19;" },
                      { label: "Glow", style: "font-size:28px;font-weight:bold;color:#F9A825;text-shadow:0 0 10px #F9A825,0 0 20px #F9A825;" },
                      { label: "Gradient", style: "font-size:28px;font-weight:bold;background:linear-gradient(45deg,#1565C0,#E64A19);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" },
                      { label: "3D", style: "font-size:28px;font-weight:bold;color:#2E7D32;text-shadow:1px 1px 0 #1B5E20,2px 2px 0 #1B5E20,3px 3px 0 #1B5E20;" },
                      { label: "Neon", style: "font-size:28px;font-weight:bold;color:#fff;text-shadow:0 0 5px #00f,0 0 10px #00f,0 0 20px #00f,0 0 40px #00f;" },
                    ].map((art) => (
                      <button key={art.label} className="p-2 rounded border text-center hover:bg-[var(--muted)]"
                        style={{ borderColor: "var(--border)" }}
                        onClick={() => {
                          const text = prompt("Enter Word Art text:") || "Word Art";
                          focusEditor();
                          execCmd("insertHTML", `<p style="${art.style}">${text}</p><p></p>`);
                          setShowWordArt(false);
                        }}
                      >
                        <span className="text-xs" style={{ color: "var(--foreground)" }}>{art.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footnotes */}
            <ToolbarButton icon={<FootnoteIcon size={15} />} label="Footnote" title="Insert Footnote" onClick={() => {
              focusEditor();
              const editor = document.getElementById("doc-editor");
              if (!editor) return;
              const footnotes = editor.querySelectorAll(".doc-footnote-ref");
              const num = footnotes.length + 1;
              execCmd("insertHTML", `<sup class="doc-footnote-ref" style="color:#1565C0;cursor:pointer;font-size:10px;">[${num}]</sup>`);
              // Add footnote at bottom
              let fnContainer = editor.querySelector(".doc-footnotes");
              if (!fnContainer) {
                const div = document.createElement("div");
                div.className = "doc-footnotes";
                div.style.cssText = "border-top:1px solid #ccc;margin-top:40px;padding-top:10px;font-size:10px;color:#555;";
                div.innerHTML = `<div style="font-weight:bold;margin-bottom:4px;">Footnotes</div>`;
                editor.appendChild(div);
                fnContainer = div;
              }
              const fnDiv = document.createElement("div");
              fnDiv.style.cssText = "margin:2px 0;";
              fnDiv.innerHTML = `<sup style="color:#1565C0;">[${num}]</sup> <span contenteditable="true" style="outline:none;">Enter footnote text here</span>`;
              fnContainer.appendChild(fnDiv);
            }} />

            {/* Mail Merge */}
            <div className="relative">
              <ToolbarButton icon={<Mail size={15} />} label="Mail Merge" title="Insert Merge Field" onClick={() => {
                focusEditor();
                const fields = ["FirstName", "LastName", "Email", "Address", "City", "State", "ZipCode", "Company", "Phone"];
                const fieldList = fields.map((f, i) => `${i + 1}. ${f}`).join("\n");
                const choice = prompt(`Select merge field (enter number):\n${fieldList}`);
                if (choice) {
                  const idx = parseInt(choice) - 1;
                  if (idx >= 0 && idx < fields.length) {
                    execCmd("insertHTML", `<span style="background:#e8f4fd;border:1px solid #90caf9;border-radius:3px;padding:1px 6px;font-size:12px;color:#1565C0;">\u00AB${fields[idx]}\u00BB</span>`);
                  }
                }
              }} />
            </div>

            <ToolbarSeparator />
            <div className="relative">
              <ToolbarButton icon={<Hash size={15} />} label="Special Characters" title="Insert Special Character" onClick={() => setShowSpecialChars(!showSpecialChars)} />
              {showSpecialChars && (
                <div
                  className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 240 }}
                >
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Special Characters</div>
                  <div className="grid grid-cols-8 gap-1">
                    {["©","®","™","°","±","×","÷","√","∞","≠","≤","≥","←","→","↑","↓","•","…","€","£","¥","§","¶","†","‡","—","–","«","»","¿","¡","µ"].map((ch) => (
                      <button
                        key={ch}
                        className="w-7 h-7 rounded text-sm hover:bg-[var(--muted)] flex items-center justify-center"
                        style={{ color: "var(--foreground)" }}
                        onClick={() => {
                          focusEditor();
                          execCmd("insertText", ch);
                          setShowSpecialChars(false);
                        }}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "layout" && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Page Size:</span>
              <ToolbarDropdown
                value={pageSize}
                options={Object.entries(PAGE_SIZES).map(([k, v]) => ({ value: k, label: v.label }))}
                onChange={(v) => setPageSize(v as PageSize)}
                title="Page Size"
                className="w-[180px]"
              />
            </div>
            <ToolbarSeparator />
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Margins:</span>
              <ToolbarDropdown
                value={margins}
                options={Object.entries(MARGIN_PRESETS).map(([k, v]) => ({ value: k, label: v.label }))}
                onChange={(v) => setMargins(v as MarginPreset)}
                title="Margins"
                className="w-[120px]"
              />
            </div>
            <ToolbarSeparator />
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Line Spacing:</span>
              <ToolbarDropdown
                value={lineSpacing}
                options={[
                  { value: "1", label: "Single" },
                  { value: "1.15", label: "1.15" },
                  { value: "1.5", label: "1.5" },
                  { value: "2", label: "Double" },
                ]}
                onChange={(v) => setLineSpacing(v as LineSpacing)}
                title="Line Spacing"
                className="w-[100px]"
              />
            </div>
            <ToolbarSeparator />
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Columns:</span>
              <ToolbarButton icon={<Columns3 size={15} />} title="1 Column" label="1" onClick={() => setColumns(1)} active={columns === 1} />
              <ToolbarButton icon={<Columns3 size={15} />} title="2 Columns" label="2" onClick={() => setColumns(2)} active={columns === 2} />
              <ToolbarButton icon={<Columns3 size={15} />} title="3 Columns" label="3" onClick={() => setColumns(3)} active={columns === 3} />
            </div>
            <ToolbarSeparator />
            {/* Header/Footer */}
            <ToolbarButton icon={<Stamp size={15} />} label="Header/Footer" title="Toggle Header & Footer" active={showHeaderFooter} onClick={toggleHeaderFooter} />
            <ToolbarSeparator />
            {/* Page Borders */}
            <div className="relative">
              <ToolbarButton icon={<Frame size={15} />} label="Page Borders" title="Page Borders" onClick={() => setShowPageBorders(!showPageBorders)} />
              {showPageBorders && (
                <div
                  className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-3 shadow-lg"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 200 }}
                >
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Page Border Style</div>
                  {[
                    { label: "Simple Box", border: "2px solid #333" },
                    { label: "Double Line", border: "4px double #333" },
                    { label: "Shadow", border: "2px solid #333", shadow: "4px 4px 0 #999" },
                    { label: "Dashed", border: "2px dashed #666" },
                    { label: "Dotted", border: "3px dotted #666" },
                    { label: "Thick", border: "4px solid #000" },
                    { label: "Decorative", border: "3px ridge #8B4513" },
                    { label: "None", border: "none" },
                  ].map((b) => (
                    <button key={b.label} className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[var(--muted)]"
                      style={{ color: "var(--foreground)" }}
                      onClick={() => {
                        const page = document.querySelector(".mx-auto.shadow-lg") as HTMLElement;
                        if (page) {
                          page.style.border = b.border;
                          page.style.boxShadow = (b as { shadow?: string }).shadow || "";
                        }
                        setShowPageBorders(false);
                      }}
                    >{b.label}</button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "view" && (
          <>
            <div className="flex items-center gap-1">
              <ToolbarButton icon={<ZoomOut size={15} />} title="Zoom Out" onClick={() => setZoom(Math.max(50, zoom - 10))} />
              <span className="w-12 text-center text-xs" style={{ color: "var(--foreground)" }}>{zoom}%</span>
              <ToolbarButton icon={<ZoomIn size={15} />} title="Zoom In" onClick={() => setZoom(Math.min(200, zoom + 10))} />
              <input
                type="range"
                min={50}
                max={200}
                step={10}
                value={zoom}
                onChange={(e) => setZoom(parseInt(e.target.value))}
                className="ml-2 w-24"
                title="Zoom Level"
              />
            </div>
            <ToolbarSeparator />
            <ToolbarButton icon={<Search size={15} />} label="Find & Replace" title="Find & Replace (Ctrl+F)" onClick={() => setShowFindReplace(true)} />
            <ToolbarButton icon={<Ruler size={15} />} label="Ruler" title="Toggle Ruler" onClick={() => {
              const ruler = document.getElementById("doc-ruler");
              if (ruler) ruler.style.display = ruler.style.display === "none" ? "flex" : "none";
            }} />
            <ToolbarSeparator />
            <ToolbarButton icon={<Printer size={15} />} label="Print Preview" title="Print Preview" onClick={() => setShowPrintPreview(true)} />
            <ToolbarSeparator />
            {/* Track Changes */}
            <ToolbarButton icon={<GitBranch size={15} />} label="Track Changes" title="Toggle Track Changes" active={trackChanges} onClick={toggleTrackChanges} />
            {/* Comments */}
            <ToolbarButton icon={<MessageCircle size={15} />} label="Comments" title="Toggle Comments Sidebar" active={showComments} onClick={toggleComments} />
          </>
        )}
      </div>
    </div>
  );
}
