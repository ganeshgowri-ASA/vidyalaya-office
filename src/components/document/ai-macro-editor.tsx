"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Code, Play, Square, Copy, Trash2, ChevronRight, Circle,
  Save, Upload, Download, Clock, Wand2, BookOpen, Bug,
  RotateCcw, Eye, Search, FolderOpen, Share2, Zap,
  FileCode, List, Variable, Timer, Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LogEntry {
  id: number;
  type: "success" | "error" | "info" | "warn";
  message: string;
  timestamp: string;
}

interface RecordedAction {
  id: number;
  action: string;
  timestamp: string;
}

interface SavedMacro {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  createdAt: string;
}

interface VariableInfo {
  name: string;
  value: string;
  type: string;
}

type EditorSubTab = "code" | "ai-prompt" | "library" | "templates" | "recorder" | "debug" | "variables" | "schedule";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AVAILABLE_FUNCTIONS = [
  { name: "Document.getText()", snippet: "Document.getText()", desc: "Get all text" },
  { name: "Document.setText(html)", snippet: 'Document.setText("<p>Hello</p>")', desc: "Set HTML content" },
  { name: "Document.getSelection()", snippet: "Document.getSelection()", desc: "Get selected text" },
  { name: "Document.insertText(text)", snippet: 'Document.insertText("text")', desc: "Insert text at cursor" },
  { name: "Document.applyBold()", snippet: "Document.applyBold()", desc: "Bold selection" },
  { name: "Document.getWordCount()", snippet: "Document.getWordCount()", desc: "Count words" },
  { name: "Selection.wrap(tag)", snippet: 'Selection.wrap("strong")', desc: "Wrap selection in tag" },
  { name: "Format.setFont(name)", snippet: 'Format.setFont("Arial")', desc: "Change font" },
  { name: "Format.setSize(pt)", snippet: "Format.setSize(14)", desc: "Change font size" },
  { name: "Document.findReplace(find, replace)", snippet: 'Document.findReplace("old", "new")', desc: "Find and replace text" },
  { name: "Document.getHeadings()", snippet: "Document.getHeadings()", desc: "Get all headings" },
  { name: "Format.setColor(hex)", snippet: 'Format.setColor("#ff0000")', desc: "Set text color" },
  { name: "Format.setHighlight(hex)", snippet: 'Format.setHighlight("#ffff00")', desc: "Highlight text" },
  { name: "Document.insertImage(url)", snippet: 'Document.insertImage("https://...")', desc: "Insert image" },
  { name: "Document.createTOC()", snippet: "Document.createTOC()", desc: "Create table of contents" },
];

