"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent,
  Type, Highlighter, Heading1, Heading2, Heading3, Pilcrow,
  Undo2, Redo2, PanelRight, PaintBucket, Clipboard, ClipboardCopy,
  ClipboardPaste, Paintbrush, ChevronDown, Scissors, Eraser,
  CaseSensitive, Subscript, Superscript, ListTree, ArrowUpDown,
  Eye, Columns3,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator, ToolbarDropdown } from "./toolbar-button";
import {
  FONTS, FONT_SIZES, TEXT_COLORS, HIGHLIGHT_COLORS,
  UNDERLINE_STYLES, BULLET_STYLES, NUMBER_STYLES,
  LINE_SPACING_OPTIONS, BORDER_OPTIONS, DOCUMENT_STYLES,
} from "./constants";
import type { LineSpacing } from "@/store/document-store";

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

// Color picker with full palette grid
function ColorPicker({
  colors,
  onSelect,
  onClose,
  showCustom = true,
}: {
  colors: string[];
  onSelect: (color: string) => void;
  onClose: () => void;
  showCustom?: boolean;
}) {
  return (
    <div
      className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", minWidth: 200 }}
    >
      <div className="grid grid-cols-10 gap-0.5">
        {colors.map((c, i) => (
          <button
            key={c + i}
            className="h-5 w-5 rounded-sm border border-gray-300 hover:scale-125 transition-transform"
            style={{ backgroundColor: c }}
            title={c}
            onClick={() => { onSelect(c); onClose(); }}
          />
        ))}
      </div>
      {showCustom && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="w-full text-left text-xs px-2 py-1 rounded hover:bg-[var(--muted)]"
            style={{ color: "var(--foreground)" }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "color";
              input.onchange = () => { onSelect(input.value); onClose(); };
              input.click();
            }}
          >
            More Colors...
          </button>
        </div>
      )}
    </div>
  );
}

