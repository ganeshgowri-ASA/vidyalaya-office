'use client';
import { useState } from 'react';
import { useResearchStore, journalFormatConfigs } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Upload, FileText, File, CheckCircle2, ChevronRight, Columns, AlignLeft,
  Type, Ruler, ArrowDownToLine, Loader2,
} from 'lucide-react';

const importFormats = [
  { id: 'docx', label: 'DOCX', ext: '.docx', icon: FileText, desc: 'Microsoft Word document' },
  { id: 'pdf', label: 'PDF', ext: '.pdf', icon: File, desc: 'Portable Document Format' },
  { id: 'latex', label: 'LaTeX', ext: '.tex', icon: Type, desc: 'LaTeX source file' },
];

const templateOptions = [
  { id: 'ieee', name: 'IEEE', desc: 'Times New Roman 10pt, 2-column' },
  { id: 'wiley', name: 'Wiley', desc: 'Arial 11pt, 1-column' },
  { id: 'elsevier', name: 'Elsevier/ScienceDirect', desc: 'Times New Roman 12pt, 1-column' },
  { id: 'nature', name: 'Nature', desc: 'Arial 11pt, 1-column' },
  { id: 'springer', name: 'Springer', desc: 'Times New Roman 11pt, 1-column' },
  { id: 'spie', name: 'SPIE', desc: 'Times New Roman 10pt, 1-column' },
  { id: 'intechopen', name: 'IntechOpen', desc: 'Times New Roman 12pt, 1-column' },
  { id: 'hindawi', name: 'Hindawi', desc: 'Times New Roman 12pt, 1-column' },
];

const parsedSections = [
  'Title', 'Authors & Affiliations', 'Abstract', 'Keywords',
  'Introduction', 'Literature Review', 'Methodology',
  'Results & Discussion', 'Conclusion', 'References',
];

export default function ImportPanel() {
  const { importDocument, journalTemplates, activeFormatConfig, importedDocName } = useResearchStore();

  const [step, setStep] = useState<'format' | 'template' | 'preview' | 'done'>('format');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ieee');
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');

  const config = journalFormatConfigs[selectedTemplate];

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      importDocument(fileName || 'Imported Document', selectedTemplate);
      setImporting(false);
      setStep('done');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--foreground)' }}>
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Upload size={14} style={{ color: 'var(--primary)' }} />
          <h3 className="text-xs font-semibold">Import Document</h3>
        </div>
        <p className="text-[10px] opacity-50">Import and fit to journal template</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Step 1: Select format */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
              step === 'format' ? '' : 'opacity-50')}
              style={step === 'format' ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { backgroundColor: 'var(--background)' }}
            >1</span>
            <span className="text-xs font-medium">Select File Format</span>
          </div>

          <div className="space-y-1.5 ml-7">
            {importFormats.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => { setSelectedFormat(fmt.id); setStep('template'); }}
                className={cn('w-full flex items-center gap-3 p-2 rounded border text-left transition-all',
                  selectedFormat === fmt.id ? 'border-2' : 'opacity-70 hover:opacity-100')}
                style={{ borderColor: selectedFormat === fmt.id ? 'var(--primary)' : 'var(--border)', backgroundColor: 'var(--background)' }}
              >
                <fmt.icon size={16} style={selectedFormat === fmt.id ? { color: 'var(--primary)' } : undefined} />
                <div>
                  <p className="text-xs font-medium">{fmt.label}</p>
                  <p className="text-[10px] opacity-50">{fmt.desc}</p>
                </div>
                {selectedFormat === fmt.id && <CheckCircle2 size={14} className="ml-auto" style={{ color: 'var(--primary)' }} />}
              </button>
            ))}
          </div>

          {selectedFormat && (
            <div className="ml-7 mt-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Document name (e.g., my_paper.docx)"
                className="w-full text-xs px-2 py-1.5 rounded border"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              />
            </div>
          )}
        </div>

        {/* Step 2: Select template */}
        {(step === 'template' || step === 'preview' || step === 'done') && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                step === 'template' ? '' : 'opacity-50')}
                style={step === 'template' || step === 'preview' || step === 'done' ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { backgroundColor: 'var(--background)' }}
              >2</span>
              <span className="text-xs font-medium">Choose Journal Template</span>
            </div>

            <div className="space-y-1 ml-7 max-h-48 overflow-y-auto">
              {templateOptions.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => { setSelectedTemplate(tmpl.id); setStep('preview'); }}
                  className={cn('w-full flex items-center gap-2 p-2 rounded border text-left',
                    selectedTemplate === tmpl.id ? 'border-2' : 'opacity-60 hover:opacity-100')}
                  style={{ borderColor: selectedTemplate === tmpl.id ? 'var(--primary)' : 'var(--border)', backgroundColor: 'var(--background)' }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium">{tmpl.name}</p>
                    <p className="text-[10px] opacity-50">{tmpl.desc}</p>
                  </div>
                  {selectedTemplate === tmpl.id && <CheckCircle2 size={12} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preview formatting */}
        {(step === 'preview' || step === 'done') && config && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >3</span>
              <span className="text-xs font-medium">Template Formatting</span>
            </div>

            <div className="ml-7 rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Type size={10} className="opacity-50" />
                  <span className="opacity-50">Font:</span>
                  <span className="font-medium">{config.fontFamily}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ruler size={10} className="opacity-50" />
                  <span className="opacity-50">Size:</span>
                  <span className="font-medium">{config.fontSize}pt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {config.columnCount === 2 ? <Columns size={10} className="opacity-50" /> : <AlignLeft size={10} className="opacity-50" />}
                  <span className="opacity-50">Columns:</span>
                  <span className="font-medium">{config.columnCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowDownToLine size={10} className="opacity-50" />
                  <span className="opacity-50">Spacing:</span>
                  <span className="font-medium">{config.lineSpacing}x</span>
                </div>
              </div>
              <div className="text-[10px] opacity-50">
                Margins: {config.margins.top}&quot; top, {config.margins.bottom}&quot; bottom, {config.margins.left}&quot; left, {config.margins.right}&quot; right
              </div>
              <div className="text-[10px] opacity-50">
                Citation style: {config.citationStyle}
              </div>
            </div>

            {/* Detected sections */}
            <div className="ml-7 mt-3">
              <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1">Auto-detected Sections</p>
              <div className="flex flex-wrap gap-1">
                {parsedSections.map((sec) => (
                  <span key={sec} className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Import button */}
        {step === 'preview' && (
          <div className="ml-7">
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {importing ? (
                <><Loader2 size={14} className="animate-spin" /> Importing & Fitting...</>
              ) : (
                <><ArrowDownToLine size={14} /> Import & Apply Template</>
              )}
            </button>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="ml-7 rounded-lg border p-4 text-center" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--primary)' }}>
            <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: 'var(--primary-foreground)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--primary-foreground)' }}>
              Document imported successfully!
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--primary-foreground)', opacity: 0.7 }}>
              Template formatting applied: {templateOptions.find((t) => t.id === selectedTemplate)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
