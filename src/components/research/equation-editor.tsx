'use client';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useResearchStore } from '@/store/research-store';
import { X, Plus, Trash2, Copy, BookmarkPlus, Star, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import katex from 'katex';

// ─── Toolbar data ────────────────────────────────────────────────────────────

const toolbarTabs = ['Greek', 'Operators', 'Fractions', 'Matrices', 'Roots', 'Sub/Sup'] as const;
type ToolbarTab = typeof toolbarTabs[number];

const greekLetters = [
  { label: 'α', latex: '\\alpha' }, { label: 'β', latex: '\\beta' },
  { label: 'γ', latex: '\\gamma' }, { label: 'δ', latex: '\\delta' },
  { label: 'ε', latex: '\\epsilon' }, { label: 'ζ', latex: '\\zeta' },
  { label: 'η', latex: '\\eta' }, { label: 'θ', latex: '\\theta' },
  { label: 'ι', latex: '\\iota' }, { label: 'κ', latex: '\\kappa' },
  { label: 'λ', latex: '\\lambda' }, { label: 'μ', latex: '\\mu' },
  { label: 'ν', latex: '\\nu' }, { label: 'ξ', latex: '\\xi' },
  { label: 'π', latex: '\\pi' }, { label: 'ρ', latex: '\\rho' },
  { label: 'σ', latex: '\\sigma' }, { label: 'τ', latex: '\\tau' },
  { label: 'φ', latex: '\\phi' }, { label: 'χ', latex: '\\chi' },
  { label: 'ψ', latex: '\\psi' }, { label: 'ω', latex: '\\omega' },
  { label: 'Γ', latex: '\\Gamma' }, { label: 'Δ', latex: '\\Delta' },
  { label: 'Θ', latex: '\\Theta' }, { label: 'Λ', latex: '\\Lambda' },
  { label: 'Σ', latex: '\\Sigma' }, { label: 'Φ', latex: '\\Phi' },
  { label: 'Ψ', latex: '\\Psi' }, { label: 'Ω', latex: '\\Omega' },
];

const operators = [
  { label: '+', latex: '+' }, { label: '−', latex: '-' },
  { label: '×', latex: '\\times' }, { label: '÷', latex: '\\div' },
  { label: '±', latex: '\\pm' }, { label: '∓', latex: '\\mp' },
  { label: '·', latex: '\\cdot' }, { label: '∘', latex: '\\circ' },
  { label: 'Σ', latex: '\\sum_{i=1}^{n}' }, { label: '∫', latex: '\\int_{a}^{b}' },
  { label: '∏', latex: '\\prod_{i=1}^{n}' }, { label: '∂', latex: '\\partial' },
  { label: '∇', latex: '\\nabla' }, { label: '∞', latex: '\\infty' },
  { label: '≤', latex: '\\leq' }, { label: '≥', latex: '\\geq' },
  { label: '≠', latex: '\\neq' }, { label: '≈', latex: '\\approx' },
  { label: '∈', latex: '\\in' }, { label: '⊂', latex: '\\subset' },
  { label: '∪', latex: '\\cup' }, { label: '∩', latex: '\\cap' },
  { label: 'lim', latex: '\\lim_{x \\to \\infty}' },
  { label: 'log', latex: '\\log' },
];

const fractions = [
  { label: 'a/b', latex: '\\frac{a}{b}' },
  { label: 'df/dx', latex: '\\frac{df}{dx}' },
  { label: '∂f/∂x', latex: '\\frac{\\partial f}{\\partial x}' },
  { label: 'Binomial', latex: '\\binom{n}{k}' },
  { label: 'cfrac', latex: '\\cfrac{1}{1+\\cfrac{1}{x}}' },
];

const matrices = [
  { label: '2×2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: '3×3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}' },
  { label: 'Bracket', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
  { label: 'Vmatrix', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
  { label: 'Cases', latex: '\\begin{cases} x & \\text{if } x \\geq 0 \\\\ -x & \\text{if } x < 0 \\end{cases}' },
  { label: 'Array', latex: '\\begin{array}{cc} a & b \\\\ c & d \\end{array}' },
];

const roots = [
  { label: '√x', latex: '\\sqrt{x}' },
  { label: '³√x', latex: '\\sqrt[3]{x}' },
  { label: 'ⁿ√x', latex: '\\sqrt[n]{x}' },
  { label: '√(a²+b²)', latex: '\\sqrt{a^2 + b^2}' },
];

const subSup = [
  { label: 'x²', latex: 'x^{2}' },
  { label: 'xⁿ', latex: 'x^{n}' },
  { label: 'xᵢ', latex: 'x_{i}' },
  { label: 'xᵢⁿ', latex: 'x_{i}^{n}' },
  { label: 'eˣ', latex: 'e^{x}' },
  { label: 'aᵢⱼ', latex: 'a_{i,j}' },
  { label: 'hat', latex: '\\hat{x}' },
  { label: 'bar', latex: '\\bar{x}' },
  { label: 'vec', latex: '\\vec{x}' },
  { label: 'dot', latex: '\\dot{x}' },
  { label: 'tilde', latex: '\\tilde{x}' },
];

const tabItems: Record<ToolbarTab, { label: string; latex: string }[]> = {
  Greek: greekLetters,
  Operators: operators,
  Fractions: fractions,
  Matrices: matrices,
  Roots: roots,
  'Sub/Sup': subSup,
};

// ─── Autocomplete data ───────────────────────────────────────────────────────

const autocompleteSuggestions = [
  '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', '\\eta', '\\theta',
  '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma',
  '\\tau', '\\phi', '\\chi', '\\psi', '\\omega',
  '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Sigma', '\\Phi', '\\Psi', '\\Omega',
  '\\frac{}{}', '\\sqrt{}', '\\sqrt[n]{}', '\\sum_{i=1}^{n}', '\\prod_{i=1}^{n}',
  '\\int_{a}^{b}', '\\lim_{x \\to}', '\\infty', '\\partial', '\\nabla',
  '\\times', '\\div', '\\cdot', '\\pm', '\\mp', '\\leq', '\\geq', '\\neq', '\\approx',
  '\\in', '\\subset', '\\cup', '\\cap',
  '\\begin{pmatrix}', '\\begin{bmatrix}', '\\begin{vmatrix}', '\\begin{cases}',
  '\\begin{matrix}', '\\begin{array}',
  '\\hat{}', '\\bar{}', '\\vec{}', '\\dot{}', '\\tilde{}',
  '\\text{}', '\\mathbf{}', '\\mathit{}', '\\mathrm{}',
  '\\left(', '\\right)', '\\left[', '\\right]',
  '\\log', '\\ln', '\\sin', '\\cos', '\\tan', '\\exp',
  '\\forall', '\\exists', '\\rightarrow', '\\leftarrow', '\\Rightarrow', '\\Leftarrow',
];

// ─── KaTeX render helper ─────────────────────────────────────────────────────

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return `<span style="color:#ef4444;">${latex}</span>`;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EquationEditor() {
  const {
    equations, addEquation, removeEquation, setShowEquationEditor,
    savedEquations, saveEquationToLibrary, removeSavedEquation, insertEquationFromLibrary,
    activeSection,
  } = useResearchStore();

  const [latex, setLatex] = useState('E = mc^2');
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'display' | 'inline'>('display');
  const [activeTab, setActiveTab] = useState<ToolbarTab>('Greek');
  const [showLibrary, setShowLibrary] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = useCallback((snippet: string) => {
    if (!textareaRef.current) {
      setLatex((prev) => prev + ' ' + snippet);
      return;
    }
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = latex.slice(0, start);
    const after = latex.slice(end);
    const newVal = before + snippet + after;
    setLatex(newVal);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + snippet.length;
      ta.focus();
    });
  }, [latex]);

  const handleAdd = () => {
    if (!latex.trim()) return;
    addEquation(latex.trim(), label || undefined, activeSection);
    setLatex('');
    setLabel('');
  };

  const handleSaveToLibrary = () => {
    if (!latex.trim()) return;
    if (!showSaveInput) {
      setShowSaveInput(true);
      setSaveLabel('');
      return;
    }
    if (!saveLabel.trim()) return;
    saveEquationToLibrary(latex.trim(), saveLabel.trim());
    setShowSaveInput(false);
    setSaveLabel('');
  };

  // Autocomplete logic
  const handleLatexChange = (value: string) => {
    setLatex(value);
    // Find the last backslash-initiated token
    const cursorPos = textareaRef.current?.selectionStart ?? value.length;
    const textBefore = value.slice(0, cursorPos);
    const match = textBefore.match(/\\([a-zA-Z]*)$/);
    if (match && match[1].length >= 1) {
      const partial = match[0];
      const filtered = autocompleteSuggestions.filter((s) => s.startsWith(partial) && s !== partial);
      setSuggestions(filtered.slice(0, 8));
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const cursorPos = ta.selectionStart;
    const textBefore = latex.slice(0, cursorPos);
    const textAfter = latex.slice(cursorPos);
    const match = textBefore.match(/\\[a-zA-Z]*$/);
    if (match) {
      const newBefore = textBefore.slice(0, textBefore.length - match[0].length) + suggestion;
      setLatex(newBefore + textAfter);
      setSuggestions([]);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = newBefore.length;
        ta.focus();
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

  // KaTeX preview HTML
  const previewHtml = useMemo(() => {
    if (!latex.trim()) return '';
    return renderKatex(latex, mode === 'display');
  }, [latex, mode]);

  // Equation numbering: count per-section
  const equationNumberMap = useMemo(() => {
    const sectionCounts: Record<string, number> = {};
    const map: Record<string, string> = {};
    for (const eq of equations) {
      const secId = eq.sectionId || '_global';
      sectionCounts[secId] = (sectionCounts[secId] || 0) + 1;
      map[eq.id] = String(sectionCounts[secId]);
    }
    return map;
  }, [equations]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowEquationEditor(false)}
    >
      <div
        className="w-full max-w-3xl flex flex-col rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold">Equation Editor (KaTeX)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className={cn('text-xs px-3 py-1 rounded border', showLibrary && 'font-medium')}
              style={showLibrary ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { borderColor: 'var(--border)' }}
            >
              <Star size={12} className="inline mr-1" />
              Library
            </button>
            <button onClick={() => setShowEquationEditor(false)}><X size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {/* Mode selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">Mode:</span>
            {(['display', 'inline'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn('text-xs px-3 py-1 rounded', mode === m ? 'font-medium' : 'opacity-50')}
                style={mode === m ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : undefined}
              >
                {m === 'display' ? 'Display ($$...$$)' : 'Inline ($...$)'}
              </button>
            ))}
          </div>

          {/* Tabbed toolbar */}
          <div>
            <div className="flex gap-0.5 mb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              {toolbarTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'text-[11px] px-2.5 py-1.5 rounded-t transition-colors border-b-2',
                    activeTab === tab ? 'font-medium' : 'opacity-50 border-transparent hover:opacity-80'
                  )}
                  style={activeTab === tab ? { borderColor: 'var(--primary)', color: 'var(--foreground)' } : undefined}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {tabItems[activeTab].map((item, i) => (
                <button
                  key={`${item.label}-${i}`}
                  onClick={() => insertSnippet(item.latex)}
                  className="text-xs px-2 py-1 rounded border hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                  title={item.latex}
                >
                  {activeTab === 'Greek' ? (
                    <span className="text-sm">{item.label}</span>
                  ) : (
                    item.label
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* LaTeX input with autocomplete */}
          <div className="relative">
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">LaTeX Input</p>
            <textarea
              ref={textareaRef}
              value={latex}
              onChange={(e) => handleLatexChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full text-sm px-3 py-2 rounded border font-mono outline-none resize-none"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              placeholder="Enter LaTeX equation..."
            />
            {/* Autocomplete dropdown */}
            {suggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 z-10 mt-0.5 rounded border shadow-lg overflow-hidden"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => applySuggestion(s)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-xs font-mono hover:opacity-80 transition-colors',
                      i === selectedSuggestion ? 'opacity-100' : 'opacity-60'
                    )}
                    style={i === selectedSuggestion ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KaTeX Preview */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Live Preview</p>
            <div
              className="p-4 rounded border min-h-[60px] flex items-center justify-center overflow-x-auto"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
            >
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <span className="opacity-40 text-sm">Enter LaTeX above...</span>
              )}
            </div>
          </div>

          {/* Label + Add / Save */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs opacity-60 shrink-0">Label:</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. mape, rmse"
              className="flex-1 min-w-[120px] text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Plus size={12} className="inline mr-1" />
              Insert
            </button>
            <button
              onClick={handleSaveToLibrary}
              className="px-3 py-1 rounded text-xs border hover:opacity-80"
              style={{ borderColor: 'var(--border)' }}
            >
              <BookmarkPlus size={12} className="inline mr-1" />
              Save
            </button>
          </div>

          {/* Save label input */}
          {showSaveInput && (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="Name for saved equation..."
                className="flex-1 text-xs px-2 py-1 rounded border"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveToLibrary(); if (e.key === 'Escape') setShowSaveInput(false); }}
              />
              <button
                onClick={handleSaveToLibrary}
                className="px-3 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Confirm
              </button>
              <button onClick={() => setShowSaveInput(false)} className="text-xs opacity-50 hover:opacity-80">Cancel</button>
            </div>
          )}

          {/* Saved equations library */}
          {showLibrary && savedEquations.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Saved Library ({savedEquations.length})</p>
              <div className="space-y-1.5">
                {savedEquations.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center gap-2 p-2 rounded border group"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <Star size={12} className="shrink-0 text-yellow-400" />
                    <span className="text-xs font-medium shrink-0">{eq.label}</span>
                    <div
                      className="flex-1 overflow-hidden text-xs"
                      dangerouslySetInnerHTML={{ __html: renderKatex(eq.latex, false) }}
                    />
                    <span className="text-[10px] opacity-30">×{eq.usageCount}</span>
                    <button
                      onClick={() => { setLatex(eq.latex); setLabel(eq.label); }}
                      className="text-[10px] opacity-40 hover:opacity-80 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => insertEquationFromLibrary(eq.id, activeSection)}
                      className="text-[10px] px-2 py-0.5 rounded font-medium"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      Insert
                    </button>
                    <button onClick={() => removeSavedEquation(eq.id)} className="opacity-30 hover:text-red-400">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showLibrary && savedEquations.length === 0 && (
            <p className="text-xs opacity-40 text-center py-3">No saved equations yet. Use the Save button above.</p>
          )}

          {/* Existing equations in document */}
          {equations.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Document Equations ({equations.length})</p>
              <div className="space-y-1.5">
                {equations.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center gap-2 p-2 rounded border"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <span className="text-xs opacity-50 shrink-0 font-medium">
                      Eq. ({equationNumberMap[eq.id] || eq.number})
                    </span>
                    <div
                      className="flex-1 overflow-hidden text-xs"
                      dangerouslySetInnerHTML={{ __html: renderKatex(eq.latex, false) }}
                    />
                    {eq.label && <span className="text-[10px] opacity-40">#{eq.label}</span>}
                    <button onClick={() => navigator.clipboard?.writeText(eq.latex)} className="opacity-40 hover:opacity-80">
                      <Copy size={12} />
                    </button>
                    <button onClick={() => removeEquation(eq.id)} className="opacity-40 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowEquationEditor(false)}
            className="px-4 py-1.5 rounded text-sm"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