export function HomeTab() {
  const {
    currentFont, setCurrentFont,
    currentFontSize, setCurrentFontSize,
    lineSpacing, setLineSpacing,
    showStylesPanel, toggleStylesPanel,
  } = useDocumentStore();

  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showUnderlineMenu, setShowUnderlineMenu] = useState(false);
  const [showBulletMenu, setShowBulletMenu] = useState(false);
  const [showNumberMenu, setShowNumberMenu] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [showShading, setShowShading] = useState(false);
  const [showStylesGallery, setShowStylesGallery] = useState(false);
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [showPasteMenu, setShowPasteMenu] = useState(false);

  const handleFont = useCallback((font: string) => {
    setCurrentFont(font);
    runCmd("fontName", font);
  }, [setCurrentFont]);

  const handleFontSize = useCallback((size: string) => {
    setCurrentFontSize(size);
    focusEditor();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      execCmd("fontSize", "7");
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

  const applyUnderlineStyle = (style: string) => {
    focusEditor();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.textDecoration = "underline";
      span.style.textDecorationStyle = style;
      range.surroundContents(span);
    }
    setShowUnderlineMenu(false);
  };

  const changeCase = (type: string) => {
    focusEditor();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const text = sel.toString();
      let newText = text;
      switch (type) {
        case "upper": newText = text.toUpperCase(); break;
        case "lower": newText = text.toLowerCase(); break;
        case "title": newText = text.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()); break;
        case "toggle": newText = text.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(""); break;
      }
      execCmd("insertText", newText);
    }
    setShowCaseMenu(false);
  };

  const applyStyle = (style: typeof DOCUMENT_STYLES[0]) => {
    focusEditor();
    const tag = style.tag;
    if (tag === "blockquote") {
      const styleAny = style as unknown as Record<string, string>;
      const borderLeft = styleAny.borderLeft || "";
      const borderTop = styleAny.borderTop || "";
      const borderBottom = styleAny.borderBottom || "";
      execCmd("formatBlock", "blockquote");
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
          const block = sel.anchorNode.parentElement?.closest("blockquote");
          if (block) {
            const el = block as HTMLElement;
            el.style.fontSize = style.fontSize;
            el.style.fontWeight = style.fontWeight;
            el.style.lineHeight = style.lineHeight;
            el.style.color = style.color;
            el.style.fontFamily = style.fontFamily;
            if (style.fontStyle) el.style.fontStyle = style.fontStyle;
            if (borderLeft) el.style.borderLeft = borderLeft;
            if (borderTop) el.style.borderTop = borderTop;
            if (borderBottom) el.style.borderBottom = borderBottom;
            el.style.padding = "8px 16px";
            el.style.margin = "12px 0";
          }
        }
      }, 0);
    } else {
      execCmd("formatBlock", tag);
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
          const block = sel.anchorNode.parentElement?.closest(tag) || sel.anchorNode.parentElement;
          if (block) {
            const el = block as HTMLElement;
            el.style.fontSize = style.fontSize;
            el.style.fontWeight = style.fontWeight;
            el.style.lineHeight = style.lineHeight;
            el.style.color = style.color;
            el.style.marginBottom = style.marginBottom;
            el.style.fontFamily = style.fontFamily;
            if (style.fontStyle) el.style.fontStyle = style.fontStyle;
            if ((style as unknown as Record<string, string>).marginLeft) el.style.marginLeft = (style as unknown as Record<string, string>).marginLeft;
          }
        }
      }, 0);
    }
    setShowStylesGallery(false);
  };

  const applyBorderToBlock = (sides: string[]) => {
    focusEditor();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const block = sel.anchorNode?.parentElement?.closest("p, div, blockquote, li, h1, h2, h3, h4, h5, h6");
      if (block) {
        const el = block as HTMLElement;
        el.style.border = "none";
        sides.forEach((side) => {
          el.style.setProperty(`border-${side}`, "1px solid #333");
        });
        if (sides.length > 0) {
          el.style.padding = "8px 12px";
        }
      }
    }
    setShowBorders(false);
  };

  return (
    <>
      {/* ===== CLIPBOARD GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <button
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-[var(--muted)] cursor-pointer"
              onClick={() => { focusEditor(); document.execCommand("paste"); }}
              title="Paste (Ctrl+V)"
            >
              <ClipboardPaste size={20} style={{ color: "var(--foreground)" }} />
              <span className="text-[9px]" style={{ color: "var(--foreground)" }}>Paste</span>
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            <ToolbarButton icon={<Scissors size={13} />} title="Cut (Ctrl+X)" onClick={() => runCmd("cut")} />
            <ToolbarButton icon={<ClipboardCopy size={13} />} title="Copy (Ctrl+C)" onClick={() => runCmd("copy")} />
            <ToolbarButton
              icon={<Paintbrush size={13} />}
              title="Format Painter"
              active={formatPainterActive}
              onClick={() => setFormatPainterActive(!formatPainterActive)}
            />
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Clipboard</span>
      </div>

      {/* ===== FONT GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Font family & size */}
          <ToolbarDropdown
            value={currentFont}
            options={FONTS.map((f) => ({ value: f, label: f }))}
            onChange={handleFont}
            title="Font Family"
            className="w-[130px]"
          />
          <ToolbarDropdown
            value={currentFontSize}
            options={FONT_SIZES.map((s) => ({ value: s, label: s }))}
            onChange={handleFontSize}
            title="Font Size"
            className="w-[50px]"
          />
          {/* Basic formatting */}
          <ToolbarButton icon={<Bold size={14} />} title="Bold (Ctrl+B)" onClick={() => runCmd("bold")} />
          <ToolbarButton icon={<Italic size={14} />} title="Italic (Ctrl+I)" onClick={() => runCmd("italic")} />
          {/* Underline with dropdown */}
          <div className="relative flex items-center">
            <ToolbarButton icon={<Underline size={14} />} title="Underline (Ctrl+U)" onClick={() => runCmd("underline")} />
            <button
              className="px-0 py-1 hover:bg-[var(--muted)] rounded-r cursor-pointer"
              onClick={() => setShowUnderlineMenu(!showUnderlineMenu)}
              title="Underline style"
            >
              <ChevronDown size={10} style={{ color: "var(--foreground)" }} />
            </button>
            {showUnderlineMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-36"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {UNDERLINE_STYLES.map((u) => (
                  <button key={u.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)", textDecoration: "underline", textDecorationStyle: u.value as React.CSSProperties["textDecorationStyle"] }}
                    onClick={() => applyUnderlineStyle(u.value)}>
                    {u.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarButton icon={<Strikethrough size={14} />} title="Strikethrough" onClick={() => runCmd("strikeThrough")} />
          <ToolbarButton icon={<Subscript size={14} />} title="Subscript" onClick={() => runCmd("subscript")} />
          <ToolbarButton icon={<Superscript size={14} />} title="Superscript" onClick={() => runCmd("superscript")} />
          {/* Text Color */}
          <div className="relative">
            <ToolbarButton
              icon={<span className="flex flex-col items-center"><Type size={14} /><span className="h-0.5 w-3.5 mt-[-2px]" style={{ backgroundColor: "#FF0000" }} /></span>}
              title="Text Color"
              onClick={() => { setShowTextColor(!showTextColor); setShowHighlight(false); }}
            />
            {showTextColor && (
              <ColorPicker colors={TEXT_COLORS} onSelect={(c) => runCmd("foreColor", c)} onClose={() => setShowTextColor(false)} />
            )}
          </div>
          {/* Highlight Color */}
          <div className="relative">
            <ToolbarButton
              icon={<span className="flex flex-col items-center"><Highlighter size={14} /><span className="h-0.5 w-3.5 mt-[-2px]" style={{ backgroundColor: "#FFFF00" }} /></span>}
              title="Text Highlight Color"
              onClick={() => { setShowHighlight(!showHighlight); setShowTextColor(false); }}
            />
            {showHighlight && (
              <ColorPicker colors={HIGHLIGHT_COLORS} onSelect={(c) => runCmd("hiliteColor", c)} onClose={() => setShowHighlight(false)} showCustom={false} />
            )}
          </div>
          {/* Clear Formatting */}
          <ToolbarButton icon={<Eraser size={14} />} title="Clear Formatting" onClick={() => runCmd("removeFormat")} />
          {/* Change Case */}
          <div className="relative">
            <ToolbarButton icon={<CaseSensitive size={14} />} title="Change Case" onClick={() => setShowCaseMenu(!showCaseMenu)} />
            {showCaseMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-40"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {[
                  { label: "UPPERCASE", type: "upper" },
                  { label: "lowercase", type: "lower" },
                  { label: "Title Case", type: "title" },
                  { label: "tOGGLE cASE", type: "toggle" },
                ].map((c) => (
                  <button key={c.type} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }} onClick={() => changeCase(c.type)}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Font</span>
      </div>

      {/* ===== PARAGRAPH GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Bullet List with dropdown */}
          <div className="relative flex items-center">
            <ToolbarButton icon={<List size={14} />} title="Bullet List" onClick={() => runCmd("insertUnorderedList")} />
            <button className="px-0 py-1 hover:bg-[var(--muted)] rounded-r cursor-pointer"
              onClick={() => setShowBulletMenu(!showBulletMenu)}>
              <ChevronDown size={10} style={{ color: "var(--foreground)" }} />
            </button>
            {showBulletMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] mb-1 font-medium" style={{ color: "var(--muted-foreground)" }}>Bullet Styles</div>
                {BULLET_STYLES.map((b) => (
                  <button key={b.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      runCmd("insertUnorderedList");
                      setTimeout(() => {
                        const sel = window.getSelection();
                        if (sel?.anchorNode) {
                          const ul = sel.anchorNode.parentElement?.closest("ul");
                          if (ul) (ul as HTMLElement).style.listStyleType = b.char;
                        }
                      }, 0);
                      setShowBulletMenu(false);
                    }}>
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Number List with dropdown */}
          <div className="relative flex items-center">
            <ToolbarButton icon={<ListOrdered size={14} />} title="Numbered List" onClick={() => runCmd("insertOrderedList")} />
            <button className="px-0 py-1 hover:bg-[var(--muted)] rounded-r cursor-pointer"
              onClick={() => setShowNumberMenu(!showNumberMenu)}>
              <ChevronDown size={10} style={{ color: "var(--foreground)" }} />
            </button>
            {showNumberMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-[10px] mb-1 font-medium" style={{ color: "var(--muted-foreground)" }}>Number Styles</div>
                {NUMBER_STYLES.map((n) => (
                  <button key={n.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => {
                      runCmd("insertOrderedList");
                      setTimeout(() => {
                        const sel = window.getSelection();
                        if (sel?.anchorNode) {
                          const ol = sel.anchorNode.parentElement?.closest("ol");
                          if (ol) (ol as HTMLElement).style.listStyleType = n.type;
                        }
                      }, 0);
                      setShowNumberMenu(false);
                    }}>
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Multilevel List */}
          <ToolbarButton icon={<ListTree size={14} />} title="Multilevel List" onClick={() => runCmd("insertUnorderedList")} />
          <ToolbarSeparator />
          {/* Indent */}
          <ToolbarButton icon={<Outdent size={14} />} title="Decrease Indent" onClick={() => runCmd("outdent")} />
          <ToolbarButton icon={<Indent size={14} />} title="Increase Indent" onClick={() => runCmd("indent")} />
          {/* Sort */}
          <ToolbarButton icon={<ArrowUpDown size={14} />} title="Sort" onClick={() => {
            focusEditor();
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
              const block = sel.anchorNode?.parentElement?.closest("ul, ol");
              if (block) {
                const items = Array.from(block.children);
                items.sort((a, b) => (a.textContent || "").localeCompare(b.textContent || ""));
                items.forEach((item) => block.appendChild(item));
              }
            }
          }} />
          {/* Show/Hide paragraph marks */}
          <ToolbarButton icon={<Pilcrow size={14} />} title="Show/Hide Paragraph Marks" onClick={() => {
            const editor = document.getElementById("doc-editor");
            if (editor) {
              editor.classList.toggle("show-paragraph-marks");
            }
          }} />
          <ToolbarSeparator />
          {/* Alignment */}
          <ToolbarButton icon={<AlignLeft size={14} />} title="Align Left (Ctrl+L)" onClick={() => runCmd("justifyLeft")} />
          <ToolbarButton icon={<AlignCenter size={14} />} title="Center (Ctrl+E)" onClick={() => runCmd("justifyCenter")} />
          <ToolbarButton icon={<AlignRight size={14} />} title="Align Right (Ctrl+R)" onClick={() => runCmd("justifyRight")} />
          <ToolbarButton icon={<AlignJustify size={14} />} title="Justify (Ctrl+J)" onClick={() => runCmd("justifyFull")} />
          <ToolbarSeparator />
          {/* Line Spacing */}
          <div className="relative">
            <ToolbarButton icon={<Columns3 size={14} className="rotate-90" />} title="Line Spacing" onClick={() => setShowLineSpacing(!showLineSpacing)} />
            {showLineSpacing && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-32"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {LINE_SPACING_OPTIONS.map((s) => (
                  <button key={s.value} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)", fontWeight: lineSpacing === s.value ? 600 : 400 }}
                    onClick={() => { setLineSpacing(s.value as LineSpacing); setShowLineSpacing(false); }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Shading */}
          <div className="relative">
            <ToolbarButton icon={<PaintBucket size={14} />} title="Shading" onClick={() => setShowShading(!showShading)} />
            {showShading && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 180 }}>
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Shading</div>
                <div className="grid grid-cols-5 gap-1">
                  {["#fff3cd", "#d1ecf1", "#d4edda", "#f8d7da", "#e2e3e5", "#cce5ff", "#f5f5f5", "#e8eaf6", "#fce4ec", "transparent"].map((c) => (
                    <button key={c} className="h-5 w-5 rounded border" style={{ backgroundColor: c, borderColor: "#ccc" }}
                      onClick={() => {
                        focusEditor();
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount) {
                          const block = sel.anchorNode?.parentElement?.closest("p, div, blockquote, li, h1, h2, h3, h4, h5, h6");
                          if (block) (block as HTMLElement).style.backgroundColor = c;
                        }
                        setShowShading(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Borders dropdown */}
          <div className="relative">
            <ToolbarButton icon={<span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>▦</span>} title="Borders" onClick={() => setShowBorders(!showBorders)} />
            {showBorders && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {BORDER_OPTIONS.map((b) => (
                  <button key={b.label} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => applyBorderToBlock(b.sides)}>
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Paragraph</span>
      </div>

      {/* ===== STYLES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5 overflow-x-auto max-w-[300px]">
          {DOCUMENT_STYLES.slice(0, 6).map((style) => (
            <button
              key={style.name}
              className="px-2 py-0.5 rounded border text-[10px] whitespace-nowrap hover:bg-[var(--muted)] transition-colors cursor-pointer"
              style={{
                borderColor: "var(--border)",
                color: style.color,
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight === "bold" ? 700 : 400,
                fontStyle: (style as unknown as Record<string, string>).fontStyle || "normal",
              }}
              title={`Apply ${style.name} style`}
              onClick={() => applyStyle(style)}
            >
              {style.name}
            </button>
          ))}
          <div className="relative">
            <button className="px-1 py-0.5 rounded hover:bg-[var(--muted)] cursor-pointer"
              onClick={() => setShowStylesGallery(!showStylesGallery)} title="More Styles">
              <ChevronDown size={12} style={{ color: "var(--foreground)" }} />
            </button>
            {showStylesGallery && (
              <div className="absolute top-full right-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-60 max-h-72 overflow-y-auto"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {DOCUMENT_STYLES.map((style) => (
                  <button
                    key={style.name}
                    className="w-full text-left px-3 py-2 rounded hover:bg-[var(--muted)] border-b last:border-b-0 cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      color: style.color,
                      fontFamily: style.fontFamily,
                      fontSize: Math.min(parseInt(style.fontSize), 16) + "px",
                      fontWeight: style.fontWeight === "bold" ? 700 : 400,
                      fontStyle: (style as unknown as Record<string, string>).fontStyle || "normal",
                    }}
                    onClick={() => applyStyle(style)}
                  >
                    {style.name}
                    <span className="block text-[9px]" style={{ color: "var(--muted-foreground)", fontStyle: "normal", fontWeight: 400 }}>
                      {style.fontFamily} {style.fontSize}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Styles</span>
      </div>

      {/* ===== EDITING GROUP ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Eye size={14} />} label="Find" title="Find (Ctrl+F)" onClick={() => useDocumentStore.getState().setShowFindReplace(true)} />
          <ToolbarButton icon={<ArrowUpDown size={14} />} label="Replace" title="Replace (Ctrl+H)" onClick={() => useDocumentStore.getState().setShowFindReplace(true)} />
          <ToolbarButton icon={<PanelRight size={14} />} label="Select" title="Select All (Ctrl+A)" onClick={() => runCmd("selectAll")} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Editing</span>
      </div>
    </>
  );
}
