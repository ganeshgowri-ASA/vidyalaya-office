"use client";

import React, { useState, useCallback } from "react";
import { X, Upload, Plus, Trash2, Eye, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import type { MailMergeRecord } from "@/store/document-store";

interface MailMergeDialogProps {
  open: boolean;
  onClose: () => void;
}

const SAMPLE_FIELDS = ["FirstName", "LastName", "Email", "Address", "City", "State", "ZipCode", "Company", "Phone"];

export function MailMergeDialog({ open, onClose }: MailMergeDialogProps) {
  const { mailMergeData, setMailMergeData, mailMergeFields, setMailMergeFields } = useDocumentStore();
  const [activeStep, setActiveStep] = useState<"source" | "fields" | "preview" | "merge">("source");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [newFieldName, setNewFieldName] = useState("");
  const [editingData, setEditingData] = useState<MailMergeRecord[]>(mailMergeData.length > 0 ? mailMergeData : []);
  const [editingFields, setEditingFields] = useState<string[]>(mailMergeFields.length > 0 ? mailMergeFields : []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const records: MailMergeRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
        const record: MailMergeRecord = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx] || "";
        });
        records.push(record);
      }
      setEditingFields(headers);
      setEditingData(records);
    };
    reader.readAsText(file);
  }, []);

  const loadSampleData = () => {
    const fields = ["FirstName", "LastName", "Email", "Company"];
    const data: MailMergeRecord[] = [
      { FirstName: "John", LastName: "Doe", Email: "john@example.com", Company: "Acme Corp" },
      { FirstName: "Jane", LastName: "Smith", Email: "jane@example.com", Company: "Tech Inc" },
      { FirstName: "Bob", LastName: "Wilson", Email: "bob@example.com", Company: "Global Ltd" },
    ];
    setEditingFields(fields);
    setEditingData(data);
  };

  const addField = () => {
    if (newFieldName && !editingFields.includes(newFieldName)) {
      setEditingFields([...editingFields, newFieldName]);
      setEditingData(editingData.map((r) => ({ ...r, [newFieldName]: "" })));
      setNewFieldName("");
    }
  };

  const addRecord = () => {
    const newRecord: MailMergeRecord = {};
    editingFields.forEach((f) => (newRecord[f] = ""));
    setEditingData([...editingData, newRecord]);
  };

  const removeRecord = (index: number) => {
    setEditingData(editingData.filter((_, i) => i !== index));
  };

  const updateRecord = (index: number, field: string, value: string) => {
    const updated = [...editingData];
    updated[index] = { ...updated[index], [field]: value };
    setEditingData(updated);
  };

  const insertField = (fieldName: string) => {
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<span class="mail-merge-field" style="background:#e3f2fd;border:1px solid #90caf9;border-radius:3px;padding:1px 6px;font-size:11px;color:#1565C0;white-space:nowrap;" contenteditable="false">«${fieldName}»</span>`
      );
    }
  };

  const mergeToNewDocument = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    const template = editor.innerHTML;
    let mergedHtml = "";

    editingData.forEach((record, i) => {
      let pageContent = template;
      editingFields.forEach((field) => {
        const regex = new RegExp(`«${field}»`, "g");
        pageContent = pageContent.replace(regex, record[field] || "");
        // Also replace the span elements
        const spanRegex = new RegExp(`<span[^>]*class="mail-merge-field"[^>]*>«${field}»</span>`, "g");
        pageContent = pageContent.replace(spanRegex, record[field] || "");
      });
      mergedHtml += pageContent;
      if (i < editingData.length - 1) {
        mergedHtml += '<div style="page-break-after:always;border-top:2px dashed #ccc;margin:24px 0;text-align:center;color:#999;font-size:10px;">— Page Break —</div>';
      }
    });

    editor.innerHTML = mergedHtml;
    onClose();
  };

  const applyData = () => {
    setMailMergeData(editingData);
    setMailMergeFields(editingFields);
  };

  const getPreviewContent = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor || editingData.length === 0) return "";

    let content = editor.innerHTML;
    const record = editingData[previewIndex] || editingData[0];
    editingFields.forEach((field) => {
      const regex = new RegExp(`«${field}»`, "g");
      content = content.replace(regex, `<strong style="color:#1565C0;">${record[field] || ""}</strong>`);
      const spanRegex = new RegExp(`<span[^>]*class="mail-merge-field"[^>]*>«${field}»</span>`, "g");
      content = content.replace(spanRegex, `<strong style="color:#1565C0;">${record[field] || ""}</strong>`);
    });
    return content;
  };

  if (!open) return null;

  const steps = [
    { key: "source", label: "1. Data Source" },
    { key: "fields", label: "2. Insert Fields" },
    { key: "preview", label: "3. Preview" },
    { key: "merge", label: "4. Merge" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[700px] max-h-[85vh] rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Mail Merge</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b px-5" style={{ borderColor: "var(--border)" }}>
          {steps.map((s) => (
            <button key={s.key} onClick={() => setActiveStep(s.key)}
              className={`px-4 py-2 text-xs font-medium border-b-2 ${
                activeStep === s.key ? "border-[var(--primary)]" : "border-transparent"
              }`}
              style={{ color: activeStep === s.key ? "var(--primary)" : "var(--muted-foreground)" }}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto max-h-[55vh]">
          {activeStep === "source" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: "var(--foreground)" }}>
                  Import Data Source
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-[var(--muted)] text-xs"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <Upload size={14} />
                    Upload CSV
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <button onClick={loadSampleData}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <FileText size={14} />
                    Load Sample Data
                  </button>
                </div>
              </div>

              {editingFields.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                      Data ({editingData.length} records, {editingFields.length} fields)
                    </span>
                    <button onClick={addRecord}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
                      style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                      <Plus size={10} /> Add Row
                    </button>
                  </div>
                  <div className="border rounded-lg overflow-auto max-h-48" style={{ borderColor: "var(--border)" }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {editingFields.map((f) => (
                            <th key={f} className="px-2 py-1.5 text-left font-medium border-b"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--muted)" }}>
                              {f}
                            </th>
                          ))}
                          <th className="w-8 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }} />
                        </tr>
                      </thead>
                      <tbody>
                        {editingData.map((record, i) => (
                          <tr key={i}>
                            {editingFields.map((f) => (
                              <td key={f} className="px-1 py-0.5 border-b" style={{ borderColor: "var(--border)" }}>
                                <input type="text" value={record[f] || ""}
                                  onChange={(e) => updateRecord(i, f, e.target.value)}
                                  className="w-full bg-transparent text-xs outline-none px-1 py-0.5"
                                  style={{ color: "var(--foreground)" }} />
                              </td>
                            ))}
                            <td className="border-b text-center" style={{ borderColor: "var(--border)" }}>
                              <button onClick={() => removeRecord(i)} className="p-0.5 hover:bg-[var(--muted)] rounded">
                                <Trash2 size={11} style={{ color: "var(--muted-foreground)" }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--foreground)" }}>Add Custom Field</label>
                <div className="flex gap-2">
                  <input type="text" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Field name..."
                    className="flex-1 rounded border px-2 py-1.5 text-xs bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    onKeyDown={(e) => e.key === "Enter" && addField()} />
                  <button onClick={addField}
                    className="px-3 py-1.5 rounded text-xs text-white"
                    style={{ backgroundColor: "var(--primary)" }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeStep === "fields" && (
            <div className="space-y-4">
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Click a field to insert it at the cursor position in your document.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {editingFields.map((field) => (
                  <button key={field} onClick={() => insertField(field)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs hover:bg-[var(--muted)] text-left"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <span style={{ color: "var(--primary)" }}>«</span>
                    {field}
                    <span style={{ color: "var(--primary)" }}>»</span>
                  </button>
                ))}
              </div>
              {editingFields.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: "var(--muted-foreground)" }}>
                  No fields defined. Go to Step 1 to set up your data source.
                </p>
              )}
            </div>
          )}

          {activeStep === "preview" && (
            <div className="space-y-4">
              {editingData.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Preview record {previewIndex + 1} of {editingData.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                        disabled={previewIndex === 0}
                        className="p-1 rounded hover:bg-[var(--muted)] disabled:opacity-50">
                        <ChevronLeft size={14} style={{ color: "var(--foreground)" }} />
                      </button>
                      <button onClick={() => setPreviewIndex(Math.min(editingData.length - 1, previewIndex + 1))}
                        disabled={previewIndex >= editingData.length - 1}
                        className="p-1 rounded hover:bg-[var(--muted)] disabled:opacity-50">
                        <ChevronRight size={14} style={{ color: "var(--foreground)" }} />
                      </button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-white text-black max-h-64 overflow-auto"
                    style={{ borderColor: "var(--border)" }}
                    dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
                  <div className="grid grid-cols-2 gap-2">
                    {editingFields.map((f) => (
                      <div key={f} className="flex justify-between text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: "var(--muted)" }}>
                        <span style={{ color: "var(--muted-foreground)" }}>{f}:</span>
                        <span style={{ color: "var(--foreground)" }}>{editingData[previewIndex]?.[f] || "—"}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-center py-8" style={{ color: "var(--muted-foreground)" }}>
                  No data to preview. Go to Step 1 to set up your data source.
                </p>
              )}
            </div>
          )}

          {activeStep === "merge" && (
            <div className="space-y-4 text-center py-4">
              <FileText size={48} className="mx-auto" style={{ color: "var(--primary)" }} />
              <h3 className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Ready to Merge</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                This will create {editingData.length} merged document{editingData.length !== 1 ? "s" : ""} using your template and data.
              </p>
              <button onClick={() => { applyData(); mergeToNewDocument(); }}
                className="px-6 py-2 rounded-lg text-sm text-white"
                style={{ backgroundColor: "var(--primary)" }}
                disabled={editingData.length === 0}>
                Merge to Document
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => { applyData(); }}
            className="px-4 py-1.5 rounded-lg border text-xs hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Save Data
          </button>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-1.5 rounded-lg border text-xs"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
