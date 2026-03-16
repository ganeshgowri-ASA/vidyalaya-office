"use client";

import React, { useState, useCallback } from "react";
import {
  Code, Terminal, Puzzle, Settings, X, ToggleLeft, ToggleRight,
  LayoutGrid, FileEdit, Package,
  Shield, FileCode, Search, Globe, Key, Link,
  CheckCircle, AlertCircle, FileJson, Map, Layers,
  Type, FileType, ImageIcon, ChevronDown, Calendar, CheckSquare,
  AlignLeft, Building, List, PlusCircle, Trash2, Eye, EyeOff,
} from "lucide-react";
import { AIMacroEditor, type LogEntry } from "./ai-macro-editor";
import { FormDesigner } from "./form-designer";
import { AddInsMarketplace } from "./addins-marketplace";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DeveloperPanelProps {
  visible: boolean;
  onClose: () => void;
}

type MainTab = "macro-editor" | "form-designer" | "content-controls" | "addins" | "extensions" | "controls" | "xml" | "doc-inspector" | "api-config";

interface Extension {
  name: string;
  version: string;
  enabled: boolean;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_EXTENSIONS: Extension[] = [
  { name: "Citation Manager", version: "1.2.0", enabled: true, description: "Manage citations and bibliography" },
  { name: "Grammar Checker Pro", version: "2.1.0", enabled: true, description: "Advanced grammar and style checking" },
  { name: "Template Engine", version: "1.0.5", enabled: false, description: "Create and manage document templates" },
  { name: "PDF Export Plus", version: "3.0.1", enabled: true, description: "Enhanced PDF export with options" },
  { name: "Mail Merge Advanced", version: "1.1.0", enabled: false, description: "Advanced mail merge capabilities" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

let logIdCounter = 0;
function nextLogId(): number { return ++logIdCounter; }

/* ------------------------------------------------------------------ */
/*  Tab Button                                                         */
/* ------------------------------------------------------------------ */

function TabButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap"
      style={{ background: active ? "var(--card)" : "transparent", color: active ? "var(--foreground)" : "var(--muted-foreground)", borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent" }}>
      {icon}{label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DeveloperPanel({ visible, onClose }: DeveloperPanelProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("macro-editor");
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: nextLogId(), type: "info", message: "Developer console initialized.", timestamp: timestamp() },
  ]);
  const [extensions, setExtensions] = useState<Extension[]>(INITIAL_EXTENSIONS);

  // Content Controls state
  const [designMode, setDesignMode] = useState(false);

  // XML tab state
  interface XmlSchema { id: string; name: string; namespace: string; valid: boolean }
  const [xmlSchemas, setXmlSchemas] = useState<XmlSchema[]>([
    { id: "1", name: "Custom Schema v1", namespace: "http://schemas.example.com/custom/v1", valid: true },
    { id: "2", name: "Data Schema", namespace: "http://schemas.example.com/data", valid: false },
  ]);

  // Document Inspector state
  interface InspectCategory { id: string; label: string; checked: boolean; issues?: number }
  const [inspectCategories, setInspectCategories] = useState<InspectCategory[]>([
    { id: "comments", label: "Comments and Revisions", checked: true },
    { id: "personal", label: "Personal Information", checked: true },
    { id: "hidden-text", label: "Hidden Text", checked: true },
    { id: "custom-xml", label: "Custom XML Data", checked: true },
    { id: "headers", label: "Headers and Footers", checked: false },
    { id: "invisible", label: "Invisible Content", checked: true },
  ]);
  const [inspectResults, setInspectResults] = useState<Record<string, number> | null>(null);
  const [inspecting, setInspecting] = useState(false);

  // API Config state
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.vidyalaya.example.com/v1");
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••••••••••");
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiStatus, setApiStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const runInspect = useCallback(() => {
    setInspecting(true);
    setTimeout(() => {
      const results: Record<string, number> = {};
      inspectCategories.filter(c => c.checked).forEach(c => {
        results[c.id] = Math.floor(Math.random() * 5);
      });
      setInspectResults(results);
      setInspecting(false);
    }, 1200);
  }, [inspectCategories]);

  const testApiConnection = useCallback(() => {
    setApiStatus("testing");
    setTimeout(() => {
      setApiStatus(apiBaseUrl.startsWith("https://") ? "ok" : "error");
    }, 1500);
  }, [apiBaseUrl]);

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs(prev => [...prev, { id: nextLogId(), type, message, timestamp: timestamp() }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([{ id: nextLogId(), type: "info", message: "Console cleared.", timestamp: timestamp() }]);
  }, []);

  const toggleExtension = useCallback((index: number) => {
    setExtensions(prev => prev.map((ext, i) => (i === index ? { ...ext, enabled: !ext.enabled } : ext)));
  }, []);

  /* Insert form into document */
  const handleEmbedForm = useCallback((html: string) => {
    const editor = typeof document !== "undefined" ? document.getElementById("doc-editor") : null;
    if (editor) {
      editor.insertAdjacentHTML("beforeend", html);
      addLog("success", "Form embedded in document.");
    } else {
      addLog("error", "Document editor not found.");
    }
  }, [addLog]);

  /* Insert form control into document */
  const insertControl = useCallback((type: "button" | "checkbox" | "dropdown" | "textinput") => {
    const editor = typeof document !== "undefined" ? document.getElementById("doc-editor") : null;
    if (!editor) { addLog("error", "Document editor not found."); return; }
    const controls: Record<string, string> = {
      button: '&nbsp;<button style="padding:4px 12px;border:1px solid #666;border-radius:4px;background:#333;color:#fff;cursor:pointer;" onclick="alert(\'Button clicked\')">Button</button>&nbsp;',
      checkbox: '&nbsp;<label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" /> Checkbox</label>&nbsp;',
      dropdown: '&nbsp;<select style="padding:4px 8px;border:1px solid #666;border-radius:4px;background:#333;color:#fff;"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select>&nbsp;',
      textinput: '&nbsp;<input type="text" placeholder="Enter text..." style="padding:4px 8px;border:1px solid #666;border-radius:4px;background:#333;color:#fff;" />&nbsp;',
    };
    editor.innerHTML += controls[type];
    addLog("success", `Inserted ${type} control into document.`);
  }, [addLog]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-7xl rounded-t-xl shadow-2xl flex flex-col"
        style={{ background: "var(--card)", border: "1px solid var(--border)", borderBottom: "none", height: "75vh", maxHeight: "800px", color: "var(--foreground)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
          <div className="flex items-center gap-2">
            <Terminal size={16} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-semibold">Developer Mode</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:opacity-80 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex items-center gap-1 px-4 pt-1 overflow-x-auto" style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
          <TabButton label="Macro Editor" icon={<Code size={13} />} active={activeTab === "macro-editor"} onClick={() => setActiveTab("macro-editor")} />
          <TabButton label="Form Designer" icon={<FileEdit size={13} />} active={activeTab === "form-designer"} onClick={() => setActiveTab("form-designer")} />
          <TabButton label="Content Controls" icon={<Type size={13} />} active={activeTab === "content-controls"} onClick={() => setActiveTab("content-controls")} />
          <TabButton label="Add-ins" icon={<Package size={13} />} active={activeTab === "addins"} onClick={() => setActiveTab("addins")} />
          <TabButton label="Extensions" icon={<Puzzle size={13} />} active={activeTab === "extensions"} onClick={() => setActiveTab("extensions")} />
          <TabButton label="Controls" icon={<Settings size={13} />} active={activeTab === "controls"} onClick={() => setActiveTab("controls")} />
          <TabButton label="XML" icon={<FileJson size={13} />} active={activeTab === "xml"} onClick={() => setActiveTab("xml")} />
          <TabButton label="Doc Inspector" icon={<Search size={13} />} active={activeTab === "doc-inspector"} onClick={() => setActiveTab("doc-inspector")} />
          <TabButton label="API Config" icon={<Globe size={13} />} active={activeTab === "api-config"} onClick={() => setActiveTab("api-config")} />
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* ======== MACRO EDITOR ======== */}
          {activeTab === "macro-editor" && (
            <AIMacroEditor logs={logs} addLog={addLog} clearLogs={clearLogs} />
          )}

          {/* ======== FORM DESIGNER ======== */}
          {activeTab === "form-designer" && (
            <FormDesigner onEmbedInDocument={handleEmbedForm} />
          )}

          {/* ======== ADD-INS ======== */}
          {activeTab === "addins" && (
            <AddInsMarketplace />
          )}

          {/* ======== EXTENSIONS ======== */}
          {activeTab === "extensions" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {extensions.map((ext, i) => (
                  <div key={ext.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-3">
                      <Puzzle size={18} style={{ color: ext.enabled ? "var(--primary)" : "var(--muted-foreground)" }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                          {ext.name}
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>v{ext.version}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{ext.description}</div>
                      </div>
                    </div>
                    <button onClick={() => toggleExtension(i)} className="flex-shrink-0 transition-colors" style={{ color: ext.enabled ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {ext.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======== CONTROLS ======== */}
          {activeTab === "controls" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>Insert Custom Control</div>
              <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Click a control to insert it at the end of the document editor.</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {([
                  { type: "button" as const, label: "Button", icon: <LayoutGrid size={16} style={{ color: "var(--primary)" }} /> },
                  { type: "checkbox" as const, label: "Checkbox", icon: <Settings size={16} style={{ color: "var(--primary)" }} /> },
                  { type: "dropdown" as const, label: "Dropdown", icon: <LayoutGrid size={16} style={{ color: "var(--primary)" }} /> },
                  { type: "textinput" as const, label: "Text Input", icon: <FileEdit size={16} style={{ color: "var(--primary)" }} /> },
                ]).map(ctrl => (
                  <button key={ctrl.type} onClick={() => insertControl(ctrl.type)}
                    className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors hover:border-[var(--primary)]"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                    {ctrl.icon} {ctrl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ======== CONTENT CONTROLS ======== */}
          {activeTab === "content-controls" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>Content Controls</div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Insert structured content controls into the document.</p>
                </div>
                <button
                  onClick={() => setDesignMode(d => !d)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                  style={{
                    background: designMode ? "var(--primary)" : "var(--background)",
                    color: designMode ? "var(--primary-foreground)" : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {designMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  Design Mode
                </button>
              </div>

              {designMode && (
                <div className="mb-4 px-3 py-2 rounded text-xs" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)" }}>
                  Design Mode is active. Content controls display their tags for editing.
                </div>
              )}

              <div className="space-y-4">
                {/* Rich Text & Plain Text */}
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Text Controls</div>
                  <div className="grid grid-cols-1 gap-2 max-w-lg">
                    {[
                      { icon: <Type size={15} />, label: "Rich Text Content Control", desc: "Allows formatted text, images, and other content" },
                      { icon: <AlignLeft size={15} />, label: "Plain Text Content Control", desc: "Allows unformatted plain text only" },
                    ].map(ctrl => (
                      <div key={ctrl.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2.5">
                          <span style={{ color: "var(--primary)" }}>{ctrl.icon}</span>
                          <div>
                            <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{ctrl.label}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{ctrl.desc}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => addLog("success", `Inserted ${ctrl.label}.`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
                          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                          <PlusCircle size={11} /> Insert
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Structured Controls */}
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Structured Controls</div>
                  <div className="grid grid-cols-1 gap-2 max-w-lg">
                    {[
                      { icon: <ImageIcon size={15} />, label: "Picture Content Control", desc: "Placeholder for a single image" },
                      { icon: <Building size={15} />, label: "Building Block Gallery", desc: "Insert a gallery of reusable building blocks" },
                      { icon: <ChevronDown size={15} />, label: "Combo Box", desc: "Editable drop-down with custom options" },
                      { icon: <List size={15} />, label: "Drop-Down List", desc: "Non-editable drop-down selection" },
                      { icon: <Calendar size={15} />, label: "Date Picker", desc: "Calendar-based date selection control" },
                      { icon: <CheckSquare size={15} />, label: "Check Box", desc: "Boolean check box content control" },
                    ].map(ctrl => (
                      <div key={ctrl.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2.5">
                          <span style={{ color: "var(--primary)" }}>{ctrl.icon}</span>
                          <div>
                            <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{ctrl.label}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{ctrl.desc}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => addLog("success", `Inserted ${ctrl.label}.`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
                          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                          <PlusCircle size={11} /> Insert
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======== XML ======== */}
          {activeTab === "xml" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* XML Schema Management */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted-foreground)" }}>XML Schema Library</div>
                  <button
                    onClick={() => {
                      const newSchema = { id: String(Date.now()), name: `Schema ${xmlSchemas.length + 1}`, namespace: "http://schemas.example.com/new", valid: true };
                      setXmlSchemas(prev => [...prev, newSchema]);
                      addLog("info", `Added schema: ${newSchema.name}`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    <PlusCircle size={12} /> Add Schema
                  </button>
                </div>
                <div className="space-y-2">
                  {xmlSchemas.map(schema => (
                    <div key={schema.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span style={{ color: schema.valid ? "#22c55e" : "#ef4444", flexShrink: 0 }}>
                          {schema.valid ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{schema.name}</div>
                          <div className="text-[10px] truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{schema.namespace}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: schema.valid ? "color-mix(in srgb, #22c55e 15%, transparent)" : "color-mix(in srgb, #ef4444 15%, transparent)", color: schema.valid ? "#22c55e" : "#ef4444" }}>
                          {schema.valid ? "Valid" : "Invalid"}
                        </span>
                        <button
                          onClick={() => { setXmlSchemas(prev => prev.filter(s => s.id !== schema.id)); addLog("info", `Removed schema: ${schema.name}`); }}
                          className="p-1 rounded hover:opacity-80 transition-opacity"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {xmlSchemas.length === 0 && (
                    <div className="text-xs text-center py-6" style={{ color: "var(--muted-foreground)" }}>No schemas added. Click &ldquo;Add Schema&rdquo; to begin.</div>
                  )}
                </div>
              </div>

              {/* XML Mapping Pane */}
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>XML Mapping Pane</div>
                <div className="rounded-lg p-3" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Map size={14} style={{ color: "var(--primary)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Document XML Structure</span>
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5" style={{ color: "var(--muted-foreground)" }}>
                    <div className="pl-0">&lt;document&gt;</div>
                    <div className="pl-4">&lt;body&gt;</div>
                    <div className="pl-8">&lt;paragraph&gt; &hellip; &lt;/paragraph&gt;</div>
                    <div className="pl-8">&lt;table&gt; &hellip; &lt;/table&gt;</div>
                    <div className="pl-4">&lt;/body&gt;</div>
                    <div className="pl-0">&lt;/document&gt;</div>
                  </div>
                </div>
              </div>

              {/* Expansion Packs */}
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>Expansion Packs</div>
                <div className="space-y-2">
                  {[
                    { name: "Smart Document Pack", version: "1.0.0", attached: true },
                    { name: "Custom Markup Pack", version: "2.1.0", attached: false },
                  ].map(pack => (
                    <div key={pack.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-2.5">
                        <Layers size={14} style={{ color: "var(--primary)" }} />
                        <div>
                          <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{pack.name}</div>
                          <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>v{pack.version}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: pack.attached ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--muted)", color: pack.attached ? "var(--primary)" : "var(--muted-foreground)" }}>
                        {pack.attached ? "Attached" : "Available"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======== DOCUMENT INSPECTOR ======== */}
          {activeTab === "doc-inspector" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>Document Inspector</div>
              <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Check the document for hidden data or personal information before sharing.</p>

              <div className="space-y-2 mb-4 max-w-lg">
                {inspectCategories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                    <input
                      type="checkbox"
                      checked={cat.checked}
                      onChange={() => setInspectCategories(prev => prev.map(c => c.id === cat.id ? { ...c, checked: !c.checked } : c))}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{cat.label}</div>
                      {inspectResults && cat.checked && (
                        <div className="text-[10px] mt-0.5" style={{ color: inspectResults[cat.id] > 0 ? "#f59e0b" : "#22c55e" }}>
                          {inspectResults[cat.id] > 0 ? `${inspectResults[cat.id]} item(s) found` : "No issues found"}
                        </div>
                      )}
                    </div>
                    {inspectResults && cat.checked && (
                      <span style={{ color: inspectResults[cat.id] > 0 ? "#f59e0b" : "#22c55e" }}>
                        {inspectResults[cat.id] > 0 ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <button
                onClick={runInspect}
                disabled={inspecting || inspectCategories.every(c => !c.checked)}
                className="flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-opacity disabled:opacity-50"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Search size={13} />
                {inspecting ? "Inspecting…" : "Inspect Document"}
              </button>

              {inspectResults && !inspecting && (
                <div className="mt-4 p-3 rounded-lg max-w-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>Inspection Complete</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {Object.values(inspectResults).some(v => v > 0)
                      ? `Found potential issues in ${Object.values(inspectResults).filter(v => v > 0).length} category(s). Review items marked above.`
                      : "No issues found. The document appears clean."}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======== API CONFIG ======== */}
          {activeTab === "api-config" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>API Configuration</div>
              <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>Configure the API endpoint settings for document integrations.</p>

              <div className="space-y-4 max-w-md">
                {/* Base URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                    <Globe size={13} style={{ color: "var(--primary)" }} /> Base URL
                  </label>
                  <input
                    type="url"
                    value={apiBaseUrl}
                    onChange={e => { setApiBaseUrl(e.target.value); setApiStatus("idle"); }}
                    className="w-full px-3 py-2 rounded text-xs"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none" }}
                    placeholder="https://api.example.com/v1"
                  />
                </div>

                {/* API Key */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                    <Key size={13} style={{ color: "var(--primary)" }} /> API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className="flex-1 px-3 py-2 rounded text-xs"
                      style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none" }}
                      placeholder="sk-••••••••••••••••"
                    />
                    <button
                      onClick={() => setShowApiKey(v => !v)}
                      className="p-2 rounded transition-colors"
                      style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                      title={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                    <Link size={13} style={{ color: "var(--primary)" }} /> Webhook URL <span className="text-[10px] font-normal" style={{ color: "var(--muted-foreground)" }}>(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded text-xs"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none" }}
                    placeholder="https://hooks.example.com/webhook"
                  />
                </div>

                {/* Test Connection */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={testApiConnection}
                    disabled={apiStatus === "testing" || !apiBaseUrl}
                    className="flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-opacity disabled:opacity-50"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    {apiStatus === "testing" ? (
                      <><Globe size={13} className="animate-spin" /> Testing…</>
                    ) : (
                      <><Link size={13} /> Test Connection</>
                    )}
                  </button>
                  {apiStatus === "ok" && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#22c55e" }}>
                      <CheckCircle size={13} /> Connected successfully
                    </span>
                  )}
                  {apiStatus === "error" && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#ef4444" }}>
                      <AlertCircle size={13} /> Connection failed
                    </span>
                  )}
                </div>

                {/* Save notice */}
                <div className="text-[10px] pt-1" style={{ color: "var(--muted-foreground)" }}>
                  Settings are stored locally in your browser session. API keys are not transmitted unless a connection test is explicitly initiated.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
