'use client';

import { useState, useCallback } from 'react';
import { useResearchStore, JournalTemplate } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Wand2, ChevronRight, ChevronLeft, FileText, Users, BookOpen,
  Sparkles, Upload, Eye, Check, X, Search, LayoutGrid,
  FileCode, Tag, ArrowRight,
} from 'lucide-react';

interface WizardStep {
  id: string;
  label: string;
  icon: typeof FileText;
}

const steps: WizardStep[] = [
  { id: 'template', label: 'Choose Template', icon: LayoutGrid },
  { id: 'metadata', label: 'Project Details', icon: FileText },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'references', label: 'References', icon: BookOpen },
  { id: 'generate', label: 'AI Generate', icon: Sparkles },
  { id: 'preview', label: 'Preview', icon: Eye },
];

const templateCategories = [
  'All', 'IEEE', 'Elsevier', 'Springer Nature', 'Nature', 'Wiley', 'ACM',
  'Conference', 'Review', 'Academic', 'AIP', 'Other',
];

interface WizardAuthor {
  name: string;
  affiliation: string;
  email: string;
  orcid: string;
  corresponding: boolean;
}

interface WizardData {
  templateId: string;
  title: string;
  abstract: string;
  keywords: string;
  description: string;
  authors: WizardAuthor[];
  droppedFiles: { name: string; type: string }[];
  generateContent: boolean;
  generatedSections: string[];
}

