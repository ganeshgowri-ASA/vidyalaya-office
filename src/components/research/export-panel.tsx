'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { Download, FileText, FileCode, FileDown, BookOpen, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const exportFormats = [
  {
    id: 'docx',
    icon: FileText,
    label: 'Word Document',
    ext: '.docx',
    description: 'Formatted per journal template, with styles',
    color: 'text-blue-400',
  },
  {
    id: 'pdf',
    icon: FileDown,
    label: 'PDF',
    ext: '.pdf',
    description: 'Publication-ready PDF output',
    color: 'text-red-400',
  },
  {
    id: 'latex',
    icon: FileCode,
    label: 'LaTeX Source',
    ext: '.tex',
    description: 'Complete .tex file with bibliography',
    color: 'text-yellow-400',
  },
  {
    id: 'markdown',
    icon: FileText,
    label: 'Markdown',
    ext: '.md',
    description: 'Pandoc-compatible Markdown with frontmatter',
    color: 'text-green-400',
  },
  {
    id: 'bibtex',
    icon: BookOpen,
    label: 'BibTeX References',
    ext: '.bib',
    description: 'Export all references as BibTeX',
    color: 'text-purple-400',
  },
];

const ieeeChecklist = [
  { id: 'c1', label: 'Title is concise and descriptive (≤15 words)', done: true },
  { id: 'c2', label: 'Abstract within 250 word limit', done: true },
  { id: 'c3', label: 'Keywords provided (4-6 terms)', done: true },
  { id: 'c4', label: 'All figures have captions and are cited in text', done: false },
  { id: 'c5', label: 'All tables have captions above table', done: true },
  { id: 'c6', label: 'Equations are numbered sequentially', done: true },
  { id: 'c7', label: 'References follow IEEE format', done: false },
  { id: 'c8', label: 'Author affiliations are complete', done: true },
  { id: 'c9', label: 'Conflict of interest statement included', done: false },
  { id: 'c10', label: 'Funding acknowledgments included', done: true },
  { id: 'c11', label: 'Supplementary materials listed (if any)', done: true },
  { id: 'c12', label: 'Permissions obtained for reproduced figures', done: false },
];

export default function ExportPanel() {
  const { selectedTemplateId, journalTemplates, citations, equations, figures, tables } = useResearchStore();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(true);
  const [checklist, setChecklist] = useState(ieeeChecklist);

  const template = journalTemplates.find((t) => t.id === selectedTemplateId);
  const completedChecks = checklist.filter((c) => c.done).length;

  const handleExport = (formatId: string) => {
    setExportingId(formatId);
    setTimeout(() => setExportingId(null), 1500);
  };

  const toggleCheck = (id: string) => {
    setChecklist(checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ color: 'var(--foreground)' }}>
      {/* Template info */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="text-xs font-semibold mb-2">Export Options</h3>
        {template && (
          <div
            className="rounded p-2 text-xs"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <p className="font-medium">{template.name}</p>
            <p className="opacity-50 text-[10px] mt-0.5">
              {template.columns}-column · {template.referenceStyle} · {citations.length} refs
            </p>
            <div className="flex gap-3 mt-1 text-[10px] opacity-60">
              <span>{equations.length} equations</span>
              <span>{figures.length} figures</span>
              <span>{tables.length} tables</span>
            </div>
          </div>
        )}
      </div>

      {/* Export formats */}
      <div className="p-3 space-y-2">
        {exportFormats.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => handleExport(fmt.id)}
            disabled={exportingId === fmt.id}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:opacity-90',
              exportingId === fmt.id ? 'opacity-70' : ''
            )}
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
          >
            <fmt.icon size={20} className={cn('shrink-0', fmt.color)} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">
                {fmt.label}
                <span className="opacity-50 font-normal ml-1">{fmt.ext}</span>
              </p>
              <p className="text-[10px] opacity-50 leading-tight">{fmt.description}</p>
            </div>
            {exportingId === fmt.id ? (
              <span className="text-[10px] opacity-60">Generating...</span>
            ) : (
              <Download size={14} className="opacity-40 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Submission checklist */}
      <div className="mx-3 mb-3 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <span>Submission Checklist ({completedChecks}/{checklist.length})</span>
          {showChecklist ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showChecklist && (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 px-3 py-2 cursor-pointer hover:opacity-80"
                style={{ backgroundColor: 'var(--background)' }}
                onClick={() => toggleCheck(item.id)}
              >
                {item.done
                  ? <CheckSquare size={13} className="text-green-400 shrink-0 mt-0.5" />
                  : <Square size={13} className="opacity-40 shrink-0 mt-0.5" />}
                <p className={cn('text-[11px] leading-tight', item.done ? 'opacity-60 line-through' : '')}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {showChecklist && (
          <div
            className="px-3 py-2 border-t"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${(completedChecks / checklist.length) * 100}%`, backgroundColor: completedChecks === checklist.length ? '#22c55e' : 'var(--primary)' }}
                />
              </div>
              <span className="text-[10px] opacity-60">{Math.round((completedChecks / checklist.length) * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
