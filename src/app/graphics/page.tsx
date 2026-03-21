'use client';

import { useState } from 'react';
import GraphicsEditor from '@/components/graphics/graphics-editor';
import DrawingCanvas from '@/components/graphics/drawing-canvas';
import DiagramFromText from '@/components/graphics/diagram-from-text';
import { Workflow, Paintbrush, Code } from 'lucide-react';

type Mode = 'diagram' | 'drawing' | 'code';

export default function GraphicsPage() {
  const [mode, setMode] = useState<Mode>('diagram');

  const tabBtn = (m: Mode, active: boolean) =>
    `flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors font-medium ${
      active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`;

  const descriptions: Record<Mode, string> = {
    diagram: 'Flowchart & diagram editor — shapes, connectors, export',
    drawing: 'Freehand drawing — pencil, brush, pen, text effects, layers',
    code: 'Code to diagram — Mermaid, PlantUML, CSV, AI prompt',
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background, #0f172a)' }}>
      {/* Mode switcher tab bar */}
      <div
        className="flex items-center gap-1 px-4 py-1 flex-none"
        style={{ background: 'var(--sidebar, #1e293b)', borderBottom: '1px solid var(--border, #334155)' }}
      >
        <button onClick={() => setMode('diagram')} className={tabBtn('diagram', mode === 'diagram')}>
          <Workflow size={15} />Diagram Editor
        </button>
        <button onClick={() => setMode('drawing')} className={tabBtn('drawing', mode === 'drawing')}>
          <Paintbrush size={15} />Drawing Tools
        </button>
        <button onClick={() => setMode('code')} className={tabBtn('code', mode === 'code')}>
          <Code size={15} />Code to Diagram
        </button>
        <span className="ml-3 text-gray-600 text-xs">{descriptions[mode]}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'diagram' ? <GraphicsEditor /> : mode === 'drawing' ? <DrawingCanvas /> : <DiagramFromText />}
      </div>
    </div>
  );
}
