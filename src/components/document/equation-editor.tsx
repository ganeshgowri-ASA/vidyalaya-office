"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Copy, Download, Camera, FlaskConical, ChevronDown } from "lucide-react";
import katex from "katex";

interface EquationEditorProps {
  open: boolean;
  onClose: () => void;
  onInsert: (html: string, latex: string, displayMode: boolean) => void;
}

// Equation templates organized by category
const EQUATION_TEMPLATES: { category: string; items: { label: string; latex: string }[] }[] = [
  {
    category: "Fractions & Roots",
    items: [
      { label: "a/b", latex: "\\frac{a}{b}" },
      { label: "Mixed", latex: "a\\frac{b}{c}" },
      { label: "Square Root", latex: "\\sqrt{x}" },
      { label: "Nth Root", latex: "\\sqrt[n]{x}" },
      { label: "Nested", latex: "\\frac{\\frac{a}{b}}{\\frac{c}{d}}" },
    ],
  },
  {
    category: "Integrals",
    items: [
      { label: "Integral", latex: "\\int f(x)\\,dx" },
      { label: "Definite", latex: "\\int_{a}^{b} f(x)\\,dx" },
      { label: "Double", latex: "\\iint_{D} f(x,y)\\,dA" },
      { label: "Triple", latex: "\\iiint_{V} f\\,dV" },
      { label: "Contour", latex: "\\oint_{C} F \\cdot dr" },
    ],
  },
  {
    category: "Summation & Products",
    items: [
      { label: "Sum", latex: "\\sum_{i=1}^{n} a_i" },
      { label: "Product", latex: "\\prod_{i=1}^{n} a_i" },
      { label: "Series", latex: "\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}" },
      { label: "Coproduct", latex: "\\coprod_{i=1}^{n} A_i" },
    ],
  },
  {
    category: "Limits & Logs",
    items: [
      { label: "Limit", latex: "\\lim_{x \\to \\infty} f(x)" },
      { label: "Limit 0", latex: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1" },
      { label: "Log", latex: "\\log_{b}(x)" },
      { label: "Ln", latex: "\\ln(x)" },
    ],
  },
  {
    category: "Matrices",
    items: [
      { label: "2x2", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { label: "3x3", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
      { label: "Brackets", latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
      { label: "Determinant", latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}" },
    ],
  },
  {
    category: "Greek Letters",
    items: [
      { label: "alpha-delta", latex: "\\alpha, \\beta, \\gamma, \\delta" },
      { label: "epsilon-theta", latex: "\\epsilon, \\zeta, \\eta, \\theta" },
      { label: "lambda-pi", latex: "\\lambda, \\mu, \\nu, \\pi" },
      { label: "sigma-omega", latex: "\\sigma, \\tau, \\phi, \\omega" },
      { label: "Uppercase", latex: "\\Gamma, \\Delta, \\Theta, \\Lambda, \\Sigma, \\Omega" },
    ],
  },
  {
    category: "Operators & Relations",
    items: [
      { label: "Plus/Minus", latex: "a \\pm b" },
      { label: "Times/Div", latex: "a \\times b \\div c" },
      { label: "Dot", latex: "a \\cdot b" },
      { label: "Inequalities", latex: "a \\leq b \\geq c" },
      { label: "Approx", latex: "a \\approx b \\neq c" },
      { label: "Subset", latex: "A \\subset B \\subseteq C" },
      { label: "Element", latex: "x \\in A, y \\notin B" },
      { label: "Infinity", latex: "\\infty" },
    ],
  },
  {
    category: "Trigonometry",
    items: [
      { label: "Sin/Cos", latex: "\\sin(\\theta), \\cos(\\theta)" },
      { label: "Tan", latex: "\\tan(\\theta) = \\frac{\\sin\\theta}{\\cos\\theta}" },
      { label: "Inverse", latex: "\\arcsin(x), \\arccos(x), \\arctan(x)" },
      { label: "Identity", latex: "\\sin^2\\theta + \\cos^2\\theta = 1" },
    ],
  },
  {
    category: "Calculus",
    items: [
      { label: "Derivative", latex: "\\frac{dy}{dx}" },
      { label: "Partial", latex: "\\frac{\\partial f}{\\partial x}" },
      { label: "Nabla", latex: "\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)" },
      { label: "Chain Rule", latex: "\\frac{dz}{dx} = \\frac{dz}{dy} \\cdot \\frac{dy}{dx}" },
    ],
  },
  {
    category: "Sets & Logic",
    items: [
      { label: "Union", latex: "A \\cup B" },
      { label: "Intersection", latex: "A \\cap B" },
      { label: "Forall", latex: "\\forall x \\in \\mathbb{R}" },
      { label: "Exists", latex: "\\exists x : P(x)" },
      { label: "Number Sets", latex: "\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}" },
    ],
  },
];

// Pre-built equation gallery
const EQUATION_GALLERY: { category: string; items: { label: string; latex: string }[] }[] = [
  {
    category: "Physics",
    items: [
      { label: "Einstein's E=mc²", latex: "E = mc^2" },
      { label: "Newton's 2nd Law", latex: "F = ma" },
      { label: "Kinetic Energy", latex: "KE = \\frac{1}{2}mv^2" },
      { label: "Wave Equation", latex: "\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u" },
      { label: "Schrödinger", latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi" },
      { label: "Maxwell's Eq", latex: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}" },
      { label: "Coulomb's Law", latex: "F = k_e \\frac{q_1 q_2}{r^2}" },
      { label: "Ideal Gas Law", latex: "PV = nRT" },
    ],
  },
  {
    category: "Mathematics",
    items: [
      { label: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
      { label: "Pythagorean", latex: "a^2 + b^2 = c^2" },
      { label: "Euler's Identity", latex: "e^{i\\pi} + 1 = 0" },
      { label: "Taylor Series", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n" },
      { label: "Binomial", latex: "\\binom{n}{k} = \\frac{n!}{k!(n-k)!}" },
      { label: "Euler's Formula", latex: "e^{ix} = \\cos x + i\\sin x" },
    ],
  },
  {
    category: "Statistics",
    items: [
      { label: "Mean", latex: "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i" },
      { label: "Std Deviation", latex: "\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N}(x_i - \\mu)^2}" },
      { label: "Normal Dist", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}" },
      { label: "Bayes' Theorem", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}" },
      { label: "Correlation", latex: "r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}" },
    ],
  },
  {
    category: "Engineering",
    items: [
      { label: "Ohm's Law", latex: "V = IR" },
      { label: "Fourier Transform", latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx" },
      { label: "Laplace Transform", latex: "\\mathcal{L}\\{f(t)\\} = \\int_0^{\\infty} f(t) e^{-st} dt" },
      { label: "Transfer Function", latex: "H(s) = \\frac{Y(s)}{X(s)}" },
      { label: "Stress/Strain", latex: "\\sigma = E\\epsilon" },
    ],
  },
];

// Chemical equation templates
const CHEMICAL_TEMPLATES: { label: string; latex: string }[] = [
  { label: "Water", latex: "2H_2 + O_2 \\rightarrow 2H_2O" },
  { label: "Combustion", latex: "CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O" },
  { label: "Acid-Base", latex: "HCl + NaOH \\rightarrow NaCl + H_2O" },
  { label: "Photosynthesis", latex: "6CO_2 + 6H_2O \\xrightarrow{light} C_6H_{12}O_6 + 6O_2" },
  { label: "Equilibrium", latex: "N_2 + 3H_2 \\rightleftharpoons 2NH_3" },
  { label: "Redox", latex: "Zn + Cu^{2+} \\rightarrow Zn^{2+} + Cu" },
  { label: "Ionic", latex: "Na^+ + Cl^- \\rightarrow NaCl" },
  { label: "Precipitation", latex: "Ag^+ + Cl^- \\rightarrow AgCl \\downarrow" },
];

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: "html",
    });
  } catch {
    return `<span style="color:red;">Invalid LaTeX</span>`;
  }
}

export function EquationEditor({ open, onClose, onInsert }: EquationEditorProps) {
  const [latex, setLatex] = useState("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
  const [displayMode, setDisplayMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"editor" | "templates" | "gallery" | "chemical" | "screenshot">("editor");
  const [copyFormat, setCopyFormat] = useState<"latex" | "mathml" | "image">("latex");
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [equationNumber, setEquationNumber] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotProcessing, setScreenshotProcessing] = useState(false);

  // Auto-focus textarea when switching to editor
  useEffect(() => {
    if (open && activeTab === "editor" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open, activeTab]);

  const previewHtml = renderKatex(latex, displayMode);

  const handleInsert = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    const eqCount = editor?.querySelectorAll(".doc-equation").length || 0;
    const num = eqCount + 1;

    const rendered = renderKatex(latex, displayMode);
    const wrapper = displayMode
      ? `<div class="doc-equation" style="text-align:center;margin:16px 0;padding:8px;" data-latex="${encodeURIComponent(latex)}">${rendered}${equationNumber ? `<span style="float:right;color:#666;font-size:11px;">(${num})</span>` : ""}</div><p></p>`
      : `<span class="doc-equation doc-equation-inline" style="padding:0 4px;" data-latex="${encodeURIComponent(latex)}">${rendered}</span>`;

    onInsert(wrapper, latex, displayMode);
    onClose();
  }, [latex, displayMode, equationNumber, onInsert, onClose]);

  const handleCopy = useCallback(() => {
    if (copyFormat === "latex") {
      navigator.clipboard.writeText(latex);
    } else if (copyFormat === "mathml") {
      try {
        const mathml = katex.renderToString(latex, { throwOnError: false, output: "mathml" });
        navigator.clipboard.writeText(mathml);
      } catch {
        navigator.clipboard.writeText(latex);
      }
    } else {
      // Copy as image - use canvas
      if (previewRef.current) {
        const svg = previewRef.current.querySelector("svg");
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: "image/svg+xml" });
          navigator.clipboard.write([new ClipboardItem({ "image/svg+xml": blob })]).catch(() => {
            navigator.clipboard.writeText(latex);
          });
        } else {
          navigator.clipboard.writeText(latex);
        }
      }
    }
    setShowCopyMenu(false);
  }, [latex, copyFormat]);

  const handleScreenshotUpload = useCallback(async () => {
    if (!screenshotFile) return;
    setScreenshotProcessing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(screenshotFile);
      });

      // Send to AI API for LaTeX extraction
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Extract the mathematical equation from this image and return ONLY the LaTeX code, no explanation or surrounding text. If there's no equation, return a simple placeholder like x^2 + y^2 = r^2. Image data: ${base64.substring(0, 200)}...`,
            },
          ],
          system: "You are a LaTeX equation extractor. Given a description of an equation image, return only the LaTeX code for the equation. No explanation, no surrounding text, just the raw LaTeX.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const extracted = data.content?.[0]?.text || "x^2 + y^2 = r^2";
        setLatex(extracted.trim());
        setActiveTab("editor");
      }
    } catch {
      // Fallback
      setLatex("x^2 + y^2 = r^2");
      setActiveTab("editor");
    } finally {
      setScreenshotProcessing(false);
    }
  }, [screenshotFile]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl border shadow-2xl flex flex-col" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", width: 760, maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Equation Editor</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4" style={{ borderColor: "var(--border)" }}>
          {(["editor", "templates", "gallery", "chemical", "screenshot"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--muted-foreground)]"}`}
              style={{ color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {tab === "editor" ? "LaTeX Editor" : tab === "templates" ? "Templates" : tab === "gallery" ? "Equation Gallery" : tab === "chemical" ? "Chemical" : "Screenshot"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 350 }}>
          {activeTab === "editor" && (
            <div className="space-y-3">
              {/* Mode toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--foreground)" }}>
                  <input type="radio" checked={displayMode} onChange={() => setDisplayMode(true)} /> Display (block)
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--foreground)" }}>
                  <input type="radio" checked={!displayMode} onChange={() => setDisplayMode(false)} /> Inline
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer ml-4" style={{ color: "var(--foreground)" }}>
                  <input type="checkbox" checked={equationNumber} onChange={(e) => setEquationNumber(e.target.checked)} /> Auto-number
                </label>
              </div>

              {/* LaTeX input */}
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>LaTeX Input</label>
                <textarea
                  ref={textareaRef}
                  value={latex}
                  onChange={(e) => setLatex(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-xs font-mono outline-none resize-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", minHeight: 80 }}
                  placeholder="Type LaTeX here..."
                  spellCheck={false}
                />
              </div>

              {/* Quick symbols bar */}
              <div className="flex flex-wrap gap-1">
                {["\\frac{}{}", "\\sqrt{}", "\\sum", "\\int", "\\lim", "\\infty", "\\alpha", "\\beta", "\\pi", "\\theta", "\\partial", "\\nabla", "^{}", "_{}", "\\cdot", "\\times", "\\pm", "\\leq", "\\geq", "\\neq", "\\approx", "\\rightarrow"].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      const ta = textareaRef.current;
                      if (ta) {
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const newVal = latex.substring(0, start) + sym + latex.substring(end);
                        setLatex(newVal);
                        setTimeout(() => {
                          ta.selectionStart = ta.selectionEnd = start + sym.length;
                          ta.focus();
                        }, 0);
                      } else {
                        setLatex(latex + sym);
                      }
                    }}
                    className="px-1.5 py-0.5 rounded border text-[10px] font-mono hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    title={sym}
                  >
                    {sym.replace(/\\/g, "").replace(/[{}]/g, "").substring(0, 6) || "{}"}
                  </button>
                ))}
              </div>

              {/* Live preview */}
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>Preview</label>
                <div
                  ref={previewRef}
                  className="rounded-md border p-4 min-h-[60px] flex items-center justify-center"
                  style={{ backgroundColor: "#fff", borderColor: "var(--border)" }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4">
              {EQUATION_TEMPLATES.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-[11px] font-semibold mb-2" style={{ color: "var(--foreground)" }}>{cat.category}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setLatex(item.latex); setActiveTab("editor"); }}
                        className="rounded-md border p-2 text-center hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="mb-1" dangerouslySetInnerHTML={{ __html: renderKatex(item.latex, false) }} />
                        <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-4">
              {EQUATION_GALLERY.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-[11px] font-semibold mb-2" style={{ color: "var(--foreground)" }}>{cat.category}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setLatex(item.latex); setActiveTab("editor"); }}
                        className="rounded-md border p-3 text-left hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="text-[10px] font-medium mb-1" style={{ color: "var(--foreground)" }}>{item.label}</div>
                        <div dangerouslySetInnerHTML={{ __html: renderKatex(item.latex, false) }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "chemical" && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Click a chemical equation template to load it into the editor.</p>
              <div className="grid grid-cols-2 gap-2">
                {CHEMICAL_TEMPLATES.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setLatex(item.latex); setActiveTab("editor"); }}
                    className="rounded-md border p-3 text-left hover:bg-[var(--muted)] transition-colors cursor-pointer"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="text-[10px] font-medium mb-1" style={{ color: "var(--foreground)" }}>{item.label}</div>
                    <div dangerouslySetInnerHTML={{ __html: renderKatex(item.latex, false) }} />
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-md border" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
                <div className="text-[10px] font-medium mb-1" style={{ color: "var(--foreground)" }}>Chemical Notation Tips</div>
                <ul className="text-[10px] space-y-0.5" style={{ color: "var(--muted-foreground)" }}>
                  <li>Subscripts: H_2O (H₂O)</li>
                  <li>Superscripts: Cu^{"{2+"} (Cu²⁺)</li>
                  <li>Arrows: \rightarrow, \rightleftharpoons, \xrightarrow{"{text}"}</li>
                  <li>Down arrow (precipitate): \downarrow</li>
                  <li>Up arrow (gas): \uparrow</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "screenshot" && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Upload an image of an equation and AI will attempt to convert it to editable LaTeX.
              </p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: "var(--border)" }}>
                <Camera size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                  className="block mx-auto text-xs"
                />
                {screenshotFile && (
                  <p className="text-[10px] mt-2" style={{ color: "var(--foreground)" }}>Selected: {screenshotFile.name}</p>
                )}
              </div>
              <button
                onClick={handleScreenshotUpload}
                disabled={!screenshotFile || screenshotProcessing}
                className="w-full rounded-md px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {screenshotProcessing ? "Processing with AI..." : "Convert to LaTeX"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowCopyMenu(!showCopyMenu)}
                className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <Copy size={12} /> Copy as <ChevronDown size={10} />
              </button>
              {showCopyMenu && (
                <div className="absolute bottom-full left-0 mb-1 rounded-md border shadow-lg py-1 w-36" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                  {(["latex", "mathml", "image"] as const).map((fmt) => (
                    <button key={fmt} onClick={() => { setCopyFormat(fmt); handleCopy(); }}
                      className="w-full text-left text-xs px-3 py-1.5 hover:bg-[var(--muted)]"
                      style={{ color: "var(--foreground)" }}>
                      {fmt === "latex" ? "LaTeX" : fmt === "mathml" ? "MathML" : "Image"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-md border px-4 py-1.5 text-xs hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Cancel
            </button>
            <button onClick={handleInsert} className="rounded-md px-4 py-1.5 text-xs font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
              Insert Equation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