const PREBUILT_MACROS: SavedMacro[] = [
  {
    id: "format-headings",
    name: "Format All Headings",
    code: `// Format all headings with consistent styling\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const headings = editor.querySelectorAll('h1, h2, h3, h4, h5, h6');\n  headings.forEach(h => {\n    h.style.fontFamily = 'Georgia, serif';\n    h.style.color = '#1a365d';\n    h.style.borderBottom = h.tagName === 'H1' ? '2px solid #3182ce' : 'none';\n    h.style.paddingBottom = h.tagName === 'H1' ? '8px' : '0';\n  });\n  console.log("Formatted " + headings.length + " headings");\n}`,
    description: "Apply consistent formatting to all headings in the document",
    category: "Formatting",
    createdAt: "2024-01-15",
  },
  {
    id: "create-toc",
    name: "Create Table of Contents",
    code: `// Generate a Table of Contents from headings\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const headings = editor.querySelectorAll('h1, h2, h3');\n  let toc = '<div style="border:1px solid #ccc;padding:16px;margin:16px 0;border-radius:8px;background:#f8f9fa;">';\n  toc += '<h3 style="margin:0 0 12px 0;color:#1a365d;">Table of Contents</h3>';\n  headings.forEach((h, i) => {\n    const level = parseInt(h.tagName[1]);\n    const indent = (level - 1) * 20;\n    toc += '<div style="padding:4px 0 4px ' + indent + 'px;font-size:14px;">';\n    toc += '<a href="#toc-' + i + '" style="color:#3182ce;text-decoration:none;">' + h.textContent + '</a></div>';\n    h.id = 'toc-' + i;\n  });\n  toc += '</div>';\n  editor.insertAdjacentHTML('afterbegin', toc);\n  console.log("Created TOC with " + headings.length + " entries");\n}`,
    description: "Auto-generate a clickable table of contents from document headings",
    category: "Navigation",
    createdAt: "2024-01-15",
  },
  {
    id: "batch-find-replace",
    name: "Batch Find & Replace",
    code: `// Batch find and replace - customize the pairs below\nconst replacements = [\n  ["dont", "don't"],\n  ["cant", "can't"],\n  ["wont", "won't"],\n  ["its a", "it's a"],\n  ["  ", " "],  // double spaces\n];\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  let html = editor.innerHTML;\n  let count = 0;\n  replacements.forEach(([find, replace]) => {\n    const regex = new RegExp(find, 'gi');\n    const matches = html.match(regex);\n    if (matches) count += matches.length;\n    html = html.replace(regex, replace);\n  });\n  editor.innerHTML = html;\n  console.log("Made " + count + " replacements");\n}`,
    description: "Run multiple find-and-replace operations at once",
    category: "Editing",
    createdAt: "2024-01-15",
  },
  {
    id: "auto-number-figures",
    name: "Auto-Number Figures",
    code: `// Auto-number all images/figures in document\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const images = editor.querySelectorAll('img');\n  images.forEach((img, i) => {\n    const caption = document.createElement('div');\n    caption.style.cssText = 'text-align:center;font-style:italic;color:#666;font-size:12px;margin:4px 0 16px 0;';\n    caption.textContent = 'Figure ' + (i + 1) + (img.alt ? ': ' + img.alt : '');\n    img.style.display = 'block';\n    img.style.margin = '8px auto';\n    if (img.parentNode) img.parentNode.insertBefore(caption, img.nextSibling);\n  });\n  console.log("Numbered " + images.length + " figures");\n}`,
    description: "Automatically number all figures/images in order",
    category: "Formatting",
    createdAt: "2024-01-15",
  },
  {
    id: "clean-formatting",
    name: "Clean All Formatting",
    code: `// Strip all inline styles and formatting\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const elements = editor.querySelectorAll('*');\n  let cleaned = 0;\n  elements.forEach(el => {\n    if (el.hasAttribute('style')) {\n      el.removeAttribute('style');\n      cleaned++;\n    }\n    if (el.hasAttribute('class') && el.id !== 'doc-editor') {\n      el.removeAttribute('class');\n    }\n  });\n  // Remove empty spans\n  editor.querySelectorAll('span:empty').forEach(s => s.remove());\n  console.log("Cleaned formatting from " + cleaned + " elements");\n}`,
    description: "Remove all inline styles and clean up document formatting",
    category: "Cleanup",
    createdAt: "2024-01-15",
  },
  {
    id: "word-frequency",
    name: "Word Frequency Analysis",
    code: `// Analyze word frequency in the document\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const text = editor.innerText.toLowerCase();\n  const words = text.split(/\\s+/).filter(w => w.length > 3);\n  const freq = {};\n  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });\n  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);\n  console.log("=== Top 20 Words ===");\n  sorted.forEach(([word, count], i) => {\n    console.log((i+1) + ". " + word + ": " + count + " times");\n  });\n}`,
    description: "Show the most frequently used words in the document",
    category: "Analysis",
    createdAt: "2024-01-15",
  },
];

