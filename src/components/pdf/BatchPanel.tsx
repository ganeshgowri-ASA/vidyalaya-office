'use client';

import React, { useState, useRef } from 'react';

interface BatchFile {
  id: string;
  name: string;
  size: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
}

type BatchOperation = 'compress' | 'convert' | 'watermark' | 'merge' | 'protect' | 'ocr';

const OPERATIONS: { id: BatchOperation; label: string; icon: string; desc: string }[] = [
  { id: 'compress', label: 'Compress', icon: '🗜', desc: 'Reduce file sizes' },
  { id: 'convert', label: 'Convert', icon: '🔄', desc: 'Convert to another format' },
  { id: 'watermark', label: 'Watermark', icon: '💧', desc: 'Add watermark to all' },
  { id: 'merge', label: 'Merge', icon: '📎', desc: 'Merge all into one PDF' },
  { id: 'protect', label: 'Protect', icon: '🔐', desc: 'Password protect all' },
  { id: 'ocr', label: 'OCR', icon: '🔍', desc: 'Extract text from all' },
];

let batchFileCounter = 0;

export default function BatchPanel() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [operation, setOperation] = useState<BatchOperation>('compress');
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [convertFormat, setConvertFormat] = useState('docx');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMockFiles = () => {
    const mockNames = [
      'Q4_Report.pdf', 'Invoice_2024.pdf', 'Contract_Draft.pdf',
      'Meeting_Notes.pdf', 'Product_Spec.pdf', 'Annual_Budget.pdf',
    ];
    const newFiles: BatchFile[] = mockNames.slice(0, 4).map(name => ({
      id: `bf_${++batchFileCounter}`,
      name,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setDone(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startProcessing = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setDone(false);
    setOverallProgress(0);

    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing', progress: 0 } : f));

      // Simulate processing with progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 80));
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: p } : f));
      }

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', progress: 100 } : f));
      setOverallProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setIsProcessing(false);
    setDone(true);
  };

  const clearAll = () => {
    setFiles([]);
    setOverallProgress(0);
    setDone(false);
  };

  const selectedOp = OPERATIONS.find(o => o.id === operation);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="p-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Batch Operations</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Process multiple PDFs at once</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Operation Selection */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Select Operation</p>
          <div className="grid grid-cols-3 gap-1.5">
            {OPERATIONS.map(op => (
              <button
                key={op.id}
                onClick={() => setOperation(op.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded text-center transition-colors ${operation === op.id ? 'bg-blue-600 text-white' : 'bg-[var(--card)] hover:bg-[var(--border)] text-[var(--foreground)]'}`}
              >
                <span className="text-base">{op.icon}</span>
                <span className="text-[9px] font-medium">{op.label}</span>
              </button>
            ))}
          </div>
          {selectedOp && (
            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{selectedOp.desc}</p>
          )}
        </div>

        {/* Operation Settings */}
        {operation === 'compress' && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Compression Quality</p>
            {[{ id: 'high', label: 'High Quality', desc: 'Minimal compression (~20% reduction)' },
              { id: 'medium', label: 'Balanced', desc: 'Good balance (~50% reduction)' },
              { id: 'low', label: 'Maximum', desc: 'Maximum compression (~70% reduction)' }].map(q => (
              <label key={q.id} className="flex items-start gap-2 p-2 rounded bg-[var(--card)] cursor-pointer hover:opacity-80">
                <input type="radio" name="quality" defaultChecked={q.id === 'medium'} className="mt-0.5" />
                <div>
                  <p className="text-xs font-medium">{q.label}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{q.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        {operation === 'convert' && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Output Format</p>
            <select value={convertFormat} onChange={e => setConvertFormat(e.target.value)} className="w-full px-2 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs">
              <option value="docx">Word (.docx)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="jpg">Image (.jpg)</option>
              <option value="png">Image (.png)</option>
              <option value="txt">Text (.txt)</option>
            </select>
          </div>
        )}
        {operation === 'watermark' && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Watermark Text</p>
            <input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="w-full px-2 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs" placeholder="Watermark text" />
          </div>
        )}
        {operation === 'protect' && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Password</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-2 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs" placeholder="Enter password" />
          </div>
        )}

        {/* File List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Files ({files.length})</p>
            <div className="flex gap-1">
              <button onClick={addMockFiles} className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] hover:bg-blue-600/30">+ Add Files</button>
              {files.length > 0 && <button onClick={clearAll} className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] hover:bg-red-600/30">Clear</button>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" />

          {files.length === 0 ? (
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center">
              <p className="text-2xl mb-2">📄</p>
              <p className="text-xs text-[var(--muted-foreground)]">Click &ldquo;+ Add Files&rdquo; to add PDFs</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-2 p-2 rounded bg-[var(--card)] border border-[var(--border)]">
                  <span className="text-base">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--muted-foreground)]">{file.size}</span>
                      {file.status === 'processing' && (
                        <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${file.progress}%` }} />
                        </div>
                      )}
                      {file.status === 'done' && <span className="text-[10px] text-green-400">✓ Done</span>}
                      {file.status === 'error' && <span className="text-[10px] text-red-400">✗ Error</span>}
                    </div>
                  </div>
                  {file.status === 'pending' && (
                    <button onClick={() => removeFile(file.id)} className="text-[var(--muted-foreground)] hover:text-red-400 text-xs">✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Progress */}
        {isProcessing && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]">
              <span>Processing...</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        )}

        {done && (
          <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/30 text-center">
            <p className="text-green-400 text-sm font-medium">✓ All files processed successfully!</p>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Click Download to save results</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={startProcessing}
            disabled={files.length === 0 || isProcessing}
            className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium"
          >
            {isProcessing ? '⏳ Processing...' : `▶ Process ${files.length} Files`}
          </button>
          {done && (
            <button className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium">
              ⬇ Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
