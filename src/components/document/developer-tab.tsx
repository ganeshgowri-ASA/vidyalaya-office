"use client";

import React, { useState, useCallback } from "react";
import {
  Code, Terminal, Puzzle, Settings, X, ToggleLeft, ToggleRight,
  LayoutGrid, FileEdit, Package,
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

type MainTab = "macro-editor" | "form-designer" | "addins" | "extensions" | "controls";

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
        <div className="flex items-center gap-1 px-4 pt-1" style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
          <TabButton label="Macro Editor" icon={<Code size={13} />} active={activeTab === "macro-editor"} onClick={() => setActiveTab("macro-editor")} />
          <TabButton label="Form Designer" icon={<FileEdit size={13} />} active={activeTab === "form-designer"} onClick={() => setActiveTab("form-designer")} />
          <TabButton label="Add-ins" icon={<Package size={13} />} active={activeTab === "addins"} onClick={() => setActiveTab("addins")} />
          <TabButton label="Extensions" icon={<Puzzle size={13} />} active={activeTab === "extensions"} onClick={() => setActiveTab("extensions")} />
          <TabButton label="Controls" icon={<Settings size={13} />} active={activeTab === "controls"} onClick={() => setActiveTab("controls")} />
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
        </div>
      </div>
    </div>
  );
}
