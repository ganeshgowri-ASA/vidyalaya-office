'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { getLatexTemplate, generatePreamble } from '@/lib/latex-template-registry';
import { FileCode, Copy, Check, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  label: string;
  content: string;
}

export default function LaTeXSettingsPanel() {
  const { selectedTemplateId, journalTemplates, citations, equations, figures, tables, sections } = useResearchStore();
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('preamble');

  const template = journalTemplates.find((t) => t.id === selectedTemplateId);
  const latexTemplate = getLatexTemplate(selectedTemplateId);

  const preamble = latexTemplate ? generatePreamble(latexTemplate) : '';

  const bibtexEntries = citations
    .slice(0, 3)
    .map((c) => {
      const type = c.type === 'article' ? 'article' : c.type === 'conference' ? 'inproceedings' : 'misc';
      const authorsStr = c.authors.join(' and ');
      let entry = `@${type}{${c.key},\n  author = {${authorsStr}},\n  title  = {${c.title}},\n  year   = {${c.year}},`;
      if (c.journal) entry += `\n  journal= {${c.journal}},`;
      if (c.volume) entry += `\n  volume = {${c.volume}},`;
      if (c.pages) entry += `\n  pages  = {${c.pages}},`;
      if (c.doi) entry += `\n  doi    = {${c.doi}},`;
      entry += '\n}';
      return entry;
    })
    .join('\n\n');

  const equationSnippets = equations
    .slice(0, 2)
    .map((eq) => `\\begin{equation}\n  ${eq.latex}\n  \\label{eq:${eq.label || eq.id}}\n\\end{equation}`)
    .join('\n\n');

  const figureSnippets = figures
    .slice(0, 2)
    .map(
      (f) =>
        `\\begin{figure}[htbp]\n  \\centering\n  \\includegraphics[width=0.8\\linewidth]{figure${f.number}}\n  \\caption{${f.caption}}\n  \\label{fig:figure${f.number}}\n\\end{figure}`
    )
    .join('\n\n');

  const tableSnippets = tables
    .slice(0, 1)
    .map((t) => {
      const colSpec = t.headers.map(() => 'l').join(' ');
      const headerRow = t.headers.join(' & ') + ' \\\\';
      const dataRows = t.rows
        .slice(0, 3)
        .map((row) => row.join(' & ') + ' \\\\')
        .join('\n  ');
      return `\\begin{table}[htbp]\n  \\centering\n  \\caption{${t.caption}}\n  \\label{tab:table${t.number}}\n  \\begin{tabular}{${colSpec}}\n  \\toprule\n  ${headerRow}\n  \\midrule\n  ${dataRows}\n  \\bottomrule\n  \\end{tabular}\n\\end{table}`;
    })
    .join('\n\n');

  const collabLines: string[] = [];
  if (template) {
    const s = sections.find((sec) => sec.title === 'Authors & Affiliations');
    if (s) {
      const lines = s.content.split('\n').filter(Boolean).slice(0, 3);
      lines.forEach((line, i) => {
        collabLines.push(`\\author[${i + 1}]{${line.replace(/[¹²³⁴]|^\d+\)?\s*/, '').trim()}}`);
      });
    }
  }

  const snippetSections: Section[] = [
    {
      label: 'Preamble',
      content: preamble || '% No LaTeX template found for this journal',
    },
    {
      label: 'Bibliography',
      content: bibtexEntries || '% No citations yet',
    },
    ...(equations.length > 0
      ? [{ label: 'Equations', content: equationSnippets }]
      : []),
    ...(figures.length > 0
      ? [{ label: 'Figures', content: figureSnippets }]
      : []),
    ...(tables.length > 0
      ? [{ label: 'Tables', content: tableSnippets }]
      : []),
    ...(collabLines.length > 0
      ? [{ label: 'Authors', content: collabLines.join('\n') }]
      : []),
  ];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const toggle = (label: string) =>
    setExpandedSection((prev) => (prev === label ? '' : label));

  return (
    <div className="flex flex-col h-full overflow-y-auto text-sm" style={{ color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <Settings2 size={14} className="opacity-60" />
        <h3 className="text-xs font-semibold">LaTeX Settings</h3>
      </div>

      {/* Template info */}
      {latexTemplate ? (
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium">{latexTemplate.name}</p>
          <p className="text-[10px] opacity-50 mt-0.5">
            <span className="font-mono">\\documentclass</span>{latexTemplate.documentOptions.length ? `[${latexTemplate.documentOptions.join(',')}]` : ''}{`{${latexTemplate.documentClass}}`}
          </p>
          <div className="flex gap-3 mt-1 text-[10px] opacity-50">
            <span>{latexTemplate.packages.length} packages</span>
            <span>{latexTemplate.bibliographyEngine === 'biber' ? 'Biber' : 'BibTeX'}</span>
            <span>bst: {latexTemplate.bibliographyStyle}</span>
          </div>
          {latexTemplate.notes && (
            <p className="mt-1 text-[10px] opacity-40 italic">{latexTemplate.notes}</p>
          )}
        </div>
      ) : (
        <div className="px-3 py-2 text-[10px] opacity-50 border-b" style={{ borderColor: 'var(--border)' }}>
          No LaTeX template configured for this journal.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b text-center" style={{ borderColor: 'var(--border)' }}>
        {[
          { label: 'Refs', value: citations.length },
          { label: 'Eqs', value: equations.length },
          { label: 'Figs', value: figures.length },
          { label: 'Tabs', value: tables.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded py-1" style={{ backgroundColor: 'var(--card)' }}>
            <p className="text-sm font-bold">{value}</p>
            <p className="text-[10px] opacity-50">{label}</p>
          </div>
        ))}
      </div>

      {/* Snippet sections */}
      <div className="flex-1 divide-y" style={{ borderColor: 'var(--border)' }}>
        {snippetSections.map(({ label, content }) => (
          <div key={label}>
            <button
              onClick={() => toggle(label)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:opacity-80"
              style={{ backgroundColor: expandedSection === label ? 'var(--background)' : 'var(--card)' }}
            >
              <span className="flex items-center gap-1.5">
                <FileCode size={12} className="opacity-50" />
                {label}
              </span>
              {expandedSection === label ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {expandedSection === label && (
              <div style={{ backgroundColor: 'var(--background)' }}>
                <div className="relative">
                  <pre
                    className="text-[10px] leading-relaxed px-3 py-2 overflow-x-auto whitespace-pre font-mono opacity-80"
                    style={{ maxHeight: 220 }}
                  >
                    {content}
                  </pre>
                  <button
                    onClick={() => handleCopy(label, content)}
                    className={cn(
                      'absolute top-2 right-2 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded',
                      copied === label ? 'text-green-400' : 'opacity-50 hover:opacity-80'
                    )}
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    {copied === label ? <Check size={10} /> : <Copy size={10} />}
                    {copied === label ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compile instructions */}
      <div className="p-3 border-t text-[10px] opacity-50 space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        <p className="font-semibold opacity-80">Compile order:</p>
        {latexTemplate?.bibliographyEngine === 'biber' ? (
          <>
            <p>pdflatex → biber → pdflatex → pdflatex</p>
          </>
        ) : (
          <>
            <p>pdflatex → bibtex → pdflatex → pdflatex</p>
          </>
        )}
      </div>
    </div>
  );
}
