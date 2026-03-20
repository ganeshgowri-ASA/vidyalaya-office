'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useResearchStore, journalFormatConfigs } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Subscript, Superscript, Link,
} from 'lucide-react';

function InlineToolbar({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        if (!showLinkInput) {
          setPosition(null);
        }
        return;
      }
      const range = sel.getRangeAt(0);
      const container = containerRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        if (!showLinkInput) {
          setPosition(null);
        }
        return;
      }
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setPosition({
        top: rect.top - containerRect.top - 44,
        left: rect.left - containerRect.left + rect.width / 2 - 100,
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef, showLinkInput]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
  }, []);

  const handleLink = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const applyLink = () => {
    if (linkUrl.trim() && savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      execCommand('createLink', linkUrl.trim());
    }
    setLinkUrl('');
    setShowLinkInput(false);
    savedRangeRef.current = null;
  };

  if (!position) return null;

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-lg shadow-lg border"
      style={{
        top: Math.max(0, position.top),
        left: Math.max(0, position.left),
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {showLinkInput ? (
        <div className="flex items-center gap-1">
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); } }}
            placeholder="https://..."
            className="text-xs px-2 py-1 rounded border outline-none w-48"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          />
          <button onClick={applyLink} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            OK
          </button>
        </div>
      ) : (
        <>
          <ToolBtn icon={Bold} label="Bold (Ctrl+B)" onClick={() => execCommand('bold')} />
          <ToolBtn icon={Italic} label="Italic (Ctrl+I)" onClick={() => execCommand('italic')} />
          <ToolBtn icon={Subscript} label="Subscript" onClick={() => execCommand('subscript')} />
          <ToolBtn icon={Superscript} label="Superscript" onClick={() => execCommand('superscript')} />
          <div className="w-px h-5 mx-0.5 opacity-20" style={{ backgroundColor: 'var(--border)' }} />
          <ToolBtn icon={Link} label="Link" onClick={handleLink} />
        </>
      )}
    </div>
  );
}

function ToolBtn({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 rounded hover:opacity-100 opacity-70 transition-opacity"
      style={{ color: 'var(--foreground)' }}
    >
      <Icon size={14} />
    </button>
  );
}

interface SectionBlockProps {
  sectionId: string;
  title: string;
  content: string;
  isActive: boolean;
  formatStyle: React.CSSProperties;
  onFocus: () => void;
  onChange: (html: string) => void;
}

