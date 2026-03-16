"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES, MARGIN_PRESETS } from "./constants";
import { Calendar, Hash, Type, Scissors, ClipboardCopy, ClipboardPaste, Bold, Italic, Link, Languages, BookOpen } from "lucide-react";

const AUTOSAVE_KEY = "vidyalaya-doc-content";
const AUTOSAVE_INTERVAL = 15000;

function HeaderFooterEditor({
  value,
  onChange,
  placeholder,
  position,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  position: "header" | "footer";
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const insertPageNumber = () => {
    onChange(value ? value + " | Page #" : "Page #");
  };

  const insertDate = () => {
    const today = new Date().toLocaleDateString();
    onChange(value ? value + " | " + today : today);
  };

  if (!editing) {
    return (
      <div
        className="group cursor-pointer flex items-center justify-center"
        style={{
          height: 32,
          borderBottom: position === "header" ? "1px dashed #ccc" : "none",
          borderTop: position === "footer" ? "1px dashed #ccc" : "none",
        }}
        onClick={() => setEditing(true)}
      >
        {value ? (
          <span style={{ fontSize: 10, color: "#888" }}>{value}</span>
        ) : (
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ fontSize: 10, color: "#aaa" }}
          >
            Click to add {position}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2"
      style={{
        height: 36,
        borderBottom: position === "header" ? "1px dashed #999" : "none",
        borderTop: position === "footer" ? "1px dashed #999" : "none",
        backgroundColor: "#fafafa",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") setEditing(false);
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[10px] outline-none"
        style={{ color: "#333" }}
      />
      <button
        className="p-0.5 rounded hover:bg-gray-200"
        title="Insert page number"
        onMouseDown={(e) => {
          e.preventDefault();
          insertPageNumber();
        }}
      >
        <Hash size={10} style={{ color: "#666" }} />
      </button>
      <button
        className="p-0.5 rounded hover:bg-gray-200"
        title="Insert date"
        onMouseDown={(e) => {
          e.preventDefault();
          insertDate();
        }}
      >
        <Calendar size={10} style={{ color: "#666" }} />
      </button>
      <button
        className="p-0.5 rounded hover:bg-gray-200"
        title="Insert custom text"
        onMouseDown={(e) => {
          e.preventDefault();
          const text = prompt("Enter custom text:");
          if (text) onChange(value ? value + " | " + text : text);
        }}
      >
        <Type size={10} style={{ color: "#666" }} />
      </button>
    </div>
  );
}

// Context Menu
function ContextMenu({
  x,
  y,
  onClose,
}: {
  x: number;
  y: number;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    onClose();
  };

  const menuItems = [
    { icon: <Scissors size={13} />, label: "Cut", shortcut: "Ctrl+X", action: () => execCmd("cut") },
    { icon: <ClipboardCopy size={13} />, label: "Copy", shortcut: "Ctrl+C", action: () => execCmd("copy") },
    { icon: <ClipboardPaste size={13} />, label: "Paste", shortcut: "Ctrl+V", action: () => execCmd("paste") },
    { type: "separator" as const },
    { icon: <Bold size={13} />, label: "Font...", action: () => {
      const font = prompt("Font family:");
      if (font) execCmd("fontName", font);
    }},
    { icon: <Italic size={13} />, label: "Paragraph...", action: () => {
      const align = prompt("Alignment (left/center/right/justify):");
      if (align) execCmd(align === "left" ? "justifyLeft" : align === "center" ? "justifyCenter" : align === "right" ? "justifyRight" : "justifyFull");
    }},
    { type: "separator" as const },
    { label: "Bullets", action: () => execCmd("insertUnorderedList") },
    { label: "Numbering", action: () => execCmd("insertOrderedList") },
    { type: "separator" as const },
    { icon: <Link size={13} />, label: "Hyperlink...", action: () => {
      const url = prompt("Enter URL:");
      if (url) {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
          execCmd("createLink", url);
        } else {
          document.execCommand("insertHTML", false, `<a href="${encodeURI(url)}" target="_blank" style="color:#1565C0;">${url}</a>`);
          onClose();
        }
      }
    }},
    { icon: <BookOpen size={13} />, label: "Synonyms", action: () => {
      const sel = window.getSelection();
      const word = sel?.toString();
      if (word) window.open(`https://www.thesaurus.com/browse/${encodeURIComponent(word)}`, "_blank");
      onClose();
    }},
    { icon: <Languages size={13} />, label: "Translate", action: () => {
      const sel = window.getSelection();
      const text = sel?.toString();
      if (text) window.open(`https://translate.google.com/?text=${encodeURIComponent(text)}`, "_blank");
      onClose();
    }},
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] rounded-lg border shadow-xl py-1 min-w-[200px]"
      style={{
        left: x,
        top: y,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {menuItems.map((item, i) => {
        if ("type" in item && item.type === "separator") {
          return <hr key={i} className="my-1" style={{ borderColor: "var(--border)" }} />;
        }
        return (
          <button
            key={i}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--muted)] transition-colors"
            style={{ color: "var(--foreground)" }}
            onClick={item.action}
          >
            {"icon" in item && item.icon && <span className="w-4">{item.icon}</span>}
            {!("icon" in item) && <span className="w-4" />}
            <span className="flex-1 text-left">{item.label}</span>
            {"shortcut" in item && item.shortcut && (
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EditorArea() {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    zoom, pageSize, margins, lineSpacing, columns,
    currentFont, currentFontSize,
    updateCounts, setLastSaved,
    showHeaderFooter, headerText, footerText,
    setHeaderText, setFooterText,
    showWatermark, watermarkText,
    orientation, viewMode, showRuler, showGridlines,
    pageColor,
    setSelectedTable, setSelectedImage, setSelectedSmartArt,
    watermarkDirection, watermarkOpacity, watermarkImageUrl, useImageWatermark,
    showLineNumbers, setParagraphCount,
    pageNumberPosition, pageNumberFormat, differentFirstPage, showHeaderFooter: showHF,
    watermarkPosition, watermarkRotation, watermarkFontSize, columnSpacing,
  } = useDocumentStore();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Detect table/image/smartart selection for contextual ribbon tabs
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) {
        return;
      }
      let node: Node | null = sel.anchorNode;
      let inTable = false;
      let inImage = false;
      let inSmartArt = false;
      while (node) {
        if ((node as HTMLElement).id === "doc-editor") break;
        if (node instanceof HTMLTableElement || (node instanceof HTMLElement && (node.tagName === "TD" || node.tagName === "TH"))) inTable = true;
        if (node instanceof HTMLImageElement) inImage = true;
        if (node instanceof HTMLElement && node.dataset?.smartart === "true") inSmartArt = true;
        if (node instanceof HTMLElement && node.classList?.contains("smartart-container")) inSmartArt = true;
        node = node.parentNode;
      }
      setSelectedTable(inTable);
      setSelectedImage(inImage);
      setSelectedSmartArt(inSmartArt);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLImageElement) {
        // Mark image as selected
        const editor = document.getElementById("doc-editor");
        if (editor) {
          editor.querySelectorAll("img").forEach(img => { img.dataset.selected = "false"; img.style.outline = ""; });
        }
        target.dataset.selected = "true";
        target.style.outline = "2px solid #4472C4";
        setSelectedImage(true);
        setSelectedTable(false);
        if (target.dataset.smartart === "true" || target.closest(".smartart-container")) {
          setSelectedSmartArt(true);
        } else {
          setSelectedSmartArt(false);
        }
      } else if (target.closest(".smartart-container") || target.closest("[data-smartart]")) {
        // Clicked inside inline SVG SmartArt - mark as selected, text is selectable
        const container = (target.closest(".smartart-container") || target.closest("[data-smartart]")) as HTMLElement;
        const editor = document.getElementById("doc-editor");
        if (editor) {
          editor.querySelectorAll(".smartart-container").forEach(el => { (el as HTMLElement).style.outline = ""; });
          editor.querySelectorAll("img").forEach(img => { img.dataset.selected = "false"; img.style.outline = ""; });
        }
        container.style.outline = "2px solid #4472C4";
        setSelectedSmartArt(true);
        setSelectedImage(false);
        setSelectedTable(false);
      } else if (target instanceof HTMLTableCellElement || target.closest("table")) {
        setSelectedTable(true);
        setSelectedImage(false);
        setSelectedSmartArt(false);
      } else {
        // Deselect
        const editor = document.getElementById("doc-editor");
        if (editor) {
          editor.querySelectorAll("img").forEach(img => { img.dataset.selected = "false"; img.style.outline = ""; });
          editor.querySelectorAll(".smartart-container").forEach(el => { (el as HTMLElement).style.outline = ""; });
        }
        setSelectedTable(false);
        setSelectedImage(false);
        setSelectedSmartArt(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    const editor = document.getElementById("doc-editor");
    editor?.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      editor?.removeEventListener("click", handleClick);
    };
  }, [setSelectedTable, setSelectedImage, setSelectedSmartArt]);

  const ps = PAGE_SIZES[pageSize];
  const mg = MARGIN_PRESETS[margins];

  // Swap dimensions for landscape
  const pageWidth = orientation === "landscape" ? ps.height : ps.width;
  const pageHeight = orientation === "landscape" ? ps.width : ps.height;

  // Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        localStorage.setItem(AUTOSAVE_KEY, content);
        setLastSaved(new Date().toLocaleTimeString());
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [setLastSaved]);

  // Load saved content
  useEffect(() => {
    if (editorRef.current) {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        editorRef.current.innerHTML = saved;
        countWords();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countWords = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const chars = trimmed.length;
    const lines = trimmed === "" ? 0 : trimmed.split(/\n/).length;
    updateCounts(words, chars, lines);
    // Count paragraphs
    const paragraphs = editorRef.current.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").length;
    setParagraphCount(Math.max(paragraphs, trimmed === "" ? 0 : 1));
  }, [updateCounts, setParagraphCount]);

  const handleInput = useCallback(() => {
    countWords();
  }, [countWords]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // View mode adaptations
  const isWebLayout = viewMode === "web";
  const isDraft = viewMode === "draft";
  const isReadMode = viewMode === "read";

  return (
    <div
      className="flex-1 overflow-auto print-full-width"
      style={{ backgroundColor: viewMode === "web" ? "#fff" : "#e0e0e0" }}
      id="doc-editor-wrapper"
    >
      {/* Ruler */}
      {showRuler && viewMode === "print" && (
        <div
          id="doc-ruler"
          className="sticky top-0 z-10 flex items-end justify-center"
          style={{ backgroundColor: "#e0e0e0", height: 24 }}
        >
          <div
            className="flex items-end"
            style={{ width: pageWidth, transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {/* Ruler marks */}
            <div className="w-full flex items-end relative" style={{ height: 20, background: "#f0f0f0", borderBottom: "1px solid #ccc" }}>
              {Array.from({ length: 22 }, (_, i) => (
                <div key={i} className="flex items-end" style={{ width: "1cm" }}>
                  <div style={{ width: 1, height: i % 2 === 0 ? 12 : 6, backgroundColor: "#666" }} />
                  {i % 2 === 0 && (
                    <span style={{ fontSize: 8, color: "#444", marginLeft: 2, lineHeight: 1 }}>{i / 2}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={viewMode === "print" ? "py-6" : "py-2"} />

      {/* Page container */}
      <div
        className={`mx-auto print-full-width relative doc-page-container ${viewMode === "print" ? "shadow-xl" : ""}`}
        style={{
          width: isWebLayout || isDraft ? "100%" : pageWidth,
          maxWidth: isWebLayout || isDraft ? "900px" : undefined,
          minHeight: isWebLayout || isDraft ? "auto" : pageHeight,
          backgroundColor: pageColor || "#ffffff",
          color: "#000000",
          paddingTop: showHeaderFooter ? "0.5in" : mg.top,
          paddingRight: isWebLayout || isDraft ? "24px" : mg.right,
          paddingBottom: showHeaderFooter ? "0.5in" : mg.bottom,
          paddingLeft: isWebLayout || isDraft ? "24px" : mg.left,
          transform: viewMode === "print" ? `scale(${zoom / 100})` : undefined,
          transformOrigin: "top center",
          fontFamily: currentFont,
          fontSize: currentFontSize + "pt",
          lineHeight: lineSpacing,
          columnCount: columns,
          columnGap: `${columnSpacing}em`,
          border: viewMode === "print" ? undefined : "none",
          boxShadow: viewMode === "print" ? undefined : "none",
          marginBottom: viewMode === "print" ? "24px" : "0",
        }}
      >
        {/* Gridlines overlay */}
        {showGridlines && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <div style={{
              width: "100%", height: "100%",
              backgroundImage: "linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.5,
            }} />
          </div>
        )}

        {/* Watermark */}
        {showWatermark && (
          <div
            className="absolute inset-0 pointer-events-none select-none"
            style={{
              zIndex: 0,
              display: "flex",
              alignItems: watermarkPosition.includes("top") ? "flex-start" : watermarkPosition.includes("bottom") ? "flex-end" : "center",
              justifyContent: watermarkPosition.includes("left") ? "flex-start" : watermarkPosition.includes("right") ? "flex-end" : "center",
              padding: watermarkPosition !== "center" ? "40px" : undefined,
            }}
          >
            {useImageWatermark && watermarkImageUrl ? (
              <img
                src={watermarkImageUrl}
                alt="watermark"
                style={{
                  maxWidth: "60%",
                  maxHeight: "60%",
                  opacity: watermarkOpacity,
                  transform: `rotate(${watermarkRotation}deg)`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            ) : watermarkText ? (
              <span
                style={{
                  fontSize: watermarkFontSize,
                  fontWeight: 700,
                  color: `rgba(200, 200, 200, ${watermarkOpacity})`,
                  transform: `rotate(${watermarkRotation}deg)`,
                  whiteSpace: "nowrap",
                  letterSpacing: 8,
                  userSelect: "none",
                }}
              >
                {watermarkText}
              </span>
            ) : null}
          </div>
        )}

        {/* Header */}
        {showHeaderFooter && (
          <div style={{ marginLeft: isWebLayout ? "0" : `-${mg.left}`, marginRight: isWebLayout ? "0" : `-${mg.right}`, paddingLeft: isWebLayout ? "0" : mg.left, paddingRight: isWebLayout ? "0" : mg.right, marginBottom: 8 }}>
            <HeaderFooterEditor
              value={headerText}
              onChange={setHeaderText}
              placeholder="Type header text..."
              position="header"
            />
          </div>
        )}

        <div className="relative" style={{ display: "flex" }}>
          {/* Line Numbers */}
          {showLineNumbers && (
            <LineNumbers editorRef={editorRef} />
          )}
          <div
            ref={editorRef}
            id="doc-editor"
            contentEditable={!isReadMode}
            suppressContentEditableWarning
            onInput={handleInput}
            onContextMenu={handleContextMenu}
            className="outline-none min-h-[800px] relative flex-1"
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              zIndex: 1,
              cursor: isReadMode ? "default" : "text",
              paddingLeft: showLineNumbers ? "8px" : undefined,
            }}
            spellCheck
          />
        </div>

        {/* Footer */}
        {showHeaderFooter && (
          <div style={{ marginLeft: isWebLayout ? "0" : `-${mg.left}`, marginRight: isWebLayout ? "0" : `-${mg.right}`, paddingLeft: isWebLayout ? "0" : mg.left, paddingRight: isWebLayout ? "0" : mg.right, marginTop: 8 }}>
            <HeaderFooterEditor
              value={footerText}
              onChange={setFooterText}
              placeholder="Type footer text..."
              position="footer"
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function LineNumbers({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const [lineCount, setLineCount] = React.useState(1);

  React.useEffect(() => {
    const updateLines = () => {
      if (!editorRef.current) return;
      const text = editorRef.current.innerText || "";
      const lines = text.split("\n").length;
      setLineCount(Math.max(lines, 1));
    };

    updateLines();
    const interval = setInterval(updateLines, 1000);

    const editor = editorRef.current;
    editor?.addEventListener("input", updateLines);
    return () => {
      clearInterval(interval);
      editor?.removeEventListener("input", updateLines);
    };
  }, [editorRef]);

  return (
    <div className="select-none flex-shrink-0 text-right pr-2 border-r"
      style={{
        width: 40,
        color: "#999",
        fontSize: "10px",
        lineHeight: "1.6em",
        paddingTop: 2,
        borderColor: "#e0e0e0",
        fontFamily: "monospace",
      }}>
      {Array.from({ length: lineCount }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

export function getEditorContent(): string {
  const editor = document.getElementById("doc-editor");
  return editor?.innerHTML || "";
}

export function setEditorContent(html: string) {
  const editor = document.getElementById("doc-editor");
  if (editor) {
    editor.innerHTML = html;
    localStorage.setItem(AUTOSAVE_KEY, html);
  }
}

export function getEditorText(): string {
  const editor = document.getElementById("doc-editor");
  return editor?.innerText || "";
}