const CODE_TEMPLATES = [
  {
    name: "Loop Through Paragraphs",
    code: `// Iterate through all paragraphs\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const paras = editor.querySelectorAll('p');\n  paras.forEach((p, i) => {\n    // Process each paragraph\n    console.log("Para " + (i+1) + ": " + p.textContent.substring(0, 50));\n  });\n}`,
    category: "Iteration",
  },
  {
    name: "Conditional Formatting",
    code: `// Apply conditional formatting based on content\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const paras = editor.querySelectorAll('p');\n  paras.forEach(p => {\n    const text = p.textContent || '';\n    if (text.includes('TODO')) {\n      p.style.backgroundColor = '#fef3c7';\n      p.style.borderLeft = '4px solid #f59e0b';\n      p.style.paddingLeft = '8px';\n    }\n    if (text.includes('IMPORTANT')) {\n      p.style.backgroundColor = '#fee2e2';\n      p.style.borderLeft = '4px solid #ef4444';\n      p.style.paddingLeft = '8px';\n    }\n  });\n  console.log("Conditional formatting applied");\n}`,
    category: "Formatting",
  },
  {
    name: "Extract & List Links",
    code: `// Find all links in the document\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const links = editor.querySelectorAll('a');\n  if (links.length === 0) {\n    console.log("No links found in document");\n  } else {\n    console.log("Found " + links.length + " links:");\n    links.forEach((a, i) => {\n      console.log((i+1) + ". " + a.textContent + " -> " + a.href);\n    });\n  }\n}`,
    category: "Analysis",
  },
  {
    name: "Document Statistics",
    code: `// Comprehensive document statistics\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const text = editor.innerText;\n  const words = text.split(/\\s+/).filter(Boolean);\n  const sentences = text.split(/[.!?]+/).filter(s => s.trim());\n  const paragraphs = editor.querySelectorAll('p');\n  const headings = editor.querySelectorAll('h1,h2,h3,h4,h5,h6');\n  const images = editor.querySelectorAll('img');\n  const links = editor.querySelectorAll('a');\n  console.log("=== Document Statistics ===");\n  console.log("Characters: " + text.length);\n  console.log("Words: " + words.length);\n  console.log("Sentences: " + sentences.length);\n  console.log("Paragraphs: " + paragraphs.length);\n  console.log("Headings: " + headings.length);\n  console.log("Images: " + images.length);\n  console.log("Links: " + links.length);\n  console.log("Avg words/sentence: " + (words.length / Math.max(sentences.length, 1)).toFixed(1));\n}`,
    category: "Analysis",
  },
  {
    name: "Insert Styled Table",
    code: `// Insert a styled table into the document\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const table = '<table style="width:100%;border-collapse:collapse;margin:16px 0;">' +\n    '<thead><tr style="background:#3182ce;color:white;">' +\n    '<th style="padding:8px;border:1px solid #ddd;">Column 1</th>' +\n    '<th style="padding:8px;border:1px solid #ddd;">Column 2</th>' +\n    '<th style="padding:8px;border:1px solid #ddd;">Column 3</th>' +\n    '</tr></thead><tbody>' +\n    '<tr><td style="padding:8px;border:1px solid #ddd;">Data 1</td>' +\n    '<td style="padding:8px;border:1px solid #ddd;">Data 2</td>' +\n    '<td style="padding:8px;border:1px solid #ddd;">Data 3</td></tr>' +\n    '<tr style="background:#f8f9fa;"><td style="padding:8px;border:1px solid #ddd;">Data 4</td>' +\n    '<td style="padding:8px;border:1px solid #ddd;">Data 5</td>' +\n    '<td style="padding:8px;border:1px solid #ddd;">Data 6</td></tr>' +\n    '</tbody></table>';\n  editor.insertAdjacentHTML('beforeend', table);\n  console.log("Table inserted");\n}`,
    category: "Insertion",
  },
];

