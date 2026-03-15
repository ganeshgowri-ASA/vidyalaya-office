"use client";

import React, { useState } from "react";
import {
  BookOpen, FileText, Hash, ListOrdered, Quote, BookMarked,
  ChevronDown, TableProperties, Bookmark, GraduationCap,
  Scale, Table, Library, FileBarChart, AlignLeft,
} from "lucide-react";
import { ToolbarButton, ToolbarSeparator, ToolbarDropdown } from "./toolbar-button";
import { CITATION_STYLES } from "./constants";
import { useDocumentStore } from "@/store/document-store";

function focusEditor() {
  const editor = document.getElementById("doc-editor");
  if (editor && document.activeElement !== editor) editor.focus();
}

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function ReferencesTab() {
  const { setShowCitationManager, citations, citationStyle: storeCitationStyle } = useDocumentStore();
  const [citationStyle, setCitationStyle] = useState("APA 7th Edition");
  const [showTocMenu, setShowTocMenu] = useState(false);
  const [showCrossRefMenu, setShowCrossRefMenu] = useState(false);
  const [showTableOfMenu, setShowTableOfMenu] = useState(false);

  const insertTOC = () => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const headings = editor.querySelectorAll("h1, h2, h3, h4");
    let tocHtml = '<div style="border:1px solid #ddd;padding:16px 24px;margin:12px 0;background:#fafafa;"><h3 style="margin-top:0;color:#2F5496;font-size:14pt;">Table of Contents</h3>';
    tocHtml += '<ul style="list-style:none;padding:0;margin:0;">';
    headings.forEach((h, i) => {
      const level = parseInt(h.tagName[1]);
      const indent = (level - 1) * 24;
      const dotLeader = level === 1 ? "font-weight:bold;" : "";
      tocHtml += `<li style="margin-left:${indent}px;padding:3px 0;${dotLeader}"><a href="#toc-${i}" style="color:#1565C0;text-decoration:none;">${h.textContent}</a></li>`;
      h.id = `toc-${i}`;
    });
    tocHtml += '</ul></div><p></p>';
    execCmd("insertHTML", tocHtml);
    setShowTocMenu(false);
  };

  const insertTableOfFigures = () => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const captions = editor.querySelectorAll('[class*="doc-caption-figure"]');
    let html = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;"><h4 style="margin-top:0;color:#2F5496;">Table of Figures</h4><ul style="list-style:none;padding:0;">';
    captions.forEach((cap) => {
      html += `<li style="padding:2px 0;font-size:10pt;"><a href="#" style="color:#1565C0;text-decoration:none;">${cap.textContent}</a></li>`;
    });
    html += '</ul></div><p></p>';
    execCmd("insertHTML", html);
    setShowTableOfMenu(false);
  };

  const insertTableOfTables = () => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const captions = editor.querySelectorAll('[class*="doc-caption-table"]');
    let html = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;"><h4 style="margin-top:0;color:#2F5496;">Table of Tables</h4><ul style="list-style:none;padding:0;">';
    captions.forEach((cap) => {
      html += `<li style="padding:2px 0;font-size:10pt;"><a href="#" style="color:#1565C0;text-decoration:none;">${cap.textContent}</a></li>`;
    });
    html += '</ul></div><p></p>';
    execCmd("insertHTML", html);
    setShowTableOfMenu(false);
  };

  const insertTableOfEquations = () => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const equations = editor.querySelectorAll(".doc-equation");
    let html = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;background:#fafafa;"><h4 style="margin-top:0;color:#2F5496;">Table of Equations</h4><ul style="list-style:none;padding:0;">';
    equations.forEach((eq, i) => {
      const latex = decodeURIComponent((eq as HTMLElement).dataset.latex || `Equation ${i + 1}`);
      html += `<li style="padding:2px 0;font-size:10pt;">Equation ${i + 1}: ${latex.substring(0, 50)}${latex.length > 50 ? "..." : ""}</li>`;
    });
    html += '</ul></div><p></p>';
    execCmd("insertHTML", html);
    setShowTableOfMenu(false);
  };

  const insertCrossReference = (type: string) => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    let elements: NodeListOf<Element>;
    let prefix: string;

    switch (type) {
      case "figure":
        elements = editor.querySelectorAll('[class*="doc-caption-figure"]');
        prefix = "Figure";
        break;
      case "table":
        elements = editor.querySelectorAll('[class*="doc-caption-table"]');
        prefix = "Table";
        break;
      case "equation":
        elements = editor.querySelectorAll(".doc-equation");
        prefix = "Equation";
        break;
      case "heading":
        elements = editor.querySelectorAll("h1, h2, h3, h4");
        prefix = "Section";
        break;
      default:
        return;
    }

    if (elements.length === 0) {
      alert(`No ${type}s found in the document.`);
      return;
    }

    const items = Array.from(elements).map((el, i) => `${i + 1}: ${el.textContent?.substring(0, 40) || prefix + " " + (i + 1)}`);
    const choice = prompt(`Select ${prefix} to reference:\n${items.join("\n")}\n\nEnter number:`);
    if (!choice) return;

    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < elements.length) {
      const refId = `ref-${type}-${idx}`;
      elements[idx].id = refId;
      execCmd("insertHTML", `<a href="#${refId}" class="doc-cross-ref" style="color:#1565C0;text-decoration:none;">${prefix} ${idx + 1}</a>`);
    }
    setShowCrossRefMenu(false);
  };

  const insertWordCountStats = () => {
    focusEditor();
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const text = editor.innerText || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;

    // Try to compute academic-specific counts
    const bibSection = editor.querySelector(".doc-bibliography") as HTMLElement | null;
    const bibText = bibSection?.innerText || "";
    const bibWords = bibText.trim().split(/\s+/).filter(Boolean).length;
    const abstractEl = editor.querySelector("h1, h2");
    let abstractWords = 0;
    if (abstractEl && abstractEl.textContent?.toLowerCase().includes("abstract")) {
      let next = abstractEl.nextElementSibling;
      while (next && !["H1", "H2", "H3"].includes(next.tagName)) {
        abstractWords += (next.textContent || "").trim().split(/\s+/).filter(Boolean).length;
        next = next.nextElementSibling;
      }
    }

    const statsHtml = `<div style="border:1px solid #ddd;padding:12px;margin:12px 0;background:#f8f9fa;border-radius:4px;">
      <h4 style="margin:0 0 8px;color:#2F5496;font-size:11pt;">Document Statistics</h4>
      <table style="font-size:10pt;border-collapse:collapse;">
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Total Words:</td><td>${words.toLocaleString()}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Characters:</td><td>${chars.toLocaleString()}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Words (excl. references):</td><td>${(words - bibWords).toLocaleString()}</td></tr>
        ${abstractWords > 0 ? `<tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Abstract Words:</td><td>${abstractWords}</td></tr>` : ""}
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Pages (est.):</td><td>${Math.max(1, Math.ceil(words / 300))}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Citations:</td><td>${editor.querySelectorAll(".doc-citation").length}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Equations:</td><td>${editor.querySelectorAll(".doc-equation").length}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Figures:</td><td>${editor.querySelectorAll('[class*="doc-caption-figure"]').length}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold;">Tables:</td><td>${editor.querySelectorAll('[class*="doc-caption-table"]').length}</td></tr>
      </table>
    </div><p></p>`;
    execCmd("insertHTML", statsHtml);
  };

  return (
    <>
      {/* ===== TABLE OF CONTENTS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<BookOpen size={14} />} label="Table of Contents" title="Table of Contents" onClick={() => setShowTocMenu(!showTocMenu)} />
            {showTocMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-2 shadow-lg w-52"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={insertTOC}>
                  Automatic Table 1
                </button>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={insertTOC}>
                  Automatic Table 2
                </button>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={insertTOC}>
                  Custom Table of Contents...
                </button>
              </div>
            )}
          </div>
          <ToolbarButton icon={<TableProperties size={14} />} label="Update" title="Update Table of Contents" onClick={() => {
            insertTOC();
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Table of Contents</span>
      </div>

      {/* ===== FOOTNOTES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
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
            fnDiv.innerHTML = `<sup style="color:#1565C0;">[${num}]</sup> <span contenteditable="true" style="outline:none;">Enter footnote text</span>`;
            fnContainer.appendChild(fnDiv);
          }} />
          <ToolbarButton icon={<FileText size={14} />} label="Endnote" title="Insert Endnote" onClick={() => {
            focusEditor();
            const editor = document.getElementById("doc-editor");
            if (!editor) return;
            const endnotes = editor.querySelectorAll(".doc-endnote-ref");
            const num = endnotes.length + 1;
            execCmd("insertHTML", `<sup class="doc-endnote-ref" style="color:#C00000;cursor:pointer;font-size:10px;">[${num}]</sup>`);
            let enContainer = editor.querySelector(".doc-endnotes");
            if (!enContainer) {
              const div = document.createElement("div");
              div.className = "doc-endnotes";
              div.style.cssText = "border-top:2px solid #333;margin-top:60px;padding-top:10px;font-size:10px;color:#555;";
              div.innerHTML = '<div style="font-weight:bold;margin-bottom:4px;">Endnotes</div>';
              editor.appendChild(div);
              enContainer = div;
            }
            const enDiv = document.createElement("div");
            enDiv.style.cssText = "margin:2px 0;";
            enDiv.innerHTML = `<sup style="color:#C00000;">[${num}]</sup> <span contenteditable="true" style="outline:none;">Enter endnote text</span>`;
            enContainer.appendChild(enDiv);
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Footnotes</span>
      </div>

      {/* ===== CITATIONS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Quote size={14} />} label="Citation" title="Insert Citation" onClick={() => {
            const author = prompt("Author (Last, First):");
            const year = prompt("Year:");
            const title = prompt("Title:");
            if (!author || !year) return;
            focusEditor();
            let citation = "";
            if (citationStyle.startsWith("APA")) {
              citation = `(${author}, ${year})`;
            } else if (citationStyle.startsWith("MLA")) {
              citation = `(${author} ${year})`;
            } else if (citationStyle.startsWith("Chicago")) {
              citation = `<sup style="color:#1565C0;cursor:pointer;font-size:10px;">[fn]</sup>`;
            } else {
              citation = `[${author}, ${year}]`;
            }
            execCmd("insertHTML", `<span class="doc-citation" style="color:#1565C0;" title="${author}. (${year}). ${title || ""}">${citation}</span>`);
          }} />
          <ToolbarButton icon={<Library size={14} />} label="Manager" title="Citation Manager" onClick={() => setShowCitationManager(true)} />
          <ToolbarButton icon={<BookMarked size={14} />} label="Bibliography" title="Generate Bibliography" onClick={() => {
            if (citations.length === 0) {
              setShowCitationManager(true);
              return;
            }
            focusEditor();
            const sorted = [...citations].sort((a, b) => a.authors.localeCompare(b.authors));
            let html = '<div class="doc-bibliography" style="margin-top:40px;border-top:2px solid #333;padding-top:16px;">';
            html += '<h2 style="font-size:16pt;color:#2F5496;margin-bottom:12px;">References</h2>';
            sorted.forEach((cit, i) => {
              html += `<p style="font-size:11pt;margin-bottom:8px;padding-left:36px;text-indent:-36px;">${cit.authors} (${cit.year}). ${cit.title}.${cit.journal ? ` <em>${cit.journal}</em>` : ""}${cit.volume ? `, ${cit.volume}` : ""}${cit.pages ? `, ${cit.pages}` : ""}.${cit.doi ? ` https://doi.org/${cit.doi}` : ""}</p>`;
            });
            html += '</div><p></p>';
            execCmd("insertHTML", html);
          }} />
          <ToolbarDropdown
            value={citationStyle}
            options={CITATION_STYLES.map((s) => ({ value: s, label: s.split(" ")[0] }))}
            onChange={setCitationStyle}
            title="Citation Style"
            className="w-[80px]"
          />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Citations & Bibliography</span>
      </div>

      {/* ===== CROSS-REFERENCES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Hash size={14} />} label="Cross-ref" title="Cross-reference" onClick={() => setShowCrossRefMenu(!showCrossRefMenu)} />
            {showCrossRefMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-44"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                {[
                  { label: "Figure", type: "figure" },
                  { label: "Table", type: "table" },
                  { label: "Equation", type: "equation" },
                  { label: "Heading/Section", type: "heading" },
                ].map((item) => (
                  <button key={item.type} className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                    style={{ color: "var(--foreground)" }}
                    onClick={() => insertCrossReference(item.type)}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarButton icon={<Hash size={14} />} label="Caption" title="Insert Caption" onClick={() => {
            const label = prompt("Caption label (Figure/Table/Equation):", "Figure");
            const text = prompt("Caption text:");
            if (!text) return;
            focusEditor();
            const editor = document.getElementById("doc-editor");
            const existing = editor?.querySelectorAll(`.doc-caption-${label?.toLowerCase()}`);
            const num = (existing?.length || 0) + 1;
            execCmd("insertHTML", `<p class="doc-caption-${label?.toLowerCase()}" style="font-size:10pt;color:#333;margin-top:4px;"><strong>${label} ${num}:</strong> ${text}</p>`);
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Cross-references</span>
      </div>

      {/* ===== TABLE OF FIGURES/TABLES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton icon={<Table size={14} />} label="List of..." title="Table of Figures/Tables" onClick={() => setShowTableOfMenu(!showTableOfMenu)} />
            {showTableOfMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-1 shadow-lg w-48"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={insertTableOfFigures}>
                  Table of Figures
                </button>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={insertTableOfTables}>
                  Table of Tables
                </button>
                <button className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }} onClick={insertTableOfEquations}>
                  Table of Equations
                </button>
              </div>
            )}
          </div>
          <ToolbarButton icon={<FileBarChart size={14} />} label="Word Count" title="Academic Word Count" onClick={insertWordCountStats} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Lists & Stats</span>
      </div>

      {/* ===== INDEX GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Bookmark size={14} />} label="Mark Entry" title="Mark Index Entry" onClick={() => {
            const sel = window.getSelection();
            const text = sel?.toString() || prompt("Index entry text:");
            if (!text) return;
            focusEditor();
            execCmd("insertHTML", `<span class="doc-index-entry" style="background:#e8f4fd;border:1px dashed #90caf9;padding:0 2px;font-size:10px;" data-index="${text}">{XE "${text}"}</span>`);
          }} />
          <ToolbarButton icon={<ListOrdered size={14} />} label="Index" title="Insert Index" onClick={() => {
            focusEditor();
            const editor = document.getElementById("doc-editor");
            if (!editor) return;
            const entries = editor.querySelectorAll(".doc-index-entry");
            const indexMap: Record<string, string[]> = {};
            entries.forEach((e) => {
              const text = (e as HTMLElement).dataset.index || e.textContent || "";
              const letter = text.charAt(0).toUpperCase();
              if (!indexMap[letter]) indexMap[letter] = [];
              if (!indexMap[letter].includes(text)) indexMap[letter].push(text);
            });
            let html = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;"><h4 style="margin-top:0;color:#2F5496;">Index</h4>';
            Object.keys(indexMap).sort().forEach((letter) => {
              html += `<p style="font-weight:bold;margin:8px 0 4px;">${letter}</p>`;
              indexMap[letter].sort().forEach((entry) => {
                html += `<p style="margin:0;padding-left:16px;font-size:10pt;">${entry}</p>`;
              });
            });
            html += '</div><p></p>';
            execCmd("insertHTML", html);
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Index</span>
      </div>

      {/* ===== TABLE OF AUTHORITIES GROUP ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Scale size={14} />} label="Mark Citation" title="Mark Citation" onClick={() => {
            const sel = window.getSelection();
            const text = sel?.toString() || prompt("Citation text:");
            if (!text) return;
            focusEditor();
            execCmd("insertHTML", `<span class="doc-authority-entry" style="background:#fde68a;border:1px dashed #f59e0b;padding:0 2px;font-size:10px;">{TA "${text}"}</span>`);
          }} />
          <ToolbarButton icon={<GraduationCap size={14} />} label="Table of Authorities" title="Insert Table of Authorities" onClick={() => {
            focusEditor();
            const editor = document.getElementById("doc-editor");
            if (!editor) return;
            const entries = editor.querySelectorAll(".doc-authority-entry");
            let html = '<div style="border:1px solid #ddd;padding:16px;margin:12px 0;"><h4 style="margin-top:0;color:#2F5496;">Table of Authorities</h4><ul style="list-style:none;padding:0;">';
            entries.forEach((e) => {
              html += `<li style="padding:2px 0;font-size:10pt;">${e.textContent}</li>`;
            });
            html += '</ul></div><p></p>';
            execCmd("insertHTML", html);
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Table of Authorities</span>
      </div>
    </>
  );
}
