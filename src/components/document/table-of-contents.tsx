"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Settings2, ChevronRight } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import type { TocStyle } from "@/store/document-store";

interface TocEntry {
  text: string;
  level: number;
  id: string;
}

export function TableOfContentsPanel() {
  const {
    showTocPanel, setShowTocPanel,
    tocStyle, setTocStyle,
    tocAutoUpdate, setTocAutoUpdate,
  } = useDocumentStore();

  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [maxLevel, setMaxLevel] = useState(4);

  const scanHeadings = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const selectors = Array.from({ length: maxLevel }, (_, i) => `h${i + 1}`).join(", ");
    const headings = editor.querySelectorAll(selectors);
    const result: TocEntry[] = [];
    headings.forEach((h, i) => {
      const id = `toc-heading-${i}`;
      h.id = id;
      result.push({
        text: h.textContent || "",
        level: parseInt(h.tagName[1]),
        id,
      });
    });
    setEntries(result);
  }, [maxLevel]);

  useEffect(() => {
    if (!showTocPanel) return;
    scanHeadings();
    if (tocAutoUpdate) {
      const interval = setInterval(scanHeadings, 2000);
      return () => clearInterval(interval);
    }
  }, [showTocPanel, tocAutoUpdate, scanHeadings]);

  const insertTocIntoDocument = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    // Remove existing TOC
    const existingToc = editor.querySelector(".doc-toc-container");
    if (existingToc) existingToc.remove();

    const leaderChar = tocStyle === "dots" ? "." : tocStyle === "dashes" ? "-" : "";
    const leaderStyle = tocStyle === "underline"
      ? "border-bottom:1px solid #999;padding-bottom:2px;"
      : "";

    let tocHtml = '<div class="doc-toc-container" contenteditable="false" style="border:1px solid #ddd;padding:20px 28px;margin:16px 0;background:#fafafa;border-radius:4px;">';
    tocHtml += '<h3 style="margin-top:0;color:#2F5496;font-size:14pt;border-bottom:2px solid #2F5496;padding-bottom:6px;margin-bottom:12px;">Table of Contents</h3>';

    entries.forEach((entry) => {
      const indent = (entry.level - 1) * 24;
      const weight = entry.level <= 2 ? "font-weight:600;" : "";
      const fontSize = entry.level === 1 ? "12pt" : entry.level === 2 ? "11pt" : "10pt";
      const leader = leaderChar ? `<span style="flex:1;overflow:hidden;margin:0 8px;letter-spacing:2px;color:#999;">${leaderChar.repeat(80)}</span>` : '<span style="flex:1;"></span>';

      tocHtml += `<div style="display:flex;align-items:baseline;margin-left:${indent}px;padding:3px 0;${weight}font-size:${fontSize};${leaderStyle}">`;
      tocHtml += `<a href="#${entry.id}" style="color:#1565C0;text-decoration:none;white-space:nowrap;" onclick="event.preventDefault();document.getElementById('${entry.id}')?.scrollIntoView({behavior:'smooth',block:'start'})">${entry.text}</a>`;
      tocHtml += leader;
      tocHtml += '</div>';
    });
    tocHtml += '</div><p></p>';

    editor.focus();
    // Insert at the beginning
    const firstChild = editor.firstChild;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = tocHtml;
    if (firstChild) {
      while (tempDiv.firstChild) {
        editor.insertBefore(tempDiv.firstChild, firstChild);
      }
    } else {
      editor.innerHTML = tocHtml;
    }
  };

  const updateExistingToc = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const existingToc = editor.querySelector(".doc-toc-container");
    if (existingToc) {
      existingToc.remove();
    }
    scanHeadings();
    setTimeout(insertTocIntoDocument, 100);
  };

  if (!showTocPanel) return null;

  return (
    <div
      className="w-72 border-r overflow-y-auto flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Table of Contents</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 rounded hover:bg-[var(--muted)]" title="Settings">
            <Settings2 size={13} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={() => setShowTocPanel(false)} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={13} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <div>
            <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Leader Style</label>
            <div className="flex gap-1">
              {(["dots", "dashes", "underline", "none"] as TocStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setTocStyle(s)}
                  className={`px-2 py-1 rounded text-[10px] border ${tocStyle === s ? "border-[var(--primary)]" : "border-transparent"}`}
                  style={{ color: tocStyle === s ? "var(--primary)" : "var(--muted-foreground)", backgroundColor: tocStyle === s ? "var(--muted)" : "transparent" }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Max Heading Level</label>
            <select
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value))}
              className="w-full rounded border px-2 py-1 text-xs"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>H1 - H{n}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-[10px] cursor-pointer" style={{ color: "var(--foreground)" }}>
            <input type="checkbox" checked={tocAutoUpdate} onChange={(e) => setTocAutoUpdate(e.target.checked)} className="w-3 h-3" />
            Auto-update on change
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={insertTocIntoDocument}
          className="flex-1 rounded px-2 py-1.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Insert TOC
        </button>
        <button
          onClick={updateExistingToc}
          className="flex items-center gap-1 rounded border px-2 py-1.5 text-[10px]"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <RefreshCw size={10} /> Update
        </button>
        <button
          onClick={scanHeadings}
          className="rounded border px-2 py-1.5 text-[10px]"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          Scan
        </button>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            No headings found. Add headings (H1-H{maxLevel}) to your document to generate a table of contents.
          </p>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.id}
              className="w-full text-left text-[11px] px-2 py-1.5 rounded hover:bg-[var(--muted)] flex items-center gap-1 group"
              style={{
                color: "var(--foreground)",
                paddingLeft: (entry.level - 1) * 14 + 8 + "px",
                fontWeight: entry.level <= 2 ? 600 : 400,
              }}
              onClick={() => {
                const el = document.getElementById(entry.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "var(--primary)" }} />
              <span className="truncate">{entry.text}</span>
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        {entries.length} heading{entries.length !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