const MOCK_ACTIONS = [
  "Typed text", "Applied Bold", "Changed font to Arial", "Applied Italic",
  "Inserted paragraph break", "Changed font size to 14pt", "Applied Underline",
  "Pasted content from clipboard", "Applied Heading 2 style", "Changed text color",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function ts(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

let _logId = 0;
function nid(): number { return ++_logId; }

/* Simple keyword-based syntax highlighting for display overlay */
function highlightCode(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/.*)/g, '<span style="color:#6a9955;">$1</span>')
    .replace(/(["'`])(?:(?!\1).)*\1/g, '<span style="color:#ce9178;">$&</span>')
    .replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|new|try|catch|throw|typeof|instanceof|class|import|export|default|from|async|await)\b/g, '<span style="color:#569cd6;">$1</span>')
    .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span style="color:#569cd6;">$1</span>')
    .replace(/\b(console|document|window|Document|Selection|Format)\b/g, '<span style="color:#4ec9b0;">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#b5cea8;">$1</span>')
    .replace(/\.(log|error|warn|info|getElementById|querySelector|querySelectorAll|forEach|map|filter|replace|split|join|slice|indexOf|includes|length|style|innerHTML|innerText|textContent|insertAdjacentHTML|createElement|appendChild|remove|getAttribute|setAttribute|addEventListener)\b/g, '.<span style="color:#dcdcaa;">$1</span>');
}

/* ------------------------------------------------------------------ */
/*  AI Prompt Mock                                                     */
/* ------------------------------------------------------------------ */

function generateMacroFromPrompt(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("heading") && (p.includes("format") || p.includes("style"))) {
    return PREBUILT_MACROS.find(m => m.id === "format-headings")!.code;
  }
  if (p.includes("table of contents") || p.includes("toc")) {
    return PREBUILT_MACROS.find(m => m.id === "create-toc")!.code;
  }
  if (p.includes("find") && p.includes("replace")) {
    return PREBUILT_MACROS.find(m => m.id === "batch-find-replace")!.code;
  }
  if (p.includes("clean") || p.includes("strip") || p.includes("remove format")) {
    return PREBUILT_MACROS.find(m => m.id === "clean-formatting")!.code;
  }
  if (p.includes("number") && (p.includes("figure") || p.includes("image"))) {
    return PREBUILT_MACROS.find(m => m.id === "auto-number-figures")!.code;
  }
  if (p.includes("word") && (p.includes("count") || p.includes("frequen"))) {
    return PREBUILT_MACROS.find(m => m.id === "word-frequency")!.code;
  }
  if (p.includes("statistic") || p.includes("analyze") || p.includes("analysis")) {
    return CODE_TEMPLATES.find(t => t.name === "Document Statistics")!.code;
  }
  if (p.includes("link") || p.includes("url")) {
    return CODE_TEMPLATES.find(t => t.name === "Extract & List Links")!.code;
  }
  if (p.includes("table") && p.includes("insert")) {
    return CODE_TEMPLATES.find(t => t.name === "Insert Styled Table")!.code;
  }
  // Generic macro generation
  return `// AI-Generated Macro: ${prompt}\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  // Get current document content\n  const content = editor.innerText;\n  const words = content.split(/\\s+/).filter(Boolean);\n  \n  // Perform the requested operation\n  console.log("Processing: ${prompt.replace(/"/g, '\\"')}");\n  console.log("Document has " + words.length + " words");\n  \n  // Apply changes\n  const paragraphs = editor.querySelectorAll('p');\n  paragraphs.forEach((p, i) => {\n    // TODO: Customize this logic for your specific need\n    console.log("Paragraph " + (i+1) + ": " + (p.textContent || '').substring(0, 40) + "...");\n  });\n  \n  console.log("Macro completed successfully");\n}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AIMacroEditorProps {
  logs: LogEntry[];
  addLog: (type: LogEntry["type"], message: string) => void;
  clearLogs: () => void;
}

export function AIMacroEditor({ logs, addLog, clearLogs }: AIMacroEditorProps) {
  const [subTab, setSubTab] = useState<EditorSubTab>("code");
  const [macroCode, setMacroCode] = useState(
    `// Access the document editor\nconst editor = document.getElementById('doc-editor');\nif (editor) {\n  const text = editor.innerText;\n  console.log("Word count:", text.split(/\\s+/).filter(Boolean).length);\n}`
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [savedMacros, setSavedMacros] = useState<SavedMacro[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [macroName, setMacroName] = useState("Untitled Macro");
  const [searchFilter, setSearchFilter] = useState("");
  const [scheduledMacros, setScheduledMacros] = useState<{ name: string; interval: number; active: boolean }[]>([]);
  const [scheduleInterval, setScheduleInterval] = useState(60);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (recordingInterval.current) clearInterval(recordingInterval.current); };
  }, []);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  /* ---- Run Macro ---- */
  const runMacro = useCallback(() => {
    // Save undo state
    const editorEl = typeof document !== "undefined" ? document.getElementById("doc-editor") : null;
    if (editorEl) {
      setUndoStack(prev => [...prev.slice(-9), editorEl.innerHTML]);
    }

    addLog("info", "Executing macro...");
    const sandboxGlobals: Record<string, unknown> = {};
    const DocumentAPI = {
      getText: () => editorEl?.innerText ?? "",
      setText: (html: string) => { if (editorEl) editorEl.innerHTML = html; },
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
      applyBold: () => { document.execCommand("bold", false); },
      getWordCount: () => (editorEl?.innerText ?? "").split(/\s+/).filter(Boolean).length,
      findReplace: (find: string, replace: string) => {
        if (editorEl) {
          const regex = new RegExp(find, "gi");
          const matches = editorEl.innerHTML.match(regex);
          editorEl.innerHTML = editorEl.innerHTML.replace(regex, replace);
          return matches ? matches.length : 0;
        }
        return 0;
      },
      getHeadings: () => {
        if (!editorEl) return [];
        const hs = editorEl.querySelectorAll("h1,h2,h3,h4,h5,h6");
        return Array.from(hs).map(h => ({ level: parseInt(h.tagName[1]), text: h.textContent }));
      },
      insertImage: (url: string) => {
        if (editorEl) editorEl.insertAdjacentHTML("beforeend", `<img src="${url}" style="max-width:100%;margin:8px 0;" />`);
      },
      createTOC: () => {
        if (!editorEl) return;
        const headings = editorEl.querySelectorAll("h1,h2,h3");
        let toc = '<div style="border:1px solid #ccc;padding:16px;margin:16px 0;border-radius:8px;"><h3>Table of Contents</h3>';
        headings.forEach((h, i) => {
          const level = parseInt(h.tagName[1]);
          toc += `<div style="padding-left:${(level-1)*20}px;margin:4px 0;"><a href="#toc-${i}">${h.textContent}</a></div>`;
          h.id = `toc-${i}`;
        });
        toc += "</div>";
        editorEl.insertAdjacentHTML("afterbegin", toc);
      },
    };
    const SelectionAPI = {
      wrap: (tag: string) => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) { const range = sel.getRangeAt(0); const wrapper = document.createElement(tag); range.surroundContents(wrapper); }
      },
    };
    const FormatAPI = {
      setFont: (name: string) => { document.execCommand("fontName", false, name); },
      setSize: (pt: number) => { document.execCommand("fontSize", false, String(Math.min(Math.max(Math.round(pt / 4), 1), 7))); },
      setColor: (hex: string) => { document.execCommand("foreColor", false, hex); },
      setHighlight: (hex: string) => { document.execCommand("hiliteColor", false, hex); },
    };
    sandboxGlobals["Document"] = DocumentAPI;
    sandboxGlobals["Selection"] = SelectionAPI;
    sandboxGlobals["Format"] = FormatAPI;

    const captured: string[] = [];
    const capturedVars: VariableInfo[] = [];
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
      if (captured.length > 0) captured.forEach(line => addLog("success", line));
      if (result !== undefined) {
        addLog("success", `Result: ${String(result)}`);
        capturedVars.push({ name: "result", value: String(result), type: typeof result });
      }
      if (captured.length === 0 && result === undefined) addLog("success", "Macro executed successfully (no output).");
      setVariables(capturedVars);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog("error", `Runtime Error: ${message}`);
    }
  }, [macroCode, addLog]);

  /* ---- Undo macro effects ---- */
  const undoMacro = useCallback(() => {
    if (undoStack.length === 0) { addLog("warn", "No macro effects to undo."); return; }
    const editorEl = document.getElementById("doc-editor");
    if (editorEl) {
      editorEl.innerHTML = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      addLog("info", "Rolled back last macro effect.");
    }
  }, [undoStack, addLog]);

  /* ---- AI Generate ---- */
  const handleAIGenerate = useCallback(() => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    addLog("info", `AI generating macro for: "${aiPrompt}"`);
    setTimeout(() => {
      const code = generateMacroFromPrompt(aiPrompt);
      setMacroCode(code);
      setAiGenerating(false);
      addLog("success", "AI macro generated. Switch to Code tab to review and run.");
      setSubTab("code");
    }, 1200);
  }, [aiPrompt, addLog]);

  /* ---- Save / Load ---- */
  const saveMacro = useCallback(() => {
    const macro: SavedMacro = {
      id: `macro-${Date.now()}`,
      name: macroName,
      code: macroCode,
      description: "",
      category: "Custom",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSavedMacros(prev => [...prev, macro]);
    addLog("success", `Macro "${macroName}" saved to library.`);
  }, [macroName, macroCode, addLog]);

  const loadMacro = useCallback((macro: SavedMacro) => {
    setMacroCode(macro.code);
    setMacroName(macro.name);
    setSubTab("code");
    addLog("info", `Loaded macro: ${macro.name}`);
  }, [addLog]);

  /* ---- Export / Import ---- */
  const exportMacro = useCallback(() => {
    const blob = new Blob([JSON.stringify({ name: macroName, code: macroCode }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${macroName.replace(/\s+/g, "_")}.json`; a.click();
    URL.revokeObjectURL(url);
    addLog("info", "Macro exported as JSON.");
  }, [macroName, macroCode, addLog]);

  const importMacro = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.code) { setMacroCode(data.code); setMacroName(data.name || "Imported Macro"); addLog("success", "Macro imported successfully."); }
        } catch { addLog("error", "Invalid macro file."); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addLog]);

  /* ---- Recording ---- */
  const startRecording = useCallback(() => {
    setRecording(true);
    setRecordedActions([]);
    addLog("info", "Macro recording started.");
    let idx = 0;
    recordingInterval.current = setInterval(() => {
      const action = MOCK_ACTIONS[idx % MOCK_ACTIONS.length];
      setRecordedActions(prev => [...prev, { id: nid(), action, timestamp: ts() }]);
      idx++;
    }, 2000);
  }, [addLog]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    if (recordingInterval.current) { clearInterval(recordingInterval.current); recordingInterval.current = null; }
    addLog("info", "Macro recording stopped. Actions captured.");
  }, [addLog]);

  const generateCodeFromRecording = useCallback(() => {
    if (recordedActions.length === 0) return;
    const lines = recordedActions.map(a => {
      if (a.action.includes("Bold")) return 'Document.applyBold();';
      if (a.action.includes("font to")) return `Format.setFont("${a.action.split("font to ")[1] || "Arial"}");`;
      if (a.action.includes("font size")) return `Format.setSize(${a.action.match(/\d+/)?.[0] || "12"});`;
      if (a.action.includes("Typed")) return `Document.insertText("sample text");`;
      if (a.action.includes("Italic")) return 'document.execCommand("italic", false);';
      if (a.action.includes("Underline")) return 'document.execCommand("underline", false);';
      return `// ${a.action}`;
    });
    const code = `// Auto-generated from recorded actions\n${lines.join("\n")}\nconsole.log("Recorded macro executed");`;
    setMacroCode(code);
    setSubTab("code");
    addLog("info", "Generated code from recorded actions.");
  }, [recordedActions, addLog]);

  /* ---- Schedule ---- */
  const addSchedule = useCallback(() => {
    setScheduledMacros(prev => [...prev, { name: macroName, interval: scheduleInterval, active: false }]);
    addLog("info", `Scheduled "${macroName}" every ${scheduleInterval}s (simulated).`);
  }, [macroName, scheduleInterval, addLog]);

  /* ---- Insert snippet ---- */
  const insertSnippet = useCallback((snippet: string) => {
    setMacroCode(prev => {
      if (textareaRef.current) {
        const el = textareaRef.current;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newCode = prev.slice(0, start) + snippet + prev.slice(end);
        setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + snippet.length; }, 0);
        return newCode;
      }
      return prev + "\n" + snippet;
    });
    setSubTab("code");
  }, []);

  const allMacros = [...PREBUILT_MACROS, ...savedMacros];
  const filteredMacros = searchFilter
    ? allMacros.filter(m => m.name.toLowerCase().includes(searchFilter.toLowerCase()) || m.category.toLowerCase().includes(searchFilter.toLowerCase()))
    : allMacros;

  const logColor = (type: LogEntry["type"]) => {
    switch (type) { case "success": return "#4ade80"; case "error": return "#f87171"; case "warn": return "#fbbf24"; default: return "#60a5fa"; }
  };

  const tabItems: { key: EditorSubTab; label: string; icon: React.ReactNode }[] = [
    { key: "code", label: "Code", icon: <Code size={12} /> },
    { key: "ai-prompt", label: "AI Prompt", icon: <Wand2 size={12} /> },
    { key: "library", label: "Library", icon: <BookOpen size={12} /> },
    { key: "templates", label: "Templates", icon: <FileCode size={12} /> },
    { key: "recorder", label: "Recorder", icon: <Circle size={12} /> },
    { key: "debug", label: "Debug", icon: <Bug size={12} /> },
    { key: "variables", label: "Variables", icon: <Variable size={12} /> },
    { key: "schedule", label: "Schedule", icon: <Timer size={12} /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-navigation */}
      <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto flex-shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
        {tabItems.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap"
            style={{ background: subTab === t.key ? "var(--card)" : "transparent", color: subTab === t.key ? "var(--foreground)" : "var(--muted-foreground)", border: subTab === t.key ? "1px solid var(--border)" : "1px solid transparent" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ======== CODE TAB ======== */}
      {subTab === "code" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Functions sidebar */}
          <div className="w-52 flex-shrink-0 overflow-y-auto p-2" style={{ borderRight: "1px solid var(--border)", background: "var(--background)" }}>
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-2 px-1" style={{ color: "var(--muted-foreground)" }}>API Functions</div>
            {AVAILABLE_FUNCTIONS.map(fn => (
              <button key={fn.name} onClick={() => insertSnippet(fn.snippet)}
                className="w-full text-left text-[11px] px-2 py-1 rounded flex items-center gap-1 transition-colors hover:bg-[var(--muted)]"
                style={{ fontFamily: "monospace", color: "var(--foreground)" }} title={fn.desc}>
                <ChevronRight size={9} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span className="truncate">{fn.name}</span>
              </button>
            ))}
          </div>
          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
              <input value={macroName} onChange={e => setMacroName(e.target.value)} className="text-xs px-2 py-1 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)", width: "140px" }} />
              <button onClick={runMacro} className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded" style={{ background: "var(--primary)", color: "#fff" }}>
                <Play size={11} /> Run
              </button>
              <button onClick={undoMacro} className="flex items-center gap-1 px-2 py-1 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }} title="Undo macro effects">
                <RotateCcw size={11} /> Rollback
              </button>
              <button onClick={saveMacro} className="flex items-center gap-1 px-2 py-1 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <Save size={11} /> Save
              </button>
              <button onClick={() => navigator.clipboard.writeText(macroCode)} className="flex items-center gap-1 px-2 py-1 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <Copy size={11} /> Copy
              </button>
              <button onClick={exportMacro} className="flex items-center gap-1 px-2 py-1 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }} title="Export macro">
                <Share2 size={11} /> Export
              </button>
              <button onClick={importMacro} className="flex items-center gap-1 px-2 py-1 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }} title="Import macro">
                <Upload size={11} /> Import
              </button>
              <button onClick={() => setMacroCode("")} className="flex items-center gap-1 px-2 py-1 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <Trash2 size={11} /> Clear
              </button>
            </div>
            {/* Code area with syntax highlighting */}
            <div className="flex-1 overflow-hidden relative">
              <pre ref={highlightRef} aria-hidden className="absolute inset-0 p-4 text-sm leading-relaxed overflow-auto pointer-events-none m-0"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", background: "#0d1117", color: "#c9d1d9", tabSize: 2, whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: highlightCode(macroCode) + "\n" }} />
              <textarea ref={textareaRef} value={macroCode} onChange={e => setMacroCode(e.target.value)} spellCheck={false}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full resize-none p-4 text-sm leading-relaxed outline-none"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", background: "transparent", color: "transparent", caretColor: "#58a6ff", tabSize: 2, WebkitTextFillColor: "transparent" }}
                onKeyDown={e => {
                  if (e.key === "Tab") { e.preventDefault(); const el = e.currentTarget; const s = el.selectionStart; const end = el.selectionEnd; setMacroCode(macroCode.slice(0, s) + "  " + macroCode.slice(end)); setTimeout(() => { el.selectionStart = el.selectionEnd = s + 2; }, 0); }
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runMacro(); }
                }} />
            </div>
            {/* Output */}
            <div className="px-3 py-2 overflow-y-auto" style={{ borderTop: "1px solid var(--border)", background: "#0d1117", maxHeight: "100px", minHeight: "36px", fontFamily: "monospace" }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>Output</div>
              {logs.slice(-5).map(entry => (
                <div key={entry.id} className="text-xs flex gap-2" style={{ color: logColor(entry.type) }}>
                  <span style={{ color: "var(--muted-foreground)" }}>[{entry.timestamp}]</span>
                  <span>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======== AI PROMPT TAB ======== */}
      {subTab === "ai-prompt" && (
        <div className="flex-1 flex flex-col p-4 overflow-auto">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 size={18} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Prompt-to-Code</span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Describe what you want the macro to do in natural language, and AI will generate the code.</p>
          <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., Format all headings with blue color and add a table of contents at the top..."
            className="w-full h-32 resize-none rounded-lg p-3 text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
          <div className="flex items-center gap-2 mt-3">
            <button onClick={handleAIGenerate} disabled={aiGenerating || !aiPrompt.trim()} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ background: "var(--primary)", color: "#fff" }}>
              {aiGenerating ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Zap size={13} /> Generate Macro</>}
            </button>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Try these prompts:</div>
            <div className="flex flex-wrap gap-2">
              {["Format all headings consistently", "Create a table of contents", "Find and replace common typos", "Clean all formatting from document", "Auto-number all figures", "Show word frequency analysis", "Insert a styled table", "Extract all links"].map(p => (
                <button key={p} onClick={() => setAiPrompt(p)} className="text-[11px] px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======== LIBRARY TAB ======== */}
      {subTab === "library" && (
        <div className="flex-1 flex flex-col p-4 overflow-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
              <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Search macros..." className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredMacros.map(macro => (
              <div key={macro.id} className="p-3 rounded-lg transition-colors" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{macro.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{macro.category}</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: "var(--muted-foreground)" }}>{macro.description}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => loadMacro(macro)} className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--primary)", color: "#fff" }}>Load</button>
                  <button onClick={() => { loadMacro(macro); setTimeout(runMacro, 100); }} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Run</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======== TEMPLATES TAB ======== */}
      {subTab === "templates" && (
        <div className="flex-1 flex flex-col p-4 overflow-auto">
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Code Templates</div>
          <div className="space-y-2">
            {CODE_TEMPLATES.map(tpl => (
              <div key={tpl.name} className="p-3 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{tpl.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{tpl.category}</span>
                </div>
                <pre className="text-[10px] leading-tight overflow-x-auto p-2 rounded mt-1 mb-2" style={{ background: "#0d1117", color: "#8b949e", maxHeight: "60px" }}>{tpl.code.split("\n").slice(0, 4).join("\n")}...</pre>
                <button onClick={() => { setMacroCode(tpl.code); setSubTab("code"); addLog("info", `Loaded template: ${tpl.name}`); }} className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--primary)", color: "#fff" }}>Use Template</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======== RECORDER TAB ======== */}
      {subTab === "recorder" && (
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex items-center gap-3 mb-4">
            {!recording ? (
              <button onClick={startRecording} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded" style={{ background: "#dc2626", color: "#fff" }}>
                <Circle size={12} fill="currentColor" /> Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                <Square size={12} fill="currentColor" /> Stop Recording
              </button>
            )}
            {recording && <div className="flex items-center gap-1.5 text-xs" style={{ color: "#dc2626" }}><span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: "#dc2626" }} /> Recording...</div>}
            {recordedActions.length > 0 && !recording && (
              <button onClick={generateCodeFromRecording} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded" style={{ background: "var(--primary)", color: "#fff" }}>
                <Code size={12} /> Generate Code
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto rounded-lg p-3" style={{ background: "var(--background)", border: "1px solid var(--border)", fontFamily: "monospace" }}>
            {recordedActions.length === 0 && <div className="text-xs text-center py-8" style={{ color: "var(--muted-foreground)" }}>{recording ? "Waiting for actions..." : "Press Start Recording to begin."}</div>}
            {recordedActions.map(action => (
              <div key={action.id} className="flex items-center gap-3 py-1.5 text-xs" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted-foreground)", minWidth: "70px" }}>{action.timestamp}</span>
                <ChevronRight size={10} style={{ color: "var(--primary)" }} />
                <span style={{ color: "var(--foreground)" }}>{action.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======== DEBUG TAB ======== */}
      {subTab === "debug" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Debug Console</span>
            <button onClick={clearLogs} className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <Trash2 size={11} /> Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3" style={{ background: "#0d1117", fontFamily: "monospace" }}>
            {logs.map(entry => (
              <div key={entry.id} className="flex gap-2 py-0.5 text-xs">
                <span className="flex-shrink-0" style={{ color: "var(--muted-foreground)", minWidth: "70px" }}>[{entry.timestamp}]</span>
                <span style={{ color: logColor(entry.type) }}>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======== VARIABLES TAB ======== */}
      {subTab === "variables" && (
        <div className="flex-1 p-4 overflow-auto">
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Variable Explorer</div>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Variables captured from the last macro execution.</p>
          {variables.length === 0 ? (
            <div className="text-xs text-center py-8 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              No variables captured. Run a macro that returns values.
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-3 text-[10px] font-semibold uppercase px-3 py-2" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                <span>Name</span><span>Type</span><span>Value</span>
              </div>
              {variables.map((v, i) => (
                <div key={i} className="grid grid-cols-3 text-xs px-3 py-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span style={{ color: "#4ec9b0", fontFamily: "monospace" }}>{v.name}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{v.type}</span>
                  <span style={{ color: "var(--foreground)", fontFamily: "monospace" }}>{v.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======== SCHEDULE TAB ======== */}
      {subTab === "schedule" && (
        <div className="flex-1 p-4 overflow-auto">
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Schedule Macro Execution</div>
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Current macro:</span>
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{macroName}</span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>every</span>
            <input type="number" value={scheduleInterval} onChange={e => setScheduleInterval(parseInt(e.target.value) || 60)} min={5} className="w-16 text-xs px-2 py-1 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>seconds</span>
            <button onClick={addSchedule} className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded" style={{ background: "var(--primary)", color: "#fff" }}>
              <Clock size={11} /> Schedule
            </button>
          </div>
          {scheduledMacros.length === 0 ? (
            <div className="text-xs text-center py-8 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>No scheduled macros.</div>
          ) : (
            <div className="space-y-2">
              {scheduledMacros.map((sm, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div>
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{sm.name}</span>
                    <span className="text-[10px] ml-2" style={{ color: "var(--muted-foreground)" }}>every {sm.interval}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: sm.active ? "#16a34a22" : "var(--muted)", color: sm.active ? "#16a34a" : "var(--muted-foreground)" }}>{sm.active ? "Active" : "Paused"}</span>
                    <button onClick={() => setScheduledMacros(prev => prev.map((s, j) => j === i ? { ...s, active: !s.active } : s))} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      {sm.active ? "Pause" : "Start"}
                    </button>
                    <button onClick={() => setScheduledMacros(prev => prev.filter((_, j) => j !== i))} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: "var(--border)", color: "#f87171" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
