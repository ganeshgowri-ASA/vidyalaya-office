'use client';
import React, { useState } from 'react';
import { useCADStore, ExportFormat } from '@/store/cad-store';
import { useGraphicsStore } from '@/store/graphics-store';

/**
 * Generate a minimal DXF string from shapes.
 * This produces a valid DXF R12 file with basic entities.
 */
function generateDXF(shapes: { type: string; x: number; y: number; width: number; height: number; label: string }[]): string {
  let dxf = '0\nSECTION\n2\nHEADER\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nTABLES\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nENTITIES\n';

  for (const s of shapes) {
    if (s.type === 'rect') {
      // DXF LINE entities for rectangle
      const pts = [
        [s.x, s.y], [s.x + s.width, s.y],
        [s.x + s.width, s.y + s.height], [s.x, s.y + s.height],
      ];
      for (let i = 0; i < 4; i++) {
        const a = pts[i], b = pts[(i + 1) % 4];
        dxf += `0\nLINE\n8\n0\n10\n${a[0]}\n20\n${a[1]}\n30\n0\n11\n${b[0]}\n21\n${b[1]}\n31\n0\n`;
      }
    } else if (s.type === 'ellipse') {
      dxf += `0\nCIRCLE\n8\n0\n10\n${s.x + s.width / 2}\n20\n${s.y + s.height / 2}\n30\n0\n40\n${Math.max(s.width, s.height) / 2}\n`;
    } else if (s.type === 'line' || s.type === 'arrow') {
      dxf += `0\nLINE\n8\n0\n10\n${s.x}\n20\n${s.y}\n30\n0\n11\n${s.x + s.width}\n21\n${s.y + s.height}\n31\n0\n`;
    } else if (s.type === 'text') {
      dxf += `0\nTEXT\n8\n0\n10\n${s.x}\n20\n${s.y}\n30\n0\n40\n12\n1\n${s.label || 'Text'}\n`;
    } else {
      // Generic: export as polyline rectangle bounding box
      const pts = [
        [s.x, s.y], [s.x + s.width, s.y],
        [s.x + s.width, s.y + s.height], [s.x, s.y + s.height],
      ];
      for (let i = 0; i < 4; i++) {
        const a = pts[i], b = pts[(i + 1) % 4];
        dxf += `0\nLINE\n8\n0\n10\n${a[0]}\n20\n${a[1]}\n30\n0\n11\n${b[0]}\n21\n${b[1]}\n31\n0\n`;
      }
    }
  }

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

export default function CADExportPanel() {
  const { exportSettings, setExportSettings, setShowExportPanel, layers } = useCADStore();
  const { shapes, canvasWidth, canvasHeight } = useGraphicsStore();
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const { format, scale, dpi, includeGrid, includeDimensions, layerIds, paperSize, orientation } = exportSettings;

  const toggleLayer = (id: string) => {
    setExportSettings({
      layerIds: layerIds.includes(id) ? layerIds.filter(l => l !== id) : [...layerIds, id],
    });
  };

  const doExport = () => {
    setExporting(true);

    try {
      if (format === 'svg') {
        const el = document.querySelector('svg.graphics-export') as SVGSVGElement | null;
        const svg = el || document.querySelector('.flex-1.relative.overflow-hidden svg') as SVGSVGElement | null;
        if (!svg) { alert('SVG canvas not found'); setExporting(false); return; }
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('width', String(canvasWidth * scale));
        clone.setAttribute('height', String(canvasHeight * scale));
        const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
        download(blob, 'diagram.svg');
        setLastExport('SVG exported successfully');
      }

      if (format === 'png') {
        const svg = document.querySelector('.flex-1.relative.overflow-hidden svg') as SVGSVGElement | null;
        if (!svg) { alert('SVG canvas not found'); setExporting(false); return; }
        const data = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const w = canvasWidth * scale;
        const h = canvasHeight * scale;
        canvas.width = w * (dpi / 96);
        canvas.height = h * (dpi / 96);
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpi / 96, dpi / 96);
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(blob => {
            if (blob) download(blob, 'diagram.png');
            setLastExport(`PNG exported (${canvas.width}x${canvas.height} @ ${dpi}dpi)`);
          });
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
      }

      if (format === 'dxf') {
        const dxf = generateDXF(shapes.map(s => ({
          type: s.type, x: s.x * scale, y: s.y * scale,
          width: s.width * scale, height: s.height * scale,
          label: s.label,
        })));
        const blob = new Blob([dxf], { type: 'application/dxf' });
        download(blob, 'diagram.dxf');
        setLastExport('DXF exported successfully');
      }

      if (format === 'pdf') {
        // Generate a minimal SVG-in-HTML for PDF printing
        const svg = document.querySelector('.flex-1.relative.overflow-hidden svg') as SVGSVGElement | null;
        if (!svg) { alert('SVG canvas not found'); setExporting(false); return; }
        const data = new XMLSerializer().serializeToString(svg);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`<!DOCTYPE html><html><head><title>Diagram Export</title><style>
            @page { size: ${paperSize === 'Custom' ? `${canvasWidth * scale}px ${canvasHeight * scale}px` : paperSize} ${orientation}; margin: 10mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
            svg { max-width: 100%; max-height: 100vh; }
          </style></head><body>${data}</body></html>`);
          printWindow.document.close();
          setTimeout(() => { printWindow.print(); }, 500);
          setLastExport('PDF print dialog opened');
        }
      }
    } finally {
      setExporting(false);
    }
  };

  const download = (blob: Blob, filename: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const formats: { id: ExportFormat; label: string; icon: string; desc: string }[] = [
    { id: 'svg', label: 'SVG', icon: '📐', desc: 'Vector scalable' },
    { id: 'png', label: 'PNG', icon: '🖼', desc: 'Raster image' },
    { id: 'dxf', label: 'DXF', icon: '📦', desc: 'CAD exchange' },
    { id: 'pdf', label: 'PDF', icon: '📄', desc: 'Print-ready' },
  ];

  const paperSizes = ['A4', 'A3', 'Letter', 'Custom'] as const;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-96 max-h-[80vh] rounded-xl bg-[#1e293b] border border-[#334155] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
          <h3 className="text-sm font-semibold text-[#e2e8f0]">Export Diagram</h3>
          <button onClick={() => setShowExportPanel(false)} className="text-[#94a3b8] hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Format selection */}
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-2">Format</p>
            <div className="grid grid-cols-4 gap-2">
              {formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setExportSettings({ format: f.id })}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border transition-colors ${
                    format === f.id ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-[#0f172a] border-[#334155] text-[#94a3b8] hover:bg-[#334155]'
                  }`}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-[10px] font-semibold">{f.label}</span>
                  <span className="text-[8px]">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-1">Scale: {scale}x</p>
            <input type="range" min={0.5} max={4} step={0.5} value={scale} onChange={e => setExportSettings({ scale: +e.target.value })} className="w-full" />
            <div className="flex justify-between text-[8px] text-[#64748b]"><span>0.5x</span><span>1x</span><span>2x</span><span>4x</span></div>
          </div>

          {/* DPI (for PNG) */}
          {format === 'png' && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-1">DPI: {dpi}</p>
              <div className="flex gap-1">
                {[72, 150, 300, 600].map(d => (
                  <button
                    key={d}
                    onClick={() => setExportSettings({ dpi: d })}
                    className={`flex-1 py-1 rounded text-[10px] ${dpi === d ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'}`}
                  >{d}</button>
                ))}
              </div>
            </div>
          )}

          {/* Paper size (for PDF) */}
          {format === 'pdf' && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase text-[#94a3b8]">Paper Size</p>
              <div className="flex gap-1">
                {paperSizes.map(s => (
                  <button key={s} onClick={() => setExportSettings({ paperSize: s })} className={`flex-1 py-1 rounded text-[10px] ${paperSize === s ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'}`}>{s}</button>
                ))}
              </div>
              <div className="flex gap-1">
                {(['landscape', 'portrait'] as const).map(o => (
                  <button key={o} onClick={() => setExportSettings({ orientation: o })} className={`flex-1 py-1 rounded text-[10px] capitalize ${orientation === o ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'}`}>{o}</button>
                ))}
              </div>
            </div>
          )}

          {/* Layers to export */}
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#94a3b8] mb-1">Layers</p>
            <div className="space-y-1">
              {layers.map(layer => (
                <label key={layer.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#0f172a] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layerIds.includes(layer.id)}
                    onChange={() => toggleLayer(layer.id)}
                    className="rounded"
                  />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: layer.color }} />
                  <span className="text-[10px] text-[#e2e8f0]">{layer.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeGrid} onChange={e => setExportSettings({ includeGrid: e.target.checked })} className="rounded" />
              <span className="text-[10px] text-[#e2e8f0]">Include grid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeDimensions} onChange={e => setExportSettings({ includeDimensions: e.target.checked })} className="rounded" />
              <span className="text-[10px] text-[#e2e8f0]">Include dimensions</span>
            </label>
          </div>

          {/* Output info */}
          <div className="rounded bg-[#0f172a] p-2 text-[10px] text-[#94a3b8] space-y-0.5">
            <p>Canvas: {canvasWidth} × {canvasHeight} px</p>
            <p>Output: {Math.round(canvasWidth * scale)} × {Math.round(canvasHeight * scale)} px</p>
            <p>Shapes: {shapes.length}</p>
            {lastExport && <p className="text-green-400">{lastExport}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t border-[#334155]">
          <button onClick={() => setShowExportPanel(false)} className="flex-1 py-2 rounded bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8] text-xs">Cancel</button>
          <button onClick={doExport} disabled={exporting} className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50">
            {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
