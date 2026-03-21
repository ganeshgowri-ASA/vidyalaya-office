'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useResearchStore, journalFormatConfigs } from '@/store/research-store';
import type { TemplateFormatConfig, Section, Citation, Figure, ResearchTable, Equation } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  X, Download, Printer, ZoomIn, ZoomOut, FileText,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Highlighter, MessageSquare, Bookmark, Stamp, Columns,
  PenTool, Type, StickyNote, Eye, EyeOff,
} from 'lucide-react';

function formatCitationIEEE(c: Citation, index: number): string {
  const authors = c.authors.join(', ');
  const title = `"${c.title},"`;
  const source = c.journal || c.conference || c.publisher || '';
  const vol = c.volume ? `, vol. ${c.volume}` : '';
  const issue = c.issue ? `, no. ${c.issue}` : '';
  const pages = c.pages ? `, pp. ${c.pages}` : '';
  return `[${index + 1}] ${authors}, ${title} ${source}${vol}${issue}${pages}, ${c.year}.`;
}

function formatCitationAPA(c: Citation): string {
  const authors = c.authors.join(', ');
  const title = c.journal ? c.title : `<i>${c.title}</i>`;
  const source = c.journal ? `<i>${c.journal}</i>` : (c.publisher || c.conference || '');
  const vol = c.volume ? `, <i>${c.volume}</i>` : '';
  const issue = c.issue ? `(${c.issue})` : '';
  const pages = c.pages ? `, ${c.pages}` : '';
  return `${authors} (${c.year}). ${title}. ${source}${vol}${issue}${pages}.`;
}

function formatCitationVancouver(c: Citation, index: number): string {
  const authors = c.authors.join(', ');
  const source = c.journal || c.conference || c.publisher || '';
  const vol = c.volume ? `;${c.volume}` : '';
  const issue = c.issue ? `(${c.issue})` : '';
  const pages = c.pages ? `:${c.pages}` : '';
  return `${index + 1}. ${authors}. ${c.title}. ${source}. ${c.year}${vol}${issue}${pages}.`;
}

function formatCitationNature(c: Citation, index: number): string {
  const authors = c.authors.join(', ');
  const source = c.journal ? `<i>${c.journal}</i>` : (c.conference || c.publisher || '');
  const vol = c.volume ? ` <b>${c.volume}</b>` : '';
  const pages = c.pages ? `, ${c.pages}` : '';
  return `${index + 1}. ${authors} ${c.title}. ${source}${vol}${pages} (${c.year}).`;
}