function SectionBlock({ sectionId, title, content, isActive, formatStyle, onFocus, onChange }: SectionBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync store content to DOM only when content changes externally
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (ref.current && ref.current.innerHTML !== content) {
      ref.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (ref.current) {
      isInternalUpdate.current = true;
      onChange(ref.current.innerHTML);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
      if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
    }
  }, []);

  const isTitle = title === 'Title';
  const isAuthors = title === 'Authors & Affiliations';

  return (
    <div
      className={cn(
        'group rounded-lg transition-all mb-4',
        isActive ? 'ring-1' : 'hover:ring-1 hover:ring-opacity-30'
      )}
      style={isActive ? { outlineColor: 'var(--primary)' } : undefined}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg"
        style={{ backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent' }}
      >
        <span className={cn('text-xs font-semibold uppercase tracking-wider', isActive ? 'opacity-80' : 'opacity-40')}>
          {title}
        </span>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={onFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-section-id={sectionId}
        className={cn(
          'outline-none px-3 py-2 min-h-[2em] leading-relaxed',
          isTitle && 'text-xl font-bold text-center',
          isAuthors && 'text-center text-sm opacity-80',
          !isTitle && !isAuthors && 'text-sm',
        )}
        style={{
          ...formatStyle,
          color: 'var(--foreground)',
          wordBreak: 'break-word' as const,
        }}
        data-placeholder={`Write your ${title.toLowerCase()} here...`}
      />
    </div>
  );
}

export default function WysiwygCanvas() {
  const {
    sections, activeSection, setActiveSection, updateSectionContent,
    selectedTemplateId, doubleColumnEnabled, activeFormatConfig,
    figures, equations,
  } = useResearchStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  // Compute format styles from active template config
  const formatConfig = activeFormatConfig || journalFormatConfigs[selectedTemplateId] || journalFormatConfigs['ieee'];

  const formatStyle: React.CSSProperties = formatConfig ? {
    fontFamily: formatConfig.fontFamily,
    fontSize: `${formatConfig.fontSize}pt`,
    lineHeight: `${formatConfig.lineSpacing * 1.4}`,
  } : {};

  const marginStyle: React.CSSProperties = formatConfig ? {
    paddingTop: `${formatConfig.margins.top * 48}px`,
    paddingBottom: `${formatConfig.margins.bottom * 48}px`,
    paddingLeft: `${formatConfig.margins.left * 48}px`,
    paddingRight: `${formatConfig.margins.right * 48}px`,
  } : {};

  // Determine effective column count
  const effectiveColumnCount = doubleColumnEnabled ? 2 : (formatConfig?.columnCount || 1);

  const columnStyle: React.CSSProperties = effectiveColumnCount === 2 ? {
    columnCount: 2,
    columnGap: '24px',
    columnRule: '1px solid var(--border)',
  } : {};

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Sections that appear before the main body (not columned)
  const headerSections = ['Title', 'Authors & Affiliations', 'Abstract', 'Keywords'];
  const headerParts = sortedSections.filter((s) => headerSections.includes(s.title));
  const bodySections = sortedSections.filter((s) => !headerSections.includes(s.title));

  const handleSectionChange = useCallback((id: string, html: string) => {
    // Convert HTML to plain text for word count, but store HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    updateSectionContent(id, text);
  }, [updateSectionContent]);

  return (
    <div className="h-full flex">
      <div ref={canvasRef} className="flex-1 overflow-y-auto relative">
        <InlineToolbar containerRef={canvasRef} />

        {/* Paper canvas */}
        <div
          className="max-w-4xl mx-auto my-6 rounded-lg shadow-sm border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            ...marginStyle,
          }}
        >
          {/* Header sections (always single column) */}
          {headerParts.map((section) => (
            <SectionBlock
              key={section.id}
              sectionId={section.id}
              title={section.title}
              content={section.content}
              isActive={activeSection === section.id}
              formatStyle={formatStyle}
              onFocus={() => setActiveSection(section.id)}
              onChange={(html) => handleSectionChange(section.id, html)}
            />
          ))}

          {/* Body sections (may be 2-column) */}
          <div style={columnStyle}>
            {bodySections.map((section) => (
              <SectionBlock
                key={section.id}
                sectionId={section.id}
                title={section.title}
                content={section.content}
                isActive={activeSection === section.id}
                formatStyle={formatStyle}
                onFocus={() => setActiveSection(section.id)}
                onChange={(html) => handleSectionChange(section.id, html)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick reference panel (inline figures/equations preview) */}
      {(figures.length > 0 || equations.length > 0) && (
        <div
          className="w-48 border-l overflow-y-auto p-2 shrink-0 space-y-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          {figures.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1 px-1">Figures</p>
              {figures.map((fig) => (
                <div key={fig.id} className="text-[10px] px-2 py-1 rounded cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: 'var(--background)' }}>
                  <p className="font-medium opacity-60">Fig. {fig.number}</p>
                  <p className="opacity-40 leading-tight line-clamp-1">{fig.caption}</p>
                </div>
              ))}
            </div>
          )}
          {equations.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1 px-1">Equations</p>
              {equations.map((eq) => (
                <div key={eq.id} className="text-[10px] px-2 py-1 rounded cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: 'var(--background)' }}>
                  <p className="font-medium opacity-60">Eq. ({eq.number})</p>
                  <code className="opacity-40 leading-tight line-clamp-1 font-mono text-[9px]">{eq.latex}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
