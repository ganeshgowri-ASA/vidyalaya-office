"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Code,
  Play,
  Square,
  Terminal,
  Puzzle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  X,
  Circle,
  Settings,
  Trash2,
  Copy,
  MousePointer,
  CheckSquare,
  ChevronDown,
  Type,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DeveloperPanelProps {
  visible: boolean;
  onClose: () => void;
}

type SubTab = "editor" | "recorder" | "console" | "extensions" | "controls";

interface LogEntry {
  id: number;
  type: "success" | "error" | "info";
  message: string;
  timestamp: string;
}

interface RecordedAction {
  id: number;
  action: string;
  timestamp: string;
}

interface Extension {
  name: string;
  version: string;
  enabled: boolean;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AVAILABLE_FUNCTIONS = [
  { name: "Document.getText()", snippet: "Document.getText()" },
  { name: "Document.setText(html)", snippet: 'Document.setText("<p>Hello</p>")' },
  { name: "Document.getSelection()", snippet: "Document.getSelection()" },
  { name: "Document.insertText(text)", snippet: 'Document.insertText("text")' },
  { name: "Document.applyBold()", snippet: "Document.applyBold()" },
  { name: "Document.getWordCount()", snippet: "Document.getWordCount()" },
  { name: "Selection.wrap(tag)", snippet: 'Selection.wrap("strong")' },
  { name: "Format.setFont(name)", snippet: 'Format.setFont("Arial")' },
  { name: "Format.setSize(pt)", snippet: "Format.setSize(14)" },
];

const INITIAL_EXTENSIONS: Extension[] = [
  { name: "Citation Manager", version: "1.2.0", enabled: true, description: "Manage citations and bibliography" },
  { name: "Grammar Checker Pro", version: "2.1.0", enabled: true, description: "Advanced grammar and style checking" },
  { name: "Template Engine", version: "1.0.5", enabled: false, description: "Create and manage document templates" },
  { name: "PDF Export Plus", version: "3.0.1", enabled: true, description: "Enhanced PDF export with options" },
  { name: "Mail Merge Advanced", version: "1.1.0", enabled: false, description: "Advanced mail merge capabilities" },
];

const MOCK_ACTIONS = [
  "Typed text",
  "Applied Bold",
  "Changed font to Arial",
  "Applied Italic",
  "Inserted paragraph break",
  "Changed font size to 14pt",
  "Applied Underline",
  "Pasted content from clipboard",
  "Applied Heading 2 style",
  "Changed text color",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

let logIdCounter = 0;
function nextLogId(): number {
  return ++logIdCounter;
}

/* ------------------------------------------------------------------ */
/*  Sub-tab button                                                     */
/* ------------------------------------------------------------------ */

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap"
      style={{
        background: active ? "var(--card)" : "transparent",
        color: active ? "var(--foreground)" : "var(--muted-foreground)",
        borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DeveloperPanel({ visible, onClose }: DeveloperPanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>("editor");
  const [macroCode, setMacroCode] = useState<string>(
    `// Access the document editor\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const text = editor.innerText;\n  console.log("Word count:", text.split(/\\s+/).filter(Boolean).length);\n}`
  );
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: nextLogId(), type: "info", message: "Developer console initialized.", timestamp: timestamp() },
  ]);
  const [recording, setRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>(INITIAL_EXTENSIONS);

  const logEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Auto-scroll console */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  /* Clean up recording interval on unmount */
  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, []);

  /* ---- Logging helper ---- */
  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [...prev, { id: nextLogId(), type, message, timestamp: timestamp() }]);
  }, []);

  /* ---- Run Macro ---- */
  const runMacro = useCallback(() => {
    addLog("info", "Executing macro...");

    /* Provide a sandboxed Document / Selection / Format API that the macro can call */
    const sandboxGlobals: Record<string, unknown> = {};

    const editorEl = typeof document !== "undefined" ? document.getElementById("doc-editor") : null;

    const DocumentAPI = {
      getText: () => editorEl?.innerText ?? "",
      setText: (html: string) => {
        if (editorEl) editorEl.innerHTML = html;
      },
      getSelection: () => window.getSelection()?.toString() ?? "",
      insertText: (text: string) => {
        if (editorEl) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
          } else {
            editorEl.innerHTML += text;
          }
        }
      },
      applyBold: () => {
        document.execCommand("bold", false);
      },
      getWordCount: () => {
        const t = editorEl?.innerText ?? "";
        return t.split(/\s+/).filter(Boolean).length;
      },
    };

    const SelectionAPI = {
      wrap: (tag: string) => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const wrapper = document.createElement(tag);
          range.surroundContents(wrapper);
        }
      },
    };

    const FormatAPI = {
      setFont: (name: string) => {
        document.execCommand("fontName", false, name);
      },
      setSize: (pt: number) => {
        document.execCommand("fontSize", false, String(Math.min(Math.max(Math.round(pt / 4), 1), 7)));
      },
    };

    sandboxGlobals["Document"] = DocumentAPI;
    sandboxGlobals["Selection"] = SelectionAPI;
    sandboxGlobals["Format"] = FormatAPI;

    /* Capture console.log output */
    const captured: string[] = [];
    const fakeConsole = {
      log: (...args: unknown[]) => captured.push(args.map(String).join(" ")),
      error: (...args: unknown[]) => captured.push("[ERROR] " + args.map(String).join(" ")),
      warn: (...args: unknown[]) => captured.push("[WARN] " + args.map(String).join(" ")),
      info: (...args: unknown[]) => captured.push(args.map(String).join(" ")),
    };

    try {
      const keys = Object.keys(sandboxGlobals);
      const values = Object.values(sandboxGlobals);

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const fn = new Function("console", ...keys, macroCode);
      const result = fn(fakeConsole, ...values);

      if (captured.length > 0) {
        captured.forEach((line) => addLog("success", line));
      }

      if (result !== undefined) {
        addLog("success", `Result: ${String(result)}`);
      }

      if (captured.length === 0 && result === undefined) {
        addLog("success", "Macro executed successfully (no output).");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog("error", `Runtime Error: ${message}`);
    }
  }, [macroCode, addLog]);

  /* ---- Recording ---- */
  const startRecording = useCallback(() => {
    setRecording(true);
    setRecordedActions([]);
    addLog("info", "Macro recording started.");

    let actionIndex = 0;
    recordingInterval.current = setInterval(() => {
      const action = MOCK_ACTIONS[actionIndex % MOCK_ACTIONS.length];
      setRecordedActions((prev) => [
        ...prev,
        { id: nextLogId(), action, timestamp: timestamp() },
      ]);
      actionIndex++;
    }, 2000);
  }, [addLog]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    addLog("info", "Macro recording stopped.");
  }, [addLog]);

  /* ---- Toggle extension ---- */
  const toggleExtension = useCallback((index: number) => {
    setExtensions((prev) =>
      prev.map((ext, i) => (i === index ? { ...ext, enabled: !ext.enabled } : ext))
    );
  }, []);

  /* ---- Insert function snippet ---- */
  const insertSnippet = useCallback((snippet: string) => {
    setMacroCode((prev) => {
      if (textareaRef.current) {
        const el = textareaRef.current;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const before = prev.slice(0, start);
        const after = prev.slice(end);
        const newCode = before + snippet + after;
        // Set cursor position after insertion
        setTimeout(() => {
          el.focus();
          el.selectionStart = el.selectionEnd = start + snippet.length;
        }, 0);
        return newCode;
      }
      return prev + "\n" + snippet;
    });
    setActiveTab("editor");
  }, []);

  /* ---- Insert form control into document ---- */
  const insertControl = useCallback(
    (type: "button" | "checkbox" | "dropdown" | "textinput") => {
      const editor = typeof document !== "undefined" ? document.getElementById("doc-editor") : null;
      if (!editor) {
        addLog("error", "Document editor not found (doc-editor).");
        return;
      }

      let html = "";
      switch (type) {
        case "button":
          html =
            '&nbsp;<button style="padding:4px 12px;border:1px solid #666;border-radius:4px;background:#333;color:#fff;cursor:pointer;" onclick="alert(\'Button clicked\')">Button</button>&nbsp;';
          break;
        case "checkbox":
          html =
            '&nbsp;<label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" /> Checkbox</label>&nbsp;';
          break;
        case "dropdown":
          html =
            '&nbsp;<select style="padding:4px 8px;border:1px solid #666;border-radius:4px;background:#333;color:#fff;"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select>&nbsp;';
          break;
        case "textinput":
          html =
            '&nbsp;<input type="text" placeholder="Enter text..." style="padding:4px 8px;border:1px solid #666;border-radius:4px;background:#333;color:#fff;" />&nbsp;';
          break;
      }

      editor.innerHTML += html;
      addLog("success", `Inserted ${type} control into document.`);
    },
    [addLog]
  );

  /* ---- Clear console ---- */
  const clearConsole = useCallback(() => {
    setLogs([{ id: nextLogId(), type: "info", message: "Console cleared.", timestamp: timestamp() }]);
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  if (!visible) return null;

  const logColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "#4ade80";
      case "error":
        return "#f87171";
      case "info":
        return "#60a5fa";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="w-full max-w-6xl rounded-t-xl shadow-2xl flex flex-col"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderBottom: "none",
          height: "70vh",
          maxHeight: "720px",
          color: "var(--foreground)",
        }}
      >
        {/* ---- Header ---- */}
        <div
          className="flex items-center justify-between px-4 py-2 rounded-t-xl"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}
        >
          <div className="flex items-center gap-2">
            <Terminal size={16} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-semibold">Developer Mode</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-80 transition-opacity"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ---- Sub-tabs ---- */}
        <div
          className="flex items-center gap-1 px-4 pt-1"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}
        >
          <TabButton
            label="Editor"
            icon={<Code size={13} />}
            active={activeTab === "editor"}
            onClick={() => setActiveTab("editor")}
          />
          <TabButton
            label="Recorder"
            icon={<Circle size={13} />}
            active={activeTab === "recorder"}
            onClick={() => setActiveTab("recorder")}
          />
          <TabButton
            label="Console"
            icon={<Terminal size={13} />}
            active={activeTab === "console"}
            onClick={() => setActiveTab("console")}
          />
          <TabButton
            label="Extensions"
            icon={<Puzzle size={13} />}
            active={activeTab === "extensions"}
            onClick={() => setActiveTab("extensions")}
          />
          <TabButton
            label="Controls"
            icon={<Settings size={13} />}
            active={activeTab === "controls"}
            onClick={() => setActiveTab("controls")}
          />
        </div>

        {/* ---- Body ---- */}
        <div className="flex-1 flex overflow-hidden">
          {/* ======== EDITOR TAB ======== */}
          {activeTab === "editor" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Function list sidebar */}
              <div
                className="w-56 flex-shrink-0 overflow-y-auto p-2"
                style={{ borderRight: "1px solid var(--border)", background: "var(--background)" }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider font-semibold mb-2 px-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Functions
                </div>
                {AVAILABLE_FUNCTIONS.map((fn) => (
                  <button
                    key={fn.name}
                    onClick={() => insertSnippet(fn.snippet)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded flex items-center gap-1 transition-colors hover:opacity-90"
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                      color: "var(--foreground)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--muted)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <ChevronRight size={10} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span className="truncate">{fn.name}</span>
                  </button>
                ))}
              </div>

              {/* Editor area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <button
                    onClick={runMacro}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors"
                    style={{
                      background: "var(--primary)",
                      color: "#fff",
                    }}
                  >
                    <Play size={12} />
                    Run Macro
                  </button>
                  <button
                    onClick={() => {
                      if (textareaRef.current) {
                        navigator.clipboard.writeText(macroCode);
                        addLog("info", "Macro code copied to clipboard.");
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <Copy size={11} />
                    Copy
                  </button>
                  <button
                    onClick={() => setMacroCode("")}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <Trash2 size={11} />
                    Clear
                  </button>
                </div>

                {/* Textarea */}
                <div className="flex-1 overflow-hidden relative">
                  <textarea
                    ref={textareaRef}
                    value={macroCode}
                    onChange={(e) => setMacroCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full resize-none p-4 text-sm leading-relaxed outline-none"
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                      background: "#0d1117",
                      color: "#c9d1d9",
                      caretColor: "#58a6ff",
                      tabSize: 2,
                      border: "none",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const el = e.currentTarget;
                        const start = el.selectionStart;
                        const end = el.selectionEnd;
                        const val = el.value;
                        setMacroCode(val.slice(0, start) + "  " + val.slice(end));
                        setTimeout(() => {
                          el.selectionStart = el.selectionEnd = start + 2;
                        }, 0);
                      }
                    }}
                  />
                </div>

                {/* Inline console output */}
                <div
                  className="px-3 py-2 overflow-y-auto"
                  style={{
                    borderTop: "1px solid var(--border)",
                    background: "#0d1117",
                    maxHeight: "120px",
                    minHeight: "40px",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                  }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Output
                  </div>
                  {logs.slice(-5).map((entry) => (
                    <div key={entry.id} className="text-xs flex gap-2" style={{ color: logColor(entry.type) }}>
                      <span style={{ color: "var(--muted-foreground)" }}>[{entry.timestamp}]</span>
                      <span>{entry.message}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* ======== RECORDER TAB ======== */}
          {activeTab === "recorder" && (
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              <div className="flex items-center gap-3 mb-4">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-colors"
                    style={{ background: "#dc2626", color: "#fff" }}
                  >
                    <Circle size={12} fill="currentColor" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-colors"
                    style={{ background: "var(--muted)", color: "var(--foreground)" }}
                  >
                    <Square size={12} fill="currentColor" />
                    Stop Recording
                  </button>
                )}
                {recording && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#dc2626" }}>
                    <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: "#dc2626" }} />
                    Recording...
                  </div>
                )}
              </div>

              <div
                className="flex-1 overflow-y-auto rounded-lg p-3"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                }}
              >
                {recordedActions.length === 0 && (
                  <div
                    className="text-xs text-center py-8"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {recording
                      ? "Waiting for actions..."
                      : "Press Start Recording to begin capturing macro actions."}
                  </div>
                )}
                {recordedActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 py-1.5 text-xs"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <span style={{ color: "var(--muted-foreground)", minWidth: "70px" }}>
                      {action.timestamp}
                    </span>
                    <ChevronRight size={10} style={{ color: "var(--primary)" }} />
                    <span style={{ color: "var(--foreground)" }}>{action.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======== CONSOLE TAB ======== */}
          {activeTab === "console" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                  Developer Console
                </span>
                <button
                  onClick={clearConsole}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <Trash2 size={11} />
                  Clear
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto p-3"
                style={{
                  background: "#0d1117",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                }}
              >
                {logs.map((entry) => (
                  <div key={entry.id} className="flex gap-2 py-0.5 text-xs">
                    <span
                      className="flex-shrink-0"
                      style={{ color: "var(--muted-foreground)", minWidth: "70px" }}
                    >
                      [{entry.timestamp}]
                    </span>
                    <span style={{ color: logColor(entry.type) }}>{entry.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* ======== EXTENSIONS TAB ======== */}
          {activeTab === "extensions" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {extensions.map((ext, i) => (
                  <div
                    key={ext.name}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Puzzle size={18} style={{ color: ext.enabled ? "var(--primary)" : "var(--muted-foreground)" }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                          {ext.name}
                          <span
                            className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "var(--muted)",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            v{ext.version}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {ext.description}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExtension(i)}
                      className="flex-shrink-0 transition-colors"
                      style={{ color: ext.enabled ? "var(--primary)" : "var(--muted-foreground)" }}
                    >
                      {ext.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======== CONTROLS TAB ======== */}
          {activeTab === "controls" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div
                className="text-xs uppercase tracking-wider font-semibold mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Insert Custom Control
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
                Click a control to insert it at the end of the document editor.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  onClick={() => insertControl("button")}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  <MousePointer size={16} style={{ color: "var(--primary)" }} />
                  Button
                </button>
                <button
                  onClick={() => insertControl("checkbox")}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  <CheckSquare size={16} style={{ color: "var(--primary)" }} />
                  Checkbox
                </button>
                <button
                  onClick={() => insertControl("dropdown")}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  <ChevronDown size={16} style={{ color: "var(--primary)" }} />
                  Dropdown
                </button>
                <button
                  onClick={() => insertControl("textinput")}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  <Type size={16} style={{ color: "var(--primary)" }} />
                  Text Input
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