function formatCitation(c: Citation, index: number, style: string): string {
  switch (style) {
    case 'IEEE': return formatCitationIEEE(c, index);
    case 'APA 7th': return formatCitationAPA(c);
    case 'Vancouver': return formatCitationVancouver(c, index);
    case 'Nature': return formatCitationNature(c, index);
    default: return formatCitationIEEE(c, index);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSectionContent(content: string): string {
  let html = escapeHtml(content);
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Line breaks to paragraphs
  html = html.split('\n\n').map((p) => {
    if (p.startsWith('- ') || p.includes('\n- ')) {
      const items = p.split('\n').filter((l) => l.startsWith('- ')).map((l) => `<li>${l.slice(2)}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
  return html;
}

function buildDocumentHtml(
  sections: Section[],
  citations: Citation[],
  figures: Figure[],
  tables: ResearchTable[],
  equations: Equation[],
  config: TemplateFormatConfig,
  templateName: string,
): string {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const titleSection = sorted.find((s) => s.title === 'Title');
  const authorsSection = sorted.find((s) => s.title === 'Authors & Affiliations');
  const abstractSection = sorted.find((s) => s.title === 'Abstract');
  const keywordsSection = sorted.find((s) => s.title === 'Keywords');
  const refsSection = sorted.find((s) => s.title === 'References');
  const contentSections = sorted.filter(
    (s) => !['Title', 'Authors & Affiliations', 'Abstract', 'Keywords', 'References', 'Appendices'].includes(s.title)
  );

  const is2Col = config.columnCount === 2;
  const marginTop = config.margins.top;
  const marginBottom = config.margins.bottom;
  const marginLeft = config.margins.left;
  const marginRight = config.margins.right;
  const fontSize = config.fontSize;
  const headingSize = config.headingSize;
  const fontFamily = config.fontFamily;
  const lineSpacing = config.lineSpacing;

  let sectionCounter = 0;
  let figureHtml = '';
  let tableHtml = '';
  let equationHtml = '';

  figures.forEach((fig) => {
    figureHtml += `
      <div class="figure-container">
        <div class="figure-placeholder">
          <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
            <rect width="100" height="60" rx="4" fill="#1e293b"/>
            <path d="M20 45L35 25L50 40L60 30L80 45" stroke="#475569" stroke-width="2" fill="none"/>
            <circle cx="30" cy="18" r="6" fill="#475569"/>
          </svg>
        </div>
        <p class="figure-caption"><strong>Fig. ${fig.number}.</strong> ${escapeHtml(fig.caption)}</p>
      </div>`;
  });

  tables.forEach((tbl) => {
    const headerRow = tbl.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
    const bodyRows = tbl.rows.map((row) =>
      `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    ).join('');
    tableHtml += `
      <div class="table-container">
        <p class="table-caption"><strong>Table ${tbl.number}.</strong> ${escapeHtml(tbl.caption)}</p>
        <table class="data-table">
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  });

  equations.forEach((eq) => {
    equationHtml += `
      <div class="equation-container">
        <span class="equation-content">${escapeHtml(eq.latex)}</span>
        <span class="equation-number">(${eq.number})</span>
      </div>`;
  });

  const referencesHtml = citations.map((c, i) =>
    `<p class="reference-item">${formatCitation(c, i, config.citationStyle)}</p>`
  ).join('');

  const bodySections = contentSections.map((s) => {
    if (!s.content.trim()) return '';
    sectionCounter++;
    const romanOrNum = is2Col ? `${sectionCounter}.` : `${sectionCounter}.`;
    return `
      <div class="body-section">
        <h2 class="section-heading">${is2Col ? romanOrNum.toUpperCase() : romanOrNum} ${escapeHtml(s.title).toUpperCase()}</h2>
        <div class="section-body">${renderSectionContent(s.content)}</div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @page {
    size: 8.5in 11in;
    margin: ${marginTop}in ${marginRight}in ${marginBottom}in ${marginLeft}in;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: '${fontFamily}', 'Times New Roman', serif;
    font-size: ${fontSize}pt;
    line-height: ${lineSpacing * 1.4};
    color: #1a1a1a;
    background: white;
    padding: ${marginTop}in ${marginRight}in ${marginBottom}in ${marginLeft}in;
  }
  .page-header {
    text-align: center;
    font-size: ${fontSize - 2}pt;
    color: #666;
    border-bottom: 0.5px solid #ccc;
    padding-bottom: 4pt;
    margin-bottom: 12pt;
  }
  .article-title {
    text-align: center;
    font-size: ${headingSize + 4}pt;
    font-weight: bold;
    margin-bottom: 8pt;
    line-height: 1.2;
  }
  .article-authors {
    text-align: center;
    font-size: ${fontSize}pt;
    margin-bottom: 6pt;
    white-space: pre-line;
  }
  .article-abstract {
    margin: 12pt 0;
    ${!is2Col ? `padding: 0 ${is2Col ? 0 : 0.25}in;` : ''}
  }
  .article-abstract .abstract-label {
    font-weight: bold;
    font-size: ${fontSize}pt;
    font-style: italic;
  }
  .article-abstract .abstract-text {
    font-size: ${fontSize}pt;
    text-align: justify;
    margin-top: 4pt;
  }
  .article-keywords {
    font-size: ${fontSize - 1}pt;
    font-style: italic;
    margin-bottom: 12pt;
    ${!is2Col ? `padding: 0 0.25in;` : ''}
  }
  .article-keywords strong {
    font-style: italic;
  }
  ${is2Col ? `
  .two-column {
    column-count: 2;
    column-gap: 0.25in;
    column-rule: 0.5px solid #eee;
  }
  .two-column .figure-container,
  .two-column .table-container {
    break-inside: avoid;
  }
  ` : ''}
  .body-section {
    margin-bottom: 10pt;
  }
  .section-heading {
    font-size: ${headingSize}pt;
    font-weight: bold;
    margin-bottom: 6pt;
    margin-top: 12pt;
    ${is2Col ? 'text-align: center;' : ''}
  }
  .section-body {
    text-align: justify;
  }
  .section-body p {
    margin-bottom: ${lineSpacing * 6}pt;
    text-indent: ${is2Col ? '1em' : '0'};
  }
  .section-body ul {
    margin: 4pt 0 8pt 18pt;
    list-style-type: disc;
  }
  .section-body li {
    margin-bottom: 2pt;
  }
  .figure-container {
    margin: 12pt auto;
    text-align: center;
    break-inside: avoid;
  }
  .figure-placeholder {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 20pt 10pt;
    display: inline-block;
  }
  .figure-caption {
    font-size: ${fontSize - 1}pt;
    text-align: center;
    margin-top: 4pt;
    color: #333;
  }
  .table-container {
    margin: 12pt 0;
    break-inside: avoid;
  }
  .table-caption {
    font-size: ${fontSize - 1}pt;
    margin-bottom: 4pt;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${fontSize - 1}pt;
  }
  .data-table th, .data-table td {
    border: 0.5px solid #999;
    padding: 3pt 6pt;
    text-align: left;
  }
  .data-table th {
    background: #f0f0f0;
    font-weight: bold;
  }
  .equation-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10pt 0;
    gap: 16pt;
  }
  .equation-content {
    font-family: 'Cambria Math', 'Times New Roman', serif;
    font-style: italic;
    font-size: ${fontSize + 1}pt;
  }
  .equation-number {
    font-size: ${fontSize}pt;
    color: #555;
  }
  .references-section {
    margin-top: 16pt;
    ${is2Col ? 'column-span: all;' : ''}
  }
  .references-heading {
    font-size: ${headingSize}pt;
    font-weight: bold;
    margin-bottom: 8pt;
    ${is2Col ? 'text-align: center;' : ''}
  }
  .reference-item {
    font-size: ${fontSize - 1}pt;
    margin-bottom: 3pt;
    text-indent: -1.5em;
    padding-left: 1.5em;
    line-height: 1.3;
  }
  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: ${fontSize - 2}pt;
    color: #999;
    padding: 8pt;
  }
  @media print {
    body { padding: 0; }
    .page-footer { display: block; }
  }
</style>
</head>
<body>
  <div class="page-header">${escapeHtml(templateName)} Format &mdash; Vidyalaya Research</div>

  <div class="article-title">${titleSection ? escapeHtml(titleSection.content.split('\n')[0]) : 'Untitled'}</div>

  ${authorsSection ? `<div class="article-authors">${escapeHtml(authorsSection.content)}</div>` : ''}

  ${abstractSection ? `
  <div class="article-abstract">
    <span class="abstract-label">Abstract&mdash;</span>
    <span class="abstract-text">${escapeHtml(abstractSection.content)}</span>
  </div>` : ''}

  ${keywordsSection ? `
  <div class="article-keywords">
    <strong>Keywords:</strong> ${escapeHtml(keywordsSection.content)}
  </div>` : ''}

  <div class="${is2Col ? 'two-column' : ''}">
    ${bodySections}

    ${figureHtml}
    ${tableHtml}
    ${equationHtml}
  </div>

  <div class="references-section">
    <h2 class="references-heading">REFERENCES</h2>
    ${referencesHtml}
  </div>

  <div class="page-footer">Page 1</div>
</body>
</html>`;
}

export default function PdfPreview() {
  const {
    sections, citations, figures, tables, equations,
    selectedTemplateId, citationStyle, activeFormatConfig,
    journalTemplates, pdfPreviewOpen, setPdfPreviewOpen,
  } = useResearchStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [zoom, setZoom] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  // Enhanced PDF Preview state
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<string | null>(null);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('DRAFT');
  const [sideBySide, setSideBySide] = useState(false);
  const [annotations, setAnnotations] = useState<Array<{ id: string; type: string; text: string; page: number; timestamp: string }>>([
    { id: 'ann-1', type: 'highlight', text: 'Key finding highlighted', page: 1, timestamp: new Date().toISOString() },
    { id: 'ann-2', type: 'comment', text: 'Consider revising methodology description', page: 1, timestamp: new Date().toISOString() },
    { id: 'ann-3', type: 'bookmark', text: 'Results section bookmarked', page: 2, timestamp: new Date().toISOString() },
  ]);
  const [showAnnotationsList, setShowAnnotationsList] = useState(false);

  const config: TemplateFormatConfig = useMemo(() => {
    if (activeFormatConfig) return activeFormatConfig;
    return journalFormatConfigs[selectedTemplateId] || journalFormatConfigs['ieee'];
  }, [activeFormatConfig, selectedTemplateId]);

  const templateName = useMemo(() => {
    const tpl = journalTemplates.find((t) => t.id === selectedTemplateId);
    return tpl?.name || 'IEEE Transactions';
  }, [journalTemplates, selectedTemplateId]);

  const generateHtml = useCallback(() => {
    return buildDocumentHtml(sections, citations, figures, tables, equations, config, templateName);
  }, [sections, citations, figures, tables, equations, config, templateName]);

  // Debounced real-time update
  useEffect(() => {
    if (!pdfPreviewOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setHtmlContent(generateHtml());
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sections, citations, figures, tables, equations, config, templateName, pdfPreviewOpen, generateHtml]);

  // Initial render
  useEffect(() => {
    if (pdfPreviewOpen && !htmlContent) {
      setHtmlContent(generateHtml());
    }
  }, [pdfPreviewOpen, htmlContent, generateHtml]);

  const handleExportPdf = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.print();
  }, []);

  const handlePrint = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.print();
  }, []);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const titleSection = sections.find((s) => s.title === 'Title');
    const title = titleSection?.content.split('\n')[0] || 'article';
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}_preview.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [htmlContent, sections]);

  if (!pdfPreviewOpen) return null;

  const blobUrl = htmlContent ? URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' })) : '';

  return (
    <div
      className={cn(
        'flex flex-col border-l',
        isFullscreen ? 'fixed inset-0 z-50' : 'shrink-0'
      )}
      style={{
        width: isFullscreen ? '100%' : 480,
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <FileText size={14} style={{ color: 'var(--primary)' }} />
        <span className="text-xs font-semibold flex-1">PDF Preview</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {templateName}
        </span>
        <span className="text-[10px] opacity-40">
          {config.columnCount === 2 ? '2-col' : '1-col'}
        </span>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          title="Export PDF (uses browser print dialog)"
        >
          <Download size={12} /> Export PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--border)' }}
          title="Print preview"
        >
          <Printer size={12} /> Print
        </button>
        <button
          onClick={handleDownloadHtml}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--border)' }}
          title="Download as HTML"
        >
          <Download size={12} /> HTML
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setZoom(Math.max(25, zoom - 25))}
          className="p-1 rounded opacity-60 hover:opacity-100"
          title="Zoom out"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] opacity-50 min-w-[30px] text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 25))}
          className="p-1 rounded opacity-60 hover:opacity-100"
          title="Zoom in"
        >
          <ZoomIn size={13} />
        </button>

        <button
          onClick={() => setShowAnnotationTools(!showAnnotationTools)}
          className={cn('p-1 rounded transition-opacity ml-1', showAnnotationTools ? 'opacity-100' : 'opacity-60 hover:opacity-100')}
          style={showAnnotationTools ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          title="Annotation tools"
        >
          <PenTool size={13} />
        </button>

        <button
          onClick={() => setSideBySide(!sideBySide)}
          className={cn('p-1 rounded transition-opacity', sideBySide ? 'opacity-100' : 'opacity-60 hover:opacity-100')}
          style={sideBySide ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          title="Side-by-side view"
        >
          <Columns size={13} />
        </button>

        <button
          onClick={() => setShowWatermark(!showWatermark)}
          className={cn('p-1 rounded transition-opacity', showWatermark ? 'opacity-100' : 'opacity-60 hover:opacity-100')}
          style={showWatermark ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
          title={showWatermark ? 'Hide watermark' : 'Show watermark'}
        >
          <Stamp size={13} />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 rounded opacity-60 hover:opacity-100 ml-1"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        <button
          onClick={() => { setPdfPreviewOpen(false); setIsFullscreen(false); }}
          className="p-1 rounded opacity-60 hover:opacity-100 ml-1"
          title="Close preview"
        >
          <X size={14} />
        </button>
      </div>

      {/* Annotation Tools Bar */}
      {showAnnotationTools && (
        <div className="flex items-center gap-1 px-2 py-1 border-b shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
          {[
            { id: 'highlight', icon: Highlighter, label: 'Highlight' },
            { id: 'comment', icon: MessageSquare, label: 'Comment' },
            { id: 'text', icon: Type, label: 'Text note' },
            { id: 'sticky', icon: StickyNote, label: 'Sticky note' },
            { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveAnnotationTool(activeAnnotationTool === tool.id ? null : tool.id)}
              className={cn('p-1.5 rounded text-[10px] flex items-center gap-1 transition-colors', activeAnnotationTool === tool.id ? 'opacity-100' : 'opacity-50 hover:opacity-80')}
              style={activeAnnotationTool === tool.id ? { backgroundColor: 'var(--sidebar-accent)' } : undefined}
              title={tool.label}
            >
              <tool.icon size={12} />
              <span>{tool.label}</span>
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setShowAnnotationsList(!showAnnotationsList)}
            className="text-[10px] opacity-50 hover:opacity-80 flex items-center gap-1"
          >
            {showAnnotationsList ? <EyeOff size={10} /> : <Eye size={10} />}
            {annotations.length} annotations
          </button>
        </div>
      )}

      {/* Watermark Settings */}
      {showWatermark && (
        <div className="flex items-center gap-2 px-2 py-1 border-b shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
          <Stamp size={11} className="opacity-50" />
          <span className="text-[10px] opacity-50">Watermark:</span>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            className="text-[10px] px-1.5 py-0.5 rounded bg-transparent border outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)', width: 100 }}
          />
        </div>
      )}

      {/* Preview content */}
      <div className={cn('flex-1 overflow-auto flex', sideBySide ? 'flex-row' : 'flex-col')} style={{ backgroundColor: '#374151' }}>
        <div className={cn('overflow-auto', sideBySide ? 'flex-1' : 'flex-1')}>
          <div
            className="mx-auto my-4 shadow-2xl relative"
            style={{
              width: `${(8.5 * zoom / 100) * 96}px`,
              minHeight: `${(11 * zoom / 100) * 96}px`,
              transform: `scale(1)`,
              transformOrigin: 'top center',
            }}
          >
            {htmlContent && (
              <iframe
                ref={iframeRef}
                srcDoc={htmlContent}
                className="w-full border-0"
                style={{
                  width: '100%',
                  minHeight: `${(11 * zoom / 100) * 96}px`,
                  background: 'white',
                }}
                title="PDF Preview"
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            )}
            {/* Watermark Overlay */}
            {showWatermark && watermarkText && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" style={{ zIndex: 10 }}>
                <span
                  className="text-6xl font-bold uppercase select-none"
                  style={{
                    color: 'rgba(200, 0, 0, 0.12)',
                    transform: 'rotate(-35deg)',
                    letterSpacing: '0.15em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {watermarkText}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Annotations Side Panel (in side-by-side or when toggled) */}
        {showAnnotationsList && (
          <div
            className={cn('border-l overflow-y-auto', sideBySide ? 'w-64' : 'w-64 absolute right-0 top-0 bottom-0 z-20')}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="p-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[11px] font-semibold">Annotations ({annotations.length})</span>
              <button onClick={() => setShowAnnotationsList(false)} className="p-0.5 opacity-50 hover:opacity-100">
                <X size={12} />
              </button>
            </div>
            <div className="p-1.5 space-y-1">
              {annotations.map(ann => (
                <div
                  key={ann.id}
                  className="p-2 rounded border text-[10px]"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {ann.type === 'highlight' && <Highlighter size={10} className="text-yellow-400" />}
                    {ann.type === 'comment' && <MessageSquare size={10} className="text-blue-400" />}
                    {ann.type === 'bookmark' && <Bookmark size={10} className="text-green-400" />}
                    <span className="capitalize font-medium">{ann.type}</span>
                    <span className="opacity-40 ml-auto">Page {ann.page}</span>
                  </div>
                  <p className="opacity-70 leading-relaxed">{ann.text}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <button className="p-0.5 opacity-30 hover:opacity-70" title="Delete">
                      <X size={9} />
                    </button>
                  </div>
                </div>
              ))}
              {annotations.length === 0 && (
                <p className="text-center text-[10px] opacity-40 py-6">No annotations yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-t shrink-0 text-[10px] opacity-50"
        style={{ borderColor: 'var(--border)' }}
      >
        <span>{config.fontFamily} {config.fontSize}pt &bull; {config.lineSpacing}x spacing</span>
        <div className="flex items-center gap-2">
          {showWatermark && <span className="text-yellow-400">WATERMARK: {watermarkText}</span>}
          {sideBySide && <span className="text-blue-400">SIDE-BY-SIDE</span>}
          <span>Margins: {config.margins.top}&quot; / {config.margins.bottom}&quot; / {config.margins.left}&quot; / {config.margins.right}&quot;</span>
        </div>
      </div>
    </div>
  );
}
