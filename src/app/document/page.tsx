"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import RibbonToolbar from "./components/RibbonToolbar";
import EditorArea from "./components/EditorArea";
import AIAssistantPanel from "./components/AIAssistantPanel";
import StatusBar from "./components/StatusBar";
import TemplateModal from "./components/TemplateModal";
import FindReplaceModal from "./components/FindReplaceModal";

type Tab = "home" | "insert" | "layout" | "view";

const STORAGE_KEY = "vidyalaya-doc-content";

export default function DocumentPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Ribbon
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Text formatting state
  const [fontFamily, setFontFamily] = useState("Calibri");
  const [fontSize, setFontSize] = useState(11);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [alignment, setAlignment] = useState("left");

  // Page layout
  const [pageSize, setPageSize] = useState("a4");
  const [margins, setMargins] = useState("normal");
  const [lineSpacing, setLineSpacing] = useState("1.15");
  const [columns, setColumns] = useState(1);

  // View
  const [zoom, setZoom] = useState(100);
  const [spellCheck, setSpellCheck] = useState(true);

  // Panels / Modals
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);

  // Stats
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ─── Count update ───────────────────────────────────────────────
  const updateCounts = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const text = editor.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split("\n").length;
    setWordCount(words);
    setCharCount(chars);
    setLineCount(lines);
  }, []);

  // ─── Auto-save ───────────────────────────────────────────────────
  const autoSave = useCallback(() => {
    const content = editorRef.current?.innerHTML ?? "";
    localStorage.setItem(STORAGE_KEY, content);
    setLastSaved(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(autoSave, 15000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // ─── Load saved content ──────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
      updateCounts();
    }
  }, [updateCounts]);

  // ─── Formatting state sync ───────────────────────────────────────
  const updateFormattingState = useCallback(() => {
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsStrikethrough(document.queryCommandState("strikeThrough"));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateFormattingState);
    return () => document.removeEventListener("selectionchange", updateFormattingState);
  }, [updateFormattingState]);

  // ─── Core exec helper ────────────────────────────────────────────
  const execFormat = useCallback((command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(command, false, value);
    updateFormattingState();
  }, [updateFormattingState]);

  // ─── Insert HTML at cursor ───────────────────────────────────────
  const insertHTML = useCallback((html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand("insertHTML", false, html);
    updateCounts();
  }, [updateCounts]);

  // ─── Font family ─────────────────────────────────────────────────
  const applyFontFamily = useCallback((font: string) => {
    setFontFamily(font);
    execFormat("fontName", font);
  }, [execFormat]);

  // ─── Font size ───────────────────────────────────────────────────
  const applyFontSize = useCallback((size: number) => {
    setFontSize(size);
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      try {
        const span = document.createElement("span");
        span.style.fontSize = `${size}pt`;
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      } catch {
        // Fallback: just insert a span
        insertHTML(`<span style="font-size:${size}pt;">&#8203;</span>`);
      }
    }
  }, [insertHTML]);

  // ─── Text color ──────────────────────────────────────────────────
  const applyTextColor = useCallback((color: string) => {
    setTextColor(color);
    execFormat("foreColor", color);
  }, [execFormat]);

  // ─── Highlight ───────────────────────────────────────────────────
  const applyHighlight = useCallback((color: string) => {
    setHighlightColor(color);
    execFormat("hiliteColor", color);
  }, [execFormat]);

  // ─── Alignment ───────────────────────────────────────────────────
  const applyAlignment = useCallback((align: string) => {
    setAlignment(align);
    const commandMap: Record<string, string> = {
      left: "justifyLeft",
      center: "justifyCenter",
      right: "justifyRight",
      justify: "justifyFull",
    };
    execFormat(commandMap[align] || "justifyLeft");
  }, [execFormat]);

  // ─── Headings ────────────────────────────────────────────────────
  const applyHeading = useCallback((tag: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand("formatBlock", false, tag);
  }, []);

  // ─── Insert: Table ───────────────────────────────────────────────
  const insertTable = useCallback(() => {
    const rowsInput = window.prompt("Number of rows:", "3");
    const colsInput = window.prompt("Number of columns:", "3");
    const rows = Math.min(20, Math.max(1, parseInt(rowsInput || "3") || 3));
    const cols = Math.min(10, Math.max(1, parseInt(colsInput || "3") || 3));

    let html = '<table style="border-collapse:collapse;width:100%;margin:1em 0;">';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        const tag = r === 0 ? "th" : "td";
        const style =
          r === 0
            ? 'style="border:1px solid #ccc;padding:8px;background:#f0f0f0;font-weight:bold;"'
            : 'style="border:1px solid #ccc;padding:8px;"';
        html += `<${tag} ${style}>${r === 0 ? `Header ${c + 1}` : "&nbsp;"}</${tag}>`;
      }
      html += "</tr>";
    }
    html += "</table><p><br/></p>";
    insertHTML(html);
  }, [insertHTML]);

  // ─── Insert: Image ───────────────────────────────────────────────
  const insertImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        insertHTML(
          `<figure style="margin:1.5em auto;text-align:center;"><img src="${src}" style="max-width:100%;height:auto;border-radius:4px;"/><figcaption style="font-size:0.85em;color:#666;margin-top:4px;font-style:italic;">${file.name}</figcaption></figure><p><br/></p>`
        );
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [insertHTML]
  );

  // ─── Insert: Equation ────────────────────────────────────────────
  const insertEquation = useCallback(() => {
    const latex = window.prompt("Enter LaTeX equation (e.g. \\frac{a}{b}):", "E = mc^2");
    if (!latex) return;
    insertHTML(
      `<span style="font-family:'Times New Roman',serif;font-size:12pt;background:#f9f9f9;border:1px solid #ddd;padding:4px 8px;border-radius:4px;display:inline-block;margin:4px 0;">[Math: ${latex}]</span>`
    );
  }, [insertHTML]);

  // ─── Insert: Code Block ──────────────────────────────────────────
  const insertCodeBlock = useCallback(() => {
    insertHTML(
      '<pre style="background:#f5f5f5;border:1px solid #ddd;border-radius:4px;padding:12px;font-family:\'Courier New\',monospace;font-size:10pt;margin:1em 0;"><code>// Your code here\n</code></pre><p><br/></p>'
    );
  }, [insertHTML]);

  // ─── Insert: Blockquote ──────────────────────────────────────────
  const insertBlockquote = useCallback(() => {
    insertHTML(
      '<blockquote style="border-left:4px solid #ccc;padding-left:16px;margin:1em 0;color:#555;font-style:italic;">Quote text here</blockquote><p><br/></p>'
    );
  }, [insertHTML]);

  // ─── Insert: HR ─────────────────────────────────────────────────
  const insertHR = useCallback(() => {
    insertHTML('<hr style="border:none;border-top:1px solid #ccc;margin:1.5em 0;"/><p><br/></p>');
  }, [insertHTML]);

  // ─── Insert: Link ────────────────────────────────────────────────
  const insertLink = useCallback(() => {
    const url = window.prompt("Enter URL:", "https://");
    if (!url) return;
    const text = window.prompt("Link text:", url);
    if (text) {
      insertHTML(`<a href="${url}" style="color:#0d6efd;text-decoration:underline;">${text}</a>`);
    } else {
      execFormat("createLink", url);
    }
  }, [insertHTML, execFormat]);

  // ─── Insert: Figure ──────────────────────────────────────────────
  const insertFigure = useCallback(() => {
    const caption = window.prompt("Figure caption:", "Figure 1: Description");
    insertHTML(
      `<figure style="margin:1.5em auto;text-align:center;"><div style="width:100%;height:120px;background:#f0f0f0;border:2px dashed #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12pt;">[Image Placeholder]</div><figcaption style="font-size:0.85em;color:#666;margin-top:4px;font-style:italic;">${caption || "Figure: description"}</figcaption></figure><p><br/></p>`
    );
  }, [insertHTML]);

  // ─── Insert: Citation ────────────────────────────────────────────
  const insertCitation = useCallback(() => {
    const num = window.prompt("Citation number:", "1");
    if (!num) return;
    insertHTML(`<sup style="color:#0d6efd;font-size:0.75em;">[${num}]</sup>`);
  }, [insertHTML]);

  // ─── Insert: Callout ─────────────────────────────────────────────
  const insertCallout = useCallback(() => {
    const type = window.prompt("Type (note/warning/tip/info):", "note") || "note";
    const colorMap: Record<string, { bg: string; border: string; label: string }> = {
      note: { bg: "#f0f7ff", border: "#0d6efd", label: "📝 Note" },
      warning: { bg: "#fff7e6", border: "#ff9900", label: "⚠️ Warning" },
      tip: { bg: "#f0fff4", border: "#00cc66", label: "💡 Tip" },
      info: { bg: "#f5f0ff", border: "#9900ff", label: "ℹ️ Info" },
    };
    const c = colorMap[type.toLowerCase()] || colorMap.note;
    insertHTML(
      `<div style="background:${c.bg};border:1px solid #ddd;border-left:4px solid ${c.border};border-radius:4px;padding:12px 16px;margin:1em 0;"><strong style="display:block;margin-bottom:6px;">${c.label}</strong><p style="margin:0;">Add your note content here.</p></div><p><br/></p>`
    );
  }, [insertHTML]);

  // ─── Insert: Table of Contents ───────────────────────────────────
  const insertTOC = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const headings = editor.querySelectorAll("h1, h2, h3");
    if (headings.length === 0) {
      window.alert("No headings found. Add H1, H2, or H3 headings to generate a TOC.");
      return;
    }

    let tocHtml =
      '<div style="background:#f9f9f9;border:1px solid #ddd;border-radius:4px;padding:16px;margin:1em 0;"><h2 style="margin-top:0;font-size:14pt;">Table of Contents</h2><ol style="margin:0;padding-left:1.5em;">';

    headings.forEach((h, idx) => {
      const text = h.textContent || `Heading ${idx + 1}`;
      const level = parseInt(h.tagName.replace("H", ""), 10);
      const indent = (level - 1) * 20;
      tocHtml += `<li style="margin-left:${indent}px;padding:2px 0;"><a style="color:#0d6efd;text-decoration:none;">${text}</a></li>`;
    });

    tocHtml += "</ol></div><p><br/></p>";
    insertHTML(tocHtml);
  }, [insertHTML]);

  // ─── Export ──────────────────────────────────────────────────────
  const handleExport = useCallback(
    (format: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      if (format === "print") {
        window.print();
        return;
      }

      const content = editor.innerHTML;

      if (format === "html") {
        const htmlDoc = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Vidyalaya Document</title>
<style>body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; max-width: 800px; margin: 40px auto; padding: 0 24px; } h1,h2,h3{margin:1em 0 0.5em;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:8px;} </style>
</head><body>${content}</body></html>`;
        download("document.html", htmlDoc, "text/html");
      } else if (format === "txt") {
        download("document.txt", editor.innerText || "", "text/plain");
      } else if (format === "doc") {
        const wordDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Vidyalaya Office">
<style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.5;} table{border-collapse:collapse;} td,th{border:1px solid #ccc;padding:8px;}</style>
</head><body>${content}</body></html>`;
        download("document.doc", wordDoc, "application/msword");
      }
    },
    []
  );

  const download = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Keyboard shortcuts ──────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            execFormat("bold");
            break;
          case "i":
            e.preventDefault();
            execFormat("italic");
            break;
          case "u":
            e.preventDefault();
            execFormat("underline");
            break;
          case "f":
            e.preventDefault();
            setShowFindReplace(true);
            break;
          case "z":
            e.preventDefault();
            execFormat(e.shiftKey ? "redo" : "undo");
            break;
          case "y":
            e.preventDefault();
            execFormat("redo");
            break;
          case "s":
            e.preventDefault();
            autoSave();
            break;
        }
      }
      updateCounts();
    },
    [execFormat, autoSave, updateCounts]
  );

  // ─── AI panel helpers ────────────────────────────────────────────
  const getSelectedText = useCallback(() => {
    return window.getSelection()?.toString() || "";
  }, []);

  const getDocumentContent = useCallback(() => {
    return editorRef.current?.innerText || "";
  }, []);

  const insertAIResponse = useCallback(
    (text: string) => {
      const html = text
        .split("\n\n")
        .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
        .join("");
      insertHTML(html);
    },
    [insertHTML]
  );

  // ─── Template apply ──────────────────────────────────────────────
  const applyTemplate = useCallback((content: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML.trim() !== "" && editor.innerHTML !== "<p>Start typing your document here...</p>") {
      const ok = window.confirm("This will replace the current document. Continue?");
      if (!ok) return;
    }
    editor.innerHTML = content;
    updateCounts();
    autoSave();
  }, [updateCounts, autoSave]);

  return (
    <div
      className="-m-6 flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 3.5rem)" }}
    >
      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Ribbon toolbar */}
      <RibbonToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        fontFamily={fontFamily}
        fontSize={fontSize}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
        isStrikethrough={isStrikethrough}
        textColor={textColor}
        highlightColor={highlightColor}
        alignment={alignment}
        pageSize={pageSize}
        margins={margins}
        lineSpacing={lineSpacing}
        columns={columns}
        zoom={zoom}
        spellCheck={spellCheck}
        onExecFormat={execFormat}
        onApplyFontFamily={applyFontFamily}
        onApplyFontSize={applyFontSize}
        onApplyTextColor={applyTextColor}
        onApplyHighlight={applyHighlight}
        onApplyAlignment={applyAlignment}
        onApplyHeading={applyHeading}
        onInsertTable={insertTable}
        onInsertImage={insertImage}
        onInsertEquation={insertEquation}
        onInsertCodeBlock={insertCodeBlock}
        onInsertBlockquote={insertBlockquote}
        onInsertHR={insertHR}
        onInsertLink={insertLink}
        onInsertFigure={insertFigure}
        onInsertCitation={insertCitation}
        onInsertCallout={insertCallout}
        onInsertTOC={insertTOC}
        onPageSizeChange={setPageSize}
        onMarginsChange={setMargins}
        onLineSpacingChange={setLineSpacing}
        onColumnsChange={setColumns}
        onZoomChange={setZoom}
        onSpellCheckChange={setSpellCheck}
        onShowFindReplace={() => setShowFindReplace(true)}
        onPrint={() => window.print()}
        onShowTemplates={() => setShowTemplateModal(true)}
        onExport={handleExport}
        onShowAIPanel={() => setShowAIPanel((v) => !v)}
      />

      {/* Main content: editor + AI panel */}
      <div className="flex flex-1 overflow-hidden">
        <EditorArea
          ref={editorRef}
          pageSize={pageSize}
          margins={margins}
          columns={columns}
          lineSpacing={lineSpacing}
          zoom={zoom}
          spellCheck={spellCheck}
          onInput={updateCounts}
          onKeyDown={handleKeyDown}
        />

        {showAIPanel && (
          <AIAssistantPanel
            onClose={() => setShowAIPanel(false)}
            onInsertText={insertAIResponse}
            getSelectedText={getSelectedText}
            getDocumentContent={getDocumentContent}
          />
        )}
      </div>

      {/* Status bar */}
      <StatusBar
        wordCount={wordCount}
        charCount={charCount}
        lineCount={lineCount}
        pageSize={pageSize}
        zoom={zoom}
        lastSaved={lastSaved}
        onZoomChange={setZoom}
      />

      {/* Modals */}
      {showTemplateModal && (
        <TemplateModal
          onSelect={applyTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {showFindReplace && (
        <FindReplaceModal
          editorRef={editorRef}
          onClose={() => setShowFindReplace(false)}
        />
      )}
    </div>
  );
}
