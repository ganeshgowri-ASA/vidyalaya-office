"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, FileText, BookOpen, ArrowUpRight } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function FootnotesEndnotesPanel() {
  const {
    showFootnotesPanel, setShowFootnotesPanel,
    footnotes, addFootnote, removeFootnote, updateFootnote,
  } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<"footnotes" | "endnotes">("footnotes");
  const [newText, setNewText] = useState("");

  const filteredNotes = footnotes.filter((f) => f.type === (activeTab === "footnotes" ? "footnote" : "endnote"));

  const insertNote = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    const type = activeTab === "footnotes" ? "footnote" : "endnote";
    const existingOfType = footnotes.filter((f) => f.type === type);
    const num = existingOfType.length + 1;
    const id = `${type}-${Date.now()}`;
    const text = newText || "Enter note text";
    const color = type === "footnote" ? "#1565C0" : "#C00000";
    const refClass = type === "footnote" ? "doc-footnote-ref" : "doc-endnote-ref";
    const containerClass = type === "footnote" ? "doc-footnotes" : "doc-endnotes";

    // Insert superscript reference at cursor position
    editor.focus();
    document.execCommand("insertHTML", false,
      `<sup class="${refClass}" data-note-id="${id}" style="color:${color};cursor:pointer;font-size:10px;" title="Click to jump to ${type}">[${num}]</sup>`
    );

    // Add note container if it doesn't exist
    let container = editor.querySelector(`.${containerClass}`);
    if (!container) {
      const div = document.createElement("div");
      div.className = containerClass;
      const borderStyle = type === "footnote"
        ? "border-top:1px solid #ccc;margin-top:40px;padding-top:10px;font-size:10px;color:#555;"
        : "border-top:2px solid #333;margin-top:60px;padding-top:10px;font-size:10px;color:#555;";
      div.style.cssText = borderStyle;
      div.innerHTML = `<div style="font-weight:bold;margin-bottom:6px;">${type === "footnote" ? "Footnotes" : "Endnotes"}</div>`;
      editor.appendChild(div);
      container = div;
    }

    // Add note entry
    const noteDiv = document.createElement("div");
    noteDiv.id = id;
    noteDiv.style.cssText = "margin:3px 0;display:flex;gap:4px;";
    noteDiv.innerHTML = `<sup style="color:${color};flex-shrink:0;">[${num}]</sup> <span contenteditable="true" style="outline:none;flex:1;">${text}</span>`;
    container.appendChild(noteDiv);

    addFootnote({ id, number: num, text, type });
    setNewText("");
  };

  const handleRemove = (id: string) => {
    removeFootnote(id);
    // Remove from DOM
    const el = document.getElementById(id);
    if (el) el.remove();
    // Remove superscript reference
    const editor = document.getElementById("doc-editor");
    if (editor) {
      const ref = editor.querySelector(`[data-note-id="${id}"]`);
      if (ref) ref.remove();
    }
  };

  const navigateToNote = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!showFootnotesPanel) return null;

  return (
    <div
      className="w-72 border-r overflow-y-auto flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Notes</span>
        <button onClick={() => setShowFootnotesPanel(false)} className="p-1 rounded hover:bg-[var(--muted)]">
          <X size={13} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setActiveTab("footnotes")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium border-b-2 ${activeTab === "footnotes" ? "border-[var(--primary)]" : "border-transparent"}`}
          style={{ color: activeTab === "footnotes" ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          <FileText size={12} className="inline mr-1" /> Footnotes
        </button>
        <button
          onClick={() => setActiveTab("endnotes")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium border-b-2 ${activeTab === "endnotes" ? "border-[var(--primary)]" : "border-transparent"}`}
          style={{ color: activeTab === "endnotes" ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          <BookOpen size={12} className="inline mr-1" /> Endnotes
        </button>
      </div>

      {/* Insert new note */}
      <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={`Enter ${activeTab === "footnotes" ? "footnote" : "endnote"} text...`}
          className="w-full rounded border px-2 py-1.5 text-xs resize-none"
          rows={2}
          style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <button
          onClick={insertNote}
          className="w-full flex items-center justify-center gap-1 rounded px-2 py-1.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus size={10} /> Insert {activeTab === "footnotes" ? "Footnote" : "Endnote"}
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.length === 0 ? (
          <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            No {activeTab} yet. Click the button above to insert one.
          </p>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded border p-2 mb-2 text-[11px] group"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <sup className="flex-shrink-0 font-bold" style={{ color: note.type === "footnote" ? "#1565C0" : "#C00000" }}>
                    [{note.number}]
                  </sup>
                  <input
                    type="text"
                    value={note.text}
                    onChange={(e) => updateFootnote(note.id, e.target.value)}
                    className="flex-1 bg-transparent text-[10px] outline-none min-w-0"
                    style={{ color: "var(--foreground)" }}
                  />
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <button onClick={() => navigateToNote(note.id)} className="p-0.5 rounded hover:bg-[var(--muted)]" title="Go to note">
                    <ArrowUpRight size={10} style={{ color: "var(--primary)" }} />
                  </button>
                  <button onClick={() => handleRemove(note.id)} className="p-0.5 rounded hover:bg-red-100" title="Delete">
                    <Trash2 size={10} style={{ color: "#EF4444" }} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        {filteredNotes.length} {activeTab === "footnotes" ? "footnote" : "endnote"}{filteredNotes.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
