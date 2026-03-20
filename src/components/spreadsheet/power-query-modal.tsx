"use client";

import { useState, useCallback } from "react";
import { X, Upload, FileText, Globe, Braces, ArrowRight, Trash2, Play, ChevronDown } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";

type DataSource = "csv" | "json" | "api" | "clipboard";
type TransformStep = {
  id: string;
  type: "removeColumn" | "filterRows" | "sortBy" | "renameColumn" | "changeType" | "fillDown" | "splitColumn" | "mergeColumns";
  config: Record<string, string>;
};

export function PowerQueryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const importCSV = useSpreadsheetStore((s) => s.importCSV);
  const pushUndo = useSpreadsheetStore((s) => s.pushUndo);

  const [source, setSource] = useState<DataSource>("csv");
  const [rawData, setRawData] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [jsonPath, setJsonPath] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [transformSteps, setTransformSteps] = useState<TransformStep[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [step, setStep] = useState<"source" | "transform" | "preview">("source");

  const parseData = useCallback(() => {
    if (!rawData.trim()) return;
    const lines = rawData.trim().split(/\r?\n/);
    const delim = delimiter === "\\t" ? "\t" : delimiter;
    const parsed = lines.map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delim && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      values.push(current.trim());
      return values;
    });

    if (hasHeaders && parsed.length > 0) {
      setHeaders(parsed[0]);
      setPreviewRows(parsed.slice(1, 51));
    } else {
      const cols = Math.max(...parsed.map((r) => r.length));
      setHeaders(Array.from({ length: cols }, (_, i) => `Column${i + 1}`));
      setPreviewRows(parsed.slice(0, 50));
    }
    setStep("transform");
  }, [rawData, delimiter, hasHeaders]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (file.name.endsWith(".json")) {
        setSource("json");
        setRawData(text);
        try {
          const json = JSON.parse(text);
          const arr = Array.isArray(json) ? json : jsonPath ? extractPath(json, jsonPath) : [json];
          if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object") {
            const keys = Object.keys(arr[0]);
            setHeaders(keys);
            setPreviewRows(arr.slice(0, 50).map((item) => keys.map((k) => String(item[k] ?? ""))));
            setStep("transform");
          }
        } catch {
          setRawData(text);
        }
      } else {
        setSource("csv");
        setRawData(text);
        if (file.name.endsWith(".tsv")) setDelimiter("\\t");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [jsonPath]);

  const extractPath = (obj: Record<string, unknown>, path: string): unknown[] => {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current && typeof current === "object" && !Array.isArray(current)) {
        current = (current as Record<string, unknown>)[part];
      }
    }
    return Array.isArray(current) ? current : [];
  };

  const handleParseJSON = useCallback(() => {
    if (!rawData.trim()) return;
    try {
      const json = JSON.parse(rawData);
      const arr = Array.isArray(json) ? json : jsonPath ? extractPath(json, jsonPath) : [json];
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object") {
        const keys = Object.keys(arr[0] as Record<string, unknown>);
        setHeaders(keys);
        setPreviewRows(arr.slice(0, 50).map((item: unknown) => {
          const record = item as Record<string, unknown>;
          return keys.map((k) => String(record[k] ?? ""));
        }));
        setStep("transform");
      }
    } catch {
      // invalid JSON
    }
  }, [rawData, jsonPath]);

  const addTransformStep = useCallback((type: TransformStep["type"]) => {
    setTransformSteps((prev) => [...prev, {
      id: `step-${Date.now()}`,
      type,
      config: {},
    }]);
  }, []);

  const removeTransformStep = useCallback((id: string) => {
    setTransformSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleApply = useCallback(() => {
    pushUndo();
    // Build CSV from preview data
    const csvLines: string[] = [];
    if (headers.length > 0) {
      csvLines.push(headers.join(","));
    }
    for (const row of previewRows) {
      csvLines.push(row.map((v) => v.includes(",") ? `"${v}"` : v).join(","));
    }
    importCSV(csvLines.join("\n"));
    onClose();
  }, [headers, previewRows, importCSV, pushUndo, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[750px] max-h-[85vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Power Query - Data Import & Transform</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-4 py-2 border-b text-xs" style={{ borderColor: "var(--border)" }}>
          {(["source", "transform", "preview"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <ArrowRight size={10} style={{ color: "var(--muted-foreground)" }} />}
              <button
                onClick={() => setStep(s)}
                className="px-2 py-1 rounded"
                style={{
                  backgroundColor: step === s ? "var(--primary)" : "transparent",
                  color: step === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* Source step */}
          {step === "source" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {([
                  { key: "csv" as DataSource, icon: <FileText size={14} />, label: "CSV/TSV" },
                  { key: "json" as DataSource, icon: <Braces size={14} />, label: "JSON" },
                  { key: "api" as DataSource, icon: <Globe size={14} />, label: "API/URL" },
                  { key: "clipboard" as DataSource, icon: <Upload size={14} />, label: "Paste Data" },
                ]).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSource(s.key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium"
                    style={{
                      backgroundColor: source === s.key ? "rgba(59,130,246,0.15)" : "var(--muted)",
                      border: source === s.key ? "1px solid var(--primary)" : "1px solid transparent",
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>

              {(source === "csv" || source === "json") && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Upload File</label>
                  <input
                    type="file"
                    accept={source === "csv" ? ".csv,.tsv,.txt" : ".json"}
                    onChange={handleFileUpload}
                    className="text-xs"
                  />
                </div>
              )}

              {source === "api" && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>API URL (JSON endpoint)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 text-sm rounded px-2 py-1.5 border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      placeholder="https://api.example.com/data"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                    />
                    <button
                      className="px-3 py-1.5 text-xs rounded hover:opacity-90"
                      style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                      onClick={() => {
                        if (apiUrl) {
                          setRawData(`[API fetch from: ${apiUrl}]\nNote: Direct API fetching requires server-side proxy for CORS.\nPaste your API response data below instead.`);
                        }
                      }}
                    >
                      Fetch
                    </button>
                  </div>
                </div>
              )}

              {source === "json" && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>JSON Path (for nested data)</label>
                  <input
                    type="text"
                    className="w-full text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    placeholder="e.g. data.results or items"
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                  />
                </div>
              )}

              {source === "csv" && (
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>Delimiter</label>
                    <select
                      className="text-xs rounded px-2 py-1.5 border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="\t">Tab</option>
                      <option value="|">Pipe (|)</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={hasHeaders} onChange={(e) => setHasHeaders(e.target.checked)} />
                    First row is header
                  </label>
                </div>
              )}

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  {source === "json" ? "JSON Data" : "Raw Data"}
                </label>
                <textarea
                  className="w-full h-40 text-xs rounded px-2 py-1.5 border outline-none font-mono resize-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder={source === "json" ? '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]' : "Paste your data here..."}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                />
              </div>

              <button
                className="w-full px-3 py-2 text-xs rounded hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                onClick={source === "json" ? handleParseJSON : parseData}
              >
                Parse & Preview
              </button>
            </div>
          )}

          {/* Transform step */}
          {step === "transform" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  Transform Steps ({transformSteps.length})
                </span>
                <div className="relative">
                  <details className="relative">
                    <summary className="flex items-center gap-1 px-2 py-1 text-xs rounded border cursor-pointer hover:opacity-80" style={{ borderColor: "var(--border)" }}>
                      + Add Step <ChevronDown size={10} />
                    </summary>
                    <div className="absolute right-0 mt-1 py-1 rounded border shadow-lg z-10" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", minWidth: 180 }}>
                      {([
                        { type: "removeColumn" as const, label: "Remove Column" },
                        { type: "filterRows" as const, label: "Filter Rows" },
                        { type: "sortBy" as const, label: "Sort By" },
                        { type: "renameColumn" as const, label: "Rename Column" },
                        { type: "changeType" as const, label: "Change Type" },
                        { type: "fillDown" as const, label: "Fill Down" },
                        { type: "splitColumn" as const, label: "Split Column" },
                        { type: "mergeColumns" as const, label: "Merge Columns" },
                      ]).map((t) => (
                        <button
                          key={t.type}
                          className="w-full text-left px-3 py-1.5 text-xs hover:opacity-80"
                          style={{ color: "var(--foreground)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          onClick={() => addTransformStep(t.type)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              {transformSteps.length === 0 && (
                <div className="text-xs text-center py-4" style={{ color: "var(--muted-foreground)" }}>
                  No transform steps. Add steps or proceed to preview.
                </div>
              )}

              {transformSteps.map((ts, i) => (
                <div key={ts.id} className="flex items-center gap-2 p-2 rounded border text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                  <span className="font-mono text-[10px] w-5 text-center" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                  <span className="font-medium flex-1">
                    {ts.type === "removeColumn" && "Remove Column"}
                    {ts.type === "filterRows" && "Filter Rows"}
                    {ts.type === "sortBy" && "Sort By"}
                    {ts.type === "renameColumn" && "Rename Column"}
                    {ts.type === "changeType" && "Change Type"}
                    {ts.type === "fillDown" && "Fill Down"}
                    {ts.type === "splitColumn" && "Split Column"}
                    {ts.type === "mergeColumns" && "Merge Columns"}
                  </span>
                  {["removeColumn", "sortBy", "renameColumn", "changeType", "fillDown", "splitColumn"].includes(ts.type) && (
                    <select
                      className="text-[10px] rounded px-1 py-0.5 border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      value={ts.config.column || ""}
                      onChange={(e) => {
                        setTransformSteps((prev) => prev.map((s) => s.id === ts.id ? { ...s, config: { ...s.config, column: e.target.value } } : s));
                      }}
                    >
                      <option value="">Select column...</option>
                      {headers.map((h, idx) => (
                        <option key={idx} value={h}>{h}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => removeTransformStep(ts.id)} className="hover:opacity-70">
                    <Trash2 size={12} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              ))}

              <button
                className="w-full px-3 py-2 text-xs rounded hover:opacity-90 flex items-center justify-center gap-1"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                onClick={() => setStep("preview")}
              >
                <Play size={12} /> Preview Results
              </button>
            </div>
          )}

          {/* Preview step */}
          {step === "preview" && (
            <div className="space-y-3">
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {previewRows.length} rows &times; {headers.length} columns
              </div>
              <div className="border rounded overflow-auto max-h-[350px]" style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th
                          key={i}
                          className="text-left px-2 py-1.5 border-b border-r whitespace-nowrap"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 25).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-2 py-1 border-b border-r whitespace-nowrap"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewRows.length > 25 && (
                <div className="text-[10px] text-center" style={{ color: "var(--muted-foreground)" }}>
                  Showing first 25 of {previewRows.length} rows
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={() => {
              if (step === "transform") setStep("source");
              else if (step === "preview") setStep("transform");
              else onClose();
            }}
          >
            {step === "source" ? "Cancel" : "Back"}
          </button>
          {step === "preview" && (
            <button
              className="px-4 py-1.5 text-xs rounded hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              onClick={handleApply}
            >
              Load into Sheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
