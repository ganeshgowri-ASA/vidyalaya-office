"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, BookmarkPlus, Link2, ArrowUpRight, Hash, FileText, Image } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function BookmarksCrossRefPanel() {
  const {
    showBookmarksPanel, setShowBookmarksPanel,
    bookmarks, addBookmark, removeBookmark,
  } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<"bookmarks" | "crossref">("bookmarks");
  const [newBookmarkName, setNewBookmarkName] = useState("");
  const [crossRefType, setCrossRefType] = useState<"bookmark" | "heading" | "figure">("bookmark");
  const [headings, setHeadings] = useState<{ text: string; id: string }[]>([]);
  const [figures, setFigures] = useState<{ text: string; id: string }[]>([]);

  const scanDocument = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    // Scan headings
    const hs = editor.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const headingList: { text: string; id: string }[] = [];
    hs.forEach((h, i) => {
      const id = `bookmark-heading-${i}`;
      h.id = h.id || id;
      headingList.push({ text: h.textContent || `Heading ${i + 1}`, id: h.id });
    });
    setHeadings(headingList);

    // Scan figures/captions
    const caps = editor.querySelectorAll('[class*="doc-caption"]');
    const figList: { text: string; id: string }[] = [];
    caps.forEach((cap, i) => {
      const id = `bookmark-figure-${i}`;
      (cap as HTMLElement).id = (cap as HTMLElement).id || id;
      figList.push({ text: cap.textContent || `Figure ${i + 1}`, id: (cap as HTMLElement).id });
    });
    setFigures(figList);
  }, []);

  useEffect(() => {
    if (showBookmarksPanel) {
      scanDocument();
      const interval = setInterval(scanDocument, 3000);
      return () => clearInterval(interval);
    }
  }, [showBookmarksPanel, scanDocument]);

  const insertBookmark = () => {
    if (!newBookmarkName.trim()) return;
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    const id = `bookmark-${Date.now()}`;
    const sel = window.getSelection();

    // Insert bookmark marker at cursor position
    editor.focus();
    if (sel && sel.rangeCount > 0) {
      document.execCommand("insertHTML", false,
        `<span id="${id}" class="doc-bookmark" data-bookmark="${newBookmarkName}" style="border:1px dashed #4472C4;background:#e8f0fe;padding:0 3px;font-size:10px;color:#4472C4;cursor:pointer;" contenteditable="false" title="Bookmark: ${newBookmarkName}">[${newBookmarkName}]</span>`
      );
    }

    addBookmark({
      id,
      name: newBookmarkName,
      elementId: id,
      timestamp: new Date().toISOString(),
    });
    setNewBookmarkName("");
  };

  const deleteBookmark = (bookmark: typeof bookmarks[0]) => {
    removeBookmark(bookmark.id);
    const el = document.getElementById(bookmark.elementId);
    if (el) el.remove();
  };

  const navigateToBookmark = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid #4472C4";
      setTimeout(() => { el.style.outline = ""; }, 2000);
    }
  };

  const insertCrossReference = (targetId: string, text: string, type: string) => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    editor.focus();
    document.execCommand("insertHTML", false,
      `<a href="#${targetId}" class="doc-cross-ref" data-ref-type="${type}" style="color:#1565C0;text-decoration:none;border-bottom:1px dotted #1565C0;cursor:pointer;" onclick="event.preventDefault();document.getElementById('${targetId}')?.scrollIntoView({behavior:'smooth',block:'center'})">${text}</a>`
    );
  };

  if (!showBookmarksPanel) return null;

  return (
    <div
      className="w-72 border-l overflow-y-auto flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--foreground)" }}>
          <BookmarkPlus size={13} /> Bookmarks & References
        </span>
        <button onClick={() => setShowBookmarksPanel(false)} className="p-1 rounded hover:bg-[var(--muted)]">
          <X size={13} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium border-b-2 ${activeTab === "bookmarks" ? "border-[var(--primary)]" : "border-transparent"}`}
          style={{ color: activeTab === "bookmarks" ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          Bookmarks
        </button>
        <button
          onClick={() => setActiveTab("crossref")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium border-b-2 ${activeTab === "crossref" ? "border-[var(--primary)]" : "border-transparent"}`}
          style={{ color: activeTab === "crossref" ? "var(--primary)" : "var(--muted-foreground)" }}
        >
          Cross-references
        </button>
      </div>

      {activeTab === "bookmarks" ? (
        <>
          {/* Insert bookmark */}
          <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
            <div className="flex gap-1">
              <input
                type="text"
                value={newBookmarkName}
                onChange={(e) => setNewBookmarkName(e.target.value)}
                placeholder="Bookmark name..."
                className="flex-1 rounded border px-2 py-1.5 text-xs"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                onKeyDown={(e) => { if (e.key === "Enter") insertBookmark(); }}
              />
              <button onClick={insertBookmark}
                className="rounded px-2 py-1.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: "var(--primary)" }}>
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Bookmarks list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {bookmarks.length === 0 ? (
              <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
                No bookmarks yet. Place your cursor in the document and enter a name above to create one.
              </p>
            ) : (
              bookmarks.map((bm) => (
                <div key={bm.id}
                  className="flex items-center gap-1.5 rounded border p-2 group"
                  style={{ borderColor: "var(--border)" }}>
                  <BookmarkPlus size={12} className="flex-shrink-0" style={{ color: "#4472C4" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate" style={{ color: "var(--foreground)" }}>{bm.name}</div>
                    <div className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(bm.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <button onClick={() => navigateToBookmark(bm.elementId)} className="p-0.5 rounded hover:bg-[var(--muted)]" title="Go to bookmark">
                      <ArrowUpRight size={10} style={{ color: "var(--primary)" }} />
                    </button>
                    <button onClick={() => deleteBookmark(bm)} className="p-0.5 rounded hover:bg-red-100" title="Delete">
                      <Trash2 size={10} style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Cross-reference type selector */}
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Reference type</label>
            <div className="flex gap-1">
              {[
                { value: "bookmark" as const, icon: <BookmarkPlus size={10} />, label: "Bookmark" },
                { value: "heading" as const, icon: <Hash size={10} />, label: "Heading" },
                { value: "figure" as const, icon: <Image size={10} />, label: "Figure" },
              ].map((t) => (
                <button key={t.value}
                  onClick={() => setCrossRefType(t.value)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] border ${crossRefType === t.value ? "border-[var(--primary)] bg-[var(--muted)]" : ""}`}
                  style={{ borderColor: crossRefType === t.value ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items to reference */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <p className="text-[9px] px-1 mb-1" style={{ color: "var(--muted-foreground)" }}>
              Click an item to insert a cross-reference at the cursor position
            </p>

            {crossRefType === "bookmark" && (
              bookmarks.length === 0 ? (
                <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>No bookmarks to reference</p>
              ) : bookmarks.map((bm) => (
                <button key={bm.id}
                  onClick={() => insertCrossReference(bm.elementId, bm.name, "bookmark")}
                  className="w-full flex items-center gap-2 rounded border p-2 text-left text-[11px] hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <Link2 size={11} style={{ color: "#4472C4" }} />
                  <span className="truncate">{bm.name}</span>
                </button>
              ))
            )}

            {crossRefType === "heading" && (
              headings.length === 0 ? (
                <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>No headings to reference</p>
              ) : headings.map((h) => (
                <button key={h.id}
                  onClick={() => insertCrossReference(h.id, h.text, "heading")}
                  className="w-full flex items-center gap-2 rounded border p-2 text-left text-[11px] hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <Hash size={11} style={{ color: "#4472C4" }} />
                  <span className="truncate">{h.text}</span>
                </button>
              ))
            )}

            {crossRefType === "figure" && (
              figures.length === 0 ? (
                <p className="text-[10px] px-2 py-4 text-center" style={{ color: "var(--muted-foreground)" }}>No figures to reference</p>
              ) : figures.map((f) => (
                <button key={f.id}
                  onClick={() => insertCrossReference(f.id, f.text, "figure")}
                  className="w-full flex items-center gap-2 rounded border p-2 text-left text-[11px] hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <Image size={11} style={{ color: "#4472C4" }} />
                  <span className="truncate">{f.text}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}

      <div className="px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        {activeTab === "bookmarks"
          ? `${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""}`
          : `${crossRefType === "bookmark" ? bookmarks.length : crossRefType === "heading" ? headings.length : figures.length} items available`
        }
      </div>
    </div>
  );
}
