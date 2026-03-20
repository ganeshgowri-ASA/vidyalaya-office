'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { X, Plus, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const templates = [
  { label: 'Fraction', latex: '\\frac{a}{b}' },
  { label: 'Integral', latex: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'Sum', latex: '\\sum_{i=1}^{n} x_i' },
  { label: 'Product', latex: '\\prod_{i=1}^{n} x_i' },
  { label: 'Limit', latex: '\\lim_{x \\to \\infty} f(x)' },
  { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Square root', latex: '\\sqrt{x}' },
  { label: 'Power', latex: 'x^{n}' },
  { label: 'Subscript', latex: 'x_{n}' },
  { label: 'Partial', latex: '\\frac{\\partial f}{\\partial x}' },
  { label: 'Nabla', latex: '\\nabla f' },
  { label: 'Infinity', latex: '\\infty' },
];

const greekLetters = [
  { label: 'α', latex: '\\alpha' }, { label: 'β', latex: '\\beta' },
  { label: 'γ', latex: '\\gamma' }, { label: 'δ', latex: '\\delta' },
  { label: 'ε', latex: '\\epsilon' }, { label: 'θ', latex: '\\theta' },
  { label: 'λ', latex: '\\lambda' }, { label: 'μ', latex: '\\mu' },
  { label: 'π', latex: '\\pi' }, { label: 'σ', latex: '\\sigma' },
  { label: 'τ', latex: '\\tau' }, { label: 'φ', latex: '\\phi' },
  { label: 'ψ', latex: '\\psi' }, { label: 'ω', latex: '\\omega' },
  { label: 'Γ', latex: '\\Gamma' }, { label: 'Δ', latex: '\\Delta' },
  { label: 'Σ', latex: '\\Sigma' }, { label: 'Ω', latex: '\\Omega' },
];

export default function EquationEditor() {
  const { equations, addEquation, removeEquation, setShowEquationEditor } = useResearchStore();
  const [latex, setLatex] = useState('E = mc^2');
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'display' | 'inline'>('display');

  const insertSnippet = (snippet: string) => {
    setLatex((prev) => prev + ' ' + snippet);
  };

  const handleAdd = () => {
    if (!latex.trim()) return;
    addEquation(latex.trim(), label || undefined);
    setLatex('');
    setLabel('');
  };

  // Render a LaTeX-like display using monospace styling
  const renderPreview = (eq: string) => {
    return eq
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sum/g, 'Σ')
      .replace(/\\prod/g, 'Π')
      .replace(/\\int/g, '∫')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\infty/g, '∞')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ').replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε').replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ')
      .replace(/\\pi/g, 'π').replace(/\\sigma/g, 'σ')
      .replace(/\\tau/g, 'τ').replace(/\\phi/g, 'φ')
      .replace(/\\psi/g, 'ψ').replace(/\\omega/g, 'ω')
      .replace(/\\Gamma/g, 'Γ').replace(/\\Delta/g, 'Δ')
      .replace(/\\Sigma/g, 'Σ').replace(/\\Omega/g, 'Ω')
      .replace(/\\lim/g, 'lim').replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·').replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥').replace(/\\neq/g, '≠')
      .replace(/\\\\/g, ' ')
      .replace(/\{|\}/g, '')
      .replace(/_\{([^}]+)\}/g, '[$1]')
      .replace(/\^\{([^}]+)\}/g, '^[$1]');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowEquationEditor(false)}
    >
      <div
        className="w-full max-w-2xl flex flex-col rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold">Equation Editor</h2>
          <button onClick={() => setShowEquationEditor(false)}><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
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

          {/* Quick inserts */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Templates</p>
            <div className="flex flex-wrap gap-1">
              {templates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => insertSnippet(t.latex)}
                  className="text-xs px-2 py-1 rounded border hover:opacity-80"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Greek letters */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Greek Letters</p>
            <div className="flex flex-wrap gap-1">
              {greekLetters.map((g) => (
                <button
                  key={g.label}
                  onClick={() => insertSnippet(g.latex)}
                  className="w-8 h-8 text-sm rounded border hover:opacity-80 flex items-center justify-center"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                  title={g.latex}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* LaTeX input */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">LaTeX Input</p>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              rows={3}
              className="w-full text-sm px-3 py-2 rounded border font-mono outline-none resize-none"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              placeholder="Enter LaTeX equation..."
            />
          </div>

          {/* Preview */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Preview</p>
            <div
              className="p-4 rounded border min-h-[60px] flex items-center justify-center text-lg font-serif"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
            >
              <span className="text-center">{renderPreview(latex) || 'Enter LaTeX above...'}</span>
            </div>
            <p className="text-[10px] opacity-30 mt-1">
              * Simplified preview. Install KaTeX CSS for full rendering.
            </p>
          </div>

          {/* Label */}
          <div className="flex items-center gap-2">
            <label className="text-xs opacity-60 shrink-0">Label (optional):</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. mape, rmse, loss"
              className="flex-1 text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Plus size={12} className="inline mr-1" />
              Add
            </button>
          </div>

          {/* Existing equations */}
          {equations.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">Equation Library ({equations.length})</p>
              <div className="space-y-2">
                {equations.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center gap-2 p-2 rounded border"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <span className="text-xs opacity-50 shrink-0">({eq.number})</span>
                    <code className="flex-1 text-xs font-mono truncate opacity-70">{eq.latex}</code>
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
