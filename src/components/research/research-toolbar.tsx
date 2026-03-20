'use client';
import { useState } from 'react';
import { useResearchStore } from '@/store/research-store';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Link, Image, Table, FlaskConical,
  BookOpen, Download, Eye, EyeOff, Share2, LayoutTemplate,
  Sigma, FileImage, Sparkles, Save, Upload, Shield, SpellCheck,
  Columns, BookA,
} from 'lucide-react';

const tabs = ['Home', 'Insert', 'Format', 'Review', 'View'] as const;
type Tab = typeof tabs[number];

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function ToolbarButton({ icon: Icon, label, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded text-[10px] transition-colors min-w-[44px]',
        active ? 'opacity-100' : 'opacity-70 hover:opacity-100'
      )}
      style={active ? { backgroundColor: 'var(--sidebar-accent)', color: 'var(--primary-foreground)' } : undefined}
    >
      <Icon size={16} />
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="w-px h-10 mx-1 self-center opacity-20" style={{ backgroundColor: 'var(--border)' }} />;
}

export default function ResearchToolbar() {
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const {
    setShowTemplateGallery, setShowCitationManager, setShowEquationEditor,
    setShowFigureManager, setShowExportPanel, setShowAIPanel, showAIPanel,
    previewMode, setPreviewMode, setActiveRightPanel,
    doubleColumnEnabled, setDoubleColumnEnabled,
  } = useResearchStore();

  const handleInsertCitation = () => {
    setActiveRightPanel('citations');
    setShowCitationManager(true);
  };

  return (
    <div
      className="border-b flex flex-col shrink-0"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-3 pt-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-t transition-colors',
              activeTab === tab ? 'opacity-100' : 'opacity-50 hover:opacity-80'
            )}
            style={activeTab === tab ? {
              borderBottom: '2px solid var(--primary)',
              color: 'var(--foreground)',
            } : { color: 'var(--foreground)' }}
          >
            {tab}
          </button>
        ))}

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => { setActiveRightPanel('export'); setShowExportPanel(true); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs opacity-70 hover:opacity-100"
          >
            <Download size={14} /> Export
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-xs opacity-70 hover:opacity-100"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded text-xs"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Toolbar buttons */}
      <div className="flex items-center px-2 py-0.5 overflow-x-auto" style={{ color: 'var(--foreground)' }}>
        {activeTab === 'Home' && (
          <>
            <ToolbarButton icon={Bold} label="Bold" />
            <ToolbarButton icon={Italic} label="Italic" />
            <ToolbarButton icon={Underline} label="Underline" />
            <Divider />
            <ToolbarButton icon={AlignLeft} label="Left" active />
            <ToolbarButton icon={AlignCenter} label="Center" />
            <ToolbarButton icon={AlignRight} label="Right" />
            <Divider />
            <ToolbarButton icon={List} label="Bullets" />
            <ToolbarButton icon={ListOrdered} label="Numbered" />
            <ToolbarButton icon={Quote} label="Quote" />
            <Divider />
            <ToolbarButton icon={Link} label="Link" />
          </>
        )}

        {activeTab === 'Insert' && (
          <>
            <ToolbarButton icon={BookOpen} label="Citation" onClick={handleInsertCitation} />
            <ToolbarButton icon={Sparkles} label="Smart Cite" onClick={() => setActiveRightPanel('smartcite')} />
            <ToolbarButton icon={Sigma} label="Equation" onClick={() => setShowEquationEditor(true)} />
            <ToolbarButton icon={FileImage} label="Figure" onClick={() => setShowFigureManager(true)} />
            <ToolbarButton icon={Table} label="Table" onClick={() => setShowFigureManager(true)} />
            <ToolbarButton icon={Image} label="Image" />
            <Divider />
            <ToolbarButton icon={Upload} label="Import" onClick={() => setActiveRightPanel('import')} />
            <ToolbarButton icon={FlaskConical} label="Footnote" />
          </>
        )}

        {activeTab === 'Format' && (
          <>
            <ToolbarButton icon={LayoutTemplate} label="Templates" onClick={() => setShowTemplateGallery(true)} />
            <ToolbarButton icon={Columns} label={doubleColumnEnabled ? '2-Column' : '1-Column'} onClick={() => setDoubleColumnEnabled(!doubleColumnEnabled)} active={doubleColumnEnabled} />
            <ToolbarButton icon={BookA} label="Abbreviations" onClick={() => setActiveRightPanel('latex')} />
            <Divider />
            <div className="flex items-center gap-1 px-2">
              <label className="text-xs opacity-60">Heading:</label>
              <select
                className="text-xs px-2 py-1 rounded border"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                <option>Paragraph</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </select>
            </div>
            <div className="flex items-center gap-1 px-2">
              <label className="text-xs opacity-60">Font size:</label>
              <select
                className="text-xs px-2 py-1 rounded border"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                <option>10</option>
                <option>11</option>
                <option defaultValue="12">12</option>
                <option>14</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'Review' && (
          <>
            <ToolbarButton icon={Shield} label="Plagiarism" onClick={() => setActiveRightPanel('plagiarism')} />
            <ToolbarButton icon={SpellCheck} label="Spelling" onClick={() => setActiveRightPanel('spelling')} />
            <Divider />
            <ToolbarButton icon={Sparkles} label="AI Review" onClick={() => { setShowAIPanel(!showAIPanel); }} active={showAIPanel} />
            <Divider />
            <div className="flex items-center gap-2 px-2 text-xs opacity-60">
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--background)' }}>
                Readability: <span className="text-green-400 font-medium">Good</span>
              </span>
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--background)' }}>
                Passive voice: <span className="text-yellow-400 font-medium">12%</span>
              </span>
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--background)' }}>
                Academic tone: <span className="text-green-400 font-medium">92%</span>
              </span>
            </div>
          </>
        )}

        {activeTab === 'View' && (
          <>
            <ToolbarButton icon={previewMode ? EyeOff : Eye} label={previewMode ? 'Edit Mode' : 'Preview'} onClick={() => setPreviewMode(!previewMode)} active={previewMode} />
            <Divider />
            <ToolbarButton icon={Columns} label={doubleColumnEnabled ? '2-Column' : '1-Column'} onClick={() => setDoubleColumnEnabled(!doubleColumnEnabled)} active={doubleColumnEnabled} />
            <Divider />
            <div className="flex items-center gap-1 px-2">
              <label className="text-xs opacity-60">Zoom:</label>
              <select
                className="text-xs px-2 py-1 rounded border"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                <option>75%</option>
                <option>100%</option>
                <option>125%</option>
                <option>150%</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
