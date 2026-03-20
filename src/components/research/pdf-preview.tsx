'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useResearchStore, journalFormatConfigs } from '@/store/research-store';
import type { TemplateFormatConfig, Section, Citation, Figure, ResearchTable, Equation } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  X, Download, Printer, ZoomIn, ZoomOut, FileText,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
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

      {/* Preview content */}
      <div
        className="flex-1 overflow-auto"
        style={{ backgroundColor: '#374151' }}
      >
        <div
          className="mx-auto my-4 shadow-2xl"
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
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-t shrink-0 text-[10px] opacity-50"
        style={{ borderColor: 'var(--border)' }}
      >
        <span>{config.fontFamily} {config.fontSize}pt &bull; {config.lineSpacing}x spacing</span>
        <span>Margins: {config.margins.top}&quot; / {config.margins.bottom}&quot; / {config.margins.left}&quot; / {config.margins.right}&quot;</span>
      </div>
    </div>
  );
}
