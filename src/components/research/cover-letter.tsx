'use client';
import { useResearchStore } from '@/store/research-store';
import {
  FileText, Sparkles, Copy, Download,
} from 'lucide-react';

export default function CoverLetter() {
  const { coverLetter, updateCoverLetter, generateCoverLetter } = useResearchStore();

  const handleCopy = () => {
    if (coverLetter.generatedText) {
      navigator.clipboard.writeText(coverLetter.generatedText);
    }
  };

  return (
    <div
      className="h-full overflow-y-auto p-3 space-y-3"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText size={16} style={{ color: 'var(--primary)' }} />
        <h3 className="text-sm font-semibold">Cover Letter</h3>
      </div>

      {/* Input fields */}
      <div className="space-y-2">
        <div>
          <label className="text-[10px] opacity-50 mb-0.5 block">Journal Name</label>
          <input
            value={coverLetter.journalName}
            onChange={(e) => updateCoverLetter({ journalName: e.target.value })}
            placeholder="e.g. Applied Energy"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <div>
          <label className="text-[10px] opacity-50 mb-0.5 block">Editor Name</label>
          <input
            value={coverLetter.editorName}
            onChange={(e) => updateCoverLetter({ editorName: e.target.value })}
            placeholder="e.g. Prof. Jane Doe"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <div>
          <label className="text-[10px] opacity-50 mb-0.5 block">Article Title (auto-filled if blank)</label>
          <input
            value={coverLetter.articleTitle}
            onChange={(e) => updateCoverLetter({ articleTitle: e.target.value })}
            placeholder="Auto-filled from article title"
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <div>
          <label className="text-[10px] opacity-50 mb-0.5 block">Key Findings Summary</label>
          <textarea
            value={coverLetter.keyFindings}
            onChange={(e) => updateCoverLetter({ keyFindings: e.target.value })}
            placeholder="Brief summary of key findings and contribution..."
            rows={3}
            className="w-full text-xs px-2 py-1.5 rounded border bg-transparent outline-none resize-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generateCoverLetter}
        className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg font-medium"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        <Sparkles size={13} /> Generate Cover Letter
      </button>

      {/* Generated output */}
      {coverLetter.generatedText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] opacity-50">Generated Letter</p>
            <div className="flex gap-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border opacity-60 hover:opacity-100"
                style={{ borderColor: 'var(--border)' }}
              >
                <Copy size={9} /> Copy
              </button>
              <button
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border opacity-60 hover:opacity-100"
                style={{ borderColor: 'var(--border)' }}
              >
                <Download size={9} /> Export
              </button>
            </div>
          </div>
          <textarea
            value={coverLetter.generatedText}
            onChange={(e) => updateCoverLetter({ generatedText: e.target.value })}
            rows={14}
            className="w-full text-xs px-3 py-2 rounded-lg border bg-transparent outline-none resize-none leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      )}
    </div>
  );
}
