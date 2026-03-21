'use client';

import { useState } from 'react';
import GraphicsEditor from '@/components/graphics/graphics-editor';
import DrawingCanvas from '@/components/graphics/drawing-canvas';
import { Workflow, Paintbrush } from 'lucide-react';

type Mode = 'diagram' | 'drawing';

export default function GraphicsPage() {
  const [mode, setMode] = useState<Mode>('diagram');

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background, #0f172a)' }}>
      {/* Mode switcher tab bar */}
      <div
        className="flex items-center gap-1 px-4 py-1 flex-none"
        style={{ background: 'var(--sidebar, #1e293b)', borderBottom: '1px solid var(--border, #334155)' }}
      >
        <button
          onClick={() => setMode('diagram')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors font-medium ${
            mode === 'diagram'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Workflow size={15} />
          Diagram Editor
        </button>
        <button
          onClick={() => setMode('drawing')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors font-medium ${
            mode === 'drawing'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Paintbrush size={15} />
          Drawing Tools
        </button>
        <span className="ml-3 text-gray-600 text-xs">
          {mode === 'diagram'
            ? 'Flowchart & diagram editor — shapes, connectors, export'
            : 'Freehand drawing — pencil, brush, pen, text effects, layers'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'diagram' ? <GraphicsEditor /> : <DrawingCanvas />}
      </div>
    </div>
  );
}
