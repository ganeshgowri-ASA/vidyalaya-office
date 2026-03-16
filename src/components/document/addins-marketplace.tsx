"use client";

import React, { useState, useCallback } from "react";
import {
  Cloud, QrCode, BarChart3, FileText, Palette, ArrowLeftRight, Hash,
  Mail, BookOpen, Shield, Volume2, Mic, GitCompare, Clock, Clipboard,
  Download, Settings, Search, ToggleLeft, ToggleRight, X, Puzzle,
  ChevronRight, Star, Loader2, Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AddIn {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  version: string;
  author: string;
  installed: boolean;
  rating: number;
  hasSettings: boolean;
}

type MarketplaceView = "browse" | "installed" | "active-addin";

/* ------------------------------------------------------------------ */
/*  Built-in Add-ins                                                   */
/* ------------------------------------------------------------------ */

const BUILTIN_ADDINS: Omit<AddIn, "installed">[] = [
  { id: "word-cloud", name: "Word Cloud Generator", description: "Generate a visual word cloud from your document text. Highlights most frequent words with larger sizes.", icon: <Cloud size={20} />, category: "Analysis", version: "1.0.0", author: "Vidyalaya", rating: 4.5, hasSettings: true },
  { id: "qr-code", name: "QR Code Generator", description: "Create QR codes from text, URLs, or selected content and insert them into your document.", icon: <QrCode size={20} />, category: "Utilities", version: "1.2.0", author: "Vidyalaya", rating: 4.7, hasSettings: true },
  { id: "barcode", name: "Barcode Generator", description: "Generate various barcode formats (Code128, EAN, UPC) for product labels and inventory.", icon: <BarChart3 size={20} />, category: "Utilities", version: "1.0.0", author: "Vidyalaya", rating: 4.3, hasSettings: true },
  { id: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Insert placeholder text (Lorem Ipsum) in various lengths - paragraphs, sentences, or words.", icon: <FileText size={20} />, category: "Content", version: "1.1.0", author: "Vidyalaya", rating: 4.6, hasSettings: true },
  { id: "color-palette", name: "Color Palette Picker", description: "Browse and apply professional color palettes to your document elements.", icon: <Palette size={20} />, category: "Design", version: "1.0.0", author: "Vidyalaya", rating: 4.4, hasSettings: false },
  { id: "unit-converter", name: "Unit Converter", description: "Convert between units of measurement - length, weight, temperature, currency, and more.", icon: <ArrowLeftRight size={20} />, category: "Utilities", version: "1.0.0", author: "Vidyalaya", rating: 4.2, hasSettings: false },
  { id: "char-map", name: "Character Map", description: "Browse and insert special characters, emojis, mathematical symbols, and Unicode characters.", icon: <Hash size={20} />, category: "Content", version: "1.3.0", author: "Vidyalaya", rating: 4.8, hasSettings: false },
  { id: "mail-merge", name: "Mail Merge Helper", description: "Create personalized documents by merging template fields with data from CSV or JSON files.", icon: <Mail size={20} />, category: "Productivity", version: "1.0.0", author: "Vidyalaya", rating: 4.1, hasSettings: true },
  { id: "readability", name: "Readability Score", description: "Calculate Flesch-Kincaid, Gunning Fog, and other readability scores for your document.", icon: <BookOpen size={20} />, category: "Analysis", version: "1.0.0", author: "Vidyalaya", rating: 4.5, hasSettings: false },
  { id: "plagiarism", name: "Plagiarism Checker", description: "Check your document for potential plagiarism against online sources (placeholder).", icon: <Shield size={20} />, category: "Analysis", version: "0.9.0", author: "Vidyalaya", rating: 3.8, hasSettings: true },
  { id: "tts", name: "Text-to-Speech", description: "Convert document text to speech using browser's speech synthesis API.", icon: <Volume2 size={20} />, category: "Accessibility", version: "1.0.0", author: "Vidyalaya", rating: 4.0, hasSettings: true },
  { id: "vtt", name: "Voice-to-Text", description: "Dictate text using your microphone and insert it into the document (placeholder).", icon: <Mic size={20} />, category: "Accessibility", version: "0.8.0", author: "Vidyalaya", rating: 3.9, hasSettings: true },
  { id: "doc-compare", name: "Document Comparison", description: "Compare two versions of text side-by-side with highlighted differences (diff view).", icon: <GitCompare size={20} />, category: "Productivity", version: "1.1.0", author: "Vidyalaya", rating: 4.6, hasSettings: false },
  { id: "auto-save", name: "Auto-Save History", description: "View and restore previous auto-saved versions of your document.", icon: <Clock size={20} />, category: "Productivity", version: "1.0.0", author: "Vidyalaya", rating: 4.7, hasSettings: true },
  { id: "clipboard-mgr", name: "Clipboard Manager", description: "Store multiple clipboard entries and paste from history. Supports text and formatted content.", icon: <Clipboard size={20} />, category: "Productivity", version: "1.0.0", author: "Vidyalaya", rating: 4.4, hasSettings: false },
];

const CATEGORIES = ["All", "Productivity", "Analysis", "Utilities", "Content", "Design", "Accessibility"];

/* ------------------------------------------------------------------ */
/*  Add-in execution panels                                            */
/* ------------------------------------------------------------------ */

function WordCloudPanel() {
  const [words, setWords] = useState<{ text: string; size: number; color: string }[]>([]);
  const colors = ["#3182ce", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#319795", "#d53f8c"];
  const generate = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const text = editor.innerText.toLowerCase();
    const freq: Record<string, number> = {};
    text.split(/\s+/).filter(w => w.length > 3).forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 40);
    const maxCount = sorted[0]?.[1] || 1;
    setWords(sorted.map(([t, c], i) => ({ text: t, size: Math.max(12, Math.round((c / maxCount) * 36)), color: colors[i % colors.length] })));
  };
  return (
    <div className="p-3">
      <button onClick={generate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded mb-3" style={{ background: "var(--primary)", color: "#fff" }}><Cloud size={12} /> Generate Word Cloud</button>
      {words.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-lg items-center justify-center" style={{ background: "var(--background)", border: "1px solid var(--border)", minHeight: "150px" }}>
          {words.map((w, i) => <span key={i} style={{ fontSize: `${w.size}px`, color: w.color, fontWeight: w.size > 20 ? 700 : 400, lineHeight: 1.2 }}>{w.text}</span>)}
        </div>
      )}
    </div>
  );
}

function QRCodePanel() {
  const [text, setText] = useState("");
  const [generated, setGenerated] = useState(false);
  const generate = () => { if (text.trim()) setGenerated(true); };
  const insert = () => {
    const editor = document.getElementById("doc-editor");
    if (editor && generated) {
      editor.insertAdjacentHTML("beforeend", `<div style="text-align:center;margin:16px 0;padding:16px;border:1px solid #ddd;display:inline-block;"><div style="width:120px;height:120px;background:#fff;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:10px;font-family:monospace;word-break:break-all;padding:8px;">[QR: ${text.substring(0, 30)}]</div><div style="font-size:10px;margin-top:4px;color:#666;">QR Code</div></div>`);
    }
  };
  return (
    <div className="p-3">
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter text or URL..." className="w-full text-xs px-3 py-1.5 rounded border outline-none mb-2 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
      <div className="flex gap-2">
        <button onClick={generate} disabled={!text.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded disabled:opacity-50" style={{ background: "var(--primary)", color: "#fff" }}><QrCode size={12} /> Generate</button>
        {generated && <button onClick={insert} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Insert in Document</button>}
      </div>
      {generated && (
        <div className="mt-3 flex justify-center">
          <div className="w-32 h-32 rounded flex items-center justify-center" style={{ background: "#fff", border: "2px solid #000" }}>
            <div className="text-[8px] font-mono text-black text-center p-2 break-all">[QR Code Placeholder]<br />{text.substring(0, 40)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function BarcodePanel() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("code128");
  const [generated, setGenerated] = useState(false);
  return (
    <div className="p-3">
      <div className="flex gap-2 mb-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter barcode data..." className="flex-1 text-xs px-3 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
        <select value={format} onChange={e => setFormat(e.target.value)} className="text-xs px-2 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="code128">Code 128</option><option value="ean13">EAN-13</option><option value="upc">UPC-A</option><option value="code39">Code 39</option>
        </select>
      </div>
      <button onClick={() => { if (text.trim()) setGenerated(true); }} disabled={!text.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded disabled:opacity-50" style={{ background: "var(--primary)", color: "#fff" }}><BarChart3 size={12} /> Generate</button>
      {generated && (
        <div className="mt-3 text-center">
          <div className="inline-block px-6 py-3 rounded" style={{ background: "#fff", border: "1px solid #ddd" }}>
            <div className="flex gap-px justify-center mb-1">{Array.from({ length: 30 }, (_, i) => <div key={i} style={{ width: Math.random() > 0.5 ? "2px" : "1px", height: "50px", background: Math.random() > 0.2 ? "#000" : "#fff" }} />)}</div>
            <div className="text-xs font-mono text-black">{text}</div>
            <div className="text-[9px] text-gray-500 mt-1">{format.toUpperCase()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoremIpsumPanel() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  const sentences = lorem.split(". ").map(s => s.endsWith(".") ? s : s + ".");
  const words = lorem.split(/\s+/);

  const generate = () => {
    let text = "";
    if (unit === "paragraphs") { text = Array.from({ length: count }, () => `<p>${lorem}</p>`).join(""); }
    else if (unit === "sentences") { text = `<p>${Array.from({ length: count }, (_, i) => sentences[i % sentences.length]).join(" ")}</p>`; }
    else { text = `<p>${words.slice(0, count).join(" ")}.</p>`; }
    const editor = document.getElementById("doc-editor");
    if (editor) editor.insertAdjacentHTML("beforeend", text);
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <input type="number" value={count} onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={100} className="w-16 text-xs px-2 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
        <select value={unit} onChange={e => setUnit(e.target.value as typeof unit)} className="text-xs px-2 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option>
        </select>
        <button onClick={generate} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded" style={{ background: "var(--primary)", color: "#fff" }}><FileText size={12} /> Insert</button>
      </div>
      <div className="text-xs rounded p-3" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)", maxHeight: "100px", overflow: "auto" }}>
        {lorem.substring(0, 200)}...
      </div>
    </div>
  );
}

function ColorPalettePanel() {
  const palettes = [
    { name: "Ocean", colors: ["#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#023e8a"] },
    { name: "Sunset", colors: ["#ff6b6b", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"] },
    { name: "Forest", colors: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2"] },
    { name: "Monochrome", colors: ["#212529", "#495057", "#6c757d", "#adb5bd", "#dee2e6"] },
    { name: "Pastel", colors: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#a0c4ff"] },
    { name: "Professional", colors: ["#1a365d", "#2b6cb0", "#3182ce", "#63b3ed", "#bee3f8"] },
  ];
  const applyColor = (color: string) => { document.execCommand("foreColor", false, color); };
  const applyHighlight = (color: string) => { document.execCommand("hiliteColor", false, color); };
  return (
    <div className="p-3 space-y-3">
      {palettes.map(p => (
        <div key={p.name}>
          <div className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>{p.name}</div>
          <div className="flex gap-1">
            {p.colors.map(c => (
              <div key={c} className="group relative">
                <button className="w-8 h-8 rounded border transition-transform hover:scale-110" style={{ background: c, borderColor: "var(--border)" }} title={c} onClick={() => applyColor(c)} />
                <button onClick={() => applyHighlight(c)} className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: c, borderColor: "#fff" }} title="Highlight" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UnitConverterPanel() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("mi");
  const linearConversions: Record<string, Record<string, number>> = {
    km: { mi: 0.621371, m: 1000, ft: 3280.84, yd: 1093.61 },
    mi: { km: 1.60934, m: 1609.34, ft: 5280, yd: 1760 },
    kg: { lb: 2.20462, g: 1000, oz: 35.274 },
    lb: { kg: 0.453592, g: 453.592, oz: 16 },
  };
  const tempConversions: Record<string, Record<string, (v: number) => number>> = {
    c: { f: (v) => v * 9/5 + 32, k: (v) => v + 273.15 },
    f: { c: (v) => (v - 32) * 5/9, k: (v) => (v - 32) * 5/9 + 273.15 },
    k: { c: (v) => v - 273.15, f: (v) => (v - 273.15) * 9/5 + 32 },
  };
  const units = ["km", "mi", "m", "ft", "yd", "kg", "lb", "g", "oz", "c", "f", "k"];
  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return "—";
    if (fromUnit === toUnit) return v.toFixed(4);
    const tempFn = tempConversions[fromUnit]?.[toUnit];
    if (tempFn) return tempFn(v).toFixed(2);
    const factor = linearConversions[fromUnit]?.[toUnit];
    if (factor !== undefined) return (v * factor).toFixed(4);
    return "N/A";
  };
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="Value" type="number" className="w-24 text-xs px-2 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
        <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="text-xs px-2 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>{units.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}</select>
        <ArrowLeftRight size={14} style={{ color: "var(--muted-foreground)" }} />
        <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="text-xs px-2 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>{units.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}</select>
      </div>
      {value && <div className="text-lg font-bold" style={{ color: "var(--primary)" }}>{convert()} {toUnit.toUpperCase()}</div>}
    </div>
  );
}

function CharacterMapPanel() {
  const sections = [
    { name: "Symbols", chars: "© ® ™ § ¶ † ‡ ° ± × ÷ ≠ ≤ ≥ ∞ √ ∑ ∏ ∫ ∂ ∆ ∇ ≈ ∝ ∈ ∉ ⊂ ⊃ ∪ ∩" },
    { name: "Arrows", chars: "← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓ ⟵ ⟶ ↩ ↪ ↻ ↺" },
    { name: "Currency", chars: "$ € £ ¥ ₹ ₽ ₿ ¢ ₩ ₫ ₭ ₮ ₲ ₴ ₸ ₺" },
    { name: "Emoji", chars: "😀 😃 😄 😁 😆 🤣 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😗 😋 😛 🤔 🤫 🤭 😏 😒 🙄 😤 😠 😡 🥺 😢 😭 😱 😰 😥 😓 🤗 🤯 🥳 🤠 😎 🤓 🧐 😈 👿" },
    { name: "Shapes", chars: "■ □ ▪ ▫ ▲ △ ▼ ▽ ◆ ◇ ○ ● ◐ ◑ ★ ☆ ♠ ♣ ♥ ♦ ♩ ♪ ♫ ♬" },
    { name: "Greek", chars: "α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω Α Β Γ Δ Ε Ζ Η Θ" },
  ];
  const insertChar = (char: string) => {
    const editor = document.getElementById("doc-editor");
    if (editor) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(char));
        range.collapse(false);
      } else {
        editor.insertAdjacentHTML("beforeend", char);
      }
    }
  };
  return (
    <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: "400px" }}>
      {sections.map(s => (
        <div key={s.name}>
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>{s.name}</div>
          <div className="flex flex-wrap gap-1">
            {s.chars.split(" ").filter(Boolean).map((c, i) => (
              <button key={i} onClick={() => insertChar(c)} className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors hover:bg-[var(--muted)]" style={{ border: "1px solid var(--border)" }} title={`Insert ${c}`}>{c}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadabilityPanel() {
  const [scores, setScores] = useState<{ name: string; score: string; grade: string }[]>([]);
  const analyze = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    const text = editor.innerText;
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const syllables = words.reduce((acc, w) => acc + Math.max(1, w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g)?.length || 1), 0);
    const wc = words.length || 1;
    const sc = sentences.length || 1;
    const fk = 206.835 - 1.015 * (wc / sc) - 84.6 * (syllables / wc);
    const fog = 0.4 * ((wc / sc) + 100 * (words.filter(w => w.length > 6).length / wc));
    const cli = 0.0588 * (text.replace(/\s/g, '').length / wc * 100) - 0.296 * (sc / wc * 100) - 15.8;
    setScores([
      { name: "Flesch Reading Ease", score: Math.max(0, Math.min(100, fk)).toFixed(1), grade: fk > 80 ? "Easy" : fk > 60 ? "Standard" : fk > 40 ? "Difficult" : "Very Difficult" },
      { name: "Gunning Fog Index", score: fog.toFixed(1), grade: fog < 8 ? "Easy" : fog < 12 ? "Standard" : "Difficult" },
      { name: "Coleman-Liau Index", score: Math.max(0, cli).toFixed(1), grade: `Grade ${Math.round(Math.max(1, cli))}` },
      { name: "Words", score: String(wc), grade: "" },
      { name: "Sentences", score: String(sc), grade: "" },
      { name: "Avg Words/Sentence", score: (wc / sc).toFixed(1), grade: "" },
    ]);
  };
  return (
    <div className="p-3">
      <button onClick={analyze} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded mb-3" style={{ background: "var(--primary)", color: "#fff" }}><BookOpen size={12} /> Analyze Readability</button>
      {scores.length > 0 && (
        <div className="space-y-2">
          {scores.map(s => (
            <div key={s.name} className="flex items-center justify-between p-2 rounded" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <span className="text-xs" style={{ color: "var(--foreground)" }}>{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{s.score}</span>
                {s.grade && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{s.grade}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextToSpeechPanel() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState("");
  const speak = () => {
    const editor = document.getElementById("doc-editor");
    if (!editor || typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const text = window.getSelection()?.toString() || editor.innerText.substring(0, 5000);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    if (voice) { const v = speechSynthesis.getVoices().find(v => v.name === voice); if (v) utterance.voice = v; }
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };
  const stop = () => { speechSynthesis.cancel(); setSpeaking(false); };
  const voices = typeof speechSynthesis !== "undefined" ? speechSynthesis.getVoices().slice(0, 10) : [];
  return (
    <div className="p-3">
      <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Select text in the document or read entire content aloud.</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Speed:</span>
        <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="flex-1" />
        <span className="text-xs w-8" style={{ color: "var(--foreground)" }}>{rate}x</span>
      </div>
      {voices.length > 0 && (
        <select value={voice} onChange={e => setVoice(e.target.value)} className="w-full text-xs px-2 py-1.5 rounded border outline-none mb-3 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="">Default Voice</option>{voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
        </select>
      )}
      <div className="flex gap-2">
        <button onClick={speak} disabled={speaking} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded disabled:opacity-50" style={{ background: "var(--primary)", color: "#fff" }}><Volume2 size={12} /> {speaking ? "Speaking..." : "Speak"}</button>
        {speaking && <button onClick={stop} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Stop</button>}
      </div>
    </div>
  );
}

function DocumentComparePanel() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diff, setDiff] = useState<{ type: "same" | "added" | "removed"; text: string }[]>([]);
  const compare = () => {
    const wordsA = textA.split(/\s+/);
    const wordsB = textB.split(/\s+/);
    const result: { type: "same" | "added" | "removed"; text: string }[] = [];
    let i = 0, j = 0;
    while (i < wordsA.length || j < wordsB.length) {
      if (i < wordsA.length && j < wordsB.length && wordsA[i] === wordsB[j]) {
        result.push({ type: "same", text: wordsA[i] });
        i++; j++;
      } else if (i < wordsA.length) {
        result.push({ type: "removed", text: wordsA[i] });
        i++;
      } else {
        result.push({ type: "added", text: wordsB[j] });
        j++;
      }
    }
    setDiff(result);
  };
  const loadFromDoc = (target: "a" | "b") => {
    const editor = document.getElementById("doc-editor");
    if (editor) { target === "a" ? setTextA(editor.innerText) : setTextB(editor.innerText); }
  };
  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Version A</span><button onClick={() => loadFromDoc("a")} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--foreground)" }}>From Doc</button></div>
          <textarea value={textA} onChange={e => setTextA(e.target.value)} className="w-full h-20 text-xs rounded p-2 resize-none outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Version B</span><button onClick={() => loadFromDoc("b")} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--foreground)" }}>From Doc</button></div>
          <textarea value={textB} onChange={e => setTextB(e.target.value)} className="w-full h-20 text-xs rounded p-2 resize-none outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
      </div>
      <button onClick={compare} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded mb-3" style={{ background: "var(--primary)", color: "#fff" }}><GitCompare size={12} /> Compare</button>
      {diff.length > 0 && (
        <div className="p-3 rounded text-xs leading-relaxed" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
          {diff.map((d, i) => (
            <span key={i} style={{
              background: d.type === "added" ? "#dcfce7" : d.type === "removed" ? "#fee2e2" : "transparent",
              color: d.type === "added" ? "#166534" : d.type === "removed" ? "#991b1b" : "var(--foreground)",
              textDecoration: d.type === "removed" ? "line-through" : "none",
            }}>{d.text} </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ClipboardManagerPanel() {
  const [clips, setClips] = useState<{ text: string; time: string }[]>([]);
  const copyFromSelection = () => {
    const text = window.getSelection()?.toString();
    if (text) setClips(prev => [{ text, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
  };
  const paste = (text: string) => {
    const editor = document.getElementById("doc-editor");
    if (editor) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      } else {
        editor.insertAdjacentHTML("beforeend", text);
      }
    }
  };
  return (
    <div className="p-3">
      <button onClick={copyFromSelection} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded mb-3" style={{ background: "var(--primary)", color: "#fff" }}><Clipboard size={12} /> Copy Selection to Clipboard Manager</button>
      {clips.length === 0 && <p className="text-xs text-center py-4" style={{ color: "var(--muted-foreground)" }}>No clips yet. Select text and click the button above.</p>}
      <div className="space-y-1">
        {clips.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded text-xs" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>{c.text}</span>
            <span className="text-[10px] flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{c.time}</span>
            <button onClick={() => paste(c.text)} className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "var(--primary)", color: "#fff" }}>Paste</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add-in Panel Renderer                                              */
/* ------------------------------------------------------------------ */

function renderAddinPanel(id: string): React.ReactNode {
  switch (id) {
    case "word-cloud": return <WordCloudPanel />;
    case "qr-code": return <QRCodePanel />;
    case "barcode": return <BarcodePanel />;
    case "lorem-ipsum": return <LoremIpsumPanel />;
    case "color-palette": return <ColorPalettePanel />;
    case "unit-converter": return <UnitConverterPanel />;
    case "char-map": return <CharacterMapPanel />;
    case "readability": return <ReadabilityPanel />;
    case "tts": return <TextToSpeechPanel />;
    case "doc-compare": return <DocumentComparePanel />;
    case "clipboard-mgr": return <ClipboardManagerPanel />;
    default: return (
      <div className="p-6 text-center">
        <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: "var(--muted-foreground)" }} />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>This add-in is a placeholder and will be available in a future update.</p>
      </div>
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function AddInsMarketplace() {
  const [addins, setAddins] = useState<AddIn[]>(BUILTIN_ADDINS.map(a => ({ ...a, installed: false })));
  const [view, setView] = useState<MarketplaceView>("browse");
  const [activeAddinId, setActiveAddinId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const toggleInstall = useCallback((id: string) => {
    setAddins(prev => prev.map(a => a.id === id ? { ...a, installed: !a.installed } : a));
  }, []);

  const openAddin = useCallback((id: string) => {
    setActiveAddinId(id);
    setView("active-addin");
  }, []);

  const filtered = addins.filter(a => {
    if (view === "installed" && !a.installed) return false;
    if (categoryFilter !== "All" && a.category !== categoryFilter) return false;
    if (searchFilter && !a.name.toLowerCase().includes(searchFilter.toLowerCase()) && !a.description.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const activeAddin = addins.find(a => a.id === activeAddinId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          {view === "active-addin" ? (
            <button onClick={() => setView("browse")} className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)" }}>
              <ChevronRight size={12} className="rotate-180" /> Back
            </button>
          ) : (
            <>
              <button onClick={() => setView("browse")} className="text-[11px] px-2.5 py-1 rounded font-medium" style={{ background: view === "browse" ? "var(--card)" : "transparent", color: view === "browse" ? "var(--foreground)" : "var(--muted-foreground)", border: view === "browse" ? "1px solid var(--border)" : "1px solid transparent" }}>Browse</button>
              <button onClick={() => setView("installed")} className="text-[11px] px-2.5 py-1 rounded font-medium" style={{ background: view === "installed" ? "var(--card)" : "transparent", color: view === "installed" ? "var(--foreground)" : "var(--muted-foreground)", border: view === "installed" ? "1px solid var(--border)" : "1px solid transparent" }}>
                Installed ({addins.filter(a => a.installed).length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Add-in */}
      {view === "active-addin" && activeAddin && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)", color: "var(--primary)" }}>{activeAddin.icon}</div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{activeAddin.name}</div>
              <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>v{activeAddin.version} by {activeAddin.author}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderAddinPanel(activeAddin.id)}
          </div>
        </div>
      )}

      {/* Browse / Installed */}
      {view !== "active-addin" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filter */}
          <div className="px-3 py-2 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
              <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Search add-ins..." className="w-full pl-7 pr-3 py-1 text-xs rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
          </div>
          {/* Categories */}
          <div className="px-3 py-1.5 flex gap-1 overflow-x-auto flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)} className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: categoryFilter === c ? "var(--primary)" : "var(--muted)", color: categoryFilter === c ? "#fff" : "var(--foreground)" }}>{c}</button>
            ))}
          </div>
          {/* Add-in cards */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filtered.map(addin => (
                <div key={addin.id} className="p-3 rounded-lg transition-colors" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--muted)", color: addin.installed ? "var(--primary)" : "var(--muted-foreground)" }}>{addin.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{addin.name}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          <Star size={10} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{addin.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{addin.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => toggleInstall(addin.id)} className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded font-medium" style={{ background: addin.installed ? "var(--muted)" : "var(--primary)", color: addin.installed ? "var(--foreground)" : "#fff" }}>
                          {addin.installed ? <><Check size={10} /> Installed</> : <><Download size={10} /> Install</>}
                        </button>
                        {addin.installed && (
                          <button onClick={() => openAddin(addin.id)} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>Open</button>
                        )}
                        <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>v{addin.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="col-span-2 text-xs text-center py-8" style={{ color: "var(--muted-foreground)" }}>No add-ins found.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