export default function ProjectWizard({ onClose }: { onClose: () => void }) {
  const { journalTemplates, createArticle, applyTemplate, addAuthor, addCitation } = useResearchStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [wizardData, setWizardData] = useState<WizardData>({
    templateId: '',
    title: '',
    abstract: '',
    keywords: '',
    description: '',
    authors: [{ name: '', affiliation: '', email: '', orcid: '', corresponding: true }],
    droppedFiles: [],
    generateContent: true,
    generatedSections: [],
  });

  const selectedTemplate = journalTemplates.find((t) => t.id === wizardData.templateId);

  const updateField = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setWizardData((prev) => ({ ...prev, [key]: value }));
  };

  const filteredTemplates = journalTemplates.filter((t) => {
    const matchesSearch = !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
      t.category === selectedCategory ||
      (selectedCategory === 'Other' && !templateCategories.slice(1, -1).includes(t.category));
    return matchesSearch && matchesCategory;
  });

  const addWizardAuthor = () => {
    updateField('authors', [...wizardData.authors, { name: '', affiliation: '', email: '', orcid: '', corresponding: false }]);
  };

  const updateWizardAuthor = (index: number, field: keyof WizardAuthor, value: string | boolean) => {
    const updated = wizardData.authors.map((a, i) => {
      if (i === index) return { ...a, [field]: value };
      if (field === 'corresponding' && value === true) return { ...a, corresponding: false };
      return a;
    });
    updateField('authors', updated);
  };

  const removeWizardAuthor = (index: number) => {
    if (wizardData.authors.length <= 1) return;
    updateField('authors', wizardData.authors.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const fileInfos = files.map((f) => ({ name: f.name, type: f.type || f.name.split('.').pop() || 'unknown' }));
    updateField('droppedFiles', [...wizardData.droppedFiles, ...fileInfos]);
  }, [wizardData.droppedFiles]);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI content generation
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const template = selectedTemplate;
    if (template) {
      const sections = template.sections.map((section) => {
        if (section.toLowerCase() === 'abstract') return wizardData.abstract || 'Abstract content will be generated based on your description.';
        if (section.toLowerCase() === 'keywords') return wizardData.keywords || 'keyword1, keyword2, keyword3';
        if (section.toLowerCase() === 'introduction') {
          return `This paper presents ${wizardData.title || 'a novel approach'}. ${wizardData.description || 'The research addresses key challenges in the field.'}`;
        }
        return `[AI-generated placeholder for ${section} section based on project description]`;
      });
      updateField('generatedSections', sections);
    }
    setGenerating(false);
    setGenerated(true);
  };

  const handleCreate = () => {
    createArticle(wizardData.title || 'Untitled Research Article', wizardData.templateId || undefined);

    // Add authors
    wizardData.authors.forEach((author) => {
      if (author.name) {
        addAuthor({
          name: author.name,
          affiliation: author.affiliation,
          email: author.email,
          orcid: author.orcid || undefined,
          corresponding: author.corresponding,
        });
      }
    });

    onClose();
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'template': return !!wizardData.templateId;
      case 'metadata': return !!wizardData.title;
      case 'authors': return wizardData.authors.some((a) => !!a.name);
      default: return true;
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'template':
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-4 pb-2">
              <h3 className="text-sm font-semibold mb-1">Choose a Journal Template</h3>
              <p className="text-[10px] opacity-50 mb-3">Select from {journalTemplates.length}+ templates for major publishers</p>

              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full text-xs pl-7 pr-2.5 py-1.5 rounded border outline-none"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {templateCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full transition-colors',
                      selectedCategory === cat ? 'font-medium' : 'opacity-50 hover:opacity-80'
                    )}
                    style={selectedCategory === cat ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { backgroundColor: 'var(--sidebar-accent)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => updateField('templateId', template.id)}
                    className={cn(
                      'text-left p-3 rounded-lg border transition-all',
                      wizardData.templateId === template.id ? 'ring-2' : 'hover:opacity-80'
                    )}
                    style={{
                      borderColor: wizardData.templateId === template.id ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: 'var(--card)',
                      ...(wizardData.templateId === template.id ? { '--tw-ring-color': 'var(--primary)' } as React.CSSProperties : {}),
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-8 h-10 rounded border flex items-center justify-center shrink-0"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                      >
                        <FileCode size={14} className="opacity-40" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{template.name}</p>
                        <p className="text-[10px] opacity-40 mt-0.5">{template.category}</p>
                        <p className="text-[10px] opacity-30 mt-0.5 line-clamp-2">{template.description}</p>
                      </div>
                      {wizardData.templateId === template.id && (
                        <Check size={14} style={{ color: 'var(--primary)' }} className="shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[9px] opacity-40">
                      <span>{template.columns === 2 ? 'Two-column' : 'Single-column'}</span>
                      <span>·</span>
                      <span>{template.referenceStyle}</span>
                      {template.wordLimit && (
                        <>
                          <span>·</span>
                          <span>{template.wordLimit.toLocaleString()} words</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'metadata':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-sm font-semibold mb-1">Project Details</h3>
            <p className="text-[10px] opacity-50 mb-4">Enter the core information for your research project</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1">Title *</label>
                <input
                  type="text"
                  value={wizardData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter your article title"
                  className="w-full text-xs px-3 py-2 rounded-lg border outline-none"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Abstract</label>
                <textarea
                  value={wizardData.abstract}
                  onChange={(e) => updateField('abstract', e.target.value)}
                  placeholder="Write or paste your abstract..."
                  rows={5}
                  className="w-full text-xs px-3 py-2 rounded-lg border outline-none resize-none"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <span className="text-[10px] opacity-40">
                  {wizardData.abstract.split(/\s+/).filter(Boolean).length} words
                  {selectedTemplate?.abstractLimit && ` / ${selectedTemplate.abstractLimit} limit`}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Keywords</label>
                <input
                  type="text"
                  value={wizardData.keywords}
                  onChange={(e) => updateField('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full text-xs px-3 py-2 rounded-lg border outline-none"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <span className="text-[10px] opacity-40 flex items-center gap-1 mt-0.5">
                  <Tag size={9} /> Comma-separated
                </span>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Project Description (for AI)</label>
                <textarea
                  value={wizardData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your research project in a few sentences. This will help AI generate initial content..."
                  rows={4}
                  className="w-full text-xs px-3 py-2 rounded-lg border outline-none resize-none"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            </div>
          </div>
        );

      case 'authors':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-sm font-semibold mb-1">Authors</h3>
            <p className="text-[10px] opacity-50 mb-4">Add the authors of this research paper</p>

            <div className="space-y-3">
              {wizardData.authors.map((author, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 relative"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium opacity-60">Author {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[10px] opacity-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={author.corresponding}
                          onChange={(e) => updateWizardAuthor(index, 'corresponding', e.target.checked)}
                          className="w-3 h-3"
                        />
                        Corresponding
                      </label>
                      {wizardData.authors.length > 1 && (
                        <button
                          onClick={() => removeWizardAuthor(index)}
                          className="opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => updateWizardAuthor(index, 'name', e.target.value)}
                      placeholder="Full Name *"
                      className="text-xs px-2.5 py-1.5 rounded border outline-none"
                      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <input
                      type="email"
                      value={author.email}
                      onChange={(e) => updateWizardAuthor(index, 'email', e.target.value)}
                      placeholder="Email"
                      className="text-xs px-2.5 py-1.5 rounded border outline-none"
                      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <input
                      type="text"
                      value={author.affiliation}
                      onChange={(e) => updateWizardAuthor(index, 'affiliation', e.target.value)}
                      placeholder="Affiliation"
                      className="text-xs px-2.5 py-1.5 rounded border outline-none col-span-2"
                      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <input
                      type="text"
                      value={author.orcid}
                      onChange={(e) => updateWizardAuthor(index, 'orcid', e.target.value)}
                      placeholder="ORCID (optional)"
                      className="text-xs px-2.5 py-1.5 rounded border outline-none col-span-2"
                      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addWizardAuthor}
                className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-dashed opacity-50 hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)' }}
              >
                <Users size={12} /> Add Another Author
              </button>
            </div>
          </div>
        );

      case 'references':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-sm font-semibold mb-1">Reference Materials</h3>
            <p className="text-[10px] opacity-50 mb-4">
              Drag & drop reference files to help populate your project
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                'rounded-lg border-2 border-dashed p-8 text-center transition-all mb-4',
                dragOver ? 'opacity-100' : 'opacity-60'
              )}
              style={{
                borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
                backgroundColor: dragOver ? 'var(--sidebar-accent)' : 'transparent',
              }}
            >
              <Upload size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium mb-1">Drop files here</p>
              <p className="text-[10px] opacity-40">PDF, BIB, images, or other reference materials</p>
            </div>

            {/* Dropped files list */}
            {wizardData.droppedFiles.length > 0 && (
              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] font-medium opacity-60">{wizardData.droppedFiles.length} files added</span>
                {wizardData.droppedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                  >
                    <FileText size={14} className="opacity-40 shrink-0" />
                    <span className="text-xs flex-1 truncate">{file.name}</span>
                    <span className="text-[10px] opacity-30">{file.type}</span>
                    <button
                      onClick={() => updateField('droppedFiles', wizardData.droppedFiles.filter((_, idx) => idx !== i))}
                      className="opacity-30 hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <p className="text-[10px] opacity-50">
                Supported file types: .pdf (papers), .bib (bibliography), .png/.jpg (figures), .csv/.xlsx (data tables).
                Files will be analyzed to auto-populate relevant sections.
              </p>
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-sm font-semibold mb-1">AI Content Generation</h3>
            <p className="text-[10px] opacity-50 mb-4">
              Generate initial content for your paper sections using AI
            </p>

            <div
              className="rounded-lg border p-4 mb-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-medium">Generation Summary</span>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="opacity-50 w-20">Template:</span>
                  <span className="font-medium">{selectedTemplate?.name || 'None selected'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-50 w-20">Title:</span>
                  <span className="font-medium truncate">{wizardData.title || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-50 w-20">Sections:</span>
                  <span className="font-medium">{selectedTemplate?.sections.length || 0} sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-50 w-20">Ref Files:</span>
                  <span className="font-medium">{wizardData.droppedFiles.length} files</span>
                </div>
              </div>
            </div>

            {selectedTemplate && (
              <div className="mb-4">
                <span className="text-xs font-medium block mb-2">Sections to generate:</span>
                <div className="space-y-1">
                  {selectedTemplate.sections.map((section, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded text-xs"
                      style={{ backgroundColor: 'var(--card)' }}
                    >
                      {generated ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <ArrowRight size={12} className="opacity-30" />
                      )}
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedTemplate}
              className="w-full flex items-center justify-center gap-2 text-xs px-4 py-2.5 rounded-lg font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {generating ? (
                <>
                  <Sparkles size={14} className="animate-pulse" /> Generating content...
                </>
              ) : generated ? (
                <>
                  <Check size={14} /> Content Generated
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate Initial Content
                </>
              )}
            </button>

            {!wizardData.generateContent && (
              <p className="text-[10px] opacity-40 text-center mt-2">
                You can skip this step and write content manually
              </p>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-sm font-semibold mb-1">Preview Project</h3>
            <p className="text-[10px] opacity-50 mb-4">Review your project before creating it</p>

            <div className="space-y-3">
              <div
                className="rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
              >
                <h4 className="text-lg font-bold mb-1">{wizardData.title || 'Untitled'}</h4>
                <div className="flex items-center gap-2 text-[10px] opacity-50 mb-3">
                  <span>{selectedTemplate?.name}</span>
                  <span>·</span>
                  <span>{selectedTemplate?.referenceStyle}</span>
                  <span>·</span>
                  <span>{selectedTemplate?.columns === 2 ? 'Two-column' : 'Single-column'}</span>
                </div>

                {/* Authors */}
                <div className="text-xs opacity-70 mb-3">
                  {wizardData.authors.filter((a) => a.name).map((a, i) => (
                    <span key={i}>
                      {a.name}{a.corresponding ? '*' : ''}
                      {i < wizardData.authors.filter((aa) => aa.name).length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>

                {/* Abstract */}
                {wizardData.abstract && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold opacity-60 block mb-0.5">Abstract</span>
                    <p className="text-xs opacity-70 leading-relaxed">{wizardData.abstract}</p>
                  </div>
                )}

                {/* Keywords */}
                {wizardData.keywords && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold opacity-60 block mb-0.5">Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {wizardData.keywords.split(',').map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--sidebar-accent)' }}
                        >
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sections */}
                {selectedTemplate && (
                  <div>
                    <span className="text-[10px] font-bold opacity-60 block mb-1">Sections</span>
                    <div className="space-y-0.5">
                      {selectedTemplate.sections.map((section, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs opacity-60">
                          <span className="w-4 text-[10px] opacity-30">{i + 1}.</span>
                          <span>{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LaTeX preview */}
              {selectedTemplate && (
                <div
                  className="rounded-lg border p-3"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                >
                  <span className="text-[10px] font-medium opacity-60 flex items-center gap-1 mb-2">
                    <FileCode size={10} /> Generated LaTeX Structure
                  </span>
                  <pre
                    className="text-[10px] font-mono overflow-x-auto p-2 rounded"
                    style={{ backgroundColor: 'var(--background)' }}
                  >
{`\\documentclass{${selectedTemplate.id === 'ieee' ? 'IEEEtran' : 'article'}}
\\title{${wizardData.title || 'Untitled'}}
\\author{${wizardData.authors.filter((a) => a.name).map((a) => a.name).join(' \\and ')}}
\\begin{document}
\\maketitle
${selectedTemplate.sections.map((s) => `\\section{${s}}`).join('\n')}
\\bibliography{references}
\\end{document}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-[900px] max-h-[85vh] rounded-xl border shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div className="flex items-center gap-2">
            <Wand2 size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold">New Research Project</span>
          </div>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div
          className="px-6 py-3 border-b flex items-center gap-1 shrink-0 overflow-x-auto"
          style={{ borderColor: 'var(--border)' }}
        >
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={cn(
                  'flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
                  i === currentStep ? 'font-medium' : i < currentStep ? 'opacity-60' : 'opacity-30'
                )}
                style={i === currentStep ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : i < currentStep ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
              >
                {i < currentStep ? <Check size={10} /> : <step.icon size={10} />}
                {step.label}
              </button>
              {i < steps.length - 1 && <ChevronRight size={12} className="opacity-20 mx-0.5" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderStep()}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <button
            onClick={onClose}
            className="text-xs px-4 py-1.5 rounded border opacity-60 hover:opacity-100 transition-opacity"
            style={{ borderColor: 'var(--border)' }}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1 text-xs px-4 py-1.5 rounded border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)' }}
              >
                <ChevronLeft size={12} /> Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1 text-xs px-4 py-1.5 rounded font-medium transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Next <ChevronRight size={12} />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="flex items-center gap-1 text-xs px-4 py-1.5 rounded font-medium"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Check size={12} /> Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
