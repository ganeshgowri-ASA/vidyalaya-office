"use client";

import React, { useState, useCallback } from "react";
import { X, Plus, Trash2, Edit2, BookOpen, Download, Search, FileText } from "lucide-react";
import { useDocumentStore, Citation, CitationStyle } from "@/store/document-store";

const CITATION_STYLE_OPTIONS: { value: CitationStyle; label: string }[] = [
  { value: "APA", label: "APA 7th Edition" },
  { value: "MLA", label: "MLA 9th Edition" },
  { value: "Chicago", label: "Chicago 17th Edition" },
  { value: "IEEE", label: "IEEE" },
  { value: "Harvard", label: "Harvard" },
];

const CITATION_TYPES = [
  { value: "journal", label: "Journal Article" },
  { value: "book", label: "Book" },
  { value: "conference", label: "Conference Paper" },
  { value: "website", label: "Website" },
  { value: "thesis", label: "Thesis/Dissertation" },
  { value: "other", label: "Other" },
] as const;

function generateId(): string {
  return "cit-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
}

function formatCitation(citation: Citation, style: CitationStyle): string {
  const { authors, year, title, journal, volume, issue, pages, doi, publisher, url } = citation;
  switch (style) {
    case "APA":
      return `${authors} (${year}). ${title}.${journal ? ` *${journal}*` : ""}${volume ? `, *${volume}*` : ""}${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
    case "MLA":
      return `${authors}. "${title}."${journal ? ` *${journal}*` : ""}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${year ? `, ${year}` : ""}${pages ? `, pp. ${pages}` : ""}.${doi ? ` doi:${doi}` : ""}`;
    case "Chicago":
      return `${authors}. "${title}."${journal ? ` *${journal}*` : ""}${volume ? ` ${volume}` : ""}${issue ? `, no. ${issue}` : ""} (${year})${pages ? `: ${pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
    case "IEEE":
      return `${authors}, "${title},"${journal ? ` *${journal}*` : ""}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}${year ? `, ${year}` : ""}.${doi ? ` doi: ${doi}` : ""}`;
    case "Harvard":
      return `${authors} (${year}) '${title}',${journal ? ` *${journal}*` : ""}${volume ? `, ${volume}` : ""}${issue ? `(${issue})` : ""}${pages ? `, pp. ${pages}` : ""}.${doi ? ` doi: ${doi}` : ""}`;
    default:
      return `${authors} (${year}). ${title}.`;
  }
}

function formatInTextCitation(citation: Citation, style: CitationStyle, index: number): string {
  const lastName = citation.authors.split(",")[0].trim();
  switch (style) {
    case "APA": return `(${lastName}, ${citation.year})`;
    case "MLA": return `(${lastName} ${citation.year})`;
    case "Chicago": return `(${lastName} ${citation.year})`;
    case "IEEE": return `[${index + 1}]`;
    case "Harvard": return `(${lastName}, ${citation.year})`;
    default: return `(${lastName}, ${citation.year})`;
  }
}

interface CitationManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function CitationManagerModal({ open, onClose }: CitationManagerModalProps) {
  const { citations, addCitation, removeCitation, updateCitation, citationStyle, setCitationStyle } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<"references" | "add" | "import" | "bibliography">("references");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCitation, setNewCitation] = useState<Partial<Citation>>({
    type: "journal",
    title: "",
    authors: "",
    year: new Date().getFullYear().toString(),
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    doi: "",
    url: "",
    publisher: "",
  });
  const [importText, setImportText] = useState("");
  const [importType, setImportType] = useState<"doi" | "bibtex" | "pubmed">("doi");

  const handleAdd = useCallback(() => {
    if (!newCitation.title || !newCitation.authors) return;
    const citation: Citation = {
      id: generateId(),
      type: (newCitation.type as Citation["type"]) || "journal",
      title: newCitation.title || "",
      authors: newCitation.authors || "",
      year: newCitation.year || "",
      journal: newCitation.journal,
      volume: newCitation.volume,
      issue: newCitation.issue,
      pages: newCitation.pages,
      doi: newCitation.doi,
      url: newCitation.url,
      publisher: newCitation.publisher,
    };
    addCitation(citation);
    setNewCitation({
      type: "journal", title: "", authors: "", year: new Date().getFullYear().toString(),
      journal: "", volume: "", issue: "", pages: "", doi: "", url: "", publisher: "",
    });
    setActiveTab("references");
  }, [newCitation, addCitation]);

  const handleImport = useCallback(async () => {
    if (!importText.trim()) return;
    if (importType === "doi") {
      // Placeholder: In production, fetch from CrossRef API
      const citation: Citation = {
        id: generateId(),
        type: "journal",
        title: `Article from DOI: ${importText}`,
        authors: "Author, A.",
        year: new Date().getFullYear().toString(),
        doi: importText.replace("https://doi.org/", ""),
      };
      addCitation(citation);
    } else if (importType === "bibtex") {
      // Basic BibTeX parser
      const titleMatch = importText.match(/title\s*=\s*[{"]([^}"]+)[}"]/i);
      const authorMatch = importText.match(/author\s*=\s*[{"]([^}"]+)[}"]/i);
      const yearMatch = importText.match(/year\s*=\s*[{"]?(\d{4})[}"]/i);
      const journalMatch = importText.match(/journal\s*=\s*[{"]([^}"]+)[}"]/i);
      const volumeMatch = importText.match(/volume\s*=\s*[{"]([^}"]+)[}"]/i);
      const pagesMatch = importText.match(/pages\s*=\s*[{"]([^}"]+)[}"]/i);
      const doiMatch = importText.match(/doi\s*=\s*[{"]([^}"]+)[}"]/i);

      const citation: Citation = {
        id: generateId(),
        type: "journal",
        title: titleMatch?.[1] || "Imported Reference",
        authors: authorMatch?.[1] || "Unknown",
        year: yearMatch?.[1] || "",
        journal: journalMatch?.[1],
        volume: volumeMatch?.[1],
        pages: pagesMatch?.[1],
        doi: doiMatch?.[1],
      };
      addCitation(citation);
    } else if (importType === "pubmed") {
      // Placeholder for PubMed import
      const citation: Citation = {
        id: generateId(),
        type: "journal",
        title: `Article from PubMed ID: ${importText}`,
        authors: "Author, A.",
        year: new Date().getFullYear().toString(),
      };
      addCitation(citation);
    }
    setImportText("");
    setActiveTab("references");
  }, [importText, importType, addCitation]);

  const insertInTextCitation = useCallback((citation: Citation) => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    editor.focus();
    const index = citations.findIndex((c) => c.id === citation.id);
    const text = formatInTextCitation(citation, citationStyle, index);
    document.execCommand("insertHTML", false,
      `<span class="doc-citation" style="color:#1565C0;cursor:pointer;" data-citation-id="${citation.id}" title="${citation.authors} (${citation.year}). ${citation.title}">${text}</span>`
    );
  }, [citations, citationStyle]);

  const generateBibliography = useCallback(() => {
    if (citations.length === 0) return;
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    editor.focus();

    const sorted = [...citations].sort((a, b) => a.authors.localeCompare(b.authors));
    let html = '<div class="doc-bibliography" style="margin-top:40px;border-top:2px solid #333;padding-top:16px;">';
    html += '<h2 style="font-size:16pt;color:#2F5496;margin-bottom:12px;">References</h2>';

    sorted.forEach((cit, i) => {
      const formatted = formatCitation(cit, citationStyle);
      const indent = citationStyle === "APA" || citationStyle === "Harvard" ? "padding-left:36px;text-indent:-36px;" : "";
      html += `<p style="font-size:11pt;margin-bottom:8px;${indent}">${citationStyle === "IEEE" ? `[${i + 1}] ` : ""}${formatted}</p>`;
    });

    html += '</div><p></p>';
    document.execCommand("insertHTML", false, html);
    onClose();
  }, [citations, citationStyle, onClose]);

  const filteredCitations = citations.filter((c) =>
    !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.authors.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl border shadow-2xl flex flex-col" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 700, maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Citation Manager</h2>
          <div className="flex items-center gap-2">
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
              className="text-xs rounded border px-2 py-1 outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {CITATION_STYLE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
              <X size={16} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4" style={{ borderColor: "var(--border)" }}>
          {(["references", "add", "import", "bibliography"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-[var(--primary)]" : "border-transparent"}`}
              style={{ color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {tab === "references" ? `References (${citations.length})` : tab === "add" ? "Add New" : tab === "import" ? "Import" : "Bibliography"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 300 }}>
          {activeTab === "references" && (
            <div className="space-y-3">
              {/* Search */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 border rounded-md px-2" style={{ borderColor: "var(--border)" }}>
                  <Search size={12} style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search references..."
                    className="flex-1 bg-transparent text-xs py-1.5 outline-none"
                    style={{ color: "var(--foreground)" }}
                  />
                </div>
              </div>

              {filteredCitations.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No references yet. Add or import references to get started.</p>
                </div>
              ) : (
                filteredCitations.map((cit) => (
                  <div key={cit.id} className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{cit.title}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {cit.authors} ({cit.year}){cit.journal ? ` - ${cit.journal}` : ""}
                        </div>
                        <div className="text-[10px] mt-1 italic" style={{ color: "var(--muted-foreground)" }}>
                          {formatCitation(cit, citationStyle)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => insertInTextCitation(cit)}
                          className="px-2 py-1 rounded text-[10px] hover:bg-[var(--muted)]"
                          style={{ color: "var(--primary)" }}
                          title="Insert in-text citation"
                        >
                          Cite
                        </button>
                        <button onClick={() => removeCitation(cit.id)} className="p-1 rounded hover:bg-[var(--muted)]">
                          <Trash2 size={12} style={{ color: "var(--muted-foreground)" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "add" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Type</label>
                  <select
                    value={newCitation.type}
                    onChange={(e) => setNewCitation({ ...newCitation, type: e.target.value as Citation["type"] })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    {CITATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Year</label>
                  <input
                    type="text"
                    value={newCitation.year}
                    onChange={(e) => setNewCitation({ ...newCitation, year: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Authors (Last, First; Last, First)</label>
                <input
                  type="text"
                  value={newCitation.authors}
                  onChange={(e) => setNewCitation({ ...newCitation, authors: e.target.value })}
                  placeholder="Smith, J.; Doe, A."
                  className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Title</label>
                <input
                  type="text"
                  value={newCitation.title}
                  onChange={(e) => setNewCitation({ ...newCitation, title: e.target.value })}
                  className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Journal/Source</label>
                  <input
                    type="text"
                    value={newCitation.journal}
                    onChange={(e) => setNewCitation({ ...newCitation, journal: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Publisher</label>
                  <input
                    type="text"
                    value={newCitation.publisher}
                    onChange={(e) => setNewCitation({ ...newCitation, publisher: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Volume</label>
                  <input type="text" value={newCitation.volume} onChange={(e) => setNewCitation({ ...newCitation, volume: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Issue</label>
                  <input type="text" value={newCitation.issue} onChange={(e) => setNewCitation({ ...newCitation, issue: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Pages</label>
                  <input type="text" value={newCitation.pages} onChange={(e) => setNewCitation({ ...newCitation, pages: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>DOI</label>
                  <input type="text" value={newCitation.doi} onChange={(e) => setNewCitation({ ...newCitation, doi: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>URL</label>
                  <input type="text" value={newCitation.url} onChange={(e) => setNewCitation({ ...newCitation, url: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={!newCitation.title || !newCitation.authors}
                className="w-full rounded-md px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Plus size={12} className="inline mr-1" /> Add Reference
              </button>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["doi", "bibtex", "pubmed"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setImportType(type)}
                    className={`px-3 py-1.5 rounded text-xs border ${importType === type ? "border-[var(--primary)]" : ""}`}
                    style={{ borderColor: importType === type ? "var(--primary)" : "var(--border)", color: importType === type ? "var(--primary)" : "var(--foreground)" }}
                  >
                    {type === "doi" ? "DOI" : type === "bibtex" ? "BibTeX" : "PubMed ID"}
                  </button>
                ))}
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={importType === "doi" ? "Enter DOI (e.g., 10.1000/xyz123)" : importType === "bibtex" ? "Paste BibTeX entry..." : "Enter PubMed ID"}
                className="w-full rounded-md border px-3 py-2 text-xs font-mono outline-none resize-none"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", minHeight: 120 }}
              />
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full rounded-md px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Download size={12} className="inline mr-1" /> Import Reference
              </button>
            </div>
          )}

          {activeTab === "bibliography" && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Generate a formatted bibliography from all your references in {CITATION_STYLE_OPTIONS.find((s) => s.value === citationStyle)?.label} style.
              </p>
              {citations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No references to generate bibliography from.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                    <h4 className="text-xs font-semibold mb-3" style={{ color: "var(--foreground)" }}>Preview ({citationStyle})</h4>
                    {[...citations].sort((a, b) => a.authors.localeCompare(b.authors)).map((cit, i) => (
                      <p key={cit.id} className="text-[11px] mb-2" style={{ color: "var(--foreground)", paddingLeft: 36, textIndent: -36 }}>
                        {citationStyle === "IEEE" ? `[${i + 1}] ` : ""}{formatCitation(cit, citationStyle)}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={generateBibliography}
                    className="w-full rounded-md px-4 py-2 text-xs font-medium"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    Insert Bibliography into Document
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
