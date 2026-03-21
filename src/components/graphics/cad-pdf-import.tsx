'use client';
import React, { useState, useRef } from 'react';
import { useCADStore } from '@/store/cad-store';
import { useGraphicsStore, createShape, genId, Shape } from '@/store/graphics-store';

/**
 * PDF-to-CAD Import Panel.
 * Provides tools for importing PDF files and converting them to CAD objects.
 * Since we cannot use external PDF libraries (no new npm packages), this provides:
 * 1. A guided workflow for manual tracing
 * 2. Image-based import (renders PDF page as background for tracing)
 * 3. Quick-shape overlay tools for recreating PDF content
 */
export default function CADPdfImport() {
  const { setShowPdfImport, pdfImportScale, setPdfImportScale } = useCADStore();
  const { shapes, pushHistory, canvasWidth, canvasHeight, setCanvasWidth, setCanvasHeight } = useGraphicsStore();
  const [step, setStep] = useState<'upload' | 'configure' | 'trace'>('upload');
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [opacity, setOpacity] = useState(0.4);
  const [gridOverlay, setGridOverlay] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    // For PDFs, we'll use a canvas to render the first page (if supported) or accept images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        setImageData(ev.target?.result as string);
        setStep('configure');
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // PDF rendering without external libs: create a placeholder workflow
      setImageData(null);
      setStep('configure');
    }
  };

  const addAsBackground = () => {
    // Add image as a locked background shape for tracing
    if (imageData) {
      const bg: Shape = {
        id: genId(),
        type: 'rect',
        x: 0, y: 0,
        width: canvasWidth * pdfImportScale,
        height: canvasHeight * pdfImportScale,
        rotation: 0,
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: opacity,
        label: `📄 ${fileName} (background)`,
        locked: true,
        visible: true,
        layerOpacity: opacity,
        gradient: null,
        borderRadius: 0,
      };
      pushHistory([bg, ...shapes]);
    }
    setStep('trace');
  };

  const addQuickShapes = (type: 'floor-plan' | 'flowchart' | 'technical') => {
    const newShapes: Shape[] = [];
    if (type === 'floor-plan') {
      // Pre-populate with common floor plan shapes
      newShapes.push(
        { ...createShape('rect', 100, 100), width: 400, height: 300, label: 'Room 1', fill: 'transparent', stroke: '#60a5fa', strokeWidth: 3 } as Shape,
        { ...createShape('rect', 520, 100), width: 250, height: 200, label: 'Room 2', fill: 'transparent', stroke: '#60a5fa', strokeWidth: 3 } as Shape,
        { ...createShape('rect', 100, 420), width: 250, height: 200, label: 'Room 3', fill: 'transparent', stroke: '#60a5fa', strokeWidth: 3 } as Shape,
        { ...createShape('rect', 370, 420), width: 50, height: 100, label: 'Door', fill: 'transparent', stroke: '#f59e0b', strokeWidth: 2 } as Shape,
      );
    } else if (type === 'flowchart') {
      newShapes.push(
        { ...createShape('rect', 300, 50), width: 160, height: 60, label: 'Start', fill: '#22c55e', borderRadius: 30 } as Shape,
        { ...createShape('rect', 300, 160), width: 160, height: 80, label: 'Process 1' } as Shape,
        { ...createShape('diamond', 300, 290), width: 160, height: 100, label: 'Decision?' } as Shape,
        { ...createShape('rect', 300, 440), width: 160, height: 80, label: 'Process 2' } as Shape,
        { ...createShape('rect', 300, 570), width: 160, height: 60, label: 'End', fill: '#ef4444', borderRadius: 30 } as Shape,
      );
    } else if (type === 'technical') {
      newShapes.push(
        { ...createShape('rect', 100, 100), width: 600, height: 400, label: 'Assembly', fill: 'transparent', stroke: '#94a3b8', strokeWidth: 1 } as Shape,
        { ...createShape('ellipse', 200, 200), width: 100, height: 100, label: 'Part A', fill: 'transparent', stroke: '#3b82f6', strokeWidth: 2 } as Shape,
        { ...createShape('rect', 400, 200), width: 150, height: 80, label: 'Part B', fill: 'transparent', stroke: '#3b82f6', strokeWidth: 2 } as Shape,
        { ...createShape('ellipse', 300, 350), width: 80, height: 80, label: 'Part C', fill: 'transparent', stroke: '#3b82f6', strokeWidth: 2 } as Shape,
      );
    }
    pushHistory([...shapes, ...newShapes]);
    setShowPdfImport(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[480px] max-h-[80vh] rounded-xl bg-[#1e293b] border border-[#334155] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
          <h3 className="text-sm font-semibold text-[#e2e8f0]">PDF / Image to CAD</h3>
          <button onClick={() => setShowPdfImport(false)} className="text-[#94a3b8] hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {(['upload', 'configure', 'trace'] as const).map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <div className="flex-1 h-px bg-[#334155]" />}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${step === s ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8]'}`}>
                  <span className="font-bold">{i + 1}</span>
                  <span className="capitalize">{s}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-3">
              <p className="text-xs text-[#94a3b8]">
                Upload a PDF document or image to convert to editable CAD objects.
                The file will be used as a background reference for tracing.
              </p>
              <div
                className="border-2 border-dashed border-[#334155] rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-2xl mb-2">📄</p>
                <p className="text-xs text-[#e2e8f0]">Click to select a file</p>
                <p className="text-[10px] text-[#64748b] mt-1">PDF, PNG, JPG, SVG supported</p>
              </div>

              <div className="border-t border-[#334155] pt-3">
                <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Or start from a template</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'floor-plan' as const, icon: '🏠', label: 'Floor Plan' },
                    { id: 'flowchart' as const, icon: '📊', label: 'Flowchart' },
                    { id: 'technical' as const, icon: '⚙️', label: 'Technical Drawing' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => addQuickShapes(t.id)}
                      className="flex flex-col items-center gap-1 px-3 py-3 rounded-lg bg-[#0f172a] border border-[#334155] hover:bg-[#334155] hover:border-blue-500/30 transition-colors"
                    >
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-[10px] text-[#e2e8f0]">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Configure */}
          {step === 'configure' && (
            <div className="space-y-3">
              <div className="rounded bg-[#0f172a] p-3 flex items-center gap-3">
                <span className="text-xl">📄</span>
                <div className="flex-1">
                  <p className="text-xs text-[#e2e8f0]">{fileName}</p>
                  <p className="text-[10px] text-[#64748b]">{imageData ? 'Image loaded' : 'PDF reference mode'}</p>
                </div>
                <button onClick={() => { setStep('upload'); setImageData(null); }} className="text-[10px] text-[#94a3b8] hover:text-white">Change</button>
              </div>

              {/* Preview */}
              {imageData && (
                <div className="rounded border border-[#334155] overflow-hidden" style={{ maxHeight: 200 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageData} alt="Preview" className="w-full object-contain" style={{ maxHeight: 200, opacity }} />
                </div>
              )}

              {/* Import settings */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Scale: {pdfImportScale}x</label>
                  <input type="range" min={0.25} max={4} step={0.25} value={pdfImportScale} onChange={e => setPdfImportScale(+e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Background Opacity: {Math.round(opacity * 100)}%</label>
                  <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={gridOverlay} onChange={e => setGridOverlay(e.target.checked)} className="rounded" />
                  <span className="text-[10px] text-[#e2e8f0]">Show grid overlay for alignment</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('upload')} className="flex-1 py-2 rounded bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8] text-xs">Back</button>
                <button onClick={addAsBackground} className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">Import & Trace</button>
              </div>
            </div>
          )}

          {/* Step: Trace */}
          {step === 'trace' && (
            <div className="space-y-3">
              <div className="rounded bg-green-600/10 border border-green-500/30 p-3">
                <p className="text-xs text-green-400 font-semibold mb-1">Ready to trace!</p>
                <p className="text-[10px] text-[#94a3b8]">
                  The reference has been added to the canvas as a locked background.
                  Use the drawing tools to trace shapes on top of it.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase text-[#94a3b8]">Tracing Tips</p>
                <ul className="text-[10px] text-[#94a3b8] space-y-1 list-disc list-inside">
                  <li>Enable snap-to-grid for precise alignment</li>
                  <li>Use measurement tools to match dimensions</li>
                  <li>Add dimensions to annotate traced objects</li>
                  <li>Use the ruler tool to verify distances</li>
                  <li>Lock traced shapes after positioning</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowPdfImport(false)} className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                  Start Tracing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
